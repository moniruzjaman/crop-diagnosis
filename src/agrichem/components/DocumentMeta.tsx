import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AppTab } from '../types';

const THEME_COLOR: Record<AppTab, string> = {
  home: '#059669',
  database: '#059669',
  calculator: '#0d9488',
  rotation: '#2563eb',
  safety: '#475569',
  guidebook: '#15803d',
  alerts: '#d97706'
};

const TAB_META: Record<AppTab, {
  en: { title: string; description: string };
  bn: { title: string; description: string };
}> = {
  home: {
    en: {
      title: 'AgriChem Pro — Smart Crop Chemical & Pest Management Suite',
      description: 'All-in-one agricultural platform: 70+ DAE pesticides, Knapsack sprayer tank calculator, MoA resistance rotation planner, WHO safety protocols, and offline pocket guidebook.'
    },
    bn: {
      title: 'এগ্রিকেম প্রো — আধুনিক বালাই ব্যবস্থাপনা ও সঠিক রাসায়নিক মাত্রা সহায়িকা',
      description: 'বাংলাদেশের মাঠ ফসলের জন্য ডিএই নিবন্ধিত ৭০+ বালাইনাশক ডাটাবেস, ন্যাপস্যাক স্প্রেয়ার ট্যাংক ক্যালকুলেটর, প্রতিরোধ রোধে MoA রোটেশন ও বিনামূল্যে পকেট বুক ম্যানুয়াল।'
    }
  },
  database: {
    en: {
      title: 'AgriChem Pro — Crop Chemical Database',
      description: 'Find DAE-registered pesticides, MoA codes, formulations, PHI and target pests with registered dosage rates.'
    },
    bn: {
      title: 'এগ্রিকেম প্রো — রাসায়নিক ডাটাবেস',
      description: 'ফসল, বালাই, ট্রেড নাম ও MoA কোড দিয়ে ডিএই নিবন্ধিত বালাইনাশক খুঁজুন। পকেট বুক গাইড ডাউনলোড করুন।'
    }
  },
  calculator: {
    en: {
      title: 'AgriChem Pro — Dosage & Tank Mix Calculator',
      description: 'Knapsack sprayer tank calibration, dosage rates, water volume, and field area conversions.'
    },
    bn: {
      title: 'এগ্রিকেম প্রো — মাত্রা ক্যালকুলেটর',
      description: 'ন্যাপস্যাক স্প্রেয়ার ট্যাংক মিশ্রণ, পানির পরিমাণ ও জমির আয়তন হিসাব করুন।'
    }
  },
  rotation: {
    en: {
      title: 'AgriChem Pro — MoA Rotation Planner',
      description: 'Build IRAC, FRAC, and HRAC spray sequences that break resistance.'
    },
    bn: {
      title: 'এগ্রিকেম প্রো — MoA ঘূর্ণন পরিকল্পনা',
      description: 'প্রতিরোধ ভাঙতে IRAC, FRAC ও HRAC স্প্রে ক্রম তৈরি করুন।'
    }
  },
  safety: {
    en: {
      title: 'AgriChem Pro — Safety & PPE',
      description: 'WHO hazard bands, pre-spray PPE checklist, and first-aid protocols.'
    },
    bn: {
      title: 'এগ্রিকেম প্রো — নিরাপত্তা ও পিপিই',
      description: 'ডব্লিউএইচও বিপদ শ্রেণি, স্প্রে-পূর্ব পিপিই চেকলিস্ট ও প্রাথমিক চিকিৎসা।'
    }
  },
  guidebook: {
    en: {
      title: 'AgriChem Pro — Pocket Book Guide',
      description: 'Download the A5 field pocket book: calibration, W.A.L.E.S., PHI, and crop tables.'
    },
    bn: {
      title: 'এগ্রিকেম প্রো — পকেট বুক গাইড',
      description: 'A5 পকেট বুক ডাউনলোড করুন: ক্যালিব্রেশন, W.A.L.E.S., PHI ও ফসলভিত্তিক তালিকা।'
    }
  },
  alerts: {
    en: {
      title: 'AgriChem Pro — Regulatory Alerts',
      description: 'Seasonal pest warnings, restricted-use notices, and harvest-interval reminders.'
    },
    bn: {
      title: 'এগ্রিকেম প্রো — নিয়ন্ত্রক সতর্কতা',
      description: 'মৌসুমি বালাই সতর্কতা, নিষিদ্ধ তালিকা ও ফসল তোলার বিরতি।'
    }
  }
};

function upsertMeta(selector: string, attrs: Record<string, string>, createTag: 'meta' | 'link' = 'meta') {
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!el) {
    el = document.createElement(createTag);
    const [[key, value]] = Object.entries(attrs);
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (el && el.getAttribute(key) !== value) {
      el.setAttribute(key, value);
    }
  });
  return el;
}

function setNamedMeta(attr: 'name' | 'property', key: string, content: string) {
  upsertMeta(`meta[${attr}="${key}"]`, { [attr]: key, content });
}

function absUrl(path: string) {
  if (typeof window === 'undefined') return path;
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return path;
  }
}

export const DocumentMeta: React.FC<{ activeTab: AppTab }> = ({ activeTab }) => {
  const { language } = useLanguage();

  useEffect(() => {
    const copy = TAB_META[activeTab]?.[language] || TAB_META.database[language];
    const appName = language === 'bn' ? 'এগ্রিকেম প্রো' : 'AgriChem Pro';
    const theme = THEME_COLOR[activeTab] || '#059669';
    const iconPng = `/apple-touch-icon.png`;
    const iconSvg = `/favicon.svg`;
    const ogImage = '/icons/og-bn.svg';
    const ogImageAbs = absUrl(ogImage);

    document.title = copy.title;
    document.documentElement.lang = language === 'bn' ? 'bn' : 'en';

    setNamedMeta('name', 'description', copy.description);
    setNamedMeta('name', 'application-name', appName);
    setNamedMeta('name', 'apple-mobile-web-app-title', appName);
    setNamedMeta('name', 'apple-mobile-web-app-capable', 'yes');
    setNamedMeta('name', 'mobile-web-app-capable', 'yes');
    setNamedMeta('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
    setNamedMeta('name', 'theme-color', theme);
    setNamedMeta('name', 'msapplication-TileColor', theme);
    setNamedMeta('name', 'msapplication-TileImage', iconPng);

    setNamedMeta('property', 'og:title', copy.title);
    setNamedMeta('property', 'og:description', copy.description);
    setNamedMeta('property', 'og:type', 'website');
    setNamedMeta('property', 'og:locale', language === 'bn' ? 'bn_BD' : 'en_US');
    setNamedMeta('property', 'og:site_name', appName);
    setNamedMeta('property', 'og:image', ogImageAbs);
    setNamedMeta('property', 'og:image:alt', appName);
    setNamedMeta('property', 'og:image:width', '1200');
    setNamedMeta('property', 'og:image:height', '630');
    setNamedMeta('property', 'og:image:type', 'image/svg+xml');

    setNamedMeta('name', 'twitter:card', 'summary_large_image');
    setNamedMeta('name', 'twitter:title', copy.title);
    setNamedMeta('name', 'twitter:description', copy.description);
    setNamedMeta('name', 'twitter:image', ogImageAbs);

    // Schema.org WebApplication JSON-LD
    let scriptEl = document.head.querySelector('script[type="application/ld+json"]');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': appName,
      'applicationCategory': 'AgriculturalApplication',
      'operatingSystem': 'All',
      'description': copy.description,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'BDT'
      },
      'featureList': [
        'DAE Approved Pesticide Database',
        'Knapsack Sprayer Tank Dosage Calculator',
        'IRAC and FRAC Mode-of-Action Resistance Rotation',
        'WHO Toxicity Hazard Bands and PPE Checklist',
        'W.A.L.E.S. Tank Mixing Order Field Pocket Guidebook'
      ]
    };
    scriptEl.textContent = JSON.stringify(structuredData);

    upsertMeta('link[rel="icon"][type="image/svg+xml"]', { rel: 'icon', type: 'image/svg+xml', href: iconSvg }, 'link');
    upsertMeta('link[rel="icon"][type="image/png"]', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }, 'link');
    upsertMeta('link[rel="apple-touch-icon"]', { rel: 'apple-touch-icon', sizes: '180x180', href: iconPng }, 'link');
    upsertMeta('link[rel="manifest"]', { rel: 'manifest', href: '/manifest.json' }, 'link');

    document.documentElement.style.setProperty('--app-theme', theme);
  }, [activeTab, language]);

  return null;
};
