import React, { useEffect, useRef, useState } from 'react';
import { X, Share2, Download, Check, Sparkles, Smartphone, Square } from 'lucide-react';
import { drawPriceCard, downloadCanvas, shareCanvas, ShareCardItem } from '../../services/shareCard';
import { formatPersianDate, formatTimeOnly } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotlightItem?: ShareCardItem | null;
  items: ShareCardItem[];
  numberFormat?: 'persian' | 'english';
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  spotlightItem,
  items,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [format, setFormat] = useState<'story' | 'post'>('story');
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (canvasRef.current) {
        const now = new Date();
        const dateStr = formatPersianDate(now);
        const timeStr = formatTimeOnly(now);

        drawPriceCard(canvasRef.current, {
          format,
          dateStr,
          timeStr,
          spotlightItem,
          items,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, format, spotlightItem, items]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, `kgold-${format}-${Date.now()}.png`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}

    if (canvasRef.current) {
      setIsSharing(true);
      await shareCanvas(canvasRef.current);
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-[#0E131F] text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-black flex items-center gap-1.5 text-white">
                <span>تولید کارت اشتراک‌گذاری</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400">مناسب استوری اینستاگرام و کانال‌های تلگرام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Format Selector Pills */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button
              onClick={() => setFormat('story')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                format === 'story'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>استوری (۹:۱۶)</span>
            </button>
            <button
              onClick={() => setFormat('post')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                format === 'post'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>پست مربعی (۱:۱)</span>
            </button>
          </div>

          {/* Visual Canvas Preview Box */}
          <div className="flex justify-center items-center bg-black/60 rounded-2xl p-2 border border-white/10 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className={`max-w-full rounded-xl shadow-2xl transition-all ${
                format === 'story' ? 'max-h-[380px] aspect-[9/16]' : 'max-h-[320px] aspect-square'
              }`}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Tips */}
          <p className="text-[11px] text-center text-slate-400">
            عکس با بالاترین رزولوشن و استانداردهای گرافیکی کی‌گلد تولید می‌شود.
          </p>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-2.5 shrink-0 bg-white/5">
          <button
            onClick={handleDownload}
            className="py-3 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
          >
            {isCopied ? <Check className="w-4 h-4 text-slate-950" /> : <Download className="w-4 h-4" />}
            <span>{isCopied ? 'دانلود شد!' : 'ذخیره عکس (PNG)'}</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>اشتراک‌گذاری</span>
          </button>
        </div>
      </div>
    </div>
  );
};
