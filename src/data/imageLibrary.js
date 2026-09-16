// CABI Visual Reference Image Library
// Parses public/database.json (CABI Plantwise Diagnostic Field Guide — 71 pages, 278 images)
// and builds a searchable index of reference images mapped to symptom categories.
//
// This module is the cornerstone of the enhanced offline diagnosis: it lets the
// diagnostic engine attach relevant CABI reference images to each diagnosis,
// and lets users browse the visual library entirely offline.
//
// Categories recognized by CABI Plantwise:
//   WILT, LEAF SPOT, WITCHES' BROOM, CANKER, MOSAIC, YELLOWING OF LEAVES,
//   DISTORTION OF LEAVES, LITTLE LEAF, GALLS, DRYING/NECROSIS/BLIGHT

import { loadOfflineBundles } from "./offlineLoader.js";

// ─── Bengali → English symptom keyword map (for matching) ───────────────────
// Mirrors the categories used by CABI but in Bengali, since user symptom chips
// are in Bengali. Each entry maps to one or more CABI categories.
export const BENGALI_SYMPTOM_CATEGORY_MAP = {
  // Wilt
  "গাছ নেতিয়ে": ["Wilt", "Drying/necrosis/blight"],
  "গাছ মরছে": ["Wilt", "Drying/necrosis/blight"],
  "গাছ শুকিয়ে": ["Wilt", "Drying/necrosis/blight"],
  "শিকড় পচা": ["Wilt"],
  "পাতা ঝরে": ["Wilt", "Yellowing of leaves"],
  // Leaf spot
  "পাতায় বাদামি গোলাকার দাগ": ["Leaf spot"],
  "পাতায় ধূসর মাকু আকৃতির দাগ": ["Leaf spot"],
  "পাতায় তেলতেলে": ["Leaf spot"],
  "পাতায় দাগ": ["Leaf spot"],
  "ফলে দাগ": ["Leaf spot"],
  "আলুর গায়ে খসখসে দাগ": ["Leaf spot"],
  // Mosaic
  "পাতায় মোজেইক": ["Mosaic"],
  মোজেইক: ["Mosaic"],
  // Yellowing
  "পাতা হলুদ হয়ে যাচ্ছে": ["Yellowing of leaves"],
  "পাতা হলুদ": ["Yellowing of leaves"],
  "হলুদ হয়ে যাচ্ছে": ["Yellowing of leaves"],
  // Distortion
  "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে": ["Distortion of leaves"],
  "পাতা কুঁকড়িয়ে": ["Distortion of leaves"],
  "পাতা বাঁকিয়ে": ["Distortion of leaves"],
  "পাতা কুঁচকে": ["Distortion of leaves"],
  // Little leaf / Witches' broom
  "গাছ বামন": ["Little leaf", "Witches' broom"],
  "পাতা ছোট হয়ে": ["Little leaf"],
  // Galls
  "শিকড় ফুলে": ["Galls"],
  "গাঁট ফুলে": ["Galls"],
  // Canker
  "কান্ডে কালো দাগ": ["Canker", "Drying/necrosis/blight"],
  "কান্ডের গোড়া পচে কালো বা বাদামি": ["Canker", "Drying/necrosis/blight"],
  "কাণ্ড পচে": ["Canker", "Drying/necrosis/blight"],
  // Drying / necrosis / blight
  "পাতা শুকিয়ে": ["Drying/necrosis/blight"],
  "পাতা পোড়া": ["Drying/necrosis/blight"],
  "আগায় শুকিয়ে যাওয়া": ["Drying/necrosis/blight"],
  "শীষ শুকিয়ে যাওয়া": ["Drying/necrosis/blight"],
  "শীষ চিটা": ["Drying/necrosis/blight"],
  "ফল পচে": ["Drying/necrosis/blight"],
};

// ─── Cause → CABI category mapping ──────────────────────────────────────────
// Used when the diagnostic engine has determined a likely cause (fungal/bacterial/viral)
// to filter reference images by both symptom AND causal agent.
export const CAUSE_TO_CATEGORY_HINT = {
  fungal: ["Leaf spot", "Drying/necrosis/blight", "Wilt", "Canker"],
  bacterial: ["Wilt", "Drying/necrosis/blight", "Leaf spot"],
  viral: ["Mosaic", "Distortion of leaves", "Yellowing of leaves"],
  insect: ["Distortion of leaves", "Drying/necrosis/blight", "Galls"],
  oomycete: ["Drying/necrosis/blight", "Wilt", "Leaf spot"],
  nematode: ["Galls", "Wilt", "Yellowing of leaves"],
  phytoplasma: ["Little leaf", "Witches' broom", "Yellowing of leaves"],
  nutrient: ["Yellowing of leaves", "Drying/necrosis/blight"],
  abiotic: ["Yellowing of leaves", "Drying/necrosis/blight", "Wilt"],
};

// ─── In-memory cache of loaded database ─────────────────────────────────────
let _dbCache = null;
let _imageIndexCache = null;

/**
 * Loads the CABI Plantwise database from /database.json.
 * Uses fetch so it works in the browser (Vite serves /public at root).
 * Cached after first call.
 *
 * @param {boolean} forceRefresh — bypass cache
 * @returns {Promise<Object>} parsed database
 */
export async function loadCabiDatabase(forceRefresh = false) {
  if (_dbCache && !forceRefresh) return _dbCache;
  try {
    const res = await fetch("/database.json", { cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _dbCache = await res.json();
    return _dbCache;
  } catch (e) {
    console.warn("[imageLibrary] Could not load /database.json:", e.message);
    _dbCache = { metadata: { source: "CABI Plantwise Diagnostic Field Guide" }, diagnostic_keys: [] };
    return _dbCache;
  }
}

/**
 * Builds a searchable index of all CABI reference images.
 * Each indexed entry has:
 *   - page: source page number
 *   - image: filename (e.g. img_page15_0.jpeg)
 *   - url: full URL (e.g. /images/img_page15_0.jpeg)
 *   - category: CABI symptom category (e.g. "Leaf spot") or null
 *   - textPreview: 1-line context from the book
 *   - keywords: lowercased keywords from textPreview for matching
 *
 * @returns {Promise<Array>} flat array of image entries
 */
export async function buildImageIndex(forceRefresh = false) {
  if (_imageIndexCache && !forceRefresh) return _imageIndexCache;
  const db = await loadCabiDatabase(forceRefresh);
  const entries = [];
  for (const page of db.diagnostic_keys || []) {
    const category = page.symptom_category || null;
    const textPreview = (page.text_preview || "").replace(/\s+/g, " ").trim();
    const keywords = textPreview.toLowerCase();
    for (const img of page.images || []) {
      entries.push({
        page: page.page,
        image: img,
        url: `/images/${img}`,
        category,
        textPreview,
        keywords,
      });
    }
  }

  // Attempt to load optional offline bundles and merge
  try {
    const offline = await loadOfflineBundles(forceRefresh);
    if (offline && offline.length > 0) {
      const map = new Map();
      for (const e of entries) map.set(e.url || e.image, e);
      for (const oe of offline) {
        if (!map.has(oe.url)) map.set(oe.url, oe);
      }
      const merged = Array.from(map.values());
      _imageIndexCache = merged;
      return merged;
    }
  } catch (err) {
    console.warn("[imageLibrary] failed to merge offline bundles", err.message);
  }

  _imageIndexCache = entries;
  return entries;
}

/**
 * Synchronous variant — uses cached index if available, otherwise returns [].
 * Useful for components that already called buildImageIndex on mount.
 */
export function getCachedImageIndex() {
  return _imageIndexCache || [];
}

// ─── Category normalization helpers ─────────────────────────────────────────
const CATEGORY_ALIASES = {
  "drying/necrosis/blight": "Drying/necrosis/blight",
  drying: "Drying/necrosis/blight",
  necrosis: "Drying/necrosis/blight",
  blight: "Drying/necrosis/blight",
  "leaf spot": "Leaf spot",
  leafspot: "Leaf spot",
  spot: "Leaf spot",
  wilt: "Wilt",
  wilting: "Wilt",
  mosaic: "Mosaic",
  "yellowing of leaves": "Yellowing of leaves",
  yellowing: "Yellowing of leaves",
  "distortion of leaves": "Distortion of leaves",
  distortion: "Distortion of leaves",
  "little leaf": "Little leaf",
  littleleaf: "Little leaf",
  "witches' broom": "Witches' broom",
  "witches broom": "Witches' broom",
  canker: "Canker",
  galls: "Galls",
  gall: "Galls",
  swelling: "Galls",
};

function normalizeCategory(cat) {
  if (!cat) return null;
  const lower = String(cat).toLowerCase().trim();
  return CATEGORY_ALIASES[lower] || cat;
}

/**
 * Finds all reference images whose CABI category matches the given categories.
 *
 * @param {Array<string>} categories — e.g. ['Leaf spot', 'Wilt']
 * @param {Object} opts
 *   - limit: max results (default 12)
 *   - preferDiversePages: if true, only one image per page (default true)
 *   - index: pre-built index (skips async load)
 * @returns {Promise<Array>} matching image entries
 */
export async function findImagesByCategory(categories, opts = {}) {
  const { limit = 12, preferDiversePages = true, index = null } = opts;
  const idx = index || (await buildImageIndex());
  const normalizedCats = (categories || []).map(normalizeCategory).filter(Boolean);
  if (normalizedCats.length === 0) return [];

  const seen = new Set();
  const matches = [];
  for (const entry of idx) {
    if (!entry.category) continue;
    if (!normalizedCats.includes(entry.category)) continue;
    if (preferDiversePages && seen.has(entry.page)) continue;
    seen.add(entry.page);
    matches.push(entry);
    if (matches.length >= limit) break;
  }
  return matches;
}

/**
 * Finds reference images whose text preview matches any of the given keywords.
 * Used when the diagnostic engine has detected specific symptom keywords but
 * has not yet mapped them to a CABI category.
 *
 * @param {Array<string>} keywords — e.g. ['yellow', 'leaf', 'curl']
 * @param {Object} opts
 *   - limit: max results (default 12)
 *   - index: pre-built index
 * @returns {Promise<Array>} matching image entries
 */
export async function findImagesByKeywords(keywords, opts = {}) {
  const { limit = 12, index = null } = opts;
  const idx = index || (await buildImageIndex());
  const lowerKeywords = (keywords || []).filter(Boolean).map((k) => k.toLowerCase());
  if (lowerKeywords.length === 0) return [];

  const scored = [];
  for (const entry of idx) {
    let score = 0;
    for (const kw of lowerKeywords) {
      if (entry.keywords.includes(kw)) score++;
    }
    if (score > 0) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

/**
 * Given a list of symptom strings (Bengali or English), returns a list of
 * candidate CABI reference images sorted by relevance.
 *
 * This is the main entry point used by the diagnostic engine.
 *
 * @param {Array<string>|string} symptomText — symptom strings
 * @param {Object} opts
 *   - cause: optional cause hint ('fungal'|'bacterial'|'viral'|'insect'...)
 *   - limit: max results (default 8)
 * @returns {Promise<Array>} ranked image entries
 */
export async function findReferenceImagesForSymptoms(symptomText, opts = {}) {
  const { cause = null, limit = 8 } = opts;
  const symptoms = Array.isArray(symptomText) ? symptomText : [symptomText];
  if (symptoms.length === 0) return [];

  // Step 1: Find matching CABI categories from Bengali keyword map
  const matchedCategories = new Set();
  for (const s of symptoms) {
    const lower = String(s || "").toLowerCase();
    for (const [bnKey, cats] of Object.entries(BENGALI_SYMPTOM_CATEGORY_MAP)) {
      if (lower.includes(bnKey) || s === bnKey) {
        cats.forEach((c) => matchedCategories.add(c));
      }
    }
  }

  // Step 2: If cause hint is given, boost categories typical for that cause
  if (cause && CAUSE_TO_CATEGORY_HINT[cause]) {
    for (const cat of CAUSE_TO_CATEGORY_HINT[cause]) {
      matchedCategories.add(cat);
    }
  }

  // Step 3: Pull images by category
  let matches = [];
  if (matchedCategories.size > 0) {
    matches = await findImagesByCategory([...matchedCategories], {
      limit: limit * 2,
      preferDiversePages: true,
    });
  }

  // Step 4: Fallback — keyword search if no category matches
  if (matches.length === 0) {
    matches = await findImagesByKeywords(symptoms, { limit: limit * 2 });
  }

  // Step 5: Score by category match strength
  const catArr = [...matchedCategories];
  const scored = matches.map((entry) => {
    let score = 1;
    if (entry.category && catArr.includes(entry.category)) score += 5;
    if (cause && CAUSE_TO_CATEGORY_HINT[cause]?.includes(entry.category)) score += 2;
    return { entry, score };
  });
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.entry);
}

/**
 * Returns the list of all unique CABI symptom categories found in the database.
 * Used to populate the visual library's category filter.
 */
export async function listAllCategories() {
  const idx = await buildImageIndex();
  const cats = new Set();
  for (const e of idx) {
    if (e.category) cats.add(e.category);
  }
  return [...cats].sort();
}

/**
 * Returns summary stats about the image library.
 * Used to render a small "library card" in the UI.
 */
export async function getLibraryStats() {
  const idx = await buildImageIndex();
  const categories = new Set();
  const pages = new Set();
  for (const e of idx) {
    if (e.category) categories.add(e.category);
    pages.add(e.page);
  }
  return {
    totalImages: idx.length,
    totalPages: pages.size,
    totalCategories: categories.size,
    categories: [...categories].sort(),
  };
}
