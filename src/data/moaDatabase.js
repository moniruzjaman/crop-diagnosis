// Mode of Action (MoA) Database — FRAC (Fungicides) & IRAC (Insecticides)
// Contains classification, target site mechanisms, resistance risk, and rotation guidance.

export const FRAC_GROUPS = [
  {
    code: "FRAC 1",
    nameEn: "MBC-fungicides",
    nameBn: "এমবিসি-ছত্রাকনাশক",
    subGroup: "B1 - Tubulin polymerization",
    subGroupBn: "বি১ - টিউবুলিন পলিমারাইজেশন",
    risk: "High Risk (উচ্চ ঝুঁকি)",
    rotationNote: "High Risk; resistance common in many fungal species, target site mutations E198A/G/K, F200Y in β-tubulin gene. Rotate with FRAC 3, 7, or 11.",
    rotationNoteBn: "উচ্চ ঝুঁকি; অনেক ছত্রাক প্রজাতিতে প্রতিরোধ ক্ষমতা তৈরি হয়। β-টিউবুলিন জিনে মিউটেশন ঘটে। পরপর প্রয়োগ করবেন না। FRAC 3, 7 বা 11 এর সাথে ঘোরান।",
    ingredients: ["benomyl", "carbendazim", "fuberidazole", "thiabendazole", "thiophanate", "thiophanate-methyl", "কার্বেন্ডাজিম", "বেনোমিল", "থিওফানেট-মিথাইল"],
  },
  {
    code: "FRAC 2",
    nameEn: "dicarboximides",
    nameBn: "ডাইকারবক্সিমাইডস",
    subGroup: "E3 - MAP/Histidine-Kinase in osmotic signal transduction",
    subGroupBn: "ই৩ - অসমোটিক সংকেত সঞ্চারে MAP/হিস্টিডিন-কিনেস",
    risk: "Medium to High Risk (মাঝারি থেকে উচ্চ ঝুঁকি)",
    rotationNote: "Medium to High Risk; resistance common in Botrytis and some other pathogens.",
    rotationNoteBn: "মাঝারি থেকে উচ্চ ঝুঁকি; বোট্রাইটিস এবং অন্যান্য প্যাথোজেনে প্রতিরোধ ক্ষমতা দ্রুত বাড়ে।",
    ingredients: ["chlozolinate", "dimethachlone", "iprodione", "procymidone", "vinclozolin", "আইপ্রোডিয়ন", "আইপ্রোডিঅন"],
  },
  {
    code: "FRAC 3",
    nameEn: "DMI-fungicides (Triazoles / Imidazoles)",
    nameBn: "ডিএমআই-ছত্রাকনাশক (ট্রায়াজোল / ইমিডাজোল)",
    subGroup: "G1 - C14-demethylase in sterol biosynthesis",
    subGroupBn: "জি১ - স্টেরল জৈবসংশ্লেষণে C14-ডিমিথাইলেস বাধা",
    risk: "Medium Risk (মাঝারি ঝুঁকি)",
    rotationNote: "Medium risk; target site mutations in cyp51 (erg11) gene. Cross-resistance between DMI fungicides active against same fungus.",
    rotationNoteBn: "মাঝারি ঝুঁকি; স্টেরল গঠনে বাধা দেয়। একই ছত্রাকের বিরুদ্ধে FRAC 3 বারবার না দিয়ে FRAC 11, 7 বা M3 এর সাথে রোটেশন করুন।",
    ingredients: [
      "triforine", "pyrifenox", "pyrisoxazole", "fenarimol", "nuarimol", "imazalil", "oxpoconazole", "pefurazoate", "prochloraz", "triflumizole",
      "azaconazole", "bitertanol", "bromuconazole", "cyproconazole", "difenoconazole", "diniconazole", "epoxiconazole", "etaconazole", "fenbuconazole",
      "fluquinconazole", "flusilazole", "flutriafol", "hexaconazole", "imibenconazole", "ipconazole", "mefentrifluconazole", "metconazole", "myclobutanil",
      "penconazole", "propiconazole", "simeconazole", "tebuconazole", "tetraconazole", "triadimefon", "triadimenol", "triticonazole", "prothioconazole",
      "ডাইফেনোকোনাজোল", "প্রোপিকোনাজোল", "হেক্সাকোনাজোল", "টেবুকোনাজোল", "সাইপ্রোকোনাজোল", "ডিনিকোনাজোল"
    ],
  },
  {
    code: "FRAC 4",
    nameEn: "PA-fungicides (Phenylamides)",
    nameBn: "পিএ-ছত্রাকনাশক (ফিনাইলামাইডস)",
    subGroup: "A1 - RNA polymerase I",
    subGroupBn: "এ১ - আরএনএ পলিমারেস ১ বাধা",
    risk: "High Risk (উচ্চ ঝুঁকি)",
    rotationNote: "High Risk; resistance well known in Oomycetes (Late blight, Downy mildew). Always mix or rotate with contact multi-site fungicides (FRAC M3 Mancozeb or M1 Copper).",
    rotationNoteBn: "উচ্চ ঝুঁকি; ওমাইসিটে (বিলম্বিত ঝলসা, ডাউনি মিলডিউ) প্রতিরোধ খুব দ্রুত ঘটে। সবসময় ম্যানকোজেব (M3) বা কপার (M1) এর সাথে মিশিয়ে বা রোটেশন করে ব্যবহার করুন।",
    ingredients: ["benalaxyl", "benalaxyl-M", "furalaxyl", "metalaxyl", "metalaxyl-M", "mefenoxam", "oxadixyl", "ofurace", "মেটালাক্সিল", "বেনালাক্সিল", "মেফেনোক্সাম"],
  },
  {
    code: "FRAC 5",
    nameEn: "Amines ('morpholines')",
    nameBn: "অ্যামাইনস (মরফোলিনস)",
    subGroup: "G2 - ∆14-reductase and ∆8→∆7-isomerase in sterol biosynthesis",
    subGroupBn: "জি২ - স্টেরল জৈবসংশ্লেষণে ∆১৪-রিডাকটেস ও আইসোমারেস",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Low to Medium Risk; decreased sensitivity for powdery mildews.",
    rotationNoteBn: "নিম্ন থেকে মাঝারি ঝুঁকি; পাউডারি মিলডিউ প্রতিরোধে কার্যকরী।",
    ingredients: ["aldimorph", "dodemorph", "fenpropimorph", "tridemorph", "fenpropidin", "piperalin", "spiroxamine", "ট্রাইডেমর্ফ", "স্পাইরোক্সামিন"],
  },
  {
    code: "FRAC 6",
    nameEn: "Phosphorothiolates / Dithiolanes",
    nameBn: "ফসফোরোথিওলেটস / ডিথিওলেনস",
    subGroup: "H4 - Phospholipid biosynthesis, methyltransferase",
    subGroupBn: "এইচ৪ - ফসফোলিপিড জৈবসংশ্লেষণ ও মিথাইলট্রান্সফারেস",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Low to Medium Risk; target site specific for rice blast / sheath blight.",
    rotationNoteBn: "নিম্ন থেকে মাঝারি ঝুঁকি; ধানের ব্লাস্ট ও শিথ ব্লাইট প্রতিরোধে ব্যবহৃত।",
    ingredients: ["edifenphos", "iprobenfos", "IBP", "pyrazophos", "isoprothiolane", "আইসোপ্রোথিওলেন", "এডিফেনফস"],
  },
  {
    code: "FRAC 7",
    nameEn: "SDHI-fungicides (Succinate dehydrogenase inhibitors)",
    nameBn: "এসডিএইচআই-ছত্রাকনাশক",
    subGroup: "C2 - Complex II: succinate-dehydrogenase",
    subGroupBn: "সি২ - কমপ্লেক্স ২: সাকসিনেট-ডিহাইড্রোজেনেস",
    risk: "Medium to High Risk (মাঝারি থেকে উচ্চ ঝুঁকি)",
    rotationNote: "Medium to High Risk; target site mutations in sdh gene. Rotate with non-SDHI fungicides.",
    rotationNoteBn: "মাঝারি থেকে উচ্চ ঝুঁকি; প্রতিরোধী জিনের মিউটেশন প্রতিরোধ করতে অন্যান্য গ্রুপের সাথে ঘোরান।",
    ingredients: [
      "benodanil", "flutolanil", "mepronil", "isofetamid", "fluopyram", "cyclobutrifluram", "fenfuram", "carboxin", "oxycarboxin", "thifluzamide",
      "benzovindiflupyr", "bixafen", "fluindapyr", "fluxapyroxad", "furametpyr", "inpyrfluxam", "isopyrazam", "penflufen", "penthiopyrad",
      "pydiflumetofen", "sedaxane", "boscalid", "isoflucypram", "pyraziflumid", "কারবক্সিন", "ফ্লুওপাইরাম", "বসকালিড", "থিফ্লুজামাইড"
    ],
  },
  {
    code: "FRAC 9",
    nameEn: "AP-fungicides (Anilino-pyrimidines)",
    nameBn: "এপি-ছত্রাকনাশক (অ্যানিলিনো-পাইরিমিডিনস)",
    subGroup: "D1 - Methionine biosynthesis (proposed)",
    subGroupBn: "ডি১ - মেথিওনিন জৈবসংশ্লেষণ",
    risk: "Medium Risk (মাঝারি ঝুঁকি)",
    rotationNote: "Medium Risk; resistance known in Botrytis and Venturia.",
    rotationNoteBn: "মাঝারি ঝুঁকি; বোট্রাইটিস ও ভেন্টুরিয়া ছত্রাকে কার্যকারী।",
    ingredients: ["cyprodinil", "mepanipyrim", "pyrimethanil", "সাইপ্রোডিনিল", "পাইরিমিথানিল"],
  },
  {
    code: "FRAC 11",
    nameEn: "QoI-fungicides (Strobilurins)",
    nameBn: "কিউওআই-ছত্রাকনাশক (স্ট্রবিলুরিনস)",
    subGroup: "C3 - Complex III: cytochrome bc1 (ubiquinol oxidase) at Qo site",
    subGroupBn: "সি৩ - কমপ্লেক্স ৩: সাইটোক্রোম বিসি১ কিউও সাইট",
    risk: "High Risk (উচ্চ ঝুঁকি)",
    rotationNote: "High Risk; resistance known in various fungal species due to cyt b gene (G143A) mutation. Max 2 consecutive applications per season; always rotate with FRAC 3, 7 or multisites.",
    rotationNoteBn: "উচ্চ ঝুঁকি; সাইটোক্রোম বি জিনে মিউটেশন ঘটে। মৌসুমে সর্বোচ্চ ২ বার প্রয়োগ করুন; অবশ্যই FRAC 3, 7 বা M3 এর সাথে রোটেশন করুন।",
    ingredients: [
      "azoxystrobin", "coumoxystrobin", "enoxastrobin", "flufenoxystrobin", "picoxystrobin", "pyraoxystrobin", "mandestrobin", "pyraclostrobin",
      "pyrametostrobin", "triclopyricarb", "kresoxim-methyl", "trifloxystrobin", "dimoxystrobin", "fenaminstrobin", "metominostrobin", "orysastrobin",
      "famoxadone", "fluoxastrobin", "fenamidone", "pyribencarb", "এজক্সিস্ট্রোবিন", "পাইরাক্লোস্ট্রোবিন", "ট্রাইফ্লক্সিস্ট্রোবিন", "ক্রেসক্সিম-মিথাইল"
    ],
  },
  {
    code: "FRAC 12",
    nameEn: "PP-fungicides (Phenylpyrroles)",
    nameBn: "পিপি-ছত্রাকনাশক (ফিনাইলপাইরোলস)",
    subGroup: "E2 - MAP/Histidine-Kinase in osmotic signal transduction",
    subGroupBn: "ই২ - অসমোটিক সংকেত সঞ্চারে MAP/হিস্টিডিন-কিনেস",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Low to Medium Risk; broad spectrum contact/protectant activity.",
    rotationNoteBn: "নিম্ন থেকে মাঝারি ঝুঁকি; বীজের রোগ ও বোট্রাইটিস প্রতিরোধে কাজ করে।",
    ingredients: ["fenpiclonil", "fludioxonil", "ফ্লুডিওক্সোনিল"],
  },
  {
    code: "FRAC 21",
    nameEn: "QiI-fungicides",
    nameBn: "কিউআইআই-ছত্রাকনাশক",
    subGroup: "C4 - Complex III: cytochrome bc1 at Qi site",
    subGroupBn: "সি৪ - কমপ্লেক্স ৩: সাইটোক্রোম বিসি১ কিউআই সাইট",
    risk: "Medium to High Risk (মাঝারি থেকে উচ্চ ঝুঁকি)",
    rotationNote: "Medium to High Risk; effective against Oomycetes (Cyazofamid).",
    rotationNoteBn: "মাঝারি থেকে উচ্চ ঝুঁকি; সায়াজোফামিড অন্তর্ভুক্ত। ওমাইসিটে কার্যকারী।",
    ingredients: ["cyazofamid", "amisulbrom", "fenpicoxamid", "florylpicoxamid", "সায়াজোফামিড"],
  },
  {
    code: "FRAC 24",
    nameEn: "hexopyranosyl antibiotic",
    nameBn: "হেক্সোপাইরানোসিল অ্যান্টিবায়োটিক",
    subGroup: "D3 - Protein synthesis (ribosome, initiation step)",
    subGroupBn: "ডি৩ - প্রোটিন সংশ্লেষণ (রাইবোজোম প্ৰারম্ভিক ধাপ)",
    risk: "Medium Risk (মাঝারি ঝুঁকি)",
    rotationNote: "Medium Risk; resistance known in fungal & bacterial pathogens (Burkholderia).",
    rotationNoteBn: "মাঝারি ঝুঁকি; কাসুগামাইসিন ব্যাকটেরিয়া ও ব্লাস্ট রোগের বিরুদ্ধে কার্যকর।",
    ingredients: ["kasugamycin", "কাসুগামাইসিন"],
  },
  {
    code: "FRAC 25",
    nameEn: "glucopyranosyl antibiotic",
    nameBn: "গ্লুকোপাইরানোসিল অ্যান্টিবায়োটিক",
    subGroup: "D4 - Protein synthesis (ribosome, initiation step)",
    subGroupBn: "ডি৪ - প্রোটিন সংশ্লেষণ (রাইবোজোম প্ৰারম্ভিক ধাপ)",
    risk: "High Risk (উচ্চ ঝুঁকি)",
    rotationNote: "High Risk; bactericide, rapid resistance build-up.",
    rotationNoteBn: "উচ্চ ঝুঁকি; স্ট্রেপ্টোমাইসিন ব্যাকটেরিয়ানাশক। অতিরিক্ত ব্যবহারে কার্যকারিতা কমে।",
    ingredients: ["streptomycin", "স্ট্রেপ্টোমাইসিন"],
  },
  {
    code: "FRAC 27",
    nameEn: "cyanoacetamide-oxime",
    nameBn: "সায়ানোঅ্যাসিটামাইড-অক্সিম",
    subGroup: "Unknown (অজানা)",
    subGroupBn: "অজানা ক্রিয়া পদ্ধতি",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Low to Medium Risk; translaminar action against Downy Mildew / Late Blight.",
    rotationNoteBn: "নিম্ন থেকে মাঝারি ঝুঁকি; সাইমোক্সানিল নাবি ঝলসা ও ডাউনি মিলডিউ প্রতিরোধে ব্যবহার্য।",
    ingredients: ["cymoxanil", "সাইমোক্সানিল"],
  },
  {
    code: "FRAC 40",
    nameEn: "CAA-fungicides (Carboxylic acid amides)",
    nameBn: "সিএএ-ছত্রাকনাশক",
    subGroup: "H5 - Cell membrane permeability, fatty acids",
    subGroupBn: "এইচ৫ - কোষ ঝিল্লির প্রবেশযোগ্যতা ও লিপিড সংশ্লেষণ",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Low to Medium Risk; specifically controls Oomycetes.",
    rotationNoteBn: "ডাইমিথোমর্ফ ও প্রোপামোক্যার্ব অন্তর্ভুক্ত। ওমাইসিটে বিশেষ কার্যকরী।",
    ingredients: ["dimethomorph", "mandipropamid", "iprovalicarb", "benthiavalicarb", "propamocarb", "ডাইমিথোমর্ফ", "ম্যান্ডিপ্রোপামিড", "প্রোপামোক্যার্ব"],
  },
  {
    code: "FRAC M01",
    nameEn: "Inorganic Copper",
    nameBn: "অজৈব কপার (তামা)",
    subGroup: "Multi-site contact activity",
    subGroupBn: "মাল্টি-সাইট স্পর্শক ক্রিয়া",
    risk: "Low Risk (কম ঝুঁকি)",
    rotationNote: "Low Risk; multi-site inhibitor, resistance extremely rare. Excellent protectant tank-mix partner.",
    rotationNoteBn: "কম ঝুঁকি; মাল্টি-সাইট ক্রিয়া পদ্ধতি। রোগ প্রতিরোধ ক্ষমতা সহজে বাড়ে না। অন্যান্য সিস্টেমিকের সাথে আদর্শ মিশ্রণ।",
    ingredients: ["copper hydroxide", "copper oxychloride", "tribasic copper sulfate", "কপার হাইড্রোক্সাইড", "কপার অক্সিক্লোরাইড", "কপার সালফেট"],
  },
  {
    code: "FRAC M02",
    nameEn: "Inorganic Sulfur",
    nameBn: "অজৈব সালফার (গন্ধক)",
    subGroup: "Multi-site contact activity",
    subGroupBn: "মাল্টি-সাইট স্পর্শক ক্রিয়া",
    risk: "Low Risk (কম ঝুঁকি)",
    rotationNote: "Low Risk; multi-site inhibitor with acaricidal & powdery mildew control properties.",
    rotationNoteBn: "কম ঝুঁকি; পাউডারি মিলডিউ ও মাইট/মাকড় দমনে দ্বিমুখী কার্যকর।",
    ingredients: ["sulphur", "sulfur", "সালফার", "গন্ধক"],
  },
  {
    code: "FRAC M03",
    nameEn: "Dithiocarbamates",
    nameBn: "ডিথিওকারবামেটস",
    subGroup: "Multi-site contact activity",
    subGroupBn: "মাল্টি-সাইট স্পর্শক ক্রিয়া",
    risk: "Low Risk (কম ঝুঁকি)",
    rotationNote: "Low Risk; multi-site contact protectant. Ideal tank mix partner with systemic fungicides (FRAC 4, 3, 11).",
    rotationNoteBn: "কম ঝুঁকি; মাল্টি-সাইট প্রতিরক্ষামূলক স্পর্শক ছত্রাকনাশক। মেটালাক্সিল বা ট্রায়াজোলের সাথে মেশানোর জন্য অত্যন্ত উপযোগী।",
    ingredients: ["mancozeb", "maneb", "zineb", "thiram", "propineb", "metiram", "ম্যানকোজেব", "প্রোপিনেব", "মেটিরাম", "থাইরাম", "জিনেব"],
  },
  {
    code: "FRAC M05",
    nameEn: "Chloronitriles (Phthalimides)",
    nameBn: "ক্লোরোনিট্রিলস (ফথালিমাইডস)",
    subGroup: "Multi-site contact activity",
    subGroupBn: "মাল্টি-সাইট স্পর্শক ক্রিয়া",
    risk: "Low Risk (কম ঝুঁকি)",
    rotationNote: "Low Risk; broad-spectrum multi-site protectant.",
    rotationNoteBn: "কম ঝুঁকি; বহু-মুখী প্রতিরোধমূলক কার্যকারিতা।",
    ingredients: ["chlorothalonil", "folpet", "captan", "ক্লোরোথ্যালোনিল", "ক্যাপটান"],
  },
  {
    code: "FRAC P07",
    nameEn: "Phosphonates",
    nameBn: "ফসফোনেটস",
    subGroup: "P7 - Salicylate & Host plant defence elicitor",
    subGroupBn: "পি৭ - উদ্ভিদের প্রাকৃতিক অনাক্রম্যতা প্ররোচনাকারী",
    risk: "Low Risk (কম ঝুঁকি)",
    rotationNote: "Low Risk; systemic SAR (Systemic Acquired Resistance) inducer.",
    rotationNoteBn: "কম ঝুঁকি; উদ্ভিদের প্রতিরোধ ব্যবস্থা সক্রিয় করে এবং সরাসরি ওমাইসিট দমন করে।",
    ingredients: ["fosetyl-al", "phosphorous acid", "ফসেটাইল-এএল", "ফসফরাস অ্যাসিড"],
  }
];

export const IRAC_GROUPS = [
  {
    code: "IRAC 1A",
    nameEn: "Carbamates",
    nameBn: "কার্বামেট কীটনাশক",
    subGroup: "1 - Acetylcholinesterase (AChE) inhibitors",
    subGroupBn: "১ - এসিটাইলকোলিনেস্টেরেজ ইনহিবিটর",
    risk: "High Resistance Risk (উচ্চ প্রতিরোধ ঝুঁকি)",
    rotationNote: "AChE inhibitor. Do not apply sequentially with Group 1B Organophosphates if cross-resistance exists. Rotate with Group 3A, 4A, 28.",
    rotationNoteBn: "এসিটাইলকোলিনেস্টেরেজ এনজাইমে বাধা দেয়। পরপর ১বি অর্গানোফসফেটের সাথে না চালিয়ে ৩এ, ৪এ বা ২৮ গ্রুপের সাথে রোটেশন করুন।",
    ingredients: ["alanycarb", "aldicarb", "bendiocarb", "carbaryl", "carbofuran", "methiocarb", "methomyl", "oxamyl", "pirimicarb", "propoxur", "thiodicarb", "carbosulfan", "isoprocarb", "carbosulfan", "কারবারিল", "কারবোফুরান", "কারবোসালফান", "আইসোপ্রোকার্ব", "মিথোমিল", "থাইওডিকার্ব"],
  },
  {
    code: "IRAC 1B",
    nameEn: "Organophosphates",
    nameBn: "অর্গানোফসফেট কীটনাশক",
    subGroup: "1 - Acetylcholinesterase (AChE) inhibitors",
    subGroupBn: "১ - এসিটাইলকোলিনেস্টেরেজ ইনহিবিটর",
    risk: "High Resistance Risk (উচ্চ প্রতিরোধ ঝুঁকি)",
    rotationNote: "AChE inhibitor. Broad spectrum; rotate with Group 3A (Pyrethroids), 4A (Neonicotinoids), 5 (Spinosyns), or 28 (Diamides).",
    rotationNoteBn: "ব্যাপক কার্যকারী অর্গানোফসফেট। একই গ্রুপ পরপর ২ বারের বেশি স্প্রে করবেন না। ৩এ পাইরেথ্রয়েড বা ৪এ নিওনিকোটিনয়েডের সাথে রোটেশন করুন।",
    ingredients: ["acephate", "azinphos-methyl", "chlorpyrifos", "diazinon", "dimethoate", "malathion", "parathion", "phosmet", "profenofos", "quinalphos", "triazophos", "fenitrothion", "phenthoate", "ethion", "এসফেট", "ক্লোরপাইরিফস", "ডায়াজিনন", "ডাইমিথোয়েট", "ম্যালাথিয়ন", "প্রোফেনোফস", "কুইনালফস", "ফেনিট্রোথিয়ন", "ইথিয়ন"],
  },
  {
    code: "IRAC 2A",
    nameEn: "Cyclodiene Organochlorines",
    nameBn: "সাইক্লোডিন অর্গানোক্লোরিন",
    subGroup: "2 - GABA-gated chloride channel blockers",
    subGroupBn: "২ - গাবা-গেটেড ক্লোরাইড চ্যানেল ব্লকার",
    risk: "High Resistance Risk (উচ্চ প্রতিরোধ ঝুঁকি)",
    rotationNote: "GABA blocker. Rotate with different MoA groups.",
    rotationNoteBn: "গাবা ক্লোরাইড চ্যানেলে বাধা দেয়। অন্য MoA গ্রুপের সাথে রোটেশন করুন।",
    ingredients: ["chlordane", "endosulfan", "এনডোসালফান"],
  },
  {
    code: "IRAC 2B",
    nameEn: "Phenylpyrazoles (Fiproles)",
    nameBn: "ফিনাইলপাইরাজোল (ফিপ্রোলস)",
    subGroup: "2 - GABA-gated chloride channel blockers",
    subGroupBn: "২ - গাবা-গেটেড ক্লোরাইড চ্যানেল ব্লকার",
    risk: "High Resistance Risk (উচ্চ প্রতিরোধ ঝুঁকি)",
    rotationNote: "GABA blocker. Highly systemic for soil pests & thrips/hoppers. Rotate with Group 4A or Group 28.",
    rotationNoteBn: "মাটির পোকা, মাজরা ও চোষক পোকা দমনে অত্যন্ত কার্যকর। ৪এ বা ২৮ গ্রুপের সাথে রোটেশন করুন।",
    ingredients: ["fipronil", "ethiprole", "ফিপ্রোনিল", "ইথিপ্রোল"],
  },
  {
    code: "IRAC 3A",
    nameEn: "Pyrethroids / Pyrethrins",
    nameBn: "পাইরেথ্রয়েড / পাইরেথ্রিনস",
    subGroup: "3 - Sodium channel modulators",
    subGroupBn: "৩ - সোডিয়াম চ্যানেল মডুলেটর",
    risk: "High Resistance Risk (উচ্চ প্রতিরোধ ঝুঁকি)",
    rotationNote: "Fast knockdown contact activity. High risk of target site (kdr) resistance. Rotate strictly with Group 4A, Group 28, or Group 1B.",
    rotationNoteBn: "দ্রুত দমনকারী স্পর্শক শক্তি। টানা ব্যবহারে পোকার kdr প্রতিরোধ ক্ষমতা তৈরি হয়। ৪এ নিওনিকোটিনয়েড বা ২৮ ডায়ামাইডের সাথে রোটেশন করুন।",
    ingredients: [
      "cypermethrin", "deltamethrin", "lambda-cyhalothrin", "permethrin", "alpha-cypermethrin", "beta-cypermethrin", "bifenthrin", "esfenvalerate", "fenpropathrin", "zeta-cypermethrin",
      "সাইপারমেথ্রিন", "ডেল্টামেথ্রিন", "ল্যাম্বডা-সাইহ্যালোথ্রিন", "আলফা-সাইপারমেথ্রিন", "বাইফেনথ্রিন", "এসফেনভালারেট"
    ],
  },
  {
    code: "IRAC 4A",
    nameEn: "Neonicotinoids",
    nameBn: "নিওনিকোটিনয়েডস",
    subGroup: "4 - nAChR competitive modulators",
    subGroupBn: "৪ - এসিটাইলকোলিন রিসেপ্টর প্রতিযোগিতামূলক মডুলেটর",
    risk: "High Resistance Risk (উচ্চ প্রতিরোধ ঝুঁকি)",
    rotationNote: "Systemic sap-sucking pest control (BPH, Aphid, Whitefly, Thrips). Rotate strictly with Group 9B (Pymetrozine), Group 29 (Flonicamid), or Group 23 (Spirotetramat).",
    rotationNoteBn: "সিস্টেমিক চোষক পোকা (কারেন্ট পোকা/BPH, জাবপোকা, সাদা মাছি, থ্রিপস) দমনে আদর্শ। পরপর স্প্রে না করে ৯বি (পাইমেট্রোজিন), ২৯ (ফ্লোনিকামিড) বা ২৩ (স্পাইরোটেট্রাম্যাট) এর সাথে ঘুরিয়ে দিন।",
    ingredients: ["acetamiprid", "clothianidin", "imidacloprid", "thiamethoxam", "dinotefuran", "nitenpyram", "ইমিডাক্লোপ্রিড", "থায়ামেথক্সাম", "অ্যাসিটামিপ্রিড", "ক্লোথিয়ানিনডিন"],
  },
  {
    code: "IRAC 5",
    nameEn: "Spinosyns",
    nameBn: "স্পিনোসিনস",
    subGroup: "5 - nAChR allosteric modulators - Site I",
    subGroupBn: "৫ - এসিটাইলকোলিন রিসেপ্টর অ্যালোস্টেরিক মডুলেটর",
    risk: "Medium Resistance Risk (মাঝারি প্রতিরোধ ঝুঁকি)",
    rotationNote: "Fermentation-derived bio-insecticide for thrips, caterpillars, leafminers. Rotate with Group 28 or Group 6.",
    rotationNoteBn: "জৈব উৎস থেকে প্রাপ্ত। থ্রিপস ও ফল ছিদ্রকারী পোকা দমনে অত্যন্ত কার্যকর।",
    ingredients: ["spinosad", "spinetoram", "স্পিনোস্যাড", "স্পিনেটোরাম"],
  },
  {
    code: "IRAC 6",
    nameEn: "Avermectins / Milbemycins",
    nameBn: "অ্যাভারমেকটিনস / মিলবেমাইসিনস",
    subGroup: "6 - GluCl allosteric modulators",
    subGroupBn: "৬ - গ্লুটামেট-গেটেড ক্লোরাইড চ্যানেল মডুলেটর",
    risk: "Medium Resistance Risk (মাঝারি প্রতিরোধ ঝুঁকি)",
    rotationNote: "Effective against mites, leafminers, and caterpillars. Rotate with IRAC Group 10A/10B or Group 28.",
    rotationNoteBn: "লাল মাকড়, পাতার সুরঙ্গ পোকা ও লেদা পোকা দমনে কাজ করে। কাইটিন বা ডায়ামাইড গ্রুপের সাথে ঘুরিয়ে দিন।",
    ingredients: ["abamectin", "emamectin benzoate", "milbemectin", "অ্যাবামেক্টিন", "ইমামেক্টিন বেঞ্জোয়েট"],
  },
  {
    code: "IRAC 9B",
    nameEn: "Pymetrozine",
    nameBn: "পাইমেট্রোজিন",
    subGroup: "9 - Chordotonal organ TRPV modulators",
    subGroupBn: "৯ - কর্ডোটোনাল অঙ্গ মডুলেটর (খাওয়ানো বন্ধকারী)",
    risk: "Medium Risk (মাঝারি ঝুঁকি)",
    rotationNote: "Selectively stops feeding of sucking pests (BPH, Aphids). Rotate with Group 4A or Group 4E.",
    rotationNoteBn: "কারেন্ট পোকা (BPH) ও জাবপোকার খাওয়ানো তাৎক্ষণিক বন্ধ করে দেয়। নিওনিকোটিনয়েডের চমৎকার রোটেশন পার্টনার।",
    ingredients: ["pymetrozine", "পাইমেট্রোজিন"],
  },
  {
    code: "IRAC 10A",
    nameEn: "Mite growth inhibitors",
    nameBn: "মাইট গ্রোথ ইনহিবিটর",
    subGroup: "10 - Mite growth inhibitors (chitin)",
    subGroupBn: "১০ - মাইট বা মাকড় বৃদ্ধি ইনহিবিটর",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Inhibits mite egg and nymph development. Rotate with Abamectin (Group 6) or Sulfur (FRAC M02).",
    rotationNoteBn: "মাকড়ের ডিম ও বাচ্চা দমন করে। অ্যাবামেক্টিন বা সালফারের সাথে ঘুরিয়ে স্প্রে করুন।",
    ingredients: ["hexythiazox", "clofentezine", "diflovidazin", "হেক্সিথিয়াজক্স"],
  },
  {
    code: "IRAC 10B",
    nameEn: "Etoxazole",
    nameBn: "ইটক্সাজল",
    subGroup: "10 - Mite growth inhibitors (chitin)",
    subGroupBn: "১০ - মাইট গ্রোথ ইনহিবিটর",
    risk: "Medium Risk (মাঝারি ঝুঁকি)",
    rotationNote: "Mite chitin inhibitor. Rotate with non-group 10 miticides.",
    rotationNoteBn: "মাকড়ের কাইটিন গঠন প্রতিরোধ করে।",
    ingredients: ["etoxazole", "ইটক্সাজল"],
  },
  {
    code: "IRAC 11A",
    nameEn: "Bacillus thuringiensis (Bt)",
    nameBn: "ব্যাসিলাস থুরিনজিয়েনসিস (বিটি)",
    subGroup: "11 - Microbial midgut disruptors",
    subGroupBn: "১১ - মাইক্রোবিয়াল মিডগাট ডিসরাপ্টর",
    risk: "Low Risk (কম ঝুঁকি)",
    rotationNote: "Biological Crystal protein disruptor for caterpillar control. Safe for beneficial predators.",
    rotationNoteBn: "জৈব বালাইনাশক। পরিবেশ ও উপকারী পোকার জন্য সম্পূর্ণ নিরাপদ।",
    ingredients: ["bacillus thuringiensis", "bt kurstaki", "bt aizawai", "ব্যাসিলাস থুরিনজিয়েনসিস"],
  },
  {
    code: "IRAC 13",
    nameEn: "Pyrroles",
    nameBn: "পাইরোলস",
    subGroup: "13 - Uncouplers of oxidative phosphorylation",
    subGroupBn: "১৩ - অক্সিডেটিভ ফসফোরিলেশনের আনকাপলার",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Controls mites, thrips, and caterpillars. Pro-insecticide activated in pest midgut.",
    rotationNoteBn: "মাকড়, থ্রিপস ও লেদা পোকা দমনে অত্যন্ত কার্যকর।",
    ingredients: ["chlorfenapyr", "ক্লোরফেনাপির"],
  },
  {
    code: "IRAC 14",
    nameEn: "Nereistoxin analogues",
    nameBn: "নেরিস্টক্সিন অ্যানালগ",
    subGroup: "14 - nAChR channel blockers",
    subGroupBn: "১৪ - এসিটাইলকোলিন চ্যানেল ব্লকার",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Effective against stem borers, leaf folders, and BPH.",
    rotationNoteBn: "ধানের মাজরা পোকা, পাতা মোড়ানো পোকা ও বিপিএইচ দমনে উপযোগী।",
    ingredients: ["cartap", "cartap hydrochloride", "bensultap", "thiocyclam", "কারটাপ", "বেনসুলটাপ"],
  },
  {
    code: "IRAC 15",
    nameEn: "Benzoylureas",
    nameBn: "বেনজয়লিউরিয়া (কাইটিন ইনহিবিটর)",
    subGroup: "15 - Chitin biosynthesis inhibitors, type 0",
    subGroupBn: "১৫ - কাইটিন বায়োসিন্থেসিস ইনহিবিটর (টাইপ ০)",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Prevents caterpillar moulting and egg hatching. Rotate with Group 28 or Group 1B.",
    rotationNoteBn: "পোকার খোলস বদলানো বন্ধ করে এবং ডিম ফুটতে দেয় না।",
    ingredients: ["lufenuron", "novaluron", "diflubenzuron", "flufenoxuron", "লুফেনুরন", "নোভালুরন"],
  },
  {
    code: "IRAC 16",
    nameEn: "Buprofezin",
    nameBn: "বুপ্রোফেজিন",
    subGroup: "16 - Chitin biosynthesis inhibitors, type 1",
    subGroupBn: "১৬ - কাইটিন বায়োসিন্থেসিস ইনহিবিটর (টাইপ ১)",
    risk: "Low to Medium Risk (নিম্ন থেকে মাঝারি ঝুঁকি)",
    rotationNote: "Specific chitin synthesis inhibitor for hoppers and whiteflies.",
    rotationNoteBn: "ধানের বাদামী গাছ ফড়িং (BPH) ও সাদা মাছির বাচ্চার খোলস বদল রোধ করে।",
    ingredients: ["buprofezin", "বুপ্রোফেজিন"],
  },
  {
    code: "IRAC 23",
    nameEn: "Tetronic & Tetramic acid derivatives",
    nameBn: "টেট্রোনিক ও টেট্রামিক অ্যাসিড ডেরিভেটিভস",
    subGroup: "23 - Acetyl CoA carboxylase inhibitors",
    subGroupBn: "২৩ - এসিটাইল কো-এ কার্বক্সিলেস ইনহিবিটর",
    risk: "Medium Risk (মাঝারি ঝুঁকি)",
    rotationNote: "Lipid biosynthesis inhibitor for sucking pests & mites. Systemic 2-way movement.",
    rotationNoteBn: "সাদা মাছি, জাবপোকা ও মাকড়ের লিপিড তৈরি বন্ধ করে। গাছের চারা ও পাতায় উভয় দিকে প্রবাহিত হয়।",
    ingredients: ["spirotetramat", "spiromesifen", "spirodiclofen", "স্পাইরোটেট্রাম্যাট", "স্পাইরোমেসিফেন"],
  },
  {
    code: "IRAC 28",
    nameEn: "Diamides",
    nameBn: "ডায়ামাইডস",
    subGroup: "28 - Ryanodine receptor modulators",
    subGroupBn: "২৮ - রায়ানোডিন রিসেপ্টর মডুলেটর",
    risk: "Medium to High Risk (মাঝারি থেকে উচ্চ ঝুঁকি)",
    rotationNote: "Paralyzes insect muscles. High efficacy against Stem Borers, Cutworms, Fruit Borers. Rotate strictly with non-Group 28 chemistry.",
    rotationNoteBn: "পোকার পেশী অবশ করে দেয়। ধান ও সবজির মাজরা, ফল ছিদ্রকারী ও কাটুই পোকা দমনে অন্যতম সেরা। পরপর ২ বারের বেশি স্প্রে করবেন না।",
    ingredients: ["chlorantraniliprole", "cyantraniliprole", "flubendiamide", "tetraniliprole", "ক্লোরঅ্যানট্রানিলিপ্রোল", "সায়ানট্রানিলিপ্রোল", "ফ্লুবেন্ডিয়ামাইড"],
  }
];

/**
 * Search and lookup MoA details for an active ingredient name in English or Bengali.
 * @param {string} rawIngredientName
 * @returns {object|null}
 */
export function lookupMoA(rawIngredientName) {
  if (!rawIngredientName || typeof rawIngredientName !== "string") return null;

  const cleaned = rawIngredientName.trim().toLowerCase();

  // Search FRAC
  for (const group of FRAC_GROUPS) {
    if (group.ingredients.some((ing) => ing.toLowerCase().includes(cleaned) || cleaned.includes(ing.toLowerCase()))) {
      return {
        type: "FRAC",
        code: group.code,
        nameEn: group.nameEn,
        nameBn: group.nameBn,
        subGroup: group.subGroup,
        subGroupBn: group.subGroupBn,
        risk: group.risk,
        rotationNote: group.rotationNote,
        rotationNoteBn: group.rotationNoteBn,
      };
    }
  }

  // Search IRAC
  for (const group of IRAC_GROUPS) {
    if (group.ingredients.some((ing) => ing.toLowerCase().includes(cleaned) || cleaned.includes(ing.toLowerCase()))) {
      return {
        type: "IRAC",
        code: group.code,
        nameEn: group.nameEn,
        nameBn: group.nameBn,
        subGroup: group.subGroup,
        subGroupBn: group.subGroupBn,
        risk: group.risk,
        rotationNote: group.rotationNote,
        rotationNoteBn: group.rotationNoteBn,
      };
    }
  }

  return null;
}

/**
 * Helper that takes a raw chemical recommendation string and enriches it
 * with MoA group citation if recognized.
 * @param {string} recommendationText
 * @returns {string}
 */
export function formatChemicalAdviceWithMoA(recommendationText) {
  if (!recommendationText || typeof recommendationText !== "string") return recommendationText;

  // Already annotated
  if (recommendationText.includes("FRAC") || recommendationText.includes("IRAC") || recommendationText.includes("MoA")) {
    return recommendationText;
  }

  // Check known active ingredients
  const allGroups = [...FRAC_GROUPS, ...IRAC_GROUPS];
  for (const group of allGroups) {
    for (const ing of group.ingredients) {
      if (ing.length > 3 && recommendationText.toLowerCase().includes(ing.toLowerCase())) {
        return `${recommendationText} (MoA: ${group.code} — ${group.nameBn}, ${group.subGroupBn})`;
      }
    }
  }

  return recommendationText;
}
