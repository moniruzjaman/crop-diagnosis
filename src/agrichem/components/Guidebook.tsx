import React, { useState } from 'react';
import { ChemicalProduct } from '../types';
import { 
  BookOpen, 
  FileDown, 
  Layers, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  HelpCircle,
  Sprout,
  Clock,
  Printer
} from 'lucide-react';
import { exportCropGuidePDF } from '../utils/pdfExport';
import { MOA_DATABASE } from '../data/moaData';
import { useLanguage } from '../context/LanguageContext';

interface GuidebookProps {
  products: ChemicalProduct[];
}

export const Guidebook: React.FC<GuidebookProps> = ({ products }) => {
  const { language, transCrop, formatNum } = useLanguage();
  const [activeChapter, setActiveChapter] = useState<'calibration' | 'resistance' | 'wales' | 'crops' | 'phi'>('crops');

  // Group products by major crop
  const cropsList = ['Rice', 'Potato', 'Mango', 'Tea', 'Brinjal', 'Tomato', 'Jute', 'Stored grain in Rice'];

  return (
    <div id="guidebook-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-emerald-200 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            {language === 'bn' ? 'মাঠপর্যায়ের কৃষিবিদ ও সম্প্রসারণ কর্মকর্তা হ্যান্ডবুক' : 'Field Agronomist Handbook & Reference Manual'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {language === 'bn' ? 'কৃষি রাসায়নিক নিয়ন্ত্রণ ও প্রয়োগ নির্দেশিকা' : 'Agricultural Chemical Controls Guidebook'}
          </h1>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            {language === 'bn'
              ? 'বালাইনাশক প্রয়োগের বৈজ্ঞানিক প্রোটোকল: স্প্রেয়ার ক্যালিব্রেশন গণনা, প্রতিরোধ ভাঙার ঘূর্ণন কৌশল, ট্যাংক মিক্সিং নিয়মাবলী (W.A.L.E.S.), এবং অফলাইনে ব্যবহারের জন্য ফসলভিত্তিক পিডিএফ গাইড।'
              : 'Essential agronomic protocols: Sprayer calibration mathematics, anti-resistance rotation science, tank mix compatibility sequences, and exportable crop-wise chemical control dossiers.'}
          </p>
        </div>
      </div>

      {/* Chapter Selection Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveChapter('crops')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeChapter === 'crops'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফসলভিত্তিক স্প্রে সময়সূচী (PDFs)' : 'Crop Chemical Schedules (PDFs)'}</span>
        </button>

        <button
          onClick={() => setActiveChapter('calibration')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeChapter === 'calibration'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{language === 'bn' ? 'স্প্রেয়ার ক্যালিব্রেশন প্রোটোকল' : 'Sprayer Calibration Protocol'}</span>
        </button>

        <button
          onClick={() => setActiveChapter('resistance')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeChapter === 'resistance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'bn' ? 'প্রতিরোধ রোধ ও MoA বিজ্ঞান' : 'Resistance & MoA Strategy'}</span>
        </button>

        <button
          onClick={() => setActiveChapter('wales')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeChapter === 'wales'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>{language === 'bn' ? 'W.A.L.E.S. ট্যাংক মিক্সিং নিয়ম' : 'The W.A.L.E.S. Mixing Rule'}</span>
        </button>

        <button
          onClick={() => setActiveChapter('phi')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeChapter === 'phi'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফসল তোলার বিরতি (PHI) ও খাদ্য নিরাপত্তা' : 'PHI & Residue Compliance'}</span>
        </button>
      </div>

      {/* Chapter 1: Crop Chemical Schedules & PDF Exports */}
      {activeChapter === 'crops' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'bn' ? 'অনুমোদিত ফসলভিত্তিক স্প্রে তালিকা ও ফিল্ড নির্দেশিকা' : 'Official Registered Crop Spray Schedules'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'মাঠপর্যায়ে ইন্টারনেট সংযোগ ছাড়াই ব্যবহারের জন্য প্রতিটি ফসলের সম্পূর্ণ রাসায়নিক বিবরণ ও মাত্রা সম্বলিত পিডিএফ ডাউনলোড করুন।'
                  : 'Download comprehensive, print-ready field guides for each crop to take offline on extension visits.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cropsList.map((cropName) => {
              const matchingProds = products.filter((p) => p.crops.includes(cropName));
              const pestsForCrop = Array.from(
                new Set(matchingProds.flatMap((p) => p.pests))
              );

              return (
                <div
                  key={cropName}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-emerald-400 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        {language === 'bn' ? `${formatNum(matchingProds.length)} টি নিবন্ধিত বালাইনাশক` : `${matchingProds.length} Chemicals Registered`}
                      </span>
                      <Sprout className="w-4 h-4 text-emerald-600" />
                    </div>

                    <h4 className="text-lg font-bold text-slate-900">{transCrop(cropName)}</h4>

                    <div className="mt-2.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                        {language === 'bn' ? 'প্রধান নিয়ন্ত্রিত বালাই ও রোগবালাই:' : 'Key Controlled Pests & Diseases:'}
                      </span>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {pestsForCrop.slice(0, 4).join(', ')}
                        {pestsForCrop.length > 4 ? ` + ${formatNum(pestsForCrop.length - 4)} more` : ''}
                      </p>
                    </div>

                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'কীটনাশক:' : 'Insecticides:'}</span>
                        <span className="font-semibold text-slate-700">
                          {formatNum(matchingProds.filter((p) => p.type === 'Insecticide').length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'ছত্রাকনাশক:' : 'Fungicides:'}</span>
                        <span className="font-semibold text-slate-700">
                          {formatNum(matchingProds.filter((p) => p.type === 'Fungicide').length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'bn' ? 'অন্যান্য/আগাছানাশক:' : 'Herbicides/Others:'}</span>
                        <span className="font-semibold text-slate-700">
                          {formatNum(matchingProds.filter((p) => p.type !== 'Insecticide' && p.type !== 'Fungicide').length)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => exportCropGuidePDF(cropName, matchingProds)}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'bn' ? `${transCrop(cropName)} গাইড ডাউনলোড (PDF)` : `Export ${cropName} Guide (PDF)`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chapter 2: Sprayer Calibration */}
      {activeChapter === 'calibration' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              {language === 'bn' ? 'ক্যালিব্রেশন ম্যানুয়াল' : 'Calibration Manual'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {language === 'bn' ? 'ন্যাপস্যাক স্প্রেয়ারের ৩-ধাপে ক্যালিব্রেশন পদ্ধতি' : 'Field Knapsack Sprayer 3-Step Calibration Formula'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'স্প্রেয়ার ক্যালিব্রেট না করে কখনোই জমিতে বালাইনাশক প্রয়োগ করবেন না। ক্যালিব্রেশন ভুল হলে কম মাত্রায় প্রয়োগ হতে পারে (যা পোকার প্রতিরোধ ক্ষমতা বাড়ায়) অথবা অতিরিক্ত মাত্রায় প্রয়োগ হয়ে ফসল পুড়ে যেতে পারে ও ক্ষতিকর অবশিষ্টাংশ থেকে যায়।'
                : 'Never apply chemicals without calibrating! Improper calibration causes either underdosing (leading to resistance) or overdosing (causing phytotoxicity and illegal residues).'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {formatNum(1)}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'bn' ? '২৫ মিটার হাঁটার গতি নির্ধারণ করুন' : 'Measure 25-Meter Walking Speed'}
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'জমিতে ২৫ মিটার চিহ্নিত করুন। স্প্রে ট্যাংকে অর্ধেক পরিষ্কার পানি নিয়ে আপনার স্বাভাবিক হাঁটার গতিতে হাঁটুন এবং সময় স্টপওয়াচে রেকর্ড করুন (যেমন: ২০ সেকেন্ড)।'
                  : 'Pace out a 25-meter test strip in the target crop field. Walk at your normal, comfortable spraying pace with the knapsack sprayer half-full of clean water. Record the time in seconds (e.g. 20 seconds).'}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {formatNum(2)}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'bn' ? 'নজলের পানি নিঃসরণ সংগ্রহ ও পরিমাপ' : 'Collect Nozzle Discharge'}
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'স্প্রেয়ার পাম্প করে স্বাভাবিক চাপে আনুন। ধাপ ১ এর নির্ধারিত সময়ে (২০ সেকেন্ড) একটি মাপক জগে নজলের পানি সংগ্রহ করে মিলিলিটারে মাপুন (যেমন: ৪০০ মিলি)।'
                  : 'Pump the sprayer to standard operating pressure (2.5-3.0 bar). Direct nozzle output into a measuring jug for exactly the same duration measured in step 1 (20 seconds). Measure output in millilitres (e.g. 400 ml).'}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {formatNum(3)}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {language === 'bn' ? 'প্রতি হেক্টরে পানির পরিমাণ হিসাব করুন' : 'Calculate Water Volume Per Hectare'}
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'সূত্র: লিটার/হেক্টর = (নিঃসরণ মিলি × ৪০০) / (স্প্রে প্রস্থ মিটার × ১০০০)। ০.৫ মিটার প্রস্থ হলে ৪০০ মিলি নিঃসরনের জন্য প্রয়োজন হবে ৩২০ লিটার/হেক্টর।'
                  : 'Formula: L/ha = (Discharge (ml) × 400) / (Spray Swath Width (m) × 1000). With a 0.5m swath, 400 ml gives: (400 × 400) / 500 = 320 Litres/hectare.'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {language === 'bn' ? 'ব্যবহারের লক্ষ্য অনুযায়ী সঠিক নজল নির্বাচন' : 'Correct Nozzle Selection by Application Target'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-emerald-900">
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <strong>{language === 'bn' ? 'ফাঁপা কোণ নজল (Hollow Cone):' : 'Hollow Cone Nozzles:'}</strong>{' '}
                {language === 'bn' ? 'স্পর্শীয় কীটনাশক ও ছত্রাকনাশকের জন্য উপযুক্ত যা সূক্ষ্ম বিন্দুর মাধ্যমে পাতার সর্বত্র প্রবেশ করে।' : 'Best for contact insecticides and fungicides requiring fine droplets for 3D canopy penetration.'}
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <strong>{language === 'bn' ? 'ফ্ল্যাট ফ্যান নজল (Flat Fan):' : 'Flat Fan Nozzles:'}</strong>{' '}
                {language === 'bn' ? 'মাটিতে প্রয়োগকারী প্রাক-অঙ্কুরোদগম আগাছানাশকের জন্য সমতল ও সুষম স্প্রে নিশ্চিত করে।' : 'Best for soil-applied pre-emergence herbicides (Pyrazosulfuron, Pretilachlor) giving uniform band spray.'}
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <strong>{language === 'bn' ? 'লো-ড্রিফ্ট / এয়ার ইনডাকশন নজল:' : 'Air Induction / Low-Drift:'}</strong>{' '}
                {language === 'bn' ? 'বাতাসের বেগ ৮-১০ কিমি/ঘণ্টা থাকলে বাতাসে উড়ে যাওয়া রোধ করে পাশের জলাশয় বাঁচাতে ব্যবহৃত হয়।' : 'Used when winds approach 8-10 km/h to minimize aerosol drift into neighboring waterways.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 3: Resistance Science */}
      {activeChapter === 'resistance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
              {language === 'bn' ? 'বালাইনাশক প্রতিরোধের মূল কারণ' : 'Mechanisms of Resistance'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {language === 'bn' ? 'IRAC, FRAC ও HRAC প্রতিরোধ প্রতিরোধী ব্যবস্থাপনা' : 'IRAC, FRAC & HRAC Anti-Resistance Principles'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'পোকা ও ছত্রাকের মাঝে প্রাকৃতিকভাবে কিছু প্রতিরোধসম্পন্ন জিন থাকে। একই গ্রুপের রাসায়নিক বারংবার প্রয়োগ করলে সংবেদনশীলগুলো মারা যায় কিন্তু প্রতিরোধী রূপান্তরগুলো দ্রুত বংশবৃদ্ধি করে মহামারি আকার ধারণ করে।'
                : 'Insect, fungal, and weed populations naturally possess rare genetic variations. Continuous reliance on a single chemical group systematically eliminates susceptible individuals, multiplying resistant mutants.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {language === 'bn' ? 'টার্গেট-সাইট বনাম মেটাবলিক প্রতিরোধ' : 'Target-Site vs Metabolic Resistance'}
              </h4>
              <p className="leading-relaxed">
                <strong>{language === 'bn' ? 'টার্গেট-সাইট প্রতিরোধ:' : 'Target-Site Resistance:'}</strong>{' '}
                {language === 'bn'
                  ? 'এনজাইম বা স্নায়ু রিসেপ্টরে জিনগত পরিবর্তনের ফলে রাসায়নিক উপাদান আর সেখানে যুক্ত হতে পারে না (যেমন: সিন্থেটিক পাইরেথ্রয়েড প্রতিরোধে kdr জিন মিউটেশন)।'
                  : 'A single point mutation alters the enzyme or receptor protein so the pesticide cannot bind (e.g. Sodium channel gene mutation kdr giving synthetic pyrethroid resistance).'}
              </p>
              <p className="leading-relaxed">
                <strong>{language === 'bn' ? 'মেটাবলিক প্রতিরোধ:' : 'Metabolic Resistance:'}</strong>{' '}
                {language === 'bn'
                  ? 'পোকার দেহে অতিরিক্ত বিষনাশক এনজাইম (সাইটোক্রোম P450) তৈরি হয় যা বিষ কাজ করার আগেই নিষ্ক্রিয় করে ফেলে।'
                  : 'The pest overproduces detoxifying enzymes (Cytochrome P450 monooxygenases or Esterases) that degrade the chemical before it hits the target.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {language === 'bn' ? 'মাল্টি-সাইট প্রতিরক্ষামূলক ছত্রাকনাশকের গুরুত্ব' : 'Why Multi-Site Protectants Are Vital'}
              </h4>
              <p className="leading-relaxed">
                {language === 'bn'
                  ? 'ম্যানকোজেব (FRAC M03), কপার হাইড্রোক্সাইড (FRAC M01) এবং সালফার (FRAC M02) ছত্রাকের একাধিক জৈব বিপাকীয় পথ একসাথে আক্রমণ করে।'
                  : 'Chemicals like Mancozeb (FRAC M03), Copper Hydroxide (FRAC M01), and Sulphur (FRAC M02) attack dozens of fungal metabolic enzymes simultaneously.'}
              </p>
              <p className="leading-relaxed">
                {language === 'bn'
                  ? 'যেহেতু ছত্রাক একসাথে ৩০টি মিউটেশন ঘটাতে পারে না, তাই বিগত ৬০ বছরে মাল্টি-সাইট ছত্রাকনাশকের বিরুদ্ধে কোনো প্রতিরোধ গড়ে ওঠেনি। সবসময় একক-সাইটের সাথে মাল্টি-সাইট মিশিয়ে বা পর্যায়ক্রমে স্প্রে করুন!'
                  : 'Because fungi cannot evolve 30 simultaneous mutations, no field resistance has ever developed to multi-site fungicides in 60+ years of global use. Always tank-mix or alternate single-site systemics with a multi-site anchor!'}
              </p>
            </div>
          </div>

          {/* MoA Explorer table */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-2">
              {language === 'bn' ? 'প্রধান নিবন্ধিত ক্রিয়া কৌশল (MoA) কোড রেফারেন্স' : 'Primary Registered Mode of Action Codes Reference'}
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-2.5">{language === 'bn' ? 'MoA কোড' : 'MoA Code'}</th>
                    <th className="px-3 py-2.5">{language === 'bn' ? 'কমিটি' : 'Committee'}</th>
                    <th className="px-3 py-2.5">{language === 'bn' ? 'রাসায়নিক গ্রুপ' : 'Chemical Family'}</th>
                    <th className="px-3 py-2.5">{language === 'bn' ? 'টার্গেট সাইট' : 'Biochemical Target Site'}</th>
                    <th className="px-3 py-2.5">{language === 'bn' ? 'ঝুঁকি মাত্রা' : 'Risk Level'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {MOA_DATABASE.slice(0, 10).map((m) => (
                    <tr key={m.code} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-bold text-slate-900">{m.code}</td>
                      <td className="px-3 py-2 font-semibold text-slate-700">{m.type || m.committee}</td>
                      <td className="px-3 py-2 font-medium text-slate-800">{m.name}</td>
                      <td className="px-3 py-2">{m.targetSite}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.resistanceRisk === 'High' ? 'bg-rose-100 text-rose-800' :
                          m.resistanceRisk === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.resistanceRisk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 4: The W.A.L.E.S. Rule */}
      {activeChapter === 'wales' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-bold text-teal-700 tracking-wider">
              {language === 'bn' ? 'ট্যাংক মিক্স প্রোটোকল' : 'Tank Mix Protocol'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {language === 'bn' ? 'W.A.L.E.S. বৈশ্বিক ট্যাংক মিক্সিং নিয়ম' : 'The W.A.L.E.S. Universal Tank Mixing Order'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'ভুল ক্রমে রাসায়নিক মেশালে দ্রবণ জমাট বাঁধে, নজল আটকে যায়, তলানি পড়ে এবং রাসায়নিক কার্যকারিতা নষ্ট হয়। সবসময় W.A.L.E.S. ক্রম মেনে চলুন!'
                : 'Adding pesticides into a spray tank in the wrong order causes curdling, nozzle clogging, sedimentation, and chemical deactivation. Always follow W.A.L.E.S. sequence!'}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                letter: 'W',
                title: language === 'bn' ? 'ওয়েটেবল পাউডার ও দানাদার (WP, WDG, DF)' : 'Wettable Powders & Granules (WP, WDG, DF)',
                desc: language === 'bn' ? 'ট্যাংক অর্ধেক পানি দিয়ে ভরুন। পাউডারকে আলাদা বালতিতে অল্প পানিতে মিশিয়ে পেস্ট তৈরি করে ঢালুন। নাড়তে থাকুন যাতে সম্পূর্ণ দ্রবীভূত হয়।' : 'Fill tank 1/2 full of water. Pre-slurry powders with a little water in a bucket first, then pour in. Let dissolve completely with agitation.',
                color: 'bg-amber-500 text-white'
              },
              {
                letter: 'A',
                title: language === 'bn' ? 'ভালোভাবে নাড়ুন (Agitate Thoroughly)' : 'Agitate Thoroughly',
                desc: language === 'bn' ? 'মিক্সিং ও ফিলিং প্রক্রিয়ার শুরু থেকে শেষ পর্যন্ত ট্যাংক অনবরত নাড়তে থাকুন।' : 'Start mechanical or manual tank agitation and maintain it throughout the entire mixing and filling process.',
                color: 'bg-teal-600 text-white'
              },
              {
                letter: 'L',
                title: language === 'bn' ? 'তরল ফ্লোয়েবল ও সাসপেনশন কনসেন্ট্রেট (SC, SL, F)' : 'Liquid Flowables & Suspension Concentrates (SC, SL, F)',
                desc: language === 'bn' ? 'এরপর জলীয় তরল বালাইনাশক যোগ করুন। এগুলো পানিতে সহজে এবং সমানভাবে মিশে যায়।' : 'Add aqueous liquid products next. Because they are pre-dispersed in water carriers, they mix smoothly into the agitated water.',
                color: 'bg-blue-600 text-white'
              },
              {
                letter: 'E',
                title: language === 'bn' ? 'ইমালসিফাইয়েবল কনসেন্ট্রেট (EC, EW)' : 'Emulsifiable Concentrates (EC, EW)',
                desc: language === 'bn' ? 'এরপর তেলভিত্তিক বালাইনাশক মেশান। পাউডারের আগে EC মেশালে পাউডারের গায়ে তেলের প্রলেপ পড়ে তা আর দ্রবীভূত হতে পারে না।' : 'Add solvent/oil-based formulations next. They will form a cloudy milky emulsion. Adding EC before powders can coat powder granules with oil, preventing them from dissolving.',
                color: 'bg-purple-600 text-white'
              },
              {
                letter: 'S',
                title: language === 'bn' ? 'সারফ্যাক্ট্যান্ট, স্টিকার ও পাতা সার (Surfactants)' : 'Surfactants, Stickers & Foliar Fertilizers',
                desc: language === 'bn' ? 'সবশেষে স্টিকার, স্প্রেডার, মাইক্রোনিউট্রিয়েন্ট (জিঙ্ক, বোরন) যোগ করে বাকি পানি দিয়ে ট্যাংক পূর্ণ করুন।' : 'Add stickers, non-ionic spreaders, micronutrients (Zinc, Boron), or soluble salts last. Fill tank with remaining water to final volume.',
                color: 'bg-emerald-600 text-white'
              }
            ].map((step) => (
              <div key={step.letter} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${step.color} font-black text-xl flex items-center justify-center shrink-0 shadow-2xs`}>
                  {step.letter}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <h4 className="font-bold text-slate-900">
              {language === 'bn' ? '১৫ মিনিটের কাচের জার সামঞ্জস্য পরীক্ষা:' : 'The 15-Minute Glass Jar Compatibility Test:'}
            </h4>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'বড় ট্যাংকে মেশানোর আগে ৫০০ মিলি পানিতে কাচের জারে আনুপাতিক হারে রাসায়নিক মিশিয়ে ১৫ মিনিট রেখে দিন। যদি তাপ উৎপন্ন হয়, দলা বাঁধে বা তেলের স্তর আলাদা হয় তবে সেগুলো কখনোই একসাথে মেশানো যাবে না।'
                : 'Before mixing in a large tank, mix proportional amounts of the intended chemicals in 500 ml of water in a clear glass jar. Let stand for 15 minutes. If heat develops, clumping occurs, or an oil layer separates, the chemicals are physically incompatible and must not be tank-mixed.'}
            </p>
          </div>
        </div>
      )}

      {/* Chapter 5: PHI & Residue Compliance */}
      {activeChapter === 'phi' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase font-bold text-rose-700 tracking-wider">
              {language === 'bn' ? 'খাদ্য নিরাপত্তা ও বিষাক্ত অবশিষ্টাংশ কমপ্লায়েন্স' : 'Food Safety Compliance'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {language === 'bn' ? 'ফসল তোলার পূর্ববর্তী বিরতিকাল (PHI) ও সর্বোচ্চ অবশিষ্টাংশ সীমা (MRL)' : 'Pre-Harvest Intervals (PHI) & Maximum Residue Limits (MRL)'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'ফসল তোলার পূর্ববর্তী বিরতিকাল (PHI) হলো সর্বশেষ বালাইনাশক স্প্রে করা এবং ফসল তোলার মধ্যবর্তী আইনগতভাবে বাধ্যতামূলক ন্যূনতম দিনের সংখ্যা।'
                : 'The Pre-Harvest Interval (PHI) is the legal minimum number of days that must elapse between the last pesticide spray and crop harvest.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-950 text-sm">
                {language === 'bn' ? 'ধারাবাহিক ফসল (বেগুন, টমেটো, শিম)' : 'Continuous-Harvest Crops (Brinjal, Tomato, Beans)'}
              </h4>
              <p className="text-emerald-900 leading-relaxed">
                {language === 'bn'
                  ? 'যেসব সবজি প্রতি ৩-৪ দিন পরপর তোলা হয় সেগুলোর জন্য অতি স্বল্প PHI যুক্ত উপাদান আবশ্যক। দীর্ঘস্থায়ী ক্লোরপাইরিফস (২১ দিন) বা ম্যানকোজেব (৭ দিন) স্প্রে করলে ভোক্তাদের জন্য মারাত্মক স্বাস্থ্যঝুঁকি ও রপ্তানি নিষেধাজ্ঞা তৈরি হয়।'
                  : 'Vegetables picked every 3 to 4 days require active ingredients with ultra-short PHIs. Using Chlorpyrifos (21-day PHI) or Mancozeb (7-day PHI) on harvesting crops causes severe chemical toxicity in consumers and export bans.'}
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-emerald-950 font-medium">
                {language === 'bn' ? (
                  <>ধারাবাহিক ফসল তোলার জন্য প্রস্তাবিত: <strong>এমামেকটিন বেনজয়েট (৩ দিন PHI)</strong>, <strong>স্পিনোস্যাড (৩ দিন PHI)</strong>, <strong>কিউলিউর ফেরোমোন ফাঁদ (০ দিন PHI)</strong>।</>
                ) : (
                  <>Recommended for continuous harvest: <strong>Emamectin Benzoate (3-day PHI)</strong>, <strong>Spinosad (3-day PHI)</strong>, <strong>Cuelure Pheromone Traps (0-day PHI)</strong>.</>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <h4 className="font-bold text-blue-950 text-sm">
                {language === 'bn' ? 'দীর্ঘ মেয়াদী মাঠ ফসল (বোরো ধান, চা, আলু)' : 'Long-Cycle Field Crops (Boro Rice, Tea, Potato)'}
              </h4>
              <p className="text-blue-900 leading-relaxed">
                {language === 'bn'
                  ? 'বৃদ্ধির প্রাথমিক পর্যায়ে বা কুশি গজানোর সময় প্রয়োগকৃত উপাদান (যেমন: কারটাপ, কার্বোফিউরান) ফসল পাকার অনেক আগেই প্রাকৃতিকভাবে ভেঙে যায়।'
                  : 'Chemicals applied during early vegetative or tillering stages (such as Cartap, Carbofuran, or Pretilachlor) break down naturally via photolysis and microbial degradation long before grain harvest.'}
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 text-blue-950 font-medium">
                {language === 'bn'
                  ? 'ধানের ব্লাস্ট বা আলুর লেট ব্লাইটের জন্য দেরিতে স্প্রে করার ক্ষেত্রে ফসল তোলার অন্তত ১৪ দিন আগে স্প্রে শেষ করতে হবে।'
                  : 'Late-season sprays for blast or late blight must be cut off at least 14 days before harvest.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
