// Async enrichment layer for the offline diagnostic engine.
//
// The core diagnoseOffline() function in diagnosticEngine.js is synchronous
// and rule-based. This module adds an async post-processing step that:
//   1. Attaches CABI reference images to each crop disease match
//   2. Attaches category-grouped reference images to the overall diagnosis
//   3. Adds a "visual confidence" score based on how many reference images exist
//
// This lets the UI render a rich visual diagnosis panel with actual CABI
// Plantwise Field Guide images — entirely offline.

import { findReferenceImagesForSymptoms, getLibraryStats } from "../data/imageLibrary.js";
import { diagnoseOffline } from "./diagnosticEngine.js";

/**
 * Enriches a diagnosis result (from diagnoseOffline) with CABI reference images.
 *
 * @param {Object} diagnosis — result from diagnoseOffline()
 * @param {Object} inputData — original input data (for symptom text)
 * @returns {Promise<Object>} enriched diagnosis with .referenceImages field
 */
export async function enrichDiagnosisWithImages(diagnosis, inputData) {
  if (!diagnosis) return diagnosis;

  // Collect all symptom text from input
  const symptomTexts = [];
  if (inputData?.symptoms) {
    for (const v of Object.values(inputData.symptoms)) {
      if (v && String(v) !== "N/A") symptomTexts.push(String(v));
    }
  }
  // Also include matched symptoms from the diagnosis itself
  if (diagnosis.specificDisease?.matchedSymptoms) {
    symptomTexts.push(...diagnosis.specificDisease.matchedSymptoms);
  }

  // Step 1: Find reference images for overall symptom set
  const causeHint = diagnosis.specificDisease?.cause || null;
  const overallImages = await findReferenceImagesForSymptoms(symptomTexts, {
    cause: causeHint,
    limit: 8,
  });

  // Step 2: For each crop disease match, find more targeted images
  const perDiseaseImages = [];
  if (diagnosis.cropDiseaseMatches?.length > 0) {
    for (const match of diagnosis.cropDiseaseMatches.slice(0, 3)) {
      const diseaseSymptoms = match.matchedSymptoms || [];
      const imgs = await findReferenceImagesForSymptoms(diseaseSymptoms, {
        cause: match.cause,
        limit: 4,
      });
      if (imgs.length > 0) {
        perDiseaseImages.push({
          diseaseName: match.name,
          diseaseNameBn: match.nameBn,
          cause: match.cause,
          images: imgs,
        });
      }
    }
  }

  // Step 3: Compute a visual confidence boost
  // If we have ≥3 reference images that match the symptom category, the
  // visual evidence supports the diagnosis — bump confidence descriptor.
  let visualConfidence = "none";
  if (overallImages.length >= 6) visualConfidence = "high";
  else if (overallImages.length >= 3) visualConfidence = "medium";
  else if (overallImages.length >= 1) visualConfidence = "low";

  // Step 4: Library stats (so UI can show "278 images across 9 categories")
  const stats = await getLibraryStats().catch(() => ({
    totalImages: 0,
    totalPages: 0,
    totalCategories: 0,
    categories: [],
  }));

  return {
    ...diagnosis,
    referenceImages: {
      overall: overallImages,
      perDisease: perDiseaseImages,
      visualConfidence,
      libraryStats: stats,
    },
  };
}

/**
 * Convenience wrapper — runs the synchronous diagnosis then enriches it.
 * Use this in async contexts (event handlers, useEffect).
 *
 * @param {Object} inputData — same shape as diagnoseOffline input
 * @returns {Promise<Object>} enriched diagnosis
 */
export async function diagnoseOfflineWithImages(inputData) {
  const base = diagnoseOffline(inputData);
  return enrichDiagnosisWithImages(base, inputData);
}
