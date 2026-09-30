import React, { useState } from 'react';
import { CurrencyItem, GoldItem, CryptoItem, TabType } from '../types';
import { AppleSparkline } from '../components/AppleSparkline';
import { getFlagUrl } from '../services/api';
import { formatPrice, formatNumber } from '../services/format';
import { Coins, CircleDollarSign, Star, TrendingUp, Receipt, Share2, LineChart, Sparkles } from 'lucide-react';
import { GoldBarsHero } from '../components/GoldBarsHero';
import { isItemFavorite } from '../services/storage';
import { CoinBubbleModal } from '../components/Modals/CoinBubbleModal';
import { GoldCalculatorModal } from '../components/Modals/GoldCalculatorModal';
import { ShareCardItem } from '../services/shareCard';

interface DashboardViewProps {
  cryptoList: CryptoItem[];
  currencies: CurrencyItem[];
  goldList: GoldItem[];
  lastUpdate: string;
  onNavigate: (tab: any) => void;
  numberFormat?: 'persian' | 'english';
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenChart?: (assetName: string, currentPrice: number) => void;
  onOpenShareCard?: (spotlight?: ShareCardItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cryptoList,
  currencies,
  goldList,
  onNavigate,
  numberFormat = 'persian',
  favorites,
  onToggleFavorite,
  onOpenChart,
  onOpenShareCard,
}) => {
  const [marketFilter, setMarketFilter] = useState<'all' | 'gold' | 'currency' | 'crypto' | 'favorites'>('all');
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

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

  // Find exact items or sensible fallbacks (never match حباب for hero cards)
  const dollarItem = currencies.find((c) => c.code === 'USD') || {
    name: 'دلار آمریکا',
    code: 'USD',
    price: '233,300',
    change_24h: '+0.83%',
  };

  const usdtItem = cryptoList.find((c) => c.ticker === 'USDT') || {
    symbol: 'USDT_IRT',
    ticker: 'USDT',
    nameFa: 'تتر',
    nameEn: 'Tether',
    priceToman: 230880,
    priceDollar: 1,
    change24h: 0.5,
    iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png',
  };

  const gold18Item =
    goldList.find((g) => g.name === 'طلای 18 عیار / 750' || g.name === 'طلای ۱۸ عیار') ||
    goldList.find(
      (g) =>
        (g.name.includes('۱۸') || g.name.includes('18')) &&
        !g.name.includes('حباب') &&
        !g.name.includes('دست دوم')
    ) || {
      name: 'طلای ۱۸ عیار',
      price: '23,874,800',
      change_24h: '+1.85%',
    };

  const coinEmamiItem =
    goldList.find((g) => g.name === 'سکه امامی') ||
    goldList.find((g) => g.name.includes('امامی') && !g.name.includes('حباب')) || {
      name: 'سکه امامی',
      price: '237,480,000',
      change_24h: '+2.10%',
    };

  // Live Market items for the bottom card
  const btcItem = cryptoList.find((c) => c.ticker === 'BTC') || {
    symbol: 'BTC_USDT',
    ticker: 'BTC',
    nameFa: 'بیت کوین',
    nameEn: 'Bitcoin',
    priceDollar: 85922,
    priceToman: 85922 * 230880,
    change24h: 3.45,
    iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png',
  };

  const euroItem = currencies.find((c) => c.code === 'EUR') || {
    name: 'یورو اروپا',
    code: 'EUR',
    price: '267,500',
    change_24h: '+0.35%',
  };

  const aedItem = currencies.find((c) => c.code === 'AED') || {
    name: 'درهم امارات',
    code: 'AED',
    price: '63,520',
    change_24h: '+0.22%',
  };

  const halfCoinItem =
    goldList.find((g) => g.name === 'نیم سکه' || g.name === 'نیم سکه بهار آزادی') ||
    goldList.find((g) => g.name.includes('نیم') && !g.name.includes('حباب')) || {
      name: 'نیم سکه بهار آزادی',
      price: '121,000,000',
      change_24h: '+0.35%',
    };

  return (
    <div className="space-y-3.5 pb-12 animate-fadeIn">
      {/* 1. 3D Gold Bars Hero Section matching media_1790080449509.png */}
      <GoldBarsHero />

      {/* Quick Financial Tools: حباب‌سنج سکه، فاکتور طلا و کارت استوری */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setIsBubbleOpen(true)}
          className="glass-card p-2.5 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent flex flex-col items-center justify-center text-center hover:border-amber-400/50 active:scale-[0.98] transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-[11px] font-black text-slate-900 dark:text-white">حباب‌سنج سکه</span>
          <span className="block text-[9px] text-amber-500 dark:text-amber-400 font-semibold">ارزش واقعی</span>
        </button>

        <button
          onClick={() => setIsInvoiceOpen(true)}
          className="glass-card p-2.5 rounded-2xl border border-white/10 dark:border-white/10 bg-gradient-to-br from-white/5 to-transparent flex flex-col items-center justify-center text-center hover:border-amber-400/50 active:scale-[0.98] transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="block text-[11px] font-black text-slate-900 dark:text-white">فاکتور طلا</span>
          <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-semibold">محاسبه اجرت</span>
        </button>

        <button
          onClick={() => onOpenShareCard && onOpenShareCard()}
          className="glass-card p-2.5 rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent flex flex-col items-center justify-center text-center hover:border-blue-400/50 active:scale-[0.98] transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-400/20 text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="block text-[11px] font-black text-slate-900 dark:text-white">کارت تصویر</span>
          <span className="block text-[9px] text-blue-500 dark:text-blue-400 font-semibold">استوری و اشتراک</span>
        </button>
      </div>

      {/* 2. 2x2 Grid Cards matching website media_1790078411599.png */}
      <div className="cards-grid">
        {/* Card 1: تتر (USDT) */}
        <div
          onClick={() => onNavigate('crypto')}
          className="squircle-card cursor-pointer"
        >
          {/* Row 1: Identity */}
          <div className="card-top-row flex items-center justify-between">
            <div className="card-identity">
              <div className="circle-disc">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#26A17B" />
                  <path
                    d="M17.9 17.3c-.2 0-1.2.1-1.9.1s-1.7 0-2-.1c-3.7-.2-6.5-.8-6.5-1.5s2.8-1.3 6.5-1.5c.3 0 1.3-.1 2-.1.7 0 1.8.1 1.9.1 3.7.2 6.5.8 6.5 1.5s-2.7 1.3-6.5 1.5zm0-3.6V12h5.5V9.4H8.6V12h5.5v1.7c-4.3.2-7.5 1-7.5 2s3.2 1.8 7.5 2v7.1h3.8v-7.1c4.3-.2 7.5-1 7.5-2s-3.2-1.8-7.5-2z"
                    fill="#FFF"
                  />
                </svg>
              </div>
              <div className="card-name-group">
                <span className="card-title">تتر</span>
                <span className="card-subtitle">USDT</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChart && onOpenChart('تتر (USDT)', usdtItem.priceToman || 230880);
                }}
                className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="نمودار تحلیلی"
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite('USDT');
                }}
                className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="افزودن به علاقه‌مندی‌ها"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isItemFavorite('USDT', favorites)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-400/40 hover:text-amber-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Row 2: Price + Unit */}
          <div className="card-price-row">
            <span className="card-main-price">
              {formatPrice(usdtItem.priceToman || 230880, numberFormat)}
            </span>
            <span className="card-currency-unit">تومان</span>
          </div>

          {/* Row 3: Sparkline + Badge */}
          <div className="card-bottom-row">
            <div className="chart-container">
              <AppleSparkline id="usdt" color="#30D158" isUp={true} width={68} height={24} />
            </div>
            <span className="badge-pill badge-green">
              {formatNumber('+0.50%', numberFormat)} ▲
            </span>
          </div>
        </div>

        {/* Card 2: دلار آمریکا (USD) */}
        <div
          onClick={() => onNavigate('currencies')}
          className="squircle-card cursor-pointer"
        >
          {/* Row 1: Identity */}
          <div className="card-top-row flex items-center justify-between">
            <div className="card-identity">
              <div className="circle-disc">
                <img
                  src="https://flagcdn.com/w160/us.png"
                  alt="USD"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="card-name-group">
                <span className="card-title">دلار آمریکا</span>
                <span className="card-subtitle">USD</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChart && onOpenChart('دلار آمریکا', parseFloat(dollarItem.price.replace(/,/g, '')) || 233300);
                }}
                className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="نمودار تحلیلی"
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite('USD');
                }}
                className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="افزودن به علاقه‌مندی‌ها"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isItemFavorite('USD', favorites)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-400/40 hover:text-amber-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Row 2: Price + Unit */}
          <div className="card-price-row">
            <span className="card-main-price">
              {formatPrice(dollarItem.price, numberFormat)}
            </span>
            <span className="card-currency-unit">تومان</span>
          </div>

          {/* Row 3: Sparkline + Badge */}
          <div className="card-bottom-row">
            <div className="chart-container">
              <AppleSparkline id="usd" color="#30D158" isUp={true} width={68} height={24} />
            </div>
            <span className="badge-pill badge-green">
              {formatNumber(dollarItem.change_24h || '+0.83%', numberFormat)} ▲
            </span>
          </div>
        </div>

        {/* Card 3: سکه امامی */}
        <div
          onClick={() => onNavigate('gold')}
          className="squircle-card cursor-pointer"
        >
          {/* Row 1: Identity */}
          <div className="card-top-row flex items-center justify-between">
            <div className="card-identity">
              <div className="circle-disc gold-disc">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="card-name-group">
                <span className="card-title">سکه امامی</span>
                <span className="card-subtitle">طرح جدید</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChart && onOpenChart('سکه امامی', parseFloat(coinEmamiItem.price.replace(/,/g, '')) || 237480000);
                }}
                className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="نمودار تحلیلی"
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite('سکه امامی');
                }}
                className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="افزودن به علاقه‌مندی‌ها"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isItemFavorite('سکه امامی', favorites)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-400/40 hover:text-amber-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Row 2: Price + Unit */}
          <div className="card-price-row">
            <span className="card-main-price">
              {formatPrice(coinEmamiItem.price, numberFormat)}
            </span>
            <span className="card-currency-unit">تومان</span>
          </div>

          {/* Row 3: Sparkline + Badge */}
          <div className="card-bottom-row">
            <div className="chart-container">
              <AppleSparkline id="coin" color="#FBBF24" isUp={true} width={68} height={24} />
            </div>
            <span className="badge-pill badge-gold">
              {formatNumber(coinEmamiItem.change_24h || '+2.10%', numberFormat)} ▲
            </span>
          </div>
        </div>

        {/* Card 4: طلای ۱۸ عیار */}
        <div
          onClick={() => onNavigate('gold')}
          className="squircle-card cursor-pointer"
        >
          {/* Row 1: Identity */}
          <div className="card-top-row flex items-center justify-between">
            <div className="card-identity">
              <div className="circle-disc gold-disc">
                <CircleDollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="card-name-group">
                <span className="card-title">طلای ۱۸ عیار</span>
                <span className="card-subtitle">عیار ۷۵۰</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChart && onOpenChart('طلای ۱۸ عیار', parseFloat(gold18Item.price.replace(/,/g, '')) || 23874800);
                }}
                className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="نمودار تحلیلی"
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite('طلای ۱۸ عیار');
                }}
                className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                title="افزودن به علاقه‌مندی‌ها"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isItemFavorite('طلای ۱۸ عیار', favorites)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-400/40 hover:text-amber-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Row 2: Price + Unit */}
          <div className="card-price-row">
            <span className="card-main-price">
              {formatPrice(gold18Item.price, numberFormat)}
            </span>
            <span className="card-currency-unit">تومان</span>
          </div>

          {/* Row 3: Sparkline + Badge */}
          <div className="card-bottom-row">
            <div className="chart-container">
              <AppleSparkline id="gold18" color="#30D158" isUp={true} width={68} height={24} />
            </div>
            <span className="badge-pill badge-green">
              {formatNumber(gold18Item.change_24h || '+1.85%', numberFormat)} ▲
            </span>
          </div>
        </div>
      </div>

      {/* 3. Market Overview Table Card ("بازار لحظه‌ای") */}
      <div className="market-table-card rounded-2xl p-3.5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-md">
        {/* Table Header: Title Row + Filter Pills Row */}
        <div className="table-header-row flex flex-col gap-2 pb-2 mb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {marketFilter === 'favorites' ? 'علاقه‌مندی‌های من' : 'بازار لحظه‌ای'}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {marketFilter === 'favorites' ? 'اقلام نشان‌شده شما' : 'نوسانات زنده'}
            </span>
          </div>

          <div className="table-filter-pills flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'همه' },
              { id: 'favorites', label: '⭐ نشان‌شده‌ها' },
              { id: 'gold', label: 'طلا' },
              { id: 'currency', label: 'ارز' },
              { id: 'crypto', label: 'کریپتو' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMarketFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  marketFilter === tab.id
                    ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-400/40 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {/* Favorites List View */}
          {marketFilter === 'favorites' && (
            <>
              {(() => {
                const favCurrencies = currencies.filter(
                  (c) => isItemFavorite(c.code, favorites) || isItemFavorite(c.name, favorites)
                );
                const favGold = goldList.filter((g) => isItemFavorite(g.name, favorites));
                const favCrypto = cryptoList.filter(
                  (c) => isItemFavorite(c.ticker, favorites) || isItemFavorite(c.nameFa, favorites)
                );
                const totalFavs = favCurrencies.length + favGold.length + favCrypto.length;

                if (totalFavs === 0) {
                  return (
                    <div className="py-8 text-center space-y-2">
                      <Star className="w-8 h-8 text-amber-400/40 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        هنوز موردی به نشان‌شده‌ها اضافه نکرده‌اید
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        با زدن روی علامت ستاره (⭐) کنار هر نرخ، آن را به این لیست بیاورید.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {favCurrencies.map((c, idx) => {
                      const isDown = c.change_24h?.includes('-');
                      return (
                        <div
                          key={c.code}
                          onClick={() => onNavigate('currencies')}
                          className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(c.code);
                              }}
                              className="p-1 text-amber-400 active:scale-90 transition-transform shrink-0"
                            >
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </button>
                            <img
                              src={getFlagUrl(c.code)}
                              alt={c.code}
                              className="w-7 h-7 rounded-full object-cover shadow-sm shrink-0 border border-black/10 dark:border-white/10"
                            />
                            <div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{c.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{c.code}</div>
                            </div>
                          </div>

                          <div className="hidden sm:block">
                            <AppleSparkline id={`fav_c_${idx}`} color="#0284C7" isUp={!isDown} width={56} height={18} />
                          </div>

                          <div className="text-left">
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                              {formatPrice(c.price, numberFormat)}{' '}
                              <span className="text-[9px] text-slate-500 dark:text-slate-400">ت</span>
                            </div>
                            <div className={`text-[10px] font-semibold tabular-nums ${isDown ? 'text-red-500' : 'text-emerald-500'}`}>
                              {formatNumber(c.change_24h || '+۰.۸%', numberFormat)} {isDown ? '▼' : '▲'}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {favGold.map((g, idx) => {
                      const isDown = g.change_24h?.includes('-');
                      return (
                        <div
                          key={g.name}
                          onClick={() => onNavigate('gold')}
                          className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(g.name);
                              }}
                              className="p-1 text-amber-400 active:scale-90 transition-transform shrink-0"
                            >
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </button>
                            <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                              <Coins className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{g.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">طلا و سکه</div>
                            </div>
                          </div>

                          <div className="hidden sm:block">
                            <AppleSparkline id={`fav_g_${idx}`} color="#FBBF24" isUp={!isDown} width={56} height={18} />
                          </div>

                          <div className="text-left">
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                              {formatPrice(g.price, numberFormat)}{' '}
                              <span className="text-[9px] text-slate-500 dark:text-slate-400">ت</span>
                            </div>
                            <div className={`text-[10px] font-semibold tabular-nums ${isDown ? 'text-red-500' : 'text-amber-500 dark:text-amber-400'}`}>
                              {formatNumber(g.change_24h || '+۱.۲%', numberFormat)} {isDown ? '▼' : '▲'}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {favCrypto.map((cr, idx) => (
                      <div
                        key={cr.ticker}
                        onClick={() => onNavigate('crypto')}
                        className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(cr.ticker);
                            }}
                            className="p-1 text-amber-400 active:scale-90 transition-transform shrink-0"
                          >
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          </button>
                          <img
                            src={cr.iconUrl}
                            alt={cr.ticker}
                            className="w-7 h-7 rounded-full bg-slate-800 shrink-0"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{cr.nameFa}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{cr.ticker} - تتر</div>
                          </div>
                        </div>

                        <div className="hidden sm:block">
                          <AppleSparkline id={`fav_cr_${idx}`} color="#30D158" isUp={cr.change24h >= 0} width={56} height={18} />
                        </div>

                        <div className="text-left">
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                            ${formatPrice(cr.priceDollar || 1, numberFormat)}
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 tabular-nums">
                            +{formatNumber(cr.change24h || 0.5, numberFormat)}% ▲
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </>
          )}

          {/* BTC Row */}
          {(marketFilter === 'all' || marketFilter === 'crypto') && (
            <div
              onClick={() => onNavigate('crypto')}
              className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite('BTC');
                  }}
                  className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform shrink-0"
                  title="نشان کردن"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isItemFavorite('BTC', favorites)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-400/40 hover:text-amber-400'
                    }`}
                  />
                </button>
                <img
                  src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png"
                  alt="BTC"
                  className="w-8 h-8 rounded-full bg-slate-800 shrink-0"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">بیت‌کوین</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">بیت‌کوین - تتر</div>
                </div>
              </div>

              <div className="hidden sm:block">
                <AppleSparkline id="btc_row" color="#30D158" isUp={true} width={56} height={18} />
              </div>

              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ${formatPrice(btcItem.priceDollar || 85922, numberFormat)}
                </div>
                <div className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 tabular-nums">
                  +{formatNumber(btcItem.change24h || 3.45, numberFormat)}% ▲
                </div>
              </div>
            </div>
          )}

          {/* Euro Row */}
          {(marketFilter === 'all' || marketFilter === 'currency') && (
            <div
              onClick={() => onNavigate('currencies')}
              className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite('EUR');
                  }}
                  className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform shrink-0"
                  title="نشان کردن"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isItemFavorite('EUR', favorites)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-400/40 hover:text-amber-400'
                    }`}
                  />
                </button>
                <img
                  src={getFlagUrl('EUR')}
                  alt="EUR"
                  className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0 border border-black/10 dark:border-white/10"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">یورو اروپا</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">EUR</div>
                </div>
              </div>

              <div className="hidden sm:block">
                <AppleSparkline id="eur_row" color="#0284C7" isUp={true} width={56} height={18} />
              </div>

              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatPrice(euroItem.price, numberFormat)}{' '}
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">ت</span>
                </div>
                <div className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 tabular-nums">
                  {formatNumber(euroItem.change_24h || '+0.35%', numberFormat)} ▲
                </div>
              </div>
            </div>
          )}

          {/* AED Row */}
          {(marketFilter === 'all' || marketFilter === 'currency') && (
            <div
              onClick={() => onNavigate('currencies')}
              className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite('AED');
                  }}
                  className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform shrink-0"
                  title="نشان کردن"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isItemFavorite('AED', favorites)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-400/40 hover:text-amber-400'
                    }`}
                  />
                </button>
                <img
                  src={getFlagUrl('AED')}
                  alt="AED"
                  className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0 border border-black/10 dark:border-white/10"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">درهم امارات</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">AED</div>
                </div>
              </div>

              <div className="hidden sm:block">
                <AppleSparkline id="aed_row" color="#0284C7" isUp={true} width={56} height={18} />
              </div>

              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatPrice(aedItem.price, numberFormat)}{' '}
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">ت</span>
                </div>
                <div className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 tabular-nums">
                  {formatNumber(aedItem.change_24h || '+0.22%', numberFormat)} ▲
                </div>
              </div>
            </div>
          )}

          {/* Half Bahar Coin Row */}
          {(marketFilter === 'all' || marketFilter === 'gold') && (
            <div
              onClick={() => onNavigate('gold')}
              className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite('نیم سکه');
                  }}
                  className="p-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform shrink-0"
                  title="نشان کردن"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isItemFavorite('نیم سکه', favorites)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-400/40 hover:text-amber-400'
                    }`}
                  />
                </button>
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {halfCoinItem.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">طلا و سکه</div>
                </div>
              </div>

              <div className="hidden sm:block">
                <AppleSparkline id="half_row" color="#FBBF24" isUp={true} width={56} height={18} />
              </div>

              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatPrice(halfCoinItem.price, numberFormat)}{' '}
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">ت</span>
                </div>
                <div className="text-[10px] font-semibold text-amber-500 dark:text-amber-400 tabular-nums">
                  {formatNumber(halfCoinItem.change_24h || '+0.35%', numberFormat)} ▲
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gold Purchase & Invoice Calculator Modal */}
      <GoldCalculatorModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        goldPrice18k={raw18kPrice}
        numberFormat={numberFormat}
      />

      {/* Coin & Gold Bubble Analyzer Modal */}
      <CoinBubbleModal
        isOpen={isBubbleOpen}
        onClose={() => setIsBubbleOpen(false)}
        goldList={goldList}
        numberFormat={numberFormat}
      />
    </div>
  );
};
