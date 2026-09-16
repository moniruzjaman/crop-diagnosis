/**
 * Enhanced Crop Calendar Engine
 *
 * Integrates crop calendar, weather data, and price data for
 * real-time agricultural decision-making. Provides:
 *
 *   - Crop suitability ranking (weather + price + season combined)
 *   - Best crop recommendations for current conditions
 *   - Seasonal comparison dashboard data
 *   - Decision support for planting/harvesting/spraying
 *
 * Consumes: cropCalendar.js, weatherService.js, cropPriceService.js
 */

import { CROP_CALENDAR, getCurrentCrops, getCurrentRiskAlerts } from "./cropCalendar.js";
import {
  scoreCropWeatherSuitability,
  forecastDiseasePressure,
  estimateIrrigationNeed,
  findSprayWindows,
  compareWithClimate,
} from "./weatherService.js";
import {
  simulateCurrentPrice,
  getAllCropPrices,
  compareCropProfitability,
  formatPriceBDT,
} from "./cropPriceService.js";

// ─── Main integration functions ───────────────────────────────────────────────

/**
 * Generate a comprehensive crop analysis combining calendar, weather, and price data.
 *
 * This is the primary function called by the CropCalendarDashboard component.
 *
 * @param {Object} params
 * @param {Object|null} params.forecast - Parsed forecast from parseForecast()
 * @param {Object|null} params.currentWeather - Current weather { temp, humidity, rain24h, windSpeed, uvIndex }
 * @param {number} params.month - Current month (1-12)
 * @returns {Object} Comprehensive analysis for all crops
 */
export function generateCropAnalysis({ forecast, currentWeather, month }) {
  const currentMonth = month || new Date().getMonth() + 1;

  // Get active crops from calendar
  const activeCrops = getCurrentCrops();

  // Get all crop prices
  const allPrices = getAllCropPrices(currentMonth);

  // Get profitability comparison
  const profitability = compareCropProfitability(currentMonth);

  // Get disease pressure from forecast
  const diseasePressure = forecastDiseasePressure(forecast);

  // Get climate comparison
  const climateComparison = compareWithClimate(currentWeather, currentMonth);

  // Get spray windows
  const sprayWindows = findSprayWindows(forecast);

  // Get risk alerts
  const riskAlerts = getCurrentRiskAlerts();

  // Build per-crop analysis
  const cropDetails = CROP_CALENDAR.map((crop) => {
    const priceData = simulateCurrentPrice(crop.crop, currentMonth);
    const weatherScore = scoreCropWeatherSuitability(crop.crop, forecast);
    const irrigation = estimateIrrigationNeed(crop.crop, forecast);
    const isActive = activeCrops.some((ac) => ac.crop === crop.crop);

    // Determine current season for this crop
    const activeSeasons = crop.seasons.filter((s) => s.months.includes(currentMonth));
    const currentSeason = activeSeasons[0] || null;

    // Combined recommendation score
    // Weight: weather 40%, price 30%, calendar relevance 30%
    const weatherNorm = weatherScore.score / 100;
    const priceNorm = priceData ? Math.min(1, (priceData.priceChangePercent + 20) / 40) : 0.5; // Normalise around 0

    // Hard cap: off-season crops must never compete with in-season crops.
    // calendarNorm = 1.0 if currently in season, 0.0 otherwise.
    // This prevents Rabi crops (mustard, potato) from appearing in Kharif recommendations.
    const calendarNorm = isActive ? 1 : 0;

    // Off-season crops get a hard ceiling of 35 regardless of weather/price score.
    // This keeps them out of top-N recommendation lists while still allowing them
    // to appear in the full crop calendar browse view.
    const rawScore = Math.round((weatherNorm * 0.4 + priceNorm * 0.3 + calendarNorm * 0.3) * 100);
    const combinedScore = isActive ? rawScore : Math.min(rawScore, 35);

    return {
      crop: crop.crop,
      cropEn: crop.cropEn,
      icon: crop.icon,
      color: crop.color,
      isActive,
      currentSeason,
      allSeasons: crop.seasons,
      price: priceData,
      weather: weatherScore,
      irrigation,
      combinedScore,
      recommendation: getRecommendationLabel(combinedScore),
    };
  });

  // Sort by combined score
  cropDetails.sort((a, b) => b.combinedScore - a.combinedScore);

  return {
    currentMonth,
    activeCrops,
    cropDetails,
    allPrices,
    profitability,
    diseasePressure,
    climateComparison,
    sprayWindows,
    riskAlerts,
    forecast,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get top N crop recommendations for planting right now.
 *
 * @param {Object} analysis - Result of generateCropAnalysis()
 * @param {number} n - Number of recommendations
 * @returns {Array<Object>} Top recommended crops with reasoning
 */
export function getTopRecommendations(analysis, n = 3) {
  if (!analysis?.cropDetails) return [];

  // Only recommend crops that are currently in season.
  // Off-season crops (mustard, potato in May etc.) must never appear here,
  // regardless of their weather or price scores.
  return analysis.cropDetails
    .filter((crop) => crop.isActive)
    .slice(0, n)
    .map((crop) => ({
      crop: crop.crop,
      cropEn: crop.cropEn,
      icon: crop.icon,
      combinedScore: crop.combinedScore,
      recommendation: crop.recommendation,
      reasons: buildRecommendationReasons(crop, analysis),
    }));
}

/**
 * Compare two specific crops side by side.
 *
 * @param {string} crop1Bn - Bengali name of first crop
 * @param {string} crop2Bn - Bengali name of second crop
 * @param {Object} analysis - Result of generateCropAnalysis()
 * @returns {Object|null} Side-by-side comparison
 */
export function compareCrops(crop1Bn, crop2Bn, analysis) {
  const c1 = analysis?.cropDetails?.find((c) => c.crop === crop1Bn);
  const c2 = analysis?.cropDetails?.find((c) => c.crop === crop2Bn);

  if (!c1 || !c2) return null;

  return {
    crops: [c1, c2],
    comparison: {
      weather: {
        crop1: c1.weather.score,
        crop2: c2.weather.score,
        winner: c1.weather.score >= c2.weather.score ? crop1Bn : crop2Bn,
        label: "আবহাওয়া উপযুক্ততা",
      },
      price: {
        crop1: c1.price?.price ?? 0,
        crop2: c2.price?.price ?? 0,
        trend1: c1.price?.trend ?? "stable",
        trend2: c2.price?.trend ?? "stable",
        winner: (c1.price?.price ?? 0) >= (c2.price?.price ?? 0) ? crop1Bn : crop2Bn,
        label: "বর্তমান মূল্য",
      },
      combined: {
        crop1: c1.combinedScore,
        crop2: c2.combinedScore,
        winner: c1.combinedScore >= c2.combinedScore ? crop1Bn : crop2Bn,
        label: "সামগ্রিক মূল্যায়ন",
      },
    },
  };
}

/**
 * Generate a seasonal advisory for a specific crop.
 *
 * Combines all available data into actionable advice for farmers.
 *
 * @param {string} cropBn - Bengali crop name
 * @param {Object} analysis - Result of generateCropAnalysis()
 * @returns {Object} Seasonal advisory
 */
export function generateSeasonalAdvisory(cropBn, analysis) {
  const cropDetail = analysis?.cropDetails?.find((c) => c.crop === cropBn);
  if (!cropDetail) return null;

  const advisories = [];

  // Weather advisory
  if (cropDetail.weather.score >= 70) {
    advisories.push({
      type: "weather",
      level: "good",
      icon: "☀️",
      title: "আবহাওয়া অনুকূল",
      text: `${cropBn} চাষের জন্য আবহাওয়া ভালো (স্কোর: ${cropDetail.weather.score}/100)`,
    });
  } else if (cropDetail.weather.score >= 45) {
    advisories.push({
      type: "weather",
      level: "caution",
      icon: "⚠️",
      title: "আবহাওয়া মাঝারি",
      text: `${cropBn} চাষের জন্য আবহাওয়া মাঝারি — অতিরিক্ত যত্ন প্রয়োজন`,
    });
  } else {
    advisories.push({
      type: "weather",
      level: "warning",
      icon: "🔴",
      title: "আবহাওয়া অনুপযুক্ত",
      text: `${cropBn} চাষের জন্য আবহাওয়া ভালো নয় (স্কোর: ${cropDetail.weather.score}/100)`,
    });
  }

  // Irrigation advisory
  if (cropDetail.irrigation.need === "critical") {
    advisories.push({
      type: "irrigation",
      level: "urgent",
      icon: "💧",
      title: "জরুরি সেচ প্রয়োজন",
      text: cropDetail.irrigation.advice,
    });
  } else if (cropDetail.irrigation.need === "moderate") {
    advisories.push({
      type: "irrigation",
      level: "caution",
      icon: "💧",
      title: "পরিমিত সেচ দিন",
      text: cropDetail.irrigation.advice,
    });
  }

  // Price advisory
  if (cropDetail.price?.trend === "up") {
    advisories.push({
      type: "price",
      level: "good",
      icon: "📈",
      title: "মূল্য বাড়ছে",
      text: `${cropBn} এর মূল্য বাড়ছে — ${formatPriceBDT(cropDetail.price.price)}/${cropDetail.price.unitBn}`,
    });
  } else if (cropDetail.price?.trend === "down") {
    advisories.push({
      type: "price",
      level: "caution",
      icon: "📉",
      title: "মূল্য কমছে",
      text: `${cropBn} এর মূল্য কমছে — মজুত করে রাখার কথা ভাবুন`,
    });
  }

  // Disease risk from calendar
  if (cropDetail.currentSeason?.keyDiseases?.length) {
    const diseases = cropDetail.currentSeason.keyDiseases.slice(0, 3);
    advisories.push({
      type: "disease",
      level: "caution",
      icon: "🦠",
      title: "রোগের ঝুঁকি",
      text: `এই মৌসুমের প্রধান রোগ: ${diseases.join(", ")}`,
    });
  }

  // Spray window
  if (analysis.sprayWindows?.length > 0) {
    const best = analysis.sprayWindows[0];
    advisories.push({
      type: "spray",
      level: "info",
      icon: "🧴",
      title: "স্প্রে করার সময়",
      text: `${best.dayOfWeek}: ${best.window} (${best.quality === "excellent" ? "চমৎকার" : best.quality === "good" ? "ভালো" : "মোটামুটি"})`,
    });
  }

  return {
    crop: cropBn,
    icon: cropDetail.icon,
    currentSeason: cropDetail.currentSeason,
    advisories,
    overallScore: cropDetail.combinedScore,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getRecommendationLabel(score) {
  if (score >= 75) return "বাগানে যান! 🌱";
  if (score >= 60) return "ভালো সময় ✅";
  if (score >= 45) return "সতর্কতার সাথে ⚠️";
  if (score >= 30) return "অনুপযুক্ত ❌";
  return "এড়িয়ে চলুন 🚫";
}

function buildRecommendationReasons(crop, _analysis) {
  const reasons = [];

  if (crop.isActive) {
    reasons.push("✅ এই মৌসুমে চাষ হচ্ছে");
  }

  if (crop.weather.score >= 65) {
    reasons.push(`☀️ আবহাওয়া অনুকূল (${crop.weather.score}/100)`);
  }

  if (crop.price?.trend === "up") {
    reasons.push(`📈 মূল্য বাড়ছে`);
  }

  if (crop.price?.isPeakSeason) {
    reasons.push("🌾 ফসল তোলার মৌসুম");
  }

  if (crop.irrigation.need === "none" || crop.irrigation.need === "low") {
    reasons.push("💧 সেচের প্রয়োজন কম");
  }

  if (reasons.length === 0) {
    reasons.push("ℹ️ বিস্তারিত দেখুন");
  }

  return reasons;
}
