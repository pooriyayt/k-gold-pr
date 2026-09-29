import React from 'react';
import { Home, CircleDollarSign, Zap, Coins, Car, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export type MainNavSection = 'home' | 'currencies' | 'crypto' | 'gold' | 'cars' | 'profile';

interface BottomNavProps {
  currentSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentSection, onSelectSection }) => {
  const items: { id: MainNavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'خانه', icon: Home },
    { id: 'currencies', label: 'ارز دولتی', icon: CircleDollarSign },
    { id: 'crypto', label: 'ارز دیجیتال', icon: Zap },
    { id: 'gold', label: 'طلا و سکه', icon: Coins },
    { id: 'cars', label: 'خودرو', icon: Car },
    { id: 'profile', label: 'پروفایل', icon: User },
  ];

  const handleClick = async (id: MainNavSection) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    onSelectSection(id);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t transition-colors duration-200"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 18px)',
        paddingTop: '6px',
      }}
    >
      <div className="max-w-md mx-auto grid grid-cols-6 items-center px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all ${
                isActive
                  ? 'text-amber-500 dark:text-amber-400 scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span
                className={`text-[9.5px] mt-1 font-semibold truncate max-w-full ${
                  isActive
                    ? 'text-amber-500 dark:text-amber-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
