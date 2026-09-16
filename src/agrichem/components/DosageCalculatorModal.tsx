import React, { useState, useEffect } from 'react';
import { ChemicalProduct, DosageInput } from '../types';
import { calculateDosage } from '../utils/calculator';
import { exportDosagePrescriptionPDF } from '../utils/pdfExport';
import { 
  Calculator, 
  X, 
  FileDown, 
  Droplets, 
  Layers, 
  Scale, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DosageCalculatorModalProps {
  products: ChemicalProduct[];
  selectedProduct: ChemicalProduct | null;
  onClose: () => void;
  onSelectProduct: (product: ChemicalProduct) => void;
}

export const DosageCalculatorModal: React.FC<DosageCalculatorModalProps> = ({
  products,
  selectedProduct,
  onClose,
  onSelectProduct
}) => {
  const { language, t, transCrop, transCat, formatNum } = useLanguage();

  const [currentProduct, setCurrentProduct] = useState<ChemicalProduct>(
    selectedProduct || products[0]
  );

  const [areaValue, setAreaValue] = useState<number>(1);
  const [areaUnit, setAreaUnit] = useState<DosageInput['areaUnit']>('bigha');
  const [tankVolumeL, setTankVolumeL] = useState<number>(16);
  const [sprayVolumePerHa, setSprayVolumePerHa] = useState<number>(500);

  useEffect(() => {
    if (selectedProduct) {
      setCurrentProduct(selectedProduct);
    }
  }, [selectedProduct]);

  const calculation = calculateDosage(currentProduct, {
    areaValue,
    areaUnit,
    tankVolumeL,
    sprayVolumePerHaL: sprayVolumePerHa
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="dosage-calculator-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between border-b border-teal-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-none">
                {language === 'bn' ? 'জমির বালাইনাশক ও স্প্রে ট্যাংক মাত্রা ক্যালকুলেটর' : 'Field Dosage & Tank Mix Calculator'}
              </h2>
              <p className="text-xs text-teal-200 mt-1">
                {language === 'bn' ? 'স্প্রেয়ার ক্যালিব্রেশন এবং পানির সঠিক অনুপাত গণনা' : 'Precision sprayer calibration & water volume calculations'}
              </p>
            </div>
          </div>
          <button
            id="close-calculator-modal-btn"
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white rounded-lg hover:bg-teal-700 transition cursor-pointer"
            aria-label="Close calculator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Chemical Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              {language === 'bn' ? 'বালাইনাশক নির্বাচন করুন' : 'Select Chemical Product'}
            </label>
            <select
              id="calculator-product-select"
              value={currentProduct.id}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) {
                  setCurrentProduct(found);
                  onSelectProduct(found);
                }
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.tradeName} ({p.commonName}) — {p.dosageRate} [{transCat(p.type)}]
                </option>
              ))}
            </select>
          </div>

          {/* Product Quick Info Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {language === 'bn' ? 'নিবন্ধিত মাত্রা' : 'Registered Dosage Rate'}
              </span>
              <span className="font-bold text-teal-900 text-sm">{currentProduct.dosageRate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {language === 'bn' ? 'শ্রেণী ও MoA' : 'Category & MoA'}
              </span>
              <span className="font-medium text-slate-800">{transCat(currentProduct.type)} | {currentProduct.moaCode || 'Standard'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                {language === 'bn' ? 'লক্ষ্য ফসল' : 'Target Crops'}
              </span>
              <span className="font-medium text-slate-800">
                {currentProduct.crops.slice(0, 3).map((c) => transCrop(c)).join(', ')}
              </span>
            </div>
          </div>

          {/* Input Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field Area Value & Unit */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                {language === 'bn' ? 'জমির পরিমাণ' : 'Target Field Area'}
              </label>
              <div className="grid grid-cols-5 gap-2">
                <input
                  id="input-area-val"
                  type="number"
                  min="0.01"
                  step="0.25"
                  value={areaValue}
                  onChange={(e) => setAreaValue(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <select
                  id="select-area-unit"
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as any)}
                  className="col-span-3 px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="bigha">Bigha (বিঘা ≈ 0.33 একর)</option>
                  <option value="katha">Katha (কাঠা ≈ ১/২০ বিঘা)</option>
                  <option value="acre">Acre (একর)</option>
                  <option value="hectare">Hectare (হেক্টর)</option>
                  <option value="sqm">Square Meters (বর্গমিটার)</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {language === 'bn' ? 'রূপান্তরিত: ' : 'Converted: '}
                <span className="font-semibold text-slate-600">{formatNum(calculation.convertedHa)} Ha</span> ({formatNum(calculation.convertedAcres)} {language === 'bn' ? 'একর' : 'Acres'})
              </p>
            </div>

            {/* Knapsack Sprayer Tank Volume */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                {language === 'bn' ? 'স্প্রেয়ার ট্যাংকের ধারণক্ষমতা' : 'Sprayer Tank Capacity'}
              </label>
              <select
                id="select-tank-volume"
                value={tankVolumeL}
                onChange={(e) => setTankVolumeL(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="16">{formatNum(16)} {language === 'bn' ? 'লিটার (স্ট্যান্ডার্ড ন্যাপস্যাক স্প্রেয়ার)' : 'Litres (Standard Backpack Sprayer)'}</option>
                <option value="10">{formatNum(10)} {language === 'bn' ? 'লিটার (ছোট স্প্রে ট্যাংক)' : 'Litres (Small Hand/Backpack Tank)'}</option>
                <option value="20">{formatNum(20)} {language === 'bn' ? 'লিটার (বড় স্প্রেয়ার ট্যাংক)' : 'Litres (Large Backpack Tank)'}</option>
                <option value="200">{formatNum(200)} {language === 'bn' ? 'লিটার (ড্রাম / পাওয়ার বুম স্প্রেয়ার)' : 'Litres (Drum / Tractor Boom)'}</option>
              </select>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{language === 'bn' ? 'স্প্রে ভলিউম:' : 'Spray Vol:'}</span>
                <span className="font-mono text-slate-600">{formatNum(sprayVolumePerHa)} L/ha {language === 'bn' ? 'স্ট্যান্ডার্ড' : 'standard'}</span>
              </div>
            </div>
          </div>

          {/* Results Display Panel */}
          <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-teal-200/70 pb-2">
              <span className="text-xs uppercase font-bold text-teal-900 tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-teal-700" />
                {language === 'bn' ? 'হিসাবের ফলাফল' : 'Calculation Results'}
              </span>
              <span className="text-[11px] font-semibold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                {language === 'bn' ? 'মাঠপর্যায়ে ব্যবহারের জন্য প্রস্তুত' : 'Ready for Field Use'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-white rounded-xl border border-teal-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {language === 'bn' ? 'মোট বালাইনাশকের প্রয়োজন' : 'Total Chemical Required'}
                </span>
                <p className="text-xl font-black text-teal-900 mt-1">
                  {calculation.totalChemicalNeeded}
                </p>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? `মোট ${formatNum(areaValue)} ${areaUnit} জমির জন্য` : `For total ${areaValue} ${areaUnit} area`}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-teal-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {language === 'bn' ? 'প্রতি স্প্রেয়ার ট্যাংকে মাত্রা' : 'Chemical Dose Per Sprayer Tank'}
                </span>
                <p className="text-lg font-bold text-emerald-800 mt-1">
                  {calculation.chemicalPerTank}
                </p>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? `${formatNum(tankVolumeL)} লিটার পরিষ্কার পানিতে` : `In ${tankVolumeL} Litres clean water`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/70 p-3 rounded-xl border border-teal-100">
              <div>
                <span className="text-slate-500 block">{language === 'bn' ? 'মোট পানির পরিমাণ:' : 'Total Water Required:'}</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                  <Droplets className="w-4 h-4 text-teal-600" />
                  {formatNum(calculation.totalWaterNeededL)} {language === 'bn' ? 'লিটার' : 'Litres'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{language === 'bn' ? 'স্প্রেয়ার ট্যাংকের সংখ্যা:' : 'Number of Sprayer Tanks:'}</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  {formatNum(calculation.numberOfTanks)} {language === 'bn' ? 'ট্যাংক' : 'Tanks (fills)'}
                </span>
              </div>
            </div>

            <p className="text-xs text-teal-900 bg-white/90 p-2.5 rounded-lg border border-teal-200 leading-relaxed">
              <strong className="text-teal-950">{language === 'bn' ? 'মাঠ নির্দেশিকা:' : 'Field Note:'}</strong> {calculation.notes}
            </p>
          </div>

          {/* Mixing Guidelines */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'ন্যাপস্যাক স্প্রেয়ার মিশ্রণ প্রণালী' : 'Standard Knapsack Mixing Procedure'}
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>{language === 'bn' ? `স্প্রেয়ার ট্যাংক অর্ধেক (প্রায় ${formatNum(8)} লিটার) পরিষ্কার পানি দ্বারা পূর্ণ করুন।` : 'Fill the sprayer tank half-full (approx 8L) with clean sediment-free water.'}</li>
              <li>{language === 'bn' ? `পৃথক পাত্রে ${calculation.chemicalPerTank} সামান্য পানিতে গুলিয়ে প্রি-মিক্স তৈরি করুন।` : `Pre-dissolve ${calculation.chemicalPerTank} in a 1-litre plastic container with water and stir thoroughly.`}</li>
              <li>{language === 'bn' ? 'স্ট্রেইনার বা ছাঁকনি দিয়ে দ্রবণের মিশ্রণ ট্যাংকে ঢালুন।' : 'Pour the diluted chemical pre-mix into the tank through the mesh strainer.'}</li>
              <li>{language === 'bn' ? `${formatNum(tankVolumeL)} লিটার দাগ পর্যন্ত অবশিষ্ট পানি যোগ করে মুখ বন্ধ করে ঝাঁকিয়ে নিন।` : `Fill the tank with remaining water up to the ${tankVolumeL}L mark, close the lid tightly, and gently agitate.`}</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            id="export-dosage-prescription-btn"
            onClick={() => exportDosagePrescriptionPDF(currentProduct, {
              areaValue,
              areaUnit,
              tankVolumeL,
              sprayVolumePerHaL: sprayVolumePerHa
            }, calculation)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 rounded-xl font-semibold text-xs shadow-2xs transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-teal-700" />
            <span>{language === 'bn' ? 'মাঠ প্রেসক্রিপশন ডাউনলোড (PDF)' : 'Download Field Prescription PDF'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-semibold text-xs transition cursor-pointer"
          >
            {language === 'bn' ? 'সম্পন্ন' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
