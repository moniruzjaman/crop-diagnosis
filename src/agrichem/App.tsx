import React, { useState, useEffect } from 'react';
import { ChemicalProduct, RegulatoryAlert, AppTab } from './types';
import { PESTICIDES_DATABASE } from './data/pesticidesData';
import { INITIAL_REGULATORY_ALERTS } from './data/regulatoryAlertsData';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ShareModal } from './components/ShareModal';
import { DatabaseView } from './components/DatabaseView';
import { DosageCalculatorModal } from './components/DosageCalculatorModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SafetyChecklistModal } from './components/SafetyChecklistModal';
import { RotationPlanner } from './components/RotationPlanner';
import { SafetyView } from './components/SafetyView';
import { Guidebook } from './components/Guidebook';
import { NotificationCenter } from './components/NotificationCenter';
import { DocumentMeta } from './components/DocumentMeta';
import { useLanguage } from './context/LanguageContext';
import { 
  Leaf, 
  ShieldCheck, 
  BookOpen, 
  RotateCw, 
  Calculator, 
  Bell, 
  FileDown, 
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Share2
} from 'lucide-react';

export default function App() {
  const { language } = useLanguage();
  const [products] = useState<ChemicalProduct[]>(PESTICIDES_DATABASE);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Modals state
  const [detailProduct, setDetailProduct] = useState<ChemicalProduct | null>(null);
  const [calcProduct, setCalcProduct] = useState<ChemicalProduct | null>(null);
  const [safetyProduct, setSafetyProduct] = useState<ChemicalProduct | null>(null);

  // Alerts & Notifications state with localStorage persistence
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agrichem_alerts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse alerts from storage:', e);
        }
      }
    }
    return INITIAL_REGULATORY_ALERTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrichem_alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  const handleMarkAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  };

  const handleAddCustomAlert = (alert: RegulatoryAlert) => {
    setAlerts((prev) => [alert, ...prev]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Tab & SEO Meta */}
      <DocumentMeta activeTab={activeTab} />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadAlertCount={unreadAlertCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenShare={() => setIsShareModalOpen(true)}
        totalProductsCount={187}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            products={products}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectCropFilter={(crop) => {
              setSearchQuery(crop);
              setActiveTab('database');
            }}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            totalProductsCount={187}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseView
            products={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={(p) => setDetailProduct(p)}
            onOpenCalculator={(p) => setCalcProduct(p)}
            onOpenSafety={(p) => setSafetyProduct(p)}
          />
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600" />
                  {language === 'bn' ? 'ইন্টারেক্টিভ মাঠপর্যায়ের মাত্রা ও ট্যাংক মিক্সিং স্টেশন' : 'Interactive Field Dosage & Tank Mix Station'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'bn' 
                    ? 'ন্যাপস্যাক স্প্রেয়ার ট্যাংক, পানির পরিমাণ এবং জমির আয়তন অনুযায়ী নির্ভুল মাত্রা হিসাব করতে যেকোনো নিবন্ধিত বালাইনাশক নির্বাচন করুন।' 
                    : 'Select any registered chemical to calculate precise knapsack tank mix rates, water volume, and area conversions.'}
                </p>
              </div>

              <button
                onClick={() => setCalcProduct(products[0])}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                {language === 'bn' ? 'ক্যালকুলেটর ডায়ালগ খুলুন' : 'Launch Knapsack Calculator Dialog'}
              </button>
            </div>

            {/* Render calculator directly */}
            <DosageCalculatorModal
              products={products}
              selectedProduct={calcProduct || products[0]}
              onClose={() => setActiveTab('database')}
              onSelectProduct={(p) => setCalcProduct(p)}
            />
          </div>
        )}

        {activeTab === 'rotation' && (
          <RotationPlanner products={products} />
        )}

        {activeTab === 'safety' && (
          <SafetyView
            products={products}
            onOpenSafetyModal={(p) => setSafetyProduct(p)}
          />
        )}

        {activeTab === 'guidebook' && (
          <Guidebook products={products} />
        )}

        {activeTab === 'alerts' && (
          <NotificationCenter
            alerts={alerts}
            onMarkRead={handleMarkAlertRead}
            onAddCustomAlert={handleAddCustomAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        )}
      </main>

      {/* Global Modals */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOpenDosageCalculator={(p) => {
            setDetailProduct(null);
            setCalcProduct(p);
          }}
        />
      )}

      {calcProduct && activeTab !== 'calculator' && (
        <DosageCalculatorModal
          products={products}
          selectedProduct={calcProduct}
          onClose={() => setCalcProduct(null)}
          onSelectProduct={(p) => setCalcProduct(p)}
        />
      )}

      {safetyProduct && (
        <SafetyChecklistModal
          product={safetyProduct}
          onClose={() => setSafetyProduct(null)}
        />
      )}

      {/* Social & Meta Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeTab={activeTab}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {language === 'bn' ? 'অ্যাগ্রিকেম প্রো — ফিল্ড কন্ট্রোলস ও ডাটাবেস গাইডবুক' : 'AgriChem Pro — Field Controls & Database Guidebook'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE) অনুমোদিত অফিসিয়াল রেফারেন্স ডাটাবেস' : 'Department of Agricultural Extension (DAE) Official Reference Data'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button onClick={() => setActiveTab('home')} className="hover:text-emerald-700 cursor-pointer font-bold text-slate-800">
              {language === 'bn' ? 'হোম' : 'Home'}
            </button>
            <button onClick={() => setActiveTab('database')} className="hover:text-emerald-700 cursor-pointer">
              {language === 'bn' ? 'রাসায়নিক ডিরেক্টরি' : 'Chemical Directory'}
            </button>
            <button onClick={() => setActiveTab('rotation')} className="hover:text-emerald-700 cursor-pointer">
              {language === 'bn' ? 'MoA ঘূর্ণন' : 'MoA Rotation'}
            </button>
            <button onClick={() => setActiveTab('safety')} className="hover:text-emerald-700 cursor-pointer">
              {language === 'bn' ? 'পিপিই চেকলিস্ট' : 'PPE Checklists'}
            </button>
            <button onClick={() => setActiveTab('guidebook')} className="hover:text-emerald-700 cursor-pointer">
              {language === 'bn' ? 'ফিল্ড ক্যালিব্রেশন' : 'Field Calibration'}
            </button>
            <button onClick={() => setActiveTab('alerts')} className="hover:text-emerald-700 cursor-pointer">
              {language === 'bn' ? 'নিয়ন্ত্রক নোটিফিকেশন' : 'Compliance Alerts'}
            </button>
            <button 
              onClick={() => setIsShareModalOpen(true)} 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold border border-emerald-200 cursor-pointer transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
