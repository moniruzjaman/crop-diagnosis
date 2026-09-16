import React, { useState } from 'react';
import { RegulatoryAlert } from '../types';
import { 
  Bell, 
  BellRing, 
  ShieldAlert, 
  Calendar, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Send, 
  Plus, 
  Trash2, 
  Clock, 
  Sprout, 
  Tag, 
  Sparkles 
} from 'lucide-react';
import { 
  requestPushPermission, 
  triggerAlertNotification, 
  sendPushNotification,
  checkNotificationSupport 
} from '../utils/notifications';
import { useLanguage } from '../context/LanguageContext';

interface NotificationCenterProps {
  alerts: RegulatoryAlert[];
  onMarkRead: (id: string) => void;
  onAddCustomAlert: (alert: RegulatoryAlert) => void;
  onDeleteAlert?: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  onMarkRead,
  onAddCustomAlert,
  onDeleteAlert
}) => {
  const { language, transCrop, formatNum } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'regulatory' | 'seasonal'>('all');
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for creating custom seasonal/compliance alert
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'regulatory' | 'seasonal'>('seasonal');
  const [newSeverity, setNewSeverity] = useState<'high' | 'medium' | 'info'>('medium');
  const [newCrops, setNewCrops] = useState('Rice');
  const [newSummary, setNewSummary] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRequestPermission = async () => {
    const res = await requestPushPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      showToast(
        language === 'bn' 
          ? 'পুশ নোটিফিকেশন সফলভাবে চালু করা হয়েছে!' 
          : 'Push notifications successfully enabled on your device!'
      );
      sendPushNotification(
        language === 'bn' 
          ? 'এগ্রিকেম প্রো: সরকারি নির্দেশিকা ও মৌসুমী সতর্কতা সক্রিয়' 
          : 'AgriChem Compliance & Seasonal Alerts Activated', 
        {
          body: language === 'bn'
            ? 'আপনি গুরুত্বপূর্ণ সরকারি প্রবিধান ও আঞ্চলিক বালাই আবির্ভাব সতর্কতা পাবেন।'
            : 'You will receive critical regulatory updates and regional pest emergence warnings.'
        }
      );
    } else {
      showToast(
        language === 'bn' 
          ? 'ব্রাউজারে নোটিফিকেশন অনুমতি বাতিল বা ব্লক করা হয়েছে।' 
          : 'Notification permission was declined or blocked in browser settings.'
      );
    }
  };

  const handleTriggerTestPush = () => {
    const success = sendPushNotification(
      language === 'bn' 
        ? 'এগ্রিকেম নমুনা সতর্কতা: মৌসুমী বালাই পরামর্শ' 
        : 'AgriChem Test Alert: Seasonal Pest Advisory', 
      {
        body: language === 'bn'
          ? 'আপনার এলাকার ধানে বাদামি গাছফড়িং (BPH) দেখা গেছে। গোছা ফাঁক করে গাছের গোড়া পরীক্ষা করুন।'
          : 'Brown Plant Hopper (BPH) activity reported in your regional rice clusters. Inspect plant base.'
      }
    );
    if (success) {
      showToast(language === 'bn' ? 'পুশ অ্যালার্ট আপনার ডিভাইসে পাঠানো হয়েছে!' : 'Push alert sent to your notification tray!');
    } else {
      showToast(
        language === 'bn' 
          ? 'সতর্কতা: ডিভাইসে সরাসরি পুশ পেতে উপরের বাটন চেপে ব্রাউজার নোটিফিকেশন অনুমতি দিন।' 
          : 'Notice: Displaying in-app alert. Enable browser push permission above for desktop/mobile tray push.'
      );
    }
  };

  const handleSendSingleAlert = (alert: RegulatoryAlert) => {
    onMarkRead(alert.id);
    const pushed = triggerAlertNotification(alert);
    if (pushed) {
      showToast(language === 'bn' ? `পুশ নোটিফিকেশন পাঠানো হয়েছে: "${alert.title}"` : `Push alert sent: "${alert.title}"`);
    } else {
      showToast(language === 'bn' ? `সতর্কবার্তা সক্রিয় করা হয়েছে: "${alert.title}"` : `Alert triggered: "${alert.title}"`);
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const custom: RegulatoryAlert = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      severity: newSeverity,
      date: new Date().toISOString().split('T')[0],
      targetCrops: newCrops.split(',').map((c) => c.trim()),
      summary: newSummary,
      details: newDetails || newSummary,
      actionRequired: language === 'bn' ? 'এগ্রিকেম গাইডবুকের কৃষিবিদ পরামর্শ মেনে চলুন।' : 'Follow agronomic recommendations in the AgriChem Guidebook.',
      read: false
    };

    onAddCustomAlert(custom);
    triggerAlertNotification(custom);
    showToast(language === 'bn' ? 'নতুন মৌসুমী সতর্কতা নির্ধারিত ও পাঠানো হয়েছে!' : 'New seasonal application alert scheduled and dispatched!');
    setNewTitle('');
    setNewSummary('');
    setNewDetails('');
    setShowAddForm(false);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (selectedFilter === 'all') return true;
    return a.category === selectedFilter;
  });

  return (
    <div id="notifications-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border border-slate-700">
          <BellRing className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-emerald-200 text-xs font-semibold mb-3">
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            {language === 'bn' ? 'সরকারি নজরদারি ও ফিল্ড টেলিমেট্রি পুশ অ্যালার্ট' : 'Compliance Watch & Field Telemetry Alerts'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {language === 'bn' ? 'সরকারি নির্দেশিকা, কমপ্লায়েন্স ও মৌসুমী স্প্রে সতর্কতা' : 'Regulatory Compliance Updates & Seasonal Alerts'}
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {language === 'bn'
              ? 'বালাইনাশক নিয়ন্ত্রণ সংক্রান্ত সরকারি আদেশ, নিষিদ্ধ রাসায়নিকের তদারকি, পরাগায়নকারী মৌমাছি সুরক্ষা সময় এবং আবহাওয়ানির্ভর মৌসুমী বালাই আবির্ভাবের জরুরি পুশ নোটিফিকেশন।'
              : 'Real-time regulatory mandates, restricted use enforcement, pollinator protective hours, and meteorological seasonal pest emergence alerts for field agronomists.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {permissionStatus === 'granted' ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {language === 'bn' ? 'ব্রাউজার পুশ নোটিফিকেশন সক্রিয় রয়েছে' : 'Browser Push Notifications Active'}
              </div>
            ) : (
              <button
                id="enable-push-permission-btn"
                onClick={handleRequestPermission}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিভাইসে পুশ নোটিফিকেশন চালু করুন' : 'Enable Device Push Notifications'}</span>
              </button>
            )}

            <button
              id="test-push-alert-btn"
              onClick={handleTriggerTestPush}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'নমুনা পুশ অ্যালার্ট পাঠান' : 'Send Sample Field Alert'}</span>
            </button>

            <button
              id="new-alert-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>
                {showAddForm 
                  ? (language === 'bn' ? 'বাতিল করুন' : 'Cancel New Alert') 
                  : (language === 'bn' ? 'নতুন কাস্টম সতর্কতা যুক্ত করুন' : 'Schedule Custom Alert')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Alert Drawer / Form */}
      {showAddForm && (
        <form onSubmit={handleCreateAlert} className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'নতুন কাস্টম প্রবিধান বা মৌসুমী সতর্কতা নির্ধারণ' : 'Schedule Custom Regulatory or Seasonal Alert'}
            </h3>
            <span className="text-xs text-slate-400">
              {language === 'bn' ? 'মাঠকর্মী ও স্প্রে টিমে প্রেরণযোগ্য' : 'Pushed to local agronomy team'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {language === 'bn' ? 'সতর্কবার্তার শিরোনাম' : 'Alert Title'}
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: কুমিল্লা অঞ্চলে ধানে প্রাথমিক ব্লাস্ট রোগের প্রাদুর্ভাব' : 'e.g., Early Blast Sighting Warning in Comilla District'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="seasonal">{language === 'bn' ? 'মৌসুমী প্রয়োগ সতর্কতা' : 'Seasonal Application Alert'}</option>
                <option value="regulatory">{language === 'bn' ? 'সরকারি প্রবিধান ও কমপ্লায়েন্স' : 'Regulatory Compliance Notice'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {language === 'bn' ? 'প্রযোজ্য ফসল (কমা দিয়ে লিখুন)' : 'Target Crops (comma separated)'}
              </label>
              <input
                type="text"
                value={newCrops}
                onChange={(e) => setNewCrops(e.target.value)}
                placeholder="Rice, Potato, Jute"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {language === 'bn' ? 'গুরুত্বের মাত্রা (Severity)' : 'Severity Level'}
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="high">{language === 'bn' ? 'উচ্চ গুরুত্ব (জরুরি পদক্ষেপ আবশ্যক)' : 'High Severity (Immediate Attention)'}</option>
                <option value="medium">{language === 'bn' ? 'মাঝারি গুরুত্ব (পরামর্শ)' : 'Medium Severity (Advisory)'}</option>
                <option value="info">{language === 'bn' ? 'সাধারণ তথ্য' : 'Informational Notification'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {language === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ' : 'Brief Summary'}
            </label>
            <input
              type="text"
              required
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder={language === 'bn' ? '১ লাইনের সংক্ষিপ্ত নির্দেশনামূলক বিবরণ' : 'Short 1-sentence action summary'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {language === 'bn' ? 'বিস্তারিত দিকনির্দেশনা ও করণীয়' : 'Detailed Guidance & Instructions'}
            </label>
            <textarea
              rows={2}
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
              placeholder={language === 'bn' ? 'প্রস্তাবিত বালাইনাশক, স্প্রে সময় ও সতর্কতা...' : 'Recommended actions, chemicals, and timing...'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              {language === 'bn' ? 'সংরক্ষণ ও পুশ সম্প্রচার' : 'Broadcast & Save Alert'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'bn' ? `সকল বার্তা (${formatNum(alerts.length)})` : `All Alerts (${alerts.length})`}
          </button>
          <button
            onClick={() => setSelectedFilter('regulatory')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedFilter === 'regulatory'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'bn' 
              ? `সরকারি প্রবিধান (${formatNum(alerts.filter((a) => a.category === 'regulatory').length)})` 
              : `Regulatory Compliance (${alerts.filter((a) => a.category === 'regulatory').length})`}
          </button>
          <button
            onClick={() => setSelectedFilter('seasonal')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedFilter === 'seasonal'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'bn' 
              ? `মৌসুমী পূর্বাভাস (${formatNum(alerts.filter((a) => a.category === 'seasonal').length)})` 
              : `Seasonal Early Warnings (${alerts.filter((a) => a.category === 'seasonal').length})`}
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isHigh = alert.severity === 'high';
          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                isHigh 
                  ? 'border-amber-300 bg-amber-50/40 shadow-xs' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    alert.category === 'regulatory' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {alert.category === 'regulatory' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <Sprout className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        isHigh ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {alert.severity === 'high' 
                          ? (language === 'bn' ? 'জরুরি অগ্রাধিকার' : 'High Priority') 
                          : alert.severity === 'medium'
                          ? (language === 'bn' ? 'পরামর্শমূলক' : 'Medium Advisory')
                          : (language === 'bn' ? 'সাধারণ তথ্য' : 'Information')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {alert.category === 'regulatory' 
                          ? (language === 'bn' ? 'সরকারি প্রবিধান' : 'Regulatory') 
                          : (language === 'bn' ? 'মৌসুমী সতর্কতা' : 'Seasonal')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        • {formatNum(alert.date)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {alert.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                      {alert.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSendSingleAlert(alert)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                    title={language === 'bn' ? 'পুশ অ্যালার্ট পাঠান' : 'Send push alert notification'}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পুশ অ্যালার্ট পাঠান' : 'Send Push Alert'}</span>
                  </button>

                  {onDeleteAlert && alert.id.startsWith('custom-') && (
                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete reminder'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Detail Paragraph */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/70 text-xs text-slate-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-100 space-y-2">
                <p>{alert.details}</p>
                {alert.actionRequired && (
                  <p className="font-medium text-emerald-950 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                    <strong>{language === 'bn' ? 'জরুরি পদক্ষেপ:' : 'Action Required:'}</strong> {alert.actionRequired}
                  </p>
                )}
              </div>

              {/* Tag Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                {alert.targetCrops && alert.targetCrops.length > 0 && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="font-semibold text-slate-400">{language === 'bn' ? 'ফসল:' : 'Crops:'}</span>
                    {alert.targetCrops.map((c, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {transCrop(c)}
                      </span>
                    ))}
                  </div>
                )}

                {alert.targetChemicals && alert.targetChemicals.length > 0 && (
                  <div className="flex items-center gap-1 text-slate-500 ml-auto">
                    <span className="font-semibold text-slate-400">{language === 'bn' ? 'রাসায়নিক:' : 'Chemicals:'}</span>
                    {alert.targetChemicals.map((chem, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                        {chem}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
