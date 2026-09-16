import React, { useState } from 'react';
import { ChemicalProduct } from '../types';
import { 
  X, 
  FileDown, 
  Calculator, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Sprout, 
  Bug, 
  Building2, 
  RotateCw, 
  CheckCircle2, 
  AlertOctagon,
  Droplet
} from 'lucide-react';
import { exportSingleProductPDF, exportDosagePrescriptionPDF } from '../utils/pdfExport';
import { calculateDosage } from '../utils/calculator';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailModalProps {
  product: ChemicalProduct | null;
  onClose: () => void;
  onOpenDosageCalculator: (product: ChemicalProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenDosageCalculator
}) => {
  const { language, t, transCrop, transCat, transRisk, formatNum } = useLanguage();

  if (!product) return null;

  // Mini quick calculator state inside modal
  const [areaVal, setAreaVal] = useState<number>(1);
  const [areaUnit, setAreaUnit] = useState<'bigha' | 'acre' | 'hectare'>('bigha');
  const [tankSize, setTankSize] = useState<number>(16);

  const quickDosage = calculateDosage(product, {
    areaValue: areaVal,
    areaUnit: areaUnit,
    tankVolumeL: tankSize,
    sprayVolumePerHaL: product.waterVolumeLPerHa || 500
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="product-detail-modal"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                {transCat(product.type)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {language === 'bn' ? 'রেজিস্ট্রেশন:' : 'Reg:'} {product.registrationNo}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white tracking-tight">
              {product.tradeName}
            </h2>
            <p className="text-sm text-emerald-400 font-medium">
              {product.commonName}
            </p>
          </div>
          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                {language === 'bn' ? 'অনুমোদিত মাত্রা' : 'Dosage Rate'}
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{product.dosageRate}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                {language === 'bn' ? 'ক্রিয়া কোড (MoA)' : 'MoA Code'}
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{product.moaCode || 'Standard'}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                {language === 'bn' ? 'তোলার ব্যবধান (PHI)' : 'Pre-Harvest (PHI)'}
              </span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                {product.phiDays 
                  ? (language === 'bn' ? `${formatNum(product.phiDays)} দিন` : `${product.phiDays} Days`)
                  : (language === 'bn' ? 'লেবেল অনুযায়ী' : 'Per Label')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                {language === 'bn' ? 'প্রবেশের ব্যবধান (REI)' : 'Re-Entry (REI)'}
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {product.reiHours 
                  ? (language === 'bn' ? `${formatNum(product.reiHours)} ঘণ্টা` : `${product.reiHours} Hours`)
                  : (language === 'bn' ? '২৪ ঘণ্টা' : '24 Hours')}
              </span>
            </div>
          </div>

          {/* Registration & Manufacturer Info */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
              <Building2 className="w-4 h-4 text-slate-600" />
              {language === 'bn' ? 'নিবন্ধন ও অনুমোদন তথ্য' : 'Registration & Commercial Authorization'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">{language === 'bn' ? 'নিবন্ধন নম্বর: ' : 'Registration Number: '}</span>
                <span className="font-mono font-medium text-slate-800">{product.registrationNo}</span>
              </div>
              <div>
                <span className="text-slate-400">{language === 'bn' ? 'অনুমোদিত কোম্পানি: ' : 'Authorized Holder: '}</span>
                <span className="font-medium text-slate-800">{product.registrationHolder}</span>
              </div>
              <div>
                <span className="text-slate-400">{language === 'bn' ? 'ফর্মুলেশন টাইপ: ' : 'Formulation: '}</span>
                <span className="font-medium text-slate-800">{product.formulation || 'Standard formulation'}</span>
              </div>
              <div>
                <span className="text-slate-400">{language === 'bn' ? 'বিষাক্ততার শ্রেণী: ' : 'Toxicity Classification: '}</span>
                <span className="font-medium text-slate-800">{product.toxicityClass || 'WHO Class II / III'}</span>
              </div>
            </div>
          </div>

          {/* Target Crops & Pests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-emerald-100 bg-emerald-50/40 rounded-xl">
              <h4 className="font-semibold text-emerald-950 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                <Sprout className="w-4 h-4 text-emerald-700" />
                {language === 'bn' ? 'অনুমোদিত ফসলের তালিকা' : 'Officially Recommended Crops'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.crops.map((crop, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-200 rounded-lg text-xs font-medium shadow-2xs">
                    {transCrop(crop)}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 border border-amber-100 bg-amber-50/40 rounded-xl">
              <h4 className="font-semibold text-amber-950 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                <Bug className="w-4 h-4 text-amber-700" />
                {language === 'bn' ? 'লক্ষ্য বালাই, রোগ ও আগাছা' : 'Target Pests, Diseases & Weeds'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.pests.map((pest, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white text-amber-900 border border-amber-200 rounded-lg text-xs font-medium shadow-2xs">
                    {pest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mode of Action & Resistance Management */}
          <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-950 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <RotateCw className="w-4 h-4 text-blue-700" />
                {language === 'bn' ? 'কার্যপদ্ধতি ও প্রতিরোধ ব্যবস্থাপনা' : 'Mode of Action & Anti-Resistance Guidelines'}
              </h4>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                product.resistanceRisk === 'High' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                product.resistanceRisk === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {transRisk(product.resistanceRisk || 'Medium')} {language === 'bn' ? 'প্রতিরোধ ঝুঁকি' : 'Resistance Risk'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">{language === 'bn' ? 'MoA গ্রুপ:' : 'MoA Group:'}</strong> {product.moaGroup || 'Target site physiological process'}.
            </p>
            <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-blue-100 leading-relaxed">
              <strong className="text-blue-900">{language === 'bn' ? 'আবর্তন নির্দেশিকা: ' : 'Rotation Directive: '}</strong>
              {product.rotationNotes || 'Do not make more than 2 consecutive applications. Rotate with a chemical from an alternate MoA family to prevent target-site resistance.'}
            </p>
          </div>

          {/* Safety Precaution Checklist */}
          <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              {language === 'bn' ? 'নিরাপত্তা সতর্কতা ও ব্যক্তিগত সুরক্ষা (PPE)' : 'Safety Precautions & PPE Requirements'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'bn' ? 'রাসায়নিক প্রতিরোধী নাইট্রিল/রাবার গ্লাভস ব্যবহার বাধ্যতামূলক' : 'Nitrile or rubber chemical gloves during mixing & spraying'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'bn' ? 'বাষ্পরোধী রেসপিরেটর বা পার্টিকল মাস্ক পরিধান করুন' : 'Organic vapor respirator or particle mask (mandatory)'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'bn' ? 'চোখের সুরক্ষায় প্রতিরক্ষামূলক গগলস বা ফেস শিল্ড পরিধান করুন' : 'Protective goggles or face shield (prevent eye splashes)'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{language === 'bn' ? 'ফুলহাতা শার্ট, লম্বা প্যান্ট ও গামবুট ব্যবহার করুন' : 'Long-sleeved shirt, long pants, and rubber gumboots'}</span>
              </div>
            </div>

            {product.safetyNotes && product.safetyNotes.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  {language === 'bn' ? 'নির্দিষ্ট রাসায়নিক সতর্কতা:' : 'Chemical Specific Warnings:'}
                </span>
                <ul className="mt-1 space-y-1">
                  {product.safetyNotes.map((note, i) => (
                    <li key={i} className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/60 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Field Dosage Calculator inside Modal */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-emerald-950 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-emerald-700" />
                {language === 'bn' ? 'তাৎক্ষণিক জমির মাত্রা নির্ণায়ক' : 'Quick Field Dosage Estimator'}
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenDosageCalculator(product);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                {language === 'bn' ? 'পূর্ণ ক্যালকুলেটরে যান' : 'Open Full Calculator'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  {language === 'bn' ? 'জমির পরিমাণ' : 'Field Area'}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={areaVal}
                  onChange={(e) => setAreaVal(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  {language === 'bn' ? 'একক' : 'Unit'}
                </label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="bigha">Bigha (বিঘা)</option>
                  <option value="acre">Acre (একর)</option>
                  <option value="hectare">Hectare (হেক্টর)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">
                  {language === 'bn' ? 'স্প্রেয়ার ট্যাংক' : 'Sprayer Tank'}
                </label>
                <select
                  value={tankSize}
                  onChange={(e) => setTankSize(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="16">{formatNum(16)} Litre Backpack</option>
                  <option value="10">{formatNum(10)} Litre Small</option>
                  <option value="20">{formatNum(20)} Litre Large</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-emerald-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">
                  {language === 'bn' ? 'মোট বালাইনাশক' : 'Total Chemical'}
                </span>
                <span className="font-bold text-emerald-800 text-sm">{quickDosage.totalChemicalNeeded}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">
                  {language === 'bn' ? 'প্রতি ট্যাংকে পরিমাণ' : 'Per Spray Tank'}
                </span>
                <span className="font-bold text-emerald-800 text-sm">{quickDosage.chemicalPerTank}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">
                  {language === 'bn' ? 'মোট পানির পরিমাণ' : 'Water Volume'}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {formatNum(quickDosage.totalWaterNeededL)} {language === 'bn' ? 'লিটার' : 'Litres'} ({formatNum(quickDosage.numberOfTanks)} {language === 'bn' ? 'ট্যাংক' : 'tanks'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            id="modal-export-pdf-btn"
            onClick={() => exportSingleProductPDF(product)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs shadow-2xs transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'ফিল্ড কার্ড ডাউনলোড (PDF)' : 'Download Field Card (PDF)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenDosageCalculator(product);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>{language === 'bn' ? 'মাত্রা ক্যালকুলেটর' : 'Full Dosage Calculator'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 font-medium text-xs transition cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
