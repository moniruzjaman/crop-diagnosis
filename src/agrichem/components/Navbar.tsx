import React from 'react';
import { 
  Home,
  Leaf, 
  Database, 
  Calculator, 
  RotateCw, 
  ShieldCheck, 
  BookOpen, 
  Bell, 
  BellRing,
  Download,
  Search,
  Languages,
  Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AppTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  onOpenShare: () => void;
  totalProductsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  unreadAlertCount,
  onOpenAlerts,
  onOpenShare,
  totalProductsCount
}) => {
  const { language, toggleLanguage, t, formatNum } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-white">{t('app_banner')}</span>
          <span className="hidden sm:inline text-emerald-300">|</span>
          <span className="hidden sm:inline text-emerald-300">{t('app_tagline')}</span>
        </div>
        <div className="flex items-center gap-3 text-emerald-200">
          <span className="font-semibold text-white bg-emerald-800/80 px-2 py-0.5 rounded text-[11px]">
            {formatNum(totalProductsCount)} {t('registered_count_suffix')}
          </span>
          <span className="hidden md:inline">{t('offline_ready')}</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo / Brand */}
          <div 
            id="brand-logo"
            className="flex items-center gap-3 cursor-pointer select-none shrink-0" 
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none">{t('app_title')}</span>
                <span className="hidden sm:inline-block text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {language === 'bn' ? 'প্রো' : 'Pro'}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">{t('app_subtitle')}</p>
            </div>
          </div>

          {/* Quick Search in Header (visible on larger screens) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="header-global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Share Platform Button */}
            <button
              id="header-share-btn"
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-800 font-semibold text-xs transition shadow-2xs cursor-pointer select-none"
              title={language === 'bn' ? 'সোশ্যাল মিডিয়ায় বা সহকর্মীদের সাথে শেয়ার করুন' : 'Share AgriChem Pro'}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{t('btn_share')}</span>
            </button>

            {/* PWA In-App Install Button */}
            <PWAInstallButton />

            {/* Bangla / English Toggle Button */}
            <button
              id="language-toggle-btn"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 font-bold text-xs transition shadow-2xs cursor-pointer select-none"
              title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন (Switch to Bangla)' : 'Switch interface to English'}
              aria-label="Toggle language between Bangla and English"
            >
              <Languages className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="hidden sm:inline font-bold tracking-tight">{language === 'en' ? 'বাংলা' : 'English'}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-200/80 text-emerald-800 uppercase font-semibold">
                {language === 'en' ? 'BN' : 'EN'}
              </span>
            </button>

            {/* Push Notifications & Alerts Button */}
            <button
              id="header-alerts-btn"
              onClick={onOpenAlerts}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
              title="Regulatory compliance updates & seasonal alerts"
            >
              {unreadAlertCount > 0 ? (
                <BellRing className="w-5 h-5 text-amber-600 animate-bounce" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              {unreadAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {formatNum(unreadAlertCount)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none text-sm font-medium border-t border-slate-100 pt-2">
          {/* Home Tab */}
          <button
            id="tab-btn-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{t('tab_home')}</span>
          </button>

          <button
            id="tab-btn-database"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t('tab_database')}</span>
          </button>

          <button
            id="tab-btn-calculator"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{t('tab_calculator')}</span>
          </button>

          <button
            id="tab-btn-rotation"
            onClick={() => setActiveTab('rotation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'rotation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>{t('tab_rotation')}</span>
          </button>

          <button
            id="tab-btn-safety"
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'safety'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('tab_safety')}</span>
          </button>

          <button
            id="tab-btn-guidebook"
            onClick={() => setActiveTab('guidebook')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'guidebook'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('tab_guidebook')}</span>
          </button>

          <button
            id="tab-btn-alerts"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{t('tab_alerts')}</span>
            {unreadAlertCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'alerts' ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {formatNum(unreadAlertCount)}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
