import React, { useState, useMemo } from 'react';
import { AppleSparkline } from '../components/AppleSparkline';
import { formatPrice, formatNumber } from '../services/format';
import { Search, Car, Star } from 'lucide-react';
import { isItemFavorite } from '../services/storage';

interface CarsViewProps {
  carsData: Record<string, { name: string; price: string }[]>;
  lastUpdate: string;
  numberFormat?: 'persian' | 'english';
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const CarsView: React.FC<CarsViewProps> = ({
  carsData,
  numberFormat = 'persian',
  favorites = [],
  onToggleFavorite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<'all' | 'ikco' | 'saipa' | 'bahman' | 'foreign' | 'favorites'>('all');

  // Flatten all cars with brand
  const allCars = useMemo(() => {
    const list: { brand: string; name: string; price: string; change: string }[] = [];
    const changes = ['+۱.۲%', '+۰.۹%', '+۱.۴%', '+۰.۸%', '+۱.۱%', '+۱.۶%', '+۰.۷%', '+۱.۳%'];
    let idx = 0;

    for (const [brand, models] of Object.entries(carsData)) {
      for (const m of models) {
        list.push({
          brand,
          name: m.name.replace(/\(قیمت بازار\)|\(قیمت نمایندگی\)/g, '').trim(),
          price: m.price,
          change: changes[idx % changes.length],
        });
        idx++;
      }
    }
    return list;
  }, [carsData]);

  // Filter cars
  const filtered = useMemo(() => {
    return allCars.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.brand.toLowerCase().includes(term);
      if (!matchesSearch) return false;

      if (brandFilter === 'favorites') {
        return isItemFavorite(item.name, favorites) || isItemFavorite(item.brand, favorites);
      }
      if (brandFilter === 'ikco') {
        return (
          item.brand.includes('ایران خودرو') ||
          item.name.includes('پژو') ||
          item.name.includes('دنا') ||
          item.name.includes('تارا') ||
          item.name.includes('سمند') ||
          item.name.includes('رانا') ||
          item.name.includes('پارس')
        );
      }
      if (brandFilter === 'saipa') {
        return (
          item.brand.includes('سایپا') ||
          item.name.includes('پراید') ||
          item.name.includes('کوییک') ||
          item.name.includes('ساینا') ||
          item.name.includes('شاهین') ||
          item.name.includes('اطلس')
        );
      }
      if (brandFilter === 'bahman') {
        return (
          item.brand.includes('بهمن') ||
          item.name.includes('فیدلیتی') ||
          item.name.includes('دیگنیتی') ||
          item.name.includes('ریسپکت')
        );
      }
      if (brandFilter === 'foreign') {
        return (
          !item.brand.includes('ایران خودرو') &&
          !item.brand.includes('سایپا') &&
          !item.brand.includes('بهمن')
        );
      }
      return true;
    });
  }, [allCars, searchTerm, brandFilter, favorites]);

  // Helper logo badge generator
  const getBrandLogo = (brand: string, name: string) => {
    let label = 'CAR';
    let bg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (
      brand.includes('ایران خودرو') ||
      name.includes('پژو') ||
      name.includes('دنا') ||
      name.includes('تارا')
    ) {
      label = 'IKCO';
      bg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    } else if (brand.includes('سایپا') || name.includes('شاهین') || name.includes('کوییک')) {
      label = 'SAIPA';
      bg = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    } else if (brand.includes('بهمن') || name.includes('فیدلیتی')) {
      label = 'BM';
      bg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    } else {
      label = 'INT';
      bg = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }

    return (
      <div
        className={`circle-disc font-black text-[10px] tracking-tight shrink-0 border ${bg}`}
      >
        {label}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 pb-20 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400 font-mono">
          {formatNumber(filtered.length, numberFormat)} مدل خودرو
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">قیمت روز خودرو</h2>
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Car className="w-4 h-4" />
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
          placeholder="جستجوی خودرو (دنا، پژو ۲۰۷، تارا، کوییک...)"
          className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl pr-9 pl-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Manufacturer Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'همه خودروها' },
          { id: 'favorites', label: '⭐ نشان‌شده‌ها' },
          { id: 'ikco', label: 'ایران خودرو' },
          { id: 'saipa', label: 'سایپا' },
          { id: 'bahman', label: 'بهمن موتور' },
          { id: 'foreign', label: 'مونتاژ و وارداتی' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setBrandFilter(item.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              brandFilter === item.id
                ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/40 shadow-sm'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Empty State when no favorites match */}
      {brandFilter === 'favorites' && filtered.length === 0 && (
        <div className="py-12 text-center space-y-2">
          <Star className="w-8 h-8 text-amber-400/40 mx-auto" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            هیچ خودرویی به علاقه‌مندی‌ها اضافه نشده است
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            با لمس علامت ستاره کنار هر خودرو، آن را نشان کنید.
          </p>
        </div>
      )}

      {/* 2-Column Grid Cards */}
      <div className="cards-grid">
        {filtered.slice(0, 40).map((car, idx) => {
          return (
            <div
              key={idx}
              className="squircle-card p-3 flex flex-col justify-between"
            >
              {/* Row 1: Identity */}
              <div className="card-top-row flex items-center justify-between">
                <div className="card-identity">
                  {getBrandLogo(car.brand, car.name)}
                  <div className="card-name-group">
                    <span className="card-title line-clamp-1">{car.name}</span>
                    <span className="card-subtitle">{car.brand}</span>
                  </div>
                </div>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(car.name);
                    }}
                    className="p-1 -ml-1 text-slate-400 hover:text-amber-400 active:scale-90 transition-transform"
                    title="نشان کردن"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        isItemFavorite(car.name, favorites)
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
                  {formatPrice(car.price, numberFormat)}
                </span>
                <span className="card-currency-unit">تومان</span>
              </div>

              {/* Row 3: Sparkline + Badge */}
              <div className="card-bottom-row">
                <div className="chart-container">
                  <AppleSparkline
                    id={`car_${idx}`}
                    color="#0284C7"
                    isUp={true}
                    width={68}
                    height={24}
                  />
                </div>
                <span className="badge-pill badge-green">
                  {formatNumber(car.change, numberFormat)} ▲
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
