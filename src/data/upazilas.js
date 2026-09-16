/**
 * @module data/upazilas
 * @description
 * Comprehensive upazila (sub-district) data for all 64 districts of Bangladesh.
 *
 * Each upazila links to its parent district via `districtId`, which corresponds
 * to the `id` field in `BANGLADESH_DISTRICTS` (see `src/data/bangladeshDistricts.js`).
 *
 * Data includes:
 *   - Unique identifier (slug-style: `districtId_sadar`, etc.)
 *   - Bengali name (`name`) and English name (`nameEn`)
 *   - Approximate centroid coordinates (`lat`, `lon`)
 *
 * Usage:
 *   import { UPAZILAS, getUpazilasByDistrict, getUpazilaById } from '@/data/upazilas';
 *
 * @example
 * // Get all upazilas in Dhaka district
 * const dhakaUpazilas = getUpazilasByDistrict('dhaka');
 *
 * @example
 * // Look up a single upazila
 * const savar = getUpazilaById('dhaka_savar');
 */

// ─────────────────────────────────────────────────────────────────────────────
// UPAZILAS — All sub-districts organised by division / district
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Array of all Bangladeshi upazilas with metadata.
 * @type {Array<{id: string, name: string, nameEn: string, districtId: string, lat: number, lon: number}>}
 */
export const UPAZILAS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // DHAKA DIVISION (13 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Dhaka ─────────────────────────────────────────────────────────────────
  { id: "dhaka_sadar", name: "ঢাকা সদর", nameEn: "Dhaka Sadar", districtId: "dhaka", lat: 23.8103, lon: 90.4125 },
  { id: "dhaka_savar", name: "সাভার", nameEn: "Savar", districtId: "dhaka", lat: 23.8591, lon: 90.2568 },
  { id: "dhaka_dhamrai", name: "ধামরাই", nameEn: "Dhamrai", districtId: "dhaka", lat: 23.9085, lon: 90.2121 },
  { id: "dhaka_keraniganj", name: "কেরানীগঞ্জ", nameEn: "Keraniganj", districtId: "dhaka", lat: 23.685, lon: 90.31 },
  { id: "dhaka_nawabganj", name: "নবাবগঞ্জ", nameEn: "Nawabganj", districtId: "dhaka", lat: 23.67, lon: 90.15 },

  // ── Faridpur ──────────────────────────────────────────────────────────────
  {
    id: "faridpur_sadar",
    name: "ফরিদপুর সদর",
    nameEn: "Faridpur Sadar",
    districtId: "faridpur",
    lat: 23.607,
    lon: 89.8429,
  },
  { id: "faridpur_boalmari", name: "বোয়ালমারী", nameEn: "Boalmari", districtId: "faridpur", lat: 23.39, lon: 89.68 },
  { id: "faridpur_alfadanga", name: "আলফাডাঙ্গা", nameEn: "Alfadanga", districtId: "faridpur", lat: 23.28, lon: 89.62 },
  { id: "faridpur_sadarpur", name: "সদরপুর", nameEn: "Sadarpur", districtId: "faridpur", lat: 23.47, lon: 89.95 },
  { id: "faridpur_bhanga", name: "ভাঙ্গা", nameEn: "Bhanga", districtId: "faridpur", lat: 23.38, lon: 89.99 },
  { id: "faridpur_madhukhali", name: "মধুখালী", nameEn: "Madhukhali", districtId: "faridpur", lat: 23.52, lon: 89.63 },
  {
    id: "faridpur_nagarkanda",
    name: "নগরকান্দা",
    nameEn: "Nagarkanda",
    districtId: "faridpur",
    lat: 23.26,
    lon: 89.88,
  },
  {
    id: "faridpur_charbhadrasan",
    name: "চরভদ্রাসন",
    nameEn: "Charbhadrasan",
    districtId: "faridpur",
    lat: 23.59,
    lon: 90.06,
  },

  // ── Gazipur ───────────────────────────────────────────────────────────────
  {
    id: "gazipur_sadar",
    name: "গাজীপুর সদর",
    nameEn: "Gazipur Sadar",
    districtId: "gazipur",
    lat: 23.9999,
    lon: 90.4203,
  },
  { id: "gazipur_kaliakair", name: "কালিয়াকৈর", nameEn: "Kaliakair", districtId: "gazipur", lat: 24.07, lon: 90.23 },
  { id: "gazipur_kaliganj", name: "কালীগঞ্জ", nameEn: "Kaliganj", districtId: "gazipur", lat: 23.92, lon: 90.56 },
  { id: "gazipur_tongi", name: "টঙ্গী", nameEn: "Tongi", districtId: "gazipur", lat: 23.8915, lon: 90.4023 },
  { id: "gazipur_kapasia", name: "কাপাসিয়া", nameEn: "Kapasia", districtId: "gazipur", lat: 24.09, lon: 90.56 },
  { id: "gazipur_sreepur", name: "শ্রীপুর", nameEn: "Sreepur", districtId: "gazipur", lat: 24.2, lon: 90.48 },

  // ── Gopalganj ─────────────────────────────────────────────────────────────
  {
    id: "gopalganj_sadar",
    name: "গোপালগঞ্জ সদর",
    nameEn: "Gopalganj Sadar",
    districtId: "gopalganj",
    lat: 22.9963,
    lon: 89.8269,
  },
  {
    id: "gopalganj_kotalipara",
    name: "কোটালীপাড়া",
    nameEn: "Kotalipara",
    districtId: "gopalganj",
    lat: 22.87,
    lon: 89.85,
  },
  {
    id: "gopalganj_tungipara",
    name: "টুঙ্গিপাড়া",
    nameEn: "Tungipara",
    districtId: "gopalganj",
    lat: 22.92,
    lon: 89.88,
  },
  {
    id: "gopalganj_muksudpur",
    name: "মুকসুদপুর",
    nameEn: "Muksudpur",
    districtId: "gopalganj",
    lat: 23.15,
    lon: 89.83,
  },
  { id: "gopalganj_kashiani", name: "কাশিয়ানী", nameEn: "Kashiani", districtId: "gopalganj", lat: 23.08, lon: 89.7 },

  // ── Kishoreganj ───────────────────────────────────────────────────────────
  {
    id: "kishoreganj_sadar",
    name: "কিশোরগঞ্জ সদর",
    nameEn: "Kishoreganj Sadar",
    districtId: "kishoreganj",
    lat: 24.4449,
    lon: 90.7766,
  },
  { id: "kishoreganj_bhairab", name: "ভৈরব", nameEn: "Bhairab", districtId: "kishoreganj", lat: 24.05, lon: 90.98 },
  {
    id: "kishoreganj_kuliarchar",
    name: "কুলিয়ারচর",
    nameEn: "Kuliarchar",
    districtId: "kishoreganj",
    lat: 24.3,
    lon: 90.89,
  },
  {
    id: "kishoreganj_hossainpur",
    name: "হোসেনপুর",
    nameEn: "Hossainpur",
    districtId: "kishoreganj",
    lat: 24.51,
    lon: 90.65,
  },
  {
    id: "kishoreganj_pakundia",
    name: "পাকুন্দিয়া",
    nameEn: "Pakundia",
    districtId: "kishoreganj",
    lat: 24.33,
    lon: 90.68,
  },
  { id: "kishoreganj_katiadi", name: "কটিয়াদি", nameEn: "Katiadi", districtId: "kishoreganj", lat: 24.2, lon: 90.81 },
  {
    id: "kishoreganj_bajitpur",
    name: "বাজিতপুর",
    nameEn: "Bajitpur",
    districtId: "kishoreganj",
    lat: 24.21,
    lon: 90.54,
  },
  {
    id: "kishoreganj_austagram",
    name: "অষ্টগ্রাম",
    nameEn: "Austagram",
    districtId: "kishoreganj",
    lat: 24.65,
    lon: 90.95,
  },

  // ── Madaripur ─────────────────────────────────────────────────────────────
  {
    id: "madaripur_sadar",
    name: "মাদারীপুর সদর",
    nameEn: "Madaripur Sadar",
    districtId: "madaripur",
    lat: 23.1642,
    lon: 90.1897,
  },
  { id: "madaripur_shibchar", name: "শিবচর", nameEn: "Shibchar", districtId: "madaripur", lat: 23.35, lon: 90.38 },
  { id: "madaripur_kalkini", name: "কালকিনি", nameEn: "Kalkini", districtId: "madaripur", lat: 23.05, lon: 90.15 },
  { id: "madaripur_rajoir", name: "রাজৈর", nameEn: "Rajoir", districtId: "madaripur", lat: 23.07, lon: 90.02 },

  // ── Manikganj ─────────────────────────────────────────────────────────────
  {
    id: "manikganj_sadar",
    name: "মানিকগঞ্জ সদর",
    nameEn: "Manikganj Sadar",
    districtId: "manikganj",
    lat: 23.8644,
    lon: 90.0057,
  },
  { id: "manikganj_singair", name: "সিংগাইর", nameEn: "Singair", districtId: "manikganj", lat: 23.82, lon: 89.91 },
  {
    id: "manikganj_harirampur",
    name: "হরিরামপুর",
    nameEn: "Harirampur",
    districtId: "manikganj",
    lat: 23.74,
    lon: 89.82,
  },
  { id: "manikganj_ghior", name: "ঘিওর", nameEn: "Ghior", districtId: "manikganj", lat: 23.91, lon: 89.92 },
  { id: "manikganj_saturia", name: "সাটুরিয়া", nameEn: "Saturia", districtId: "manikganj", lat: 23.94, lon: 89.86 },
  { id: "manikganj_shivalaya", name: "শিবালয়", nameEn: "Shivalaya", districtId: "manikganj", lat: 23.99, lon: 89.77 },
  { id: "manikganj_daulatpur", name: "দৌলতপুর", nameEn: "Daulatpur", districtId: "manikganj", lat: 23.8, lon: 89.96 },

  // ── Munshiganj ────────────────────────────────────────────────────────────
  {
    id: "munshiganj_sadar",
    name: "মুন্সিগঞ্জ সদর",
    nameEn: "Munshiganj Sadar",
    districtId: "munshiganj",
    lat: 23.5355,
    lon: 90.5285,
  },
  {
    id: "munshiganj_sirajdikhan",
    name: "সিরাজদিখান",
    nameEn: "Sirajdikhan",
    districtId: "munshiganj",
    lat: 23.48,
    lon: 90.38,
  },
  {
    id: "munshiganj_sreenagar",
    name: "শ্রীনগর",
    nameEn: "Sreenagar",
    districtId: "munshiganj",
    lat: 23.56,
    lon: 90.44,
  },
  { id: "munshiganj_lohajang", name: "লৌহজং", nameEn: "Lohajang", districtId: "munshiganj", lat: 23.46, lon: 90.49 },
  { id: "munshiganj_gazaria", name: "গজারিয়া", nameEn: "Gazaria", districtId: "munshiganj", lat: 23.57, lon: 90.62 },
  {
    id: "munshiganj_tongibari",
    name: "টঙ্গীবাড়ি",
    nameEn: "Tongibari",
    districtId: "munshiganj",
    lat: 23.51,
    lon: 90.41,
  },

  // ── Narayanganj ───────────────────────────────────────────────────────────
  {
    id: "narayanganj_sadar",
    name: "নারায়ণগঞ্জ সদর",
    nameEn: "Narayanganj Sadar",
    districtId: "narayanganj",
    lat: 23.6238,
    lon: 90.5,
  },
  {
    id: "narayanganj_sonargaon",
    name: "সোনারগাঁও",
    nameEn: "Sonargaon",
    districtId: "narayanganj",
    lat: 23.65,
    lon: 90.6,
  },
  {
    id: "narayanganj_araihazar",
    name: "আড়াইহাজার",
    nameEn: "Araihazar",
    districtId: "narayanganj",
    lat: 23.78,
    lon: 90.64,
  },
  { id: "narayanganj_bandar", name: "বন্দর", nameEn: "Bandar", districtId: "narayanganj", lat: 23.58, lon: 90.53 },
  { id: "narayanganj_rupganj", name: "রূপগঞ্জ", nameEn: "Rupganj", districtId: "narayanganj", lat: 23.73, lon: 90.56 },

  // ── Narsingdi ─────────────────────────────────────────────────────────────
  {
    id: "narsingdi_sadar",
    name: "নরসিংদী সদর",
    nameEn: "Narsingdi Sadar",
    districtId: "narsingdi",
    lat: 24.0667,
    lon: 90.7177,
  },
  { id: "narsingdi_shibpur", name: "শিবপুর", nameEn: "Shibpur", districtId: "narsingdi", lat: 24.02, lon: 90.81 },
  { id: "narsingdi_monohardi", name: "মনোহরদী", nameEn: "Monohardi", districtId: "narsingdi", lat: 24.18, lon: 90.63 },
  { id: "narsingdi_belabo", name: "বেলাবো", nameEn: "Belabo", districtId: "narsingdi", lat: 24.15, lon: 90.87 },
  { id: "narsingdi_raipura", name: "রায়পুরা", nameEn: "Raipura", districtId: "narsingdi", lat: 23.95, lon: 90.81 },
  { id: "narsingdi_polash", name: "পলাশ", nameEn: "Polash", districtId: "narsingdi", lat: 24.09, lon: 90.61 },

  // ── Rajbari ───────────────────────────────────────────────────────────────
  {
    id: "rajbari_sadar",
    name: "রাজবাড়ী সদর",
    nameEn: "Rajbari Sadar",
    districtId: "rajbari",
    lat: 23.756,
    lon: 89.6496,
  },
  { id: "rajbari_pangsha", name: "পাংশা", nameEn: "Pangsha", districtId: "rajbari", lat: 23.78, lon: 89.5 },
  {
    id: "rajbari_goalandaghat",
    name: "গোয়ালন্দঘাট",
    nameEn: "Goalandaghat",
    districtId: "rajbari",
    lat: 23.82,
    lon: 89.76,
  },
  {
    id: "rajbari_baliakandi",
    name: "বালিয়াকান্দি",
    nameEn: "Baliakandi",
    districtId: "rajbari",
    lat: 23.68,
    lon: 89.56,
  },
  { id: "rajbari_kalukhali", name: "কালুখালী", nameEn: "Kalukhali", districtId: "rajbari", lat: 23.64, lon: 89.73 },

  // ── Shariatpur ────────────────────────────────────────────────────────────
  {
    id: "shariatpur_sadar",
    name: "শরীয়তপুর সদর",
    nameEn: "Shariatpur Sadar",
    districtId: "shariatpur",
    lat: 23.2215,
    lon: 90.3494,
  },
  { id: "shariatpur_naria", name: "নড়িয়া", nameEn: "Naria", districtId: "shariatpur", lat: 23.27, lon: 90.41 },
  { id: "shariatpur_zanjira", name: "জাজিরা", nameEn: "Zanjira", districtId: "shariatpur", lat: 23.16, lon: 90.26 },
  {
    id: "shariatpur_gosairhat",
    name: "গোসাইরহাট",
    nameEn: "Gosairhat",
    districtId: "shariatpur",
    lat: 23.08,
    lon: 90.32,
  },
  {
    id: "shariatpur_bhedarganj",
    name: "ভেদরগঞ্জ",
    nameEn: "Bhedarganj",
    districtId: "shariatpur",
    lat: 23.14,
    lon: 90.45,
  },
  { id: "shariatpur_damudya", name: "দমুড়িয়া", nameEn: "Damudya", districtId: "shariatpur", lat: 23.3, lon: 90.28 },

  // ── Tangail ───────────────────────────────────────────────────────────────
  {
    id: "tangail_sadar",
    name: "টাঙ্গাইল সদর",
    nameEn: "Tangail Sadar",
    districtId: "tangail",
    lat: 24.2513,
    lon: 89.9167,
  },
  { id: "tangail_mirzapur", name: "মির্জাপুর", nameEn: "Mirzapur", districtId: "tangail", lat: 24.09, lon: 90.04 },
  { id: "tangail_ghatail", name: "ঘাটাইল", nameEn: "Ghatail", districtId: "tangail", lat: 24.47, lon: 89.83 },
  { id: "tangail_kalihati", name: "কালিহাতী", nameEn: "Kalihati", districtId: "tangail", lat: 24.45, lon: 89.68 },
  { id: "tangail_sakhipur", name: "সখিপুর", nameEn: "Sakhipur", districtId: "tangail", lat: 24.43, lon: 90.16 },
  { id: "tangail_basail", name: "বাসাইল", nameEn: "Basail", districtId: "tangail", lat: 24.32, lon: 89.84 },
  { id: "tangail_delduar", name: "দেলদুয়ার", nameEn: "Delduar", districtId: "tangail", lat: 24.2, lon: 89.96 },
  { id: "tangail_bhuapur", name: "ভুয়াপুর", nameEn: "Bhuapur", districtId: "tangail", lat: 24.46, lon: 89.94 },
  { id: "tangail_madhupur", name: "মধুপুর", nameEn: "Madhupur", districtId: "tangail", lat: 24.6, lon: 90.03 },
  { id: "tangail_gopalpur", name: "গোপালপুর", nameEn: "Gopalpur", districtId: "tangail", lat: 24.56, lon: 89.64 },
  { id: "tangail_nagarpur", name: "নাগরপুর", nameEn: "Nagarpur", districtId: "tangail", lat: 24.08, lon: 89.78 },
  { id: "tangail_dhanbari", name: "ধনবাড়ী", nameEn: "Dhanbari", districtId: "tangail", lat: 24.55, lon: 89.78 },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHITTAGONG DIVISION (11 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Chittagong ────────────────────────────────────────────────────────────
  {
    id: "chittagong_sadar",
    name: "চট্টগ্রাম সদর",
    nameEn: "Chittagong Sadar",
    districtId: "chittagong",
    lat: 22.3569,
    lon: 91.7832,
  },
  {
    id: "chittagong_sitakunda",
    name: "সীতাকুণ্ড",
    nameEn: "Sitakunda",
    districtId: "chittagong",
    lat: 22.62,
    lon: 91.67,
  },
  {
    id: "chittagong_mirsharai",
    name: "মীরসরাই",
    nameEn: "Mirsharai",
    districtId: "chittagong",
    lat: 22.78,
    lon: 91.57,
  },
  {
    id: "chittagong_fatikchhari",
    name: "ফটিকছড়ি",
    nameEn: "Fatikchhari",
    districtId: "chittagong",
    lat: 22.68,
    lon: 91.8,
  },
  {
    id: "chittagong_rangunia",
    name: "রাঙ্গুনিয়া",
    nameEn: "Rangunia",
    districtId: "chittagong",
    lat: 22.46,
    lon: 91.96,
  },
  { id: "chittagong_patiya", name: "পটিয়া", nameEn: "Patiya", districtId: "chittagong", lat: 22.29, lon: 91.98 },
  { id: "chittagong_anwara", name: "আনোয়ারা", nameEn: "Anwara", districtId: "chittagong", lat: 22.21, lon: 91.91 },
  { id: "chittagong_raozan", name: "রাউজান", nameEn: "Raozan", districtId: "chittagong", lat: 22.52, lon: 91.91 },
  { id: "chittagong_sandwip", name: "সন্দ্বীপ", nameEn: "Sandwip", districtId: "chittagong", lat: 22.48, lon: 91.44 },
  {
    id: "chittagong_banshkhali",
    name: "বাঁশখালী",
    nameEn: "Banshkhali",
    districtId: "chittagong",
    lat: 22.0,
    lon: 91.84,
  },
  {
    id: "chittagong_boalkhali",
    name: "বোয়ালখালী",
    nameEn: "Boalkhali",
    districtId: "chittagong",
    lat: 22.38,
    lon: 91.85,
  },
  {
    id: "chittagong_hathazari",
    name: "হাটহাজারী",
    nameEn: "Hathazari",
    districtId: "chittagong",
    lat: 22.51,
    lon: 91.8,
  },

  // ── Comilla ───────────────────────────────────────────────────────────────
  {
    id: "comilla_sadar",
    name: "কুমিল্লা সদর",
    nameEn: "Comilla Sadar",
    districtId: "comilla",
    lat: 23.4607,
    lon: 91.1809,
  },
  { id: "comilla_debidwar", name: "দেবিদ্বার", nameEn: "Debidwar", districtId: "comilla", lat: 23.59, lon: 91.15 },
  { id: "comilla_barura", name: "বরুড়া", nameEn: "Barura", districtId: "comilla", lat: 23.32, lon: 91.19 },
  { id: "comilla_laksam", name: "লাকসাম", nameEn: "Laksam", districtId: "comilla", lat: 23.22, lon: 91.11 },
  { id: "comilla_nangalkot", name: "নাঙ্গলকোট", nameEn: "Nangalkot", districtId: "comilla", lat: 23.2, lon: 91.26 },
  { id: "comilla_chandina", name: "চান্দিনা", nameEn: "Chandina", districtId: "comilla", lat: 23.36, lon: 91.29 },
  { id: "comilla_daudkandi", name: "দাউদকান্দি", nameEn: "Daudkandi", districtId: "comilla", lat: 23.54, lon: 90.95 },
  { id: "comilla_homna", name: "হোমনা", nameEn: "Homna", districtId: "comilla", lat: 23.69, lon: 90.98 },
  { id: "comilla_muradnagar", name: "মুরাদনগর", nameEn: "Muradnagar", districtId: "comilla", lat: 23.54, lon: 91.03 },
  {
    id: "comilla_chauddagram",
    name: "চৌদ্দগ্রাম",
    nameEn: "Chauddagram",
    districtId: "comilla",
    lat: 23.33,
    lon: 91.34,
  },
  {
    id: "comilla_brahmanpara",
    name: "ব্রাহ্মণপাড়া",
    nameEn: "Brahmanpara",
    districtId: "comilla",
    lat: 23.63,
    lon: 91.11,
  },

  // ── Cox's Bazar ───────────────────────────────────────────────────────────
  {
    id: "coxsbazar_sadar",
    name: "কক্সবাজার সদর",
    nameEn: "Cox's Bazar Sadar",
    districtId: "coxsbazar",
    lat: 21.4272,
    lon: 92.0058,
  },
  { id: "coxsbazar_teknaf", name: "টেকনাফ", nameEn: "Teknaf", districtId: "coxsbazar", lat: 20.87, lon: 92.3 },
  { id: "coxsbazar_ukhia", name: "উখিয়া", nameEn: "Ukhia", districtId: "coxsbazar", lat: 21.17, lon: 92.12 },
  { id: "coxsbazar_ramu", name: "রামু", nameEn: "Ramu", districtId: "coxsbazar", lat: 21.38, lon: 92.06 },
  { id: "coxsbazar_chakaria", name: "চকরিয়া", nameEn: "Chakaria", districtId: "coxsbazar", lat: 21.63, lon: 92.07 },
  { id: "coxsbazar_pekua", name: "পেকুয়া", nameEn: "Pekua", districtId: "coxsbazar", lat: 21.78, lon: 91.88 },
  {
    id: "coxsbazar_maheshkhali",
    name: "মহেশখালী",
    nameEn: "Maheshkhali",
    districtId: "coxsbazar",
    lat: 21.53,
    lon: 91.95,
  },
  { id: "coxsbazar_kutubdia", name: "কুতুবদিয়া", nameEn: "Kutubdia", districtId: "coxsbazar", lat: 21.82, lon: 91.85 },

  // ── Feni ──────────────────────────────────────────────────────────────────
  { id: "feni_sadar", name: "ফেনী সদর", nameEn: "Feni Sadar", districtId: "feni", lat: 22.9875, lon: 91.3985 },
  { id: "feni_chhagalnaiya", name: "ছাগলনাইয়া", nameEn: "Chhagalnaiya", districtId: "feni", lat: 22.87, lon: 91.48 },
  { id: "feni_daganbhuiyan", name: "দাগনভূঞা", nameEn: "Daganbhuiyan", districtId: "feni", lat: 22.86, lon: 91.3 },
  { id: "feni_sonagazi", name: "সোনাগাজী", nameEn: "Sonagazi", districtId: "feni", lat: 22.78, lon: 91.27 },
  { id: "feni_fulgazi", name: "ফুলগাজী", nameEn: "Fulgazi", districtId: "feni", lat: 23.11, lon: 91.4 },
  { id: "feni_parshuram", name: "পরশুরাম", nameEn: "Parshuram", districtId: "feni", lat: 23.07, lon: 91.48 },

  // ── Rangamati ─────────────────────────────────────────────────────────────
  {
    id: "rangamati_sadar",
    name: "রাঙ্গামাটি সদর",
    nameEn: "Rangamati Sadar",
    districtId: "rangamati",
    lat: 22.658,
    lon: 92.1974,
  },
  { id: "rangamati_kaptai", name: "কাপ্তাই", nameEn: "Kaptai", districtId: "rangamati", lat: 22.5, lon: 92.22 },
  { id: "rangamati_kawkhali", name: "কাউখালী", nameEn: "Kawkhali", districtId: "rangamati", lat: 22.45, lon: 92.07 },
  {
    id: "rangamati_baghaichhari",
    name: "বাঘাইছড়ি",
    nameEn: "Baghaichhari",
    districtId: "rangamati",
    lat: 23.05,
    lon: 92.08,
  },
  { id: "rangamati_barkal", name: "বরকল", nameEn: "Barkal", districtId: "rangamati", lat: 22.88, lon: 92.32 },
  {
    id: "rangamati_belaichhari",
    name: "বিলাইছড়ি",
    nameEn: "Belaichhari",
    districtId: "rangamati",
    lat: 22.77,
    lon: 92.42,
  },
  {
    id: "rangamati_juraichhari",
    name: "জুরাছড়ি",
    nameEn: "Juraichhari",
    districtId: "rangamati",
    lat: 22.63,
    lon: 92.38,
  },

  // ── Bandarban ─────────────────────────────────────────────────────────────
  {
    id: "bandarban_sadar",
    name: "বান্দরবান সদর",
    nameEn: "Bandarban Sadar",
    districtId: "bandarban",
    lat: 22.1953,
    lon: 92.2189,
  },
  { id: "bandarban_lama", name: "লামা", nameEn: "Lama", districtId: "bandarban", lat: 21.78, lon: 92.21 },
  {
    id: "bandarban_naikhongchhari",
    name: "নাইক্ষ্যংছড়ি",
    nameEn: "Naikhongchhari",
    districtId: "bandarban",
    lat: 21.43,
    lon: 92.18,
  },
  { id: "bandarban_alikadam", name: "আলীকদম", nameEn: "Ali Kadam", districtId: "bandarban", lat: 21.64, lon: 92.37 },
  { id: "bandarban_thanchi", name: "থানচি", nameEn: "Thanchi", districtId: "bandarban", lat: 21.78, lon: 92.43 },
  {
    id: "bandarban_rowangchhari",
    name: "রোয়াংছড়ি",
    nameEn: "Rowangchhari",
    districtId: "bandarban",
    lat: 22.02,
    lon: 92.37,
  },
  { id: "bandarban_ruma", name: "রুমা", nameEn: "Ruma", districtId: "bandarban", lat: 22.03, lon: 92.41 },

  // ── Khagrachhari ──────────────────────────────────────────────────────────
  {
    id: "khagrachhari_sadar",
    name: "খাগড়াছড়ি সদর",
    nameEn: "Khagrachhari Sadar",
    districtId: "khagrachhari",
    lat: 23.1191,
    lon: 91.9846,
  },
  {
    id: "khagrachhari_dighinala",
    name: "দীঘিনালা",
    nameEn: "Dighinala",
    districtId: "khagrachhari",
    lat: 23.37,
    lon: 92.07,
  },
  {
    id: "khagrachhari_panchhari",
    name: "পানছড়ি",
    nameEn: "Panchhari",
    districtId: "khagrachhari",
    lat: 23.4,
    lon: 91.87,
  },
  {
    id: "khagrachhari_matiranga",
    name: "মাটিরাঙ্গা",
    nameEn: "Matiranga",
    districtId: "khagrachhari",
    lat: 22.97,
    lon: 91.83,
  },
  { id: "khagrachhari_ramgarh", name: "রামগড়", nameEn: "Ramgarh", districtId: "khagrachhari", lat: 22.97, lon: 91.66 },
  {
    id: "khagrachhari_manikchhari",
    name: "মানিকছড়ি",
    nameEn: "Manikchhari",
    districtId: "khagrachhari",
    lat: 23.06,
    lon: 91.84,
  },
  {
    id: "khagrachhari_lakshmichhari",
    name: "লক্ষ্মীছড়ি",
    nameEn: "Lakshmichhari",
    districtId: "khagrachhari",
    lat: 23.19,
    lon: 91.96,
  },
  {
    id: "khagrachhari_mahalchhari",
    name: "মহালছড়ি",
    nameEn: "Mahalchhari",
    districtId: "khagrachhari",
    lat: 23.19,
    lon: 91.86,
  },

  // ── Lakshmipur ────────────────────────────────────────────────────────────
  {
    id: "lakshmipur_sadar",
    name: "লক্ষ্মীপুর সদর",
    nameEn: "Lakshmipur Sadar",
    districtId: "lakshmipur",
    lat: 22.9436,
    lon: 91.2484,
  },
  { id: "lakshmipur_raipur", name: "রায়পুর", nameEn: "Raipur", districtId: "lakshmipur", lat: 22.87, lon: 91.13 },
  { id: "lakshmipur_ramganj", name: "রামগঞ্জ", nameEn: "Ramganj", districtId: "lakshmipur", lat: 23.09, lon: 91.06 },
  { id: "lakshmipur_ramgati", name: "রামগতি", nameEn: "Ramgati", districtId: "lakshmipur", lat: 22.82, lon: 91.05 },
  {
    id: "lakshmipur_kamalnagar",
    name: "কমলনগর",
    nameEn: "Kamalnagar",
    districtId: "lakshmipur",
    lat: 22.98,
    lon: 91.17,
  },

  // ── Noakhali ──────────────────────────────────────────────────────────────
  {
    id: "noakhali_sadar",
    name: "নোয়াখালী সদর",
    nameEn: "Noakhali Sadar",
    districtId: "noakhali",
    lat: 22.82,
    lon: 91.09,
  },
  { id: "noakhali_begumganj", name: "বেগমগঞ্জ", nameEn: "Begumganj", districtId: "noakhali", lat: 22.94, lon: 91.06 },
  { id: "noakhali_senbagh", name: "সেনবাগ", nameEn: "Senbagh", districtId: "noakhali", lat: 22.97, lon: 91.2 },
  {
    id: "noakhali_companiganj",
    name: "কোম্পানীগঞ্জ",
    nameEn: "Companiganj",
    districtId: "noakhali",
    lat: 22.89,
    lon: 91.28,
  },
  { id: "noakhali_sonaimuri", name: "সোনাইমুড়ী", nameEn: "Sonaimuri", districtId: "noakhali", lat: 22.91, lon: 91.0 },
  { id: "noakhali_hatia", name: "হাতিয়া", nameEn: "Hatia", districtId: "noakhali", lat: 22.43, lon: 91.1 },
  {
    id: "noakhali_subarnachar",
    name: "সুবর্ণচর",
    nameEn: "Subarnachar",
    districtId: "noakhali",
    lat: 22.6,
    lon: 91.03,
  },
  { id: "noakhali_kabirhat", name: "কবিরহাট", nameEn: "Kabirhat", districtId: "noakhali", lat: 22.81, lon: 91.16 },
  { id: "noakhali_chatkhil", name: "চাটখিল", nameEn: "Chatkhil", districtId: "noakhali", lat: 23.07, lon: 90.96 },

  // ── Brahmanbaria ──────────────────────────────────────────────────────────
  {
    id: "brahmanbaria_sadar",
    name: "ব্রাহ্মণবাড়িয়া সদর",
    nameEn: "Brahmanbaria Sadar",
    districtId: "brahmanbaria",
    lat: 23.9571,
    lon: 91.112,
  },
  {
    id: "brahmanbaria_ashuganj",
    name: "আশুগঞ্জ",
    nameEn: "Ashuganj",
    districtId: "brahmanbaria",
    lat: 24.05,
    lon: 91.0,
  },
  {
    id: "brahmanbaria_nasirnagar",
    name: "নাসিরনগর",
    nameEn: "Nasirnagar",
    districtId: "brahmanbaria",
    lat: 24.11,
    lon: 91.17,
  },
  {
    id: "brahmanbaria_nabinagar",
    name: "নবীনগর",
    nameEn: "Nabinagar",
    districtId: "brahmanbaria",
    lat: 24.05,
    lon: 90.86,
  },
  {
    id: "brahmanbaria_bancharampur",
    name: "বাঞ্ছারামপুর",
    nameEn: "Bancharampur",
    districtId: "brahmanbaria",
    lat: 23.85,
    lon: 91.05,
  },
  {
    id: "brahmanbaria_akhaura",
    name: "আখাউড়া",
    nameEn: "Akhaura",
    districtId: "brahmanbaria",
    lat: 23.87,
    lon: 91.21,
  },
  { id: "brahmanbaria_kasba", name: "কসবা", nameEn: "Kasba", districtId: "brahmanbaria", lat: 23.72, lon: 91.19 },
  { id: "brahmanbaria_sarail", name: "সরাইল", nameEn: "Sarail", districtId: "brahmanbaria", lat: 24.07, lon: 91.16 },
  {
    id: "brahmanbaria_bijoynagar",
    name: "বিজয়নগর",
    nameEn: "Bijoynagar",
    districtId: "brahmanbaria",
    lat: 23.87,
    lon: 91.32,
  },

  // ── Chandpur ──────────────────────────────────────────────────────────────
  {
    id: "chandpur_sadar",
    name: "চাঁদপুর সদর",
    nameEn: "Chandpur Sadar",
    districtId: "chandpur",
    lat: 23.2333,
    lon: 90.65,
  },
  {
    id: "chandpur_matlab_dakshin",
    name: "মতলব দক্ষিণ",
    nameEn: "Matlab Dakshin",
    districtId: "chandpur",
    lat: 23.32,
    lon: 90.67,
  },
  {
    id: "chandpur_matlab_uttar",
    name: "মতলব উত্তর",
    nameEn: "Matlab Uttar",
    districtId: "chandpur",
    lat: 23.37,
    lon: 90.72,
  },
  { id: "chandpur_haimchar", name: "হাইমচর", nameEn: "Haimchar", districtId: "chandpur", lat: 23.18, lon: 90.6 },
  { id: "chandpur_faridganj", name: "ফরিদগঞ্জ", nameEn: "Faridganj", districtId: "chandpur", lat: 23.23, lon: 90.77 },
  { id: "chandpur_haziganj", name: "হাজীগঞ্জ", nameEn: "Haziganj", districtId: "chandpur", lat: 23.19, lon: 90.82 },
  { id: "chandpur_kachua", name: "কচুয়া", nameEn: "Kachua", districtId: "chandpur", lat: 23.36, lon: 90.88 },
  { id: "chandpur_shahrasti", name: "শাহরাস্তি", nameEn: "Shahrasti", districtId: "chandpur", lat: 23.14, lon: 90.87 },

  // ═══════════════════════════════════════════════════════════════════════════
  // RAJSHAHI DIVISION (8 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Rajshahi ──────────────────────────────────────────────────────────────
  {
    id: "rajshahi_sadar",
    name: "রাজশাহী সদর",
    nameEn: "Rajshahi Sadar",
    districtId: "rajshahi",
    lat: 24.3745,
    lon: 88.6042,
  },
  { id: "rajshahi_paba", name: "পবা", nameEn: "Paba", districtId: "rajshahi", lat: 24.34, lon: 88.57 },
  { id: "rajshahi_charghat", name: "চারঘাট", nameEn: "Charghat", districtId: "rajshahi", lat: 24.25, lon: 88.72 },
  { id: "rajshahi_bagha", name: "বাঘা", nameEn: "Bagha", districtId: "rajshahi", lat: 24.2, lon: 88.81 },
  { id: "rajshahi_godagari", name: "গোদাগাড়ী", nameEn: "Godagari", districtId: "rajshahi", lat: 24.47, lon: 88.38 },
  { id: "rajshahi_tanore", name: "তানোর", nameEn: "Tanore", districtId: "rajshahi", lat: 24.51, lon: 88.51 },
  { id: "rajshahi_mohanpur", name: "মোহনপুর", nameEn: "Mohanpur", districtId: "rajshahi", lat: 24.55, lon: 88.64 },
  { id: "rajshahi_puthia", name: "পুঠিয়া", nameEn: "Puthia", districtId: "rajshahi", lat: 24.38, lon: 88.83 },
  { id: "rajshahi_durgapur", name: "দুর্গাপুর", nameEn: "Durgapur", districtId: "rajshahi", lat: 24.45, lon: 88.89 },

  // ── Natore ────────────────────────────────────────────────────────────────
  { id: "natore_sadar", name: "নাটোর সদর", nameEn: "Natore Sadar", districtId: "natore", lat: 24.4206, lon: 88.9785 },
  { id: "natore_baraigram", name: "বড়াইগ্রাম", nameEn: "Baraigram", districtId: "natore", lat: 24.51, lon: 89.09 },
  { id: "natore_gurudaspur", name: "গুরুদাসপুর", nameEn: "Gurudaspur", districtId: "natore", lat: 24.36, lon: 89.14 },
  { id: "natore_singra", name: "সিংড়া", nameEn: "Singra", districtId: "natore", lat: 24.57, lon: 88.91 },
  { id: "natore_bagatipara", name: "বাগাতিপাড়া", nameEn: "Bagatipara", districtId: "natore", lat: 24.29, lon: 89.02 },
  { id: "natore_lalpur", name: "লালপুর", nameEn: "Lalpur", districtId: "natore", lat: 24.25, lon: 89.22 },

  // ── Naogaon ───────────────────────────────────────────────────────────────
  {
    id: "naogaon_sadar",
    name: "নওগাঁ সদর",
    nameEn: "Naogaon Sadar",
    districtId: "naogaon",
    lat: 24.7938,
    lon: 88.9318,
  },
  { id: "naogaon_manda", name: "মান্দা", nameEn: "Manda", districtId: "naogaon", lat: 24.78, lon: 88.75 },
  { id: "naogaon_mahadebpur", name: "মহাদেবপুর", nameEn: "Mahadebpur", districtId: "naogaon", lat: 24.93, lon: 88.83 },
  { id: "naogaon_raninagar", name: "রাণীনগর", nameEn: "Raninagar", districtId: "naogaon", lat: 24.74, lon: 88.84 },
  { id: "naogaon_atrai", name: "আত্রাই", nameEn: "Atrai", districtId: "naogaon", lat: 24.63, lon: 88.75 },
  { id: "naogaon_dhamoirhat", name: "ধামইরহাট", nameEn: "Dhamoirhat", districtId: "naogaon", lat: 25.07, lon: 88.83 },
  { id: "naogaon_porsha", name: "পোরশা", nameEn: "Porsha", districtId: "naogaon", lat: 25.08, lon: 88.65 },
  { id: "naogaon_sapahar", name: "সাপাহার", nameEn: "Sapahar", districtId: "naogaon", lat: 25.12, lon: 88.54 },
  { id: "naogaon_badalgachhi", name: "বদলগাছী", nameEn: "Badalgachhi", districtId: "naogaon", lat: 24.86, lon: 88.81 },
  { id: "naogaon_patnitala", name: "পত্নীতলা", nameEn: "Patnitala", districtId: "naogaon", lat: 25.02, lon: 88.74 },
  { id: "naogaon_niamatpur", name: "নিয়ামতপুর", nameEn: "Niamatpur", districtId: "naogaon", lat: 24.71, lon: 88.64 },

  // ── Chapainawabganj ───────────────────────────────────────────────────────
  {
    id: "chapainawabganj_sadar",
    name: "চাঁপাইনবাবগঞ্জ সদর",
    nameEn: "Chapainawabganj Sadar",
    districtId: "chapainawabganj",
    lat: 24.5967,
    lon: 88.2777,
  },
  {
    id: "chapainawabganj_shibganj",
    name: "শিবগঞ্জ",
    nameEn: "Shibganj",
    districtId: "chapainawabganj",
    lat: 24.69,
    lon: 88.16,
  },
  {
    id: "chapainawabganj_gomastapur",
    name: "গোমস্তাপুর",
    nameEn: "Gomastapur",
    districtId: "chapainawabganj",
    lat: 24.71,
    lon: 88.36,
  },
  {
    id: "chapainawabganj_nachole",
    name: "নাচোল",
    nameEn: "Nachole",
    districtId: "chapainawabganj",
    lat: 24.61,
    lon: 88.38,
  },
  {
    id: "chapainawabganj_bholahat",
    name: "ভোলাহাট",
    nameEn: "Bholahat",
    districtId: "chapainawabganj",
    lat: 24.83,
    lon: 88.24,
  },

  // ── Pabna ─────────────────────────────────────────────────────────────────
  { id: "pabna_sadar", name: "পাবনা সদর", nameEn: "Pabna Sadar", districtId: "pabna", lat: 24.0039, lon: 89.2372 },
  { id: "pabna_ishwardi", name: "ঈশ্বরদী", nameEn: "Ishwardi", districtId: "pabna", lat: 24.13, lon: 89.05 },
  { id: "pabna_atgharia", name: "আটঘরিয়া", nameEn: "Atgharia", districtId: "pabna", lat: 24.02, lon: 89.08 },
  { id: "pabna_sujanagar", name: "সুজানগর", nameEn: "Sujanagar", districtId: "pabna", lat: 23.92, lon: 89.3 },
  { id: "pabna_bera", name: "বেড়া", nameEn: "Bera", districtId: "pabna", lat: 24.06, lon: 89.4 },
  { id: "pabna_santhia", name: "সাঁথিয়া", nameEn: "Santhia", districtId: "pabna", lat: 24.05, lon: 89.56 },
  { id: "pabna_bhangura", name: "ভাঙ্গুড়া", nameEn: "Bhangura", districtId: "pabna", lat: 24.17, lon: 89.4 },
  { id: "pabna_faridpur", name: "ফরিদপুর", nameEn: "Faridpur", districtId: "pabna", lat: 24.0, lon: 89.35 },

  // ── Bogra ─────────────────────────────────────────────────────────────────
  { id: "bogra_sadar", name: "বগুড়া সদর", nameEn: "Bogra Sadar", districtId: "bogra", lat: 24.8465, lon: 89.3766 },
  { id: "bogra_sherpur", name: "শেরপুর", nameEn: "Sherpur", districtId: "bogra", lat: 24.69, lon: 89.28 },
  { id: "bogra_dhunat", name: "ধুনট", nameEn: "Dhunat", districtId: "bogra", lat: 24.71, lon: 89.51 },
  {
    id: "bogra_dhupchanchia",
    name: "দুপচাঁচিয়া",
    nameEn: "Dhupchanchia",
    districtId: "bogra",
    lat: 24.82,
    lon: 89.17,
  },
  { id: "bogra_gabtali", name: "গাবতলী", nameEn: "Gabtali", districtId: "bogra", lat: 24.73, lon: 89.43 },
  { id: "bogra_sariakandi", name: "সারিয়াকান্দি", nameEn: "Sariakandi", districtId: "bogra", lat: 24.88, lon: 89.54 },
  { id: "bogra_shajahanpur", name: "শাজাহানপুর", nameEn: "Shajahanpur", districtId: "bogra", lat: 24.78, lon: 89.32 },
  { id: "bogra_nandigram", name: "নন্দীগ্রাম", nameEn: "Nandigram", districtId: "bogra", lat: 24.81, lon: 89.11 },
  { id: "bogra_kahaloo", name: "কাহালু", nameEn: "Kahaloo", districtId: "bogra", lat: 24.9, lon: 89.31 },
  { id: "bogra_adamdighi", name: "আদমদীঘি", nameEn: "Adamdighi", districtId: "bogra", lat: 24.91, lon: 89.13 },
  { id: "bogra_shibganj", name: "শিবগঞ্জ", nameEn: "Shibganj", districtId: "bogra", lat: 25.02, lon: 89.33 },

  // ── Joypurhat ─────────────────────────────────────────────────────────────
  {
    id: "joypurhat_sadar",
    name: "জয়পুরহাট সদর",
    nameEn: "Joypurhat Sadar",
    districtId: "joypurhat",
    lat: 25.0969,
    lon: 89.0255,
  },
  { id: "joypurhat_panchbibi", name: "পাঁচবিবি", nameEn: "Panchbibi", districtId: "joypurhat", lat: 25.16, lon: 89.04 },
  { id: "joypurhat_kalai", name: "কালাই", nameEn: "Kalai", districtId: "joypurhat", lat: 25.11, lon: 88.91 },
  { id: "joypurhat_khetlal", name: "ক্ষেতলাল", nameEn: "Khetlal", districtId: "joypurhat", lat: 25.06, lon: 89.13 },
  { id: "joypurhat_akkelpur", name: "আক্কেলপুর", nameEn: "Akkelpur", districtId: "joypurhat", lat: 25.04, lon: 88.87 },

  // ── Sirajganj ─────────────────────────────────────────────────────────────
  {
    id: "sirajganj_sadar",
    name: "সিরাজগঞ্জ সদর",
    nameEn: "Sirajganj Sadar",
    districtId: "sirajganj",
    lat: 24.4537,
    lon: 89.7094,
  },
  {
    id: "sirajganj_shahzadpur",
    name: "শাহজাদপুর",
    nameEn: "Shahzadpur",
    districtId: "sirajganj",
    lat: 24.19,
    lon: 89.59,
  },
  {
    id: "sirajganj_ullahpara",
    name: "উল্লাপাড়া",
    nameEn: "Ullahpara",
    districtId: "sirajganj",
    lat: 24.29,
    lon: 89.57,
  },
  { id: "sirajganj_belkuchi", name: "বেলকুচি", nameEn: "Belkuchi", districtId: "sirajganj", lat: 24.31, lon: 89.66 },
  {
    id: "sirajganj_kamarkhanda",
    name: "কামারখন্দ",
    nameEn: "Kamarkhanda",
    districtId: "sirajganj",
    lat: 24.52,
    lon: 89.64,
  },
  { id: "sirajganj_chauhali", name: "চৌহালী", nameEn: "Chauhali", districtId: "sirajganj", lat: 24.47, lon: 89.79 },
  { id: "sirajganj_raiganj", name: "রায়গঞ্জ", nameEn: "Raiganj", districtId: "sirajganj", lat: 24.37, lon: 89.57 },
  { id: "sirajganj_tarash", name: "তাড়াশ", nameEn: "Tarash", districtId: "sirajganj", lat: 24.52, lon: 89.42 },
  { id: "sirajganj_kazipur", name: "কাজীপুর", nameEn: "Kazipur", districtId: "sirajganj", lat: 24.66, lon: 89.62 },

  // ═══════════════════════════════════════════════════════════════════════════
  // KHULNA DIVISION (9 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Khulna ────────────────────────────────────────────────────────────────
  { id: "khulna_sadar", name: "খুলনা সদর", nameEn: "Khulna Sadar", districtId: "khulna", lat: 22.8456, lon: 89.5403 },
  { id: "khulna_daulatpur", name: "দৌলতপুর", nameEn: "Daulatpur", districtId: "khulna", lat: 22.88, lon: 89.48 },
  { id: "khulna_sonadanga", name: "সোনাডাঙ্গা", nameEn: "Sonadanga", districtId: "khulna", lat: 22.82, lon: 89.53 },
  { id: "khulna_rupsa", name: "রূপসা", nameEn: "Rupsa", districtId: "khulna", lat: 22.81, lon: 89.56 },
  { id: "khulna_dumuria", name: "ডুমুরিয়া", nameEn: "Dumuria", districtId: "khulna", lat: 22.78, lon: 89.41 },
  { id: "khulna_dighalia", name: "দিঘলিয়া", nameEn: "Dighalia", districtId: "khulna", lat: 22.89, lon: 89.51 },
  { id: "khulna_koyra", name: "কয়রা", nameEn: "Koyra", districtId: "khulna", lat: 22.61, lon: 89.33 },
  { id: "khulna_paikgachha", name: "পাইকগাছা", nameEn: "Paikgachha", districtId: "khulna", lat: 22.58, lon: 89.41 },
  { id: "khulna_batiaghata", name: "বটিয়াঘাটা", nameEn: "Batiaghata", districtId: "khulna", lat: 22.74, lon: 89.51 },
  { id: "khulna_terokhada", name: "তেরখাদা", nameEn: "Terokhada", districtId: "khulna", lat: 22.91, lon: 89.62 },

  // ── Jessore ───────────────────────────────────────────────────────────────
  { id: "jessore_sadar", name: "যশোর সদর", nameEn: "Jessore Sadar", districtId: "jessore", lat: 23.1667, lon: 89.2 },
  { id: "jessore_benapole", name: "বেনাপোল", nameEn: "Benapole", districtId: "jessore", lat: 23.05, lon: 88.99 },
  {
    id: "jessore_jhikargachha",
    name: "ঝিকরগাছা",
    nameEn: "Jhikargachha",
    districtId: "jessore",
    lat: 23.13,
    lon: 89.04,
  },
  { id: "jessore_chaugachha", name: "চৌগাছা", nameEn: "Chaugachha", districtId: "jessore", lat: 23.2, lon: 89.04 },
  { id: "jessore_bagherpara", name: "বাঘারপাড়া", nameEn: "Bagherpara", districtId: "jessore", lat: 23.25, lon: 89.33 },
  { id: "jessore_abhaynagar", name: "অভয়নগর", nameEn: "Abhaynagar", districtId: "jessore", lat: 23.02, lon: 89.22 },
  { id: "jessore_manirampur", name: "মণিরামপুর", nameEn: "Manirampur", districtId: "jessore", lat: 23.05, lon: 89.37 },
  { id: "jessore_keshabpur", name: "কেশবপুর", nameEn: "Keshabpur", districtId: "jessore", lat: 22.9, lon: 89.2 },
  { id: "jessore_sharsha", name: "শার্শা", nameEn: "Sharsha", districtId: "jessore", lat: 23.08, lon: 88.92 },

  // ── Satkhira ──────────────────────────────────────────────────────────────
  {
    id: "satkhira_sadar",
    name: "সাতক্ষীরা সদর",
    nameEn: "Satkhira Sadar",
    districtId: "satkhira",
    lat: 22.7183,
    lon: 89.0764,
  },
  { id: "satkhira_assasuni", name: "আশাশুনী", nameEn: "Assasuni", districtId: "satkhira", lat: 22.62, lon: 89.14 },
  { id: "satkhira_debhata", name: "দেবহাটা", nameEn: "Debhata", districtId: "satkhira", lat: 22.58, lon: 88.98 },
  { id: "satkhira_kalaroa", name: "কলারোয়া", nameEn: "Kalaroa", districtId: "satkhira", lat: 22.88, lon: 89.06 },
  { id: "satkhira_kaliganj", name: "কালীগঞ্জ", nameEn: "Kaliganj", districtId: "satkhira", lat: 22.92, lon: 88.98 },
  { id: "satkhira_shyamnagar", name: "শ্যামনগর", nameEn: "Shyamnagar", districtId: "satkhira", lat: 22.33, lon: 89.11 },
  { id: "satkhira_tala", name: "তালা", nameEn: "Tala", districtId: "satkhira", lat: 22.74, lon: 89.24 },

  // ── Kushtia ───────────────────────────────────────────────────────────────
  {
    id: "kushtia_sadar",
    name: "কুষ্টিয়া সদর",
    nameEn: "Kushtia Sadar",
    districtId: "kushtia",
    lat: 23.9008,
    lon: 89.122,
  },
  { id: "kushtia_kumarkhali", name: "কুমারখালী", nameEn: "Kumarkhali", districtId: "kushtia", lat: 23.86, lon: 89.26 },
  { id: "kushtia_daulatpur", name: "দৌলতপুর", nameEn: "Daulatpur", districtId: "kushtia", lat: 24.0, lon: 88.91 },
  { id: "kushtia_bheramara", name: "ভেড়ামারা", nameEn: "Bheramara", districtId: "kushtia", lat: 24.02, lon: 88.99 },
  { id: "kushtia_khoksa", name: "খোকসা", nameEn: "Khoksa", districtId: "kushtia", lat: 23.8, lon: 89.25 },
  { id: "kushtia_mirpur", name: "মিরপুর", nameEn: "Mirpur", districtId: "kushtia", lat: 23.93, lon: 89.01 },

  // ── Meherpur ──────────────────────────────────────────────────────────────
  {
    id: "meherpur_sadar",
    name: "মেহেরপুর সদর",
    nameEn: "Meherpur Sadar",
    districtId: "meherpur",
    lat: 23.7637,
    lon: 88.6314,
  },
  { id: "meherpur_mujibnagar", name: "মুজিবনগর", nameEn: "Mujibnagar", districtId: "meherpur", lat: 23.83, lon: 88.66 },
  { id: "meherpur_gangni", name: "গাংনী", nameEn: "Gangni", districtId: "meherpur", lat: 23.67, lon: 88.58 },

  // ── Narail ────────────────────────────────────────────────────────────────
  { id: "narail_sadar", name: "নড়াইল সদর", nameEn: "Narail Sadar", districtId: "narail", lat: 23.1724, lon: 89.5073 },
  { id: "narail_kalia", name: "কালিয়া", nameEn: "Kalia", districtId: "narail", lat: 23.02, lon: 89.56 },
  { id: "narail_lohagara", name: "লোহাগড়া", nameEn: "Lohagara", districtId: "narail", lat: 23.18, lon: 89.35 },

  // ── Magura ────────────────────────────────────────────────────────────────
  { id: "magura_sadar", name: "মাগুরা সদর", nameEn: "Magura Sadar", districtId: "magura", lat: 23.4833, lon: 89.4167 },
  { id: "magura_shalikha", name: "শালিখা", nameEn: "Shalikha", districtId: "magura", lat: 23.36, lon: 89.34 },
  { id: "magura_sreepur", name: "শ্রীপুর", nameEn: "Sreepur", districtId: "magura", lat: 23.58, lon: 89.34 },
  { id: "magura_mohammadpur", name: "মহম্মদপুর", nameEn: "Mohammadpur", districtId: "magura", lat: 23.46, lon: 89.53 },

  // ── Chuadanga ─────────────────────────────────────────────────────────────
  {
    id: "chuadanga_sadar",
    name: "চুয়াডাঙ্গা সদর",
    nameEn: "Chuadanga Sadar",
    districtId: "chuadanga",
    lat: 23.64,
    lon: 88.84,
  },
  {
    id: "chuadanga_alamdanga",
    name: "আলমডাঙ্গা",
    nameEn: "Alamdanga",
    districtId: "chuadanga",
    lat: 23.56,
    lon: 88.95,
  },
  {
    id: "chuadanga_damurhuda",
    name: "দামুড়হুদা",
    nameEn: "Damurhuda",
    districtId: "chuadanga",
    lat: 23.53,
    lon: 88.77,
  },
  {
    id: "chuadanga_jibannagar",
    name: "জীবননগর",
    nameEn: "Jibannagar",
    districtId: "chuadanga",
    lat: 23.45,
    lon: 88.87,
  },

  // ── Bagerhat ──────────────────────────────────────────────────────────────
  {
    id: "bagerhat_sadar",
    name: "বাগেরহাট সদর",
    nameEn: "Bagerhat Sadar",
    districtId: "bagerhat",
    lat: 22.6517,
    lon: 89.7853,
  },
  { id: "bagerhat_fakirhat", name: "ফকিরহাট", nameEn: "Fakirhat", districtId: "bagerhat", lat: 22.73, lon: 89.62 },
  { id: "bagerhat_mollahat", name: "মোল্লাহাট", nameEn: "Mollahat", districtId: "bagerhat", lat: 22.66, lon: 89.64 },
  { id: "bagerhat_sarankhola", name: "শরণখোলা", nameEn: "Sarankhola", districtId: "bagerhat", lat: 22.32, lon: 89.78 },
  { id: "bagerhat_rampal", name: "রামপাল", nameEn: "Rampal", districtId: "bagerhat", lat: 22.57, lon: 89.66 },
  {
    id: "bagerhat_morrelganj",
    name: "মোরেলগঞ্জ",
    nameEn: "Morrelganj",
    districtId: "bagerhat",
    lat: 22.45,
    lon: 89.86,
  },
  { id: "bagerhat_chitalmari", name: "চিতলমারী", nameEn: "Chitalmari", districtId: "bagerhat", lat: 22.77, lon: 89.73 },
  { id: "bagerhat_kachua", name: "কচুয়া", nameEn: "Kachua", districtId: "bagerhat", lat: 22.68, lon: 89.87 },
  { id: "bagerhat_mongla", name: "মোংলা", nameEn: "Mongla", districtId: "bagerhat", lat: 22.47, lon: 89.6 },

  // ═══════════════════════════════════════════════════════════════════════════
  // BARISAL DIVISION (6 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Barisal ───────────────────────────────────────────────────────────────
  {
    id: "barisal_sadar",
    name: "বরিশাল সদর",
    nameEn: "Barisal Sadar",
    districtId: "barisal",
    lat: 22.701,
    lon: 90.3535,
  },
  { id: "barisal_bakerganj", name: "বাকেরগঞ্জ", nameEn: "Bakerganj", districtId: "barisal", lat: 22.54, lon: 90.38 },
  { id: "barisal_babuganj", name: "বাবুগঞ্জ", nameEn: "Babuganj", districtId: "barisal", lat: 22.78, lon: 90.33 },
  { id: "barisal_wazirpur", name: "উজিরপুর", nameEn: "Wazirpur", districtId: "barisal", lat: 22.65, lon: 90.22 },
  {
    id: "barisal_banaripara",
    name: "বানারীপাড়া",
    nameEn: "Banaripara",
    districtId: "barisal",
    lat: 22.72,
    lon: 90.23,
  },
  { id: "barisal_gournadi", name: "গৌরনদী", nameEn: "Gournadi", districtId: "barisal", lat: 22.86, lon: 90.27 },
  { id: "barisal_agailjhara", name: "আগৈলঝাড়া", nameEn: "Agailjhara", districtId: "barisal", lat: 22.95, lon: 90.16 },
  {
    id: "barisal_mehendiganj",
    name: "মেহেন্দিগঞ্জ",
    nameEn: "Mehendiganj",
    districtId: "barisal",
    lat: 22.8,
    lon: 90.53,
  },
  { id: "barisal_hizla", name: "হিজলা", nameEn: "Hizla", districtId: "barisal", lat: 22.57, lon: 90.53 },
  { id: "barisal_muladi", name: "মুলাদী", nameEn: "Muladi", districtId: "barisal", lat: 22.84, lon: 90.38 },

  // ── Patuakhali ────────────────────────────────────────────────────────────
  {
    id: "patuakhali_sadar",
    name: "পটুয়াখালী সদর",
    nameEn: "Patuakhali Sadar",
    districtId: "patuakhali",
    lat: 22.358,
    lon: 90.345,
  },
  { id: "patuakhali_bauphal", name: "বাউফল", nameEn: "Bauphal", districtId: "patuakhali", lat: 22.44, lon: 90.31 },
  {
    id: "patuakhali_galachipa",
    name: "গলাচিপা",
    nameEn: "Galachipa",
    districtId: "patuakhali",
    lat: 22.17,
    lon: 90.41,
  },
  { id: "patuakhali_dashmina", name: "দশমিনা", nameEn: "Dashmina", districtId: "patuakhali", lat: 22.25, lon: 90.5 },
  { id: "patuakhali_kalapara", name: "কলাপাড়া", nameEn: "Kalapara", districtId: "patuakhali", lat: 21.99, lon: 90.23 },
  { id: "patuakhali_dumki", name: "দুমকি", nameEn: "Dumki", districtId: "patuakhali", lat: 22.47, lon: 90.39 },
  {
    id: "patuakhali_rangabali",
    name: "রাঙ্গাবালী",
    nameEn: "Rangabali",
    districtId: "patuakhali",
    lat: 22.06,
    lon: 90.46,
  },
  {
    id: "patuakhali_mirzaganj",
    name: "মির্জাগঞ্জ",
    nameEn: "Mirzaganj",
    districtId: "patuakhali",
    lat: 22.36,
    lon: 90.21,
  },

  // ── Bhola ─────────────────────────────────────────────────────────────────
  { id: "bhola_sadar", name: "ভোলা সদর", nameEn: "Bhola Sadar", districtId: "bhola", lat: 22.6859, lon: 90.6483 },
  { id: "bhola_daulatkhan", name: "দৌলতখান", nameEn: "Daulatkhan", districtId: "bhola", lat: 22.63, lon: 90.76 },
  { id: "bhola_borhanuddin", name: "বোরহানউদ্দিন", nameEn: "Borhanuddin", districtId: "bhola", lat: 22.53, lon: 90.64 },
  { id: "bhola_tazumuddin", name: "তজুমদ্দিন", nameEn: "Tazumuddin", districtId: "bhola", lat: 22.44, lon: 90.69 },
  { id: "bhola_manpura", name: "মনপুরা", nameEn: "Manpura", districtId: "bhola", lat: 22.34, lon: 90.73 },
  { id: "bhola_lalmohan", name: "লালমোহন", nameEn: "Lalmohan", districtId: "bhola", lat: 22.32, lon: 90.72 },
  { id: "bhola_charfasson", name: "চরফ্যাশন", nameEn: "Char Fasson", districtId: "bhola", lat: 22.17, lon: 90.69 },

  // ── Pirojpur ──────────────────────────────────────────────────────────────
  {
    id: "pirojpur_sadar",
    name: "পিরোজপুর সদর",
    nameEn: "Pirojpur Sadar",
    districtId: "pirojpur",
    lat: 22.5841,
    lon: 89.972,
  },
  { id: "pirojpur_mathbaria", name: "মঠবাড়িয়া", nameEn: "Mathbaria", districtId: "pirojpur", lat: 22.37, lon: 89.96 },
  {
    id: "pirojpur_bhandaria",
    name: "ভাণ্ডারিয়া",
    nameEn: "Bhandaria",
    districtId: "pirojpur",
    lat: 22.49,
    lon: 90.07,
  },
  { id: "pirojpur_nazirpur", name: "নাজিরপুর", nameEn: "Nazirpur", districtId: "pirojpur", lat: 22.76, lon: 89.95 },
  { id: "pirojpur_nesarabad", name: "নেছারাবাদ", nameEn: "Nesarabad", districtId: "pirojpur", lat: 22.63, lon: 90.09 },
  { id: "pirojpur_kawkhali", name: "কাউখালী", nameEn: "Kawkhali", districtId: "pirojpur", lat: 22.47, lon: 89.89 },

  // ── Jhalokati ─────────────────────────────────────────────────────────────
  {
    id: "jhalokati_sadar",
    name: "ঝালকাঠি সদর",
    nameEn: "Jhalokati Sadar",
    districtId: "jhalokati",
    lat: 22.6406,
    lon: 90.1987,
  },
  { id: "jhalokati_kathalia", name: "কাঠালিয়া", nameEn: "Kathalia", districtId: "jhalokati", lat: 22.45, lon: 90.23 },
  { id: "jhalokati_nalchity", name: "নলছিটি", nameEn: "Nalchity", districtId: "jhalokati", lat: 22.58, lon: 90.22 },
  { id: "jhalokati_rajapur", name: "রাজাপুর", nameEn: "Rajapur", districtId: "jhalokati", lat: 22.52, lon: 90.31 },

  // ── Barguna ───────────────────────────────────────────────────────────────
  {
    id: "barguna_sadar",
    name: "বরগুনা সদর",
    nameEn: "Barguna Sadar",
    districtId: "barguna",
    lat: 22.1559,
    lon: 90.1203,
  },
  { id: "barguna_amtali", name: "আমতলী", nameEn: "Amtali", districtId: "barguna", lat: 22.07, lon: 90.21 },
  { id: "barguna_patharghata", name: "পাথরঘাটা", nameEn: "Patharghata", districtId: "barguna", lat: 22.08, lon: 89.97 },
  { id: "barguna_bamna", name: "বামনা", nameEn: "Bamna", districtId: "barguna", lat: 22.27, lon: 90.02 },
  { id: "barguna_betagi", name: "বেতাগী", nameEn: "Betagi", districtId: "barguna", lat: 22.28, lon: 90.12 },
  { id: "barguna_taltali", name: "তালতলি", nameEn: "Taltali", districtId: "barguna", lat: 21.99, lon: 90.08 },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYLHET DIVISION (4 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Sylhet ────────────────────────────────────────────────────────────────
  { id: "sylhet_sadar", name: "সিলেট সদর", nameEn: "Sylhet Sadar", districtId: "sylhet", lat: 24.8949, lon: 91.8687 },
  {
    id: "sylhet_dakshin_surma",
    name: "দক্ষিণ সুরমা",
    nameEn: "Dakshin Surma",
    districtId: "sylhet",
    lat: 24.83,
    lon: 91.83,
  },
  { id: "sylhet_kanaighat", name: "কানাইঘাট", nameEn: "Kanaighat", districtId: "sylhet", lat: 25.05, lon: 92.0 },
  { id: "sylhet_jaintiapur", name: "জৈন্তাপুর", nameEn: "Jaintiapur", districtId: "sylhet", lat: 25.07, lon: 92.17 },
  { id: "sylhet_golapganj", name: "গোলাপগঞ্জ", nameEn: "Golapganj", districtId: "sylhet", lat: 24.81, lon: 91.96 },
  { id: "sylhet_beanibazar", name: "বিয়ানীবাজার", nameEn: "Beanibazar", districtId: "sylhet", lat: 24.76, lon: 92.16 },
  { id: "sylhet_barlekha", name: "বড়লেখা", nameEn: "Barlekha", districtId: "sylhet", lat: 24.68, lon: 92.17 },
  { id: "sylhet_fenchuganj", name: "ফেঞ্চুগঞ্জ", nameEn: "Fenchuganj", districtId: "sylhet", lat: 24.67, lon: 91.85 },
  { id: "sylhet_balaganj", name: "বালাগঞ্জ", nameEn: "Balaganj", districtId: "sylhet", lat: 24.72, lon: 91.76 },
  { id: "sylhet_biswanath", name: "বিশ্বনাথ", nameEn: "Biswanath", districtId: "sylhet", lat: 24.82, lon: 91.74 },
  {
    id: "sylhet_osmani_nagar",
    name: "ওসমানী নগর",
    nameEn: "Osmani Nagar",
    districtId: "sylhet",
    lat: 24.81,
    lon: 91.93,
  },
  { id: "sylhet_gowainghat", name: "গোয়াইনঘাট", nameEn: "Gowainghat", districtId: "sylhet", lat: 25.06, lon: 91.84 },
  { id: "sylhet_zakiganj", name: "জকিগঞ্জ", nameEn: "Zakiganj", districtId: "sylhet", lat: 25.02, lon: 92.14 },

  // ── Moulvibazar ───────────────────────────────────────────────────────────
  {
    id: "moulvibazar_sadar",
    name: "মৌলভীবাজার সদর",
    nameEn: "Moulvibazar Sadar",
    districtId: "moulvibazar",
    lat: 24.4829,
    lon: 91.7774,
  },
  {
    id: "moulvibazar_srimangal",
    name: "শ্রীমঙ্গল",
    nameEn: "Srimangal",
    districtId: "moulvibazar",
    lat: 24.31,
    lon: 91.73,
  },
  {
    id: "moulvibazar_kamalganj",
    name: "কমলগঞ্জ",
    nameEn: "Kamalganj",
    districtId: "moulvibazar",
    lat: 24.22,
    lon: 91.81,
  },
  { id: "moulvibazar_rajnagar", name: "রাজনগর", nameEn: "Rajnagar", districtId: "moulvibazar", lat: 24.51, lon: 91.88 },
  { id: "moulvibazar_juri", name: "জুড়ী", nameEn: "Juri", districtId: "moulvibazar", lat: 24.64, lon: 92.01 },
  {
    id: "moulvibazar_barlekha",
    name: "বড়লেখা",
    nameEn: "Barlekha",
    districtId: "moulvibazar",
    lat: 24.58,
    lon: 92.07,
  },
  { id: "moulvibazar_kulaura", name: "কুলাউড়া", nameEn: "Kulaura", districtId: "moulvibazar", lat: 24.51, lon: 92.03 },

  // ── Habiganj ──────────────────────────────────────────────────────────────
  {
    id: "habiganj_sadar",
    name: "হবিগঞ্জ সদর",
    nameEn: "Habiganj Sadar",
    districtId: "habiganj",
    lat: 24.3749,
    lon: 91.4155,
  },
  {
    id: "habiganj_chunarughat",
    name: "চুনারুঘাট",
    nameEn: "Chunarughat",
    districtId: "habiganj",
    lat: 24.18,
    lon: 91.43,
  },
  { id: "habiganj_madhabpur", name: "মাধবপুর", nameEn: "Madhabpur", districtId: "habiganj", lat: 24.21, lon: 91.54 },
  { id: "habiganj_bahubal", name: "বাহুবল", nameEn: "Bahubal", districtId: "habiganj", lat: 24.37, lon: 91.54 },
  {
    id: "habiganj_shayestaganj",
    name: "শায়েস্তাগঞ্জ",
    nameEn: "Shayestaganj",
    districtId: "habiganj",
    lat: 24.33,
    lon: 91.33,
  },
  {
    id: "habiganj_ajmiriganj",
    name: "আজমিরীগঞ্জ",
    nameEn: "Ajmiriganj",
    districtId: "habiganj",
    lat: 24.51,
    lon: 91.33,
  },
  {
    id: "habiganj_baniyachong",
    name: "বানিয়াচং",
    nameEn: "Baniyachong",
    districtId: "habiganj",
    lat: 24.51,
    lon: 91.51,
  },
  { id: "habiganj_nabiganj", name: "নবীগঞ্জ", nameEn: "Nabiganj", districtId: "habiganj", lat: 24.44, lon: 91.49 },
  { id: "habiganj_lakhai", name: "লাখাই", nameEn: "Lakhai", districtId: "habiganj", lat: 24.5, lon: 91.35 },

  // ── Sunamganj ─────────────────────────────────────────────────────────────
  {
    id: "sunamganj_sadar",
    name: "সুনামগঞ্জ সদর",
    nameEn: "Sunamganj Sadar",
    districtId: "sunamganj",
    lat: 25.0657,
    lon: 91.397,
  },
  { id: "sunamganj_tahirpur", name: "তাহিরপুর", nameEn: "Tahirpur", districtId: "sunamganj", lat: 25.11, lon: 91.2 },
  {
    id: "sunamganj_jamalganj",
    name: "জামালগঞ্জ",
    nameEn: "Jamalganj",
    districtId: "sunamganj",
    lat: 25.04,
    lon: 91.18,
  },
  {
    id: "sunamganj_bishwamvarpur",
    name: "বিশ্বম্ভরপুর",
    nameEn: "Bishwamvarpur",
    districtId: "sunamganj",
    lat: 25.09,
    lon: 91.5,
  },
  { id: "sunamganj_derai", name: "দিরাই", nameEn: "Derai", districtId: "sunamganj", lat: 24.8, lon: 91.3 },
  { id: "sunamganj_shalla", name: "শাল্লা", nameEn: "Shalla", districtId: "sunamganj", lat: 24.81, lon: 91.21 },
  {
    id: "sunamganj_dharampasha",
    name: "ধর্মপাশা",
    nameEn: "Dharampasha",
    districtId: "sunamganj",
    lat: 24.86,
    lon: 91.08,
  },
  { id: "sunamganj_chhatak", name: "ছাতক", nameEn: "Chhatak", districtId: "sunamganj", lat: 25.01, lon: 91.53 },
  {
    id: "sunamganj_jagannathpur",
    name: "জগন্নাথপুর",
    nameEn: "Jagannathpur",
    districtId: "sunamganj",
    lat: 24.85,
    lon: 91.51,
  },
  {
    id: "sunamganj_dowarabazar",
    name: "দোয়ারাবাজার",
    nameEn: "Dowarabazar",
    districtId: "sunamganj",
    lat: 25.18,
    lon: 91.44,
  },
  {
    id: "sunamganj_south_sunamganj",
    name: "দক্ষিণ সুনামগঞ্জ",
    nameEn: "South Sunamganj",
    districtId: "sunamganj",
    lat: 24.99,
    lon: 91.4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RANGPUR DIVISION (8 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Rangpur ───────────────────────────────────────────────────────────────
  {
    id: "rangpur_sadar",
    name: "রংপুর সদর",
    nameEn: "Rangpur Sadar",
    districtId: "rangpur",
    lat: 25.7439,
    lon: 89.2752,
  },
  { id: "rangpur_badarganj", name: "বদরগঞ্জ", nameEn: "Badarganj", districtId: "rangpur", lat: 25.68, lon: 89.1 },
  { id: "rangpur_mithapukur", name: "মিঠাপুকুর", nameEn: "Mithapukur", districtId: "rangpur", lat: 25.62, lon: 89.36 },
  { id: "rangpur_pirgachha", name: "পীরগাছা", nameEn: "Pirgachha", districtId: "rangpur", lat: 25.58, lon: 89.22 },
  { id: "rangpur_kaunia", name: "কাউনিয়া", nameEn: "Kaunia", districtId: "rangpur", lat: 25.77, lon: 89.42 },
  { id: "rangpur_taraganj", name: "তারাগঞ্জ", nameEn: "Taraganj", districtId: "rangpur", lat: 25.8, lon: 89.35 },
  { id: "rangpur_pirganj", name: "পীরগঞ্জ", nameEn: "Pirganj", districtId: "rangpur", lat: 25.53, lon: 89.18 },
  { id: "rangpur_gangachara", name: "গঙ্গাচড়া", nameEn: "Gangachara", districtId: "rangpur", lat: 25.87, lon: 89.34 },

  // ── Dinajpur ──────────────────────────────────────────────────────────────
  {
    id: "dinajpur_sadar",
    name: "দিনাজপুর সদর",
    nameEn: "Dinajpur Sadar",
    districtId: "dinajpur",
    lat: 25.627,
    lon: 88.6382,
  },
  { id: "dinajpur_birampur", name: "বিরামপুর", nameEn: "Birampur", districtId: "dinajpur", lat: 25.62, lon: 88.96 },
  { id: "dinajpur_birganj", name: "বীরগঞ্জ", nameEn: "Birganj", districtId: "dinajpur", lat: 25.83, lon: 88.63 },
  { id: "dinajpur_biral", name: "বিরল", nameEn: "Biral", districtId: "dinajpur", lat: 25.65, lon: 88.51 },
  { id: "dinajpur_bochaganj", name: "বোচাগঞ্জ", nameEn: "Bochaganj", districtId: "dinajpur", lat: 25.82, lon: 88.84 },
  {
    id: "dinajpur_chirirbandar",
    name: "চিরিরবন্দর",
    nameEn: "Chirirbandar",
    districtId: "dinajpur",
    lat: 25.68,
    lon: 88.87,
  },
  { id: "dinajpur_fulbari", name: "ফুলবাড়ী", nameEn: "Fulbari", districtId: "dinajpur", lat: 25.54, lon: 88.95 },
  { id: "dinajpur_ghoraghat", name: "ঘোড়াঘাট", nameEn: "Ghoraghat", districtId: "dinajpur", lat: 25.28, lon: 88.71 },
  { id: "dinajpur_hakimpur", name: "হাকিমপুর", nameEn: "Hakimpur", districtId: "dinajpur", lat: 25.54, lon: 88.87 },
  { id: "dinajpur_kaharole", name: "কাহারোল", nameEn: "Kaharole", districtId: "dinajpur", lat: 25.79, lon: 88.73 },
  { id: "dinajpur_khansama", name: "খানসামা", nameEn: "Khansama", districtId: "dinajpur", lat: 25.91, lon: 88.72 },
  { id: "dinajpur_nawabganj", name: "নবাবগঞ্জ", nameEn: "Nawabganj", districtId: "dinajpur", lat: 25.45, lon: 88.76 },
  {
    id: "dinajpur_parbatipur",
    name: "পার্বতীপুর",
    nameEn: "Parbatipur",
    districtId: "dinajpur",
    lat: 25.66,
    lon: 88.92,
  },

  // ── Kurigram ──────────────────────────────────────────────────────────────
  {
    id: "kurigram_sadar",
    name: "কুড়িগ্রাম সদর",
    nameEn: "Kurigram Sadar",
    districtId: "kurigram",
    lat: 25.8054,
    lon: 89.6687,
  },
  {
    id: "kurigram_nageshwari",
    name: "নাগেশ্বরী",
    nameEn: "Nageshwari",
    districtId: "kurigram",
    lat: 25.94,
    lon: 89.68,
  },
  {
    id: "kurigram_bhurungamari",
    name: "ভুরুঙ্গামারী",
    nameEn: "Bhurungamari",
    districtId: "kurigram",
    lat: 26.06,
    lon: 89.65,
  },
  { id: "kurigram_chilmari", name: "চিলমারী", nameEn: "Chilmari", districtId: "kurigram", lat: 25.57, lon: 89.67 },
  { id: "kurigram_phulbari", name: "ফুলবাড়ী", nameEn: "Phulbari", districtId: "kurigram", lat: 25.79, lon: 89.53 },
  { id: "kurigram_rajarhat", name: "রাজারহাট", nameEn: "Rajarhat", districtId: "kurigram", lat: 25.77, lon: 89.53 },
  { id: "kurigram_raumari", name: "রৌমারী", nameEn: "Raumari", districtId: "kurigram", lat: 25.65, lon: 89.77 },
  { id: "kurigram_ulpur", name: "উলিপুর", nameEn: "Ulipur", districtId: "kurigram", lat: 25.65, lon: 89.6 },
  {
    id: "kurigram_char_rajibpur",
    name: "চর রাজিবপুর",
    nameEn: "Char Rajibpur",
    districtId: "kurigram",
    lat: 25.53,
    lon: 89.77,
  },

  // ── Lalmonirhat ───────────────────────────────────────────────────────────
  {
    id: "lalmonirhat_sadar",
    name: "লালমনিরহাট সদর",
    nameEn: "Lalmonirhat Sadar",
    districtId: "lalmonirhat",
    lat: 25.9097,
    lon: 89.45,
  },
  {
    id: "lalmonirhat_aditmari",
    name: "আদিতমারী",
    nameEn: "Aditmari",
    districtId: "lalmonirhat",
    lat: 25.78,
    lon: 89.36,
  },
  {
    id: "lalmonirhat_kaliganj",
    name: "কালীগঞ্জ",
    nameEn: "Kaliganj",
    districtId: "lalmonirhat",
    lat: 25.88,
    lon: 89.28,
  },
  {
    id: "lalmonirhat_hatibandha",
    name: "হাতীবান্ধা",
    nameEn: "Hatibandha",
    districtId: "lalmonirhat",
    lat: 26.08,
    lon: 89.22,
  },
  { id: "lalmonirhat_patgram", name: "পাটগ্রাম", nameEn: "Patgram", districtId: "lalmonirhat", lat: 26.37, lon: 89.0 },

  // ── Nilphamari ────────────────────────────────────────────────────────────
  {
    id: "nilphamari_sadar",
    name: "নীলফামারী সদর",
    nameEn: "Nilphamari Sadar",
    districtId: "nilphamari",
    lat: 25.9316,
    lon: 88.8561,
  },
  { id: "nilphamari_saidpur", name: "সৈয়দপুর", nameEn: "Saidpur", districtId: "nilphamari", lat: 25.77, lon: 88.9 },
  { id: "nilphamari_domar", name: "ডোমার", nameEn: "Domar", districtId: "nilphamari", lat: 26.1, lon: 88.83 },
  { id: "nilphamari_dimla", name: "ডিমলা", nameEn: "Dimla", districtId: "nilphamari", lat: 26.14, lon: 88.94 },
  { id: "nilphamari_jaldhaka", name: "জলঢাকা", nameEn: "Jaldhaka", districtId: "nilphamari", lat: 26.05, lon: 88.95 },
  {
    id: "nilphamari_kishoreganj",
    name: "কিশোরগঞ্জ",
    nameEn: "Kishoreganj",
    districtId: "nilphamari",
    lat: 25.92,
    lon: 88.98,
  },

  // ── Gaibandha ─────────────────────────────────────────────────────────────
  {
    id: "gaibandha_sadar",
    name: "গাইবান্ধা সদর",
    nameEn: "Gaibandha Sadar",
    districtId: "gaibandha",
    lat: 25.3289,
    lon: 89.5418,
  },
  {
    id: "gaibandha_gobindaganj",
    name: "গোবিন্দগঞ্জ",
    nameEn: "Gobindaganj",
    districtId: "gaibandha",
    lat: 25.18,
    lon: 89.45,
  },
  {
    id: "gaibandha_sadullapur",
    name: "সাদুল্লাপুর",
    nameEn: "Sadullapur",
    districtId: "gaibandha",
    lat: 25.36,
    lon: 89.51,
  },
  {
    id: "gaibandha_palashbari",
    name: "পলাশবাড়ী",
    nameEn: "Palashbari",
    districtId: "gaibandha",
    lat: 25.27,
    lon: 89.36,
  },
  { id: "gaibandha_saghata", name: "সাঘাটা", nameEn: "Saghata", districtId: "gaibandha", lat: 25.35, lon: 89.64 },
  { id: "gaibandha_fulchhari", name: "ফুলছড়ি", nameEn: "Fulchhari", districtId: "gaibandha", lat: 25.44, lon: 89.57 },
  {
    id: "gaibandha_sundarganj",
    name: "সুন্দরগঞ্জ",
    nameEn: "Sundarganj",
    districtId: "gaibandha",
    lat: 25.51,
    lon: 89.52,
  },

  // ── Thakurgaon ────────────────────────────────────────────────────────────
  {
    id: "thakurgaon_sadar",
    name: "ঠাকুরগাঁও সদর",
    nameEn: "Thakurgaon Sadar",
    districtId: "thakurgaon",
    lat: 26.0333,
    lon: 88.4667,
  },
  { id: "thakurgaon_pirganj", name: "পীরগঞ্জ", nameEn: "Pirganj", districtId: "thakurgaon", lat: 25.86, lon: 88.47 },
  {
    id: "thakurgaon_baliadangi",
    name: "বালিয়াডাঙ্গী",
    nameEn: "Baliadangi",
    districtId: "thakurgaon",
    lat: 26.13,
    lon: 88.32,
  },
  { id: "thakurgaon_haripur", name: "হরিপুর", nameEn: "Haripur", districtId: "thakurgaon", lat: 26.02, lon: 88.28 },
  {
    id: "thakurgaon_ranisankail",
    name: "রাণীশংকৈল",
    nameEn: "Ranisankail",
    districtId: "thakurgaon",
    lat: 26.18,
    lon: 88.34,
  },

  // ── Panchagarh ────────────────────────────────────────────────────────────
  {
    id: "panchagarh_sadar",
    name: "পঞ্চগড় সদর",
    nameEn: "Panchagarh Sadar",
    districtId: "panchagarh",
    lat: 26.3353,
    lon: 88.5572,
  },
  { id: "panchagarh_debiganj", name: "দেবীগঞ্জ", nameEn: "Debiganj", districtId: "panchagarh", lat: 26.18, lon: 88.75 },
  { id: "panchagarh_boda", name: "বোদা", nameEn: "Boda", districtId: "panchagarh", lat: 26.22, lon: 88.58 },
  { id: "panchagarh_atwari", name: "আটোয়ারী", nameEn: "Atwari", districtId: "panchagarh", lat: 26.32, lon: 88.45 },
  { id: "panchagarh_tetulia", name: "তেতুলিয়া", nameEn: "Tetulia", districtId: "panchagarh", lat: 26.59, lon: 88.47 },

  // ═══════════════════════════════════════════════════════════════════════════
  // MYMENSINGH DIVISION (4 districts)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Mymensingh ────────────────────────────────────────────────────────────
  {
    id: "mymensingh_sadar",
    name: "ময়মনসিংহ সদর",
    nameEn: "Mymensingh Sadar",
    districtId: "mymensingh",
    lat: 24.7471,
    lon: 90.4279,
  },
  { id: "mymensingh_trishal", name: "ত্রিশাল", nameEn: "Trishal", districtId: "mymensingh", lat: 24.57, lon: 90.38 },
  { id: "mymensingh_bhaluka", name: "ভালুকা", nameEn: "Bhaluka", districtId: "mymensingh", lat: 24.42, lon: 90.4 },
  {
    id: "mymensingh_muktagachha",
    name: "মুক্তাগাছা",
    nameEn: "Muktagachha",
    districtId: "mymensingh",
    lat: 24.77,
    lon: 90.27,
  },
  {
    id: "mymensingh_gaffargaon",
    name: "গফরগাঁও",
    nameEn: "Gaffargaon",
    districtId: "mymensingh",
    lat: 24.86,
    lon: 90.54,
  },
  { id: "mymensingh_gauripur", name: "গৌরীপুর", nameEn: "Gauripur", districtId: "mymensingh", lat: 24.79, lon: 90.56 },
  {
    id: "mymensingh_haluaghat",
    name: "হালুয়াঘাট",
    nameEn: "Haluaghat",
    districtId: "mymensingh",
    lat: 25.19,
    lon: 90.36,
  },
  { id: "mymensingh_dhobaura", name: "ধোবাউড়া", nameEn: "Dhobaura", districtId: "mymensingh", lat: 25.14, lon: 90.46 },
  {
    id: "mymensingh_fulbaria",
    name: "ফুলবাড়িয়া",
    nameEn: "Fulbaria",
    districtId: "mymensingh",
    lat: 24.64,
    lon: 90.3,
  },
  {
    id: "mymensingh_ishwarganj",
    name: "ঈশ্বরগঞ্জ",
    nameEn: "Ishwarganj",
    districtId: "mymensingh",
    lat: 24.81,
    lon: 90.62,
  },
  { id: "mymensingh_nandail", name: "নান্দাইল", nameEn: "Nandail", districtId: "mymensingh", lat: 24.63, lon: 90.66 },
  { id: "mymensingh_phulpur", name: "ফুলপুর", nameEn: "Phulpur", districtId: "mymensingh", lat: 24.94, lon: 90.36 },
  {
    id: "mymensingh_tarakanda",
    name: "তারাকান্দা",
    nameEn: "Tarakanda",
    districtId: "mymensingh",
    lat: 24.94,
    lon: 90.48,
  },

  // ── Jamalpur ──────────────────────────────────────────────────────────────
  {
    id: "jamalpur_sadar",
    name: "জামালপুর সদর",
    nameEn: "Jamalpur Sadar",
    districtId: "jamalpur",
    lat: 24.9167,
    lon: 89.95,
  },
  { id: "jamalpur_islampur", name: "ইসলামপুর", nameEn: "Islampur", districtId: "jamalpur", lat: 25.08, lon: 89.78 },
  {
    id: "jamalpur_dewanganj",
    name: "দেওয়ানগঞ্জ",
    nameEn: "Dewanganj",
    districtId: "jamalpur",
    lat: 25.19,
    lon: 89.75,
  },
  { id: "jamalpur_bakshiganj", name: "বকশীগঞ্জ", nameEn: "Bakshiganj", districtId: "jamalpur", lat: 25.15, lon: 89.86 },
  { id: "jamalpur_melandaha", name: "মেলান্দহ", nameEn: "Melandaha", districtId: "jamalpur", lat: 25.05, lon: 89.87 },
  {
    id: "jamalpur_sarishabari",
    name: "সরিষাবাড়ী",
    nameEn: "Sarishabari",
    districtId: "jamalpur",
    lat: 24.78,
    lon: 89.9,
  },
  { id: "jamalpur_madarganj", name: "মাদারগঞ্জ", nameEn: "Madarganj", districtId: "jamalpur", lat: 24.8, lon: 89.85 },

  // ── Sherpur ───────────────────────────────────────────────────────────────
  {
    id: "sherpur_sadar",
    name: "শেরপুর সদর",
    nameEn: "Sherpur Sadar",
    districtId: "sherpur",
    lat: 25.0176,
    lon: 90.0143,
  },
  { id: "sherpur_jhenaigati", name: "ঝিনাইগাতী", nameEn: "Jhenaigati", districtId: "sherpur", lat: 25.23, lon: 89.92 },
  { id: "sherpur_nakla", name: "নকলা", nameEn: "Nakla", districtId: "sherpur", lat: 24.98, lon: 90.2 },
  {
    id: "sherpur_nalitabari",
    name: "নালিতাবাড়ী",
    nameEn: "Nalitabari",
    districtId: "sherpur",
    lat: 25.07,
    lon: 90.12,
  },
  { id: "sherpur_sreebardi", name: "শ্রীবরদী", nameEn: "Sreebardi", districtId: "sherpur", lat: 25.18, lon: 90.06 },

  // ── Netrokona ─────────────────────────────────────────────────────────────
  {
    id: "netrokona_sadar",
    name: "নেত্রকোনা সদর",
    nameEn: "Netrokona Sadar",
    districtId: "netrokona",
    lat: 24.8821,
    lon: 90.7264,
  },
  { id: "netrokona_madan", name: "মদন", nameEn: "Madan", districtId: "netrokona", lat: 24.74, lon: 90.81 },
  {
    id: "netrokona_khaliajuri",
    name: "খালিয়াজুরী",
    nameEn: "Khaliajuri",
    districtId: "netrokona",
    lat: 24.97,
    lon: 90.86,
  },
  {
    id: "netrokona_purbadhala",
    name: "পূর্বধলা",
    nameEn: "Purbadhala",
    districtId: "netrokona",
    lat: 24.8,
    lon: 90.63,
  },
  { id: "netrokona_durgapur", name: "দুর্গাপুর", nameEn: "Durgapur", districtId: "netrokona", lat: 25.18, lon: 90.66 },
  {
    id: "netrokona_kalmakanda",
    name: "কলমাকান্দা",
    nameEn: "Kalmakanda",
    districtId: "netrokona",
    lat: 25.05,
    lon: 90.83,
  },
  { id: "netrokona_barhatta", name: "বারহাট্টা", nameEn: "Barhatta", districtId: "netrokona", lat: 25.08, lon: 90.59 },
  { id: "netrokona_atpara", name: "আটপাড়া", nameEn: "Atpara", districtId: "netrokona", lat: 24.82, lon: 90.81 },
  { id: "netrokona_mohanganj", name: "মোহনগঞ্জ", nameEn: "Mohanganj", districtId: "netrokona", lat: 24.87, lon: 90.85 },
  { id: "netrokona_kendua", name: "কেন্দুয়া", nameEn: "Kendua", districtId: "netrokona", lat: 24.74, lon: 90.62 },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all upazilas belonging to a specific district.
 *
 * @param {string} districtId - The district identifier (e.g. 'dhaka', 'rajshahi')
 * @returns {Array<{id: string, name: string, nameEn: string, districtId: string, lat: number, lon: number}>}
 *   Array of upazila objects for the given district. Returns an empty array if
 *   the district ID does not match any upazilas.
 *
 * @example
 * const dhakaUpazilas = getUpazilasByDistrict('dhaka');
 * // => [{ id: 'dhaka_sadar', name: 'ঢাকা সদর', ... }, ...]
 */
export function getUpazilasByDistrict(districtId) {
  return UPAZILAS.filter((u) => u.districtId === districtId);
}

/**
 * Look up a single upazila by its unique identifier.
 *
 * @param {string} id - The upazila identifier (e.g. 'dhaka_savar', 'rajshahi_paba')
 * @returns {{id: string, name: string, nameEn: string, districtId: string, lat: number, lon: number}|undefined}
 *   The matching upazila object, or `undefined` if not found.
 *
 * @example
 * const savar = getUpazilaById('dhaka_savar');
 * // => { id: 'dhaka_savar', name: 'সাভার', nameEn: 'Savar', districtId: 'dhaka', lat: 23.8591, lon: 90.2568 }
 */
export function getUpazilaById(id) {
  return UPAZILAS.find((u) => u.id === id);
}

/**
 * Get the total number of upazilas in the dataset.
 *
 * @returns {number} Total count of upazilas across all districts.
 *
 * @example
 * getUpazilaCount(); // => 339
 */
export function getUpazilaCount() {
  return UPAZILAS.length;
}
