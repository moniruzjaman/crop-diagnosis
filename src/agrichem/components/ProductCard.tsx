import React from 'react';
import { ChemicalProduct } from '../types';
import { 
  Calculator, 
  ShieldCheck, 
  FileDown, 
  Info, 
  Clock, 
  Bug, 
  Sprout, 
  AlertTriangle,
  Building2,
  Tag
} from 'lucide-react';
import { exportSingleProductPDF } from '../utils/pdfExport';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: ChemicalProduct;
  onSelectProduct: (product: ChemicalProduct) => void;
  onOpenCalculator: (product: ChemicalProduct) => void;
  onOpenSafety: (product: ChemicalProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOpenCalculator,
  onOpenSafety
}) => {
  const { language, transCat, transRisk, transCrop, formatNum } = useLanguage();

  const getCategoryBadgeClass = (type: ChemicalProduct['type']) => {
    switch (type) {
      case 'Insecticide':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Fungicide':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Herbicide':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Miticide':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Bio Pesticide':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Stored Grain':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Rodenticide':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(product.type)}`}>
            {transCat(product.type)}
          </span>
          <div className="flex items-center gap-1.5">
            {product.moaCode && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-white tracking-wide">
                {product.moaCode}
              </span>
            )}
            {product.resistanceRisk && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getRiskColor(product.resistanceRisk)}`}>
                {transRisk(product.resistanceRisk)} {language === 'bn' ? 'ঝুঁকি' : 'Risk'}
              </span>
            )}
          </div>
        </div>

        {/* Product Names */}
        <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
          {product.tradeName}
        </h3>
        <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{product.commonName}</span>
        </p>

        {/* Reg & Manufacturer */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{language === 'bn' ? 'নিবন্ধন নং:' : 'Reg No:'}</span>
            <span className="font-mono font-medium text-slate-700">{product.registrationNo}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-400 shrink-0">{language === 'bn' ? 'কোম্পানি:' : 'Holder:'}</span>
            <span className="font-medium text-slate-700 text-right truncate" title={product.registrationHolder}>
              {product.registrationHolder}
            </span>
          </div>
        </div>

        {/* Crops & Targets */}
        <div className="mt-3 space-y-2">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <Sprout className="w-3 h-3 text-emerald-600" />
              {language === 'bn' ? 'অনুমোদিত ফসল' : 'Recommended Crops'}
            </span>
            <div className="flex flex-wrap gap-1">
              {product.crops.slice(0, 4).map((c, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {transCrop(c)}
                </span>
              ))}
              {product.crops.length > 4 && (
                <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  +{formatNum(product.crops.length - 4)} {language === 'bn' ? 'টি আরও' : 'more'}
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <Bug className="w-3 h-3 text-amber-600" />
              {language === 'bn' ? 'লক্ষ্য বালাই / রোগ / আগাছা' : 'Target Pests / Diseases / Weeds'}
            </span>
            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
              {product.pests.join(', ')}
            </p>
          </div>
        </div>

        {/* Dosage Rate Highlight */}
        <div className="mt-4 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-800 tracking-wider">
              {language === 'bn' ? 'অনুমোদিত মাত্রা' : 'Registered Dosage'}
            </span>
            <p className="text-xs font-bold text-emerald-950 truncate max-w-[200px]" title={product.dosageRate}>
              {product.dosageRate}
            </p>
          </div>
          {product.phiDays ? (
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-slate-400" /> {language === 'bn' ? 'তোলার ব্যবধান' : 'PHI'}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {language === 'bn' ? `${formatNum(product.phiDays)} দিন` : `${product.phiDays} Days`}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-4 gap-1.5">
        <button
          id={`btn-calc-${product.id}`}
          onClick={() => onOpenCalculator(product)}
          className="flex flex-col items-center justify-center p-1.5 text-xs text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition cursor-pointer"
          title="Calculate field dosage and tank mix"
        >
          <Calculator className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span className="text-[10px] font-medium">{language === 'bn' ? 'মাত্রা হিসাব' : 'Dosage'}</span>
        </button>

        <button
          id={`btn-safety-${product.id}`}
          onClick={() => onOpenSafety(product)}
          className="flex flex-col items-center justify-center p-1.5 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 transition cursor-pointer"
          title="Safety precautions and PPE checklist"
        >
          <ShieldCheck className="w-4 h-4 text-amber-600 mb-0.5" />
          <span className="text-[10px] font-medium">{language === 'bn' ? 'সুরক্ষা' : 'Safety'}</span>
        </button>

        <button
          id={`btn-pdf-${product.id}`}
          onClick={() => exportSingleProductPDF(product)}
          className="flex flex-col items-center justify-center p-1.5 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition cursor-pointer"
          title="Export offline field card PDF"
        >
          <FileDown className="w-4 h-4 text-blue-600 mb-0.5" />
          <span className="text-[10px] font-medium">{language === 'bn' ? 'কার্ড PDF' : 'PDF Card'}</span>
        </button>

        <button
          id={`btn-details-${product.id}`}
          onClick={() => onSelectProduct(product)}
          className="flex flex-col items-center justify-center p-1.5 text-xs bg-slate-900 text-white hover:bg-emerald-700 rounded-lg transition cursor-pointer"
          title="View full chemical dossier"
        >
          <Info className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium">{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
        </button>
      </div>
    </div>
  );
};
