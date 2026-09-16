// Bengali-to-English Keyword Mapping for CABI Plant Detective
// Maps Bengali symptom chip values from the UI to English keywords
// used by the offline diagnostic engine's exclusion gates.

export const BENGALI_KEYWORD_MAP = {
  // ─── Leaf symptoms ─────────────────────────────────────────────────────
  "পাতা হলুদ হয়ে যাচ্ছে": "yellow leaves chlorosis yellowing",
  "পাতায় বাদামি গোলাকার দাগ": "brown spots lesions circular leaf spots",
  "পাতায় ধূসর মাকু আকৃতির দাগ (ব্লাস্ট)": "gray spindle diamond shaped lesions blast fungal",
  "পাতার কিনারা পুড়ে যাওয়ার মতো বাদামি": "leaf margin burn brown edges necrosis",
  "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে": "leaf curling curl distortion crinkling",
  "পাতা লম্বালম্বিভাবে মোড়ানো (পাতামোড়া পোকা)": "rolled leaves leaf roller insect chewing",
  "পাতার নিচে সূক্ষ্ম জাল (মাইট)": "webbing spider mite stippling fine web",
  "পাতায় দাগ": "leaf spots lesions",
  "পাতা ঝরে": "leaf drop defoliation",
  "পাতা শুকিয়ে": "leaf drying wilting",
  "পাতায় ছিদ্র": "leaf holes shot hole chewing marks",
  "পাতায় সাদা গুঁড়া": "white powder mildew powdery coating",
  "পাতায় তেলতেলে": "water soaked oily water-soaked margins",
  "পাতা পোড়া": "leaf scorch burn necrosis",

  // ─── Stem symptoms ─────────────────────────────────────────────────────
  "কান্ডের গোড়া পচে কালো বা বাদামি": "stem rot canker base rot dark discoloration",
  "কান্ড টানলে সহজে উঠে আসে, ভেতর ফাঁকা": "stem borer holes hollow stem insect borer",
  "শিকড় কালো ও পচা": "root rot black roots wilting",
  "কাণ্ড পচে": "stem rot canker",
  "কাণ্ডে ছিদ্র": "stem borer holes insect",
  "কাণ্ড ভেঙে": "stem breaking lodging",

  // ─── Fruit / grain symptoms ────────────────────────────────────────────
  "ফুল অকালে ঝরে পড়ছে": "flower drop premature abortion",
  "ফল পচে যাচ্ছে, কালো বা বাদামি দাগ": "fruit rot black brown spots fruit",
  "ধানের শীষ চিটা, দানা পূর্ণ হচ্ছে না": "ear head drying chaffy grains white head stem borer",
  "ধানের শীষ সম্পূর্ণ সাদা হয়ে গেছে": "white head ear head drying dead panicle",
  "ফল পচে": "fruit rot",
  "ফলে দাগ": "fruit spots",
  "শীষ শুকিয়ে": "ear head drying",

  // ─── Whole plant symptoms ──────────────────────────────────────────────
  "গাছ দিনে নেতিয়ে পড়ে, রাতে সতেজ হয়": "wilting bacterial wilt temporary recovery",
  "গাছ হঠাৎ শুকিয়ে মারা যাচ্ছে": "plant death dieback sudden wilt",
  "গাছ শুকিয়ে": "wilting drying",
  "গাছ মরে": "plant death dieback",
  "আগায় শুকিয়ে": "tip burn dieback",

  // ─── Pest signs ────────────────────────────────────────────────────────
  "গাছে পোকা দেখা যাচ্ছে": "insect visible pest insects",
  "পাতায় ছিদ্র বা চিবানোর দাগ": "chewing marks holes leaf damage insect",
  "গাছে পিঁপড়া বা আঠালো মধুরস": "sticky honeydew ants aphid whitefly",
  মাকড়: "web spider mite webbing",
  গাঁদ: "gall swelling insect",
  আঠালো: "sticky honeydew",
  "সাদা মাছি": "whitefly insect",
  "মাটির পোকা": "soil insect grub root feeding",

  // ─── Environment / abiotic ─────────────────────────────────────────────
  "বন্যার ক্ষতি": "flood water damage waterlogging",
  খরা: "drought stress",
  ঠান্ডা: "cold injury frost",

  // ─── Short labels from SYMPTOM_CHIPS (label field) ────────────────────
  "পাতা হলুদ": "yellow leaves chlorosis",
  "বাদামি দাগ": "brown spots lesions",
  "ধূসর দাগ (ব্লাস্ট)": "blast gray diamond lesions fungal",
  "পাতা কুঁকড়ানো": "leaf curling curl",
  "পাতা মোড়ানো": "rolled leaves leaf roller insect",
  "পাতায় জাল": "web spider mite webbing",
  "কান্ড পচা": "stem rot canker",
  "কান্ড ফাঁপা": "stem borer hollow insect",
  "শিকড় পচা": "root rot",
  "ফুল ঝরা": "flower drop",
  "ফল পচা": "fruit rot",
  "শীষ চিটা": "ear head drying chaffy",
  "শীষ সাদা": "white head dead panicle",
  "পোকা দেখা": "insect visible pest",
  "পিঁপড়া/মধুরস": "sticky honeydew ants aphid",
  "গাছ নেতিয়ে": "wilting",
  "গাছ মরছে": "plant death dieback",
  "সাদা গুঁড়া": "white powder mildew powdery coating",

  // ─── Additional common Bengali agricultural terms ──────────────────────
  "পাতায় হীরার মত দাগ": "diamond shaped lesions blast fungal",
  "আগায় শুকিয়ে যাওয়া": "tip burn dieback",
  "শীষ শুকিয়ে যাওয়া": "ear head drying",
  "পাতার কিনারা হলুদ-বাদামি": "water soaked margins leaf edge yellow brown bacterial",
  "পাতায় মোজেইক": "mosaic virus chlorotic patterns",
  "গাছ বামন": "stunting virus dwarf",
  "ফল বিকৃত": "fruit distortion virus",
  ছত্রাক: "fungal fungi fruiting bodies",
  ব্যাকটেরিয়া: "bacteria bacterial ooze",
  ভাইরাস: "virus mosaic distortion",
  পোকা: "insect pest",
  রসুন: "garlic",
  পেঁয়াজ: "onion",
  মরিচ: "chilli",
};

/**
 * Translate Bengali symptom text to English keywords.
 * First tries exact match in BENGALI_KEYWORD_MAP, then falls back to
 * partial matching (checking if any key is a substring of the input).
 * @param {string} bengaliText - Symptom text in Bengali
 * @returns {string} - English keywords or the original text if no match
 */
export function translateBengaliToEnglish(bengaliText) {
  if (!bengaliText) return "";

  // Try exact match first (prioritize longer keys)
  const sortedKeys = Object.keys(BENGALI_KEYWORD_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (bengaliText.includes(key)) {
      return BENGALI_KEYWORD_MAP[key];
    }
  }

  // No match found — return original text (may already be English)
  return bengaliText;
}

/**
 * Translate an array of Bengali symptom values into a single English keyword string.
 * @param {string[]} bengaliSymptoms - Array of Bengali symptom strings
 * @returns {string} - Space-separated English keywords
 */
export function translateSymptomsToEnglish(bengaliSymptoms) {
  if (!Array.isArray(bengaliSymptoms)) return "";
  const translated = bengaliSymptoms.map((s) => translateBengaliToEnglish(s)).filter(Boolean);
  return translated.join(" ");
}
