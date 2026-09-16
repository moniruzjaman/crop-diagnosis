// Bridge between the on-device ViT classifier and the rest of the app.
// Centralizes:
//   - Disease name matching (ViT English ↔ cropDiseases.js name)
//   - Boost math for the offline rule engine
//   - Human-readable Bangla/English labels for the LLM prompt
//   - TTS text generation for accessibility
//
// All functions are pure (no side effects) and pure-data driven so
// they're easy to unit-test.

import { CROP_DISEASES, resolveCropKey } from "../data/cropDiseases.js";

// ─── Disease name normalization ──────────────────────────────────────────────
// ViT label suffix → stripped form. e.g. "Rice___Brown_Spot" → "Brown Spot".
// The cropDiseases.js records use names like "Brown Spot" / "Early Blight"
// without the crop prefix, so we strip it for matching.

function stripCropPrefix(diseaseEn, cropEn) {
  if (!diseaseEn || !cropEn) return diseaseEn || "";
  // Match e.g. "Rice___Leaf_Blast" → "Leaf Blast"
  // The regex handles "Rice___", "Rice__", "Rice " prefixes.
  const re = new RegExp(`^${cropEn}[\\s_]+(?:___)?[\\s_]*`, "i");
  const stripped = diseaseEn.replace(re, "").trim();
  // ViT labels use underscores between words; normalize to spaces so
  // aliases like "Leaf Blast" can match the DB's "Rice Blast" form.
  return stripped.replace(/_/g, " ");
}

// Common ViT→DB name aliases. The HF model uses slightly different wording
// for some classes than the Bangladesh disease database. This map captures
// the known mismatches so the boost logic still works.
const DISEASE_ALIASES = {
  "Common Rust": "Brown Rust", // Corn common rust ≈ Brown rust family
  "Brown Spot": "Brown Spot", // exact match
  "Leaf Blast": "Rice Blast", // ViT says "Leaf Blast", DB says "Rice Blast"
  "Gray Leaf Spot": "Gray Leaf Spot",
  "Yellow Rust": "Yellow Rust",
  "Early Blight": "Early Blight",
  "Late Blight": "Late Blight",
  "Healthy": "Healthy",
};

function normalizeDiseaseName(diseaseEn) {
  if (!diseaseEn) return "";
  return DISEASE_ALIASES[diseaseEn] || diseaseEn;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Find the CROP_DISEASES record that best matches a ViT prediction.
 * Returns { cropKey, disease, matchType, score } or null.
 *
 * matchType is one of: 'exact', 'alias', 'fuzzy', null (no match).
 *
 * @param {object} vitEntry  One entry from classifyLeaf().topK
 * @returns {object|null}
 */
export function findCropDiseaseForVitPrediction(vitEntry) {
  if (!vitEntry || !vitEntry.cropEn || vitEntry.category === "invalid") return null;
  if (vitEntry.isHealthy) {
    // Still useful to know which crop is healthy.
    const cropKey = resolveCropKey(vitEntry.cropEn);
    if (!cropKey) return null;
    return { cropKey, disease: null, matchType: "healthy", score: 1 };
  }
  const cropKey = resolveCropKey(vitEntry.cropEn);
  if (!cropKey || !CROP_DISEASES[cropKey]) return null;
  const diseases = CROP_DISEASES[cropKey].diseases;
  const stripped = stripCropPrefix(vitEntry.diseaseEn, vitEntry.cropEn);
  const normalized = normalizeDiseaseName(stripped);

  // 1) exact or alias match
  const alias = diseases.find(
    (d) => d.name === stripped || d.name === normalized,
  );
  if (alias) {
    return { cropKey, disease: alias, matchType: "exact", score: 1.0 };
  }
  // 2) fuzzy: case-insensitive substring on either side
  const fuzzy = diseases.find((d) => {
    const dn = d.name.toLowerCase();
    return (
      dn.includes(stripped.toLowerCase()) ||
      stripped.toLowerCase().includes(dn)
    );
  });
  if (fuzzy) {
    return { cropKey, disease: fuzzy, matchType: "fuzzy", score: 0.85 };
  }
  return null;
}

/**
 * Compute a matchRatio boost for the disease that matches the ViT
 * prediction. The boost is multiplicative: capped at 0.95 so it never
 * fully overrules human-entered symptom text.
 *
 * Boost formula:
 *   boost = confidence * weightByMatchType * 0.5
 *   where weightByMatchType ∈ { exact: 1.0, fuzzy: 0.7, healthy: 0 }
 *   confidence ∈ [0, 1] from the ViT
 *
 * @param {object} vitEntry
 * @param {object} matchResult  Output of findCropDiseaseForVitPrediction
 * @returns {number}  Boost amount in [0, ~0.5]. 0 = no boost.
 */
export function computeVitBoost(vitEntry, matchResult) {
  if (!vitEntry || !matchResult || matchResult.matchType === "healthy")
    return 0;
  const w =
    matchResult.matchType === "exact"
      ? 1.0
      : matchResult.matchType === "fuzzy"
        ? 0.7
        : 0;
  if (w === 0) return 0;
  // Cap confidence contribution at 0.95 to avoid flooring the model at 1.0
  // for low-quality but high-confidence predictions.
  const conf = Math.min(0.95, Math.max(0, vitEntry.confidence || 0));
  return conf * w * 0.5;
}

/**
 * Apply ViT boost to a cropDiseaseMatches array in place, then re-sort
 * descending by matchRatio. Returns the same array (or a copy if you
 * want immutability — pass { clone: true }).
 *
 * @param {Array} matches  Result from matchDiseasesBySymptoms()
 * @param {object} vitEntry
 * @param {object} [opts]
 * @param {boolean} [opts.clone=false]  Return a new array instead of mutating
 * @returns {Array}  Same (or cloned) array, re-sorted
 */
export function applyVitBoostToMatches(matches, vitEntry, opts = {}) {
  if (!Array.isArray(matches) || matches.length === 0) return matches;
  const match = findCropDiseaseForVitPrediction(vitEntry);
  if (!match || !match.disease) return matches;
  const boost = computeVitBoost(vitEntry, match);
  if (boost <= 0) return matches;

  const result = opts.clone ? matches.map((m) => ({ ...m })) : matches;
  for (const m of result) {
    if (m.disease && m.disease.name === match.disease.name) {
      m.matchRatio = Math.min(0.95, (m.matchRatio || 0) + boost);
      m.vitBoost = boost;
      m.vitMatchType = match.matchType;
    }
  }
  // Re-sort by matchRatio desc, score desc
  result.sort((a, b) => {
    if (b.matchRatio !== a.matchRatio) return b.matchRatio - a.matchRatio;
    return (b.score || 0) - (a.score || 0);
  });
  return result;
}

// ─── LLM prompt block ────────────────────────────────────────────────────────

/**
 * Build the deterministic ground-truth block to prepend to the LLM prompt.
 * The LLM still owns narrative generation, but it now has a baseline it
 * can reference instead of guessing the leaf disease from the image alone.
 *
 * @param {object|null} vitEntry  Top-1 from classifyLeaf().topK
 * @param {object} matchResult    Output of findCropDiseaseForVitPrediction
 * @returns {string}  Markdown-ish block. Empty string if no useful prediction.
 */
export function buildVitPromptBlock(vitEntry, matchResult) {
  if (!vitEntry) return "";
  const lines = [];
  lines.push("🛰️ LOCAL VISION MODEL (on-device ViT, 13-class):");
  lines.push(
    `  Top-1: ${vitEntry.diseaseEn} (${vitEntry.cropEn}) — ${(vitEntry.confidence * 100).toFixed(0)}% confidence`,
  );
  if (matchResult?.disease) {
    const dbName = matchResult.disease.nameBn || matchResult.disease.name;
    lines.push(`  ↳ Database match (${matchResult.matchType}): ${dbName}`);
    if (matchResult.disease.cause) {
      lines.push(`  ↳ Pathogen type: ${matchResult.disease.cause}`);
    }
  } else if (vitEntry.isHealthy) {
    lines.push(`  ↳ Plant appears healthy (no disease predicted)`);
  } else {
    lines.push(
      `  ↳ No exact match in Bangladesh disease database; use top-1 as a hint only.`,
    );
  }
  lines.push(
    "  → Treat this as a visual baseline; corroborate with the symptoms the farmer described.",
  );
  return lines.join("\n");
}

// ─── TTS text ────────────────────────────────────────────────────────────────

/**
 * Build a friendly Bangla sentence announcing the top-1 prediction,
 * suitable for the Web Speech API (bn-BD).
 *
 * @param {object|null} vitEntry
 * @returns {string}  Bangla text. Empty string if nothing useful.
 */
export function buildVitAnnouncement(vitEntry) {
  if (!vitEntry || vitEntry.category === "invalid") return "";
  const cropBn = vitEntry.cropBn || vitEntry.cropEn || "";
  const diseaseBn = vitEntry.diseaseBn || vitEntry.diseaseEn || "";
  if (vitEntry.isHealthy) {
    return `${cropBn} পাতা সুস্থ মনে হচ্ছে।`;
  }
  const pct = Math.round((vitEntry.confidence || 0) * 100);
  // Avoid "ধান পাতায় পাতার ব্লাস্ট" — if the disease name already starts
  // with "পাতা", the "পাতায়" prefix is redundant.
  const needsLeafPrefix = !/^পাতা/.test(diseaseBn);
  const diseaseClause = needsLeafPrefix
    ? `${cropBn} পাতায় ${diseaseBn}`
    : `${cropBn} ${diseaseBn}`;
  return `ছবি থেকে ধারণা করা হচ্ছে, ${diseaseClause} হতে পারে। আত্মবিশ্বাস ${pct} শতাংশ।`;
}

/**
 * Build a short Bangla summary of the full top-K list, for the result card
 * header. Tries to fit in one TTS utterance (≈ 8 seconds at rate 0.82).
 */
export function buildVitTopKSummary(topK) {
  if (!Array.isArray(topK) || topK.length === 0) return "";
  const items = topK
    .filter((e) => e.category !== "invalid")
    .slice(0, 3)
    .map((e) => {
      const label =
        e.cropBn && e.diseaseBn
          ? `${e.cropBn} — ${e.diseaseBn}`
          : e.label;
      const pct = Math.round(e.confidence * 100);
      return `${label}, ${pct} শতাংশ`;
    });
  if (items.length === 0) return "";
  return "সম্ভাব্য রোগের তালিকা: " + items.join("; ");
}

export const _INTERNAL = {
  stripCropPrefix,
  normalizeDiseaseName,
};
