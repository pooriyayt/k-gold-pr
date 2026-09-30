import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Briefcase, Plus, Trash2, TrendingUp, TrendingDown, Coins, CircleDollarSign, Zap, Scale } from 'lucide-react';
import {
  PortfolioItem,
  getStoredPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
  calculatePortfolio,
} from '../../services/portfolio';
import { formatPrice } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceMap: Record<string, number>;
}

const PRESET_ASSETS: { name: string; category: PortfolioItem['category']; unitLabel: string }[] = [
  { name: 'سکه امامی', category: 'coin', unitLabel: 'عدد' },
  { name: 'طلای ۱۸ عیار', category: 'gold', unitLabel: 'گرم' },
  { name: 'نیم سکه', category: 'coin', unitLabel: 'عدد' },
  { name: 'ربع سکه', category: 'coin', unitLabel: 'عدد' },
  { name: 'تتر', category: 'crypto', unitLabel: 'USDT' },
  { name: 'دلار آمریکا', category: 'currency', unitLabel: 'دلار' },
  { name: 'بیت کوین', category: 'crypto', unitLabel: 'BTC' },
  { name: 'یورو اروپا', category: 'currency', unitLabel: 'یورو' },
];

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose, priceMap }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(PRESET_ASSETS[0]);
  const [amount, setAmount] = useState<string>('1');
  const [buyPrice, setBuyPrice] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const stored = getStoredPortfolio();
      setItems(stored);
      setIsAdding(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Set default buy price from priceMap
  useEffect(() => {
    const cur = priceMap[selectedAsset.name] || 0;
    if (cur > 0 && !buyPrice) {
      setBuyPrice(cur.toString());
    }
  }, [selectedAsset, priceMap]);

  if (!isOpen) return null;

  const summary = calculatePortfolio(items, priceMap);
  const isPositive = summary.totalProfitLoss >= 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(buyPrice);
    if (!parsedAmount || parsedAmount <= 0 || !parsedPrice || parsedPrice <= 0) return;

    try {
      Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    addPortfolioItem({
      category: selectedAsset.category,
      name: selectedAsset.name,
      unitLabel: selectedAsset.unitLabel,
      amount: parsedAmount,
      buyPricePerUnit: parsedPrice,
    });

    setItems(getStoredPortfolio());
    setIsAdding(false);
    setAmount('1');
    setBuyPrice('');
  };

  const handleDelete = (id: string) => {
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    const updated = deletePortfolioItem(id);
    setItems(updated);
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
                <span>سبد دارایی و پرتفوی سرمایه</span>
                <Briefcase className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                محاسبه ارزش لحظه‌ای، سود و زیان کل دارایی‌ها
              </p>
            </div>
          </div>
        </div>

        {/* Grand Total Valuation Card */}
        <div className="bg-gradient-to-br from-[#121827] via-[#1A2338] to-[#141B2A] border border-amber-500/35 rounded-2xl p-4 mb-3.5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>ارزش لحظه‌ای کل سبد دارایی:</span>
            <span className="text-[11px] text-slate-500">{items.length} قلم دارایی ثبت‌شده</span>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <div className="text-3xl font-black text-amber-400 font-mono tabular-nums">
              {formatPrice(summary.totalCurrentValue, 'persian')}
              <span className="text-xs font-normal text-amber-300/80 mr-1.5">تومان</span>
            </div>
          </div>

          {/* Profit / Loss Bar */}
          <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">سود / زیان کل پرتفوی:</span>
            <div className={`flex items-center gap-1 font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{formatPrice(Math.abs(summary.totalProfitLoss), 'persian')} تومان</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/40">
                ({isPositive ? '+' : '-'}{Math.abs(summary.profitLossPercent).toFixed(1)}٪)
              </span>
            </div>
          </div>

          {/* Asset Share Allocation Bar */}
          {items.length > 0 && (
            <div className="mt-3 space-y-1">
              <span className="text-[10px] text-slate-400 block">تنوع و سهم دارایی‌ها:</span>
              <div className="h-2 w-full bg-black/40 rounded-full flex overflow-hidden p-0.5 gap-0.5">
                {summary.items.map((entry, idx) => {
                  const colors = ['bg-amber-400', 'bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-cyan-400'];
                  const c = colors[idx % colors.length];
                  return (
                    <div
                      key={entry.item.id}
                      className={`h-full rounded-full ${c}`}
                      style={{ width: `${Math.max(4, entry.sharePercent)}%` }}
                      title={`${entry.item.name}: ${entry.sharePercent.toFixed(0)}%`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Add Entry Form or Button */}
        {!isAdding ? (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              const cur = priceMap[selectedAsset.name] || 0;
              if (cur > 0) setBuyPrice(cur.toString());
            }}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 mb-3 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن طلا، سکه یا ارز به سبد</span>
          </button>
        ) : (
          <form onSubmit={handleAdd} className="bg-[#141B2A]/90 border border-amber-500/30 rounded-2xl p-4 mb-3 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-amber-400">ثبت دارایی جدید در پرتفوی</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                انصراف
              </button>
            </div>

            {/* Asset Selection */}
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">نوع دارایی:</label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {PRESET_ASSETS.map((asset) => (
                  <button
                    key={asset.name}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset);
                      const cur = priceMap[asset.name] || 0;
                      if (cur > 0) setBuyPrice(cur.toString());
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      selectedAsset.name === asset.name
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {asset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1">
                  مقدار / تعداد ({selectedAsset.unitLabel}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold text-left text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1">
                  قیمت خرید هر واحد (تومان):
                </label>
                <input
                  type="number"
                  required
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold text-left text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs active:scale-98 transition-all"
            >
              افزودن به سبد
            </button>
          </form>
        )}

        {/* Portfolio Assets List */}
        <div className="space-y-2 mb-3">
          <span className="text-xs font-bold text-slate-300 block mb-1">
            دارایی‌های شما ({summary.items.length}):
          </span>

          {summary.items.length === 0 ? (
            <div className="bg-[#141B2A]/60 border border-white/5 rounded-2xl p-6 text-center text-xs text-slate-500">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <span>سبد شما خالی است. با افزودن سکه، طلا یا ارز، سود و زیان لحظه‌ای سرمایه‌تان را مدیریت کنید.</span>
            </div>
          ) : (
            summary.items.map((entry) => {
              const isProfit = entry.profitLoss >= 0;
              return (
                <div
                  key={entry.item.id}
                  className="bg-[#141B2A]/90 border border-white/10 p-3 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                      {entry.item.category === 'coin' || entry.item.category === 'gold' ? (
                        <Coins className="w-4 h-4" />
                      ) : entry.item.category === 'crypto' ? (
                        <Zap className="w-4 h-4" />
                      ) : (
                        <CircleDollarSign className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{entry.item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({entry.item.amount} {entry.item.unitLabel})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        خرید: {formatPrice(entry.item.buyPricePerUnit, 'persian')} | روز:{' '}
                        {formatPrice(entry.currentPrice, 'persian')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-left">
                      <div className="font-mono font-black text-white text-xs tabular-nums">
                        {formatPrice(entry.currentValue, 'persian')}
                        <span className="text-[9px] text-slate-500 mr-1">ت</span>
                      </div>
                      <div
                        className={`text-[10px] font-bold tabular-nums ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {formatPrice(entry.profitLoss, 'persian')} ({isProfit ? '+' : ''}
                        {entry.profitLossPercent.toFixed(1)}٪)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry.item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 active:scale-90 transition-transform"
                      title="حذف از سبد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-98 transition-all shrink-0"
        >
          بستن
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
