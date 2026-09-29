import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Copy, Check, Zap, Coins } from 'lucide-react';
import { CryptoItem } from '../../types';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface CryptoConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoList: CryptoItem[];
}

export const CryptoConverterModal: React.FC<CryptoConverterModalProps> = ({
  isOpen,
  onClose,
  cryptoList,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>('BTC');
  const [amount, setAmount] = useState<string>('1');
  const [targetUnit, setTargetUnit] = useState<'toman' | 'dollar'>('toman');
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

  const currentCoin =
    cryptoList.find((c) => c.ticker === selectedTicker) ||
    cryptoList[0] || {
      ticker: 'BTC',
      nameFa: 'بیت‌کوین',
      priceToman: 7500000000,
      priceDollar: 86300,
    };

  const numAmount = parseFloat(amount) || 0;
  const resultToman = Math.round(numAmount * (currentCoin?.priceToman || 0));
  const resultDollar = Number((numAmount * (currentCoin?.priceDollar || 0)).toFixed(2));

  const handleCopy = async () => {
    try {
      const textToCopy =
        targetUnit === 'toman'
          ? resultToman.toLocaleString('fa-IR')
          : resultDollar.toLocaleString('en-US');
      await navigator.clipboard.writeText(textToCopy);
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

  const handleSelectCoin = (ticker: string) => {
    setSelectedTicker(ticker);
    setIsDropdownOpen(false);
    setSearchQuery('');
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  const filteredCoins = cryptoList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.nameFa.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q);
  });

  const topTickers = ['BTC', 'ETH', 'USDT', 'SOL', 'BNB'];
  const quickCryptoAmounts = ['0.1', '0.5', '1', '2', '5', '10'];

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
              <span>تبدیل هوشمند ارز دیجیتال</span>
              <Coins className="w-4 h-4 text-purple-400" />
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              محاسبه آنلاین ارزش تومانی و دلاری رمزارزها
            </p>
          </div>
        </div>

        {/* Full Search List Dropdown */}
        {isDropdownOpen ? (
          <div className="space-y-3 py-2 animate-fadeIn flex-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs text-purple-400 font-bold hover:underline"
              >
                بازگشت به ماشین‌حساب ←
              </button>
              <span className="text-xs font-bold text-slate-300">
                انتخاب رمزارز ({cryptoList.length} ارز)
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی رمزارز (BTC, اتریوم, تتر...)"
                autoFocus
                className="w-full bg-[#141B2A] border border-white/15 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1 divide-y divide-white/5 no-scrollbar">
              {filteredCoins.map((c) => (
                <div
                  key={c.ticker}
                  onClick={() => handleSelectCoin(c.ticker)}
                  className={`py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    c.ticker === selectedTicker
                      ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                      : 'hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-black flex items-center justify-center text-xs">
                      {c.ticker.slice(0, 3)}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{c.nameFa}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.ticker}</div>
                    </div>
                  </div>

                  <div className="text-left font-semibold text-xs text-slate-300 tabular-nums">
                    <div>{c.priceToman.toLocaleString('fa-IR')} <span className="text-[10px] text-slate-500">تومان</span></div>
                    <div className="text-[10px] text-purple-400 font-mono">${c.priceDollar.toLocaleString('en-US')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Normal Crypto Calculator View */
          <div className="space-y-3.5 my-2">
            {/* Quick Currency Unit Switcher (تومان / دلار) */}
            <div className="grid grid-cols-2 p-1 bg-[#141B2A] border border-white/10 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setTargetUnit('toman')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  targetUnit === 'toman'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                نمایش به تومان
              </button>
              <button
                type="button"
                onClick={() => setTargetUnit('dollar')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  targetUnit === 'dollar'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                نمایش به دلار ($)
              </button>
            </div>

            {/* Quick Coin Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] text-slate-500 whitespace-nowrap pl-1">کوین‌ها:</span>
              {topTickers.map((t) => {
                const coin = cryptoList.find((c) => c.ticker === t);
                const isSelected = selectedTicker === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleSelectCoin(t)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{coin?.nameFa || t}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-purple-400 text-xs font-bold shrink-0 hover:bg-white/10"
              >
                همه +
              </button>
            </div>

            {/* Box 1: Amount & Crypto Selection */}
            <div className="bg-[#141B2A]/90 border border-white/10 rounded-2xl p-3.5 relative focus-within:border-purple-400/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">تعداد یا حجم:</span>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>{currentCoin.nameFa} ({currentCoin.ticker})</span>
                </button>
              </div>

              {/* Input */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{currentCoin.ticker}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-black text-2xl sm:text-3xl text-white tabular-nums border-none outline-none focus:ring-0 placeholder:text-slate-600 font-mono pr-2"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-slate-500 whitespace-nowrap pl-1">سریع:</span>
                {quickCryptoAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickAmount(q)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                      amount === q
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {q} {currentCoin.ticker}
                  </button>
                ))}
              </div>
            </div>

            {/* Box 2: Target Result */}
            <div className="bg-[#141B2A]/90 border border-purple-500/25 rounded-2xl p-3.5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">
                  ارزش معادل {targetUnit === 'toman' ? 'تومانی:' : 'دلاری:'}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                  <span>{targetUnit === 'toman' ? 'تومان ایران' : 'دلار ($)'}</span>
                </div>
              </div>

              {/* Large Result Display */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400/80">
                  {targetUnit === 'toman' ? 'تومان' : 'USD'}
                </span>
                <div className="w-full text-left font-black text-2xl sm:text-3xl text-purple-300 tabular-nums select-all font-mono">
                  {numAmount > 0
                    ? targetUnit === 'toman'
                      ? resultToman.toLocaleString('fa-IR')
                      : `$${resultDollar.toLocaleString('en-US')}`
                    : '۰'}
                </div>
              </div>
            </div>

            {/* Rate Info Banner */}
            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-400">نرخ پایه ۱ {currentCoin.nameFa}:</span>
              <div className="text-right">
                <span className="text-white font-bold tabular-nums">
                  {currentCoin.priceToman.toLocaleString('fa-IR')} تومان
                </span>
                <span className="mx-1.5 text-slate-600">|</span>
                <span className="text-purple-400 font-mono font-bold">
                  ${currentCoin.priceDollar.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
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
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-500/20 active:scale-95 transition-all text-center"
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
