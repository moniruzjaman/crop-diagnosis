/**
 * Bangladesh Districts Data
 *
 * Provides geographic, agricultural, and market data for all 64 districts.
 * Used for location-specific weather forecasts and market price variations.
 *
 * Each district includes:
 *   - Coordinates (lat/lon) for weather API calls
 *   - Agricultural zone classification
 *   - Major crops grown in that district
 *   - Primary market names for price data
 *   - Climate zone for weather-price correlation
 */

/** Bangladesh agricultural zones */
export const AGRO_ZONES = {
  zone_a: {
    name: "উত্তর-পশ্চিম (রংপুর-দিনাজপুর)",
    nameEn: "North-West (Rangpur-Dinajpur)",
    avgRainfall: 1800,
    mainSeason: "রবি",
    color: "#2563eb",
  },
  zone_b: {
    name: "উত্তর-মধ্য (রাজশাহী-বগুড়া)",
    nameEn: "North-Central (Rajshahi-Bogra)",
    avgRainfall: 1500,
    mainSeason: "রবি",
    color: "#7c3aed",
  },
  zone_c: {
    name: "পূর্ব-মধ্য (সিলেট-ময়মনসিংহ)",
    nameEn: "East-Central (Sylhet-Mymensingh)",
    avgRainfall: 3000,
    mainSeason: "বোরো",
    color: "#16a34a",
  },
  zone_d: {
    name: "মধ্য (ঢাকা-টাঙ্গাইল)",
    nameEn: "Central (Dhaka-Tangail)",
    avgRainfall: 2000,
    mainSeason: "বোরো/আমন",
    color: "#d97706",
  },
  zone_e: {
    name: "দক্ষিণ-পশ্চিম (খুলনা-যশোর)",
    nameEn: "South-West (Khulna-Jessore)",
    avgRainfall: 1700,
    mainSeason: "আমন",
    color: "#dc2626",
  },
  zone_f: {
    name: "দক্ষিণ-মধ্য (বরিশাল-পটুয়াখালী)",
    nameEn: "South-Central (Barisal-Patuakhali)",
    avgRainfall: 2200,
    mainSeason: "আমন",
    color: "#0891b2",
  },
  zone_g: {
    name: "পূর্ব (চট্টগ্রাম-কক্সবাজার)",
    nameEn: "East (Chittagong-Coxsbazar)",
    avgRainfall: 2800,
    mainSeason: "আউশ/আমন",
    color: "#e11d48",
  },
  zone_h: {
    name: "পার্বত্য চট্টগ্রাম",
    nameEn: "Chittagong Hill Tracts",
    avgRainfall: 2500,
    mainSeason: "খরিপ",
    color: "#059669",
  },
};

/**
 * All 64 districts with agricultural metadata.
 * Sorted by division for logical grouping.
 */
export const BANGLADESH_DISTRICTS = [
  // ─── Dhaka Division ──────────────────────────────────────────────────
  {
    id: "dhaka",
    name: "ঢাকা",
    nameEn: "Dhaka",
    lat: 23.8103,
    lon: 90.4125,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট", "সরিষা", "ভুট্টা"],
    markets: ["কাওরান বাজার", "শ্যামবাজার"],
    priceAdjust: 1.05,
  },
  {
    id: "faridpur",
    name: "ফরিদপুর",
    nameEn: "Faridpur",
    lat: 23.607,
    lon: 89.8429,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট", "সরিষা"],
    markets: ["ফরিদপুর বাজার"],
    priceAdjust: 0.98,
  },
  {
    id: "gazipur",
    name: "গাজীপুর",
    nameEn: "Gazipur",
    lat: 23.9999,
    lon: 90.4203,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "সরিষা", "ভুট্টা"],
    markets: ["টঙ্গী বাজার"],
    priceAdjust: 1.03,
  },
  {
    id: "gopalganj",
    name: "গোপালগঞ্জ",
    nameEn: "Gopalganj",
    lat: 22.9963,
    lon: 89.8269,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট"],
    markets: ["গোপালগঞ্জ বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "kishoreganj",
    name: "কিশোরগঞ্জ",
    nameEn: "Kishoreganj",
    lat: 24.4449,
    lon: 90.7766,
    division: "ঢাকা",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট"],
    markets: ["কিশোরগঞ্জ বাজার"],
    priceAdjust: 0.96,
  },
  {
    id: "madaripur",
    name: "মাদারীপুর",
    nameEn: "Madaripur",
    lat: 23.1642,
    lon: 90.1897,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট"],
    markets: ["মাদারীপুর বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "manikganj",
    name: "মানিকগঞ্জ",
    nameEn: "Manikganj",
    lat: 23.8644,
    lon: 90.0057,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট", "আলু"],
    markets: ["মানিকগঞ্জ বাজার"],
    priceAdjust: 0.97,
  },
  {
    id: "munshiganj",
    name: "মুন্সিগঞ্জ",
    nameEn: "Munshiganj",
    lat: 23.5355,
    lon: 90.5285,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট"],
    markets: ["মুন্সিগঞ্জ বাজার"],
    priceAdjust: 0.98,
  },
  {
    id: "narayanganj",
    name: "নারায়ণগঞ্জ",
    nameEn: "Narayanganj",
    lat: 23.6238,
    lon: 90.5,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট"],
    markets: ["নারায়ণগঞ্জ বাজার"],
    priceAdjust: 1.04,
  },
  {
    id: "narsingdi",
    name: "নরসিংদী",
    nameEn: "Narsingdi",
    lat: 24.0667,
    lon: 90.7177,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট", "ভুট্টা"],
    markets: ["নরসিংদী বাজার"],
    priceAdjust: 0.97,
  },
  {
    id: "rajbari",
    name: "রাজবাড়ী",
    nameEn: "Rajbari",
    lat: 23.756,
    lon: 89.6496,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট", "সরিষা"],
    markets: ["রাজবাড়ী বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "shariatpur",
    name: "শরীয়তপুর",
    nameEn: "Shariatpur",
    lat: 23.2215,
    lon: 90.3494,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট"],
    markets: ["শরীয়তপুর বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "tangail",
    name: "টাঙ্গাইল",
    nameEn: "Tangail",
    lat: 24.2513,
    lon: 89.9167,
    division: "ঢাকা",
    zone: "zone_d",
    majorCrops: ["ধান", "পাট", "আলু", "সরিষা"],
    markets: ["টাঙ্গাইল বাজার"],
    priceAdjust: 0.97,
  },

  // ─── Chittagong Division ─────────────────────────────────────────────
  {
    id: "chittagong",
    name: "চট্টগ্রাম",
    nameEn: "Chittagong",
    lat: 22.3569,
    lon: 91.7832,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট", "কলা", "আম"],
    markets: ["চট্টগ্রাম কাপ্তান বাজার"],
    priceAdjust: 1.06,
  },
  {
    id: "comilla",
    name: "কুমিল্লা",
    nameEn: "Comilla",
    lat: 23.4607,
    lon: 91.1809,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট", "টমেটো"],
    markets: ["কুমিল্লা বাজার"],
    priceAdjust: 1.01,
  },
  {
    id: "coxsbazar",
    name: "কক্সবাজার",
    nameEn: "Cox's Bazar",
    lat: 21.4272,
    lon: 92.0058,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট", "কলা"],
    markets: ["কক্সবাজার বাজার"],
    priceAdjust: 1.08,
  },
  {
    id: "feni",
    name: "ফেনী",
    nameEn: "Feni",
    lat: 22.9875,
    lon: 91.3985,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট"],
    markets: ["ফেনী বাজার"],
    priceAdjust: 1.02,
  },
  {
    id: "rangamati",
    name: "রাঙ্গামাটি",
    nameEn: "Rangamati",
    lat: 22.658,
    lon: 92.1974,
    division: "চট্টগ্রাম",
    zone: "zone_h",
    majorCrops: ["ধান", "কলা", "আম"],
    markets: ["রাঙ্গামাটি বাজার"],
    priceAdjust: 1.1,
  },
  {
    id: "bandarban",
    name: "বান্দরবান",
    nameEn: "Bandarban",
    lat: 22.1953,
    lon: 92.2189,
    division: "চট্টগ্রাম",
    zone: "zone_h",
    majorCrops: ["ধান", "কলা", "আম"],
    markets: ["বান্দরবান বাজার"],
    priceAdjust: 1.12,
  },
  {
    id: "khagrachhari",
    name: "খাগড়াছড়ি",
    nameEn: "Khagrachhari",
    lat: 23.1191,
    lon: 91.9846,
    division: "চট্টগ্রাম",
    zone: "zone_h",
    majorCrops: ["ধান", "কলা"],
    markets: ["খাগড়াছড়ি বাজার"],
    priceAdjust: 1.1,
  },
  {
    id: "lakshmipur",
    name: "লক্ষ্মীপুর",
    nameEn: "Lakshmipur",
    lat: 22.9436,
    lon: 91.2484,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট"],
    markets: ["লক্ষ্মীপুর বাজার"],
    priceAdjust: 1.0,
  },
  {
    id: "noakhali",
    name: "নোয়াখালী",
    nameEn: "Noakhali",
    lat: 22.82,
    lon: 91.09,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট", "কলা"],
    markets: ["নোয়াখালী বাজার"],
    priceAdjust: 1.01,
  },
  {
    id: "brahmanbaria",
    name: "ব্রাহ্মণবাড়িয়া",
    nameEn: "Brahmanbaria",
    lat: 23.9571,
    lon: 91.112,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট", "বেগুন"],
    markets: ["ব্রাহ্মণবাড়িয়া বাজার"],
    priceAdjust: 1.0,
  },
  {
    id: "chandpur",
    name: "চাঁদপুর",
    nameEn: "Chandpur",
    lat: 23.2333,
    lon: 90.65,
    division: "চট্টগ্রাম",
    zone: "zone_g",
    majorCrops: ["ধান", "পাট"],
    markets: ["চাঁদপুর বাজার"],
    priceAdjust: 1.0,
  },

  // ─── Rajshahi Division ───────────────────────────────────────────────
  {
    id: "rajshahi",
    name: "রাজশাহী",
    nameEn: "Rajshahi",
    lat: 24.3745,
    lon: 88.6042,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "আম", "পাট", "ভুট্টা"],
    markets: ["রাজশাহী বাজার", "শাহমাখদুম"],
    priceAdjust: 0.97,
  },
  {
    id: "natore",
    name: "নাটোর",
    nameEn: "Natore",
    lat: 24.4206,
    lon: 88.9785,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "পাট", "আলু"],
    markets: ["নাটোর বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "naogaon",
    name: "নওগাঁ",
    nameEn: "Naogaon",
    lat: 24.7938,
    lon: 88.9318,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "গম", "ভুট্টা"],
    markets: ["নওগাঁ বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "chapainawabganj",
    name: "চাঁপাইনবাবগঞ্জ",
    nameEn: "Chapainawabganj",
    lat: 24.5967,
    lon: 88.2777,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "আম", "পাট"],
    markets: ["চাঁপাইনবাবগঞ্জ বাজার"],
    priceAdjust: 0.96,
  },
  {
    id: "pabna",
    name: "পাবনা",
    nameEn: "Pabna",
    lat: 24.0039,
    lon: 89.2372,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "পাট", "সরিষা"],
    markets: ["পাবনা বাজার"],
    priceAdjust: 0.96,
  },
  {
    id: "bogra",
    name: "বগুড়া",
    nameEn: "Bogra",
    lat: 24.8465,
    lon: 89.3766,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "আলু", "ভুট্টা", "গম"],
    markets: ["বগুড়া বাজার", "সাতমাথা"],
    priceAdjust: 0.98,
  },
  {
    id: "joypurhat",
    name: "জয়পুরহাট",
    nameEn: "Joypurhat",
    lat: 25.0969,
    lon: 89.0255,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "গম", "আলু"],
    markets: ["জয়পুরহাট বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "sirajganj",
    name: "সিরাজগঞ্জ",
    nameEn: "Sirajganj",
    lat: 24.4537,
    lon: 89.7094,
    division: "রাজশাহী",
    zone: "zone_b",
    majorCrops: ["ধান", "পাট", "গম"],
    markets: ["সিরাজগঞ্জ বাজার"],
    priceAdjust: 0.96,
  },

  // ─── Khulna Division ─────────────────────────────────────────────────
  {
    id: "khulna",
    name: "খুলনা",
    nameEn: "Khulna",
    lat: 22.8456,
    lon: 89.5403,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট", "কলা"],
    markets: ["খুলনা বাজার"],
    priceAdjust: 1.02,
  },
  {
    id: "jessore",
    name: "যশোর",
    nameEn: "Jessore",
    lat: 23.1667,
    lon: 89.2,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট", "টমেটো"],
    markets: ["যশোর বাজার"],
    priceAdjust: 1.0,
  },
  {
    id: "satkhira",
    name: "সাতক্ষীরা",
    nameEn: "Satkhira",
    lat: 22.7183,
    lon: 89.0764,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "চিংড়ি"],
    markets: ["সাতক্ষীরা বাজার"],
    priceAdjust: 1.03,
  },
  {
    id: "kushtia",
    name: "কুষ্টিয়া",
    nameEn: "Kushtia",
    lat: 23.9008,
    lon: 89.122,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট", "সরিষা"],
    markets: ["কুষ্টিয়া বাজার"],
    priceAdjust: 0.97,
  },
  {
    id: "meherpur",
    name: "মেহেরপুর",
    nameEn: "Meherpur",
    lat: 23.7637,
    lon: 88.6314,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট"],
    markets: ["মেহেরপুর বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "narail",
    name: "নড়াইল",
    nameEn: "Narail",
    lat: 23.1724,
    lon: 89.5073,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট"],
    markets: ["নড়াইল বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "magura",
    name: "মাগুরা",
    nameEn: "Magura",
    lat: 23.4833,
    lon: 89.4167,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট"],
    markets: ["মাগুরা বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "chuadanga",
    name: "চুয়াডাঙ্গা",
    nameEn: "Chuadanga",
    lat: 23.64,
    lon: 88.84,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট", "গম"],
    markets: ["চুয়াডাঙ্গা বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "bagerhat",
    name: "বাগেরহাট",
    nameEn: "Bagerhat",
    lat: 22.6517,
    lon: 89.7853,
    division: "খুলনা",
    zone: "zone_e",
    majorCrops: ["ধান", "পাট"],
    markets: ["বাগেরহাট বাজার"],
    priceAdjust: 0.96,
  },

  // ─── Barisal Division ────────────────────────────────────────────────
  {
    id: "barisal",
    name: "বরিশাল",
    nameEn: "Barisal",
    lat: 22.701,
    lon: 90.3535,
    division: "বরিশাল",
    zone: "zone_f",
    majorCrops: ["ধান", "পাট"],
    markets: ["বরিশাল বাজার"],
    priceAdjust: 1.02,
  },
  {
    id: "patuakhali",
    name: "পটুয়াখালী",
    nameEn: "Patuakhali",
    lat: 22.358,
    lon: 90.345,
    division: "বরিশাল",
    zone: "zone_f",
    majorCrops: ["ধান", "পাট"],
    markets: ["পটুয়াখালী বাজার"],
    priceAdjust: 1.04,
  },
  {
    id: "bhola",
    name: "ভোলা",
    nameEn: "Bhola",
    lat: 22.6859,
    lon: 90.6483,
    division: "বরিশাল",
    zone: "zone_f",
    majorCrops: ["ধান", "পাট"],
    markets: ["ভোলা বাজার"],
    priceAdjust: 1.03,
  },
  {
    id: "pirojpur",
    name: "পিরোজপুর",
    nameEn: "Pirojpur",
    lat: 22.5841,
    lon: 89.972,
    division: "বরিশাল",
    zone: "zone_f",
    majorCrops: ["ধান", "পাট"],
    markets: ["পিরোজপুর বাজার"],
    priceAdjust: 1.01,
  },
  {
    id: "jhalokati",
    name: "ঝালকাঠি",
    nameEn: "Jhalokati",
    lat: 22.6406,
    lon: 90.1987,
    division: "বরিশাল",
    zone: "zone_f",
    majorCrops: ["ধান", "পাট"],
    markets: ["ঝালকাঠি বাজার"],
    priceAdjust: 1.01,
  },
  {
    id: "barguna",
    name: "বরগুনা",
    nameEn: "Barguna",
    lat: 22.1559,
    lon: 90.1203,
    division: "বরিশাল",
    zone: "zone_f",
    majorCrops: ["ধান", "পাট"],
    markets: ["বরগুনা বাজার"],
    priceAdjust: 1.02,
  },

  // ─── Sylhet Division ─────────────────────────────────────────────────
  {
    id: "sylhet",
    name: "সিলেট",
    nameEn: "Sylhet",
    lat: 24.8949,
    lon: 91.8687,
    division: "সিলেট",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট", "কলা"],
    markets: ["সিলেট বাজার"],
    priceAdjust: 1.07,
  },
  {
    id: "moulvibazar",
    name: "মৌলভীবাজার",
    nameEn: "Moulvibazar",
    lat: 24.4829,
    lon: 91.7774,
    division: "সিলেট",
    zone: "zone_c",
    majorCrops: ["ধান", "কলা"],
    markets: ["মৌলভীবাজার বাজার"],
    priceAdjust: 1.06,
  },
  {
    id: "habiganj",
    name: "হবিগঞ্জ",
    nameEn: "Habiganj",
    lat: 24.3749,
    lon: 91.4155,
    division: "সিলেট",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট"],
    markets: ["হবিগঞ্জ বাজার"],
    priceAdjust: 1.05,
  },
  {
    id: "sunamganj",
    name: "সুনামগঞ্জ",
    nameEn: "Sunamganj",
    lat: 25.0657,
    lon: 91.397,
    division: "সিলেট",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট"],
    markets: ["সুনামগঞ্জ বাজার"],
    priceAdjust: 1.06,
  },

  // ─── Rangpur Division ────────────────────────────────────────────────
  {
    id: "rangpur",
    name: "রংপুর",
    nameEn: "Rangpur",
    lat: 25.7439,
    lon: 89.2752,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "গম", "ভুট্টা", "আলু"],
    markets: ["রংপুর বাজার"],
    priceAdjust: 0.96,
  },
  {
    id: "dinajpur",
    name: "দিনাজপুর",
    nameEn: "Dinajpur",
    lat: 25.627,
    lon: 88.6382,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "গম", "আলু", "ভুট্টা"],
    markets: ["দিনাজপুর বাজার", "বালুবাড়ি"],
    priceAdjust: 0.95,
  },
  {
    id: "kurigram",
    name: "কুড়িগ্রাম",
    nameEn: "Kurigram",
    lat: 25.8054,
    lon: 89.6687,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "গম"],
    markets: ["কুড়িগ্রাম বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "lalmonirhat",
    name: "লালমনিরহাট",
    nameEn: "Lalmonirhat",
    lat: 25.9097,
    lon: 89.45,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "গম", "ভুট্টা"],
    markets: ["লালমনিরহাট বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "nilphamari",
    name: "নীলফামারী",
    nameEn: "Nilphamari",
    lat: 25.9316,
    lon: 88.8561,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "আলু", "ভুট্টা"],
    markets: ["নীলফামারী বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "gaibandha",
    name: "গাইবান্ধা",
    nameEn: "Gaibandha",
    lat: 25.3289,
    lon: 89.5418,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "গম", "পাট"],
    markets: ["গাইবান্ধা বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "thakurgaon",
    name: "ঠাকুরগাঁও",
    nameEn: "Thakurgaon",
    lat: 26.0333,
    lon: 88.4667,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "গম", "আলু"],
    markets: ["ঠাকুরগাঁও বাজার"],
    priceAdjust: 0.94,
  },
  {
    id: "panchagarh",
    name: "পঞ্চগড়",
    nameEn: "Panchagarh",
    lat: 26.3353,
    lon: 88.5572,
    division: "রংপুর",
    zone: "zone_a",
    majorCrops: ["ধান", "গম", "আলু"],
    markets: ["পঞ্চগড় বাজার"],
    priceAdjust: 0.93,
  },

  // ─── Mymensingh Division ─────────────────────────────────────────────
  {
    id: "mymensingh",
    name: "ময়মনসিংহ",
    nameEn: "Mymensingh",
    lat: 24.7471,
    lon: 90.4279,
    division: "ময়মনসিংহ",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট", "সরিষা", "ভুট্টা"],
    markets: ["ময়মনসিংহ বাজার", "চাপইল"],
    priceAdjust: 0.98,
  },
  {
    id: "jamalpur",
    name: "জামালপুর",
    nameEn: "Jamalpur",
    lat: 24.9167,
    lon: 89.95,
    division: "ময়মনসিংহ",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট", "সরিষা"],
    markets: ["জামালপুর বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "sherpur",
    name: "শেরপুর",
    nameEn: "Sherpur",
    lat: 25.0176,
    lon: 90.0143,
    division: "ময়মনসিংহ",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট"],
    markets: ["শেরপুর বাজার"],
    priceAdjust: 0.95,
  },
  {
    id: "netrokona",
    name: "নেত্রকোনা",
    nameEn: "Netrokona",
    lat: 24.8821,
    lon: 90.7264,
    division: "ময়মনসিংহ",
    zone: "zone_c",
    majorCrops: ["ধান", "পাট"],
    markets: ["নেত্রকোনা বাজার"],
    priceAdjust: 0.96,
  },
];

/**
 * Division name mapping (Bengali -> English).
 */
const DIVISION_MAP = {
  ঢাকা: "Dhaka",
  চট্টগ্রাম: "Chittagong",
  রাজশাহী: "Rajshahi",
  খুলনা: "Khulna",
  বরিশাল: "Barisal",
  সিলেট: "Sylhet",
  রংপুর: "Rangpur",
  ময়মনসিংহ: "Mymensingh",
};

/**
 * Get districts by division.
 * @param {string} divisionBn - Bengali division name
 * @returns {Array} Districts in that division
 */
export function getDistrictsByDivision(divisionBn) {
  return BANGLADESH_DISTRICTS.filter((d) => d.division === divisionBn);
}

/**
 * Get all unique divisions.
 * @returns {Array<{id: string, name: string, nameEn: string}>}
 */
export function getDivisions() {
  const seen = new Set();
  return BANGLADESH_DISTRICTS.filter((d) => {
    if (seen.has(d.division)) return false;
    seen.add(d.division);
    return true;
  }).map((d) => ({
    id: d.division,
    name: d.division,
    nameEn: DIVISION_MAP[d.division] || d.division,
  }));
}

/**
 * Find the nearest district to given coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Object} Nearest district
 */
export function findNearestDistrict(lat, lon) {
  let nearest = BANGLADESH_DISTRICTS[0];
  let minDist = Infinity;

  for (const d of BANGLADESH_DISTRICTS) {
    const dist = Math.sqrt((d.lat - lat) ** 2 + (d.lon - lon) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = d;
    }
  }

  return nearest;
}

/**
 * Get district price adjustment factor.
 * Urban/remote districts have different price levels.
 * @param {string} districtId
 * @returns {number} Price multiplier (1.0 = national average)
 */
export function getDistrictPriceAdjust(districtId) {
  const district = BANGLADESH_DISTRICTS.find((d) => d.id === districtId);
  return district?.priceAdjust ?? 1.0;
}

/**
 * Get district by ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getDistrictById(id) {
  return BANGLADESH_DISTRICTS.find((d) => d.id === id);
}

/**
 * Get major crops for a district.
 * @param {string} districtId
 * @returns {Array<string>} Bengali crop names
 */
export function getDistrictMajorCrops(districtId) {
  const district = BANGLADESH_DISTRICTS.find((d) => d.id === districtId);
  return district?.majorCrops ?? [];
}
