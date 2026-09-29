import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings, CurrencyItem, GoldItem, CryptoItem } from './types';
import { getStoredSettings, saveSettings, getFavorites, toggleFavorite } from './services/storage';
import { fetchAllData } from './services/api';
import { formatTimeOnly } from './services/format';
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

export const App: React.FC = () => {
  const [mainSection, setMainSection] = useState<MainNavSection>('home');
  const [favorites, setFavorites] = useState<string[]>(getFavorites);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);


  // Market Data
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(mockCurrencies);
  const [goldList, setGoldList] = useState<GoldItem[]>(mockGold);
  const [carsData, setCarsData] = useState<Record<string, { name: string; price: string }[]>>(mockCars);
  const [cryptoList, setCryptoList] = useState<CryptoItem[]>(mockCrypto);
  const [lastUpdate, setLastUpdate] = useState<string>(() => new Date().toISOString());

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
  }, []);

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
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-screen)',
        color: 'var(--text-primary)',
      }}
    >
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
    </div>
  );
};
