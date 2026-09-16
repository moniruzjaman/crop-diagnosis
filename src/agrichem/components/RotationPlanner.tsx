import React, { useState, useMemo } from 'react';
import { ChemicalProduct, SprayRotationStep } from '../types';
import { MOA_DATABASE } from '../data/moaData';
import { 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileDown, 
  ShieldAlert, 
  Sprout, 
  Bug, 
  Layers, 
  Info,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { exportRotationSchedulePDF } from '../utils/pdfExport';
import { useLanguage } from '../context/LanguageContext';

interface RotationPlannerProps {
  products: ChemicalProduct[];
}

export const RotationPlanner: React.FC<RotationPlannerProps> = ({ products }) => {
  const { language, transCrop, formatNum } = useLanguage();

  // Available crops
  const availableCrops = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.crops.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [products]);

  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');

  // Available pests for the selected crop
  const availablePests = useMemo(() => {
    const set = new Set<string>();
    products
      .filter((p) => p.crops.includes(selectedCrop))
      .forEach((p) => p.pests.forEach((pest) => set.add(pest)));
    return Array.from(set).sort();
  }, [products, selectedCrop]);

  const [selectedPest, setSelectedPest] = useState<string>('');

  // Auto-select first pest when crop changes
  React.useEffect(() => {
    if (availablePests.length > 0) {
      // Prefer common ones like BPH, Late blight, or first available
      const preferred = availablePests.find(
        (p) => p.includes('BPH') || p.includes('Late blight') || p.includes('borer') || p.includes('mite')
      );
      setSelectedPest(preferred || availablePests[0]);
    } else {
      setSelectedPest('');
    }
  }, [availablePests, selectedCrop]);

  // Products matching selected crop and pest
  const eligibleProducts = useMemo(() => {
    if (!selectedPest) return [];
    return products.filter(
      (p) => p.crops.includes(selectedCrop) && p.pests.includes(selectedPest)
    );
  }, [products, selectedCrop, selectedPest]);

  // Unique MoA groups available for this pest
  const availableMoAGroups = useMemo(() => {
    const map = new Map<string, ChemicalProduct[]>();
    eligibleProducts.forEach((p) => {
      const code = p.moaCode || 'Standard';
      if (!map.has(code)) map.set(code, []);
      map.get(code)!.push(p);
    });
    return Array.from(map.entries());
  }, [eligibleProducts]);

  // Multi-step spray rotation sequence state (up to 4 sprays)
  const [rotationSteps, setRotationSteps] = useState<{
    sprayNumber: number;
    sprayWindow: string;
    productId: string;
  }[]>([
    { sprayNumber: 1, sprayWindow: 'Early Vegetative / Seedling', productId: '' },
    { sprayNumber: 2, sprayWindow: 'Active Tillering / Growth', productId: '' },
    { sprayNumber: 3, sprayWindow: 'Flowering / Panicle / Fruit', productId: '' }
  ]);

  // Auto-populate initial rotation steps when eligible products change
  React.useEffect(() => {
    if (eligibleProducts.length >= 2) {
      // Pick two products with distinct MoA codes if possible
      const p1 = eligibleProducts[0];
      const p2 = eligibleProducts.find((p) => p.moaCode !== p1.moaCode) || eligibleProducts[1] || p1;
      const p3 = eligibleProducts.find((p) => p.moaCode !== p1.moaCode && p.moaCode !== p2.moaCode) || p1;

      setRotationSteps([
        { sprayNumber: 1, sprayWindow: language === 'bn' ? 'প্রাথমিক বৃদ্ধি / চারা অবস্থা' : 'Early Vegetative / Seedling', productId: p1.id },
        { sprayNumber: 2, sprayWindow: language === 'bn' ? 'কুশি / দ্রুত দৈহিক বৃদ্ধি' : 'Active Tillering / Growth', productId: p2.id },
        { sprayNumber: 3, sprayWindow: language === 'bn' ? 'ফুল / শীষ / ফল গঠন পর্যায়' : 'Flowering / Panicle / Fruit', productId: p3.id }
      ]);
    } else if (eligibleProducts.length === 1) {
      setRotationSteps([
        { sprayNumber: 1, sprayWindow: language === 'bn' ? 'একক প্রয়োগ' : 'Primary Application', productId: eligibleProducts[0].id }
      ]);
    }
  }, [eligibleProducts, language]);

  // Analyze the sequence for MoA conflicts
  const analyzedSteps: SprayRotationStep[] = useMemo(() => {
    return rotationSteps.map((step, idx) => {
      const prod = products.find((p) => p.id === step.productId);
      if (!prod) {
        return {
          sprayNumber: step.sprayNumber,
          sprayWindow: step.sprayWindow,
          productId: '',
          productName: language === 'bn' ? 'অনির্বাচিত' : 'Unassigned',
          commonName: '',
          moaCode: '',
          moaGroup: '',
          status: 'valid'
        };
      }

      // Check if previous step had the same MoA code
      let conflict = false;
      let reason = '';
      if (idx > 0) {
        const prevStep = rotationSteps[idx - 1];
        const prevProd = products.find((p) => p.id === prevStep.productId);
        if (prevProd && prod.moaCode && prevProd.moaCode && prod.moaCode === prevProd.moaCode) {
          conflict = true;
          reason = language === 'bn'
            ? `ধারাবাহিক স্প্রে #${formatNum(idx)} ও #${formatNum(idx + 1)} উভয় ক্ষেত্রেই একই MoA ${prod.moaCode} ব্যবহৃত হয়েছে! একই ক্রিয়াপদ্ধতি বারবার ব্যবহারে বালাইয়ে প্রতিরোধ ক্ষমতা বা রেজিসট্যান্স দ্রুত তৈরি হয়।`
            : `Consecutive spray #${idx} & #${idx + 1} both use MoA ${prod.moaCode}. Repeated applications of the same mode of action select for resistant mutant strains!`;
        }
      }

      return {
        sprayNumber: step.sprayNumber,
        sprayWindow: step.sprayWindow,
        productId: prod.id,
        productName: prod.tradeName,
        commonName: prod.commonName,
        moaCode: prod.moaCode || 'Unknown',
        moaGroup: prod.moaGroup || 'Unclassified',
        status: conflict ? 'conflict' : 'valid',
        conflictReason: reason
      };
    });
  }, [rotationSteps, products, language]);

  const hasConflict = analyzedSteps.some((s) => s.status === 'conflict');

  return (
    <div id="rotation-planner-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-700 text-blue-200 text-xs font-semibold mb-3">
            <RotateCw className="w-3.5 h-3.5" />
            IRAC • FRAC • HRAC Mode of Action Resistance Framework
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {language === 'bn' ? 'বালাইনাশক আবর্তন ও রেজিসট্যান্স প্রতিরোধ পরিকল্পনাকারী' : 'Anti-Resistance Spray Rotation Planner'}
          </h1>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">
            {language === 'bn'
              ? 'পরপর একই গোত্রের বিষ ব্যবহার না করে ভিন্ন MoA গ্রুপের বালাইনাশক পর্যায়ক্রমিকভাবে স্প্রে করুন। ফসল ও বালাই নির্বাচন করে রেজিসট্যান্স মুক্ত বিজ্ঞানসম্মত স্প্রে তালিকা প্রস্তুত করুন।'
              : 'Prevent pesticide failure by rotating chemical groups across application windows. Select your crop and target pest to verify that consecutive sprays target different biochemical sites, breaking resistance selection pressure.'}
          </p>
        </div>
      </div>

      {/* Selection Control Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            {language === 'bn' ? '১. ফসল নির্বাচন করুন' : '1. Select Target Crop'}
          </label>
          <select
            id="rotation-crop-select"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableCrops.map((crop) => (
              <option key={crop} value={crop}>
                {transCrop(crop)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
            <Bug className="w-4 h-4 text-amber-600" />
            {language === 'bn' ? '২. লক্ষ্য বালাই / রোগ / আগাছা নির্বাচন করুন' : '2. Select Target Pest / Disease / Weed'}
          </label>
          <select
            id="rotation-pest-select"
            value={selectedPest}
            onChange={(e) => setSelectedPest(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availablePests.map((pest) => (
              <option key={pest} value={pest}>
                {pest}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Available MoA Groups for this Target */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {transCrop(selectedCrop)}-এ {selectedPest}-এর জন্য অনুমোদিত MoA গ্রুপসমূহ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn'
                ? `মোট ${formatNum(eligibleProducts.length)} টি নিবন্ধিত বালাইনাশক এবং ${formatNum(availableMoAGroups.length)} টি স্বতন্ত্র MoA গ্রুপ পাওয়া গেছে।`
                : `Found ${eligibleProducts.length} registered products spanning ${availableMoAGroups.length} distinct MoA groups.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableMoAGroups.map(([moaCode, prods]) => {
            const moaInfo = MOA_DATABASE.find((m) => m.code === moaCode);
            return (
              <div key={moaCode} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white">
                    {moaCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {formatNum(prods.length)} {language === 'bn' ? 'টি পণ্য' : 'Products'}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-800">
                  {moaInfo?.name || prods[0].moaGroup || 'Target site specified'}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {moaInfo?.targetSite || 'Cellular metabolic biochemical pathway.'}
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block font-medium">
                  {prods.map((p) => p.tradeName).slice(0, 3).join(', ')}
                  {prods.length > 3 ? '...' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sequence Builder */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {language === 'bn' ? 'ইন্টারেক্টিভ স্প্রে আবর্তন ক্রম' : 'Interactive Spray Rotation Sequence'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn'
                ? 'ফসলের বিভিন্ন বৃদ্ধি ধাপে বিকল্প রাসায়নিক গ্রুপ নির্বাচন করে পূর্ণাঙ্গ স্প্রে শিডিউল তৈরি করুন।'
                : 'Build a sequential spray schedule across crop development stages to maintain chemical susceptibility.'}
            </p>
          </div>

          <button
            id="export-rotation-pdf-btn"
            onClick={() => exportRotationSchedulePDF(selectedCrop, selectedPest, analyzedSteps)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{language === 'bn' ? 'আবর্তন শিডিউল ডাউনলোড (PDF)' : 'Export Rotation Schedule (PDF)'}</span>
          </button>
        </div>

        {/* Conflict Warning Banner */}
        {hasConflict ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900 text-sm">
                {language === 'bn' ? 'রেজিসট্যান্স সতর্কতা: একই MoA গ্রুপ একাধিকবার শনাক্ত হয়েছে!' : 'Resistance Alert: Repeated Mode of Action Detected!'}
              </h4>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                {language === 'bn'
                  ? 'আপনি পরপর দুটি স্প্রেতে একই MoA গ্রুপের কীটনাশক নির্বাচন করেছেন। একই ক্রিয়াপদ্ধতির বিষ বারবার প্রয়োগ করলে বালাই খুব দ্রুত বিষের প্রতি প্রতিরোধী হয়ে ওঠে। লাল চিহ্নিত স্প্রেতে ড্রপডাউন থেকে অন্য কোনো MoA কোডের ওষুধ বাছাই করুন।'
                  : 'You have selected identical MoA groups in consecutive spray windows. Using the same chemical mode of action repeatedly will accelerate pest resistance. Please switch the flagged spray to a product with a different MoA code from the dropdown.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">
                {language === 'bn' ? 'বিজ্ঞানসম্মত রেজিসট্যান্স-মুক্ত স্প্রে ক্রম নির্ভুলভাবে যাচাইকৃত' : 'Optimal Anti-Resistance Sequence Validated'}
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                {language === 'bn'
                  ? 'প্রতিটি ধারাবাহিক স্প্রে ভিন্ন ভিন্ন জৈবরাসায়নিক সাইটকে লক্ষ্যবস্তু করে। এই আবর্তন বালাই দমন ক্ষমতা দীর্ঘস্থায়ী ও সর্বোচ্চ রাখবে।'
                  : 'Each sequential spray window employs a distinct biochemical mode of action. This rotation maximizes control efficacy and safeguards chemical life.'}
              </p>
            </div>
          </div>
        )}

        {/* Steps Grid */}
        <div className="space-y-4">
          {rotationSteps.map((step, index) => {
            const analyzed = analyzedSteps[index];
            const currentProd = products.find((p) => p.id === step.productId);

            return (
              <div 
                key={step.sprayNumber}
                className={`p-4 rounded-xl border transition-all ${
                  analyzed.status === 'conflict'
                    ? 'border-rose-300 bg-rose-50/40'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {formatNum(step.sprayNumber)}
                    </span>
                    <input
                      type="text"
                      value={step.sprayWindow}
                      onChange={(e) => {
                        const next = [...rotationSteps];
                        next[index].sprayWindow = e.target.value;
                        setRotationSteps(next);
                      }}
                      className="text-xs font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 px-1 py-0.5 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {analyzed.moaCode && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-900 text-white">
                        {analyzed.moaCode}
                      </span>
                    )}
                    {analyzed.status === 'conflict' && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {language === 'bn' ? 'সংঘাত' : 'Conflict'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      {language === 'bn' ? `স্প্রে #${formatNum(step.sprayNumber)}-এর জন্য বালাইনাশক নির্বাচন` : `Choose Chemical for Spray #${step.sprayNumber}`}
                    </label>
                    <select
                      value={step.productId}
                      onChange={(e) => {
                        const next = [...rotationSteps];
                        next[index].productId = e.target.value;
                        setRotationSteps(next);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">{language === 'bn' ? '-- বালাইনাশক বাছাই করুন --' : '-- Choose chemical --'}</option>
                      {eligibleProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.tradeName} ({p.commonName}) — [{p.moaCode || 'Standard'}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentProd && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{currentProd.tradeName}</span>
                        <p className="text-[11px] text-slate-500">{currentProd.commonName} | {language === 'bn' ? 'মাত্রা:' : 'Rate:'} {currentProd.dosageRate}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{currentProd.registrationNo}</span>
                    </div>
                  )}
                </div>

                {analyzed.conflictReason && (
                  <p className="text-xs text-rose-700 font-medium mt-2.5 pl-2 border-l-2 border-rose-500">
                    {analyzed.conflictReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Sequence Control Actions */}
        <div className="flex items-center justify-between pt-2">
          {rotationSteps.length < 4 && (
            <button
              onClick={() => {
                setRotationSteps([
                  ...rotationSteps,
                  {
                    sprayNumber: rotationSteps.length + 1,
                    sprayWindow: language === 'bn' ? `স্প্রে পর্যায় #${formatNum(rotationSteps.length + 1)}` : `Spray Window #${rotationSteps.length + 1}`,
                    productId: eligibleProducts[0]?.id || ''
                  }
                ]);
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 cursor-pointer"
            >
              + {language === 'bn' ? 'আরেকটি প্রয়োগ পর্যায় যোগ করুন' : 'Add Another Application Window'}
            </button>
          )}

          {rotationSteps.length > 2 && (
            <button
              onClick={() => {
                setRotationSteps(rotationSteps.slice(0, rotationSteps.length - 1));
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              {language === 'bn' ? 'সর্বশেষ পর্যায়টি বাতিল করুন' : 'Remove Last Window'}
            </button>
          )}
        </div>
      </div>

      {/* Rotation Principles Reference Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-amber-400" />
          {language === 'bn' ? 'বালাইনাশক প্রতিরোধ (MoA) ব্যবস্থাপনার ৪টি সুবর্ণ নিয়ম' : 'The 4 Golden Rules of MoA Resistance Management'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="text-amber-400 font-bold block">
              {language === 'bn' ? '১. উইন্ডো স্ট্র্যাটেজি (পর্যায় নীতি)' : '1. The Window Strategy'}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {language === 'bn' 
                ? 'বালাইয়ের একটি প্রজন্মে (সাধারণত ৩০ দিন) একটি MoA প্রয়োগ শেষ করে পরবর্তী প্রজন্মের জন্য সম্পূর্ণ ভিন্ন MoA গ্রুপে চলে যান।' 
                : 'Treat all sprays within a pest generation (typically 30 days) with the same MoA, then switch completely to a different group for the next generation.'}
            </p>
          </div>
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="text-amber-400 font-bold block">
              {language === 'bn' ? '২. মাল্টি-সাইট রক্ষাকবচ' : '2. Multi-Site Anchors'}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {language === 'bn' 
                ? 'ম্যানকোজেব (M03), কপার (M01) বা সালফার (M02)-এর মতো বহুমুখী স্পর্শক বালাইনাশক ব্যবহার করুন যা একক-সাইট বিষকে প্রতিরোধ হতে রক্ষা করে।' 
                : 'Incorporate multi-site protectants like Mancozeb (FRAC M03), Copper (FRAC M01), or Sulfur (FRAC M02) to shield single-site systemic chemicals.'}
            </p>
          </div>
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="text-amber-400 font-bold block">
              {language === 'bn' ? '৩. কম মাত্রায় প্রয়োগ নিষিদ্ধ' : '3. Never Underdose'}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {language === 'bn' 
                ? 'অনুমোদিত মাত্রার চেয়ে কম বিষ দিলে বালাই না মরে বরং প্রতিরোধ ক্ষমতা অর্জন করে বংশবৃদ্ধি ঘটায়, যা দ্রুত ওষুধের কার্যকারিতা নষ্ট করে।' 
                : 'Applying sub-lethal concentrations lets marginally tolerant individuals survive and reproduce, accelerating resistance development.'}
            </p>
          </div>
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="text-amber-400 font-bold block">
              {language === 'bn' ? '৪. সমন্বিত বালাই ব্যবস্থাপনা (IPM)' : '4. Integrated Tactics (IPM)'}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {language === 'bn' 
                ? 'রাসায়নিক বিষের ওপর একক নির্ভরতা কমাতে সেক্স ফেরোমোন ট্র্যাপ (Cuelure), বন্ধু পোকা ও পরভোজী সংরক্ষণ এবং প্রতিরোধী জাত চাষ করুন।' 
                : 'Combine chemical sprays with sex pheromone traps (Cuelure), natural biological predators, and resistant crop varieties to reduce spray frequency.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
