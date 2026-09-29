import React, { useState } from 'react';
import { CurrencyItem } from '../types';
import { getFlagUrl } from '../services/api';
import { AppleSparkline } from '../components/AppleSparkline';
import { formatPrice, formatNumber } from '../services/format';
import { CurrencyConverterModal } from '../components/Modals/CurrencyConverterModal';
import { Search, Globe, ArrowUpDown, Star } from 'lucide-react';
import { isItemFavorite } from '../services/storage';

interface CurrencyViewProps {
  currencies: CurrencyItem[];
  lastUpdate: string;
  numberFormat?: 'persian' | 'english';
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const CurrencyView: React.FC<CurrencyViewProps> = ({
  currencies,
  numberFormat = 'persian',
  favorites = [],
  onToggleFavorite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '3m'>('3m');
  const [filterCode, setFilterCode] = useState<string>('all');
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  const filtered = currencies.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term);
    if (!matchesSearch) return false;

    if (filterCode === 'favorites') {
      return isItemFavorite(c.code, favorites) || isItemFavorite(c.name, favorites);
    }
    if (filterCode === 'usd') return c.code === 'USD';
    if (filterCode === 'eur') return c.code === 'EUR';
    if (filterCode === 'aed') return c.code === 'AED';
    if (filterCode === 'gbp') return c.code === 'GBP';
    return true;
  });

  return (
    <div className="space-y-3.5 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsConverterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 active:scale-95 transition-all"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>تبدیل ارز</span>
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">ارزهای دولتی</h2>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجوی ارز..."
          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl pr-9 pl-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
        />
      </div>

      {/* Timeframe Filter Tabs */}
      <div className="grid grid-cols-4 gap-2 bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--card-border)] text-xs font-bold text-center">
        {[
          { id: '3m', label: '۳ ماهه' },
          { id: '30d', label: '۳۰ روز' },
          { id: '7d', label: '۷ روز' },
          { id: '1d', label: '۱ روز' },
        ].map((tf) => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id as any)}
            className={`py-1.5 rounded-xl transition-all ${
              timeframe === tf.id
                ? 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 border border-emerald-400/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Currency Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'همه' },
          { id: 'favorites', label: '⭐ نشان‌شده‌ها' },
          { id: 'usd', label: 'دلار' },
          { id: 'eur', label: 'یورو' },
          { id: 'aed', label: 'درهم' },
          { id: 'gbp', label: 'پوند' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterCode(item.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCode === item.id
                ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Empty State when no favorites match */}
      {filterCode === 'favorites' && filtered.length === 0 && (
        <div className="py-12 text-center space-y-2">
          <Star className="w-8 h-8 text-amber-400/40 mx-auto" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            هیچ ارزی به علاقه‌مندی‌ها اضافه نشده است
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            با لمس علامت ستاره کنار هر ارز، آن را نشان کنید.
          </p>
        </div>
      )}

      {/* 2-Column Grid Cards matching website design */}
      <div className="cards-grid">
        {filtered.map((c, idx) => {
          const isDown = c.change_24h?.includes('-');
          const col = isDown ? '#FF453A' : '#30D158';

          return (
            <div
              key={c.code}
              className="squircle-card p-3 flex flex-col justify-between"
            >
              {/* Row 1: Identity */}
              <div className="card-top-row flex items-center justify-between">
                <div className="card-identity">
                  <div className="circle-disc">
                    <img
                      src={getFlagUrl(c.code)}
                      alt={c.code}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="card-name-group">
                    <span className="card-title line-clamp-1">{c.name}</span>
                    <span className="card-subtitle font-mono">{c.code}</span>
                  </div>
                </div>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(c.code);
                    }}
                    className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                    title="نشان کردن"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        isItemFavorite(c.code, favorites)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-400/40 hover:text-amber-400'
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Row 2: Price */}
              <div className="card-price-row">
                <span className="card-main-price">
                  {formatPrice(c.price, numberFormat)}
                </span>
                <span className="card-currency-unit">تومان</span>
              </div>

              {/* Row 3: Sparkline + Badge */}
              <div className="card-bottom-row">
                <div className="chart-container">
                  <AppleSparkline
                    id={`curr_${idx}`}
                    color={col}
                    isUp={!isDown}
                    width={68}
                    height={24}
                  />
                </div>
                <span
                  className={`badge-pill ${isDown ? 'badge-red' : 'badge-green'}`}
                >
                  {formatNumber(c.change_24h || '+۰.۸۳%', numberFormat)} {isDown ? '▼' : '▲'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Currency Converter Modal */}
      <CurrencyConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        currencies={currencies}
      />
    </div>
  );
};
