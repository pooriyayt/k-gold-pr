import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Sparkles, Receipt, Gem, Scale, BadgePercent, ArrowRight } from 'lucide-react';
import { formatPrice, formatNumber } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface GoldCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  goldPrice18k: number; // in Toman per gram
  numberFormat?: 'persian' | 'english';
}

type GoldPurchaseType = 'new' | 'used' | 'melted';
type WageType = 'percent' | 'amount';

export const GoldCalculatorModal: React.FC<GoldCalculatorModalProps> = ({
  isOpen,
  onClose,
  goldPrice18k,
  numberFormat = 'persian',
}) => {
  const [purchaseType, setPurchaseType] = useState<GoldPurchaseType>('new');
  const [wageType, setWageType] = useState<WageType>('percent');
  const [weight, setWeight] = useState<string>('3.5');
  const [stoneWeight, setStoneWeight] = useState<string>('0'); // وزن نگین/سنگ
  const [wagePercent, setWagePercent] = useState<string>('9'); // اجرت درصدی
  const [wageAmountPerGram, setWageAmountPerGram] = useState<string>('500000'); // اجرت تومانی
  const [profitPercent, setProfitPercent] = useState<string>('7'); // سود قانونی طلافروش ۷٪
  const [taxPercent, setTaxPercent] = useState<string>('9'); // مالیات بر ارزش افزوده ۹٪ روی سود و اجرت
  const [itemTitle, setItemTitle] = useState<string>('دستبند / النگو');
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

  const totalWeight = Math.max(0, parseFloat(weight) || 0);
  const stoneW = Math.max(0, parseFloat(stoneWeight) || 0);
  const netWeight = Math.max(0, totalWeight - stoneW);

  // Wage handling based on purchase type
  let effectiveWagePercent = purchaseType === 'new' ? (parseFloat(wagePercent) || 0) : 0;
  let effectiveWageAmountPerGram = purchaseType === 'new' ? (parseFloat(wageAmountPerGram) || 0) : 0;
  let effectiveProfitPercent = purchaseType === 'melted' ? 0 : (parseFloat(profitPercent) || 0);
  let effectiveTaxPercent = purchaseType === 'melted' ? 0 : (parseFloat(taxPercent) || 0);

  // Calculations
  const rawGoldPrice = netWeight * goldPrice18k;

  let totalWage = 0;
  if (purchaseType === 'new') {
    if (wageType === 'percent') {
      totalWage = rawGoldPrice * (effectiveWagePercent / 100);
    } else {
      totalWage = netWeight * effectiveWageAmountPerGram;
    }
  }

  // Profit applies to (rawGoldPrice + totalWage)
  const totalProfit = (rawGoldPrice + totalWage) * (effectiveProfitPercent / 100);

  // Tax legally applies only to (totalWage + totalProfit) in Iranian tax law
  const totalTax = (totalWage + totalProfit) * (effectiveTaxPercent / 100);

  const grandTotal = Math.round(rawGoldPrice + totalWage + totalProfit + totalTax);

  const handleCopy = async () => {
    try {
      const typeLabel =
        purchaseType === 'new' ? 'طلای نو ساخته‌شده' : purchaseType === 'used' ? 'طلای کم‌اجرت / متفرقه' : 'طلای آبشده';
      const wageDesc =
        purchaseType === 'new'
          ? wageType === 'percent'
            ? `${effectiveWagePercent}% (${Math.round(totalWage).toLocaleString('fa-IR')} تومان)`
            : `${Math.round(effectiveWageAmountPerGram).toLocaleString('fa-IR')} تومان/گرم (${Math.round(totalWage).toLocaleString('fa-IR')} تومان)`
          : 'بدون اجرت (صفر)';

      const invoiceText = `🧾 پیش‌فاکتور خرید طلا - کی گلد
نوع مصنوع: ${itemTitle} (${typeLabel})
مبنای هر گرم طلای ۱۸ عیار: ${Math.round(goldPrice18k).toLocaleString('fa-IR')} تومان
وزن ناخالص: ${totalWeight} گرم
${stoneW > 0 ? `کسر وزن نگین/سنگ: ${stoneW} گرم\nوزن خالص طلا: ${netWeight.toFixed(2)} گرم\n` : `وزن خالص: ${netWeight} گرم\n`}
قیمت طلای خام: ${Math.round(rawGoldPrice).toLocaleString('fa-IR')} تومان
اجرت ساخت: ${wageDesc}
سود طلافروش (${effectiveProfitPercent}%): ${Math.round(totalProfit).toLocaleString('fa-IR')} تومان
مالیات بر ارزش افزوده (${effectiveTaxPercent}%): ${Math.round(totalTax).toLocaleString('fa-IR')} تومان
--------------------------------
مبلغ کل قابل پرداخت: ${grandTotal.toLocaleString('fa-IR')} تومان
محاسبه شده بر اساس فرمول رسمی اتحادیه طلا و جواهر`;

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

  const quickWeights = ['1.5', '2.5', '4', '6', '10', '15'];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-[#0B0F19] border-t border-white/10 rounded-t-[32px] p-4 sm:p-5 pb-12 shadow-2xl animate-slideUp text-right max-h-[92vh] overflow-y-auto no-scrollbar relative space-y-3"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 36px)' }}
      >
        {/* Top Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3 cursor-pointer shrink-0" />

        {/* Header */}
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
              <span>ماشین‌حساب فاکتور رسمی طلافروشی</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              محاسبه شفاف اجرت، سود قانونی ۷٪ و مالیات ارزش افزوده
            </p>
          </div>
        </div>

        {/* 18K Benchmark */}
        <div className="bg-[#141B2A]/90 border border-amber-500/25 p-2.5 rounded-2xl flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مبنای هر گرم طلای ۱۸ عیار روز:</span>
          </span>
          <span className="font-black text-amber-400 tabular-nums">
            {formatPrice(goldPrice18k, numberFormat)} تومان
          </span>
        </div>

        {/* Purchase Type Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5 mb-3 text-xs font-bold text-center">
          {[
            { id: 'new', label: 'طلای نو (با اجرت)' },
            { id: 'used', label: 'کم‌اجرت / دست دوم' },
            { id: 'melted', label: 'طلای آبشده' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setPurchaseType(type.id as GoldPurchaseType);
                try {
                  Haptics.impact({ style: ImpactStyle.Light });
                } catch {}
              }}
              className={`py-2 rounded-xl transition-all ${
                purchaseType === type.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Item Title Input */}
        <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3 mb-3">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">
            عنوان یا مدل طلا:
          </label>
          <input
            type="text"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder="مثال: انگشتر طلا، پلاک، النگو..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Weight Inputs (Total Weight + Stone Deduction) */}
        <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 mb-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>وزن کل (گرم):</span>
                </span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white text-xl font-mono font-black text-left tabular-nums focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  <span>کسر وزن نگین:</span>
                </span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={stoneWeight}
                onChange={(e) => setStoneWeight(e.target.value)}
                placeholder="۰"
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white text-xl font-mono font-black text-left tabular-nums focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Quick Weight Chips */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-500 whitespace-nowrap pl-1">وزن سریع:</span>
            {quickWeights.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickWeight(q)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                  weight === q
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {parseFloat(q).toLocaleString('fa-IR')} گرم
              </button>
            ))}
          </div>

          {stoneW > 0 && (
            <div className="text-[11px] text-cyan-300 font-bold bg-cyan-950/40 border border-cyan-800/40 p-2 rounded-xl flex justify-between">
              <span>وزن خالص طلا پس از کسر سنگ:</span>
              <span className="font-mono tabular-nums">{netWeight.toFixed(2)} گرم</span>
            </div>
          )}
        </div>

        {/* Wage Section (Only for new gold) */}
        {purchaseType === 'new' && (
          <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 mb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <BadgePercent className="w-3.5 h-3.5 text-amber-400" />
                <span>نحوه محاسبه اجرت ساخت:</span>
              </span>

              <div className="flex gap-1 bg-black/40 p-0.5 rounded-xl border border-white/5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setWageType('percent')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    wageType === 'percent' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  درصدی (%)
                </button>
                <button
                  type="button"
                  onClick={() => setWageType('amount')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    wageType === 'amount' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  تومانی (هر گرم)
                </button>
              </div>
            </div>

            {wageType === 'percent' ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={wagePercent}
                    onChange={(e) => setWagePercent(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-400 shrink-0">درصد</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {['4', '7', '9', '12', '16', '20'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setWagePercent(p)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        wagePercent === p ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {p}٪
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    step="50000"
                    value={wageAmountPerGram}
                    onChange={(e) => setWageAmountPerGram(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold text-left text-sm focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-400 shrink-0">تومان/گرم</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {['200000', '400000', '600000', '800000'].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setWageAmountPerGram(a)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        wageAmountPerGram === a ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {(parseInt(a) / 1000).toLocaleString('fa-IR')} ک
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profit and Tax (if applicable) */}
        {purchaseType !== 'melted' && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3">
              <label className="block text-[10px] text-slate-400 font-bold mb-1 text-center">
                سود طلافروش (%)
              </label>
              <input
                type="number"
                value={profitPercent}
                onChange={(e) => setProfitPercent(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl py-1.5 text-center text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="block text-[9px] text-slate-500 text-center mt-1">مصوب اتحادیه: ۷٪</span>
            </div>

            <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3">
              <label className="block text-[10px] text-slate-400 font-bold mb-1 text-center">
                مالیات ارزش افزوده (%)
              </label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl py-1.5 text-center text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="block text-[9px] text-slate-500 text-center mt-1">فقط روی سود و اجرت</span>
            </div>
          </div>
        )}

        {/* Official Invoice Receipt Preview Card */}
        <div className="bg-gradient-to-br from-[#0E1524] to-[#162035] border border-amber-500/40 rounded-2xl p-4 space-y-3 mb-3 shadow-xl relative shrink-0">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="text-[10px] text-amber-400 font-black bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
              پیش‌فاکتور رسمی خرید
            </span>
            <span className="text-xs font-bold text-white">{itemTitle}</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">قیمت طلای خام ({netWeight.toFixed(2)} گرم):</span>
              <span className="font-bold tabular-nums text-white">
                {Math.round(rawGoldPrice).toLocaleString('fa-IR')} تومان
              </span>
            </div>

            {purchaseType === 'new' && (
              <div className="flex justify-between">
                <span className="text-slate-400">مبلغ اجرت ساخت:</span>
                <span className="font-bold tabular-nums text-amber-300">
                  {Math.round(totalWage).toLocaleString('fa-IR')} تومان
                </span>
              </div>
            )}

            {purchaseType !== 'melted' && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">سود فروشنده ({effectiveProfitPercent}%):</span>
                  <span className="font-bold tabular-nums text-slate-200">
                    {Math.round(totalProfit).toLocaleString('fa-IR')} تومان
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">مالیات بر ارزش افزوده ({effectiveTaxPercent}%):</span>
                  <span className="font-bold tabular-nums text-slate-200">
                    {Math.round(totalTax).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
            <span className="text-xs font-bold text-amber-300">مبلغ کل فاکتور:</span>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 tabular-nums font-mono">
                {grandTotal > 0 ? grandTotal.toLocaleString('fa-IR') : '۰'}
              </span>
              <span className="text-[11px] text-amber-300/80 mr-1">تومان</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">فاکتور کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>کپی فاکتور رسمی</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center"
          >
            بستن فاکتور
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
