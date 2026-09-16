import { useState, useEffect, useCallback } from "react";

/**
 * OutbreakList Component
 *
 * Shows recent disease outbreak reports from the user's district.
 * Props:
 *   C        — color tokens object
 *   district — user's district string (Bengali/English)
 *   postJson — signed API fetch helper (from App.jsx)
 *
 * API POST expects: { district, crop, disease_name }
 * API GET returns:  { id, district, crop, diseaseName, confirmed (bool), createdAt }
 */

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr;
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ঘন্টা আগে`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} দিন আগে`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} সপ্তাহ আগে`;
  return `${Math.floor(days / 30)} মাস আগে`;
}

const CROP_ICONS = {
  ধান: "🌾",
  Rice: "🌾",
  পাট: "🌿",
  Jute: "🌿",
  আলু: "🥔",
  Potato: "🥔",
  টমেটো: "🍅",
  Tomato: "🍅",
  বেগুন: "🍆",
  Brinjal: "🍆",
  সরিষা: "🌼",
  Mustard: "🌼",
  কলা: "🍌",
  Banana: "🍌",
  আম: "🥭",
  Mango: "🥭",
  গম: "🌾",
  Wheat: "🌾",
  ভুট্টা: "🌽",
  Maize: "🌽",
};

function getCropIcon(cropStr) {
  if (!cropStr) return "🌱";
  for (const [key, icon] of Object.entries(CROP_ICONS)) {
    if (cropStr.includes(key)) return icon;
  }
  return "🌱";
}

function severityStyle(severity) {
  switch (severity) {
    case "high":
    case "উচ্চ":
      return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "উচ্চ" };
    case "medium":
    case "মাঝারি":
      return { bg: "#fffbeb", color: "#d97706", border: "#fed7aa", label: "মাঝারি" };
    case "low":
    case "কম":
      return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", label: "কম" };
    default:
      return { bg: "#f0f2f5", color: "#6b7280", border: "#e5e7eb", label: severity || "অজানা" };
  }
}

// Normalize both API format and demo fallback format to common shape
function normalizeItem(item) {
  return {
    id: item.id,
    crop: item.crop || "",
    diseaseName: item.diseaseName || item.disease || "",
    district: item.district || "",
    createdAt: item.createdAt || item.reportedAt || "",
    confirmed: item.confirmed === true || (typeof item.confirmedCount === "number" && item.confirmedCount > 0),
    confirmedCount: item.confirmedCount || (item.confirmed === true ? 1 : 0),
    severity: item.severity || (item.confirmed === true ? "high" : "medium"),
    source: item.source || "কৃষক রিপোর্ট",
  };
}

const DEMO_OUTBREAKS = [
  {
    id: "demo-1",
    crop: "ধান",
    disease: "ব্লাস্ট",
    district: "রাজশাহী",
    severity: "high",
    confirmedCount: 12,
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: "কৃষক রিপোর্ট",
  },
  {
    id: "demo-2",
    crop: "আলু",
    disease: "লেট ব্লাইট",
    district: "বগুড়া",
    severity: "high",
    confirmedCount: 8,
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: "DAE নিশ্চিত",
  },
  {
    id: "demo-3",
    crop: "টমেটো",
    disease: "আর্লি ব্লাইট",
    district: "যশোর",
    severity: "medium",
    confirmedCount: 5,
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: "কৃষক রিপোর্ট",
  },
  {
    id: "demo-4",
    crop: "সরিষা",
    disease: "অ্যালটারনেরিয়া ব্লাইট",
    district: "দিনাজপুর",
    severity: "low",
    confirmedCount: 3,
    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: "কৃষক রিপোর্ট",
  },
];

export default function OutbreakList({ C, district, postJson }) {
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({ crop: "", disease_name: "", severity: "medium", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchOutbreaks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (district) params.set("district", district);
      const res = await fetch(`/api/outbreaks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOutbreaks(Array.isArray(data) ? data : data.outbreaks || []);
    } catch (err) {
      setError(err.message);
      setOutbreaks(DEMO_OUTBREAKS);
    } finally {
      setLoading(false);
    }
  }, [district]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchOutbreaks();
  }, [fetchOutbreaks]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmitReport() {
    if (!reportData.crop || !reportData.disease_name) return;
    if (!postJson || typeof postJson !== "function") return;
    setSubmitting(true);
    try {
      const data = await postJson("/api/outbreaks", {
        district: district || "অজানা",
        crop: reportData.crop,
        disease_name: reportData.disease_name,
        confirmed: false,
      });
      if (data && !data.error) {
        setShowReportForm(false);
        setReportData({ crop: "", disease_name: "", severity: "medium", notes: "" });
        fetchOutbreaks();
      }
    } catch {
      setShowReportForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (showReportForm) {
    return (
      <div style={{ animation: "fadeIn .3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => setShowReportForm(false)}
            style={{
              background: "none",
              border: "none",
              color: C.primary,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← ফিরুন
          </button>
        </div>
        <div
          style={{
            background: C.bgCard,
            borderRadius: 16,
            padding: 18,
            border: `1px solid ${C.border}`,
            boxShadow: C.shadow,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark, marginBottom: 14 }}>
            📢 রোগের প্রাদুর্ভাব রিপোর্ট করুন
          </div>
          <label style={{ display: "block", marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontWeight: 700,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              ফসলের নাম *
            </div>
            <input
              type="text"
              value={reportData.crop}
              onChange={(e) => setReportData((prev) => ({ ...prev, crop: e.target.value }))}
              placeholder="যেমন: ধান, আলু, টমেটো"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                fontSize: 14,
                color: C.text,
                background: C.bgMuted,
                outline: "none",
              }}
            />
          </label>
          <label style={{ display: "block", marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontWeight: 700,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              রোগের নাম *
            </div>
            <input
              type="text"
              value={reportData.disease_name}
              onChange={(e) => setReportData((prev) => ({ ...prev, disease_name: e.target.value }))}
              placeholder="যেমন: ব্লাস্ট, লেট ব্লাইট"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                fontSize: 14,
                color: C.text,
                background: C.bgMuted,
                outline: "none",
              }}
            />
          </label>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontWeight: 700,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              তীব্রতা
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { key: "low", label: "কম", color: C.success },
                { key: "medium", label: "মাঝারি", color: C.warning },
                { key: "high", label: "উচ্চ", color: C.danger },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setReportData((prev) => ({ ...prev, severity: opt.key }))}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: 10,
                    border: `1.5px solid ${reportData.severity === opt.key ? opt.color : C.border}`,
                    background: reportData.severity === opt.key ? opt.color + "15" : C.bgMuted,
                    color: reportData.severity === opt.key ? opt.color : C.textMuted,
                    fontSize: 13,
                    fontWeight: reportData.severity === opt.key ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <label style={{ display: "block", marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontWeight: 700,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              অতিরিক্ত তথ্য
            </div>
            <textarea
              value={reportData.notes}
              onChange={(e) => setReportData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="আক্রান্ত এলাকার বিবরণ..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                fontSize: 13,
                color: C.text,
                background: C.bgMuted,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </label>
          <button
            onClick={handleSubmitReport}
            disabled={!reportData.crop || !reportData.disease_name || submitting}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              border: "none",
              background: C.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "পাঠানো হচ্ছে..." : "📤 রিপোর্ট জমা দিন"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🔴</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>রোগের প্রাদুর্ভাব</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>Disease Outbreaks — {district || "আপনার এলাকা"}</div>
        </div>
        <button
          onClick={fetchOutbreaks}
          style={{
            background: C.bgMuted,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: 12,
            color: C.textMuted,
          }}
        >
          🔄
        </button>
      </div>
      <button
        onClick={() => setShowReportForm(true)}
        style={{
          width: "100%",
          padding: "11px 16px",
          borderRadius: 12,
          border: `1.5px dashed ${C.primary}`,
          background: C.primary + "0a",
          color: C.primary,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        📢 রিপোর্ট করুন
      </button>

      {loading && (
        <div style={{ padding: "20px", textAlign: "center", color: C.textMuted, fontSize: 13 }}>
          <div style={{ fontSize: 24, marginBottom: 8, animation: "pulse 1.5s infinite" }}>🔄</div>তথ্য লোড হচ্ছে...
        </div>
      )}
      {!loading && error && outbreaks.length === 0 && (
        <div
          style={{
            padding: "16px",
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            fontSize: 13,
            color: "#9a3412",
          }}
        >
          ⚠️ তথ্য লোড করা যায়নি। ডেমো তথ্য দেখানো হচ্ছে।
        </div>
      )}

      {!loading && outbreaks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {outbreaks.map((rawItem, index) => {
            const item = normalizeItem(rawItem);
            const sev = severityStyle(item.severity);
            return (
              <div
                key={item.id || index}
                style={{
                  background: C.bgCard,
                  borderRadius: 14,
                  border: `1px solid ${sev.border}`,
                  overflow: "hidden",
                  boxShadow: C.shadow,
                  animation: "fadeIn .3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    background: sev.bg,
                    borderBottom: `1px solid ${sev.border}`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sev.color }} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: sev.color,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {sev.label} ঝুঁকি
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: C.textLight }}>{item.source}</span>
                </div>
                <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{getCropIcon(item.crop)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{item.diseaseName}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                      {item.crop} • {item.district}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        background: sev.bg,
                        borderRadius: 8,
                        padding: "3px 8px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: sev.color,
                      }}
                    >
                      {item.confirmed ? "✓ নিশ্চিত" : `📊 ${item.confirmedCount}`}
                    </div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 3 }}>{timeAgo(item.createdAt)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && outbreaks.length === 0 && !error && (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            borderRadius: 14,
            background: C.bgCard,
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>কোনো প্রাদুর্ভাব নেই</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            আপনার এলাকায় বর্তমানে কোনো রোগের প্রাদুর্ভাব রিপোর্ট হয়নি
          </div>
        </div>
      )}
    </div>
  );
}
