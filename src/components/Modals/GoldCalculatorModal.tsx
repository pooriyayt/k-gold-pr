import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator, Copy, Check, Sparkles } from 'lucide-react';
import { formatPrice } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface GoldCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  goldPrice18k: number; // in Toman per gram
}

export const GoldCalculatorModal: React.FC<GoldCalculatorModalProps> = ({
  isOpen,
  onClose,
  goldPrice18k,
}) => {
  const [weight, setWeight] = useState<string>('1');
  const [wagePercent, setWagePercent] = useState<string>('7'); // اجرت ساخت درصد
  const [profitPercent, setProfitPercent] = useState<string>('7'); // سود طلافروش
  const [taxPercent, setTaxPercent] = useState<string>('9'); // مالیات بر ارزش افزوده
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCopied(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const w = parseFloat(weight) || 0;
  const wage = parseFloat(wagePercent) || 0;
  const profit = parseFloat(profitPercent) || 0;
  const tax = parseFloat(taxPercent) || 0;

  // Formula:
  // Base raw price = goldPrice18k * w
  // Wage amount = Base * (wage / 100)
  // Profit amount = (Base + Wage) * (profit / 100)
  // Tax amount = (Wage + Profit) * (tax / 100)
  // Total = Base + Wage + Profit + Tax
  const basePrice = goldPrice18k * w;
  const wageAmount = basePrice * (wage / 100);
  const profitAmount = (basePrice + wageAmount) * (profit / 100);
  const taxAmount = (wageAmount + profitAmount) * (tax / 100);
  const totalPrice = Math.round(basePrice + wageAmount + profitAmount + taxAmount);

  const handleCopy = async () => {
    try {
      const invoiceText = `پیش‌فاکتور طلای ۱۸ عیار:\nوزن: ${w} گرم\nقیمت خام: ${Math.round(basePrice).toLocaleString('fa-IR')} تومان\nاجرت (${wage}%): ${Math.round(wageAmount).toLocaleString('fa-IR')} تومان\nسود (${profit}%): ${Math.round(profitAmount).toLocaleString('fa-IR')} تومان\nمالیات (${tax}%): ${Math.round(taxAmount).toLocaleString('fa-IR')} تومان\nمبلغ نهایی: ${totalPrice.toLocaleString('fa-IR')} تومان`;
      await navigator.clipboard.writeText(invoiceText);
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {}
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleQuickWeight = (val: string) => {
    setWeight(val);
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  const handleQuickWage = (val: string) => {
    setWagePercent(val);
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  const quickWeights = ['0.5', '1', '2.5', '5', '10', '20'];
  const quickWages = ['4', '7', '10', '14', '18'];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-[#0B0F19] border-t border-white/10 rounded-t-[32px] p-5 pb-8 shadow-2xl animate-slideUp text-right flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        {/* Top Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3 cursor-pointer shrink-0" />

        {/* Header Row */}
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-right">
            <h2 className="text-base font-black text-white flex items-center justify-end gap-1.5">
              <span>محاسبه هوشمند قیمت طلا</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              فرمول رسمی اتحادیه با احتساب اجرت، سود و مالیات
            </p>
          </div>
        </div>

        <div className="space-y-3.5 my-2">
          {/* Base 18K Price Banner */}
          <div className="bg-[#141B2A]/90 border border-amber-500/25 p-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400">مبنای هر گرم طلای ۱۸ عیار:</span>
            <span className="font-black text-amber-400 text-sm tabular-nums">
              {formatPrice(goldPrice18k, 'persian')} تومان
            </span>
          </div>

          {/* Weight Input Box */}
          <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 relative focus-within:border-amber-400/50 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400">وزن طلای مورد نظر:</span>
              <span className="text-xs font-bold text-amber-400 px-2 py-0.5 bg-amber-400/10 rounded-lg">گرم</span>
            </div>

            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="مثال: ۲.۵"
              className="w-full bg-transparent text-left font-black text-2xl sm:text-3xl text-white tabular-nums border-none outline-none focus:ring-0 placeholder:text-slate-600 font-mono"
            />

            {/* Quick Weight Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 whitespace-nowrap pl-1">وزن سریع:</span>
              {quickWeights.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickWeight(q)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                    weight === q
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {parseFloat(q).toLocaleString('fa-IR')} گرم
                </button>
              ))}
            </div>
          </div>

          {/* Wage / Profit / Tax Controls */}
          <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 text-[10px] text-center font-bold">اجرت ساخت (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={wagePercent}
                  onChange={(e) => setWagePercent(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-2 py-1.5 text-white tabular-nums text-center font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[10px] text-center font-bold">سود طلافروش (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={profitPercent}
                  onChange={(e) => setProfitPercent(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-2 py-1.5 text-white tabular-nums text-center font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-[10px] text-center font-bold">مالیات (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-2 py-1.5 text-white tabular-nums text-center font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Quick Wage Preset Buttons */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 whitespace-nowrap pl-1">اجرت رایج:</span>
              {quickWages.map((qw) => (
                <button
                  key={qw}
                  type="button"
                  onClick={() => handleQuickWage(qw)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                    wagePercent === qw
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {qw}٪
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-black/30 border border-white/5 p-3 rounded-2xl space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span>قیمت خام طلا ({w} گرم):</span>
              <span className="text-slate-200 font-semibold tabular-nums">{Math.round(basePrice).toLocaleString('fa-IR')} تومان</span>
            </div>
            <div className="flex justify-between items-center">
              <span>مبلغ اجرت ساخت ({wage}%):</span>
              <span className="text-slate-200 font-semibold tabular-nums">{Math.round(wageAmount).toLocaleString('fa-IR')} تومان</span>
            </div>
            <div className="flex justify-between items-center">
              <span>سود طلافروش ({profit}%):</span>
              <span className="text-slate-200 font-semibold tabular-nums">{Math.round(profitAmount).toLocaleString('fa-IR')} تومان</span>
            </div>
            <div className="flex justify-between items-center">
              <span>مالیات بر سود و اجرت ({tax}%):</span>
              <span className="text-slate-200 font-semibold tabular-nums">{Math.round(taxAmount).toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>

          {/* Final Grand Total Display */}
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/40 p-4 rounded-2xl text-center shadow-lg relative overflow-hidden">
            <div className="text-[11px] text-amber-200 font-bold mb-1">
              مبلغ نهایی قابل پرداخت طلا:
            </div>
            <div className="text-3xl font-black text-amber-400 tabular-nums select-all font-mono">
              {totalPrice > 0 ? totalPrice.toLocaleString('fa-IR') : '۰'}{' '}
              <span className="text-xs font-normal text-amber-300/80">تومان</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">پیش‌فاکتور کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>کپی پیش‌فاکتور</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center"
            >
              تأیید و بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
