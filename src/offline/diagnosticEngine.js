// Offline CABI Diagnostic Engine
// Implements the CABI Plantwise methodology without requiring internet or external APIs
// Supports Bengali symptom input via BENGALI_KEYWORD_MAP

import { translateBengaliToEnglish, translateSymptomsToEnglish } from "../data/bengaliKeywords.js";
import {
  matchDiseasesBySymptoms,
  estimateInoculumPressure,
  getVarietySusceptibility,
  resolveCropKey,
  CROP_DISEASES,
} from "../data/cropDiseases.js";
import { formatChemicalAdviceWithMoA } from "../data/moaDatabase.js";

/**
 * Translates all symptom text fields to English keywords.
 * Handles Bengali symptom values from the UI chips and free-text.
 * @param {Object} symptoms - Observed symptoms from user (may contain Bengali)
 * @returns {Object} - Symptoms with an added _englishText field for keyword matching
 */
function translateSymptoms(symptoms) {
  const allValues = Object.values(symptoms)
    .map((v) => String(v || ""))
    .filter((v) => v && v !== "N/A");
  const englishText = translateSymptomsToEnglish(allValues);

  // Also translate each individual field for fine-grained matching
  const translated = {};
  for (const [key, value] of Object.entries(symptoms)) {
    if (value && String(value) !== "N/A") {
      translated[key] = translateBengaliToEnglish(String(value));
    } else {
      translated[key] = value;
    }
  }

  return {
    ...symptoms,
    _englishText: englishText,
    _translated: translated,
  };
}

/**
 * Extracts and processes symptoms to determine if issue is abiotic or biotic
 * @param {Object} symptoms - Observed symptoms from user
 * @returns {string} - "abiotic", "biotic", or "uncertain"
 */
function assessAbioticBiotic(symptoms) {
  const abioticIndicators = [
    "uniformly distributed",
    "machinery tracks",
    "irrigation channels",
    "soil type zones",
    "symmetrically on both sides",
    "no progression",
    "all plants affected simultaneously",
    "not spreading",
    "no fruiting bodies",
    "no ooze",
    "no webbing",
    "no frass",
    "no insect presence",
    "linked to management event",
    "fertilizer application",
    "herbicide",
    "flooding",
    "salinity",
    "pH toxicity",
    // Bengali-derived keywords
    "flood water damage",
    "drought stress",
    "cold injury frost",
  ];

  const bioticIndicators = [
    "spreads progressively",
    "focus point",
    "field edge",
    "irregular distribution",
    "some plants healthy",
    "some sick",
    "clear border",
    "healthy/diseased tissue",
    "signs of pathogen presence",
    "fruiting bodies",
    "ooze",
    "webbing",
    "frass",
    "cast skins",
    "eggs",
    "symptoms appear asymmetrically",
    // Bengali-derived keywords
    "insect visible pest",
    "chewing marks",
    "sticky honeydew",
    "whitefly",
    "spider mite",
  ];

  let abioticScore = 0;
  let bioticScore = 0;

  // Build combined text from both original (Bengali) and translated (English)
  const translated = translateSymptoms(symptoms);
  const allText = Object.values(symptoms).join(" ").toLowerCase() + " " + translated._englishText.toLowerCase();

  abioticIndicators.forEach((indicator) => {
    if (allText.includes(indicator.toLowerCase())) abioticScore++;
  });

  bioticIndicators.forEach((indicator) => {
    if (allText.includes(indicator.toLowerCase())) bioticScore++;
  });

  if (abioticScore > bioticScore) return "abiotic";
  if (bioticScore > abioticScore) return "biotic";
  return "uncertain";
}

/**
 * Applies CABI exclusion gates to narrow down potential causes
 * Now supports Bengali symptom keywords via translation layer
 * @param {string} abioticBiotic - Result from assessAbioticBiotic
 * @param {Object} symptoms - Observed symptoms
 * @returns {Object} - Excluded causes and remaining suspects
 */
function applyExclusionGates(abioticBiotic, symptoms) {
  const excluded = [];
  const suspects = [];
  const translated = translateSymptoms(symptoms);

  // Build combined text from original + translated English keywords
  const originalText = Object.values(symptoms).join(" ").toLowerCase();
  const englishText = translated._englishText.toLowerCase();
  const allText = originalText + " " + englishText;

  // If abiotic, we don't apply biotic gates
  if (abioticBiotic === "abiotic") {
    excluded.push("insects/mites", "virus", "bacteria", "fungi/oomycetes");
    suspects.push("nutrient deficiency", "drought", "waterlogging", "herbicide injury", "salinity", "pH toxicity");
    return { excluded, suspects };
  }

  // Gate A: Exclude Insects/Mites
  const insectMiteSigns = [
    "chewing marks",
    "holes",
    "rolled leaves",
    "mines",
    "frass",
    "cast skins",
    "eggs",
    "webbing",
    "stippling",
    // Bengali-derived keywords that map to insect signs
    "leaf roller insect",
    "chewing marks insect",
    "sticky honeydew",
    "whitefly insect",
    "spider mite webbing",
    "soil insect grub",
    "insect visible pest",
    "stem borer holes hollow stem insect borer",
  ];

  let hasInsectSigns = false;
  insectMiteSigns.forEach((sign) => {
    if (allText.includes(sign.toLowerCase())) hasInsectSigns = true;
  });

  if (!hasInsectSigns) {
    excluded.push("insects/mites");
  } else {
    suspects.push("insects/mites");
  }

  // Gate B: Exclude Virus
  const virusSigns = [
    "mosaic",
    "ring spots",
    "chlorotic patterns following vein boundaries",
    "systemic distortion of young leaves",
    "confined between veins",
    // Bengali-derived keywords
    "leaf curling curl distortion crinkling",
    "mosaic virus chlorotic patterns",
  ];

  let hasVirusSigns = false;
  virusSigns.forEach((sign) => {
    if (allText.includes(sign.toLowerCase())) hasVirusSigns = true;
  });

  // Special case: interveinal patterns suggest NOT virus
  if (allText.includes("interveinal") || allText.includes("confined between veins")) {
    excluded.push("virus");
  } else if (!hasVirusSigns) {
    excluded.push("virus");
  } else {
    suspects.push("virus");
  }

  // Gate C: Exclude Bacteria
  const bacteriaSigns = [
    "water-soaked margins",
    "bacterial ooze",
    "sticky exudate",
    // Bengali-derived keywords
    "water soaked oily",
    "water soaked margins leaf edge yellow brown bacterial",
  ];

  let hasBacteriaSigns = false;
  bacteriaSigns.forEach((sign) => {
    if (allText.includes(sign.toLowerCase())) hasBacteriaSigns = true;
  });

  if (!hasBacteriaSigns) {
    excluded.push("bacteria");
  } else {
    suspects.push("bacteria");
  }

  // Gate D: Confirm Fungal/Oomycete
  const fungalSigns = [
    "fruiting bodies",
    "black pycnidia",
    "pustules",
    "powdery coating",
    "cottony growth",
    // Bengali-derived keywords
    "white powder mildew powdery coating",
    "blast gray diamond lesions fungal",
  ];

  const oomyceteSigns = ["rapid aggressive rot", "white cottony sporulation", "no hard sclerotia"];

  const trueFungusSigns = ["hard black sclerotia"];

  let hasFungalSigns = false;
  let hasOomyceteSigns = false;
  let hasTrueFungusSigns = false;

  fungalSigns.forEach((sign) => {
    if (allText.includes(sign.toLowerCase())) hasFungalSigns = true;
  });

  oomyceteSigns.forEach((sign) => {
    if (allText.includes(sign.toLowerCase())) hasOomyceteSigns = true;
  });

  trueFungusSigns.forEach((sign) => {
    if (allText.includes(sign.toLowerCase())) hasTrueFungusSigns = true;
  });

  if (hasTrueFungusSigns) {
    suspects.push("true fungi");
    excluded.push("oomycetes");
  } else if (hasOomyceteSigns) {
    suspects.push("oomycetes");
    excluded.push("true fungi");
  } else if (hasFungalSigns) {
    suspects.push("fungal/oomycete (unable to differentiate)");
  } else {
    excluded.push("fungi/oomycetes");
  }

  return { excluded, suspects };
}

/**
 * Assesses disease triangle using host, pathogen, and environment factors
 * Now uses crop-specific variety and inoculum data when available
 * @param {Object} hostInfo - Host susceptibility data
 * @param {Object} pathogenInfo - Pathogen pressure data
 * @param {Object} envInfo - Environmental data (temperature, humidity, rainfall)
 * @param {string} cropInput - Crop name for database lookup (optional)
 * @returns {Object} - Disease triangle assessment with field observation guidance
 */
function assessDiseaseTriangle(hostInfo, pathogenInfo, envInfo, cropInput) {
  const assessment = {
    host: "",
    pathogen: "",
    environment: "",
    riskLevel: "low",
    fieldObservationGuidance: [], // New field to guide users on what observations to collect
  };

  // Use crop-specific variety susceptibility if available
  const effectiveVarietySusceptibility = cropInput
    ? getVarietySusceptibility(cropInput, hostInfo.variety)
    : hostInfo.varietySusceptibility || "medium";

  // Use season-based inoculum pressure if available
  const effectiveInoculumPressure =
    cropInput && pathogenInfo.season
      ? estimateInoculumPressure(cropInput, pathogenInfo.season)
      : pathogenInfo.inoculumPressure || "low";

  // Host assessment
  if (
    effectiveVarietySusceptibility === "high" ||
    hostInfo.growthStage === "seedling" ||
    hostInfo.growthStage === "vegetative"
  ) {
    assessment.host = "High susceptibility due to variety and growth stage";
    assessment.riskLevel = "medium";
    assessment.fieldObservationGuidance.push("Record variety name and exact growth stage (days after planting)");
  } else {
    assessment.host = "Moderate to low susceptibility";
    assessment.fieldObservationGuidance.push("Document variety and growth stage for baseline comparison");
  }

  // Pathogen assessment
  if (effectiveInoculumPressure === "high" || pathogenInfo.recentHistory === "present") {
    assessment.pathogen = "High pathogen pressure";
    if (assessment.riskLevel === "medium") assessment.riskLevel = "high";
    else assessment.riskLevel = "medium";
    assessment.fieldObservationGuidance.push("Note recent disease history in this field and surrounding areas");
  } else {
    assessment.pathogen = "Low to moderate pathogen pressure";
    assessment.fieldObservationGuidance.push("Survey field edges and nearby areas for disease presence");
  }

  // Environment assessment (using CABI thresholds)
  if (envInfo) {
    const { temp, humidity, rainfall } = envInfo;

    if (humidity > 80 && temp >= 26 && temp <= 35) {
      assessment.environment = "High humidity + optimal temperature = High fungal blast/blight risk";
      if (assessment.riskLevel !== "high") assessment.riskLevel = "high";
      assessment.fieldObservationGuidance.push("Monitor leaf wetness duration and canopy humidity throughout day");
    } else if (humidity > 85) {
      assessment.environment = "Very high humidity = High bacterial blight risk";
      if (assessment.riskLevel !== "high") assessment.riskLevel = "high";
      assessment.fieldObservationGuidance.push("Check for bacterial ooze early morning; monitor hourly humidity");
    } else if (temp < 20) {
      assessment.environment = "Cool nights = Tungro virus/insect vector risk";
      if (assessment.riskLevel === "low") assessment.riskLevel = "medium";
      assessment.fieldObservationGuidance.push("Record daily min/max temperatures and vector insect activity");
    } else if (rainfall > 50) {
      assessment.environment = "Heavy rain = Stem borer, root rot, waterlogging stress";
      if (assessment.riskLevel === "low") assessment.riskLevel = "medium";
      assessment.fieldObservationGuidance.push("Check soil drainage and look for waterlogging signs");
    } else {
      assessment.environment = "Environmental conditions moderate";
      assessment.fieldObservationGuidance.push("Continue standard environmental monitoring");
    }
  } else {
    assessment.environment = "No environmental data available";
    // When no environmental data, provide specific guidance on what to collect
    assessment.fieldObservationGuidance.push("CRITICAL: Measure temperature (°C), humidity (%), and rainfall (mm)");
    assessment.fieldObservationGuidance.push("Record time of day for all measurements");
    assessment.fieldObservationGuidance.push("Note recent weather patterns (last 3-5 days)");
  }

  // Add general field observation guidance
  assessment.fieldObservationGuidance.push(
    "For improved diagnosis, also record: symptom progression rate, affected plant percentage, and exact symptom location on plant",
  );

  return assessment;
}

/**
 * Provides field confirmation methods based on suspected cause, prioritized by diagnostic value
 * @param {Array} suspects - Array of suspected causes
 * @returns {Array} - Field confirmation methods with priority levels and interpretation guidance
 */
function getFieldConfirmationMethods(suspects) {
  const methods = [];

  suspects.forEach((suspect) => {
    switch (suspect) {
      case "bacteria":
        methods.push(
          "HIGH PRIORITY: Bacterial streaming test - Cut stem 15cm from base, place in clear water - milky streaming after 5-30 min confirms bacterial infection",
        );
        methods.push(
          "HIGH PRIORITY: Check for water-soaked margins at lesion edges (appear dark green/black, water-soaked)",
        );
        methods.push("MEDIUM PRIORITY: Look for bacterial ooze or sticky exudate (especially in morning)");
        methods.push(
          "INTERPRETATION: Positive streaming = bacterial wilt/rot; Water-soaked margins = active bacterial infection",
        );
        break;

      case "fungi/oomycetes":
      case "true fungi":
      case "oomycetes":
        methods.push(
          "HIGH PRIORITY: Check for visible fruiting bodies (black pycnidia=pseudothecia, pustules=acervuli, powdery coating=conidia, cottony growth=mycelium)",
        );
        methods.push(
          "HIGH PRIORITY: Look for rapid aggressive rot with white cottony sporulation on soil surface (indicates oomycete like Pythium/Phytophthora)",
        );
        methods.push(
          "MEDIUM PRIORITY: Check for hard black sclerotia (sclerotia = survival structures of fungi like Sclerotium)",
        );
        methods.push(
          "INTERPRETATION: Fruiting bodies confirm fungal infection; Location/texture helps identify specific fungus",
        );
        break;

      case "insects/mites":
        methods.push(
          "HIGH PRIORITY: Examine leaf underside for insects, mites, eggs, webbing, honeydew (use 10x hand lens if available)",
        );
        methods.push(
          "HIGH PRIORITY: Look for chewing marks (caterpillars/beetles), holes (shot-hole=beetles, irregular=caterpillars), mines (serpentine=larvae)",
        );
        methods.push(
          "MEDIUM PRIORITY: Look for frass (insect excrement), cast skins (molts), stippling (spider mite feeding)",
        );
        methods.push("LOW PRIORITY: Shake leaf over white paper to check for thrips and other small insects");
        methods.push(
          "INTERPRETATION: Type of damage + insect found = specific pest identification; Frass location indicates feeding site",
        );
        break;

      case "virus":
        methods.push(
          "HIGH PRIORITY: Look for mosaic (irregular light/dark green), ring spots, chlorotic patterns following vein boundaries",
        );
        methods.push("HIGH PRIORITY: Check for systemic distortion of young leaves (twisting, narrowing, fanning)");
        methods.push(
          "CRITICAL: Note: Symptoms confined between veins = NOT virus (indicates nutrient deficiency or herbicide)",
        );
        methods.push(
          "INTERPRETATION: Vein-bound patterns suggest virus; Interveinal patterns suggest nutrient/chemical cause",
        );
        break;

      case "nutrient deficiency":
        methods.push(
          "HIGH PRIORITY: Check symmetry: Symmetrical damage on both leaf halves strongly suggests nutrient deficiency",
        );
        methods.push("HIGH PRIORITY: Older leaves affected = Mobile nutrients deficient (N, P, K, Mg)");
        methods.push(
          "HIGH PRIORITY: Younger leaves affected = Immobile nutrients deficient (Zn, Fe, S, Cu, Mn, B, Ca)",
        );
        methods.push(
          "MEDIUM PRIORITY: Yellowing pattern: Tip/margin burn = K deficiency; Interveinal yellowing = Mg/Fe deficiency",
        );
        methods.push(
          "MEDIUM PRIORITY: Whitening along mid-vein = Zn deficiency; Leaf thickening/crinkling = Ca deficiency",
        );
        methods.push("INTERPRETATION: Pattern + mobility determines specific nutrient; Soil test confirms deficiency");
        break;

      default:
        methods.push(
          "GENERAL: Check distribution (uniform=abiotic, patchy=biotic), progression rate, and associated symptoms",
        );
        methods.push(
          "OBSERVATION GUIDE: Record % plants affected, symptom progression (hours/days/weeks), and exact symptom location",
        );
        break;
    }
  });

  return methods;
}

/**
 * Generates IPM recommendations based on diagnosis.
 * When crop-specific diseases are matched, returns targeted recommendations.
 * Falls back to generic IPM recommendations otherwise.
 * @param {Object} diagnosis - Diagnosis object with suspects, confidence, cropDiseaseMatches, etc.
 * @returns {Object} - IPM recommendations
 */
function generateIPMRecommendations(diagnosis) {
  const recommendations = {
    cultural: [],
    biological: [],
    chemical: [],
    prevention: [],
  };

  // If we have specific disease matches, use their targeted recommendations
  if (diagnosis.cropDiseaseMatches && diagnosis.cropDiseaseMatches.length > 0) {
    const topMatch = diagnosis.cropDiseaseMatches[0];
    const disease = topMatch.disease;

    // Add disease-specific recommendations
    if (disease.recommendations && disease.recommendations.length > 0) {
      disease.recommendations.forEach((rec) => {
        // Classify recommendation into appropriate category based on content
        const recLower = rec.toLowerCase();
        if (
          recLower.includes("স্প্রে") ||
          recLower.includes("প্রয়োগ") ||
          recLower.includes("spray") ||
          recLower.includes("কীটনাশক") ||
          recLower.includes("ছত্রাকনাশক") ||
          recLower.includes("ফাঙ্গিসাইড") ||
          recLower.includes("মেটালাক্সিল") ||
          recLower.includes("ম্যানকোজেব") ||
          recLower.includes("কার্বেন্ডাজিম") ||
          recLower.includes("কপার") ||
          recLower.includes("ট্রাইসাইক্লাজোল") ||
          recLower.includes("প্রোপিকোনাজোল") ||
          recLower.includes("হেক্সাকোনাজোল") ||
          recLower.includes("টেবুকোনাজোল") ||
          recLower.includes("সালফার") ||
          recLower.includes("ইমিডাক্লোপ্রিড") ||
          recLower.includes("সাইপারমেথ্রিন") ||
          recLower.includes("কার্বারিল") ||
          recLower.includes("রিডোমিল") ||
          recLower.includes("বোর্দো")
        ) {
          recommendations.chemical.push(rec);
        } else if (
          recLower.includes("জাত") ||
          recLower.includes("আবর্তন") ||
          recLower.includes("দূরত্ব") ||
          recLower.includes("সার") ||
          recLower.includes("সেচ") ||
          recLower.includes("বীজ") ||
          recLower.includes("চাষ") ||
          recLower.includes("বপন") ||
          recLower.includes("ছাঁটাই") ||
          recLower.includes("পরিষ্কার") ||
          recLower.includes("নিষ্কাশন") ||
          recLower.includes("নার্সারি") ||
          recLower.includes("চারা") ||
          recLower.includes("গভীর চাষ")
        ) {
          recommendations.cultural.push(rec);
        } else if (
          recLower.includes("ট্রাইকো") ||
          recLower.includes("নিম") ||
          recLower.includes("ফেরোমন") ||
          recLower.includes("জৈব") ||
          recLower.includes("বিউভেরিয়া") ||
          recLower.includes("হলুদ ফাঁদ") ||
          recLower.includes("নেট") ||
          recLower.includes("টিস্যু কালচার")
        ) {
          recommendations.biological.push(rec);
        } else {
          recommendations.cultural.push(rec);
        }
      });
    }

    // If we have multiple disease matches, add secondary recommendations
    if (diagnosis.cropDiseaseMatches.length > 1) {
      const secondMatch = diagnosis.cropDiseaseMatches[1];
      recommendations.cultural.push(`বিকল্প রোগ "${secondMatch.disease.nameBn}" এর জন্যও পর্যবেক্ষণ করুন`);
    }

    // Add severity-based prevention
    if (disease.severity === "severe") {
      recommendations.prevention.push(`"${disease.nameBn}" মারাত্মক — পরবর্তী মৌসুমে প্রতিরোধী জাত অবশ্যই লাগাবেন`);
    }
  }

  // Add generic cultural controls (always applicable)
  if (recommendations.cultural.length === 0) {
    recommendations.cultural.push("প্রতিরোধী জাত ব্যবহার করুন");
    recommendations.cultural.push("ফসল আবর্তন করুন");
    recommendations.cultural.push("সঠিক দূরত্বে চাষ করুন");
    recommendations.cultural.push("সুষম সার প্রয়োগ করুন");
    recommendations.cultural.push("সুস্থ বীজ ও চারা ব্যবহার করুন");
    recommendations.cultural.push("আক্রান্ত গাছের অবশিষ্ট সরিয়ে পুড়ে ফেলুন");
    recommendations.cultural.push("আগাছা পরিষ্কার রাখুন");
  }

  // Add generic biological controls if none from disease matches
  if (recommendations.biological.length === 0) {
    recommendations.biological.push("ট্রাইকোডার্মা প্রয়োগ করুন (ছত্রাকজনিত রোগে)");
    recommendations.biological.push("নিম তেল বা উদ্ভিদজ নিষ্কর্ষ ব্যবহার করুন");
    recommendations.biological.push("প্রাকৃতিক শত্রু সংরক্ষণ করুন");
  }

  // Add generic chemical controls if none from disease matches
  if (recommendations.chemical.length === 0) {
    if (diagnosis.confidence === "high" || diagnosis.confidence === "medium") {
      diagnosis.suspects.forEach((suspect) => {
        switch (suspect) {
          case "true fungi":
            recommendations.chemical.push("প্রোপিকোনাজোল, ট্রাইসাইক্লাজোল, কার্বেন্ডাজিম বা টেবুকোনাজোল ব্যবহার করুন");
            recommendations.chemical.push("FRAC গ্রুপ রোটেশন বাধ্যতামূলক (প্রতিরোধ ক্ষমতা রোধে)");
            break;

          case "oomycetes":
            recommendations.chemical.push("মেটালাক্সিল+মানকোজেব, ফোসেটাইল-এএল বা সাইমোক্সানিল+মানকোজেব ব্যবহার");
            recommendations.chemical.push("সাধারণ ছত্রাকনাশক কাজ করবে না — নির্দিষ্ট ওমাইসিটসাইড দরকার");
            break;

          case "bacteria":
            recommendations.chemical.push("কপার অক্সিক্লোরাইড বা কপার হাইড্রোক্সাইড ব্যবহার করুন");
            recommendations.chemical.push("নোট: উদ্ভিদে অ্যান্টিবায়োটিক ব্যবহার সুপারিশ করা হয় না");
            break;

          case "insects/mites":
            recommendations.chemical.push("IRAC গ্রুপ রোটেশন: নিওনিকোটিনয়েড → অর্গানোফসফেট → পাইরেথ্রয়েড");
            recommendations.chemical.push("একই গ্রুপ ২ বারের বেশি স্প্রে করবেন না");
            break;

          case "virus":
            recommendations.chemical.push("ভাইরাসের রাসায়নিক চিকিৎসা নেই — বাহক নিয়ন্ত্রণে মনোযোগ দিন");
            recommendations.chemical.push("সাদা মাছি, পাতাফড়িং ও জাব পোকা নিয়ন্ত্রণ করুন");
            break;
        }
      });
    } else {
      recommendations.chemical.push("নিশ্চিত রোগ নির্ণয় ছাড়া রাসায়নিক নিয়ন্ত্রণ সুপারিশ করা হচ্ছে না");
    }
  }

  // Add generic prevention
  if (recommendations.prevention.length === 0) {
    recommendations.prevention.push("নিয়মিত মাঠ পরিদর্শন করুন");
    recommendations.prevention.push("রোগ পূর্বাভাস মডেল ব্যবহার করুন (যেখানে পাওয়া যায়)");
    recommendations.prevention.push("নতুন চারা আনার সময় কোয়ারেন্টাইন মেনে চলুন");
    recommendations.prevention.push("মাঠের পরিচ্ছন্নতা বজায় রাখুন");
    recommendations.prevention.push("প্রতিফলক মাল্চ ব্যবহার করে উড়ন্ত পোকা দূর রাখুন");
  }
  recommendations.prevention.push("সুষম সার প্রয়োগ করে গাছের রোগ প্রতিরোধ ক্ষমতা বাড়ান");

  // Ensure all chemical recommendations include MoA number & rotation group
  recommendations.chemical = recommendations.chemical.map((item) => formatChemicalAdviceWithMoA(item));

  return recommendations;
}

/**
 * Main diagnostic function that orchestrates the offline diagnosis process.
 * Now supports Bengali symptom input and crop-specific disease matching.
 * @param {Object} inputData - Contains symptoms, host info, pathogen info, env info, crop
 * @returns {Object} - Complete diagnosis in CABI format with disease matches
 */
function diagnoseOffline(inputData) {
  const { symptoms, hostInfo = {}, pathogenInfo = {}, envInfo = {}, crop } = inputData;

  // Step 1: Abiotic vs Biotic assessment (uses Bengali-aware text)
  const abioticBiotic = assessAbioticBiotic(symptoms);

  // Step 2: Apply exclusion gates (uses Bengali-aware text)
  const { excluded, suspects } = applyExclusionGates(abioticBiotic, symptoms);

  // Step 3: Crop-specific disease matching
  let cropDiseaseMatches = [];
  let cropKey = null;

  if (crop) {
    cropKey = resolveCropKey(crop);

    if (cropKey && CROP_DISEASES[cropKey]) {
      // Collect all symptom text (both Bengali original and translated English)
      const allSymptomTexts = [];
      for (const val of Object.values(symptoms)) {
        if (val && String(val) !== "N/A") {
          // Split comma-separated or multi-line symptom strings
          String(val)
            .split(/[,;\n]+/)
            .forEach((s) => {
              const trimmed = s.trim();
              if (trimmed) allSymptomTexts.push(trimmed);
            });
        }
      }

      // Match against disease database
      cropDiseaseMatches = matchDiseasesBySymptoms(crop, allSymptomTexts);

      // Filter out zero-match results unless they all have zero
      const nonZeroMatches = cropDiseaseMatches.filter((m) => m.score > 0);
      if (nonZeroMatches.length > 0) {
        cropDiseaseMatches = nonZeroMatches;
      }

      // Enhance suspects based on disease cause type
      cropDiseaseMatches.forEach((match) => {
        if (match.matchRatio >= 0.3 && match.disease.cause) {
          const cause = match.disease.cause;
          if (cause === "fungal" && !suspects.some((s) => s.includes("fungi"))) {
            if (!excluded.includes("fungi/oomycetes")) {
              suspects.push("fungal/oomycete (crop-specific match)");
            }
          }
          if (cause === "bacterial" && !suspects.includes("bacteria")) {
            suspects.push("bacteria (crop-specific match)");
          }
          if (cause === "viral" && !suspects.includes("virus")) {
            suspects.push("virus (crop-specific match)");
          }
          if (cause === "insect" && !suspects.includes("insects/mites")) {
            suspects.push("insects/mites (crop-specific match)");
          }
        }
      });
    }
  }

  // Step 3b: On-device ViT vision boost (Phase 1 companion)
  // If the local vision classifier returned a prediction for the same crop as
  // the form, give that disease a deterministic edge over symptom-only matching.
  // The vision signal enters via inputData.vision (or inputData.vitPrediction).
  const vision = inputData.vision || inputData.vitPrediction;
  if (vision && vision.disease && cropDiseaseMatches.length > 0) {
    const visionCropKey = resolveCropKey(vision.crop) || cropKey;
    if (cropKey && visionCropKey && visionCropKey === cropKey) {
      const visionEn = String(vision.disease || "").toLowerCase();
      const visionBn = String(vision.diseaseBn || "").toLowerCase();
      // Confidence-boosted bump: higher model confidence → larger edge, but
      // always leaves room for the CABI symptom gate to veto.
      const boost = 0.15 + Math.min(Math.max(Number(vision.confidence) || 0, 0), 0.97) * 0.4;
      let boosted = false;
      cropDiseaseMatches = cropDiseaseMatches.map((m) => {
        if (boosted) return m;
        const dEn = String(m.disease.name || "").toLowerCase();
        const dBn = String(m.disease.nameBn || "").toLowerCase();
        const matches =
          (visionEn && (dEn === visionEn || dEn.includes(visionEn) || visionEn.includes(dEn))) ||
          (visionBn && (dBn === visionBn || dBn.includes(visionBn) || visionBn.includes(dBn)));
        if (matches) {
          boosted = true;
          return { ...m, matchRatio: Math.min(1, m.matchRatio + boost) };
        }
        return m;
      });
      if (boosted) {
        cropDiseaseMatches.sort((a, b) => b.matchRatio - a.matchRatio || b.score - a.score);
      }
    }
  }

  // Step 4: Disease triangle assessment (now crop-aware)
  const triangle = assessDiseaseTriangle(hostInfo, pathogenInfo, envInfo, crop);

  // Step 5: Field confirmation methods
  const fieldMethods = getFieldConfirmationMethods(suspects);

  // Step 6: Generate IPM recommendations (now crop/disease-specific)
  const ipmRecommendations = generateIPMRecommendations({
    suspects: suspects,
    confidence: suspects.length > 0 && excluded.length > 0 ? "medium" : "low",
    cropDiseaseMatches: cropDiseaseMatches,
  });

  // Determine primary suspect (prefer crop-specific match)
  let primarySuspect;
  let specificDisease = null;

  if (cropDiseaseMatches.length > 0 && cropDiseaseMatches[0].matchRatio >= 0.2) {
    const topMatch = cropDiseaseMatches[0];
    specificDisease = {
      name: topMatch.disease.name,
      nameBn: topMatch.disease.nameBn,
      cause: topMatch.disease.cause,
      pathogen: topMatch.disease.pathogen,
      severity: topMatch.disease.severity,
      confidence: topMatch.matchRatio >= 0.5 ? "high" : topMatch.matchRatio >= 0.3 ? "medium" : "low",
      matchRatio: topMatch.matchRatio,
      matchedSymptoms: topMatch.matchedSymptoms,
    };
    primarySuspect = `${topMatch.disease.nameBn} (${topMatch.disease.name})`;
  } else {
    primarySuspect = suspects.length > 0 ? suspects[0] : "No clear suspect - requires field observation";
  }

  // Build diagnosis object
  const diagnosis = {
    abioticBiotic,
    excluded,
    suspects,
    primarySuspect,
    specificDisease,
    cropDiseaseMatches: cropDiseaseMatches.map((m) => ({
      name: m.disease.name,
      nameBn: m.disease.nameBn,
      cause: m.disease.cause,
      pathogen: m.disease.pathogen,
      severity: m.disease.severity,
      season: m.disease.season,
      score: m.score,
      maxScore: m.maxScore,
      matchRatio: m.matchRatio,
      matchedSymptoms: m.matchedSymptoms,
      recommendations: m.disease.recommendations,
    })),
    confidence: specificDisease
      ? specificDisease.confidence
      : suspects.length > 0
        ? suspects.length === 1 && excluded.length >= 3
          ? "high"
          : suspects.length <= 2
            ? "medium"
            : "low"
        : "low",
    diseaseTriangle: triangle,
    fieldConfirmation: fieldMethods,
    ipmRecommendations: ipmRecommendations,
    economicThreshold:
      suspects.length > 0
        ? "Assess: <5% leaf area damaged for most insects = no action needed"
        : "Monitor without treatment until cause is confirmed",
    recommendedFieldObservations: triangle.fieldObservationGuidance || [],
    timestamp: new Date().toISOString(),
  };

  return diagnosis;
}

// Export functions for use in other modules
export {
  diagnoseOffline,
  assessAbioticBiotic,
  applyExclusionGates,
  assessDiseaseTriangle,
  getFieldConfirmationMethods,
  generateIPMRecommendations,
  translateSymptoms,
};
