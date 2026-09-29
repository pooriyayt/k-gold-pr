import React, { useState } from 'react';
import { CryptoItem } from '../types';
import { getCryptoFallbackAvatar } from '../services/api';
import { AppleSparkline } from '../components/AppleSparkline';
import { formatPrice, formatNumber } from '../services/format';
import { CryptoConverterModal } from '../components/Modals/CryptoConverterModal';
import { Search, Zap, Star } from 'lucide-react';
import { isItemFavorite } from '../services/storage';

interface CryptoViewProps {
  cryptoList: CryptoItem[];
  lastUpdate: string;
  numberFormat?: 'persian' | 'english';
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const CryptoView: React.FC<CryptoViewProps> = ({
  cryptoList,
  numberFormat = 'persian',
  favorites = [],
  onToggleFavorite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unit, setUnit] = useState<'toman' | 'dollar'>('toman');
  const [selectedQuickCoin, setSelectedQuickCoin] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  const popularCoins = ['BTC', 'ETH', 'USDT', 'SOL', 'BNB'];

  const filtered = cryptoList.filter((c) => {
    if (showFavoritesOnly && !isItemFavorite(c.ticker, favorites) && !isItemFavorite(c.nameFa, favorites)) {
      return false;
    }
    if (selectedQuickCoin && c.ticker !== selectedQuickCoin) return false;
    const term = searchTerm.toLowerCase();
    return (
      c.ticker.toLowerCase().includes(term) ||
      c.nameFa.toLowerCase().includes(term) ||
      c.nameEn.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-3.5 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsConverterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/20 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>تبدیل رمزارز</span>
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">ارز دیجیتال</h2>
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
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
          placeholder="جستجوی رمزارز (BTC, اتریوم...)"
          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl pr-9 pl-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
        />
      </div>

      {/* Toman / Dollar Toggle Switch */}
      <div className="flex items-center justify-center gap-2 bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--card-border)] text-xs font-bold">
        <button
          onClick={() => setUnit('toman')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            unit === 'toman'
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          قیمت به تومان
        </button>
        <button
          onClick={() => setUnit('dollar')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            unit === 'dollar'
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          قیمت به دلار ($)
        </button>
      </div>

      {/* Popular Coins Horizontal Scroll Bar */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-right pr-1">
          رمزارزهای محبوب و دسته‌بندی
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              setShowFavoritesOnly(false);
              setSelectedQuickCoin(null);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              !showFavoritesOnly && !selectedQuickCoin
                ? 'bg-slate-900/15 dark:bg-[#18233A] border-slate-300 dark:border-white/20 text-slate-900 dark:text-white shadow-sm'
                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>همه</span>
          </button>

          <button
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setSelectedQuickCoin(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              showFavoritesOnly
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-500 dark:text-amber-400 shadow-sm'
                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span>⭐ نشان‌شده‌ها</span>
          </button>

          {popularCoins.map((ticker) => {
            const coin = cryptoList.find((c) => c.ticker === ticker);
            const isSelected = selectedQuickCoin === ticker && !showFavoritesOnly;

            return (
              <button
                key={ticker}
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setSelectedQuickCoin(isSelected ? null : ticker);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900/15 dark:bg-[#18233A] border-purple-500/60 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'bg-[var(--card-bg)] border-[var(--card-border)] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <img
                  src={
                    coin?.iconUrl ||
                    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${ticker.toLowerCase()}.png`
                  }
                  alt={ticker}
                  className="w-4 h-4 rounded-full bg-slate-800"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = getCryptoFallbackAvatar(ticker);
                  }}
                />
                <span>{ticker}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State when no favorites match */}
      {showFavoritesOnly && filtered.length === 0 && (
        <div className="py-12 text-center space-y-2">
          <Star className="w-8 h-8 text-amber-400/40 mx-auto" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            هیچ رمزارزی به علاقه‌مندی‌ها اضافه نشده است
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            با لمس علامت ستاره کنار هر رمزارز، آن را نشان کنید.
          </p>
        </div>
      )}

      {/* 2-Column Grid Cards matching website design */}
      <div className="cards-grid">
        {filtered.map((coin, idx) => {
          const isDown = coin.change24h < 0;
          const col = isDown ? '#FF453A' : '#30D158';

          return (
            <div
              key={coin.ticker}
              className="squircle-card p-3 flex flex-col justify-between"
            >
              {/* Row 1: Identity */}
              <div className="card-top-row flex items-center justify-between">
                <div className="card-identity">
                  <div className="circle-disc">
                    <img
                      src={coin.iconUrl}
                      alt={coin.ticker}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = getCryptoFallbackAvatar(coin.ticker);
                      }}
                    />
                  </div>
                  <div className="card-name-group">
                    <span className="card-title line-clamp-1">{coin.nameFa}</span>
                    <span className="card-subtitle font-mono">{coin.ticker}</span>
                  </div>
                </div>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(coin.ticker);
                    }}
                    className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                    title="نشان کردن"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        isItemFavorite(coin.ticker, favorites)
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
                  {unit === 'toman'
                    ? formatPrice(coin.priceToman, numberFormat)
                    : `$${formatPrice(coin.priceDollar, numberFormat)}`}
                </span>
                <span className="card-currency-unit">
                  {unit === 'toman' ? 'تومان' : 'دلار'}
                </span>
              </div>

              {/* Row 3: Sparkline + Badge */}
              <div className="card-bottom-row">
                <div className="chart-container">
                  <AppleSparkline
                    id={`crypto_${idx}`}
                    color={col}
                    isUp={!isDown}
                    width={68}
                    height={24}
                  />
                </div>
                <span
                  className={`badge-pill ${isDown ? 'badge-red' : 'badge-green'}`}
                >
                  {isDown ? '' : '+'}
                  {formatNumber(coin.change24h, numberFormat)}% {isDown ? '▼' : '▲'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Crypto Converter Modal */}
      <CryptoConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        cryptoList={cryptoList}
      />
    </div>
  );
};
