import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles, ArrowDownCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ReleaseInfo, CURRENT_APP_VERSION } from '../../services/updater';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: ReleaseInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, release }) => {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState<{ percent: number; downloadedMb: number; totalMb: number }>({
    percent: 0,
    downloadedMb: 0,
    totalMb: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setDownloadState('idle');
      setProgress({ percent: 0, downloadedMb: 0, totalMb: 0 });
      setErrorMessage(null);

      // Listen for Native Bridge callbacks from Android
      (window as any).onUpdateDownloadProgress = (percent: number, downloadedMb: number, totalMb: number) => {
        setDownloadState('downloading');
        setProgress({ percent, downloadedMb, totalMb });
      };

      (window as any).onUpdateDownloadComplete = () => {
        setDownloadState('completed');
        try {
          Haptics.impact({ style: ImpactStyle.Heavy });
        } catch {}
      };

      (window as any).onUpdateDownloadError = (err: string) => {
        setDownloadState('error');
        setErrorMessage(err);
      };
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      delete (window as any).onUpdateDownloadProgress;
      delete (window as any).onUpdateDownloadComplete;
      delete (window as any).onUpdateDownloadError;
    };
  }, [isOpen]);

  if (!isOpen || !release) return null;

  const handleStartInAppUpdate = () => {
    try {
      Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    const isNativeBridgeAvailable =
      typeof (window as any).AndroidBridge !== 'undefined' &&
      typeof (window as any).AndroidBridge.downloadAndInstallApk === 'function';

    if (isNativeBridgeAvailable) {
      setDownloadState('downloading');
      setProgress({ percent: 1, downloadedMb: 0, totalMb: release.apkSizeMb });
      (window as any).AndroidBridge.downloadAndInstallApk(release.apkDownloadUrl);
    } else {
      // Browser fallback if testing on desktop browser
      window.open(release.apkDownloadUrl, '_system');
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex flex-col justify-end bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-[#0B0F19] border-t border-amber-500/30 rounded-t-[32px] p-5 pb-8 shadow-2xl animate-slideUp text-right flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 28px)' }}
      >
        {/* Top Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3 cursor-pointer shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <h2 className="text-base font-black text-white flex items-center justify-end gap-1.5">
                <span>بروزرسانی جدید در دسترس است!</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <span className="text-[11px] text-amber-400 font-bold block mt-0.5">
                نسخه {release.version} (نسخه فعلی شما: {CURRENT_APP_VERSION})
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 animate-bounce">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Release Title Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-3 mb-3.5 flex items-center justify-between">
          <span className="text-xs font-bold text-white line-clamp-1">{release.name}</span>
          {release.apkSizeMb > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-black/40 text-amber-300 border border-amber-500/20 shrink-0">
              حجم: {release.apkSizeMb} مگابایت
            </span>
          )}
        </div>

        {/* Changelog Box */}
        <div className="space-y-1.5 mb-4">
          <span className="text-xs font-bold text-slate-300 block mb-1">
            لیست تغییرات و امکانات نسخه جدید:
          </span>
          <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 max-h-52 overflow-y-auto no-scrollbar text-xs text-slate-300 leading-relaxed space-y-1.5 whitespace-pre-wrap font-sans text-right dir-rtl">
            {release.body}
          </div>
        </div>

        {/* In-App Download Progress Container */}
        {downloadState === 'downloading' && (
          <div className="bg-gradient-to-br from-[#121827] to-[#1B2438] border border-amber-500/30 rounded-2xl p-4 mb-3 space-y-2.5 animate-fadeIn">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 text-amber-300 font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال دریافت فایل نصبی...</span>
              </span>
              <span className="font-mono font-black text-amber-400 tabular-nums">
                {progress.percent > 0 ? `${progress.percent}٪` : 'در حال اتصال...'}
              </span>
            </div>

            {/* Glowing Progress Track */}
            <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 shadow-md shadow-amber-500/50"
                style={{ width: `${Math.max(4, Math.min(100, progress.percent))}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
              <span>دریافت مستقیم و پرسرعت درون‌برنامه‌ای</span>
              {progress.downloadedMb > 0 && (
                <span className="tabular-nums">
                  {progress.downloadedMb.toFixed(1)} از {progress.totalMb > 0 ? progress.totalMb.toFixed(1) : release.apkSizeMb} مگابایت
                </span>
              )}
            </div>
          </div>
        )}

        {/* Download Completed Notification */}
        {downloadState === 'completed' && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3.5 mb-3 flex items-center gap-2.5 text-emerald-400 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p>دانلود کامل شد!</p>
              <p className="text-[11px] text-emerald-300/80 font-normal">در حال گشودن صفحه نصب‌کننده اندروید...</p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {downloadState === 'error' && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3.5 mb-3 flex items-center gap-2 text-rose-400 text-xs font-bold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage || 'خطا در دانلود. لطفاً مجدداً امتحان کنید.'}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 shrink-0">
          {downloadState !== 'downloading' && (
            <button
              type="button"
              onClick={handleStartInAppUpdate}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{downloadState === 'error' ? 'تلاش مجدد دانلود درون‌برنامه' : 'دانلود و نصب مستقیم درون برنامه'}</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                window.open(release.apkDownloadUrl, '_system');
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white font-bold text-xs transition-all text-center"
            >
              دانلود از مرورگر
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white font-bold text-xs transition-all text-center"
            >
              {downloadState === 'downloading' ? 'بستن پنجره' : 'بعداً'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
