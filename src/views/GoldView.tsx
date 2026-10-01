import React, { useState } from 'react';
import { GoldItem } from '../types';
import { AppleSparkline } from '../components/AppleSparkline';
import { GoldCalculatorModal } from '../components/Modals/GoldCalculatorModal';
import { CoinBubbleModal } from '../components/Modals/CoinBubbleModal';
import { formatPrice, formatNumber, toEnglishDigits } from '../services/format';
import { Search, Receipt, Coins, CircleDollarSign, Star, TrendingUp } from 'lucide-react';
import { isItemFavorite } from '../services/storage';

interface GoldViewProps {
  goldList: GoldItem[];
  lastUpdate: string;
  numberFormat?: 'persian' | 'english';
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  onOpenChart?: (assetName: string, currentPrice: number) => void;
}

export const GoldView: React.FC<GoldViewProps> = ({
  goldList,
  numberFormat = 'persian',
  favorites = [],
  onToggleFavorite,
  onOpenChart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '3m'>('3m');
  const [category, setCategory] = useState<'all' | 'coins' | 'gold' | 'bubble' | 'favorites'>('all');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isBubbleModalOpen, setIsBubbleModalOpen] = useState(false);

  // Fallback 18k price for calculator
  const gold18k = goldList.find(
    (g) =>
      (g.name.includes('۱۸') || g.name.includes('18')) &&
      !g.name.includes('حباب') &&
      !g.name.includes('دست دوم')
  );
  const raw18kPrice = gold18k
    ? parseFloat(gold18k.price.replace(/,/g, ''))
    : 23874800;

  // Separate real items from bubbles and sort so real assets are first
  const sortedGoldList = [...goldList].sort((a, b) => {
    const aIsBubble = a.name.includes('حباب');
    const bIsBubble = b.name.includes('حباب');
    if (aIsBubble && !bIsBubble) return 1;
    if (!aIsBubble && bIsBubble) return -1;
    return 0;
  });

  // Filter items
  const filtered = sortedGoldList.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (category === 'favorites') return isItemFavorite(item.name, favorites);

    const isBubble = item.name.includes('حباب');
    const isCoin = item.name.includes('سکه') && !isBubble;
    const isGold = !isCoin && !isBubble;

    if (category === 'coins') return isCoin;
    if (category === 'gold') return isGold;
    if (category === 'bubble') return isBubble;
    return true;
  });

  return (
    <div className="space-y-3.5 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsBubbleModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 text-xs font-bold hover:bg-amber-500/25 active:scale-95 transition-all shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>حباب‌سنج سکه</span>
          </button>

          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-200 text-xs font-bold hover:bg-white/15 active:scale-95 transition-all"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-300" />
            <span>فاکتور طلا</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">طلا و سکه</h2>
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Coins className="w-4 h-4" />
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
          placeholder="جستجوی طلا و سکه..."
          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl pr-9 pl-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
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
                ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Sub-category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'همه' },
          { id: 'favorites', label: '⭐ نشان‌شده‌ها' },
          { id: 'coins', label: 'انواع سکه' },
          { id: 'gold', label: 'طلا و آبشده' },
          { id: 'bubble', label: 'حباب سکه‌ها' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Empty State when no favorites match */}
      {category === 'favorites' && filtered.length === 0 && (
        <div className="py-12 text-center space-y-2">
          <Star className="w-8 h-8 text-amber-400/40 mx-auto" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            هیچ طلا یا سکه‌ای به علاقه‌مندی‌ها اضافه نشده است
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            با لمس علامت ستاره کنار هر مورد، آن را نشان کنید.
          </p>
        </div>
      )}

      {/* 2-Column Grid Cards */}
      <div className="cards-grid">
        {filtered.map((item, idx) => {
          const isDown = item.change_24h?.includes('-');
          const isBubble = item.name.includes('حباب');
          const isCoin = item.name.includes('سکه');
          const col = isDown ? '#FF453A' : isBubble ? '#FBBF24' : '#30D158';

          return (
            <div
              key={item.name}
              onClick={() => {
                if (!isBubble && onOpenChart) {
                  const p = parseFloat(toEnglishDigits(item.price).replace(/[^0-9.]/g, '')) || 0;
                  onOpenChart(item.name, p);
                }
              }}
              className={`squircle-card p-3 flex flex-col justify-between ${
                !isBubble ? 'cursor-pointer hover:border-amber-400/40 active:scale-[0.98] transition-all' : ''
              }`}
            >
              {/* Row 1: Identity */}
              <div className="card-top-row flex items-center justify-between">
                <div className="card-identity">
                  <div className="circle-disc gold-disc">
                    {isCoin ? (
                      <CircleDollarSign className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Coins className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="card-name-group">
                    <span className="card-title line-clamp-1">{item.name}</span>
                    <span className="card-subtitle">
                      {isBubble ? 'حباب قیمت' : isCoin ? 'سکه رسمی' : 'عیار استاندارد'}
                    </span>
                  </div>
                </div>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.name);
                    }}
                    className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                    title="نشان کردن"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        isItemFavorite(item.name, favorites)
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
                  {formatPrice(item.price, numberFormat)}
                </span>
                <span className="card-currency-unit">تومان</span>
              </div>

              {/* Row 3: Sparkline + Badge */}
              <div className="card-bottom-row">
                <div className="chart-container">
                  <AppleSparkline
                    id={`gold_${idx}`}
                    color={col}
                    isUp={!isDown}
                    width={68}
                    height={24}
                  />
                </div>
                <span
                  className={`badge-pill ${
                    isDown ? 'badge-red' : isBubble ? 'badge-gold' : 'badge-green'
                  }`}
                >
                  {formatNumber(item.change_24h || '+۰.۵۰%', numberFormat)} {isDown ? '▼' : '▲'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gold Purchase & Invoice Calculator Modal */}
      <GoldCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        goldPrice18k={raw18kPrice}
        numberFormat={numberFormat}
      />

      {/* Coin & Gold Bubble Analyzer Modal */}
      <CoinBubbleModal
        isOpen={isBubbleModalOpen}
        onClose={() => setIsBubbleModalOpen(false)}
        goldList={goldList}
        numberFormat={numberFormat}
      />
    </div>
  );
};
