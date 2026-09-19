import React, { useState, useRef, useEffect, useCallback } from "react";

import { diagnoseOffline, enrichDiagnosisWithImages } from "./offline/index";
import VitSuggestions from "./offline/VitSuggestions";
import { lightThemeFull, darkThemeFull, getPreferredTheme } from "./data/themes";
import { CROP_CALENDAR, getCurrentRiskAlerts } from "./data/cropCalendar";
import {
  CROP_DISEASES,
  matchDiseasesBySymptoms,
  resolveCropKey,
  estimateInoculumPressure,
  getVarietySusceptibility,
} from "./data/cropDiseases";
import CropCalendarDashboard from "./components/CropCalendarDashboard";
import WeatherDecisionSummary from "./components/WeatherDecisionSummary";
import TodayDecisionView from "./components/TodayDecisionView";
import { HeroStakeholderSection } from "./components/HeroStakeholderSection";
import OnboardingFlow from "./components/OnboardingFlow";
import OutbreakList from "./components/OutbreakList";
import VisualDiagnosisLibrary from "./components/VisualDiagnosisLibrary";
import { computeEnsembleScore } from "./data/agronomicEngine";
import { lookupMoA } from "./data/moaDatabase";
import { getRegisteredProducts } from "./data/pesticideRegistry";
import { PESTICIDES_DATABASE as AGRICHEM_DATABASE } from "./agrichem/data/pesticidesData";
import "./styles/accessibility.css";

const SymptomSpotter = React.lazy(() => import("./games/SymptomSpotter"));
const CauseDetective = React.lazy(() => import("./games/CauseDetective"));
const DiseaseTriangle = React.lazy(() => import("./games/DiseaseTriangle"));
const FieldScout = React.lazy(() => import("./games/FieldScout"));
const IPMCommander = React.lazy(() => import("./games/IPMCommander"));
import useTTS from "./games/useTTS";
import { initPerformanceMonitoring } from "./utils/performanceTelemetry";

// ─── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_STYLE = `
  /* Fonts loaded via <link> in index.html for faster rendering */
  :root {
    --c-primary: #006a4e;
    --c-primary-light: #0b8457;
    --c-primary-dark: #00503a;
    --c-primary-x-dark: #00281b;
    --c-accent: #f42a41;
    --c-accent-light: #ff4d61;
    --c-accent-dark: #d6182e;
    --c-bd-green: #006a4e;
    --c-bd-red: #f42a41;
    --c-bg: #f4f6f8;
    --c-bg-card: #ffffff;
    --c-bg-muted: #f0f2f5;
    --c-bg-header: #ffffff;
    --c-bg-nav: #f0f2f5;
    --c-text: #1a1d21;
    --c-text-muted: #5f6672;
    --c-text-light: #8e95a2;
    --c-border: #e2e5ea;
    --c-border-focus: #006a4e;
    --c-success: #006a4e;
    --c-warning: #d97706;
    --c-danger: #f42a41;
    --c-blue: #2563eb;
    --c-shadow: 0 2px 8px rgba(0,0,0,0.06);
    --c-shadow-md: 0 4px 16px rgba(0,106,78,0.09);
    --c-shadow-lg: 0 8px 32px rgba(0,106,78,0.15);
    --c-scrollbar: #c1c7cf;
    --c-font-sans: 'Inter', 'Noto Sans Bengali', sans-serif;
    --c-font-headline: 'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif;
    --c-radius-sm: 10px;
    --c-radius-md: 14px;
    --c-radius-lg: 18px;
    --c-radius-xl: 24px;
    --c-transition: all 0.2s ease;
    --c-glow-color: rgba(0,106,78,0.25);
    --c-glow-color-strong: rgba(244,42,65,0.4);
    --c-nav-height: 60px;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:var(--c-font-sans);background:var(--c-bg);color:var(--c-text);overflow-x:hidden;-webkit-tap-highlight-color:transparent;padding-bottom:calc(var(--c-nav-height) + 8px)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes popIn{0%{transform:scale(.85);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
  @keyframes glow{0%,100%{box-shadow:0 0 8px var(--c-glow-color)}50%{box-shadow:0 0 20px var(--c-glow-color-strong)}}
  @keyframes scan{0%{transform:translateY(-120px)}100%{transform:translateY(260px)}}
  @keyframes leafFloat{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-4px) rotate(2deg)}75%{transform:translateY(2px) rotate(-1deg)}}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-thumb{background:var(--c-scrollbar);border-radius:4px}
  input,select,textarea,button{font-family:inherit}
  button:active{transform:scale(0.97)}
  .ud-headline{font-family:var(--c-font-headline)}
  .ud-editorial-shadow{box-shadow:var(--c-shadow-md)}
  .bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:200;background:var(--c-bg-header);border-top:1px solid var(--c-border);display:flex;justify-content:space-around;align-items:center;height:var(--c-nav-height);padding:0 4px;box-shadow:0 -2px 12px rgba(0,0,0,0.06)}
  .bottom-nav-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex:1;padding:6px 4px;border:none;background:none;cursor:pointer;border-radius:12px;transition:all .2s;color:var(--c-text-light);font-size:10px;font-weight:500;position:relative}
  .bottom-nav-item.active{color:var(--c-primary);font-weight:700}
  .bottom-nav-item .nav-icon{font-size:22px;transition:transform .2s}
  .bottom-nav-item.active .nav-icon{transform:scale(1.1)}
  .bottom-nav-item.active::before{content:'';position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:32px;height:3.5px;background:var(--c-accent);border-radius:0 0 4px 4px;box-shadow:0 1px 6px rgba(244,42,65,0.45)}
  .hero-leaf{position:absolute;font-size:80px;opacity:.07;animation:leafFloat 6s ease-in-out infinite}
`;
/* Reduced header/footer heights for better game visibility */
const _REDUCED_HEADER_HEIGHT = `60px`;
const _REDUCED_FOOTER_HEIGHT = `35px`;
if (typeof document !== "undefined" && !document.getElementById("ud-gs")) {
  const s = document.createElement("style");
  s.id = "ud-gs";
  s.textContent = GLOBAL_STYLE;
  document.head.appendChild(s);
}

// ─── Design tokens ────────────────────────────────────────────────────────────
// NOTE: C is now dynamic — set inside the main component based on darkMode state.
// Static references to C outside the component (like SECTION_META) use the light theme defaults.
const C_LIGHT = {
  primary: "#006a4e",
  primaryLight: "#0b8457",
  primaryDark: "#00503a",
  primaryXDark: "#00281b",
  accent: "#f42a41",
  accentLight: "#ff4d61",
  accentDark: "#d6182e",
  bdGreen: "#006a4e",
  bdRed: "#f42a41",
  bg: "#f4f6f8",
  bgCard: "#ffffff",
  bgMuted: "#f0f2f5",
  bgHeader: "#ffffff",
  bgNav: "#f0f2f5",
  text: "#1a1d21",
  textMuted: "#5f6672",
  textLight: "#8e95a2",
  border: "#e2e5ea",
  borderFocus: "#006a4e",
  success: "#006a4e",
  warning: "#d97706",
  danger: "#f42a41",
  blue: "#2563eb",
  shadow: "0 2px 8px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 16px rgba(0,106,78,0.09)",
  shadowLg: "0 8px 32px rgba(0,106,78,0.15)",
  heroGradient: "linear-gradient(135deg, #006a4e 0%, #00503a 50%, #087f5b 100%)",
  heroGradientBd: "linear-gradient(135deg, #006a4e 0%, #00503a 65%, #c81e35 100%)",
  game1: "#7c3aed",
  game2: "#0891b2",
  game3: "#ea580c",
  // Tinted backgrounds — dark-mode compatible
  bgDanger: "#fef2f2",
  bgSuccess: "#f0fdf4",
  bgWarning: "#fffbeb",
  bgInfo: "#eff6ff",
  bgBlue: "#f0f9ff",
  bgPurple: "#faf5ff",
  bgTeal: "#ecfeff",
  bgOrange: "#fff7ed",
  borderDanger: "#fecaca",
  borderSuccess: "#bbf7d0",
  borderWarning: "#fcd34d",
  borderInfo: "#bfdbfe",
  borderBlue: "#bae6fd",
  borderPurple: "#e9d5ff",
  borderTeal: "#a5f3fc",
  borderOrange: "#fed7aa",
  badgeSuccess: "#dcfce7",
  badgeWarning: "#fef3c7",
  textSuccess: "#14532d",
  textDanger: "#991b1b",
  textWarning: "#92400e",
  textInfo: "#1e40af",
  textBlue: "#0369a1",
  textPurple: "#6b21a8",
  textTeal: "#155e75",
  textOrange: "#9a3412",
};
// Dynamic theme bridge — main component updates C on every render
// so renderTokens, SectionCard, InfoRow etc. automatically get the correct theme.
let C = C_LIGHT;
function setThemeTokens(c) {
  C = c;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const QUICK_CROPS = [
  { id: "rice", label: "ধান", en: "Rice", emoji: "🌾", color: "#f59e0b" },
  { id: "potato", label: "আলু", en: "Potato", emoji: "🥔", color: "#92400e" },
  { id: "tomato", label: "টমেটো", en: "Tomato", emoji: "🍅", color: "#dc2626" },
  { id: "brinjal", label: "বেগুন", en: "Brinjal", emoji: "🍆", color: "#7c3aed" },
  { id: "mustard", label: "সরিষা", en: "Mustard", emoji: "🌼", color: "#d97706" },
  { id: "jute", label: "পাট", en: "Jute", emoji: "🌿", color: "#16a34a" },
  { id: "mango", label: "আম", en: "Mango", emoji: "🥭", color: "#ea580c" },
  { id: "banana", label: "কলা", en: "Banana", emoji: "🍌", color: "#ca8a04" },
];
const CROPS = {
  "ধান / Rice": ["ধান (বোরো) / Rice - Boro", "ধান (আমন) / Rice - Aman", "ধান (আউশ) / Rice - Aus"],
  "গম ও শস্য / Cereals": ["গম / Wheat", "ভুট্টা / Maize", "যব / Barley"],
  "ডাল / Pulses": [
    "মসুর / Lentil",
    "মুগ / Mungbean",
    "মাষকলাই / Blackgram",
    "সয়াবিন / Soybean",
    "শিম / Lablab Bean",
    "বরবটি / Yard-Long Bean",
  ],
  "তেলবীজ / Oilseeds": ["সরিষা / Mustard", "তিল / Sesame", "চিনাবাদাম / Groundnut", "সূর্যমুখী / Sunflower"],
  "সবজি / Vegetables": [
    "আলু / Potato",
    "টমেটো / Tomato",
    "বেগুন / Brinjal",
    "মরিচ / Chilli",
    "শিমলা মরিচ / Capsicum",
    "লাউ / Bottle Gourd",
    "কুমড়া / Pumpkin",
    "তিত করলা / Bitter Gourd",
    "ঢেঁড়স / Okra",
    "পালং শাক / Spinach",
    "মুলা / Radish",
    "গাজর / Carrot",
    "বাঁধাকপি / Cabbage",
    "ফুলকপি / Cauliflower",
    "পেঁয়াজ / Onion",
    "রসুন / Garlic",
    "আদা / Ginger",
    "হলুদ / Turmeric",
  ],
  "ফল / Fruits": [
    "আম / Mango",
    "কাঁঠাল / Jackfruit",
    "কলা / Banana",
    "পেঁপে / Papaya",
    "আনারস / Pineapple",
    "পেয়ারা / Guava",
    "লিচু / Lychee",
    "নারিকেল / Coconut",
    "লেবু / Lemon",
    "কমলা / Orange",
    "ড্রাগন ফ্রুট / Dragon Fruit",
  ],
  "আঁশ / Fiber": ["পাট / Jute", "তুলা / Cotton"],
  "মসলা / Spice": ["আখ / Sugarcane", "ধনিয়া / Coriander", "কালোজিরা / Nigella", "পান / Betel Leaf"],
};
const DISTRICTS = [
  "ঢাকা / Dhaka",
  "চট্টগ্রাম / Chattogram",
  "রাজশাহী / Rajshahi",
  "খুলনা / Khulna",
  "বরিশাল / Barisal",
  "সিলেট / Sylhet",
  "রংপুর / Rangpur",
  "ময়মনসিংহ / Mymensingh",
  "কুমিল্লা / Cumilla",
  "গাজীপুর / Gazipur",
  "নারায়ণগঞ্জ / Narayanganj",
  "টাঙ্গাইল / Tangail",
  "কিশোরগঞ্জ / Kishoreganj",
  "নেত্রকোণা / Netrokona",
  "জামালপুর / Jamalpur",
  "মৌলভীবাজার / Moulvibazar",
  "হবিগঞ্জ / Habiganj",
  "সুনামগঞ্জ / Sunamganj",
  "চাঁপাইনবাবগঞ্জ / Chapainawabganj",
  "নাটোর / Natore",
  "নওগাঁ / Naogaon",
  "বগুড়া / Bogura",
  "পাবনা / Pabna",
  "সিরাজগঞ্জ / Sirajganj",
  "দিনাজপুর / Dinajpur",
  "কুড়িগ্রাম / Kurigram",
  "গাইবান্ধা / Gaibandha",
  "নীলফামারী / Nilphamari",
  "পঞ্চগড় / Panchagarh",
  "বাগেরহাট / Bagerhat",
  "সাতক্ষীরা / Satkhira",
  "যশোর / Jashore",
  "ঝিনাইদহ / Jhenaidah",
  "কুষ্টিয়া / Kushtia",
  "পটুয়াখালী / Patuakhali",
  "বরগুনা / Barguna",
  "ভোলা / Bhola",
  "কক্সবাজার / Cox's Bazar",
  "ফেনী / Feni",
  "নোয়াখালী / Noakhali",
  "ব্রাহ্মণবাড়িয়া / Brahmanbaria",
  "বান্দরবান / Bandarban",
  "রাঙামাটি / Rangamati",
  "খাগড়াছড়ি / Khagrachhari",
];
const SEASONS = [
  "বোরো মৌসুম / Boro Season (Nov–May)",
  "আমন মৌসুম / Aman Season (Jun–Nov)",
  "আউশ মৌসুম / Aus Season (Mar–Aug)",
  "রবি মৌসুম / Rabi Season (Oct–Mar)",
  "খরিপ মৌসুম / Kharif Season (Apr–Sep)",
  "সারা বছর / Year-round",
];
const GROWTH_STAGES = [
  "বীজ অঙ্কুরোদগম / Germination",
  "চারা / Seedling",
  "কুশি / Tillering",
  "শাখা-প্রশাখা / Vegetative",
  "ফুল ফোটা / Flowering",
  "ফল ধারণ / Fruit Set",
  "পরিপক্বতা / Maturity",
  "ফসল কাটা / Harvesting",
];
const SYMPTOM_CHIPS = {
  "🍃 পাতা": [
    { label: "পাতা হলুদ", value: "পাতা হলুদ হয়ে যাচ্ছে" },
    { label: "বাদামি দাগ", value: "পাতায় বাদামি গোলাকার দাগ" },
    { label: "ধূসর দাগ (ব্লাস্ট)", value: "পাতায় ধূসর মাকু আকৃতির দাগ (ব্লাস্ট)" },
    { label: "পাতা পোড়া", value: "পাতার কিনারা পুড়ে যাওয়ার মতো বাদামি" },
    { label: "পাতা কুঁকড়ানো", value: "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে" },
    { label: "পাতা মোড়ানো", value: "পাতা লম্বালম্বিভাবে মোড়ানো (পাতামোড়া পোকা)" },
    { label: "পাতায় জাল", value: "পাতার নিচে সূক্ষ্ম জাল (মাইট)" },
  ],
  "🌿 কান্ড": [
    { label: "কান্ড পচা", value: "কান্ডের গোড়া পচে কালো বা বাদামি" },
    { label: "কান্ড ফাঁপা", value: "কান্ড টানলে সহজে উঠে আসে, ভেতর ফাঁকা" },
    { label: "শিকড় পচা", value: "শিকড় কালো ও পচা" },
  ],
  "🌸 ফল": [
    { label: "ফুল ঝরা", value: "ফুল অকালে ঝরে পড়ছে" },
    { label: "ফল পচা", value: "ফল পচে যাচ্ছে, কালো বা বাদামি দাগ" },
    { label: "শীষ চিটা", value: "ধানের শীষ চিটা, দানা পূর্ণ হচ্ছে না" },
    { label: "শীষ সাদা", value: "ধানের শীষ সম্পূর্ণ সাদা হয়ে গেছে" },
  ],
  "🐛 পোকা": [
    { label: "পোকা দেখা", value: "গাছে পোকা দেখা যাচ্ছে" },
    { label: "পাতায় ছিদ্র", value: "পাতায় ছিদ্র বা চিবানোর দাগ" },
    { label: "পিঁপড়া/মধুরস", value: "গাছে পিঁপড়া বা আঠালো মধুরস" },
  ],
  "💧 অন্যান্য": [
    { label: "গাছ নেতিয়ে", value: "গাছ দিনে নেতিয়ে পড়ে, রাতে সতেজ হয়" },
    { label: "গাছ মরছে", value: "গাছ হঠাৎ শুকিয়ে মারা যাচ্ছে" },
    { label: "সাদা গুঁড়া", value: "পাতায় সাদা গুঁড়া বা ছাতার মতো আবরণ" },
  ],
};
const AREA_CHIPS = [
  { label: "৫% এর কম", value: "৫% এর কম" },
  { label: "১০%", value: "প্রায় ১০%" },
  { label: "২৫%", value: "প্রায় ২৫%" },
  { label: "৫০%", value: "প্রায় ৫০%" },
  { label: "৭৫%+", value: "৭৫% এরও বেশি" },
  { label: "বিক্ষিপ্ত", value: "বিক্ষিপ্তভাবে ছড়িয়ে" },
  { label: "সমস্ত মাঠ", value: "সমস্ত মাঠ" },
];
const IMAGE_LABELS = ["সম্পূর্ণ গাছ", "পাতা সামনে", "পাতা পেছনে", "কাণ্ড/ডাল"];
const DURATION_CHIPS = [
  { label: "আজই", value: "আজই শুরু" },
  { label: "১-২ দিন", value: "১-২ দিন আগে" },
  { label: "৩-৫ দিন", value: "৩-৫ দিন ধরে" },
  { label: "১ সপ্তাহ", value: "প্রায় ১ সপ্তাহ" },
  { label: "২ সপ্তাহ", value: "প্রায় ২ সপ্তাহ" },
  { label: "১ মাস+", value: "১ মাসেরও বেশি" },
];
const OTHER_APPS = [
  {
    name: "Krishi AI Web",
    url: "https://web.krishiai.live/",
    icon: "🌐",
    desc: "Browser-friendly agriculture support portal",
  },
  {
    name: "Krishi AI App",
    url: "https://app.krishiai.live/",
    icon: "📱",
    desc: "Mobile-first support app for farmers",
  },
  {
    name: "GAP Brinjal",
    url: "https://gap-brinjal-krishi-ai-team.vercel.app/",
    icon: "🍆",
    desc: "Safe brinjal cultivation and GAP guidance",
  },
  {
    name: "CIRDAP GreenLoop",
    url: "https://cirdap-greenloop3-0.vercel.app/",
    icon: "♻️",
    desc: "Climate and circular agriculture tools",
  },
  {
    name: "Pesticide Guide",
    url: "https://agrichem-guide.vercel.app/",
    icon: "🧪",
    desc: "অনুমোদিত বালাইনাশক নির্দেশিকা, ডোজ ও স্প্রে গাইড (DAE Catalog)",
  },
];
const LIBRARY_MEDIA = {
  videoCategories: [
    {
      id: "intro",
      title: "🟢 পরিচিতি ও ওভারভিউ",
      desc: "অ্যাপ ও পদ্ধতি সম্পর্কে পরিচিতি",
      videos: [
        {
          id: "1GnzOWByC2cxpPfoetJGMMoXTA-N4Qk4y",
          title: "একজন উদ্ভিদ গোয়েন্দা হয়ে উঠুন",
          desc: "উদ্ভিদ গোয়েন্দা অ্যাপ কীভাবে কাজ করে এবং কৃষকের জন্য কেন গুরুত্বপূর্ণ",
          emoji: "🔍",
          size: "40.3 MB",
        },
        {
          id: "1kSbwu6O3XicBgY-ZQ3sUOQbJq54U2Vel",
          title: "অ্যাপ ডাউনলোড ও ব্যবহার গাইড",
          desc: "ধাপে ধাপে অ্যাপ ইনস্টল ও ব্যবহার করার নিয়ম",
          emoji: "📲",
          size: "5 MB",
        },
      ],
    },
    {
      id: "diagnosis",
      title: "🔬 রোগ নির্ণয়",
      desc: "উদ্ভিদের রোগ চেনা ও নির্ণয় পদ্ধতি",
      videos: [
        {
          id: "1I5TTG0g7rZLrRT0f0b53gbB_pEXWaqfv",
          title: "উদ্ভিদ রোগ নির্ণয়",
          desc: "CABI ৫-ধাপ প্রোটোকল অনুসারে রোগ চিহ্নিতকরণ",
          emoji: "🩺",
          size: "38.8 MB",
        },
        {
          id: "1oDpDeaHJqDUwfgMiGIkSTkoUvrG3tOxW",
          title: "Bacteria Diagnosis",
          desc: "ব্যাকটেরিয়াজনিত রোগ শনাক্তকরণ ও ব্যবস্থাপনা",
          emoji: "🦠",
          size: "3.7 MB",
        },
        {
          id: "1p-22XcoIZmF41w5Ero2oLV_-Q9ninUgj",
          title: "পুষ্টি ঘাটতি চিহ্নিতকরণ",
          desc: "উদ্ভিদের পুষ্টি উপাদানের অভাব চেনার উপায়",
          emoji: "🌿",
          size: "8 MB",
        },
      ],
    },
    {
      id: "management",
      title: "📐 পরিচালনা ও পদ্ধতি",
      desc: "IPM পিরামিড, সিদ্ধান্ত পদ্ধতি ও নিরাপদ ফসল",
      videos: [
        {
          id: "1UYQnz5NE1vk3dn0ZmN2-AkivQk0fUMTS",
          title: "উদ্ভিদ স্বাস্থ্যের জাদুকরী পিরামিড",
          desc: "IPM পিরামিড অনুসারে উদ্ভিদ সুরক্ষা ব্যবস্থা",
          emoji: "🔺",
          size: "35.4 MB",
        },
        {
          id: "1g4oUitcpdzQifZTIUbwjq2jlUPksOYw9",
          title: "স্মার্ট কৃষকের সিদ্ধান্ত পদ্ধতি",
          desc: "তথ্য ভিত্তিক সিদ্ধান্ত নেওয়ার কৌশল",
          emoji: "🧠",
          size: "9.5 MB",
        },
        {
          id: "1-E6u_rnaCNDWbKap4etH3OkRuCcsN9Hu",
          title: "এক নিরাপদ ফসলের নিয়মাবলী",
          desc: "নিরাপদ ফসল উৎপাদনের সবুজ সার্টিফিকেট নিয়ম",
          emoji: "🛡️",
          size: "37.1 MB",
        },
      ],
    },
    {
      id: "pest",
      title: "🪲 পোকামাকড় ব্যবস্থাপনা",
      desc: "নির্দিষ্ট পোকামাকড় শনাক্তকরণ ও দমন",
      videos: [
        {
          id: "1k8A7PSsVHiuPUY5i22wnlktyJESxMpBs",
          title: "বাদামী গাছফড়িংয়ের রণকৌশল",
          desc: "BPH শনাক্তকরণ, ক্ষতি ও পরিবেশবান্ধব দমন পদ্ধতি",
          emoji: "🪲",
          size: "49.7 MB",
        },
      ],
    },
  ],
  slides: [
    { title: "স্লাইড ১", id: "1TFMKiKOiQMneoZEn3PYN59JVXJspcz2X" },
    { title: "স্লাইড ২", id: "1ivvMxoVUCM1k9rl8bXpiZ7rLYg8RdMup" },
    { title: "স্লাইড ৩", id: "1yKnsuo2_6Gdv8Zkm53WnmngQiqZUKGv0" },
    { title: "স্লাইড ৪", id: "1Kit5SuPbmNIGail6HSQscRJSVoxPiF3u" },
  ],
  readings: [
    { title: "CABI Guide", id: "1yw4JPZXY06FyEQ4b8O_TxPGLes9Kn_-v" },
    { title: "IPM Manual", id: "1MOGzZhfxYCmC0vOpygpYL-zKttCVanSa" },
  ],
  audio: [
    { title: "পডকাস্ট ১", id: "1JDrGis-p0aOs1ROrgkSIrqr9m82xdj0A" },
    { title: "পডকাস্ট ২", id: "1teuRIiuPmKYQmpFmRTzuX105JHrgOfvH" },
  ],
};
const CROP_DETECT_SYSTEM_PROMPT = `You identify the crop shown in a Bangladesh farm photo.
Reply with one compact JSON object only.
Schema: {"crop":"<best match from common Bangladesh crops or Unknown>","confidence":"high|medium|low","reason":"<very short>"}
Prefer one of: Rice, Potato, Tomato, Brinjal, Mustard, Jute, Mango, Banana, Wheat, Maize, Chilli, Onion, Garlic, Cabbage, Cauliflower, Okra, Pumpkin, Papaya, Guava.
Do not include markdown, prose, or extra keys.`;
const FRIENDLY_SECTION_LABELS = {
  "CABI Exclusion Analysis": "কি দেখে বোঝা গেল",
  "Probable Diagnosis": "সবচেয়ে সম্ভবত যে সমস্যা",
  "Disease Triangle Assessment": "কেন এই সমস্যা বাড়ছে",
  "Field Confirmation Method": "মাঠে কী দেখে মিলিয়ে নেবেন",
  "Severity & Economic Importance": "ক্ষতির মাত্রা",
  "IPM Recommendations": "কি করবেন এখন",
  Prevention: "পরের বার কীভাবে ঠেকাবেন",
  "When to Consult DAE": "কখন কৃষি অফিসে বলবেন",
};

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 10 || month <= 3) return "রবি মৌসুম / Rabi Season (Oct–Mar)";
  return "খরিপ মৌসুম / Kharif Season (Apr–Sep)";
}
function findDistrictMatch(...values) {
  const checks = values
    .flat()
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());
  for (const district of DISTRICTS) {
    const bn = district.split("/")[0].trim().toLowerCase();
    const en = (district.split("/")[1] || district).trim().toLowerCase();
    if (checks.some((v) => v.includes(bn) || v.includes(en) || bn.includes(v) || en.includes(v))) return district;
  }
  return "";
}
function extractDriveId(url) {
  if (!url) return "";
  const match = String(url).match(/\/d\/([^/]+)/);
  return match?.[1] || url;
}
function toDrivePreviewUrl(id) {
  return `https://drive.google.com/file/d/${extractDriveId(id)}/preview`;
}
function toDriveDownloadUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${extractDriveId(id)}`;
}
function toDriveViewUrl(id) {
  return `https://drive.google.com/file/d/${extractDriveId(id)}/view`;
}
function simplifyFarmerText(text) {
  if (!text) return "";
  return text
    .replace(/Abiotic vs Biotic/gi, "সমস্যার উৎস")
    .replace(/Abiotic/gi, "পরিবেশ/খাবারের ঘাটতিজনিত")
    .replace(/Biotic/gi, "পোকা/রোগজীবাণুজনিত")
    .replace(/Exclusion/gi, "কি কি বাদ গেল")
    .replace(/Host/gi, "গাছের অবস্থা")
    .replace(/Pathogen/gi, "রোগ/পোকার চাপ")
    .replace(/Environment/gi, "আবহাওয়া ও মাঠের অবস্থা")
    .replace(/Confidence level/gi, "কতটা নিশ্চিত")
    .replace(/High/gi, "উচ্চ")
    .replace(/Medium/gi, "মাঝারি")
    .replace(/Low/gi, "কম");
}
function guessCropFromText(text) {
  const source = (text || "").toLowerCase();
  const known = [
    "Rice / ধান",
    "Potato / আলু",
    "Tomato / টমেটো",
    "Brinjal / বেগুন",
    "Mustard / সরিষা",
    "Jute / পাট",
    "Mango / আম",
    "Banana / কলা",
    "Wheat / গম",
    "Maize / ভুট্টা",
    "Chilli / মরিচ",
    "Onion / পেঁয়াজ",
    "Garlic / রসুন",
    "Cabbage / বাঁধাকপি",
    "Cauliflower / ফুলকপি",
    "Okra / ঢেঁড়স",
    "Pumpkin / কুমড়া",
    "Papaya / পেঁপে",
    "Guava / পেয়ারা",
  ];
  const fromData = [...QUICK_CROPS.map((c) => `${c.en} / ${c.label}`), ...Object.values(CROPS).flat()];
  for (const crop of [...new Set([...known, ...fromData])]) {
    const parts = crop
      .split("/")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
    if (parts.some((part) => part.length > 1 && source.includes(part))) return crop;
  }
  return "";
}
function getFriendlySectionTitle(title) {
  return FRIENDLY_SECTION_LABELS[title] || title;
}
function extractResultHighlights(text) {
  const body = simplifyFarmerText(text || "");
  const find = (patterns) => {
    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return "";
  };
  return [
    {
      icon: "🧾",
      label: "সমস্যা",
      value: find([/\*\*প্রাথমিক সন্দেহ:\*\*\s*([^\n]+)/, /\*\*Primary suspect:\*\*\s*([^\n]+)/]),
    },
    {
      icon: "📍",
      label: "ধরন",
      value: find([/\*\*অ্যাবায়োটিক নাকি বায়োটিক:\*\*\s*([^\n]+)/, /\*\*Abiotic vs Biotic:\*\*\s*([^\n]+)/]),
    },
    {
      icon: "📊",
      label: "নিশ্চয়তা",
      value: find([/\*\*আস্থার মাত্রা:\*\*\s*([^\n]+)/, /\*\*Confidence level:\*\*\s*([^\n]+)/]),
    },
    {
      icon: "⚠️",
      label: "ক্ষতি",
      value: find([/\*\*ক্ষয়ক্ষতির মাত্রা:\*\*\s*([^\n]+)/, /\*\*Damage level:\*\*\s*([^\n]+)/]),
    },
  ].filter((item) => item.value);
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}
function buildFeedbackMessage({ context, rating, feedback, email, summary, visits }) {
  return [
    `App Section: ${context}`,
    `Rating: ${rating || "Not given"}/5`,
    `Feedback or Request: ${feedback || "Not written"}`,
    `Contact Email: ${email || "Not provided"}`,
    `Summary: ${summary || "N/A"}`,
    `Visitor Count (this browser): ${visits || 1}`,
  ].join("\n");
}
// ─── Secure API request helper with HMAC signing ──────────────────────────────
// Fetches a signing token from the server and includes it in all API requests.
// This prevents external callers from abusing API endpoints.
let _signingToken = null;
let _signingTokenExpiry = 0;
let _signingTokenPromise = null; // prevent concurrent fetches

async function getSigningToken() {
  // Use cached token if still valid (refresh 5 min before expiry)
  if (_signingToken && Date.now() < _signingTokenExpiry - 300000) return _signingToken;

  // Prevent concurrent fetches — reuse in-flight promise
  if (_signingTokenPromise) return _signingTokenPromise;

  _signingTokenPromise = (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/signing-token");
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            _signingToken = data.token;
            _signingTokenExpiry = Date.now() + (data.expiresIn || 7200) * 1000;
            return _signingToken;
          }
        }
      } catch {}
      // Brief pause before retry
      if (attempt === 0) await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  })();

  _signingTokenPromise.finally(() => {
    _signingTokenPromise = null;
  });
  return _signingTokenPromise;
}

async function postJson(url, payload) {
  const token = await getSigningToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["X-Request-Signature"] = token;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return res.json().catch(() => ({}));
}

async function signedFetch(url, options = {}) {
  const token = await getSigningToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["X-Request-Signature"] = token;
  return fetch(url, { ...options, headers });
}

// ─── CABI Guide data ──────────────────────────────────────────────────────────
const CABI_GUIDE = {
  protocol: {
    title: "CABI Plantwise রোগ নির্ণয় প্রোটোকল",
    subtitle: "5-Step Diagnostic Framework",
    steps: [
      {
        num: "১",
        icon: "👁️",
        title: "লক্ষণ পর্যবেক্ষণ",
        en: "Observe Symptoms",
        color: "#2563eb",
        bgKey: "bgInfo",
        borderKey: "borderInfo",
        desc: "ফসলের পাতা, কান্ড, ফুল ও ফলে বাহ্যিক লক্ষণ পর্যবেক্ষণ করুন।",
        points: [
          "পাতার উপরে ও নিচে পরীক্ষা করুন",
          "দাগের আকার, রং ও সীমানা লক্ষ্য করুন",
          "পোকার উপস্থিতি বা মলের চিহ্ন খুঁজুন",
          "আক্রান্ত গাছের বয়স নির্ধারণ করুন",
          "সুস্থ গাছের সাথে তুলনা করুন",
        ],
      },
      {
        num: "২",
        icon: "🔬",
        title: "CABI বর্জন পদ্ধতি",
        en: "CABI Exclusion",
        color: "#7c3aed",
        bgKey: "bgPurple",
        borderKey: "borderPurple",
        desc: "সম্ভাব্য কারণগুলো একে একে বাদ দিন।",
        points: [
          "অপুষ্টি: N হলে পুরনো পাতা, Fe হলে নতুন পাতা হলুদ",
          "পোকা: ছিদ্র, কামড়ের দাগ, পোকা বা ডিম দেখুন",
          "ছত্রাক: দাগের গঠন, স্পোর লক্ষ্য করুন",
          "ব্যাকটেরিয়া: পানিভেজা দাগ, দুর্গন্ধ",
          "ভাইরাস: মোজেইক, বিকৃতি, বামনতা",
        ],
      },
      {
        num: "৩",
        icon: "🔺",
        title: "রোগ ত্রিভুজ",
        en: "Disease Triangle",
        color: "#d97706",
        bgKey: "bgWarning",
        borderKey: "borderWarning",
        desc: "রোগের জন্য তিনটি উপাদান একসাথে থাকতে হয়।",
        points: [
          "পোষক: ফসলের প্রতিরোধ ক্ষমতা কম",
          "রোগজীবাণু: ছত্রাক/ব্যাকটেরিয়া/ভাইরাস",
          "পরিবেশ: তাপমাত্রা, আর্দ্রতা, বৃষ্টি",
          "সময়: তিনটি একসাথে থাকলেই রোগ",
          "যেকোনো একটি বদলালে নিয়ন্ত্রণ সম্ভব",
        ],
      },
      {
        num: "৪",
        icon: "🧪",
        title: "মাঠ নিশ্চিতকরণ",
        en: "Field Confirmation",
        color: "#16a34a",
        bgKey: "bgSuccess",
        borderKey: "borderSuccess",
        desc: "নমুনা সংগ্রহের মাধ্যমে প্রাথমিক নির্ণয় নিশ্চিত করুন।",
        points: [
          "W-pattern-এ ১০টি স্থান থেকে নমুনা নিন",
          "আক্রান্তের হার (%) গণনা করুন",
          "ETL-এর সাথে তুলনা করুন",
          "৩-৫ দিন রোগের অগ্রগতি দেখুন",
          "DAE ল্যাবে নমুনা পাঠান প্রয়োজনে",
        ],
      },
      {
        num: "৫",
        icon: "🌿",
        title: "IPM সিদ্ধান্ত",
        en: "IPM Decision",
        color: "#0891b2",
        bgKey: "bgTeal",
        borderKey: "borderTeal",
        desc: "IPM পিরামিড: প্রতিরোধ → সাংস্কৃতিক → জৈব → রাসায়নিক।",
        points: [
          "প্রতিরোধী জাত ব্যবহার করুন",
          "সুষম সার, সেচ, পরিষ্কার মাঠ",
          "জৈব: ট্রাইকোকার্ড, নিম তেল",
          "ETL অতিক্রমে সঠিক কীটনাশক",
          "FRAC/IRAC রোটেশন মেনে চলুন",
        ],
      },
    ],
  },
  etl: [
    {
      pest: "ধানের মাজরা পোকা",
      en: "Rice Stem Borer",
      etl: "২০% মরা ডিল বা ১০% সাদা শীষ",
      stage: "কুশি থেকে গর্ভাবস্থা",
      monitor: "১০ স্থান × ১০ গাছ",
    },
    {
      pest: "বাদামি গাছফড়িং",
      en: "Brown Planthopper",
      etl: "প্রতি গাছে ১০-১৫টি পোকা",
      stage: "সব পর্যায়",
      monitor: "২০ গাছ/বিঘা",
    },
    {
      pest: "পাতামোড়া পোকা",
      en: "Rice Leaf Folder",
      etl: "৫০% মোড়ানো পাতা",
      stage: "শাখা-প্রশাখা",
      monitor: "ক্ষেতের মাঝে ও কিনারে",
    },
    {
      pest: "জাব পোকা",
      en: "Aphid (Mustard)",
      etl: "৫০টির বেশি পোকা/গাছ",
      stage: "ফুল থেকে শুঁটি",
      monitor: "১০ গাছের উপরের ৩ পাতা",
    },
    {
      pest: "ধানের ব্লাস্ট",
      en: "Rice Blast",
      etl: "পাতা: ২%; ঘাড়: যেকোনো দাগ",
      stage: "কুশি ও ফুল",
      monitor: "আবহাওয়া + মাঠ পরিদর্শন",
    },
    {
      pest: "টমেটো আর্লি ব্লাইট",
      en: "Early Blight",
      etl: "১ম দাগ দেখলেই ব্যবস্থা",
      stage: "সব পর্যায়",
      monitor: "সাপ্তাহিক পরিদর্শন",
    },
    {
      pest: "আলু লেট ব্লাইট",
      en: "Late Blight",
      etl: "যেকোনো দাগ দেখলেই ব্যবস্থা",
      stage: "সব পর্যায়",
      monitor: "৩ দিনে একবার",
    },
    {
      pest: "ডায়মন্ড ব্যাক মথ",
      en: "Diamond Back Moth",
      etl: "৫টি লার্ভা/গাছ",
      stage: "সব পর্যায়",
      monitor: "১০ গাছ, সপ্তাহে ২বার",
    },
  ],
  nutrients: [
    {
      name: "নাইট্রোজেন (N)",
      en: "Nitrogen",
      color: "#f59e0b",
      deficiency: "নিচের পাতা হলুদ, বৃদ্ধি কম",
      excess: "গাঢ় সবুজ, দেরিতে পাকা, রোগে সংবেদনশীল",
      fix: "ইউরিয়া ১০-১৫ কেজি/বিঘা ভাগে ভাগে",
      crops: ["ধান", "গম", "ভুট্টা", "সব সবজি"],
    },
    {
      name: "ফসফরাস (P)",
      en: "Phosphorus",
      color: "#8b5cf6",
      deficiency: "পুরনো পাতায় বেগুনি-লাল, শিকড় কম",
      excess: "Zn ও Fe অভাব ঘটায়",
      fix: "TSP বা DAP বীজ বোনার সময়ে",
      crops: ["ধান", "আলু", "ডাল ফসল"],
    },
    {
      name: "পটাশিয়াম (K)",
      en: "Potassium",
      color: "#ef4444",
      deficiency: "পুরনো পাতার কিনারা পোড়া, ফল ছোট",
      excess: "Mg ও Ca শোষণ বাধা",
      fix: "MoP বা পটাশিয়াম সালফেট",
      crops: ["আলু", "কলা", "টমেটো", "ধান"],
    },
    {
      name: "জিংক (Zn)",
      en: "Zinc",
      color: "#0891b2",
      deficiency: "বাদামি মরচে দাগ, খইরা রোগ, বৃদ্ধি থমকে",
      excess: "বিরল",
      fix: "জিংক সালফেট ৪-৫ কেজি/বিঘা",
      crops: ["ধান", "গম", "সবজি"],
    },
    {
      name: "আয়রন (Fe)",
      en: "Iron",
      color: "#f97316",
      deficiency: "নতুন পাতা হলুদ, শিরা সবুজ",
      excess: "পুরনো পাতায় বাদামি দাগ",
      fix: "ফেরাস সালফেট ০.৫% স্প্রে",
      crops: ["ধান", "সবজি", "চিনাবাদাম"],
    },
    {
      name: "বোরন (B)",
      en: "Boron",
      color: "#ec4899",
      deficiency: "ফুল ঝরা, ফল বিকৃত, কাণ্ডমাথা মরে",
      excess: "পাতার কিনারা পোড়া",
      fix: "বোরেক্স ০.২% ফুলের আগে স্প্রে",
      crops: ["সরিষা", "সূর্যমুখী", "সবজি"],
    },
  ],
  ipm_pyramid: [
    {
      level: 1,
      label: "প্রতিরোধ",
      color: "#16a34a",
      items: ["প্রতিরোধী জাত", "সুস্থ বীজ", "ফসল আবর্তন", "সুষম সার", "রোগমুক্ত চারা"],
    },
    {
      level: 2,
      label: "সাংস্কৃতিক",
      color: "#2563eb",
      items: ["সঠিক সময়ে বপন", "সঠিক দূরত্ব", "পরিষ্কার মাঠ", "সুষম সেচ", "আক্রান্ত গাছ সরানো"],
    },
    {
      level: 3,
      label: "জৈব/ভৌত",
      color: "#7c3aed",
      items: ["ট্রাইকোগ্রামা কার্ড", "হলুদ/আলোক ফাঁদ", "বিউভেরিয়া", "নিম তেল স্প্রে", "প্রাকৃতিক শত্রু"],
    },
    {
      level: 4,
      label: "রাসায়নিক (শেষ উপায়)",
      color: "#dc2626",
      items: ["ETL অতিক্রমে", "সঠিক মাত্রা", "FRAC/IRAC রোটেশন", "PPE পরিধান", "PHI মেনে চলুন"],
    },
  ],
};

// ─── Library data ─────────────────────────────────────────────────────────────
const LIBRARY = {
  pests: [
    {
      name: "ধানের মাজরা পোকা",
      en: "Rice Stem Borer",
      icon: "🐛",
      crops: ["ধান"],
      symptoms: "মরা ডিল, সাদা শীষ, কান্ড কাটা",
      ipm: "ট্রাইকোকার্ড, আলোক ফাঁদ, পরজীবী পোকা",
      etl: "২০% মরা ডিল",
    },
    {
      name: "বাদামি গাছফড়িং",
      en: "Brown Planthopper",
      icon: "🟤",
      crops: ["ধান"],
      symptoms: "হপার বার্ন, গাছের গোড়ায় বাদামি পোকা",
      ipm: "ইমিডাক্লোপ্রিড, পাইমেট্রোজিন, প্রাকৃতিক শত্রু",
      etl: "প্রতি গাছে ১০-১৫টি",
    },
    {
      name: "জাব পোকা / এফিড",
      en: "Aphid",
      icon: "🟢",
      crops: ["সরিষা", "সবজি"],
      symptoms: "পাতা কুঁকড়ানো, মধুরস, পিঁপড়া",
      ipm: "হলুদ ট্র্যাপ, নিম তেল, প্রাকৃতিক শত্রু",
      etl: "৫০টি পোকা/গাছ",
    },
    {
      name: "সবজির থ্রিপস",
      en: "Thrips",
      icon: "🔸",
      crops: ["বেগুন", "মরিচ"],
      symptoms: "পাতায় রুপালি দাগ, পাতা কুঁকড়ানো",
      ipm: "নীল ট্র্যাপ, স্পিনোসাড, নিম তেল",
      etl: "প্রতি পাতায় ১০টি",
    },
    {
      name: "ডায়মন্ড ব্যাক মথ",
      en: "Diamond Back Moth",
      icon: "🦋",
      crops: ["বাঁধাকপি", "ফুলকপি"],
      symptoms: "পাতায় অনিয়মিত ছিদ্র, লার্ভা",
      ipm: "Bt স্প্রে, ইমামেকটিন, ফেরোমন ট্র্যাপ",
      etl: "৫টি লার্ভা/গাছ",
    },
    {
      name: "লাল মাকড়সা মাইট",
      en: "Red Spider Mite",
      icon: "🔴",
      crops: ["বেগুন", "মরিচ"],
      symptoms: "পাতায় সূক্ষ্ম জাল, হলুদ ও ঝরা",
      ipm: "আবামেকটিন, সালফার, পানি স্প্রে",
      etl: "১০টি মাইট/পাতা",
    },
  ],
  diseases: [
    {
      name: "ধানের ব্লাস্ট",
      en: "Rice Blast",
      icon: "💥",
      crops: ["ধান"],
      symptoms: "মাকু আকৃতির ধূসর দাগ, ঘাড় ব্লাস্ট",
      ipm: "ট্রাইসাইক্লাজোল, প্রতিরোধী জাত",
      etl: "২% পাতা আক্রান্ত",
    },
    {
      name: "শিথ ব্লাইট",
      en: "Sheath Blight",
      icon: "🍂",
      crops: ["ধান"],
      symptoms: "কান্ডে ডিম্বাকৃতি ধূসর দাগ",
      ipm: "হেক্সাকোনাজোল, ভ্যালিডামাইসিন",
      etl: "৫% আক্রমণ",
    },
    {
      name: "ব্যাকটেরিয়াল লিফ ব্লাইট",
      en: "Bacterial Leaf Blight",
      icon: "🌊",
      crops: ["ধান"],
      symptoms: "পাতার কিনারা হলুদ-বাদামি",
      ipm: "কপার অক্সিক্লোরাইড, BLB-প্রতিরোধী জাত",
      etl: "১০% পাতা আক্রান্ত",
    },
    {
      name: "টমেটো আর্লি ব্লাইট",
      en: "Early Blight",
      icon: "🍅",
      crops: ["টমেটো", "আলু"],
      symptoms: "কালো বৃত্তাকার দাগ, হলুদ বলয়",
      ipm: "ম্যানকোজেব, ক্লোরোথ্যালোনিল",
      etl: "১ম দাগ দেখলেই",
    },
    {
      name: "আলু লেট ব্লাইট",
      en: "Late Blight",
      icon: "🥔",
      crops: ["আলু", "টমেটো"],
      symptoms: "পানিভেজা দাগ দ্রুত কালো হয়",
      ipm: "মেটালাক্সিল+মানকোজেব",
      etl: "যেকোনো দাগ দেখলেই",
    },
    {
      name: "পাউডারি মিলডিউ",
      en: "Powdery Mildew",
      icon: "⚪",
      crops: ["শসা", "টমেটো"],
      symptoms: "পাতায় সাদা গুঁড়া আবরণ",
      ipm: "সালফার, পটাশিয়াম বাইকার্বোনেট",
      etl: "১% পাতা আক্রান্ত",
    },
  ],
  deficiencies: [
    {
      name: "নাইট্রোজেন অভাব",
      en: "Nitrogen Deficiency",
      icon: "🟡",
      crops: ["সব ফসল"],
      symptoms: "নিচের পাতা হলুদ, বৃদ্ধি কম",
      fix: "ইউরিয়া ১০-১৫ কেজি/বিঘা",
      etl: "সার্বক্ষণিক",
    },
    {
      name: "জিংক অভাব (খইরা রোগ)",
      en: "Zinc Deficiency",
      icon: "🔵",
      crops: ["ধান"],
      symptoms: "বাদামি মরচে দাগ, বৃদ্ধি থমকে",
      fix: "জিংক সালফেট ৪ কেজি/বিঘা",
      etl: "লক্ষণ দেখলেই",
    },
    {
      name: "আয়রন অভাব",
      en: "Iron Deficiency",
      icon: "🟠",
      crops: ["ধান", "সবজি"],
      symptoms: "নতুন পাতা হলুদ, শিরা সবুজ",
      fix: "ফেরাস সালফেট ০.৫% স্প্রে",
      etl: "লক্ষণ দেখলেই",
    },
    {
      name: "পটাশিয়াম অভাব",
      en: "Potassium Deficiency",
      icon: "🟤",
      crops: ["আলু", "কলা"],
      symptoms: "পাতার কিনারা পোড়া বাদামি",
      fix: "MoP সার প্রয়োগ",
      etl: "লক্ষণ দেখলেই",
    },
  ],
};

// ─── Weather helpers ──────────────────────────────────────────────────────────
function assessWeatherRisks(w) {
  const r = [];
  if (!w) return r;
  if (w.humidity >= 80 && w.temp >= 26 && w.temp <= 36)
    r.push({ level: "high", icon: "🔴", text: "Blast ও Sheath Blight ঝুঁকি বেশি" });
  if (w.rain24h >= 50) r.push({ level: "high", icon: "🔴", text: "মাজরা পোকা ও শিকড় পচা ঝুঁকি বেশি" });
  if (w.rain24h === 0 && w.humidity < 55) r.push({ level: "medium", icon: "🟡", text: "মাইট ও থ্রিপস ঝুঁকি (শুষ্ক)" });
  if (w.temp < 20) r.push({ level: "medium", icon: "🟡", text: "টুংরো ভাইরাস ঝুঁকি (ঠান্ডা)" });
  if (w.humidity >= 85) r.push({ level: "high", icon: "🔴", text: "BLB ব্যাকটেরিয়াল ব্লাইট ঝুঁকি বেশি" });
  if (r.length === 0) r.push({ level: "low", icon: "🟢", text: "আবহাওয়া স্বাভাবিক — চাপ কম" });
  return r;
}
function getSprayingCondition(w) {
  if (!w) return null;
  if (w.windSpeed > 20) return { ok: false, reason: `বাতাসের গতি বেশি (${w.windSpeed}km/h)`, until: "বাতাস কমলে" };
  if (w.rain24h > 5) return { ok: false, reason: "বৃষ্টির সম্ভাবনা", until: "বৃষ্টি থামলে" };
  if (w.temp > 38) return { ok: false, reason: "তাপমাত্রা অতিরিক্ত", until: "বিকালে" };
  if (w.uvIndex > 8) return { ok: false, reason: "UV বেশি", until: "সন্ধ্যায়" };
  return { ok: true, reason: "স্প্রে করার উপযুক্ত সময়", until: null };
}
function weatherPromptText(w, loc) {
  if (!w) return "";
  return `REAL-TIME WEATHER:\nLocation:${loc || "Bangladesh"}\nTemp:${w.temp}°C | Humidity:${w.humidity}% | Rain24h:${w.rain24h}mm | Wind:${w.windSpeed}km/h | UV:${w.uvIndex}\nRisks:${assessWeatherRisks(
    w,
  )
    .map((x) => x.text)
    .join("; ")}\nFactor this into diagnosis.`;
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderTokens(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} style={{ color: C.primaryDark }}>
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("*") && p.endsWith("*"))
      return (
        <em key={i} style={{ color: C.warning }}>
          {p.slice(1, -1)}
        </em>
      );
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code
          key={i}
          style={{ background: C.bgMuted, borderRadius: 4, padding: "1px 6px", fontSize: 12, color: C.primary }}
        >
          {p.slice(1, -1)}
        </code>
      );
    return p;
  });
}
function renderInline(text) {
  return text.split("\n").map((line, li) => {
    if (/^#{1,4}\s/.test(line)) {
      const t = line.replace(/^#{1,4}\s/, "");
      return (
        <div key={li} style={{ fontWeight: 700, color: C.primaryDark, fontSize: 14, marginTop: 10, marginBottom: 4 }}>
          {renderTokens(t)}
         </div>
      );
    }
    if (/^[-•*]\s/.test(line))
      return (
        <div key={li} style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <span style={{ color: C.primary, flexShrink: 0 }}>▸</span>
          <span>{renderTokens(line.replace(/^[-•*]\s/, ""))}</span>
        </div>
      );
    if (line.trim() === "") return <div key={li} style={{ height: 8 }} />;
    return (
      <div key={li} style={{ marginTop: 3 }}>
        {renderTokens(line)}
      </div>
    );
  });
}
function parseIntoSections(text) {
  if (!text) return [];
  const lines = text.split("\n"),
    sections = [];
  let current = null;
  for (const line of lines) {
    const h = line.match(/^#{1,2}\s+(.+)/);
    if (h) {
      if (current) sections.push(current);
      current = { title: h[1].replace(/^\d+\.\s*/, ""), body: [] };
    } else if (current) current.body.push(line);
  }
  if (current) sections.push(current);
  if (sections.length === 0) return [{ title: null, body: text.split("\n") }];
  return sections;
}
const SECTION_META_KEYS = {
  সম্ভাব্য: { icon: "🦠", colorKey: "danger", bgKey: "bgDanger", borderKey: "borderDanger" },
  Diagnosis: { icon: "🦠", colorKey: "danger", bgKey: "bgDanger", borderKey: "borderDanger" },
  CABI: { icon: "🔬", colorKey: "blue", bgKey: "bgInfo", borderKey: "borderInfo" },
  Exclusion: { icon: "🔬", colorKey: "blue", bgKey: "bgInfo", borderKey: "borderInfo" },
  IPM: { icon: "🌿", colorKey: "success", bgKey: "bgSuccess", borderKey: "borderSuccess" },
  সমন্বিত: { icon: "🌿", colorKey: "success", bgKey: "bgSuccess", borderKey: "borderSuccess" },
  তীব্রতা: { icon: "📊", colorKey: "warning", bgKey: "bgWarning", borderKey: "borderWarning" },
  Severity: { icon: "📊", colorKey: "warning", bgKey: "bgWarning", borderKey: "borderWarning" },
  প্রতিরোধ: { icon: "🛡️", colorKey: "purple", bgKey: "bgPurple", borderKey: "borderPurple" },
  Prevention: { icon: "🛡️", colorKey: "purple", bgKey: "bgPurple", borderKey: "borderPurple" },
  DAE: { icon: "📞", colorKey: "teal", bgKey: "bgTeal", borderKey: "borderTeal" },
  Consult: { icon: "📞", colorKey: "teal", bgKey: "bgTeal", borderKey: "borderTeal" },
  মাঠে: { icon: "🧪", colorKey: "greenDark", bgKey: "bgSuccess", borderKey: "borderSuccess" },
  Field: { icon: "🧪", colorKey: "greenDark", bgKey: "bgSuccess", borderKey: "borderSuccess" },
};
const _SECTION_META_COLORS = {
  danger: "#dc2626",
  blue: "#2563eb",
  success: "#16a34a",
  warning: "#d97706",
  purple: "#7c3aed",
  teal: "#0891b2",
  greenDark: "#065f46",
};
function getSectionMeta() {
  const out = {};
  for (const [k, v] of Object.entries(SECTION_META_KEYS)) {
    out[k] = {
      icon: v.icon,
      color: C[v.colorKey] || _SECTION_META_COLORS[v.colorKey],
      bg: C[v.bgKey] || C.bgMuted,
      border: C[v.borderKey] || C.border,
    };
  }
  return out;
}
function getMeta(t) {
  for (const [k, v] of Object.entries(getSectionMeta())) if ((t || "").includes(k)) return v;
  return { icon: "📄", color: C.text, bg: C.bgMuted, border: C.border };
}
function SectionCard({ title, bodyLines, defaultOpen }) {
  // Collapse Exclusion Gate by default — it's technical detail users rarely need open
  const isExclusion = (title || "").includes("Exclusion") || (title || "").includes("বর্জন");
  const effectiveDefault = isExclusion ? false : defaultOpen !== false;
  const [open, setOpen] = useState(effectiveDefault);
  const meta = getMeta(title);
  const bodyText = simplifyFarmerText(bodyLines.join("\n").trim());
  if (!bodyText && !title) return null;
  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${meta.border}`,
        marginBottom: 10,
        overflow: "hidden",
        animation: "fadeIn .3s ease",
      }}
    >
      {title && (
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: meta.bg,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 19 }}>{meta.icon}</span>
          <span style={{ color: meta.color, fontWeight: 700, fontSize: 14, flex: 1 }}>
            {getFriendlySectionTitle(title)}
          </span>
          <span style={{ color: meta.color, fontSize: 13, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
        </button>
      )}
      {open && (
        <div style={{ padding: "14px 18px", background: C.bgCard, color: C.text, fontSize: 13.5, lineHeight: 1.85 }}>
          {renderInline(bodyText)}
        </div>
      )}
    </div>
  );
}
function InfoRow({ icon, label, val }) {
  if (!val) return null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            color: C.textMuted,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{val}</div>
      </div>
    </div>
  );
}

// ─── Small UI components ──────────────────────────────────────────────────────
function SprayingWidget({ weather, weatherLoading }) {
  if (weatherLoading || !weather) return null;
  const spray = getSprayingCondition(weather);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: spray.ok ? C.bgSuccess : C.bgOrange,
        border: `1px solid ${spray.ok ? C.borderSuccess : C.borderOrange}`,
        borderRadius: 14,
        marginBottom: 12,
      }}
    >
      <span style={{ fontSize: 20 }}>{spray.ok ? "✅" : "⚠️"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: spray.ok ? C.success : C.warning }}>
          স্প্রে: {spray.ok ? "অনুকূল" : "প্রতিকূল"}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted }}>{spray.reason}</div>
      </div>
      {!spray.ok && spray.until && (
        <div style={{ fontSize: 11, color: C.warning, fontWeight: 600, whiteSpace: "nowrap" }}>{spray.until}</div>
      )}
    </div>
  );
}
function WeatherBar({ weather, weatherLoading, locationName, locationSource, onRefresh }) {
  const risks = assessWeatherRisks(weather);
  const top = risks[0];
  return (
    <div
      style={{
        background: C.bgBlue,
        border: `1px solid ${C.borderBlue}`,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          background: "linear-gradient(90deg,#0ea5e9,#0284c7)",
          color: "#fff",
        }}
      >
        <span style={{ fontSize: 15 }}>🌦️</span>
        <span style={{ fontWeight: 700, fontSize: 12 }}>আবহাওয়া {locationSource === "gps" ? "📍" : "🌐"}</span>
        {locationName && (
          <span
            style={{
              fontSize: 11,
              opacity: 0.85,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            — {locationName}
          </span>
        )}
        <button
          onClick={onRefresh}
          style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            padding: "2px 10px",
            cursor: "pointer",
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          🔄
        </button>
      </div>
      {weatherLoading && !weather && (
        <div style={{ padding: "10px 14px", color: C.textBlue, fontSize: 12 }}>⏳ আবহাওয়া সংগ্রহ...</div>
      )}
      {weather && (
        <div style={{ padding: "8px 14px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 5 }}>
            {[
              { icon: "🌡️", v: `${weather.temp}°C` },
              { icon: "💧", v: `${weather.humidity}%` },
              { icon: "🌧️", v: `${weather.rain24h}mm` },
              { icon: "💨", v: `${weather.windSpeed}km/h` },
              { icon: "☀️", v: `UV${weather.uvIndex}` },
            ].map(({ icon, v }) => (
              <div key={v} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: C.text }}>
                <span>{icon}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          {top && (
            <div
              style={{
                fontSize: 11,
                color: top.level === "high" ? C.danger : top.level === "medium" ? C.warning : C.success,
                fontWeight: 600,
              }}
            >
              {top.icon} {top.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function QuickCropRow({ onSelect, selected }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
      {QUICK_CROPS.map((crop) => {
        const active = (selected || "").includes(crop.en);
        return (
          <button
            key={crop.id}
            onClick={() => onSelect(crop.en + " / " + crop.label)}
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                border: `2.5px solid ${active ? crop.color : C.border}`,
                background: active ? crop.color + "18" : C.bgCard,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                transition: "all .2s",
                boxShadow: active ? `0 0 0 3px ${crop.color}33` : "none",
              }}
            >
              {crop.emoji}
            </div>
            <span
              style={{
                fontSize: 10,
                color: active ? C.primaryDark : C.textMuted,
                fontWeight: active ? 700 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {crop.label}
            </span>
          </button>
        );
      })}
      <button
        onClick={() => onSelect("__more__")}
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 4px",
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: `2px dashed ${C.border}`,
            background: C.bgMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          ➕
        </div>
        <span style={{ fontSize: 10, color: C.textMuted, whiteSpace: "nowrap" }}>আরও</span>
      </button>
    </div>
  );
}
function DiagnosisHistory({ history, onLoad }) {
  if (history.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          color: C.textMuted,
          fontWeight: 700,
          marginBottom: 7,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        📋 সাম্প্রতিক নির্ণয়
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {[...history]
          .reverse()
          .slice(0, 4)
          .map((h, i) => (
            <button
              key={i}
              onClick={() => onLoad(h)}
              style={{
                flexShrink: 0,
                padding: "7px 12px",
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                boxShadow: C.shadow,
              }}
            >
              <span style={{ fontSize: 16 }}>🌾</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: C.text }}>
                  {h.crop?.split("/")[0]?.trim() || "Unknown"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.textMuted, fontSize: 10 }}>
                  {h.date}
                  {h.vitPrediction && (
                    <span title={`ছবি বিশ্লেষণ: ${h.vitPrediction.diseaseBn || h.vitPrediction.disease || ""}`}>
                      🛰️
                    </span>
                  )}
                </div>
              </div>
              <span
                style={{
                  background: C.badgeSuccess,
                  color: C.textSuccess,
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
function SeverityBadge({ severity, cause, affectedArea }) {
  // Auto-fill severity from diagnosis data or affected area
  const autoLevel = ((sev) => {
    if (sev === "severe" || sev === "high")
      return { label: "মারাত্মক", icon: "🔴", bg: C.bgDanger, border: C.borderDanger, color: C.danger };
    if (sev === "moderate" || sev === "medium")
      return { label: "মাঝারি", icon: "🟡", bg: C.bgWarning, border: C.borderWarning, color: C.warning };
    if (sev === "low" || sev === "mild")
      return { label: "সামান্য", icon: "🟢", bg: C.bgSuccess, border: C.borderSuccess, color: C.success };
    // Infer from affected area chip
    if (affectedArea) {
      const a = affectedArea.toLowerCase();
      if (a.includes("৭৫%") || a.includes("সমস্ত"))
        return { label: "মারাত্মক", icon: "🔴", bg: C.bgDanger, border: C.borderDanger, color: C.danger };
      if (a.includes("৫০%") || a.includes("অর্ধেক"))
        return { label: "মাঝারি", icon: "🟡", bg: C.bgWarning, border: C.borderWarning, color: C.warning };
      return { label: "সামান্য", icon: "🟢", bg: C.bgSuccess, border: C.borderSuccess, color: C.success };
    }
    return { label: "অজানা", icon: "⚪", bg: C.bgMuted, border: C.border, color: C.textMuted };
  })(severity);
  const causeLabel = ((c) => {
    if (!c) return "";
    const cl = c.toLowerCase();
    if (cl.includes("fungal") || cl.includes("ছত্রাক")) return "ছত্রাকজনিত";
    if (cl.includes("bacterial") || cl.includes("ব্যাকটেরিয়া")) return "ব্যাকটেরিয়াজনিত";
    if (cl.includes("viral") || cl.includes("ভাইরাস")) return "ভাইরাসজনিত";
    if (cl.includes("insect") || cl.includes("পোকা")) return "পোকাজনিত";
    if (cl.includes("nutrient") || cl.includes("পুষ্টি")) return "পুষ্টিজনিত";
    return c;
  })(cause);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 14px",
        background: autoLevel.bg,
        border: `1px solid ${autoLevel.border}`,
        borderRadius: 12,
        marginTop: 10,
      }}
    >
      <span style={{ fontSize: 18 }}>{autoLevel.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: autoLevel.color }}>তীব্রতা: {autoLevel.label}</div>
        {causeLabel && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>কারণ: {causeLabel}</div>}
      </div>
    </div>
  );
}
function ProductRecommendations({ products, crop }) {
  const [selected, setSelected] = useState(null);
  const typeColor = (t) =>
    ({
      insecticide: { bg: C.badgeWarning, border: C.borderWarning, color: C.textWarning, label: "কীটনাশক" },
      fungicide: { bg: C.bgInfo, border: C.borderInfo, color: C.textInfo, label: "ছত্রাকনাশক" },
      herbicide: { bg: C.bgPurple, border: C.borderPurple, color: C.textPurple, label: "আগাছানাশক" },
      acaricide: { bg: C.bgOrange, border: C.borderOrange, color: C.textOrange, label: "মাকড়নাশক" },
      bactericide: { bg: C.bgSuccess, border: C.borderSuccess, color: C.textSuccess, label: "ব্যাকটেরিয়ানাশক" },
      trap: { bg: C.bgBlue, border: C.borderBlue, color: C.textBlue, label: "ফাঁদ" },
      biocontrol: { bg: C.bgSuccess, border: C.borderSuccess, color: C.textSuccess, label: "জৈব নিয়ন্ত্রণ" },
      biofungicide: { bg: C.bgSuccess, border: C.borderSuccess, color: C.textSuccess, label: "জৈব ছত্রাকনাশক" },
      bioinsecticide: { bg: C.bgSuccess, border: C.borderSuccess, color: C.textSuccess, label: "জৈব কীটনাশক" },
      botanical: { bg: C.bgWarning, border: C.borderWarning, color: C.textWarning, label: "উদ্ভিজ্জ" },
      fertilizer: { bg: C.bgSuccess, border: C.borderSuccess, color: C.textSuccess, label: "সার" },
      soil_amendment: { bg: C.bgMuted, border: C.border, color: C.text, label: "মাটি সংশোধন" },
      pgr: { bg: C.bgPurple, border: C.borderPurple, color: C.textPurple, label: "বৃদ্ধি নিয়ন্ত্রক" },
    })[t] || { bg: C.bgMuted, border: C.border, color: C.text, label: t };
  const isBio = (t) => ["trap", "biocontrol", "bioinsecticide", "biofungicide", "botanical"].includes(t);
  if (selected) {
    const tc = typeColor(selected.type);
    return (
      <div
        style={{
          background: C.bgCard,
          borderRadius: 16,
          padding: 18,
          marginTop: 12,
          border: `1px solid ${C.border}`,
          boxShadow: C.shadow,
          animation: "fadeIn .3s ease",
        }}
      >
        <button
          onClick={() => setSelected(null)}
          style={{
            background: "none",
            border: "none",
            color: C.primary,
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 600,
          }}
        >
          ← ফিরুন
        </button>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark }}>{selected.trade_name}</div>
          <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{selected.company}</div>
          {selected.dae_reg && (
            <div style={{ fontSize: 11, color: C.blue, marginTop: 4 }}>🏛️ DAE রেজি: {selected.dae_reg}</div>
          )}
          <span
            style={{
              display: "inline-block",
              background: tc.bg,
              border: `1px solid ${tc.border}`,
              color: tc.color,
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {tc.label}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <InfoRow icon="🧪" label="সক্রিয় উপাদান" val={selected.active_ingredient} />
          <InfoRow
            icon="🎯"
            label="কার্যকর পোকা/রোগ"
            val={selected.target_bn?.join(", ") || selected.targets?.join(", ")}
          />
          <InfoRow icon="🌾" label="ফসল" val={selected.crops_bn?.join(", ") || selected.crops?.join(", ")} />
          <InfoRow icon="⚗️" label="প্রতি লিটারে মাত্রা" val={selected.dosage_per_litre} />
          <InfoRow icon="🌿" label="প্রতি বিঘায় মাত্রা" val={selected.dosage_per_bigha} />
          <InfoRow icon="📅" label="PHI (ফসল কাটার আগে)" val={`${selected.phi_days} দিন`} />
          <InfoRow icon="🔬" label="প্রয়োগ পদ্ধতি" val={selected.method} />
          {selected.frac_group && <InfoRow icon="🧬" label="FRAC গ্রুপ" val={selected.frac_group} />}
          {selected.irac_group && <InfoRow icon="🧬" label="IRAC গ্রুপ" val={selected.irac_group} />}
          {selected.resistance_risk && (
            <InfoRow
              icon="⚠️"
              label="প্রতিরোধ ঝুঁকি"
              val={
                selected.resistance_risk === "high"
                  ? "উচ্চ (রোটেশন বাধ্যতামূলক)"
                  : selected.resistance_risk === "medium"
                    ? "মাঝারি (রোটেশন সুপারিশ)"
                    : "কম (মাল্টিসাইট)"
              }
            />
          )}
        </div>
        {selected.ipm_note && (
          <div style={{ marginTop: 10, background: C.bgSuccess, borderRadius: 10, padding: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 11, color: C.success, marginBottom: 3 }}>🌿 IPM পরামর্শ</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{selected.ipm_note}</div>
          </div>
        )}
        <div style={{ marginTop: 8, background: C.bgWarning, borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: C.warning, marginBottom: 3 }}>⚠️ সতর্কতা</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{selected.caution_bn || selected.caution}</div>
        </div>
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: C.bgDanger,
            borderRadius: 8,
            fontSize: 11,
            color: C.danger,
          }}
        >
          ⚠️ শুধুমাত্র একটি পণ্য ব্যবহার করুন। DAE কর্মকর্তার পরামর্শ নিন।
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        background: C.bgCard,
        borderRadius: 16,
        padding: 14,
        marginTop: 12,
        border: `1px solid ${C.border}`,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 19 }}>💊</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.primaryDark }}>সুপারিশকৃত পণ্যসমূহ</div>
          <div style={{ fontSize: 10, color: C.textMuted }}>{crop?.split("/")[0]?.trim()} · DAE নিবন্ধিত</div>
        </div>
      </div>
      <div
        style={{
          background: C.bgWarning,
          border: `1px solid ${C.borderWarning}`,
          borderRadius: 8,
          padding: "7px 10px",
          marginBottom: 10,
          fontSize: 11,
          color: C.warning,
          fontWeight: 600,
        }}
      >
        ⚠️ শুধুমাত্র একটি পণ্য বেছে নিন
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {products.map((p, i) => {
          const tc = typeColor(p.type);
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
                background: C.bgMuted,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: tc.bg,
                  border: `1.5px solid ${tc.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: tc.color,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.trade_name}
                </div>
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 1 }}>
                  {p.active_ingredient?.split(" ").slice(0, 4).join(" ")}
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: tc.bg,
                      border: `1px solid ${tc.border}`,
                      color: tc.color,
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {tc.label}
                  </span>
                  <span
                    style={{
                      background: C.bgSuccess,
                      border: `1px solid ${C.borderSuccess}`,
                      color: C.textSuccess,
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 10,
                    }}
                  >
                    PHI:{p.phi_days}d
                  </span>
                  {p.resistance_risk === "high" && (
                    <span
                      style={{
                        background: C.bgDanger,
                        border: `1px solid ${C.borderDanger}`,
                        color: C.textDanger,
                        borderRadius: 10,
                        padding: "1px 7px",
                        fontSize: 10,
                      }}
                    >
                      ⚠️R
                    </span>
                  )}
                  {isBio(p.type) && (
                    <span
                      style={{
                        background: C.bgSuccess,
                        border: `1px solid ${C.borderSuccess}`,
                        color: C.textSuccess,
                        borderRadius: 10,
                        padding: "1px 7px",
                        fontSize: 10,
                      }}
                    >
                      🌿IPM
                    </span>
                  )}
                </div>
              </div>
              <span style={{ color: C.textLight, fontSize: 16, flexShrink: 0 }}>›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Library section ──────────────────────────────────────────────────────────
function FeedbackPanel({ context, summary, userEmail, onEmailChange, visitorStats, visitorId }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  const quickNotes = [
    "খুব কাজে লেগেছে",
    "ভাষা আরও সহজ দরকার",
    "আরও ছবি/ইনফোগ্রাফ চাই",
    "এখানে বাগ আছে",
    "নতুন ফসল যোগ করুন",
  ];
  const payload = buildFeedbackMessage({
    context,
    rating,
    feedback,
    email: userEmail,
    summary,
    visits: visitorStats?.visits,
  });
  const saveFeedback = async () => {
    try {
      const items = JSON.parse(localStorage.getItem("ud-feedback-log") || "[]");
      items.push({ context, rating, feedback, email: userEmail, summary, date: new Date().toISOString() });
      localStorage.setItem("ud-feedback-log", JSON.stringify(items.slice(-50)));
    } catch {}
    try {
      await postJson("/api/feedback", { context, rating, feedback, email: userEmail, summary, visitorId });
    } catch {}
  };
  const handleCopy = async () => {
    await saveFeedback();
    try {
      await navigator.clipboard.writeText(payload);
      setStatus("কপি হয়েছে");
    } catch {
      setStatus("কপি করা যায়নি");
    }
  };
  const mailto = `mailto:?subject=${encodeURIComponent(`Udbhid Goenda feedback - ${context}`)}&body=${encodeURIComponent(payload)}`;
  return (
    <div
      className="ud-editorial-shadow"
      style={{
        marginTop: 16,
        background: `linear-gradient(135deg,${C.bgCard},${C.bgMuted})`,
        border: `1px solid ${C.border}`,
        borderRadius: 28,
        padding: 18,
        boxShadow: C.shadow,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark }}>⭐ রেটিং ও মতামত</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>এই অংশ শেষে আপনার মতামত কপি করুন বা এক ক্লিকে পাঠান.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>
            This browser: {visitorStats?.visits || 1} · Total: {visitorStats?.totalVisits || visitorStats?.visits || 1}
          </span>
          <span style={{ color: C.primary, fontSize: 13 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: `1px solid ${rating >= star ? "#fbbf24" : C.border}`,
                    background: rating >= star ? C.bgWarning : C.bgCard,
                    cursor: "pointer",
                    fontSize: 22,
                  }}
                >
                  {rating >= star ? "★" : "☆"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {quickNotes.map((note) => (
                <button
                  key={note}
                  onClick={() =>
                    setFeedback((prev) => (prev ? `${prev}${prev.includes(note) ? "" : "; " + note}` : note))
                  }
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    border: `1px solid ${C.border}`,
                    background: C.bgMuted,
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  {note}
                </button>
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="কি ভালো লেগেছে, কোথায় সমস্যা, কী নতুন চাই..."
              rows={3}
              style={{
                width: "100%",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "10px 12px",
                resize: "vertical",
                marginBottom: 10,
                fontSize: 13,
              }}
            />
            <input
              name="email"
              autoComplete="email"
              inputMode="email"
              value={userEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="ইমেইল দিন (ব্রাউজার থাকলে নিজে ভরতে পারে)"
              style={{
                width: "100%",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 10,
                fontSize: 13,
              }}
            />
            <div style={{ fontSize: 11, color: C.textLight, marginBottom: 12 }}>
              ব্রাউজার নিরাপত্তার কারণে ইমেইল সরাসরি পড়া যায় না। তবে `autocomplete=email` দেওয়া আছে, তাই সেভ করা ইমেইল
              থাকলে ব্রাউজার নিজে সাজেস্ট/অটোফিল করতে পারবে.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: C.primary,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📋 কপি করুন
              </button>
              <a
                href={mailto}
                onClick={() => {
                  saveFeedback();
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: C.bgSuccess,
                  color: C.primary,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                ✉️ ক্লিকে পাঠান
              </a>
              {status && <div style={{ padding: "10px 0", fontSize: 12, color: C.textMuted }}>{status}</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
// ─── Voice Diagnosis Component ────────────────────────────────────────────
function VoiceDiagnosis({ onResult, activeCrop: _activeCrop }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("আপনার ব্রাউজার ভয়েস সাপোর্ট করে না। Chrome ব্যবহার করুন।");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "bn-BD";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(t);
      setListening(false);
      onResult(t);
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <div
      style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginTop: 10 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🎤</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>ভয়েসে লক্ষণ বলুন</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>বাংলায় বলুন — অটো ট্রান্সলেট হবে</div>
        </div>
      </div>
      <button
        onClick={listening ? stopListening : startListening}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 12,
          border: "none",
          background: listening ? C.danger : `linear-gradient(135deg,${C.primary},${C.primaryLight})`,
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {listening ? "⏹ থামান" : "🎙️ শুনুন"}
      </button>
      {transcript && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: C.bgMuted,
            borderRadius: 10,
            fontSize: 12,
            color: C.text,
            lineHeight: 1.6,
          }}
        >
          {" "}
          "{transcript}"{" "}
        </div>
      )}
    </div>
  );
}

// ─── Confidence Dashboard ──────────────────────────────────────────────
// ─── Sprint 1: Structured Result Dashboard ────────────────────────────────────
// Replaces the old 7-field ConfidenceDashboard with a full clinical result card.

function UrgencyBanner({ urgency, actionRequired, etlExceeded }) {
  const cfg = {
    immediate: {
      bg: "#fef2f2",
      border: "#fca5a5",
      text: "#991b1b",
      icon: "🚨",
      label: "এখনই ব্যবস্থা নিন",
      sub: "তাৎক্ষণিক হস্তক্ষেপ প্রয়োজন",
    },
    within_3_days: {
      bg: "#fff7ed",
      border: "#fdba74",
      text: "#9a3412",
      icon: "⚠️",
      label: "৩ দিনের মধ্যে ব্যবস্থা নিন",
      sub: "দ্রুত সাড়া দিন",
    },
    within_week: {
      bg: "#fefce8",
      border: "#fde047",
      text: "#854d0e",
      icon: "📋",
      label: "এক সপ্তাহের মধ্যে ব্যবস্থা নিন",
      sub: "নজর রাখুন",
    },
    monitor: {
      bg: "#f0fdf4",
      border: "#86efac",
      text: "#14532d",
      icon: "👁️",
      label: "পর্যবেক্ষণ করুন",
      sub: "এখনই ব্যবস্থার দরকার নেই",
    },
  };
  const k = urgency || "monitor";
  const c = cfg[k] || cfg.monitor;
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: c.text }}>{c.label}</div>
        <div style={{ fontSize: 11, color: c.text, opacity: 0.8, marginTop: 1 }}>
          {c.sub}
          {etlExceeded ? " · ETL অতিক্রান্ত" : ""}
          {actionRequired ? "" : " · ETL-এর নিচে"}
        </div>
      </div>
    </div>
  );
}

function DifferentialCandidates({ candidates }) {
  if (!candidates || candidates.length === 0) return null;
  const _causeIcon = (t) => {
    const cl = (t || "").toLowerCase();
    if (cl.includes("fungal")) return "🍄";
    if (cl.includes("bacteria")) return "🦠";
    if (cl.includes("viral") || cl.includes("virus")) return "🔬";
    if (cl.includes("insect")) return "🐛";
    if (cl.includes("mite")) return "🕷️";
    if (cl.includes("nutrient")) return "🌿";
    return "❓";
  };
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.primaryDark }}>ডিফারেনশিয়াল ডায়াগনোসিস</div>
        <span style={{ fontSize: 10, color: C.textLight, marginLeft: "auto" }}>সম্ভাবনার ক্রমানুযায়ী</span>
      </div>
      {candidates.slice(0, 3).map((c2, i) => {
        const pct = Math.min(100, Math.max(0, c2.confidence_pct || 0));
        const barColor = i === 0 ? C.success : i === 1 ? C.warning : C.textLight;
        return (
          <div
            key={i}
            style={{
              marginBottom: i < candidates.length - 1 ? 10 : 0,
              paddingBottom: i < candidates.length - 1 ? 10 : 0,
              borderBottom: i < candidates.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: i === 0 ? C.primary : C.bgMuted,
                  color: i === 0 ? "#fff" : C.textMuted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: i === 0 ? 800 : 600, color: C.text }}>
                    {c2.name_bn || c2.name_en}
                  </span>
                  {c2.name_en && c2.name_bn && (
                    <span style={{ fontSize: 10, color: C.textMuted, fontStyle: "italic" }}>{c2.name_en}</span>
                  )}
                  {c2.scientific_name && c2.scientific_name !== "N/A" && (
                    <span style={{ fontSize: 9, color: C.textLight, fontStyle: "italic" }}>{c2.scientific_name}</span>
                  )}
                </div>
                {c2.key_feature && (
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                    {c2.key_feature}
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: barColor }}>{pct}%</div>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: C.bgMuted, overflow: "hidden", marginLeft: 30 }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: barColor,
                  borderRadius: 3,
                  transition: "width .6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExclusionGatesPanel({ gateResults }) {
  if (!gateResults) return null;
  const gates = [
    { key: "a_insects", reasonKey: "a_reason", label: "গেট A", sub: "পোকা/মাইট", icon: "🐛" },
    { key: "b_virus", reasonKey: "b_reason", label: "গেট B", sub: "ভাইরাস", icon: "🔬" },
    { key: "c_bacteria", reasonKey: "c_reason", label: "গেট C", sub: "ব্যাকটেরিয়া", icon: "🦠" },
    { key: "d_fungi", reasonKey: "d_reason", label: "গেট D", sub: "ছত্রাক", icon: "🍄" },
  ];
  const statusCfg = {
    excluded: { icon: "✅", color: "#14532d", bg: "#f0fdf4", border: "#86efac", label: "বাদ" },
    confirmed: { icon: "🎯", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", label: "নিশ্চিত" },
    retained: { icon: "⚠️", color: "#92400e", bg: "#fffbeb", border: "#fcd34d", label: "সন্দেহভাজন" },
    uncertain: { icon: "❓", color: "#5f6672", bg: "#f9fafb", border: "#e2e5ea", label: "অনিশ্চিত" },
  };
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🔍</span>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.primaryDark }}>CABI বর্জন গেট</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {gates.map((g) => {
          const status = gateResults[g.key] || "uncertain";
          const sc = statusCfg[status] || statusCfg.uncertain;
          const reason = gateResults[g.reasonKey] || "";
          return (
            <div
              key={g.key}
              style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 10, padding: "8px 10px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: reason ? 4 : 0 }}>
                <span style={{ fontSize: 14 }}>{g.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: sc.color }}>
                    {g.label} — {g.sub}
                  </div>
                  <div style={{ fontSize: 10, color: sc.color, opacity: 0.85 }}>
                    {sc.icon} {sc.label}
                  </div>
                </div>
              </div>
              {reason && (
                <div style={{ fontSize: 9, color: sc.color, opacity: 0.75, lineHeight: 1.4, marginTop: 2 }}>
                  {reason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiseaseTrianglePanel({ triangle }) {
  if (!triangle) return null;
  const bars = [
    {
      label: "পোষক (Host)",
      score: triangle.host_score,
      note: triangle.host_note,
      color: "#7c3aed",
      bg: "#faf5ff",
      icon: "🌱",
    },
    {
      label: "জীবাণু (Pathogen)",
      score: triangle.pathogen_score,
      note: triangle.pathogen_note,
      color: "#dc2626",
      bg: "#fef2f2",
      icon: "🦠",
    },
    {
      label: "পরিবেশ (Environment)",
      score: triangle.environment_score,
      note: triangle.environment_note,
      color: "#2563eb",
      bg: "#eff6ff",
      icon: "🌤️",
    },
  ];
  const overall =
    triangle.overall_risk ||
    (((triangle.host_score || 5) + (triangle.pathogen_score || 5) + (triangle.environment_score || 5)) / 3 >= 7
      ? "high"
      : ((triangle.host_score || 5) + (triangle.pathogen_score || 5) + (triangle.environment_score || 5)) / 3 >= 4
        ? "medium"
        : "low");
  const riskCfg = {
    high: { label: "উচ্চ ঝুঁকি", color: "#991b1b", bg: "#fef2f2" },
    medium: { label: "মাঝারি ঝুঁকি", color: "#92400e", bg: "#fffbeb" },
    low: { label: "কম ঝুঁকি", color: "#14532d", bg: "#f0fdf4" },
  };
  const rc = riskCfg[overall] || riskCfg.medium;
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🔺</span>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.primaryDark }}>রোগ ত্রিভুজ মূল্যায়ন</div>
        <span
          style={{
            marginLeft: "auto",
            padding: "2px 10px",
            borderRadius: 999,
            background: rc.bg,
            color: rc.color,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {rc.label}
        </span>
      </div>
      {bars.map((b, i) => {
        const pct = Math.min(100, Math.max(0, (b.score || 5) * 10));
        return (
          <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>{b.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{b.label}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>{b.score || "?"}/10</span>
            </div>
            <div
              style={{
                height: 7,
                borderRadius: 4,
                background: C.bgMuted,
                overflow: "hidden",
                marginBottom: b.note ? 3 : 0,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: b.color,
                  borderRadius: 4,
                  transition: "width .6s ease",
                }}
              />
            </div>
            {b.note && <div style={{ fontSize: 9.5, color: C.textMuted, lineHeight: 1.4 }}>{b.note}</div>}
          </div>
        );
      })}
    </div>
  );
}

function IPMRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;
  const typeCfg = {
    cultural: { icon: "🌾", label: "কৃষি ব্যবস্থাপনা", color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7" },
    biological: { icon: "🌿", label: "জৈবিক নিয়ন্ত্রণ", color: "#1e40af", bg: "#eff6ff", border: "#93c5fd" },
    chemical: { icon: "⚗️", label: "রাসায়নিক (শেষ উপায়)", color: "#92400e", bg: "#fffbeb", border: "#fcd34d" },
    monitoring: { icon: "👁️", label: "পর্যবেক্ষণ", color: "#5f6672", bg: "#f9fafb", border: "#e2e5ea" },
  };
  const priorityOrder = ["cultural", "biological", "monitoring", "chemical"];
  const sorted = [...recommendations].sort((a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type));
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🛡️</span>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.primaryDark }}>সমন্বিত বালাই ব্যবস্থাপনা (IPM)</div>
      </div>
      {sorted.map((r, i) => {
        const tc = typeCfg[r.type] || typeCfg.monitoring;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "8px 0",
              borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : "none",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: tc.bg,
                border: `1px solid ${tc.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {tc.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 999,
                    background: tc.bg,
                    border: `1px solid ${tc.border}`,
                    color: tc.color,
                  }}
                >
                  {tc.label}
                </span>
                {r.timing && <span style={{ fontSize: 9, color: C.textLight }}>⏱ {r.timing}</span>}
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{r.action_bn}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChemicalOptions({ chemicals }) {
  if (!chemicals || chemicals.length === 0) return null;
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.borderWarning}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 16 }}>⚗️</span>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#92400e" }}>রাসায়নিক বিকল্প</div>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 9,
            color: "#92400e",
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            padding: "2px 8px",
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          শেষ উপায় — FRAC রোটেশন মানুন
        </span>
      </div>
      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, lineHeight: 1.4 }}>
        ⚠️ একই FRAC গ্রুপ পরপর ব্যবহার করবেন না — প্রতিরোধ ক্ষমতা তৈরি হয়।
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {chemicals.map((ch, i) => (
          <div
            key={i}
            style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "8px 10px" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{ch.name_bn || ch.name}</div>
                {ch.trade_name && <div style={{ fontSize: 10, color: C.textMuted }}>ব্র্যান্ড: {ch.trade_name}</div>}
                {ch.dose && <div style={{ fontSize: 10, color: C.textMuted }}>মাত্রা: {ch.dose}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {ch.frac_irac_group && (
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 999,
                      background: "#fef3c7",
                      border: "1px solid #fcd34d",
                      color: "#92400e",
                      marginBottom: 2,
                    }}
                  >
                    {ch.frac_irac_group}
                  </div>
                )}
                {ch.phi_days > 0 && (
                  <div style={{ fontSize: 9, color: "#991b1b", fontWeight: 600 }}>PHI: {ch.phi_days} দিন</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldConfirmation({ confirmation }) {
  if (!confirmation || !confirmation.steps_bn || confirmation.steps_bn.length === 0) return null;
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        boxShadow: C.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>🔎</span>
        <div style={{ fontWeight: 800, fontSize: 13, color: C.primaryDark }}>মাঠে নিশ্চিতকরণ পদ্ধতি</div>
      </div>
      {confirmation.test_bn && (
        <div
          style={{
            fontSize: 11,
            color: C.text,
            fontWeight: 600,
            marginBottom: 6,
            background: C.bgMuted,
            padding: "6px 10px",
            borderRadius: 8,
          }}
        >
          {confirmation.test_bn}
        </div>
      )}
      {confirmation.steps_bn.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", alignItems: "flex-start" }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: C.primary,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            {i + 1}
          </div>
          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5, flex: 1 }}>{step}</div>
        </div>
      ))}
    </div>
  );
}

function DiagnosisResultDashboard({ structuredResult, cropKey, weather, symptomMatches }) {
  const [expanded, setExpanded] = useState(false);
  if (!structuredResult) return null;
  const month = new Date().getMonth() + 1;
  let ensembleData = null;
  if (cropKey && symptomMatches && symptomMatches.length > 0) {
    try {
      ensembleData = computeEnsembleScore(cropKey, symptomMatches, weather, month);
    } catch {}
  }

  // Backward compat: if old 7-field schema, build minimal display
  const hasRichData = !!(
    structuredResult.gate_results ||
    structuredResult.top_candidates ||
    structuredResult.ipm_recommendations
  );

  // Primary candidate confidence (rich or legacy)
  const confPct =
    structuredResult.confidence_pct ||
    (structuredResult.confidence === "high" ? 85 : structuredResult.confidence === "medium" ? 55 : 25);
  const confColor = confPct >= 70 ? C.success : confPct >= 40 ? C.warning : C.danger;

  // Build legacy top_candidates from old schema if needed
  const candidates = structuredResult.top_candidates || [
    {
      rank: 1,
      name_bn: structuredResult.disease_name_bn || "অজানা",
      name_en: structuredResult.disease_name || "Unknown",
      scientific_name: "",
      confidence_pct: confPct,
      key_feature: "",
    },
  ];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Urgency banner */}
      <UrgencyBanner
        urgency={structuredResult.urgency}
        actionRequired={structuredResult.action_required}
        etlExceeded={structuredResult.etl_exceeded}
      />

      {/* Differential diagnosis */}
      <DifferentialCandidates candidates={candidates} />

      {/* Expandable detail panels */}
      {hasRichData && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              width: "100%",
              background: C.bgMuted,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span>🔬 বিস্তারিত বিশ্লেষণ (CABI গেট · রোগ ত্রিভুজ · IPM)</span>
            <span
              style={{ fontSize: 14, transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "none" }}
            >
              ⌄
            </span>
          </button>

          {expanded && (
            <div style={{ animation: "slideUp .25s ease" }}>
              <ExclusionGatesPanel gateResults={structuredResult.gate_results} />
              <DiseaseTrianglePanel triangle={structuredResult.disease_triangle} />
              <IPMRecommendations recommendations={structuredResult.ipm_recommendations} />
              <ChemicalOptions chemicals={structuredResult.chemical_options} />
              <FieldConfirmation confirmation={structuredResult.field_confirmation} />

              {/* Ensemble scores from agronomic engine */}
              {ensembleData && ensembleData.length > 0 && (
                <div
                  style={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    boxShadow: C.shadow,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                    🔢 এনসেম্বল স্কোর (লক্ষণ + মৌসুম + আবহাওয়া)
                  </div>
                  {ensembleData.slice(0, 3).map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "5px 0",
                        borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <div style={{ flex: 1, fontSize: 11, color: C.text, fontWeight: 600 }}>
                        {d.disease.nameBn || d.disease.name}
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: C.bgSuccess,
                            color: C.textSuccess,
                          }}
                        >
                          {Math.round(d.symptomScore * 100)}%
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: C.bgInfo,
                            color: C.textInfo,
                          }}
                        >
                          {Math.round(d.seasonScore * 100)}%
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: C.bgWarning,
                            color: C.textWarning,
                          }}
                        >
                          {Math.round(d.weatherScore * 100)}%
                        </span>
                      </div>
                      <div
                        style={{ minWidth: 36, fontSize: 12, fontWeight: 800, color: confColor, textAlign: "right" }}
                      >
                        {Math.round(d.combinedScore * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Prevention + DAE consult */}
              {(structuredResult.prevention_bn || structuredResult.dae_consult_bn) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {structuredResult.prevention_bn && (
                    <div
                      style={{
                        background: C.bgSuccess,
                        border: `1px solid ${C.borderSuccess}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 11, color: C.textSuccess, marginBottom: 4 }}>
                        🛡️ প্রতিরোধ
                      </div>
                      <div style={{ fontSize: 10, color: C.textSuccess, lineHeight: 1.5 }}>
                        {structuredResult.prevention_bn}
                      </div>
                    </div>
                  )}
                  {structuredResult.dae_consult_bn && (
                    <div
                      style={{
                        background: C.bgInfo,
                        border: `1px solid ${C.borderInfo}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 11, color: C.textInfo, marginBottom: 4 }}>
                        📞 DAE পরামর্শ
                      </div>
                      <div style={{ fontSize: 10, color: C.textInfo, lineHeight: 1.5 }}>
                        {structuredResult.dae_consult_bn}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Legacy fallback: simple confidence bar if no rich data */}
      {!hasRichData && (
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 14,
            marginBottom: 10,
            boxShadow: C.shadow,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>নিশ্চয়তা</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: confColor }}>{confPct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: C.bgMuted, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${confPct}%`,
                background: confColor,
                borderRadius: 4,
                transition: "width .5s ease",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Keep backward-compat alias used in some places
function ConfidenceDashboard(props) {
  return <DiagnosisResultDashboard {...props} />;
}

// ─── AI Copilot for Extension Officers ────────────────────────────────────
function AICopilotTab({ crop, district, weather, locationName: _locationName, signedFetch }) {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    { label: "রোগ প্রতিরোধী জাত", q: "বাংলাদেশের কোন জাতগুলো এই রোগের বিরুদ্ধে প্রতিরোধী?" },
    { label: "FRAC/IRAC রোটেশন", q: "এই রোগের জন্য কীভাবে কীটনাশক/ছত্রাকনাশক রোটেশন করব? FRAC/IRAC গ্রুপ বলুন।" },
    { label: "DAE রিপোর্ট", q: "এই রোগের জন্য DAE-তে রিপোর্ট লেখার ফরম্যাট দিন।" },
    { label: "ফসল ক্যালেন্ডার", q: "এই ফসলের মৌসুম ক্যালেন্ডার ও ঝুঁকি সময় কখন?" },
    { label: "IPM পিরামিড", q: "এই রোগের জন্য IPM পিরামিড বিস্তারিত বলুন।" },
    { label: "ETL মাত্রা", q: "এই পোকার Economic Threshold Level কত? কখন ব্যবস্থা নেব?" },
  ];

  const askCopilot = async (question) => {
    if (!question.trim()) return;
    const userMsg = { role: "user", text: question };
    setConversation((prev) => [...prev, userMsg]);
    setLoading(true);
    setQuery("");
    try {
      const systemPrompt = `You are an AI Copilot for Bangladesh DAE extension officers. Provide expert agronomic advice in simple Bangla with English technical terms in brackets. Be specific to Bangladesh conditions, reference BRRI/BARI/DAE recommendations. Keep responses practical and actionable. Crop context: ${crop || "N/A"}, District: ${district || "N/A"}, Weather: ${weather ? `${weather.temp}°C, ${weather.humidity}% humidity` : "N/A"}.`;
      const res = await signedFetch("/api/diagnose", {
        method: "POST",
        body: JSON.stringify({ systemPrompt, messages: [{ role: "user", content: question }] }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("\n") || "উত্তর পাওয়া যায়নি।";
      setConversation((prev) => [...prev, { role: "assistant", text, provider: data.provider }]);
    } catch (e) {
      setConversation((prev) => [...prev, { role: "assistant", text: "ত্রুটি হয়েছে: " + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn .3s ease" }}>
      <div
        style={{
          background: `linear-gradient(135deg,${C.primaryXDark},${C.primary})`,
          borderRadius: 18,
          padding: 16,
          color: "#fff",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>🤖 AI কোপাইলট</div>
        <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
          DAE কর্মকর্তাদের জন্য — রোগ নির্ণয়, IPM, FRAC/IRAC, জাত নির্বাচন ও রিপোর্টিং সহায়তা।
        </div>
      </div>
      {/* Quick prompts */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {quickPrompts.map((p) => (
          <button
            key={p.label}
            onClick={() => askCopilot(p.q)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: `1px solid ${C.border}`,
              background: C.bgCard,
              cursor: "pointer",
              fontSize: 11,
              color: C.text,
              fontWeight: 600,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Conversation */}
      <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {conversation.map((msg, i) => (
          <div
            key={i}
            style={{
              background: msg.role === "user" ? C.bgMuted : C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.7,
              color: C.text,
            }}
          >
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>
              {msg.role === "user" ? "👤 আপনি" : "🤖 কোপাইলট"}{" "}
              {msg.provider && <span style={{ fontSize: 9, color: C.textLight }}> · {msg.provider}</span>}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ padding: 12, textAlign: "center", color: C.textMuted, fontSize: 12 }}>⏳ কোপাইলট ভাবছে...</div>
        )}
      </div>
      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askCopilot(query)}
          placeholder="প্রশ্ন করুন... (Enter পাঠান)"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={() => askCopilot(query)}
          disabled={loading || !query.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            background: query.trim() ? C.primary : C.border,
            color: "#fff",
            fontWeight: 700,
            cursor: query.trim() ? "pointer" : "not-allowed",
            fontSize: 13,
          }}
        >
          পাঠান
        </button>
      </div>
    </div>
  );
}

function _HomeTab({ setActiveTab, history, weather, locationName }) {
  const highlights = [
    {
      icon: "🧠",
      title: "ছবি দেখে রোগ ধরা",
      desc: "গ্যালারি বা ক্যামেরা থেকে ছবি দিন, তারপর সহজ ভাষায় রিপোর্ট পান.",
      action: "নির্ণয়ে যান",
      tab: "diagnose",
    },
    {
      icon: "📚",
      title: "তথ্যভাণ্ডার",
      desc: "স্লাইড, পড়ার PDF, আর অডিও পডকাস্ট এক জায়গায়.",
      action: "তথ্যভাণ্ডার খুলুন",
      tab: "library",
    },
    {
      icon: "🌐",
      title: "আমাদের আরও অ্যাপ",
      desc: "Krishi AI, GAP Brinjal, GreenLoop সহ অন্য টুলগুলো দেখুন.",
      action: "অ্যাপস দেখুন",
      tab: "apps",
    },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn .3s ease" }}>
      <div
        style={{
          background: `linear-gradient(135deg,${C.primaryXDark},${C.primary},${C.primaryLight})`,
          borderRadius: 20,
          padding: "16px 12px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: -24, top: -12, fontSize: 110, opacity: 0.1 }}>🌿</div>
        <div style={{ maxWidth: 720, position: "relative" }}>
          <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1.15, marginBottom: 8 }}>উদ্ভিদ গোয়েন্দা</div>
          <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.92, marginBottom: 14 }}>
            কৃষকের জন্য সহজ রোগ-পোকা সহায়তা। ছবি, অবস্থান, মৌসুম আর মাঠের লক্ষণ মিলিয়ে রিপোর্ট দেখুন.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("diagnose")}
              style={{
                background: C.bgCard,
                color: C.primaryDark,
                border: "none",
                borderRadius: 14,
                padding: "10px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🔬 এখনই নির্ণয়
            </button>
            <button
              onClick={() => setActiveTab("library")}
              style={{
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 14,
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              📚 শেখার ঘর
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
        {highlights.map((card) => (
          <button
            key={card.title}
            onClick={() => setActiveTab(card.tab)}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: 18,
              textAlign: "left",
              cursor: "pointer",
              boxShadow: C.shadowMd,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark, marginBottom: 6 }}>{card.title}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.65, marginBottom: 12 }}>{card.desc}</div>
            <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{card.action} →</div>
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: C.shadow,
          }}
        >
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>📍 আপনার এলাকা</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
            {locationName || "অবস্থান সংগ্রহ হচ্ছে..."}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>জেলা স্বয়ংক্রিয়ভাবে ভরার চেষ্টা করা হয়.</div>
        </div>
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: C.shadow,
          }}
        >
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>🗓️ বর্তমান মৌসুম</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{getCurrentSeason().split("/")[0].trim()}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
            তারিখ অনুযায়ী Detection tab-এ আগেই বসে যাবে.
          </div>
        </div>
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: C.shadow,
          }}
        >
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>🌦️ আজকের ঝুঁকি</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
            {weather ? assessWeatherRisks(weather)[0]?.text : "আবহাওয়া আনা হচ্ছে..."}
          </div>
        </div>
      </div>
      {history.length > 0 && (
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: C.shadow,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark, marginBottom: 10 }}>
            🕘 সাম্প্রতিক রিপোর্ট
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
            {[...history]
              .reverse()
              .slice(0, 4)
              .map((item, index) => (
                <div
                  key={index}
                  style={{ background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 14, padding: 12 }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>
                    {item.crop?.split("/")[0]?.trim() || "ফসল"}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>
                    {item.district?.split("/")[0]?.trim() || "জেলা নেই"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: C.textLight }}>{item.date}</span>
                    {item.vitPrediction && (
                      <span
                        title={`ছবি বিশ্লেষণ: ${item.vitPrediction.diseaseBn || item.vitPrediction.disease || ""}`}
                        style={{
                          background: C.bgInfo,
                          borderColor: C.borderInfo,
                          borderRadius: 999,
                          padding: "1px 7px",
                          fontSize: 9,
                          fontWeight: 700,
                          color: C.blue,
                        }}
                      >
                        🛰️
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
function EnhancedHomeTab({ setActiveTab, history, weather, locationName, coords }) {
  const { speak, stop, speaking, isSupported } = useTTS();
  const risk = weather ? assessWeatherRisks(weather)[0] : null;
  const season = getCurrentSeason();

  const hubCards = [
    {
      icon: "📅",
      title: "ফসল ক্যালেন্ডার",
      desc: "আবহাওয়া ও মূল্য",
      color: "#f59e0b",
      bg: C.bgWarning,
      tab: "calendar",
    },
    { icon: "📖", title: "CABI গাইড+গেম", desc: "শিখুন ও অনুশীলন", color: "#7c3aed", bg: C.bgPurple, tab: "learn" },
    {
      icon: "🔍",
      title: "ছবি দিয়ে নির্ণয়",
      desc: "রোগ চিহ্নিত করুন",
      color: "#f42a41",
      bg: C.bgDanger,
      tab: "diagnose",
    },
    { icon: "📚", title: "তথ্যভান্ডার", desc: "ভিডিও ও পড়ার উপকরণ", color: "#006a4e", bg: C.bgSuccess, tab: "library" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn .3s ease", paddingBottom: 8 }}>
      {/* ── Stakeholder Persona Hero Section (Farmers, Extension Providers, Input Sellers) ── */}
      <HeroStakeholderSection
        setActiveTab={setActiveTab}
        C={C}
        tts={{ speak, stop, speaking, isSupported }}
      />

      {/* ── Local Conditions / Weather Card ──────────────────────── */}
      <div
        style={{
          background: C.bgCard,
          borderRadius: 18,
          padding: "18px 16px",
          boxShadow: C.shadow,
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
            🌦️ স্থানীয় অবস্থা
          </div>
          <div style={{ fontSize: 12, color: C.textLight, fontWeight: 500 }}>
            {locationName || "অবস্থান নির্ণয় হচ্ছে..."}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.bgInfo}, ${C.bgBlue})`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>
              {weather ? weather.temp + "°" : "--"}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>তাপমাত্রা</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.bgSuccess}, ${C.bgMuted})`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
              {weather ? weather.humidity + "%" : "--"}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>আর্দ্রতা</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "12px 8px",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.bgWarning}, ${C.bgMuted})`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706", lineHeight: 1 }}>
              {weather ? weather.rain24h + "mm" : "--"}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>বৃষ্টি</div>
          </div>
        </div>
        {risk && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 12,
              background: risk.level === "high" ? C.bgDanger : risk.level === "medium" ? C.bgWarning : C.bgSuccess,
              border: `1px solid ${risk.level === "high" ? C.borderDanger : risk.level === "medium" ? C.borderWarning : C.borderSuccess}`,
              fontSize: 12,
              fontWeight: 600,
              color: risk.level === "high" ? C.danger : risk.level === "medium" ? C.warning : C.success,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {risk.icon} {risk.text}
          </div>
        )}
        <div
          style={{ marginTop: 12, fontSize: 12, color: C.textLight, display: "flex", justifyContent: "space-between" }}
        >
          <span>🗓️ {season.split("/")[0].trim()}</span>
        </div>
      </div>

      {/* ── Today's Decision Summary ─────────────────────────────── */}
      <WeatherDecisionSummary C={C} coords={coords} history={history} onOpenDetail={() => setActiveTab("today")} />

      {/* ── Knowledge Hub ────────────────────────────────────────── */}
      <div>
        <div
          className="ud-headline"
          style={{ fontWeight: 800, fontSize: 17, color: C.text, marginBottom: 12, paddingLeft: 2 }}
        >
          📚 জ্ঞান কেন্দ্র
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {hubCards.map((card, i) => (
            <button
              key={card.tab}
              onClick={() => setActiveTab(card.tab)}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 18,
                padding: "18px 14px",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: C.shadow,
                animation: `popIn .4s ease ${i * 0.06}s both`,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
                transition: "box-shadow .2s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  border: `1.5px solid ${card.color}18`,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div
                  className="ud-headline"
                  style={{ fontWeight: 800, fontSize: 14.5, color: C.text, lineHeight: 1.3 }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 3, lineHeight: 1.4 }}>{card.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Learning Path ────────────────────────────────────────── */}
      <div
        style={{
          background: C.bgCard,
          borderRadius: 18,
          padding: "18px 16px",
          boxShadow: C.shadow,
          border: `1px solid ${C.border}`,
        }}
      >
        <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 14 }}>
          🎯 শেখার পথ
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 28,
              bottom: 28,
              width: 2.5,
              background: `linear-gradient(to bottom, ${C.primary}, ${C.primaryLight}, ${C.accent})`,
              borderRadius: 4,
            }}
          />
          {[
            {
              step: "১",
              icon: "👁️",
              title: "পর্যবেক্ষণ",
              desc: "লক্ষণ ও লক্ষণ চিনুন",
              color: "#2563eb",
              bg: C.bgInfo,
              tab: "learn",
            },
            {
              step: "২",
              icon: "🔬",
              title: "বর্জন পদ্ধতি",
              desc: "কারণ সংকুচিত করুন",
              color: "#7c3aed",
              bg: C.bgPurple,
              tab: "learn",
            },
            {
              step: "৩",
              icon: "🔺",
              title: "রোগ ত্রিভুজ",
              desc: "রোগের শর্ত বুঝুন",
              color: "#d97706",
              bg: C.bgWarning,
              tab: "learn",
            },
            {
              step: "৪",
              icon: "🧪",
              title: "নিশ্চিতকরণ",
              desc: "মাঠে যাচাই করুন",
              color: "#16a34a",
              bg: C.bgSuccess,
              tab: "learn",
            },
            {
              step: "৫",
              icon: "🌿",
              title: "IPM সিদ্ধান্ত",
              desc: "ব্যবস্থাপনা পরিকল্পনা",
              color: "#0891b2",
              bg: C.bgTeal,
              tab: "library",
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.tab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 12px",
                border: "none",
                background: i % 2 === 0 ? C.bgCard : C.bgMuted,
                cursor: "pointer",
                borderRadius: 14,
                width: "100%",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: item.bg,
                  border: `2px solid ${item.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>{item.title}</div>
                <div style={{ fontSize: 11.5, color: C.textMuted }}>{item.desc}</div>
              </div>
              <span style={{ fontSize: 14, color: C.textLight }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ──────────────────────────────────────── */}
      {history.length > 0 && (
        <div
          style={{
            background: C.bgCard,
            borderRadius: 18,
            padding: "18px 16px",
            boxShadow: C.shadow,
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
              🕐 সাম্প্রতিক কার্যক্রম
            </div>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                background: "none",
                border: "none",
                color: C.primary,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              সব দেখুন →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...history]
              .reverse()
              .slice(0, 3)
              .map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderRadius: 14,
                    background: C.bgMuted,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.primary}18, ${C.primaryLight}18)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    🌿
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="ud-headline"
                      style={{ fontWeight: 700, fontSize: 13.5, color: C.text, marginBottom: 2 }}
                    >
                      {item.crop?.split("/")[0]?.trim() || "ফসল"}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>
                      {item.district?.split("/")[0]?.trim() || "জেলা নেই"} · {item.date}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: C.textLight }}>›</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppsHub() {
  const { speak: _speak, stop: _stop, speaking: _appsSpeaking, isSupported: _appsTts } = useTTS();
  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* YouTube Channel Section */}
      <div
        style={{
          background: linearGradient("#1a1a2e", "#16213e"),
          borderRadius: 18,
          padding: 20,
          marginBottom: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            background: "radial-gradient(circle,rgba(255,0,0,0.15) 0%,transparent 70%)",
            borderRadius: "0 0 0 100%",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg,#ff0000,#cc0000)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: "0 4px 12px rgba(255,0,0,0.3)",
              flexShrink: 0,
            }}
          >
            ▶
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 2 }}>🎬 AgriWisdom BD</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>YouTube চ্যানেল — কৃষি শেখার ভিডিও</div>
          </div>
          <a
            href="https://www.youtube.com/@AgriWisdomBd"
            target="_blank"
            rel="noreferrer"
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 10,
              padding: "8px 14px",
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ↗ চ্যানেল খুলুন
          </a>
        </div>
        {/* Plant Detective Playlist — future playlist embed area */}
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: 4, overflow: "hidden" }}>
          <iframe
            style={{ width: "100%", height: 240, border: "none", borderRadius: 12 }}
            src="https://www.youtube.com/embed?listType=user_uploads&list=AgriWisdomBd"
            title="AgriWisdom BD ভিডিও"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: 14 }}>📹</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", flex: 1 }}>
            শীঘ্রই <strong style={{ color: "#fff" }}>Plant Detective</strong> প্লেইলিস্ট আসছে — রোগ নির্ণয়ের ধাপে ধাপে
            ভিডিও গাইড!
          </span>
        </div>
      </div>

      {/* Quick Info Cards with Bangladesh Theme (Green, Red, Yellow, White) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ background: C.bgSuccess, border: `1px solid ${C.borderSuccess}`, borderRadius: 14, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🔬</div>
          <div style={{ fontWeight: 800, fontSize: 12, color: C.primary }}>CABI প্রোটোকল</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>৫-ধাপ রোগ নির্ণয়</div>
        </div>
        <div style={{ background: C.bgWarning, border: `1px solid ${C.borderWarning}`, borderRadius: 14, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🎮</div>
          <div style={{ fontWeight: 800, fontSize: 12, color: "#b45309" }}>গেম হাব</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>৫টি ইন্টারেক্টিভ গেম</div>
        </div>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🧪</div>
          <div style={{ fontWeight: 800, fontSize: 12, color: C.danger }}>বালাইনাশক গাইড</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Pesticide ক্যাটালগ</div>
        </div>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📚</div>
          <div style={{ fontWeight: 800, fontSize: 12, color: C.primaryDark }}>তথ্য ভান্ডার</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>ভিডিও, পিডিএফ, অডিও</div>
        </div>
      </div>

      {/* Apps Section */}
      <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 10 }}>🌐 আমাদের অন্য অ্যাপ</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {OTHER_APPS.map((app) => (
          <a
            key={app.url}
            href={app.url}
            target="_blank"
            rel="noreferrer"
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 16,
              textDecoration: "none",
              boxShadow: C.shadow,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: C.bgMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {app.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.primaryDark, marginBottom: 2 }}>{app.name}</div>
              <div
                style={{
                  fontSize: 11,
                  color: C.textMuted,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {app.desc}
              </div>
            </div>
            <span style={{ flexShrink: 0, fontSize: 16, color: C.primary }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
function linearGradient(a, b) {
  return `linear-gradient(135deg,${a},${b})`;
}
function MediaFrame({ title, src, height = 520 }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 24,
        padding: 12,
        boxShadow: C.shadow,
      }}
    >
      <div className="ud-headline" style={{ fontWeight: 800, fontSize: 14, color: C.primaryDark, marginBottom: 10 }}>
        {title}
      </div>
      <iframe
        src={src}
        title={title}
        style={{ width: "100%", height, border: "none", borderRadius: 18, background: "#f8fafc" }}
        allow="autoplay"
      />
    </div>
  );
}
function AudioPodcastCard({ title, id }) {
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
      await audio.play();
      setPlaying(true);
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
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
  };
  const progress = duration ? `${(currentTime / duration) * 100}%` : "0%";
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 16,
        boxShadow: C.shadow,
      }}
    >
      <audio ref={audioRef} preload="metadata" src={toDriveDownloadUrl(id)} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: C.bgTeal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          🎙️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark }}>{title}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Google Drive podcast</div>
        </div>
        <button
          onClick={toggle}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: "none",
            background: C.primary,
            color: "#fff",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          {playing ? "⏸" : "▶"}
        </button>
      </div>
      <div
        onClick={seek}
        style={{
          height: 10,
          background: "#e5efe5",
          borderRadius: 999,
          cursor: "pointer",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: progress,
            height: "100%",
            background: `linear-gradient(90deg,${C.primary},${C.primaryLight})`,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          color: C.textMuted,
          marginBottom: 12,
        }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => skip(-10)}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.bgCard,
            cursor: "pointer",
          }}
        >
          ⏪ 10s
        </button>
        <button
          onClick={() => skip(10)}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.bgCard,
            cursor: "pointer",
          }}
        >
          10s ⏩
        </button>
        <a
          href={toDriveViewUrl(id)}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.bgSuccess,
            cursor: "pointer",
            textDecoration: "none",
            color: C.primary,
            fontWeight: 700,
          }}
        >
          Drive লিংক
        </a>
      </div>
    </div>
  );
}
/* eslint-disable react-hooks/rules-of-hooks */
function _LibrarySection() {
  const [section, setSection] = useState("slides");
  const [currentSlide, setCurrentSlide] = useState(0);
  const sections = [
    { id: "slides", label: "স্লাইড ডেক", icon: "🖼️" },
    { id: "read", label: "পড়ার ডকুমেন্ট", icon: "📖" },
    { id: "audio", label: "অডিও পডকাস্ট", icon: "🎙️" },
  ];
  const slide = LIBRARY_MEDIA.slides[currentSlide];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "#f8fafc", border: `1px dashed ${C.border}`, borderRadius: 18, padding: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark, marginBottom: 4 }}>🎬 ভিডিও সেকশন</div>
        <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.7 }}>
          তথ্যভাণ্ডারে ভিডিও গাইড ট্যাবে ভিডিও দেখুন.
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: `1px solid ${section === item.id ? C.primary : C.border}`,
              background: section === item.id ? C.primary : C.bgCard,
              color: section === item.id ? "#fff" : C.text,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      {section === "slides" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LIBRARY_MEDIA.slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentSlide(index)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: `1px solid ${currentSlide === index ? C.primary : C.border}`,
                  background: currentSlide === index ? C.bgSuccess : C.bgCard,
                  color: currentSlide === index ? C.primaryDark : C.text,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                📄 {index + 1}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
              style={{
                padding: "9px 14px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                cursor: "pointer",
              }}
            >
              ← আগেরটি
            </button>
            <a
              href={toDriveViewUrl(slide.id)}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "9px 14px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.bgSuccess,
                textDecoration: "none",
                color: C.primary,
                fontWeight: 700,
              }}
            >
              Drive এ খুলুন
            </a>
            <button
              onClick={() => setCurrentSlide((s) => Math.min(LIBRARY_MEDIA.slides.length - 1, s + 1))}
              disabled={currentSlide === LIBRARY_MEDIA.slides.length - 1}
              style={{
                padding: "9px 14px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                cursor: "pointer",
              }}
            >
              পরেরটি →
            </button>
          </div>
          <MediaFrame title={slide.title} src={toDrivePreviewUrl(slide.id)} height={620} />
        </div>
      )}
      {section === "read" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
          {LIBRARY_MEDIA.readings.map((item) => (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MediaFrame title={item.title} src={toDrivePreviewUrl(item.id)} height={560} />
              <a
                href={toDriveViewUrl(item.id)}
                target="_blank"
                rel="noreferrer"
                style={{
                  alignSelf: "flex-start",
                  padding: "9px 14px",
                  borderRadius: 12,
                  background: C.bgSuccess,
                  border: `1px solid ${C.border}`,
                  textDecoration: "none",
                  color: C.primary,
                  fontWeight: 700,
                }}
              >
                পূর্ণ স্ক্রিনে পড়ুন
              </a>
            </div>
          ))}
        </div>
      )}
      {section === "audio" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {LIBRARY_MEDIA.audio.map((item) => (
            <AudioPodcastCard key={item.id} title={item.title} id={item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
function VideoGalleryCard({ video, onPlay }) {
  return (
    <div
      onClick={() => onPlay(video)}
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "14px 16px",
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: C.shadow,
      }}
      className="video-card"
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(135deg," + C.primaryLight + "," + C.primary + ")",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {video.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: C.text,
            lineHeight: 1.3,
            marginBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {video.title}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: C.textMuted,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {video.desc}
        </div>
        <div style={{ fontSize: 10, color: C.textLight, marginTop: 3 }}>📦 {video.size}</div>
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 50,
          background: "linear-gradient(135deg," + C.accent + "," + C.accentDark + ")",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
        }}
      >
        <span style={{ color: "#fff", fontSize: 14, marginLeft: 2 }}>▶</span>
      </div>
    </div>
  );
}
function EnhancedLibrarySection() {
  const [section, setSection] = useState("video");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeVideoCategory, setActiveVideoCategory] = useState("intro");
  const [playingVideo, setPlayingVideo] = useState(null);
  const sections = [
    { id: "video", label: "\u{1F3AC} \u09AD\u09BF\u09A1\u09BF\u0993 \u0997\u09BE\u0987\u09A1", icon: "\u{1F3AC}" },
    { id: "slides", label: "\u09B8\u09CD\u09B2\u09BE\u0987\u09A1 \u09A1\u09C7\u0995", icon: "\u{1F5BC}\uFE0F" },
    {
      id: "read",
      label: "\u09AA\u09A1\u09BC\u09BE\u09B0 \u09A1\u0995\u09C1\u09AE\u09C7\u09A8\u09CD\u099F",
      icon: "\u{1F4D6}",
    },
    { id: "audio", label: "\u0985\u09A1\u09BF\u0993 \u09AA\u09A1\u0995\u09BE\u09B8\u09CD\u099F", icon: "\u{1F3A4}" },
  ];
  const slide = LIBRARY_MEDIA.slides[currentSlide];
  const allVideos = LIBRARY_MEDIA.videoCategories || [];
  const currentCategory = allVideos.find((c) => c.id === activeVideoCategory) || allVideos[0];
  const totalVideos = allVideos.reduce((sum, c) => sum + c.videos.length, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {section === "video" && playingVideo && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{playingVideo.emoji}</span>
              <div className="ud-headline" style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark }}>
                {playingVideo.title}
              </div>
            </div>
            <button
              onClick={() => setPlayingVideo(null)}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                cursor: "pointer",
                fontWeight: 700,
                color: C.danger,
                fontSize: 12,
              }}
            >
              ✕ বন্ধ করুন
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.6, padding: "0 4px" }}>
            {playingVideo.desc}
          </div>
          <MediaFrame title={playingVideo.title} src={toDrivePreviewUrl(playingVideo.id)} height={420} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href={toDriveViewUrl(playingVideo.id)}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "10px 16px",
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.bgSuccess,
                textDecoration: "none",
                color: C.primary,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              🔗 Drive এ খুলুন
            </a>
            <a
              href={toDriveDownloadUrl(playingVideo.id)}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "10px 16px",
                borderRadius: 14,
                border: `1px solid ${C.accent}`,
                background: C.bgWarning,
                textDecoration: "none",
                color: C.accentDark,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              📥 ডাউনলোড
            </a>
          </div>
        </div>
      )}
      {section === "video" && !playingVideo && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.3s ease" }}>
          <div
            className="ud-editorial-shadow"
            style={{
              background: "linear-gradient(135deg,#d2e9d0,#f5fbf6)",
              border: `1px solid ${C.border}`,
              borderRadius: 28,
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.primary,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  🎬 ভিডিও গাইড
                </div>
                <div
                  className="ud-headline"
                  style={{ fontWeight: 800, fontSize: 28, color: C.primaryDark, lineHeight: 1.1 }}
                >
                  দেখে শিখুন
                </div>
              </div>
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.primary,
                }}
              >
                🎬 {totalVideos}টি ভিডিও
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              ক্যাটাগরি থেকে বেছে নিন ও ভিডিও দেখুন — রোগ নির্ণয় থেকে পোকামাকড় দমন পর্যন্ত সব কিছু
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {allVideos.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveVideoCategory(cat.id)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: `1px solid ${activeVideoCategory === cat.id ? C.primary : C.border}`,
                  background: activeVideoCategory === cat.id ? C.primary : C.bgCard,
                  color: activeVideoCategory === cat.id ? "#fff" : C.text,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 12.5,
                  transition: "all 0.2s ease",
                }}
              >
                {cat.title}
              </button>
            ))}
          </div>
          {currentCategory && (
            <div
              style={{
                padding: "10px 14px",
                background: C.bgMuted,
                borderRadius: 14,
                borderLeft: `4px solid ${C.primary}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: C.primaryDark, marginBottom: 2 }}>
                {currentCategory.title}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                {currentCategory.desc} — {currentCategory.videos.length}টি ভিডিও
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentCategory &&
              currentCategory.videos.map((video) => (
                <VideoGalleryCard key={video.id} video={video} onPlay={setPlayingVideo} />
              ))}
          </div>
          <div style={{ marginTop: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.textMuted, marginBottom: 10 }}>
              ⚡ সব ভিডিও একসাথে:
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {allVideos
                .flatMap((c) => c.videos)
                .map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setPlayingVideo(video)}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: C.bgCard,
                      cursor: "pointer",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: C.text,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {video.emoji} {video.title.length > 25 ? video.title.substring(0, 25) + "…" : video.title}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id);
              setPlayingVideo(null);
            }}
            className="ud-headline"
            style={{
              padding: "11px 16px",
              borderRadius: 999,
              border: `1px solid ${section === item.id ? C.primary : C.border}`,
              background: section === item.id ? C.primary : C.bgCard,
              color: section === item.id ? "#fff" : C.text,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      {section === "slides" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LIBRARY_MEDIA.slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentSlide(index)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 14,
                  border: `1px solid ${currentSlide === index ? C.primary : C.border}`,
                  background: currentSlide === index ? C.bgSuccess : C.bgCard,
                  color: currentSlide === index ? C.primaryDark : C.text,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                📄 {index + 1}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                cursor: "pointer",
              }}
            >
              ← আগেরটি
            </button>
            <a
              href={toDriveViewUrl(slide.id)}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.bgSuccess,
                textDecoration: "none",
                color: C.primary,
                fontWeight: 700,
              }}
            >
              Drive এ খুলুন
            </a>
            <button
              onClick={() => setCurrentSlide((s) => Math.min(LIBRARY_MEDIA.slides.length - 1, s + 1))}
              disabled={currentSlide === LIBRARY_MEDIA.slides.length - 1}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.bgCard,
                cursor: "pointer",
              }}
            >
              পরেরটি →
            </button>
          </div>
          <MediaFrame title={slide.title} src={toDrivePreviewUrl(slide.id)} height={640} />
        </div>
      )}
      {section === "read" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
          {LIBRARY_MEDIA.readings.map((item) => (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MediaFrame title={item.title} src={toDrivePreviewUrl(item.id)} height={560} />
              <a
                href={toDriveViewUrl(item.id)}
                target="_blank"
                rel="noreferrer"
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  background: C.bgSuccess,
                  textDecoration: "none",
                  color: C.primary,
                  fontWeight: 700,
                }}
              >
                পূর্ণ স্ক্রিনে পড়ুন
              </a>
            </div>
          ))}
        </div>
      )}
      {section === "audio" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {LIBRARY_MEDIA.audio.map((item) => (
            <AudioPodcastCard key={item.id} title={item.title} id={item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
function _LegacyLibrarySection() {
  const [activeTab, setActiveTab] = useState("pests");
  const [selected, setSelected] = useState(null);
  const tabs = [
    { id: "pests", label: "পোকামাকড়", icon: "🐛" },
    { id: "diseases", label: "রোগ", icon: "🦠" },
    { id: "deficiencies", label: "পুষ্টি অভাব", icon: "🌿" },
  ];
  const items = LIBRARY[activeTab] || [];
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setSelected(null);
            }}
            style={{
              flex: 1,
              padding: "9px 6px",
              borderRadius: 10,
              border: `1px solid ${activeTab === t.id ? C.primary : C.border}`,
              background: activeTab === t.id ? C.primary : C.bgCard,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === t.id ? "#fff" : C.text,
              transition: "all .15s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {selected ? (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              background: "none",
              border: "none",
              color: C.primary,
              cursor: "pointer",
              fontSize: 13,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
            }}
          >
            ← ফিরে যান
          </button>
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 18 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{selected.icon}</div>
            <h3 style={{ color: C.primaryDark, fontSize: 17, marginBottom: 3 }}>{selected.name}</h3>
            <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>{selected.en}</div>
            <div style={{ background: C.bgMuted, borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: C.text, marginBottom: 5 }}>🔍 লক্ষণসমূহ</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{selected.symptoms}</div>
            </div>
            {(selected.ipm || selected.fix) && (
              <div style={{ background: C.bgSuccess, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.success, marginBottom: 5 }}>
                  {selected.ipm ? "🌿 IPM ব্যবস্থাপনা" : "💊 প্রতিকার"}
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{selected.ipm || selected.fix}</div>
              </div>
            )}
            {selected.etl && (
              <div style={{ background: C.bgWarning, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.warning, marginBottom: 3 }}>📊 ETL</div>
                <div style={{ fontSize: 13, color: C.text }}>{selected.etl}</div>
              </div>
            )}
            <div style={{ padding: "7px 10px", background: C.bgInfo, borderRadius: 8, fontSize: 11, color: C.blue }}>
              🌾 ফসল: {Array.isArray(selected.crops) ? selected.crops.join(", ") : selected.crops}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(item)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 14px",
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all .15s",
                boxShadow: C.shadow,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <div style={{ fontSize: 26, flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{item.name}</div>
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{item.en}</div>
              </div>
              <span style={{ color: C.textLight, fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
/* eslint-enable react-hooks/rules-of-hooks */

// ─── CABI Guide tab ───────────────────────────────────────────────────────────
function CABIGuideTab() {
  const [section, setSection] = useState("protocol");
  const [database, setDatabase] = useState(null);
  const [loading, setLoading] = useState(true);
  const { speak: _speakGuide, stop: _stopGuide, speaking: _guideSpeaking, isSupported: guideTtsReady } = useTTS();
  const [_activeStep, _setActiveStep] = useState(null);

  useEffect(() => {
    fetch("/database.json")
      .then((res) => res.json())
      .then((data) => {
        setDatabase(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load database:", err);
        setLoading(false);
      });
  }, []);

  const sections = [
    { id: "protocol", label: "প্রোটোকল", icon: "📋" },
    { id: "etl", label: "ETL সীমা", icon: "📊" },
    { id: "nutrients", label: "পুষ্টি", icon: "🧪" },
    { id: "ipm", label: "IPM পিরামিড", icon: "🌿" },
    { id: "resistance", label: "প্রতিরোধ", icon: "🔄" },
  ];
  const resistanceData = {
    frac: [
      { group: "FRAC 1 (MBC)", ai: "কার্বেন্ডাজিম, থিওফানেট", risk: "উচ্চ", rotate: "FRAC 3 বা 11 এর সাথে" },
      {
        group: "FRAC 3 (Triazole)",
        ai: "ট্রাইসাইক্লাজোল, হেক্সাকোনাজোল",
        risk: "মাঝারি",
        rotate: "FRAC 11 বা 7 এর সাথে",
      },
      { group: "FRAC 4 (PA)", ai: "মেটালাক্সিল-এম", risk: "উচ্চ", rotate: "FRAC M3 (মানকোজেব) মিশিয়ে" },
      {
        group: "FRAC 11 (Strobilurin)",
        ai: "আজোক্সিস্ট্রোবিন, ট্রাইফ্লোক্সিস্ট্রোবিন",
        risk: "উচ্চ",
        rotate: "FRAC 3 এর সাথে, মৌসুমে ২ বার",
      },
      { group: "FRAC M3 (Dithiocarbamate)", ai: "মানকোজেব, জিনেব", risk: "কম", rotate: "যেকোনো সিস্টেমিকের সাথে" },
    ],
    irac: [
      {
        group: "IRAC 1A (Organophosphate)",
        ai: "ক্লোরপাইরিফস, ডাইমিথোয়েট",
        risk: "মাঝারি",
        rotate: "IRAC 3 বা 4 এর সাথে",
      },
      { group: "IRAC 3 (Pyrethroid)", ai: "সাইপারমেথ্রিন, ডেলটামেথ্রিন", risk: "উচ্চ", rotate: "IRAC 1 বা 4 এর সাথে" },
      {
        group: "IRAC 4A (Neonicotinoid)",
        ai: "ইমিডাক্লোপ্রিড, থিয়ামেথók্সাম",
        risk: "উচ্চ",
        rotate: "IRAC 22 বা 28; মৌমাছি সতর্কতা",
      },
      { group: "IRAC 22 (Pymetrozine)", ai: "পাইমেট্রোজিন", risk: "কম", rotate: "নিম্যের বিকল্প" },
      { group: "IRAC 28 (Diamide)", ai: "ক্লোরান্ট্রানিলিপ্রোল", risk: "মাঝারি", rotate: "মৌসুমে ২ বারের বেশি নয়" },
    ],
  };

  // Function to get relevant images based on section
  const getRelevantImages = (db, sectionId) => {
    if (!db?.diagnostic_keys) return [];

    // Map section IDs to symptom categories in database
    const sectionToSymptomMap = {
      protocol: null, // Show general images for protocol
      etl: ["Drying/necrosis/blight", "Leaf spot", "Wilt"],
      nutrients: ["Yellowing of leaves", "Distortion of leaves"],
      ipm: ["Leaf spot", "Wilt", "Galls"],
      resistance: null,
    };

    const targetSymptoms = sectionToSymptomMap[sectionId];
    if (!targetSymptoms) return [];

    return db.diagnostic_keys
      .filter((page) =>
        targetSymptoms.some(
          (symptom) => page.symptom_category && page.symptom_category.toLowerCase().includes(symptom.toLowerCase()),
        ),
      )
      .flatMap((page) => page.images || [])
      .slice(0, 3); // Return at most 3 images
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}
      >
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="ud-headline"
            style={{
              flexShrink: 0,
              padding: "10px 15px",
              borderRadius: 999,
              border: `1px solid ${section === s.id ? C.primary : C.border}`,
              background: section === s.id ? C.primary : C.bgCard,
              color: section === s.id ? "#fff" : C.text,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 800,
              whiteSpace: "nowrap",
              transition: "all .15s",
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      {section === "protocol" && (
        <div>
          <div
            className="ud-editorial-shadow"
            style={{
              background: `linear-gradient(135deg,${C.primaryXDark},${C.primary})`,
              borderRadius: 24,
              padding: 22,
              marginBottom: 16,
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔬</div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 3 }}>{CABI_GUIDE.protocol.title}</div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>{CABI_GUIDE.protocol.subtitle}</div>
              </div>
              {guideTtsReady && (
                <button
                  onClick={() => {
                    const allSteps = CABI_GUIDE.protocol.steps
                      .map((s) => "ধাপ " + s.num + ": " + s.title + ". " + s.desc)
                      .join(". ");
                    speak(CABI_GUIDE.protocol.title + ". " + allSteps, { prependFriendly: true });
                  }}
                  style={{
                    flexShrink: 0,
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.18)",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          </div>
          {CABI_GUIDE.protocol.steps.map((step, i) => (
            <div
              key={i}
              style={{
                background: C.bgCard,
                borderRadius: 18,
                padding: 18,
                marginBottom: 12,
                border: `1px solid ${C[step.borderKey] || C.border}`,
                boxShadow: C.shadow,
                animation: `fadeIn .3s ease ${i * 0.05}s both`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    background: C[step.bgKey] || C.bgMuted,
                    border: `2px solid ${C[step.borderKey] || C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 19,
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: step.color }}>
                    ধাপ {step.num}: {step.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{step.en}</div>
                </div>
                {guideTtsReady && (
                  <button
                    onClick={() =>
                      speak("ধাপ " + step.num + ": " + step.title + ". " + step.desc, { prependFriendly: false })
                    }
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: C[step.bgKey] || C.bgMuted,
                      border: `1.5px solid ${C[step.borderKey] || C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    🔊
                  </button>
                )}
              </div>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 10 }}>{step.desc}</p>
              {step.points.map((pt, j) => (
                <div key={j} style={{ display: "flex", gap: 8, fontSize: 12, color: C.text, padding: "3px 0" }}>
                  <span style={{ color: step.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          ))}
          {/* Add reference images for protocol section */}
          {!loading && database && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.primaryDark, marginBottom: 8 }}>
                🔍 প্রোটোকল সম্পর্কিত ছবি
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {getRelevantImages(database, "protocol").map((img, index) => (
                  <div
                    key={index}
                    style={{
                      flexShrink: 0,
                      width: 100,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `2px solid ${C.border}`,
                    }}
                  >
                    <img
                      src={`/images/${img}`}
                      alt={`Reference ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {section === "etl" && (
        <div>
          <div
            style={{
              background: C.bgWarning,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              border: `1px solid ${C.borderWarning}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.warning, marginBottom: 3 }}>📊 ETL কী?</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                  ETL হলো সেই মাত্রা যখন কীটনাশক ব্যবহারের অর্থনৈতিক ন্যায্যতা থাকে। নিচে থাকলে প্রাকৃতিক নিয়ন্ত্রণই
                  যথেষ্ট।
                </div>
              </div>
              {guideTtsReady && (
                <button
                  onClick={() =>
                    speak(
                      "ই টি এল হলো সেই মাত্রা যখন কীটনাশক ব্যবহারের অর্থনৈতিক ন্যায্যতা থাকে। নিচে থাকলে প্রাকৃতিক নিয়ন্ত্রণই যথেষ্ট।",
                      { prependFriendly: true },
                    )
                  }
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: C.bgCard,
                    border: `1.5px solid ${C.borderWarning}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          </div>
          {CABI_GUIDE.etl.map((e, i) => (
            <div
              key={i}
              style={{
                background: C.bgCard,
                borderRadius: 12,
                padding: 14,
                marginBottom: 9,
                border: `1px solid ${C.border}`,
                boxShadow: C.shadow,
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.primaryDark }}>{e.pest}</div>
                  <div style={{ color: C.textMuted, fontSize: 11 }}>{e.en}</div>
                </div>
                <span
                  style={{
                    background: C.badgeWarning,
                    border: `1px solid ${C.borderWarning}`,
                    color: C.textWarning,
                    borderRadius: 8,
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  ETL
                </span>
              </div>
              <div style={{ background: C.bgWarning, borderRadius: 8, padding: "7px 10px", marginBottom: 7 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.warning, marginBottom: 2 }}>ব্যবস্থার সীমা:</div>
                <div style={{ fontSize: 12, color: C.text }}>{e.etl}</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 11, color: C.textMuted }}>
                  📅 পর্যায়: <span style={{ color: C.text, fontWeight: 600 }}>{e.stage}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>
                  🔍 <span style={{ color: C.text, fontWeight: 600 }}>{e.monitor}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Add reference images for ETL section */}
          {!loading && database && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.primaryDark, marginBottom: 8 }}>
                🖼️ ETL সম্পর্কিত संदर्भ ছবি
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {getRelevantImages(database, "etl").map((img, index) => (
                  <div
                    key={index}
                    style={{
                      flexShrink: 0,
                      width: 100,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `2px solid ${C.border}`,
                    }}
                  >
                    <img
                      src={`/images/${img}`}
                      alt={`ETL Reference ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {section === "nutrients" && (
        <div>
          <div
            style={{
              background: C.bgSuccess,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              border: `1px solid ${C.borderSuccess}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.success, marginBottom: 3 }}>🧪 পুষ্টি উপাদান</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                  পুষ্টি অভাবের লক্ষণ প্রায়ই রোগের মতো দেখায়। CABI প্রোটোকলে এটি প্রথমেই বাদ দিতে হয়।
                </div>
              </div>
              {guideTtsReady && (
                <button
                  onClick={() =>
                    speak(
                      "পুষ্টি উপাদান। পুষ্টি অভাবের লক্ষণ প্রায়ই রোগের মতো দেখায়। সি এ বি আই প্রোটোকলে এটি প্রথমেই বাদ দিতে হয়।",
                      { prependFriendly: true },
                    )
                  }
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: C.bgCard,
                    border: `1.5px solid ${C.borderSuccess}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          </div>
          {CABI_GUIDE.nutrients.map((n, i) => (
            <div
              key={i}
              style={{
                background: C.bgCard,
                borderRadius: 12,
                padding: 14,
                marginBottom: 9,
                border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${n.color}`,
                boxShadow: C.shadow,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: n.color + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 13,
                    color: n.color,
                    flexShrink: 0,
                  }}
                >
                  {n.name.match(/\((.*?)\)/)?.[1] || n.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{n.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{n.en}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 9 }}>
                <div style={{ fontSize: 11, color: C.textMuted }}>অভাবের লক্ষণ:</div>
                <div style={{ fontSize: 12, color: C.text }}>{n.deficiency}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>অতিক্রমের লক্ষণ:</div>
                <div style={{ fontSize: 12, color: C.text }}>{n.excess}</div>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted }}>শ말로 পূরণ:</div>
              <div style={{ fontSize: 12, color: C.text }}>{n.fix}</div>
              {n.crops && (
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>প্রভাবিত ফসল:</div>
                  <div style={{ fontSize: 12, color: C.text }}>{n.crops.join(", ")}</div>
                </div>
              )}
            </div>
          ))}
          {/* Add reference images for nutrients section */}
          {!loading && database && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.primaryDark, marginBottom: 8 }}>
                🖼️ পুষ্টি অভাব সম্পর্কিত ছবি
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {getRelevantImages(database, "nutrients").map((img, index) => (
                  <div
                    key={index}
                    style={{
                      flexShrink: 0,
                      width: 100,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `2px solid ${C.border}`,
                    }}
                  >
                    <img
                      src={`/images/${img}`}
                      alt={`Nutrient Reference ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {section === "ipm" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.primaryDark }}>
              🌿 IPM পিরামিড — উদ্ভিদ সুরক্ষার পদ্ধতি
            </div>
            {guideTtsReady && (
              <button
                onClick={() => {
                  const levels = CABI_GUIDE.ipm_pyramid.map((l) => "লেভেল " + l.level + ": " + l.label).join(", ");
                  speak("আই পি এম পিরামিড। উদ্ভিদ সুরক্ষার পদ্ধতি। " + levels + ".", { prependFriendly: true });
                }}
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: C.bgSuccess,
                  border: `1.5px solid ${C.borderSuccess}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                🔊
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {[...CABI_GUIDE.ipm_pyramid].reverse().map((level, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: level.color + "15",
                  borderRadius: 12,
                  padding: 12,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    left: 12,
                    background: level.color,
                    color: "#fff",
                    borderRadius: 10,
                    padding: "2px 6px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  LEVEL {level.level}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: level.color, marginBottom: 8 }}>{level.label}</div>
                <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6, marginBottom: 10 }}>
                  {level.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "start", gap: 6, marginBottom: 4 }}>
                      <span style={{ color: level.color, flexShrink: 0 }}>▸</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Add reference images for IPM section */}
          {!loading && database && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.primaryDark, marginBottom: 8 }}>
                🖼️ IPM পিরামিড সম্পর্কিত ছবি
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {getRelevantImages(database, "ipm").map((img, index) => (
                  <div
                    key={index}
                    style={{
                      flexShrink: 0,
                      width: 100,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `2px solid ${C.border}`,
                    }}
                  >
                    <img
                      src={`/images/${img}`}
                      alt={`IPM Reference ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {section === "resistance" && (
        <div>
          <div
            style={{
              background: C.bgPurple,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              border: `1px solid ${C.borderPurple}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#7c3aed", marginBottom: 3 }}>
                  🔄 PRC/IRAC রোটেশন গাইড
                </div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                  FRAC ও IRAC গ্রুপ অনুযায়ী ভিন্ন গোত্রের কীটনাশক পরিবর্তন করে ব্যবহার করুন। এতে রোগ ও পোকার রোধ ক্ষমতা
                  কমে।
                </div>
              </div>
              {guideTtsReady && (
                <button
                  onClick={() =>
                    speak(
                      "এফ আর এসি ও আই আর এ সি গ্রুপ অনুযায়ী ভিন্ন গোত্রের কীটনাশক পরিবর্তন করে ব্যবহার করুন। এতে রোগ ও পোকার রোধ ক্ষমতা কমে।",
                      { prependFriendly: true },
                    )
                  }
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: C.bgCard,
                    border: `1.5px solid ${C.borderPurple}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#7c3aed", marginBottom: 4 }}>FRAC (ছত্রাকনাশক)</div>
              <div style={{ background: C.bgCard, borderRadius: 10, padding: 12 }}>
                {resistanceData.frac.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: i === resistanceData.frac.length - 1 ? "none" : `1px solid ${C.border}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{f.group}</div>
                      <div style={{ fontSize: 10, color: C.text }}>{f.ai}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span
                        style={{
                          background: C.bgOrange,
                          borderRadius: 4,
                          padding: "1px 4px",
                          fontSize: 9,
                          color: C.warning,
                        }}
                      >
                        {f.risk}
                      </span>
                      <span style={{ fontSize: 10, color: C.text }}>{f.rotate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#7c3aed", marginBottom: 4 }}>IRAC (কীটনাশক)</div>
              <div style={{ background: C.bgCard, borderRadius: 10, padding: 12 }}>
                {resistanceData.irac.map((i, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: idx === resistanceData.irac.length - 1 ? "none" : `1px solid ${C.border}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{i.group}</div>
                      <div style={{ fontSize: 10, color: C.text }}>{i.ai}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span
                        style={{
                          background: C.bgOrange,
                          borderRadius: 4,
                          padding: "1px 4px",
                          fontSize: 9,
                          color: C.warning,
                        }}
                      >
                        {i.risk}
                      </span>
                      <span style={{ fontSize: 10, color: C.text }}>{i.rotate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Add reference images for resistance section */}
          {!loading && database && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.primaryDark, marginBottom: 8 }}>
                🖼️ FRAC/IRAC রোটেশন সম্পর্কিত ছবি
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {getRelevantImages(database, "resistance").map((img, index) => (
                  <div
                    key={index}
                    style={{
                      flexShrink: 0,
                      width: 100,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `2px solid ${C.border}`,
                    }}
                  >
                    <img
                      src={`/images/${img}`}
                      alt={`Resistance Reference ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
           </div>
          )}

          {/* Registered Pesticides & MoA Interactive Search Lookup */}
          <MoAPesticideRegistryView C={C} />
        </div>
      )}
    </div>
  );
}

function MoAPesticideRegistryView({ C }) {
  const [query, setQuery] = useState("");
  const [selectedMoaFilter, setSelectedMoaFilter] = useState("ALL");

  const results = getRegisteredProducts({
    crop: query,
    pest: query,
    activeIngredient: query,
  }).filter((p) => {
    if (selectedMoaFilter === "ALL") return true;
    const moa = lookupMoA(p.activeIngredient);
    return moa && moa.type === selectedMoaFilter;
  });

  // ── AgriChem Pro database (DAE approved 187+ products) integration ──
  const q = query.trim().toLowerCase();
  const agrichemResults = q
    ? AGRICHEM_DATABASE.filter((p) => {
        const haystack = [
          p.commonName,
          p.tradeName,
          p.registrationNo,
          p.formulation,
          p.type,
          ...(p.crops || []),
          ...(p.pests || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
    : [];

  return (
    <div
      style={{
        background: C.bgCard,
        borderRadius: 14,
        padding: 16,
        marginTop: 16,
        border: `1.5px solid ${C.borderPurple || "#c084fc"}`,
        boxShadow: "0 4px 14px rgba(124,58,237,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#6d28d9" }}>
            🧪 বাংলাদেশে নিবন্ধিত বালাইনাশক ও MoA ডাটাবেজ
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
            কৃষি সম্প্রসারণ অধিদপ্তর (DAE) অনুমোদিত ট্রেড নাম, মাত্রা, রেজিস্টার নম্বর ও FRAC/IRAC গ্রুপ অনুসন্ধান
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["ALL", "FRAC", "IRAC"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedMoaFilter(filter)}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: selectedMoaFilter === filter ? "#7c3aed" : C.bgMuted,
                color: selectedMoaFilter === filter ? "#ffffff" : C.text,
              }}
            >
              {filter === "ALL" ? "সব" : filter}
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder="ফসল, পোকা/রোগ, সক্রিয় উপাদান বা ব্র্যান্ড নাম লিখুন (যেমন: ধান, ব্লাস্ট, কার্বেন্ডাজিম, Amistar Top)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          fontSize: 12,
          background: C.bgInput || C.bgMuted,
          color: C.text,
          outline: "none",
          marginBottom: 12,
        }}
      />

      <div style={{ display: "grid", gap: 10, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: C.textMuted }}>
            🔍 কোনো নিবন্ধিত বালাইনাশক পাওয়া যায়নি। অন্য নাম বা ফসল লিখে অনুসন্ধান করুন।
          </div>
        ) : (
          results.slice(0, 30).map((prod, idx) => {
            const moa = lookupMoA(prod.activeIngredient);
            return (
              <div
                key={idx}
                style={{
                  background: C.bgMuted || "#f8fafc",
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: prod.category === "Fungicide" ? "#dcfce7" : "#feefc3",
                        color: prod.category === "Fungicide" ? "#166534" : "#92400e",
                        marginRight: 6,
                      }}
                    >
                      {prod.category}
                    </span>
                    <strong style={{ fontSize: 13, color: C.text }}>{prod.tradeName}</strong>
                    <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6 }}>({prod.regNo})</span>
                  </div>
                  {moa && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: moa.type === "FRAC" ? "#ede9fe" : "#fef3c7",
                        color: moa.type === "FRAC" ? "#6d28d9" : "#b45309",
                        border: `1px solid ${moa.type === "FRAC" ? "#c084fc" : "#fcd34d"}`,
                      }}
                    >
                      {moa.code}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>
                  🧪 <strong>সক্রিয় উপাদান:</strong> {prod.activeIngredient}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                  🏢 <strong>কোম্পানি:</strong> {prod.company} · 🌾 <strong>ফসল:</strong> {prod.crops} · 🐛 <strong>লক্ষ্য:</strong> {prod.pest}
                </div>
                <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, marginTop: 4 }}>
                  📏 <strong>সুপারিশকৃত মাত্রা:</strong> {prod.dosage}
                </div>

                {moa && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: "6px 8px",
                      borderRadius: 6,
                      background: moa.type === "FRAC" ? "#f5f3ff" : "#fffbeb",
                      fontSize: 10,
                      color: C.text,
                      lineHeight: 1.4,
                    }}
                  >
                    💡 <strong>MoA ক্রিয়া পদ্ধতি ({moa.code}):</strong> {moa.subGroupBn}
                    <br />
                    🔄 <strong>রোটেশন নির্দেশিকা:</strong> {moa.rotationNoteBn}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ── Pesticide database results (shared chemical database) ── */}
        {q && (
          <div style={{ marginTop: 14, borderTop: `1px dashed ${C.border}`, paddingTop: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.primary, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🧪</span> বালাইনাশক (Pesticide) ডাটাবেস — মিল পাওয়া ফলাফল ({agrichemResults.length})
            </div>
            {agrichemResults.length === 0 ? (
              <div style={{ fontSize: 11, color: C.textMuted, padding: "8px 0" }}>
                বালাইনাশক ডাটাবেসে এই অনুসন্ধানের জন্য কিছু পাওয়া যায়নি।
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
                {agrichemResults.slice(0, 20).map((p) => (
                  <div key={p.id} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "9px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: p.type === "Fungicide" ? "#dcfce7" : "#feefc3", color: p.type === "Fungicide" ? "#166534" : "#92400e", marginRight: 6 }}>
                          {p.type}
                        </span>
                        <strong style={{ fontSize: 13, color: C.text }}>{p.tradeName}</strong>
                        <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6 }}>
                          {p.commonName}
                          {p.formulation ? ` (${p.formulation})` : ""}
                        </span>
                      </div>
                      {p.moaCode && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: String(p.moaCode).startsWith("F") ? "#ede9fe" : "#fef3c7", color: String(p.moaCode).startsWith("F") ? "#6d28d9" : "#b45309" }}>
                          {p.moaCode}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>
                      🌾 <strong>ফসল:</strong> {(p.crops || []).join(", ") || "—"} · 🐛 <strong>লক্ষ্য:</strong> {(p.pests || []).join(", ") || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, marginTop: 3 }}>
                      📏 <strong>মাত্রা:</strong> {p.dosageRate}
                      {p.phiDays != null ? <span style={{ fontWeight: 400, color: C.textMuted }}> · PHI: {p.phiDays} দিন</span> : null}
                      {p.toxicityClass ? <span style={{ fontWeight: 400, color: C.textMuted }}> · WHO: {p.toxicityClass}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Award Crest Badge ────────────────────────────────────────────────
function AwardCrest({ game }) {
  const STORAGE_KEY = `game-${game.id}-high`;
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  // Listen for storage changes (when game ends and saves new high score)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const fresh = Number(localStorage.getItem(STORAGE_KEY)) || 0;
        if (fresh !== highScore) setHighScore(fresh);
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [highScore, STORAGE_KEY]);

  const getTier = (score) => {
    if (score >= 80)
      return {
        label: " platinum",
        emoji: "💎",
        color: "#8b5cf6",
        bg: "linear-gradient(135deg,#1e1b4b,#4c1d95)",
        border: "#7c3aed",
      };
    if (score >= 60)
      return {
        label: " gold",
        emoji: "🏆",
        color: "#f59e0b",
        bg: "linear-gradient(135deg,#78350f,#d97706)",
        border: "#fbbf24",
      };
    if (score >= 40)
      return {
        label: " silver",
        emoji: "🥈",
        color: "#6b7280",
        bg: "linear-gradient(135deg,#1f2937,#4b5563)",
        border: "#9ca3af",
      };
    if (score >= 20)
      return {
        label: " bronze",
        emoji: "🥉",
        color: "#ea580c",
        bg: "linear-gradient(135deg,#7c2d12,#c2410c)",
        border: "#fb923c",
      };
    return {
      label: "",
      emoji: "🏅",
      color: "#9ca3af",
      bg: "linear-gradient(135deg,#f3f4f6,#d1d5db)",
      border: "#e5e7eb",
    };
  };

  const tier = getTier(highScore);
  const hasPlayed = highScore > 0;

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        flexShrink: 0,
        position: "relative",
        background: hasPlayed ? tier.bg : "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
        border: `2.5px solid ${hasPlayed ? tier.border : "#d1d5db"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: hasPlayed ? 18 : 16,
        boxShadow: hasPlayed ? `0 0 12px ${tier.color}44` : "none",
        transition: "all .3s ease",
      }}
    >
      <span>{hasPlayed ? tier.emoji : "🎮"}</span>
      {hasPlayed && (
        <div
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            background: tier.color,
            color: "#fff",
            borderRadius: 8,
            fontSize: 8,
            fontWeight: 800,
            padding: "1px 4px",
            lineHeight: 1.2,
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            minWidth: 16,
            textAlign: "center",
          }}
        >
          {highScore}
        </div>
      )}
    </div>
  );
}

// ─── Social Share + PWA Install Button ─────────────────────────────────
function ShareAndInstallBar() {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [shared, setShared] = useState(false);
  const APP_URL = "https://cabi-diagnosis.vercel.app";
  const SHARE_TEXT =
    "🌾 উদ্ভিদ গোয়েন্দা — কৃষকের সহজ রোগ নির্ণয় অ্যাপ! CABI Plantwise প্রোটোকল দিয়ে ফসলের রোগ চিনুন।";

  // PWA install prompt capture
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // If app is already installed, never show install button
    window.addEventListener("appinstalled", () => {
      setCanInstall(false);
      setInstallPrompt(null);
      setDismissed(true);
    });
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setCanInstall(false);
      setDismissed(true);
    }
    // Check localStorage for dismissed
    try {
      if (localStorage.getItem("ud-install-dismissed")) setDismissed(true);
    } catch {}
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setCanInstall(false);
      setDismissed(true);
      try {
        localStorage.setItem("ud-install-dismissed", "1");
      } catch {}
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("ud-install-dismissed", "1");
    } catch {}
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "উদ্ভিদ গোয়েন্দা", text: SHARE_TEXT, url: APP_URL });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {}
    }
    setShowShareMenu(!showShareMenu);
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}&quote=${encodeURIComponent(SHARE_TEXT)}`,
    },
    {
      name: "LinkedIn",
      icon: "💼",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`,
    },
    {
      name: "Twitter/X",
      icon: "🐦",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(APP_URL)}`,
    },
    { name: "WhatsApp", icon: "💬", url: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + APP_URL)}` },
    { name: "Copy Link", icon: "📋", action: "copy" },
  ];

  const showInstallBanner = canInstall && !dismissed;

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
      {/* One-tap Install button — prominent green pill */}
      {showInstallBanner && (
        <button
          onClick={handleInstall}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 50,
            border: "none",
            background: "linear-gradient(135deg,#006a4e,#00503a)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,106,78,0.35)",
            letterSpacing: 0.3,
            animation: "popIn .4s ease",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>📲</span> ইন্সটল করুন
        </button>
      )}
      {/* Dismiss install banner (tiny X) */}
      {showInstallBanner && (
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "none",
            background: "#e5e7eb",
            color: "#6b7280",
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            padding: 0,
            zIndex: 1,
          }}
        >
          ✕
        </button>
      )}
      {/* Share button — always visible */}
      <button
        onClick={handleNativeShare}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          borderRadius: 50,
          border: `1px solid ${shared ? C.success : C.border}`,
          background: shared ? C.bgSuccess : C.bgCard,
          color: shared ? C.success : C.textMuted,
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: C.shadow,
          transition: "all .15s",
        }}
      >
        {shared ? "✅" : "📤"} শেয়ার
      </button>
      {/* Share dropdown menu */}
      {showShareMenu && (
        <>
          <div onClick={() => setShowShareMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          <div
            style={{
              position: "absolute",
              top: 44,
              right: 0,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 8,
              boxShadow: C.shadowLg,
              zIndex: 200,
              minWidth: 190,
              animation: "popIn .2s ease",
            }}
          >
            <div
              style={{ fontSize: 11, color: C.textLight, fontWeight: 700, padding: "4px 10px 8px", letterSpacing: 0.3 }}
            >
              শেয়ার করুন
            </div>
            {shareLinks.map((link) =>
              link.action === "copy" ? (
                <button
                  key={link.name}
                  onClick={async () => {
                    await navigator.clipboard.writeText(APP_URL);
                    setShared(true);
                    setShowShareMenu(false);
                    setTimeout(() => setShared(false), 2000);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 10px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    width: "100%",
                    borderRadius: 8,
                    fontSize: 12.5,
                    color: C.text,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{link.icon}</span> {link.name}
                </button>
              ) : (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowShareMenu(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 10px",
                    textDecoration: "none",
                    color: C.text,
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{link.icon}</span> {link.name}
                </a>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 🎮 GAME HUB ─────────────────────────────────────────────────────────────
function GameHub() {
  const [activeGame, setActiveGame] = useState(null);
  const { speak, stop: _stopGame, speaking, isSupported } = useTTS();

  const CABI_GAMES = [
    {
      id: "symptom-spotter",
      title: "লক্ষণ লক্ষ্য",
      en: "Symptom Spotter",
      step: 1,
      icon: "👁️",
      color: "#2563eb",
      bg: "linear-gradient(135deg,#1e40af,#2563eb)",
      desc: "ফসলের লক্ষণ চিনুন — পাতার দাগ, রং ও আকৃতি থেকে রোগ শনাক্ত করুন",
      difficulty: "সহজ",
      duration: "৫-১০ মিনিট",
      Component: SymptomSpotter,
    },
    {
      id: "cause-detective",
      title: "কারণ খুঁজো",
      en: "Cause Detective",
      step: 2,
      icon: "🔬",
      color: "#7c3aed",
      bg: "linear-gradient(135deg,#4c1d95,#7c3aed)",
      desc: "CABI বর্জন পদ্ধতি — ক্লু থেকে সঠিক কারণ নির্ণয় করুন",
      difficulty: "মধ্যম",
      duration: "১০-১৫ মিনিট",
      Component: CauseDetective,
    },
    {
      id: "disease-triangle",
      title: "রোগ ত্রিভুজ",
      en: "Disease Triangle",
      step: 3,
      icon: "🔺",
      color: "#d97706",
      bg: "linear-gradient(135deg,#92400e,#d97706)",
      desc: "পোষক, রোগজীবাণু ও পরিবেশ — তিনটি উপাদান মেলান",
      difficulty: "মধ্যম",
      duration: "১০-১৫ মিনিট",
      Component: DiseaseTriangle,
    },
    {
      id: "field-scout",
      title: "মাঠ পরীক্ষক",
      en: "Field Scout",
      step: 4,
      icon: "🧪",
      color: "#16a34a",
      bg: "linear-gradient(135deg,#065f46,#16a34a)",
      desc: "W-pattern স্যাম্পলিং ও ETL থ্রেশহোল্ড সিদ্ধান্ত",
      difficulty: "কঠিন",
      duration: "১০-১৫ মিনিট",
      Component: FieldScout,
    },
    {
      id: "ipm-commander",
      title: "IPM কমান্ডার",
      en: "IPM Commander",
      step: 5,
      icon: "🌿",
      color: "#0891b2",
      bg: "linear-gradient(135deg,#0e7490,#0891b2)",
      desc: "IPM পিরামিড অনুসরণ করে সঠিক চিকিৎসা সিদ্ধান্ত নিন",
      difficulty: "কঠিন",
      duration: "১০-১৫ মিনিট",
      Component: IPMCommander,
    },
  ];

  const EXTERNAL_GAMES = [
    {
      id: "dhan-doctor",
      title: "ধানের ডাক্তার",
      en: "Dhan Doctor Simulation",
      icon: "🌾",
      color: C.game2,
      bg: "linear-gradient(135deg,#0c4a6e,#0891b2)",
      desc: "ধানের ৫টি প্রধান রোগ চিহ্নিত করুন",
      difficulty: "মধ্যম",
      duration: "১৫-২০ মিনিট",
      src: "https://game-diagnosis.space.z.ai/",
    },
    {
      id: "smart-krishok",
      title: "স্মার্ট কৃষক ৩.০",
      en: "Smart Farmer Decision Game",
      icon: "👨‍🌾",
      color: C.game1,
      bg: "linear-gradient(135deg,#4c1d95,#7c3aed)",
      desc: "কৃষি সিদ্ধান্ত গ্রহণের দক্ষতা বাড়ান",
      difficulty: "কঠিন",
      duration: "২০-৩০ মিনিট",
      src: "https://game-diagnosis.space.z.ai/",
    },
    {
      id: "plant-clinic",
      title: "প্ল্যান্ট ক্লিনিক",
      en: "Plant Clinic Simulation",
      icon: "🏥",
      color: C.game3,
      bg: "linear-gradient(135deg,#7c2d12,#ea580c)",
      desc: "CABI প্রোটোকল অনুশীলন ও পরামর্শ দিন",
      difficulty: "সহজ",
      duration: "১০-১৫ মিনিট",
      src: "https://game-diagnosis.space.z.ai/",
    },
  ];

  if (activeGame) {
    const game = CABI_GAMES.find((g) => g.id === activeGame);
    if (!game) return null;
    const GameComponent = game.Component;
    return (
      <div style={{ animation: "fadeIn .3s ease" }}>
        <button
          onClick={() => setActiveGame(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: C.primary,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: 18 }}>←</span> গেম হাবে ফিরুন
        </button>
        <React.Suspense
          fallback={<div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>লোড হচ্ছে...</div>}
        >
          <GameComponent />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn .3s ease", paddingBottom: 20 }}>
      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <div className="ud-headline" style={{ fontWeight: 800, fontSize: 20, color: C.primaryDark, marginBottom: 4 }}>
          🎮 গেম হাব
        </div>
        <div style={{ fontSize: 13, color: C.textLight }}>CABI Plantwise ৫-ধাপ প্রোটোকল অনুসারে খেলুন ও শিখুন</div>
      </div>

      {isSupported && (
        <button
          onClick={() =>
            speak(
              "গেম হাবে স্বাগতম! এখানে পাঁচটি CABI গেম আছে। লক্ষণ লক্ষ্য, কারণ খুঁজো, রোগ ত্রিভুজ, মাঠ পরীক্ষক, এবং IPM কমান্ডার।",
              { prependFriendly: true },
            )
          }
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: `1.5px solid ${speaking ? C.success : C.border}`,
            background: speaking ? C.bgSuccess : C.bgMuted,
            color: speaking ? C.success : C.textMuted,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 14,
            boxShadow: C.shadow,
          }}
        >
          <span style={{ fontSize: 18 }}>🔊</span>
          {speaking ? "শুনছি..." : "গেম তালিকা শুনুন"}
        </button>
      )}

      {/* CABI Step Games — inline playable */}
      <div
        style={{
          marginBottom: 8,
          fontSize: 11,
          color: C.primary,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        📖 CABI প্রোটোকল গেম
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {CABI_GAMES.map((game, i) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: C.bgCard,
              borderRadius: 16,
              padding: "14px 16px",
              border: `1px solid ${C.border}`,
              boxShadow: C.shadow,
              cursor: "pointer",
              animation: `popIn .4s ease ${i * 0.06}s both`,
              transition: "all .2s ease",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <AwardCrest game={game} />
              <div style={{ position: "relative", width: 54, height: 54 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: game.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  }}
                >
                  {game.icon}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: 8,
                    background: C.bgCard,
                    border: `1.5px solid ${game.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    color: game.color,
                    boxShadow: C.shadow,
                  }}
                >
                  ধা.{game.step}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 1, lineHeight: 1.3 }}>
                {game.title}
              </div>
              <div style={{ fontSize: 10.5, color: C.textMuted, marginBottom: 5, lineHeight: 1.4 }}>{game.desc}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.textLight }}>⚡ {game.difficulty}</span>
                <span style={{ fontSize: 10, color: C.textLight }}>⏱ {game.duration}</span>
              </div>
            </div>
            {isSupported && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speak(`${game.title}। ${game.desc}। ${game.difficulty} মাত্রা।`, { prependFriendly: true });
                }}
                style={{
                  flexShrink: 0,
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: C.bgMuted,
                  border: `1.5px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: C.shadow,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                🔊
              </button>
            )}
            <div
              style={{
                flexShrink: 0,
                width: 38,
                height: 38,
                borderRadius: 12,
                background: `linear-gradient(135deg,${game.color},${game.color}bb)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ color: "#fff", fontSize: 16 }}>▶</span>
            </div>
          </button>
        ))}
      </div>

      {/* External simulation games */}
      <div
        style={{
          marginBottom: 8,
          fontSize: 11,
          color: C.textLight,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        🌐 সিমুলেশন গেম
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {EXTERNAL_GAMES.map((game, i) => (
          <a
            key={game.id}
            href={game.src}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: C.bgCard,
              borderRadius: 16,
              padding: "14px 16px",
              border: `1px solid ${C.border}`,
              boxShadow: C.shadow,
              textDecoration: "none",
              animation: `popIn .4s ease ${(i + 5) * 0.06}s both`,
              transition: "all .2s ease",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background: game.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}
            >
              {game.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 1, lineHeight: 1.3 }}>
                {game.title}
              </div>
              <div style={{ fontSize: 10.5, color: C.textMuted, marginBottom: 5, lineHeight: 1.4 }}>{game.desc}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.textLight }}>⚡ {game.difficulty}</span>
                <span style={{ fontSize: 10, color: C.textLight }}>⏱ {game.duration}</span>
              </div>
            </div>
            <div
              style={{
                flexShrink: 0,
                width: 38,
                height: 38,
                borderRadius: 12,
                background: `linear-gradient(135deg,${game.color},${game.color}bb)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ color: "#fff", fontSize: 16 }}>↗</span>
            </div>
          </a>
        ))}
      </div>

      {/* Award Showcase */}
      <div style={{ marginTop: 16, padding: "14px 0", borderTop: "1px solid " + C.border }}>
        <div
          style={{
            fontSize: 11,
            color: C.textLight,
            fontWeight: 700,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          🏅 অর্জন ক্রেস্ট
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {CABI_GAMES.map((game, _i) => {
            const key = `game-${game.id}-high`;
            let hs = 0;
            try {
              hs = Number(localStorage.getItem(key)) || 0;
            } catch {}
            const tier =
              hs >= 80
                ? { l: "platinum", e: "💎", c: "#8b5cf6" }
                : hs >= 60
                  ? { l: "gold", e: "🏆", c: "#f59e0b" }
                  : hs >= 40
                    ? { l: "silver", e: "🥈", c: "#6b7280" }
                    : hs >= 20
                      ? { l: "bronze", e: "🥉", c: "#ea580c" }
                      : { l: "", e: "🎮", c: "#9ca3af" };
            return (
              <div
                key={game.id}
                style={{
                  flexShrink: 0,
                  textAlign: "center",
                  minWidth: 80,
                  background: hs > 0 ? tier.c + "10" : "#f9fafb",
                  borderRadius: 14,
                  padding: "10px 8px",
                  border: "1px solid " + (hs > 0 ? tier.c + "33" : C.border),
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{tier.e}</div>
                <div style={{ fontWeight: 700, fontSize: 10, color: C.text }}>{game.title.split(" ")[0]}</div>
                <div style={{ fontSize: 9, color: tier.c, fontWeight: 800, marginTop: 2 }}>
                  {hs > 0 ? `⭐ ${hs}` : "অনলক"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Learning path */}
      <div style={{ marginTop: 20, padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
        <div
          style={{
            fontSize: 11,
            color: C.textLight,
            fontWeight: 700,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          📚 CABI শেখার ক্রম
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            alignItems: "center",
            fontSize: 10.5,
            color: C.textMuted,
            flexWrap: "wrap",
          }}
        >
          {CABI_GAMES.map((game, i, arr) => (
            <span key={game.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  background: `${game.color}15`,
                  borderRadius: 10,
                  padding: "3px 8px",
                  color: game.color,
                  fontWeight: 700,
                }}
              >
                {game.icon} ধাপ {game.step}
              </span>
              {i < arr.length - 1 && <span style={{ color: C.border, fontSize: 12 }}>→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Market Price Ticker ───────────────────────────────────────────────────────
function MarketPriceTicker({ C }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_tickerOffset, setTickerOffset] = useState(0);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/market-prices');
        if (res.ok) {
          const data = await res.json();
          setPrices(data.prices || []);
        }
      } catch {
        // fallback: show nothing silently
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  // Animate ticker scroll
  useEffect(() => {
    if (prices.length === 0) return;
    const interval = setInterval(() => {
      setTickerOffset(prev => (prev + 1) % prices.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [prices]);

  if (loading || prices.length === 0) return null;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 100%)`,
      borderRadius: 12,
      padding: '10px 14px',
      marginBottom: 12,
      color: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>📊</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, opacity: 0.85 }}>
          বাজার মূল্য (DAM) — আজকের দর
        </span>
        <span style={{ fontSize: 9, marginLeft: 'auto', opacity: 0.65 }}>dam.gov.bd</span>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {prices.map((p, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '6px 10px',
              minWidth: 120,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{p.commodity}</div>
            <div style={{ fontSize: 10, opacity: 0.85 }}>{p.market}</div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 3 }}>
              ৳{p.retail_price_min}–{p.retail_price_max}
              <span style={{ fontSize: 9, opacity: 0.75 }}>/কেজি</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UdbhidGoenda() {
  const [activeTab, setActiveTab] = useState("home");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ud-form") || "{}");
      return {
        crop: saved.crop || "",
        district: saved.district || "",
        season: saved.season || getCurrentSeason(),
        growthStage: saved.growthStage || "",
        symptoms: "",
        duration: saved.duration || "",
        affectedArea: saved.affectedArea || "",
      };
    } catch {
      return {
        crop: "",
        district: "",
        season: getCurrentSeason(),
        growthStage: "",
        symptoms: "",
        duration: "",
        affectedArea: "",
      };
    }
  });
  const [diagnosisMode, setDiagnosisMode] = useState("online"); // "online" or "offline"
  const [showMoreCrops, setShowMoreCrops] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  // Multi-image support (2-4 images)
  const [images, setImages] = useState([]); // array of data URLs for display
  const [imageBase64s, setImageBase64s] = useState([]); // array of base64 for API
  const [result, setResult] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ud-history") || "[]");
    } catch {
      return [];
    }
  });
  const [pesticideDb, setPesticideDb] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  // Structured AI output
  const [structuredResult, setStructuredResult] = useState(null);
  // Symptom matches from offline engine (for ConfidenceDashboard)
  const [symptomMatches, setSymptomMatches] = useState(null);
  // CABI reference images (offline visual enrichment)
  const [referenceImages, setReferenceImages] = useState(null);
  // Follow-up questions
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const fileRef = useRef();
  const recognitionRef = useRef(null);
  const resultRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [vitPrediction, setVitPrediction] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locationName, setLocationName] = useState(null);
  const [coords, setCoords] = useState(null);
  const [locationSource, setLocationSource] = useState(null);
  const [analysingCrop, setAnalysingCrop] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
  const [userEmail, setUserEmail] = useState(() => {
    try {
      return localStorage.getItem("ud-user-email") || "";
    } catch {
      return "";
    }
  });
  const [visitorStats, setVisitorStats] = useState(() => ({ visits: 1, sections: {} }));
  const [visitorId, setVisitorId] = useState(() => {
    try {
      return localStorage.getItem("ud-visitor-id") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("ud-dark");
      if (stored !== null) return stored === "true";
      return getPreferredTheme() === "dark";
    } catch {
      return false;
    }
  });
  const C = darkMode ? darkThemeFull : lightThemeFull;
  setThemeTokens(C); // sync module-level bridge for child functions

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem("ud-onboarded");
    } catch {
      return true;
    }
  });
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem("ud-onboarded", "true");
    } catch {}
  };

  // Session ID for server-side history
  const sessionIdRef = useRef(null);
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `sid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }, []);
  const sessionId = sessionIdRef.current;

  const galleryRef = useRef();
  const cameraRef = useRef();
  const isDesktop = viewportWidth >= 1100;
  const isGameTab = activeTab === "game";

  // Dark mode save preference + sync CSS variables
  useEffect(() => {
    try {
      localStorage.setItem("ud-dark", String(darkMode));
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
      const theme = darkMode ? darkThemeFull : lightThemeFull;
      const r = document.documentElement.style;
      r.setProperty("--c-bg", theme.bg);
      r.setProperty("--c-bg-card", theme.bgCard);
      r.setProperty("--c-bg-muted", theme.bgMuted);
      r.setProperty("--c-bg-header", theme.bgHeader);
      r.setProperty("--c-bg-nav", theme.bgNav);
      r.setProperty("--c-text", theme.text);
      r.setProperty("--c-text-muted", theme.textMuted);
      r.setProperty("--c-text-light", theme.textLight);
      r.setProperty("--c-border", theme.border);
      r.setProperty("--c-primary", theme.primary);
      r.setProperty("--c-primary-dark", theme.primaryDark);
      r.setProperty("--c-primary-light", theme.primaryLight);
      r.setProperty("--c-accent", theme.accent);
      r.setProperty("--c-success", theme.success);
      r.setProperty("--c-warning", theme.warning);
      r.setProperty("--c-danger", theme.danger);
      r.setProperty("--c-blue", theme.blue);
      r.setProperty("--c-shadow", theme.shadow);
      r.setProperty("--c-shadow-md", theme.shadowMd);
      r.setProperty("--c-shadow-lg", theme.shadowLg);
      // Tinted backgrounds & borders for dark-mode compatibility
      r.setProperty("--c-bg-danger", theme.bgDanger || "#fef2f2");
      r.setProperty("--c-bg-success", theme.bgSuccess || "#f0fdf4");
      r.setProperty("--c-bg-warning", theme.bgWarning || "#fffbeb");
      r.setProperty("--c-bg-info", theme.bgInfo || "#eff6ff");
      r.setProperty("--c-bg-blue", theme.bgBlue || "#f0f9ff");
      r.setProperty("--c-bg-purple", theme.bgPurple || "#faf5ff");
      r.setProperty("--c-bg-teal", theme.bgTeal || "#ecfeff");
      r.setProperty("--c-bg-orange", theme.bgOrange || "#fff7ed");
      r.setProperty("--c-border-danger", theme.borderDanger || "#fecaca");
      r.setProperty("--c-border-success", theme.borderSuccess || "#bbf7d0");
      r.setProperty("--c-border-warning", theme.borderWarning || "#fcd34d");
      r.setProperty("--c-border-info", theme.borderInfo || "#bfdbfe");
      r.setProperty("--c-border-blue", theme.borderBlue || "#bae6fd");
      r.setProperty("--c-border-purple", theme.borderPurple || "#e9d5ff");
      r.setProperty("--c-border-teal", theme.borderTeal || "#a5f3fc");
      r.setProperty("--c-border-orange", theme.borderOrange || "#fed7aa");
      r.setProperty("--c-badge-success", theme.badgeSuccess || "#dcfce7");
      r.setProperty("--c-badge-warning", theme.badgeWarning || "#fef3c7");
      r.setProperty("--c-text-success", theme.textSuccess || "#14532d");
      r.setProperty("--c-text-danger", theme.textDanger || "#991b1b");
      r.setProperty("--c-text-warning", theme.textWarning || "#92400e");
      r.setProperty("--c-text-info", theme.textInfo || "#1e40af");
      r.setProperty("--c-text-blue", theme.textBlue || "#0369a1");
      r.setProperty("--c-text-purple", theme.textPurple || "#6b21a8");
      r.setProperty("--c-text-teal", theme.textTeal || "#155e75");
      r.setProperty("--c-text-orange", theme.textOrange || "#9a3412");
    }
  }, [darkMode]);

  // Persist form data (crop, district, season, duration, affectedArea) to localStorage
  useEffect(() => {
    try {
      const toSave = {
        crop: form.crop,
        district: form.district,
        season: form.season,
        growthStage: form.growthStage,
        duration: form.duration,
        affectedArea: form.affectedArea,
      };
      localStorage.setItem("ud-form", JSON.stringify(toSave));
    } catch {}
  }, [form.crop, form.district, form.season, form.growthStage, form.duration, form.affectedArea]);

  // Load history from server on mount
  useEffect(() => {
    fetch("/api/diagnoses?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.diagnoses && data.diagnoses.length > 0) {
          setHistory((prev) => {
            const serverHistory = data.diagnoses.map((d) => ({
              crop: d.crop || "",
              district: d.district || "",
              date: d.createdAt ? new Date(d.createdAt).toLocaleDateString("bn-BD") : "",
              resultPreview: d.diseaseName || d.diseaseNameBn || "",
              fromServer: true,
            }));
            // Merge with localStorage history, deduplicating
            const all = [...serverHistory, ...prev.filter((h) => !h.fromServer)];
            return all.slice(0, 20);
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/pesticides.json")
      .then((r) => r.json())
      .then((d) => setPesticideDb(d))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("ud-visitor-stats") || "{}");
      const next = {
        visits: (raw.visits || 0) + 1,
        sections: raw.sections || {},
        totalVisits: raw.totalVisits || 0,
        uniqueVisitors: raw.uniqueVisitors || 0,
      };
      const id = localStorage.getItem("ud-visitor-id") || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("ud-visitor-id", id);
      setVisitorId(id);
      localStorage.setItem("ud-visitor-stats", JSON.stringify(next));
      setVisitorStats(next);
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      localStorage.setItem("ud-user-email", userEmail || "");
    } catch {}
  }, [userEmail]);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("ud-visitor-stats") || "{}");
      const next = {
        visits: raw.visits || 1,
        sections: { ...(raw.sections || {}), [activeTab]: (raw.sections?.[activeTab] || 0) + 1 },
        totalVisits: raw.totalVisits || 0,
        uniqueVisitors: raw.uniqueVisitors || 0,
      };
      localStorage.setItem("ud-visitor-stats", JSON.stringify(next));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisitorStats(next);
    } catch {}
  }, [activeTab]);
  useEffect(() => {
    if (!visitorId) return;
    postJson("/api/analytics", { visitorId, section: "app_open" })
      .then((data) => {
        if (data?.totalVisits) {
          setVisitorStats((prev) => ({
            ...prev,
            totalVisits: data.totalVisits,
            uniqueVisitors: data.uniqueVisitors,
            sections: data.sections || prev.sections,
          }));
          try {
            localStorage.setItem(
              "ud-visitor-stats",
              JSON.stringify({
                ...visitorStats,
                totalVisits: data.totalVisits,
                uniqueVisitors: data.uniqueVisitors,
                sections: data.sections || visitorStats.sections,
                visits: visitorStats.visits || 1,
              }),
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, [visitorId, visitorStats]);
  useEffect(() => {
    if (!visitorId || !activeTab) return;
    postJson("/api/analytics", { visitorId, section: activeTab })
      .then((data) => {
        if (data?.totalVisits)
          setVisitorStats((prev) => ({
            ...prev,
            totalVisits: data.totalVisits,
            uniqueVisitors: data.uniqueVisitors,
            sections: data.sections || prev.sections,
          }));
      })
      .catch(() => {});
  }, [visitorId, activeTab]);

  // ─── Real-time presence heartbeat (Turso) ──────────────────
  useEffect(() => {
    if (!visitorId) return;
    const isPwa = window.matchMedia?.("(display-mode: standalone)").matches || false;
    const sendHeartbeat = () => {
      postJson("/api/presence", { visitorId, section: activeTab || "home", isPwa }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    const cleanup = () => {
      clearInterval(interval);
      postJson("/api/presence", { visitorId, section: activeTab || "home", isPwa, _leave: true }).catch(() => {});
      signedFetch("/api/presence", { method: "DELETE", body: JSON.stringify({ visitorId }) }).catch(() => {});
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, [visitorId, activeTab]);

  useEffect(() => {
    if (!pesticideDb || !result || !form.crop) return;
    const text = (result.bn + " " + result.en).toLowerCase();
    const cropKey = Object.keys(pesticideDb.crop_to_product_map).find(
      (k) =>
        form.crop.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(form.crop.split("/")[0].trim().toLowerCase()),
    );
    const cropIds = cropKey ? pesticideDb.crop_to_product_map[cropKey] || [] : [];
    const pestIds = [];
    for (const [pest, ids] of Object.entries(pesticideDb.pest_to_product_map))
      if (text.includes(pest.toLowerCase())) ids.forEach((id) => pestIds.push(id));
    const allIds = [...new Set([...pestIds, ...cropIds])];
    const matched = allIds.map((id) => pesticideDb.products.find((p) => p.id === id)).filter(Boolean);
    const pestSet = new Set(pestIds);
    matched.sort((a, b) => {
      const aP = pestSet.has(a.id) ? 1 : 0;
      const bP = pestSet.has(b.id) ? 1 : 0;
      if (bP !== aP) return bP - aP;
      return (b.rating || 0) - (a.rating || 0);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecommendedProducts(matched.slice(0, 5));
  }, [pesticideDb, result, form.crop]);

  // Update symptom matches when crop or symptoms change (avoid setState during render)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!form.crop || !form.symptoms) {
      setSymptomMatches(null);
      return;
    }
    const cropKey = resolveCropKey(form.crop);
    if (!cropKey) {
      setSymptomMatches(null);
      return;
    }
    const userSymptoms = form.symptoms.split("\n").filter(Boolean);
    if (userSymptoms.length === 0) {
      setSymptomMatches(null);
      return;
    }
    try {
      const matches = matchDiseasesBySymptoms(form.crop, userSymptoms);
      setSymptomMatches(matches || null);
    } catch {
      setSymptomMatches(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [form.crop, form.symptoms]);

  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const d = await (
        await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,uv_index&daily=precipitation_sum&timezone=Asia%2FDhaka&forecast_days=1`,
        )
      ).json();
      const c = d.current;
      setWeather({
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: Math.round(c.relative_humidity_2m),
        rain24h: Math.round((d.daily?.precipitation_sum?.[0] ?? c.precipitation ?? 0) * 10) / 10,
        windSpeed: Math.round(c.wind_speed_10m),
        uvIndex: Math.round(c.uv_index),
      });
    } catch {}
  }, []);

  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const d = await (
        await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
          { headers: { "User-Agent": "UddhidGoenda/1.0" } },
        )
      ).json();
      const district =
        d.address?.county ||
        d.address?.state_district ||
        d.address?.city ||
        d.address?.town ||
        d.address?.village ||
        "";
      setLocationName([district, "Bangladesh"].filter(Boolean).join(", "));
      const m = findDistrictMatch(district, d.address?.state, d.address?.region);
      if (m) setForm((f) => ({ ...f, district: f.district || m }));
    } catch {
      setLocationName("Bangladesh");
    }
  }, []);

  const fetchByIP = useCallback(async () => {
    try {
      const d = await (await fetch("https://ip-api.com/json/?fields=lat,lon,city,regionName")).json();
      if (d.lat && d.lon) {
        setCoords({ lat: d.lat, lon: d.lon });
        setLocationSource("ip");
        setLocationName([d.city, d.regionName, "Bangladesh"].filter(Boolean).join(", "));
        await fetchWeather(d.lat, d.lon);
        const m = findDistrictMatch(d.city, d.regionName);
        if (m) setForm((f) => ({ ...f, district: f.district || m }));
      } else {
        setCoords({ lat: 23.685, lon: 90.356 });
        setLocationName("Bangladesh");
        await fetchWeather(23.685, 90.356);
      }
    } catch {}
  }, [fetchWeather]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeatherLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          setCoords({ lat, lon });
          setLocationSource("gps");
          await Promise.all([fetchWeather(lat, lon), reverseGeocode(lat, lon)]);
          setWeatherLoading(false);
        },
        async () => {
          await fetchByIP();
          setWeatherLoading(false);
        },
        { timeout: 8000 },
      );
    } else {
      fetchByIP().then(() => setWeatherLoading(false));
    }
  }, [fetchWeather, reverseGeocode, fetchByIP]);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setForm((f) => (f.season ? f : { ...f, season: getCurrentSeason() }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    setTtsSupported(!!window.speechSynthesis);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const refreshWeather = async () => {
    if (!coords) return;
    setWeatherLoading(true);
    await fetchWeather(coords.lat, coords.lon);
    setWeatherLoading(false);
  };

  const detectCropFromImage = useCallback(async (base64, fileName = "") => {
    setAnalysingCrop(true);
    try {
      const res = await signedFetch("/api/diagnose", {
        method: "POST",
        body: JSON.stringify({
          systemPrompt: CROP_DETECT_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
                {
                  type: "text",
                  text: `Identify the crop in this image. Filename: ${fileName || "unknown"}. Return JSON only.`,
                },
              ],
            },
          ],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map((b) => b.text || "").join("\n") || "";
      let crop = "";
      try {
        crop = guessCropFromText(JSON.parse(raw).crop || "");
      } catch {
        crop = guessCropFromText(raw);
      }
      if (crop) setForm((f) => (f.crop ? f : { ...f, crop }));
    } catch {
    } finally {
      setAnalysingCrop(false);
    }
  }, []);
  const handleImageFile = (file) => {
    if (!file) return;
    if (images.length >= 4) return; // max 4 images
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    // Pick the first unused label (fixes duplicate labels after image removal)
    const usedLabels = new Set(images.map((im) => im.label));
    const nextLabel = IMAGE_LABELS.find((l) => !usedLabels.has(l)) || `ছবি ${images.length + 1}`;
    img.onload = () => {
      try {
        const MAX = 800;
        let { width: w, height: h } = img;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        const dataUrl = cv.toDataURL("image/jpeg", 0.7);
        const base64 = dataUrl.split(",")[1];
        setImages((prev) => [...prev, { url: dataUrl, label: nextLabel }]);
        setImageBase64s((prev) => [...prev, base64]);
        const cropFromName = guessCropFromText(file.name || "");
        if (cropFromName) setForm((f) => (f.crop ? f : { ...f, crop: cropFromName }));
        else if (images.length === 0) detectCropFromImage(base64, file.name);
      } catch (err) {
        console.error("Image processing failed:", err);
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      console.error("Image load failed");
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };
  // Apply a ViT prediction: pre-fill the form with the predicted crop and a
  // symptom hint derived from the predicted disease. Read-only — does not
  // submit. User still runs the CABI 5-step protocol.
  const applyVitPrediction = (entry) => {
    if (!entry || entry.category === "invalid") return;
    const newCrop = entry.cropEn || entry.cropBn;
    const hint = entry.diseaseBn || entry.diseaseEn;
    setForm((f) => {
      const next = { ...f };
      if (newCrop) next.crop = newCrop;
      // Append hint to existing symptoms if it's a disease; otherwise clear.
      if (!entry.isHealthy && hint) {
        const trimmed = (f.symptoms || "").trim();
        next.symptoms = trimmed ? `${trimmed}\n${hint}` : hint;
      }
      return next;
    });
  };
  // Capture the on-device ViT top prediction for LLM grounding, offline engine
  // boost, and history persistence. Only the top (highest-confidence) entry is
  // kept — healthy/"no leaf" frames are treated as no prediction.
  const handleVitResult = (topK) => {
    const top = Array.isArray(topK) ? topK[0] : null;
    setVitPrediction(top && top.category !== "invalid" ? { ...top } : null);
  };
  const handleImage = (e) => {
    handleImageFile(e.target.files?.[0]);
    e.target.value = "";
  };
  const removeImage = (idx) => {
    const willBeEmpty = images.length - 1 <= 0;
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageBase64s((prev) => prev.filter((_, i) => i !== idx));
    if (willBeEmpty) setVitPrediction(null);
  };

  const handleSubmit = async () => {
    if (!form.crop || !form.symptoms) {
      setError("অনুগ্রহ করে ফসল এবং লক্ষণ উভয়ই পূরণ করুন।");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setRecommendedProducts([]);
    setReferenceImages(null);
    // Snapshot of the on-device ViT prediction (if any). Used for LLM grounding,
    // offline engine boost, and history persistence. "Healthy" frames are ignored.
    const vitSnapshot =
      vitPrediction && !vitPrediction.isHealthy
        ? {
            crop: vitPrediction.cropEn || vitPrediction.cropBn || null,
            cropBn: vitPrediction.cropBn || null,
            disease: vitPrediction.diseaseEn || vitPrediction.diseaseBn || null,
            diseaseBn: vitPrediction.diseaseBn || null,
            diseaseEn: vitPrediction.diseaseEn || null,
            confidence: Number.isFinite(vitPrediction.confidence) ? vitPrediction.confidence : null,
            label: vitPrediction.label || null,
          }
        : null;

    if (diagnosisMode === "offline") {
      // Use offline diagnosis
      try {
        // Prepare input data for offline diagnosis
        const inputData = {
          crop: form.crop,
          symptoms: {
            leafSymptoms: form.symptoms,
            distribution: form.affectedArea || "N/A",
            progression: form.duration || "N/A",
            signs: "N/A",
          },
          hostInfo: {
            varietySusceptibility: getVarietySusceptibility(form.crop) || "medium",
            growthStage: form.growthStage || "N/A",
          },
          pathogenInfo: {
            inoculumPressure: estimateInoculumPressure(form.crop, form.season) || "low",
            season: form.season || "",
            recentHistory: "none",
          },
          envInfo: weather
            ? {
                temp: weather.temp,
                humidity: weather.humidity,
                rainfall: weather.rain24h,
              }
            : null,
          vitPrediction: vitSnapshot,
        };

        // Perform offline diagnosis (synchronous rule-based engine)
        const baseResult = diagnoseOffline(inputData);
        // Enrich with CABI reference images (async — uses /database.json + /images/)
        const offlineResult = await enrichDiagnosisWithImages(baseResult, inputData);
        // Save reference images separately for the UI to render
        const referenceImages = offlineResult.referenceImages || {
          overall: [],
          perDisease: [],
          visualConfidence: "none",
        };

        // Convert offline result to format compatible with existing result display
        const banglaText = `
---BANGLA_SECTION---
## ১. CABI বর্জন পদ্ধতি অনুযায়ী বিশ্লেষণ
**অ্যাবায়োটিক নাকি বায়োটিক:** ${offlineResult.abioticBiotic === "abiotic" ? "অবায়টিক (পরিবেশজ)" : offlineResult.abioticBiotic === "biotic" ? "বায়োটিক (জীবজিৎ)" : "নিশ্চিত নয়"}
**বর্জন গেট ফলাফল:** ${offlineResult.excluded.length > 0 ? offlineResult.excluded.join(", ") : "কোনো কারণ বাদ দেয়নি"} || ${offlineResult.suspects.length > 0 ? offlineResult.suspects.join(", ") : "কোনোসন্দেহ নেই"}

## ২. সম্ভাব্য রোগ / পোকার নাম
**প্রাথমিক সন্দেহ:** ${offlineResult.primarySuspect}
${
  offlineResult.specificDisease
    ? `**সনাক্ত রোগ:** ${offlineResult.specificDisease.nameBn} (${offlineResult.specificDisease.name})
**কারণ:** ${offlineResult.specificDisease.cause === "fungal" ? "ছত্রাক" : offlineResult.specificDisease.cause === "bacterial" ? "ব্যাকটেরিয়া" : offlineResult.specificDisease.cause === "viral" ? "ভাইরাস" : offlineResult.specificDisease.cause === "insect" ? "পোকা" : offlineResult.specificDisease.cause}
**রোগজীবাণু:** ${offlineResult.specificDisease.pathogen}
**তীব্রতা:** ${offlineResult.specificDisease.severity === "severe" ? "মারাত্মক" : offlineResult.specificDisease.severity === "moderate" ? "মাঝারি" : "হালকা"}
**মিলের হার:** ${Math.round((offlineResult.specificDisease.matchRatio || 0) * 100)}%
**মিলে যাওয়া লক্ষণ:** ${offlineResult.specificDisease.matchedSymptoms?.join(", ") || "N/A"}`
    : ""
}
${
  offlineResult.cropDiseaseMatches?.length > 1
    ? `**অন্যান্য সম্ভাব্য রোগ:** ${offlineResult.cropDiseaseMatches
        .slice(1, 4)
        .map((m) => `${m.nameBn} (${Math.round((m.matchRatio || 0) * 100)}%)`)
        .join(" | ")}`
    : ""
}
**বিকল্প সন্দেহ (যদি থাকে):** ${offlineResult.suspects.slice(1, 3).length > 0 ? offlineResult.suspects.slice(1, 3).join(" ; ") : "না"}
**আস্থার মাত্রা:** ${offlineResult.confidence}

## ৩. রোগ ত্রিভুজ মূল্যায়ন
**পোষক (Host):** ${offlineResult.diseaseTriangle.host}
**জীবাণু (Pathogen):** ${offlineResult.diseaseTriangle.pathogen}
**পরিবেশ (Environment):** ${offlineResult.diseaseTriangle.environment}

## ৪. মাঠে নিশ্চিতকরণের পদ্ধতি
${offlineResult.fieldConfirmation.map((method, idx) => `${idx + 1}. ${method}`).join("\n")}

## ৫. তীব্রতা ও অর্থনৈতিক গুরুত্ব
**ক্ষয়ক্ষতির মাত্রা:** ${offlineResult.specificDisease?.severity === "severe" ? "মারাত্মক (দ্রুত ব্যবস্থা নিন)" : offlineResult.specificDisease?.severity === "moderate" ? "মাঝারি (সতর্কতা প্রয়োজন)" : offlineResult.specificDisease?.severity === "low" ? "হালকা" : offlineResult.diseaseTriangle?.riskLevel || "মূল্যায়ন প্রয়োজন"}
**অর্থনৈতিক থ্রেশহোল্ড:** ${offlineResult.economicThreshold}

## ৬. সমন্বিত বালাই ব্যবস্থাপনা (IPM)
**কৃষি ব্যবস্থাপনা (সর্বোচ্চ অগ্রাধিকার):**
${offlineResult.ipmRecommendations.cultural.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}
**জৈবিক নিয়ন্ত্রণ:**
${offlineResult.ipmRecommendations.biological.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}
**রাসায়নিক (শেষ উপায় — FRAC/IRAC গ্রুপ উল্লেখসহ):**
${offlineResult.ipmRecommendations.chemical.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

## ৭. প্রতিরোধ — পরবর্তী মৌসুম
${offlineResult.ipmRecommendations.prevention.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

## ৮. কখন DAE কর্মকর্তার পরামর্শ নেবেন
- শুত মূল্যায়ন নিশ্চিৎ হলে
- রोग দ্রুত প্রসারিত হলে
- নিরাপদ কিমিয়ার ব্যবহারে হুমকি হলে
---END_BANGLA---

---ENGLISH_SECTION---
## 1. CABI Exclusion Analysis
**Abiotic vs Biotic:** ${offlineResult.abioticBiotic}
**Exclusion Gates:** Excluded: ${offlineResult.excluded.join(", ")} | Suspects: ${offlineResult.suspects.join(", ")}

## 2. Probable Diagnosis
**Primary suspect:** ${offlineResult.primarySuspect}
${
  offlineResult.specificDisease
    ? `**Identified Disease:** ${offlineResult.specificDisease.nameBn} (${offlineResult.specificDisease.name})
**Cause:** ${offlineResult.specificDisease.cause}
**Pathogen:** ${offlineResult.specificDisease.pathogen}
**Severity:** ${offlineResult.specificDisease.severity}
**Match Ratio:** ${Math.round((offlineResult.specificDisease.matchRatio || 0) * 100)}%
**Matched Symptoms:** ${offlineResult.specificDisease.matchedSymptoms?.join(", ") || "N/A"}`
    : ""
}
${
  offlineResult.cropDiseaseMatches?.length > 1
    ? `**Other Possible Diseases:** ${offlineResult.cropDiseaseMatches
        .slice(1, 4)
        .map((m) => `${m.nameBn} (${Math.round((m.matchRatio || 0) * 100)}%)`)
        .join(" | ")}`
    : ""
}
**Differential diagnosis:** ${offlineResult.suspects.slice(1, 3).length > 0 ? offlineResult.suspects.slice(1, 3).join(" ; ") : "None"}
**Confidence level:** ${offlineResult.confidence}

## 3. Disease Triangle Assessment
**Host:** ${offlineResult.diseaseTriangle.host}
**Pathogen:** ${offlineResult.diseaseTriangle.pathogen}
**Environment:** ${offlineResult.diseaseTriangle.environment}
**Risk Level:** ${offlineResult.diseaseTriangle.riskLevel}

## 4. Field Confirmation Method
${offlineResult.fieldConfirmation.map((method, idx) => `${idx + 1}. ${method}`).join("\n")}

## 5. Severity & Economic Importance
**Damage level:** ${offlineResult.specificDisease?.severity || offlineResult.diseaseTriangle?.riskLevel || "Assessment required"}
**Economic threshold:** ${offlineResult.economicThreshold}

## 6. IPM Recommendations
**Cultural control (highest priority):**
${offlineResult.ipmRecommendations.cultural.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}
**Biological control:**
${offlineResult.ipmRecommendations.biological.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}
**Chemical — last resort (with FRAC/IRAC group):**
${offlineResult.ipmRecommendations.chemical.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

## 7. Prevention — Next Season
${offlineResult.ipmRecommendations.prevention.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

## 8. When to Consult DAE
- When initial assessment needs confirmation
- When disease is rapidly spreading
- When safe chemical application is uncertain
---END_ENGLISH---
`;

        setResult({
          bn: banglaText.split("---END_BANGLA---")[0].replace("---BANGLA_SECTION---", "").trim(),
          en: banglaText.split("---END_ENGLISH---")[0].split("---ENGLISH_SECTION---").pop().trim(),
        });
        setProvider("Offline CABI Diagnostic Engine");
        setReferenceImages(referenceImages);
        if (offlineResult.specificDisease) {
          setStructuredResult({
            disease: offlineResult.specificDisease.nameBn,
            cause: offlineResult.specificDisease.cause,
            severity: offlineResult.specificDisease.severity,
            confidence: offlineResult.confidence,
            crop: form.crop,
          });
        }
        setStep(2);

        const entry = {
          crop: form.crop,
          district: form.district,
          date: new Date().toLocaleDateString("bn-BD"),
          resultPreview: banglaText.substring(0, 100),
          vitPrediction: vitSnapshot,
        };
        const nh = [...history, entry].slice(-10);
        setHistory(nh);
        try {
          localStorage.setItem("ud-history", JSON.stringify(nh));
        } catch {}
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (err) {
        setError(`অফলাইন নিদানে সমস্যা: ${err.message}`);
        console.error("Offline diagnosis error:", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Online diagnosis (existing code)
    const uc = [];
    // LLM grounding: give the model a deterministic baseline from the on-device
    // ViT classifier (when available) so its diagnosis is anchored to the local
    // vision signal rather than starting from a blank slate.
    const vitGrounding = vitSnapshot
      ? `🛰️ LOCAL VISION MODEL (deterministic on-device classifier): top prediction is crop "${vitSnapshot.crop || "?"}" — disease "${vitSnapshot.diseaseBn || vitSnapshot.disease || "?"}" with confidence ${vitSnapshot.confidence != null ? Math.round(vitSnapshot.confidence * 100) + "%" : "n/a"}. Treat this as a strong baseline hint from automated leaf-image classification. Use it to shortlist candidate diseases, but always confirm against the symptom description below.\n\n`
      : "";
    // Send all images as separate content blocks with labels
    imageBase64s.forEach((b64, idx) => {
      const label = images[idx]?.label || `ছবি ${idx + 1}`;
      uc.push({ type: "text", text: `[${label}]` });
      uc.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
    });
    uc.push({
      type: "text",
      text: `${vitGrounding}Crop:${form.crop}\nDistrict:${form.district || locationName || "N/A"}\nSeason:${form.season || "N/A"}\nGrowth:${form.growthStage || "N/A"}\nDuration:${form.duration || "N/A"}\nArea:${form.affectedArea || "N/A"}\nSymptoms:${form.symptoms}\n${imageBase64s.length > 0 ? `${imageBase64s.length} photo(s) attached.` : "No photo."}\n${weatherPromptText(weather, locationName)}\n\nDiagnose using CABI Plantwise 5-step protocol. Use very simple Bangla for farmers. Avoid technical words unless you immediately explain them in plain language. Prefer short icon-led bullets and practical field actions.\n---BANGLA_SECTION---\n[Full Bangla]\n---END_BANGLA---\n---ENGLISH_SECTION---\n[Full English]\n---END_ENGLISH---`,
    });
    try {
      const res = await signedFetch("/api/diagnose", {
        method: "POST",
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: uc }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      const raw = data.content?.map((b) => b.text || "").join("\n") || "";
      const bn = (raw.match(/---BANGLA_SECTION---([\s\S]*?)---END_BANGLA---/) || [])[1]?.trim() || raw;
      const en = (raw.match(/---ENGLISH_SECTION---([\s\S]*?)---END_ENGLISH---/) || [])[1]?.trim() || "";
      setResult({ bn, en });
      setProvider(data.provider || null);
      if (data.structured) setStructuredResult(data.structured);
      setStep(2);
      const entry = {
        crop: form.crop,
        district: form.district,
        date: new Date().toLocaleDateString("bn-BD"),
        resultPreview: bn.slice(0, 80),
        vitPrediction: vitSnapshot,
      };
      const nh = [...history, entry].slice(-10);
      setHistory(nh);
      try {
        localStorage.setItem("ud-history", JSON.stringify(nh));
      } catch {}
      // Save to server
      try {
        const sig = await getSigningToken();
        await fetch("/api/diagnoses", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(sig ? { "X-Request-Signature": sig } : {}) },
          body: JSON.stringify({
            session_id: sessionId,
            crop: form.crop,
            disease_name: data.structured?.disease_name,
            disease_name_bn: data.structured?.disease_name_bn,
            confidence: data.structured?.confidence,
            severity: data.structured?.severity,
            biotic_abiotic: data.structured?.biotic_abiotic,
            provider: data.provider || null,
            symptoms: form.symptoms,
            recommendations: data.structured?.key_recommendations?.join("; "),
            weather_snapshot: weather ? JSON.stringify(weather) : null,
            district: form.district || locationName,
            image_count: images.length,
            vit_prediction: vitSnapshot ? JSON.stringify(vitSnapshot) : null,
          }),
        });
      } catch (e) {
        /* non-critical, don't block */ void e;
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(`রোগ নির্ণয়ে সমস্যা: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };
  const reset = () => {
    setForm((f) => {
      const next = {
        crop: "",
        district: f.district || "",
        season: getCurrentSeason(),
        growthStage: "",
        symptoms: "",
        duration: f.duration || "",
        affectedArea: f.affectedArea || "",
      };
      try {
        localStorage.setItem("ud-form", JSON.stringify(next));
      } catch {}
      return next;
    });
    setImages([]);
    setImageBase64s([]);
    setResult(null);
    setError(null);
    setProvider(null);
    setShowEnglish(false);
    setStep(1);
    setShowMoreCrops(false);
    setRecommendedProducts([]);
    setStructuredResult(null);
    setSymptomMatches(null);
    setReferenceImages(null);
    setFollowUpQuestion("");
    setFollowUpAnswer("");
    setFollowUpLoading(false);
    setVitPrediction(null);
    stopSpeaking();
  };

  // Follow-up question handler
  const handleFollowUp = async () => {
    if (!followUpQuestion.trim()) return;
    setFollowUpLoading(true);
    setFollowUpAnswer("");
    try {
      const uc = [];
      // Include previous diagnosis context as text (no need to re-send images for follow-up)
      const diagText = result?.bn || result?.en || "";
      uc.push({
        type: "text",
        text: `I previously diagnosed a crop problem. Here is the diagnosis summary:\n\nCrop: ${form.crop}\nDistrict: ${form.district || locationName || "N/A"}\nDiagnosis result:\n${diagText.slice(0, 800)}\n\nMy follow-up question: ${followUpQuestion}\n\nAnswer in simple Bangla for farmers. Be concise and practical. Focus only on the follow-up question. Do NOT repeat the entire diagnosis. Use short icon-led bullets.`,
      });
      const res = await signedFetch("/api/diagnose", {
        method: "POST",
        body: JSON.stringify({ max_tokens: 600, messages: [{ role: "user", content: uc }] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const ans = data.content?.map((b) => b.text || "").join("\n") || "";
      if (!ans.trim()) throw new Error("Empty response");
      setFollowUpAnswer(ans);
    } catch (e) {
      setFollowUpAnswer(`উত্তর দিতে সমস্যা হয়েছে: ${e.message}। আবার চেষ্টা করুন।`);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking();
    const r = new SR();
    recognitionRef.current = r;
    r.lang = "bn-BD";
    r.interimResults = true;
    r.continuous = false;
    r.onstart = () => setIsListening(true);
    r.onresult = (e) => {
      const t = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setForm((f) => ({ ...f, symptoms: f.symptoms ? f.symptoms.trimEnd() + " " + t : t }));
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
  };
  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };
  const speakResult = (text) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    const clean = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/---[\w_]+---/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = showEnglish ? "en-US" : "bn-BD";
    u.rate = 0.88;
    if (!showEnglish) {
      const v = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("bn"));
      if (v) u.voice = v;
    }
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const handleCropQuickSelect = (val) => {
    if (val === "__more__") {
      setShowMoreCrops(true);
      return;
    }
    setForm((f) => ({ ...f, crop: val }));
    setShowMoreCrops(false);
  };

  // style constants
  const labelSt = { display: "block", color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 5 };
  const selSt = {
    width: "100%",
    background: C.bgMuted,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    padding: "9px 10px",
    fontSize: 13,
    outline: "none",
    appearance: "none",
  };
  const chipSt = {
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
    cursor: "pointer",
    transition: "all .15s",
    flexShrink: 0,
  };

  const navTabs = [
    { id: "calendar", label: "ক্যালেন্ডার", icon: "📅" },
    { id: "learn", label: "শিখুন", icon: "📖" },
    { id: "diagnose", label: "নির্ণয়", icon: "🔬" },
    { id: "library", label: "ভান্ডার", icon: "📚" },
  ];
  const feedbackContext =
    activeTab === "diagnose"
      ? step === 2
        ? "Diagnosis Report"
        : "Diagnosis Form"
      : activeTab === "calendar"
        ? "Crop Calendar"
        : activeTab === "game"
          ? "Game Hub"
          : activeTab === "library" || activeTab === "apps" || activeTab === "history"
            ? "Information Library"
            : activeTab === "guide"
              ? "CABI Guide"
              : activeTab === "learn"
                ? "Learn"
                : "Home";
  const feedbackSummary =
    activeTab === "diagnose" && result
      ? `${form.crop || "Unknown crop"} | ${form.district || locationName || "Unknown district"} | ${(result.bn || result.en || "").slice(0, 160)}`
      : activeTab === "calendar"
        ? "Crop Calendar with weather & price data"
        : activeTab === "game"
          ? "Game tab feedback"
          : activeTab === "library"
            ? "Drive-based slide, reading, and audio library"
            : activeTab === "apps"
              ? "External agriculture apps hub"
              : activeTab === "guide"
                ? "CABI training guide view"
                : activeTab === "history"
                  ? `Saved reports: ${history.length}`
                  : activeTab === "learn"
                    ? "Learn section: Guide + Games"
                    : "General app feedback";

  return (
    <div style={{ minHeight: "100svh", background: C.bg, width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Onboarding */}
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} C={C} />}
      {!showOnboarding && (
        <>
          {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
          <a href="#main-content" className="skip-to-content">
            মূল বিষয়বস্তুতে যান
          </a>
          {/* Bangladesh Official National Colors Top Stripe */}
          <div
            style={{
              height: 3.5,
              width: "100%",
              background: "linear-gradient(90deg, #006a4e 0%, #006a4e 74%, #f42a41 74%, #f42a41 88%, #006a4e 88%)",
              position: "sticky",
              top: 0,
              zIndex: 101,
            }}
          />
          <div
            style={{
              background: C.bgHeader,
              padding: isGameTab ? "8px 16px" : "10px 16px",
              position: "sticky",
              top: 3.5,
              zIndex: 100,
              boxShadow: C.shadow,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                maxWidth: 1280,
                width: "100%",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Home icon button — quick navigate to home */}
              <button
                onClick={() => setActiveTab("home")}
                aria-label="Home"
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `1.5px solid ${C.primary}`,
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: activeTab !== "home" ? C.bgMuted : "transparent",
                  transition: "background .2s",
                }}
                title="হোম"
              >
                <img
                  src="/apple-touch-icon.png"
                  alt="উদ্ভিদ গোয়েন্দা"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                />
              </button>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <div
                  className="ud-headline"
                  style={{
                    color: C.primary,
                    fontWeight: 800,
                    fontSize: isGameTab ? 15 : 17,
                    letterSpacing: -0.5,
                    lineHeight: 1.2,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>উদ্ভিদ গোয়েন্দা</span>
                  <span
                    style={{
                      width: 8.5,
                      height: 8.5,
                      borderRadius: "50%",
                      background: "#f42a41",
                      display: "inline-block",
                      boxShadow: "0 0 6px rgba(244,42,65,0.75)",
                      flexShrink: 0,
                    }}
                    title="বাংলাদেশ"
                  />
                </div>
              </div>
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode((d) => !d)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.bgMuted,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              {activeTab !== "home" && (
                <button
                  onClick={() => setActiveTab("home")}
                  aria-label="Go home"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: C.bgMuted,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.primary,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🏠</span>
                  <span style={{ fontSize: 11 }}>হোম</span>
                </button>
              )}
              {step === 2 && result && (
                <button
                  onClick={reset}
                  aria-label="New diagnosis"
                  style={{
                    flexShrink: 0,
                    background: C.bgMuted,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.text,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  🔁 নতুন
                </button>
              )}
              {!isGameTab && <ShareAndInstallBar />}
            </div>
          </div>

          {/* ══ CONTENT ═════════════════════════════════════════════════════════ */}
          <div
            id="main-content"
            role="tabpanel"
            style={{
              flex: 1,
              padding: activeTab === "game" ? "10px 12px" : "14px",
              overflowY: activeTab === "game" ? "hidden" : "auto",
              overflowX: "hidden",
            }}
          >
            <div style={{ maxWidth: isDesktop ? 1280 : 1040, margin: "0 auto", width: "100%" }}>
              {activeTab === "home" && (
                <EnhancedHomeTab
                  setActiveTab={setActiveTab}
                  history={history}
                  weather={weather}
                  locationName={locationName}
                  coords={coords}
                />
              )}
              {activeTab === "home" && <MarketPriceTicker C={C} />}
              {activeTab === "home" &&
                (() => {
                  const alerts = getCurrentRiskAlerts();
                  if (alerts.length === 0) return null;
                  return (
                    <div
                      style={{
                        background: C.bgDanger,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                        border: `1px solid ${C.borderDanger}`,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.danger, marginBottom: 6 }}>
                        ⚠️ এই মৌসুমে ঝুঁকি
                      </div>
                      {alerts.map((a, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.text, marginBottom: 3 }}>
                          {a.icon} {a.crop}: {a.keyDiseases.join(", ")}
                        </div>
                      ))}
                    </div>
                  );
                })()}

              {/* ── TODAY tab (dedicated weather-decision page) ─────────── */}
              {activeTab === "today" && (
                <TodayDecisionView
                  C={C}
                  coords={coords}
                  locationName={locationName}
                  history={history}
                  onBack={() => setActiveTab("home")}
                />
              )}

              {/* ── CALENDAR tab (Crop Calendar + Weather + Price) ──────────── */}
              {activeTab === "calendar" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn .3s ease" }}>
                  <CropCalendarDashboard C={C} weather={weather} coords={coords} locationName={locationName} />
                  {/* Outbreak List */}
                  <div
                    style={{
                      background: C.bgCard,
                      borderRadius: 18,
                      padding: 18,
                      border: `1px solid ${C.border}`,
                      boxShadow: C.shadow,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.primaryDark, marginBottom: 8 }}>
                      🚨 রোগ প্রাদুর্ভাব
                    </div>
                    <OutbreakList C={C} district={form.district || locationName} postJson={postJson} />
                  </div>
                  {/* Quick links to apps & history */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                    <button
                      onClick={() => setActiveTab("apps")}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: "14px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: C.shadow,
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>🌐</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>কৃষি অ্যাপস</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>আরও সেবা দেখুন</div>
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: "14px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: C.shadow,
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>📋</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>নির্ণয় ইতিহাস</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>আগের রিপোর্ট</div>
                    </button>
                  </div>
                </div>
              )}

              {/* ── LEARN sub-view (Guide + Games) ────────────────────── */}
              {activeTab === "learn" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn .3s ease" }}>
                  <div
                    style={{
                      background: C.bgCard,
                      borderRadius: 18,
                      padding: 20,
                      boxShadow: C.shadow,
                      border: `1px solid ${C.border}`,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
                    <h2
                      className="ud-headline"
                      style={{ fontWeight: 800, fontSize: 22, color: C.text, marginBottom: 6 }}
                    >
                      শিখুন ও অনুশীলন করুন
                    </h2>
                    <p
                      style={{
                        fontSize: 13,
                        color: C.textMuted,
                        lineHeight: 1.6,
                        marginBottom: 16,
                        maxWidth: 400,
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    >
                      CABI প্রোটোকল ধাপে ধাপে পড়ুন, তারপর গেম খেলে দক্ষ হন।
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
                    <button
                      onClick={() => setActiveTab("guide")}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 18,
                        padding: "24px 18px",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: C.shadow,
                        animation: "popIn .4s ease both",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          background: C.bgInfo,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                          border: "1.5px solid #2563eb18",
                        }}
                      >
                        📖
                      </div>
                      <div>
                        <div
                          className="ud-headline"
                          style={{ fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 4 }}
                        >
                          CABI গাইড
                        </div>
                        <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.6 }}>
                          CABI Plantwise ৫-ধাপ রোগ নির্ণয় প্রোটোকল ধাপে ধাপে পড়ুন ও বুঝুন। ETL সীমা, পুষ্টি তথ্য ও IPM
                          পিরামিড সহ।
                        </div>
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#2563eb",
                          marginTop: 4,
                        }}
                      >
                        গাইড পড়ুন <span style={{ fontSize: 14 }}>→</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("game")}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 18,
                        padding: "24px 18px",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: C.shadow,
                        animation: "popIn .4s ease .1s both",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          background: C.bgPurple,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                          border: "1.5px solid #7c3aed18",
                        }}
                      >
                        🎮
                      </div>
                      <div>
                        <div
                          className="ud-headline"
                          style={{ fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 4 }}
                        >
                          গেম হাব
                        </div>
                        <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.6 }}>
                          ৫টি ইন্টারেক্টিভ গেম খেলে CABI নির্ণয় প্রক্রিয়া চর্চা করুন! লক্ষণ চেনা থেকে IPM সিদ্ধান্ত —
                          সব গেমে।
                        </div>
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#7c3aed",
                          marginTop: 4,
                        }}
                      >
                        গেম খেলুন <span style={{ fontSize: 14 }}>→</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Copilot is now a floating FAB — see CopilotFAB component below */}

              {activeTab === "apps" && (
                <div>
                  <AppsHub />
                  <button
                    onClick={() => setActiveTab("library")}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: C.bgMuted,
                      color: C.textMuted,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ← তথ্যভান্ডারে ফিরুন
                  </button>
                </div>
              )}

              {/* ── DIAGNOSE ─────────────────────────────────────────────── */}
              {activeTab === "diagnose" && (
                <div>
                  <WeatherBar
                    weather={weather}
                    weatherLoading={weatherLoading}
                    locationName={locationName}
                    locationSource={locationSource}
                    onRefresh={refreshWeather}
                  />
                  <SprayingWidget weather={weather} weatherLoading={weatherLoading} />
                  <DiagnosisHistory
                    history={history}
                    onLoad={(h) => setForm((f) => ({ ...f, crop: h.crop || "", district: h.district || "" }))}
                  />

                  {step === 1 && (
                    <div>
                      {/* Leaf Frame Info Box with integrated image picker */}
                      <div
                        className="ud-editorial-shadow"
                        style={{
                          background: C.bgCard,
                          borderRadius: 28,
                          padding: 18,
                          marginBottom: 12,
                          border: `1px solid ${C.border}`,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                            gap: 18,
                            alignItems: "stretch",
                          }}
                        >
                          {/* Left: Leaf frame + image picker */}
                          <div
                            style={{
                              minHeight: 280,
                              borderRadius: 26,
                              background: "linear-gradient(135deg,#d2e9d0,#f5fbf6)",
                              position: "relative",
                              overflow: "hidden",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 18,
                                border: `2px solid ${C.primary}55`,
                                borderRadius: 20,
                                pointerEvents: "none",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  top: 12,
                                  width: 28,
                                  height: 28,
                                  borderTop: `3px solid ${C.primary}`,
                                  borderLeft: `3px solid ${C.primary}`,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  right: 12,
                                  top: 12,
                                  width: 28,
                                  height: 28,
                                  borderTop: `3px solid ${C.primary}`,
                                  borderRight: `3px solid ${C.primary}`,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  bottom: 12,
                                  width: 28,
                                  height: 28,
                                  borderBottom: `3px solid ${C.primary}`,
                                  borderLeft: `3px solid ${C.primary}`,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  right: 12,
                                  bottom: 12,
                                  width: 28,
                                  height: 28,
                                  borderBottom: `3px solid ${C.primary}`,
                                  borderRight: `3px solid ${C.primary}`,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  left: 18,
                                  right: 18,
                                  height: 2,
                                  background: "#9bf7a8",
                                  top: "22%",
                                  boxShadow: "0 0 18px rgba(26,122,58,0.55)",
                                  animation: images.length === 0 ? "scan 3.2s linear infinite" : "none",
                                  opacity: images.length === 0 ? 1 : 0,
                                }}
                              />
                            </div>
                            {/* Main image area */}
                            <div
                              style={{
                                flex: 1,
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: 160,
                              }}
                            >
                              {images.length > 0 ? (
                                <img
                                  src={images[0].url}
                                  alt="preview"
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "26px 26px 0 0",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    zIndex: 1,
                                  }}
                                >
                                  <div style={{ fontSize: 62 }}>🍃</div>
                                  <div
                                    className="ud-headline"
                                    style={{ fontWeight: 800, fontSize: 22, color: C.primaryDark }}
                                  >
                                    পাতা ফ্রেমের মাঝে রাখুন
                                  </div>
                                  <div style={{ fontSize: 12, color: C.textMuted }}>
                                    ভালো আলো থাকলে ফল বেশি নির্ভুল হয়
                                  </div>
                                </div>
                              )}
                              {images.length > 0 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 14,
                                    right: 14,
                                    padding: "5px 10px",
                                    borderRadius: 999,
                                    background: "rgba(0,96,40,0.88)",
                                    color: "#fff",
                                    fontSize: 10,
                                    fontWeight: 800,
                                    zIndex: 2,
                                  }}
                                >
                                  {images.length}টি ছবি
                                </div>
                              )}
                            </div>
                            {/* Thumbnail strip + upload controls INSIDE leaf frame */}
                            <div
                              style={{
                                padding: "8px 10px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "rgba(255,255,255,0.7)",
                                backdropFilter: "blur(6px)",
                                borderRadius: "0 0 26px 26px",
                              }}
                            >
                              <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                style={{ display: "none" }}
                              />
                              <input
                                ref={galleryRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                style={{ display: "none" }}
                              />
                              <input
                                ref={cameraRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImage}
                                style={{ display: "none" }}
                              />
                              {images.length === 0 ? (
                                <>
                                  <button
                                    onClick={() => cameraRef.current?.click()}
                                    style={{
                                      flex: 1,
                                      padding: "8px 6px",
                                      borderRadius: 12,
                                      border: "none",
                                      background: `linear-gradient(135deg,${C.primary},${C.primaryLight})`,
                                      color: "#fff",
                                      cursor: "pointer",
                                      fontWeight: 700,
                                      fontSize: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 4,
                                    }}
                                  >
                                    📸 ক্যামেরা
                                  </button>
                                  <button
                                    onClick={() => galleryRef.current?.click()}
                                    style={{
                                      flex: 1,
                                      padding: "8px 6px",
                                      borderRadius: 12,
                                      border: `1px solid ${C.border}`,
                                      background: "rgba(255,255,255,0.8)",
                                      color: C.primaryDark,
                                      cursor: "pointer",
                                      fontWeight: 700,
                                      fontSize: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 4,
                                    }}
                                  >
                                    🖼️ গ্যালারি
                                  </button>
                                </>
                              ) : (
                                <>
                                  {images.map((img, idx) => (
                                    <div key={idx} style={{ position: "relative", flexShrink: 0 }}>
                                      <img
                                        src={img.url}
                                        alt={img.label}
                                        style={{
                                          width: 40,
                                          height: 40,
                                          objectFit: "cover",
                                          borderRadius: 8,
                                          border: `2px solid ${idx === 0 ? C.primary : C.border}`,
                                        }}
                                      />
                                      <button
                                        onClick={() => removeImage(idx)}
                                        style={{
                                          position: "absolute",
                                          top: -3,
                                          right: -3,
                                          width: 14,
                                          height: 14,
                                          borderRadius: "50%",
                                          background: C.danger,
                                          color: "#fff",
                                          border: "none",
                                          cursor: "pointer",
                                          fontSize: 8,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          lineHeight: 1,
                                        }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                  {images.length < 4 && (
                                    <button
                                      onClick={() => galleryRef.current?.click()}
                                      style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 8,
                                        border: `2px dashed ${C.primary}`,
                                        background: "rgba(255,255,255,0.5)",
                                        color: C.primary,
                                        cursor: "pointer",
                                        fontSize: 18,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      +
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {/* Right: Info text + quick stats */}
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.primary,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textTransform: "uppercase",
                              }}
                            >
                              নতুন নির্ণয়
                            </div>
                            <div
                              className="ud-headline"
                              style={{ fontWeight: 800, fontSize: 28, color: C.primaryDark, lineHeight: 1.08 }}
                            >
                              পাতার ছবি দিন, বাকি তথ্য সহজে পূরণ করুন
                            </div>
                            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.75 }}>
                              ফসল, জেলা, মৌসুম, লক্ষণ আর ছবি একসাথে দিলে ফল বেশি ভালো আসে। ছবি থাকলে সিস্টেম নিজে ফসল
                              ধরারও চেষ্টা করবে.
                            </div>
                            {images.length > 0 && (
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <span
                                  style={{
                                    fontSize: 11,
                                    background: C.bgSuccess,
                                    padding: "4px 9px",
                                    borderRadius: 8,
                                    color: C.success,
                                    fontWeight: 700,
                                  }}
                                >
                                  ✅ {images.length}টি ছবি যুক্ত
                                </span>
                                {analysingCrop && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      background: C.bgInfo,
                                      padding: "4px 9px",
                                      borderRadius: 8,
                                      color: C.blue,
                                    }}
                                  >
                                    🔍 ফসল চিনে দেখছে...
                                  </span>
                                )}
                              </div>
                            )}
                            {form.crop && (
                              <div
                                style={{
                                  fontSize: 11,
                                  background: C.bgMuted,
                                  padding: "4px 9px",
                                  borderRadius: 8,
                                  color: C.textMuted,
                                  alignSelf: "flex-start",
                                }}
                              >
                                🌱 {form.crop}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* ── On-device ViT suggestions (Phase 1, read-only) ─────── */}
                      <VitSuggestions
                        imageDataUrl={images[0]?.url || null}
                        onApply={applyVitPrediction}
                        onResult={handleVitResult}
                        theme={C}
                      />
                      {/* crop */}
                      <div
                        style={{
                          background: C.bgCard,
                          borderRadius: 16,
                          padding: 14,
                          marginBottom: 10,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 10 }}>
                          🌱 ফসল নির্বাচন *
                        </div>
                        {!form.crop && !showMoreCrops && (
                          <QuickCropRow onSelect={handleCropQuickSelect} selected={form.crop} />
                        )}
                        {form.crop && !showMoreCrops && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                background: C.bgSuccess,
                                border: `1.5px solid ${C.primary}`,
                                borderRadius: 12,
                                padding: "8px 14px",
                                color: C.primaryDark,
                                fontWeight: 700,
                                fontSize: 13,
                                flex: 1,
                              }}
                            >
                              ✅ {form.crop}
                            </div>
                            <button
                              onClick={() => {
                                setForm((f) => ({ ...f, crop: "" }));
                                setShowMoreCrops(false);
                              }}
                              style={{
                                background: C.bgDanger,
                                border: `1px solid ${C.borderDanger}`,
                                borderRadius: 10,
                                color: C.danger,
                                padding: "7px 12px",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              পরিবর্তন
                            </button>
                          </div>
                        )}
                        {showMoreCrops && (
                          <div>
                            <button
                              onClick={() => setShowMoreCrops(false)}
                              style={{
                                background: "none",
                                border: "none",
                                color: C.primary,
                                cursor: "pointer",
                                fontSize: 13,
                                marginBottom: 8,
                                fontWeight: 600,
                              }}
                            >
                              ← ফিরুন
                            </button>
                            {Object.keys(CROPS).map((group) => (
                              <div key={group} style={{ marginBottom: 7 }}>
                                <button
                                  onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                                  style={{
                                    width: "100%",
                                    background: expandedGroup === group ? C.bgSuccess : C.bgMuted,
                                    border: `1px solid ${expandedGroup === group ? C.primary : C.border}`,
                                    borderRadius: 10,
                                    padding: "8px 12px",
                                    color: C.text,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  {group} {expandedGroup === group ? "▲" : "▼"}
                                </button>
                                {expandedGroup === group && (
                                  <div
                                    style={{
                                      background: C.bgCard,
                                      border: `1px solid ${C.border}`,
                                      borderTop: "none",
                                      borderRadius: "0 0 10px 10px",
                                      padding: 7,
                                      maxHeight: 190,
                                      overflowY: "auto",
                                    }}
                                  >
                                    {CROPS[group].map((crop) => (
                                      <div
                                        key={crop}
                                        onClick={() => {
                                          handleCropQuickSelect(crop);
                                          setExpandedGroup(null);
                                        }}
                                        style={{
                                          padding: "6px 10px",
                                          cursor: "pointer",
                                          fontSize: 12,
                                          color: C.text,
                                          borderRadius: 7,
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = C.bgSuccess)}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        {crop}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Diagnosis Mode Toggle */}
                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 8 }}>নিদান মোড</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <label style={{ cursor: "pointer", userSelect: "none" }}>
                                <input
                                  type="radio"
                                  name="diagnosisMode"
                                  value="online"
                                  checked={diagnosisMode === "online"}
                                  onChange={(e) => setDiagnosisMode(e.target.value)}
                                  style={{ margin: 0, width: 16, height: 16 }}
                                />
                                <span style={{ fontSize: 11, color: C.text }}>Online (AI-based)</span>
                              </label>
                              <div style={{ width: 1 }}></div>
                              <label style={{ cursor: "pointer", userSelect: "none" }}>
                                <input
                                  type="radio"
                                  name="diagnosisMode"
                                  value="offline"
                                  checked={diagnosisMode === "offline"}
                                  onChange={(e) => setDiagnosisMode(e.target.value)}
                                  style={{ margin: 0, width: 16, height: 16 }}
                                />
                                <span style={{ fontSize: 11, color: C.text }}>Offline (Rule-based)</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Voice diagnosis — speak symptoms in Bangla */}
                        <VoiceDiagnosis
                          onResult={(text) => {
                            setForm((f) => ({ ...f, symptoms: f.symptoms ? f.symptoms + ", " + text : text }));
                          }}
                          activeCrop={form.crop}
                        />
                      </div>

                      {form.crop &&
                        (() => {
                          const calEntry = CROP_CALENDAR.find(
                            (c) => form.crop?.includes(c.crop) || form.crop?.includes(c.cropEn),
                          );
                          if (!calEntry) return null;
                          const currentMonth = new Date().getMonth() + 1;
                          const activeSeason = calEntry.seasons.find((s) => s.months.includes(currentMonth));
                          if (!activeSeason) return null;
                          return (
                            <div
                              style={{
                                background: C.bgWarning,
                                border: `1px solid ${C.borderWarning}`,
                                borderRadius: 12,
                                padding: "10px 14px",
                                marginBottom: 10,
                                fontSize: 12,
                              }}
                            >
                              <div style={{ fontWeight: 700, color: C.textWarning, marginBottom: 4 }}>
                                📅 বর্তমান মৌসুম: {activeSeason.name} ({activeSeason.nameEn})
                              </div>
                              {activeSeason.riskPeriod && (
                                <div style={{ color: "#b45309", marginBottom: 3 }}>
                                  ⚠️ ঝুঁকির সময়: {activeSeason.riskPeriod}
                                </div>
                              )}
                              {activeSeason.keyDiseases?.length > 0 && (
                                <div style={{ color: C.textWarning }}>
                                  🦠 প্রধান রোগ: {activeSeason.keyDiseases.join(", ")}
                                </div>
                              )}
                              {activeSeason.keyPests?.length > 0 && (
                                <div style={{ color: C.textWarning }}>
                                  🐛 প্রধান পোকা: {activeSeason.keyPests.join(", ")}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      {/* location/season */}
                      <div
                        style={{
                          background: C.bgCard,
                          borderRadius: 16,
                          padding: 14,
                          marginBottom: 10,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <div>
                            <label style={labelSt}>
                              📍 জেলা {locationSource && <span style={{ color: C.blue, fontSize: 9 }}>(auto)</span>}
                            </label>
                            <select
                              value={form.district}
                              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                              style={selSt}
                            >
                              <option value="">-- জেলা --</option>
                              {DISTRICTS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={labelSt}>🗓️ মৌসুম</label>
                            <select
                              value={form.season}
                              onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                              style={selSt}
                            >
                              <option value="">-- মৌসুম --</option>
                              {SEASONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label style={labelSt}>🌿 বৃদ্ধির পর্যায়</label>
                          <select
                            value={form.growthStage}
                            onChange={(e) => setForm((f) => ({ ...f, growthStage: e.target.value }))}
                            style={selSt}
                          >
                            <option value="">-- পর্যায় --</option>
                            {GROWTH_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* duration */}
                      <div
                        style={{
                          background: C.bgCard,
                          borderRadius: 16,
                          padding: 14,
                          marginBottom: 10,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                      >
                        <label style={labelSt}>⏱️ সমস্যার সময়কাল</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {DURATION_CHIPS.map((chip) => {
                            const a = form.duration === chip.value;
                            return (
                              <button
                                key={chip.label}
                                onClick={() => setForm((f) => ({ ...f, duration: a ? "" : chip.value }))}
                                style={{
                                  ...chipSt,
                                  border: `1px solid ${a ? C.primary : C.border}`,
                                  background: a ? C.bgSuccess : C.bgMuted,
                                  color: a ? C.primaryDark : C.text,
                                  fontWeight: a ? 700 : 400,
                                }}
                              >
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* area */}
                      <div
                        style={{
                          background: C.bgCard,
                          borderRadius: 16,
                          padding: 14,
                          marginBottom: 10,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                      >
                        <label style={labelSt}>🗺️ আক্রান্ত এলাকা</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {AREA_CHIPS.map((chip) => {
                            const a = form.affectedArea === chip.value;
                            return (
                              <button
                                key={chip.label}
                                onClick={() => setForm((f) => ({ ...f, affectedArea: a ? "" : chip.value }))}
                                style={{
                                  ...chipSt,
                                  border: `1px solid ${a ? C.primary : C.border}`,
                                  background: a ? C.bgSuccess : C.bgMuted,
                                  color: a ? C.primaryDark : C.text,
                                  fontWeight: a ? 700 : 400,
                                }}
                              >
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* symptoms */}
                      <div
                        style={{
                          background: C.bgCard,
                          borderRadius: 16,
                          padding: 14,
                          marginBottom: 10,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 9,
                          }}
                        >
                          <label style={{ ...labelSt, marginBottom: 0 }}>🩺 লক্ষণ বর্ণনা *</label>
                          {voiceSupported && (
                            <button
                              onClick={isListening ? stopListening : startListening}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                border: `2px solid ${isListening ? C.danger : C.primary}`,
                                background: isListening ? C.bgDanger : C.bgSuccess,
                                cursor: "pointer",
                                fontSize: 17,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {isListening ? <span style={{ animation: "pulse 1s infinite" }}>⏹</span> : "🎙️"}
                            </button>
                          )}
                        </div>
                        {Object.entries(SYMPTOM_CHIPS).map(([group, chips]) => (
                          <div key={group} style={{ marginBottom: 9 }}>
                            <div
                              style={{
                                color: C.textMuted,
                                fontSize: 10,
                                fontWeight: 700,
                                marginBottom: 5,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              {group}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {chips.map((chip) => {
                                const a = form.symptoms.includes(chip.value);
                                return (
                                  <button
                                    key={chip.label}
                                    onClick={() => {
                                      if (a)
                                        setForm((f) => ({
                                          ...f,
                                          symptoms: f.symptoms.replace(chip.value, "").replace(/\n\n+/g, "\n").trim(),
                                        }));
                                      else
                                        setForm((f) => ({
                                          ...f,
                                          symptoms: f.symptoms ? f.symptoms.trimEnd() + "\n" + chip.value : chip.value,
                                        }));
                                    }}
                                    style={{
                                      ...chipSt,
                                      border: `1px solid ${a ? C.primary : C.border}`,
                                      background: a ? C.bgSuccess : C.bgMuted,
                                      color: a ? C.primaryDark : C.textMuted,
                                      fontWeight: a ? 700 : 400,
                                      fontSize: 11,
                                    }}
                                  >
                                    {a ? "✓ " : ""}
                                    {chip.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {form.crop &&
                          (() => {
                            const cropKey = resolveCropKey(form.crop);
                            if (!cropKey || !CROP_DISEASES[cropKey]) return null;
                            const allSymptoms = [
                              ...new Set(CROP_DISEASES[cropKey].diseases.flatMap((d) => d.symptoms)),
                            ];
                            const existingValues = new Set(
                              Object.values(SYMPTOM_CHIPS)
                                .flat()
                                .map((c) => c.value),
                            );
                            const cropSpecific = allSymptoms.filter((s) => !existingValues.has(s));
                            if (cropSpecific.length === 0) return null;
                            return (
                              <div style={{ marginBottom: 9 }}>
                                <div
                                  style={{
                                    color: C.primary,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    marginBottom: 5,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  🌱 {CROP_DISEASES[cropKey].en || cropKey}-এর নির্দিষ্ট লক্ষণ
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                  {cropSpecific.slice(0, 8).map((sym, i) => {
                                    const a = form.symptoms.includes(sym);
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => {
                                          if (a)
                                            setForm((f) => ({
                                              ...f,
                                              symptoms: f.symptoms.replace(sym, "").replace(/\n\n+/g, "\n").trim(),
                                            }));
                                          else
                                            setForm((f) => ({
                                              ...f,
                                              symptoms: f.symptoms ? f.symptoms.trimEnd() + "\n" + sym : sym,
                                            }));
                                        }}
                                        style={{
                                          ...chipSt,
                                          border: `1px solid ${a ? C.primary : C.border}`,
                                          background: a ? C.bgSuccess : C.bgMuted,
                                          color: a ? C.primaryDark : C.textMuted,
                                          fontWeight: a ? 700 : 400,
                                          fontSize: 11,
                                        }}
                                      >
                                        {a ? "✓ " : ""}
                                        {sym}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        <textarea
                          value={form.symptoms}
                          onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
                          placeholder="বিস্তারিত লিখুন বা উপরে ট্যাপ করুন..."
                          rows={3}
                          aria-label="Symptoms description"
                          style={{
                            width: "100%",
                            background: C.bgMuted,
                            border: `1px solid ${isListening ? C.danger : C.border}`,
                            borderRadius: 10,
                            color: C.text,
                            padding: "9px 12px",
                            fontSize: 13,
                            outline: "none",
                            resize: "vertical",
                            marginTop: 8,
                            boxSizing: "border-box",
                            lineHeight: 1.6,
                          }}
                        />
                      </div>

                      {/* Image picker is now integrated inside the leaf frame info box above */}

                      {error && (
                        <div
                          style={{
                            background: C.bgDanger,
                            border: `1px solid ${C.borderDanger}`,
                            borderRadius: 12,
                            padding: "12px 14px",
                            color: C.danger,
                            marginBottom: 10,
                            fontSize: 13,
                          }}
                        >
                          ⚠️ {error}
                        </div>
                      )}

                      {symptomMatches &&
                        symptomMatches.length > 0 &&
                        (() => {
                          return (
                            <div
                              style={{
                                background: C.bgCard,
                                borderRadius: 16,
                                padding: 14,
                                marginBottom: 10,
                                border: `1px solid ${C.border}`,
                                boxShadow: C.shadow,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 16 }}>🔬</span>
                                <span style={{ fontWeight: 700, fontSize: 13, color: C.primaryDark }}>
                                  সম্ভাব্য রোগ (প্রাথমিক)
                                </span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {symptomMatches.slice(0, 3).map((m, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      background: i === 0 ? C.bgSuccess : C.bgMuted,
                                      border: `1px solid ${i === 0 ? C.borderSuccess : C.border}`,
                                      borderRadius: 20,
                                      padding: "4px 10px",
                                      fontSize: 11,
                                      fontWeight: i === 0 ? 700 : 500,
                                      color: i === 0 ? C.primaryDark : C.text,
                                    }}
                                  >
                                    {m.disease.nameBn} {Math.round((m.matchRatio || 0) * 100)}%
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        aria-label="Submit diagnosis"
                        style={{
                          width: "100%",
                          padding: "15px",
                          borderRadius: 14,
                          border: "none",
                          background: loading
                            ? C.border
                            : `linear-gradient(135deg,${C.primaryXDark},${C.primaryLight})`,
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 15,
                          cursor: loading ? "not-allowed" : "pointer",
                          boxShadow: loading ? "none" : `0 4px 20px ${C.primary}55`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 9,
                          transition: "all .2s",
                        }}
                      >
                        {loading ? (
                          <>
                            <span
                              style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 17 }}
                            >
                              ⟳
                            </span>
                            বিশ্লেষণ হচ্ছে...
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: 18 }}>🔍</span>রোগ নির্ণয় করুন
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* ── RESULT ──────────────────────────────────────────────── */}
                  {step === 2 && result && (
                    <div ref={resultRef} style={{ animation: "slideUp .4s ease" }}>
                      {/* Leaf Frame — image + info + upload */}
                      <div
                        className="ud-editorial-shadow"
                        style={{
                          background: C.bgCard,
                          borderRadius: 28,
                          padding: 18,
                          marginBottom: 12,
                          border: `1px solid ${C.border}`,
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
                          {/* Left: Leaf frame with image picker */}
                          <div
                            style={{
                              flex: "1 1 220px",
                              maxWidth: 320,
                              minHeight: 260,
                              borderRadius: 22,
                              background: "linear-gradient(135deg,#d2e9d0,#f5fbf6)",
                              position: "relative",
                              overflow: "hidden",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* Main image */}
                            <div
                              style={{
                                flex: 1,
                                position: "relative",
                                minHeight: 180,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {images.length > 0 ? (
                                <img
                                  src={images[0].url}
                                  alt="diagnosis preview"
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div style={{ fontSize: 64 }}>🍃</div>
                              )}
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 14,
                                  border: "2px solid rgba(255,255,255,0.7)",
                                  borderRadius: 18,
                                  pointerEvents: "none",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: 14,
                                  right: 14,
                                  padding: "5px 10px",
                                  borderRadius: 999,
                                  background: "rgba(0,96,40,0.88)",
                                  color: "#fff",
                                  fontSize: 10,
                                  fontWeight: 800,
                                }}
                              >
                                বিশ্লেষণ শেষ
                              </div>
                              {/* Structured result badges */}
                              {structuredResult && (
                                <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", gap: 5 }}>
                                  {structuredResult.severity && (
                                    <span
                                      style={{
                                        padding: "3px 9px",
                                        borderRadius: 999,
                                        background:
                                          structuredResult.severity === "severe" || structuredResult.severity === "high"
                                            ? "rgba(220,38,38,0.9)"
                                            : structuredResult.severity === "moderate" ||
                                                structuredResult.severity === "medium"
                                              ? "rgba(217,119,6,0.9)"
                                              : "rgba(22,163,74,0.9)",
                                        color: "#fff",
                                        fontSize: 9,
                                        fontWeight: 800,
                                      }}
                                    >
                                      {structuredResult.severity}
                                    </span>
                                  )}
                                  {structuredResult.confidence && (
                                    <span
                                      style={{
                                        padding: "3px 9px",
                                        borderRadius: 999,
                                        background: "rgba(0,0,0,0.6)",
                                        color: "#fff",
                                        fontSize: 9,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {structuredResult.confidence}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Thumbnail strip + add more inside leaf frame */}
                            <div
                              style={{
                                padding: "8px 10px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "rgba(255,255,255,0.6)",
                                backdropFilter: "blur(6px)",
                              }}
                            >
                              {images.map((img, idx) => (
                                <div key={idx} style={{ position: "relative", flexShrink: 0 }}>
                                  <img
                                    src={img.url}
                                    alt={img.label}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                      border: `2px solid ${idx === 0 ? C.primary : C.border}`,
                                      cursor: "pointer",
                                    }}
                                  />
                                  <button
                                    onClick={() => removeImage(idx)}
                                    style={{
                                      position: "absolute",
                                      top: -3,
                                      right: -3,
                                      width: 14,
                                      height: 14,
                                      borderRadius: "50%",
                                      background: C.danger,
                                      color: "#fff",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: 8,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      lineHeight: 1,
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              {images.length < 4 && (
                                <button
                                  onClick={() => galleryRef.current?.click()}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    border: `2px dashed ${C.primary}`,
                                    background: "rgba(255,255,255,0.5)",
                                    color: C.primary,
                                    cursor: "pointer",
                                    fontSize: 18,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Right: Info */}
                          <div
                            style={{
                              flex: "1 1 240px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: C.primary,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textTransform: "uppercase",
                              }}
                            >
                              নির্ণয় সম্পন্ন
                            </div>
                            <div
                              className="ud-headline"
                              style={{ fontWeight: 800, fontSize: 26, color: C.primaryDark, lineHeight: 1.1 }}
                            >
                              {form.crop?.split("/")[0]?.trim() || "ফসল"} এর জন্য সহজ রিপোর্ট
                            </div>
                            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
                              কোন সমস্যা বেশি মনে হচ্ছে, কী লক্ষণ দেখা গেছে, আর এখন কী করলে ক্ষতি কমবে তা নিচে কার্ড
                              আকারে সাজানো আছে.
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                              {form.district && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    background: C.bgMuted,
                                    padding: "3px 8px",
                                    borderRadius: 8,
                                    color: C.textMuted,
                                  }}
                                >
                                  📍 {form.district?.split("/")[0]?.trim()}
                                </span>
                              )}
                              {weather && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    background: C.bgBlue,
                                    padding: "3px 8px",
                                    borderRadius: 8,
                                    color: "#0369a1",
                                  }}
                                >
                                  🌡️{weather.temp}°C · 💧{weather.humidity}%
                                </span>
                              )}
                              {provider && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    background: C.bgInfo,
                                    padding: "3px 8px",
                                    borderRadius: 8,
                                    color: C.blue,
                                  }}
                                >
                                  🤖 {provider}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          background: C.bgCard,
                          borderRadius: 16,
                          padding: 14,
                          marginBottom: 10,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                      >
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: `linear-gradient(135deg,${C.bgSuccess},${C.badgeSuccess})`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          >
                            📋
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark }}>
                              রোগ নির্ণয় প্রতিবেদন
                            </div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>
                              {form.crop?.split("/")[0]?.trim()} ·{" "}
                              {form.district?.split("/")[0]?.trim() || locationName}
                            </div>
                          </div>
                          {provider && (
                            <span
                              style={{
                                background: C.bgInfo,
                                border: "1px solid #bfdbfe",
                                borderRadius: 20,
                                padding: "3px 9px",
                                color: C.blue,
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              {provider}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", background: C.bgMuted, borderRadius: 20, padding: 3, gap: 2 }}>
                            <button
                              onClick={() => {
                                setShowEnglish(false);
                                stopSpeaking();
                              }}
                              style={{
                                borderRadius: 16,
                                padding: "5px 14px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                background: !showEnglish ? C.primary : "transparent",
                                color: !showEnglish ? "#fff" : C.textMuted,
                                transition: "all .2s",
                              }}
                            >
                              বাংলা
                            </button>
                            <button
                              onClick={() => {
                                setShowEnglish(true);
                                stopSpeaking();
                              }}
                              style={{
                                borderRadius: 16,
                                padding: "5px 14px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                background: showEnglish ? C.primary : "transparent",
                                color: showEnglish ? "#fff" : C.textMuted,
                                transition: "all .2s",
                              }}
                            >
                              English
                            </button>
                          </div>
                          {ttsSupported && (
                            <button
                              onClick={() =>
                                isSpeaking ? stopSpeaking() : speakResult(showEnglish ? result.en : result.bn)
                              }
                              style={{
                                height: 34,
                                minWidth: 0,
                                borderRadius: 17,
                                paddingInline: "12px",
                                border: `1.5px solid ${isSpeaking ? C.warning : C.primary}`,
                                background: isSpeaking ? C.bgWarning : C.bgSuccess,
                                color: isSpeaking ? C.warning : C.primaryDark,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 5,
                                flexShrink: 0,
                              }}
                            >
                              <span style={{ fontSize: 15 }}>{isSpeaking ? "⏹️" : "🔊"}</span>
                              {isSpeaking ? "বন্ধ করুন" : "শুনুন"}
                            </button>
                          )}
                          {weather && (
                            <span
                              style={{
                                background: C.bgBlue,
                                border: `1px solid ${C.borderBlue}`,
                                borderRadius: 20,
                                padding: "3px 8px",
                                color: C.textBlue,
                                fontSize: 10,
                              }}
                            >
                              🌡️{weather.temp}°C·💧{weather.humidity}%
                            </span>
                          )}
                        </div>
                      </div>

                      {(() => {
                        const text = simplifyFarmerText(showEnglish ? result.en || "" : result.bn || result.en || "");
                        if (!text)
                          return (
                            <div style={{ color: C.textMuted, textAlign: "center", padding: 20 }}>
                              ফলাফল পাওয়া যায়নি।
                            </div>
                          );
                        const highlights = extractResultHighlights(text);
                        const sections = parseIntoSections(text);
                        if (sections.length <= 1 && !sections[0]?.title)
                          return (
                            <div
                              style={{
                                background: C.bgCard,
                                borderRadius: 14,
                                padding: 16,
                                color: C.text,
                                fontSize: 13.5,
                                lineHeight: 1.85,
                                border: `1px solid ${C.border}`,
                                boxShadow: C.shadow,
                              }}
                            >
                              {renderInline(text)}
                            </div>
                          );
                        if (highlights.length > 0) {
                          return (
                            <>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                                  gap: 10,
                                  marginBottom: 10,
                                }}
                              >
                                {highlights.map((item) => (
                                  <div
                                    key={item.label}
                                    style={{
                                      background: C.bgCard,
                                      border: `1px solid ${C.border}`,
                                      borderRadius: 14,
                                      padding: 14,
                                      boxShadow: C.shadow,
                                    }}
                                  >
                                    <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
                                      {item.label}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                                      {item.value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {sections.map((sec, i) => (
                                <SectionCard key={i} title={sec.title} bodyLines={sec.body} defaultOpen={i < 3} />
                              ))}
                            </>
                          );
                        }
                        return sections.map((sec, i) => (
                          <SectionCard key={i} title={sec.title} bodyLines={sec.body} defaultOpen={i < 3} />
                        ));
                      })()}

                      {/* ─── CABI Reference Images (offline visual enrichment) ──────── */}
                      {referenceImages &&
                        referenceImages.overall &&
                        referenceImages.overall.length > 0 &&
                        (() => {
                          const catColors = {
                            Wilt: { bg: "#fef3c7", fg: "#92400e" },
                            "Leaf spot": { bg: "#fee2e2", fg: "#991b1b" },
                            Mosaic: { bg: "#dbeafe", fg: "#1e40af" },
                            "Yellowing of leaves": { bg: "#fef9c3", fg: "#854d0e" },
                            "Distortion of leaves": { bg: "#f3e8ff", fg: "#6b21a8" },
                            "Little leaf": { bg: "#dcfce7", fg: "#166534" },
                            "Witches' broom": { bg: "#fce7f3", fg: "#9d174d" },
                            Canker: { bg: "#fed7aa", fg: "#9a3412" },
                            Galls: { bg: "#d1fae5", fg: "#065f46" },
                            "Drying/necrosis/blight": { bg: "#fee2e2", fg: "#7f1d1d" },
                          };
                          const confStyle =
                            referenceImages.visualConfidence === "high"
                              ? { bg: "#dcfce7", fg: "#166534" }
                              : referenceImages.visualConfidence === "medium"
                                ? { bg: "#fef9c3", fg: "#854d0e" }
                                : { bg: "#fee2e2", fg: "#991b1b" };
                          return (
                            <div
                              style={{
                                marginTop: 10,
                                background: C.bgCard,
                                borderRadius: 16,
                                padding: 14,
                                border: `1px solid ${C.border}`,
                                boxShadow: C.shadow,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    background: `linear-gradient(135deg,${C.bgInfo},${C.borderInfo})`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                  }}
                                >
                                  📷
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 800, fontSize: 14, color: C.primaryDark }}>
                                    CABI রেফারেন্স ইমেজ
                                  </div>
                                  <div style={{ fontSize: 10, color: C.textMuted }}>
                                    CABI Plantwise Field Guide থেকে — সম্পূর্ণ অফলাইনে
                                  </div>
                                </div>
                                <span
                                  style={{
                                    background: confStyle.bg,
                                    color: confStyle.fg,
                                    borderRadius: 999,
                                    padding: "3px 10px",
                                    fontSize: 10,
                                    fontWeight: 700,
                                  }}
                                >
                                  ভিজ্যুয়াল আস্থা: {referenceImages.visualConfidence}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))",
                                  gap: 8,
                                  marginTop: 8,
                                }}
                              >
                                {referenceImages.overall.slice(0, 12).map((entry, idx) => {
                                  const c = catColors[entry.category] || { bg: "#f1f5f9", fg: "#475569" };
                                  return (
                                    <div
                                      key={`ref-${idx}`}
                                      style={{
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        background: C.bgCard,
                                      }}
                                    >
                                      <img
                                        src={entry.url}
                                        alt={`CABI page ${entry.page}`}
                                        loading="lazy"
                                        style={{
                                          width: "100%",
                                          height: 90,
                                          objectFit: "cover",
                                          display: "block",
                                          background: C.bgMuted,
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                      <div style={{ padding: "4px 6px" }}>
                                        {entry.category && (
                                          <span
                                            style={{
                                              display: "inline-block",
                                              padding: "2px 6px",
                                              borderRadius: 999,
                                              fontSize: 9,
                                              fontWeight: 600,
                                              background: c.bg,
                                              color: c.fg,
                                              marginBottom: 2,
                                            }}
                                          >
                                            {entry.category}
                                          </span>
                                        )}
                                        <div style={{ fontSize: 9, color: C.textMuted }}>📄 পৃষ্ঠা {entry.page}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {referenceImages.libraryStats && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    fontSize: 10,
                                    color: C.textMuted,
                                    textAlign: "center",
                                    borderTop: `1px solid ${C.border}`,
                                    paddingTop: 6,
                                  }}
                                >
                                  📚 {referenceImages.libraryStats.totalImages} ইমেজ ·{" "}
                                  {referenceImages.libraryStats.totalPages} পৃষ্ঠা ·{" "}
                                  {referenceImages.libraryStats.totalCategories} ক্যাটেগরি
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      {recommendedProducts.length > 0 && (
                        <ProductRecommendations products={recommendedProducts} crop={form.crop} />
                      )}

                      <SeverityBadge
                        severity={structuredResult?.severity || structuredResult?.severity_level}
                        cause={structuredResult?.cause_type || structuredResult?.biotic_abiotic}
                        affectedArea={form.affectedArea}
                      />

                      <ConfidenceDashboard
                        structuredResult={structuredResult}
                        cropKey={resolveCropKey(form.crop)}
                        weather={weather}
                        symptomMatches={symptomMatches}
                      />

                      <div
                        style={{
                          marginTop: 10,
                          padding: "10px 14px",
                          background: C.bgWarning,
                          border: `1px solid ${C.borderOrange}`,
                          borderRadius: 12,
                          color: C.warning,
                          fontSize: 12,
                        }}
                      >
                        ⚠️ এই রিপোর্ট প্রাথমিক গাইডেন্সের জন্য। চূড়ান্ত সিদ্ধান্তে DAE কর্মকর্তার পরামর্শ নিন।
                      </div>
                      <button
                        onClick={reset}
                        aria-label="Reset form"
                        style={{
                          width: "100%",
                          marginTop: 10,
                          padding: "13px",
                          borderRadius: 14,
                          border: `1px solid ${C.border}`,
                          background: C.bgCard,
                          color: C.text,
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: "pointer",
                          boxShadow: C.shadow,
                        }}
                      >
                        🔁 নতুন রোগ নির্ণয়
                      </button>

                      {/* Follow-up questions — dynamic & context-aware */}
                      <div
                        style={{
                          marginTop: 14,
                          padding: 16,
                          background: C.bgCard,
                          borderRadius: 18,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 10,
                              background: `linear-gradient(135deg,${C.bgInfo},${C.borderInfo})`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                            }}
                          >
                            💬
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>আরও জিজ্ঞাসা</div>
                            <div style={{ fontSize: 10, color: C.textMuted }}>
                              রোগ সম্পর্কে বিস্তারিত জানতে প্রশ্ন করুন
                            </div>
                          </div>
                        </div>
                        {/* Dynamic question chips — categorized */}
                        <div style={{ marginBottom: 10 }}>
                          {(() => {
                            const qs = [];
                            const crop = form.crop?.split("/")[0]?.trim() || "ফসল";
                            const disease = structuredResult?.disease_name_bn || structuredResult?.disease_name || "";
                            const cause = structuredResult?.cause_type || structuredResult?.biotic_abiotic || "";
                            const sev = structuredResult?.severity || "";
                            const _conf = structuredResult?.confidence || "";
                            const season = form.season || "";

                            // 🔬 Disease-specific (highest priority)
                            if (disease) {
                              qs.push({ q: `${disease} কিভাবে ছড়ায়?`, cat: "disease" });
                              qs.push({ q: `${disease} কোন মাসে বেশি হয়?`, cat: "disease" });
                              qs.push({ q: `${disease} প্রতিরোধে কী করব?`, cat: "disease" });
                              qs.push({ q: `${disease} কোন জাত বেশি প্রতিরোধী?`, cat: "disease" });
                            }
                            // 💊 Cause/treatment-specific
                            if (cause === "fungal" || cause === "biotic") {
                              qs.push({ q: "কোন ছত্রাকনাশক লাগবে ও কতদিন?", cat: "treatment" });
                              qs.push({ q: "ছত্রাকনাশক কখন স্প্রে করব?", cat: "treatment" });
                            }
                            if (cause === "bacterial") {
                              qs.push({ q: "ব্যাকটেরিয়াল রোগে কী করব?", cat: "treatment" });
                              qs.push({ q: "তামার ছত্রাকনাশক লাগবে কি?", cat: "treatment" });
                            }
                            if (cause === "viral") {
                              qs.push({ q: "ভাইরাস রোগে কী করব?", cat: "treatment" });
                              qs.push({ q: "ভাইরাস বাহক পোকা মারতে কী লাগবে?", cat: "treatment" });
                            }
                            if (cause === "insect") {
                              qs.push({ q: "কোন কীটনাশক সবচেয়ে কার্যকর?", cat: "treatment" });
                              qs.push({ q: "পোকা দমনে আইপিএম পদ্ধতি কী?", cat: "treatment" });
                            }
                            if (cause === "nutritional") {
                              qs.push({ q: "কোন সার দিলে ভালো হবে?", cat: "treatment" });
                              qs.push({ q: "সার কত পরিমাণ দিতে হবে?", cat: "treatment" });
                            }
                            // ⚠️ Severity-specific
                            if (sev === "severe" || sev === "high") {
                              qs.push({ q: "এখনই কী করতে হবে?", cat: "severity" });
                              qs.push({ q: "ফসল বাঁচানো সম্ভব কি?", cat: "severity" });
                              qs.push({ q: "কতদিনে সমস্ত মাঠে ছড়াবে?", cat: "severity" });
                            }
                            if (sev === "moderate" || sev === "medium") {
                              qs.push({ q: "কতদিনে সারবে?", cat: "severity" });
                              qs.push({ q: "আংশিক ক্ষতি হলে কী করব?", cat: "severity" });
                            }
                            if (sev === "low" || sev === "mild") {
                              qs.push({ q: "সামান্য ক্ষতি — কী সতর্কতা দরকার?", cat: "severity" });
                            }
                            // 🌾 Crop-specific
                            qs.push({ q: `${crop} এ আর কী সমস্যা হতে পারে?`, cat: "crop" });
                            // 🌡️ Season/weather context
                            if (season) qs.push({ q: `${season} এ এই রোগ কি সাধারণ?`, cat: "season" });
                            if (weather && weather.humidity > 80)
                              qs.push({ q: "বেশি আর্দ্রতায় কী করণীয়?", cat: "season" });
                            // 🛡️ Prevention & general
                            if (qs.length < 6) {
                              qs.push({ q: "অন্য ফসলেও ছড়াবে?", cat: "general" });
                              qs.push({ q: "পরবর্তী মৌসুমে কী সতর্কতা নেব?", cat: "general" });
                              qs.push({ q: "DAE অফিসার কখন ডাকব?", cat: "general" });
                            }

                            // Group by category with icons
                            const catMeta = {
                              disease: { icon: "🔬", label: "রোগ" },
                              treatment: { icon: "💊", label: "চিকিৎসা" },
                              severity: { icon: "⚠️", label: "তীব্রতা" },
                              crop: { icon: "🌾", label: "ফসল" },
                              season: { icon: "🌡️", label: "মৌসুম" },
                              general: { icon: "💡", label: "সাধারণ" },
                            };
                            // Deduplicate by question text
                            const seen = new Set();
                            const unique = qs.filter((item) => {
                              if (seen.has(item.q)) return false;
                              seen.add(item.q);
                              return true;
                            });
                            // Group
                            const groups = {};
                            unique.forEach((item) => {
                              if (!groups[item.cat]) groups[item.cat] = [];
                              groups[item.cat].push(item.q);
                            });

                            return Object.entries(groups).map(([cat, items]) => {
                              const meta = catMeta[cat] || { icon: "❓", label: cat };
                              return (
                                <div key={cat} style={{ marginBottom: 8 }}>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: C.textLight,
                                      fontWeight: 700,
                                      marginBottom: 4,
                                      letterSpacing: 0.3,
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {meta.icon} {meta.label}
                                  </div>
                                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                    {items.slice(0, 3).map((q) => (
                                      <button
                                        key={q}
                                        onClick={() => setFollowUpQuestion(q)}
                                        style={{
                                          padding: "5px 10px",
                                          borderRadius: 20,
                                          border: `1px solid ${C.border}`,
                                          background: C.bgMuted,
                                          color: C.text,
                                          fontSize: 11,
                                          cursor: "pointer",
                                          fontWeight: 600,
                                          transition: "all .15s",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = C.bgSuccess;
                                          e.currentTarget.style.borderColor = C.primary;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = C.bgMuted;
                                          e.currentTarget.style.borderColor = C.border;
                                        }}
                                      >
                                        {q}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                        {/* Input area */}
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            value={followUpQuestion}
                            onChange={(e) => setFollowUpQuestion(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleFollowUp();
                            }}
                            placeholder="আপনার প্রশ্ন লিখুন..."
                            aria-label="Follow-up question"
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              borderRadius: 12,
                              border: `1px solid ${C.border}`,
                              fontSize: 13,
                              color: C.text,
                              background: C.bgMuted,
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={handleFollowUp}
                            disabled={!followUpQuestion.trim() || followUpLoading}
                            aria-label="Ask follow-up question"
                            style={{
                              padding: "10px 16px",
                              borderRadius: 12,
                              border: "none",
                              background: C.primary,
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: !followUpQuestion.trim() || followUpLoading ? "not-allowed" : "pointer",
                              opacity: !followUpQuestion.trim() || followUpLoading ? 0.6 : 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {followUpLoading ? <>⟳ চলছে...</> : "প্রশ্ন করুন"}
                          </button>
                        </div>
                        {followUpLoading && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 12,
                              color: C.textMuted,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> AI
                            আপনার প্রশ্নের উত্তর দিচ্ছে...
                          </div>
                        )}
                        {followUpAnswer && (
                          <div
                            style={{
                              marginTop: 10,
                              padding: 14,
                              background: C.bgMuted,
                              borderRadius: 12,
                              fontSize: 13,
                              color: C.text,
                              lineHeight: 1.8,
                              borderLeft: `3px solid ${C.primary}`,
                              animation: "fadeIn .3s ease",
                            }}
                          >
                            {renderInline(followUpAnswer)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── GUIDE ────────────────────────────────────────────────── */}
              {activeTab === "guide" && (
                <div
                  className="ud-editorial-shadow"
                  style={{
                    background: C.bgCard,
                    borderRadius: 18,
                    padding: 18,
                    border: `1px solid ${C.border}`,
                    boxShadow: C.shadowMd,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, overflow: "hidden", flexShrink: 0 }}>
                      <img
                        src="/cabi-logo.png"
                        alt="CABI"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark }}>CABI Plantwise গাইড</div>
                      <div style={{ color: C.textMuted, fontSize: 11 }}>সম্পূর্ণ রোগ নির্ণয় প্রোটোকল</div>
                    </div>
                  </div>
                  <CABIGuideTab />
                  <button
                    onClick={() => setActiveTab("learn")}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: C.bgMuted,
                      color: C.textMuted,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ← শিখুন পেজে ফিরুন
                  </button>
                </div>
              )}

              {/* ── LIBRARY ──────────────────────────────────────────────── */}
              {activeTab === "library" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    className="ud-editorial-shadow"
                    style={{
                      background: C.bgCard,
                      borderRadius: 18,
                      padding: 18,
                      border: `1px solid ${C.border}`,
                      boxShadow: C.shadowMd,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark, marginBottom: 3 }}>
                      📚 তথ্যভান্ডার
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14 }}>
                      পোকামাকড়, রোগ ও পুষ্টি অভাব
                    </div>
                    <EnhancedLibrarySection />
                  </div>
                  {/* CABI Visual Reference Library — 278 offline images */}
                  <div
                    className="ud-editorial-shadow"
                    style={{
                      background: C.bgCard,
                      borderRadius: 18,
                      padding: 4,
                      border: `1px solid ${C.border}`,
                      boxShadow: C.shadowMd,
                      overflow: "hidden",
                    }}
                  >
                    <VisualDiagnosisLibrary />
                  </div>
                  {/* Quick links to Apps & History sub-views */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                    <button
                      onClick={() => setActiveTab("apps")}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: "14px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: C.shadow,
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>🌐</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>কৃষি অ্যাপস</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>আরও সেবা দেখুন</div>
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        padding: "14px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: C.shadow,
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>📋</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>নির্ণয় ইতিহাস</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>আগের রিপোর্ট</div>
                    </button>
                  </div>
                </div>
              )}

              {/* ── GAME HUB ─────────────────────────────────────────────── */}
              {activeTab === "game" && (
                <div>
                  <GameHub />
                  <button
                    onClick={() => setActiveTab("learn")}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: C.bgMuted,
                      color: C.textMuted,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ← শিখুন পেজে ফিরুন
                  </button>
                </div>
              )}

              {/* ── HISTORY ──────────────────────────────────────────────── */}
              {activeTab === "history" && (
                <div
                  className="ud-editorial-shadow"
                  style={{
                    background: C.bgCard,
                    borderRadius: 18,
                    padding: 18,
                    border: `1px solid ${C.border}`,
                    boxShadow: C.shadowMd,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: C.primary,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    History
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.primaryDark, marginBottom: 14 }}>
                    📋 নির্ণয়ের ইতিহাস
                  </div>
                  {history.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>
                      <div style={{ fontSize: 48, marginBottom: 12, animation: "float 2s ease-in-out infinite" }}>
                        🌾
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>এখনো কোনো নির্ণয় নেই</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>প্রথম নির্ণয় করুন!</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {[...history].reverse().map((h, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "16px",
                            background: C.bgMuted,
                            borderRadius: 20,
                            border: `1px solid ${C.border}`,
                            boxShadow: "0 6px 18px rgba(0,33,9,0.05)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 5,
                            }}
                          >
                            <div className="ud-headline" style={{ fontWeight: 800, fontSize: 17, color: C.text }}>
                              {h.crop?.split("/")[0]?.trim()}
                            </div>
                            <span
                              style={{
                                background: C.badgeSuccess,
                                color: C.textSuccess,
                                borderRadius: 10,
                                padding: "2px 9px",
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              সম্পন্ন
                            </span>
                          </div>
                          <div style={{ color: C.textMuted, fontSize: 11 }}>
                            📍 {h.district?.split("/")[0]?.trim() || "—"} · 📅 {h.date}
                          </div>
                          {h.resultPreview && (
                            <div
                              style={{
                                color: C.textLight,
                                fontSize: 12,
                                marginTop: 8,
                                lineHeight: 1.6,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {h.resultPreview}...
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setHistory([]);
                          try {
                            localStorage.removeItem("ud-history");
                          } catch {}
                        }}
                        style={{
                          padding: "9px",
                          borderRadius: 10,
                          border: "1px solid #fecaca",
                          background: C.bgDanger,
                          color: C.danger,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          marginTop: 3,
                        }}
                      >
                        🗑️ সব ইতিহাস মুছুন
                      </button>
                      <button
                        onClick={() => setActiveTab("library")}
                        style={{
                          marginTop: 8,
                          width: "100%",
                          padding: "10px",
                          borderRadius: 10,
                          border: `1px solid ${C.border}`,
                          background: C.bgMuted,
                          color: C.textMuted,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        ← তথ্যভান্ডারে ফিরুন
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {!isGameTab && (
            <FeedbackPanel
              context={feedbackContext}
              summary={feedbackSummary}
              userEmail={userEmail}
              onEmailChange={setUserEmail}
              visitorStats={visitorStats}
              visitorId={visitorId}
            />
          )}
          {!isGameTab && (
            <div
              style={{
                textAlign: "center",
                padding: "8px 4px",
                color: C.textLight,
                fontSize: 10,
                borderTop: `1px solid ${C.border}`,
                background: C.bgCard,
                letterSpacing: 0.5,
              }}
            >
              উদ্ভিদ গোয়েন্দা · CABI Plantwise · BRRI · BARI · DAE Bangladesh
            </div>
          )}

          {/* ══ BOTTOM NAVIGATION ═════════════════════════════════════ */}
          {!isGameTab && (
            <nav className="bottom-nav" aria-label="Main navigation">
              {navTabs.map((t) => {
                let isActive = activeTab === t.id;
                if (t.id === "learn") isActive = activeTab === "learn" || activeTab === "guide" || activeTab === "game";
                if (t.id === "library")
                  isActive = activeTab === "library" || activeTab === "apps" || activeTab === "history";
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`bottom-nav-item ${isActive ? "active" : ""}`}
                    aria-label={`${t.label} tab`}
                  >
                    <span className="nav-icon">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
              {/* External Pesticide Guide link — opens in new tab */}
              <a
                href="https://agrichem-guide.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="bottom-nav-item"
                aria-label="বালাইনাশক নির্দেশিকা (Pesticide Guide) — নতুন ট্যাবে খুলুন"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "inherit" }}
              >
                <span className="nav-icon" style={{ fontSize: 20 }}>🧪</span>
                <span>Pesticide</span>
              </a>
            </nav>
          )}

          {/* ══ FLOATING COPILOT FAB ═══════════════════════════════════ */}
          {!isGameTab && !copilotOpen && (
            <button
              onClick={() => setCopilotOpen(true)}
              aria-label="AI Copilot"
              style={{
                position: "fixed",
                bottom: 76,
                right: 16,
                zIndex: 300,
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${C.primaryXDark},${C.primary})`,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,96,40,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "popIn .3s ease both",
                transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,96,40,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,96,40,0.4)";
              }}
            >
              <span style={{ fontSize: 24 }}>🤖</span>
            </button>
          )}

          {/* ══ COPILOT SLIDE-UP PANEL ═════════════════════════════════ */}
          {copilotOpen && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 350,
                maxHeight: "70vh",
                background: C.bgCard,
                borderRadius: "20px 20px 0 0",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                animation: "slideUp .3s ease both",
                overflow: "hidden",
              }}
            >
              {/* Handle bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0 4px" }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border }} />
              </div>
              {/* Header with close */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 16px 8px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <span style={{ fontSize: 20, marginRight: 8 }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>AI কোপাইলট</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>প্রতিটি পৃষ্ঠায় সহায়তা</div>
                </div>
                <button
                  onClick={() => setCopilotOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: "none",
                    background: C.bgMuted,
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.textMuted,
                  }}
                  aria-label="Close copilot"
                >
                  ✕
                </button>
              </div>
              {/* Copilot content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 0 16px" }}>
                <AICopilotTab
                  crop={form.crop}
                  district={form.district}
                  weather={weather}
                  locationName={locationName}
                  signedFetch={signedFetch}
                />
              </div>
            </div>
          )}
          {/* Backdrop for copilot panel */}
          {copilotOpen && (
            <div
              onClick={() => setCopilotOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 340,
                background: "rgba(0,0,0,0.3)",
                animation: "fadeIn .2s ease both",
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
