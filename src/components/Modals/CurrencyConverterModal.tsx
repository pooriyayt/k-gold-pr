import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpDown, ChevronDown, Search, Copy, Check, Sparkles } from 'lucide-react';
import { CurrencyItem } from '../../types';
import { getFlagUrl } from '../../services/api';
import { formatPrice, toEnglishDigits } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: CurrencyItem[];
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
  currencies,
}) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [amount, setAmount] = useState<string>('1');
  const [direction, setDirection] = useState<'toToman' | 'toCurrency'>('toToman');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCopied(false);
    } else {
      document.body.style.overflow = '';
      setIsDropdownOpen(false);
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCurrency =
    currencies.find((c) => c.code === selectedCurrencyCode) ||
    currencies[0] || {
      code: 'USD',
      name: 'دلار آمریکا',
      price: '234,250',
    };

  const rawPrice = parseFloat(toEnglishDigits(currentCurrency.price).replace(/[^0-9.]/g, '')) || 234250;
  const numAmount = parseFloat(amount) || 0;

  let result = 0;
  if (direction === 'toToman') {
    result = Math.round(numAmount * rawPrice);
  } else {
    result = rawPrice > 0 ? Number((numAmount / rawPrice).toFixed(2)) : 0;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.toLocaleString('en-US'));
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {}
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleQuickAmount = (val: string) => {
    setAmount(val);
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  const handleSwap = () => {
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setDirection((d) => (d === 'toToman' ? 'toCurrency' : 'toToman'));
  };

  const filteredCurrencies = currencies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const quickAmounts =
    direction === 'toToman'
      ? ['10', '50', '100', '500', '1000']
      : ['1000000', '5000000', '10000000', '50000000'];

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
              <span>تبدیل هوشمند ارز</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              محاسبه آنلاین و دقیق قیمت به نرخ لحظه‌ای بازار
            </p>
          </div>
        </div>

        {/* Currency Dropdown Selector */}
        {isDropdownOpen ? (
          <div className="space-y-3 py-2 animate-fadeIn flex-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                بازگشت به تبدیل ←
              </button>
              <span className="text-xs font-bold text-slate-300">
                انتخاب ارز از لیست ({currencies.length} ارز)
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام ارز یا کد (USD, EUR, درهم...)"
                autoFocus
                className="w-full bg-[#141B2A] border border-white/15 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1 divide-y divide-white/5 no-scrollbar">
              {filteredCurrencies.map((c) => (
                <div
                  key={c.code}
                  onClick={() => {
                    setSelectedCurrencyCode(c.code);
                    setIsDropdownOpen(false);
                    setSearchQuery('');
                  }}
                  className={`py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    c.code === selectedCurrencyCode
                      ? 'bg-amber-400/15 border border-amber-400/30 text-amber-300'
                      : 'hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getFlagUrl(c.code)}
                      alt={c.code}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.code}</div>
                    </div>
                  </div>

                  <div className="text-left font-semibold text-xs text-slate-300 tabular-nums">
                    <div>{formatPrice(c.price, 'persian')} <span className="text-[10px] text-slate-500">تومان</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Normal Converter View */
          <div className="space-y-3.5 my-2">
            {/* Box 1: Source Amount (پرداخت) */}
            <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 relative focus-within:border-amber-400/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">
                  {direction === 'toToman' ? 'ارز مبدا:' : 'مبلغ ریالی مبدا:'}
                </span>

                {direction === 'toToman' ? (
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-xs font-bold text-white active:scale-95"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentCurrency.name}</span>
                    <img
                      src={getFlagUrl(currentCurrency.code)}
                      alt={currentCurrency.code}
                      className="w-5 h-5 rounded-full object-cover border border-white/10"
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span>تومان ایران</span>
                  </div>
                )}
              </div>

              {/* Large Input */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {direction === 'toToman' ? currentCurrency.code : 'تومان'}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-black text-2xl sm:text-3xl text-white tabular-nums border-none outline-none focus:ring-0 placeholder:text-slate-600 font-mono pr-2"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-slate-500 whitespace-nowrap pl-1">سریع:</span>
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickAmount(q)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                      amount === q
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {direction === 'toToman'
                      ? `${parseFloat(q).toLocaleString('fa-IR')} ${currentCurrency.code}`
                      : `${(parseFloat(q) / 1000000).toLocaleString('fa-IR')} میلیون`}
                  </button>
                ))}
              </div>
            </div>

            {/* Middle Divider & Swap Button */}
            <div className="relative flex items-center justify-center my-0.5">
              <div className="w-full border-t border-white/10" />
              <button
                type="button"
                onClick={handleSwap}
                className="absolute w-10 h-10 rounded-full bg-[#1E273A] border-2 border-amber-400/40 text-amber-400 hover:text-white hover:bg-amber-500 hover:border-amber-400 flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer z-10"
                title="جابجایی مبدا و مقصد"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Box 2: Target Amount (دریافت) */}
            <div className="bg-[#141B2A]/90 border border-emerald-500/25 rounded-2xl p-3.5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">
                  {direction === 'toToman' ? 'مبلغ دریافتی (تومان):' : 'ارز دریافتی:'}
                </span>

                {direction === 'toToman' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span>تومان ایران</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-xs font-bold text-white active:scale-95"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentCurrency.name}</span>
                    <img
                      src={getFlagUrl(currentCurrency.code)}
                      alt={currentCurrency.code}
                      className="w-5 h-5 rounded-full object-cover border border-white/10"
                    />
                  </button>
                )}
              </div>

              {/* Large Result Display */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400/80">
                  {direction === 'toToman' ? 'تومان' : currentCurrency.code}
                </span>
                <div className="w-full text-left font-black text-2xl sm:text-3xl text-emerald-400 tabular-nums select-all font-mono">
                  {numAmount > 0 ? result.toLocaleString('fa-IR') : '۰'}
                </div>
              </div>
            </div>

            {/* Rate Banner */}
            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-400">نرخ مرجع بازار:</span>
              <span className="text-white font-bold tabular-nums">
                ۱ {currentCurrency.name} = {formatPrice(currentCurrency.price, 'persian')} تومان
              </span>
            </div>

            {/* Bottom Actions: Copy Result & Close */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>کپی مبلغ نتیجه</span>
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
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
