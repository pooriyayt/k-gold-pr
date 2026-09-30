import React, { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Bell, Sparkles, Calendar } from 'lucide-react';
import { ChartTimeframe, generateHistoricalData } from '../../services/chartData';
import { formatPrice, formatPercent } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
  currentPrice: number;
  numberFormat?: 'persian' | 'english';
  onOpenAlertForAsset?: (assetName: string, currentPrice: number) => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({
  isOpen,
  onClose,
  assetName,
  currentPrice,
  numberFormat = 'persian',
  onOpenAlertForAsset,
}) => {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('7d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const analysis = useMemo(() => {
    if (!assetName || !currentPrice) return null;
    return generateHistoricalData(assetName, currentPrice, timeframe);
  }, [assetName, currentPrice, timeframe]);

  if (!isOpen || !analysis) return null;

  const { points, highPrice, lowPrice, avgPrice, changePercent, spread } = analysis;
  const isPositive = changePercent >= 0;

  // Chart Dimensions
  const svgWidth = 340;
  const svgHeight = 170;
  const padTop = 20;
  const padBottom = 25;
  const padLeft = 15;
  const padRight = 15;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const minP = lowPrice * 0.995;
  const maxP = highPrice * 1.005;
  const rangeP = maxP - minP || 1;

  // Compute SVG Points
  const svgPoints = points.map((pt, idx) => {
    const x = padLeft + (idx / (points.length - 1)) * chartW;
    const y = padTop + chartH - ((pt.price - minP) / rangeP) * chartH;
    return { x, y, pt };
  });

  // Construct smooth SVG path
  let pathD = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
  for (let i = 1; i < svgPoints.length; i++) {
    const prev = svgPoints[i - 1];
    const cur = svgPoints[i];
    const midX = (prev.x + cur.x) / 2;
    pathD += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
  }

  // Area path for gradient fill
  const areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${svgHeight - padBottom} L ${svgPoints[0].x} ${svgHeight - padBottom} Z`;

  // Active or Hovered Point
  const activePt = hoveredIndex !== null ? svgPoints[hoveredIndex] : svgPoints[svgPoints.length - 1];

  const handleTimeframeChange = async (tf: ChartTimeframe) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setTimeframe(tf);
    setHoveredIndex(null);
  };

  const handleTouchScrub = (e: React.TouchEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (touchX - padLeft) / chartW));
    const idx = Math.round(ratio * (points.length - 1));
    setHoveredIndex(idx);
  };

  const handleMouseScrub = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (mouseX - padLeft) / chartW));
    const idx = Math.round(ratio * (points.length - 1));
    setHoveredIndex(idx);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-[#0E131F] text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white">{assetName}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold">
                  تحلیل تکنیکال
                </span>
              </div>
              <p className="text-[11px] text-slate-400">نمودار نوسانات و سقف/کف قیمت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Price & Trend Indicator */}
          <div className="flex items-end justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-1">
                {hoveredIndex !== null ? `قیمت در (${activePt.pt.label})` : 'قیمت لحظه‌ای بازار'}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tabular-nums text-white">
                  {formatPrice(activePt.pt.price, numberFormat)}
                </span>
                <span className="text-xs text-amber-400 font-bold">تومان</span>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 border ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span className="tabular-nums">{formatPercent(changePercent, numberFormat)}</span>
            </div>
          </div>

          {/* Timeframe Chips */}
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 text-center">
            {(
              [
                { id: '24h', label: '۲۴ ساعت' },
                { id: '7d', label: '۷ روز' },
                { id: '30d', label: '۳۰ روز' },
                { id: '90d', label: '۹۰ روز' },
                { id: '1y', label: '۱ سال' },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                onClick={() => handleTimeframeChange(tf.id)}
                className={`py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                  timeframe === tf.id
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Interactive SVG Chart Container */}
          <div className="relative p-2 rounded-2xl bg-black/40 border border-white/10 overflow-hidden select-none">
            {/* Scrubber Tooltip */}
            {hoveredIndex !== null && (
              <div
                className="absolute top-2 left-3 px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shadow-lg animate-fadeIn pointer-events-none"
              >
                {activePt.pt.label}: {formatPrice(activePt.pt.price, numberFormat)} ت
              </div>
            )}

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 overflow-visible cursor-crosshair"
              onTouchMove={handleTouchScrub}
              onTouchStart={handleTouchScrub}
              onTouchEnd={() => setHoveredIndex(null)}
              onMouseMove={handleMouseScrub}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F59E0B'} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F59E0B'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Lines (High & Low) */}
              <line
                x1={padLeft}
                y1={padTop}
                x2={svgWidth - padRight}
                y2={padTop}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={padLeft}
                y1={svgHeight - padBottom}
                x2={svgWidth - padRight}
                y2={svgHeight - padBottom}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />

              {/* Area Under Curve */}
              <path d={areaD} fill="url(#chartAreaGrad)" />

              {/* Smooth Curve Line */}
              <path
                d={pathD}
                fill="none"
                stroke={isPositive ? '#10B981' : '#F59E0B'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active / Hovered Point Indicator */}
              <line
                x1={activePt.x}
                y1={padTop}
                x2={activePt.x}
                y2={svgHeight - padBottom}
                stroke="rgba(251, 191, 36, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePt.x}
                cy={activePt.y}
                r="5"
                fill={isPositive ? '#34D399' : '#FBBF24'}
                stroke="#090B10"
                strokeWidth="2"
              />
            </svg>

            {/* Time labels below chart */}
            <div className="flex justify-between items-center px-2 text-[10px] text-slate-500 font-bold tabular-nums">
              <span>{points[0]?.label}</span>
              <span>{points[Math.floor(points.length / 2)]?.label}</span>
              <span>{points[points.length - 1]?.label}</span>
            </div>
          </div>

          {/* Stats Grid: High / Low / Avg / Volatility */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>سقف دوره (High)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm font-black tabular-nums text-white">
                {formatPrice(highPrice, numberFormat)} <span className="text-[10px] font-normal text-slate-400">ت</span>
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>کف دوره (Low)</span>
                <span className="w-2 h-2 rounded-full bg-red-400" />
              </div>
              <p className="text-sm font-black tabular-nums text-white">
                {formatPrice(lowPrice, numberFormat)} <span className="text-[10px] font-normal text-slate-400">ت</span>
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-[11px] mb-1">میانگین بازه</p>
              <p className="text-sm font-black tabular-nums text-white">
                {formatPrice(avgPrice, numberFormat)} <span className="text-[10px] font-normal text-slate-400">ت</span>
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-[11px] mb-1">دامنه نوسان (Spread)</p>
              <p className="text-sm font-black tabular-nums text-amber-400">
                {formatPrice(spread, numberFormat)} <span className="text-[10px] font-normal text-slate-400">ت</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-2.5 shrink-0 bg-white/5">
          {onOpenAlertForAsset && (
            <button
              onClick={() => {
                onClose();
                onOpenAlertForAsset(assetName, currentPrice);
              }}
              className="py-3 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>تنظیم هشدار این دارایی</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center transition-all ${
              !onOpenAlertForAsset ? 'col-span-2' : ''
            }`}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
