import React, { useState } from 'react';
import { AppSettings } from '../types';
import { saveSettings } from '../services/storage';
import { Moon, Sun, Clock, Globe, CheckCircle2, Heart } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onTriggerRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTriggerRefresh,
}) => {
  const [interval, setIntervalVal] = useState(settings.autoRefreshInterval);
  const [numberFormat, setNumberFormat] = useState<'persian' | 'english'>(
    settings.numberFormat || 'persian'
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    const updated: AppSettings = {
      ...settings,
      autoRefreshInterval: interval,
      autoRefreshEnabled: interval > 0,
      numberFormat,
    };
    onUpdateSettings(updated);
    saveSettings(updated);
    setSaveStatus('تنظیمات با موفقیت ذخیره شد.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClearCache = () => {
    localStorage.clear();
    setSaveStatus('حافظه موقت پاکسازی شد.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-5 pb-28 animate-fadeIn max-w-2xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          تنظیمات برنامه
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          شخصی‌سازی ظاهر، زمان‌بندی بروزرسانی و فرمت اعداد
        </p>
      </div>

      {saveStatus && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Theme Section */}
      <div className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>پوسته و تم نمایشی</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              const updated = { ...settings, theme: 'dark' as const };
              onUpdateSettings(updated);
              saveSettings(updated);
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              settings.theme === 'dark'
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-500 dark:text-amber-400 shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>حالت تاریک (Dark)</span>
          </button>

          <button
            onClick={() => {
              const updated = { ...settings, theme: 'light' as const };
              onUpdateSettings(updated);
              saveSettings(updated);
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              settings.theme === 'light'
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>حالت روشن (Light)</span>
          </button>
        </div>
      </div>

      {/* Auto-Refresh Section */}
      <div className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>زمان‌بندی بروزرسانی خودکار</span>
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {[
            { val: 180, label: '۳ دقیقه' },
            { val: 60, label: '۱ دقیقه' },
            { val: 30, label: '۳۰ ثانیه' },
            { val: 0, label: 'غیرفعال' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setIntervalVal(item.val)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold text-center border transition-all ${
                interval === item.val
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Number & Language Format Section */}
      <div className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>فرمت ارقام و اعداد</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setNumberFormat('persian')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              numberFormat === 'persian'
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>ارقام فارسی (۱۲۳)</span>
          </button>

          <button
            onClick={() => setNumberFormat('english')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
              numberFormat === 'english'
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>ارقام انگلیسی (123)</span>
          </button>
        </div>
      </div>

      {/* Save Settings & Clear Cache Buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 active:scale-98 transition-all text-center"
        >
          ذخیره تغییرات
        </button>

        <button
          onClick={handleClearCache}
          className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 dark:text-red-400 font-bold text-xs transition-colors"
        >
          پاکسازی کش
        </button>
      </div>

      {/* About Box */}
      <div className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 text-center space-y-2">
        <img
          src="/icon.png"
          alt="کی گلد"
          className="w-14 h-14 rounded-2xl mx-auto shadow-md border border-amber-400/30 object-cover"
        />
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold logo-gradient">
          <span>کی گلد (KGold)</span>
          <span>نسخه ۱.۰.۰ اندروید</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          اپلیکیشن جامع استعلام نرخ لحظه‌ای ارزهای دیجیتال، طلا، سکه، ارز دولتی و خودرو
        </p>
        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>ساخته شده با</span>
          <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />
          <span>توسط تیم کی گلد</span>
        </div>
      </div>
    </div>
  );
};
