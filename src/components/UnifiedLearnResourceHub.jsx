import React, { useState, useEffect, useRef } from "react";
import useTTS from "../games/useTTS";
import VisualDiagnosisLibrary from "./VisualDiagnosisLibrary";
import {
  CABI_PROTOCOL_STEPS,
  ETL_DATABASE,
  NUTRIENTS_DATA,
  IPM_PYRAMID_LEVELS,
  RESISTANCE_ROTATION_DATA,
  LIBRARY_MEDIA_DATA,
  CABI_PRACTICE_GAMES,
  EXTERNAL_SIMULATION_GAMES,
} from "../data/learnResourceData";

// Lazy load the 5 CABI interactive game components
const SymptomSpotter = React.lazy(() => import("../games/SymptomSpotter"));
const CauseDetective = React.lazy(() => import("../games/CauseDetective"));
const DiseaseTriangle = React.lazy(() => import("../games/DiseaseTriangle"));
const FieldScout = React.lazy(() => import("../games/FieldScout"));
const IPMCommander = React.lazy(() => import("../games/IPMCommander"));

const GAME_COMPONENTS = {
  "symptom-spotter": SymptomSpotter,
  "cause-detective": CauseDetective,
  "disease-triangle": DiseaseTriangle,
  "field-scout": FieldScout,
  "ipm-commander": IPMCommander,
};

function extractDriveId(url) {
  if (!url) return "";
  const match = String(url).match(/\/d\/([^/]+)/);
  return match?.[1] || url;
}

function toDrivePreviewUrl(id) {
  return `https://drive.google.com/file/d/${extractDriveId(id)}/preview`;
}

function toDriveViewUrl(id) {
  return `https://drive.google.com/file/d/${extractDriveId(id)}/view`;
}

function MediaFrame({ title, src, height = 480, C }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 12,
        boxShadow: C.shadow,
      }}
    >
      {title && (
        <div className="ud-headline" style={{ fontWeight: 800, fontSize: 13.5, color: C.primaryDark, marginBottom: 8 }}>
          {title}
        </div>
      )}
      <iframe
        src={src}
        title={title || "মিডিয়া ভিউয়ার"}
        style={{ width: "100%", height, border: "none", borderRadius: 14, background: "#f8fafc" }}
        allow="autoplay; encrypted-media"
      />
    </div>
  );
}

function AudioPodcastPlayer({ title, id, desc, C }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch (err) {
        console.warn("Audio playback issue:", err);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const seek = (event) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration || 0, (audio.currentTime || 0) + seconds));
  };

  const formatTime = (time) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 16,
        boxShadow: C.shadow,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <audio ref={audioRef} src={`https://docs.google.com/uc?export=download&id=${extractDriveId(id)}`} preload="metadata" />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg,#7c3aed,#9333ea)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🎙️
          </div>
          <div>
            <div className="ud-headline" style={{ fontWeight: 800, fontSize: 14.5, color: C.text }}>
              {title}
            </div>
            {desc && <div style={{ fontSize: 11.5, color: C.textMuted }}>{desc}</div>}
          </div>
        </div>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 999,
            background: playing ? C.bgSuccess : C.bgMuted,
            color: playing ? C.success : C.textMuted,
          }}
        >
          {playing ? "চলছে" : "পডকাস্ট"}
        </span>
      </div>

      {/* Scrubber */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          onClick={seek}
          style={{
            width: "100%",
            height: 8,
            borderRadius: 999,
            background: C.bgMuted,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7c3aed, #2563eb)",
              borderRadius: 999,
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Audio Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <button
          onClick={() => skip(-10)}
          style={{
            border: `1px solid ${C.border}`,
            background: C.bgMuted,
            color: C.text,
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
          title="১০ সেকেন্ড পিছিয়ে যান"
        >
          ⏪ -১০ সে
        </button>
        <button
          onClick={toggle}
          style={{
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: "none",
            color: "#fff",
            borderRadius: 999,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          }}
          title={playing ? "থামুন" : "চালান"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => skip(10)}
          style={{
            border: `1px solid ${C.border}`,
            background: C.bgMuted,
            color: C.text,
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
          title="১০ সেকেন্ড এগিয়ে যান"
        >
          ⏩ +১০ সে
        </button>
      </div>
    </div>
  );
}

export default function UnifiedLearnResourceHub({
  initialPillar = "learning",
  initialSubSection = null,
  setActiveTab,
  C,
}) {
  // 4 Core Pillars:
  // 1. "learning" -> CABI 5-step process & protocol
  // 2. "understanding" -> Disease Triangle, ETL Database, Nutrients vs Disease, Resistance MoA, Visual Atlas
  // 3. "audiovisuals" -> Video Guides, Slide Deck, Reading Manuals, Audio Podcasts
  // 4. "practice" -> 5 CABI interactive games + simulation missions
  const [activePillar, setActivePillar] = useState(initialPillar);

  // Sub-navigation within pillars
  const [understandingSection, setUnderstandingSection] = useState(initialSubSection || "triangle");
  const [mediaSection, setMediaSection] = useState("video");
  const [activeVideoCategory, setActiveVideoCategory] = useState("diagnosis");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Game sub-state within Pillar 4
  const [activeGameId, setActiveGameId] = useState(null);

  // Active protocol step inspection in Pillar 1
  const [expandedStep, setExpandedStep] = useState(1);

  // TTS helper
  const { speak, stop: stopTts, speaking, isSupported: ttsSupported } = useTTS();

  // Keep pillar in sync if initial prop changes
  const [prevInitialPillar, setPrevInitialPillar] = useState(initialPillar);
  if (initialPillar !== prevInitialPillar) {
    setPrevInitialPillar(initialPillar);
    setActivePillar(initialPillar);
  }

  // Pillar tabs configuration
  const PILLARS = [
    {
      id: "learning",
      label: "১. শিখুন",
      subtitle: "৫-ধাপ প্রোটোকল",
      icon: "📖",
      color: "#2563eb",
    },
    {
      id: "understanding",
      label: "২. উপলব্ধি",
      subtitle: "বিজ্ঞান ও এটলাস",
      icon: "🧠",
      color: "#7c3aed",
    },
    {
      id: "audiovisuals",
      label: "৩. অডিও-ভিজ্যুয়াল",
      subtitle: "ভিডিও ও পডকাস্ট",
      icon: "🎬",
      color: "#d97706",
    },
    {
      id: "practice",
      label: "৪. খেলে অনুশীলন",
      subtitle: "৫টি গেম মিশন",
      icon: "🎮",
      color: "#16a34a",
    },
  ];

  // Helper to jump across pillars with targeted context
  const jumpToPillar = (pillarId, subOption = null) => {
    setActivePillar(pillarId);
    if (pillarId === "audiovisuals") {
      setMediaSection("video");
      if (subOption) setActiveVideoCategory(subOption);
    } else if (pillarId === "understanding") {
      if (subOption) setUnderstandingSection(subOption);
    } else if (pillarId === "practice") {
      if (subOption) setActiveGameId(subOption);
      else setActiveGameId(null);
    } else if (pillarId === "learning") {
      if (typeof subOption === "number") setExpandedStep(subOption);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24, animation: "fadeIn 0.3s ease" }}>
      {/* ── UNIFIED HUB BANNER ── */}
      <div
        className="ud-editorial-shadow"
        style={{
          background: `linear-gradient(135deg, ${C.primaryXDark || "#003b2b"}, ${C.primary})`,
          borderRadius: 24,
          padding: "20px 22px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
              <span>🌱</span> CABI PLANTWISE সমন্বিত শিক্ষা ও রিসোর্স
            </div>
            <h1 className="ud-headline" style={{ fontWeight: 900, fontSize: 22, margin: "0 0 6px 0", color: "#fff" }}>
              জ্ঞান, উপলব্ধি ও অনুশীলনের পূর্ণাঙ্গ ভান্ডার
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, opacity: 0.9, lineHeight: 1.6, maxWidth: 640 }}>
              ধাপে ধাপে পদ্ধতি শিখুন, বৈজ্ঞানিক ধারণার গভীরে যান, ভিডিও ও অডিওর মাধ্যমে স্পষ্ট ধারণা নিন এবং ৫টি ইন্টারেক্টিভ গেম খেলে নিজের সিদ্ধান্ত গ্রহণের দক্ষতা বাড়ান।
            </p>
          </div>

          {ttsSupported && (
            <button
              onClick={() => {
                if (speaking) {
                  stopTts();
                } else {
                  speak(
                    "সমন্বিত শিক্ষা ও রিসোর্স ভান্ডারে স্বাগতম। এখানে চারটি মূল স্তম্ভ রয়েছে। প্রথমত ৫-ধাপ প্রোটোকল শিখুন। দ্বিতীয়ত রোগতত্ত্ব ও বিজ্ঞান উপলব্ধি করুন। তৃতীয়ত অডিও-ভিজুয়াল ভিডিও দেখুন। এবং চতুর্থত ৫টি ইন্টারঅ্যাক্টিভ গেম খেলে নিজেকে দক্ষ করে তুলুন।",
                    { prependFriendly: true }
                  );
                }
              }}
              style={{
                background: speaking ? "#f42a41" : "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                borderRadius: 14,
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
              title="পুরো ভান্ডারের অডিও ভূমিকা শুনুন"
            >
              <span>{speaking ? "⏹️" : "🔊"}</span>
              <span>{speaking ? "থামুন" : "ভয়েস শুনুন"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 4 PILLARS NAVIGATION BAR ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
          gap: 8,
          background: C.bgCard,
          padding: 6,
          borderRadius: 20,
          border: `1px solid ${C.border}`,
          boxShadow: C.shadow,
        }}
      >
        {PILLARS.map((p) => {
          const isActive = activePillar === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setActivePillar(p.id);
                if (p.id === "practice") setActiveGameId(null);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 8px",
                borderRadius: 15,
                border: "none",
                background: isActive ? p.color : "transparent",
                color: isActive ? "#fff" : C.text,
                cursor: "pointer",
                transition: "all 0.18s ease",
                boxShadow: isActive ? `0 4px 14px ${p.color}40` : "none",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 2 }}>{p.icon}</div>
              <div className="ud-headline" style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>
                {p.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  opacity: isActive ? 0.95 : 0.65,
                  marginTop: 2,
                  fontWeight: 600,
                }}
              >
                {p.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── PILLAR 1: 📖 শিখুন (LEARNING - 5-STEP PROTOCOL) ─────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activePillar === "learning" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Pillar Intro Box */}
          <div
            style={{
              background: C.bgCard,
              borderRadius: 18,
              padding: 16,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadow,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark }}>
                CABI ৫-ধাপ রোগ নির্ণয় প্রোটোকল
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                আন্তর্জাতিক মানসম্পন্ন ৫টি সুনির্দিষ্ট ধাপে কৃষকের ফসল রোগ শনাক্ত ও সঠিক প্রেসক্রিপশন প্রদান
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => jumpToPillar("audiovisuals", "diagnosis")}
                style={{
                  background: C.bgMuted,
                  border: `1px solid ${C.border}`,
                  padding: "6px 12px",
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: C.text,
                  cursor: "pointer",
                }}
              >
                🎬 রোগ নির্ণয়ের ভিডিও
              </button>
              <button
                onClick={() => jumpToPillar("practice", "symptom-spotter")}
                style={{
                  background: C.bgSuccess,
                  border: `1px solid ${C.borderSuccess || C.border}`,
                  padding: "6px 12px",
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: C.success,
                  cursor: "pointer",
                }}
              >
                🎮 প্র্যাকটিস গেম
              </button>
            </div>
          </div>

          {/* 5 Steps Accordion / Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CABI_PROTOCOL_STEPS.map((s) => {
              const isExpanded = expandedStep === s.stepNumber;
              return (
                <div
                  key={s.id}
                  style={{
                    background: C.bgCard,
                    borderRadius: 18,
                    border: `1.5px solid ${isExpanded ? s.color : C.border}`,
                    boxShadow: isExpanded ? `0 6px 20px ${s.color}25` : C.shadow,
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Step Card Header */}
                  <div
                    onClick={() => setExpandedStep(isExpanded ? null : s.stepNumber)}
                    style={{
                      padding: "16px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      background: isExpanded ? `${s.color}0c` : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: s.color,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: s.color, textTransform: "uppercase" }}>
                            ধাপ {s.num} • {s.en}
                          </span>
                        </div>
                        <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
                          {s.title}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {ttsSupported && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speak(`ধাপ ${s.num}: ${s.title}। ${s.desc} অনুসন্ধানের মূল কথা: ${s.inquiry}`, {
                              prependFriendly: true,
                            });
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: 18,
                            cursor: "pointer",
                            padding: 4,
                          }}
                          title="এই ধাপের বিবরণ শুনুন"
                        >
                          🔊
                        </button>
                      )}
                      <span style={{ fontSize: 14, color: C.textMuted, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Step Card Body */}
                  {isExpanded && (
                    <div style={{ padding: "0 18px 18px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                      <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.65 }}>
                        {s.desc}
                      </p>

                      {/* Inquiry prompt */}
                      <div
                        style={{
                          background: `${s.color}10`,
                          borderLeft: `3px solid ${s.color}`,
                          padding: "10px 14px",
                          borderRadius: "0 12px 12px 0",
                          fontSize: 12.5,
                          color: C.text,
                        }}
                      >
                        <span style={{ fontWeight: 800, color: s.color }}>অনুসন্ধানী প্রশ্ন: </span>
                        {s.inquiry}
                      </div>

                      {/* Step Key Points */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>মাঠে করণীয় পরীক্ষাসমূহ:</div>
                        {s.points.map((pt, pidx) => (
                          <div key={pidx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
                            <span style={{ color: s.color, fontWeight: 900 }}>•</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>

                      {/* Cross-Pillar Bridges */}
                      <div
                        style={{
                          background: C.bgMuted,
                          borderRadius: 14,
                          padding: 12,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.textMuted }}>
                          এই ধাপের সহায়ক টুলস:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          <button
                            onClick={() => jumpToPillar("audiovisuals", s.videoCategoryId)}
                            style={{
                              padding: "6px 11px",
                              borderRadius: 8,
                              background: C.bgCard,
                              border: `1px solid ${C.border}`,
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: "#2563eb",
                              cursor: "pointer",
                            }}
                          >
                            🎬 ভিডিও টিউটোরিয়াল
                          </button>
                          <button
                            onClick={() => jumpToPillar("understanding", "atlas")}
                            style={{
                              padding: "6px 11px",
                              borderRadius: 8,
                              background: C.bgCard,
                              border: `1px solid ${C.border}`,
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: "#7c3aed",
                              cursor: "pointer",
                            }}
                          >
                            🖼️ ভিজ্যুয়াল লক্ষণ গ্যালারি
                          </button>
                          <button
                            onClick={() => jumpToPillar("practice", s.gameId)}
                            style={{
                              padding: "6px 11px",
                              borderRadius: 8,
                              background: "linear-gradient(135deg,#16a34a,#15803d)",
                              border: "none",
                              color: "#fff",
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(22,163,74,0.3)",
                            }}
                          >
                            🎮 {s.gameTitle} খেলুন
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── PILLAR 2: 🧠 উপলব্ধি (UNDERSTANDING & SCIENCE) ──────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activePillar === "understanding" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Sub-nav inside Understanding */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
            }}
          >
            {[
              { id: "triangle", label: "🔺 রোগ ত্রিভুজ" },
              { id: "etl", label: "📊 ETL ক্ষয়ক্ষতির মাত্রা" },
              { id: "nutrients", label: "🧪 পুষ্টি অভাব বনাম রোগ" },
              { id: "ipm", label: "🌿 IPM পিরামিড" },
              { id: "resistance", label: "🔄 বালাইনাশক MoA রোটেশন" },
              { id: "atlas", label: "🖼️ ভিজ্যুয়াল রোগ এটলাস (২৭৮ ছবি)" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setUnderstandingSection(sub.id)}
                className="ud-headline"
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${understandingSection === sub.id ? "#7c3aed" : C.border}`,
                  background: understandingSection === sub.id ? "#7c3aed" : C.bgCard,
                  color: understandingSection === sub.id ? "#fff" : C.text,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub-View: Disease Triangle */}
          {understandingSection === "triangle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                className="ud-editorial-shadow"
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 18,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark, marginBottom: 4 }}>
                  🔺 রোগ ত্রিভুজ তত্ত্ব (Disease Triangle Concept)
                </div>
                <p style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.6, margin: "0 0 14px 0" }}>
                  উদ্ভিদে কোনো সংক্রামক রোগ হওয়ার জন্য তিনটি শর্তের যুগপৎ উপস্থিতি আবশ্যক: <strong>সংবেদনশীল পোষক</strong> (Susceptible Host), <strong>উগ্র জীবাণু</strong> (Virulent Pathogen), এবং <strong>অনুকূল পরিবেশ</strong> (Favourable Environment)।
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <div style={{ background: C.bgInfo, border: `1px solid ${C.borderInfo || C.border}`, padding: 14, borderRadius: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#2563eb", marginBottom: 4 }}>🌱 সংবেদনশীল পোষক</div>
                    <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
                      ফসলের জাতের রোগ প্রতিরোধ ক্ষমতা কম থাকলে অথবা অতিরিক্ত ইউরিয়া প্রয়োগের ফলে কচি নরম টিস্যু তৈরি হলে আক্রমণ বাড়ে।
                    </div>
                  </div>
                  <div style={{ background: C.bgWarning, border: `1px solid ${C.borderWarning || C.border}`, padding: 14, borderRadius: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#d97706", marginBottom: 4 }}>🦠 উগ্র রোগজীবাণু</div>
                    <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
                      ছত্রাক, ব্যাকটেরিয়া বা ভাইরাসের উপস্থিতি ও বাতাসে স্পোরের ঘনত্ব। প্রাথমিক আক্রমণ প্রতিরোধে বীজ শোধন জরুরি।
                    </div>
                  </div>
                  <div style={{ background: C.bgSuccess, border: `1px solid ${C.borderSuccess || C.border}`, padding: 14, borderRadius: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#16a34a", marginBottom: 4 }}>🌦️ অনুকূল পরিবেশ</div>
                    <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
                      উচ্চ আর্দ্রতা (৮৫%+), একটানা কুয়াশা, স্যাঁতসেঁতে মেঘলা দিন বা গুঁড়ি গুঁড়ি বৃষ্টি স্পোর অঙ্কুরোদগমে সহায়তা করে।
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: C.bgMuted, padding: "10px 14px", borderRadius: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                    🎯 ত্রিভুজের যেকোনো একটি উপাদান রুখে দিন — রোগ ছড়াবে না!
                  </span>
                  <button
                    onClick={() => jumpToPillar("practice", "disease-triangle")}
                    style={{
                      background: "linear-gradient(135deg,#d97706,#b45309)",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🎮 রোগ ত্রিভুজ গেম খেলুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View: ETL Database */}
          {understandingSection === "etl" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                className="ud-editorial-shadow"
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark, marginBottom: 4 }}>
                  📊 অর্থনৈতিক ক্ষতির মাত্রা (Economic Threshold Level - ETL)
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                  পোকা বা রোগের উপস্থিতি মাত্রেই বিষ নয়! যখন ক্ষতির সম্ভাব্য খরচ বালাইনাশক ব্যয়ের চেয়ে বেশি হয়, তখনই ব্যবস্থা নিন।
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ETL_DATABASE.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: C.bgMuted,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{item.pest}</span>
                          <span style={{ fontSize: 11, color: C.textMuted }}>({item.crop})</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "#dc262615", color: "#dc2626" }}>
                          ETL: {item.etl}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.text }}>
                        <strong>পর্যবেক্ষণ নিয়ম:</strong> {item.monitor}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.textMuted }}>
                        <strong>করণীয় ব্যবস্থা:</strong> {item.action}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, textAlign: "right" }}>
                  <button
                    onClick={() => jumpToPillar("practice", "field-scout")}
                    style={{
                      background: "linear-gradient(135deg,#16a34a,#15803d)",
                      color: "#fff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🧪 ফিল্ড স্কাউটিং ও ETL গেম খেলুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View: Nutrients vs Disease */}
          {understandingSection === "nutrients" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                className="ud-editorial-shadow"
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark, marginBottom: 4 }}>
                  🧪 পুষ্টি উপাদানের অভাব বনাম রোগ নির্ণয় গাইড
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                  মাঠের অনেক সমস্যা রোগজীবাণুর আক্রমণ নয়, বরং সার বা পুষ্টির অভাব। নিচের তালিকা দেখে লক্ষণ পৃথক করুন:
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                  {NUTRIENTS_DATA.map((nut, nidx) => (
                    <div
                      key={nidx}
                      style={{
                        background: C.bgMuted,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: C.primaryDark }}>{nut.name}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, background: C.bgInfo, color: "#2563eb", padding: "2px 6px", borderRadius: 6 }}>
                          {nut.position}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
                        <strong>লক্ষণ:</strong> {nut.symptoms}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#b45309", background: "#fffbeb", padding: "6px 8px", borderRadius: 8, border: "1px solid #fde68a" }}>
                        <strong>রোগের সাথে পার্থক্য:</strong> {nut.vsDisease}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.textMuted }}>
                        <strong>সঠিক প্রতিকার:</strong> {nut.solution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-View: IPM Pyramid */}
          {understandingSection === "ipm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                className="ud-editorial-shadow"
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark, marginBottom: 4 }}>
                  🌿 সমন্বিত বালাই ব্যবস্থাপনা (IPM) পিরামিড
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                  নিচ থেকে উপরে উঠুন। প্রতিরোধমূলক কাজ আগে করুন, রাসায়নিক কীটনাশক কেবল শেষ পদক্ষেপ।
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {IPM_PYRAMID_LEVELS.map((lvl) => (
                    <div
                      key={lvl.level}
                      style={{
                        background: C.bgMuted,
                        borderLeft: `4px solid ${lvl.color}`,
                        borderTop: `1px solid ${C.border}`,
                        borderRight: `1px solid ${C.border}`,
                        borderBottom: `1px solid ${C.border}`,
                        borderRadius: "0 14px 14px 0",
                        padding: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: lvl.color }}>লেভেল {lvl.level}:</span>
                        <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{lvl.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{lvl.desc}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {lvl.tactics.map((t, tidx) => (
                          <span
                            key={tidx}
                            style={{
                              fontSize: 11,
                              background: C.bgCard,
                              border: `1px solid ${C.border}`,
                              padding: "3px 8px",
                              borderRadius: 6,
                              color: C.text,
                            }}
                          >
                            ✓ {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <button
                    onClick={() => jumpToPillar("audiovisuals", "management")}
                    style={{
                      background: C.bgMuted,
                      border: `1px solid ${C.border}`,
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      color: C.text,
                    }}
                  >
                    🎬 উদ্ভিদ স্বাস্থ্যের পিরামিড ভিডিও
                  </button>
                  <button
                    onClick={() => jumpToPillar("practice", "ipm-commander")}
                    style={{
                      background: "linear-gradient(135deg,#0891b2,#0e7490)",
                      color: "#fff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🎮 IPM কমান্ডার গেম খেলুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View: Pesticide MoA & Resistance */}
          {understandingSection === "resistance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                className="ud-editorial-shadow"
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark, marginBottom: 4 }}>
                  🔄 বালাইনাশক প্রতিরোধ ব্যবস্থাপনা (MoA & Rotation)
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                  একই বিষ বারবার দিলে পোকা ও ছত্রাক প্রতিরোধী হয়ে ওঠে। FRAC (ছত্রাকনাশক) ও IRAC (কীটনাশক) কোড পরিবর্তন করে স্প্রে করুন।
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* FRAC Fungicides */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#2563eb", marginBottom: 8 }}>
                      🍄 ছত্রাকনাশক (FRAC Groups):
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {RESISTANCE_ROTATION_DATA.frac.map((f, fidx) => (
                        <div key={fidx} style={{ background: C.bgMuted, padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span>{f.group}</span>
                            <span style={{ color: f.risk.includes("উচ্চ") ? "#dc2626" : "#16a34a" }}>{f.risk}</span>
                          </div>
                          <div style={{ color: C.textMuted, margin: "2px 0" }}>মূল উপাদান: {f.ai}</div>
                          <div style={{ color: "#006a4e", fontWeight: 600 }}>ঘূর্ণন পরামর্শ: {f.rotate}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* IRAC Insecticides */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed", marginBottom: 8 }}>
                      🪲 কীটনাশক (IRAC Groups):
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {RESISTANCE_ROTATION_DATA.irac.map((ir, iridx) => (
                        <div key={iridx} style={{ background: C.bgMuted, padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span>{ir.group}</span>
                            <span style={{ color: ir.risk.includes("উচ্চ") ? "#dc2626" : "#16a34a" }}>{ir.risk}</span>
                          </div>
                          <div style={{ color: C.textMuted, margin: "2px 0" }}>মূল উপাদান: {ir.ai}</div>
                          <div style={{ color: "#006a4e", fontWeight: 600 }}>ঘূর্ণন পরামর্শ: {ir.rotate}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View: Visual Reference Atlas (278 Photos) */}
          {understandingSection === "atlas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                className="ud-editorial-shadow"
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 4,
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                }}
              >
                <VisualDiagnosisLibrary />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── PILLAR 3: 🎬 অডিও-ভিজ্যুয়াল (AUDIO-VISUALS & MEDIA) ─────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activePillar === "audiovisuals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Sub-nav inside Audio-Visuals */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
            }}
          >
            {[
              { id: "video", label: "🎬 ভিডিও গাইড" },
              { id: "slides", label: "🖼️ স্লাইড ডেক" },
              { id: "read", label: "📖 পড়ার ডকুমেন্ট ও ম্যানুয়াল" },
              { id: "audio", label: "🎙️ অডিও পডকাস্ট" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setMediaSection(sub.id)}
                className="ud-headline"
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${mediaSection === sub.id ? "#d97706" : C.border}`,
                  background: mediaSection === sub.id ? "#d97706" : C.bgCard,
                  color: mediaSection === sub.id ? "#fff" : C.text,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub-View: Videos */}
          {mediaSection === "video" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Active Playing Video Frame */}
              {playingVideo && (
                <div
                  style={{
                    background: C.bgCard,
                    borderRadius: 20,
                    padding: 16,
                    border: `1px solid ${C.border}`,
                    boxShadow: C.shadowMd,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{playingVideo.emoji}</span>
                      <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark }}>
                        {playingVideo.title}
                      </div>
                    </div>
                    <button
                      onClick={() => setPlayingVideo(null)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                        background: C.bgMuted,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.danger || "#dc2626",
                      }}
                    >
                      ✕ প্লেয়ার বন্ধ করুন
                    </button>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.textMuted }}>{playingVideo.desc}</div>
                  <MediaFrame title={playingVideo.title} src={toDrivePreviewUrl(playingVideo.id)} height={420} C={C} />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a
                      href={toDriveViewUrl(playingVideo.id)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: C.bgSuccess,
                        border: `1px solid ${C.border}`,
                        color: C.success,
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      🌐 নতুন ট্যাবে খুলুন
                    </a>
                    <button
                      onClick={() => jumpToPillar("practice")}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg,#16a34a,#15803d)",
                        border: "none",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      🎮 ভিডিওর পর গেম খেলুন
                    </button>
                  </div>
                </div>
              )}

              {/* Video Categories Selector */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {LIBRARY_MEDIA_DATA.videoCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveVideoCategory(cat.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 12,
                      border: `1px solid ${activeVideoCategory === cat.id ? "#d97706" : C.border}`,
                      background: activeVideoCategory === cat.id ? "#d97706" : C.bgCard,
                      color: activeVideoCategory === cat.id ? "#fff" : C.text,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              {/* Video List within selected category */}
              {(() => {
                const currentCat = LIBRARY_MEDIA_DATA.videoCategories.find((c) => c.id === activeVideoCategory) || LIBRARY_MEDIA_DATA.videoCategories[0];
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                    {currentCat.videos.map((vid) => (
                      <div
                        key={vid.id}
                        style={{
                          background: C.bgCard,
                          border: `1px solid ${C.border}`,
                          borderRadius: 16,
                          padding: 16,
                          boxShadow: C.shadow,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 24 }}>{vid.emoji}</span>
                            <div className="ud-headline" style={{ fontWeight: 800, fontSize: 14.5, color: C.text }}>
                              {vid.title}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{vid.desc}</div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                          <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{vid.size}</span>
                          <button
                            onClick={() => {
                              setPlayingVideo(vid);
                              window.scrollTo({ top: 120, behavior: "smooth" });
                            }}
                            style={{
                              background: "linear-gradient(135deg, #d97706, #b45309)",
                              border: "none",
                              color: "#fff",
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            ▶ ভিডিও চালান
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Sub-View: Slides */}
          {mediaSection === "slides" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 18,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ud-headline" style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark }}>
                    {LIBRARY_MEDIA_DATA.slides[currentSlide]?.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.textMuted }}>
                    স্লাইড {currentSlide + 1} / {LIBRARY_MEDIA_DATA.slides.length}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    disabled={currentSlide <= 0}
                    onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                      background: currentSlide <= 0 ? C.bgMuted : C.bgCard,
                      cursor: currentSlide <= 0 ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    ← আগের স্লাইড
                  </button>
                  <button
                    disabled={currentSlide >= LIBRARY_MEDIA_DATA.slides.length - 1}
                    onClick={() => setCurrentSlide((p) => Math.min(LIBRARY_MEDIA_DATA.slides.length - 1, p + 1))}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                      background: currentSlide >= LIBRARY_MEDIA_DATA.slides.length - 1 ? C.bgMuted : C.bgCard,
                      cursor: currentSlide >= LIBRARY_MEDIA_DATA.slides.length - 1 ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    পরের স্লাইড →
                  </button>
                </div>
              </div>

              <MediaFrame
                title={LIBRARY_MEDIA_DATA.slides[currentSlide]?.title}
                src={toDrivePreviewUrl(LIBRARY_MEDIA_DATA.slides[currentSlide]?.id)}
                height={540}
                C={C}
              />
            </div>
          )}

          {/* Sub-View: Reading Docs */}
          {mediaSection === "read" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
              {LIBRARY_MEDIA_DATA.readings.map((item) => (
                <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <MediaFrame title={item.title} src={toDrivePreviewUrl(item.id)} height={480} C={C} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 11.5, color: C.textMuted }}>{item.desc}</div>
                    <a
                      href={toDriveViewUrl(item.id)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: C.bgSuccess,
                        border: `1px solid ${C.border}`,
                        color: C.success,
                        textDecoration: "none",
                        fontSize: 11.5,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      📥 ডাউনলোড / নতুন ট্যাব
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-View: Audio Podcasts */}
          {mediaSection === "audio" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
              {LIBRARY_MEDIA_DATA.audio.map((pod) => (
                <AudioPodcastPlayer key={pod.id} title={pod.title} id={pod.id} desc={pod.desc} C={C} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── PILLAR 4: 🎮 খেলে অনুশীলন (PLAYING TO PRACTICE) ─────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activePillar === "practice" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Active In-Game Frame */}
          {activeGameId && GAME_COMPONENTS[activeGameId] ? (
            <div style={{ animation: "fadeIn 0.25s ease" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                  padding: "10px 14px",
                  background: C.bgCard,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                }}
              >
                <button
                  onClick={() => setActiveGameId(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: C.primary,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: 18 }}>←</span> গেম তালিকা ও প্র্যাকটিস হাবে ফিরুন
                </button>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => jumpToPillar("learning")}
                    style={{
                      background: C.bgMuted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      color: C.text,
                    }}
                  >
                    📖 প্রোটোকল দেখুন
                  </button>
                  <button
                    onClick={() => jumpToPillar("audiovisuals", "diagnosis")}
                    style={{
                      background: C.bgMuted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      color: C.text,
                    }}
                  >
                    🎬 ভিডিও ক্লিপ
                  </button>
                </div>
              </div>

              <React.Suspense
                fallback={
                  <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
                    গেম লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                  </div>
                }
              >
                {React.createElement(GAME_COMPONENTS[activeGameId])}
              </React.Suspense>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Pillar Header */}
              <div
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadow,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark }}>
                    🎮 খেলে খেলে দক্ষতা অনুশীলন (Practice Games Hub)
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    CABI ৫টি ধাপের সাথে সরাসরি সম্পর্কিত ৫টি ইন্টারেক্টিভ সিনারিও গেম। ভুল হলে সাথে সাথে শিখুন!
                  </div>
                </div>
                {ttsSupported && (
                  <button
                    onClick={() =>
                      speak(
                        "খেলে অনুশীলন হাবে স্বাগতম। এখানে লক্ষণ লক্ষ্য, কারণ খুঁজো, রোগ ত্রিভুজ, মাঠ পরীক্ষক এবং আইপিএম কমান্ডার নামের পাঁচটি গেম রয়েছে। যেকোনো একটি খেলায় ক্লিক করুন।",
                        { prependFriendly: true }
                      )
                    }
                    style={{
                      background: C.bgMuted,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      color: C.text,
                    }}
                  >
                    🔊 গেম বর্ণনা শুনুন
                  </button>
                )}
              </div>

              {/* 5 CABI Step Games Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {CABI_PRACTICE_GAMES.map((gm) => (
                  <div
                    key={gm.id}
                    style={{
                      background: C.bgCard,
                      border: `1px solid ${C.border}`,
                      borderRadius: 18,
                      padding: 16,
                      boxShadow: C.shadow,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 14,
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: gm.bg,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 22,
                              flexShrink: 0,
                            }}
                          >
                            {gm.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 10.5, fontWeight: 800, color: gm.color, textTransform: "uppercase" }}>
                              {gm.focus}
                            </div>
                            <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
                              {gm.title}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: C.bgMuted, color: C.textMuted }}>
                          {gm.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55 }}>{gm.desc}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 11, color: C.textMuted }}>⏱️ {gm.duration}</span>
                      <button
                        onClick={() => {
                          setActiveGameId(gm.id);
                          window.scrollTo({ top: 120, behavior: "smooth" });
                        }}
                        style={{
                          background: gm.bg,
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          padding: "8px 16px",
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: `0 3px 10px ${gm.color}40`,
                        }}
                      >
                        গেম খেলুন ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* External Simulation Scenarios */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>
                  🌐 বাহ্যিক প্ল্যান্ট সিমুলেশন মিশন
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                  {EXTERNAL_SIMULATION_GAMES.map((ex) => (
                    <div
                      key={ex.id}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{ex.icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: C.text }}>{ex.title}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{ex.desc}</div>
                        </div>
                      </div>
                      <a
                        href={ex.src}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: C.bgMuted,
                          border: `1px solid ${C.border}`,
                          color: C.primary,
                          textDecoration: "none",
                          fontSize: 11.5,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        শুরু করুন →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick links to Apps and History */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 4 }}>
        <button
          onClick={() => setActiveTab("apps")}
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "12px 14px",
            textAlign: "left",
            cursor: "pointer",
            boxShadow: C.shadow,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22 }}>🌐</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>অন্যান্য কৃষি অ্যাপস</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>কৃষি বাতায়ন, ডিএই ও সেবা</div>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "12px 14px",
            textAlign: "left",
            cursor: "pointer",
            boxShadow: C.shadow,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22 }}>📋</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>সংরক্ষিত ডায়াগনসিস</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>পূর্ববর্তী রিপোর্ট ও হিস্ট্রি</div>
          </div>
        </button>
      </div>
    </div>
  );
}
