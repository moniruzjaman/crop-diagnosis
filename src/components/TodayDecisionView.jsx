import { useState, useEffect, useMemo } from "react";
import {
  fetch7DayForecast,
  parseForecast,
  forecastDiseasePressure,
  estimateIrrigationNeed,
  findSprayWindows,
} from "../data/weatherService";
import { simulateCurrentPrice, analyzeWeatherPriceImpact } from "../data/cropPriceService";

/**
 * TodayDecisionView — "আজকের সিদ্ধান্ত" full page.
 *
 * The detail view behind the Home tab's WeatherDecisionSummary card.
 * Same underlying functions (findSprayWindows, forecastDiseasePressure,
 * estimateIrrigationNeed) as the Calendar tab's Advisory view — this
 * page exists purely to give the compact Home summary somewhere to
 * link to without duplicating the Calendar tab's broader crop/price
 * comparison tools.
 */

const CROP_OPTIONS = [
  { bn: "ধান", en: "Rice", emoji: "🌾" },
  { bn: "আলু", en: "Potato", emoji: "🥔" },
  { bn: "টমেটো", en: "Tomato", emoji: "🍅" },
  { bn: "বেগুন", en: "Brinjal", emoji: "🍆" },
  { bn: "সরিষা", en: "Mustard", emoji: "🌼" },
  { bn: "পাট", en: "Jute", emoji: "🌿" },
  { bn: "গম", en: "Wheat", emoji: "🌾" },
  { bn: "ভুট্টা", en: "Maize", emoji: "🌽" },
];

const QUALITY_LABEL = { excellent: "চমৎকার", good: "ভালো", fair: "মোটামুটি" };
const QUALITY_COLOR = (C, q) => (q === "excellent" ? C.success : q === "good" ? C.blue : C.warning);
const PRESSURE_LABEL = { high: "উচ্চ", medium: "মাঝারি", low: "কম" };
const PRESSURE_COLOR = (C, p) => (p === "high" ? C.danger : p === "medium" ? C.warning : C.success);

export default function TodayDecisionView({ C, coords, locationName, history, onBack }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const lastCropBn = useMemo(() => {
    const latest = history?.[history.length - 1];
    if (!latest?.crop) return null;
    const parts = latest.crop.split("/");
    const bn = (parts[1] || parts[0] || "").trim();
    return CROP_OPTIONS.some((c) => c.bn === bn) ? bn : null;
  }, [history]);

  const [selectedCrop, setSelectedCrop] = useState(lastCropBn || "ধান");
  // Sync selectedCrop when a diagnosis history entry loads after mount
  // (mirrors the same pattern used in CropCalendarDashboard.jsx)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (lastCropBn) setSelectedCrop(lastCropBn);
  }, [lastCropBn]);

  useEffect(() => {
    if (!coords?.lat || !coords?.lon) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch7DayForecast(coords.lat, coords.lon)
      .then((raw) => {
        if (cancelled) return;
        setForecast(parseForecast(raw));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coords?.lat, coords?.lon]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const sprayWindows = useMemo(() => (forecast ? findSprayWindows(forecast) : []), [forecast]);
  const diseasePressures = useMemo(() => (forecast ? forecastDiseasePressure(forecast) : []), [forecast]);
  const irrigation = useMemo(
    () => (forecast ? estimateIrrigationNeed(selectedCrop, forecast) : null),
    [forecast, selectedCrop],
  );
  const priceImpact = useMemo(() => {
    if (!forecast) return null;
    const month = new Date().getMonth() + 1;
    const price = simulateCurrentPrice(selectedCrop, month);
    if (!price) return null;
    return analyzeWeatherPriceImpact(forecast, selectedCrop, price);
  }, [forecast, selectedCrop]);

  const cardStyle = {
    background: C.bgCard,
    borderRadius: 18,
    padding: "16px 16px",
    boxShadow: C.shadow,
    border: `1px solid ${C.border}`,
  };
  const sectionTitle = {
    fontWeight: 800,
    fontSize: 15,
    color: C.primaryDark,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn .3s ease", paddingBottom: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="ফিরে যান"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.bgMuted,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ←
          </button>
        )}
        <div>
          <div className="ud-headline" style={{ fontWeight: 800, fontSize: 19, color: C.text }}>
            🧭 আজকের সিদ্ধান্ত
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{locationName || "অবস্থান নির্ণয় হচ্ছে..."}</div>
        </div>
      </div>

      {loading && (
        <div style={{ ...cardStyle, textAlign: "center", color: C.textMuted, fontSize: 13 }}>
          ⏳ ৭ দিনের পূর্বাভাস বিশ্লেষণ হচ্ছে...
        </div>
      )}
      {!loading && error && (
        <div style={{ ...cardStyle, textAlign: "center", color: C.textMuted, fontSize: 13 }}>
          পূর্বাভাস এই মুহূর্তে পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।
        </div>
      )}

      {!loading && !error && forecast && (
        <>
          {/* Crop selector */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🌱 ফসল নির্বাচন করুন</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {CROP_OPTIONS.map((c) => (
                <button
                  key={c.bn}
                  onClick={() => setSelectedCrop(c.bn)}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: `1.5px solid ${selectedCrop === c.bn ? C.primary : C.border}`,
                    background: selectedCrop === c.bn ? C.primary + "15" : C.bgCard,
                    color: selectedCrop === c.bn ? C.primaryDark : C.textMuted,
                    fontWeight: selectedCrop === c.bn ? 700 : 500,
                    fontSize: 12.5,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{c.emoji}</span> {c.bn}
                </button>
              ))}
            </div>
          </div>

          {/* Spray windows — full week */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🧴 স্প্রে করার সময় (৭ দিন)</div>
            {sprayWindows.length === 0 ? (
              <div style={{ fontSize: 12.5, color: C.textMuted }}>
                এই সপ্তাহে কোনো উপযুক্ত স্প্রে সময় পাওয়া যায়নি — বৃষ্টি বা বাতাসের কারণে।
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sprayWindows.map((w) => (
                  <div
                    key={w.date}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 12,
                      background: C.bgMuted,
                    }}
                  >
                    <div style={{ width: 44, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{w.dayOfWeek}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{w.date.slice(5)}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{w.window}</div>
                      <div style={{ fontSize: 10.5, color: C.textMuted }}>
                        🌧️ {w.rainProb}% · 💨 {w.windMax}km/h · 🌡️ {w.tempMax}°
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 10,
                        color: "#fff",
                        background: QUALITY_COLOR(C, w.quality),
                        flexShrink: 0,
                      }}
                    >
                      {QUALITY_LABEL[w.quality]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disease pressure — full list */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🦠 রোগ ও পোকার চাপ (এই সপ্তাহ)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {diseasePressures.map((p, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 10, padding: "9px 12px", borderRadius: 12, background: C.bgMuted }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 10,
                      color: "#fff",
                      background: PRESSURE_COLOR(C, p.pressure),
                      flexShrink: 0,
                      alignSelf: "flex-start",
                    }}
                  >
                    {PRESSURE_LABEL[p.pressure]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{p.disease}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{p.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Irrigation — for selected crop */}
          {irrigation && (
            <div style={cardStyle}>
              <div style={sectionTitle}>💧 সেচ প্রয়োজন — {selectedCrop}</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    সাপ্তাহিক বৃষ্টি
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.blue }}>{irrigation.weeklyRain}mm</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    প্রয়োজন
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{irrigation.weeklyNeed}mm</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    ঘাটতি
                  </div>
                  <div
                    style={{ fontSize: 18, fontWeight: 800, color: irrigation.mmDeficit > 0 ? C.warning : C.success }}
                  >
                    {irrigation.mmDeficit}mm
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background:
                    irrigation.need === "critical"
                      ? C.bgDanger
                      : irrigation.need === "moderate" || irrigation.need === "low"
                        ? C.bgWarning
                        : C.bgSuccess,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color:
                    irrigation.need === "critical"
                      ? C.danger
                      : irrigation.need === "moderate" || irrigation.need === "low"
                        ? C.warning
                        : C.success,
                }}
              >
                {irrigation.advice}
              </div>
            </div>
          )}

          {/* Price impact — clearly labeled as seasonal estimate, not live */}
          {priceImpact && priceImpact.insights?.length > 0 && (
            <div style={cardStyle}>
              <div style={sectionTitle}>📈 বাজারের উপর সম্ভাব্য প্রভাব</div>
              <div style={{ fontSize: 10.5, color: C.textLight, marginBottom: 10 }}>
                মৌসুমি অনুমান — সরাসরি বাজার মূল্য নয়। প্রকৃত দামের জন্য ক্যালেন্ডার ট্যাবের লাইভ মূল্য দেখুন।
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {priceImpact.insights.map((ins, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", gap: 10, padding: "9px 12px", borderRadius: 12, background: C.bgMuted }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{ins.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{ins.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{ins.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
