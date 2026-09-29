import React, { useState, useEffect } from 'react';
import { RefreshCw, Moon, Sun, Settings } from 'lucide-react';
import { formatToShamsi, formatCountdown, formatTimeOnly } from '../services/format';

interface HeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  lastUpdate: string;
  autoRefreshInterval?: number;
  autoRefreshEnabled?: boolean;
  numberFormat?: 'persian' | 'english';
}

export const Header: React.FC<HeaderProps> = ({
  isRefreshing,
  onRefresh,
  theme,
  onToggleTheme,
  onOpenSettings,
  lastUpdate,
  autoRefreshInterval = 180,
  autoRefreshEnabled = true,
  numberFormat = 'persian',
}) => {
  const [remaining, setRemaining] = useState<number>(autoRefreshInterval);
  const targetTimeRef = React.useRef<number>(Date.now() + autoRefreshInterval * 1000);
  const onRefreshRef = React.useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Reset countdown target whenever lastUpdate arrives or autoRefreshInterval setting changes
  useEffect(() => {
    targetTimeRef.current = Date.now() + autoRefreshInterval * 1000;
    setRemaining(autoRefreshInterval);
  }, [lastUpdate, autoRefreshInterval]);

  // Guaranteed active 1-second countdown ticker
  useEffect(() => {
    if (!autoRefreshEnabled || autoRefreshInterval <= 0) return;

    // Immediately sync remaining
    const initialDiff = Math.max(0, Math.round((targetTimeRef.current - Date.now()) / 1000));
    setRemaining(initialDiff);

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((targetTimeRef.current - now) / 1000));
      if (diff <= 0) {
        targetTimeRef.current = Date.now() + autoRefreshInterval * 1000;
        setRemaining(autoRefreshInterval);
        onRefreshRef.current();
      } else {
        setRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, autoRefreshInterval]);

  const targetDate = new Date(targetTimeRef.current);
  const nextUpdateTime = formatTimeOnly(targetDate, numberFormat);

  return (
    <header
      className="w-full px-4 pt-3 pb-2 sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 transition-colors duration-200"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(7, 9, 14, 0.85)' : 'rgba(243, 244, 246, 0.9)',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
      }}
    >
      {/* Top Row: Brand Title on Right, 3 Circle Buttons on Left */}
      <div className="header-row flex items-center justify-between mb-2.5">
        {/* Brand Title: کی گلد | قیمت لحظه‌ای ارز و طلا */}
        <div className="flex items-center min-w-0 pr-1">
          <h1 className="brand-title text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
            کی گلد | قیمت لحظه‌ای ارز و طلا
          </h1>
        </div>

        {/* 3 Circle Buttons on Left (Refresh, Theme, Settings) */}
        <div className="flex items-center gap-1.5">
          {/* Refresh Button */}
          <button
            onClick={() => {
              setRemaining(autoRefreshInterval);
              onRefresh();
            }}
            disabled={isRefreshing}
            className="header-btn-circle hover:border-amber-400/40 active:scale-90"
            title="بروزرسانی داده‌ها"
            aria-label="بروزرسانی"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="header-btn-circle hover:border-amber-400/40 active:scale-90"
            title="تغییر تم"
            aria-label="تغییر تم"
          >
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-slate-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="header-btn-circle hover:border-amber-400/40 active:scale-90"
            title="تنظیمات مینی‌اپ"
            aria-label="تنظیمات"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status Pill Capsule: Shamsi Last Update + Live Next Update Countdown */}
      <div className="status-pill-capsule flex items-center justify-between text-[9.5px] sm:text-[10px] px-2.5 py-1.5 gap-1.5">
        {/* Right: Pulsing Live Green Dot + Shamsi Date */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="pulse-dot-live shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">آخرین بروزرسانی:</span>
          <span className="font-semibold tabular-nums whitespace-nowrap">
            {formatToShamsi(lastUpdate, numberFormat)}
          </span>
        </div>

        {/* Left: Next Update Countdown & Target Time */}
        <div className="text-[9.5px] sm:text-[10px] text-muted-foreground shrink-0 tabular-nums flex items-center gap-1">
          <span className="whitespace-nowrap">بروزرسانی بعدی:</span>
          <span className="text-emerald-500 dark:text-emerald-400 font-bold whitespace-nowrap">
            {formatCountdown(remaining, numberFormat)}
          </span>
          {nextUpdateTime && (
            <span className="text-slate-400 whitespace-nowrap">| {nextUpdateTime}</span>
          )}
        </div>
      </div>
    </header>
  );
};
