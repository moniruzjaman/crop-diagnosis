import { useState, useEffect, useMemo } from "react";
import {
  fetch7DayForecast,
  parseForecast,
  forecastDiseasePressure,
  estimateIrrigationNeed,
  findSprayWindows,
} from "../data/weatherService";

/**
 * WeatherDecisionSummary — "আজকের সিদ্ধান্ত" (Today's Decision)
 *
 * Synthesizes existing weather-intelligence functions (spray windows,
 * disease pressure forecast, irrigation need) into a single small set
 * of prioritized, farmer-facing action lines.
 *
 * Deliberately self-contained: fetches its own 7-day forecast and
 * manages its own loading state so it can be dropped into the Home
 * tab (or anywhere else) without touching App.jsx's weather state,
 * fetch effects, or any existing component's props.
 *
 * Reuses the same functions that already power CropCalendarDashboard's
 * Advisory view — no new weather logic, only new synthesis + surfacing.
 */

const PRESSURE_RANK = { high: 3, medium: 2, low: 1 };

function buildActions(forecast, cropBn) {
  if (!forecast) return [];
  const actions = [];

  // 1. Spray window — today specifically, else next best day this week
  const windows = findSprayWindows(forecast);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayWindow = windows.find((w) => w.date === todayStr);
  if (todayWindow) {
    const good = todayWindow.quality === "excellent" || todayWindow.quality === "good";
    actions.push({
      key: "spray",
      icon: good ? "✅" : "⚠️",
      level: good ? "good" : "caution",
      title: good ? "আজ স্প্রে করার উপযুক্ত দিন" : "আজ স্প্রে সতর্কতার সাথে করুন",
      detail: `${todayWindow.window} · বৃষ্টির সম্ভাবনা ${todayWindow.rainProb}%, বাতাস ${todayWindow.windMax}km/h`,
    });
  } else if (windows.length > 0) {
    const next = windows[0];
    actions.push({
      key: "spray",
      icon: "🚫",
      level: "caution",
      title: "আজ স্প্রে করবেন না",
      detail: `পরবর্তী ভালো সময়: ${next.dayOfWeek} (${next.date}) — ${next.window}`,
    });
  }

  // 2. Disease pressure — top-ranked item only
  const pressures = forecastDiseasePressure(forecast);
  const topPressure = [...pressures].sort(
    (a, b) => (PRESSURE_RANK[b.pressure] || 0) - (PRESSURE_RANK[a.pressure] || 0),
  )[0];
  if (topPressure && topPressure.pressure !== "low") {
    actions.push({
      key: "disease",
      icon: topPressure.pressure === "high" ? "🦠" : "🔎",
      level: topPressure.pressure === "high" ? "danger" : "caution",
      title: `${topPressure.disease} — এই সপ্তাহে নজর রাখুন`,
      detail: topPressure.reason,
    });
  }

  // 3. Irrigation — only if a crop is known (from last diagnosis)
  if (cropBn) {
    const irrigation = estimateIrrigationNeed(cropBn, forecast);
    if (irrigation.need === "critical" || irrigation.need === "moderate") {
      actions.push({
        key: "irrigation",
        icon: "💧",
        level: irrigation.need === "critical" ? "danger" : "caution",
        title: irrigation.need === "critical" ? "জরুরি সেচ প্রয়োজন" : "সেচ দেওয়ার সময় হয়েছে",
        detail: irrigation.advice,
      });
    } else if (irrigation.need === "none") {
      actions.push({
        key: "irrigation",
        icon: "🟢",
        level: "good",
        title: "সেচের প্রয়োজন নেই",
        detail: irrigation.advice,
      });
    }
  }

  // Sort danger > caution > good, cap at 4 lines to stay a "summary"
  const order = { danger: 0, caution: 1, good: 2 };
  return actions.sort((a, b) => order[a.level] - order[b.level]).slice(0, 4);
}

const LEVEL_STYLE = (C, level) => {
  if (level === "danger") return { bg: C.bgDanger, border: C.borderDanger, color: C.danger };
  if (level === "caution") return { bg: C.bgWarning, border: C.borderWarning, color: C.warning };
  return { bg: C.bgSuccess, border: C.borderSuccess, color: C.success };
};

export default function WeatherDecisionSummary({ C, coords, history, onOpenDetail }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Bengali name of the crop from the farmer's most recent diagnosis, if any.
  // history stores crop as "Rice / ধান" (see QuickCropRow) — take the Bengali half.
  const lastCropBn = useMemo(() => {
    const latest = history?.[history.length - 1];
    if (!latest?.crop) return null;
    const parts = latest.crop.split("/");
    return parts[1]?.trim() || parts[0]?.trim() || null;
  }, [history]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!coords?.lat || !coords?.lon) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch7DayForecast(coords.lat, coords.lon)
      .then((raw) => {
        if (cancelled) return;
        const parsed = parseForecast(raw);
        setForecast(parsed);
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

  const actions = useMemo(() => buildActions(forecast, lastCropBn), [forecast, lastCropBn]);

  if (!coords) return null;

  return (
    <div
      style={{
        background: C.bgCard,
        borderRadius: 18,
        padding: "18px 16px",
        boxShadow: C.shadow,
        border: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
          🧭 আজকের সিদ্ধান্ত
        </div>
        {lastCropBn && <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{lastCropBn}</div>}
      </div>

      {loading && (
        <div style={{ fontSize: 12, color: C.textMuted, padding: "8px 0" }}>⏳ পূর্বাভাস বিশ্লেষণ হচ্ছে...</div>
      )}

      {!loading && error && (
        <div style={{ fontSize: 12, color: C.textMuted, padding: "8px 0" }}>
          পূর্বাভাস এই মুহূর্তে পাওয়া যাচ্ছে না।
        </div>
      )}

      {!loading && !error && actions.length === 0 && forecast && (
        <div style={{ fontSize: 12, color: C.success, padding: "8px 0", fontWeight: 600 }}>
          🟢 এই সপ্তাহে বিশেষ কোনো ঝুঁকি বা জরুরি কাজ নেই
        </div>
      )}

      {!loading && actions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {actions.map((a) => {
            const s = LEVEL_STYLE(C, a.level);
            return (
              <div
                key={a.key}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                }}
              >
                <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1.4 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: s.color, marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>{a.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!lastCropBn && !loading && (
        <div style={{ fontSize: 11, color: C.textLight, marginTop: 10 }}>
          💡 একবার নির্ণয় করলে ফসল অনুযায়ী সেচের পরামর্শও এখানে যোগ হবে
        </div>
      )}

      {onOpenDetail && (
        <button
          onClick={onOpenDetail}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.bgMuted,
            color: C.primaryDark,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          বিস্তারিত দেখুন →
        </button>
      )}
    </div>
  );
}
