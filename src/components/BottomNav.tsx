import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Home, CircleDollarSign, Zap, Coins, Car, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export type MainNavSection = 'home' | 'currencies' | 'crypto' | 'gold' | 'cars' | 'profile';

interface BottomNavProps {
  currentSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
}

const ITEMS: { id: MainNavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'خانه', icon: Home },
  { id: 'currencies', label: 'ارز دولتی', icon: CircleDollarSign },
  { id: 'crypto', label: 'ارز دیجیتال', icon: Zap },
  { id: 'gold', label: 'طلا و سکه', icon: Coins },
  { id: 'cars', label: 'خودرو', icon: Car },
  { id: 'profile', label: 'پروفایل', icon: User },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentSection, onSelectSection }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentAnimationRef = useRef<Animation | null>(null);

  // Track active index and previous index for directional stretch morphing
  const activeIdx = Math.max(0, ITEMS.findIndex((it) => it.id === currentSection));
  const prevIdxRef = useRef<number>(activeIdx);
  const [isReady, setIsReady] = useState(false);

  // Position bubble initially or on window resize
  const syncBubblePosition = (animate = false) => {
    const container = containerRef.current;
    const bubble = bubbleRef.current;
    const targetBtn = buttonRefs.current[activeIdx];

    if (!container || !bubble || !targetBtn) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetBtn.getBoundingClientRect();

    const targetCenter = targetRect.left - containerRect.left + targetRect.width / 2;
    const baseWidth = Math.max(48, Math.min(targetRect.width - 6, 70));
    const targetLeft = targetCenter - baseWidth / 2;

    if (!animate) {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.cancel();
        currentAnimationRef.current = null;
      }
      bubble.style.transform = `translateX(${targetLeft}px) scaleY(1)`;
      bubble.style.width = `${baseWidth}px`;
      bubble.style.borderRadius = '9999px';
      return;
    }

    // Morphing Animation from prevIdx to activeIdx
    const fromIdx = prevIdxRef.current;
    const fromBtn = buttonRefs.current[fromIdx];
    const fromRect = fromBtn ? fromBtn.getBoundingClientRect() : targetRect;
    const fromCenter = fromRect.left - containerRect.left + fromRect.width / 2;

    const deltaX = targetCenter - fromCenter;
    if (Math.abs(deltaX) < 1) {
      // Same tab clicked: Micro jelly bounce
      bubble.animate(
        [
          { transform: `translateX(${targetLeft}px) scale(1, 1)` },
          { transform: `translateX(${targetLeft}px) scale(1.08, 0.92)` },
          { transform: `translateX(${targetLeft}px) scale(0.97, 1.03)` },
          { transform: `translateX(${targetLeft}px) scale(1, 1)` },
        ],
        { duration: 320, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      );
      return;
    }

    const dir = Math.sign(deltaX);
    const dist = Math.abs(deltaX);
    const peakWidth = baseWidth + Math.min(dist * 0.95, 140);
    const midCenter = (fromCenter + targetCenter) / 2;

    if (currentAnimationRef.current) {
      currentAnimationRef.current.cancel();
    }

    // Liquid Morphing Animation Sequence:
    // ROUND → STRETCH → TRAVEL → CONTRACT → ROUND (with gentle natural overshoot)
    const keyframes: Keyframe[] = [
      {
        transform: `translateX(${fromCenter - baseWidth / 2}px) scaleY(1)`,
        width: `${baseWidth}px`,
        borderRadius: '9999px',
        offset: 0,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      {
        // 1. Initial Stretch: Leading edge accelerates in direction of travel
        transform: `translateX(${fromCenter + deltaX * 0.22 - (baseWidth + (peakWidth - baseWidth) * 0.78) / 2}px) scaleY(0.93)`,
        width: `${baseWidth + (peakWidth - baseWidth) * 0.78}px`,
        borderRadius: '24px',
        offset: 0.24,
        easing: 'cubic-bezier(0.2, 0.85, 0.3, 1)',
      },
      {
        // 2. Midpoint: Maximum elongation into Liquid Capsule bridging the distance
        transform: `translateX(${midCenter - peakWidth / 2}px) scaleY(0.88)`,
        width: `${peakWidth}px`,
        borderRadius: '20px',
        offset: 0.48,
        easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
      },
      {
        // 3. Arrival: Trailing edge snaps forward, contracting width back down with subtle overshoot
        transform: `translateX(${targetCenter + dir * Math.min(6, dist * 0.06) - (baseWidth + 3) / 2}px) scaleY(1.03)`,
        width: `${baseWidth + 3}px`,
        borderRadius: '26px',
        offset: 0.78,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      {
        // 4. Elastic settle
        transform: `translateX(${targetCenter - dir * 1.2 - (baseWidth - 1) / 2}px) scaleY(0.99)`,
        width: `${baseWidth - 1}px`,
        borderRadius: '9999px',
        offset: 0.90,
        easing: 'ease-out',
      },
      {
        // 5. Perfect Round rest state
        transform: `translateX(${targetLeft}px) scaleY(1)`,
        width: `${baseWidth}px`,
        borderRadius: '9999px',
        offset: 1,
      },
    ];

    const animation = bubble.animate(keyframes, {
      duration: 520,
      fill: 'forwards',
    });

    currentAnimationRef.current = animation;
    animation.onfinish = () => {
      currentAnimationRef.current = null;
      bubble.style.transform = `translateX(${targetLeft}px) scaleY(1)`;
      bubble.style.width = `${baseWidth}px`;
      bubble.style.borderRadius = '9999px';
    };
  };

  useLayoutEffect(() => {
    syncBubblePosition(isReady);
    if (!isReady) setIsReady(true);
    prevIdxRef.current = activeIdx;
  }, [activeIdx]);

  useEffect(() => {
    const handleResize = () => syncBubblePosition(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIdx]);

  const handleClick = async (id: MainNavSection, idx: number) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    onSelectSection(id);
  };

  return (
    <div
      className="fixed left-3 right-3 max-w-md mx-auto z-50 pointer-events-auto select-none"
      style={{
        bottom: 'max(env(safe-area-inset-bottom, 0px) + 8px, 16px)',
      }}
    >
      {/* Liquid Dark Glass Floating Capsule */}
      <div
        ref={containerRef}
        className="relative w-full rounded-full p-1.5 backdrop-blur-2xl bg-[#090D16]/85 dark:bg-[#070A12]/90 border border-white/[0.12] dark:border-white/[0.08] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.4)] overflow-hidden"
      >
        {/* 
          SINGLE LIQUID MORPHING BUBBLE 
          Stretches, travels, and morphs into a liquid capsule during tab transition
        */}
        <div
          ref={bubbleRef}
          className={`absolute top-1.5 bottom-1.5 pointer-events-none rounded-full overflow-hidden ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: 0,
            willChange: 'transform, width, border-radius',
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(245, 158, 11, 0.08) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow:
              'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.45), 0 4px 16px -2px rgba(245, 158, 11, 0.3), 0 2px 6px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Top Glass Specular Arc Reflection */}
          <div className="absolute inset-x-2 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-80" />

          {/* Delicate Amber / Gold Glow at bottom of the bubble */}
          <div className="absolute inset-x-2 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent blur-[2px]" />
        </div>

        {/* 6 Equal-Width Nav Items */}
        <div className="relative z-10 grid grid-cols-6 items-center">
          {ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                ref={(el) => (buttonRefs.current[idx] = el)}
                onClick={() => handleClick(item.id, idx)}
                className="group relative flex flex-col items-center justify-center py-2 px-0.5 select-none outline-none focus:outline-none transition-transform active:scale-95"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label={item.label}
              >
                <div
                  className={`transition-all duration-300 ease-out flex items-center justify-center ${
                    isActive
                      ? 'text-amber-400 scale-[1.04]'
                      : 'text-slate-400 dark:text-slate-400/80 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>
                <span
                  className={`text-[9.5px] mt-1 font-bold truncate max-w-full tracking-tight transition-all duration-300 ease-out ${
                    isActive
                      ? 'text-amber-400 font-black'
                      : 'text-slate-400 dark:text-slate-400/80'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
