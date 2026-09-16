import { useState, useEffect, useCallback, useMemo } from "react";
import { FIELD_SCOUT_IMAGES } from "./imageMap";
import useTTS from "./useTTS";
import SymptomImageGallery from "./SymptomImageGallery";

/* ─────────────────── design tokens ─────────────────── */
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

/* ─────────────────── scenario data ─────────────────── */
const SCENARIOS = [
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    pest: "ধানের ব্লাস্ট",
    etl: "পাতা: ২% আক্রান্ত",
    etlValue: 2,
    gridSize: [5, 4],
    infectedRate: 3.5,
    fieldSize: "১ বিঘা",
    correctAction: "treat",
    treatAdvice: "ট্রাইসাইক্লাজল স্প্রে করুন",
    monitorAdvice: "সপ্তাহে পরিদর্শন চালিয়ে যান",
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    pest: "মাজরা পোকা",
    etl: "২০% মরা ডিল",
    etlValue: 20,
    gridSize: [5, 4],
    infectedRate: 25,
    fieldSize: "১ বিঘা",
    correctAction: "treat",
    treatAdvice: "ট্রাইকোকার্ড + প্রয়োজনে কীটনাশক",
    monitorAdvice: "পরবর্তী সপ্তাহে আবার পরীক্ষা করুন",
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    pest: "বাদামি গাছফড়িং",
    etl: "প্রতি গাছে ১০-১৫টি",
    etlValue: 12,
    gridSize: [5, 4],
    infectedRate: 8,
    fieldSize: "১ বিঘা",
    correctAction: "monitor",
    treatAdvice: "ইমিডাক্লোপ্রিড স্প্রে",
    monitorAdvice: "সপ্তাহে পরীক্ষা, প্রাকৃতিক শত্রু বাড়ান",
  },
  {
    crop: "সরিষা (Mustard)",
    icon: "🌼",
    pest: "জাব পোকা",
    etl: "৫০টি পোকা/গাছ",
    etlValue: 50,
    gridSize: [5, 3],
    infectedRate: 35,
    fieldSize: "১ বিঘা",
    correctAction: "monitor",
    treatAdvice: "নীল ট্র্যাপ + নিম তেল",
    monitorAdvice: "সপ্তাহে ২বার পরীক্ষা, প্রাকৃতিক শত্রু বাড়ান",
  },
  {
    crop: "আলু (Potato)",
    icon: "🥔",
    pest: "লেট ব্লাইট",
    etl: "যেকোনো দাগ দেখলেই",
    etlValue: 1,
    gridSize: [5, 4],
    infectedRate: 15,
    fieldSize: "১ বিঘা",
    correctAction: "treat",
    treatAdvice: "মেটালাক্সিল + ম্যানকোজেব স্প্রে",
    monitorAdvice: "৩ দিনে একবার মাঠ পরিদর্শন",
  },
  {
    crop: "বাঁধাকপি (Cabbage)",
    icon: "🥬",
    pest: "ডায়মন্ড ব্যাক মথ",
    etl: "৫টি লার্ভা/গাছ",
    etlValue: 5,
    gridSize: [5, 3],
    infectedRate: 18,
    fieldSize: "১ বিঘা",
    correctAction: "treat",
    treatAdvice: "Bt স্প্রে বা ইমামেকটিন",
    monitorAdvice: "সপ্তাহে ২বার পরীক্ষা",
  },
];

/* ─────────────────── keyframe animations ─────────────────── */
const ANIM_CSS = `
@keyframes fs-fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fs-popIn{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes fs-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes fs-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes fs-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes fs-bounceIn{0%{transform:scale(0);opacity:0}50%{transform:scale(1.15)}70%{transform:scale(.95)}100%{transform:scale(1);opacity:1}}
@keyframes fs-slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fs-barGrow{from{width:0}to{width:var(--tw)}}
@keyframes fs-confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(60px) rotate(360deg);opacity:0}}
.ud-headline{font-size:1.65rem;font-weight:800;color:${C.primaryDark};line-height:1.3}
`;

/* ─────────────────── constants ─────────────────── */
const MAX_INSPECTIONS = 10;
const TOTAL_ROUNDS = 5;
const MIN_INSPECTIONS = 3;

/* ─────────────────── helpers ─────────────────── */
function generateGrid(cols, rows, infectedRate) {
  const total = cols * rows;
  let numInf = Math.round((total * infectedRate) / 100);
  if (numInf < 1 && infectedRate > 0) numInf = 1;
  numInf = Math.min(numInf, total);

  const points = Array.from({ length: total }, (_, i) => ({
    id: i,
    row: Math.floor(i / cols),
    col: i % cols,
    status: "healthy",
    infectedCount: 0,
    inspected: false,
  }));

  // Fisher-Yates shuffle
  const idx = Array.from({ length: total }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  for (let k = 0; k < numInf; k++) {
    points[idx[k]].status = "infected";
    points[idx[k]].infectedCount = Math.floor(Math.random() * 5) + 1;
  }
  return { points, cols, rows, numInfected: numInf };
}

function getWPattern(cols, rows) {
  const pattern = [];
  if (rows >= 4) {
    [
      [0, 0],
      [0, cols - 1],
      [1, 1],
      [1, cols - 2],
      [2, Math.floor(cols / 2)],
      [3, 0],
      [3, cols - 1],
    ].forEach(([r, c]) => {
      if (r < rows) pattern.push(r * cols + c);
    });
  } else if (rows >= 3) {
    [
      [0, 0],
      [0, cols - 1],
      [1, 1],
      [1, cols - 2],
      [2, 0],
      [2, cols - 1],
    ].forEach(([r, c]) => {
      if (r < rows) pattern.push(r * cols + c);
    });
  }
  return pattern;
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */
export default function FieldScout() {
  // ── state ──
  const [phase, setPhase] = useState("start");
  const [gameComplete, setGameComplete] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gridData, setGridData] = useState(null);
  const [inspectedCount, setInspectedCount] = useState(0);
  const [subPhase, setSubPhase] = useState("inspecting"); // inspecting | deciding
  const [decision, setDecision] = useState(null);
  const [roundScore, setRoundScore] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [roundCorrect, setRoundCorrect] = useState(false);
  const [bonusEarned, setBonusEarned] = useState(false);
  const [observedRate, setObservedRate] = useState(0);

  // ── TTS ──
  const { speak, stop, speaking, isSupported } = useTTS();

  // ── derived ──
  const scenario = SCENARIOS[round % SCENARIOS.length];
  const grid = useMemo(() => gridData?.points ?? [], [gridData]);
  const cols = gridData?.cols ?? 5;
  const rows = gridData?.rows ?? 4;
  const wPattern = useMemo(() => getWPattern(cols, rows), [cols, rows]);
  const isNewHigh = score > highScore && gameComplete;

  // ── load high score ──
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("game-field-scout-high");
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── persist high score ──
  const persistHigh = useCallback((val) => {
    setHighScore(val);
    try {
      localStorage.setItem("game-field-scout-high", String(val));
    } catch {}
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (score > highScore) persistHigh(score);
  }, [score, highScore, persistHigh]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── auto-speak each round ──
  useEffect(() => {
    if (phase === "playing" && scenario && isSupported) {
      speak(`${scenario.crop}। ${scenario.pest}। ইটিএল: ${scenario.etl}। মাঠ পরীক্ষা করুন।`);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/stop/isSupported from useTTS have unstable refs; scenario derived from round already in deps
  }, [round, phase]);

  // ── speak result ──
  useEffect(() => {
    if (phase === "result" && scenario && isSupported) {
      if (roundCorrect) speak("সঠিক সিদ্ধান্ত!");
      else speak("ভুল সিদ্ধান্ত। আবার চেষ্টা করুন।");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/isSupported from useTTS have unstable refs; scenario/roundCorrect intentionally omitted—effect should only fire on phase change to result
  }, [phase]);

  // ── handlers ──
  const startGame = useCallback(() => {
    const r = 0;
    setRound(r);
    setScore(0);
    setRoundScores([]);
    setGameComplete(false);
    const gd = generateGrid(SCENARIOS[0].gridSize[0], SCENARIOS[0].gridSize[1], SCENARIOS[0].infectedRate);
    setGridData(gd);
    setInspectedCount(0);
    setSubPhase("inspecting");
    setDecision(null);
    setRoundScore(0);
    setShowHint(false);
    setPhase("playing");
  }, []);

  const inspectPoint = useCallback(
    (id) => {
      if (subPhase !== "inspecting") return;
      const point = grid.find((p) => p.id === id);
      if (!point || point.inspected || inspectedCount >= MAX_INSPECTIONS) return;
      const newGrid = {
        ...gridData,
        points: grid.map((p) => (p.id === id ? { ...p, inspected: true } : p)),
      };
      setGridData(newGrid);
      const newCount = inspectedCount + 1;
      setInspectedCount(newCount);
      if (newCount >= MAX_INSPECTIONS) {
        setTimeout(() => setSubPhase("deciding"), 700);
      }
    },
    [grid, gridData, inspectedCount, subPhase],
  );

  const completeInspection = useCallback(() => {
    if (inspectedCount < MIN_INSPECTIONS) return;
    setSubPhase("deciding");
  }, [inspectedCount]);

  const makeDecision = useCallback(
    (action) => {
      const inspected = grid.filter((p) => p.inspected);
      const infected = inspected.filter((p) => p.status === "infected");
      const rate = inspected.length > 0 ? (infected.length / inspected.length) * 100 : 0;
      setObservedRate(rate);

      const isCorrect = action === scenario.correctAction;
      const isBonus = Math.abs(rate - scenario.infectedRate) <= 10;
      const pts = (isCorrect ? 20 : 0) + (isBonus ? 10 : 0);

      setDecision(action);
      setRoundCorrect(isCorrect);
      setBonusEarned(isBonus);
      setRoundScore(pts);
      setScore((prev) => prev + pts);
      setRoundScores((prev) => [...prev, pts]);
      setPhase("result");
    },
    [grid, scenario],
  );

  const nextRound = useCallback(() => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setGameComplete(true);
      setPhase("start");
    } else {
      const nr = round + 1;
      const ns = SCENARIOS[nr % SCENARIOS.length];
      const gd = generateGrid(ns.gridSize[0], ns.gridSize[1], ns.infectedRate);
      setRound(nr);
      setGridData(gd);
      setInspectedCount(0);
      setSubPhase("inspecting");
      setDecision(null);
      setRoundScore(0);
      setShowHint(false);
      setPhase("playing");
    }
  }, [round]);

  // ── computed for deciding sub-phase ──
  const inspectedPoints = useMemo(() => grid.filter((p) => p.inspected), [grid]);
  const infectedFound = useMemo(() => inspectedPoints.filter((p) => p.status === "infected"), [inspectedPoints]);
  const calcRate = useMemo(
    () => (inspectedPoints.length > 0 ? (infectedFound.length / inspectedPoints.length) * 100 : 0),
    [inspectedPoints, infectedFound],
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER — Start Screen
     ═══════════════════════════════════════════════════════════ */
  if (phase === "start") {
    return (
      <>
        <style>{ANIM_CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            background: `linear-gradient(160deg, ${C.bg} 0%, #e8f5e9 50%, ${C.bgMuted} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontFamily: "'Noto Sans Bengali','Hind Siliguri',system-ui,sans-serif",
          }}
        >
          <div
            style={{
              background: C.bgCard,
              borderRadius: 24,
              boxShadow: C.shadowMd,
              padding: "36px 28px",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              animation: "fs-fadeIn 0.5s ease-out",
            }}
          >
            {/* Final Score Overlay */}
            {gameComplete && (
              <div
                style={{
                  animation: "fs-slideUp 0.5s ease-out",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 56,
                    animation: "fs-float 2s ease-in-out infinite",
                    marginBottom: 4,
                  }}
                >
                  🏆
                </div>
                <div className="ud-headline" style={{ marginBottom: 8 }}>
                  চূড়ান্ত ফলাফল
                </div>
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 900,
                    color: C.primary,
                    lineHeight: 1.1,
                  }}
                >
                  {score}
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: C.textMuted,
                      marginLeft: 4,
                    }}
                  >
                    / {TOTAL_ROUNDS * 30}
                  </span>
                </div>

                {/* Round breakdown */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    margin: "16px 0 12px",
                    flexWrap: "wrap",
                  }}
                >
                  {roundScores.map((rs, i) => (
                    <div
                      key={i}
                      style={{
                        background: rs > 0 ? C.bg : "#fef2f2",
                        border: `2px solid ${rs > 0 ? C.success : C.danger}`,
                        borderRadius: 10,
                        padding: "6px 12px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: rs > 0 ? C.primaryDark : C.danger,
                      }}
                    >
                      রাউন্ড {i + 1}: {rs}
                    </div>
                  ))}
                </div>

                {isNewHigh && (
                  <div
                    style={{
                      background: `linear-gradient(90deg,transparent,#fbbf24,#f59e0b,#fbbf24,transparent)`,
                      backgroundSize: "200% 100%",
                      animation: "fs-shimmer 2s linear infinite",
                      color: "#92400e",
                      fontWeight: 700,
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontSize: 14,
                      display: "inline-block",
                      marginBottom: 12,
                    }}
                  >
                    ⭐ নতুন সর্বোচ্চ স্কোর! ⭐
                  </div>
                )}

                <div
                  style={{
                    height: 1,
                    background: C.border,
                    margin: "16px 0",
                  }}
                />
              </div>
            )}

            {/* Title */}
            <div style={{ fontSize: 56, marginBottom: 8 }}>🔍🌾</div>
            <div className="ud-headline" style={{ marginBottom: 6 }}>
              মাঠ পরীক্ষক
            </div>
            <div
              style={{
                fontSize: 13,
                color: C.textLight,
                fontWeight: 600,
                letterSpacing: 0.5,
                marginBottom: 20,
              }}
            >
              CABI Step 4 — Field Scout
            </div>

            {!gameComplete && (
              <>
                <p
                  style={{
                    color: C.textMuted,
                    fontSize: 14,
                    lineHeight: 1.7,
                    marginBottom: 8,
                  }}
                >
                  মাঠে নমুনা সংগ্রহ করুন এবং সংক্রমণের হার বের করে
                  <br />
                  চিকিৎসা নাকি পর্যবেক্ষণ সিদ্ধান্ত নিন।
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    marginBottom: 24,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { icon: "🟢", text: "নমুনা সংগ্রহ" },
                    { icon: "📊", text: "হার হিসাব" },
                    { icon: "🧪", text: "সিদ্ধান্ত" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: C.bgMuted,
                        borderRadius: 10,
                        padding: "8px 14px",
                        fontSize: 12,
                        color: C.textMuted,
                        fontWeight: 600,
                      }}
                    >
                      {s.icon} {s.text}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* High Score */}
            {highScore > 0 && !gameComplete && (
              <div
                style={{
                  color: C.accent,
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                🏆 সর্বোচ্চ স্কোর: {highScore}
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={startGame}
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "14px 40px",
                fontSize: 17,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 16px rgba(0,96,40,0.3)`,
                transition: "transform 0.15s, box-shadow 0.15s",
                animation: "fs-pulse 2s ease-in-out infinite",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.96)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {gameComplete ? "🔄 আবার খেলুন" : "🚀 শুরু করুন"}
            </button>

            <div
              style={{
                marginTop: 18,
                fontSize: 12,
                color: C.textLight,
              }}
            >
              {TOTAL_ROUNDS} রাউন্ড • সর্বোচ্চ {TOTAL_ROUNDS * 30} পয়েন্ট
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER — Result Screen
     ═══════════════════════════════════════════════════════════ */
  if (phase === "result") {
    const _advice = decision === "treat" ? scenario.treatAdvice : scenario.monitorAdvice;
    const correctAdvice = scenario.correctAction === "treat" ? scenario.treatAdvice : scenario.monitorAdvice;

    return (
      <>
        <style>{ANIM_CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            background: `linear-gradient(160deg, ${C.bg} 0%, #e8f5e9 50%, ${C.bgMuted} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontFamily: "'Noto Sans Bengali','Hind Siliguri',system-ui,sans-serif",
          }}
        >
          <div
            style={{
              background: C.bgCard,
              borderRadius: 24,
              boxShadow: C.shadowMd,
              padding: "32px 24px",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              animation: "fs-fadeIn 0.4s ease-out",
            }}
          >
            {/* Result Icon */}
            <div
              style={{
                fontSize: 72,
                animation: "fs-bounceIn 0.6s ease-out",
                marginBottom: 8,
              }}
            >
              {roundCorrect ? "✅" : "❌"}
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: roundCorrect ? C.success : C.danger,
                marginBottom: 4,
                animation: "fs-popIn 0.5s ease-out 0.2s both",
              }}
            >
              {roundCorrect ? "সঠিক সিদ্ধান্ত!" : "ভুল সিদ্ধান্ত!"}
            </div>

            <div
              style={{
                fontSize: 14,
                color: C.textMuted,
                marginBottom: 20,
                animation: "fs-popIn 0.5s ease-out 0.3s both",
              }}
            >
              আপনি "{decision === "treat" ? "চিকিৎসা করুন" : "পর্যবেক্ষণ করুন"}" বেছে নিয়েছেন
            </div>

            {/* Score Breakdown */}
            <div
              style={{
                background: C.bgMuted,
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
                animation: "fs-slideUp 0.5s ease-out 0.4s both",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 10 }}>
                রাউন্ড {round + 1} — পয়েন্ট বিবরণ
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, color: C.textMuted }}>সিদ্ধান্ত {roundCorrect ? "সঠিক" : "ভুল"}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: roundCorrect ? C.success : C.textLight,
                  }}
                >
                  {roundCorrect ? "+20" : "+0"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13, color: C.textMuted }}>নমুনা নির্ভুলতা বোনাস</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: bonusEarned ? C.accent : C.textLight,
                  }}
                >
                  {bonusEarned ? "+10" : "+0"}
                </span>
              </div>
              <div
                style={{
                  height: 1,
                  background: C.border,
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>মোট</span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: C.primary,
                  }}
                >
                  +{roundScore}
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div
              style={{
                background: roundCorrect ? "#f0fdf4" : "#fef2f2",
                border: `2px solid ${roundCorrect ? C.success : C.danger}`,
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
                textAlign: "left",
                animation: "fs-slideUp 0.5s ease-out 0.5s both",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: roundCorrect ? C.success : C.danger,
                  marginBottom: 8,
                }}
              >
                {roundCorrect ? "✓" : "✗"} ব্যাখ্যা
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
                <span style={{ fontWeight: 600, color: C.text }}>প্রকৃত সংক্রমণের হার:</span> {scenario.infectedRate}%
                <br />
                <span style={{ fontWeight: 600, color: C.text }}>আপনার পর্যবেশন:</span> {observedRate.toFixed(1)}% (
                {inspectedPoints.length}টি নমুনায় {infectedFound.length}টি আক্রান্ত)
                <br />
                <span style={{ fontWeight: 600, color: C.text }}>ETL:</span> {scenario.etl}
                <br />
                <span style={{ fontWeight: 600, color: C.text }}>সঠিক সিদ্ধান্ত:</span>{" "}
                {scenario.correctAction === "treat" ? "চিকিৎসা করুন" : "পর্যবেক্ষণ করুন"}
              </div>
            </div>

            {/* Correct Advice */}
            {!roundCorrect && (
              <div
                style={{
                  background: "#fffbeb",
                  border: `1.5px solid ${C.accent}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 20,
                  fontSize: 13,
                  color: "#92400e",
                  lineHeight: 1.6,
                  animation: "fs-slideUp 0.5s ease-out 0.6s both",
                }}
              >
                💡 <strong>সঠিক পরামর্শ:</strong> {correctAdvice}
              </div>
            )}

            {/* Running Score */}
            <div
              style={{
                fontSize: 14,
                color: C.textMuted,
                marginBottom: 16,
                animation: "fs-popIn 0.5s ease-out 0.7s both",
              }}
            >
              মোট স্কোর: <span style={{ fontWeight: 800, color: C.primary, fontSize: 18 }}>{score}</span> /{" "}
              {(round + 1) * 30}
            </div>

            {/* Next Round Button */}
            <button
              onClick={nextRound}
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "14px 36px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 16px rgba(0,96,40,0.3)`,
                transition: "transform 0.15s",
                animation: "fs-popIn 0.5s ease-out 0.8s both",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.96)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {round + 1 >= TOTAL_ROUNDS ? "🏆 ফলাফল দেখুন" : `➡️ রাউন্ড ${round + 2}`}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER — Playing Screen
     ═══════════════════════════════════════════════════════════ */
  const barMax = Math.max(calcRate, scenario.etlValue) * 2.2;

  return (
    <>
      <style>{ANIM_CSS}</style>
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${C.bg} 0%, #e8f5e9 50%, ${C.bgMuted} 100%)`,
          padding: "16px 16px 40px",
          fontFamily: "'Noto Sans Bengali','Hind Siliguri',system-ui,sans-serif",
        }}
      >
        {/* ── Header Bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            animation: "fs-fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: C.bgCard,
              borderRadius: 10,
              padding: "8px 14px",
              boxShadow: C.shadow,
              fontSize: 13,
              fontWeight: 700,
              color: C.primary,
            }}
          >
            📋 রাউন্ড {round + 1}/{TOTAL_ROUNDS}
          </div>
          <div
            style={{
              background: C.bgCard,
              borderRadius: 10,
              padding: "8px 14px",
              boxShadow: C.shadow,
              fontSize: 13,
              fontWeight: 700,
              color: C.accent,
            }}
          >
            ⭐ {score}
          </div>
        </div>

        {/* ── Scenario Card ── */}
        <div
          style={{
            background: C.bgCard,
            borderRadius: 18,
            boxShadow: C.shadow,
            padding: "18px 16px",
            marginBottom: 16,
            animation: "fs-fadeIn 0.4s ease-out 0.1s both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>{scenario.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{scenario.crop}</div>
              <div style={{ fontSize: 13, color: C.danger, fontWeight: 600 }}>🐛 {scenario.pest}</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 100,
                background: C.bgMuted,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600, marginBottom: 2 }}>
                ETL (সীমাস্থায়ী স্তর)
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.warning }}>📊 {scenario.etl}</div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 80,
                background: C.bgMuted,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600, marginBottom: 2 }}>জমির আয়তন</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>📏 {scenario.fieldSize}</div>
            </div>
          </div>
        </div>

        {/* Symptom Images */}
        <SymptomImageGallery images={FIELD_SCOUT_IMAGES[round % 6] || []} label={scenario.pest} />

        {/* Audio helper */}
        {isSupported && (
          <button
            onClick={() => speak(`${scenario.crop}। ${scenario.pest}। ইটিএল: ${scenario.etl}`)}
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
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 18 }}>🔊</span>
            {speaking ? "শুনছি..." : "সমস্যা শুনুন"}
          </button>
        )}

        {/* ── Inspection Counter ── */}
        {subPhase === "inspecting" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              animation: "fs-fadeIn 0.4s ease-out 0.2s both",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted }}>🔍 নমুনা পয়েন্ট ট্যাপ করুন</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color:
                  inspectedCount >= MAX_INSPECTIONS
                    ? C.accent
                    : inspectedCount >= MIN_INSPECTIONS
                      ? C.primary
                      : C.textMuted,
              }}
            >
              {inspectedCount}/{MAX_INSPECTIONS}
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        <div
          style={{
            background: "rgba(34,120,60,0.08)",
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
            animation: "fs-fadeIn 0.4s ease-out 0.3s both",
          }}
        >
          {/* Field label */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.textLight,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              🌱 মাঠের নমুনা গ্রিড ({cols}×{rows})
            </span>
            {subPhase === "inspecting" && (
              <button
                onClick={() => setShowHint((h) => !h)}
                style={{
                  background: showHint ? C.accent : C.bgCard,
                  color: showHint ? "#fff" : C.textMuted,
                  border: `1.5px solid ${showHint ? C.accent : C.border}`,
                  borderRadius: 8,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                W-প্যাটার্ন {showHint ? "✓" : "?"}
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 8,
              maxWidth: 380,
              margin: "0 auto",
            }}
          >
            {grid.map((point) => {
              const isWHint = showHint && wPattern.includes(point.id);
              return (
                <div
                  key={point.id + (point.inspected ? "-v" : "-h")}
                  onClick={() => inspectPoint(point.id)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: subPhase === "inspecting" && !point.inspected ? "pointer" : "default",
                    transition: "all 0.2s",
                    animation: point.inspected ? "fs-popIn 0.35s ease-out" : "none",
                    position: "relative",
                    // Styling based on state
                    ...(point.inspected
                      ? point.status === "infected"
                        ? {
                            background: `linear-gradient(135deg, #fecaca, #fee2e2)`,
                            border: "2.5px solid " + C.danger,
                            boxShadow: "0 2px 8px rgba(220,38,38,0.2)",
                          }
                        : {
                            background: `linear-gradient(135deg, #bbf7d0, #dcfce7)`,
                            border: "2.5px solid " + C.success,
                            boxShadow: "0 2px 8px rgba(22,163,74,0.15)",
                          }
                      : {
                          background: isWHint ? `linear-gradient(135deg, #fef3c7, #fef9c3)` : C.bgCard,
                          border: `2px dashed ${isWHint ? C.accent : C.border}`,
                          boxShadow: "none",
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (!point.inspected && subPhase === "inspecting") {
                      e.currentTarget.style.transform = "scale(1.08)";
                      e.currentTarget.style.boxShadow = C.shadow;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = point.inspected
                      ? point.status === "infected"
                        ? "0 2px 8px rgba(220,38,38,0.2)"
                        : "0 2px 8px rgba(22,163,74,0.15)"
                      : "none";
                  }}
                >
                  {!point.inspected ? (
                    <span
                      style={{
                        fontSize: 18,
                        color: isWHint ? C.accent : C.textLight,
                      }}
                    >
                      ?
                    </span>
                  ) : point.status === "infected" ? (
                    <>
                      <span style={{ fontSize: 16, marginBottom: 1 }}>✗</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.danger,
                          lineHeight: 1,
                        }}
                      >
                        আক্রান্ত
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: C.danger,
                          marginTop: 1,
                        }}
                      >
                        ×{point.infectedCount}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 16, marginBottom: 1 }}>✓</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.success,
                          lineHeight: 1,
                        }}
                      >
                        সুস্থ
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Complete Inspection Button ── */}
        {subPhase === "inspecting" && inspectedCount >= MIN_INSPECTIONS && (
          <button
            onClick={completeInspection}
            style={{
              display: "block",
              width: "100%",
              maxWidth: 380,
              margin: "0 auto 16px",
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "13px 20px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 4px 16px rgba(0,96,40,0.25)`,
              transition: "transform 0.15s",
              animation: "fs-popIn 0.4s ease-out",
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ✅ পরিবেশন সম্পন্ন ({inspectedCount}টি পরীক্ষিত)
          </button>
        )}

        {subPhase === "inspecting" && inspectedCount < MIN_INSPECTIONS && (
          <div
            style={{
              textAlign: "center",
              maxWidth: 380,
              margin: "0 auto 16px",
              fontSize: 12,
              color: C.textLight,
              fontWeight: 600,
              animation: "fs-fadeIn 0.3s ease-out",
            }}
          >
            আরও {MIN_INSPECTIONS - inspectedCount}টি পয়েন্ট পরীক্ষা করুন
          </div>
        )}

        {/* ── Deciding Sub-Phase ── */}
        {subPhase === "deciding" && (
          <div style={{ animation: "fs-slideUp 0.5s ease-out" }}>
            {/* Summary Card */}
            <div
              style={{
                background: C.bgCard,
                borderRadius: 18,
                boxShadow: C.shadow,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: 14,
                  textAlign: "center",
                }}
              >
                📋 পরিবেশন সারাংশ
              </div>

              {/* Stats Row */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: C.bgMuted,
                    borderRadius: 12,
                    padding: "12px 10px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.blue }}>{inspectedPoints.length}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textLight,
                      fontWeight: 600,
                    }}
                  >
                    পরীক্ষিত
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#fef2f2",
                    borderRadius: 12,
                    padding: "12px 10px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.danger }}>{infectedFound.length}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textLight,
                      fontWeight: 600,
                    }}
                  >
                    আক্রান্ত
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#f0fdf4",
                    borderRadius: 12,
                    padding: "12px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: C.primary,
                    }}
                  >
                    {inspectedPoints.length - infectedFound.length}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textLight,
                      fontWeight: 600,
                    }}
                  >
                    সুস্থ
                  </div>
                </div>
              </div>

              {/* Infection Rate */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.textMuted,
                }}
              >
                আপনার পর্যবেশনে সংক্রমণের হার:
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 32,
                  fontWeight: 900,
                  color: calcRate >= scenario.etlValue ? C.danger : C.success,
                  marginBottom: 16,
                }}
              >
                {calcRate.toFixed(1)}%
              </div>

              {/* ETL Comparison Bar */}
              <div
                style={{
                  marginBottom: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.textMuted,
                }}
              >
                ETL তুলনা
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 36,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 10,
                  overflow: "visible",
                  marginBottom: 28,
                }}
              >
                {/* Player rate fill */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${Math.min((calcRate / barMax) * 100, 100)}%`,
                    background:
                      calcRate >= scenario.etlValue
                        ? `linear-gradient(90deg, ${C.warning}, ${C.danger})`
                        : `linear-gradient(90deg, #86efac, ${C.success})`,
                    borderRadius: 10,
                    transition: "width 0.8s ease-out",
                  }}
                />
                {/* ETL threshold line */}
                <div
                  style={{
                    position: "absolute",
                    left: `${(scenario.etlValue / barMax) * 100}%`,
                    top: -4,
                    height: 44,
                    width: 3,
                    backgroundColor: C.accent,
                    borderRadius: 2,
                    zIndex: 2,
                    boxShadow: "0 0 6px rgba(245,158,11,0.5)",
                  }}
                />
                {/* ETL label */}
                <div
                  style={{
                    position: "absolute",
                    left: `${(scenario.etlValue / barMax) * 100}%`,
                    bottom: -20,
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.accent,
                    whiteSpace: "nowrap",
                  }}
                >
                  ETL {scenario.etlValue}%
                </div>
                {/* Player rate marker */}
                <div
                  style={{
                    position: "absolute",
                    left: `${Math.min((calcRate / barMax) * 100, 100)}%`,
                    top: -6,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: calcRate >= scenario.etlValue ? C.danger : C.success,
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 4px currentColor",
                  }}
                />
              </div>

              {/* Decision Prompt */}
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  textAlign: "center",
                  marginBottom: 14,
                }}
              >
                সিদ্ধান্ত নিন:
              </div>

              {/* Decision Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => makeDecision("treat")}
                  style={{
                    flex: 1,
                    background: `linear-gradient(135deg, #fef2f2, #fee2e2)`,
                    border: `2.5px solid ${C.danger}`,
                    borderRadius: 14,
                    padding: "14px 10px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "center",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.96)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #fee2e2, #fecaca)`;
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #fef2f2, #fee2e2)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #fef2f2, #fee2e2)`;
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 4 }}>🧪</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: C.danger,
                    }}
                  >
                    চিকিৎসা করুন
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.textLight,
                      marginTop: 2,
                    }}
                  >
                    সংক্রমণ ETL অতিক্রম করেছে
                  </div>
                </button>

                <button
                  onClick={() => makeDecision("monitor")}
                  style={{
                    flex: 1,
                    background: `linear-gradient(135deg, #eff6ff, #dbeafe)`,
                    border: `2.5px solid ${C.blue}`,
                    borderRadius: 14,
                    padding: "14px 10px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "center",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.96)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #dbeafe, #bfdbfe)`;
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #eff6ff, #dbeafe)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #eff6ff, #dbeafe)`;
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 4 }}>👁️</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: C.blue,
                    }}
                  >
                    পর্যবেক্ষণ করুন
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.textLight,
                      marginTop: 2,
                    }}
                  >
                    সংক্রমণ ETL এর নিচে
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── W-Pattern Legend ── */}
        {subPhase === "inspecting" && showHint && (
          <div
            style={{
              background: "#fffbeb",
              border: `1.5px solid ${C.accent}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              color: "#92400e",
              lineHeight: 1.6,
              animation: "fs-popIn 0.3s ease-out",
              maxWidth: 380,
              margin: "0 auto",
            }}
          >
            💡 <strong>W-প্যাটার্ন:</strong> হলুদ ঘরগুলো হলো প্রস্তাবিত নমুনা সংগ্রহের পয়েন্ট। এটি পুরো মাঠকে
            প্রতিনিধিত্বমূলকভাবে কভার করে।
          </div>
        )}
      </div>
    </>
  );
}
