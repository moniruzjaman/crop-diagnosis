import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetch7DayForecast,
  parseForecast,
  forecastDiseasePressure,
  estimateIrrigationNeed,
  findSprayWindows,
  compareWithClimate,
  scoreCropWeatherSuitability,
  getCropTempRange,
} from "../data/weatherService";
import {
  simulateCurrentPrice,
  getAllCropPrices,
  compareCropProfitability,
  formatPriceBDT,
  getTrendDisplay,
  adjustPriceForDistrict,
  analyzeWeatherPriceImpact,
  forecastCropPrices,
} from "../data/cropPriceService";
import { generateCropAnalysis, getTopRecommendations, generateSeasonalAdvisory } from "../data/enhancedCropCalendar";
import { CROP_CALENDAR, GREGORIAN_MONTHS } from "../data/cropCalendar";
import {
  BANGLADESH_DISTRICTS,
  getDivisions,
  getDistrictsByDivision,
  findNearestDistrict,
  getDistrictById,
} from "../data/bangladeshDistricts";
import { getUpazilasByDistrict } from "../data/upazilas";

/**
 * CropCalendarDashboard — Real-time weather + price comparison
 *
 * Features:
 *   - 7-day weather forecast with crop impact
 *   - Live crop prices with trend indicators
 *   - Side-by-side crop comparison
 *   - Weather-price correlation insights
 *   - 30-day price forecast
 *   - District-specific pricing & weather
 *   - Disease pressure forecast
 *   - Climate anomaly detection
 *   - Top crop recommendations
 */
export default function CropCalendarDashboard({ C, weather, coords, locationName }) {
  const [activeView, setActiveView] = useState("overview"); // overview | forecast | prices | compare | insights | advisory
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [compareCrops, setCompareCrops] = useState(["ধান", "আলু"]);
  const [selectedAdvisoryCrop, setSelectedAdvisoryCrop] = useState("ধান");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [districtSearch, setDistrictSearch] = useState("");
  const [priceForecastCrop, setPriceForecastCrop] = useState("ধান");
  const [damRefreshing, setDamRefreshing] = useState(false);
  const [priceSource, setPriceSource] = useState("estimated"); // 'live_dam' | 'estimated' | 'unavailable'
  const [_damPrices, setDamPrices] = useState(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = GREGORIAN_MONTHS[currentMonth - 1];

  // Auto-detect district from coordinates
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (coords?.lat && coords?.lon && !selectedDistrict) {
      const nearest = findNearestDistrict(coords.lat, coords.lon);
      if (nearest) {
        setSelectedDistrict(nearest.id);
        setSelectedDivision(nearest.division);
      }
    }
  }, [coords, selectedDistrict]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Get current district data
  const districtData = useMemo(() => {
    return selectedDistrict ? getDistrictById(selectedDistrict) : null;
  }, [selectedDistrict]);

  // Fetch 7-day forecast with district coordinates
  const loadForecast = useCallback(async () => {
    const lat = districtData?.lat || coords?.lat || 23.685;
    const lon = districtData?.lon || coords?.lon || 90.356;
    setForecastLoading(true);
    try {
      const raw = await fetch7DayForecast(lat, lon);
      setForecast(parseForecast(raw));
    } catch {}
    setForecastLoading(false);
  }, [coords, districtData]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadForecast();
  }, [loadForecast]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Generate comprehensive analysis with district pricing
  const analysis = useMemo(() => {
    return generateCropAnalysis({
      forecast,
      currentWeather: weather,
      month: currentMonth,
    });
  }, [forecast, weather, currentMonth]);

  // District-adjusted prices
  const districtPrices = useMemo(() => {
    const prices = getAllCropPrices(currentMonth);
    if (!districtData) return prices;
    return prices.map((p) => adjustPriceForDistrict(p, selectedDistrict, districtData));
  }, [currentMonth, districtData, selectedDistrict]);

  // Get top recommendations
  const topRecs = useMemo(() => getTopRecommendations(analysis, 3), [analysis]);

  // Disease pressure
  const diseasePressure = useMemo(() => forecastDiseasePressure(forecast), [forecast]);

  // Spray windows
  const sprayWindows = useMemo(() => findSprayWindows(forecast), [forecast]);

  // Climate comparison
  const climateComparison = useMemo(() => compareWithClimate(weather, currentMonth), [weather, currentMonth]);

  // Profitability data
  const profitability = useMemo(() => compareCropProfitability(currentMonth), [currentMonth]);

  // Weather-price insights for all crops
  const weatherPriceInsights = useMemo(() => {
    if (!forecast?.days?.length) return [];
    return CROP_CALENDAR.map((crop) => {
      const priceData = simulateCurrentPrice(crop.crop, currentMonth);
      const impact = analyzeWeatherPriceImpact(forecast, crop.crop, priceData);
      return {
        crop: crop.crop,
        cropEn: crop.cropEn,
        icon: crop.icon,
        color: crop.color,
        impact,
        price: priceData,
      };
    }).sort((a, b) => Math.abs(b.impact.impactScore) - Math.abs(a.impact.impactScore));
  }, [forecast, currentMonth]);

  // Price forecast for selected crop
  const priceForecastData = useMemo(() => {
    return forecastCropPrices(priceForecastCrop, currentMonth, forecast);
  }, [priceForecastCrop, currentMonth, forecast]);

  // Divisions for district selector
  const divisions = useMemo(() => getDivisions(), []);

  // Filtered districts for search
  const filteredDistricts = useMemo(() => {
    let districts = selectedDivision ? getDistrictsByDivision(selectedDivision) : BANGLADESH_DISTRICTS;
    if (districtSearch) {
      const q = districtSearch.toLowerCase();
      districts = districts.filter(
        (d) => d.name.includes(districtSearch) || d.nameEn.toLowerCase().includes(q) || d.id.includes(q),
      );
    }
    return districts;
  }, [selectedDivision, districtSearch]);

  // Upazilas for selected district
  const districtUpazilas = useMemo(() => {
    if (!selectedDistrict) return [];
    return getUpazilasByDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // DAM price refresh handler
  const refreshDAMPrices = useCallback(async () => {
    setDamRefreshing(true);
    try {
      const res = await fetch("/api/dam-scraper?mode=ticker");
      const data = await res.json();
      if (data.source === "live_dam" || data.source === "dam_ticker") {
        setDamPrices(data.prices || data.ticker || null);
        setPriceSource("live_dam");
      } else {
        setPriceSource("unavailable");
      }
    } catch {
      setPriceSource("unavailable");
    }
    setDamRefreshing(false);
  }, []);

  // ─── Styles ────────────────────────────────────────────────────────────────

  const cardStyle = {
    background: C.bgCard,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    boxShadow: C.shadow,
    overflow: "hidden",
  };

  const sectionTitle = {
    fontSize: 11,
    fontWeight: 700,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  };

  const tabStyle = (active) => ({
    padding: "8px 14px",
    borderRadius: 12,
    border: `1.5px solid ${active ? C.primary : C.border}`,
    background: active ? C.primary + "15" : C.bgCard,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? C.primary : C.textMuted,
    whiteSpace: "nowrap",
    transition: "all .2s",
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Header with district selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>ফসল ক্যালেন্ডার + আবহাওয়া + মূল্য</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            {currentMonthName?.bn} {currentMonthName?.en} •{" "}
            {districtData ? `${districtData.name} (${districtData.nameEn})` : locationName || "Bangladesh"}
          </div>
        </div>
        <button
          onClick={loadForecast}
          disabled={forecastLoading}
          style={{
            padding: "6px 12px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.bgCard,
            cursor: "pointer",
            fontSize: 11,
            color: C.primary,
            fontWeight: 600,
            opacity: forecastLoading ? 0.5 : 1,
          }}
        >
          {forecastLoading ? "⏳" : "🔄"} রিফ্রেশ
        </button>
      </div>

      {/* District selector */}
      <div style={{ ...cardStyle, padding: "10px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>জেলা নির্বাচন</span>
          {districtData?.majorCrops && (
            <span style={{ fontSize: 9, color: C.textLight, marginLeft: "auto" }}>
              প্রধান ফসল: {districtData.majorCrops.slice(0, 3).join(", ")}
            </span>
          )}
        </div>
        {/* Division tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 6, overflowX: "auto", paddingBottom: 2 }}>
          <button
            onClick={() => {
              setSelectedDivision(null);
              setDistrictSearch("");
            }}
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              fontSize: 10,
              border: `1px solid ${!selectedDivision ? C.primary : C.border}`,
              background: !selectedDivision ? C.primary + "15" : "transparent",
              color: !selectedDivision ? C.primary : C.textMuted,
              fontWeight: !selectedDivision ? 700 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            সব
          </button>
          {divisions.map((div) => (
            <button
              key={div.id}
              onClick={() => {
                setSelectedDivision(div.id);
                setDistrictSearch("");
              }}
              style={{
                padding: "4px 8px",
                borderRadius: 8,
                fontSize: 10,
                border: `1px solid ${selectedDivision === div.id ? C.primary : C.border}`,
                background: selectedDivision === div.id ? C.primary + "15" : "transparent",
                color: selectedDivision === div.id ? C.primary : C.textMuted,
                fontWeight: selectedDivision === div.id ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {div.name}
            </button>
          ))}
        </div>
        {/* District selector dropdown */}
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="text"
            placeholder="জেলা খুঁজুন..."
            value={districtSearch}
            onChange={(e) => setDistrictSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.bgMuted,
              color: C.text,
              fontSize: 12,
              outline: "none",
            }}
          />
          <select
            value={selectedDistrict || ""}
            onChange={(e) => setSelectedDistrict(e.target.value || null)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.bgCard,
              color: C.text,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <option value="">স্বয়ংক্রিয়</option>
            {filteredDistricts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.nameEn})
              </option>
            ))}
          </select>
        </div>
        {/* Upazila chips for selected district */}
        {districtUpazilas.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
            {districtUpazilas.slice(0, 8).map((u) => (
              <span
                key={u.id}
                style={{
                  fontSize: 9,
                  padding: "2px 7px",
                  borderRadius: 6,
                  background: C.bgMuted,
                  color: C.textMuted,
                  fontWeight: 500,
                }}
              >
                {u.name}
              </span>
            ))}
            {districtUpazilas.length > 8 && (
              <span style={{ fontSize: 9, color: C.textLight }}>+{districtUpazilas.length - 8} আরও</span>
            )}
          </div>
        )}
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {[
          { key: "overview", label: "🏠 ওভারভিউ" },
          { key: "forecast", label: "🌤️ পূর্বাভাস" },
          { key: "prices", label: "💰 মূল্য" },
          { key: "insights", label: "🔮 প্রভাব" },
          { key: "compare", label: "⚖️ তুলনা" },
          { key: "advisory", label: "📋 পরামর্শ" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveView(tab.key)} style={tabStyle(activeView === tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW VIEW ────────────────────────────────────────────── */}
      {activeView === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Quick stats row */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              {
                icon: "🌡️",
                label: "তাপমাত্রা",
                value: weather ? `${weather.temp}°C` : "--",
                sub:
                  climateComparison?.temp?.status === "hotter"
                    ? "গড়ের চেয়ে বেশি"
                    : climateComparison?.temp?.status === "cooler"
                      ? "গড়ের চেয়ে কম"
                      : "স্বাভাবিক",
                color:
                  climateComparison?.temp?.status === "hotter"
                    ? "#dc2626"
                    : climateComparison?.temp?.status === "cooler"
                      ? "#2563eb"
                      : C.primary,
              },
              {
                icon: "💧",
                label: "আর্দ্রতা",
                value: weather ? `${weather.humidity}%` : "--",
                sub:
                  climateComparison?.humidity?.status === "wetter"
                    ? "গড়ের চেয়ে বেশি"
                    : climateComparison?.humidity?.status === "drier"
                      ? "গড়ের চেয়ে কম"
                      : "স্বাভাবিক",
                color: C.primary,
              },
              {
                icon: "🌧️",
                label: "বৃষ্টি",
                value: weather ? `${weather.rain24h}mm` : "--",
                sub:
                  climateComparison?.rain?.status === "heavy"
                    ? "ভারী বৃষ্টি"
                    : climateComparison?.rain?.status === "dry_season"
                      ? "শুষ্ক মৌসুম"
                      : "স্বাভাবিক",
                color: "#2563eb",
              },
            ].map((stat) => (
              <div key={stat.label} style={{ ...cardStyle, flex: 1, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 9, color: C.textLight, marginTop: 1 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* District price snapshot */}
          {districtData && (
            <div style={{ ...cardStyle, padding: "12px 16px" }}>
              <div style={sectionTitle}>
                📍 {districtData.name} ({districtData.nameEn}) — মূল্য স্ন্যাপশট
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {districtPrices.slice(0, 5).map((p) => {
                  const trendInfo = getTrendDisplay(p.trend);
                  const cropEntry = CROP_CALENDAR.find((c) => c.crop === p.crop);
                  return (
                    <div
                      key={p.crop}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        flex: "1 1 80px",
                        background: C.bgMuted,
                        textAlign: "center",
                        minWidth: 80,
                      }}
                    >
                      <div style={{ fontSize: 16 }}>{cropEntry?.icon || "🌾"}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{formatPriceBDT(p.price)}</div>
                      <div style={{ fontSize: 9, color: C.textMuted }}>{p.crop}</div>
                      <div style={{ fontSize: 9, color: trendInfo.color, fontWeight: 600 }}>
                        {trendInfo.icon} {p.priceChangePercent > 0 ? "+" : ""}
                        {p.priceChangePercent}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top recommendations */}
          <div style={{ ...cardStyle, padding: "12px 16px" }}>
            <div style={sectionTitle}>🌱 শীর্ষ ফসল সুপারিশ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topRecs.map((rec, i) => (
                <div
                  key={rec.crop}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: i === 0 ? C.primary + "0a" : C.bgMuted,
                    border: `1px solid ${i === 0 ? C.primary + "33" : "transparent"}`,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{rec.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{rec.crop}</span>
                      <span style={{ fontSize: 11, color: C.textLight }}>({rec.cropEn})</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
                      {rec.reasons.map((r, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 8,
                            background: C.bgMuted,
                            color: C.textMuted,
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: rec.combinedScore >= 60 ? C.primary : C.textMuted,
                      }}
                    >
                      {rec.combinedScore}
                    </div>
                    <div style={{ fontSize: 9, color: C.textLight }}>স্কোর</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather-price insight quick */}
          {weatherPriceInsights.length > 0 && weatherPriceInsights.some((w) => w.impact.impactScore !== 0) && (
            <div style={{ ...cardStyle, padding: "12px 16px" }}>
              <div style={sectionTitle}>🔮 আবহাওয়া-মূল্য প্রভাব (দ্রুত দেখুন)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {weatherPriceInsights
                  .filter((w) => w.impact.impactScore !== 0)
                  .slice(0, 4)
                  .map((wi) => (
                    <div
                      key={wi.crop}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background:
                          wi.impact.impact === "price_up"
                            ? "#fef2f2"
                            : wi.impact.impact === "price_down"
                              ? "#f0fdf4"
                              : C.bgMuted,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{wi.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text, width: 50 }}>{wi.crop}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
                          {wi.impact.insights[0]?.title}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 8,
                          background:
                            wi.impact.impact === "price_up"
                              ? "#fee2e2"
                              : wi.impact.impact === "price_down"
                                ? "#dcfce7"
                                : C.bgMuted,
                          color:
                            wi.impact.impact === "price_up"
                              ? "#991b1b"
                              : wi.impact.impact === "price_down"
                                ? "#166534"
                                : C.textMuted,
                        }}
                      >
                        {wi.impact.priceDirectionBn}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Disease pressure quick view */}
          {diseasePressure.length > 0 && (
            <div style={{ ...cardStyle, padding: "12px 16px" }}>
              <div style={sectionTitle}>🦠 রোগের চাপ (পূর্বাভাস)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {diseasePressure.slice(0, 3).map((dp, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: dp.pressure === "high" ? "#fef2f2" : dp.pressure === "medium" ? "#fffbeb" : "#f0fdf4",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          dp.pressure === "high" ? "#dc2626" : dp.pressure === "medium" ? "#d97706" : "#16a34a",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{dp.disease}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{dp.reason}</div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 8,
                        background:
                          dp.pressure === "high" ? "#fee2e2" : dp.pressure === "medium" ? "#fef3c7" : "#dcfce7",
                        color: dp.pressure === "high" ? "#991b1b" : dp.pressure === "medium" ? "#92400e" : "#166534",
                      }}
                    >
                      {dp.pressure === "high" ? "উচ্চ" : dp.pressure === "medium" ? "মাঝারি" : "কম"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spray window quick */}
          {sprayWindows.length > 0 && (
            <div style={{ ...cardStyle, padding: "12px 16px" }}>
              <div style={sectionTitle}>🧴 স্প্রে উইন্ডো</div>
              <div style={{ display: "flex", gap: 8 }}>
                {sprayWindows.slice(0, 3).map((sw, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background:
                        sw.quality === "excellent" ? "#f0fdf4" : sw.quality === "good" ? "#eff6ff" : "#fffbeb",
                      border: `1px solid ${
                        sw.quality === "excellent" ? "#86efac" : sw.quality === "good" ? "#93c5fd" : "#fde047"
                      }`,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{sw.dayOfWeek}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>
                      {sw.quality === "excellent" ? "চমৎকার" : sw.quality === "good" ? "ভালো" : "মোটামুটি"}
                    </div>
                    <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>
                      🌧️{sw.rainProb}% 💨{sw.windMax}km/h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── FORECAST VIEW ─────────────────────────────────────────────── */}
      {activeView === "forecast" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {forecastLoading && !forecast && (
            <div style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 13 }}>
              ⏳ ৭ দিনের পূর্বাভাস আনা হচ্ছে...
            </div>
          )}

          {forecast?.days && (
            <>
              {/* Weekly summary */}
              <div style={{ ...cardStyle, padding: "12px 16px" }}>
                <div style={sectionTitle}>📊 সাপ্তাহিক সারসংক্ষেপ {districtData ? `— ${districtData.name}` : ""}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>{forecast.weekAvgTemp}°C</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>গড় তাপমাত্রা</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb" }}>{forecast.weekRainTotal}mm</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>মোট বৃষ্টি</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>{forecast.weekAvgHumidity}%</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>গড় আর্দ্রতা</div>
                  </div>
                </div>
              </div>

              {/* 7-day daily cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {forecast.days.map((day, i) => (
                  <div
                    key={day.date}
                    style={{
                      ...cardStyle,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderLeft: i === 0 ? `3px solid ${C.primary}` : `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ width: 50, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? C.primary : C.text }}>
                        {day.dayOfWeek}
                      </div>
                      <div style={{ fontSize: 10, color: C.textLight }}>
                        {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flex: 1, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", minWidth: 48 }}>
                        {day.tempMax}°/{day.tempMin}°
                      </span>
                      <span style={{ fontSize: 11, color: "#2563eb", minWidth: 36 }}>💧{day.rain}mm</span>
                      <span style={{ fontSize: 11, color: C.textMuted, minWidth: 28 }}>{day.humidity}%</span>
                      <span style={{ fontSize: 11, color: C.textMuted, minWidth: 28 }}>💨{day.windMax}</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>☀️{day.uvMax}</span>
                    </div>

                    <div style={{ width: 60, flexShrink: 0 }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 2 }}>বৃষ্টি {day.rainProb}%</div>
                      <div style={{ height: 4, borderRadius: 2, background: C.bgMuted, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 2,
                            width: `${day.rainProb}%`,
                            background: day.rainProb > 60 ? "#2563eb" : day.rainProb > 30 ? "#60a5fa" : "#bfdbfe",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-crop weather suitability */}
              <div style={{ ...cardStyle, padding: "12px 16px" }}>
                <div style={sectionTitle}>🌾 ফসলভিত্তিক আবহাওয়া উপযুক্ততা</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {CROP_CALENDAR.map((crop) => {
                    const score = scoreCropWeatherSuitability(crop.crop, forecast);
                    const tempRange = getCropTempRange(crop.crop);
                    return (
                      <div
                        key={crop.crop}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: C.bgMuted,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{crop.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.text, width: 48 }}>{crop.crop}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: C.bgCard, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 4,
                              width: `${score.score}%`,
                              background: score.score >= 70 ? "#16a34a" : score.score >= 45 ? "#d97706" : "#dc2626",
                              transition: "width .5s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            minWidth: 32,
                            textAlign: "right",
                            color: score.score >= 70 ? "#16a34a" : score.score >= 45 ? "#d97706" : "#dc2626",
                          }}
                        >
                          {score.score}
                        </span>
                        <span style={{ fontSize: 10, color: C.textMuted, minWidth: 48 }}>{score.label}</span>
                        {tempRange && (
                          <span style={{ fontSize: 9, color: C.textLight, minWidth: 60, textAlign: "right" }}>
                            {tempRange.min}-{tempRange.max}°C
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {!forecast && !forecastLoading && (
            <div style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>
                পূর্বাভাস তথ্য লোড করতে রিফ্রেশ করুন
              </div>
              <button
                onClick={loadForecast}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: C.primary,
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                🌤️ পূর্বাভাস আনুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── PRICES VIEW ───────────────────────────────────────────────── */}
      {activeView === "prices" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* District price label */}
          {districtData && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                background: C.primary + "0a",
                border: `1px solid ${C.primary}22`,
                fontSize: 12,
                color: C.primary,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                📍 {districtData.name} ({districtData.nameEn}) — বাজার: {districtData.markets?.[0] || "স্থানীয়"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontSize: 9,
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontWeight: 700,
                    background:
                      priceSource === "live_dam" ? "#dcfce7" : priceSource === "estimated" ? "#fef3c7" : "#fee2e2",
                    color: priceSource === "live_dam" ? "#166534" : priceSource === "estimated" ? "#92400e" : "#991b1b",
                  }}
                >
                  {priceSource === "live_dam"
                    ? "🔴 লাইভ DAM"
                    : priceSource === "estimated"
                      ? "🟡 অনুমানিত"
                      : "⚪ অনুপলব্ধ"}
                </span>
                <button
                  onClick={refreshDAMPrices}
                  disabled={damRefreshing}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.bgCard,
                    cursor: "pointer",
                    fontSize: 10,
                    color: C.primary,
                    fontWeight: 600,
                    opacity: damRefreshing ? 0.5 : 1,
                  }}
                >
                  {damRefreshing ? "⏳" : "🔄"} DAM
                </button>
              </div>
            </div>
          )}

          {/* Price cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(districtData ? districtPrices : analysis.allPrices).map((price) => {
              const trendInfo = getTrendDisplay(price.trend);
              const cropEntry = CROP_CALENDAR.find((c) => c.crop === price.crop);
              return (
                <div
                  key={price.crop}
                  style={{
                    ...cardStyle,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{cropEntry?.icon || "🌾"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{price.crop}</span>
                      <span style={{ fontSize: 11, color: C.textLight }}>({price.cropEn})</span>
                      {price.isMajorCropInDistrict && (
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: "#dcfce7",
                            color: "#166534",
                            fontWeight: 600,
                          }}
                        >
                          স্থানীয়
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                      সর্বনিম্ন ৳{price.priceRange.low} • সর্বোচ্চ ৳{price.priceRange.high} • গড় ৳
                      {price.priceRange.average}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{formatPriceBDT(price.price)}</div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: trendInfo.color,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        justifyContent: "flex-end",
                      }}
                    >
                      {trendInfo.icon} {price.priceChangePercent > 0 ? "+" : ""}
                      {price.priceChangePercent}%
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "3px 8px",
                      borderRadius: 8,
                      background:
                        price.volatility === "very_high"
                          ? "#fef2f2"
                          : price.volatility === "high"
                            ? "#fff7ed"
                            : price.volatility === "medium"
                              ? "#fffbeb"
                              : "#f0fdf4",
                      fontSize: 9,
                      fontWeight: 600,
                      color:
                        price.volatility === "very_high"
                          ? "#991b1b"
                          : price.volatility === "high"
                            ? "#9a3412"
                            : price.volatility === "medium"
                              ? "#92400e"
                              : "#166534",
                    }}
                  >
                    {price.volatility === "very_high"
                      ? "অতি অস্থির"
                      : price.volatility === "high"
                        ? "অস্থির"
                        : price.volatility === "medium"
                          ? "মাঝারি"
                          : "স্থিতিশীল"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 30-day price forecast */}
          <div style={{ ...cardStyle, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={sectionTitle}>📈 ৩০ দিনের মূল্য পূর্বাভাস</div>
              <select
                value={priceForecastCrop}
                onChange={(e) => setPriceForecastCrop(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  background: C.bgCard,
                  color: C.text,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {CROP_CALENDAR.map((c) => (
                  <option key={c.crop} value={c.crop}>
                    {c.icon} {c.crop} ({c.cropEn})
                  </option>
                ))}
              </select>
            </div>
            {priceForecastData.length > 0 ? (
              <>
                {/* Mini chart visualization */}
                <div style={{ position: "relative", height: 80, marginBottom: 8 }}>
                  {(() => {
                    const prices = priceForecastData.map((p) => p.price);
                    const minP = Math.min(...prices);
                    const maxP = Math.max(...prices);
                    const range = maxP - minP || 1;
                    return (
                      <svg
                        viewBox="0 0 300 80"
                        width="100%"
                        height="80"
                        preserveAspectRatio="none"
                        style={{ display: "block" }}
                      >
                        <polyline
                          fill="none"
                          stroke={C.primary}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          points={priceForecastData
                            .map((p, i) => {
                              const x = (i / 29) * 300;
                              const y = 75 - ((p.price - minP) / range) * 65;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                        />
                        {/* Current price dot */}
                        <circle
                          cx={0}
                          cy={75 - ((priceForecastData[0].price - minP) / range) * 65}
                          r="3"
                          fill={C.primary}
                        />
                        {/* 7-day marker */}
                        <line
                          x1={(7 / 30) * 300}
                          y1="0"
                          x2={(7 / 30) * 300}
                          y2="80"
                          stroke={C.border}
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* 14-day marker */}
                        <line
                          x1={(14 / 30) * 300}
                          y1="0"
                          x2={(14 / 30) * 300}
                          y2="80"
                          stroke={C.border}
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    );
                  })()}
                </div>
                {/* Price forecast summary */}
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: 8, background: C.bgMuted }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>৳{priceForecastData[0]?.price}</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>আজ</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: 8, background: C.bgMuted }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#d97706" }}>
                      ৳{priceForecastData[6]?.price}
                    </div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>৭ দিন</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: 8, background: C.bgMuted }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2563eb" }}>
                      ৳{priceForecastData[13]?.price}
                    </div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>১৪ দিন</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", padding: "6px", borderRadius: 8, background: C.bgMuted }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>
                      ৳{priceForecastData[29]?.price}
                    </div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>৩০ দিন</div>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: C.textLight, marginTop: 6, textAlign: "center" }}>
                  আবহাওয়া + মৌসুম + প্রবণতা ভিত্তিক পূর্বাভাস • সর্বনিম্ন আস্থা: দীর্ঘমেয়াদী
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", padding: 12 }}>
                পূর্বাভাসের জন্য আবহাওয়ার তথ্য প্রয়োজন
              </div>
            )}
          </div>

          {/* Profitability ranking */}
          <div style={{ ...cardStyle, padding: "12px 16px" }}>
            <div style={sectionTitle}>📈 লাভজনকতা র‍্যাংকিং (প্রতি বিঘা)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {profitability.map((p, i) => (
                <div
                  key={p.crop}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: i === 0 ? C.primary + "0a" : C.bgMuted,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      width: 20,
                      textAlign: "center",
                      color: i < 3 ? C.primary : C.textMuted,
                    }}
                  >
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>
                    {p.crop} ({p.cropEn})
                  </span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>খরচ ৳{p.costPerBigha.toLocaleString()}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: p.roi > 50 ? "#16a34a" : p.roi > 0 ? "#d97706" : "#dc2626",
                      minWidth: 48,
                      textAlign: "right",
                    }}
                  >
                    {p.roi > 0 ? "+" : ""}
                    {p.roi}% ROI
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── INSIGHTS VIEW (Weather-Price Correlation) ────────────────── */}
      {activeView === "insights" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: C.primary + "0a",
              border: `1px solid ${C.primary}22`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: C.primary, marginBottom: 4 }}>
              🔮 আবহাওয়া-মূল্য প্রভাব বিশ্লেষণ
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              আগামী ৭ দিনের আবহাওয়া কীভাবে ফসলের মূল্যকে প্রভাবিত করবে তার বিশ্লেষণ
            </div>
          </div>

          {weatherPriceInsights.map((wi) => (
            <div
              key={wi.crop}
              style={{
                ...cardStyle,
                borderLeft: `3px solid ${
                  wi.impact.impact === "price_up" ? "#dc2626" : wi.impact.impact === "price_down" ? "#16a34a" : C.border
                }`,
              }}
            >
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{wi.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{wi.crop}</span>
                    <span style={{ fontSize: 11, color: C.textLight, marginLeft: 6 }}>({wi.cropEn})</span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 10,
                      background:
                        wi.impact.impact === "price_up"
                          ? "#fee2e2"
                          : wi.impact.impact === "price_down"
                            ? "#dcfce7"
                            : C.bgMuted,
                      color:
                        wi.impact.impact === "price_up"
                          ? "#991b1b"
                          : wi.impact.impact === "price_down"
                            ? "#166534"
                            : C.textMuted,
                    }}
                  >
                    {wi.impact.priceDirectionBn}
                  </span>
                </div>

                {/* Current price row */}
                {wi.price && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: C.bgMuted,
                    }}
                  >
                    <span style={{ fontSize: 11, color: C.textMuted }}>বর্তমান:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      {formatPriceBDT(wi.price.price)}/{wi.price.unitBn}
                    </span>
                    <span style={{ fontSize: 11, color: getTrendDisplay(wi.price.trend).color }}>
                      {getTrendDisplay(wi.price.trend).icon} {wi.price.trendBn}
                    </span>
                  </div>
                )}

                {/* Insights */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {wi.impact.insights.map((ins, j) => (
                    <div
                      key={j}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        background:
                          ins.type === "danger"
                            ? "#fef2f2"
                            : ins.type === "warning"
                              ? "#fffbeb"
                              : ins.type === "good"
                                ? "#f0fdf4"
                                : ins.type === "caution"
                                  ? "#fff7ed"
                                  : C.bgMuted,
                        borderLeft: `3px solid ${
                          ins.type === "danger"
                            ? "#dc2626"
                            : ins.type === "warning"
                              ? "#d97706"
                              : ins.type === "good"
                                ? "#16a34a"
                                : ins.type === "caution"
                                  ? "#ea580c"
                                  : C.border
                        }`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14 }}>{ins.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{ins.title}</span>
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 6px",
                            borderRadius: 6,
                            marginLeft: "auto",
                            background:
                              ins.priceEffect === "up" ? "#fee2e2" : ins.priceEffect === "down" ? "#dcfce7" : C.bgMuted,
                            color:
                              ins.priceEffect === "up"
                                ? "#991b1b"
                                : ins.priceEffect === "down"
                                  ? "#166534"
                                  : C.textMuted,
                            fontWeight: 600,
                          }}
                        >
                          {ins.priceEffect === "up" ? "মূল্য ↑" : ins.priceEffect === "down" ? "মূল্য ↓" : "নিরপেক্ষ"}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted, paddingLeft: 20 }}>{ins.detail}</div>
                    </div>
                  ))}
                </div>

                {/* Impact score bar */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: C.textMuted }}>প্রভাব স্কোর</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.text }}>
                      {wi.impact.impactScore > 0 ? "+" : ""}
                      {wi.impact.impactScore}/10
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: C.bgMuted,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Center line */}
                    <div
                      style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: C.border }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        height: "100%",
                        borderRadius: 3,
                        left: wi.impact.impactScore >= 0 ? "50%" : `${50 + (wi.impact.impactScore / 10) * 50}%`,
                        width: `${Math.abs(wi.impact.impactScore / 10) * 50}%`,
                        background:
                          wi.impact.impactScore > 0 ? "#dc2626" : wi.impact.impactScore < 0 ? "#16a34a" : C.border,
                        transition: "all .3s",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ fontSize: 8, color: "#16a34a" }}>মূল্য কমবে</span>
                    <span style={{ fontSize: 8, color: "#dc2626" }}>মূল্য বাড়বে</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── COMPARE VIEW ──────────────────────────────────────────────── */}
      {activeView === "compare" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Crop selector */}
          <div style={{ ...cardStyle, padding: "12px 16px" }}>
            <div style={sectionTitle}>⚖️ ফসল তুলনা নির্বাচন</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CROP_CALENDAR.map((crop) => {
                const isSelected = compareCrops.includes(crop.crop);
                return (
                  <button
                    key={crop.crop}
                    onClick={() => {
                      setCompareCrops((prev) => {
                        if (isSelected) return prev.filter((c) => c !== crop.crop);
                        if (prev.length >= 2) return [prev[1], crop.crop];
                        return [...prev, crop.crop];
                      });
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? C.primary : C.border}`,
                      background: isSelected ? C.primary + "15" : C.bgCard,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? C.primary : C.textMuted,
                      transition: "all .2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {crop.icon} {crop.crop}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison table */}
          {compareCrops.length === 2 &&
            (() => {
              const c1 = analysis.cropDetails.find((c) => c.crop === compareCrops[0]);
              const c2 = analysis.cropDetails.find((c) => c.crop === compareCrops[1]);
              if (!c1 || !c2) return null;

              // Weather-price impact for both
              const wp1 = analyzeWeatherPriceImpact(forecast, c1.crop, c1.price);
              const wp2 = analyzeWeatherPriceImpact(forecast, c2.crop, c2.price);

              const rows = [
                {
                  label: "আবহাওয়া স্কোর",
                  v1: c1.weather.score + "/100",
                  v2: c2.weather.score + "/100",
                  winner: c1.weather.score >= c2.weather.score ? 1 : 2,
                },
                {
                  label: "আবহাওয়া মান",
                  v1: c1.weather.label,
                  v2: c2.weather.label,
                  winner: c1.weather.score >= c2.weather.score ? 1 : 2,
                },
                {
                  label: "বর্তমান মূল্য",
                  v1: formatPriceBDT(c1.price?.price ?? 0) + "/" + (c1.price?.unitBn ?? "কেজি"),
                  v2: formatPriceBDT(c2.price?.price ?? 0) + "/" + (c2.price?.unitBn ?? "কেজি"),
                  winner: (c1.price?.price ?? 0) >= (c2.price?.price ?? 0) ? 1 : 2,
                },
                {
                  label: "মূল্য প্রবণতা",
                  v1: c1.price?.trendBn ?? "--",
                  v2: c2.price?.trendBn ?? "--",
                  winner:
                    c1.price?.trend === "up" && c2.price?.trend !== "up"
                      ? 1
                      : c2.price?.trend === "up" && c1.price?.trend !== "up"
                        ? 2
                        : 0,
                },
                {
                  label: "আবহাওয়া-মূল্য প্রভাব",
                  v1: wp1.priceDirectionBn,
                  v2: wp2.priceDirectionBn,
                  winner:
                    wp1.impact === "price_up" && wp2.impact !== "price_up"
                      ? 1
                      : wp2.impact === "price_up" && wp1.impact !== "price_up"
                        ? 2
                        : wp1.impact === "price_down" && wp2.impact !== "price_down"
                          ? 2
                          : wp2.impact === "price_down" && wp1.impact !== "price_down"
                            ? 1
                            : 0,
                },
                {
                  label: "প্রভাব স্কোর",
                  v1: (wp1.impactScore > 0 ? "+" : "") + wp1.impactScore + "/10",
                  v2: (wp2.impactScore > 0 ? "+" : "") + wp2.impactScore + "/10",
                  winner: Math.abs(wp1.impactScore) > Math.abs(wp2.impactScore) ? 1 : 2,
                },
                {
                  label: "সেচ প্রয়োজন",
                  v1: c1.irrigation?.advice?.slice(0, 25) ?? "--",
                  v2: c2.irrigation?.advice?.slice(0, 25) ?? "--",
                  winner: 0,
                },
                {
                  label: "মৌসুমে আছে",
                  v1: c1.isActive ? "✅ হ্যাঁ" : "❌ না",
                  v2: c2.isActive ? "✅ হ্যাঁ" : "❌ না",
                  winner: c1.isActive && !c2.isActive ? 1 : c2.isActive && !c1.isActive ? 2 : 0,
                },
                {
                  label: "সামগ্রিক স্কোর",
                  v1: c1.combinedScore + "/100",
                  v2: c2.combinedScore + "/100",
                  winner: c1.combinedScore >= c2.combinedScore ? 1 : 2,
                },
                {
                  label: "সুপারিশ",
                  v1: c1.recommendation,
                  v2: c2.recommendation,
                  winner: c1.combinedScore >= c2.combinedScore ? 1 : 2,
                },
              ];

              return (
                <div style={cardStyle}>
                  {/* Header */}
                  <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, padding: "10px 14px", textAlign: "center", background: C.primary + "0a" }}>
                      <span style={{ fontSize: 22 }}>{CROP_CALENDAR.find((c) => c.crop === c1.crop)?.icon}</span>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginTop: 2 }}>{c1.crop}</div>
                    </div>
                    <div style={{ flex: 1, padding: "10px 14px", textAlign: "center", background: "#2563eb0a" }}>
                      <span style={{ fontSize: 22 }}>{CROP_CALENDAR.find((c) => c.crop === c2.crop)?.icon}</span>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginTop: 2 }}>{c2.crop}</div>
                    </div>
                  </div>

                  {/* Comparison rows */}
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: "8px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: row.winner === 1 ? C.primary : C.text,
                          background: row.winner === 1 ? C.primary + "05" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {row.v1} {row.winner === 1 && <span style={{ fontSize: 10 }}>🏆</span>}
                      </div>
                      <div
                        style={{
                          width: 100,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: C.textLight,
                          fontWeight: 600,
                          textAlign: "center",
                          background: C.bgMuted,
                        }}
                      >
                        {row.label}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: "8px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: row.winner === 2 ? "#2563eb" : C.text,
                          background: row.winner === 2 ? "#2563eb05" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          justifyContent: "flex-end",
                        }}
                      >
                        {row.winner === 2 && <span style={{ fontSize: 10 }}>🏆</span>} {row.v2}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
        </div>
      )}

      {/* ─── ADVISORY VIEW ─────────────────────────────────────────────── */}
      {activeView === "advisory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Crop selector */}
          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>
            ✅ = এই মৌসুমে আছে &nbsp;|&nbsp; ⏸ = এই মৌসুমে নেই (তথ্য দেখতে পারবেন)
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CROP_CALENDAR.map((crop) => {
              const inSeason = analysis?.activeCrops?.some((ac) => ac.crop === crop.crop);
              return (
                <button
                  key={crop.crop}
                  onClick={() => setSelectedAdvisoryCrop(crop.crop)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${selectedAdvisoryCrop === crop.crop ? C.primary : inSeason ? C.border : C.borderWarning}`,
                    background:
                      selectedAdvisoryCrop === crop.crop ? C.primary + "15" : inSeason ? C.bgCard : C.bgWarning + "44",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: selectedAdvisoryCrop === crop.crop ? 700 : 500,
                    color: selectedAdvisoryCrop === crop.crop ? C.primary : inSeason ? C.textMuted : C.textWarning,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    opacity: inSeason ? 1 : 0.65,
                  }}
                >
                  {crop.icon} {crop.crop}
                  {!inSeason && <span style={{ fontSize: 9 }}>⏸</span>}
                </button>
              );
            })}
          </div>

          {/* Advisory content */}
          {(() => {
            const advisory = generateSeasonalAdvisory(selectedAdvisoryCrop, analysis);
            if (!advisory) return null;

            // Get weather-price insight for this crop
            const priceData = simulateCurrentPrice(selectedAdvisoryCrop, currentMonth);
            const wpInsight = analyzeWeatherPriceImpact(forecast, selectedAdvisoryCrop, priceData);

            return (
              <>
                {/* Overall score */}
                <div style={{ ...cardStyle, padding: "14px 16px", textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color:
                        advisory.overallScore >= 65 ? "#16a34a" : advisory.overallScore >= 40 ? "#d97706" : "#dc2626",
                    }}
                  >
                    {advisory.overallScore}/100
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                    {selectedAdvisoryCrop} — সামগ্রিক মূল্যায়ন
                  </div>
                </div>

                {/* Weather-price insight for this crop */}
                {wpInsight.impactScore !== 0 && (
                  <div
                    style={{
                      ...cardStyle,
                      padding: "12px 14px",
                      borderLeft: `3px solid ${wpInsight.impact === "price_up" ? "#dc2626" : "#16a34a"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>🔮</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>আবহাওয়া-মূল্য প্রভাব</span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 8,
                          marginLeft: "auto",
                          background: wpInsight.impact === "price_up" ? "#fee2e2" : "#dcfce7",
                          color: wpInsight.impact === "price_up" ? "#991b1b" : "#166534",
                          fontWeight: 700,
                        }}
                      >
                        {wpInsight.priceDirectionBn}
                      </span>
                    </div>
                    {wpInsight.insights.slice(0, 2).map((ins, i) => (
                      <div key={i} style={{ fontSize: 11, color: C.textMuted, paddingLeft: 24, marginBottom: 2 }}>
                        {ins.icon} {ins.title}
                      </div>
                    ))}
                  </div>
                )}

                {/* Advisory cards */}
                {advisory.advisories.map((adv, i) => (
                  <div
                    key={i}
                    style={{
                      ...cardStyle,
                      padding: "12px 14px",
                      borderLeft: `3px solid ${
                        adv.level === "urgent"
                          ? "#dc2626"
                          : adv.level === "warning"
                            ? "#ef4444"
                            : adv.level === "caution"
                              ? "#d97706"
                              : adv.level === "good"
                                ? "#16a34a"
                                : C.primary
                      }`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{adv.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{adv.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, paddingLeft: 24 }}>{adv.text}</div>
                  </div>
                ))}

                {/* Irrigation detail */}
                {(() => {
                  const irr = estimateIrrigationNeed(selectedAdvisoryCrop, forecast);
                  if (!irr || irr.need === "unknown") return null;
                  return (
                    <div style={{ ...cardStyle, padding: "12px 16px" }}>
                      <div style={sectionTitle}>💧 সেচ বিস্তারিত</div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#2563eb" }}>{irr.weeklyRain}mm</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>সপ্তাহিক বৃষ্টি</div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#d97706" }}>{irr.weeklyNeed}mm</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>প্রয়োজন</div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div
                            style={{ fontSize: 18, fontWeight: 700, color: irr.mmDeficit > 0 ? "#dc2626" : "#16a34a" }}
                          >
                            {irr.mmDeficit > 0 ? irr.mmDeficit + "mm" : "যথেষ্ট"}
                          </div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>ঘাটতি</div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: C.textMuted,
                          marginTop: 8,
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: C.bgMuted,
                        }}
                      >
                        {irr.advice}
                      </div>
                    </div>
                  );
                })()}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
