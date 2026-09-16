// Test script for offline diagnosis engine
import { diagnoseOffline } from "./diagnosticEngine.js";

// Test case 1: Nitrogen deficiency symptoms (English - original test)
const testData1 = {
  symptoms: {
    leafSymptoms: "older leaves yellowing uniformly, symmetrical pattern",
    distribution: "uniform across field",
    progression: "no progression",
    signs: "no insect signs, no fungal growth",
  },
  hostInfo: {
    varietySusceptibility: "medium",
    growthStage: "vegetative",
  },
  pathogenInfo: {
    inoculumPressure: "low",
    recentHistory: "none",
  },
  envInfo: {
    temp: 28,
    humidity: 70,
    rainfall: 10,
  },
};

// Test case 2: Fungal disease symptoms (English - original test)
const testData2 = {
  symptoms: {
    leafSymptoms: "spindle-shaped lesions with gray center and brown border",
    distribution: "irregular, focal points",
    progression: "spreading from field edge",
    signs: "gray powdery growth on lesions",
  },
  hostInfo: {
    varietySusceptibility: "high",
    growthStage: "tillering",
  },
  pathogenInfo: {
    inoculumPressure: "medium",
    recentHistory: "present in area",
  },
  envInfo: {
    temp: 26,
    humidity: 85,
    rainfall: 5,
  },
};

// Test case 3: Bengali symptoms - Rice blast (NEW)
const testData3 = {
  symptoms: {
    leafSymptoms: "পাতায় ধূসর মাকু আকৃতির দাগ (ব্লাস্ট)",
    distribution: "বিক্ষিপ্তভাবে ছড়িয়ে",
    progression: "3-5 দিন ধরে",
    signs: "পাতায় বাদামি গোলাকার দাগ",
  },
  crop: "ধান",
  hostInfo: {
    varietySusceptibility: "medium",
    growthStage: "vegetative",
  },
  pathogenInfo: {
    inoculumPressure: "low",
    recentHistory: "none",
  },
  envInfo: {
    temp: 28,
    humidity: 85,
    rainfall: 5,
  },
};

// Test case 4: Bengali symptoms - Tomato bacterial wilt (NEW)
const testData4 = {
  symptoms: {
    leafSymptoms: "পাতা হলুদ হয়ে যাচ্ছে",
    distribution: "প্রায় 25%",
    progression: "1-2 দিন আগে",
    signs: "গাছ দিনে নেতিয়ে পড়ে, রাতে সতেজ হয়",
  },
  crop: "টমেটো",
  hostInfo: {
    varietySusceptibility: "medium",
    growthStage: "vegetative",
  },
  pathogenInfo: {
    inoculumPressure: "low",
    recentHistory: "none",
  },
  envInfo: {
    temp: 32,
    humidity: 80,
    rainfall: 20,
  },
};

// Test case 5: Bengali symptoms with crop in English (NEW)
const testData5 = {
  symptoms: {
    leafSymptoms: "পাতায় সাদা গুঁড়া",
    distribution: "প্রায় 10%",
    progression: "1 সপ্তাহ",
    signs: "পাতায় তেলতেলে",
  },
  crop: "Potato",
  hostInfo: {
    varietySusceptibility: "medium",
    growthStage: "vegetative",
  },
  pathogenInfo: {
    inoculumPressure: "low",
    recentHistory: "none",
  },
  envInfo: {
    temp: 18,
    humidity: 90,
    rainfall: 30,
  },
};

// Run tests — results available via return values
const result1 = diagnoseOffline(testData1);
const result2 = diagnoseOffline(testData2);
const result3 = diagnoseOffline(testData3);
const result4 = diagnoseOffline(testData4);
const result5 = diagnoseOffline(testData5);

// Export for programmatic use
export { result1, result2, result3, result4, result5 };
