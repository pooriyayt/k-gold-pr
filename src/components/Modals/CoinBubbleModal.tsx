import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CircleDollarSign, AlertTriangle, ShieldCheck, ShieldAlert, Copy, Check, Info, Sparkles, TrendingUp } from 'lucide-react';
import { GoldItem } from '../../types';
import { formatPrice, formatNumber } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface CoinBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  goldList: GoldItem[];
  numberFormat?: 'persian' | 'english';
}

interface CoinSpec {
  id: string;
  name: string;
  searchKey: string;
  weight: number; // in grams
  purity: number; // 900 for coins (21.6k)
  fallbackPrice: number;
}

const COIN_SPECS: CoinSpec[] = [
  { id: 'emami', name: 'سکه امامی', searchKey: 'امامی', weight: 8.133, purity: 900, fallbackPrice: 237485000 },
  { id: 'bahar', name: 'سکه بهار آزادی', searchKey: 'بهار آزادی', weight: 8.133, purity: 900, fallbackPrice: 234065000 },
  { id: 'half', name: 'نیم سکه', searchKey: 'نیم سکه', weight: 4.0665, purity: 900, fallbackPrice: 121000000 },
  { id: 'quarter', name: 'ربع سکه', searchKey: 'ربع سکه', weight: 2.03325, purity: 900, fallbackPrice: 63500000 },
  { id: 'grami', name: 'سکه گرمی', searchKey: 'سکه گرمی', weight: 1.01, purity: 900, fallbackPrice: 33000000 },
];

export const CoinBubbleModal: React.FC<CoinBubbleModalProps> = ({
  isOpen,
  onClose,
  goldList,
  numberFormat = 'persian',
}) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>('emami');
  const [customQty, setCustomQty] = useState<string>('1');
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

  // Find 18K gold price (purity 750)
  const gold18Item = goldList.find(
    (g) =>
      (g.name.includes('۱۸') || g.name.includes('18')) &&
      !g.name.includes('حباب') &&
      !g.name.includes('دست دوم')
  );
  const gold18kPrice = gold18Item
    ? parseFloat(gold18Item.price.replace(/,/g, ''))
    : 23857500;

  // Price of 1 gram 900 gold = 18k price * (900 / 750) = 18k * 1.2
  const gold900PricePerGram = gold18kPrice * 1.2;

  // Calculate bubble analysis for each coin
  const coinAnalysis = COIN_SPECS.map((coin) => {
    const foundItem = goldList.find(
      (g) => g.name.includes(coin.searchKey) && !g.name.includes('حباب')
    );
    const marketPrice = foundItem
      ? parseFloat(foundItem.price.replace(/,/g, ''))
      : coin.fallbackPrice;

    // Intrinsic value = coin weight * price per gram of 900 gold
    const intrinsicValue = Math.round(coin.weight * gold900PricePerGram);
    const bubbleAmount = Math.max(0, marketPrice - intrinsicValue);
    const bubblePercent = marketPrice > 0 ? (bubbleAmount / marketPrice) * 100 : 0;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let riskLabel = 'کم‌ریسک (مناسب سرمایه‌گذاری)';
    let riskColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    let barColor = 'bg-emerald-400';

    if (bubblePercent >= 22) {
      riskLevel = 'high';
      riskLabel = 'پرریسک (حباب بالا)';
      riskColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      barColor = 'bg-rose-500';
    } else if (bubblePercent >= 10) {
      riskLevel = 'medium';
      riskLabel = 'ریسک متوسط';
      riskColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      barColor = 'bg-amber-400';
    }

    return {
      ...coin,
      marketPrice,
      intrinsicValue,
      bubbleAmount,
      bubblePercent,
      riskLevel,
      riskLabel,
      riskColor,
      barColor,
    };
  });

  const activeCoin = coinAnalysis.find((c) => c.id === selectedCoinId) || coinAnalysis[0];
  const qty = Math.max(1, parseInt(customQty) || 1);
  const totalMarket = activeCoin.marketPrice * qty;
  const totalIntrinsic = activeCoin.intrinsicValue * qty;
  const totalBubble = activeCoin.bubbleAmount * qty;

  const handleCopyReport = async () => {
    try {
      const lines = [
        `📊 گزارش حباب‌سنج رسمی کی گلد (KGold)`,
        `📅 تاریخ محاسبه: ${new Date().toLocaleDateString('fa-IR')}`,
        `مبنای طلای ۱۸ عیار: ${gold18kPrice.toLocaleString('fa-IR')} تومان`,
        `--------------------------------`,
        ...coinAnalysis.map(
          (c) =>
            `🪙 ${c.name}:\n  قیمت بازار: ${c.marketPrice.toLocaleString('fa-IR')} تومان\n  ارزش ذاتی: ${c.intrinsicValue.toLocaleString('fa-IR')} تومان\n  میزان حباب: ${c.bubbleAmount.toLocaleString('fa-IR')} تومان (${c.bubblePercent.toFixed(1)}%)\n  وضعیت: ${c.riskLabel}`
        ),
        `--------------------------------`,
        `محاسبه شده با فرمول استاندارد ارزش ذاتی طلا | کی گلد`,
      ];
      await navigator.clipboard.writeText(lines.join('\n'));
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {}
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-[#0B0F19] border-t border-white/10 rounded-t-[32px] p-4 sm:p-5 pb-8 shadow-2xl animate-slideUp text-right flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
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
              <span>حباب‌سنج تخصصی انواع سکه</span>
              <CircleDollarSign className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              محاسبه زنده ارزش ذاتی طلا و ارزیابی ریسک خرید
            </p>
          </div>
        </div>

        {/* 18k Benchmark Info Banner */}
        <div className="bg-[#141B2A]/90 border border-amber-500/25 p-2.5 rounded-2xl flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مبنای طلای ۱۸ عیار روز:</span>
          </span>
          <span className="font-black text-amber-400 tabular-nums">
            {formatPrice(gold18kPrice, numberFormat)} تومان
          </span>
        </div>

        {/* Coin Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2">
          {coinAnalysis.map((coin) => (
            <button
              key={coin.id}
              onClick={() => {
                setSelectedCoinId(coin.id);
                try {
                  Haptics.impact({ style: ImpactStyle.Light });
                } catch {}
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                selectedCoinId === coin.id
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{coin.name}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded ${
                selectedCoinId === coin.id ? 'bg-black/20 text-slate-900' : 'text-slate-500'
              }`}>
                {coin.bubblePercent.toFixed(0)}٪
              </span>
            </button>
          ))}
        </div>

        {/* Detailed Focus Card for Selected Coin */}
        <div className="bg-gradient-to-br from-[#121827] to-[#1A2338] border border-white/10 rounded-2xl p-4 space-y-3 mb-3 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-right">
              <span className="text-sm font-black text-white">{activeCoin.name}</span>
              <span className="text-[10px] text-slate-400 mr-2">
                (وزن: {activeCoin.weight} گرم | عیار ۹۰۰)
              </span>
            </div>

            <span className={`self-start sm:self-auto px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1 ${activeCoin.riskColor}`}>
              {activeCoin.riskLevel === 'low' && <ShieldCheck className="w-3.5 h-3.5" />}
              {activeCoin.riskLevel === 'medium' && <AlertTriangle className="w-3.5 h-3.5" />}
              {activeCoin.riskLevel === 'high' && <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{activeCoin.riskLabel}</span>
            </span>
          </div>

          {/* Bubble Progress Visual */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>درصد حباب از کل قیمت:</span>
              <span className="font-bold text-amber-300 tabular-nums">
                {activeCoin.bubblePercent.toFixed(1)}٪
              </span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${activeCoin.barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, activeCoin.bubblePercent))}%` }}
              />
            </div>
          </div>

          {/* Key Figures Grid */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="block text-[9.5px] text-slate-400 mb-0.5">قیمت روز بازار</span>
              <span className="text-xs font-black text-white tabular-nums">
                {formatPrice(activeCoin.marketPrice, numberFormat)}
              </span>
              <span className="text-[9px] text-slate-500 block">تومان</span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="block text-[9.5px] text-slate-400 mb-0.5">ارزش واقعی طلا</span>
              <span className="text-xs font-black text-emerald-400 tabular-nums">
                {formatPrice(activeCoin.intrinsicValue, numberFormat)}
              </span>
              <span className="text-[9px] text-slate-500 block">تومان</span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="block text-[9.5px] text-slate-400 mb-0.5">مبلغ حباب سکه</span>
              <span className="text-xs font-black text-amber-400 tabular-nums">
                {formatPrice(activeCoin.bubbleAmount, numberFormat)}
              </span>
              <span className="text-[9px] text-slate-500 block">تومان</span>
            </div>
          </div>
        </div>

        {/* Basket Calculator for Selected Coin */}
        <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 space-y-2.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>محاسبه حباب برای تعداد دلخواه:</span>
            </span>
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
              <input
                type="number"
                min="1"
                max="1000"
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
                className="w-12 bg-transparent text-center font-black text-white text-xs outline-none"
              />
              <span className="text-[10px] text-slate-400">عدد</span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {['1', '2', '5', '10'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setCustomQty(q)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  customQty === q
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {q} عدد
              </button>
            ))}
          </div>

          {qty > 1 && (
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>کل مبلغ بازار ({qty} عدد):</span>
                <span className="text-white font-bold tabular-nums">
                  {formatPrice(totalMarket, numberFormat)} تومان
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>کل ارزش واقعی طلا:</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {formatPrice(totalIntrinsic, numberFormat)} تومان
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5">
                <span className="text-amber-400 font-bold">مجموع حباب پرداختی شما:</span>
                <span className="text-amber-400 font-black tabular-nums">
                  {formatPrice(totalBubble, numberFormat)} تومان
                </span>
              </div>
            </div>
          )}
        </div>

        {/* All Coins Summary Table */}
        <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3 mb-3 space-y-2">
          <div className="text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
            <span>مقایسه حباب تمامی مسکوکات</span>
            <span className="text-[10px] text-slate-500">مرتب‌سازی بر اساس ریسک</span>
          </div>

          <div className="space-y-1.5">
            {coinAnalysis.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCoinId(c.id)}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                  selectedCoinId === c.id
                    ? 'bg-white/10 border-amber-400/40'
                    : 'bg-black/20 border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.barColor}`} />
                  <span className="font-bold text-white">{c.name}</span>
                </div>

                <div className="flex items-center gap-3 text-left">
                  <div className="text-right">
                    <span className="font-black text-amber-400 tabular-nums block text-[11px]">
                      +{formatPrice(c.bubbleAmount, numberFormat)}
                    </span>
                    <span className="text-[9px] text-slate-500">حباب (تومان)</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg border ${c.riskColor}`}>
                    {c.bubblePercent.toFixed(1)}٪
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 shrink-0">
          <button
            type="button"
            onClick={handleCopyReport}
            className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">گزارش کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>کپی گزارش حباب</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
