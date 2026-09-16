import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle, 
  Send, 
  Sparkles,
  Database,
  Calculator,
  RotateCw,
  ShieldCheck,
  BookOpen,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { AppTab } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AppTab;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'home'
}) => {
  const { language } = useLanguage();
  const [selectedTarget, setSelectedTarget] = useState<AppTab>(defaultTab);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agrichem-pro.live';
  
  // Build target-specific link & text
  const shareTargetInfo: Record<AppTab, {
    titleEn: string;
    titleBn: string;
    descEn: string;
    descBn: string;
    tag: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = {
    home: {
      titleEn: 'AgriChem Pro — Smart Crop Chemical & Pest Management Suite',
      titleBn: 'এগ্রিকেম প্রো — আধুনিক বালাইনাশক ও বালাই ব্যবস্থাপনা প্ল্যাটফর্ম',
      descEn: 'DAE-registered 70+ pesticides, knapsack sprayer tank calculator, MoA rotation planner, WHO safety protocols & offline field manual.',
      descBn: 'বাংলাদেশে মাঠ ফসলের জন্য ডিএই নিবন্ধিত ৭০+ বালাইনাশক ডাটাবেস, স্প্রেয়ার ট্যাংক ক্যালকুলেটর, প্রতিরোধ রোধে MoA রোটেশন ও পকেট বুক।',
      tag: '#AgriChem #BangladeshFarming #CropProtection',
      icon: Sparkles
    },
    database: {
      titleEn: 'AgriChem Pro — DAE Chemical & Pesticide Catalog',
      titleBn: 'এগ্রিকেম প্রো — অনুমোদিত বালাইনাশক ডাটাবেস',
      descEn: 'Search 70+ approved active ingredients, trade names, approved crops, and mode-of-action codes.',
      descBn: 'ফসল, বালাই, ট্রেড নাম ও MoA কোড দিয়ে ডিএই নিবন্ধিত ৭০+ বালাইনাশকের অনুমোদন তালিকা দেখুন।',
      tag: '#PesticideDatabase #DAE #AgriTech',
      icon: Database
    },
    calculator: {
      titleEn: 'AgriChem Pro — Knapsack Sprayer Dosage & Tank Mix Calculator',
      titleBn: 'এগ্রিকেম প্রো — মাঠপর্যায়ের মাত্রা ও ট্যাংক মিক্সিং ক্যালকুলেটর',
      descEn: 'Accurately calculate active chemical doses, water volume, and 16L knapsack sprayer tanks per Bigha/Decimal.',
      descBn: 'ন্যাপস্যাক স্প্রেয়ারের ট্যাংক সংখ্যা, বিঘা/শতক জমির নির্ভুল বালাইনাশক ও পানির অনুপাত হিসাব করুন।',
      tag: '#DosageCalculator #KnapsackSprayer #SmartAgriculture',
      icon: Calculator
    },
    rotation: {
      titleEn: 'AgriChem Pro — IRAC / FRAC MoA Resistance Rotation Planner',
      titleBn: 'এগ্রিকেম প্রো — MoA প্রতিরোধ ঘূর্ণন পরিকল্পনা',
      descEn: 'Build resistance-breaking spray sequences with IRAC, FRAC, and HRAC mode-of-action codes.',
      descBn: 'কীট ও রোগের প্রতিরোধ ক্ষমতা ভাঙতে বৈজ্ঞানিক MoA কোড অনুযায়ী স্প্রে আবর্তন তৈরি করুন।',
      tag: '#MoARotation #IRAC #FRAC #PestResistance',
      icon: RotateCw
    },
    safety: {
      titleEn: 'AgriChem Pro — WHO Hazard Classes & PPE Checklists',
      titleBn: 'এগ্রিকেম প্রো — নিরাপত্তা ও পিপিই প্রোটোকল',
      descEn: 'WHO chemical hazard color bands, pre-spray PPE checklists, and emergency first-aid protocols.',
      descBn: 'ডব্লিউএইচও বিপদ শ্রেণি, স্প্রে-পূর্ব পিপিই সরঞ্জাম চেকলিস্ট ও বিষক্রিয়ার জরুরি প্রাথমিক চিকিৎসা।',
      tag: '#FarmerSafety #PPE #SafePesticides',
      icon: ShieldCheck
    },
    guidebook: {
      titleEn: 'AgriChem Pro — A5 Field Pocket Guidebook & Mixing Manual',
      titleBn: 'এগ্রিকেম প্রো — ফিল্ড পকেট বুক গাইড ও ডব্লিউ.এ.এল.ই.এস.',
      descEn: 'Download printable A5 pocket manual with W.A.L.E.S. mixing order, sprayer calibration, and crop schedules.',
      descBn: 'মুদ্রণযোগ্য A5 পকেট বুক ডাউনলোড করুন: W.A.L.E.S. মিশ্রণের নিয়ম, নোজল ক্যালিব্রেশন ও PHI তালিকা।',
      tag: '#FieldManual #AgriGuidebook #FarmersHandbook',
      icon: BookOpen
    },
    alerts: {
      titleEn: 'AgriChem Pro — Pest Alerts & Regulatory Notices',
      titleBn: 'এগ্রিকেম প্রো — নিয়ন্ত্রক ও মৌসুমি সতর্কবার্তা',
      descEn: 'Real-time seasonal pest outbreak notices, restricted-use bans, and harvest interval alerts.',
      descBn: 'মৌসুমি বালাই আক্রমণ সতর্কতা ও সরকারি নিয়ন্ত্রক নোটিশ।',
      tag: '#PestAlerts #AgricultureNotices',
      icon: Sparkles
    }
  };

  const currentInfo = shareTargetInfo[selectedTarget] || shareTargetInfo.home;
  const currentTitle = language === 'bn' ? currentInfo.titleBn : currentInfo.titleEn;
  const currentDesc = language === 'bn' ? currentInfo.descBn : currentInfo.descEn;
  
  // URL with hash or param
  const shareUrl = selectedTarget === 'home' 
    ? origin 
    : `${origin}/#${selectedTarget}`;

  const fullShareText = `${currentTitle}\n\n${currentDesc}\n\n🔗 ${shareUrl}\n\n${currentInfo.tag}`;

  // Native share handler
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTitle,
          text: `${currentTitle} - ${currentDesc}`,
          url: shareUrl
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Social Share links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const messengerUrl = `https://www.facebook.com/dialog/send?app_id=291494419162&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentTitle + ' — ' + currentDesc)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent('AgriChem,SmartFarming,DAE')}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(currentTitle + '\n' + currentDesc)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-emerald-200">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {language === 'bn' ? 'এগ্রিকেম প্রো শেয়ার করুন' : 'Share AgriChem Pro'}
              </h3>
              <p className="text-xs text-emerald-200">
                {language === 'bn' 
                  ? 'কৃষক, উপসহকারী কর্মকর্তা ও ডিলারদের কাছে প্ল্যাটফর্মটি পৌঁছে দিন' 
                  : 'Empower farmers, agronomists, and field officers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Target Section Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {language === 'bn' ? 'কোন বিষয়টি শেয়ার করতে চান নির্বাচন করুন:' : 'Select what you want to share:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['home', 'database', 'calculator', 'rotation', 'safety', 'guidebook'] as AppTab[]).map((tab) => {
                const isSelected = selectedTarget === tab;
                const Icon = shareTargetInfo[tab].icon;
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedTarget(tab)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <span className="truncate">
                      {tab === 'home' ? (language === 'bn' ? 'পুরো প্ল্যাটফর্ম' : 'Full Suite') :
                       tab === 'database' ? (language === 'bn' ? 'ডাটাবেস' : 'Database') :
                       tab === 'calculator' ? (language === 'bn' ? 'ক্যালকুলেটর' : 'Calculator') :
                       tab === 'rotation' ? (language === 'bn' ? 'MoA ঘূর্ণন' : 'Rotation') :
                       tab === 'safety' ? (language === 'bn' ? 'নিরাপত্তা ও পিপিই' : 'Safety') :
                       (language === 'bn' ? 'পকেট বুক' : 'Guidebook')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Preview Snippet Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>{language === 'bn' ? 'সোশ্যাল মিডিয়া প্রিভিউ কেমন দেখাবে:' : 'Social Link Preview Card:'}</span>
              <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                OpenGraph 1200x630 (og-bn)
              </span>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs space-y-0">
              <div className="w-full aspect-[1.91/1] bg-slate-100 relative border-b border-slate-100 overflow-hidden">
                <img
                  src="/icons/og-bn.svg"
                  alt="AgriChem Pro OG Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {currentTitle}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {currentDesc}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-mono mt-1 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {shareUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click Social Sharing Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {language === 'bn' ? '১-ক্লিকে সোশ্যাল মিডিয়ায় শেয়ার করুন:' : '1-Click Quick Social Sharing:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-semibold text-[11px] sm:text-xs transition shadow-2xs text-center"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-semibold text-[11px] sm:text-xs transition shadow-2xs text-center"
              >
                <span className="font-bold text-sm sm:text-base leading-none">f</span>
                <span>Facebook</span>
              </a>

              {/* Messenger */}
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl bg-[#006AFF]/10 hover:bg-[#006AFF]/20 border border-[#006AFF]/30 text-[#006AFF] font-semibold text-[11px] sm:text-xs transition shadow-2xs text-center"
              >
                <svg className="w-4 h-4 shrink-0 text-[#006AFF]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.14 2 11.25c0 2.91 1.45 5.51 3.7 7.21V22l3.39-1.85c.91.25 1.89.39 2.91.39 5.5 0 10-4.14 10-9.25S17.5 2 12 2zm1.19 12.06L10.7 11.5l-4.12 2.81 4.51-4.78 2.5 2.56 4.12-2.81-4.52 4.78z" />
                </svg>
                <span>Messenger</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl bg-slate-900/10 hover:bg-slate-900/20 border border-slate-300 text-slate-900 font-semibold text-[11px] sm:text-xs transition shadow-2xs text-center"
              >
                <span className="font-bold text-xs leading-none">𝕏</span>
                <span>Twitter / X</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#0088cc] font-semibold text-[11px] sm:text-xs transition shadow-2xs text-center"
              >
                <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          {/* Copy Link Row & Native Share */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                  copied 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি লিংক' : 'Copy Link')}</span>
              </button>
            </div>

            {/* Quick Action Buttons: Native Share & QR toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 p-1 rounded-md transition cursor-pointer font-medium"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>{showQR ? (language === 'bn' ? 'QR কোড লুকান' : 'Hide QR') : (language === 'bn' ? 'মোবাইলে স্ক্যান করতে QR কোড' : 'Show Mobile QR Code')}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1.5 p-1 rounded-md transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মোবাইল শেয়ার উইন্ডো' : 'Native Share Sheet'}</span>
                </button>
              )}
            </div>

            {/* QR Code Visual Box */}
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 mt-2">
                    <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-xs border border-emerald-300 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                        alt="AgriChem Pro QR Code"
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 max-w-xs">
                      {language === 'bn' 
                        ? 'মাঠপর্যায়ে অন্য কৃষকের স্মার্টফোনের ক্যামেরা দিয়ে স্ক্যান করলেই সরাসরি অ্যাপটি খুলে যাবে।' 
                        : 'Scan with any smartphone camera in the field to open this tool instantly.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {language === 'bn' ? 'নিরাপদ কৃষি ও ফসলের সুরক্ষা' : 'Safe Agriculture & Sustainable Farming'}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
