import { CurrencyItem, GoldItem, CryptoItem, PricesResponse, RawCryptoItem } from '../types';
import { mockCurrencies, mockGold, mockCars, mockCrypto, mockLastUpdate } from './mockData';
import { getStoredSettings } from './storage';

// Obfuscated secure endpoint & token resolver to prevent plain-text extraction
const _K = 42;
const _ds = (bytes: number[], key: number = _K): string =>
  bytes.map((c, i) => String.fromCharCode(c ^ (key + (i % 7)))).join('');

const _B_BYTES = [66, 95, 88, 93, 93, 21, 31, 5, 64, 75, 66, 66, 75, 30, 67, 89, 71, 68, 64, 92, 68, 75, 5, 88, 66, 94];
const _S_BYTES = [65, 108, 28, 65, 74, 112, 99, 25, 72, 89, 95, 29, 112, 99, 66, 26, 73, 65, 74, 112, 9, 19, 19, 30];
const _EP_PRICES = [5, 74, 92, 68, 1, 95, 66, 67, 72, 73, 94];
const _EP_CRYPTO = [5, 74, 92, 68, 1, 76, 66, 83, 91, 88, 66];
const _EP_CARS = [5, 74, 92, 68, 1, 76, 81, 88, 88];

export const getBaseUrl = (): string => _ds(_B_BYTES);
export const getShieldToken = (): string => _ds(_S_BYTES);

export const countryFlagMap: Record<string, string> = {
  USD: 'us',
  EUR: 'eu',
  AED: 'ae',
  TRY: 'tr',
  GBP: 'gb',
  CAD: 'ca',
  AUD: 'au',
  CHF: 'ch',
  CNY: 'cn',
  RUB: 'ru',
  IQD: 'iq',
  OMR: 'om',
  SAR: 'sa',
  KWD: 'kw',
  JPY: 'jp',
  QAR: 'qa',
  INR: 'in',
  NZD: 'nz',
  BHD: 'bh',
  SGD: 'sg',
  SEK: 'se',
  NOK: 'no',
  DKK: 'dk',
};

export const getFlagUrl = (code: string): string => {
  const countryCode = countryFlagMap[code.toUpperCase()] || code.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w160/${countryCode}.png`;
};

export const getCryptoIconUrl = (ticker: string): string => {
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${ticker.toLowerCase()}.png`;
};

export const getCryptoFallbackAvatar = (ticker: string): string => {
  return `https://ui-avatars.com/api/?name=${ticker.toUpperCase()}&size=128&background=1e2535&color=7dd3fc&bold=true`;
};

// Persian Names mapping for crypto
export const cryptoPersianNames: Record<string, string> = {
  BTC: 'بیت‌کوین',
  ETH: 'اتریوم',
  USDT: 'تتر',
  BNB: 'بایننس کوین',
  SOL: 'سولانا',
  XRP: 'ریپل',
  DOGE: 'دوج‌کوین',
  ADA: 'کاردانو',
  TON: 'تون‌کوین',
  TRX: 'ترون',
  SHIB: 'شیبا اینو',
  AVAX: 'آوالانچ',
  DOT: 'پولکادات',
  LINK: 'چین‌لینک',
  LTC: 'لایت‌کوین',
  NEAR: 'نیر پروتکل',
  SUI: 'سویی',
  PEPE: 'پپه',
  NOT: 'نات‌کوین',
  UNI: 'یونی‌سواپ',
};

export interface FetchResult {
  currencies: CurrencyItem[];
  gold: GoldItem[];
  cars: Record<string, { name: string; price: string }[]>;
  crypto: CryptoItem[];
  lastUpdate: string;
  isOffline: boolean;
}

export async function fetchAllData(): Promise<FetchResult> {
  const settings = getStoredSettings();
  const targetBaseUrl = (settings.customApiUrl && settings.customApiUrl.trim() !== '')
    ? settings.customApiUrl.trim().replace(/\/$/, '')
    : getBaseUrl();

  const headers: Record<string, string> = {
    'X-KGOLD-Shield': getShieldToken(),
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'KGOLD-Android-App/1.0',
    'Cache-Control': 'no-cache',
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [pricesRes, cryptoRes, carsRes] = await Promise.all([
      fetch(`${targetBaseUrl}${_ds(_EP_PRICES)}`, { headers, signal: controller.signal }).catch(() => null),
      fetch(`${targetBaseUrl}${_ds(_EP_CRYPTO)}`, { headers, signal: controller.signal }).catch(() => null),
      fetch(`${targetBaseUrl}${_ds(_EP_CARS)}`, { headers, signal: controller.signal }).catch(() => null),
    ]);
    clearTimeout(timeout);

    let currencies = mockCurrencies;
    let gold = mockGold;
    let cars = mockCars;
    let crypto = mockCrypto;
    let lastUpdate = mockLastUpdate;

    // Process /api/prices
    if (pricesRes && pricesRes.ok) {
      const pData: PricesResponse = await pricesRes.json();
      if (pData.currencies && Array.isArray(pData.currencies)) {
        currencies = pData.currencies;
      }
      if (pData.gold && Array.isArray(pData.gold)) {
        gold = pData.gold;
      }
      if (pData.cars && typeof pData.cars === 'object') {
        cars = pData.cars;
      }
      if (pData.last_update) {
        lastUpdate = pData.last_update;
      }
    }

    // Process /api/cars (if available as dedicated endpoint)
    if (carsRes && carsRes.ok) {
      const cData = await carsRes.json();
      if (cData && typeof cData === 'object' && Object.keys(cData).length > 0) {
        cars = cData;
      }
    }

    // Process /api/crypto
    if (cryptoRes && cryptoRes.ok) {
      const rawCryptoList: RawCryptoItem[] = await cryptoRes.json();
      if (Array.isArray(rawCryptoList)) {
        // Build map for USDT prices and IRT prices
        const irtMap = new Map<string, RawCryptoItem>();
        const usdtMap = new Map<string, RawCryptoItem>();

        for (const item of rawCryptoList) {
          if (!item.symbol) continue;
          const [base, quote] = item.symbol.split('_');
          if (quote === 'IRT') irtMap.set(base.toUpperCase(), item);
          if (quote === 'USDT') usdtMap.set(base.toUpperCase(), item);
        }

        // Convert into unified CryptoItem
        const mergedCrypto: CryptoItem[] = [];
        const baseTickers = Array.from(new Set([...irtMap.keys(), ...usdtMap.keys()]));

        // Calculate USD/Toman rate from USDT_IRT
        const usdtPriceToman = irtMap.get('USDT') ? parseFloat(irtMap.get('USDT')!.price) : 233300;

        for (const ticker of baseTickers) {
          const irtItem = irtMap.get(ticker);
          const usdtItem = usdtMap.get(ticker);

          let priceToman = 0;
          let priceDollar = 0;
          let change24h = 0;
          let high24h = 0;
          let low24h = 0;

          if (irtItem) {
            priceToman = Math.round(parseFloat(irtItem.price) || 0);
            change24h = Number((irtItem.daily_change_price || 0).toFixed(2));
            high24h = Math.round(parseFloat(irtItem.high) || priceToman);
            low24h = Math.round(parseFloat(irtItem.low) || priceToman);
          }

          if (usdtItem) {
            priceDollar = parseFloat(usdtItem.price) || 0;
            if (change24h === 0) change24h = Number((usdtItem.daily_change_price || 0).toFixed(2));
          } else if (usdtPriceToman > 0 && priceToman > 0) {
            priceDollar = Number((priceToman / usdtPriceToman).toFixed(priceToman > 100000 ? 2 : 4));
          }

          if (priceToman === 0 && priceDollar > 0 && usdtPriceToman > 0) {
            priceToman = Math.round(priceDollar * usdtPriceToman);
          }

          if (priceToman > 0 || priceDollar > 0) {
            mergedCrypto.push({
              symbol: `${ticker}_IRT`,
              ticker,
              nameFa: cryptoPersianNames[ticker] || ticker,
              nameEn: ticker,
              priceToman,
              priceDollar: Number(priceDollar.toFixed(priceDollar > 10 ? 2 : 4)),
              change24h,
              high24h,
              low24h,
              iconUrl: getCryptoIconUrl(ticker),
              fallbackIconUrl: getCryptoFallbackAvatar(ticker),
              sparkline: [50, 48, 52, 54, 53, 56, 58],
            });
          }
        }

        // Priority sorting for prominent coins
        const priority = ['BTC', 'ETH', 'USDT', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'TON', 'TRX', 'SHIB', 'AVAX', 'DOT', 'LINK', 'LTC', 'NEAR', 'SUI', 'PEPE', 'NOT'];
        mergedCrypto.sort((a, b) => {
          const idxA = priority.indexOf(a.ticker);
          const idxB = priority.indexOf(b.ticker);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return b.priceToman - a.priceToman;
        });

        if (mergedCrypto.length > 0) {
          crypto = mergedCrypto.slice(0, 100);
        }
      }
    }

    // Cache locally as recommended in documentation Section 6
    try {
      localStorage.setItem('kgold_cached_currencies', JSON.stringify(currencies));
      localStorage.setItem('kgold_cached_gold', JSON.stringify(gold));
      localStorage.setItem('kgold_cached_cars', JSON.stringify(cars));
      localStorage.setItem('kgold_cached_crypto', JSON.stringify(crypto));
      localStorage.setItem('kgold_cached_last_update', lastUpdate);
    } catch {}

    return {
      currencies,
      gold,
      cars,
      crypto,
      lastUpdate,
      isOffline: false,
    };
  } catch (e) {
    console.warn('Network request failed, reading offline cache:', e);

    // Retrieve offline cache
    try {
      const cCurrencies = localStorage.getItem('kgold_cached_currencies');
      const cGold = localStorage.getItem('kgold_cached_gold');
      const cCars = localStorage.getItem('kgold_cached_cars');
      const cCrypto = localStorage.getItem('kgold_cached_crypto');
      const cUpdate = localStorage.getItem('kgold_cached_last_update');

      return {
        currencies: cCurrencies ? JSON.parse(cCurrencies) : mockCurrencies,
        gold: cGold ? JSON.parse(cGold) : mockGold,
        cars: cCars ? JSON.parse(cCars) : mockCars,
        crypto: cCrypto ? JSON.parse(cCrypto) : mockCrypto,
        lastUpdate: cUpdate || mockLastUpdate,
        isOffline: true,
      };
    } catch {
      return {
        currencies: mockCurrencies,
        gold: mockGold,
        cars: mockCars,
        crypto: mockCrypto,
        lastUpdate: mockLastUpdate,
        isOffline: true,
      };
    }
  }
}
