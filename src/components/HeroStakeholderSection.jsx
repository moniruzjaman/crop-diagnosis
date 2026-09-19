import { useState } from "react";
import {
  Sprout,
  UserCheck,
  Store,
  ScanSearch,
  CloudSun,
  Calendar,
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
} from "lucide-react";

/**
 * Stakeholder data definition for Farmer, Extension Officer, and Input Seller
 */
const STAKEHOLDERS = [
  {
    id: "farmer",
    roleBn: "মাঠপর্যায়ের কৃষক",
    roleEn: "Farmer",
    shortLabel: "কৃষক",
    taglineBn: "মাঠের সঠিক ফসল ডাক্তার ও স্প্রে হিসাব",
    badgeBn: "🌾 কৃষকের মাঠ সহায়িকা",
    badgeColor: "#16a34a",
    icon: Sprout,
    headlineBn: "ফসলের রোগ ও পোকা চিনুন নিমেষে — ক্ষতি বাঁচান",
    subtitleBn:
      "পাতার ছবি তুলে দ্রুত রোগ শনাক্ত করুন, আজকের স্প্রে আবহাওয়া যাচাই করুন এবং ১৬L ট্যাংকে সঠিক ওষুধের পরিমাপে অপচয় রোধ করুন।",
    ttsText:
      "উদ্ভিদ গোয়েন্দায় স্বাগতম! কৃষকদের জন্য রয়েছে দ্রুত এআই রোগ নির্ণয়, আজকের স্প্রে আবহাওয়া ও ন্যাপস্যাক ট্যাংকের সঠিক ওষুধের হিসাব।",
    primaryAction: {
      label: "AI রোগ নির্ণয় শুরু করুন",
      icon: ScanSearch,
      tab: "diagnose",
      highlight: "AI ক্যামেরা",
    },
    secondaryAction: {
      label: "আজকের স্প্রে সিদ্ধান্ত",
      icon: CloudSun,
      tab: "today",
    },
    tertiaryAction: {
      label: "ফসল ক্যালেন্ডার ও দর",
      icon: Calendar,
      tab: "calendar",
    },
    hooks: [
      { text: "অন-ডিভাইস অফলাইন ViT AI মডেল", icon: "⚡" },
      { text: "১৬L ও ২০L স্প্রেয়ার ট্যাংক মিশ্রণ", icon: "💧" },
      { text: "ফসল তোলার নিরাপদ বিরতি (PHI)", icon: "🛡️" },
    ],
    stats: [
      { label: "সনাক্তকরণ নির্ভুলতা", val: "CABI স্ট্যান্ডার্ড" },
      { label: "স্প্রে সিদ্ধান্ত", val: "লাইভ আবহাওয়া" },
      { label: "অফলাইন সুবিধা", val: "১০০% কার্যকর" },
    ],
  },
  {
    id: "extension",
    roleBn: "কৃষি সম্প্রসারণ কর্মী ও SAAO",
    roleEn: "Extension Service Provider",
    shortLabel: "সম্প্রসারণ কর্মী",
    taglineBn: "CABI বৈজ্ঞানিক প্রোটোকল ও সঠিক প্রেসক্রিপশন",
    badgeBn: "🧑‍💼 এক্সটেনশন অফিসার ও SAAO",
    badgeColor: "#2563eb",
    icon: UserCheck,
    headlineBn: "মাঠপর্যায়ে দিন বৈজ্ঞানিক প্রেসক্রিপশন ও CABI প্রোটোকল",
    subtitleBn:
      "উপ-সহকারী কৃষি কর্মকর্তাদের জন্য প্রমিত ৫-ধাপ রোগ নির্ণয়, IRAC/FRAC ক্রিয়া-কৌশল ঘূর্ণন এবং DAE অনুমোদিত বৈধ বালাইনাশক ডাটাবেস।",
    ttsText:
      "কৃষি সম্প্রসারণ কর্মীদের জন্য CABI ৫-ধাপ প্রোটোকল, MoA প্রতিরোধ ব্যবস্থাপনা ও DAE অনুমোদিত বালাইনাশক ডাটাবেস।",
    primaryAction: {
      label: "CABI ৫-ধাপ প্রোটোকল গাইড",
      icon: BookOpen,
      tab: "learn",
      highlight: "মান প্রমিত",
    },
    secondaryAction: {
      label: "DAE অনুমোদিত বালাইনাশক",
      icon: FlaskConical,
      tab: "library",
    },
    tertiaryAction: {
      label: "MoA প্রতিরোধ ঘূর্ণন",
      icon: RotateCw,
      tab: "calendar",
    },
    hooks: [
      { text: "DAE নিবন্ধিত ফর্মুলেশন ও ডোজ", icon: "🏛️" },
      { text: "IRAC / FRAC MoA প্রতিরোধ রোধ", icon: "🔄" },
      { text: "কৃষকদের জন্য নির্ভরযোগ্য প্রেসক্রিপশন", icon: "📑" },
    ],
    stats: [
      { label: "প্রোটোকল ধাপ", val: "৫-ধাপ CABI" },
      { label: "প্রতিরোধ শ্রেণী", val: "IRAC/FRAC/HRAC" },
      { label: "ট্রেনিং মডিউল", val: "গেম ও অনুশীলন" },
    ],
  },
  {
    id: "seller",
    roleBn: "বালাইনাশক ও সার ডিলার",
    roleEn: "Input Seller / Dealer",
    shortLabel: "ইনপুট বিক্রেতা",
    taglineBn: "নিখুঁত ডোজ হিসাব ও ব্র্যান্ড ক্রস-রেফারেন্স",
    badgeBn: "🏪 বালাইনাশক ও সার ডিলার",
    badgeColor: "#d97706",
    icon: Store,
    headlineBn: "গ্রাহককে দিন নির্ভুল ডোজ ও সঠিক ব্র্যান্ডের বিকল্প",
    subtitleBn:
      "কোন বালাইয়ে কোন সক্রিয় উপাদান? শতক ও বিঘা জমিতে ১৬L/২০L ট্যাংকে কত মিলি/গ্রাম ওষুধ মেশাতে হবে? স্টক আউটে সঠিক বিকল্প দিন।",
    ttsText:
      "বালাইনাশক বিক্রেতাদের জন্য ব্র্যান্ড ক্রস-রেফারেন্স, সক্রিয় উপাদান অনুসন্ধান এবং ১৬ লিটার ট্যাংকের নির্ভুল ডোজ ক্যালকুলেটর।",
    primaryAction: {
      label: "ব্র্যান্ড ও সক্রিয় উপাদান খুঁজুন",
      icon: FlaskConical,
      tab: "library",
      highlight: "DAE অনুমোদিত",
    },
    secondaryAction: {
      label: "১৬L/২০L ট্যাংক ক্যালকুলেটর",
      icon: Calculator,
      tab: "diagnose",
    },
    tertiaryAction: {
      label: "নিরাপত্তা লেবেল ও PHI সময়",
      icon: ShieldCheck,
      tab: "library",
    },
    hooks: [
      { text: "৭০+ সক্রিয় উপাদান ও ব্র্যান্ড ডসিয়ার", icon: "🏷️" },
      { text: "শতক/বিঘা ও ট্যাংক প্রতি নির্ভুল মিলি", icon: "🎯" },
      { text: "টক্সিসিটি কালার কোড ও REI গাইডলাইন", icon: "⚠️" },
    ],
    stats: [
      { label: "অনুমোদিত ডাটাবেস", val: "DAE রেজিস্টার্ড" },
      { label: "ট্যাংক সাইজ ক্যালিব্রেশন", val: "১০L/১৬L/২০L" },
      { label: "বিকল্প উপাদান", val: "তাৎক্ষণিক সার্চ" },
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

  const currentStakeholder =
    STAKEHOLDERS.find((s) => s.id === activeRole) || STAKEHOLDERS[0];

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
                  opacity: 0.7,
                  fontSize: 10.5,
                  borderLeft: "1px solid rgba(255,255,255,0.3)",
                  paddingLeft: 6,
                }}
              >
                CABI Plantwise
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
              fontSize: "clamp(22px, 3.8vw, 30px)",
              lineHeight: 1.22,
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
              opacity: 0.94,
              marginBottom: 18,
              maxWidth: 580,
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
                      ✓ সক্রিয় ভিউ
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
                    marginBottom: 10,
                  }}
                >
                  {st.taglineBn}
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
