// Read-only ViT suggestions card.
// Shown right after the user uploads a photo. The card surfaces the
// top-3 leaf-disease predictions from the on-device ViT model. Tapping
// a chip pre-fills the diagnosis form with the predicted crop + disease
// but does NOT auto-submit — the user stays in control per CABI
// protocol ("exclusion" step). This is the Phase 1 contract.
//
// Phase 2 additions:
//   - 🔊 TTS uses buildVitAnnouncement / buildVitTopKSummary for nicer
//     Bangla phrasing (avoids redundant "পাতায়" prefix)
//   - "🔊 সব শুনুন" top-K summary button in the card header
//   - Honors prefers-reduced-motion via useSyncExternalStore
//   - Theme-aware colors via the theme prop

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { classifyLeaf, preloadModel, isModelReady } from "./vitClassifier";
import { buildVitAnnouncement, buildVitTopKSummary } from "./vitIntegration";
import useTTS from "../games/useTTS";

// Color palette per category — keeps Bangla-visible confidence bar
// consistent with the rest of the diagnose UI.
const CAT_STYLES = {
  healthy: { bg: "#dcfce7", fg: "#166534", bar: "#16a34a", emoji: "✅" },
  fungal: { bg: "#fef3c7", fg: "#92400e", bar: "#d97706", emoji: "🍄" },
  bacterial: { bg: "#fee2e2", fg: "#991b1b", bar: "#dc2626", emoji: "🦠" },
  viral: { bg: "#dbeafe", fg: "#1e40af", bar: "#2563eb", emoji: "🧬" },
  invalid: { bg: "#f1f5f9", fg: "#475569", bar: "#94a3b8", emoji: "⚠️" },
  unknown: { bg: "#f1f5f9", fg: "#475569", bar: "#94a3b8", emoji: "🔍" },
};

const cardStyle = {
  background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)",
  border: "1px solid #bbf7d0",
  borderRadius: 14,
  padding: "12px 14px",
  marginTop: 10,
  marginBottom: 10,
  boxShadow: "0 2px 8px rgba(0,96,40,0.06)",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#0f766e",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.3,
  padding: "3px 8px",
  borderRadius: 999,
  textTransform: "uppercase",
};

const chipBase = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  transition: "transform 0.1s, box-shadow 0.1s",
  textAlign: "left",
  width: "100%",
};

const barTrack = {
  flex: 1,
  height: 6,
  borderRadius: 3,
  background: "rgba(0,0,0,0.06)",
  overflow: "hidden",
  minWidth: 50,
};

function Chip({ entry, onApply, disabled }) {
  const cat = CAT_STYLES[entry.category] || CAT_STYLES.unknown;
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={() => !disabled && onApply(entry)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled || entry.category === "invalid"}
      style={{
        ...chipBase,
        background: cat.bg,
        color: cat.fg,
        borderColor: hover && !disabled ? cat.bar : "rgba(0,0,0,0.08)",
        transform: hover && !disabled ? "translateY(-1px)" : "none",
        boxShadow: hover && !disabled ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
        opacity: disabled ? 0.6 : 1,
      }}
      aria-label={`Apply ${entry.diseaseEn} (${entry.cropEn}) prediction`}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: 14 }}>{cat.emoji}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.cropBn && entry.diseaseBn ? `${entry.cropBn} — ${entry.diseaseBn}` : entry.diseaseEn}
        </span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={barTrack}>
          <span
            style={{
              display: "block",
              height: "100%",
              width: `${Math.round(entry.confidence * 100)}%`,
              background: cat.bar,
              transition: "width 0.4s ease",
            }}
          />
        </span>
        <span style={{ minWidth: 36, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{entry.pctDisplay}</span>
      </span>
    </button>
  );
}

/**
 * VitSuggestions
 * Props:
 *   - imageDataUrl (string | null): the first uploaded image to classify
 *   - onApply(entry): called when the user taps a chip
 *   - theme (object): { primary, primaryDark, text, textMuted, ... }
 *   - autoRun (boolean, default true): start classification as soon as image arrives
 */
export default function VitSuggestions({ imageDataUrl, onApply, theme, autoRun = true, onResult }) {
  const [state, setState] = useState({ status: "idle" });
  const cancelledRef = useRef(false);
  const { speak, stop, speaking, isSupported } = useTTS();
  const [speakingKey, setSpeakingKey] = useState(null);
  // Keep onResult in a ref so the run() callback stays stable (avoids
  // re-creating it when the parent passes a fresh inline handler each render).
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  });

  // Toggle speech for a specific prediction chip (tap again to stop).
  // Phase 2: now uses buildVitAnnouncement for friendlier Bangla phrasing
  // (avoids redundant "পাতায় পাতার" when disease name starts with পাতা).
  const handleSpeak = useCallback(
    (entry, key) => {
      if (speaking && speakingKey === key) {
        stop();
        setSpeakingKey(null);
        return;
      }
      const text = buildVitAnnouncement(entry) ||
        [entry.cropBn, entry.diseaseBn].filter(Boolean).join(" ") ||
        entry.diseaseEn || entry.label || "";
      if (!text) return;
      speak(text);
      setSpeakingKey(key);
    },
    [speak, stop, speaking, speakingKey],
  );

  // Phase 2: top-K summary button — reads all 3 in one utterance.
  const handleSpeakTopK = useCallback(() => {
    if (!state.topK) return;
    if (speaking && speakingKey === "all") {
      stop();
      setSpeakingKey(null);
      return;
    }
    const text = buildVitTopKSummary(state.topK);
    if (!text) return;
    speak(text);
    setSpeakingKey("all");
  }, [speak, stop, speaking, speakingKey, state.topK]);

  // Phase 2: honor prefers-reduced-motion via useSyncExternalStore so
  // we don't trip the react-hooks/set-state-in-effect lint rule.
  const reducedMotion = useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener?.("change", cb);
      return () => mq.removeEventListener?.("change", cb);
    },
    () => (typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false),
    () => false, // SSR fallback
  );

  const run = useCallback(async (src) => {
    if (!src) return;
    setState({ status: "loading" });
    try {
      // Warm up the model in parallel with image load. First call takes
      // ~5-15s on a mid-range Android (22 MB download + WASM init).
      if (!isModelReady())
        preloadModel().catch(() => {
          /* surfaced below */
        });
      const result = await classifyLeaf(src, { topK: 3, timeoutMs: 45000 });
      if (cancelledRef.current) return;
      if (!result.ok) {
        setState({ status: "error", error: result.error, code: result.code });
        return;
      }
      setState({ status: "ready", topK: result.topK, inferenceMs: result.inferenceMs });
      if (typeof onResultRef.current === "function") onResultRef.current(result.topK);
    } catch (err) {
      if (!cancelledRef.current) {
        setState({ status: "error", error: err.message || String(err) });
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    if (autoRun && imageDataUrl) {
      // Defer the run() call out of the effect body via queueMicrotask.
      // This avoids react-hooks/set-state-in-effect (synchronous setState
      // inside an effect causes cascading renders) while still showing the
      // loading state within the same frame.
      queueMicrotask(() => {
        if (!cancelledRef.current) run(imageDataUrl);
      });
    }
    return () => {
      cancelledRef.current = true;
    };
  }, [imageDataUrl, autoRun, run]);

  // Nothing to render until the user picks a photo.
  if (!imageDataUrl) return null;

  const T = theme || {};

  // ── Loading ───────────────────────────────────────────────────────────
  if (state.status === "idle" || state.status === "loading") {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={badgeStyle}>🛰️ Local AI Vision</span>
          <span style={{ fontSize: 11, color: "#0f766e", fontWeight: 600 }}>Offline</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!reducedMotion && (
            <div
              style={{
                width: 14,
                height: 14,
                border: "2px solid #0f766e",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          <span style={{ fontSize: 12, color: T.textMuted || "#5f6672" }}>
            পাতার ছবি বিশ্লেষণ চলছে… (প্রথমবার মডেল লোড হতে ১০-১৫ সেকেন্ড লাগতে পারে)
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (state.status === "error") {
    const isOffline = state.code === "INFERENCE_FAILED" && /fetch|network|load/i.test(state.error || "");
    return (
      <div style={{ ...cardStyle, background: "#fef2f2", borderColor: "#fecaca" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...badgeStyle, background: "#dc2626" }}>⚠️ Vision Unavailable</span>
        </div>
        <div style={{ fontSize: 12, color: "#991b1b", marginTop: 6, lineHeight: 1.5 }}>
          {isOffline
            ? "মডেল লোড করা যায়নি — ইন্টারনেট সংযোগ পরীক্ষা করুন।"
            : "ছবি বিশ্লেষণ করা যায়নি। আপনি ম্যানুয়ালি লক্ষণ লিখে এগিয়ে যেতে পারেন।"}
        </div>
        <button
          type="button"
          onClick={() => run(imageDataUrl)}
          style={{
            marginTop: 8,
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: 600,
            background: "#fff",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          🔄 আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────
  const { topK, inferenceMs } = state;
  if (!topK || topK.length === 0) return null;

  // "Invalid" class → friendly message instead of suggestions
  if (topK[0]?.category === "invalid") {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={badgeStyle}>🛰️ Local AI Vision</span>
          <span style={{ fontSize: 11, color: "#0f766e", fontWeight: 600 }}>Offline</span>
        </div>
        <div style={{ fontSize: 12, color: T.text || "#1a1d21", lineHeight: 1.5 }}>
          ⚠️ এই ছবিতে পাতা স্পষ্ট দেখা যাচ্ছে না। আরও কাছ থেকে, ভালো আলোতে ছবি তুলুন।
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={badgeStyle}>🛰️ Local AI Vision</span>
          <span style={{ fontSize: 11, color: "#0f766e", fontWeight: 600 }}>Offline · {inferenceMs}ms</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {isSupported && topK.length > 1 && (
            <button
              type="button"
              onClick={handleSpeakTopK}
              title={speaking && speakingKey === "all" ? "থামুন" : "সব শুনুন"}
              style={{
                background: speaking && speakingKey === "all" ? "#0f766e" : "transparent",
                color: speaking && speakingKey === "all" ? "#fff" : "#0f766e",
                border: "1px solid #0f766e",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {speaking && speakingKey === "all" ? "⏹️" : "🔊"} সব শুনুন
            </button>
          )}
          <button
            type="button"
            onClick={() => run(imageDataUrl)}
            title="পুনরায় বিশ্লেষণ করুন"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color: "#0f766e",
              padding: 2,
              lineHeight: 1,
            }}
          >
            🔄
          </button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.textMuted || "#5f6672", marginBottom: 8, lineHeight: 1.4 }}>
        মডেলের প্রস্তাব — যেকোনো একটিতে চাপ দিলে ফসল ও রোগ ফিল্ডে বসে যাবে, তারপর আপনি নিজে যাচাই করবেন।
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {topK.map((entry) => (
          <div key={entry.idx} style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Chip entry={entry} onApply={onApply} />
            </div>
            {isSupported && (
              <button
                type="button"
                title={speaking && speakingKey === entry.idx ? "বন্ধ করুন" : "শুনুন"}
                onClick={() => handleSpeak(entry, entry.idx)}
                disabled={entry.category === "invalid"}
                style={{
                  flexShrink: 0,
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: CAT_STYLES[entry.category]?.bg || "#eef2f7",
                  color: CAT_STYLES[entry.category]?.fg || "#475569",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                  opacity: entry.category === "invalid" ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: 13 }}>{speaking && speakingKey === entry.idx ? "⏹️" : "🔊"}</span>
                {speaking && speakingKey === entry.idx ? "থামুন" : "শুনুন"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
