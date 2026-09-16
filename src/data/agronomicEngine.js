/**
 * Agronomic Rule Engine
 *
 * Scores disease likelihood based on season, crop, growth stage, and weather
 * conditions. Imports from existing crop data modules and exports functions
 * consumed by the diagnosis pipeline.
 *
 * Scoring philosophy:
 *   - Season score reflects whether a disease's known season is currently active.
 *   - Weather score reflects how well current conditions match the pathogen type.
 *   - Ensemble score combines symptom matching with season + weather signals.
 */

import { CROP_CALENDAR, getCurrentRiskAlerts } from "./cropCalendar.js";
import { CROP_DISEASES } from "./cropDiseases.js";

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Normalise season names from CROP_CALENDAR so they match CROP_DISEASES keys.
 * "Kharif-1" and "Kharif-2" both map to "Kharif".
 *
 * @param {string} nameEn - Season name in English from CROP_CALENDAR
 * @returns {string} Normalised name matching CROP_DISEASES conventions
 */
function normaliseSeasonName(nameEn) {
  if (nameEn === "Kharif-1" || nameEn === "Kharif-2") return "Kharif";
  return nameEn; // Boro, Aman, Aus, Rabi, Year-round
}

/**
 * Build a crop-specific mapping from normalised season name to the months
 * that season covers for that particular crop.
 *
 * This is important because different crops have different month ranges
 * for the same season name. For example, Mango's Kharif-1 covers months
 * [2,3,4,5,6,7] while Jute's Kharif-1 covers [3,4,5,6,7].
 *
 * @param {string} cropKey - Bengali crop name, e.g. 'ধান'
 * @returns {Object<string, Set<number>>} e.g. { Boro: Set{12,1,2,3,4}, ... }
 */
function buildCropSeasonMonthMap(cropKey) {
  const cropEntry = CROP_CALENDAR.find((c) => c.crop === cropKey);
  if (!cropEntry) return {};

  const map = {};
  for (const season of cropEntry.seasons) {
    const key = normaliseSeasonName(season.nameEn);
    if (!map[key]) {
      map[key] = new Set();
    }
    for (const m of season.months) {
      map[key].add(m);
    }
  }
  return map;
}

/**
 * Return the months that belong to the seasons listed in a disease's
 * `season` array, scoped to a specific crop's calendar.
 *
 * @param {string} cropKey - Bengali crop name
 * @param {string[]} diseaseSeasons - e.g. ['Boro', 'Aman']
 * @returns {Set<number>}
 */
function getMonthsForDiseaseSeasons(cropKey, diseaseSeasons) {
  const cropSeasonMap = buildCropSeasonMonthMap(cropKey);
  const months = new Set();

  for (const s of diseaseSeasons) {
    const monthSet = cropSeasonMap[s];
    if (monthSet) {
      for (const m of monthSet) {
        months.add(m);
      }
    }
  }
  return months;
}

/**
 * Check whether `month` is within ±delta of any month in the given set,
 * handling year wrap-around (12 ↔ 1).
 *
 * @param {number} month - Current month (1-12)
 * @param {Set<number>} monthSet - Months to compare against
 * @param {number} delta - Allowed distance (0 = exact, 1 = ±1 month)
 * @returns {boolean}
 */
function isMonthNear(month, monthSet, delta) {
  for (const m of monthSet) {
    // Direct distance (handles wrap-around via modular arithmetic)
    const d = Math.abs(month - m);
    const wrapped = 12 - d;
    if (Math.min(d, wrapped) <= delta) {
      return true;
    }
  }
  return false;
}

/**
 * Clamp a value between min and max.
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ─── Exported functions ──────────────────────────────────────────────────────

/**
 * Score each disease for a crop by how well the current month aligns with
 * the disease's known season(s).
 *
 * @param {string} cropKey - Bengali crop name, e.g. 'ধান'
 * @param {number} month   - Current month (1 = January … 12 = December)
 * @returns {Array<{diseaseName: string, seasonScore: number}>}
 *   seasonScore: 1.0 = in-season, 0.5 = ±1 month, 0.2 = off-season
 */
export function scoreDiseasesBySeason(cropKey, month) {
  const cropData = CROP_DISEASES[cropKey];
  if (!cropData) return [];

  return cropData.diseases.map((disease) => {
    const seasonMonths = getMonthsForDiseaseSeasons(cropKey, disease.season);

    // Year-round diseases are always in season
    if (disease.season.includes("Year-round")) {
      return { diseaseName: disease.name, seasonScore: 1.0 };
    }

    let seasonScore = 0.2; // baseline: off-season

    if (seasonMonths.size === 0) {
      // Unknown season — give neutral score
      seasonScore = 0.2;
    } else if (seasonMonths.has(month)) {
      seasonScore = 1.0;
    } else if (isMonthNear(month, seasonMonths, 1)) {
      seasonScore = 0.5;
    }

    return { diseaseName: disease.name, seasonScore };
  });
}

/**
 * Score each disease for a crop by how well current weather conditions
 * favour the pathogen type.
 *
 * Scoring rules by cause type:
 *   - Fungal:   high when humidity > 80% AND temp 25-35°C
 *   - Bacterial: high when humidity > 85% AND rain > 20 mm
 *   - Viral:    high when temp < 25°C (aphid/leafhopper vectors) or temp > 30°C (whitefly)
 *   - Insect:   high when temp > 28°C AND humidity 40-80%
 *   - Nutrient: high when rain24h > 50 mm (leaching) or rain24h === 0 (drought stress)
 *
 * Each rule produces a 0-1 score with gradual transitions rather than
 * hard thresholds, making the engine more forgiving of borderline data.
 *
 * @param {string} cropKey - Bengali crop name
 * @param {{temp: number, humidity: number, rain24h: number, windSpeed: number}} weather
 * @returns {Array<{diseaseName: string, weatherScore: number}>}
 */
export function scoreDiseasesByWeather(cropKey, weather) {
  const cropData = CROP_DISEASES[cropKey];
  if (!cropData) return [];

  const { temp = 25, humidity = 50, rain24h = 0 } = weather || {};

  return cropData.diseases.map((disease) => {
    let score = 0;

    switch (disease.cause) {
      case "fungal": {
        // Fungal diseases thrive in warm, humid conditions
        const humScore =
          humidity > 80
            ? clamp((humidity - 80) / 20, 0, 1) // 80→0, 100→1
            : 0;
        const tempScore =
          temp >= 25 && temp <= 35
            ? 1 - Math.abs(temp - 30) / 5 // peaks at 30°C
            : 0;
        score = Math.max(humScore * 0.6 + tempScore * 0.4, humScore > 0 ? 0.3 : 0);
        break;
      }

      case "bacterial": {
        // Bacterial diseases need high humidity + rain splash
        const humScore = humidity > 85 ? clamp((humidity - 85) / 15, 0, 1) : 0;
        const rainScore =
          rain24h > 20
            ? clamp((rain24h - 20) / 30, 0, 1) // 20→0, 50→1
            : 0;
        score = Math.max(humScore * 0.4 + rainScore * 0.6, humScore > 0 && rainScore > 0 ? 0.5 : 0);
        break;
      }

      case "viral": {
        // Viral diseases spread via vectors:
        //   Cool temps (<25°C): aphids & leafhoppers active
        //   Hot temps (>30°C):  whitefly active
        if (temp < 25) {
          score = clamp((25 - temp) / 10, 0.2, 1); // 25→0.2, 15→1
        } else if (temp > 30) {
          score = clamp((temp - 30) / 5, 0.2, 1); // 30→0.2, 35→1
        } else {
          score = 0.2; // moderate temp — low vector pressure
        }
        break;
      }

      case "insect": {
        // Insect pests favour warm conditions with moderate humidity
        const tempScore =
          temp > 28
            ? clamp((temp - 28) / 7, 0, 1) // 28→0, 35→1
            : 0;
        const humOk = humidity >= 40 && humidity <= 80 ? 1 : 0.3;
        score = tempScore * 0.7 + humOk * 0.3;
        break;
      }

      case "nutrient": {
        // Nutrient deficiencies: heavy rain leaches nutrients; drought
        // limits uptake
        if (rain24h > 50) {
          score = clamp((rain24h - 50) / 50, 0.5, 1); // 50→0.5, 100→1
        } else if (rain24h === 0) {
          score = 0.6; // dry stress
        } else {
          score = 0.15; // moderate rain — low deficiency risk
        }
        break;
      }

      default:
        score = 0.1; // unknown cause type — minimal score
    }

    score = clamp(score, 0, 1);

    return { diseaseName: disease.name, weatherScore: parseFloat(score.toFixed(3)) };
  });
}

/**
 * Get current risk alerts filtered for a specific crop.
 *
 * @param {string} cropKey - Bengali crop name
 * @returns {Array<Object>} Alerts from getCurrentRiskAlerts matching the crop
 */
export function getRiskAlertsForCrop(cropKey) {
  const allAlerts = getCurrentRiskAlerts();
  return allAlerts.filter((alert) => alert.crop === cropKey);
}

/**
 * Compute an ensemble score combining symptom matching, season, and weather
 * signals for each candidate disease.
 *
 * Formula:
 *   combinedScore = 0.50 × symptomScore + 0.25 × seasonScore + 0.25 × weatherScore
 *
 * @param {string} cropKey - Bengali crop name
 * @param {Array<{disease: string, matchRatio: number}>} symptomMatches
 *   Result of matchDiseasesBySymptoms; each entry has a disease name and
 *   a matchRatio (0-1).
 * @param {{temp: number, humidity: number, rain24h: number, windSpeed: number}} weather
 * @param {number} month - Current month (1-12)
 * @returns {Array<{disease: string, combinedScore: number, symptomScore: number,
 *           seasonScore: number, weatherScore: number}>}
 *   Sorted by combinedScore descending.
 */
export function computeEnsembleScore(cropKey, symptomMatches, weather, month) {
  if (!CROP_DISEASES[cropKey]) return [];

  // Build lookup maps from the season and weather scorers
  const seasonScores = scoreDiseasesBySeason(cropKey, month);
  const weatherScores = scoreDiseasesByWeather(cropKey, weather);

  const seasonMap = Object.fromEntries(seasonScores.map((s) => [s.diseaseName, s.seasonScore]));
  const weatherMap = Object.fromEntries(weatherScores.map((w) => [w.diseaseName, w.weatherScore]));

  // Build a symptom map — default to 0 for diseases not matched by symptoms
  const symptomMap = Object.fromEntries(symptomMatches.map((m) => [m.disease, m.matchRatio]));

  // Score every disease in the crop's database
  const results = CROP_DISEASES[cropKey].diseases.map((disease) => {
    const symptomScore = symptomMap[disease.name] ?? 0;
    const seasonScore = seasonMap[disease.name] ?? 0.2;
    const weatherScore = weatherMap[disease.name] ?? 0;

    const combinedScore = 0.5 * symptomScore + 0.25 * seasonScore + 0.25 * weatherScore;

    return {
      disease: disease.name,
      combinedScore: parseFloat(combinedScore.toFixed(3)),
      symptomScore: parseFloat(symptomScore.toFixed(3)),
      seasonScore: parseFloat(seasonScore.toFixed(3)),
      weatherScore: parseFloat(weatherScore.toFixed(3)),
    };
  });

  // Sort descending by combined score
  results.sort((a, b) => b.combinedScore - a.combinedScore);

  return results;
}

/**
 * Produce a weather risk summary with an overall risk level, a list of
 * specific risk items, and spray-condition guidance.
 *
 * Re-implements the assessWeatherRisks and getSprayingCondition logic from
 * App.jsx as a reusable, structured module.
 *
 * @param {{temp: number, humidity: number, rain24h: number,
 *          windSpeed: number, uvIndex?: number}} weather
 * @returns {{level: 'low'|'medium'|'high', risks: Array<{level:string,text:string}>,
 *            sprayCondition: {ok:boolean, reason:string, until:?string}}}
 */
export function getWeatherRiskSummary(weather) {
  const risks = [];

  if (!weather) {
    return {
      level: "low",
      risks: [{ level: "low", text: "No weather data available" }],
      sprayCondition: { ok: true, reason: "No weather data — proceed with caution", until: null },
    };
  }

  const { temp = 25, humidity = 50, rain24h = 0, windSpeed = 0, uvIndex = 0 } = weather;

  // ── Risk rules (mirrors assessWeatherRisks from App.jsx) ──

  if (humidity >= 80 && temp >= 26 && temp <= 36) {
    risks.push({
      level: "high",
      text: "Blast & Sheath Blight risk is high (warm & humid)",
    });
  }

  if (rain24h >= 50) {
    risks.push({
      level: "high",
      text: "Stem borer & root rot risk is high (heavy rain)",
    });
  }

  if (rain24h === 0 && humidity < 55) {
    risks.push({
      level: "medium",
      text: "Mite & thrips risk (dry conditions)",
    });
  }

  if (temp < 20) {
    risks.push({
      level: "medium",
      text: "Tungro virus risk (cool weather — vector active)",
    });
  }

  if (humidity >= 85) {
    risks.push({
      level: "high",
      text: "Bacterial blight risk is high (very humid)",
    });
  }

  // Default low-risk message if nothing triggered
  if (risks.length === 0) {
    risks.push({ level: "low", text: "Weather is normal — low disease pressure" });
  }

  // ── Determine overall level ──

  const hasHigh = risks.some((r) => r.level === "high");
  const hasMedium = risks.some((r) => r.level === "medium");
  const level = hasHigh ? "high" : hasMedium ? "medium" : "low";

  // ── Spray condition (mirrors getSprayingCondition from App.jsx) ──

  let sprayCondition;

  if (windSpeed > 20) {
    sprayCondition = {
      ok: false,
      reason: `Wind speed is too high (${windSpeed} km/h)`,
      until: "Wait until wind subsides",
    };
  } else if (rain24h > 5) {
    sprayCondition = {
      ok: false,
      reason: "Rain is likely",
      until: "Wait until rain stops",
    };
  } else if (temp > 38) {
    sprayCondition = {
      ok: false,
      reason: "Temperature is too high",
      until: "Spray in the evening",
    };
  } else if (uvIndex > 8) {
    sprayCondition = {
      ok: false,
      reason: "UV index is too high",
      until: "Spray in the evening",
    };
  } else {
    sprayCondition = {
      ok: true,
      reason: "Conditions are suitable for spraying",
      until: null,
    };
  }

  return { level, risks, sprayCondition };
}
