import React, { useState } from 'react';
import { ChemicalProduct } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  HeartHandshake, 
  Trash2, 
  Fish, 
  Flower2, 
  Droplet,
  FileDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { exportSingleProductPDF } from '../utils/pdfExport';
import { useLanguage } from '../context/LanguageContext';

interface SafetyViewProps {
  products: ChemicalProduct[];
  onOpenSafetyModal: (product: ChemicalProduct) => void;
}

export const SafetyView: React.FC<SafetyViewProps> = ({ products, onOpenSafetyModal }) => {
  const { language, t, formatNum } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<ChemicalProduct>(products[0]);
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    setChecks({});
  };

  const checklistItems = [
    { 
      id: 'c1', 
      phase: language === 'bn' ? 'স্প্রে করার পূর্বে' : 'Pre-Spray', 
      title: language === 'bn' ? 'স্প্রেয়ার যন্ত্রপাতির সার্বিক নিরীক্ষণ' : 'Inspection of Spraying Equipment', 
      desc: language === 'bn' ? 'প্রথমে পরিষ্কার পানি দিয়ে ন্যাপস্যাক স্প্রেয়ার ট্যাংক, হোস পাইপ, ট্রিগার ল্যান্স ও গ্যাসকেটে কোনো লিকেজ আছে কি না পরীক্ষা করুন।' : 'Check knapsack sprayer tank, hoses, trigger lance, and gaskets for leaks with clean water.' 
    },
    { 
      id: 'c2', 
      phase: language === 'bn' ? 'স্প্রে করার পূর্বে' : 'Pre-Spray', 
      title: language === 'bn' ? 'নোজল ক্যালিব্রেশন ও পরিষ্কার রাখা' : 'Calibrated Nozzle Check', 
      desc: language === 'bn' ? 'নোজল দিয়ে সুষম স্প্রে ফ্যান বা কোণ বের হচ্ছে কি না যাচাই করুন। জ্যাম হওয়া নোজল টুথব্রাশ দিয়ে পরিষ্কার করুন — কখনো মুখে ফুঁ দেবেন না!' : 'Verify uniform spray fan/cone pattern. Clean clogged nozzles with a soft toothbrush — NEVER blow through with mouth!' 
    },
    { 
      id: 'c3', 
      phase: language === 'bn' ? 'স্প্রে করার পূর্বে' : 'Pre-Spray', 
      title: language === 'bn' ? 'আবহাওয়া ও বাতাসের গতি মূল্যায়ন' : 'Weather & Wind Assessment', 
      desc: language === 'bn' ? 'বাতাসের গতিবেগ ১০ কিমি/ঘণ্টার কম কি না নিশ্চিত করুন। তীব্র রোদ/দুপুরের গরমে (>৩২°সে) বা বৃষ্টির পূর্বাভাসে স্প্রে স্থগিত রাখুন।' : 'Confirm wind speed is under 10 km/h. Avoid spraying during midday tropical heat (>32°C) or impending rain.' 
    },
    { 
      id: 'c4', 
      phase: language === 'bn' ? 'স্প্রে করার পূর্বে' : 'Pre-Spray', 
      title: language === 'bn' ? 'সম্পূর্ণ ব্যক্তিগত সুরক্ষা সামগ্রী (PPE) পরিধান' : 'Complete PPE Donning', 
      desc: language === 'bn' ? 'নাইট্রিল বা রাবার গ্লাভস, বাষ্পরোধী রেসপিরেটর বা মাস্ক, প্রতিরক্ষামূলক গগলস এবং গামবুট বাধ্যতামূলকভাবে পরিধান করুন।' : 'Wear chemical-resistant nitrile gloves, vapor respirator or N95 mask, safety goggles, and rubber gumboots.' 
    },
    { 
      id: 'c5', 
      phase: language === 'bn' ? 'স্প্রে করার সময়' : 'During Spray', 
      title: language === 'bn' ? 'বাতাসের অনুকূলে স্প্রে পরিচালনা' : 'Maintain Upwind Spray Path', 
      desc: language === 'bn' ? 'সবসময় বাতাসের অনুকূলে বা আড়াআড়ি হাঁটুন যাতে রাসায়নিক কুয়াশা স্প্রেকারীর শরীর ও শ্বাসযন্ত্রের বিপরীতে দূরে উড়ে যায়।' : 'Always walk backwards or crosswind so spray mist drifts AWAY from your body and breathing zone.' 
    },
    { 
      id: 'c6', 
      phase: language === 'bn' ? 'স্প্রে করার সময়' : 'During Spray', 
      title: language === 'bn' ? 'খাবার, পানীয় ও ধূমপান সম্পূর্ণ নিষিদ্ধ' : 'Zero Food / Drink / Smoking Policy', 
      desc: language === 'bn' ? 'বালাইনাশক হ্যান্ডলিং ও স্প্রে চলাকালীন খাবার খাওয়া, পানি পান বা ধূমপান/তামাক সেবন সম্পূর্ণভাবে এড়িয়ে চলুন।' : 'Never eat, drink, chew tobacco, or smoke while handling or applying agricultural chemicals.' 
    },
    { 
      id: 'c7', 
      phase: language === 'bn' ? 'স্প্রে করার সময়' : 'During Spray', 
      title: language === 'bn' ? 'জলাশয় ও মৌমাছি সুরক্ষা নিশ্চিতকরণ' : 'Protect Waterways & Bee Hives', 
      desc: language === 'bn' ? 'পুকুর, খাল বা জলাশয় এবং মৌমাছির বাক্স থেকে কমপক্ষে ১৫ মিটার বাফার দূরত্ব বজায় রাখুন।' : 'Maintain 15-meter buffer from open ponds or bee apiaries. Close hive entrances if spraying nearby.' 
    },
    { 
      id: 'c8', 
      phase: language === 'bn' ? 'স্প্রে পরবর্তী' : 'Post-Spray', 
      title: language === 'bn' ? 'খালি বোতল ৩ বার ধৌতকরণ ও নিষ্ক্রিয়করণ' : 'Triple Rinse Empty Containers', 
      desc: language === 'bn' ? 'খালি বোতল ৩ বার পানি দিয়ে ধুয়ে সেই পানি স্প্রে ট্যাংকে ঢালুন। গৃহস্থালির কাজে ব্যবহার রোধে বোতলের তলায় ফুটো করে ফেলুন।' : 'Rinse container 3 times into the spray tank. Puncture bottom to prevent household domestic reuse.' 
    },
    { 
      id: 'c9', 
      phase: language === 'bn' ? 'স্প্রে পরবর্তী' : 'Post-Spray', 
      title: language === 'bn' ? 'শারীরিক বিশোধন ও গোসল' : 'Personal Decontamination', 
      desc: language === 'bn' ? 'হাত, মুখমণ্ডল ও সারা শরীর প্রচুর ঠান্ডা পানি ও সাবান দিয়ে ধুয়ে গোসল করুন। ব্যবহৃত কাপড় পরিবারের কাপড় থেকে আলাদা ধোবেন।' : 'Wash hands, face, and body with cold water and soap immediately. Wash spray clothes separately from family laundry.' 
    },
    { 
      id: 'c10', 
      phase: language === 'bn' ? 'স্প্রে পরবর্তী' : 'Post-Spray', 
      title: language === 'bn' ? 'জমিতে প্রবেশের ব্যবধান (REI) ও লাল নিশানা' : 'Field Re-Entry & PHI Warning', 
      desc: language === 'bn' ? 'জমির চারপাশে লাল ফিতা বা সতর্কীকরণ সাইনবোর্ড টানিয়ে রাখুন যাতে নির্দিষ্ট সময়ের পূর্বে কোনো মানুষ বা গবাদিপশু জমিতে না ঢোকে।' : 'Field Re-Entry & PHI Warning' 
    }
  ];

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div id="safety-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/80 border border-amber-700 text-amber-200 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            {language === 'bn' ? 'পেশাগত স্বাস্থ্য ও পরিবেশগত নিরাপত্তা নির্দেশিকা' : 'Field Occupational Health & Environmental Safety Directive'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {language === 'bn' ? 'নিরাপত্তা সতর্কতা চেকলিস্ট ও বিষাক্ততা প্রোটোকল' : 'Safety Precaution Checklists & Toxicity Protocols'}
          </h1>
          <p className="text-sm text-amber-100 mt-2 leading-relaxed">
            {language === 'bn' 
              ? 'কৃষিবিদ, ডিএই কর্মকর্তা ও স্প্রে কর্মীদের জন্য প্রমিত পরিচালন পদ্ধতি (SOP)। ১০-দফা ইন্টারেক্টিভ মাঠ চেকলিস্ট, বিশ্ব স্বাস্থ্য সংস্থা (WHO) এর বিপদ শ্রেণীবিভাগ ও প্রাথমিক চিকিৎসা নির্দেশিকা।'
              : 'Standard operating safety procedures for agricultural professionals. Interactive field pre-spray checks, WHO toxicity classification bands, emergency first aid protocols, and container decontamination guidelines.'}
          </p>
        </div>
      </div>

      {/* Interactive Field Checklist with Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {language === 'bn' ? 'ইন্টারেক্টিভ ১০-দফা কৃষি বালাইনাশক প্রয়োগ নিরাপত্তা চেকলিস্ট' : 'Interactive 10-Point Agricultural Application Safety Checklist'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn' 
                ? 'মাঠকর্মী ও স্প্রে টিমকে প্রতিটি বালাইনাশক প্রয়োগের পূর্বে, চলাকালীন এবং পরবর্তীতে এই নির্দেশিকা অনুসরণ করতে হবে।'
                : 'Field agronomists and spray teams should complete this protocol before, during, and after every field application.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900">
                {language === 'bn' 
                  ? `${formatNum(checklistItems.length)} টির মধ্যে ${formatNum(checkedCount)} টি সম্পন্ন` 
                  : `${checkedCount} of ${checklistItems.length} Completed`}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {formatNum(progressPercent)}% {language === 'bn' ? 'প্রস্তুত' : 'Ready'}
              </span>
            </div>
            {checkedCount > 0 && (
              <button
                onClick={resetChecklist}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> {language === 'bn' ? 'পুনরায় শুরু' : 'Reset'}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-emerald-600' : progressPercent > 50 ? 'bg-amber-500' : 'bg-slate-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => {
            const isDone = !!checks[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {item.phase}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHO Toxicity Bands Explained */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-lg text-slate-900">
          {language === 'bn' ? 'WHO বালাইনাশক ঝুঁকি শ্রেণীবিভাগ ও বাধ্যতামূলক রঙিন ব্যান্ড' : 'WHO Hazard Classification & Mandatory Color Bands'}
        </h3>
        <p className="text-xs text-slate-500">
          {language === 'bn' 
            ? 'বালাইনাশকের বোতল বা প্যাকেটের নিচের দিকের ত্রিকোণ রঙিন ব্যান্ড দেখে স্তন্যপায়ী প্রাণীর প্রতি তীব্র বিষাক্ততা জানা যায়।'
            : 'Pesticide container lower triangles display color bands indicating acute mammalian toxicity.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 space-y-2">
            <div className="w-full h-3 rounded-full bg-red-600 mb-1" />
            <span className="text-xs font-bold text-red-950 block">
              {language === 'bn' ? 'Class Ia & Ib: চরম / অতিমাত্রায় বিপজ্জনক' : 'Class Ia & Ib: Extremely / Highly Hazardous'}
            </span>
            <span className="inline-block px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold">
              {language === 'bn' ? 'গাঢ় লাল ব্যান্ড' : 'BRIGHT RED BAND'}
            </span>
            <p className="text-xs text-red-900 leading-relaxed">
              {language === 'bn' 
                ? 'মৌখিক LD50 < ৫০ মিগ্রা/কেজি। প্রতীক: খুলি ও হাড়ের চিহ্ন (POISON)। যেমন: অ্যালুমিনিয়াম ফসফাইড, কার্বোফিউরান। কেবল লাইসেন্সধারী ফিউমিগেটরের জন্য।'
                : 'Oral LD50 < 50 mg/kg. Symbol: Skull and crossbones. Examples: Aluminium Phosphide, Carbofuran. Restricted strictly to licensed fumigators.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 space-y-2">
            <div className="w-full h-3 rounded-full bg-yellow-400 mb-1" />
            <span className="text-xs font-bold text-amber-950 block">
              {language === 'bn' ? 'Class II: মাঝারি ধরনের বিপজ্জনক' : 'Class II: Moderately Hazardous'}
            </span>
            <span className="inline-block px-2 py-0.5 rounded bg-yellow-400 text-yellow-950 font-mono text-[10px] font-bold">
              {language === 'bn' ? 'উজ্জ্বল হলুদ ব্যান্ড' : 'BRIGHT YELLOW BAND'}
            </span>
            <p className="text-xs text-amber-900 leading-relaxed">
              {language === 'bn' 
                ? 'মৌখিক LD50 ৫০-২০০০ মিগ্রা/কেজি। সতর্কবাণী: বিপদ / সাবধান (DANGER/WARNING)। যেমন: ক্লোরপাইরিফস, সাইপারমেথ্রিন, কারটাপ। পূর্ণ PPE আবশ্যক।'
                : 'Oral LD50 50-2000 mg/kg. Signal word: DANGER / WARNING. Examples: Chlorpyrifos, Cypermethrin, Cartap. Full PPE mandatory.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-2">
            <div className="w-full h-3 rounded-full bg-blue-500 mb-1" />
            <span className="text-xs font-bold text-blue-950 block">
              {language === 'bn' ? 'Class III: সামান্য বিপজ্জনক' : 'Class III: Slightly Hazardous'}
            </span>
            <span className="inline-block px-2 py-0.5 rounded bg-blue-500 text-white font-mono text-[10px] font-bold">
              {language === 'bn' ? 'উজ্জ্বল নীল ব্যান্ড' : 'BRIGHT BLUE BAND'}
            </span>
            <p className="text-xs text-blue-900 leading-relaxed">
              {language === 'bn' 
                ? 'মৌখিক LD50 > ২০০০ মিগ্রা/কেজি। সতর্কবাণী: সতর্কতা (CAUTION)। যেমন: ম্যানকোজেব, হেক্সাকোনাজল, সালফার, ইমিডাক্লোপ্রিড। গ্লাভস ও মাস্ক প্রয়োজনীয়।'
                : 'Oral LD50 > 2000 mg/kg. Signal word: CAUTION. Examples: Mancozeb, Hexaconazole, Sulphur, Imidacloprid. Standard gloves and mask required.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
            <div className="w-full h-3 rounded-full bg-emerald-500 mb-1" />
            <span className="text-xs font-bold text-emerald-950 block">
              {language === 'bn' ? 'Class U: ঝুঁকি সৃষ্টির সম্ভাবনা ক্ষীণ' : 'Class U: Unlikely to Present Hazard'}
            </span>
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-500 text-white font-mono text-[10px] font-bold">
              {language === 'bn' ? 'উজ্জ্বল সবুজ ব্যান্ড' : 'BRIGHT GREEN BAND'}
            </span>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {language === 'bn' 
                ? 'মৌখিক LD50 > ৫০০০ মিগ্রা/কেজি। সংকেত: সাবধানতা। যেমন: জৈব বালাইনাশক, কিউলিউর ফেরোমোন ট্র্যাপ, ট্রাইকোডার্মা। আইপিএম-এর জন্য সবচেয়ে নিরাপদ।'
                : 'Oral LD50 > 5000 mg/kg. Signal word: CAUTION. Examples: Bio-pesticides, Cuelure pheromones, Trichoderma. Safest profile for IPM.'}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency First Aid Protocols */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            {language === 'bn' ? 'জরুরি চিকিৎসা প্রতিক্রিয়া' : 'Emergency Medical Response'}
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            {language === 'bn' ? 'বালাইনাশক বিষক্রিয়ায় জরুরি প্রাথমিক চিকিৎসা' : 'Pesticide Poisoning First Aid Protocols'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'bn' 
              ? 'যেকোনো দুর্ঘটনা বা বিষক্রিয়ায় রোগীকে অবিলম্বে নিকটস্থ উপজেলা স্বাস্থ্য কমপ্লেক্স বা হাসপাতালে নিয়ে যান। সাথে বালাইনাশকের বোতল বা মোড়ক অবশ্যই নেবেন!'
              : 'In any accidental exposure or poisoning event, transport the patient immediately to the nearest Upazila Health Complex / Hospital. Take the chemical container label with you!'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-amber-400 text-sm">
              {language === 'bn' ? '১. ত্বকে বিষাক্ত রাসায়নিক লাগলে' : '1. Skin & Dermal Contamination'}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {language === 'bn' 
                ? 'তাত্ক্ষণিকভাবে দূষিত কাপড়, জুতা ও মোজা খুলে ফেলুন। অন্তত ১৫ মিনিট প্রচুর ঠান্ডা পরিষ্কার পানি ও সাবান দিয়ে ত্বক ধুয়ে ফেলুন। লোমকূপ যেন খুলে না যায় সেজন্য অতিরিক্ত ঘষাঘষি করবেন না।'
                : 'Immediately strip off all contaminated clothing, shoes, and socks. Drench skin with copious cold running water for at least 15 minutes. Wash thoroughly with soap. Do not scrub harshly to avoid opening skin pores.'}
            </p>
          </div>

          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-amber-400 text-sm">
              {language === 'bn' ? '২. চোখে রাসায়নিকের ছিটা পড়লে' : '2. Eye Splash Exposure'}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {language === 'bn' 
                ? 'চোখের পাতা দুটি আঙুল দিয়ে প্রশস্ত করে খুলে ধরুন এবং পরিষ্কার বিশুদ্ধ পানি বা স্যালাইন দিয়ে টানা ১৫ মিনিট চোখের কোণ থেকে ধুয়ে ফেলুন। চিকিৎসকের পরামর্শ ছাড়া কোনো ড্রপ দেবেন না।'
                : 'Hold eyelids open wide and flush continuously under gentle clean water or saline for 15 minutes. Do not use chemical antidotes or eye drops without doctor instruction. Seek immediate ophthalmologic examination.'}
            </p>
          </div>

          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-amber-400 text-sm">
              {language === 'bn' ? '৩. সুনির্দিষ্ট অ্যান্টিডোট নির্দেশিকা' : '3. Specific Antidotes Reference'}
            </h4>
            <ul className="text-slate-300 space-y-1 leading-relaxed">
              <li>• <strong>{language === 'bn' ? 'অর্গানোফসফেট ও কার্বামেট:' : 'Organophosphates & Carbamates:'}</strong> {language === 'bn' ? 'অ্যাট্রোপিন সালফেট ইনজেকশন (চিকিৎসক দ্বারা প্রয়োগযোগ্য)।' : 'Atropine Sulfate injection (administered by physician).'}</li>
              <li>• <strong>{language === 'bn' ? 'ইঁদুরনাশক (জিংক ফসফাইড/ব্রোডিফাকুম):' : 'Anticoagulant Rodenticides:'}</strong> {language === 'bn' ? 'ভিটামিন কে-১ (Vitamin K1)।' : 'Vitamin K1.'}</li>
              <li>• <strong>{language === 'bn' ? 'সিন্থেটিক পাইরেথ্রয়েড:' : 'Synthetic Pyrethroids:'}</strong> {language === 'bn' ? 'মুখে জ্বালাপোড়ার জন্য ভিটামিন ই ক্রিম; লক্ষণভিত্তিক উপশম।' : 'Vitamin E cream for facial paraesthesia; symptomatic relief.'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Product-Specific Safety Dossier Quick Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            {language === 'bn' ? 'নির্দিষ্ট বালাইনাশকের নিরাপত্তা তথ্য ও ফিল্ড শিট ডাউনলোড' : 'Lookup Chemical-Specific Safety Data & Download Field Sheet'}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <select
            value={selectedProduct.id}
            onChange={(e) => {
              const found = products.find((p) => p.id === e.target.value);
              if (found) setSelectedProduct(found);
            }}
            className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.tradeName} ({p.commonName})
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenSafetyModal(selectedProduct)}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {language === 'bn' 
                ? `${selectedProduct.tradeName}-এর সুরক্ষা চেকলিস্ট দেখুন` 
                : `Open Safety Checklist for ${selectedProduct.tradeName}`}
            </span>
          </button>

          <button
            onClick={() => exportSingleProductPDF(selectedProduct)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'পিডিএফ সেফটি শিট ডাউনলোড' : 'Download PDF Safety Sheet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
