// Maps game scenario keywords to relevant symptom/pest images
// Images are from the CABI Plantwise Diagnostic Field Guide

const SYMPTOM_IMAGES = {
  // ── Disease symptoms ──
  blast: ["img_page99_0.jpeg", "img_page99_1.jpeg", "img_page100_0.jpeg"],
  blb: ["img_page106_0.jpeg", "img_page106_1.jpeg", "img_page28_0.jpeg"],
  shath_blight: ["img_page26_0.jpeg", "img_page27_0.jpeg"],
  early_blight: ["img_page15_0.jpeg", "img_page15_1.jpeg", "img_page99_0.jpeg"],
  late_blight: ["img_page26_0.jpeg", "img_page26_1.jpeg", "img_page31_0.jpeg"],
  powdery_mildew: ["img_page108_0.jpeg", "img_page108_1.jpeg", "img_page108_2.jpeg"],
  mosaic_virus: ["img_page105_0.jpeg", "img_page105_1.jpeg", "img_page105_2.jpeg"],

  // ── Nutrient deficiencies ──
  zn_deficiency: ["img_page23_0.jpeg", "img_page23_1.jpeg", "img_page23_2.jpeg"],
  n_deficiency: ["img_page94_0.jpeg", "img_page94_1.jpeg", "img_page23_4.jpeg"],
  boron_deficiency: ["img_page23_10.jpeg", "img_page23_11.jpeg", "img_page23_12.jpeg"],

  // ── Insect pests ──
  aphid: ["img_page20_0.jpeg", "img_page20_1.jpeg", "img_page20_2.jpeg", "img_page101_0.jpeg"],
  mite: ["img_page41_0.jpeg", "img_page41_1.jpeg", "img_page101_1.jpeg"],
  thrips: ["img_page20_3.png", "img_page20_4.jpeg", "img_page101_2.jpeg"],
  diamond_back_moth: ["img_page101_3.jpeg", "img_page101_0.jpeg"],
  stem_borer: ["img_page101_0.jpeg", "img_page101_1.jpeg", "img_page110_0.jpeg"],
  leaf_folder: ["img_page102_0.jpeg", "img_page102_1.jpeg", "img_page103_0.jpeg"],
  bph: ["img_page101_0.jpeg", "img_page101_1.jpeg", "img_page20_5.png"],
};

// ─── SymptomSpotter: correct-answer labels → images ───
export const SYMPTOM_SPOTTER_IMAGES = {
  "ব্লাস্ট (Blast)": SYMPTOM_IMAGES.blast,
  "ব্যাকটেরিয়াল লিফ ব্লাইট": SYMPTOM_IMAGES.blb,
  "শিথ ব্লাইট": SYMPTOM_IMAGES.shath_blight,
  "জিংক অভাব (খইরা)": SYMPTOM_IMAGES.zn_deficiency,
  "নাইট্রোজেন অভাব": SYMPTOM_IMAGES.n_deficiency,
  "আর্লি ব্লাইট": SYMPTOM_IMAGES.early_blight,
  "লেট ব্লাইট": SYMPTOM_IMAGES.late_blight,
  "জাব পোকা (Aphid)": SYMPTOM_IMAGES.aphid,
  "লাল মাকড়সা মাইট": SYMPTOM_IMAGES.mite,
  থ্রিপস: SYMPTOM_IMAGES.thrips,
  "ডায়মন্ড ব্যাক মথ": SYMPTOM_IMAGES.diamond_back_moth,
  "মাজরা পোকা": SYMPTOM_IMAGES.stem_borer,
  "পাতামোড়া পোকা": SYMPTOM_IMAGES.leaf_folder,
  "পাউডারি মিলডিউ": SYMPTOM_IMAGES.powdery_mildew,
  "বোরন অভাব": SYMPTOM_IMAGES.boron_deficiency,
};

// ─── CauseDetective: round index → images ───
export const CAUSE_DETECTIVE_IMAGES = {
  0: SYMPTOM_IMAGES.zn_deficiency, // Zn deficiency
  1: SYMPTOM_IMAGES.blast, // Blast
  2: SYMPTOM_IMAGES.blb, // BLB
  3: SYMPTOM_IMAGES.aphid, // Aphid
  4: SYMPTOM_IMAGES.mosaic_virus, // Virus
  5: SYMPTOM_IMAGES.late_blight, // Late blight
  6: SYMPTOM_IMAGES.stem_borer, // BPH
  7: SYMPTOM_IMAGES.boron_deficiency, // Boron
};

// ─── DiseaseTriangle: disease name → images ───
export const DISEASE_TRIANGLE_IMAGES = {
  "ধানের ব্লাস্ট (Rice Blast)": SYMPTOM_IMAGES.blast,
  "আলুর লেট ব্লাইট": SYMPTOM_IMAGES.late_blight,
  "ধানের মাজরা পোকা": SYMPTOM_IMAGES.stem_borer,
  "টমেটো আর্লি ব্লাইট": SYMPTOM_IMAGES.early_blight,
  "সরিষার জাব পোকা": SYMPTOM_IMAGES.aphid,
  "বাঁধাকপির ডায়মন্ড ব্যাক মথ": SYMPTOM_IMAGES.diamond_back_moth,
};

// ─── FieldScout: scenario index → images ───
export const FIELD_SCOUT_IMAGES = {
  0: SYMPTOM_IMAGES.blast, // Rice blast
  1: SYMPTOM_IMAGES.stem_borer, // Stem borer
  2: SYMPTOM_IMAGES.bph, // BPH
  3: SYMPTOM_IMAGES.aphid, // Aphid
  4: SYMPTOM_IMAGES.late_blight, // Late blight
  5: SYMPTOM_IMAGES.diamond_back_moth, // DBM
};

// ─── IPMCommander: problem description → images ───
export const IPM_COMMANDER_IMAGES = {
  "ধানের ব্লাস্ট রোগ দেখা দিয়েছে": SYMPTOM_IMAGES.blast,
  "মাজরা পোকার উপদ্রব শুরু হয়েছে": SYMPTOM_IMAGES.stem_borer,
  "আর্লি ব্লাইট এর লক্ষণ দেখা দিচ্ছে": SYMPTOM_IMAGES.early_blight,
  "লেট ব্লাইট দেখা দিয়েছে — জরুরি পরিস্থিতি": SYMPTOM_IMAGES.late_blight,
  "জাব পোকায় আক্রান্ত, সমস্যা বাড়ছে": SYMPTOM_IMAGES.aphid,
  "লাল মাকড়সা মাইটে আক্রান্ত": SYMPTOM_IMAGES.mite,
};
