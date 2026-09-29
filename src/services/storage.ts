import { AppSettings } from '../types';

const SETTINGS_KEY = 'kgold_app_settings';
const FAVORITES_KEY = 'kgold_favorites';

export const defaultSettings: AppSettings = {
  theme: 'dark',
  autoRefreshInterval: 180, // 180 seconds (3 minutes) default
  autoRefreshEnabled: true,
  numberFormat: 'persian',
  customApiUrl: '',
  useShieldHeader: true,
};

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const getFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['USDT', 'USD', 'سکه امامی', 'طلای ۱۸ عیار'];
  } catch {
    return ['USDT', 'USD', 'سکه امامی', 'طلای ۱۸ عیار'];
  }
};

export const isItemFavorite = (id: string, favorites: string[]): boolean => {
  if (!id || !favorites) return false;
  const cleanId = id.trim().toLowerCase();
  return favorites.some(
    (fav) =>
      fav.trim().toLowerCase() === cleanId ||
      cleanId.includes(fav.trim().toLowerCase()) ||
      fav.trim().toLowerCase().includes(cleanId)
  );
};

export const toggleFavorite = (id: string): string[] => {
  const current = getFavorites();
  const cleanId = id.trim();
  const alreadyFav = current.some(
    (x) =>
      x.toLowerCase() === cleanId.toLowerCase() ||
      x.includes(cleanId) ||
      cleanId.includes(x)
  );

  let updated: string[];
  if (alreadyFav) {
    updated = current.filter(
      (x) =>
        x.toLowerCase() !== cleanId.toLowerCase() &&
        !x.includes(cleanId) &&
        !cleanId.includes(x)
    );
  } else {
    updated = [...current, cleanId];
  }

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
  return updated;
};
