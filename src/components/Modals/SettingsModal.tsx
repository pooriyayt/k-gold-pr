import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppSettings } from '../../types';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [numberFormat, setNumberFormat] = useState<'persian' | 'english'>(
    settings.numberFormat || 'persian'
  );
  const [autoRefresh, setAutoRefresh] = useState<boolean>(
    settings.autoRefreshEnabled !== false
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setNumberFormat(settings.numberFormat || 'persian');
      setAutoRefresh(settings.autoRefreshEnabled !== false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave({
      ...settings,
      numberFormat,
      autoRefreshEnabled: autoRefresh,
      autoRefreshInterval: autoRefresh ? (settings.autoRefreshInterval || 180) : 0,
    });
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-[#121826] border-t border-white/10 rounded-t-[28px] p-4 pb-8 shadow-2xl animate-slideUp text-right"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        {/* Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 text-slate-300 flex items-center justify-center hover:bg-white/15 hover:text-white transition-all active:scale-95"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-white">
            تنظیمات نمایش مینی‌اپ
          </h2>
        </div>

        <div className="space-y-3 my-2">
          {/* Option 1: Language & Number Format */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
            {/* Segmented Switcher on Left */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-1 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setNumberFormat('english')}
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-medium ${
                  numberFormat === 'english'
                    ? 'bg-white/20 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English (123)
              </button>
              <button
                type="button"
                onClick={() => setNumberFormat('persian')}
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-medium ${
                  numberFormat === 'persian'
                    ? 'bg-white/20 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                فارسی (۱۲۳)
              </button>
            </div>

            {/* Title and Caption on Right */}
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-white">
                زبان و فرمت اعداد
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                نمایش تمام قیمت‌ها و آمار با ارقام فارسی یا انگلیسی
              </div>
            </div>
          </div>

          {/* Option 2: Live Auto Refresh */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
            {/* iOS Toggle Switch on Left */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 border ${
                autoRefresh
                  ? 'bg-[#30D158] border-[#30D158]'
                  : 'bg-black/50 border-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform duration-200 ${
                  autoRefresh ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>

            {/* Title and Caption on Right */}
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-white">
                بروزرسانی خودکار زنده
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                استریم آنی نوسانات بازار بدون نیاز به رفرش
              </div>
            </div>
          </div>
        </div>

        {/* Big Gold Apply Button */}
        <button
          onClick={handleApply}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#07090E] font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
        >
          ذخیره و اعمال تنظیمات
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
