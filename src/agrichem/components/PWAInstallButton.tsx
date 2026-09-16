import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer select-none"
        title={language === 'bn' ? 'ফোনে বা কম্পিউটারে অ্যাপটি ইনস্টল করুন' : 'Install app on phone or desktop'}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-emerald-600/40 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition shadow-xs cursor-pointer select-none"
          title={language === 'bn' ? 'আইফোনে ইনস্টল করুন' : 'Install on iPhone/iPad'}
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">{language === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'bn' ? 'আইফোন / আইপ্যাডে ইনস্টল করুন' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>{language === 'bn' ? 'সাফারি ব্রাউজারের নিচের শেয়ার বাটনে (Share icon) চাপুন।' : 'Tap the Share button in the Safari toolbar.'}</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>{language === 'bn' ? 'মেনু স্ক্রোল করে "Add to Home Screen" নির্বাচন করুন।' : 'Scroll down and tap "Add to Home Screen".'}</span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-semibold text-white transition shadow-sm"
              >
                {language === 'bn' ? 'ঠিক আছে' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
