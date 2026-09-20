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

  // Sub-view inside Pillar 1: "protocol" | "flowchart" | "checklist"
  const [learningSubView, setLearningSubView] = useState("protocol");

  // Global Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  // Flowchart Decision Tree state
  const [flowchartPart, setFlowchartPart] = useState("leaf");
  const [flowchartSymptom, setFlowchartSymptom] = useState("spots");
  const [flowchartPattern, setFlowchartPattern] = useState("patch");
  const [flowchartWeather, setFlowchartWeather] = useState("wet_fog");

  // Field Inspection 8-Point Checklist state
  const [fieldChecks, setFieldChecks] = useState({
    healthyComparison: false,
    bothLeafSurfaces: false,
    stemVascularCut: false,
    soilFertilityDrainage: false,
    weatherHistory: false,
    pestCountETL: false,
    triangleWeakLink: false,
    ipmHierarchy: false,
  });
  const [copiedToast, setCopiedToast] = useState(false);

  // Visited Pillars exploration tracking
  const [visitedPillars, setVisitedPillars] = useState(() => {
    try {
      const saved = localStorage.getItem("cabi_visited_pillars");
      return saved ? JSON.parse(saved) : ["learning"];
    } catch {
      return ["learning"];
    }
  });

  // Track pillar helper
  const trackPillar = (pillarId) => {
    if (!pillarId) return;
    setVisitedPillars((prev) => {
      if (!prev.includes(pillarId)) {
        const next = [...prev, pillarId];
        try {
          localStorage.setItem("cabi_visited_pillars", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      }
      return prev;
    });
  };

  const handleSelectPillar = (pillarId) => {
    setActivePillar(pillarId);
    trackPillar(pillarId);
  };

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

  // Flowchart Diagnostic Deduction
  const getFlowchartDiagnosis = () => {
    if (flowchartSymptom === "water_soaked") {
      return {
        probableCause: "ব্যাকটেরিয়াজনিত পচন বা ব্লাইট (Bacterial Soft Rot / Blight)",
        badge: "ব্যাকটেরিয়া",
        color: "#ea580c",
        exclusionNote: "কাঁচের মতো পানিভেজা কিনারা ও দুর্গন্ধযুক্ত পচন ব্যাকটেরিয়ার প্রধান লক্ষণ। এটি সাধারণ শুষ্ক ছত্রাক দাগ নয়।",
        actionSteps: [
          "আক্রান্ত গাছের অংশ সাবধানে কেটে ফেলে বিনষ্ট করুন",
          "ইউরিয়া সারের মাত্রা কমিয়ে পটাশিয়াম ও জিপসাম প্রয়োগ করুন",
          "জমি থেকে দ্রুত পানি নিষ্কাশনের ব্যবস্থা করুন",
          "প্রয়োজনে কপার অক্সিক্লোরাইড (যেমন: কুপ্রোফিক্স বা চ্যাম্পিয়ন) ২ গ্রাম/লিটার হারে স্প্রে করুন",
        ],
        triangleLink: "আর্দ্রতা নিয়ন্ত্রণ ও রোগ প্রতিরোধী জাত নির্বাচন করে অনুকূল পরিবেশ ভাঙুন",
        ttsText: "সম্ভাব্য কারণ ব্যাকটেরিয়াজনিত রোগ। পানিভেজা লক্ষণ ও দুর্গন্ধ ব্যাকটেরিয়ার বৈশিষ্ট্য। অতিরিক্ত নাইট্রোজেন পরিহার করে পানি নিষ্কাশন করুন এবং কপারযুক্ত ছত্রাকনাশক ব্যবহার করুন।",
      };
    }
    if (flowchartSymptom === "curling_yellow") {
      if (flowchartPattern === "new_leaves") {
        return {
          probableCause: "ভাইরাসজনিত পাতা কুঁকড়ানো বা মোজাইক (Viral Mosaic via Whitefly / Vector)",
          badge: "ভাইরাস ও ভেক্টর",
          color: "#7c3aed",
          exclusionNote: "কচি পাতায় শিরা হলুদ, মোজাইক বা কুঁচকানো ভাইরাসের বৈশিষ্ট্য। ছত্রাকনাশক দিলে কোনো কাজ হবে না, বাহক পোকা দমন জরুরি।",
          actionSteps: [
            "আক্রান্ত চারা বা গাছ সাথে সাথে উপড়ে মাটিচাপা দিন",
            "হলুদ আঠালো ফাঁদ (Yellow Sticky Trap) প্রতি শতকে ২টি করে টানান",
            "বাহক পোকা (সাদা মাছি/জাবপোকা) দমনে সাবান পানি বা ইমিডাক্লোপ্রিড স্প্রে করুন",
            "ভাইরাসমুক্ত সুস্থ বীজ ও রোগ প্রতিরোধী জাত ব্যবহার করুন",
          ],
          triangleLink: "বাহক পোকা দমন করে সংক্রমণের চক্র ছিন্ন করুন",
          ttsText: "সম্ভাব্য কারণ ভাইরাসজনিত রোগ। কচি পাতার মোজাইক বা কুঁকড়ানো সাদা মাছি বা জাবপোকা ছড়ায়। আক্রান্ত গাছ ধ্বংস করুন এবং হলুদ আঠালো ফাঁদ ব্যবহার করুন।",
        };
      } else {
        return {
          probableCause: "পুষ্টি উপাদানের অভাব (Nutrient Deficiency - N, K or Mg)",
          badge: "পুষ্টি ঘাটতি (অজৈব)",
          color: "#d97706",
          exclusionNote: "পুরনো পাতা থেকে হলুদ হওয়া শুরু হলে এবং কোনো স্পষ্ট জীবাণুর দাগ না থাকলে এটি পুষ্টির অভাব।",
          actionSteps: [
            "নাইট্রোজেনের অভাবে পুরনো পাতা সম্পূর্ণ হলুদ হয় — পরিমিত ইউরিয়া প্রয়োগ করুন",
            "পটাশিয়ামের অভাবে পাতার কিনারা পোড়া হয় — এমওপি বা ছাই প্রয়োগ করুন",
            "ম্যাগনেসিয়ামের অভাবে শিরা সবুজ থেকে মধ্যভাগ হলুদ হয় — ম্যাগনেসিয়াম সালফেট স্প্রে করুন",
            "মাটির পিএইচ (pH) ও আর্দ্রতা সুষম রাখুন",
          ],
          triangleLink: "গাছকে পুষ্টিকর ও রোগ প্রতিরোধক্ষম রাখতে সুষম সার দিন",
          ttsText: "সম্ভাব্য কারণ পুষ্টি ঘাটতি। এটি কোনো রোগজীবাণু নয়। পুরনো পাতা হলুদ হলে নাইট্রোজেন বা পটাশের অভাব। সুষম সার প্রয়োগ করুন।",
        };
      }
    }
    if (flowchartSymptom === "holes_chewed") {
      return {
        probableCause: "চর্বণকারী বা ছিদ্রকারী ক্ষতিকারক পোকা (Chewing Insect / Borer / Caterpillar)",
        badge: "পোকার আক্রমণ",
        color: "#dc2626",
        exclusionNote: "পাতায় অনিয়মিত কাটা অংশ, কাণ্ডে ছিদ্র ও কাঠের মতো মল পোকার সুস্পষ্ট চিহ্ন। কোনো স্প্রে করার আগে ETL ক্ষয়ক্ষতির মাত্রা গুনুন।",
        actionSteps: [
          "হাত দিয়ে ডিমের গাদা ও পোকার কীড়া সংগ্রহ করে ধ্বংস করুন",
          "মাঠে আলোক ফাঁদ ও ফেরোমোন ফাঁদ স্থাপন করুন",
          "ট্রাইকোগ্রামা বা ব্রাকন পরজীবী বন্ধু পোকা অবমুক্ত করুন",
          "ETL অতিক্রম করলে অনুমোদিত বালাইনাশক নির্দেশিকা মেনে স্প্রে করুন",
        ],
        triangleLink: "আলোক ফাঁদ ও বন্ধু পোকা বাড়িয়ে পোকার বংশবৃদ্ধি থামান",
        ttsText: "সম্ভাব্য কারণ ছিদ্রকারী বা চর্বণকারী পোকা। কাণ্ড বা পাতার ছিদ্রে মল দেখলে মাজরা বা লেদা পোকা নিশ্চিত। আলোক ফাঁদ ব্যবহার করুন।",
      };
    }
    // Default: Spots (Fungal)
    return {
      probableCause: "ছত্রাকজনিত পাতা বা কাণ্ডের দাগ/ঝলসা (Fungal Leaf Blight / Blast / Spot)",
      badge: "ছত্রাকজনিত",
      color: "#2563eb",
      exclusionNote: "গোলাকার বা চোখের মতো স্পষ্ট সীমানাযুক্ত দাগ এবং কুয়াশাচ্ছন্ন আবহাওয়ায় বিস্তার ছত্রাকের নিশ্চিত লক্ষণ।",
      actionSteps: [
        "গাছের নিচের শুকনো ও দাগযুক্ত পাতা ছেঁটে দিন যাতে বাতাস চলাচল বাড়ে",
        "ভোরে বা স্যাঁতসেঁতে অবস্থায় জমিতে কাজ করা পরিহার করুন",
        "ছত্রাক প্রতিরোধে ট্রাইকোডার্মা জৈব ছত্রাকনাশক ব্যবহার করুন",
        "তীব্র হলে ট্রাইসাইক্লাজোল বা ডাইফেনোকোনাজল নির্দেশিত মাত্রায় স্প্রে করুন",
      ],
      triangleLink: "বাতাস চলাচল বাড়িয়ে আর্দ্রতা কমিয়ে ছত্রাকের অনুকূল পরিবেশ নষ্ট করুন",
      ttsText: "সম্ভাব্য কারণ ছত্রাকজনিত দাগ বা ব্লাইট। কুয়াশা ও স্যাঁতসেঁতে আবহাওয়া ছত্রাকের জন্য অনুকূল। গাছের নিচ পরিষ্কার রাখুন এবং অনুমোদিত ছত্রাকনাশক ব্যবহার করুন।",
    };
  };

  // Search Results Generator across all learning assets
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    // Check 5 Protocol steps
    CABI_PROTOCOL_STEPS.forEach((step) => {
      if (
        step.title.toLowerCase().includes(q) ||
        step.en.toLowerCase().includes(q) ||
        step.desc.toLowerCase().includes(q) ||
        step.inquiry.toLowerCase().includes(q) ||
        step.points.some((p) => p.toLowerCase().includes(q))
      ) {
        if (searchFilter === "all" || searchFilter === "protocol") {
          results.push({
            type: "protocol",
            title: `ধাপ ${step.num}: ${step.title}`,
            subtitle: step.en,
            desc: step.desc,
            icon: step.icon,
            color: step.color,
            pillar: "learning",
            subOption: step.stepNumber,
          });
        }
      }
    });

    // Check Science & Understanding
    if (searchFilter === "all" || searchFilter === "science") {
      if ("রোগ ত্রিভুজ".includes(q) || "triangle".includes(q) || "pathogen".includes(q) || "পরিবেশ".includes(q)) {
        results.push({
          type: "science",
          title: "রোগ ত্রিভুজ তত্ত্ব (Disease Triangle)",
          subtitle: "পোষক, রোগজীবাণু ও অনুকূল পরিবেশের সমীকরণ",
          desc: "কীভাবে পরিবেশ বা পোষক নিয়ন্ত্রণের মাধ্যমে রোগের সংক্রমণ ভাঙা যায়।",
          icon: "🔺",
          color: "#d97706",
          pillar: "understanding",
          subOption: "triangle",
        });
      }
      if ("etl".includes(q) || "ক্ষতি".includes(q) || "পোকা".includes(q) || "মাত্রা".includes(q) || "মাজরা".includes(q)) {
        results.push({
          type: "science",
          title: "অর্থনৈতিক ক্ষতির মাত্রা (ETL Database)",
          subtitle: "মাজরা, বিপিএইচ ও ফল ছিদ্রকারী পোকার অ্যাকশন লেভেল",
          desc: "কখন স্প্রে করতে হবে এবং কখন স্প্রে পরিহার করতে হবে তার বৈজ্ঞানিক হিসাব।",
          icon: "📊",
          color: "#16a34a",
          pillar: "understanding",
          subOption: "etl",
        });
      }
      if ("পুষ্টি".includes(q) || "নাইট্রোজেন".includes(q) || "পটাশিয়াম".includes(q) || "ঘাটতি".includes(q) || "সার".includes(q)) {
        results.push({
          type: "science",
          title: "পুষ্টি অভাব বনাম রোগ (Nutrient vs Disease)",
          subtitle: "এন, পি, কে, জিংক ও বোরন ঘাটতির লক্ষণ",
          desc: "কীভাবে রোগজীবাণু ও সারের ঘাটতি আলাদা করবেন তার নির্দেশিকা।",
          icon: "🧪",
          color: "#7c3aed",
          pillar: "understanding",
          subOption: "nutrients",
        });
      }
      if ("আইপিএম".includes(q) || "ipm".includes(q) || "পিরামিড".includes(q) || "ব্যবস্থাপনা".includes(q)) {
        results.push({
          type: "science",
          title: "সমন্বিত বালাই ব্যবস্থাপনা (IPM Pyramid)",
          subtitle: "কালচারাল, মেকানিক্যাল, বায়োলজিক্যাল ও রাসায়নিক ধাপ",
          desc: "পরিবেশবান্ধব ফসল সুরক্ষা পিরামিডের ৪টি স্তর।",
          icon: "🌿",
          color: "#0891b2",
          pillar: "understanding",
          subOption: "ipm",
        });
      }
      if ("বালাইনাশক".includes(q) || "moa".includes(q) || "frac".includes(q) || "irac".includes(q) || "ঘূর্ণন".includes(q)) {
        results.push({
          type: "science",
          title: "বালাইনাশক প্রতিরোধ ব্যবস্থাপনা (MoA & Rotation)",
          subtitle: "FRAC ও IRAC কোড পরিবর্তন করে স্প্রে নির্দেশিকা",
          desc: "বালাইনাশকের কার্যপদ্ধতি ও প্রতিরোধ রোধের বৈজ্ঞানিক নিয়মাবলী।",
          icon: "🔄",
          color: "#4f46e5",
          pillar: "understanding",
          subOption: "resistance",
        });
      }
      if ("এটলাস".includes(q) || "ছবি".includes(q) || "গ্যালারি".includes(q) || "atlas".includes(q) || "চিত্র".includes(q)) {
        results.push({
          type: "science",
          title: "ভিজ্যুয়াল রোগ এটলাস (Visual Reference Atlas)",
          subtitle: "২৭৮টি বাস্তব রোগ ও পোকার রেফারেন্স ছবি",
          desc: "বাংলাদেশের মাঠ পর্যায়ের ফসলের লক্ষণ ভিত্তিক অফলাইন ফটো গ্যালারি।",
          icon: "🖼️",
          color: "#9333ea",
          pillar: "understanding",
          subOption: "atlas",
        });
      }
    }

    // Check Videos
    if (searchFilter === "all" || searchFilter === "video") {
      LIBRARY_MEDIA_DATA.videoCategories.forEach((cat) => {
        cat.videos.forEach((vid) => {
          if (
            vid.title.toLowerCase().includes(q) ||
            vid.desc.toLowerCase().includes(q) ||
            cat.title.toLowerCase().includes(q)
          ) {
            results.push({
              type: "video",
              title: vid.title,
              subtitle: `ভিডিও টিউটোরিয়াল • ${cat.title}`,
              desc: vid.desc,
              icon: vid.emoji || "🎬",
              color: "#d97706",
              pillar: "audiovisuals",
              subOption: cat.id,
            });
          }
        });
      });
    }

    // Check Slides & Readings & Audio
    if (searchFilter === "all" || searchFilter === "media") {
      LIBRARY_MEDIA_DATA.slides.forEach((sl) => {
        if (sl.title.toLowerCase().includes(q)) {
          results.push({
            type: "media",
            title: sl.title,
            subtitle: "স্লাইড ডেক প্রেজেন্টেশন",
            desc: "CABI Plantwise ফিল্ড স্লাইড প্রেজেন্টেশন ও ট্রেইনিং মেটেরিয়াল",
            icon: "🖼️",
            color: "#ea580c",
            pillar: "audiovisuals",
            subOption: "slides",
          });
        }
      });
      LIBRARY_MEDIA_DATA.readings.forEach((rd) => {
        if (rd.title.toLowerCase().includes(q) || rd.desc.toLowerCase().includes(q)) {
          results.push({
            type: "media",
            title: rd.title,
            subtitle: "পড়ার ম্যানুয়াল ও টেকনিক্যাল গাইড",
            desc: rd.desc,
            icon: "📖",
            color: "#2563eb",
            pillar: "audiovisuals",
            subOption: "read",
          });
        }
      });
      LIBRARY_MEDIA_DATA.audio.forEach((au) => {
        if (au.title.toLowerCase().includes(q) || au.desc.toLowerCase().includes(q)) {
          results.push({
            type: "media",
            title: au.title,
            subtitle: "বাংলা অডিও পডকাস্ট",
            desc: au.desc,
            icon: "🎙️",
            color: "#16a34a",
            pillar: "audiovisuals",
            subOption: "audio",
          });
        }
      });
    }

    // Check Games
    if (searchFilter === "all" || searchFilter === "game") {
      CABI_PRACTICE_GAMES.forEach((gm) => {
        if (
          gm.title.toLowerCase().includes(q) ||
          gm.en.toLowerCase().includes(q) ||
          gm.desc.toLowerCase().includes(q) ||
          gm.focus.toLowerCase().includes(q)
        ) {
          results.push({
            type: "game",
            title: `${gm.title} (${gm.en})`,
            subtitle: `ইন্টারেক্টিভ গেম মিশন • ধাপ ${gm.step}`,
            desc: gm.desc,
            icon: gm.icon,
            color: gm.color,
            pillar: "practice",
            subOption: gm.id,
          });
        }
      });
    }

    return results;
  };

  // Clipboard copy handler for 8-point field checklist
  const handleCopyFieldChecklist = () => {
    const checkedCount = Object.values(fieldChecks).filter(Boolean).length;
    const reportText = `📋 CABI উদ্ভিদ গোয়েন্দা — মাঠ পরিদর্শন চেকলিস্ট রিপোর্ট
তারিখ: ${new Date().toLocaleDateString("bn-BD")}
সম্পন্ন পয়েন্ট: ${checkedCount}/৮ টি ধাপ
-----------------------------------------
১. সুস্থ উদ্ভিদের সাথে তুলনা: ${fieldChecks.healthyComparison ? "✓ সম্পন্ন" : "✗ বাকী"}
২. পাতার উভয় পিঠ ও ডালপালা পরীক্ষা: ${fieldChecks.bothLeafSurfaces ? "✓ সম্পন্ন" : "✗ বাকী"}
৩. কাণ্ড ও ভাস্কুলার বান্ডিলে দাগ পরীক্ষা: ${fieldChecks.stemVascularCut ? "✓ সম্পন্ন" : "✗ বাকী"}
৪. মাটির আর্দ্রতা, সার ও নিষ্কাশন অবস্থা: ${fieldChecks.soilFertilityDrainage ? "✓ সম্পন্ন" : "✗ বাকী"}
৫. আবহাওয়ার প্রভাব ও সাম্প্রতিক পরিবর্তন: ${fieldChecks.weatherHistory ? "✓ সম্পন্ন" : "✗ বাকী"}
৬. পোকার সংখ্যা গণনা ও ETL মাত্রা: ${fieldChecks.pestCountETL ? "✓ সম্পন্ন" : "✗ বাকী"}
৭. রোগ ত্রিভুজের দুর্বলতম অংশ চিহ্নিতকরণ: ${fieldChecks.triangleWeakLink ? "✓ সম্পন্ন" : "✗ বাকী"}
৮. আইপিএম কালচারাল ও জৈব সমাধান অগ্রাধিকার: ${fieldChecks.ipmHierarchy ? "✓ সম্পন্ন" : "✗ বাকী"}
-----------------------------------------
উদ্ভিদ গোয়েন্দা · CABI Plantwise · DAE Bangladesh`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(reportText).then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3000);
      });
    } else {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
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

      {/* ── PROGRESS & EXPLORATION BADGES STRIP ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          padding: "8px 14px",
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          fontSize: 11.5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: C.text }}>
          <span>🌟 আপনার শিক্ষা অগ্রগতি:</span>
          <span style={{ color: C.primary, fontWeight: 800 }}>
            {visitedPillars.length} / ৪ স্তম্ভ অন্বেষণ
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "learning", label: "প্রোটোকল", icon: "📖" },
            { id: "understanding", label: "বিজ্ঞান", icon: "🧠" },
            { id: "audiovisuals", label: "ভিডিও-পডকাস্ট", icon: "🎬" },
            { id: "practice", label: "গেম মিশন", icon: "🎮" },
          ].map((b) => {
            const isUnlocked = visitedPillars.includes(b.id);
            return (
              <span
                key={b.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: isUnlocked ? C.bgSuccess || "rgba(22,163,74,0.12)" : C.bgMuted,
                  color: isUnlocked ? (C.success || "#15803d") : C.textMuted,
                  fontWeight: 700,
                  fontSize: 10.5,
                  border: `1px solid ${isUnlocked ? "rgba(22,163,74,0.3)" : C.border}`,
                }}
              >
                <span>{b.icon}</span>
                <span>{b.label}</span>
                <span>{isUnlocked ? "✓" : "○"}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── GLOBAL SEARCH & QUICK JUMP FINDER ── */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: C.shadow,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="যেকোনো রোগ, পোকা, ভিডিও, পুষ্টি বা গেম খুঁজুন (যেমন: ব্লাস্ট, BPH, নাইট্রোজেন, MoA)..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: C.text,
              fontFamily: "inherit",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: C.bgMuted,
                border: "none",
                borderRadius: "50%",
                width: 22,
                height: 22,
                cursor: "pointer",
                fontSize: 11,
                color: C.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="মুছে ফেলুন"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
          {[
            { id: "all", label: "সব বিষয়" },
            { id: "protocol", label: "📖 ৫-ধাপ প্রোটোকল" },
            { id: "science", label: "🧠 বিজ্ঞান ও এটলাস" },
            { id: "video", label: "🎬 ভিডিও গাইড" },
            { id: "media", label: "🖼️ স্লাইড ও রিডিং" },
            { id: "game", label: "🎮 গেম মিশন" },
          ].map((f) => {
            const isSelected = searchFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSearchFilter(f.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: `1px solid ${isSelected ? C.primary : C.border}`,
                  background: isSelected ? C.primary : C.bgMuted,
                  color: isSelected ? "#fff" : C.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Results Container */}
        {searchQuery.trim() && (
          <div
            style={{
              marginTop: 4,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            {(() => {
              const matches = getSearchResults();
              if (matches.length === 0) {
                return (
                  <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", padding: "14px 0" }}>
                    "{searchQuery}" এর জন্য কোনো ফলাফল মেলেনি। অন্য কি-ওয়ার্ড বা ফিল্টার চেষ্টা করুন।
                  </div>
                );
              }
              return (
                <>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: C.primaryDark }}>
                    পাওয়া গেছে ({matches.length} টি ফলাফল):
                  </div>
                  {matches.map((res, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        jumpToPillar(res.pillar, res.subOption);
                        setSearchQuery("");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: C.bgMuted,
                        borderRadius: 12,
                        cursor: "pointer",
                        gap: 10,
                        transition: "all 0.15s ease",
                        border: `1px solid transparent`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{res.icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12.5, color: C.text }}>
                            {res.title}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>
                            {res.subtitle}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: res.color || C.primary,
                          color: "#fff",
                          fontSize: 10.5,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        সরাসরি যান →
                      </span>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── PILLAR 1: 📖 শিখুন (LEARNING - 5-STEP PROTOCOL) ─────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activePillar === "learning" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Pillar Intro & Mode Switcher */}
          <div
            style={{
              background: C.bgCard,
              borderRadius: 18,
              padding: 16,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadow,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark }}>
                  CABI ৫-ধাপ রোগ নির্ণয় প্রোটোকল ও সিদ্ধান্ত ইঞ্জিন
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  আন্তর্জাতিক মানসম্পন্ন ৫টি সুনির্দিষ্ট ধাপে কৃষকের ফসল রোগ শনাক্ত, মাঠ চেকলিস্ট ও সঠিক প্রেসক্রিপশন
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                  🎬 নির্ণয় ভিডিও
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

            {/* Pillar 1 Sub-View Selector */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 6,
                background: C.bgMuted,
                padding: 4,
                borderRadius: 12,
              }}
            >
              {[
                { id: "protocol", label: "📋 ৫-ধাপ প্রোটোকল", desc: "পূর্ণ নির্দেশিকা" },
                { id: "flowchart", label: "🎯 সিদ্ধান্ত প্রবাহচিত্র", desc: "ইন্টারেক্টিভ গাইড" },
                { id: "checklist", label: "📝 মাঠ চেকলিস্ট", desc: "৮-দফা পরিদর্শন" },
              ].map((tab) => {
                const isSelected = learningSubView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setLearningSubView(tab.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "none",
                      background: isSelected ? C.bgCard : "transparent",
                      color: isSelected ? C.primary : C.textMuted,
                      cursor: "pointer",
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: 12,
                      boxShadow: isSelected ? C.shadow : "none",
                      transition: "all 0.15s ease",
                      textAlign: "center",
                    }}
                  >
                    <div>{tab.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>{tab.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUB-VIEW 1: 5-STEP PROTOCOL ACCORDION */}
          {learningSubView === "protocol" && (
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
          )}

          {/* SUB-VIEW 2: INTERACTIVE DECISION FLOWCHART WIZARD */}
          {learningSubView === "flowchart" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Flowchart Controls Card */}
              <div
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadow,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div>
                  <div className="ud-headline" style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
                    🎯 মাঠ লক্ষণ নির্বাচন করুন (৪-ধাপ সিদ্ধান্ত প্রবাহচিত্র)
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>
                    গাছের আক্রান্ত অংশ, দৃশ্যমান লক্ষণ, বিস্তৃতির প্যাটার্ন ও আবহাওয়া নির্বাচন করে সঠিক কারণ ও প্রেসক্রিপশন পান
                  </div>
                </div>

                {/* 1. Crop Part Selection */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.primaryDark, marginBottom: 6 }}>
                    ১. আক্রান্ত উদ্ভিদ অংশ:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
                    {[
                      { id: "leaf", label: "🌿 পাতা", icon: "🍃" },
                      { id: "stem", label: "🪵 কাণ্ড ও গোড়া", icon: "🪵" },
                      { id: "fruit", label: "🍅 ফল ও ফুল", icon: "🌸" },
                      { id: "root", label: "🌱 শিকড় ও মাটি", icon: "🌾" },
                    ].map((item) => {
                      const sel = flowchartPart === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setFlowchartPart(item.id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: `1.5px solid ${sel ? C.primary : C.border}`,
                            background: sel ? `${C.primary}12` : C.bgMuted,
                            color: sel ? C.primary : C.text,
                            fontWeight: sel ? 800 : 600,
                            fontSize: 12,
                            cursor: "pointer",
                            textAlign: "center",
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Symptom Appearance */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.primaryDark, marginBottom: 6 }}>
                    ২. দৃশ্যমান লক্ষণের ধরন:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6 }}>
                    {[
                      { id: "spots", label: "🔴 দাগ ও ঝলসা", desc: "সীমানাযুক্ত গোল বা লম্বাটে" },
                      { id: "water_soaked", label: "💧 পানিভেজা পচন", desc: "কাঁচের মতো নরম ও দুর্গন্ধ" },
                      { id: "curling_yellow", label: "🌀 হলুদ শিরা ও কোঁকড়ানো", desc: "মোজাইক বা বিবর্ণ পাতা" },
                      { id: "holes_chewed", label: "🐛 কাটা অংশ ও ছিদ্র", desc: "পোকার মল ও খাওয়া পাতা" },
                    ].map((item) => {
                      const sel = flowchartSymptom === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setFlowchartSymptom(item.id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: `1.5px solid ${sel ? C.primary : C.border}`,
                            background: sel ? `${C.primary}12` : C.bgMuted,
                            color: sel ? C.primary : C.text,
                            fontWeight: sel ? 800 : 600,
                            fontSize: 11.5,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>{item.label}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Distribution Pattern */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.primaryDark, marginBottom: 6 }}>
                    ৩. মাঠে বা গাছে বিস্তারের প্যাটার্ন:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6 }}>
                    {[
                      { id: "patch", label: "📍 নির্দিষ্ট ১-২টি গাছের গুচ্ছ", desc: "মাঠে গোল চাকা বা প্যাচ" },
                      { id: "uniform", label: "🌾 পুরো মাঠে সমভাবে ছড়ানো", desc: "মাটি বা আবহাওয়াজনিত প্রভাব" },
                      { id: "older_leaves", label: "🍂 নিচের পুরনো পাতায় আগে", desc: "পুষ্টি চলনশীলতা লক্ষণ" },
                      { id: "new_leaves", label: "🌱 উপরের কচি ডগায় আগে", desc: "ভাইরাস বা অচল পুষ্টি" },
                    ].map((item) => {
                      const sel = flowchartPattern === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setFlowchartPattern(item.id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: `1.5px solid ${sel ? C.primary : C.border}`,
                            background: sel ? `${C.primary}12` : C.bgMuted,
                            color: sel ? C.primary : C.text,
                            fontWeight: sel ? 800 : 600,
                            fontSize: 11.5,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>{item.label}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Weather or Input Condition */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.primaryDark, marginBottom: 6 }}>
                    ৪. সাম্প্রতিক আবহাওয়া ও পরিচর্যা:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6 }}>
                    {[
                      { id: "wet_fog", label: "🌧️ টানা বৃষ্টি ও কুয়াশা", desc: "উচ্চ আর্দ্রতা ও স্যাঁতসেঁতে" },
                      { id: "dry_heat", label: "☀️ প্রচণ্ড রোদ ও শুষ্ক বাতাস", desc: "উষ্ণ তাপমাত্রা ও খরা" },
                      { id: "high_nitrogen", label: "⚡ অতিরিক্ত ইউরিয়া সার", desc: "ঘন সবুজ গাছ ও নরম কোষ" },
                    ].map((item) => {
                      const sel = flowchartWeather === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setFlowchartWeather(item.id)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: `1.5px solid ${sel ? C.primary : C.border}`,
                            background: sel ? `${C.primary}12` : C.bgMuted,
                            color: sel ? C.primary : C.text,
                            fontWeight: sel ? 800 : 600,
                            fontSize: 11.5,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>{item.label}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Deduction Result Matrix */}
              {(() => {
                const diag = getFlowchartDiagnosis();
                return (
                  <div
                    style={{
                      background: C.bgCard,
                      borderRadius: 18,
                      border: `1.5px solid ${diag.color}`,
                      padding: 16,
                      boxShadow: `0 6px 20px ${diag.color}25`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: `${diag.color}18`,
                            color: diag.color,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {diag.badge}
                        </span>
                        <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text, marginTop: 4 }}>
                          {diag.probableCause}
                        </div>
                      </div>

                      {ttsSupported && (
                        <button
                          onClick={() => {
                            if (speaking) {
                              stopTts();
                            } else {
                              speak(diag.ttsText, { prependFriendly: true });
                            }
                          }}
                          style={{
                            background: speaking ? "#f42a41" : C.bgMuted,
                            border: `1px solid ${C.border}`,
                            color: speaking ? "#fff" : C.text,
                            borderRadius: 10,
                            padding: "6px 12px",
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>{speaking ? "⏹️" : "🔊"}</span>
                          <span>{speaking ? "থামুন" : "পরামর্শ শুনুন"}</span>
                        </button>
                      )}
                    </div>

                    {/* Exclusion Rationale Note */}
                    <div
                      style={{
                        background: `${diag.color}10`,
                        borderLeft: `4px solid ${diag.color}`,
                        padding: "10px 12px",
                        borderRadius: "0 10px 10px 0",
                        fontSize: 12.5,
                        color: C.text,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>🔍 CABI বর্জন যুক্তি (Elimination Rationale):</strong> {diag.exclusionNote}
                    </div>

                    {/* Step-by-Step IPM Prescription */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: diag.color, marginBottom: 6 }}>
                        🛡️ সমন্বিত আইপিএম ও নিরাপদ প্রতিকার পরিকল্পনা:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {diag.actionSteps.map((step, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                              background: C.bgMuted,
                              padding: "8px 10px",
                              borderRadius: 8,
                              fontSize: 12,
                              color: C.text,
                            }}
                          >
                            <span style={{ fontWeight: 800, color: diag.color }}>{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disease Triangle Connection */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: C.bgMuted,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                        fontSize: 12,
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: C.text }}>🔺 রোগ ত্রিভুজ লিঙ্ক: </span>
                        <span style={{ color: C.textMuted }}>{diag.triangleLink}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => jumpToPillar("understanding", "triangle")}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            background: C.bgCard,
                            border: `1px solid ${C.border}`,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#7c3aed",
                            cursor: "pointer",
                          }}
                        >
                          রোগ ত্রিভুজ দেখুন →
                        </button>
                        <button
                          onClick={() => jumpToPillar("practice", "cause-detective")}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            background: "#16a34a",
                            border: "none",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          🎮 কারণ খোঁজার গেম
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SUB-VIEW 3: FIELD INSPECTION 8-POINT CHECKLIST & CHEAT SHEET */}
          {learningSubView === "checklist" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  background: C.bgCard,
                  borderRadius: 18,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadow,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
                      📝 মাঠ পরীক্ষার ৮-দফা চেকলিস্ট (Field Inspection Checklist)
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>
                      মাঠে গিয়ে ধাপে ধাপে পয়েন্টগুলো যাচাই করুন। সম্পূর্ণ হলে রিপোর্ট কপি করে সংরক্ষণে রাখুন।
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleCopyFieldChecklist}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        background: C.primary,
                        color: "#fff",
                        border: "none",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 8px rgba(0,106,78,0.3)",
                      }}
                    >
                      <span>📋</span>
                      <span>{copiedToast ? "কপি সম্পন্ন! ✓" : "চেকলিস্ট কপি করুন"}</span>
                    </button>
                    <button
                      onClick={() =>
                        setFieldChecks({
                          healthyComparison: false,
                          bothLeafSurfaces: false,
                          stemVascularCut: false,
                          soilFertilityDrainage: false,
                          weatherHistory: false,
                          pestCountETL: false,
                          triangleWeakLink: false,
                          ipmHierarchy: false,
                        })
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: 10,
                        background: C.bgMuted,
                        color: C.textMuted,
                        border: `1px solid ${C.border}`,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      রিসেট
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(() => {
                  const done = Object.values(fieldChecks).filter(Boolean).length;
                  const pct = Math.round((done / 8) * 100);
                  return (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ color: C.text }}>মাঠ প্রস্তুতি ও পরীক্ষা সম্পন্ন:</span>
                        <span style={{ color: done === 8 ? C.success : C.primary }}>
                          {done}/৮ টি সম্পন্ন ({pct}%)
                        </span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: C.bgMuted, borderRadius: 999, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: done === 8 ? "#16a34a" : C.primary,
                            borderRadius: 999,
                            transition: "width 0.25s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 8 Checkpoints */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {[
                    {
                      key: "healthyComparison",
                      num: "১",
                      title: "সুস্থ গাছের সাথে তুলনা",
                      desc: "আক্রান্ত গাছের পাশের স্বাভাবিক সুস্থ গাছের রঙ, উচ্চতা ও বৃদ্ধি স্পষ্টভাবে তুলনা করেছি।",
                      icon: "🌱",
                    },
                    {
                      key: "bothLeafSurfaces",
                      num: "২",
                      title: "পাতার উভয় পিঠ ও ডালপালা পরীক্ষা",
                      desc: "পাতার উপরের পিঠ ও নিচের পিঠ ম্যাগনিফাইং গ্লাস দিয়ে ছত্রাকের ছাতা, ডিমের গাদা বা সূক্ষ্ম পোকা দেখেছি।",
                      icon: "🔍",
                    },
                    {
                      key: "stemVascularCut",
                      num: "৩",
                      title: "কাণ্ড ও ভাস্কুলার বান্ডিলে দাগ পরীক্ষা",
                      desc: "কাণ্ড বা গোড়া আড়াআড়ি কেটে ভেতরে বাদামী শিরা বা দুর্গন্ধযুক্ত আঠালো রস বের হচ্ছে কি না দেখেছি।",
                      icon: "🪵",
                    },
                    {
                      key: "soilFertilityDrainage",
                      num: "৪",
                      title: "মাটির আর্দ্রতা, সার প্রয়োগ ও নিষ্কাশন অবস্থা",
                      desc: "জমিতে অতিরিক্ত পানি জমে থাকা, খরা অথবা অতিরিক্ত ইউরিয়া সারের প্রভাব মূল্যায়ন করেছি।",
                      icon: "🌾",
                    },
                    {
                      key: "weatherHistory",
                      num: "৫",
                      title: "আবহাওয়ার সাম্প্রতিক ৩-৫ দিনের ইতিহাস",
                      desc: "টানা কুয়াশা, মেঘলা আকাশ বা তাপমাত্রা আকস্মিক বৃদ্ধির সাথে রোগের যোগসূত্র মিলিয়েছি।",
                      icon: "⛅",
                    },
                    {
                      key: "pestCountETL",
                      num: "৬",
                      title: "পোকার সংখ্যা গণনা ও ETL মাত্রা যাচাই",
                      desc: "১০টি গুছি বা গাছে ক্ষতিকারক পোকার সংখ্যা গুনে অর্থনৈতিক ক্ষতির সীমা (ETL) অতিক্রম করেছে কি না নিশ্চিত হয়েছি।",
                      icon: "📊",
                    },
                    {
                      key: "triangleWeakLink",
                      num: "৭",
                      title: "রোগ ত্রিভুজের দুর্বলতম অংশ চিহ্নিতকরণ",
                      desc: "অনুকূল পরিবেশ (যেমন আর্দ্রতা কমিয়ে) বা জাত পরিবর্তনের মাধ্যমে রোগ চক্র ভাঙার পথ ঠিক করেছি।",
                      icon: "🔺",
                    },
                    {
                      key: "ipmHierarchy",
                      num: "৮",
                      title: "আইপিএম কালচারাল ও জৈব সমাধান অগ্রাধিকার",
                      desc: "স্প্রে করার আগে রোগাক্রান্ত অংশ অপসারণ, ফাঁদ ব্যবহার ও উপকারী বন্ধু পোকার নিরাপত্তা নিশ্চিত করেছি।",
                      icon: "🌿",
                    },
                  ].map((item) => {
                    const isChecked = fieldChecks[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() =>
                          setFieldChecks((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key],
                          }))
                        }
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: isChecked ? `${C.primary}10` : C.bgMuted,
                          border: `1px solid ${isChecked ? C.primary : C.border}`,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: isChecked ? C.primary : C.bgCard,
                            border: `1.5px solid ${isChecked ? C.primary : C.textMuted}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 800,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          {isChecked ? "✓" : ""}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 14 }}>{item.icon}</span>
                            <span style={{ fontWeight: 800, fontSize: 13, color: isChecked ? C.primaryDark : C.text }}>
                              {item.num}. {item.title}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field Cheat Sheet Box */}
              <div
                style={{
                  background: C.bgCard,
                  borderRadius: 16,
                  padding: 14,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 800, color: C.primaryDark, fontSize: 13 }}>
                  💡 CABI Plantwise ও DAE মাঠ নির্দেশিকা (স্বর্ণনিয়ম):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                  <div style={{ background: C.bgMuted, padding: "8px 10px", borderRadius: 8 }}>
                    <strong>১. ভুল ডায়াগনসিস পরিহার:</strong> কখনো ১টি লক্ষণ দেখেই বালাইনাশক সুপারিশ করবেন না। পাতা, কাণ্ড ও গোড়া তিনটাই দেখুন।
                  </div>
                  <div style={{ background: C.bgMuted, padding: "8px 10px", borderRadius: 8 }}>
                    <strong>২. বন্ধু পোকা রক্ষা:</strong> মাকড়সা, লেডিবার্ড বিটল ও ড্রাগনফ্লাই মাঠে থাকলে কীটনাশক স্প্রে করা থেকে বিরত থাকুন।
                  </div>
                  <div style={{ background: C.bgMuted, padding: "8px 10px", borderRadius: 8 }}>
                    <strong>৩. মোড অব অ্যাকশন ঘূর্ণন:</strong> একই গ্রুপের কীটনাশক বা ছত্রাকনাশক পরপর দুইবার স্প্রে করবেন না; FRAC/IRAC কোড বদলান।
                  </div>
                </div>
              </div>
            </div>
          )}
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
