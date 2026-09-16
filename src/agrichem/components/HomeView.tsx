import React, { useState } from 'react';
import { 
  Database, 
  Calculator, 
  RotateCw, 
  ShieldCheck, 
  BookOpen, 
  Bell, 
  ArrowRight, 
  Sparkles, 
  Share2, 
  Download, 
  CheckCircle2, 
  Layers, 
  FlaskConical, 
  AlertTriangle,
  FileText,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { ChemicalProduct, AppTab } from '../types';

interface HomeViewProps {
  products: ChemicalProduct[];
  onNavigateTab: (tab: AppTab) => void;
  onSelectCropFilter: (crop: string) => void;
  onOpenShareModal: () => void;
  totalProductsCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onNavigateTab,
  onSelectCropFilter,
  onOpenShareModal,
  totalProductsCount
}) => {
  const { language, t, formatNum, transCrop } = useLanguage();
  const [activePreviewFeature, setActivePreviewFeature] = useState<number>(0);

  // Popular crops for quick navigation
  const popularCrops = [
    { en: 'Rice', bn: 'ধান', count: 28 },
    { en: 'Potato', bn: 'আলু', count: 18 },
    { en: 'Tomato', bn: 'টমেটো', count: 16 },
    { en: 'Brinjal', bn: 'বেগুন', count: 15 },
    { en: 'Mango', bn: 'আম', count: 12 },
    { en: 'Chilli', bn: 'মরিচ', count: 11 }
  ];

  // Feature definitions with detailed summaries for the Hero Section
  const features = [
    {
      id: 'database' as AppTab,
      titleEn: 'DAE Registered Chemical Database',
      titleBn: 'ডিএই নিবন্ধিত রাসায়নিক ডাটাবেস',
      subtitleEn: '70+ Approved Formulations & Active Ingredients',
      subtitleBn: '৭০+ অনুমোদিত সক্রিয় উপাদান ও বাণিজ্য নাম',
      descEn: 'Instant search across Bangladesh DAE-registered insecticides, fungicides, herbicides, and miticides. Includes verified trade names, target pests, label application rates, PHI (Pre-Harvest Interval) and REI safety windows.',
      descBn: 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE) নিবন্ধিত কীটনাশক, ছত্রাকনাশক, আগাছানাশক ও মাকড়নাশকের পূর্ণাঙ্গ তালিকা। অনুমোদিত বাণিজ্য নাম, লক্ষ্য বালাই, প্রতি হেক্টরে সঠিক প্রয়োগ মাত্রা, ফসল তোলার নিরাপদ বিরতি (PHI) ও রি-এন্ট্রি সময়কাল দেখুন।',
      icon: Database,
      badgeEn: '70+ Dossiers',
      badgeBn: '৭০+ রাসায়নিক',
      themeColor: 'from-emerald-500 to-emerald-700',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      lightGlow: 'hover:shadow-emerald-500/10',
      statLabelEn: 'Active Ingredients',
      statLabelBn: 'সক্রিয় উপাদান',
      statValue: `${totalProductsCount}+`,
      highlightsEn: ['Official DAE Registration', 'PHI & REI Safety Windows', 'Target Pest Index', 'Trade Names Dossier'],
      highlightsBn: ['ডিএই অফিসিয়াল নিবন্ধন', 'PHI ও REI নিরাপদ সময়', 'বালাই ও রোগের পূর্ণাঙ্গ তালিকা', 'ব্র্যান্ড ও বাণিজ্য নাম']
    },
    {
      id: 'calculator' as AppTab,
      titleEn: 'Knapsack Sprayer & Dosage Calculator',
      titleBn: 'মাঠপর্যায়ের মাত্রা ও ট্যাংক ক্যালকুলেটর',
      subtitleEn: 'Knapsack 16L, 10L, 20L & Land Unit Conversions',
      subtitleBn: '১৬L, ১০L, ২০L স্প্রেয়ার ও শতক/বিঘা হিসাব',
      descEn: 'Never over-spray or under-dose chemicals. Calibrate knapsack sprayers for 16L, 10L, or 20L tanks. Convert between Decimal/Shatak, Katha, Bigha, Acre, and Hectares with accurate active ingredient grams/milliliters and water volumes.',
      descBn: 'অতিরিক্ত বা কম বালাইনাশক ব্যবহারের ঝুঁকি দূর করুন। ১৬ লিটার, ১০ লিটার ও ২০ লিটার ন্যাপস্যাক স্প্রেয়ারের জন্য শতক, কাঠা, বিঘা বা একর জমিতে মোট কয় ট্যাংক স্প্রে প্রয়োজন এবং প্রতি ট্যাংকে ঠিক কত মিলি বা গ্রাম ওষুধ মেশাতে হবে তা এক নিমিষে হিসাব করুন।',
      icon: Calculator,
      badgeEn: 'Knapsack Calibrated',
      badgeBn: 'ন্যাপস্যাক ট্যাংক মিশ্রণ',
      themeColor: 'from-teal-500 to-teal-700',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      lightGlow: 'hover:shadow-teal-500/10',
      statLabelEn: 'Sprayer Sizes',
      statLabelBn: 'ট্যাংক সাইজ',
      statValue: '10L/16L/20L',
      highlightsEn: ['16L / 20L Knapsack Math', 'Shatak & Bigha Conversions', 'Total Water Volume Check', 'Tank Count Estimation'],
      highlightsBn: ['১৬L ও ২০L ট্যাংক মিশ্রণ', 'শতক ও বিঘা রূপান্তর', 'মোট পানির সঠিক পরিমাণ', 'প্রয়োজনীয় স্প্রেয়ার সংখ্যা']
    },
    {
      id: 'rotation' as AppTab,
      titleEn: 'MoA Resistance Rotation Planner',
      titleBn: 'MoA ক্রিয়া-কৌশল ঘূর্ণন পরিকল্পনা',
      subtitleEn: 'IRAC, FRAC & HRAC Scientific Spray Schedules',
      subtitleBn: 'IRAC, FRAC ও HRAC বৈজ্ঞানিক স্প্রে ক্রম',
      descEn: 'Stop pest and fungal resistance before it destroys crop yields. Plan rotational spray schedules categorized by IRAC (insecticides), FRAC (fungicides), and HRAC (herbicides). Built-in validation detects consecutive applications of the same mode of action.',
      descBn: 'একই গ্রুপের ওষুধ বারবার ব্যবহারে পোকা ও রোগের প্রতিরোধ ক্ষমতা তৈরি হয়। IRAC, FRAC ও HRAC আন্তর্জাতিক বৈজ্ঞানিক শ্রেণিবিন্যাস অনুযায়ী স্প্রে ক্রম তৈরি করুন। পরপর একই MoA গ্রুপের প্রয়োগ ঘটলে সিস্টেম স্বয়ংক্রিয়ভাবে সতর্কতা প্রদান করে।',
      icon: RotateCw,
      badgeEn: 'IRAC • FRAC • HRAC',
      badgeBn: 'প্রতিরোধ রোধ',
      themeColor: 'from-blue-500 to-blue-700',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      lightGlow: 'hover:shadow-blue-500/10',
      statLabelEn: 'Committees Covered',
      statLabelBn: 'আন্তর্জাতিক কমিটি',
      statValue: 'IRAC/FRAC/HRAC',
      highlightsEn: ['Prevent Pest Resistance', 'Real-time Conflict Detection', 'Crop Lifecycle Windows', 'Action Mechanism Grouping'],
      highlightsBn: ['বালাই প্রতিরোধ ক্ষমতা দমন', 'একই গ্রুপের ব্যবহারে সতর্কতা', 'ফসলের জীবনচক্রভিত্তিক ধাপ', 'সক্রিয় ক্রিয়া-কৌশল গ্রুপ']
    },
    {
      id: 'safety' as AppTab,
      titleEn: 'WHO Hazard Classes & PPE Checklists',
      titleBn: 'নিরাপত্তা, পিপিই ও জরুরি চিকিৎসা',
      subtitleEn: 'WHO Color Bands, Protective Gear & First-Aid',
      subtitleBn: 'WHO কালার ব্যান্ড, সুরক্ষামূলক গিয়ার ও প্রতিষেধক',
      descEn: 'Protect human life and the agricultural ecosystem. Features WHO toxicity color bands (Red, Yellow, Blue, Green), an interactive pre-spray PPE gear checklist, safe chemical mixing instructions, and emergency poisoning first-aid protocols.',
      descBn: 'কৃষক ও স্প্রেয়ার কর্মীদের স্বাস্থ্য সুরক্ষা নিশ্চিত করুন। WHO আন্তর্জাতিক বিপদ কালার ব্যান্ড (লাল, হলুদ, নীল, সবুজ), স্প্রে করার পূর্বে পিপিই সরঞ্জামের ইন্টারেক্টিভ চেকলিস্ট, বিষক্রিয়া প্রতিরোধের নিয়মাবলি এবং জরুরি চিকিৎসার বিস্তারিত প্রোটোকল।',
      icon: ShieldCheck,
      badgeEn: 'WHO Standards',
      badgeBn: 'ডব্লিউএইচও মানদণ্ড',
      themeColor: 'from-amber-500 to-amber-700',
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      lightGlow: 'hover:shadow-amber-500/10',
      statLabelEn: 'Toxicity Bands',
      statLabelBn: 'বিপদ শ্রেণি',
      statValue: 'Ia, Ib, II, III, U',
      highlightsEn: ['WHO Hazard Bands (Ia-U)', 'Pre-Spray PPE Checklist', 'Emergency Poisoning Protocol', 'Safe Disposal Guidance'],
      highlightsBn: ['WHO বিপদ শ্রেণি (Ia-U)', 'স্প্রে-পূর্ব পিপিই চেকলিস্ট', 'জরুরি প্রাথমিক চিকিৎসা', 'নিরাপদ বোতল অপসারণ']
    },
    {
      id: 'guidebook' as AppTab,
      titleEn: 'A5 Field Pocket Guidebook & Mixing Order',
      titleBn: 'মাঠ পকেট বুক গাইড ও W.A.L.E.S. নিয়ম',
      subtitleEn: 'Printable A5 Field Manual & Nozzle Calibration',
      subtitleBn: 'মুদ্রণযোগ্য A5 পকেট বুক ও নোজল ক্যালিব্রেশন',
      descEn: 'Carry the field handbook right in your pocket. Features the golden W.A.L.E.S. rule for safe tank mixing sequences, nozzle spray calibration formulas, crop-by-crop chemical tables, and 1-click printable A5 PDF export for offline field work.',
      descBn: 'মাঠে ইন্টারনেট ছাড়াই ব্যবহার করুন। একাধিক বালাইনাশক সঠিকভাবে মেশানোর বৈজ্ঞানিক W.A.L.E.S. ক্রমানুসার, নোজল ক্যালিব্রেশন পদ্ধতি এবং মাঠপর্যায়ে ব্যবহারের জন্য সরাসরি এক ক্লিকে ডাউনলোডযোগ্য ও মুদ্রণযোগ্য A5 ফিল্ড পকেট বুক (PDF)।',
      icon: BookOpen,
      badgeEn: 'Printable A5 PDF',
      badgeBn: 'মুদ্রণযোগ্য A5 PDF',
      themeColor: 'from-emerald-600 to-green-800',
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      lightGlow: 'hover:shadow-emerald-500/10',
      statLabelEn: 'Offline Access',
      statLabelBn: 'অফলাইন সুবিধা',
      statValue: '100% PWA',
      highlightsEn: ['W.A.L.E.S. Mixing Sequence', 'Nozzle Flow Rate Math', 'Downloadable A5 PDF', 'Compact Field Format'],
      highlightsBn: ['W.A.L.E.S. মিশ্রণের নিয়ম', 'নোজল স্প্রে ক্যালিব্রেশন', 'ডাউনলোডযোগ্য A5 PDF', 'সহজ বহনযোগ্য পকেট সাইজ']
    },
    {
      id: 'alerts' as AppTab,
      titleEn: 'Regulatory Alerts & Seasonal Outbreaks',
      titleBn: 'নিয়ন্ত্রক নোটিশ ও মৌসুমি সতর্কতা',
      subtitleEn: 'Banned Pesticides, Outbreak Warnings & PHI Notices',
      subtitleBn: 'নিষিদ্ধ তালিকা, আক্রমণের পূর্বাভাস ও সতর্কবার্তা',
      descEn: 'Stay legally compliant and environmentally responsible. Real-time updates on seasonal pest outbreaks (e.g. Fall Armyworm, BPH, Late Blight), official lists of banned pesticides in Bangladesh, and pre-harvest safety interval reminders.',
      descBn: 'সরকারি আইন ও পরিবেশগত নিয়ম মেনে চলুন। মৌসুমি বালাই আক্রমণ (যেমন: ধানের মাজরা, কারেন্ট পোকা, আলুর মড়ক রোগ) এর সময়োপযোগী পূর্বাভাস, বাংলাদেশে নিষিদ্ধ বা নিয়ন্ত্রিত বালাইনাশকের হালনাগাদ তালিকা ও ফসল তোলার বিরতি সতর্কতা।',
      icon: Bell,
      badgeEn: 'Compliance & Alerts',
      badgeBn: 'জরুরি সতর্কতা',
      themeColor: 'from-rose-500 to-rose-700',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      lightGlow: 'hover:shadow-rose-500/10',
      statLabelEn: 'Regulatory Status',
      statLabelBn: 'নিয়ন্ত্রক তথ্য',
      statValue: 'DAE / MoA',
      highlightsEn: ['Seasonal Outbreak Alerts', 'Banned Pesticide Warnings', 'Pre-Harvest Notifications', 'Compliance Check'],
      highlightsBn: ['মৌসুমি বালাই পূর্বাভাস', 'নিষিদ্ধ বালাইনাশক তালিকা', 'ফসল কাটার বিরতি নোটিশ', 'আইনগত নির্দেশনা']
    }
  ];

  const currentPreview = features[activePreviewFeature];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION: Summary of Each Feature with Visual Animations */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/60 shadow-xl">
        {/* Subtle decorative background light blurs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Announcement Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-between gap-3 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 backdrop-blur-md text-emerald-200 text-xs font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {language === 'bn' 
                  ? 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE) রেফারেন্স ভিত্তিক পূর্ণাঙ্গ প্ল্যাটফর্ম' 
                  : 'DAE Official Reference & Scientific Resistance Suite'}
              </span>
            </div>

            {/* In-Hero Share Quick Trigger */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/40 text-xs font-semibold backdrop-blur-md shadow-xs transition cursor-pointer"
              title={language === 'bn' ? 'প্ল্যাটফর্মটি সহকর্মী ও কৃষকদের সাথে শেয়ার করুন' : 'Share platform with fellow agronomists'}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share Platform'}</span>
              <span className="bg-emerald-800 px-1.5 py-0.2 rounded text-[10px] text-emerald-200 font-bold">1-Click</span>
            </motion.button>
          </motion.div>

          {/* Main Hero Header & Call to Action */}
          <div className="max-w-4xl space-y-5">
            <motion.h1 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
            >
              {language === 'bn' ? (
                <>
                  আধুনিক ফসলের <span className="text-emerald-400">বালাই ব্যবস্থাপনা</span> ও নির্ভুল <span className="text-teal-300">রাসায়নিক মাত্রা</span> সহায়িকা
                </>
              ) : (
                <>
                  Precision Agricultural <span className="text-emerald-400">Chemical Guide</span> & Field <span className="text-teal-300">Crop Protection</span>
                </>
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-3xl"
            >
              {language === 'bn' ? (
                'মাঠপর্যায়ে সঠিক বালাইনাশক নির্বাচন, ন্যাপস্যাক স্প্রেয়ারের নির্ভুল ট্যাংক মিশ্রণ, পোকা ও ছত্রাকের প্রতিরোধ ক্ষমতা ভাঙতে বৈজ্ঞানিক MoA আবর্তন, WHO নিরাপত্তা এবং অফলাইন পকেট বুক গাইডের সমন্বিত ডিজিটাল সিস্টেম।'
              ) : (
                'Streamline field chemical selection, calculate accurate 16L knapsack sprayer tank mixes, eliminate chemical resistance with IRAC/FRAC MoA rotations, enforce WHO safety standards, and carry an offline field manual.'
              )}
            </motion.p>

            {/* Action Buttons Row */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <button
                id="hero-cta-database"
                onClick={() => onNavigateTab('database')}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm transition shadow-lg shadow-emerald-900/40 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>{language === 'bn' ? 'রাসায়নিক ডাটাবেস ব্রাউজ করুন' : 'Explore Chemical Database'}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                id="hero-cta-calculator"
                onClick={() => onNavigateTab('calculator')}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/90 border border-emerald-600/50 text-white font-semibold text-sm backdrop-blur-md transition shadow-sm cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-teal-300" />
                <span>{language === 'bn' ? 'ট্যাংক মাত্রা ক্যালকুলেটর' : 'Launch Tank Calculator'}</span>
              </button>

              <button
                id="hero-cta-share"
                onClick={onOpenShareModal}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-emerald-200 hover:text-white font-semibold text-sm backdrop-blur-md transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'অ্যাপটি শেয়ার করুন' : 'Share with Others'}</span>
              </button>

              <button
                id="hero-cta-guidebook"
                onClick={() => onNavigateTab('guidebook')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-emerald-300 hover:text-white font-medium text-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'bn' ? 'A5 পকেট বুক গাইড' : 'A5 Pocket Book'}</span>
              </button>
            </motion.div>
          </div>

          {/* Quick Stats Banner Inside Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 mt-10 border-t border-emerald-800/60"
          >
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400">
                {formatNum(totalProductsCount)}+
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {language === 'bn' ? 'DAE নিবন্ধিত ফর্মুলেশন' : 'DAE Approved Chemicals'}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
              <span className="block text-2xl sm:text-3xl font-black text-teal-300">
                {formatNum(16)}L / {formatNum(20)}L
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {language === 'bn' ? 'ন্যাপস্যাক ট্যাংক ক্যালিব্রেশন' : 'Knapsack Sprayer Tank Math'}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400">
                ১০০%
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {language === 'bn' ? 'অফলাইন ফিল্ড প্রস্তুতি (PWA)' : 'Offline Ready (PWA)'}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
              <span className="block text-2xl sm:text-3xl font-black text-amber-400">
                ৩টি
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {language === 'bn' ? 'IRAC / FRAC / HRAC মানদণ্ড' : 'Scientific MoA Standards'}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE FEATURES SUMMARY GRID (Animated Cards with Icons & Direct Navigation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
            {language === 'bn' ? '৬টি মূল ফিচার ও সমাধান' : 'Core Features & Capabilities'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {language === 'bn' ? 'ফসলের সুরক্ষায় প্রতিটি ফিচারের তাৎক্ষণিক সারসংক্ষেপ' : 'Complete Summary of Every Core Feature'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-1">
            {language === 'bn' 
              ? 'নিচে প্রতিটি ফিচারের সংক্ষিপ্ত বিবরণ দেওয়া হলো। প্রয়োজনীয় যেকোনো টুলে সরাসরি প্রবেশ করতে কার্ডটিতে ক্লিক করুন।' 
              : 'Explore each specialized tool designed to elevate farming safety, field precision, and crop protection.'}
          </p>
        </div>

        {/* 6 Feature Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => onNavigateTab(feature.id)}
                className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Top colored accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.themeColor}`}></div>

                <div>
                  {/* Card Header with Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} ${feature.borderColor} border flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs`}>
                      <Icon className={`w-6 h-6 ${feature.textColor}`} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${feature.bgColor} ${feature.textColor} border ${feature.borderColor}`}>
                      {language === 'bn' ? feature.badgeBn : feature.badgeEn}
                    </span>
                  </div>

                  {/* Feature Title & Subtitle */}
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {language === 'bn' ? feature.titleBn : feature.titleEn}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-800/80 mb-3 mt-0.5">
                    {language === 'bn' ? feature.subtitleBn : feature.subtitleEn}
                  </p>

                  {/* Feature Comprehensive Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'bn' ? feature.descBn : feature.descEn}
                  </p>

                  {/* Feature Highlights Pills */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {(language === 'bn' ? feature.highlightsBn : feature.highlightsEn).map((pill, pIdx) => (
                      <span 
                        key={pIdx}
                        className="text-[10px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80"
                      >
                        ✓ {pill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Direct Navigation Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    <span>{language === 'bn' ? feature.statLabelBn : feature.statLabelEn}: </span>
                    <span className="font-bold text-slate-800">{feature.statValue}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${feature.textColor} group-hover:translate-x-1 transition-transform`}>
                    <span>{language === 'bn' ? 'ব্যবহার করুন' : 'Launch Tool'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. INTERACTIVE FEATURE DEEP-DIVE PREVIEWER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            {/* Left Column: Interactive Tab Selectors */}
            <div className="w-full lg:w-5/12 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ইন্টারেক্টিভ ফিচার নেভিগেটর' : 'Interactive Feature Inspector'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {language === 'bn' ? 'প্রতিটি ফিচারের বাস্তব কার্যক্রম দেখুন' : 'Explore Feature Workflows in Action'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn' 
                  ? 'যেকোনো ফিচারের উপর ক্লিক করে তার লাইভ ড্যাশবোর্ড ও নমুনা কার্যক্রম পর্যালোচনা করুন।' 
                  : 'Select any feature tab to view its field workflow, key inputs, and how it solves crop protection challenges.'}
              </p>

              {/* Feature Tab Buttons */}
              <div className="space-y-2 pt-2">
                {features.map((item, fIdx) => {
                  const Icon = item.icon;
                  const isSelected = activePreviewFeature === fIdx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePreviewFeature(fIdx)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-950' : 'text-emerald-400'}`} />
                        <span>{language === 'bn' ? item.titleBn : item.titleEn}</span>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Feature Showcase Preview Card */}
            <div className="w-full lg:w-7/12">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <currentPreview.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">
                        {language === 'bn' ? currentPreview.titleBn : currentPreview.titleEn}
                      </h4>
                      <p className="text-xs text-emerald-400 font-medium">
                        {language === 'bn' ? currentPreview.subtitleBn : currentPreview.subtitleEn}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-900 text-emerald-300 px-2.5 py-1 rounded-md border border-slate-700">
                    {currentPreview.statValue}
                  </span>
                </div>

                {/* Body details */}
                <div className="py-4 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'bn' ? currentPreview.descBn : currentPreview.descEn}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    {(language === 'bn' ? currentPreview.highlightsBn : currentPreview.highlightsEn).map((hl, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs text-slate-200 font-medium">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Card Actions */}
                <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
                  <button
                    onClick={onOpenShareModal}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer font-medium"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'bn' ? 'এই ফিচার শেয়ার করুন' : 'Share Feature'}</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab(currentPreview.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs transition shadow-sm cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সরাসরি টুলটিতে প্রবেশ করুন' : 'Launch Feature Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUICK POPULAR CROPS SHORTCUTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                {language === 'bn' ? 'জনপ্রিয় ফসলের বালাইনাশক এক ক্লিকে খুঁজুন' : 'Quick Crop Pesticide Search'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'bn' 
                  ? 'যেকোনো ফসলে ক্লিক করলে সরাসরি ডাটাবেসে ফিল্টার হয়ে যাবে' 
                  : 'Click on any crop to jump directly into the pre-filtered chemical database'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('database')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সকল ফসল দেখুন' : 'View All Crops'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {popularCrops.map((crop) => (
              <button
                key={crop.en}
                onClick={() => onSelectCropFilter(crop.en)}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/60 transition group cursor-pointer text-left"
              >
                <div>
                  <span className="block font-bold text-xs text-slate-800 group-hover:text-emerald-900">
                    {language === 'bn' ? crop.bn : crop.en}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {formatNum(crop.count)} {language === 'bn' ? 'টি সমাধান' : 'solutions'}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SHARE BANNER & SOCIAL ENGAGEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-emerald-700">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-700/60 px-2.5 py-0.5 rounded-full inline-block">
              {language === 'bn' ? 'কৃষক ভাই ও কর্মকর্তাদের জন্য' : 'For Farmers, Officers & Dealers'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {language === 'bn' 
                ? 'এগ্রিকেম প্রো শেয়ার করে নিরাপদ ও বিষমুক্ত কৃষিতে অবদান রাখুন' 
                : 'Share AgriChem Pro & Promote Safe Chemical Stewardship'}
            </h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              {language === 'bn'
                ? 'হোয়াটসঅ্যাপ, ফেসবুক ও টেলিগ্রামের মাধ্যমে আপনার পরিচিত কৃষক ভাই, উপসহকারী কৃষি কর্মকর্তা (SAAO) এবং বালাইনাশক ডিলারদের মাঝে ছড়িয়ে দিন।'
                : 'Share via WhatsApp, Facebook, or direct link with farmers, sub-assistant agriculture officers, and input dealers across Bangladesh.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>{language === 'bn' ? 'এখনই শেয়ার করুন' : 'Share Now'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('guidebook')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm border border-emerald-500/50 shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'পকেট গাইড' : 'Pocket Guide'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
