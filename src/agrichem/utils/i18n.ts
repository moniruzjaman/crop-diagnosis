export type Language = 'en' | 'bn';

export const toBnNumber = (input: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/[0-9]/g, (w) => banglaDigits[+w]);
};

export const formatNumberWithLang = (input: number | string, lang: Language): string => {
  if (lang === 'bn') {
    return toBnNumber(input);
  }
  return String(input);
};

export const CROP_TRANSLATIONS: Record<string, string> = {
  'All Crops': 'সকল ফসল',
  'Rice': 'ধান',
  'Potato': 'আলু',
  'Tomato': 'টমেটো',
  'Brinjal': 'বেগুন',
  'Mango': 'আম',
  'Jute': 'পাট',
  'Tea': 'চা',
  'Cotton': 'তুলা',
  'Wheat': 'গম',
  'Mustard': 'সরিষা',
  'Sugarcane': 'আখ',
  'Bean': 'শিম',
  'Cauliflower': 'ফুলকপি',
  'Cabbage': 'বাঁধাকপি',
  'Chilli': 'মরিচ',
  'Cucumber': 'শসা',
  'Cucurbits': 'লাউ/কুমড়া',
  'Maize': 'ভুট্টা',
  'Onion': 'পেঁয়াজ',
  'Garlic': 'রসুন',
  'Pulses': 'ডাল',
  'Groundnut': 'চীনাবাদাম',
  'Citrus': 'লেবু জাতীয় ফসল',
  'Crops field': 'মাঠের ফসল',
  'Paddy bunds': 'আইল',
  'Sugarcane fields': 'আখের জমি',
  'Grain stores': 'শস্যের গুদাম',
  'Crop borders': 'জমির সীমানা',
  'Burrow entrances': 'ইঁদুরের গর্ত',
  'Stored grain silos': 'গুদাম ও সাইলো',
  'Empty godowns': 'খালি গুদাম',
  'Grain bags': 'শস্যের বস্তা'
};

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'All Categories': 'সকল বালাইনাশক',
  'all': 'সকল বালাইনাশক',
  'Insecticide': 'কীটনাশক',
  'Fungicide': 'ছত্রাকনাশক',
  'Herbicide': 'আগাছানাশক',
  'Miticide': 'মাকড়নাশক',
  'Bio Pesticide': 'জৈব বালাইনাশক',
  'Stored Grain': 'গুদামজাত শস্য সংরক্ষণ',
  'Rodenticide': 'ইঁদুরনাশক'
};

export const RISK_TRANSLATIONS: Record<string, string> = {
  'all': 'সকল ঝুঁকি মাত্রা',
  'Low': 'কম ঝুঁকি (Low)',
  'Medium': 'মাঝারি ঝুঁকি (Medium)',
  'High': 'উচ্চ ঝুঁকি (High)',
  'Low to Medium': 'কম থেকে মাঝারি',
  'Medium to High': 'মাঝারি থেকে উচ্চ',
  'Unknown': 'অনির্ধারিত'
};

export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Header & Brand
    app_title: 'AgriChem Pro',
    app_subtitle: 'Pest & Disease Controls Guide',
    app_banner: 'Knowledge Sharing Field Guide — Not an official DAE directive',
    app_tagline: 'IRAC • FRAC • HRAC Resistance Rotation Protocols',
    registered_count_suffix: 'Registered Products',
    offline_ready: 'Offline-Ready Manual',
    search_placeholder: 'Search chemical, trade name, crop, pest or MoA code...',
    lang_toggle_label: 'বাংলা',

    // Navigation Tabs
    tab_home: 'Home',
    tab_database: 'Chemical Database',
    tab_calculator: 'Dosage Calculator',
    tab_rotation: 'MoA & Rotation Planner',
    tab_safety: 'Safety & PPE Checklists',
    tab_guidebook: 'Field Guidebook',
    tab_alerts: 'Regulatory & Seasonal Alerts',
    btn_share: 'Share',

    // Database View
    search_filter_title: 'Pesticide Catalog & Registration Dossiers',
    search_filter_desc: 'Search active ingredients, trade names, approved crops, and mode-of-action codes approved by the Department of Agricultural Extension (DAE).',
    filter_all_crops: 'All Crops',
    filter_all_categories: 'All Categories',
    filter_all_moa: 'All MoA Groups',
    filter_all_risks: 'All Resistance Risks',
    sort_by_label: 'Sort By',
    sort_name: 'Product Name (A-Z)',
    sort_type: 'Pesticide Category',
    sort_phi: 'Shortest PHI (Days)',
    sort_reg: 'Registration Number',
    showing_results: 'Showing',
    of_total: 'of',
    registered_chemicals: 'registered chemicals',
    clear_filters: 'Reset All Filters',
    download_crop_pdf: 'Export Crop Guide (PDF)',
    download_csv: 'Export Catalog (CSV)',
    no_results_title: 'No registered chemicals match your filter criteria',
    no_results_desc: 'Try relaxing your search terms, selecting "All Crops", or resetting active category filters.',

    // Product Card & Details
    trade_name: 'Trade Name',
    active_ingredient: 'Active Ingredient',
    registration_no: 'Reg. No',
    reg_holder: 'Company / Holder',
    target_crops: 'Approved Crops',
    target_pests: 'Target Pests / Diseases',
    dosage_rate: 'Application Rate',
    phi_label: 'PHI (Harvest)',
    rei_label: 'REI (Re-entry)',
    days: 'days',
    hours: 'hours',
    risk_suffix: 'Risk',
    btn_details: 'Details',
    btn_calculator: 'Calculator',
    btn_safety: 'Safety',
    btn_pdf: 'PDF',
    specification_sheet: 'Technical Specification Sheet',
    who_hazard_class: 'WHO Hazard Class',
    formulation_type: 'Formulation',
    spray_water_volume: 'Recommended Water Volume',
    resistance_guideline: 'Resistance Management Guideline',
    safety_cautions: 'Safety Precautions',

    // Dosage Calculator
    calc_header_title: 'Interactive Field Dosage & Tank Mix Station',
    calc_header_desc: 'Select any registered chemical to calculate precise knapsack tank mix rates, water volume, and area conversions.',
    calc_field_area: 'Field Area',
    calc_area_unit: 'Area Unit',
    calc_tank_size: 'Knapsack Tank Size',
    calc_spray_volume: 'Water Rate / Hectare',
    calc_results_summary: 'Field Application Prescription',
    calc_total_water: 'Total Water Required',
    calc_number_of_tanks: 'Backpack Refills',
    calc_total_chemical: 'Total Chemical Required',
    calc_chemical_per_tank: 'Chemical per Tank',
    calc_export_btn: 'Download Dosage Prescription (PDF)',
    calc_unit_ha: 'Hectare (হেক্টর)',
    calc_unit_acre: 'Acre (একর)',
    calc_unit_bigha: 'Bigha (বিঘা - ৩৩ শতাংশ)',
    calc_unit_katha: 'Katha (কাঠা)',
    calc_unit_sqm: 'Square Meters (বর্গমিটার)',

    // MoA Rotation
    rotation_title: 'Anti-Resistance Mode of Action (MoA) Planner',
    rotation_desc: 'Design alternating chemical sequences adhering to IRAC, FRAC, and HRAC rotation rules to avoid selection pressure and resistant pest populations.',
    rotation_select_crop: 'Select Crop & Growth Cycle',
    rotation_sequence_builder: 'Spray Rotation Sequence Builder',
    rotation_conflict_alert: 'MoA Conflict Warning',
    rotation_conflict_desc: 'Consecutive sprays share the same Mode of Action code! Switch to a different numbered group to break resistance.',
    rotation_add_spray: 'Add Next Spray Step',
    rotation_export_pdf: 'Export Rotation Plan (PDF)',

    // Safety View
    safety_header_title: 'Safety Precaution Checklists & Toxicity Protocols',
    safety_header_desc: 'Standard operating safety procedures for agricultural professionals. Interactive field pre-spray checks, WHO toxicity classification bands, emergency first aid protocols, and container decontamination guidelines.',
    safety_checklist_title: 'Interactive 10-Point Agricultural Application Safety Checklist',
    safety_checklist_sub: 'Field agronomists and spray teams should complete this protocol before, during, and after every field application.',
    safety_completed: 'Completed',
    safety_ready: 'Ready',
    safety_reset: 'Reset',
    safety_who_title: 'WHO Hazard Classification & Mandatory Color Bands',
    safety_aid_title: 'Emergency Medical Response & Antidote Guide',
    safety_quick_lookup: 'Lookup Chemical-Specific Safety Data & Download Field Sheet',

    // Guidebook
    guide_title: 'Field Agronomy Guidebook & Application Standards',
    guide_desc: 'Practical knapsack sprayer calibration, universal tank mixing sequence (W.A.L.E.S. rule), resistance biology, and comprehensive crop spray calendars.',
    guide_step1: 'Step 1: Measure Test Area (100 m²)',
    guide_step2: 'Step 2: Spray Clean Water at Field Pace',
    guide_step3: 'Step 3: Calculate Spray Volume per Hectare',

    // Alerts
    alerts_title: 'Department of Agricultural Extension (DAE) Directives & Compliance Notifications',
    alerts_desc: 'Live regulatory updates, seasonal pest emergence warnings, restricted pesticide notices, and pre-harvest compliance reminders.',
    alerts_unread: 'Unread Alerts',
    alerts_mark_all: 'Mark All Read',
    alerts_new_custom: 'Add Field Reminder'
  },
  bn: {
    // Header & Brand
    app_title: 'এগ্রিকেম প্রো',
    app_subtitle: 'বালাই ও রোগ নিয়ন্ত্রণ নির্দেশিকা',
    app_banner: 'জ্ঞান ভাগাভাগির ফিল্ড গাইড — DAE-এর অফিসিয়াল আদেশ নয়',
    app_tagline: 'আইআরএসি (IRAC) • এফআরএসি (FRAC) • এইচআরএসি (HRAC) প্রতিরোধ ব্যবস্থাপনা',
    registered_count_suffix: 'নিবন্ধিত বালাইনাশক',
    offline_ready: 'অফলাইন ফিল্ড নির্দেশিকা',
    search_placeholder: 'কীটনাশক, ট্রেড নাম, ফসল, বালাই বা MoA কোড খুঁজুন...',
    lang_toggle_label: 'English',

    // Navigation Tabs
    tab_home: 'হোম',
    tab_database: 'রাসায়নিক ডাটাবেস',
    tab_calculator: 'মাত্রা ক্যালকুলেটর',
    tab_rotation: 'ঘূর্ণন পরিকল্পনা (MoA)',
    tab_safety: 'নিরাপত্তা ও পিপিই চেকলিস্ট',
    tab_guidebook: 'ফিল্ড গাইডবুক',
    tab_alerts: 'সরকারি নির্দেশিকা ও সতর্কবার্তা',
    btn_share: 'শেয়ার করুন',

    // Database View
    search_filter_title: 'অনুমোদিত বালাইনাশক তালিকা ও প্রযুক্তিগত বিবরণ',
    search_filter_desc: 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE) নিবন্ধিত মূল উপাদান, ব্র্যান্ড নাম, অনুমোদিত ফসল ও ক্রিয়া কৌশল (MoA) অনুসন্ধান করুন।',
    filter_all_crops: 'সকল ফসল',
    filter_all_categories: 'সকল বালাইনাশক',
    filter_all_moa: 'সকল MoA গ্রুপ',
    filter_all_risks: 'সকল প্রতিরোধ ঝুঁকি',
    sort_by_label: 'সাজানোর ক্রম',
    sort_name: 'পণ্যের নাম (অ-হ / A-Z)',
    sort_type: 'বালাইনাশকের ধরণ',
    sort_phi: 'সর্বনিম্ন ফসল তোলার বিরতি (PHI)',
    sort_reg: 'নিবন্ধন নম্বর',
    showing_results: 'প্রদর্শিত হচ্ছে',
    of_total: 'এর মধ্যে',
    registered_chemicals: 'টি নিবন্ধিত বালাইনাশক',
    clear_filters: 'ফিল্টার রিসেট করুন',
    download_crop_pdf: 'ফসলভিত্তিক গাইড (PDF)',
    download_csv: 'ক্যাটালগ ডাউনলোড (CSV)',
    no_results_title: 'আপনার অনুসন্ধানের সাথে কোনো বালাইনাশক মিলছে না',
    no_results_desc: 'অনুগ্রহ করে অনুসন্ধানের শব্দ পরিবর্তন করুন বা "সকল ফসল" ও "সকল বালাইনাশক" নির্বাচন করে পুনরায় চেষ্টা করুন।',

    // Product Card & Details
    trade_name: 'বাণিজ্যিক নাম',
    active_ingredient: 'সক্রিয় উপাদান (জেনেরিক)',
    registration_no: 'নিবন্ধন নং',
    reg_holder: 'অনুমোদিত আমদানিকারক/কোম্পানি',
    target_crops: 'অনুমোদিত ফসল',
    target_pests: 'লক্ষ্য বালাই / রোগ / আগাছা',
    dosage_rate: 'অনুমোদিত প্রয়োগ মাত্রা',
    phi_label: 'ফসল তোলার বিরতি (PHI)',
    rei_label: 'পুনঃপ্রবেশের সময় (REI)',
    days: 'দিন',
    hours: 'ঘণ্টা',
    risk_suffix: 'ঝুঁকি',
    btn_details: 'বিস্তারিত',
    btn_calculator: 'ক্যালকুলেটর',
    btn_safety: 'নিরাপত্তা',
    btn_pdf: 'পিডিএফ',
    specification_sheet: 'প্রযুক্তিগত নিবন্ধন বিবরণী',
    who_hazard_class: 'ডব্লিউএইচও বিষাক্ততার শ্রেণী',
    formulation_type: 'ফর্মুলেশনের ধরণ',
    spray_water_volume: 'প্রস্তাবিত পানির পরিমাণ',
    resistance_guideline: 'প্রতিরোধ ক্ষমতা রোধের নির্দেশিকা',
    safety_cautions: 'ব্যবহারিক সতর্কতা',

    // Dosage Calculator
    calc_header_title: 'ন্যাSplit-Knapsack স্প্রেয়ার মাত্রা ও ট্যাংক মিশ্রণ স্টেশন',
    calc_header_desc: 'যেকোনো নিবন্ধিত রাসায়নিক নির্বাচন করে আপনার জমির পরিমাণ অনুযায়ী পানির পরিমাণ, ট্যাংকের সংখ্যা ও প্রয়োজনীয় ওষুধের সঠিক হিসাব জানুন।',
    calc_field_area: 'জমির পরিমাণ',
    calc_area_unit: 'জমির একক',
    calc_tank_size: 'স্প্রেয়ার ট্যাঙ্কের আকার',
    calc_spray_volume: 'প্রতি হেক্টরে পানির পরিমাণ',
    calc_results_summary: 'মাঠ পর্যায়ের প্রয়োগ প্রেসক্রিপশন',
    calc_total_water: 'মোট পানির প্রয়োজন',
    calc_number_of_tanks: 'মোট স্প্রেয়ার ট্যাংক সংখ্যা',
    calc_total_chemical: 'মোট বালাইনাশকের প্রয়োজন',
    calc_chemical_per_tank: 'প্রতি ট্যাঙ্কে ওষুধের পরিমাণ',
    calc_export_btn: 'প্রয়োগ প্রেসক্রিপশন ডাউনলোড করুন (PDF)',
    calc_unit_ha: 'হেক্টর (Hectare)',
    calc_unit_acre: 'একর (Acre - ১০০ শতক)',
    calc_unit_bigha: 'বিঘা (Bigha - ৩৩ শতক)',
    calc_unit_katha: 'কাঠা (Katha - ১.৬৫ শতক)',
    calc_unit_sqm: 'বর্গমিটার (Square Meters)',

    // MoA Rotation
    rotation_title: 'প্রতিরোধ ক্ষমতা রোধে ক্রিয়া কৌশল (MoA) ঘূর্ণন চক্র',
    rotation_desc: 'একই শ্রেণীর রাসায়নিক বারবার ব্যবহারে পোকা বা ছত্রাকে প্রতিরোধ তৈরি হয়। আইআরএসি (IRAC), এফআরএসি (FRAC) কোড অনুসারে ফসল বৃদ্ধির ধাপে ধাপে ওষুধের বিকল্প ব্যবহার নিশ্চিত করুন।',
    rotation_select_crop: 'ফসল ও বালাই নির্বাচন করুন',
    rotation_sequence_builder: 'স্প্রে পর্যায়ক্রমিক চক্র প্রস্তুতকারক',
    rotation_conflict_alert: 'প্রতিরোধ সৃষ্টির ঝুঁকি সতর্কতা (MoA Conflict)!',
    rotation_conflict_desc: 'পরপর দুটি স্প্রেতে একই MoA কোডের ওষুধ ব্যবহার করা হয়েছে! পোকার প্রতিরোধ রোধ করতে ভিন্ন সংখ্যার কোড বেছে নিন।',
    rotation_add_spray: 'পরবর্তী স্প্রে ধাপ যুক্ত করুন',
    rotation_export_pdf: 'ঘূর্ণন পরিকল্পনা ডাউনলোড (PDF)',

    // Safety View
    safety_header_title: 'মাঠ পর্যায়ের নিরাপত্তা চেকলিস্ট ও বিষাক্ততা প্রটোকল',
    safety_header_desc: 'কৃষি পেশাজীবী ও কৃষকদের জন্য আদর্শ পরিচালনা পদ্ধতি (SOP)। স্প্রে-পূর্ব সরঞ্জাম পরীক্ষা, ডব্লিউএইচও রঙের ব্যান্ড, জরুরি প্রাথমিক চিকিৎসা এবং খালি বোতল নিষ্ক্রিয়করণ।',
    safety_checklist_title: '১০-দফা মাঠ পর্যায়ের বালাইনাশক প্রয়োগ নিরাপত্তা চেকলিস্ট',
    safety_checklist_sub: 'প্রতিটি স্প্রে কাজের পূর্বে, চলাকালীন এবং পরবর্তীতে এই প্রটোকলটি সম্পন্ন করুন।',
    safety_completed: 'সম্পন্ন হয়েছে',
    safety_ready: 'প্রস্তুত',
    safety_reset: 'রিসেট',
    safety_who_title: 'ডব্লিউএইচও (WHO) বিষাক্ততার মাত্রা ও বাধ্যতামূলক রঙের ব্যান্ড',
    safety_aid_title: 'জরুরি বিষক্রিয়া প্রাথমিক চিকিৎসা ও অ্যান্টিডোট নির্দেশিকা',
    safety_quick_lookup: 'নির্দিষ্ট ওষুধের নিরাপত্তা তথ্য অনুসন্ধান ও ফিল্ড শিট ডাউনলোড',

    // Guidebook
    guide_title: 'মাঠ পর্যায়ের কৃষি নির্দেশিকা ও স্প্রেয়ার ক্যালিব্রেশন',
    guide_desc: 'ন্যাSplit স্প্রেয়ার সঠিক ক্যালিব্রেশন পদ্ধতি, বিশ্বজনীন ট্যাংক মিক্সিং নিয়ম (W.A.L.E.S.), প্রতিরোধ বায়োলজি এবং প্রধান ফসলের স্প্রে ক্যালেন্ডার।',
    guide_step1: 'ধাপ ১: ১০০ বর্গমিটার টেস্ট এরিয়া চিহ্নিত করুন',
    guide_step2: 'ধাপ ২: স্বাভাবিক গতিতে বিশুদ্ধ পানি স্প্রে করুন',
    guide_step3: 'ধাপ ৩: প্রতি হেক্টরে পানির প্রয়োজনীয়তা বের করুন',

    // Alerts
    alerts_title: 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE) ও মৌসুমী সতর্কবার্তা',
    alerts_desc: 'জরুরি সরকারি নিয়ন্ত্রণ আদেশ, ক্ষতিকর পোকার প্রাদুর্ভাবের পূর্ব সতর্কবার্তা, নিষিদ্ধ বালাইনাশক তালিকা এবং ফসল কর্তনের পূর্ববর্তী সময়সীমার নির্দেশিকা।',
    alerts_unread: 'অপঠিত সতর্কবার্তা',
    alerts_mark_all: 'সবগুলো পঠিত চিহ্নিত করুন',
    alerts_new_custom: 'নতুন মাঠ সতর্কতা যুক্ত করুন'
  }
};

export const getTranslation = (key: string, lang: Language): string => {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS['en'][key] || key;
};

export const translateCrop = (crop: string, lang: Language): string => {
  if (lang === 'bn') {
    return CROP_TRANSLATIONS[crop] || crop;
  }
  return crop;
};

export const translateCategory = (cat: string, lang: Language): string => {
  if (lang === 'bn') {
    return CATEGORY_TRANSLATIONS[cat] || cat;
  }
  return cat;
};

export const translateRisk = (risk: string, lang: Language): string => {
  if (lang === 'bn') {
    return RISK_TRANSLATIONS[risk] || risk;
  }
  return risk;
};
