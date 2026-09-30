import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppSettings, CurrencyItem, GoldItem, CryptoItem } from './types';
import { getStoredSettings, saveSettings, getFavorites, toggleFavorite } from './services/storage';
import { fetchAllData } from './services/api';
import { formatTimeOnly, formatPrice } from './services/format';
import { Header } from './components/Header';
import { BottomNav, MainNavSection } from './components/BottomNav';
import { SettingsModal } from './components/Modals/SettingsModal';
import { DashboardView } from './views/DashboardView';
import { GoldView } from './views/GoldView';
import { CurrencyView } from './views/CurrencyView';
import { CryptoView } from './views/CryptoView';
import { CarsView } from './views/CarsView';
import { SettingsView } from './views/SettingsView';
import { mockCurrencies, mockGold, mockCars, mockCrypto } from './services/mockData';
import { StatusBar, Style } from '@capacitor/status-bar';
import { checkLatestRelease, ReleaseInfo } from './services/updater';
import { UpdateModal } from './components/Modals/UpdateModal';
import { evaluateAlerts } from './services/alerts';
import { DownloadCloud, Bell, X } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const App: React.FC = () => {
  const [mainSection, setMainSection] = useState<MainNavSection>('home');
  const [favorites, setFavorites] = useState<string[]>(getFavorites);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In-App Update States
  const [updateRelease, setUpdateRelease] = useState<ReleaseInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Price Alert Notification Toast
  const [triggeredAlertToast, setTriggeredAlertToast] = useState<string | null>(null);

  // Market Data
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(mockCurrencies);
  const [goldList, setGoldList] = useState<GoldItem[]>(mockGold);
  const [carsData, setCarsData] = useState<Record<string, { name: string; price: string }[]>>(mockCars);
  const [cryptoList, setCryptoList] = useState<CryptoItem[]>(mockCrypto);
  const [lastUpdate, setLastUpdate] = useState<string>(() => new Date().toISOString());

  // Unified Price Map for Alerts & Portfolio
  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    currencies.forEach((c) => {
      const p = parseFloat(c.price.replace(/,/g, '')) || 0;
      map[c.name] = p;
      map[c.code] = p;
    });
    goldList.forEach((g) => {
      const p = parseFloat(g.price.replace(/,/g, '')) || 0;
      map[g.name] = p;
    });
    cryptoList.forEach((cr) => {
      map[cr.nameFa] = cr.priceToman;
      map[cr.ticker] = cr.priceToman;
    });
    return map;
  }, [currencies, goldList, cryptoList]);

  // Load Data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchAllData();
      if (res.currencies && res.currencies.length > 0) setCurrencies(res.currencies);
      if (res.gold && res.gold.length > 0) setGoldList(res.gold);
      if (res.cars && Object.keys(res.cars).length > 0) setCarsData(res.cars);
      if (res.crypto && res.crypto.length > 0) setCryptoList(res.crypto);
      setLastUpdate(new Date().toISOString());
    } catch (e) {
      console.warn('Data fetch fallback', e);
      setLastUpdate(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#07090E' }).catch(() => {});
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#F3F4F6' }).catch(() => {});
    }
  }, [settings.theme]);

  // Initial load on mount
  useEffect(() => {
    loadDataRef.current();

    // Quietly check for app updates from GitHub
    checkLatestRelease().then((res) => {
      if (res.hasUpdate && res.release) {
        setUpdateRelease(res.release);
      }
    }).catch(() => {});
  }, []);

  // Monitor price alerts
  useEffect(() => {
    if (Object.keys(priceMap).length > 0) {
      const triggered = evaluateAlerts(priceMap);
      if (triggered.length > 0) {
        const first = triggered[0];
        setTriggeredAlertToast(
          `🔔 هشدار قیمت: ${first.name} به قیمت هدف ${formatPrice(first.targetPrice, settings.numberFormat || 'persian')} تومان رسید!`
        );
        try {
          Haptics.impact({ style: ImpactStyle.Heavy });
        } catch {}
        setTimeout(() => setTriggeredAlertToast(null), 7000);
      }
    }
  }, [priceMap, settings.numberFormat]);

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: newTheme as 'dark' | 'light' };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    setFavorites(updated);
  };

  const handleBottomNavSelect = (sec: MainNavSection) => {
    setMainSection(sec);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200 relative"
      style={{
        backgroundColor: 'var(--bg-screen)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Price Alert Triggered Floating Notification */}
      {triggeredAlertToast && (
        <div className="fixed top-14 left-3 right-3 z-[9999] max-w-lg mx-auto animate-slideDown">
          <div className="p-3.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-2xl flex items-center justify-between border border-amber-300">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 shrink-0 text-slate-950 animate-bounce" />
              <span>{triggeredAlertToast}</span>
            </div>
            <button
              onClick={() => setTriggeredAlertToast(null)}
              className="p-1 hover:bg-black/10 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* In-App Update Available Floating Banner */}
      {updateRelease && (
        <div className="fixed top-20 left-3 right-3 z-[9998] max-w-lg mx-auto animate-slideDown">
          <div
            onClick={() => setIsUpdateModalOpen(true)}
            className="cursor-pointer p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-xl flex items-center justify-between border border-emerald-400/40 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-white/20 rounded-xl">
                <DownloadCloud className="w-4 h-4 text-white animate-bounce" />
              </span>
              <div>
                <p className="font-black text-[13px]">نسخه جدید کی‌گلد ({updateRelease.version}) آماده است!</p>
                <p className="text-[11px] text-emerald-100 opacity-90 font-medium">برای مشاهده ویژگی‌ها و دانلود لمس کنید</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUpdateRelease(null);
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header with Brand, Settings, Theme, Refresh & Guaranteed Countdown Ticker */}
      <Header
        isRefreshing={isRefreshing}
        onRefresh={loadData}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        lastUpdate={lastUpdate}
        autoRefreshInterval={settings.autoRefreshInterval || 180}
        autoRefreshEnabled={settings.autoRefreshEnabled !== false}
        numberFormat={settings.numberFormat || 'persian'}
      />

      {/* Main Content Area: pb-28 ensures no content is obscured by BottomNav */}
      <main className="flex-1 max-w-lg w-full mx-auto px-3.5 pt-2 pb-28">
        {mainSection === 'home' && (
          <DashboardView
            cryptoList={cryptoList}
            currencies={currencies}
            goldList={goldList}
            lastUpdate={lastUpdate}
            onNavigate={(sec) => setMainSection(sec as MainNavSection)}
            numberFormat={settings.numberFormat || 'persian'}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {mainSection === 'currencies' && (
          <CurrencyView
            currencies={currencies}
            lastUpdate={lastUpdate}
            numberFormat={settings.numberFormat || 'persian'}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {mainSection === 'crypto' && (
          <CryptoView
            cryptoList={cryptoList}
            lastUpdate={lastUpdate}
            numberFormat={settings.numberFormat || 'persian'}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {mainSection === 'gold' && (
          <GoldView
            goldList={goldList}
            lastUpdate={lastUpdate}
            numberFormat={settings.numberFormat || 'persian'}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {mainSection === 'cars' && (
          <CarsView
            carsData={carsData}
            lastUpdate={lastUpdate}
            numberFormat={settings.numberFormat || 'persian'}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {mainSection === 'profile' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleSaveSettings}
            onTriggerRefresh={loadData}
            priceMap={priceMap}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar with Safe Area inset elevation */}
      <BottomNav
        currentSection={mainSection}
        onSelectSection={handleBottomNavSelect}
      />

      {/* Mini-App Display Settings Bottom Sheet Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* In-App Update Modal from Banner */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        release={updateRelease}
      />
    </div>
  );
};
