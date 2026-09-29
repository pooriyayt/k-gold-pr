import React from 'react';

export const GoldBarsHero: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#0E1526] via-[#10182E] to-[#0A0E1A] border border-white/10 p-4 sm:p-5 flex items-center justify-between shadow-xl">
      {/* Background glow circle */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Right side Text */}
      <div className="z-10 space-y-1 text-right">
        <h2 className="text-sm sm:text-base font-bold text-slate-200">
          قیمت لحظه‌ای
        </h2>
        <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500">
          ارزهای جهانی و طلا
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400">
          اطلاعات دقیق، لحظه‌ای و قابل اعتماد
        </p>
      </div>

      {/* Left side: 3D Gold Bullion Ingot Graphic */}
      <div className="relative z-10 shrink-0 flex items-center justify-center pl-2">
        <svg
          width="110"
          height="85"
          viewBox="0 0 140 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_10px_20px_rgba(245,165,36,0.4)]"
        >
          {/* Sparkles */}
          <path
            d="M25 20 L27 25 L32 27 L27 29 L25 34 L23 29 L18 27 L23 25 Z"
            fill="#FDE68A"
            className="animate-pulse"
          />
          <path
            d="M120 15 L121.5 19 L125.5 20.5 L121.5 22 L120 26 L118.5 22 L114.5 20.5 L118.5 19 Z"
            fill="#FDE68A"
            className="animate-pulse"
          />
          <circle cx="35" cy="50" r="1.5" fill="#FEF08A" opacity="0.8" />
          <circle cx="105" cy="30" r="1.5" fill="#FEF08A" opacity="0.8" />
          <circle cx="70" cy="15" r="2" fill="#FEF08A" opacity="0.6" />

          {/* Bottom Bar 1 */}
          <g transform="translate(15, 45)">
            {/* Top face */}
            <polygon
              points="15,0 75,0 60,18 0,18"
              fill="url(#goldTop1)"
            />
            {/* Front face */}
            <polygon
              points="0,18 60,18 52,42 -8,42"
              fill="url(#goldFront1)"
            />
            {/* Right face */}
            <polygon
              points="75,0 85,22 52,42 60,18"
              fill="url(#goldSide1)"
            />
            {/* Ingot text/stamp line */}
            <line x1="20" y1="28" x2="40" y2="28" stroke="#78350F" strokeWidth="1" opacity="0.5" />
          </g>

          {/* Bottom Bar 2 */}
          <g transform="translate(65, 48)">
            <polygon
              points="15,0 75,0 60,18 0,18"
              fill="url(#goldTop1)"
            />
            <polygon
              points="0,18 60,18 52,42 -8,42"
              fill="url(#goldFront1)"
            />
            <polygon
              points="75,0 85,22 52,42 60,18"
              fill="url(#goldSide1)"
            />
          </g>

          {/* Top Ingot (centered on top of the two) */}
          <g transform="translate(38, 22)">
            {/* Top face */}
            <polygon
              points="15,0 75,0 60,18 0,18"
              fill="url(#goldTop2)"
            />
            {/* Front face */}
            <polygon
              points="0,18 60,18 52,40 -8,40"
              fill="url(#goldFront2)"
            />
            {/* Right face */}
            <polygon
              points="75,0 83,20 52,40 60,18"
              fill="url(#goldSide2)"
            />
            {/* 999.9 Stamp */}
            <text
              x="22"
              y="28"
              fill="#78350F"
              fontSize="7"
              fontWeight="900"
              fontFamily="sans-serif"
              opacity="0.6"
              letterSpacing="1"
            >
              999.9
            </text>
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="goldTop1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="goldFront1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="goldSide1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="goldTop2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FDE047" />
              <stop offset="80%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="goldFront2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="goldSide2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
