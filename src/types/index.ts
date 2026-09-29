export type TabType = 'overview' | 'gold' | 'currencies' | 'crypto' | 'cars' | 'settings';

export interface CurrencyItem {
  name: string;
  code: string;
  price: string;
  change_24h?: string;
  change_7d?: string;
  change_30d?: string;
  trend?: 'up' | 'down' | 'neutral' | 'flat';
  sparkline?: number[];
}

export interface GoldItem {
  name: string;
  price: string;
  change_24h?: string;
  change_7d?: string;
  change_30d?: string;
  trend?: 'up' | 'down' | 'neutral' | 'flat';
  isBubble?: boolean;
  sparkline?: number[];
}

export interface CarItem {
  name: string;
  price: string;
  brand?: string;
}

export interface RawCryptoItem {
  symbol: string;
  price: string;
  daily_change_price: number;
  low: string;
  high: string;
  timestamp: number;
}

export interface CryptoItem {
  symbol: string; // e.g. "BTC_IRT"
  ticker: string; // e.g. "BTC"
  nameFa: string; // e.g. "بیت‌کوین"
  nameEn: string; // e.g. "Bitcoin"
  priceToman: number;
  priceDollar: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  iconUrl: string;
  fallbackIconUrl?: string;
  sparkline?: number[];
}

export interface PricesResponse {
  currencies: CurrencyItem[];
  gold: GoldItem[];
  cars: Record<string, { name: string; price: string }[]>;
  last_update: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  autoRefreshInterval: number;
  autoRefreshEnabled?: boolean;
  numberFormat?: 'persian' | 'english';
  customApiUrl: string;
  useShieldHeader: boolean;
}
