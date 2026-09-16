import React, { useState } from 'react';
import { ChemicalProduct } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  HeartHandshake, 
  Trash2, 
  Fish, 
  Flower2, 
  Droplet,
  FileDown
} from 'lucide-react';
import { exportSingleProductPDF } from '../utils/pdfExport';
import { useLanguage } from '../context/LanguageContext';

interface SafetyChecklistModalProps {
  product: ChemicalProduct | null;
  onClose: () => void;
}

export const SafetyChecklistModal: React.FC<SafetyChecklistModalProps> = ({
  product,
  onClose
}) => {
  const { language, formatNum } = useLanguage();
  if (!product) return null;

  // Interactive Checklist states
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getToxicityBand = (tox?: string) => {
    if (!tox) return { 
      label: language === 'bn' ? 'WHO ক্লাস II (মাঝারি ঝুঁকিপূর্ণ)' : 'WHO Class II (Moderately Hazardous)', 
      color: 'bg-yellow-500 text-yellow-950', 
      symbol: language === 'bn' ? 'সতর্কতা' : 'Warning' 
    };
    if (tox.includes('Ia') || tox.includes('Ib')) return { 
      label: language === 'bn' ? 'WHO ক্লাস I (চরম / উচ্চ ঝুঁকিপূর্ণ)' : 'WHO Class I (Extremely / Highly Hazardous)', 
      color: 'bg-red-600 text-white', 
      symbol: language === 'bn' ? 'বিপদ / বিষ' : 'DANGER / POISON' 
    };
    if (tox.includes('II')) return { 
      label: language === 'bn' ? 'WHO ক্লাস II (মাঝারি ঝুঁকিপূর্ণ)' : 'WHO Class II (Moderately Hazardous)', 
      color: 'bg-amber-400 text-slate-950', 
      symbol: language === 'bn' ? 'সতর্কতা' : 'WARNING' 
    };
    if (tox.includes('III')) return { 
      label: language === 'bn' ? 'WHO ক্লাস III (সামান্য ঝুঁকিপূর্ণ)' : 'WHO Class III (Slightly Hazardous)', 
      color: 'bg-blue-500 text-white', 
      symbol: language === 'bn' ? 'সাবধানতা' : 'CAUTION' 
    };
    return { 
      label: language === 'bn' ? 'WHO ক্লাস U (ঝুঁকি কম)' : 'WHO Class U (Unlikely to Present Hazard)', 
      color: 'bg-emerald-500 text-white', 
      symbol: language === 'bn' ? 'সাবধানতা' : 'CAUTION' 
    };
  };

  const band = getToxicityBand(product.toxicityClass);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="safety-checklist-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-amber-800 text-white flex items-center justify-between border-b border-amber-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-none">
                {language === 'bn' ? 'নিরাপত্তা সতর্কতা ও পিপিই (PPE) চেকলিস্ট' : 'Safety Precaution & PPE Checklist'}
              </h2>
              <p className="text-xs text-amber-200 mt-1">
                {product.tradeName} ({product.commonName})
              </p>
            </div>
          </div>
          <button
            id="close-safety-modal-btn"
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-amber-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* WHO Hazard Classification Band */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'bn' ? 'WHO বিষাক্ততা শ্রেণিবিভাগ' : 'WHO Toxicity Classification'}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${band.color}`}>
                {band.symbol}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {product.toxicityClass || band.label}
            </p>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'রেজিস্ট্রেশন কোড:' : 'Official registration code:'}{' '}
              <span className="font-mono text-slate-700 font-medium">{product.registrationNo}</span> |{' '}
              {language === 'bn' ? 'নিবন্ধনকারী:' : 'Holder:'} {product.registrationHolder}
            </p>
          </div>

          {/* Pre-Harvest & Re-Entry Intervals */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                {language === 'bn' ? 'ফসল তোলার বিরতি (PHI)' : 'Pre-Harvest Interval (PHI)'}
              </span>
              <span className="text-xl font-black text-emerald-950 mt-1 block">
                {formatNum(product.phiDays || 14)} {language === 'bn' ? 'দিন' : 'Days'}
              </span>
              <span className="text-[11px] text-emerald-700">
                {language === 'bn' ? 'ফসল কাটার পূর্ববর্তী সর্বনিম্ন অপেক্ষমাণ সময়' : 'Minimum waiting period before food harvest'}
              </span>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                {language === 'bn' ? 'জমিতে পুনঃপ্রবেশ বিরতি (REI)' : 'Restricted Entry Interval (REI)'}
              </span>
              <span className="text-xl font-black text-blue-950 mt-1 block">
                {formatNum(product.reiHours || 24)} {language === 'bn' ? 'ঘণ্টা' : 'Hours'}
              </span>
              <span className="text-[11px] text-blue-700">
                {language === 'bn' ? 'স্প্রে করার পর শ্রমিক ও শিশুদের প্রবেশের নিষেধাজ্ঞা' : 'Keep workers & children out of treated field'}
              </span>
            </div>
          </div>

          {/* Mandatory PPE Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>{language === 'bn' ? 'বাধ্যতামূলক ব্যক্তিগত সুরক্ষা সরঞ্জাম (PPE)' : 'Mandatory Personal Protective Equipment (PPE)'}</span>
              <span className="text-[11px] font-normal text-slate-500">
                {language === 'bn' ? 'স্প্রে করার পূর্বে টিক দিন' : 'Tick before spraying'}
              </span>
            </h4>

            <div className="space-y-2">
              {[
                { 
                  id: 'gloves', 
                  label: language === 'bn' 
                    ? 'ভারী নাইট্রিল বা নিওপ্রিন রাসায়নিক প্রতিরোধী দস্তানা (কাপড় বা চামড়া নিষিদ্ধ)' 
                    : 'Heavy-duty nitrile or unlined neoprene chemical gloves (NO fabric/leather)' 
                },
                { 
                  id: 'respirator', 
                  label: language === 'bn'
                    ? 'জৈব বাষ্প ফিল্টারযুক্ত রেসপিরেটর বা পরিষ্কার N95 মাস্ক'
                    : 'Organic vapor respirator with particulate filter cartridge (or clean N95 mask)' 
                },
                { 
                  id: 'goggles', 
                  label: language === 'bn'
                    ? 'রাসায়নিক স্প্ল্যাশ-প্রুফ সেফটি গগলস (সাধারণ চশমা গ্রহণযোগ্য নয়)'
                    : 'Chemical splash-proof safety goggles (not everyday eyeglasses)' 
                },
                { 
                  id: 'boots', 
                  label: language === 'bn'
                    ? 'লাইনিং ছাড়া রাবারের গামবুট (প্যান্টের পায়জামা অবশ্যই বুটের বাইরে থাকবে)'
                    : 'Unlined rubber gumboots (trousers worn OUTSIDE boot cuffs)' 
                },
                { 
                  id: 'clothing', 
                  label: language === 'bn'
                    ? 'ফুলহাতা শার্ট, লম্বা প্যান্ট এবং পানি-প্রতিরোধী কেমিক্যাল অ্যাপ্রন'
                    : 'Long-sleeved shirt, long pants, and water-repellent chemical apron' 
                },
                { 
                  id: 'wind', 
                  label: language === 'bn'
                    ? 'বাতাসের দিক নিশ্চিত করা — কখনো বাতাসের বিপরীতে বা ১০ কিমি/ঘণ্টার বেশি বেগে স্প্রে করবেন না'
                    : 'Checked wind direction — never spray against wind or in velocity > 10 km/h' 
                }
              ].map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                      isChecked ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs font-medium leading-relaxed">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environmental Hazards */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
            <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {language === 'bn' ? 'পরিবেশগত সুরক্ষা ও জীববৈচিত্র্য সংরক্ষণ' : 'Environmental Safety & Biodiversity Protection'}
            </h4>
            <div className="space-y-2 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <Flower2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'bn' ? 'মৌমাছি ও পরাগায়নকারী কীট সংরক্ষণ: ' : 'Honeybee & Pollinator Protection: '}</strong> 
                  {product.commonName.includes('Cypermethrin') || product.commonName.includes('Imidacloprid') || product.commonName.includes('Chlorpyrifos')
                    ? (language === 'bn' ? 'মৌমাছির জন্য অত্যন্ত বিষাক্ত! ফুল ফোটার সময় প্রয়োগ নিষিদ্ধ। কেবল শেষ বিকেলে প্রয়োগ করুন যখন মৌমাছির চলাচল বন্ধ থাকে।' : 'Extremely toxic to bees! Never spray during flowering hours. Apply only in late evening when bees have ceased foraging.')
                    : (language === 'bn' ? 'পরাগায়নকারী পতঙ্গের চলাচলের সময় সরাসরি খোলা ফুলের উপর স্প্রে করবেন না।' : 'Do not spray directly onto active flower blossoms visited by pollinators.')}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Fish className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'bn' ? 'জলজ জীব ও মাছের নিরাপত্তা: ' : 'Aquatic Life: '}</strong>
                  {language === 'bn' 
                    ? 'খাল, বিল, পুকুর ও মাছের ঘের থেকে অন্তত ১৫ মিটার দূরত্বের বাফার জোন বজায় রাখুন। প্রাকৃতিক জলাশয়ে স্প্রেয়ার পরিষ্কার করবেন না।' 
                    : 'Maintain a strict 15-meter untreated buffer strip from canals, ponds, and fish enclosures. Do not wash spraying equipment in natural waterways.'}
                </span>
              </div>
            </div>
          </div>

          {/* First Aid & Disposal Protocol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                {language === 'bn' ? 'জরুরি প্রাথমিক চিকিৎসা' : 'First Aid Measures'}
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed text-[11px]">
                <li>
                  <strong>{language === 'bn' ? 'ত্বক:' : 'Skin:'}</strong>{' '}
                  {language === 'bn' ? 'তাৎক্ষণিকভাবে প্রচুর সাবান ও ঠান্ডা পানি দিয়ে ১৫ মিনিট ধৌত করুন।' : 'Wash immediately with cold water and soap for 15 minutes.'}
                </li>
                <li>
                  <strong>{language === 'bn' ? 'চোখ:' : 'Eyes:'}</strong>{' '}
                  {language === 'bn' ? 'চোখের পাতা খুলে মৃদু বহমান পানিতে অন্তত ১৫ মিনিট চোখ পরিষ্কার করুন।' : 'Flush open eyes under gentle running water for 15 minutes.'}
                </li>
                <li>
                  <strong>{language === 'bn' ? 'শ্বাসগ্রহণ:' : 'Inhalation:'}</strong>{' '}
                  {language === 'bn' ? 'রোগীকে দ্রুত খোলা বাতাসে নিয়ে আসুন এবং গলার আঁটসাঁট পোশাক ঢিলে করে দিন।' : 'Move patient to fresh open air and loosen tight clothing.'}
                </li>
                <li>
                  <strong>{language === 'bn' ? 'প্রতিষেধক (Antidote):' : 'Antidote:'}</strong>{' '}
                  {product.type === 'Insecticide' && product.moaGroup?.includes('Organophosphate') 
                    ? (language === 'bn' ? 'অ্যাট্রোপিন সালফেট নির্দিষ্ট প্রতিষেধক।' : 'Atropine Sulfate is specific antidote.') 
                    : (language === 'bn' ? 'লক্ষণভিত্তিক চিকিৎসাসেবা দিন।' : 'Symptomatic medical treatment.')}
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-slate-600" />
                {language === 'bn' ? 'খালি বোতল ও প্যাকেট ব্যবস্থাপনা' : 'Empty Container Disposal'}
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed text-[11px]">
                <li>{language === 'bn' ? 'খালি পাত্র ৩ বার পানি দিয়ে ধুয়ে স্প্রে ট্যাংকে ঢালুন।' : 'Perform triple-rinsing immediately into the spray tank.'}</li>
                <li>{language === 'bn' ? 'প্লাস্টিক বোতল ছিদ্র করে অকেজো করে দিন।' : 'Puncture the bottom of empty plastic bottles or drums.'}</li>
                <li>{language === 'bn' ? 'খালি পাত্রে কখনো পানি, তেল বা খাদ্যসামগ্রী রাখবেন না।' : 'NEVER reuse pesticide containers for storing water, oil, or food.'}</li>
                <li>{language === 'bn' ? 'নির্দিষ্ট কৃষি বর্জ্য স্থানে মাটিতে পুঁতে ফেলুন।' : 'Bury or dispose of in designated hazardous agricultural waste bins.'}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => exportSingleProductPDF(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'নিরাপত্তা শিট ডাউনলোড (PDF)' : 'Download Field Safety Sheet (PDF)'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-semibold text-xs transition cursor-pointer"
          >
            {language === 'bn' ? 'সম্মত হয়ে বন্ধ করুন' : 'Acknowledge & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
