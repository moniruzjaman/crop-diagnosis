import { useState } from "react";
import {
  Sprout,
  UserCheck,
  Store,
  ScanSearch,
  BookOpen,
  FlaskConical,
  RotateCw,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Eye,
  Filter,
  Activity,
  CheckCircle2,
  Info,
} from "lucide-react";

/**
 * 5-Step Process Framework definition:
 * "We guide the user through the process and steps, not just jumping to the solution.
 * The solution is the ultimate outcome of the rigorous investigation."
 */
const CABI_5_STEPS = [
  {
    num: "১",
    titleBn: "লক্ষণ ও চিহ্ন পর্যবেক্ষণ",
    titleEn: "Observe Symptoms & Signs",
    icon: Eye,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.12)",
    border: "rgba(37,99,235,0.3)",
    questionBn: "গাছের কোন অংশে কী ধরণের দাগ, বিকৃতি বা পোকা দেখা যাচ্ছে?",
    actionTab: "diagnose",
    actionLabel: "লক্ষণ পর্যবেক্ষণ শুরু করুন",
    tips: [
      "পাতার উপরিভাগ ও তলদেশ উল্টে খুঁটিয়ে দেখুন",
      "দাগের সীমানা, রঙ ও পানিভেজা ভাব পরীক্ষা করুন",
      "পোকার বিষ্ঠা, জালিকাকার দাগ বা ডিম খুঁজুন",
      "একই বয়সের সুস্থ গাছের সাথে আক্রান্ত গাছের তুলনা করুন",
    ],
  },
  {
    num: "২",
    titleBn: "সম্ভাব্য কারণ বর্জন পদ্ধতি",
    titleEn: "CABI Exclusion Process",
    icon: Filter,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.3)",
    questionBn: "পুষ্টিহীনতা বনাম পোকা বনাম ছত্রাক/ব্যাকটেরিয়া — কোনটি বাদ দেওয়া যায়?",
    actionTab: "learn",
    actionLabel: "বর্জন গাইডলাইন পড়ুন",
    tips: [
      "অপুষ্টি: পুরনো পাতা হলুদ হলে নাইট্রোজেন (N), নতুন পাতা হলে আয়রন (Fe)",
      "পোকা: ছেঁড়া পাতা, কাণ্ড ফুটো, জালের উপস্থিতি",
      "ছত্রাক: গোল বা কোণাকৃতির দাগ, পাউডারি বা কালো গুঁড়ো",
      "ব্যাকটেরিয়া: রোদে ঝলসে যাওয়া ভাব, কাণ্ডে দুর্গন্ধযুক্ত রস",
    ],
  },
  {
    num: "৩",
    titleBn: "মাঠের বিস্তার ও রোগ ত্রিভুজ",
    titleEn: "Field Pattern & Disease Triangle",
    icon: Activity,
    color: "#d97706",
    bg: "rgba(217,119,6,0.12)",
    border: "rgba(217,119,6,0.3)",
    questionBn: "মাঠে সমস্যাটি কীভাবে ছড়াচ্ছে এবং আজকের আবহাওয়া কেমন?",
    actionTab: "today",
    actionLabel: "মাঠের বিস্তার ও আবহাওয়া দেখুন",
    tips: [
      "প্যাটার্ন: নির্দিষ্ট জায়গায় গোল চক্কর (বায়োটিক) নাকি পুরো জমিতে একসাথেই (অ্যাবায়োটিক)",
      "রোগ ত্রিভুজ: সংবেদনশীল জাত + জীবাণু + অনুকূল আবহাওয়া",
      "বাতাসের গতি ও বৃষ্টির সম্ভাবনা যাচাই (স্প্রে ধুয়ে যাওয়ার ঝুঁকি)",
      "মাটির অতিরিক্ত আর্দ্রতা বা খরা পরিস্থিতি পর্যবেক্ষণ",
    ],
  },
  {
    num: "৪",
    titleBn: "মাঠ নমুনা ও ক্ষয়ক্ষতির হার (ETL)",
    titleEn: "Field Sampling & Threshold",
    icon: RotateCw,
    color: "#0891b2",
    bg: "rgba(8,145,178,0.12)",
    border: "rgba(8,145,178,0.3)",
    questionBn: "আক্রান্তের হার কি ক্ষতিকর মাত্রা (ETL) অতিক্রম করেছে?",
    actionTab: "learn",
    actionLabel: "ETL সীমা তালিকা দেখুন",
    tips: [
      "মাঠে 'W' পদ্ধতিতে হেঁটে ১০টি আলাদা স্থান থেকে নমুনা সংগ্রহ করুন",
      "গাছ প্রতি পোকার সংখ্যা বা পাতার ক্ষতির শতকরা হার (%) গণনা করুন",
      "ক্ষতি সামান্য হলে কোনো রাসায়নিক স্প্রে করার প্রয়োজন নেই",
      "মিত্র পোকা (লেডিবার্ড বিটল, মাকড়সা) থাকলে অপেক্ষা করুন",
    ],
  },
  {
    num: "৫",
    titleBn: "চূড়ান্ত সমাধান ও IPM সিদ্ধান্ত",
    titleEn: "Integrated Decision (Ultimate Outcome)",
    icon: CheckCircle2,
    color: "#16a34a",
    bg: "rgba(22,163,74,0.15)",
    border: "rgba(22,163,74,0.4)",
    isOutcome: true,
    questionBn: "🎯 অনুসন্ধানের চূড়ান্ত পরিণতি: সবচেয়ে নিরাপদ ও কার্যকর ব্যবস্থাপনা কোনটি?",
    actionTab: "diagnose",
    actionLabel: "সঠিক ব্যবস্থাপনা ও ডোজ প্রয়োগ",
    tips: [
      "১ম ধাপ: সাংস্কৃতিক ও পরিবেশবান্ধব নিয়ন্ত্রণ (আগাছা পরিষ্কার, আলো ফাঁদ)",
      "২য় ধাপ: জৈব দমন (ট্রাইকোডার্মা, নিম তেল, ফেরোমন ফাঁদ)",
      "৩য় ধাপ: শেষ বিকল্প হিসেবে DAE অনুমোদিত রাসায়নিক ও IRAC/FRAC ঘূর্ণন",
      "১৬L/২০L ন্যাপস্যাক ট্যাংকের সঠিক ক্যালিব্রেশন ও ফসল তোলার বিরতি (PHI)",
    ],
  },
];

/**
 * Stakeholder data definition for Farmer, Extension Officer, and Input Seller
 * Built with strict emphasis on guiding the user through the PROCESS and STEPS first,
 * with the solution presented as the ultimate outcome.
 */
const STAKEHOLDERS = [
  {
    id: "farmer",
    roleBn: "মাঠপর্যায়ের কৃষক",
    roleEn: "Farmer",
    shortLabel: "কৃষক",
    taglineBn: "সরাসরি স্প্রে নয় — আগে ৫ ধাপে তদন্ত, তবেই সঠিক সমাধান",
    badgeBn: "🌾 কৃষকের মাঠ সহায়িকা",
    badgeColor: "#16a34a",
    icon: Sprout,
    headlineBn: "সরাসরি বিষ স্প্রে নয় — আগে ৫ ধাপে রোগ চিনুন, সঠিক সমাধানে পৌঁছান",
    subtitleBn:
      "পাতা হলুদ দেখলেই আন্দাজে ওষুধ কিনলে ফসল ও টাকা দুটোই নষ্ট হয়। আগে লক্ষণ দেখুন, কারণ বর্জন করুন ও আবহাওয়া যাচাই করুন — অনুসন্ধানের চূড়ান্ত ধাপে পান সঠিক সমাধান ও সঠিক ট্যাংক মিশ্রণ।",
    ttsText:
      "উদ্ভিদ গোয়েন্দার মূল লক্ষ্য হলো রোগ নির্ণয়ের ধারাবাহিক ধাপগুলো শেখানো। সরাসরি বিষ স্প্রে নয় — লক্ষণ পর্যবেক্ষণ, কারণ বর্জন ও ক্ষতির মাত্রা যাচাইয়ের পরেই আসে সঠিক সমাধান।",
    processFocus: "কৃষকের অনুসন্ধান ধাপ: লক্ষণ দেখুন ➔ কারণ বাদ দিন ➔ ক্ষয়ক্ষতি যাচাই ➔ তবেই সঠিক ওষুধ",
    primaryAction: {
      label: "ধাপে ধাপে রোগ নির্ণয় শুরু করুন",
      icon: ScanSearch,
      tab: "diagnose",
      highlight: "পদক্ষেপ গাইড",
    },
    secondaryAction: {
      label: "CABI ৫-ধাপ প্রোটোকল শিখুন",
      icon: BookOpen,
      tab: "learn",
    },
    tertiaryAction: {
      label: "আজকের আবহাওয়া ও স্প্রে সিদ্ধান্ত",
      icon: Activity,
      tab: "today",
    },
    hooks: [
      { text: "ধাপ ১-২: পাতার উপর-নিচে পর্যবেক্ষণ ও কারণ বর্জন", icon: "🔍" },
      { text: "ধাপ ৩-৪: স্প্রে আবহাওয়া ও অর্থনৈতিক ক্ষতির সীমা (ETL)", icon: "⚖️" },
      { text: "ধাপ ৫: চূড়ান্ত সমাধান ও ১৬L ন্যাপস্যাক সঠিক হিসাব", icon: "🎯" },
    ],
    stats: [
      { label: "দিকনির্দেশনা", val: "৫-ধাপ ধারাবাহিক অনুসন্ধান" },
      { label: "সিদ্ধান্ত ভিত্তি", val: "লক্ষণ বর্জন + লাইভ আবহাওয়া" },
      { label: "চূড়ান্ত ফলাফল", val: "সঠিক দমন ও অপচয় রোধ" },
    ],
  },
  {
    id: "extension",
    roleBn: "কৃষি সম্প্রসারণ কর্মী ও SAAO",
    roleEn: "Extension Service Provider",
    shortLabel: "সম্প্রসারণ কর্মী",
    taglineBn: "কৃষককে বৈজ্ঞানিক অনুসন্ধানের ধাপ শেখান — অনুমানের প্রেসক্রিপশন নয়",
    badgeBn: "🧑‍💼 এক্সটেনশন অফিসার ও SAAO",
    badgeColor: "#2563eb",
    icon: UserCheck,
    headlineBn: "কৃষককে ৫-ধাপ বৈজ্ঞানিক প্রোটোকল শেখান — অনুমানের প্রেসক্রিপশন নয়",
    subtitleBn:
      "উপ-সহকারী কৃষি কর্মকর্তাদের দায়িত্ব কৃষককে সরাসরি ওষুধ বাতলে দেওয়া নয়, বরং সঠিক অনুসন্ধানী প্রক্রিয়ায় নেতৃত্ব দেওয়া। রোগ ত্রিভুজ, মাঠ স্যাম্পলিং ও MoA ঘূর্ণন মেনে দিন টেকসই পরামর্শ।",
    ttsText:
      "কৃষি সম্প্রসারণ কর্মীদের কাজ কৃষকদের অনুসন্ধানী ধাপগুলো শেখানো। ৫-ধাপ পর্যবেক্ষণ, রোগ ত্রিভুজ ও ক্ষয়ক্ষতি যাচাইয়ের মাধ্যমে টেকসই আইপিএম সমাধান নিশ্চিত করুন।",
    processFocus: "কর্মকর্তার পর্যবেক্ষণ: হোস্ট ও লক্ষণ ➔ রোগ ত্রিভুজ ➔ স্যাম্পলিং ➔ সমন্বিত সমাধান",
    primaryAction: {
      label: "CABI ৫-ধাপ প্রোটোকল গাইড",
      icon: BookOpen,
      tab: "learn",
      highlight: "স্ট্যান্ডার্ড পদ্ধতি",
    },
    secondaryAction: {
      label: "IRAC / FRAC MoA ঘূর্ণন ক্যালেন্ডার",
      icon: RotateCw,
      tab: "calendar",
    },
    tertiaryAction: {
      label: "DAE নিবন্ধিত বালাইনাশক ও ডোজ",
      icon: FlaskConical,
      tab: "library",
    },
    hooks: [
      { text: "প্রমিত ৫-ধাপ CABI রোগ নির্ণয় ফ্রেমওয়ার্ক", icon: "🏛️" },
      { text: "কৃষকের মাঠের ইতিহাস ও আবহাওয়া অনুসন্ধান", icon: "📋" },
      { text: "চূড়ান্ত সমাধান: প্রতিরোধ দমন ও সঠিক MoA ঘূর্ণন", icon: "🎯" },
    ],
    stats: [
      { label: "পদ্ধতিগত মান", val: "CABI Plantwise 5-Step" },
      { label: "প্রতিরোধ ব্যবস্থাপনা", val: "IRAC/FRAC কোড সিস্টেম" },
      { label: "ট্রেনিং টুল", val: "গেম ও ইন্টারেক্টিভ কুইজ" },
    ],
  },
  {
    id: "seller",
    roleBn: "বালাইনাশক ও সার ডিলার",
    roleEn: "Input Seller / Dealer",
    shortLabel: "ইনপুট বিক্রেতা",
    taglineBn: "কাউন্টারে শুধু বোতল নয় — লক্ষণ বুঝে সঠিক উপাদানে কৃষককে পরিচালিত করুন",
    badgeBn: "🏪 বালাইনাশক ও সার ডিলার",
    badgeColor: "#d97706",
    icon: Store,
    headlineBn: "কাউন্টারে শুধু বোতল বিক্রি নয় — রোগের ধাপ বুঝে সঠিক পথ দেখান",
    subtitleBn:
      "রোগের লক্ষণ ও কারণ না জেনে যে ওষুধই বিক্রি করুন, কৃষক ফল পাবে না। কৃষককে সঠিক অনুসন্ধানী প্রশ্ন করুন: কোন ফসলে? কোথায় দাগ? কতটুকু আক্রমণ? তারপর দিন সঠিক সক্রিয় উপাদান ও ট্যাংকের পরিমাপ।",
    ttsText:
      "বালাইনাশক বিক্রেতা হিসেবে কৃষকের সমস্যার লক্ষণ ও ইতিহাস জেনে সঠিক পরামর্শ দিন। সঠিক অনুসন্ধানের মাধ্যমেই নিরাপদ ও কার্যকর ওষুধ নির্বাচন সম্ভব।",
    processFocus: "ডিলারের দায়িত্ব: লক্ষণ জিজ্ঞাসাবাদ ➔ ভুল নির্ণয় বর্জন ➔ সঠিক সক্রিয় উপাদান নির্বাচন",
    primaryAction: {
      label: "সক্রিয় উপাদান ও ব্র্যান্ড অনুসন্ধান",
      icon: FlaskConical,
      tab: "library",
      highlight: "DAE ডাটাবেস",
    },
    secondaryAction: {
      label: "১৬L/২০L ট্যাংক ক্যালকুলেটর",
      icon: Calculator,
      tab: "diagnose",
    },
    tertiaryAction: {
      label: "নিরাপত্তা লেবেল ও PHI সময়সীমা",
      icon: ShieldCheck,
      tab: "library",
    },
    hooks: [
      { text: "লক্ষণ নিশ্চিত করে সঠিক সক্রিয় উপাদান নির্বাচন", icon: "🧪" },
      { text: "অননুমোদিত ককটেল মিশ্রণ ও অতিরিক্ত স্প্রে রোধ", icon: "🚫" },
      { text: "চূড়ান্ত ফলাফল: ট্যাংকের সঠিক পরিমাপ ও নিরাপত্তা", icon: "🎯" },
    ],
    stats: [
      { label: "উপাদান ডাটাবেস", val: "DAE রেজিস্টার্ড সক্রিয় গ্রুপ" },
      { label: "ট্যাংক ক্যালিব্রেশন", val: "১০L/১৬L/২০L সুনির্দিষ্ট" },
      { label: "পদ্ধতিগত ভূমিকা", val: "সঠিক অনুসন্ধান সহায়তা" },
    ],
  },
];

export function HeroStakeholderSection({
  setActiveTab,
  C,
  tts = {},
}) {
  const [activeRole, setActiveRole] = useState(() => {
    try {
      return localStorage.getItem("cabi_stakeholder_role") || "farmer";
    } catch {
      return "farmer";
    }
  });

  const [selectedProcessStep, setSelectedProcessStep] = useState(0);

  const currentStakeholder =
    STAKEHOLDERS.find((s) => s.id === activeRole) || STAKEHOLDERS[0];

  const currentStepData = CABI_5_STEPS[selectedProcessStep] || CABI_5_STEPS[0];

  const handleSelectRole = (roleId) => {
    setActiveRole(roleId);
    try {
      localStorage.setItem("cabi_stakeholder_role", roleId);
    } catch {}
  };

  const handlePlayTTS = () => {
    if (!tts.speak) return;
    if (tts.speaking) {
      tts.stop();
    } else {
      tts.speak(currentStakeholder.ttsText, { prependFriendly: true });
    }
  };

  return (
    <section
      id="stakeholder-hero"
      aria-label="CABI Plant Detective Stakeholder Portal"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
      }}
    >
      {/* ── Top Core Philosophy Banner (Process & Steps First) ─────── */}
      <div
        id="process-philosophy-banner"
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderLeft: `4px solid ${C.warning}`,
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          boxShadow: C.shadow,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: C.bgWarning,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Info size={16} color={C.warning} />
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.4, color: C.text }}>
            <strong style={{ color: C.primaryDark }}>মূল নীতি: </strong>
            সরাসরি ওষুধ বা বিষ নয় — আমরা আপনাকে ৫-ধাপ অনুসন্ধান প্রক্রিয়ায় পথ দেখাই।{" "}
            <span style={{ fontWeight: 700, color: C.primary }}>
              সঠিক সমাধান হলো এই ধারাবাহিক তদন্তের চূড়ান্ত পরিণতি।
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("learn")}
          style={{
            background: C.bgMuted,
            border: `1px solid ${C.border}`,
            padding: "5px 10px",
            borderRadius: 8,
            fontSize: 11.5,
            fontWeight: 700,
            color: C.primary,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
          }}
        >
          <span>৫-ধাপ ফ্রেমওয়ার্ক দেখুন</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* ── Top Role Selector Segment Bar ──────────────────────────── */}
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: 6,
          boxShadow: C.shadow,
          display: "flex",
          gap: 6,
          alignItems: "center",
          position: "relative",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            padding: "0 10px 0 12px",
            fontSize: 11.5,
            fontWeight: 800,
            color: C.textLight,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Sparkles size={14} color={C.warning} />
          <span>আপনার ভূমিকা:</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flex: 1,
            minWidth: 320,
          }}
        >
          {STAKEHOLDERS.map((st) => {
            const isSelected = st.id === activeRole;
            const IconComponent = st.icon;
            return (
              <button
                key={st.id}
                id={`stakeholder-tab-${st.id}`}
                onClick={() => handleSelectRole(st.id)}
                aria-selected={isSelected}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: isSelected
                    ? `1.5px solid ${C.primary}`
                    : `1px solid transparent`,
                  background: isSelected
                    ? `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`
                    : C.bgMuted,
                  color: isSelected ? "#ffffff" : C.text,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isSelected ? 800 : 600,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isSelected
                    ? "0 4px 14px rgba(0,106,78,0.22)"
                    : "none",
                  whiteSpace: "nowrap",
                }}
              >
                <IconComponent
                  size={17}
                  color={isSelected ? "#ffffff" : C.primary}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
                <span>{st.shortLabel}</span>
                {isSelected && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f42a41",
                      display: "inline-block",
                      boxShadow: "0 0 6px #f42a41",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Hero Card ─────────────────────────────────────────── */}
      <div
        style={{
          background: C.heroGradient,
          borderRadius: 24,
          padding: "26px 22px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 36px rgba(0,106,78,0.28)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Subtle Decorative Leaves */}
        <span
          className="hero-leaf"
          style={{ right: -12, top: -18, fontSize: 110, pointerEvents: "none" }}
        >
          🍃
        </span>
        <span
          className="hero-leaf"
          style={{
            left: -18,
            bottom: -24,
            fontSize: 92,
            animationDelay: "2s",
            pointerEvents: "none",
          }}
        >
          🌿
        </span>

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Top Badges & TTS voice trigger */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.28)",
                fontSize: 12,
                fontWeight: 700,
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f42a41",
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(244,42,65,0.9)",
                }}
              />
              <span>{currentStakeholder.badgeBn}</span>
              <span
                style={{
                  opacity: 0.8,
                  fontSize: 10.5,
                  borderLeft: "1px solid rgba(255,255,255,0.3)",
                  paddingLeft: 6,
                }}
              >
                CABI ৫-ধাপ নির্দেশিকা
              </span>
            </div>

            {tts.isSupported && (
              <button
                onClick={handlePlayTTS}
                aria-label={
                  tts.speaking ? "ভয়েস বন্ধ করুন" : "ভূমিকা শুনুন"
                }
                title="ভয়েস বিবরণ শুনুন"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 13px",
                  borderRadius: 999,
                  background: tts.speaking
                    ? "#f42a41"
                    : "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease",
                }}
              >
                {tts.speaking ? (
                  <>
                    <VolumeX size={15} />
                    <span>বন্ধ করুন</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={15} />
                    <span>শুনুন</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Dynamic Headline & Value Proposition */}
          <h1
            className="ud-headline"
            style={{
              fontWeight: 800,
              fontSize: "clamp(21px, 3.6vw, 29px)",
              lineHeight: 1.25,
              marginBottom: 10,
              letterSpacing: -0.5,
              textShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            {currentStakeholder.headlineBn}
          </h1>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              opacity: 0.95,
              marginBottom: 18,
              maxWidth: 620,
              color: "#e6f6ee",
            }}
          >
            {currentStakeholder.subtitleBn}
          </p>

          {/* Quick Value Hooks Pill List */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 22,
            }}
          >
            {currentStakeholder.hooks.map((h, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(0, 40, 27, 0.38)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  padding: "5px 11px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#ffffff",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span>{h.icon}</span>
                <span>{h.text}</span>
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Primary Action Button */}
            <button
              id={`hero-cta-primary-${currentStakeholder.id}`}
              onClick={() => setActiveTab(currentStakeholder.primaryAction.tab)}
              className="ud-headline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "#ffffff",
                color: C.primaryDark,
                border: "2px solid #f42a41",
                borderRadius: 14,
                padding: "13px 22px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
                fontSize: 14.5,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 26px rgba(0,0,0,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0,0,0,0.22)";
              }}
            >
              <currentStakeholder.primaryAction.icon
                size={19}
                color={C.primaryDark}
                strokeWidth={2.4}
              />
              <span>{currentStakeholder.primaryAction.label}</span>
              {currentStakeholder.primaryAction.highlight && (
                <span
                  style={{
                    background: "#f42a41",
                    color: "#ffffff",
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 999,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                  }}
                >
                  {currentStakeholder.primaryAction.highlight}
                </span>
              )}
            </button>

            {/* Secondary Action */}
            <button
              id={`hero-cta-secondary-${currentStakeholder.id}`}
              onClick={() =>
                setActiveTab(currentStakeholder.secondaryAction.tab)
              }
              className="ud-headline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(255,255,255,0.14)",
                color: "#ffffff",
                border: "1.5px solid rgba(255,255,255,0.32)",
                borderRadius: 14,
                padding: "13px 18px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13.5,
                backdropFilter: "blur(6px)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.14)";
              }}
            >
              <currentStakeholder.secondaryAction.icon
                size={16}
                color="#ffffff"
              />
              <span>{currentStakeholder.secondaryAction.label}</span>
            </button>

            {/* Tertiary Action */}
            <button
              id={`hero-cta-tertiary-${currentStakeholder.id}`}
              onClick={() => setActiveTab(currentStakeholder.tertiaryAction.tab)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                color: "#d1fae5",
                border: "none",
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 12.5,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              <span>{currentStakeholder.tertiaryAction.label}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive 5-Step Process Pipeline Guide ──────────────── */}
      <div
        id="process-pipeline-section"
        style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          padding: "18px 18px",
          boxShadow: C.shadow,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                fontWeight: 800,
                color: C.primaryDark,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 2,
              }}
            >
              <span>🔬 বৈজ্ঞানিক রোগ নির্ণয় রোডম্যাপ</span>
              <span
                style={{
                  background: C.bgSuccess,
                  color: C.primary,
                  padding: "1px 6px",
                  borderRadius: 6,
                  fontSize: 10,
                }}
              >
                CABI Plantwise
              </span>
            </div>
            <h2
              className="ud-headline"
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.3,
              }}
            >
              অনুসন্ধানের ৫-ধাপ নির্দেশিকা — সমাধান যার চূড়ান্ত পরিণতি
            </h2>
          </div>

          <div
            style={{
              fontSize: 12,
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>ধাপে ক্লিক করে পদ্ধতি দেখুন</span>
          </div>
        </div>

        {/* Horizontal Step Indicator Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 6,
            marginBottom: 14,
            overflowX: "auto",
          }}
        >
          {CABI_5_STEPS.map((s, idx) => {
            const isStepActive = idx === selectedProcessStep;
            const StepIcon = s.icon;
            return (
              <button
                key={s.num}
                id={`process-step-tab-${idx}`}
                onClick={() => setSelectedProcessStep(idx)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 6px",
                  borderRadius: 14,
                  border: isStepActive
                    ? `2px solid ${s.color}`
                    : `1px solid ${C.border}`,
                  background: isStepActive ? s.bg : C.bgMuted,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isStepActive ? s.color : C.bgCard,
                    color: isStepActive ? "#ffffff" : C.textMuted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 4,
                    boxShadow: isStepActive ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                  }}
                >
                  <StepIcon size={14} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isStepActive ? 800 : 600,
                    color: isStepActive ? s.color : C.text,
                    lineHeight: 1.2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  ধাপ {s.num}: {s.titleBn.split(" ")[0]}
                </span>

                {s.isOutcome && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -2,
                      background: "#f42a41",
                      color: "#fff",
                      fontSize: 8.5,
                      fontWeight: 800,
                      padding: "1px 5px",
                      borderRadius: 999,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    চূড়ান্ত
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Step Detailed Card */}
        <div
          style={{
            background: currentStepData.bg,
            border: `1.5px solid ${currentStepData.border}`,
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: currentStepData.color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                {currentStepData.num}
              </div>
              <div>
                <h3
                  className="ud-headline"
                  style={{
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: currentStepData.color,
                    lineHeight: 1.3,
                  }}
                >
                  ধাপ {currentStepData.num}: {currentStepData.titleBn}
                </h3>
                <div style={{ fontSize: 11, color: C.textMuted }}>
                  {currentStepData.titleEn}
                </div>
              </div>
            </div>

            {currentStepData.isOutcome ? (
              <span
                style={{
                  fontSize: 11,
                  background: "#16a34a",
                  color: "#ffffff",
                  fontWeight: 800,
                  padding: "3px 9px",
                  borderRadius: 999,
                }}
              >
                🎯 চূড়ান্ত পরিণতি (The Ultimate Outcome)
              </span>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  background: "rgba(0,0,0,0.06)",
                  color: C.text,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 8,
                }}
              >
                তদন্তের ধারাবাহিক ধাপ
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.text,
              background: "rgba(255,255,255,0.6)",
              padding: "8px 12px",
              borderRadius: 10,
              border: `1px solid rgba(0,0,0,0.05)`,
            }}
          >
            {currentStepData.questionBn}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
              }}
            >
              এই ধাপে যা পর্যবেক্ষণ করবেন:
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 6,
              }}
            >
              {currentStepData.tips.map((tip, tIdx) => (
                <div
                  key={tIdx}
                  style={{
                    fontSize: 11.5,
                    color: C.text,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: currentStepData.color, fontWeight: 800 }}>
                    •
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
              paddingTop: 8,
              borderTop: `1px solid ${currentStepData.border}`,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11.5, color: C.textMuted }}>
              পূর্ববর্তী ধাপগুলো বাদ দিয়ে সরাসরি ওষুধ প্রয়োগ করবেন না।
            </div>
            <button
              onClick={() => setActiveTab(currentStepData.actionTab)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 10,
                background: currentStepData.color,
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
              }}
            >
              <span>{currentStepData.actionLabel}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3-Way Stakeholder Power Hook Trio ──────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {STAKEHOLDERS.map((st) => {
          const isCurrent = st.id === activeRole;
          const IconComp = st.icon;
          return (
            <div
              key={st.id}
              id={`stakeholder-card-${st.id}`}
              style={{
                background: C.bgCard,
                border: isCurrent
                  ? `2px solid ${C.primary}`
                  : `1px solid ${C.border}`,
                borderRadius: 18,
                padding: "16px 14px",
                boxShadow: isCurrent ? C.shadowMd : C.shadow,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              <div>
                {/* Header: Icon + Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: isCurrent ? C.bgSuccess : C.bgMuted,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1.5px solid ${isCurrent ? C.primary + "33" : C.border}`,
                    }}
                  >
                    <IconComp
                      size={22}
                      color={isCurrent ? C.primary : C.textMuted}
                    />
                  </div>

                  {isCurrent ? (
                    <span
                      style={{
                        fontSize: 11,
                        background: C.bgSuccess,
                        color: C.primary,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 999,
                        border: `1px solid ${C.borderSuccess}`,
                      }}
                    >
                      ✓ সক্রিয় ভূমিকা
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectRole(st.id)}
                      style={{
                        fontSize: 11,
                        background: C.bgMuted,
                        color: C.textLight,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        cursor: "pointer",
                      }}
                    >
                      সুইচ করুন
                    </button>
                  )}
                </div>

                {/* Title & Tagline */}
                <h3
                  className="ud-headline"
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: C.text,
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {st.roleBn}
                </h3>
                <div
                  style={{
                    fontSize: 11.5,
                    color: C.textMuted,
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                >
                  {st.taglineBn}
                </div>

                {/* Process focus callout */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.primaryDark,
                    background: C.bgSuccess,
                    border: `1px solid ${C.borderSuccess}`,
                    borderRadius: 8,
                    padding: "6px 8px",
                    marginBottom: 10,
                    lineHeight: 1.35,
                  }}
                >
                  {st.processFocus}
                </div>

                {/* Stats / Superpower Highlight */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: C.bgMuted,
                    fontSize: 11,
                    color: C.textMuted,
                  }}
                >
                  {st.stats.map((stat, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{stat.label}</span>
                      <strong style={{ color: C.text }}>{stat.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Jump Button */}
              <button
                id={`stakeholder-jump-${st.id}`}
                onClick={() => {
                  handleSelectRole(st.id);
                  setActiveTab(st.primaryAction.tab);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 12,
                  background: isCurrent ? C.primary : C.bgCard,
                  color: isCurrent ? "#ffffff" : C.primary,
                  border: `1.5px solid ${C.primary}`,
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{st.primaryAction.label}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
