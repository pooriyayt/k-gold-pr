import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { saveSettings } from '../services/storage';
import {
  Moon,
  Sun,
  Clock,
  Globe,
  CheckCircle2,
  Heart,
  DownloadCloud,
  RefreshCw,
  Sparkles,
  Bell,
  Briefcase,
  AlertCircle,
  ExternalLink,
  LayoutGrid,
} from 'lucide-react';
import { CURRENT_APP_VERSION, checkLatestRelease, ReleaseInfo } from '../services/updater';
import { UpdateModal } from '../components/Modals/UpdateModal';
import { PriceAlertModal } from '../components/Modals/PriceAlertModal';
import { PortfolioModal } from '../components/Modals/PortfolioModal';
import { WIDGET_ASSET_OPTIONS, setNativeWidgetAsset } from '../services/widgetSync';
import { CircularFlag } from '../components/Common/CircularFlag';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onTriggerRefresh: () => void;
  priceMap?: Record<string, number>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTriggerRefresh,
  priceMap = {},
}) => {
  const [interval, setIntervalVal] = useState(settings.autoRefreshInterval);
  const [numberFormat, setNumberFormat] = useState<'persian' | 'english'>(
    settings.numberFormat || 'persian'
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Auto-Update States
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    checked: boolean;
    hasUpdate: boolean;
    release: ReleaseInfo | null;
    message?: string;
  }>({
    checked: false,
    hasUpdate: false,
    release: null,
  });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Modals for Price Alerts & Portfolio
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  // Widget Asset Selection State
  const [selectedWidgetAsset, setSelectedWidgetAsset] = useState<string>(() => {
    return localStorage.getItem('default_widget_asset') || 'usd';
  });
  const [widgetSavedMsg, setWidgetSavedMsg] = useState(false);

  const handleSelectWidgetAsset = async (key: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setSelectedWidgetAsset(key);
    localStorage.setItem('default_widget_asset', key);
    setNativeWidgetAsset(key);
    setWidgetSavedMsg(true);
    setTimeout(() => setWidgetSavedMsg(false), 3000);
  };

  // Check update on mount
  useEffect(() => {
    handleCheckUpdate(false);
  }, []);

  const handleCheckUpdate = async (manual: boolean = true) => {
    setIsCheckingUpdate(true);
    if (manual) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {}
    }

    const res = await checkLatestRelease();
    setIsCheckingUpdate(false);

    if (res.hasUpdate && res.release) {
      setUpdateStatus({
        checked: true,
        hasUpdate: true,
        release: res.release,
        message: `نسخه جدید ${res.release.version} منتشر شده است!`,
      });
      if (manual) {
        setIsUpdateModalOpen(true);
      }
    } else {
      setUpdateStatus({
        checked: true,
        hasUpdate: false,
        release: res.release,
        message: res.error || 'شما از آخرین نسخه کی گلد استفاده می‌کنید.',
      });
    }
  };

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
    <div className="space-y-4 pb-28 animate-fadeIn max-w-2xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          پروفایل و تنظیمات
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          شخصی‌سازی ظاهر، بروزرسانی خودکار، سبد دارایی و آلارم‌ها
        </p>
      </div>

      {saveStatus && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 1. In-App Auto-Update Card (ویژه) */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                بروزرسانی خودکار برنامه
              </h3>
              <span className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold block">
                دریافت مستقیم آخرین قابلیت‌ها و رفع اشکالات رسمی
              </span>
            </div>
          </div>

          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-black/40 text-amber-300 border border-amber-500/20 tabular-nums">
            {CURRENT_APP_VERSION}
          </span>
        </div>

        {/* Update Status Display */}
        <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {isCheckingUpdate ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
            ) : updateStatus.hasUpdate ? (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="truncate text-slate-300 text-[11px]">
              {isCheckingUpdate
                ? 'در حال بررسی وضعیت بروزرسانی...'
                : updateStatus.message || 'برنامه شما به‌روز است.'}
            </span>
          </div>

          {updateStatus.hasUpdate && (
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shrink-0 active:scale-95 transition-all shadow-sm"
            >
              مشاهده و دانلود
            </button>
          )}
        </div>

        {/* Manual Check Button */}
        <button
          type="button"
          onClick={() => handleCheckUpdate(true)}
          disabled={isCheckingUpdate}
          className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin text-amber-400' : ''}`} />
          <span>بررسی انتشار نسخه جدید</span>
        </button>
      </div>

      {/* 2. Personal Financial Tools: سبد دارایی و هشدارهای قیمت */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setIsPortfolioModalOpen(true)}
          className="glass-card p-3 rounded-2xl border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-between text-right hover:border-amber-400/50 active:scale-[0.98] transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 dark:text-white">سبد دارایی من</span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">سود و زیان سرمایه</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsAlertsModalOpen(true)}
          className="glass-card p-3 rounded-2xl border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-between text-right hover:border-amber-400/50 active:scale-[0.98] transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-900 dark:text-white">هشدارهای قیمت</span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">تنظیم آلارم تارگت</span>
          </div>
        </button>
      </div>

      {/* 3. Android Home Screen Widget Interactive Section (Matching Reference media_1790790676445.png) */}
      <div className="bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-[32px] p-5 shadow-xl space-y-4">
        {/* Grabber handle matching iOS/Android sheet */}
        <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto" />

        {/* Sheet Title & Subtitle */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Symbol - V2
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Focus on a single item • نمایش نرخ زنده روی صفحه اصلی
          </p>
        </div>

        {/* Central Floating Live Preview Card */}
        {(() => {
          const currentAsset = WIDGET_ASSET_OPTIONS.find((a) => a.key === selectedWidgetAsset) || WIDGET_ASSET_OPTIONS[0];
          return (
            <div className="py-2 flex flex-col items-center">
              <div
                dir="ltr"
                className="w-48 h-48 rounded-[28px] bg-white text-slate-900 p-4 shadow-2xl shadow-slate-950/15 border border-slate-200/90 flex flex-col justify-between select-none transform transition-all duration-300 hover:scale-105"
              >
                {/* Top row: Circular Flag on Left, Title & Code on Right */}
                <div className="flex items-center justify-between">
                  <CircularFlag assetKey={currentAsset.key} size={38} />
                  <div className="text-right">
                    <span className="block text-[13px] font-bold text-slate-800 leading-tight">
                      {currentAsset.englishName || currentAsset.name}
                    </span>
                    <span className="block text-[11px] font-bold text-slate-400 tracking-wide mt-0.5">
                      {currentAsset.code}
                    </span>
                  </div>
                </div>

                {/* Bottom area: Change above, Big Price below */}
                <div className="text-left space-y-0.5">
                  <span
                    className={`block text-[12.5px] font-bold leading-tight ${
                      currentAsset.isPos ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {currentAsset.defaultChange}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[25px] font-black text-slate-950 tracking-tight leading-none">
                      {currentAsset.defaultPrice}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">تومان</span>
                  </div>
                </div>
              </div>

              {/* Dots Pager Indicator (synced to selected asset) */}
              <div className="flex items-center gap-1.5 mt-4">
                {WIDGET_ASSET_OPTIONS.slice(0, 6).map((item, idx) => {
                  const isCurrent = selectedWidgetAsset === item.key || (idx === 0 && !WIDGET_ASSET_OPTIONS.slice(0, 6).some(a => a.key === selectedWidgetAsset));
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectWidgetAsset(item.key)}
                      className={`h-2 rounded-full transition-all ${
                        isCurrent
                          ? 'w-6 bg-slate-900 dark:bg-white'
                          : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      aria-label={item.name}
                    />
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Asset Selection Grid */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
            انتخاب ارز مورد نظر برای نمایش روی ویجت:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WIDGET_ASSET_OPTIONS.map((item) => (
              <button
                dir="rtl"
                key={item.key}
                type="button"
                onClick={() => handleSelectWidgetAsset(item.key)}
                className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
                  selectedWidgetAsset === item.key
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/5'
                }`}
              >
                <CircularFlag assetKey={item.key} size={22} />
                <span className="truncate text-[11px] font-bold">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Widget Button (Matching Reference media_1790790676445.png) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleSelectWidgetAsset(selectedWidgetAsset)}
            className="w-full py-4 px-6 rounded-full bg-black hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-2xl active:scale-98 transition-all"
          >
            <span>+ Add Widget (انتخاب و فعال‌سازی ویجت)</span>
          </button>
        </div>

        {widgetSavedMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center animate-fadeIn">
            ✓ ویجت صفحه اصلی با موفقیت روی ارز انتخاب شده تنظیم شد.
          </div>
        )}

        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed text-right bg-white/50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/50 dark:border-white/5">
          💡 <strong>راهنما:</strong> دست خود را روی صفحه خالی هوم‌اسکرین گوشی نگه دارید، وارد بخش ویجت‌ها شده و ویجت <strong>کی‌گلد</strong> را اضافه کنید.
        </p>
      </div>

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

      {/* Auto-Refresh Interval Section */}
      <div className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>زمان‌بندی بروزرسانی خودکار نرخ‌ها</span>
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
          ذخیره تنظیمات
        </button>

        <button
          onClick={handleClearCache}
          className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 dark:text-red-400 font-bold text-xs transition-colors"
        >
          پاکسازی کش
        </button>
      </div>

      {/* About App Box */}
      <div className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 text-center space-y-2">
        <img
          src="/icon.png"
          alt="کی گلد"
          className="w-14 h-14 rounded-2xl mx-auto shadow-md border border-amber-400/30 object-cover"
        />
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold logo-gradient">
          <span>کی گلد (KGold)</span>
          <span className="tabular-nums">نسخه {CURRENT_APP_VERSION}</span>
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

      {/* Modals */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        release={updateStatus.release}
      />

      <PriceAlertModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        priceMap={priceMap}
      />

      <PortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        priceMap={priceMap}
      />
    </div>
  );
};
