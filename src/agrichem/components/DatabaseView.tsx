import React, { useState, useMemo } from 'react';
import { ChemicalProduct } from '../types';
import { ProductCard } from './ProductCard';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  FileDown, 
  RotateCcw, 
  Sprout, 
  Bug, 
  Tag, 
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { exportCropGuidePDF } from '../utils/pdfExport';
import { useLanguage } from '../context/LanguageContext';

interface DatabaseViewProps {
  products: ChemicalProduct[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProduct: (product: ChemicalProduct) => void;
  onOpenCalculator: (product: ChemicalProduct) => void;
  onOpenSafety: (product: ChemicalProduct) => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onOpenCalculator,
  onOpenSafety
}) => {
  const { language, t, transCrop, transCat, transRisk, formatNum } = useLanguage();

  // Filter states
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedMoA, setSelectedMoA] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'phi' | 'reg'>('name');

  // Dynamic lists from product catalog
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.type));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const crops = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.crops.forEach((c) => set.add(c)));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const moaCodes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.moaCode) set.add(p.moaCode);
    });
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search query matches Trade Name, Common Active Ingredient, Registration Holder, Reg No, or Target Pests
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.tradeName.toLowerCase().includes(q);
        const matchesCommon = p.commonName.toLowerCase().includes(q);
        const matchesHolder = p.registrationHolder.toLowerCase().includes(q);
        const matchesReg = p.registrationNo.toLowerCase().includes(q);
        const matchesCrops = p.crops.some((c) => c.toLowerCase().includes(q) || transCrop(c).toLowerCase().includes(q));
        const matchesPests = p.pests.some((pest) => pest.toLowerCase().includes(q));
        const matchesMoA = (p.moaCode && p.moaCode.toLowerCase().includes(q)) || 
                           (p.moaGroup && p.moaGroup.toLowerCase().includes(q));

        if (!matchesName && !matchesCommon && !matchesHolder && !matchesReg && !matchesCrops && !matchesPests && !matchesMoA) {
          return false;
        }
      }

      // Category filter
      if (selectedType !== 'all' && p.type !== selectedType) {
        return false;
      }

      // Crop filter
      if (selectedCrop !== 'all' && !p.crops.includes(selectedCrop)) {
        return false;
      }

      // MoA code filter
      if (selectedMoA !== 'all' && p.moaCode !== selectedMoA) {
        return false;
      }

      // Risk filter
      if (selectedRisk !== 'all' && p.resistanceRisk !== selectedRisk) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.tradeName.localeCompare(b.tradeName);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'phi') return (a.phiDays || 0) - (b.phiDays || 0);
      if (sortBy === 'reg') return a.registrationNo.localeCompare(b.registrationNo);
      return 0;
    });
  }, [products, searchQuery, selectedType, selectedCrop, selectedMoA, selectedRisk, sortBy, transCrop]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCrop('all');
    setSelectedMoA('all');
    setSelectedRisk('all');
    setSortBy('name');
  };

  const hasActiveFilters = searchQuery !== '' || selectedType !== 'all' || selectedCrop !== 'all' || selectedMoA !== 'all' || selectedRisk !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search input on mobile and secondary row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="db-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              id="db-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="name">{t('sort_name')}</option>
              <option value="type">{t('sort_type')}</option>
              <option value="phi">{t('sort_phi')}</option>
              <option value="reg">{t('sort_reg')}</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 font-semibold transition"
                title={t('clear_filters')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> {language === 'bn' ? 'বালাইনাশক শ্রেণী:' : 'Category:'}
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedType === cat
                  ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {transCat(cat)}
            </button>
          ))}
        </div>

        {/* Granular Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Crop Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              {language === 'bn' ? 'ফসল অনুযায়ী ফিল্টার' : 'Filter by Crop'}
            </label>
            <select
              id="filter-crop-select"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">
                {language === 'bn' ? 'সকল ফসল (ধান, আলু, শাকসবজি...)' : 'All Crops (Rice, Potato, Vegetables...)'}
              </option>
              {crops.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>
                  {transCrop(c)} ({c})
                </option>
              ))}
            </select>
          </div>

          {/* MoA Code Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              {language === 'bn' ? 'ক্রিয়া কৌশল কোড (IRAC / FRAC / HRAC)' : 'Filter by MoA Code (IRAC / FRAC / HRAC)'}
            </label>
            <select
              id="filter-moa-select"
              value={selectedMoA}
              onChange={(e) => setSelectedMoA(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t('filter_all_moa')}</option>
              {moaCodes.filter((m) => m !== 'all').map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Resistance Risk Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              {language === 'bn' ? 'প্রতিরোধের ঝুঁকি মাত্রা' : 'Resistance Risk'}
            </label>
            <select
              id="filter-risk-select"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t('filter_all_risks')}</option>
              <option value="High">{transRisk('High')}</option>
              <option value="Medium">{transRisk('Medium')}</option>
              <option value="Low">{transRisk('Low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <span>
            {t('showing_results')}{' '}
            <strong className="text-slate-900 font-bold">{formatNum(filteredProducts.length)}</strong> {t('of_total')}{' '}
            {formatNum(products.length)} {t('registered_chemicals')}
          </span>
          {hasActiveFilters && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {language === 'bn' ? 'ফিল্টারকৃত' : 'Filtered'}
            </span>
          )}
        </div>

        {selectedCrop !== 'all' && filteredProducts.length > 0 && (
          <button
            onClick={() => exportCropGuidePDF(selectedCrop, filteredProducts)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold shadow-2xs transition cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === 'bn' ? `${transCrop(selectedCrop)} গাইড ডাউনলোড (PDF)` : `Export ${selectedCrop} Dossier (PDF)`}
            </span>
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onOpenCalculator={onOpenCalculator}
              onOpenSafety={onOpenSafety}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">{t('no_results_title')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('no_results_desc')}
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
          >
            {t('clear_filters')}
          </button>
        </div>
      )}
    </div>
  );
};
