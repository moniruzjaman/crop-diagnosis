// Crop-Specific Disease Database for Bangladesh
// Covers the top 10 Bangladesh crops with at least 5 diseases each.
// Symptom arrays are in Bengali for matching against user symptom chips.

export const CROP_DISEASES = {
  ধান: {
    // Rice
    en: "Rice",
    diseases: [
      {
        name: "Rice Blast",
        nameBn: "ধানের ব্লাস্ট রোগ",
        cause: "fungal",
        pathogen: "Magnaporthe oryzae",
        symptoms: [
          "পাতায় ধূসর মাকু আকৃতির দাগ (ব্লাস্ট)",
          "পাতায় বাদামি গোলাকার দাগ",
          "আগায় শুকিয়ে যাওয়া",
          "শীষ শুকিয়ে যাওয়া",
          "ধানের শীষ চিটা, দানা পূর্ণ হচ্ছে না",
        ],
        conditions: "High humidity (>89%), 25-30°C, excess nitrogen, long leaf wetness",
        recommendations: [
          "বালাই নিয়ন্ত্রণ: ট্রাইসাইক্লাজোল ০.৬ গ্রাম/লিটার স্প্রে",
          "নাইট্রোজেন সার কমান, ভাগে ভাগে প্রয়োগ করুন",
          "প্রতিরোধী জাত লাগান (যেমন বিআর-১১, বিআর-২২)",
          "ঘাড় ব্লাস্ট হলে আইসোপ্রোথিয়োলেন স্প্রে করুন",
        ],
        severity: "severe",
        season: ["Boro", "Aman"],
      },
      {
        name: "Sheath Blight",
        nameBn: "শিথ ব্লাইট রোগ",
        cause: "fungal",
        pathogen: "Rhizoctonia solani",
        symptoms: [
          "কান্ডের গোড়া পচে কালো বা বাদামি",
          "পাতায় বাদামি গোলাকার দাগ",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "কান্ডে ডিম্বাকৃতি ধূসর দাগ",
          "গাছ নেতিয়ে",
        ],
        conditions: "High humidity (>95%), 28-32°C, dense planting, excess nitrogen",
        recommendations: [
          "হেক্সাকোনাজোল বা ভ্যালিডামাইসিন স্প্রে করুন",
          "সঠিক দূরত্বে চাষ করুন (১৫-২০ সেমি)",
          "নাইট্রোজেন সার পরিমিত ব্যবহার করুন",
          "আক্রান্ত খড় মাঠ থেকে সরিয়ে ফেলুন",
        ],
        severity: "severe",
        season: ["Boro", "Aman"],
      },
      {
        name: "Bacterial Leaf Blight",
        nameBn: "ব্যাকটেরিয়াল লিফ ব্লাইট",
        cause: "bacterial",
        pathogen: "Xanthomonas oryzae pv. oryzae",
        symptoms: ["পাতার কিনারা হলুদ-বাদামি", "পাতায় তেলতেলে", "পাতা হলুদ হয়ে যাচ্ছে", "পাতা শুকিয়ে", "গাছ মরছে"],
        conditions: "High humidity, rain & wind, 25-34°C, flooded fields",
        recommendations: [
          "BLB-প্রতিরোধী জাত লাগান (যেমন বিআর-৩৪, আইআর-৬৪)",
          "কপার অক্সিক্লোরাইড বা স্ট্রেপটোসাইক্লিন স্প্রে",
          "বীজতলায় বীজ শোধন করুন",
          "ঝড়ের পর স্প্রে করুন, জল নিষ্কাশন নিশ্চিত করুন",
        ],
        severity: "severe",
        season: ["Aman", "Boro"],
      },
      {
        name: "Rice Tungro",
        nameBn: "ধানের টুংরো রোগ",
        cause: "viral",
        pathogen: "Rice tungro virus (RTSV + RTBV)",
        symptoms: [
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "গাছ বামন",
          "পাতায় মোজেইক",
          "ফল ধারণ কম",
        ],
        conditions: "Green leafhopper vectors, 25-30°C, early season infection",
        recommendations: [
          "প্রতিরোধী জাত লাগান (বিআর-৪, বিআর-১০)",
          "সবুজ পাতাফড়িং নিয়ন্ত্রণ করুন (ইমিডাক্লোপ্রিড)",
          "চারা রোপণের ১৫ দিনের মধ্যে পোকা নিয়ন্ত্রণ",
          "বিকল্প পোষক জাত মাঠের চারপাশে লাগাবেন না",
        ],
        severity: "severe",
        season: ["Aman", "Aus"],
      },
      {
        name: "Brown Spot",
        nameBn: "ব্রাউন স্পট রোগ",
        cause: "fungal",
        pathogen: "Bipolaris oryzae",
        symptoms: ["পাতায় বাদামি গোলাকার দাগ", "পাতা হলুদ হয়ে যাচ্ছে", "পাতা পোড়া", "শীষ চিটা", "বীজে বাদামি দাগ"],
        conditions: "Low soil nutrients (K, Si), 25-30°C, high humidity, poor soil",
        recommendations: [
          "সুষম সার ব্যবহার করুন (K ও Si পর্যাপ্ত)",
          "বীজ শোধন করুন (থাইরাম/কার্বেন্ডাজিম)",
          "প্রতিরোধী জাত লাগান",
          "পটাশ সার পর্যাপ্ত দিন",
        ],
        severity: "moderate",
        season: ["Aman", "Aus"],
      },
    ],
  },

  পাট: {
    // Jute
    en: "Jute",
    diseases: [
      {
        name: "Stem Rot",
        nameBn: "পাটের কাণ্ড পচা রোগ",
        cause: "fungal",
        pathogen: "Macrophomina phaseolina",
        symptoms: ["কান্ডের গোড়া পচে কালো বা বাদামি", "কাণ্ড পচে", "গাছ নেতিয়ে", "গাছ মরছে", "শিকড় কালো ও পচা"],
        conditions: "Hot & dry conditions, 30-35°C, low soil moisture, poor nutrition",
        recommendations: [
          "প্রতিরোধী জাত লাগান (ও-৯৮৯৭, ও-৭২)",
          "ফসল আবর্তন করুন (ধান-পাট)",
          "সুষম সার ও সেচ নিশ্চিত করুন",
          "আক্রান্ত গাছ তাড়াতাড়ি তুলে ফেলুন",
        ],
        severity: "severe",
        season: ["Kharif"],
      },
      {
        name: "Black Band",
        nameBn: "পাটের কালো পট্টি রোগ",
        cause: "fungal",
        pathogen: "Botryodiplodia theobromae",
        symptoms: [
          "কাণ্ডে কালো পট্টি বা ব্যান্ড",
          "কান্ডের গোড়া পচে কালো বা বাদামি",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "গাছ মরছে",
        ],
        conditions: "High humidity, 28-32°C, wounds on stem, rainy season",
        recommendations: [
          "কাণ্ডে আঘাত এড়ান",
          "কপার অক্সিক্লোরাইড স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "আক্রান্ত গাছ পুড়ে ফেলুন",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
      {
        name: "Jute Mosaic",
        nameBn: "পাটের মোজাইক রোগ",
        cause: "viral",
        pathogen: "Corchorus golden mosaic virus",
        symptoms: [
          "পাতায় মোজাইক",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "গাছ বামন",
          "পাতায় দাগ",
        ],
        conditions: "Whitefly vectors, warm conditions, 25-35°C",
        recommendations: [
          "সাদা মাছি নিয়ন্ত্রণ করুন (হলুদ ফাঁদ, ইমিডাক্লোপ্রিড)",
          "প্রতিরোধী জাত লাগান",
          "আক্রান্ত চারা সরিয়ে ফেলুন",
          "পরিষ্কার বীজ ব্যবহার করুন",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
      {
        name: "Jute Wilt",
        nameBn: "পাটের শুকিয়ে যাওয়া রোগ",
        cause: "fungal",
        pathogen: "Fusarium sp.",
        symptoms: ["গাছ নেতিয়ে", "গাছ শুকিয়ে", "পাতা হলুদ হয়ে যাচ্ছে", "শিকড় পচা", "গাছ মরছে"],
        conditions: "Warm soil, 25-30°C, waterlogged or very dry soil",
        recommendations: [
          "ফসল আবর্তন করুন",
          "কার্বেন্ডাজিম দিয়ে বীজ শোধন",
          "জল নিষ্কাশন উন্নত করুন",
          "প্রতিরোধী জাত লাগান",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
      {
        name: "Root Rot",
        nameBn: "পাটের শিকড় পচা রোগ",
        cause: "fungal",
        pathogen: "Sclerotium rolfsii",
        symptoms: [
          "শিকড় কালো ও পচা",
          "গাছ হঠাৎ শুকিয়ে মারা যাচ্ছে",
          "গাছ নেতিয়ে",
          "কান্ডের গোড়ায় সাদা তুলার মত ছত্রাক",
        ],
        conditions: "Hot humid, 30-35°C, waterlogged, acid soil",
        recommendations: [
          "শিকড়ে ট্রাইকোডার্মা প্রয়োগ",
          "ফসল আবর্তন করুন",
          "জল নিষ্কাশন উন্নত করুন",
          "আক্রান্ত গাছ তুলে পুড়ে ফেলুন",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
    ],
  },

  আলু: {
    // Potato
    en: "Potato",
    diseases: [
      {
        name: "Late Blight",
        nameBn: "আলুর লেট ব্লাইট রোগ",
        cause: "fungal",
        pathogen: "Phytophthora infestans",
        symptoms: ["পাতায় তেলতেলে", "পাতায় বাদামি গোলাকার দাগ", "পাতা শুকিয়ে", "ফল পচে", "গাছ মরছে"],
        conditions: "Cool & wet, 10-25°C, humidity >90%, fog, dew",
        recommendations: [
          "মেটালাক্সিল+মানকোজেব (রিডোমিল গোল্ড) স্প্রে",
          "প্রতিরোধী জাত লাগান (কার্ডিনাল, ডায়মন্ট)",
          "৩ দিনে একবার মাঠ পরিদর্শন",
          "আক্রান্ত গাছ তাড়াতাড়ি সরিয়ে ফেলুন",
        ],
        severity: "severe",
        season: ["Rabi"],
      },
      {
        name: "Early Blight",
        nameBn: "আলুর আর্লি ব্লাইট রোগ",
        cause: "fungal",
        pathogen: "Alternaria solani",
        symptoms: [
          "পাতায় বাদামি গোলাকার দাগ",
          "পাতার কিনারা পুড়ে যাওয়ার মতো বাদামি",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা ঝরে",
        ],
        conditions: "Warm & humid, 24-30°C, alternating wet-dry",
        recommendations: [
          "ম্যানকোজেব বা ক্লোরোথ্যালোনিল স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "সুষম সার ও সেচ দিন",
          "আক্রান্ত পাতা সরিয়ে ফেলুন",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
      {
        name: "Potato Scab",
        nameBn: "আলুর স্ক্যাব রোগ",
        cause: "bacterial",
        pathogen: "Streptomyces scabies",
        symptoms: ["ফলে দাগ", "ফল পচে", "আলুর গায়ে খসখসে দাগ", "আলু বিকৃত"],
        conditions: "Dry alkaline soil, pH >5.5, 20-22°C",
        recommendations: [
          "অম্লীয় মাটিতে চাষ করুন (pH ৫.০-৫.৫)",
          "সেচ নিয়মিত দিন টিউবার গঠনকালে",
          "প্রতিরোধী জাত লাগান",
          "সালফার প্রয়োগ করে মাটির pH কমান",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
      {
        name: "Black Leg",
        nameBn: "আলুর ব্ল্যাক লেগ রোগ",
        cause: "bacterial",
        pathogen: "Pectobacterium atrosepticum",
        symptoms: [
          "কান্ডের গোড়া পচে কালো বা বাদামি",
          "গাছ নেতিয়ে",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "গাছ মরছে",
          "শিকড় কালো ও পচা",
        ],
        conditions: "Wet cool conditions, 10-20°C, seed-borne",
        recommendations: [
          "সুস্থ বীজ টিউবার ব্যবহার করুন",
          "বীজ শোধন করুন (কপার দ্রবণ)",
          "জল নিষ্কাশন উন্নত করুন",
          "আক্রান্ত গাছ তুলে ধ্বংস করুন",
        ],
        severity: "severe",
        season: ["Rabi"],
      },
      {
        name: "Potato Mosaic",
        nameBn: "আলুর মোজাইক রোগ",
        cause: "viral",
        pathogen: "Potato virus Y (PVY)",
        symptoms: [
          "পাতায় মোজাইক",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "গাছ বামন",
          "পাতায় দাগ",
        ],
        conditions: "Aphid vectors, 20-25°C, seed-borne",
        recommendations: [
          "সার্টিফাইড ভাইরাসমুক্ত বীজ ব্যবহার",
          "জাব পোকা নিয়ন্ত্রণ করুন",
          "আক্রান্ত গাছ তাড়াতাড়ি সরিয়ে ফেলুন",
          "প্রতিরোধী জাত লাগান",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
    ],
  },

  টমেটো: {
    // Tomato
    en: "Tomato",
    diseases: [
      {
        name: "Early Blight",
        nameBn: "টমেটোর আর্লি ব্লাইট রোগ",
        cause: "fungal",
        pathogen: "Alternaria solani",
        symptoms: [
          "পাতায় বাদামি গোলাকার দাগ",
          "পাতার কিনারা পুড়ে যাওয়ার মতো বাদামি",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা ঝরে",
          "কান্ডে কালো দাগ",
        ],
        conditions: "Warm humid, 24-29°C, dew, poor nutrition",
        recommendations: [
          "ম্যানকোজেব বা ক্লোরোথ্যালোনিল স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "নিচের পাতা ছেঁটে ফেলুন",
          "সুষম সার ও সেচ দিন",
          "ফসল আবর্তন করুন",
        ],
        severity: "moderate",
        season: ["Rabi", "Kharif"],
      },
      {
        name: "Late Blight",
        nameBn: "টমেটোর লেট ব্লাইট রোগ",
        cause: "fungal",
        pathogen: "Phytophthora infestans",
        symptoms: [
          "পাতায় তেলতেলে",
          "পাতায় বাদামি গোলাকার দাগ",
          "ফল পচে যাচ্ছে, কালো বা বাদামি দাগ",
          "গাছ মরছে",
          "পাতা শুকিয়ে",
        ],
        conditions: "Cool & wet, 10-25°C, humidity >90%, fog",
        recommendations: [
          "মেটালাক্সিল+মানকোজেব স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "ঘন লাগানো এড়িয়ে চলুন",
          "আক্রান্ত গাছ সরিয়ে ফেলুন",
          "ফসল আবর্তন করুন",
        ],
        severity: "severe",
        season: ["Rabi"],
      },
      {
        name: "Tomato Leaf Curl",
        nameBn: "টমেটোর পাতা কুঁকড়ানো রোগ",
        cause: "viral",
        pathogen: "Tomato leaf curl virus (ToLCV)",
        symptoms: ["পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে", "পাতা হলুদ হয়ে যাচ্ছে", "গাছ বামন", "ফুল ঝরা", "ফল বিকৃত"],
        conditions: "Whitefly vectors, 25-35°C, dry weather",
        recommendations: [
          "সাদা মাছি নিয়ন্ত্রণ করুন (হলুদ ফাঁদ, ইমিডাক্লোপ্রিড)",
          "প্রতিরোধী জাত লাগান",
          "নার্সারিতে নেট ব্যবহার",
          "আক্রান্ত চারা সরিয়ে ফেলুন",
          "শস্যমুক্ত সময় পালন করুন",
        ],
        severity: "severe",
        season: ["Kharif", "Rabi"],
      },
      {
        name: "Bacterial Wilt",
        nameBn: "টমেটোর ব্যাকটেরিয়াল উইল্ট রোগ",
        cause: "bacterial",
        pathogen: "Ralstonia solanacearum",
        symptoms: [
          "গাছ দিনে নেতিয়ে পড়ে, রাতে সতেজ হয়",
          "গাছ হঠাৎ শুকিয়ে মারা যাচ্ছে",
          "কান্ড কাটলে ভেতরে বাদামি তরল",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "শিকড় পচা",
        ],
        conditions: "Hot & wet, 28-35°C, high soil moisture, acid soil",
        recommendations: [
          "প্রতিরোধী জাত লাগান (বিটি-১, বিটি-১০)",
          "ফসল আবর্তন (3-4 বছর)",
          "জল নিষ্কাশন উন্নত করুন",
          "আক্রান্ত গাছ তুলে চুন দিয়ে পুড়ে ফেলুন",
          "গ্রাফটিং করুন প্রতিরোধী মূলে",
        ],
        severity: "severe",
        season: ["Kharif", "Rabi"],
      },
      {
        name: "Fusarium Wilt",
        nameBn: "টমেটোর ফিউজেরিয়াম উইল্ট রোগ",
        cause: "fungal",
        pathogen: "Fusarium oxysporum f.sp. lycopersici",
        symptoms: ["পাতা হলুদ হয়ে যাচ্ছে", "গাছ নেতিয়ে", "পাতা শুকিয়ে", "কান্ড কাটলে বাদামি রং", "গাছ মরছে"],
        conditions: "Warm soil, 25-28°C, acid soil, low pH",
        recommendations: [
          "প্রতিরোধী জাত লাগান",
          "ফসল আবর্তন করুন (৪-৫ বছর)",
          "মাটির pH ৬.৫-৭.০ রাখুন",
          "ট্রাইকোডার্মা মাটিতে প্রয়োগ করুন",
          "বীজ শোধন করুন",
        ],
        severity: "moderate",
        season: ["Rabi", "Kharif"],
      },
    ],
  },

  বেগুন: {
    // Brinjal
    en: "Brinjal",
    diseases: [
      {
        name: "Little Leaf",
        nameBn: "বেগুনের ছোট পাতা রোগ",
        cause: "viral",
        pathogen: "Phytoplasma (Candidatus Phytoplasma)",
        symptoms: [
          "পাতা ছোট হয়ে যাচ্ছে",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "গাছ বামন",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "ফুল অকালে ঝরে পড়ছে",
        ],
        conditions: "Leafhopper vectors, 25-35°C",
        recommendations: [
          "পাতাফড়িং নিয়ন্ত্রণ করুন (ইমিডাক্লোপ্রিড)",
          "প্রতিরোধী জাত লাগান",
          "আক্রান্ত গাছ তুলে ধ্বংস করুন",
          "পরিষ্কার চারা ব্যবহার করুন",
        ],
        severity: "severe",
        season: ["Kharif", "Rabi"],
      },
      {
        name: "Fruit Rot",
        nameBn: "বেগুনের ফল পচা রোগ",
        cause: "fungal",
        pathogen: "Phomopsis vexans",
        symptoms: [
          "ফল পচে যাচ্ছে, কালো বা বাদামি দাগ",
          "ফলে দাগ",
          "পাতায় বাদামি গোলাকার দাগ",
          "কান্ডের গোড়া পচে কালো বা বাদামি",
        ],
        conditions: "High humidity, 25-30°C, rain, wounds",
        recommendations: [
          "কার্বেন্ডাজিম বা ম্যানকোজেব স্প্রে",
          "আক্রান্ত ফল তাড়াতাড়ি তুলে ফেলুন",
          "ফসল আবর্তন করুন",
          "বীজ শোধন করুন",
        ],
        severity: "severe",
        season: ["Kharif", "Rabi"],
      },
      {
        name: "Brinjal Wilt",
        nameBn: "বেগুনের শুকিয়ে যাওয়া রোগ",
        cause: "fungal",
        pathogen: "Fusarium oxysporum f.sp. melongenae",
        symptoms: ["গাছ নেতিয়ে", "পাতা হলুদ হয়ে যাচ্ছে", "গাছ মরছে", "পাতা শুকিয়ে", "শিকড় পচা"],
        conditions: "Warm soil, 25-30°C, waterlogged",
        recommendations: [
          "প্রতিরোধী জাত লাগান (বারি বেগুন-১)",
          "ফসল আবর্তন করুন",
          "ট্রাইকোডার্মা মাটিতে প্রয়োগ",
          "জল নিষ্কাশন উন্নত করুন",
        ],
        severity: "moderate",
        season: ["Kharif", "Rabi"],
      },
      {
        name: "Shoot & Fruit Borer",
        nameBn: "বেগুনের ডগা ও ফল ছিদ্রকারী পোকা",
        cause: "insect",
        pathogen: "Leucinodes orbonalis",
        symptoms: ["কাণ্ডে ছিদ্র", "ফলে দাগ", "ফল পচে", "আগায় শুকিয়ে যাওয়া", "পোকা দেখা যাচ্ছে"],
        conditions: "Warm, 25-30°C, humid, year-round in Bangladesh",
        recommendations: [
          "কার্বারিল বা সাইপারমেথ্রিন স্প্রে",
          "আক্রান্ত ডগা ও ফল নিয়মিত ছেঁটে ফেলুন",
          "নেট হাউসে চাষ করুন",
          "ফেরোমন ট্র্যাপ ব্যবহার করুন",
          "শীতকালে গভীর চাষ দিন",
        ],
        severity: "severe",
        season: ["Kharif", "Rabi"],
      },
      {
        name: "Phomopsis Blight",
        nameBn: "বেগুনের ফোমোপসিস ব্লাইট",
        cause: "fungal",
        pathogen: "Phomopsis vexans",
        symptoms: [
          "পাতায় বাদামি গোলাকার দাগ",
          "পাতা ঝরে",
          "কান্ডের গোড়া পচে কালো বা বাদামি",
          "ফল পচে যাচ্ছে, কালো বা বাদামি দাগ",
        ],
        conditions: "Rainy season, high humidity, 25-30°C",
        recommendations: [
          "কার্বেন্ডাজিম স্প্রে",
          "ফসল আবর্তন করুন",
          "বীজ শোধন করুন (থাইরাম)",
          "আক্রান্ত অংশ পুড়ে ফেলুন",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
    ],
  },

  সরিষা: {
    // Mustard
    en: "Mustard",
    diseases: [
      {
        name: "Alternaria Blight",
        nameBn: "সরিষার অল্টারনেরিয়া ব্লাইট",
        cause: "fungal",
        pathogen: "Alternaria brassicae",
        symptoms: ["পাতায় বাদামি গোলাকার দাগ", "পাতায় ছিদ্র", "ফলে দাগ", "পাতা ঝরে", "শীষ শুকিয়ে যাওয়া"],
        conditions: "Cool humid, 15-25°C, fog, dew",
        recommendations: [
          "ম্যানকোজেব বা প্রোপিকোনাজোল স্প্রে",
          "প্রতিরোধী জাত লাগান (বর্ণা, সোনালি)",
          "বীজ শোধন করুন (থাইরাম)",
          "সঠিক সময়ে বপন করুন",
          "ফসল আবর্তন করুন",
        ],
        severity: "severe",
        season: ["Rabi"],
      },
      {
        name: "White Rust",
        nameBn: "সরিষার সাদা মরচে রোগ",
        cause: "fungal",
        pathogen: "Albugo candida",
        symptoms: [
          "পাতায় সাদা গুঁড়া",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "ফুল বিকৃত (স্টাগহেড)",
          "কাণ্ড ফুলে যাওয়া",
        ],
        conditions: "Cool wet, 10-20°C, fog, dew, high humidity",
        recommendations: [
          "মেটালাক্সিল+মানকোজেব স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "বীজ শোধন করুন",
          "ফসল আবর্তন করুন",
          "আক্রান্ত অংশ সরিয়ে ফেলুন",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
      {
        name: "Downy Mildew",
        nameBn: "সরিষার ডাউনি মিলডিউ",
        cause: "fungal",
        pathogen: "Hyaloperonospora parasitica",
        symptoms: [
          "পাতায় সাদা গুঁড়া",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "পাতার নিচে ধূসর ছত্রাক",
        ],
        conditions: "Cool moist, 8-16°C, fog, prolonged leaf wetness",
        recommendations: [
          "মেটালাক্সিল স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "সঠিক দূরত্বে চাষ করুন",
          "বীজ শোধন করুন",
          "ফসল আবর্তন করুন",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
      {
        name: "Sclerotinia Rot",
        nameBn: "সরিষার স্ক্লেরোটিনিয়া পচা রোগ",
        cause: "fungal",
        pathogen: "Sclerotinia sclerotiorum",
        symptoms: [
          "কান্ডের গোড়া পচে কালো বা বাদামি",
          "কাণ্ড পচে",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "গাছ মরছে",
          "কান্ডে সাদা তুলার মত ছত্রাক ও কালো দানা",
        ],
        conditions: "Cool wet, 15-20°C, high humidity, dense canopy",
        recommendations: [
          "কার্বেন্ডাজিম স্প্রে",
          "ফসল আবর্তন করুন (3-4 বছর)",
          "সঠিক দূরত্বে চাষ করুন",
          "আক্রান্ত গাছ তুলে পুড়ে ফেলুন",
          "জল নিষ্কাশন উন্নত করুন",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
      {
        name: "Mustard Mosaic",
        nameBn: "সরিষার মোজাইক রোগ",
        cause: "viral",
        pathogen: "Turnip mosaic virus (TuMV)",
        symptoms: [
          "পাতায় মোজাইক",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "গাছ বামন",
          "ফুল ঝরা",
        ],
        conditions: "Aphid vectors, 20-25°C, cool season",
        recommendations: [
          "জাব পোকা নিয়ন্ত্রণ করুন (হলুদ ফাঁদ, ইমিডাক্লোপ্রিড)",
          "প্রতিরোধী জাত লাগান",
          "আক্রান্ত গাছ সরিয়ে ফেলুন",
          "পরিষ্কার বীজ ব্যবহার করুন",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
    ],
  },

  কলা: {
    // Banana
    en: "Banana",
    diseases: [
      {
        name: "Panama Wilt",
        nameBn: "কলার পানামা উইল্ট রোগ",
        cause: "fungal",
        pathogen: "Fusarium oxysporum f.sp. cubense",
        symptoms: ["পাতা হলুদ হয়ে যাচ্ছে", "পাতা শুকিয়ে", "গাছ নেতিয়ে", "কান্ড কাটলে ভেতর বাদামি-কালো", "গাছ মরছে"],
        conditions: "Warm wet, 24-28°C, acid soil, race 4 most dangerous",
        recommendations: [
          "প্রতিরোধী জাত লাগান (ক্যাভেন্ডিশ race-1 এ)",
          "আক্রান্ত গাছ তুলে পুড়ে ফেলুন",
          "রোগমুক্ত চারা ব্যবহার করুন",
          "ফসল আবর্তন করুন",
          "জল নিষ্কাশন নিশ্চিত করুন",
        ],
        severity: "severe",
        season: ["Year-round"],
      },
      {
        name: "Sigatoka Leaf Spot",
        nameBn: "কলার সিগাটোকা পাতায় দাগ রোগ",
        cause: "fungal",
        pathogen: "Mycosphaerella fijiensis (Black), M. musicola (Yellow)",
        symptoms: ["পাতায় বাদামি গোলাকার দাগ", "পাতা হলুদ হয়ে যাচ্ছে", "পাতা ঝরে", "পাতা শুকিয়ে", "ফল ছোট"],
        conditions: "Warm humid, 25-28°C, high rainfall, dew",
        recommendations: [
          "প্রোপিকোনাজোল বা টেবুকোনাজোল স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "আক্রান্ত পাতা ছেঁটে ফেলুন",
          "সঠিক দূরত্বে চাষ করুন",
          "বায়ু চলাচল নিশ্চিত করুন",
        ],
        severity: "severe",
        season: ["Year-round"],
      },
      {
        name: "Bunchy Top",
        nameBn: "কলার বাঞ্চি টপ রোগ",
        cause: "viral",
        pathogen: "Banana bunchy top virus (BBTV)",
        symptoms: [
          "পাতা ছোট ও লম্বালম্বি হয়ে যাচ্ছে",
          "পাতায় মোজাইক",
          "গাছ বামন",
          "পাতার কিনারা হলুদ",
          "ফল ধারণ হয় না",
        ],
        conditions: "Aphid vector (Pentalonia nigronervosa), 20-28°C",
        recommendations: [
          "আক্রান্ত গাছ সম্পূর্ণ তুলে পুড়ে ফেলুন",
          "জাব পোকা নিয়ন্ত্রণ করুন",
          "রোগমুক্ত চারা ব্যবহার করুন (টিস্যু কালচার)",
          "নতুন বাগান সুস্থ এলাকায় করুন",
        ],
        severity: "severe",
        season: ["Year-round"],
      },
      {
        name: "Black Rot",
        nameBn: "কলার কালো পচা রোগ",
        cause: "fungal",
        pathogen: "Ceratocystis paradoxa",
        symptoms: ["ফল পচে যাচ্ছে, কালো বা বাদামি দাগ", "কান্ডের গোড়া পচে কালো বা বাদামি", "ফলে দাগ", "কাণ্ড পচে"],
        conditions: "Hot humid, 25-30°C, wounds, poor storage",
        recommendations: [
          "ফল সাবধানে কাটুন, আঘাত এড়িয়ে চলুন",
          "বোর্দো মিশ্রণ স্প্রে",
          "সঠিক সংরক্ষণ ও পরিবহন",
          "আক্রান্ত ফল আলাদা করুন",
        ],
        severity: "moderate",
        season: ["Year-round"],
      },
      {
        name: "Banana Mosaic",
        nameBn: "কলার মোজাইক রোগ",
        cause: "viral",
        pathogen: "Cucumber mosaic virus (CMV)",
        symptoms: [
          "পাতায় মোজাইক",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে",
          "ফল বিকৃত",
          "পাতায় দাগ",
        ],
        conditions: "Aphid vectors, 20-30°C, weeds as alternate hosts",
        recommendations: [
          "জাব পোকা নিয়ন্ত্রণ করুন",
          "আক্রান্ত গাছ সরিয়ে ফেলুন",
          "আগাছা পরিষ্কার রাখুন",
          "রোগমুক্ত চারা লাগান",
        ],
        severity: "moderate",
        season: ["Year-round"],
      },
    ],
  },

  আম: {
    // Mango
    en: "Mango",
    diseases: [
      {
        name: "Anthracnose",
        nameBn: "আমের অ্যানথ্রাকনোজ রোগ",
        cause: "fungal",
        pathogen: "Colletotrichum gloeosporioides",
        symptoms: [
          "ফলে দাগ",
          "ফল পচে যাচ্ছে, কালো বা বাদামি দাগ",
          "পাতায় বাদামি গোলাকার দাগ",
          "ফুল ঝরা",
          "পাতা শুকিয়ে",
        ],
        conditions: "Warm humid, 25-30°C, rain during flowering, dew",
        recommendations: [
          "ফুল আসার সময় ম্যানকোজেব স্প্রে",
          "কার্বেন্ডাজিম ফল ধরার পর স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "ফল সাবধানে সংগ্রহ ও সংরক্ষণ করুন",
          "আক্রান্ত ফুল ও ফল সরিয়ে ফেলুন",
        ],
        severity: "severe",
        season: ["Kharif"],
      },
      {
        name: "Powdery Mildew",
        nameBn: "আমের পাউডারি মিলডিউ রোগ",
        cause: "fungal",
        pathogen: "Oidium mangiferae",
        symptoms: ["পাতায় সাদা গুঁড়া", "ফুল ঝরা", "ফল বিকৃত", "পাতা কুঁকড়িয়ে ও বাঁকিয়ে যাচ্ছে", "ফল ছোট"],
        conditions: "Cool dry nights, 20-25°C, fog, dry weather with dew",
        recommendations: [
          "সালফার বা ডাইনোক্যাপ স্প্রে ফুল আসার সময়",
          "প্রতিরোধী জাত লাগান",
          "2-3 বার স্প্রে করুন (7 দিন অন্তর)",
          "ঘন লাগানো এড়িয়ে চলুন",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
      {
        name: "Malformation",
        nameBn: "আমের মালফরমেশন রোগ",
        cause: "fungal",
        pathogen: "Fusarium mangiferae",
        symptoms: ["ফুল বিকৃত ও ঘন", "শাখা ছোট ও গুচ্ছ", "পাতা ছোট", "ফল ধারণ হয় না", "গাছ বামন"],
        conditions: "Cool dry, 15-25°C, transmitted via infected nursery stock",
        recommendations: [
          "আক্রান্ত মোচা কেটে পুড়ে ফেলুন",
          "রোগমুক্ত কলম ব্যবহার করুন",
          "নার্সারি পরিষ্কার রাখুন",
          "নীম তেল বা কপার স্প্রে",
          "200 ppm NAA স্প্রে মোচা কাটার পর",
        ],
        severity: "severe",
        season: ["Rabi", "Kharif"],
      },
      {
        name: "Stem End Rot",
        nameBn: "আমের স্টেম এন্ড রট রোগ",
        cause: "fungal",
        pathogen: "Botryodiplodia theobromae",
        symptoms: ["ফল পচে যাচ্ছে, কালো বা বাদামি দাগ", "ফলের ডাঁটি থেকে পচা শুরু", "ফল নরম হয়ে যাচ্ছে", "কাণ্ড পচে"],
        conditions: "Hot humid, 28-32°C, rain during harvest, post-harvest",
        recommendations: [
          "ফল সাবধানে তুলুন (ডাঁটিসহ)",
          "হট ওয়াটার ট্রিটমেন্ট (52°C, 5 মিনিট)",
          "ফল শুকনো স্থানে সংরক্ষণ করুন",
          "কার্বেন্ডাজিম ডিপ ট্রিটমেন্ট",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
      {
        name: "Red Rust",
        nameBn: "আমের লাল মরচে রোগ",
        cause: "fungal",
        pathogen: "Cephaleuros virescens (algal disease)",
        symptoms: ["পাতায় বাদামি গোলাকার দাগ", "পাতায় লাল-বাদামি উজ্জ্বল দাগ", "পাতা হলুদ হয়ে যাচ্ছে", "পাতা ঝরে"],
        conditions: "Warm humid, 25-30°C, poor nutrition, dense canopy",
        recommendations: [
          "বোর্দো মিশ্রণ (1%) স্প্রে",
          "সুষম সার দিন",
          "ছায়া কমান, ছাঁটাই করুন",
          "প্রতিরোধী জাত লাগান",
        ],
        severity: "low",
        season: ["Kharif"],
      },
    ],
  },

  গম: {
    // Wheat
    en: "Wheat",
    diseases: [
      {
        name: "Leaf Rust",
        nameBn: "গমের পাতায় মরচে রোগ",
        cause: "fungal",
        pathogen: "Puccinia triticina",
        symptoms: [
          "পাতায় বাদামি গোলাকার দাগ",
          "পাতায় কমলা-বাদামি পাউডার",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা ঝরে",
          "দানা ছোট",
        ],
        conditions: "Cool moist, 15-25°C, dew, fog",
        recommendations: [
          "প্রোপিকোনাজোল স্প্রে",
          "প্রতিরোধী জাত লাগান (বারি গম-২৫, ২৬)",
          "সঠিক সময়ে বপন করুন",
          "সুষম সার ব্যবহার করুন",
        ],
        severity: "severe",
        season: ["Rabi"],
      },
      {
        name: "Stem Rust",
        nameBn: "গমের কান্ডে মরচে রোগ",
        cause: "fungal",
        pathogen: "Puccinia graminis f.sp. tritici",
        symptoms: [
          "কান্ডে বাদামি-কমলা দাগ",
          "পাতায় বাদামি গোলাকার দাগ",
          "কাণ্ড ভেঙে",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "দানা ছোট",
        ],
        conditions: "Warm moist, 15-30°C, susceptible varieties (Ug99 threat)",
        recommendations: [
          "প্রতিরোধী জাত লাগান (Ug99 প্রতিরোধী)",
          "প্রোপিকোনাজোল বা টেবুকোনাজোল স্প্রে",
          "সঠিক সময়ে বপন",
          "আক্রান্ত খড় পুড়ে ফেলুন",
        ],
        severity: "severe",
        season: ["Rabi"],
      },
      {
        name: "Spot Blotch",
        nameBn: "গমের স্পট ব্লটচ রোগ",
        cause: "fungal",
        pathogen: "Bipolaris sorokiniana",
        symptoms: [
          "পাতায় বাদামি গোলাকার দাগ",
          "পাতার কিনারা পুড়ে যাওয়ার মতো বাদামি",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা ঝরে",
          "কান্ডে কালো দাগ",
        ],
        conditions: "Warm humid, 20-28°C, repeated cropping",
        recommendations: [
          "প্রতিরোধী জাত লাগান (বারি গম-২৬)",
          "ফসল আবর্তন করুন",
          "বীজ শোধন করুন (কার্বেন্ডাজিম)",
          "ম্যানকোজেব স্প্রে",
          "সুষম সার ব্যবহার",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
      {
        name: "Fusarium Head Blight",
        nameBn: "গমের ফিউজেরিয়াম হেড ব্লাইট",
        cause: "fungal",
        pathogen: "Fusarium graminearum",
        symptoms: [
          "শীষ শুকিয়ে যাওয়া",
          "শীষে গোলাপি ছত্রাক",
          "দানা সাদা ও চিটা",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "দানায় বিষ (মাইকোটক্সিন)",
        ],
        conditions: "Warm wet at flowering, 20-28°C, rain during heading",
        recommendations: [
          "ফুল ফোটার সময় টেবুকোনাজোল স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "ফসল আবর্তন করুন",
          "আক্রান্ত দানা খাদ্যে ব্যবহার করবেন না",
          "সঠিক সময়ে বপন করুন",
        ],
        severity: "severe",
        season: ["Rabi"],
      },
      {
        name: "Loose Smut",
        nameBn: "গমের লুজ স্মাট রোগ",
        cause: "fungal",
        pathogen: "Ustilago tritici",
        symptoms: ["শীষ সম্পূর্ণ সাদা হয়ে গেছে", "শীষে কালো গুঁড়া", "দানা পূর্ণ হচ্ছে না", "শীষ চিটা"],
        conditions: "Cool flowering period, 16-22°C, seed-borne",
        recommendations: [
          "বীজ শোধন করুন (কার্বেন্ডাজিম বা ভিটাভ্যাক্স)",
          "প্রতিরোধী জাত লাগান",
          "সুস্থ মাঠ থেকে বীজ সংগ্রহ",
          "আক্রান্ত শীষ তাড়াতাড়ি সরিয়ে ফেলুন",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
    ],
  },

  ভুট্টা: {
    // Maize
    en: "Maize",
    diseases: [
      {
        name: "Turcicum Leaf Blight",
        nameBn: "ভুট্টার টুর্সিকাম লিফ ব্লাইট",
        cause: "fungal",
        pathogen: "Exserohilum turcicum",
        symptoms: [
          "পাতায় বাদামি গোলাকার দাগ",
          "পাতার কিনারা পুড়ে যাওয়ার মতো বাদামি",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "পাতা শুকিয়ে",
          "পাতা ঝরে",
        ],
        conditions: "Cool humid, 18-27°C, prolonged dew, moderate temp",
        recommendations: [
          "প্রোপিকোনাজোল বা ম্যানকোজেব স্প্রে",
          "প্রতিরোধী জাত লাগান (বারি ভুট্টা-৯)",
          "ফসল আবর্তন করুন",
          "সুষম সার ব্যবহার",
          "আক্রান্ত পাতা সরিয়ে ফেলুন",
        ],
        severity: "moderate",
        season: ["Rabi", "Kharif"],
      },
      {
        name: "Maydis Leaf Blight",
        nameBn: "ভুট্টার মেডিস লিফ ব্লাইট",
        cause: "fungal",
        pathogen: "Bipolaris maydis",
        symptoms: ["পাতায় বাদামি গোলাকার দাগ", "পাতা হলুদ হয়ে যাচ্ছে", "পাতা শুকিয়ে", "পাতা ঝরে", "শীষ চিটা"],
        conditions: "Warm humid, 24-30°C, high rainfall",
        recommendations: [
          "প্রতিরোধী জাত লাগান",
          "ম্যানকোজেব স্প্রে",
          "ফসল আবর্তন করুন",
          "সঠিক সময়ে বপন",
          "সুষম সার ব্যবহার",
        ],
        severity: "moderate",
        season: ["Kharif"],
      },
      {
        name: "Banded Leaf & Sheath Blight",
        nameBn: "ভুট্টার ব্যান্ডেড লিফ ও শিথ ব্লাইট",
        cause: "fungal",
        pathogen: "Rhizoctonia solani",
        symptoms: [
          "পাতায় বাদামি গোলাকার দাগ",
          "কান্ডের গোড়া পচে কালো বা বাদামি",
          "কান্ডে পট্টি আকৃতির দাগ",
          "পাতা হলুদ হয়ে যাচ্ছে",
          "গাছ নেতিয়ে",
        ],
        conditions: "Warm humid, 25-30°C, high rainfall, dense planting",
        recommendations: [
          "হেক্সাকোনাজোল বা ভ্যালিডামাইসিন স্প্রে",
          "সঠিক দূরত্বে চাষ করুন",
          "নাইট্রোজেন সার পরিমিত ব্যবহার",
          "আক্রান্ত পাতা নিচ থেকে ছেঁটে ফেলুন",
        ],
        severity: "moderate",
        season: ["Kharif", "Rabi"],
      },
      {
        name: "Maize Rust",
        nameBn: "ভুট্টার মরচে রোগ",
        cause: "fungal",
        pathogen: "Puccinia sorghi",
        symptoms: ["পাতায় বাদামি গোলাকার দাগ", "পাতায় কমলা-বাদামি পাউডার", "পাতা হলুদ হয়ে যাচ্ছে", "পাতা ঝরে"],
        conditions: "Cool moist, 16-25°C, dew, oxalis weed host",
        recommendations: [
          "প্রোপিকোনাজোল স্প্রে",
          "প্রতিরোধী জাত লাগান",
          "আগাছা পরিষ্কার রাখুন",
          "সুষম সার ব্যবহার করুন",
        ],
        severity: "moderate",
        season: ["Rabi"],
      },
      {
        name: "Stalk Rot",
        nameBn: "ভুট্টার কান্ড পচা রোগ",
        cause: "fungal",
        pathogen: "Fusarium moniliforme / Macrophomina phaseolina",
        symptoms: ["কান্ডের গোড়া পচে কালো বা বাদামি", "কাণ্ড ভেঙে", "গাছ নেতিয়ে", "গাছ মরছে", "শিকড় কালো ও পচা"],
        conditions: "Hot dry after wet period, 28-35°C, stress, high plant density",
        recommendations: [
          "প্রতিরোধী জাত লাগান",
          "সুষম সার ও সেচ নিশ্চিত করুন",
          "সঠিক দূরত্বে চাষ করুন",
          "ফসল আবর্তন করুন",
          "কার্বেন্ডাজিম মাটিতে প্রয়োগ",
        ],
        severity: "severe",
        season: ["Kharif", "Rabi"],
      },
    ],
  },
};

/**
 * Map of Bengali crop names to their keys in CROP_DISEASES
 */
export const CROP_NAME_MAP = {
  ধান: "ধান",
  পাট: "পাট",
  আলু: "আলু",
  টমেটো: "টমেটো",
  বেগুন: "বেগুন",
  সরিষা: "সরিষা",
  কলা: "কলা",
  আম: "আম",
  গম: "গম",
  ভুট্টা: "ভুট্টা",
  // English name mappings
  Rice: "ধান",
  Jute: "পাট",
  Potato: "আলু",
  Tomato: "টমেটো",
  Brinjal: "বেগুন",
  Mustard: "সরিষা",
  Banana: "কলা",
  Mango: "আম",
  Wheat: "গম",
  Maize: "ভুট্টা",
  // ViT (on-device classifier) crop label aliases
  Corn: "ভুট্টা",
  // Mixed name formats from the CROPS object
  "ধান / Rice": "ধান",
  "পাট / Jute": "পাট",
  "আলু / Potato": "আলু",
  "টমেটো / Tomato": "টমেটো",
  "বেগুন / Brinjal": "বেগুন",
  "সরিষা / Mustard": "সরিষা",
  "কলা / Banana": "কলা",
  "আম / Mango": "আম",
  "গম / Wheat": "গম",
  "ভুট্টা / Maize": "ভুট্টা",
  // Quick crop IDs
  rice: "ধান",
  jute: "পাট",
  potato: "আলু",
  tomato: "টমেটো",
  brinjal: "বেগুন",
  mustard: "সরিষা",
  banana: "কলা",
  mango: "আম",
  wheat: "গম",
  maize: "ভুট্টা",
  // Season-specific
  "ধান (বোরো) / Rice - Boro": "ধান",
  "ধান (আমন) / Rice - Aman": "ধান",
  "ধান (আউশ) / Rice - Aus": "ধান",
};

/**
 * Resolve a crop name (in any format) to the CROP_DISEASES key
 * @param {string} cropInput - Crop name in Bengali, English, or mixed format
 * @returns {string|null} - Key in CROP_DISEASES or null
 */
export function resolveCropKey(cropInput) {
  if (!cropInput) return null;

  // Direct match
  if (CROP_NAME_MAP[cropInput]) return CROP_NAME_MAP[cropInput];

  // Try partial matching
  const input = cropInput.toLowerCase().trim();
  for (const [key, value] of Object.entries(CROP_NAME_MAP)) {
    if (key.toLowerCase().includes(input) || input.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

/**
 * Get diseases for a specific crop
 * @param {string} cropInput - Crop name in any format
 * @returns {Array} - Array of disease objects, or empty array
 */
export function getDiseasesForCrop(cropInput) {
  const key = resolveCropKey(cropInput);
  if (!key || !CROP_DISEASES[key]) return [];
  return CROP_DISEASES[key].diseases;
}

/**
 * Match user symptoms against disease symptom arrays and return ranked results
 * @param {string} cropInput - Crop name in any format
 * @param {string[]} userSymptoms - Array of symptom strings (Bengali)
 * @returns {Array} - Ranked array of {disease, score, maxScore, matchRatio}
 */
export function matchDiseasesBySymptoms(cropInput, userSymptoms) {
  const diseases = getDiseasesForCrop(cropInput);
  if (!diseases.length || !userSymptoms || !userSymptoms.length) return [];

  const results = diseases.map((disease) => {
    let matchCount = 0;
    const matchedSymptoms = [];

    for (const userSym of userSymptoms) {
      const userSymLower = (userSym || "").toLowerCase();
      for (const diseaseSym of disease.symptoms) {
        const diseaseSymLower = (diseaseSym || "").toLowerCase();
        // Check bidirectional substring match or keyword overlap
        if (
          userSymLower.includes(diseaseSymLower) ||
          diseaseSymLower.includes(userSymLower) ||
          hasKeywordOverlap(userSymLower, diseaseSymLower)
        ) {
          matchCount++;
          matchedSymptoms.push(diseaseSym);
          break; // Each user symptom matches at most one disease symptom
        }
      }
    }

    const maxScore = disease.symptoms.length;
    const matchRatio = maxScore > 0 ? matchCount / maxScore : 0;

    return {
      disease,
      score: matchCount,
      maxScore,
      matchRatio,
      matchedSymptoms,
    };
  });

  // Sort by match ratio descending, then by score descending
  results.sort((a, b) => {
    if (b.matchRatio !== a.matchRatio) return b.matchRatio - a.matchRatio;
    return b.score - a.score;
  });

  return results;
}

/**
 * Check if two symptom strings share enough keyword overlap to be considered a match
 * @param {string} a - First symptom string (lowercased)
 * @param {string} b - Second symptom string (lowercased)
 * @returns {boolean} - True if significant overlap
 */
function hasKeywordOverlap(a, b) {
  // Bengali-specific: check for shared significant words (2+ chars)
  const wordsA = a.split(/\s+/).filter((w) => w.length >= 2);
  const wordsB = b.split(/\s+/).filter((w) => w.length >= 2);

  let overlap = 0;
  for (const wa of wordsA) {
    for (const wb of wordsB) {
      if (wa === wb || wa.includes(wb) || wb.includes(wa)) {
        overlap++;
        break;
      }
    }
  }

  // Require at least 2 significant word overlaps or 40% overlap
  return overlap >= 2 || (wordsA.length > 0 && overlap / wordsA.length >= 0.4);
}

/**
 * Get season-based inoculum pressure estimate
 * @param {string} cropInput - Crop name
 * @param {string} season - Current season
 * @returns {string} - "high", "medium", or "low"
 */
export function estimateInoculumPressure(cropInput, season) {
  const key = resolveCropKey(cropInput);
  if (!key || !CROP_DISEASES[key]) return "low";

  const diseases = CROP_DISEASES[key].diseases;
  const seasonDiseases = diseases.filter((d) =>
    d.season.some((s) => {
      const sLower = s.toLowerCase();
      const seasonLower = (season || "").toLowerCase();
      return sLower.includes(seasonLower) || seasonLower.includes(sLower) || s === "Year-round";
    }),
  );

  if (seasonDiseases.length >= 4) return "high";
  if (seasonDiseases.length >= 2) return "medium";
  return "low";
}

/**
 * Get variety susceptibility based on crop and known variety data
 * @param {string} cropInput - Crop name
 * @param {string} variety - Variety name (optional)
 * @returns {string} - "high", "medium", or "low"
 */
export function getVarietySusceptibility(cropInput, variety) {
  // Known susceptible varieties in Bangladesh
  const susceptibleVarieties = {
    ধান: ["পুশা", "BR-3", "বিআর-৩", "irri", "IRRI"],
    আলু: ["ডায়মন্ট", "কার্ডিনাল"],
    টমেটো: ["পুসা রুবি", "বারি টমেটো-২"],
  };

  const key = resolveCropKey(cropInput);
  if (!key) return "medium";

  if (variety) {
    const susVar = susceptibleVarieties[key] || [];
    const varietyLower = variety.toLowerCase();
    for (const sv of susVar) {
      if (varietyLower.includes(sv.toLowerCase())) return "high";
    }
  }

  // Default to medium for known crops
  return "medium";
}
