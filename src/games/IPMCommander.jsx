import { useState, useEffect, useCallback, useRef } from "react";
import { IPM_COMMANDER_IMAGES } from "./imageMap";
import useTTS from "./useTTS";
import SymptomImageGallery from "./SymptomImageGallery";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#006a4e",
  primaryLight: "#0b8457",
  primaryDark: "#00503a",
  accent: "#f42a41",
  bdGreen: "#006a4e",
  bdRed: "#f42a41",
  bg: "#f5fbf6",
  bgCard: "#ffffff",
  bgMuted: "#eff5f0",
  text: "#171d1a",
  textMuted: "#3f493f",
  textLight: "#6f7a6e",
  border: "#becabc",
  success: "#006a4e",
  warning: "#d97706",
  danger: "#f42a41",
  blue: "#2563eb",
  shadow: "0 8px 24px rgba(0,106,78,0.08)",
  shadowMd: "0 16px 40px rgba(0,106,78,0.12)",
};

// ─── Keyframes (injected once) ────────────────────────────────────────────────
const KS = `
@keyframes ipmFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes ipmPopIn{0%{transform:scale(.82);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes ipmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes ipmPulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ipmShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes ipmGlow{0%,100%{box-shadow:0 0 6px rgba(0,106,78,.25)}50%{box-shadow:0 0 22px rgba(244,42,65,.55)}}
@keyframes ipmSlideRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
@keyframes ipmScaleUp{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes ipmConfetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(120px) rotate(360deg);opacity:0}}
@keyframes ipmBounceIn{0%{transform:scale(0) rotate(-12deg);opacity:0}50%{transform:scale(1.15) rotate(3deg)}70%{transform:scale(.95) rotate(-1deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes ipmFlipIn{0%{transform:rotateY(90deg);opacity:.3}100%{transform:rotateY(0);opacity:1}}
@keyframes ipmSlotPulse{0%,100%{border-color:#becabc}50%{border-color:#006a4e}}
`;
if (typeof document !== "undefined" && !document.getElementById("ipm-ks")) {
  const s = document.createElement("style");
  s.id = "ipm-ks";
  s.textContent = KS;
  document.head.appendChild(s);
}

// ─── Game data ────────────────────────────────────────────────────────────────
const ROUNDS = [
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    problem: "ধানের ব্লাস্ট রোগ দেখা দিয়েছে",
    interventions: [
      { text: "ব্লাস্ট প্রতিরোধী জাত ব্যবহার করুন", level: 1, icon: "🌱", shortLabel: "প্রতিরোধী জাত" },
      { text: "আক্রান্ত পাতা তুলে পুড়িয়ে ফেলুন, সুষম সার", level: 2, icon: "🧹", shortLabel: "আক্রান্ত পাতা অপসারণ" },
      { text: "ট্রাইকোডেরমা বীজ প্রক্রিয়াজাতকরণ", level: 3, icon: "🦠", shortLabel: "ট্রাইকোডেরমা" },
      { text: "ট্রাইসাইক্লাজল স্প্রে (FRAC Group M3)", level: 4, icon: "⚗️", shortLabel: "ট্রাইসাইক্লাজল" },
    ],
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    problem: "মাজরা পোকার উপদ্রব শুরু হয়েছে",
    interventions: [
      { text: "সময়মতো বপন + প্রতিরোধী জাত", level: 1, icon: "🌱", shortLabel: "সময়মতো বপন" },
      { text: "আলোক ফাঁদ ও আক্রান্ত গাছ অপসারণ", level: 2, icon: "💡", shortLabel: "আলোক ফাঁদ" },
      { text: "ট্রাইকোগ্রামা কার্ড স্থাপন", level: 3, icon: "🪳", shortLabel: "ট্রাইকোগ্রামা" },
      { text: "ফিপ্রোনিল স্প্রে (IRAC Group 4)", level: 4, icon: "⚗️", shortLabel: "ফিপ্রোনিল" },
    ],
  },
  {
    crop: "টমেটো (Tomato)",
    icon: "🍅",
    problem: "আর্লি ব্লাইট এর লক্ষণ দেখা দিচ্ছে",
    interventions: [
      { text: "রোগমুক্ত বীজ + ফসল আবর্তন", level: 1, icon: "🌱", shortLabel: "রোগমুক্ত বীজ" },
      { text: "নিচের পাতা সরান, পানি সেচে এড়িয়ে চলুন", level: 2, icon: "🧹", shortLabel: "পাতা সরানো" },
      { text: "ট্রাইকোডেরমা + ব্যাকটেরিয়া স্প্রে", level: 3, icon: "🦠", shortLabel: "ট্রাইকোডেরমা" },
      { text: "ম্যানকোজেব স্প্রে (FRAC Group M3)", level: 4, icon: "⚗️", shortLabel: "ম্যানকোজেব" },
    ],
  },
  {
    crop: "আলু (Potato)",
    icon: "🥔",
    problem: "লেট ব্লাইট দেখা দিয়েছে — জরুরি পরিস্থিতি",
    interventions: [
      { text: "প্রতিরোধী জাত নির্বাচন (আগে থেকে)", level: 1, icon: "🌱", shortLabel: "প্রতিরোধী জাত" },
      { text: "আক্রান্ত গাছ ধ্বংস + পাহাড়া স্থাপন", level: 2, icon: "🧹", shortLabel: "আক্রান্ত গাছ ধ্বংস" },
      { text: "ব্যাকটেরিয়া বিরোধী প্রাণী", level: 3, icon: "🦠", shortLabel: "জৈব নিয়ন্ত্রণ" },
      { text: "মেটালাক্সিল + ম্যানকোজেব জরুরি স্প্রে", level: 4, icon: "⚗️", shortLabel: "মেটালাক্সিল" },
    ],
  },
  {
    crop: "সরিষা (Mustard)",
    icon: "🌼",
    problem: "জাব পোকায় আক্রান্ত, সমস্যা বাড়ছে",
    interventions: [
      { text: "সঠিক সময়ে বপন + ফসল আবর্তন", level: 1, icon: "🌱", shortLabel: "সঠিক বপন" },
      { text: "নীল ট্র্যাপ + আক্রান্ত অংশ অপসারণ", level: 2, icon: "💡", shortLabel: "নীল ট্র্যাপ" },
      { text: "নিম তেল স্প্রে + প্রাকৃতিক শত্রু সংরক্ষণ", level: 3, icon: "🌿", shortLabel: "নিম তেল" },
      { text: "ইমিডাক্লোপ্রিড স্প্রে (IRAC Group 4A)", level: 4, icon: "⚗️", shortLabel: "ইমিডাক্লোপ্রিড" },
    ],
  },
  {
    crop: "বেগুন (Brinjal)",
    icon: "🍆",
    problem: "লাল মাকড়সা মাইটে আক্রান্ত",
    interventions: [
      { text: "সুষম সেচ + গাছের মাঝে ফাঁকা রাখুন", level: 1, icon: "🌱", shortLabel: "সুষম সেচ" },
      { text: "আক্রান্ত পাতা সরান + পানি স্প্রে", level: 2, icon: "🧹", shortLabel: "পাতা সরানো" },
      { text: "প্রাকৃতিক শত্রু (মাকড়সা, লেডিবাগ) সংরক্ষণ", level: 3, icon: "🕷️", shortLabel: "প্রাকৃতিক শত্রু" },
      { text: "আবামেকটিন স্প্রে", level: 4, icon: "⚗️", shortLabel: "আবামেকটিন" },
    ],
  },
];

const PYRAMID_LEVELS = [
  { level: 1, label: "১. প্রতিরোধ / Prevention", color: C.success, bg: "#f0fdf4", border: "#bbf7d0", icon: "🛡️" },
  { level: 2, label: "২. সাংস্কৃতিক / Cultural", color: C.blue, bg: "#eff6ff", border: "#bfdbfe", icon: "🔧" },
  { level: 3, label: "৩. জৈব / Biological", color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff", icon: "🦠" },
  {
    level: 4,
    label: "৪. রাসায়নিক / Chemical (শেষ উপায়)",
    color: C.danger,
    bg: "#fef2f2",
    border: "#fecaca",
    icon: "⚗️",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadHighScore() {
  try {
    return Number(localStorage.getItem("game-ipm-commander-high")) || 0;
  } catch {
    return 0;
  }
}
function saveHighScore(score) {
  try {
    const prev = loadHighScore();
    if (score > prev) localStorage.setItem("game-ipm-commander-high", score);
  } catch {}
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function ConfettiPiece({ delay, color, left }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -12,
        left: `${left}%`,
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        opacity: 0,
        animation: `ipmConfetti 1.4s ${delay}s ease-out forwards`,
      }}
    />
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** IPM Pyramid with selectable slot drops */
function IPMPyramidSlots({ slots, activeSlot, onSelectSlot, phase, showResult }) {
  const widths = ["92%", "82%", "70%", "56%"];
  const levelsReversed = [...PYRAMID_LEVELS].reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, margin: "12px 0 8px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 4, letterSpacing: 0.5 }}>
        🏛️ IPM পিরামিড — স্লটে কার্ড বসান
      </div>
      {levelsReversed.map((lv, i) => {
        const slotIdx = 3 - i; // level 4 → slot 3, level 1 → slot 0
        const card = slots[slotIdx];
        const isFlipping = activeSlot === slotIdx && !card;
        const levelMeta = PYRAMID_LEVELS[lv.level - 1];

        return (
          <button
            key={lv.level}
            onClick={() => phase === "selecting" && !showResult && !card && onSelectSlot(slotIdx)}
            disabled={phase !== "selecting" || showResult || !!card}
            style={{
              width: widths[i],
              padding: "12px 14px",
              background: card ? `${levelMeta.bg}dd` : isFlipping ? `${levelMeta.bg}` : `${levelMeta.bg}55`,
              border: card
                ? `2.5px solid ${levelMeta.color}`
                : isFlipping
                  ? `2.5px dashed ${levelMeta.color}`
                  : `2px dashed ${levelMeta.border}`,
              borderRadius: i === 0 ? "14px 14px 0 0" : i === 3 ? "0 0 14px 14px" : 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all .35s ease",
              animation: card ? "ipmBounceIn .5s ease" : isFlipping ? "ipmSlotPulse 1s ease infinite" : "none",
              boxShadow: card ? `0 0 18px ${levelMeta.color}33` : "none",
              cursor: phase === "selecting" && !showResult && !card ? "pointer" : "default",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{levelMeta.icon}</span>
            {card ? (
              <>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: levelMeta.color, flex: 1 }}>
                  {card.shortLabel || card.text}
                </span>
                <span style={{ fontSize: 22 }}>{card.icon}</span>
                {showResult && (
                  <span style={{ fontSize: 14, marginLeft: 4 }}>{card.level === lv.level ? "✅" : "❌"}</span>
                )}
              </>
            ) : (
              <span style={{ fontSize: 12, color: levelMeta.color, flex: 1, fontWeight: 600, opacity: 0.7 }}>
                {phase === "selecting" && !showResult
                  ? `${lv.label.split(" / ")[0]} — এখানে কার্ড বসান`
                  : lv.label.split(" / ")[0]}
              </span>
            )}
          </button>
        );
      })}
      <div style={{ fontSize: 10, color: C.textLight, marginTop: 2, textAlign: "center" }}>
        ↑ উপরের দিকে = শেষ উপায় (রাসায়নিক)
      </div>
    </div>
  );
}

/** Single revealed intervention card (always face-up) */
function InterventionCard({
  card,
  index: _index,
  onClick,
  disabled,
  picked,
  animDelay,
  showResult: _showResult,
  selectedForSlot,
}) {
  const levelMeta = PYRAMID_LEVELS[card.level - 1];
  const isSelected = selectedForSlot !== undefined && selectedForSlot !== null;

  return (
    <button
      onClick={onClick}
      disabled={disabled || picked}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: "100%",
        padding: "14px 10px",
        background: picked ? `${levelMeta.bg}cc` : isSelected ? `${levelMeta.bg}ee` : C.bgCard,
        border: picked
          ? `2.5px solid ${levelMeta.color}`
          : isSelected
            ? `2.5px solid ${C.primary}`
            : `1.5px solid ${C.border}`,
        borderRadius: 16,
        cursor: disabled || picked ? "default" : "pointer",
        opacity: disabled && !picked ? 0.5 : 1,
        boxShadow: picked ? `0 0 18px ${levelMeta.color}33` : isSelected ? `0 0 16px ${C.primary}33` : C.shadow,
        transition: "all .25s ease",
        animation: picked ? "ipmBounceIn .5s ease" : `ipmFlipIn .5s ${animDelay}s ease both`,
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Placed badge */}
      {picked && (
        <div
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: 24,
            height: 24,
            background: levelMeta.color,
            borderRadius: "0 14px 0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "#fff",
            animation: "ipmPopIn .3s ease",
          }}
        >
          ✓
        </div>
      )}

      {/* Selected for slot indicator */}
      {isSelected && !picked && (
        <div style={{ position: "absolute", top: 6, right: 6, fontSize: 16, animation: "ipmPulse 1s ease infinite" }}>
          👆
        </div>
      )}

      {/* Level tag (always visible) */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20,
          background: `${levelMeta.color}18`,
          color: levelMeta.color,
        }}
      >
        {levelMeta.label.split(" / ")[0]}
      </div>

      {/* Icon */}
      <div
        style={{
          fontSize: 32,
          animation: !picked && !disabled ? "ipmFloat 2.5s ease-in-out infinite" : "none",
          animationDelay: `${animDelay * 0.3}s`,
        }}
      >
        {card.icon}
      </div>

      {/* Text */}
      <div style={{ fontSize: 11.5, lineHeight: 1.55, fontWeight: 600, color: levelMeta.color }}>
        {card.shortLabel || card.text}
      </div>

      {/* Hint */}
      {!picked && !disabled && !isSelected && (
        <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>ট্যাপ করুন</div>
      )}
      {isSelected && !picked && (
        <div style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginTop: 2 }}>
          এখন পিরামিডে স্লট বেছে নিন 👆
        </div>
      )}
    </button>
  );
}

/** Round result banner */
function RoundResultBanner({ roundScore, perfectOrder, chemicalFirst, maxPossible }) {
  const pct = Math.round((roundScore / maxPossible) * 100);
  let msg = "",
    msgColor = C.textMuted;
  if (perfectOrder) {
    msg = "🎉 চমৎকার! পুরোপুরি সঠিক ক্রম!";
    msgColor = C.success;
  } else if (chemicalFirst) {
    msg = "⚠️ রাসায়নিক প্রথমে নেওয়া হয়েছে!";
    msgColor = C.danger;
  } else if (pct >= 50) {
    msg = "👍 মোটামুটি ভালো! আরও ভালো করতে পারবেন।";
    msgColor = C.warning;
  } else {
    msg = "🔄 IPM পিরামিড মনে রাখুন: প্রতিরোধ প্রথমে!";
    msgColor = C.danger;
  }

  return (
    <div
      style={{
        padding: "14px 18px",
        borderRadius: 14,
        background: perfectOrder ? "#f0fdf4" : chemicalFirst ? "#fef2f2" : "#fffbeb",
        border: `1.5px solid ${perfectOrder ? "#bbf7d0" : chemicalFirst ? "#fecaca" : "#fde68a"}`,
        animation: "ipmPopIn .45s ease",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: msgColor }}>{msg}</span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: perfectOrder ? C.success : C.text,
            animation: "ipmPopIn .5s ease",
          }}
        >
          +{roundScore}
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: C.textMuted }}>
        <span>✅ সঠিক স্থাপন: {Math.min(Math.max(roundScore, 0), 40)} পয়েন্ট</span>
        {perfectOrder && <span style={{ color: C.success, fontWeight: 700 }}>🏆 পারফেক্ট বোনাস: +২০</span>}
        {chemicalFirst && <span style={{ color: C.danger, fontWeight: 700 }}>❌ রাসায়নিক প্রথম: -১৫</span>}
      </div>
    </div>
  );
}

/** Progress dots */
function RoundProgress({ current, total, scores }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", margin: "8px 0" }}>
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        const sc = scores[i] ?? 0;
        let dotColor = C.border;
        if (done) {
          dotColor = sc >= 60 ? C.success : sc >= 30 ? C.warning : C.danger;
        }
        return (
          <div
            key={i}
            style={{
              width: active ? 28 : 22,
              height: active ? 28 : 22,
              borderRadius: "50%",
              background: active ? C.primary : done ? dotColor : C.bgMuted,
              border: `2px solid ${active ? C.primaryLight : done ? dotColor : C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: active ? "#fff" : done ? "#fff" : C.textLight,
              transition: "all .3s ease",
              animation: active ? "ipmPulse 1.5s ease infinite" : "none",
              boxShadow: active ? `0 0 12px ${C.primary}44` : "none",
            }}
            title={done ? `রাউন্ড ${i + 1}: ${sc} পয়েন্ট` : `রাউন্ড ${i + 1}`}
          >
            {done ? (sc >= 60 ? "★" : sc >= 30 ? "✓" : "✗") : active ? i + 1 : i + 1}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IPMCommander() {
  // phase: "start" | "flipping" | "selecting" | "result"
  const [phase, setPhase] = useState("start");
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [slots, setSlots] = useState([null, null, null, null]); // 4 pyramid slots
  const [selectedCardIdx, setSelectedCardIdx] = useState(null);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [perfectOrder, setPerfectOrder] = useState(false);
  const [chemicalFirst, setChemicalFirst] = useState(false);
  const [highScore, setHighScore] = useState(loadHighScore);

  const { speak, stop, speaking, isSupported } = useTTS();
  const flipTimerRef = useRef(null);

  const round = ROUNDS[roundIndex];
  const maxPossible = 60;

  // ─── Auto-flip cards one by one ───
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (phase !== "flipping") {
      clearInterval(flipTimerRef.current);
      return;
    }

    let count = 0;
    setRevealedCount(0);

    flipTimerRef.current = setInterval(() => {
      count++;
      setRevealedCount(count);

      // Speak each card as it reveals
      if (count <= 4 && isSupported) {
        const card = shuffledCards[count - 1];
        if (card) {
          const levelLabel = PYRAMID_LEVELS[card.level - 1]?.label.split(" / ")[0] || "";
          speak(`${levelLabel}: ${card.shortLabel || card.text}`);
        }
      }

      if (count >= 4) {
        clearInterval(flipTimerRef.current);
        // Transition to selecting phase
        setTimeout(() => {
          setPhase("selecting");
          if (isSupported) {
            speak("সব কার্ড দেখা হয়েছে। এখন IPM পিরামিডে সঠিক ক্রমে বসান। প্রতিরোধ প্রথমে, রাসায়নিক শেষে।", {
              prependFriendly: true,
            });
          }
        }, 800);
      }
    }, 1200); // 1.2 seconds between each flip

    return () => clearInterval(flipTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/isSupported from useTTS have unstable refs; shuffledCards set within this effect
  }, [phase, roundIndex]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Shuffle cards when round changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (phase !== "flipping") return;
    const shuffled = shuffle(round.interventions);
    const withIdx = shuffled.map((c, i) => ({ ...c, shuffledIdx: i }));
    setShuffledCards(withIdx);
    setSlots([null, null, null, null]);
    setSelectedCardIdx(null);
    setShowRoundResult(false);
    setRoundScore(0);
    setPerfectOrder(false);
    setChemicalFirst(false);
    setRevealedCount(0);

    // Announce the round
    if (isSupported) {
      speak(`রাউন্ড ${roundIndex + 1}। ${round.crop}। ${round.problem}। কার্ডগুলো এখন খুলছে, দেখুন।`, {
        prependFriendly: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/isSupported from useTTS have unstable refs; round.* derived from roundIndex already in deps
  }, [roundIndex, phase]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save high score
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (phase === "result") {
      saveHighScore(totalScore);
      setHighScore(loadHighScore());
    }
  }, [phase, totalScore]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ─── Handle card selection (tap a card to select it) ───
  const handleCardSelect = useCallback(
    (cardIndex) => {
      if (phase !== "selecting" || showRoundResult) return;
      // If already placed, ignore
      const card = shuffledCards[cardIndex];
      if (slots.some((s) => s && s.shuffledIdx === card.shuffledIdx)) return;
      setSelectedCardIdx(cardIndex === selectedCardIdx ? null : cardIndex);
    },
    [phase, shuffledCards, slots, selectedCardIdx, showRoundResult],
  );

  // ─── Handle pyramid slot selection (place selected card into slot) ───
  const handleSlotSelect = useCallback(
    (slotIdx) => {
      if (selectedCardIdx === null) return;
      const card = shuffledCards[selectedCardIdx];
      const newSlots = [...slots];
      newSlots[slotIdx] = card;
      setSlots(newSlots);
      setSelectedCardIdx(null);

      // Speak placement
      if (isSupported) {
        const levelLabel = PYRAMID_LEVELS[slotIdx]?.label.split(" / ")[0] || "";
        speak(`${levelLabel} স্লটে: ${card.shortLabel || card.text}`);
      }

      // Check if all 4 slots filled
      if (newSlots.every((s) => s !== null)) {
        // Calculate score
        let score = 0;
        for (let i = 0; i < 4; i++) {
          if (newSlots[i].level === i + 1) score += 10;
        }
        const isPerfect = newSlots.every((s, i) => s.level === i + 1);
        const hasChemicalFirst = newSlots[0]?.level === 4;

        if (isPerfect) score += 20;
        if (hasChemicalFirst) score -= 15;
        score = Math.max(0, score);

        setRoundScore(score);
        setPerfectOrder(isPerfect);
        setChemicalFirst(hasChemicalFirst);

        setTimeout(() => setShowRoundResult(true), 600);

        // Speak result
        setTimeout(() => {
          if (isSupported) {
            if (isPerfect) speak("অসাধারণ! পুরোপুরি সঠিক! 🎉");
            else if (hasChemicalFirst) speak("সাবধান! রাসায়নিক প্রথমে দেওয়া হয়েছে! প্রতিরোধ সবসময় প্রথমে।");
            else speak(`পয়েন্ট ${score}। আরও ভালো করতে পারবেন!`);
          }
        }, 800);
      }
       
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak from useTTS has unstable ref; isSupported already in deps
    [selectedCardIdx, shuffledCards, slots, isSupported],
  );

  const handleNextRound = useCallback(() => {
    const newScores = [...roundScores, roundScore];
    setRoundScores(newScores);
    const newTotal = totalScore + roundScore;
    setTotalScore(newTotal);
    if (roundIndex < 5) {
      setRoundIndex((prev) => prev + 1);
      setPhase("flipping");
    } else {
      setPhase("result");
    }
  }, [roundScore, roundScores, totalScore, roundIndex]);

  const startGame = useCallback(() => {
    setPhase("flipping");
    setRoundIndex(0);
    setTotalScore(0);
    setRoundScores([]);
    setSlots([null, null, null, null]);
    setSelectedCardIdx(null);
    setShowRoundResult(false);
    setRoundScore(0);
    if (isSupported) speak("IPM কমান্ডার শুরু! প্রতিরোধ প্রথমে, রাসায়নিক শেষে!", { prependFriendly: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak from useTTS has unstable ref; isSupported already in deps
  }, [isSupported]);

  // ─── RENDER: Start Screen ─────────────────────────────────────────────────
  if (phase === "start") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center", animation: "ipmFadeIn .6s ease" }}>
          <div style={{ fontSize: 64, marginBottom: 8, animation: "ipmFloat 3s ease-in-out infinite" }}>🏛️</div>
          <h1
            className="ud-headline"
            style={{ fontSize: 28, fontWeight: 800, color: C.primaryDark, marginBottom: 4, lineHeight: 1.3 }}
          >
            IPM কমান্ডার
          </h1>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>
            CABI Step 5 — সমন্বিত পোকা ব্যবস্থাপনা শিখুন
          </p>

          {/* IPM Pyramid preview */}
          <div
            style={{
              background: C.bgCard,
              borderRadius: 20,
              padding: "16px 12px",
              boxShadow: C.shadowMd,
              marginBottom: 20,
              border: `1.5px solid ${C.border}`,
            }}
          >
            {PYRAMID_LEVELS.map((lv, i) => (
              <div
                key={lv.level}
                style={{
                  width: `${90 - i * 10}%`,
                  margin: "0 auto 2px",
                  padding: "8px 10px",
                  background: lv.bg,
                  borderRadius: 6,
                  borderLeft: `4px solid ${lv.color}`,
                  textAlign: "left",
                  animation: `ipmFadeIn .4s ${i * 0.1}s ease both`,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: lv.color }}>{lv.label.split(" / ")[0]}</span>
              </div>
            ))}
          </div>

          {/* How to play */}
          <div
            style={{
              background: C.bgCard,
              borderRadius: 16,
              padding: "16px 18px",
              boxShadow: C.shadow,
              marginBottom: 20,
              textAlign: "left",
              border: `1.5px solid ${C.border}`,
              animation: "ipmFadeIn .5s .2s ease both",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: C.primary, marginBottom: 10 }}>📖 কিভাবে খেলবেন</div>
            {[
              "🏠 ফসলের সমস্যা দেখুন ও গুরুত্ব বুঝুন",
              "🎴 ৪টি কার্ড একে একে খুলবে — ভালো করে দেখুন",
              "👆 একটি কার্ড ট্যাপ করুন, তারপর পিরামিডে স্লটে বসান",
              "🏛️ পিরামিড সঠিক ক্রমে পূরণ করুন (নিচ → উপর)",
              "🛡️ প্রতিরোধ = প্রথম, রাসায়নিক = শেষ উপায়",
              "🏆 ৬ রাউন্ড — সর্বোচ্চ স্কোর করুন!",
            ].map((line, i) => (
              <div
                key={i}
                style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 6, lineHeight: 1.6, paddingLeft: 4 }}
              >
                {line}
              </div>
            ))}
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: "#fffbeb",
                borderRadius: 10,
                border: "1px solid #fde68a",
                fontSize: 11.5,
                color: C.warning,
                fontWeight: 600,
                lineHeight: 1.6,
              }}
            >
              ⚡ স্কোরিং: সঠিক স্থাপন +১০ | পারফেক্ট ক্রম +২০ | রাসায়নিক প্রথমে -১৫
            </div>
          </div>

          {highScore > 0 && (
            <div
              style={{
                fontSize: 13,
                color: C.accent,
                fontWeight: 700,
                marginBottom: 16,
                animation: "ipmPulse 2s ease infinite",
              }}
            >
              🏆 সর্বোচ্চ স্কোর: {highScore}
            </div>
          )}

          <button
            onClick={startGame}
            style={{
              width: "100%",
              padding: "16px 0",
              border: "none",
              borderRadius: 16,
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
              color: "#fff",
              fontSize: 17,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 6px 20px ${C.primary}55`,
              transition: "all .2s ease",
              animation: "ipmPopIn .5s .4s ease both",
              fontFamily: "'Noto Sans Bengali', sans-serif",
            }}
          >
            🚀 খেলা শুরু করুন
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: Result Screen ────────────────────────────────────────────────
  if (phase === "result") {
    const isNewHigh = totalScore >= highScore && totalScore > 0;
    const grade =
      totalScore >= 200
        ? { label: "S — IPM মাস্টার! 🌟", color: C.accent }
        : totalScore >= 150
          ? { label: "A — দক্ষ কৃষক! 🌿", color: C.success }
          : totalScore >= 100
            ? { label: "B — ভালো চেষ্টা! 👍", color: C.blue }
            : totalScore >= 50
              ? { label: "C — আরও অনুশীলন দরকার 📚", color: C.warning }
              : { label: "D — আবার চেষ্টা করুন 🔄", color: C.danger };
    const confettiColors = ["#f59e0b", "#16a34a", "#2563eb", "#7c3aed", "#dc2626", "#ec4899"];
    /* eslint-disable react-hooks/purity */
    const confetti =
      totalScore >= 100
        ? Array.from({ length: 18 }, (_, i) => (
            <ConfettiPiece
              key={i}
              delay={Math.random() * 1.2}
              color={confettiColors[i % confettiColors.length]}
              left={Math.random() * 90 + 5}
            />
          ))
        : null;
    /* eslint-enable react-hooks/purity */

    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {confetti}
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center", animation: "ipmFadeIn .6s ease" }}>
          <div style={{ fontSize: 72, marginBottom: 8, animation: "ipmFloat 3s ease-in-out infinite" }}>
            {totalScore >= 200 ? "🏆" : totalScore >= 100 ? "🌟" : totalScore >= 50 ? "📘" : "🌱"}
          </div>
          <h1 className="ud-headline" style={{ fontSize: 26, fontWeight: 800, color: C.primaryDark, marginBottom: 4 }}>
            খেলা শেষ!
          </h1>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: grade.color,
              marginBottom: 4,
              animation: "ipmPopIn .5s .2s ease both",
              textShadow: `0 2px 12px ${grade.color}44`,
            }}
          >
            {totalScore}
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>
            / {ROUNDS.length * maxPossible} সর্বোচ্চ
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: grade.color,
              marginBottom: 16,
              animation: "ipmFadeIn .4s .3s ease both",
            }}
          >
            {grade.label}
          </div>
          {isNewHigh && (
            <div
              style={{
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: 30,
                background: `linear-gradient(135deg, ${C.accent}, #fbbf24)`,
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                marginBottom: 16,
                animation: "ipmPulse 1.5s ease infinite",
                boxShadow: `0 4px 16px ${C.accent}55`,
              }}
            >
              🎉 নতুন সর্বোচ্চ স্কোর!
            </div>
          )}
          <div
            style={{
              background: C.bgCard,
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: C.shadow,
              marginBottom: 20,
              textAlign: "left",
              border: `1.5px solid ${C.border}`,
              animation: "ipmFadeIn .5s .35s ease both",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 10 }}>
              📊 রাউন্ড ভিত্তিক ফলাফল
            </div>
            {ROUNDS.map((r, i) => {
              const sc = roundScores[i] ?? 0;
              const pct = sc / maxPossible;
              const barColor = pct >= 0.9 ? C.success : pct >= 0.5 ? C.warning : C.danger;
              return (
                <div key={i} style={{ marginBottom: 8, animation: `ipmFadeIn .35s ${i * 0.08}s ease both` }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}
                  >
                    <span style={{ fontSize: 12, color: C.text }}>
                      {r.icon} {r.crop} — রাউন্ড {i + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{sc}</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: C.bgMuted, borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct * 100}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: barColor,
                        transition: "width .6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              padding: "12px 16px",
              background: "#f0fdf4",
              borderRadius: 12,
              border: "1px solid #bbf7d0",
              fontSize: 12,
              color: C.success,
              textAlign: "center",
              lineHeight: 1.65,
              marginBottom: 20,
              animation: "ipmFadeIn .4s .5s ease both",
            }}
          >
            💡 মনে রাখুন: <strong>প্রতিরোধ → সাংস্কৃতিক → জৈব → রাসায়নিক</strong>
            <br />
            রাসায়নিক কীটনাশক সবসময় <strong>শেষ উপায়</strong>
          </div>
          <div style={{ display: "flex", gap: 10, animation: "ipmFadeIn .4s .55s ease both" }}>
            <button
              onClick={startGame}
              style={{
                flex: 1,
                padding: "14px 0",
                border: "none",
                borderRadius: 14,
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 4px 16px ${C.primary}44`,
                fontFamily: "'Noto Sans Bengali', sans-serif",
              }}
            >
              🔄 আবার খেলুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Playing Screen (flipping + selecting) ────────────────────────
  const _allPlaced = slots.every((s) => s !== null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif",
        paddingBottom: 40,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 16px rgba(0,33,9,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{round.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
              রাউন্ড {roundIndex + 1} / {ROUNDS.length}
            </div>
            <div style={{ fontSize: 10, color: "#ffffffaa" }}>{round.crop}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.accent }}>
              {totalScore + (showRoundResult ? roundScore : 0)}
            </div>
            <div style={{ fontSize: 9, color: "#ffffffaa", fontWeight: 600 }}>স্কোর</div>
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.15)",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            🏆 {Math.max(highScore, totalScore)}
          </div>
        </div>
      </div>

      {/* Round progress */}
      <div style={{ padding: "10px 16px 0" }}>
        <RoundProgress current={roundIndex} total={ROUNDS.length} scores={roundScores} />
      </div>

      {/* Problem scenario */}
      <div style={{ padding: "8px 16px 0", animation: "ipmFadeIn .4s ease" }}>
        <div
          style={{
            background: "#fff7ed",
            borderRadius: 14,
            padding: "14px 16px",
            border: "1.5px solid #fde68a",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0, animation: "ipmFloat 3s ease-in-out infinite" }}>
            {round.icon}
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.warning, marginBottom: 3 }}>⚠️ সমস্যা</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, fontWeight: 600 }}>{round.problem}</div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
              {phase === "flipping"
                ? revealedCount < 4
                  ? "🎴 কার্ড খুলছে..."
                  : "✅ সব কার্ড খুলেছে!"
                : "👆 কার্ড ট্যাপ করুন, তারপর পিরামিড স্লটে বসান"}
            </div>
          </div>
        </div>
      </div>

      {/* Symptom Images */}
      <div style={{ padding: "8px 16px 0" }}>
        <SymptomImageGallery images={IPM_COMMANDER_IMAGES[round.problem] || []} label={round.problem} />
      </div>

      {/* Phase indicator */}
      <div style={{ padding: "6px 16px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 12,
            background: phase === "flipping" ? "#eff6ff" : "#f0fdf4",
            border: `1px solid ${phase === "flipping" ? "#bfdbfe" : "#bbf7d0"}`,
            fontSize: 12,
            fontWeight: 700,
            color: phase === "flipping" ? C.blue : C.success,
            animation: "ipmFadeIn .3s ease",
          }}
        >
          <span style={{ fontSize: 16 }}>{phase === "flipping" ? "🎴" : "👆"}</span>
          {phase === "flipping" ? `${revealedCount}/৪ কার্ড খুলেছে` : `${slots.filter(Boolean).length}/৪ স্লট পূর্ণ`}
        </div>
      </div>

      {/* IPM Pyramid with slots */}
      <div style={{ padding: "10px 16px 0", animation: "ipmFadeIn .4s .1s ease both" }}>
        <IPMPyramidSlots
          slots={slots}
          activeSlot={selectedCardIdx !== null ? null : undefined}
          onSelectSlot={handleSlotSelect}
          phase={phase}
          showResult={showRoundResult}
        />
      </div>

      {/* Intervention cards grid */}
      <div style={{ padding: "8px 16px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 6, textAlign: "center" }}>
          {phase === "flipping" ? "🎴 কার্ড একে একে খুলছে..." : "👆 কার্ড ট্যাপ করুন, তারপর পিরামিডে স্লট বেছে নিন"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {shuffledCards.map((card, i) => {
            const isPlaced = slots.some((s) => s && s.shuffledIdx === card.shuffledIdx);
            return (
              <InterventionCard
                key={`${roundIndex}-${i}`}
                card={card}
                index={i}
                onClick={() => handleCardSelect(i)}
                disabled={phase === "flipping" || isPlaced}
                picked={isPlaced}
                animDelay={i * 0.15}
                showResult={showRoundResult}
                selectedForSlot={selectedCardIdx === i ? true : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Audio helper */}
      {isSupported && (
        <div style={{ padding: "8px 16px 0" }}>
          <button
            onClick={() => {
              stop();
              if (phase === "flipping") speak(`${round.crop}। ${round.problem}। কার্ডগুলো খুলছে, দেখুন।`);
              else
                speak(
                  `${round.crop}। ${round.problem}। প্রতিরোধ প্রথমে, রাসায়নিক শেষে। কার্ড ট্যাপ করে পিরামিডে বসান।`,
                );
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: `1.5px solid ${speaking ? C.success : C.border}`,
              background: speaking ? "#f0fdf4" : C.bgMuted,
              color: speaking ? C.success : C.textMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 18 }}>🔊</span>
            {speaking ? "শুনছি..." : "নির্দেশনা শুনুন"}
          </button>
        </div>
      )}

      {/* Round result section */}
      {showRoundResult && (
        <div style={{ padding: "14px 16px 0", animation: "ipmFadeIn .4s ease" }}>
          <RoundResultBanner
            roundScore={roundScore}
            perfectOrder={perfectOrder}
            chemicalFirst={chemicalFirst}
            maxPossible={maxPossible}
          />

          {/* Next round button */}
          <button
            onClick={handleNextRound}
            style={{
              width: "100%",
              padding: "14px 0",
              border: "none",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 4px 16px ${C.primary}44`,
              fontFamily: "'Noto Sans Bengali', sans-serif",
              animation: "ipmPopIn .4s ease both",
            }}
          >
            {roundIndex < 5 ? `➡️ পরবর্তী রাউন্ড (${roundIndex + 2}/6)` : "🏁 ফলাফল দেখুন"}
          </button>
        </div>
      )}
    </div>
  );
}
