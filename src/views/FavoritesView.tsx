import React from 'react';
import { Star, Coins } from 'lucide-react';
import { CurrencyItem, GoldItem, CryptoItem } from '../types';

interface FavoritesViewProps {
  cryptoList: CryptoItem[];
  currencies: CurrencyItem[];
  goldList: GoldItem[];
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  cryptoList,
  currencies,
  goldList,
}) => {
  const favoriteCryptos = cryptoList.slice(0, 4);
  const favoriteCurrencies = currencies.slice(0, 4);
  const favoriteGold = goldList.slice(0, 4);

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      <div className="flex items-center justify-end gap-2">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">علاقه‌مندی‌ها</h2>
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
          <Star className="w-4 h-4 fill-amber-400" />
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
        اقلام نشان‌شده برای دسترسی و رصد سریع نرخ‌ها
      </p>

      {/* Cryptos */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 text-right">رمزارزهای برگزیده</div>
        <div className="grid grid-cols-2 gap-2.5">
          {favoriteCryptos.map((coin) => (
            <div key={coin.ticker} className="chatgpt-card p-3 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-right">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{coin.nameFa}</h3>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{coin.ticker}</div>
                </div>
                <img src={coin.iconUrl} alt={coin.ticker} className="w-6 h-6 rounded-full bg-slate-800" />
              </div>
              <div className="my-2 text-right">
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 tabular-nums">
                  {coin.priceToman.toLocaleString('fa-IR')}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">تومان</div>
              </div>
              <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-end">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 dark:text-emerald-400">
                  +{coin.change24h}% ▲
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gold */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 text-right">طلا و سکه‌های منتخب</div>
        <div className="grid grid-cols-2 gap-2.5">
          {favoriteGold.map((item) => (
            <div key={item.name} className="chatgpt-card p-3 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-right">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 text-right">
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 tabular-nums">{item.price}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">تومان</div>
              </div>
              <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-end">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 dark:text-emerald-400">
                  {item.change_24h || '+۱.۲۰%'} ▲
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
