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

/**
 * Analytical Spring Progress Solver
 * Evaluates the underdamped harmonic oscillator differential equation
 */
function springProgress(tSec: number, omega: number, zeta: number): number {
  if (tSec <= 0) return 0;
  if (tSec >= 0.7) return 1;
  const decay = Math.exp(-zeta * omega * tSec);
  const omegaD = omega * Math.sqrt(1 - zeta * zeta);
  const s = zeta / Math.sqrt(1 - zeta * zeta);
  return 1 - decay * (Math.cos(omegaD * tSec) + s * Math.sin(omegaD * tSec));
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentSection, onSelectSection }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentAnimationRef = useRef<Animation | null>(null);

  const activeIdx = Math.max(0, ITEMS.findIndex((it) => it.id === currentSection));
  const prevIdxRef = useRef<number>(activeIdx);
  const [isReady, setIsReady] = useState(false);

  const syncBubblePosition = (animate = false) => {
    const container = containerRef.current;
    const bubble = bubbleRef.current;
    const targetBtn = buttonRefs.current[activeIdx];

    if (!container || !bubble || !targetBtn) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetBtn.getBoundingClientRect();

    const targetCenter = targetRect.left - containerRect.left + targetRect.width / 2;
    const baseWidth = Math.round(targetRect.width + 12);
    const targetLeft = targetCenter - baseWidth / 2;

    if (!animate) {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.cancel();
        currentAnimationRef.current = null;
      }
      bubble.style.width = `${baseWidth}px`;
      bubble.style.transform = `translate3d(${targetLeft}px, 0, 0) scale3d(1, 1, 1)`;
      return;
    }

    const fromIdx = prevIdxRef.current;
    const fromBtn = buttonRefs.current[fromIdx];
    const fromRect = fromBtn ? fromBtn.getBoundingClientRect() : targetRect;
    const fromCenter = fromRect.left - containerRect.left + fromRect.width / 2;

    const deltaX = targetCenter - fromCenter;

    // Same tab click: playful jelly bounce on GPU
    if (Math.abs(deltaX) < 1) {
      bubble.animate(
        [
          { transform: `translate3d(${targetLeft}px, 0, 0) scale3d(1, 1, 1)` },
          { transform: `translate3d(${targetLeft}px, 0, 0) scale3d(1.12, 0.88, 1)` },
          { transform: `translate3d(${targetLeft}px, 0, 0) scale3d(0.96, 1.04, 1)` },
          { transform: `translate3d(${targetLeft}px, 0, 0) scale3d(1, 1, 1)` },
        ],
        { duration: 280, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      );
      return;
    }

    if (currentAnimationRef.current) {
      currentAnimationRef.current.cancel();
    }

    // -------------------------------------------------------------
    // PURE GPU COMPOSITOR LIQUID MORPHING ANIMATION (100% Reflow-Free)
    // Runs on Compositor Hardware Plane at 60-120 FPS
    // -------------------------------------------------------------
    const duration = 480; // ms
    const durationSec = duration / 1000;
    const sampleSteps = 24;
    const keyframes: Keyframe[] = [];

    // Max stretch clamp so long jumps remain an aerodynamic liquid drop
    const maxStretch = Math.min(Math.abs(deltaX) * 0.95, 120);

    for (let step = 0; step <= sampleSteps; step++) {
      const frac = step / sampleSteps;
      const tSec = frac * durationSec;

      // Leading edge rushes forward instantly
      const pLead = springProgress(tSec, 19, 0.82);
      // Trailing edge follows with viscous liquid inertia
      const pTrail = springProgress(Math.max(0, tSec - 0.045), 15.5, 0.80);

      const leadEdge = fromCenter + (baseWidth / 2) * Math.sign(deltaX) + deltaX * pLead;
      const trailEdge = fromCenter - (baseWidth / 2) * Math.sign(deltaX) + deltaX * pTrail;

      const rawDist = Math.abs(leadEdge - trailEdge);
      const curWidth = Math.min(baseWidth + maxStretch, Math.max(baseWidth * 0.95, rawDist));
      const curCenter = (leadEdge + trailEdge) / 2;

      const scaleX = curWidth / baseWidth;
      // Volume-preserving liquid thinning in Y axis
      const scaleY = Math.max(0.86, 1 - (scaleX - 1) * 0.12);
      const curX = curCenter - baseWidth / 2;

      keyframes.push({
        transform: `translate3d(${curX.toFixed(2)}px, 0, 0) scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)`,
        offset: frac,
      });
    }

    bubble.style.width = `${baseWidth}px`;

    const animation = bubble.animate(keyframes, {
      duration,
      fill: 'forwards',
      easing: 'linear', // Keyframes are pre-computed with analytical physics
    });

    currentAnimationRef.current = animation;
    animation.onfinish = () => {
      currentAnimationRef.current = null;
      bubble.style.transform = `translate3d(${targetLeft}px, 0, 0) scale3d(1, 1, 1)`;
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
          SINGLE LIQUID MORPHING BUBBLE (Pure GPU Hardware Layer)
          Uses translate3d + scale3d without reflow or layout recalculation
        */}
        <div
          ref={bubbleRef}
          className={`absolute top-1.5 bottom-1.5 pointer-events-none rounded-full overflow-hidden ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: 0,
            transformOrigin: 'center center',
            willChange: 'transform',
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(245, 158, 11, 0.10) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            boxShadow:
              'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.40), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.45), 0 4px 18px -2px rgba(245, 158, 11, 0.35), 0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Top Glass Specular Arc Reflection */}
          <div className="absolute inset-x-2 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-80" />

          {/* Delicate Amber / Gold Glow at bottom of the bubble */}
          <div className="absolute inset-x-2 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent blur-[2px]" />
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
