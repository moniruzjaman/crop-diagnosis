import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  getTranslation, 
  translateCrop, 
  translateCategory, 
  translateRisk, 
  formatNumberWithLang,
  toBnNumber 
} from '../utils/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  transCrop: (crop: string) => string;
  transCat: (cat: string) => string;
  transRisk: (risk: string) => string;
  formatNum: (num: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agrichem_lang') as Language;
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agrichem_lang', lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  const transCrop = (crop: string): string => {
    return translateCrop(crop, language);
  };

  const transCat = (cat: string): string => {
    return translateCategory(cat, language);
  };

  const transRisk = (risk: string): string => {
    return translateRisk(risk, language);
  };

  const formatNum = (num: number | string): string => {
    return formatNumberWithLang(num, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        transCrop,
        transCat,
        transRisk,
        formatNum
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
