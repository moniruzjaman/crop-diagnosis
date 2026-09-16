/**
 * Crop Calendar Data for Bangladesh's 10 Main Crops
 *
 * Covers all major seasons: বোরো (Boro), আমন (Aman), আউশ (Aus),
 * রবি (Rabi), খরিপ-১ (Kharif-1), খরিপ-২ (Kharif-2).
 *
 * Months are 1-indexed (1 = January, 12 = December).
 * All text in Bengali with English translations where helpful.
 */

export const CROP_CALENDAR = [
  {
    crop: "ধান",
    cropEn: "Rice",
    icon: "🌾",
    color: "#f59e0b",
    seasons: [
      {
        name: "বোরো",
        nameEn: "Boro",
        months: [12, 1, 2, 3, 4],
        plantMonth: "ডিসেম্বর-জানুয়ারি",
        harvestMonth: "এপ্রিল-মে",
        riskPeriod: "মার্চ-এপ্রিল",
        keyDiseases: ["ব্লাস্ট", "শিদ ব্লাইট", "ব্যাকটেরিয়াল লিফ ব্লাইট"],
        keyPests: ["বাদামি গাছফড়িং", "মাজরা পোকা", "পাতামোড়া পোকা"],
        tips: ["সময়মতো সার প্রয়োগ", "পানি নিষ্কাশন নিশ্চিত করুন", "ঠান্ডা আবহাওয়ায় ব্লাস্ট সতর্কতা"],
      },
      {
        name: "আমন",
        nameEn: "Aman",
        months: [6, 7, 8, 9, 10, 11],
        plantMonth: "জুন-জুলাই",
        harvestMonth: "নভেম্বর-ডিসেম্বর",
        riskPeriod: "আগস্ট-সেপ্টেম্বর",
        keyDiseases: ["শিদ ব্লাইট", "টুংরো ভাইরাস", "ব্লাস্ট"],
        keyPests: ["সবুজ পাতাফড়িং", "গন্ধি পোকা", "মাজরা পোকা"],
        tips: [
          "বন্যার সময় পানি নিষ্কাশন দ্রুত করুন",
          "প্রতিরোধী জাত ব্যবহার করুন",
          "সারির মধ্যে আগাছা পরিষ্কার রাখুন",
        ],
      },
      {
        name: "আউশ",
        nameEn: "Aus",
        months: [3, 4, 5, 6, 7, 8],
        plantMonth: "মার্চ-এপ্রিল",
        harvestMonth: "জুলাই-আগস্ট",
        riskPeriod: "মে-জুন",
        keyDiseases: ["ব্লাস্ট", "ব্যাকটেরিয়াল লিফ ব্লাইট"],
        keyPests: ["মাজরা পোকা", "গলধরা পোকা"],
        tips: ["শুকনা বপনে মাটির রস সংরক্ষণ করুন", "সময়মতো বীজ বপন করুন"],
      },
    ],
  },
  {
    crop: "পাট",
    cropEn: "Jute",
    icon: "🌿",
    color: "#16a34a",
    seasons: [
      {
        name: "খরিপ-১",
        nameEn: "Kharif-1",
        months: [3, 4, 5, 6, 7],
        plantMonth: "মার্চ-এপ্রিল",
        harvestMonth: "জুন-জুলাই",
        riskPeriod: "এপ্রিল-মে",
        keyDiseases: ["পাটের উইল্ট", "স্টেম রট", "অ্যানথ্রাকনোজ"],
        keyPests: ["পাটের মাহুয়া পোকা", "জাব পোকা", "সেমি লুপার"],
        tips: ["উন্নত জাত ব্যবহার করুন", "সময়মতো ফসল তোলা গুরুত্বপূর্ণ", "পানিতে ভেজানোর সময় নিয়ন্ত্রণ রাখুন"],
      },
      {
        name: "খরিপ-২",
        nameEn: "Kharif-2",
        months: [7, 8, 9, 10],
        plantMonth: "জুলাই-আগস্ট",
        harvestMonth: "অক্টোবর-নভেম্বর",
        riskPeriod: "আগস্ট-সেপ্টেম্বর",
        keyDiseases: ["স্টেম রট", "মোজাইক ভাইরাস"],
        keyPests: ["জাব পোকা", "লাল মাকড়"],
        tips: ["পর্যাপ্ত সেচ নিশ্চিত করুন", "সারি থেকে সারি দূরত্ব ঠিক রাখুন"],
      },
    ],
  },
  {
    crop: "আলু",
    cropEn: "Potato",
    icon: "🥔",
    color: "#92400e",
    seasons: [
      {
        name: "রবি",
        nameEn: "Rabi",
        months: [10, 11, 12, 1, 2, 3],
        plantMonth: "নভেম্বর-ডিসেম্বর",
        harvestMonth: "ফেব্রুয়ারি-মার্চ",
        riskPeriod: "ডিসেম্বর-জানুয়ারি",
        keyDiseases: ["লেট ব্লাইট", "আর্লি ব্লাইট", "ব্ল্যাক স্কার্ফ"],
        keyPests: ["আলু মাছি", "সাদা মাছি", "আলু সুতো কৃমি"],
        tips: ["সুস্থ বীজ কন্দ ব্যবহার করুন", "ঠান্ডা ও কুয়াশায় লেট ব্লাইট সতর্কতা", "সময়মতো সেচ ও মাটি ভরাট করুন"],
      },
    ],
  },
  {
    crop: "টমেটো",
    cropEn: "Tomato",
    icon: "🍅",
    color: "#dc2626",
    seasons: [
      {
        name: "রবি",
        nameEn: "Rabi",
        months: [10, 11, 12, 1, 2, 3],
        plantMonth: "অক্টোবর-নভেম্বর",
        harvestMonth: "জানুয়ারি-মার্চ",
        riskPeriod: "নভেম্বর-ডিসেম্বর",
        keyDiseases: ["আর্লি ব্লাইট", "লেট ব্লাইট", "ব্যাকটেরিয়াল উইল্ট", "টমেটো লিফ কার্ল ভাইরাস"],
        keyPests: ["সাদা মাছি", "ফলছিদ্রকারী পোকা", "জাব পোকা"],
        tips: [
          "লিফ কার্ল ভাইরাস প্রতিরোধে সাদা মাছি নিয়ন্ত্রণ করুন",
          "ফল ধরার সময় পটাশিয়াম সার দিন",
          "শীতের কুয়াশায় ছত্রাকনাশক স্প্রে করুন",
        ],
      },
      {
        name: "খরিপ-১",
        nameEn: "Kharif-1",
        months: [4, 5, 6, 7],
        plantMonth: "এপ্রিল-মে",
        harvestMonth: "জুন-জুলাই",
        riskPeriod: "মে-জুন",
        keyDiseases: ["ব্যাকটেরিয়াল উইল্ট", "ফুসারিয়াম উইল্ট"],
        keyPests: ["সাদা মাছি", "থ্রিপস", "মাইট"],
        tips: ["তাপ সহনশীল জাত ব্যবহার করুন", "ছায়াযুক্ত স্থানে চাষ করুন"],
      },
    ],
  },
  {
    crop: "বেগুন",
    cropEn: "Brinjal",
    icon: "🍆",
    color: "#7c3aed",
    seasons: [
      {
        name: "রবি",
        nameEn: "Rabi",
        months: [10, 11, 12, 1, 2, 3],
        plantMonth: "অক্টোবর-নভেম্বর",
        harvestMonth: "ডিসেম্বর-এপ্রিল",
        riskPeriod: "নভেম্বর-জানুয়ারি",
        keyDiseases: ["ফুসারিয়াম উইল্ট", "লিফ স্পট", "ফল পচা"],
        keyPests: ["বেগুনের ডগা ও ফল ছিদ্রকারী পোকা", "জাব পোকা", "লাল মাকড়"],
        tips: [
          "ডগা ও ফল ছিদ্রকারী পোকার জন্য নিয়মিত পরিদর্শন করুন",
          "প্রতিরোধী জাত ব্যবহার করুন",
          "ফেরোমন ফাঁদ ব্যবহার করুন",
        ],
      },
      {
        name: "খরিপ-১",
        nameEn: "Kharif-1",
        months: [3, 4, 5, 6, 7],
        plantMonth: "ফেব্রুয়ারি-মার্চ",
        harvestMonth: "মে-আগস্ট",
        riskPeriod: "এপ্রিল-জুন",
        keyDiseases: ["লিফ ব্লাইট", "ফুসারিয়াম উইল্ট"],
        keyPests: ["জাব পোকা", "থ্রিপস", "মাইট"],
        tips: ["গরমে মালচিং করুন মাটির রস সংরক্ষণে", "নিয়মিত সেচ দিন"],
      },
    ],
  },
  {
    crop: "সরিষা",
    cropEn: "Mustard",
    icon: "🌼",
    color: "#d97706",
    seasons: [
      {
        name: "রবি",
        nameEn: "Rabi",
        months: [10, 11, 12, 1, 2],
        plantMonth: "অক্টোবর-নভেম্বর",
        harvestMonth: "ফেব্রুয়ারি-মার্চ",
        riskPeriod: "ডিসেম্বর-জানুয়ারি",
        keyDiseases: ["অ্যালটারনেরিয়া ব্লাইট", "সাদা মরচে", "পাউডারি মিলডিউ"],
        keyPests: ["জাব পোকা", "সরিষার আঁশ পোকা", "ডায়মন্ড ব্যাক মথ"],
        tips: ["ফুল আসার সময় সালফার স্প্রে করুন", "প্রতিরোধী জাত ব্যবহার করুন", "সময়মতো বীজ বপন করুন"],
      },
    ],
  },
  {
    crop: "কলা",
    cropEn: "Banana",
    icon: "🍌",
    color: "#ca8a04",
    seasons: [
      {
        name: "সারা বছর",
        nameEn: "Year-round",
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        plantMonth: "যেকোনো সময় (বর্ষায় ভালো)",
        harvestMonth: "১২-১৪ মাস পর",
        riskPeriod: "জুন-আগস্ট (বর্ষা)",
        keyDiseases: ["পানামা উইল্ট", "সিগাটোকা লিফ স্পট", "বাঞ্চি টপ ভাইরাস"],
        keyPests: ["কলার গোড়া ও কাণ্ড ছিদ্রকারী পোকা", "জাব পোকা", "নিমাটোড"],
        tips: [
          "রোগমুক্ত চারা ব্যবহার করুন",
          "পানামা উইল্ট প্রতিরোধে মাটির পিএইচ নিয়ন্ত্রণ করুন",
          "বর্ষায় পানি জমতে দেবেন না",
        ],
      },
    ],
  },
  {
    crop: "আম",
    cropEn: "Mango",
    icon: "🥭",
    color: "#ea580c",
    seasons: [
      {
        name: "খরিপ-১",
        nameEn: "Kharif-1",
        months: [2, 3, 4, 5, 6, 7],
        plantMonth: "ফেব্রুয়ারি-মার্চ (ফুল আসে)",
        harvestMonth: "মে-জুলাই",
        riskPeriod: "মার্চ-এপ্রিল (ফুল ও ফলের সময়)",
        keyDiseases: ["অ্যানথ্রাকনোজ", "পাউডারি মিলডিউ", "মালফরমেশন"],
        keyPests: ["আমের মাছি", "মিলি বাগ", "হপার"],
        tips: [
          "ফুল আসার আগে সালফার স্প্রে করুন",
          "ফল ধরার পর পাতায় পটাশিয়াম স্প্রে দিন",
          "আমের মাছি নিয়ন্ত্রণে ফেরোমন ফাঁদ ব্যবহার করুন",
        ],
      },
    ],
  },
  {
    crop: "গম",
    cropEn: "Wheat",
    icon: "🌾",
    color: "#b45309",
    seasons: [
      {
        name: "রবি",
        nameEn: "Rabi",
        months: [11, 12, 1, 2, 3],
        plantMonth: "নভেম্বর-ডিসেম্বর",
        harvestMonth: "মার্চ-এপ্রিল",
        riskPeriod: "জানুয়ারি-ফেব্রুয়ারি",
        keyDiseases: ["লিফ রাস্ট", "স্ট্রাইপ রাস্ট", "পাউডারি মিলডিউ", "স্পট ব্লাচ"],
        keyPests: ["জাব পোকা", "থ্রিপস"],
        tips: [
          "সময়মতো বীজ বপন করুন (নভেম্বরের মধ্যে)",
          "প্রতিরোধী জাত নির্বাচন করুন",
          "প্রোপিকোনাজোল স্প্রে রাস্ট নিয়ন্ত্রণে",
        ],
      },
    ],
  },
  {
    crop: "ভুট্টা",
    cropEn: "Maize",
    icon: "🌽",
    color: "#eab308",
    seasons: [
      {
        name: "রবি",
        nameEn: "Rabi",
        months: [10, 11, 12, 1, 2, 3, 4],
        plantMonth: "অক্টোবর-নভেম্বর",
        harvestMonth: "মার্চ-এপ্রিল",
        riskPeriod: "ডিসেম্বর-ফেব্রুয়ারি",
        keyDiseases: ["মে ডিউ", "দক্ষিণ মোজাইক ভাইরাস", "ব্লাইট"],
        keyPests: ["ফল ছিদ্রকারী পোকা", "স্টেম বোরার", "জাব পোকা"],
        tips: ["হাইব্রিড বীজ ব্যবহার করুন", "সময়মতো সেচ ও সার প্রয়োগ", "ফল ছিদ্রকারী পোকার জন্য কানের আগা কাটবেন না"],
      },
      {
        name: "খরিপ-১",
        nameEn: "Kharif-1",
        months: [3, 4, 5, 6, 7, 8],
        plantMonth: "মার্চ-এপ্রিল",
        harvestMonth: "জুলাই-আগস্ট",
        riskPeriod: "এপ্রিল-জুন",
        keyDiseases: ["মে ডিউ", "লিফ ব্লাইট"],
        keyPests: ["স্টেম বোরার", "ফল ছিদ্রকারী পোকা"],
        tips: ["গরমে অতিরিক্ত সেচ দেবেন না", "মে ডিউ প্রতিরোধে সালফার স্প্রে করুন"],
      },
    ],
  },
];

/**
 * Bengali month names mapped to Gregorian months (approximate).
 * Bangla calendar months don't perfectly align with Gregorian months,
 * but this mapping is commonly used for agricultural reference.
 */
export const BENGALI_MONTHS = [
  "পৌষ", // ~Dec 15 - Jan 14 → mapped to Gregorian month 1 (January)
  "মাঘ", // ~Jan 15 - Feb 13 → mapped to Gregorian month 2 (February)
  "ফাল্গুন", // ~Feb 14 - Mar 14 → mapped to Gregorian month 3 (March)
  "চৈত্র", // ~Mar 15 - Apr 13 → mapped to Gregorian month 4 (April)
  "বৈশাখ", // ~Apr 14 - May 14 → mapped to Gregorian month 5 (May)
  "জ্যৈষ্ঠ", // ~May 15 - Jun 14 → mapped to Gregorian month 6 (June)
  "আষাঢ়", // ~Jun 15 - Jul 15 → mapped to Gregorian month 7 (July)
  "শ্রাবণ", // ~Jul 16 - Aug 15 → mapped to Gregorian month 8 (August)
  "ভাদ্র", // ~Aug 16 - Sep 15 → mapped to Gregorian month 9 (September)
  "আশ্বিন", // ~Sep 16 - Oct 15 → mapped to Gregorian month 10 (October)
  "কার্তিক", // ~Oct 16 - Nov 14 → mapped to Gregorian month 11 (November)
  "অগ্রহায়ণ", // ~Nov 15 - Dec 14 → mapped to Gregorian month 12 (December)
];

/**
 * Gregorian month names in Bengali and English.
 */
export const GREGORIAN_MONTHS = [
  { bn: "জানুয়ারি", en: "January", short: "জানু" },
  { bn: "ফেব্রুয়ারি", en: "February", short: "ফেব্রু" },
  { bn: "মার্চ", en: "March", short: "মার্চ" },
  { bn: "এপ্রিল", en: "April", short: "এপ্রি" },
  { bn: "মে", en: "May", short: "মে" },
  { bn: "জুন", en: "June", short: "জুন" },
  { bn: "জুলাই", en: "July", short: "জুলা" },
  { bn: "আগস্ট", en: "August", short: "আগ" },
  { bn: "সেপ্টেম্বর", en: "September", short: "সেপ্টে" },
  { bn: "অক্টোবর", en: "October", short: "অক্টো" },
  { bn: "নভেম্বর", en: "November", short: "নভে" },
  { bn: "ডিসেম্বর", en: "December", short: "ডিসে" },
];

/**
 * Season color coding for visual calendar.
 */
export const SEASON_COLORS = {
  বোরো: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" }, // Blue
  আমন: { bg: "#dcfce7", text: "#166534", border: "#86efac" }, // Green
  আউশ: { bg: "#fef9c3", text: "#854d0e", border: "#fde047" }, // Yellow
  রবি: { bg: "#f3e8ff", text: "#6b21a8", border: "#c4b5fd" }, // Purple
  "খরিপ-১": { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" }, // Orange
  "খরিপ-২": { bg: "#ffe4e6", text: "#9f1239", border: "#fda4af" }, // Rose
  "সারা বছর": { bg: "#f0fdf4", text: "#14532d", border: "#86efac" }, // Light green
};

/**
 * Get current active crops based on the current month.
 */
export function getCurrentCrops() {
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  return CROP_CALENDAR.filter((crop) => crop.seasons.some((season) => season.months.includes(currentMonth))).map(
    (crop) => {
      const activeSeasons = crop.seasons.filter((s) => s.months.includes(currentMonth));
      return { ...crop, activeSeasons };
    },
  );
}

/**
 * Get risk alerts for the current month.
 */
export function getCurrentRiskAlerts() {
  const currentMonth = new Date().getMonth() + 1;
  const alerts = [];
  CROP_CALENDAR.forEach((crop) => {
    crop.seasons.forEach((season) => {
      if (season.months.includes(currentMonth)) {
        const riskMonths = season.riskPeriod
          ? season.riskPeriod.split("-").map((m) => {
              const monthMap = {
                জানুয়ারি: 1,
                ফেব্রুয়ারি: 2,
                মার্চ: 3,
                এপ্রিল: 4,
                মে: 5,
                জুন: 6,
                জুলাই: 7,
                আগস্ট: 8,
                সেপ্টেম্বর: 9,
                অক্টোবর: 10,
                নভেম্বর: 11,
                ডিসেম্বর: 12,
              };
              return monthMap[m.trim()];
            })
          : [];
        if (riskMonths.includes(currentMonth)) {
          alerts.push({
            crop: crop.crop,
            cropEn: crop.cropEn,
            icon: crop.icon,
            season: season.name,
            riskPeriod: season.riskPeriod,
            keyDiseases: season.keyDiseases,
            keyPests: season.keyPests,
          });
        }
      }
    });
  });
  return alerts;
}
