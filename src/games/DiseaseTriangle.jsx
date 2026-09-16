import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DISEASE_TRIANGLE_IMAGES } from "./imageMap";
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

// ─── Animations (injected once) ────────────────────────────────────────────────
const ANIM_CSS = `
@keyframes dt-fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes dt-popIn{0%{transform:scale(.82);opacity:0}65%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes dt-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes dt-pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes dt-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes dt-confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(120px) rotate(360deg);opacity:0}}
.dt-fadeIn{animation:dt-fadeIn .45s ease both}
.dt-popIn{animation:dt-popIn .5s cubic-bezier(.34,1.56,.64,1) both}
.dt-float{animation:dt-float 3s ease-in-out infinite}
.dt-pulse{animation:dt-pulse 1.8s ease-in-out infinite}
.dt-shake{animation:dt-shake .45s ease}
`;
if (typeof document !== "undefined" && !document.getElementById("dt-anim-style")) {
  const s = document.createElement("style");
  s.id = "dt-anim-style";
  s.textContent = ANIM_CSS;
  document.head.appendChild(s);
}

// ─── Round data ────────────────────────────────────────────────────────────────
const ROUNDS = [
  {
    disease: "ধানের ব্লাস্ট (Rice Blast)",
    icon: "🌾",
    host: { correct: "প্রতিরোধহীন ধান জাত", wrong: ["উচ্চ প্রতিরোধী জাত", "সুস্থ বীজ", "অন্য ফসল"] },
    pathogen: { correct: "Magnaporthe oryzae (ছত্রাক)", wrong: ["ব্যাকটেরিয়া", "ভাইরাস", "পোকা"] },
    environment: {
      correct: "উচ্চ আর্দ্রতা (৮০%+) + তাপমাত্রা ২৫-২৮°C",
      wrong: ["শুষ্ক আবহাওয়া", "খুব ঠান্ডা", "নিম্ন আর্দ্রতা"],
    },
    risk: "উচ্চ — বাংলাদেশে সবচেয়ে ধ্বংসাত্মক ধান রোগ",
  },
  {
    disease: "আলুর লেট ব্লাইট",
    icon: "🥔",
    host: { correct: "সব ধরনের আলু জাত", wrong: ["শুধু একটি জাত", "প্রতিরোধী জাত", "নন-সাসেপ্টিবল"] },
    pathogen: { correct: "Phytophthora infestans (ছত্রাক)", wrong: ["ব্যাকটেরিয়া", "ভাইরাস", "নাইট্রোজেন অভাব"] },
    environment: { correct: "ঠান্ডা (১৫-২০°C) + ভেজা + মেঘলা", wrong: ["উষ্ণ ও শুষ্ক", "গরম আবহাওয়া", "বৃষ্টিহীন"] },
    risk: "উচ্চ — ২৪ ঘন্টায় সম্পূর্ণ ক্ষেত ধ্বংস হতে পারে",
  },
  {
    disease: "ধানের মাজরা পোকা",
    icon: "🐛",
    host: { correct: "ধানের কুশি ও গর্ভাবস্থা", wrong: ["চারা অবস্থা", "পূর্ণ বয়স্ক ধান", "বীজ"] },
    pathogen: { correct: "Scirpophaga incertulas (পোকা)", wrong: ["ছত্রাক", "ব্যাকটেরিয়া", "ভাইরাস"] },
    environment: { correct: "বোরো মৌসুম + বেশি সার প্রয়োগ", wrong: ["শীতকাল", "শুষ্ক মৌসুম", "উচ্চ তাপমাত্রা"] },
    risk: "মাঝারি — ETL: ২০% মরা ডিল",
  },
  {
    disease: "টমেটো আর্লি ব্লাইট",
    icon: "🍅",
    host: { correct: "বয়স্ক ও দুর্বল টমেটো গাছ", wrong: ["নতুন চারা", "সুস্থ গাছ", "প্রতিরোধী জাত"] },
    pathogen: { correct: "Alternaria solani (ছত্রাক)", wrong: ["ব্যাকটেরিয়া", "ভাইরাস", "পোকা"] },
    environment: {
      correct: "উষ্ণ (২০-২৫°C) + আর্দ্র + পাতায় পানি",
      wrong: ["শুষ্ক আবহাওয়া", "খুব ঠান্ডা", "বৃষ্টিহীন"],
    },
    risk: "মাঝারি — প্রথম দাগ দেখলেই ব্যবস্থা নিতে হবে",
  },
  {
    disease: "সরিষার জাব পোকা",
    icon: "🌼",
    host: { correct: "ফুল ও শুঁটি অবস্থার সরিষা", wrong: ["চারা অবস্থা", "পূর্ণ বয়স্ক", "পাতা"] },
    pathogen: { correct: "Lipaphis erysimi (পোকা)", wrong: ["ছত্রাক", "ব্যাকটেরিয়া", "মাইট"] },
    environment: { correct: "শীতকাল + মৃদু আবহাওয়া", wrong: ["গরম গ্রীষ্ম", "বৃষ্টির মৌসুম", "শুষ্ক"] },
    risk: "মাঝারি — ETL: ৫০টি পোকা/গাছ",
  },
  {
    disease: "বাঁধাকপির ডায়মন্ড ব্যাক মথ",
    icon: "🥬",
    host: { correct: "বাঁধাকপি, ফুলকপি (ক্রুসিফেরা)", wrong: ["ধান", "টমেটো", "আলু"] },
    pathogen: { correct: "Plutella xylostella (পোকা)", wrong: ["ছত্রাক", "ব্যাকটেরিয়া", "ভাইরাস"] },
    environment: { correct: "উষ্ণ + শুষ্ক + বিস্তৃত একবীজপত্রী চাষ", wrong: ["ঠান্ডা", "ভেজা", "বৃষ্টির মৌসুম"] },
    risk: "মাঝারি — ETL: ৫টি লার্ভা/গাছ",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getHighScore() {
  try {
    return Number(localStorage.getItem("game-disease-triangle-high")) || 0;
  } catch {
    return 0;
  }
}

function setHighScore(score) {
  try {
    localStorage.setItem("game-disease-triangle-high", String(score));
  } catch {}
}

// ─── Triangle visual component ─────────────────────────────────────────────────
function TriangleSVG({ size = 160 }) {
  const h = size * 0.866;
  const cx = size / 2;
  return (
    <svg width={size} height={h + 30} viewBox={`0 0 ${size} ${h + 30}`} style={{ display: "block" }}>
      {/* Triangle outline */}
      <polygon
        points={`${cx},8 8,${h - 4} ${size - 8},${h - 4}`}
        fill="none"
        stroke={C.primaryLight}
        strokeWidth="2.5"
        strokeDasharray="6 3"
        opacity="0.5"
      />
      {/* Labels at vertices */}
      <text x={cx} y={28} textAnchor="middle" fill={C.primaryDark} fontSize="11" fontWeight="700">
        🌱 পোষক
      </text>
      <text x={26} y={h + 12} textAnchor="middle" fill={C.warning} fontSize="11" fontWeight="700">
        🦠 রোগজীবাণু
      </text>
      <text x={size - 26} y={h + 12} textAnchor="middle" fill={C.blue} fontSize="11" fontWeight="700">
        🌦️ পরিবেশ
      </text>
      {/* Center text */}
      <text x={cx} y={h / 2 + 12} textAnchor="middle" fill={C.danger} fontSize="10" fontWeight="700">
        ⚠️ রোগ
      </text>
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DiseaseTriangle() {
  // Phase management
  const [phase, setPhase] = useState("start");
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({ host: null, pathogen: null, environment: null });
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [highScore, setHighScoreState] = useState(getHighScore);
  const [animKey, setAnimKey] = useState(0);
  const scrollRef = useRef(null);

  const { speak, stop, speaking, isSupported } = useTTS();

  const round = ROUNDS[roundIdx];
  const totalRounds = ROUNDS.length;

  // ── Auto-speak disease description for each round ──
  useEffect(() => {
    if (phase === "playing" && round && isSupported) {
      speak(`রোগ: ${round.disease}। পোষক, রোগজীবাণু ও পরিবেশ — তিনটি সঠিক উপাদান বেছে নিন।`);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/stop/isSupported from useTTS have unstable refs; round derived from roundIdx already in deps
  }, [roundIdx, phase]);

  // ── Speak result after submission ──
  useEffect(() => {
    if (submitted && isSupported && round) {
      const correct = ["host", "pathogen", "environment"].filter((c) => answers[c] === round[c].correct).length;
      if (correct === 3) speak("চমৎকার! সব ঠিক আছে!");
      else speak(`${correct}টি সঠিক। আবার চেষ্টা করুন।`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/isSupported from useTTS have unstable refs; answers intentionally omitted—effect should only re-fire on submission, not on every answer change
  }, [submitted]);

  // ── Shuffled options for the current round ──
  const options = useMemo(() => {
    if (!round) return {};
    const mkOpts = (cat) => shuffle([cat.correct, ...cat.wrong.slice(0, 2)]);
    return {
      host: mkOpts(round.host),
      pathogen: mkOpts(round.pathogen),
      environment: mkOpts(round.environment),
    };
  }, [round]); // animKey removed from deps—it only needs to trigger re-shuffle when round changes, which round already covers

  // ── Category metadata ──
  const catMeta = {
    host: {
      label: "🌱 পোষক (Host)",
      key: "host",
      color: C.primaryDark,
      bg: "#f0fdf4",
      border: "#bbf7d0",
      activeBg: "#dcfce7",
      activeBorder: C.success,
    },
    pathogen: {
      label: "🦠 রোগজীবাণু (Pathogen)",
      key: "pathogen",
      color: C.warning,
      bg: "#fffbeb",
      border: "#fde68a",
      activeBg: "#fef3c7",
      activeBorder: C.accent,
    },
    environment: {
      label: "🌦️ পরিবেশ (Environment)",
      key: "environment",
      color: C.blue,
      bg: "#eff6ff",
      border: "#bfdbfe",
      activeBg: "#dbeafe",
      activeBorder: C.blue,
    },
  };

  // ── Check answers and calculate score ──
  const checkAnswers = useCallback(() => {
    if (submitted) return;
    let correct = 0;
    const cats = ["host", "pathogen", "environment"];
    const catAnswers = {
      host: round.host.correct,
      pathogen: round.pathogen.correct,
      environment: round.environment.correct,
    };

    cats.forEach((cat) => {
      if (answers[cat] === catAnswers[cat]) correct++;
    });

    let roundScore = 0;
    if (correct === 3) roundScore = 20;
    else if (correct === 2) roundScore = 10;
    else if (correct === 1) roundScore = 5;

    const newResult = {
      disease: round.disease,
      icon: round.icon,
      correct,
      roundScore,
      risk: round.risk,
      catAnswers,
    };

    setSubmitted(true);
    setResults((prev) => [...prev, newResult]);

    const newScore = score + roundScore;
    setScore(newScore);
  }, [answers, round, score, submitted]);

  // ── Next round or finish ──
  const nextRound = useCallback(() => {
    if (roundIdx + 1 >= totalRounds) {
      // Game over
      if (score + (results[results.length - 1]?.roundScore || 0) > highScore) {
        setHighScore(score + (results[results.length - 1]?.roundScore || 0));
        setHighScoreState(score + (results[results.length - 1]?.roundScore || 0));
      }
      setPhase("result");
    } else {
      setRoundIdx((i) => i + 1);
      setAnswers({ host: null, pathogen: null, environment: null });
      setSubmitted(false);
      setAnimKey((k) => k + 1);
    }
  }, [roundIdx, totalRounds, score, highScore, results]);

  // ── Save high score on result ──
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (phase === "result" && score > highScore) {
      setHighScore(score);
      setHighScoreState(score);
    }
  }, [phase, score, highScore]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── Scroll to top on phase change ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase, roundIdx]);

  // ── Start game ──
  const startGame = () => {
    setPhase("playing");
    setRoundIdx(0);
    setScore(0);
    setAnswers({ host: null, pathogen: null, environment: null });
    setSubmitted(false);
    setResults([]);
    setAnimKey(0);
  };

  // ── Select an answer ──
  const selectAnswer = (cat, val) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [cat]: val }));
  };

  // ── Play again ──
  const playAgain = () => {
    startGame();
  };

  // ── Get feedback for a specific option after submission ──
  const getOptionStyle = (cat, option) => {
    if (!submitted) {
      const isSelected = answers[cat] === option;
      const meta = catMeta[cat];
      return {
        background: isSelected ? meta.activeBg : "#fff",
        border: isSelected ? `2.5px solid ${meta.activeBorder}` : `1.5px solid ${C.border}`,
        cursor: "pointer",
      };
    }
    // After submission
    const correctAnswer = round[cat].correct;
    const isCorrect = option === correctAnswer;
    const isSelected = answers[cat] === option;
    if (isCorrect) {
      return {
        background: "#f0fdf4",
        border: `2.5px solid ${C.success}`,
        cursor: "default",
      };
    }
    if (isSelected && !isCorrect) {
      return {
        background: "#fef2f2",
        border: `2.5px solid ${C.danger}`,
        cursor: "default",
      };
    }
    return {
      background: "#fafafa",
      border: `1.5px solid ${C.border}`,
      opacity: 0.55,
      cursor: "default",
    };
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER: START SCREEN
  // ═══════════════════════════════════════════════════════════════════════════════
  if (phase === "start") {
    return (
      <div ref={scrollRef} style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        {/* Hero card */}
        <div
          className="dt-popIn"
          style={{
            background: `linear-gradient(145deg, ${C.primaryDark}, ${C.primaryLight})`,
            borderRadius: 24,
            padding: "32px 24px 28px",
            textAlign: "center",
            color: "#fff",
            marginBottom: 20,
            boxShadow: C.shadowMd,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />

          <div className="dt-float" style={{ fontSize: 52, marginBottom: 8 }}>
            🔺
          </div>
          <h1
            className="ud-headline"
            style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.3, marginBottom: 6, position: "relative" }}
          >
            রোগ ত্রিভুজ
          </h1>
          <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5, position: "relative" }}>Disease Triangle Builder</p>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 11,
              fontWeight: 600,
              marginTop: 10,
              position: "relative",
            }}
          >
            CABI Step 3 • ৬ রাউন্ড
          </div>
        </div>

        {/* Triangle visual */}
        <div
          className="dt-fadeIn"
          style={{ display: "flex", justifyContent: "center", marginBottom: 20, animationDelay: ".15s" }}
        >
          <TriangleSVG size={200} />
        </div>

        {/* Description card */}
        <div
          className="dt-fadeIn"
          style={{
            background: C.bgCard,
            borderRadius: 18,
            padding: "20px 18px",
            boxShadow: C.shadow,
            marginBottom: 16,
            animationDelay: ".2s",
          }}
        >
          <h2 className="ud-headline" style={{ fontSize: 16, fontWeight: 700, color: C.primaryDark, marginBottom: 12 }}>
            🎯 কিভাবে খেলবেন?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "1️⃣", text: "প্রতি রাউন্ডে একটি রোগ/পোকার সমস্যা দেখানো হবে" },
              { icon: "2️⃣", text: "রোগ ত্রিভুজের ৩টি উপাদান সঠিকভাবে চিনে বেছে নিন" },
              { icon: "3️⃣", text: "পোষক (Host), রোগজীবাণু (Pathogen), পরিবেশ (Environment)" },
              { icon: "4️⃣", text: "সব ঠিক হলে +২০, ২টি ঠিক হলে +১০, ১টি হলে +৫ পয়েন্ট" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring card */}
        <div
          className="dt-fadeIn"
          style={{
            background: C.bgMuted,
            borderRadius: 18,
            padding: "16px 18px",
            marginBottom: 20,
            animationDelay: ".3s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            {[
              { label: "৩/৩ ✅", pts: "+২০", color: C.success },
              { label: "২/৩ ⚠️", pts: "+১০", color: C.warning },
              { label: "১/೩ 💡", pts: "+৫", color: C.accent },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.pts}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* High score */}
        {highScore > 0 && (
          <div
            className="dt-fadeIn"
            style={{
              textAlign: "center",
              marginBottom: 16,
              animationDelay: ".35s",
            }}
          >
            <span
              style={{
                background: "linear-gradient(90deg, #fef3c7, #fde68a)",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: "#92400e",
              }}
            >
              🏆 সর্বোচ্চ স্কোর: {highScore}
            </span>
          </div>
        )}

        {/* Start button */}
        <button
          className="dt-popIn"
          onClick={startGame}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
            color: "#fff",
            border: "none",
            borderRadius: 16,
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 6px 20px rgba(0,96,40,0.3)`,
            transition: "transform .15s, box-shadow .15s",
            animationDelay: ".4s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 28px rgba(0,96,40,0.35)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 6px 20px rgba(0,96,40,0.3)";
          }}
        >
          🚀 খেলা শুরু করুন
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER: PLAYING SCREEN
  // ═══════════════════════════════════════════════════════════════════════════════
  if (phase === "playing") {
    const allAnswered = answers.host && answers.pathogen && answers.environment;
    const lastResult = results.length > 0 ? results[results.length - 1] : null;

    return (
      <div ref={scrollRef} style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        {/* Top bar: score + progress */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Score */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
              borderRadius: 14,
              padding: "8px 14px",
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              boxShadow: "0 3px 12px rgba(0,96,40,0.2)",
            }}
          >
            ⭐ {score}
          </div>

          {/* Progress bar */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>
                রাউন্ড {roundIdx + 1}/{totalRounds}
              </span>
              <span style={{ fontSize: 11, color: C.textLight }}>সর্বোচ্চ: {highScore}</span>
            </div>
            <div style={{ height: 6, background: C.bgMuted, borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(roundIdx / totalRounds) * 100}%`,
                  background: `linear-gradient(90deg, ${C.primary}, ${C.primaryLight})`,
                  borderRadius: 3,
                  transition: "width .5s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Disease card */}
        <div
          key={`dis-${animKey}`}
          className="dt-popIn"
          style={{
            background: C.bgCard,
            borderRadius: 20,
            padding: "20px",
            boxShadow: C.shadow,
            marginBottom: 16,
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${C.bgMuted}, #e8f5e9)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
              }}
            >
              {round.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: C.textLight,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                রোগ / পোকা
              </div>
              <h2
                className="ud-headline"
                style={{ fontSize: 18, fontWeight: 800, color: C.primaryDark, lineHeight: 1.3 }}
              >
                {round.disease}
              </h2>
            </div>
          </div>
          {/* Risk badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: round.risk.includes("উচ্চ") ? "#fef2f2" : "#fffbeb",
              border: `1px solid ${round.risk.includes("উচ্চ") ? "#fecaca" : "#fde68a"}`,
              borderRadius: 10,
              padding: "6px 12px",
              fontSize: 12,
              color: round.risk.includes("উচ্চ") ? C.danger : C.warning,
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            <span>{round.risk.includes("উচ্চ") ? "🔴" : "🟡"}</span>
            {round.risk}
          </div>
        </div>

        {/* Symptom Images */}
        <SymptomImageGallery images={DISEASE_TRIANGLE_IMAGES[round.disease] || []} label={round.disease} />

        {/* Audio helper */}
        {isSupported && (
          <button
            onClick={() => speak(`রোগ: ${round.disease}। পোষক, রোগজীবাণু ও পরিবেশ বেছে নিন।`)}
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
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 18 }}>🔊</span>
            {speaking ? "শুনছি..." : "রোগের বিবরণ শুনুন"}
          </button>
        )}

        {/* Mini triangle hint */}
        <div className="dt-fadeIn" style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <TriangleSVG size={120} />
        </div>

        {/* Instruction */}
        <div
          className="dt-fadeIn"
          style={{
            textAlign: "center",
            marginBottom: 16,
            fontSize: 13,
            color: C.textMuted,
            fontWeight: 500,
          }}
        >
          নিচের প্রতিটি বিভাগে সঠিক উত্তরটি বেছে নিন 👇
        </div>

        {/* Category sections */}
        {["host", "pathogen", "environment"].map((cat, catI) => {
          const meta = catMeta[cat];
          return (
            <div
              key={`${cat}-${animKey}`}
              className="dt-fadeIn"
              style={{
                marginBottom: 14,
                animationDelay: `${catI * 0.08}s`,
              }}
            >
              {/* Category label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  padding: "0 2px",
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: meta.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: meta.color,
                  }}
                >
                  {meta.label}
                </span>
                {submitted && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 16,
                    }}
                  >
                    {answers[cat] === round[cat].correct ? "✅" : "❌"}
                  </span>
                )}
              </div>

              {/* Options */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {options[cat].map((opt, optI) => {
                  const style = getOptionStyle(cat, opt);
                  return (
                    <button
                      key={`${cat}-${optI}-${animKey}`}
                      onClick={() => selectAnswer(cat, opt)}
                      className={
                        submitted && answers[cat] === opt && answers[cat] !== round[cat].correct ? "dt-shake" : ""
                      }
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: answers[cat] === opt ? 600 : 400,
                        color: C.text,
                        transition: "all .2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        ...style,
                        outline: "none",
                      }}
                    >
                      {/* Radio indicator */}
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: answers[cat] === opt ? `2.5px solid ${meta.activeBorder}` : `2px solid ${C.border}`,
                          background: answers[cat] === opt ? meta.activeBorder : "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all .2s",
                        }}
                      >
                        {answers[cat] === opt && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#fff",
                            }}
                          />
                        )}
                      </div>
                      <span style={{ flex: 1, lineHeight: 1.45 }}>{opt}</span>
                      {/* Post-submit indicator */}
                      {submitted && opt === round[cat].correct && (
                        <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
                      )}
                      {submitted && answers[cat] === opt && opt !== round[cat].correct && (
                        <span style={{ fontSize: 16, flexShrink: 0 }}>❌</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit / Next button */}
        <div style={{ marginTop: 6, marginBottom: 20 }}>
          {!submitted ? (
            <button
              onClick={checkAnswers}
              disabled={!allAnswered}
              style={{
                width: "100%",
                padding: "15px 24px",
                background: allAnswered ? `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})` : C.bgMuted,
                color: allAnswered ? "#fff" : C.textLight,
                border: "none",
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                cursor: allAnswered ? "pointer" : "not-allowed",
                boxShadow: allAnswered ? "0 6px 20px rgba(0,96,40,0.25)" : "none",
                transition: "all .2s ease",
                opacity: allAnswered ? 1 : 0.6,
              }}
            >
              ✅ উত্তর জমা দিন
            </button>
          ) : (
            <div>
              {/* Feedback banner */}
              {lastResult && (
                <div
                  className="dt-popIn"
                  style={{
                    padding: "14px 18px",
                    borderRadius: 14,
                    marginBottom: 12,
                    background: lastResult.correct === 3 ? "#f0fdf4" : lastResult.correct === 2 ? "#fffbeb" : "#fef2f2",
                    border: `1px solid ${lastResult.correct === 3 ? "#bbf7d0" : lastResult.correct === 2 ? "#fde68a" : "#fecaca"}`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 4 }}>
                    {lastResult.correct === 3
                      ? "🎉"
                      : lastResult.correct === 2
                        ? "👏"
                        : lastResult.correct === 1
                          ? "💪"
                          : "📚"}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 2 }}>
                    {lastResult.correct === 3
                      ? "চমৎকার! সব ঠিক আছে!"
                      : lastResult.correct === 2
                        ? "ভালো! ২টি সঠিক হয়েছে"
                        : lastResult.correct === 1
                          ? "চেষ্টা চালিয়ে যান!"
                          : "আবার চেষ্টা করুন!"}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: lastResult.correct >= 2 ? C.success : C.danger }}>
                    +{lastResult.roundScore} পয়েন্ট
                  </div>
                </div>
              )}

              {/* Show correct answers for wrong ones */}
              {lastResult && lastResult.correct < 3 && (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 14,
                    padding: "14px 16px",
                    marginBottom: 12,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 8 }}>
                    📖 সঠিক উত্তর:
                  </div>
                  {["host", "pathogen", "environment"].map((cat) => {
                    if (answers[cat] === round[cat].correct) return null;
                    return (
                      <div key={cat} style={{ fontSize: 12.5, color: C.text, marginBottom: 4, lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600 }}>{catMeta[cat].label.split(" (")[0]}:</span>{" "}
                        <span style={{ color: C.success, fontWeight: 600 }}>{round[cat].correct}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={nextRound}
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(0,96,40,0.25)",
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 28px rgba(0,96,40,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(0,96,40,0.25)";
                }}
              >
                {roundIdx + 1 >= totalRounds ? "🏆 ফলাফল দেখুন" : "➡️ পরবর্তী রাউন্ড"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER: RESULT SCREEN
  // ═══════════════════════════════════════════════════════════════════════════════
  if (phase === "result") {
    const maxPossible = totalRounds * 20;
    const percentage = Math.round((score / maxPossible) * 100);
    const isNewHigh = score >= highScore && score > 0;

    let grade = { emoji: "📚", title: "আরও শিখুন!", subtitle: "রোগ ত্রিভুজ সম্পর্কে আরও জানুন", color: C.textMuted };
    if (percentage >= 90)
      grade = { emoji: "🏆", title: "অসাধারণ!", subtitle: "আপনি একজন দক্ষ রোগ বিশেষজ্ঞ!", color: C.success };
    else if (percentage >= 70)
      grade = { emoji: "🌟", title: "চমৎকার!", subtitle: "আপনি ভালো জ্ঞান রাখেন!", color: C.primary };
    else if (percentage >= 50)
      grade = { emoji: "💪", title: "ভালো চেষ্টা!", subtitle: "আরও অনুশীলন করুন", color: C.accent };

    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

    return (
      <div ref={scrollRef} style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 32px" }}>
        {/* Score hero */}
        <div
          className="dt-popIn"
          style={{
            background: `linear-gradient(145deg, ${C.primaryDark}, ${C.primaryLight})`,
            borderRadius: 24,
            padding: "36px 24px 28px",
            textAlign: "center",
            color: "#fff",
            marginBottom: 20,
            boxShadow: C.shadowMd,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -25,
              left: -25,
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -15,
              right: -15,
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />

          <div className="dt-float" style={{ fontSize: 56, marginBottom: 8 }}>
            {grade.emoji}
          </div>

          {/* Stars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 28,
                  opacity: s <= stars ? 1 : 0.25,
                  filter: s <= stars ? "none" : "grayscale(1)",
                  transition: "all .3s",
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          <h1
            className="ud-headline"
            style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3, marginBottom: 4, position: "relative" }}
          >
            {grade.title}
          </h1>
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16, position: "relative" }}>{grade.subtitle}</p>

          {/* Score display */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 4,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "10px 24px",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 800 }}>{score}</span>
            <span style={{ fontSize: 14, opacity: 0.7 }}>/ {maxPossible}</span>
          </div>

          {isNewHigh && (
            <div
              className="dt-pulse"
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(90deg, rgba(245,158,11,0.3), rgba(245,158,11,0.15))",
                border: "1px solid rgba(245,158,11,0.4)",
                borderRadius: 20,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 700,
                color: "#fde68a",
                position: "relative",
              }}
            >
              🏆 নতুন সর্বোচ্চ স্কোর!
            </div>
          )}
        </div>

        {/* Stats row */}
        <div
          className="dt-fadeIn"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {[
            { label: "মোট রাউন্ড", value: totalRounds, icon: "📋" },
            { label: "সঠিক রাউন্ড", value: results.filter((r) => r.correct === 3).length, icon: "✅" },
            { label: "সর্বোচ্চ", value: highScore, icon: "🏆" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: C.bgCard,
                borderRadius: 14,
                padding: "14px 10px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.primaryDark }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Round-by-round breakdown */}
        <div
          className="dt-fadeIn"
          style={{
            marginBottom: 20,
          }}
        >
          <h3 className="ud-headline" style={{ fontSize: 15, fontWeight: 700, color: C.primaryDark, marginBottom: 10 }}>
            📊 রাউন্ড ভিত্তিক ফলাফল
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r, i) => (
              <div
                key={i}
                className="dt-fadeIn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: C.bgCard,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: r.correct === 3 ? "#f0fdf4" : r.correct === 2 ? "#fffbeb" : "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {r.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.text,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.disease}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                    {["host", "pathogen", "environment"].map((cat) => (
                      <span
                        key={cat}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: answers[cat] === r.catAnswers[cat] ? "#dcfce7" : "#fee2e2",
                          color: answers[cat] === r.catAnswers[cat] ? C.success : C.danger,
                        }}
                      >
                        {cat === "host" ? "🌱" : cat === "pathogen" ? "🦠" : "🌦️"}
                        {answers[cat] === r.catAnswers[cat] ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: r.correct === 3 ? C.success : r.correct === 2 ? C.warning : C.textLight,
                    flexShrink: 0,
                  }}
                >
                  +{r.roundScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Educational summary */}
        <div
          className="dt-fadeIn"
          style={{
            background: `linear-gradient(135deg, #f0fdf4, ${C.bgMuted})`,
            borderRadius: 18,
            padding: "18px 16px",
            marginBottom: 20,
            border: `1px solid #bbf7d0`,
          }}
        >
          <h3 className="ud-headline" style={{ fontSize: 14, fontWeight: 700, color: C.primaryDark, marginBottom: 8 }}>
            📖 রোগ ত্রিভুজ মনে রাখুন
          </h3>
          <p style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.7, marginBottom: 8 }}>
            রোগ ঘটতে হলে তিনটি উপাদান একই সময়ে থাকতে হবে। যেকোনো একটি নিয়ন্ত্রণ করলে রোগ হবে না।
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { icon: "🌱", label: "পোষক পরিবর্তন", desc: "প্রতিরোধী জাত" },
              { icon: "🦠", label: "রোগজীবাণু দমন", desc: "বীজ শোধন, স্প্রে" },
              { icon: "🌦️", label: "পরিবেশ পরিবর্তন", desc: "সেচ, জমি পরিষ্কার" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: 12,
                  padding: "10px 8px",
                  textAlign: "center",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 10, color: C.textLight }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={playAgain}
            style={{
              width: "100%",
              padding: "15px 24px",
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
              color: "#fff",
              border: "none",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0,96,40,0.25)",
              transition: "transform .15s, box-shadow .15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 28px rgba(0,96,40,0.35)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 6px 20px rgba(0,96,40,0.25)";
            }}
          >
            🔄 আবার খেলুন
          </button>
          <button
            onClick={() => setPhase("start")}
            style={{
              width: "100%",
              padding: "13px 24px",
              background: C.bgCard,
              color: C.primary,
              border: `2px solid ${C.border}`,
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = C.primaryLight;
              e.target.style.background = C.bgMuted;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = C.border;
              e.target.style.background = C.bgCard;
            }}
          >
            🏠 হোম এ ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return null;
}
