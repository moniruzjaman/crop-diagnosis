import { useState, useCallback, useEffect } from "react";
import { CAUSE_DETECTIVE_IMAGES } from "./imageMap";
import useTTS from "./useTTS";
import SymptomImageGallery from "./SymptomImageGallery";

/* ── Design Tokens ── */
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

const CAUSES = ["অপুষ্টি", "পোকা", "ছত্রাক", "ব্যাকটেরিয়া", "ভাইরাস"];

const CAUSE_COLORS = {
  অপুষ্টি: "#2563eb",
  পোকা: "#d97706",
  ছত্রাক: "#7c3aed",
  ব্যাকটেরিয়া: "#dc2626",
  ভাইরাস: "#0891b2",
};

const CAUSE_BG = {
  অপুষ্টি: "rgba(37,99,235,0.10)",
  পোকা: "rgba(217,119,6,0.10)",
  ছত্রাক: "rgba(124,58,237,0.10)",
  ব্যাকটেরিয়া: "rgba(220,38,38,0.10)",
  ভাইরাস: "rgba(8,145,178,0.10)",
};

const CAUSE_EMOJI = {
  অপুষ্টি: "🧪",
  পোকা: "🐛",
  ছত্রাক: "🍄",
  ব্যাকটেরিয়া: "🦠",
  ভাইরাস: "🧬",
};

/* ── Helper ── */
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

/* ── Round Data ── */
const ROUNDS = [
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "নতুন পাতা হলুদ হচ্ছে কিন্তু শিরা সবুজ আছে। পুরনো পাতা স্বাভাবিক।",
    clues: [
      { text: "শুধু নতুন পাতা আক্রান্ত", pointsTo: "অপুষ্টি" },
      { text: "পাতার শিরা সবুজ — সবুজ না হলে আয়রন অভাব", pointsTo: "অপুষ্টি" },
      { text: "কোনো পোকা বা ডিম দেখা যায়নি", pointsTo: "অপুষ্টি" },
      { text: "জিংক সালফেট স্প্রেয়ে উন্নতি হয়", pointsTo: "অপুষ্টি" },
      { text: "বৃদ্ধি থমে গেছে", pointsTo: "অপুষ্টি" },
    ],
    answer: "অপুষ্টি",
    explanation: "এটি জিংক (Zn) অভাব। নতুন পাতা হলুদ কিন্তু শিরা সবুজ — এটি জিংক অভাবের ক্লাসিক লক্ষণ।",
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "পাতায় মাকু আকৃতির ধূসর দাগ দেখা দিচ্ছে। আর্দ্রতা বেশি থাকলে দ্রুত ছড়ায়।",
    clues: [
      { text: "দাগ মাকু (diamond) আকৃতির", pointsTo: "ছত্রাক" },
      { text: "আর্দ্রতা বেশিতে সমস্যা বাড়ে", pointsTo: "ছত্রাক" },
      { text: "দাগের কেন্দ্র ধূসর, প্রান্ত গাঢ়", pointsTo: "ছত্রাক" },
      { text: "ছত্রাকনাশক দিলে নিয়ন্ত্রণ হয়", pointsTo: "ছত্রাক" },
      { text: "পোকা বা পানিভেজা দাগ নেই", pointsTo: "ছত্রাক" },
    ],
    answer: "ছত্রাক",
    explanation: "এটি ধানের ব্লাস্ট রোগ (Magnaporthe oryzae)। মাকু আকৃতির দাগ এর বৈশিষ্ট্য।",
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom:
      "পাতার কিনারা থেকে হলুদ হয়ে পানিভেজা দাগের মতো শুকিয়ে যাচ্ছে। সকালে দেখলে ব্যাকটেরিয়াল স্লাইম দেখা যায়।",
    clues: [
      { text: "কিনারা থেকে শুরু হয়", pointsTo: "ব্যাকটেরিয়া" },
      { text: "পাতার গায়ে সরু পানিভেজা রেখা", pointsTo: "ব্যাকটেরিয়া" },
      { text: "সকালে আর্দ্রতায় হলুদ আঠালো গন্ধ", pointsTo: "ব্যাকটেরিয়া" },
      { text: "খরা/বৃষ্টির পর দ্রুত ছড়ায়", pointsTo: "ব্যাকটেরিয়া" },
      { text: "কপার স্প্রেয়ে নিয়ন্ত্রণ হয়", pointsTo: "ব্যাকটেরিয়া" },
    ],
    answer: "ব্যাকটেরিয়া",
    explanation: "এটি ব্যাকটেরিয়াল লিফ ব্লাইট (Xanthomonas oryzae)। কিনারা থেকে শুরু হওয়া এর বৈশিষ্ট্য।",
  },
  {
    crop: "সরিষা (Mustard)",
    icon: "🌼",
    symptom: "নতুন পাতা কুঁকড়ে গেছে, গাছে মিষ্টি আঠা জমেছে, পিঁপড়া দেখা যাচ্ছে।",
    clues: [
      { text: "পাতা কুঁকড়ানো ও বাঁকানো", pointsTo: "পোকা" },
      { text: "পিঁপড়া আঠালো মধুরসে আকৃষ্ট", pointsTo: "পোকা" },
      { text: "পাতার নিচে ছোট সবুজ পোকা দেখা যায়", pointsTo: "পোকা" },
      { text: "নীল ফাঁদে ধরা পড়ে", pointsTo: "পোকা" },
      { text: "নিম তেল স্প্রেয়ে পোকা কমে", pointsTo: "পোকা" },
    ],
    answer: "পোকা",
    explanation: "এটি জাব পোকা / এফিড (Aphid)। পাতা কুঁকড়ানো, মধুরস ও পিঁপড়া — তিনটিই এফিডের লক্ষণ।",
  },
  {
    crop: "টমেটো (Tomato)",
    icon: "🍅",
    symptom: "পাতায় মোজেইক প্যাটার্ন (সবুজ-হলুদ দাগ), গাছ বামন হয়েছে, ফল বিকৃত।",
    clues: [
      { text: "মোজেইক (সোনালি) প্যাটার্ন", pointsTo: "ভাইরাস" },
      { text: "গাছের বৃদ্ধি বন্ধ হয়ে গেছে", pointsTo: "ভাইরাস" },
      { text: "কোনো ছত্রাকনাশক কাজ করে না", pointsTo: "ভাইরাস" },
      { text: "পোকা দ্বারা সঞ্চারিত (Whitefly)", pointsTo: "ভাইরাস" },
      { text: "আক্রান্ত গাছ তুলে ফেলাই একমাত্র উপায়", pointsTo: "ভাইরাস" },
    ],
    answer: "ভাইরাস",
    explanation: "এটি টমেটো লিফ কার্ল ভাইরাস (ToLCV)। মোজেইক প্যাটার্ন ও বামনতা ভাইরাসের লক্ষণ।",
  },
  {
    crop: "আলু (Potato)",
    icon: "🥔",
    symptom: "পানিভেজা দাগ দ্রুত বড় হয়ে সমস্ত পাতা কালো হয়ে যাচ্ছে। ঠান্ডা ও ভেজা আবহাওয়ায় দ্রুত ছড়ায়।",
    clues: [
      { text: "খুব দ্রুত ছড়ায় (২৪ ঘন্টায়)", pointsTo: "ছত্রাক" },
      { text: "ঠান্ডা + ভেজা আবহাওয়ায় বেশি", pointsTo: "ছত্রাক" },
      { text: "পাতার পেছনে সাদা স্পোর", pointsTo: "ছত্রাক" },
      { text: "মেটালাক্সিল+ম্যানকোজেব দিলে কাজ হয়", pointsTo: "ছত্রাক" },
      { text: "মাঠের এক কোণা থেকে ছড়ায়", pointsTo: "ছত্রাক" },
    ],
    answer: "ছত্রাক",
    explanation: "এটি আলুর লেট ব্লাইট (Phytophthora infestans)। ইতিহাসের সবচেয়ে ধ্বংসাত্মক ছত্রাক রোগ।",
  },
  {
    crop: "ধান (Rice)",
    icon: "🌾",
    symptom: "গাছের গোড়ায় বাদামি পোকা জমে আছে, গাছ হপার বার্ন (পোড়া) দেখাচ্ছে।",
    clues: [
      { text: "গাছের গোড়ায় বাদামি পোকা", pointsTo: "পোকা" },
      { text: "হপার বার্ন দেখা যায়", pointsTo: "পোকা" },
      { text: "বেশি নাইট্রোজেন সার দিলে বাড়ে", pointsTo: "পোকা" },
      { text: "ইমিডাক্লোপ্রিড কাজ করে", pointsTo: "পোকা" },
      { text: "প্রাকৃতিক শত্রু (মাকড়সা) দিয়ে নিয়ন্ত্রণ", pointsTo: "পোকা" },
    ],
    answer: "পোকা",
    explanation: "এটি বাদামি গাছফড়িং (Brown Planthopper)। হপার বার্ন এর বৈশিষ্ট্য।",
  },
  {
    crop: "বেগুন (Brinjal)",
    icon: "🍆",
    symptom: "ফুল ও ছোট ফল ঝরে পড়ছে, ফল বিকৃত হচ্ছে। কাণ্ডমাথাও শুকিয়ে মরে যাচ্ছে।",
    clues: [
      { text: "ফুল ঝরা + ফল বিকৃতি", pointsTo: "অপুষ্টি" },
      { text: "কাণ্ডমাথা মরে যাওয়া (die-back)", pointsTo: "অপুষ্টি" },
      { text: "বোরেক্স স্প্রেয়ে উন্নতি", pointsTo: "অপুষ্টি" },
      { text: "সূর্যমুখী ও সরিষায় বেশি হয়", pointsTo: "অপুষ্টি" },
      { text: "পোকা বা দাগ দেখা যায় না", pointsTo: "অপুষ্টি" },
    ],
    answer: "অপুষ্টি",
    explanation: "এটি বোরন (B) অভাব। ফুল ঝরা, ফল বিকৃতি ও কাণ্ডমাথা মরে যাওয়া — বোরন অভাবের ক্লাসিক লক্ষণ।",
  },
];

/* ── Keyframe Styles (injected once) ── */
const KEYFRAMES = `
@keyframes ud-fadeIn{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
@keyframes ud-popIn{0%{opacity:0;transform:scale(.7)}60%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes ud-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes ud-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes ud-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes ud-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes ud-scorePop{0%{opacity:1;transform:translateY(0) scale(1)}60%{opacity:1;transform:translateY(-30px) scale(1.3)}100%{opacity:0;transform:translateY(-50px) scale(1)}}
@keyframes ud-bounce{0%{transform:scale(0)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes ud-slideUp{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}
@keyframes ud-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
`;

let _stylesInjected = false;
function injectStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;
  const s = document.createElement("style");
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function CauseDetective() {
  useEffect(() => {
    injectStyles();
  }, []);

  /* ── State ── */
  const [phase, setPhase] = useState("start");
  const [roundIdx, setRoundIdx] = useState(0);
  const [revealedClues, setRevealedClues] = useState(new Set());
  const [eliminatedCauses, setEliminatedCauses] = useState(new Set());
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("game-cause-detective-high")) || 0;
    } catch {
      return 0;
    }
  });
  const [roundResults, setRoundResults] = useState([]);
  const [flipping, setFlipping] = useState(null);
  const [scorePop, setScorePop] = useState(null);
  const [lastPoints, setLastPoints] = useState({ base: 0, bonus: 0 });
  const [shaking, setShaking] = useState(null);

  const round = ROUNDS[roundIdx];
  const allCluesRevealed = revealedClues.size === 5;

  /* ── TTS ── */
  const { speak, stop, speaking, isSupported } = useTTS();

  /* ── Auto-speak symptom on new round ── */
  useEffect(() => {
    if (phase === "playing" && round && isSupported) {
      speak(`${round.crop}। ${round.symptom}`);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/stop/isSupported from useTTS have unstable refs; round is derived from roundIdx which is already in deps
  }, [roundIdx, phase]);

  /* ── Speak explanation after correct answer ── */
  useEffect(() => {
    if (answered && round && isSupported) {
      setTimeout(() => speak(round.explanation), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak/isSupported from useTTS have unstable refs; round is derived from roundIdx which is in the other effect's deps
  }, [answered]);

  /* ── Actions ── */
  const startGame = useCallback(() => {
    setPhase("playing");
    setRoundIdx(0);
    setScore(0);
    setRoundResults([]);
    setRevealedClues(new Set());
    setEliminatedCauses(new Set());
    setAttempts(0);
    setAnswered(false);
    setLastPoints({ base: 0, bonus: 0 });
    setScorePop(null);
  }, []);

  const revealClue = useCallback(
    (idx) => {
      if (answered || revealedClues.has(idx) || flipping !== null) return;
      setFlipping(idx);
      setTimeout(() => {
        setRevealedClues((prev) => {
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
        setFlipping(null);
      }, 350);
    },
    [answered, revealedClues, flipping],
  );

  const selectCause = useCallback(
    (cause) => {
      if (answered || eliminatedCauses.has(cause)) return;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (cause === round.answer) {
        const bonus = newAttempts === 1 ? 5 : 0;
        const points = 15 + bonus;
        const newScore = score + points;
        setAnswered(true);
        setScore(newScore);
        setLastPoints({ base: 15, bonus });
        setScorePop(points);
        setTimeout(() => setScorePop(null), 1200);
        setRoundResults((prev) => [
          ...prev,
          { round: roundIdx + 1, crop: round.crop, correct: true, attempts: newAttempts, points },
        ]);
        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            localStorage.setItem("game-cause-detective-high", String(newScore));
          } catch {}
        }
      } else {
        setEliminatedCauses((prev) => {
          const next = new Set(prev);
          next.add(cause);
          return next;
        });
        setShaking(cause);
        setTimeout(() => setShaking(null), 500);
      }
    },
    [answered, eliminatedCauses, attempts, score, highScore, round, roundIdx],
  );

  const nextRound = useCallback(() => {
    if (roundIdx + 1 >= ROUNDS.length) {
      setPhase("result");
    } else {
      setRoundIdx((p) => p + 1);
      setRevealedClues(new Set());
      setEliminatedCauses(new Set());
      setAttempts(0);
      setAnswered(false);
      setLastPoints({ base: 0, bonus: 0 });
      setFlipping(null);
      setShaking(null);
    }
  }, [roundIdx]);

  /* ═══════════════════════════════════════
     RENDER — START
     ═══════════════════════════════════════ */
  if (phase === "start") {
    return (
      <div style={styles.root}>
        <div style={styles.startWrap}>
          {/* Icon */}
          <div style={styles.startIconWrap}>
            <div style={styles.startIconBg}>🔍</div>
          </div>

          {/* Title */}
          <h1 className="ud-headline" style={{ ...styles.title, marginTop: 8 }}>
            কারণ খুঁজো
          </h1>
          <p style={styles.subtitle}>Cause Detective — CABI Step 2</p>

          {/* Description */}
          <div style={styles.descCard}>
            <p style={styles.descText}>
              ফসলের লক্ষণ দেখে সঠিক কারণ চিহ্নিত করুন। ক্লু কার্ড খুলুন, প্রমাণ সংগ্রহ করুন এবং সিদ্ধান্ত নিন!
            </p>
            <div style={styles.ruleList}>
              {[
                "রাউন্ডে ফসলের লক্ষণ দেখুন",
                "৫টি ক্লু কার্ড একটি একটি করে খুলুন",
                "প্রতিটি ক্লু কোনো একটি কারণের দিকে ইঙ্গিত করে",
                "সঠিক কারণ নির্বাচন করুন",
                "প্রথম চেষ্টায় সঠিক হলে বোনাস!",
              ].map((r, i) => (
                <div key={i} style={styles.ruleItem}>
                  <span style={styles.ruleBullet}>{toBn(i + 1)}</span>
                  <span style={styles.ruleText}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div style={styles.catWrap}>
            {CAUSES.map((c) => (
              <span
                key={c}
                style={{
                  ...styles.catChip,
                  borderColor: CAUSE_COLORS[c],
                  color: CAUSE_COLORS[c],
                  background: CAUSE_BG[c],
                }}
              >
                {CAUSE_EMOJI[c]} {c}
              </span>
            ))}
          </div>

          {/* High Score */}
          {highScore > 0 && (
            <div style={styles.highScoreBadge}>
              🏆 সর্বোচ্চ স্কোর: <strong>{toBn(highScore)}</strong>
            </div>
          )}

          {/* Start Button */}
          <button className="ud-headline" onClick={startGame} style={styles.startBtn}>
            🕵️ খেলা শুরু করুন
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER — RESULT
     ═══════════════════════════════════════ */
  if (phase === "result") {
    const correct = roundResults.filter((r) => r.correct).length;
    const perfect = roundResults.filter((r) => r.attempts === 1).length;
    const maxScore = ROUNDS.length * 20; /* 15 + 5 bonus each */
    const pct = Math.round((score / maxScore) * 100);
    const isNewHigh = score >= highScore && score > 0;

    let medal = "🎖️";
    let rank = "চমৎকার!";
    if (pct >= 90) {
      medal = "🏆";
      rank = "অসাধারণ!";
    } else if (pct >= 70) {
      medal = "🥇";
      rank = "চমৎকার!";
    } else if (pct >= 50) {
      medal = "🥈";
      rank = "ভালো!";
    } else if (pct >= 30) {
      medal = "🥉";
      rank = "নোট খারাপ না!";
    }

    return (
      <div style={styles.root}>
        <div style={styles.resultWrap}>
          {/* Trophy */}
          <div style={{ fontSize: 64, animation: "ud-bounce .6s ease-out" }}>{medal}</div>

          {/* Title */}
          <h1 className="ud-headline" style={styles.title}>
            খেলা শেষ!
          </h1>
          <p style={{ ...styles.subtitle, marginBottom: 4 }}>{rank}</p>

          {/* Score Card */}
          <div style={styles.scoreCard}>
            <div style={styles.scoreBig}>
              {toBn(score)}
              <span style={styles.scoreMax}> / {toBn(maxScore)}</span>
            </div>
            {/* Progress Bar */}
            <div style={styles.progBg}>
              <div
                style={{
                  ...styles.progFill,
                  width: `${pct}%`,
                  background: pct >= 70 ? C.success : pct >= 40 ? C.warning : C.danger,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{toBn(correct)}</div>
              <div style={styles.statLabel}>সঠিক উত্তর</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{toBn(perfect)}</div>
              <div style={styles.statLabel}>প্রথম চেষ্টায়</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statVal}>{toBn(ROUNDS.length)}</div>
              <div style={styles.statLabel}>মোট রাউন্ড</div>
            </div>
          </div>

          {/* High Score */}
          {isNewHigh && <div style={styles.newHighBadge}>🎉 নতুন রেকর্ড! সর্বোচ্চ: {toBn(highScore)}</div>}

          {/* Round Summary */}
          <div style={styles.summaryWrap}>
            <p style={styles.summaryTitle}>রাউন্ড সারাংশ</p>
            {roundResults.map((r, i) => (
              <div key={i} style={styles.summaryRow}>
                <span style={styles.summaryRound}>{toBn(r.round)}.</span>
                <span style={styles.summaryCrop}>
                  {ROUNDS[i].icon} {ROUNDS[i].crop}
                </span>
                <span
                  style={{
                    ...styles.summaryPts,
                    color: r.attempts === 1 ? C.success : C.accent,
                  }}
                >
                  +{toBn(r.points)}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <button className="ud-headline" onClick={startGame} style={styles.startBtn}>
            🔄 আবার খেলুন
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER — PLAYING
     ═══════════════════════════════════════ */
  const revealedCount = revealedClues.size;

  return (
    <div style={styles.root}>
      {/* Score Pop */}
      {scorePop && <div style={styles.scorePopFloat}>+{toBn(scorePop)}</div>}

      <div style={styles.playWrap}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.roundTag}>
            রাউন্ড <strong>{toBn(roundIdx + 1)}</strong> / {toBn(ROUNDS.length)}
          </div>
          <div style={styles.scoreTag}>⭐ {toBn(score)}</div>
        </div>

        {/* ── Progress Dots ── */}
        <div style={styles.dotRow}>
          {ROUNDS.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                background: i < roundIdx ? C.success : i === roundIdx ? C.primary : C.border,
                transform: i === roundIdx ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* ── Crop & Symptom ── */}
        <div style={styles.cropCard}>
          <div style={styles.cropRow}>
            <span style={styles.cropIcon}>{round.icon}</span>
            <span className="ud-headline" style={styles.cropName}>
              {round.crop}
            </span>
          </div>
          <div style={styles.symptomBox}>
            <span style={styles.symptomLabel}>লক্ষণ:</span>
            <p style={styles.symptomText}>{round.symptom}</p>
          </div>
        </div>

        {/* Symptom Images */}
        <SymptomImageGallery images={CAUSE_DETECTIVE_IMAGES[roundIdx] || []} label={round.symptom} />

        {/* Audio helper */}
        {isSupported && (
          <button
            onClick={() => speak(`${round.crop}। ${round.symptom}`)}
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
            }}
          >
            <span style={{ fontSize: 18 }}>🔊</span>
            {speaking ? "শুনছি..." : "লক্ষণ শুনুন"}
          </button>
        )}

        {/* ── Clue Cards ── */}
        <div style={styles.sectionLabel}>
          🔎 ক্লু কার্ড{" "}
          <span style={styles.clueCount}>
            ({toBn(revealedCount)}/{toBn(5)})
          </span>
        </div>
        <p style={styles.clueHint}>
          {allCluesRevealed
            ? "সব ক্লু দেখা হয়েছে — এখন কারণ নির্বাচন করুন!"
            : answered
              ? "সঠিক উত্তর দেখুন!"
              : "ক্লু কার্ডে চাপুন প্রমাণ দেখতে"}
        </p>

        <div style={styles.clueGrid}>
          {round.clues.map((clue, i) => {
            const isRevealed = revealedClues.has(i);
            const isFlipping = flipping === i;
            const causeColor = CAUSE_COLORS[clue.pointsTo] || C.primary;
            const causeBg = CAUSE_BG[clue.pointsTo] || C.bgMuted;

            return (
              <button
                key={i}
                onClick={() => revealClue(i)}
                disabled={isRevealed || answered}
                style={{
                  ...styles.clueCard,
                  animation: isFlipping
                    ? "ud-popIn .35s ease-out"
                    : isRevealed
                      ? "ud-slideUp .4s ease-out"
                      : answered
                        ? "none"
                        : "ud-float 3s ease-in-out infinite",
                  animationDelay: !isRevealed && !answered ? `${i * 0.4}s` : "0s",
                  cursor: isRevealed || answered ? "default" : "pointer",
                  background: isRevealed ? causeBg : C.bgCard,
                  borderColor: isRevealed ? causeColor : C.border,
                  opacity: isFlipping ? 0.6 : 1,
                }}
              >
                {isRevealed ? (
                  <div>
                    <div style={styles.clueText}>{clue.text}</div>
                    <div
                      style={{
                        ...styles.clueBadge,
                        background: causeColor,
                        color: "#fff",
                      }}
                    >
                      {CAUSE_EMOJI[clue.pointsTo]} {clue.pointsTo}
                    </div>
                  </div>
                ) : (
                  <div style={styles.clueHidden}>
                    <span style={styles.clueQ}>?</span>
                    <span style={styles.clueLabel}>ক্লু {toBn(i + 1)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Cause Selection ── */}
        <div style={styles.sectionLabel}>
          🎯 কারণ নির্বাচন করুন
          {!answered && attempts > 0 && <span style={styles.attemptTag}>চেষ্টা: {toBn(attempts)}</span>}
        </div>

        <div style={styles.causeGrid}>
          {CAUSES.map((cause) => {
            const isEliminated = eliminatedCauses.has(cause);
            const isCorrect = answered && cause === round.answer;
            const isShaking = shaking === cause;
            const color = CAUSE_COLORS[cause];
            const bg = CAUSE_BG[cause];

            return (
              <button
                key={cause}
                onClick={() => selectCause(cause)}
                disabled={isEliminated || isCorrect || answered}
                style={{
                  ...styles.causeBtn,
                  background: isCorrect ? C.success : isEliminated ? "#f3f4f6" : bg,
                  borderColor: isCorrect ? C.success : isEliminated ? "#e5e7eb" : color,
                  color: isCorrect ? "#fff" : isEliminated ? "#9ca3af" : color,
                  opacity: isEliminated ? 0.6 : 1,
                  cursor: isEliminated || isCorrect || answered ? "default" : "pointer",
                  animation: isShaking ? "ud-shake .5s ease-in-out" : isCorrect ? "ud-bounce .5s ease-out" : "none",
                  transform: isCorrect ? "scale(1.05)" : "none",
                }}
              >
                {isEliminated && <span style={styles.xOverlay}>✕</span>}
                {isCorrect && <span style={styles.checkOverlay}>✓</span>}
                <span style={{ fontSize: 22, lineHeight: 1 }}>{CAUSE_EMOJI[cause]}</span>
                <span style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{cause}</span>
              </button>
            );
          })}
        </div>

        {/* ── Explanation (after correct answer) ── */}
        {answered && (
          <div style={styles.explainWrap}>
            <div style={styles.explainCard}>
              <div style={styles.explainHeader}>
                <span style={{ fontSize: 20 }}>✅</span>
                <span style={{ fontWeight: 700, color: C.success, fontSize: 15 }}>সঠিক কারণ!</span>
              </div>
              <p style={styles.explainText}>{round.explanation}</p>
              <div style={styles.pointsRow}>
                <span style={styles.ptChip}>+{toBn(15)} সঠিক উত্তর</span>
                {lastPoints.bonus > 0 && (
                  <span style={{ ...styles.ptChip, background: "rgba(245,158,11,0.12)", color: C.accent }}>
                    +{toBn(lastPoints.bonus)} বোনাস 🎯
                  </span>
                )}
              </div>
            </div>

            <button className="ud-headline" onClick={nextRound} style={styles.nextBtn}>
              {roundIdx + 1 >= ROUNDS.length ? "খেলা শেষ দেখুন" : `পরবর্তী রাউন্ড →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INLINE STYLES
   ═══════════════════════════════════════════════════════════ */
const styles = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'Noto Sans Bengali', 'Segoe UI', system-ui, sans-serif",
    padding: 0,
    margin: 0,
    overflowY: "auto",
    overflowX: "hidden",
  },

  /* ── Start Screen ── */
  startWrap: {
    maxWidth: 440,
    margin: "0 auto",
    padding: "32px 20px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "ud-fadeIn .5s ease-out",
  },
  startIconWrap: {
    animation: "ud-float 3s ease-in-out infinite",
  },
  startIconBg: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    boxShadow: C.shadowMd,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: C.primaryDark,
    margin: "8px 0 0",
    textAlign: "center",
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 14,
    color: C.textLight,
    margin: "4px 0 20px",
    textAlign: "center",
  },
  descCard: {
    width: "100%",
    background: C.bgCard,
    borderRadius: 16,
    padding: 20,
    boxShadow: C.shadow,
    border: `1px solid ${C.border}`,
    marginBottom: 16,
  },
  descText: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 1.7,
    margin: "0 0 14px",
  },
  ruleList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  ruleItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  ruleBullet: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: C.bgMuted,
    color: C.primary,
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ruleText: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 1.5,
  },
  catWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginBottom: 16,
  },
  catChip: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    border: `1.5px solid`,
    background: "transparent",
  },
  highScoreBadge: {
    fontSize: 14,
    color: C.accent,
    fontWeight: 600,
    background: "rgba(245,158,11,0.10)",
    padding: "6px 16px",
    borderRadius: 20,
    marginBottom: 16,
  },
  startBtn: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: 14,
    border: "none",
    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
    color: "#fff",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: C.shadow,
    transition: "transform .15s, box-shadow .15s",
  },

  /* ── Playing ── */
  playWrap: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "16px 16px 100px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    animation: "ud-fadeIn .4s ease-out",
  },
  roundTag: {
    fontSize: 14,
    color: C.primary,
    fontWeight: 700,
    background: C.bgMuted,
    padding: "6px 14px",
    borderRadius: 20,
  },
  scoreTag: {
    fontSize: 14,
    fontWeight: 700,
    color: C.accent,
    background: "rgba(245,158,11,0.10)",
    padding: "6px 14px",
    borderRadius: 20,
  },
  dotRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    transition: "all .3s",
  },

  /* Crop Card */
  cropCard: {
    background: C.bgCard,
    borderRadius: 16,
    padding: 16,
    boxShadow: C.shadow,
    border: `1px solid ${C.border}`,
    marginBottom: 20,
    animation: "ud-fadeIn .45s ease-out",
  },
  cropRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  cropIcon: { fontSize: 28 },
  cropName: {
    fontSize: 18,
    fontWeight: 700,
    color: C.text,
  },
  symptomBox: {
    background: C.bgMuted,
    borderRadius: 12,
    padding: 12,
  },
  symptomLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  symptomText: {
    fontSize: 14,
    color: C.text,
    lineHeight: 1.7,
    margin: "6px 0 0",
  },

  /* Clue Cards */
  sectionLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: C.text,
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  clueCount: {
    fontSize: 13,
    fontWeight: 500,
    color: C.textLight,
  },
  clueHint: {
    fontSize: 13,
    color: C.textLight,
    marginBottom: 10,
    lineHeight: 1.4,
  },
  clueGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 24,
  },
  clueCard: {
    width: "100%",
    border: `1.5px solid ${C.border}`,
    borderRadius: 12,
    padding: 0,
    background: C.bgCard,
    textAlign: "left",
    cursor: "pointer",
    transition: "all .2s",
    position: "relative",
    overflow: "hidden",
    WebkitTapHighlightColor: "transparent",
  },
  clueText: {
    fontSize: 13,
    color: C.text,
    lineHeight: 1.5,
    padding: "12px 14px 4px",
    fontWeight: 500,
  },
  clueBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 8,
    margin: "0 0 10px 14px",
  },
  clueHidden: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 0",
    gap: 4,
  },
  clueQ: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: C.bgMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
    color: C.textLight,
  },
  clueLabel: {
    fontSize: 11,
    color: C.textLight,
    fontWeight: 600,
  },

  /* Cause Selection */
  attemptTag: {
    fontSize: 12,
    fontWeight: 600,
    color: C.danger,
    background: "rgba(220,38,38,0.08)",
    padding: "2px 10px",
    borderRadius: 12,
    marginLeft: 6,
  },
  causeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    marginBottom: 20,
  },
  causeBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    padding: "12px 4px",
    borderRadius: 12,
    border: `1.5px solid`,
    background: "transparent",
    cursor: "pointer",
    transition: "all .2s",
    position: "relative",
    overflow: "hidden",
    WebkitTapHighlightColor: "transparent",
    minHeight: 64,
  },
  xOverlay: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 16,
    fontWeight: 900,
    color: C.danger,
    lineHeight: 1,
  },
  checkOverlay: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 16,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1,
  },

  /* Explanation */
  explainWrap: {
    animation: "ud-slideUp .4s ease-out",
    marginTop: 4,
  },
  explainCard: {
    background: "#f0fdf4",
    border: `1.5px solid ${C.success}`,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  explainHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explainText: {
    fontSize: 14,
    color: C.text,
    lineHeight: 1.7,
    margin: 0,
  },
  pointsRow: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  ptChip: {
    fontSize: 12,
    fontWeight: 700,
    color: C.success,
    background: "rgba(22,163,74,0.10)",
    padding: "4px 12px",
    borderRadius: 20,
  },
  nextBtn: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: 14,
    border: "none",
    background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: C.shadow,
  },

  /* Score Pop */
  scorePopFloat: {
    position: "fixed",
    top: 60,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 28,
    fontWeight: 900,
    color: C.success,
    animation: "ud-scorePop 1.1s ease-out forwards",
    pointerEvents: "none",
    zIndex: 999,
    textShadow: "0 2px 8px rgba(22,163,74,0.3)",
  },

  /* ── Result ── */
  resultWrap: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "40px 20px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "ud-fadeIn .5s ease-out",
  },
  scoreCard: {
    width: "100%",
    background: C.bgCard,
    borderRadius: 16,
    padding: "24px 20px 20px",
    boxShadow: C.shadow,
    border: `1px solid ${C.border}`,
    textAlign: "center",
    marginBottom: 16,
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: 900,
    color: C.primaryDark,
    lineHeight: 1,
    animation: "ud-popIn .5s ease-out",
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: 500,
    color: C.textLight,
  },
  progBg: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    background: C.bgMuted,
    marginTop: 16,
    overflow: "hidden",
  },
  progFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width .6s ease-out",
  },
  statsRow: {
    display: "flex",
    gap: 10,
    width: "100%",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    background: C.bgCard,
    borderRadius: 12,
    padding: "12px 8px",
    textAlign: "center",
    boxShadow: C.shadow,
    border: `1px solid ${C.border}`,
  },
  statVal: {
    fontSize: 22,
    fontWeight: 800,
    color: C.primary,
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: 11,
    color: C.textLight,
    marginTop: 2,
  },
  newHighBadge: {
    fontSize: 15,
    fontWeight: 700,
    color: C.accent,
    background: "rgba(245,158,11,0.12)",
    padding: "8px 20px",
    borderRadius: 20,
    marginBottom: 16,
    animation: "ud-pulse 1.5s ease-in-out infinite",
  },
  summaryWrap: {
    width: "100%",
    background: C.bgCard,
    borderRadius: 14,
    padding: 16,
    boxShadow: C.shadow,
    border: `1px solid ${C.border}`,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: C.text,
    marginBottom: 10,
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 0",
    borderBottom: `1px solid ${C.bgMuted}`,
  },
  summaryRound: {
    fontSize: 12,
    fontWeight: 700,
    color: C.textLight,
    width: 24,
    flexShrink: 0,
  },
  summaryCrop: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    fontWeight: 500,
  },
  summaryPts: {
    fontSize: 13,
    fontWeight: 700,
  },
};
