import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Sparkles, ExternalLink, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import { ReleaseInfo, CURRENT_APP_VERSION } from '../../services/updater';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: ReleaseInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, release }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      try {
        Haptics.impact({ style: ImpactStyle.Medium });
      } catch {}
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !release) return null;

  const handleDownload = () => {
    try {
      Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {}
    if (release.apkDownloadUrl) {
      window.open(release.apkDownloadUrl, '_system');
    }
  };

  const handleOpenGitHub = () => {
    if (release.releaseUrl) {
      window.open(release.releaseUrl, '_system');
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
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
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
                {release.version} (نسخه شما: {CURRENT_APP_VERSION})
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
          <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 max-h-56 overflow-y-auto no-scrollbar text-xs text-slate-300 leading-relaxed space-y-1.5 whitespace-pre-wrap font-sans text-right dir-rtl">
            {release.body}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>دانلود و نصب مستقیم فایل APK</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleOpenGitHub}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>مشاهده در گیت‌هاب</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white font-bold text-xs transition-all"
            >
              بعداً یادآوری کن
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
