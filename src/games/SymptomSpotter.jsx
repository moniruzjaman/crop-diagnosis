import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { SYMPTOM_SPOTTER_IMAGES } from "./imageMap";
import useTTS from "./useTTS";
import SymptomImageGallery from "./SymptomImageGallery";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#006a4e",
  primaryLight: "#0b8457",
  primaryDark: "#00503a",
  accent: "#f42a41",
  accentLight: "#ff4d61",
  accentDark: "#d6182e",
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

const SCENARIOS = [
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "ধানের মাকু আকৃতির ধূসর দাগ",
    correct: "ব্লাস্ট (Blast)",
    wrong: ["ব্যাকটেরিয়াল লিফ ব্লাইট", "শিথ ব্লাইট", "পাতামোড়া পোকা"],
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "পাতার কিনারা হলুদ-বাদামি",
    correct: "ব্যাকটেরিয়াল লিফ ব্লাইট",
    wrong: ["ব্লাস্ট", "শিথ ব্লাইট", "খইরা রোগ"],
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "কান্ডে ডিম্বাকৃতি ধূসর দাগ",
    correct: "শিথ ব্লাইট",
    wrong: ["ব্লাস্ট", "পাতামোড়া পোকা", "ব্যাকটেরিয়াল লিফ ব্লাইট"],
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "নতুন পাতায় বাদামি মরচে দাগ, বৃদ্ধি থমকে",
    correct: "জিংক অভাব (খইরা)",
    wrong: ["নাইট্রোজেন অভাব", "আয়রন অভাব", "বোরন অভাব"],
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "নিচের পাতা হলুদ, বৃদ্ধি কম",
    correct: "নাইট্রোজেন অভাব",
    wrong: ["জিংক অভাব", "আয়রন অভাব", "পটাশিয়াম অভাব"],
  },
  {
    crop: "টমেটো (Tomato)",
    icon: "🍅",
    symptom: "কালো বৃত্তাকার দাগ, হলুদ বলয়",
    correct: "আর্লি ব্লাইট",
    wrong: ["লেট ব্লাইট", "পাউডারি মিলডিউ", "ব্যাকটেরিয়াল উইল্ট"],
  },
  {
    crop: "টমেটো (Tomato)",
    icon: "🍅",
    symptom: "পানিভেজা দাগ দ্রুত কালো হয়",
    correct: "লেট ব্লাইট",
    wrong: ["আর্লি ব্লাইট", "পাউডারি মিলডিউ", "সেপ্টোরিয়া"],
  },
  {
    crop: "আলু (Potato)",
    icon: "🥔",
    symptom: "পানিভেজা দাগ দ্রুত বড় হয়, পাতা ঝরে",
    correct: "লেট ব্লাইট",
    wrong: ["আর্লি ব্লাইট", "ব্যাকটেরিয়াল উইল্ট", "টিউবার রট"],
  },
  {
    crop: "সরিষা (Mustard)",
    icon: "🌼",
    symptom: "পাতা কুঁকড়ানো, মধুরস, পিঁপড়া",
    correct: "জাব পোকা (Aphid)",
    wrong: ["থ্রিপস", "ডায়মন্ড ব্যাক মথ", "সাদা মাছি"],
  },
  {
    crop: "বেগুন (Brinjal)",
    icon: "🍆",
    symptom: "পাতায় সূক্ষ্ম জাল, হলুদ ও ঝরা",
    correct: "লাল মাকড়সা মাইট",
    wrong: ["থ্রিপস", "জাব পোকা", "সাদা মাছি"],
  },
  {
    crop: "বেগুন (Brinjal)",
    icon: "🍆",
    symptom: "পাতায় রুপালি দাগ",
    correct: "থ্রিপস",
    wrong: ["মাইট", "জাব পোকা", "মাজরা পোকা"],
  },
  {
    crop: "বাঁধাকপি (Cabbage)",
    icon: "🥬",
    symptom: "পাতায় অনিয়মিত ছিদ্র, লার্ভা",
    correct: "ডায়মন্ড ব্যাক মথ",
    wrong: ["ক্যাবেজ ম্যাগট", "আফিড", "থ্রিপস"],
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "মরা ডিল, সাদা শীষ",
    correct: "মাজরা পোকা",
    wrong: ["বাদামি গাছফড়িং", "পাতামোড়া পোকা", "ব্লাস্ট"],
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "পাতা মোড়ানো (সুতার মতো)",
    correct: "পাতামোড়া পোকা",
    wrong: ["মাজরা পোকা", "ব্লাস্ট", "গাছফড়িং"],
  },
  {
    crop: "সবজি (Vegetables)",
    icon: "🥬",
    symptom: "পাতায় সাদা গুঁড়া আবরণ",
    correct: "পাউডারি মিলডিউ",
    wrong: ["ডাউনি মিলডিউ", "আর্লি ব্লাইট", "ব্যাকটেরিয়াল স্পট"],
  },
  {
    crop: "সরিষা (Mustard)",
    icon: "🌼",
    symptom: "ফুল ঝরা, ফল বিকৃত",
    correct: "বোরন অভাব",
    wrong: ["নাইট্রোজেন অভাব", "ফসফরাস অভাব", "পটাশিয়াম অভাব"],
  },
];

const TOTAL_ROUNDS = 10;
const TIME_PER_Q = 15;
const STORAGE_KEY = "game-symptom-spotter-high";

/* ── helpers ────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions() {
  return shuffle(SCENARIOS).slice(0, TOTAL_ROUNDS);
}

function getChoices(scenario) {
  return shuffle([scenario.correct, ...scenario.wrong]);
}

function getHighScore() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    const prev = getHighScore();
    if (score > prev) localStorage.setItem(STORAGE_KEY, score);
  } catch {
    /* noop */
  }
}

function resultMessage(score) {
  const _max = TOTAL_ROUNDS * 15; // 10 correct + 5 streak max theoretical
  if (score >= 100) return { emoji: "🏆", text: "অসাধারণ! আপনি একজন রোগ নির্ণয় বিশেষজ্ঞ!", color: "#f59e0b" };
  if (score >= 75) return { emoji: "🌟", text: "চমৎকার! আপনার লক্ষণ চিনতে খুব ভালো হয়েছে!", color: "#16a34a" };
  if (score >= 50) return { emoji: "👍", text: "ভালো চেষ্টা! আরেকটু অনুশীলন করলেই হবে।", color: "#2563eb" };
  if (score >= 25) return { emoji: "💪", text: "চেষ্টা চালিয়ে যান! আরও অনুশীলন প্রয়োজন।", color: "#d97706" };
  return { emoji: "📖", text: "আবার চেষ্টা করুন! লক্ষণ চেনার অনুশীলন করুন।", color: "#dc2626" };
}

/* ── inject keyframes ───────────────────────────────── */
function injectStyles() {
  if (typeof document === "undefined") return;
  const id = "symptom-spotter-keyframes";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @keyframes ss-popIn {
      0%   { transform: scale(0.85); opacity: 0; }
      60%  { transform: scale(1.03); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes ss-fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ss-shake {
      0%, 100% { transform: translateX(0); }
      20%  { transform: translateX(-6px); }
      40%  { transform: translateX(6px); }
      60%  { transform: translateX(-4px); }
      80%  { transform: translateX(4px); }
    }
    @keyframes ss-pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.4); }
      50%      { box-shadow: 0 0 0 10px rgba(22,163,74,0); }
    }
    @keyframes ss-timer-pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.6; }
    }
    @keyframes ss-score-pop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.35); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(s);
}

/* ── Choice Button sub-component ────────────────────── */
function ChoiceButton({ label, index, state, onClick, disabled }) {
  let bg = C.bgCard;
  let border = C.border;
  let color = C.text;
  let extra = {};

  if (state === "correct") {
    bg = "#dcfce7";
    border = C.success;
    extra = { animation: "ss-pulse-glow 0.6s ease-in-out" };
  } else if (state === "wrong") {
    bg = "#fef2f2";
    border = C.danger;
    extra = { animation: "ss-shake 0.4s ease-in-out" };
  } else if (state === "reveal") {
    bg = "#f0fdf4";
    border = C.success;
    color = C.success;
  }

  const labels = ["ক", "খ", "গ", "ঘ"];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "14px 18px",
        borderRadius: 14,
        border: `2px solid ${border}`,
        background: bg,
        color,
        fontSize: 16,
        fontWeight: 500,
        fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.25s ease",
        opacity: state === "wrong" ? 0.7 : 1,
        textAlign: "left",
        animation: "ss-fadeIn 0.35s ease-out",
        animationDelay: `${index * 0.08}s`,
        animationFillMode: "backwards",
        ...extra,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
          background: state === "correct" ? C.success : state === "wrong" ? C.danger : C.bgMuted,
          color: state === "correct" || state === "wrong" ? "#fff" : C.textMuted,
        }}
      >
        {labels[index]}
      </span>
      <span style={{ flex: 1, lineHeight: 1.45 }}>{label}</span>
      {state === "correct" && <span style={{ fontSize: 20, animation: "ss-popIn 0.4s ease-out" }}>✅</span>}
      {state === "wrong" && <span style={{ fontSize: 20, animation: "ss-popIn 0.3s ease-out" }}>❌</span>}
    </button>
  );
}

/* ── Timer Bar sub-component ────────────────────────── */
function TimerBar({ timeLeft, max }) {
  const pct = (timeLeft / max) * 100;
  const isLow = timeLeft <= 5;
  const barColor = isLow
    ? `linear-gradient(90deg, ${C.danger}, #f87171)`
    : pct < 40
      ? `linear-gradient(90deg, ${C.warning}, #fbbf24)`
      : `linear-gradient(90deg, ${C.success}, ${C.accentLight})`;

  return (
    <div
      style={{
        width: "100%",
        height: 8,
        borderRadius: 99,
        background: C.bgMuted,
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 99,
          background: barColor,
          transition: "width 0.3s linear",
          animation: isLow ? "ss-timer-pulse 0.5s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function SymptomSpotter() {
  /* ── state ─────────────────────────────── */
  const [phase, setPhase] = useState("start"); // "start" | "playing" | "result"
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [answers, setAnswers] = useState([]); // {chosen, correct, isCorrect, timeBonus}
  const [selectedIdx, setSelectedIdx] = useState(null); // index into choices[]
  const [locked, setLocked] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  const [isNewHigh, setIsNewHigh] = useState(false);

  const timerRef = useRef(null);
  const currentQ = questions[qIdx] || null;
  const choices = useMemo(() => (currentQ ? getChoices(currentQ) : []), [currentQ]);

  /* ── TTS for illiterate farmers ──────── */
  const { speak, stop, speaking, isSupported } = useTTS();

  /* ── auto-speak question on load ─────── */
  useEffect(() => {
    if (phase === "playing" && currentQ && isSupported) {
      const text = `${currentQ.crop}। ${currentQ.symptom}। এই লক্ষণের কারণ কী?`;
      speak(text);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/stop/isSupported from useTTS have unstable refs; currentQ derived from qIdx already in deps
  }, [qIdx, phase]);

  /* ── inject keyframes on mount ─────────── */
  useEffect(() => {
    injectStyles();
  }, []);

  /* ── timer ─────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase !== "playing" || locked) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase, qIdx, locked, clearTimer]);

  /* ── speak result feedback ───────────── */
  useEffect(() => {
    if (locked && isSupported && answers.length > 0) {
      const lastAnswer = answers[answers.length - 1];
      if (lastAnswer.isCorrect) {
        speak("সঠিক! খুব ভালো!");
      } else {
        speak(`ভুল। সঠিক উত্তর: ${currentQ.correct}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/isSupported from useTTS have unstable refs; answers/currentQ.correct intentionally omitted—effect should only fire on lock state change
  }, [locked]);

  /* ── handle answer ─────────────────────── */
  const handleAnswer = useCallback(
    (choiceIdx) => {
      if (locked) return;
      setLocked(true);
      clearTimer();
      setSelectedIdx(choiceIdx);

      const chosen = choiceIdx !== null ? choices[choiceIdx] : null;
      const isCorrect = chosen === currentQ.correct;

      let gained = 0;
      if (isCorrect) {
        gained = 10;
        if (streak >= 2) gained += 5;
      } else {
        gained = -3;
      }

      const newScore = score + gained;
      setScore(newScore);
      setStreak(isCorrect ? streak + 1 : 0);
      if (isCorrect) setScorePop(true);

      const entry = { chosen, correct: currentQ.correct, isCorrect, gained };
      setAnswers((prev) => [...prev, entry]);

      // move to next after delay
      setTimeout(() => {
        setScorePop(false);
        if (qIdx + 1 >= TOTAL_ROUNDS) {
          // game over — check high score BEFORE saving
          const prevHigh = getHighScore();
          const isNew = newScore > prevHigh && newScore > 0;
          saveHighScore(newScore);
          setIsNewHigh(isNew);
          setPhase("result");
        } else {
          setQIdx((i) => i + 1);
          setTimeLeft(TIME_PER_Q);
          setSelectedIdx(null);
          setLocked(false);
        }
      }, 1400);
    },
    [locked, clearTimer, choices, currentQ, score, streak, qIdx],
  );

  /* ── handle timeout ────────────────────── */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (phase !== "playing" || locked || timeLeft > 0) return;
    // time ran out → treat as wrong
    handleAnswer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, locked]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ── start game ────────────────────────── */
  const startGame = () => {
    const qs = pickQuestions();
    setQuestions(qs);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(TIME_PER_Q);
    setAnswers([]);
    setSelectedIdx(null);
    setLocked(false);
    setIsNewHigh(false);
    setPhase("playing");
  };

  /* ── result data ───────────────────────── */
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  const accuracy = answers.length ? Math.round((totalCorrect / answers.length) * 100) : 0;
  const msg = resultMessage(score);
  const highScore = getHighScore();

  /* ═════════════ RENDER ═══════════════════════ */

  /* ── START SCREEN ──────────────────────── */
  if (phase === "start") {
    return (
      <div style={{ ...styles.wrapper, animation: "ss-fadeIn 0.5s ease-out" }}>
        <div style={styles.card(C, "ss-popIn")}>
          {/* header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 64, marginBottom: 10 }}>🔍</div>
            <h1 style={{ ...styles.title(C), margin: "0 0 6px" }}>লক্ষণ লক্ষ্য</h1>
            <p style={{ ...styles.subtitle(C) }}>Symptom Spotter</p>
          </div>

          {/* rules */}
          <div style={styles.rulesBox(C)}>
            <h3 style={{ ...styles.sectionTitle(C), marginBottom: 14 }}>🎮 কীভাবে খেলবেন</h3>
            <div style={styles.ruleList(C)}>
              <Rule icon="1️⃣" text="ফসলের লক্ষণ দেখুন এবং সঠিক রোগ/পোকা চিনুন" />
              <Rule icon="2️⃣" text="প্রতি প্রশ্নে ৪টি বিকল্প থাকবে" />
              <Rule icon="⏱️" text="প্রতি প্রশ্নে ১৫ সেকেন্ড সময়" />
              <Rule icon="✅" text="সঠিক উত্তরে +১০ পয়েন্ট" />
              <Rule icon="❌" text="ভুল উত্তরে -৩ পয়েন্ট" />
              <Rule icon="🔥" text="২+ স্ট্রিকে বোনাস +৫ পয়েন্ট" />
            </div>
          </div>

          {/* high score */}
          {highScore > 0 && (
            <div style={styles.highScoreBox(C)} key={highScore}>
              <span style={{ fontSize: 18 }}>🏅</span>
              <span style={{ color: C.textMuted, fontSize: 15, fontWeight: 600 }}>
                সর্বোচ্চ স্কোর: <span style={{ color: C.accentDark, fontSize: 18 }}>{highScore}</span>
              </span>
            </div>
          )}

          {/* start button */}
          <button onClick={startGame} style={styles.startBtn(C)}>
            <span style={{ marginRight: 8 }}>🚀</span>
            শুরু করুন
          </button>

          <p style={{ ...styles.meta(C), marginTop: 20 }}>
            মোট {TOTAL_ROUNDS}টি প্রশ্ন • {SCENARIOS.length}টি লক্ষণ ডেটাবেস
          </p>
        </div>
      </div>
    );
  }

  /* ── PLAYING SCREEN ────────────────────── */
  if (phase === "playing" && currentQ) {
    return (
      <div style={{ ...styles.wrapper, animation: "ss-fadeIn 0.35s ease-out" }}>
        <div style={styles.card(C, "ss-popIn")} key={qIdx}>
          {/* top bar */}
          <div style={styles.topBar(C)}>
            <div style={styles.roundBadge(C)}>
              {qIdx + 1} / {TOTAL_ROUNDS}
            </div>
            <div style={{ ...styles.scoreDisplay(C), animation: scorePop ? "ss-score-pop 0.4s ease-out" : "none" }}>
              ⭐ {score}
            </div>
            {streak >= 2 && (
              <div style={styles.streakBadge} key={streak}>
                🔥 {streak}
              </div>
            )}
          </div>

          {/* timer */}
          <TimerBar timeLeft={timeLeft} max={TIME_PER_Q} />

          {/* crop & symptom */}
          <div style={styles.questionArea(C)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 48 }}>{currentQ.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: C.textLight,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  ফসল
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.primary,
                    fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
                  }}
                >
                  {currentQ.crop}
                </div>
              </div>
            </div>

            <div style={{ ...styles.symptomBox(C) }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textLight,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                🔬 লক্ষণ
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.55 }}>{currentQ.symptom}</div>
            </div>
          </div>

          {/* Symptom Images */}
          <SymptomImageGallery images={SYMPTOM_SPOTTER_IMAGES[currentQ.correct] || []} label={currentQ.symptom} />

          {/* Audio helper for illiterate farmers */}
          {isSupported && (
            <button
              onClick={() => speak(`${currentQ.crop}। ${currentQ.symptom}। এই লক্ষণের কারণ কী?`)}
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
                marginBottom: 16,
                fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
              }}
            >
              <span style={{ fontSize: 18, animation: speaking ? "ss-pulse-glow 0.6s ease-in-out infinite" : "none" }}>
                🔊
              </span>
              {speaking ? "শুনছি..." : "লক্ষণ শুনুন (পড়ুন)"}
            </button>
          )}

          {/* question prompt */}
          <div style={{ fontSize: 15, color: C.textMuted, fontWeight: 600, marginBottom: 12, paddingLeft: 4 }}>
            এই লক্ষণের কারণ কী?
          </div>

          {/* choices */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {choices.map((choice, i) => {
              let state = "idle";
              if (locked) {
                if (choice === currentQ.correct) state = selectedIdx === i ? "correct" : "reveal";
                else if (i === selectedIdx) state = "wrong";
              }
              return (
                <ChoiceButton
                  key={`${qIdx}-${i}`}
                  label={choice}
                  index={i}
                  state={state}
                  disabled={locked}
                  onClick={() => handleAnswer(i)}
                />
              );
            })}
          </div>

          {/* feedback toast */}
          {locked && selectedIdx !== null && (
            <div
              style={{
                ...styles.feedbackToast,
                background: answers[answers.length - 1]?.isCorrect ? "#dcfce7" : "#fef2f2",
                color: answers[answers.length - 1]?.isCorrect ? C.success : C.danger,
                border: `1px solid ${answers[answers.length - 1]?.isCorrect ? C.success : C.danger}`,
                animation: "ss-popIn 0.3s ease-out",
              }}
            >
              {answers[answers.length - 1]?.isCorrect
                ? `✅ সঠিক! +${answers[answers.length - 1]?.gained} পয়েন্ট${streak >= 3 ? " 🔥 স্ট্রিক বোনাস!" : ""}`
                : `❌ ভুল! ${answers[answers.length - 1]?.gained} পয়েন্ট। সঠিক: ${currentQ.correct}`}
            </div>
          )}

          {locked && selectedIdx === null && (
            <div
              style={{
                ...styles.feedbackToast,
                background: "#fef2f2",
                color: C.danger,
                border: `1px solid ${C.danger}`,
                animation: "ss-popIn 0.3s ease-out",
              }}
            >
              ⏱️ সময় শেষ! সঠিক উত্তর: {currentQ.correct}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── RESULT SCREEN ─────────────────────── */
  if (phase === "result") {
    return (
      <div style={{ ...styles.wrapper, animation: "ss-fadeIn 0.5s ease-out" }}>
        <div style={styles.card(C, "ss-popIn")}>
          {/* header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>{msg.emoji}</div>
            <h1 style={{ ...styles.title(C), margin: "0 0 4px" }}>খেলা শেষ!</h1>
            <p
              style={{
                color: msg.color,
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.5,
                maxWidth: 300,
                margin: "0 auto",
              }}
            >
              {msg.text}
            </p>
          </div>

          {/* score card */}
          <div style={styles.scoreCard(C)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <span style={{ fontSize: 52, fontWeight: 800, color: C.primary, lineHeight: 1 }}>{score}</span>
            </div>
            <div style={{ fontSize: 14, color: C.textLight, fontWeight: 600 }}>মোট স্কোর</div>

            {isNewHigh && score > 0 && (
              <div style={styles.newHighBadge} key="newhigh">
                🎉 নতুন রেকর্ড!
              </div>
            )}
          </div>

          {/* stats row */}
          <div style={styles.statsRow(C)}>
            <StatBox C={C} icon="✅" label="সঠিক" value={`${totalCorrect}/${TOTAL_ROUNDS}`} accent={C.success} />
            <StatBox C={C} icon="📊" label="নির্ভুলতা" value={`${accuracy}%`} accent={C.blue} />
            <StatBox
              C={C}
              icon="🔥"
              label="সর্বোচ্চ স্ট্রিক"
              value={Math.max(
                0,
                ...answers.map((_, i) => {
                  let s = 0,
                    mx = 0;
                  answers.forEach((a, j) => {
                    if (j <= i) {
                      s = a.isCorrect ? s + 1 : 0;
                      mx = Math.max(mx, s);
                    }
                  });
                  return mx;
                }),
              )}
              accent={C.accentDark}
            />
          </div>

          {/* high score */}
          <div style={styles.highScoreResult(C)}>
            <span>🏅</span>
            <span style={{ color: C.textMuted, fontSize: 14, fontWeight: 600 }}>
              সর্বোচ্চ স্কোর: <span style={{ color: C.accentDark, fontSize: 16, fontWeight: 700 }}>{highScore}</span>
            </span>
          </div>

          {/* answer review */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ ...styles.sectionTitle(C), marginBottom: 10 }}>📝 উত্তর পর্যালোচনা</h3>
            <div style={{ maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
              {answers.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    marginBottom: 6,
                    background: a.isCorrect ? "#f0fdf4" : "#fef2f2",
                    borderLeft: `3px solid ${a.isCorrect ? C.success : C.danger}`,
                    animation: "ss-fadeIn 0.3s ease-out",
                    animationDelay: `${i * 0.04}s`,
                    animationFillMode: "backwards",
                  }}
                >
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>
                    {a.isCorrect ? "✅" : "❌"}
                  </span>
                  <span style={{ fontSize: 13, color: C.textMuted, flex: 1, lineHeight: 1.35 }}>
                    {a.correct}
                    {!a.isCorrect && (
                      <span style={{ color: C.danger, marginLeft: 6, fontSize: 12 }}>
                        (আপনার: {a.chosen || "সময় শেষ"})
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: a.gained >= 0 ? C.success : C.danger,
                      flexShrink: 0,
                    }}
                  >
                    {a.gained >= 0 ? `+${a.gained}` : a.gained}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* play again */}
          <button onClick={startGame} style={styles.startBtn(C)}>
            <span style={{ marginRight: 8 }}>🔄</span>
            আবার খেলুন
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/* ── tiny sub-components ─────────────────── */
function Rule({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1.45 }}>{icon}</span>
      <span style={{ fontSize: 14, color: "#3f493f", lineHeight: 1.45 }}>{text}</span>
    </div>
  );
}

function StatBox({ C, icon, label, value, accent }) {
  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "14px 8px",
        borderRadius: 14,
        background: C.bgMuted,
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6f7a6e", fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );
}

/* ── style objects ───────────────────────── */
const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 20,
    background: "#f5fbf6",
  },
  card: (C, anim = "ss-fadeIn") => ({
    width: "100%",
    maxWidth: 440,
    padding: 32,
    borderRadius: 20,
    background: C.bgCard,
    boxShadow: C.shadow,
    animation: `${anim} 0.5s ease-out`,
  }),
  title: (C) => ({
    fontSize: 28,
    fontWeight: 800,
    color: C.primary,
    fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
    letterSpacing: -0.5,
  }),
  subtitle: (C) => ({
    fontSize: 14,
    color: C.textLight,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2,
  }),
  rulesBox: (C) => ({
    padding: 20,
    borderRadius: 16,
    background: C.bgMuted,
    marginBottom: 20,
  }),
  sectionTitle: (C) => ({
    fontSize: 15,
    fontWeight: 700,
    color: C.text,
    fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
  }),
  ruleList: (_C) => ({
    paddingLeft: 4,
  }),
  highScoreBox: (C) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    background: "#fffbeb",
    border: `1px solid ${C.accentLight}`,
    marginBottom: 20,
  }),
  highScoreResult: (C) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    background: "#fffbeb",
    border: `1px solid ${C.accentLight}`,
    marginBottom: 20,
  }),
  startBtn: (C) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "16px 24px",
    borderRadius: 16,
    border: "none",
    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
    cursor: "pointer",
    boxShadow: `0 4px 16px rgba(0,96,40,0.25)`,
    transition: "transform 0.2s, box-shadow 0.2s",
  }),
  meta: (C) => ({
    textAlign: "center",
    fontSize: 13,
    color: C.textLight,
    fontWeight: 500,
  }),
  topBar: (_C) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  }),
  roundBadge: (C) => ({
    padding: "6px 14px",
    borderRadius: 10,
    background: C.bgMuted,
    fontSize: 14,
    fontWeight: 700,
    color: C.textMuted,
    fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
  }),
  scoreDisplay: (C) => ({
    fontSize: 18,
    fontWeight: 800,
    color: C.primaryDark,
  }),
  streakBadge: {
    padding: "4px 12px",
    borderRadius: 10,
    background: "#fff7ed",
    fontSize: 14,
    fontWeight: 700,
    color: "#ea580c",
    animation: "ss-popIn 0.3s ease-out",
  },
  questionArea: (C) => ({
    padding: 20,
    borderRadius: 16,
    background: C.bgMuted,
    marginBottom: 18,
  }),
  symptomBox: (C) => ({
    padding: "14px 16px",
    borderRadius: 12,
    background: C.bgCard,
    border: `1px solid ${C.border}`,
  }),
  feedbackToast: {
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
    lineHeight: 1.4,
  },
  scoreCard: (C) => ({
    padding: "24px 20px",
    borderRadius: 18,
    background: `linear-gradient(135deg, ${C.bgMuted}, #e8f5e9)`,
    border: `2px solid ${C.border}`,
    textAlign: "center",
    marginBottom: 16,
  }),
  newHighBadge: {
    marginTop: 10,
    padding: "6px 16px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    display: "inline-block",
    animation: "ss-popIn 0.5s ease-out 0.3s",
    animationFillMode: "backwards",
    fontFamily: "'Plus Jakarta Sans','Noto Sans Bengali',sans-serif",
  },
  statsRow: (_C) => ({
    display: "flex",
    gap: 10,
    marginBottom: 16,
  }),
};
