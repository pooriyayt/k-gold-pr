import { CurrencyItem, CryptoItem, GoldItem } from '../types';
import { formatPrice } from './format';

export const WIDGET_ASSET_OPTIONS = [
  { key: 'usd', name: 'دلار آمریکا', englishName: 'US Dollar', code: 'USD', icon: '$', defaultPrice: '۶۱,۳۰۰', defaultChange: '+۲.۱۱٪ ↗', isPos: true },
  { key: 'eur', name: 'یورو اروپا', englishName: 'Euro', code: 'EUR', icon: '€', defaultPrice: '۶۶,۴۰۰', defaultChange: '+۲.۰۳٪ ↗', isPos: true },
  { key: 'aed', name: 'درهم امارات', englishName: 'UAE Dirham', code: 'AED', icon: 'د.إ', defaultPrice: '۱۶,۶۸۰', defaultChange: '+۲.۱۰٪ ↗', isPos: true },
  { key: 'gbp', name: 'پوند انگلیس', englishName: 'British Pound', code: 'GBP', icon: '£', defaultPrice: '۷۸,۲۰۰', defaultChange: '+۱.۹۵٪ ↗', isPos: true },
  { key: 'gold18k', name: 'طلای ۱۸ عیار', englishName: 'Gold 18K', code: '18K', icon: '18K', defaultPrice: '۳,۷۵۰,۰۰۰', defaultChange: '+۱.۸۲٪ ↗', isPos: true },
  { key: 'emami', name: 'سکه تمام امامی', englishName: 'Emami Coin', code: 'EMAMI', icon: '🪙', defaultPrice: '۴۳,۸۰۰,۰۰۰', defaultChange: '+۲.۷۳٪ ↗', isPos: true },
  { key: 'bahar', name: 'سکه بهار آزادی', englishName: 'Bahar Azadi', code: 'BAHAR', icon: '🪙', defaultPrice: '۳۸,۹۰۰,۰۰۰', defaultChange: '+۱.۵۱٪ ↗', isPos: true },
  { key: 'half', name: 'نیم سکه', englishName: 'Half Coin', code: 'HALF', icon: '🪙', defaultPrice: '۲۳,۵۰۰,۰۰۰', defaultChange: '+۱.۱۰٪ ↗', isPos: true },
  { key: 'quarter', name: 'ربع سکه', englishName: 'Quarter Coin', code: 'QUARTER', icon: '🪙', defaultPrice: '۱۵,۵۰۰,۰۰۰', defaultChange: '+۰.۸۸٪ ↗', isPos: true },
  { key: 'gerami', name: 'سکه گرمی', englishName: 'Gerami Coin', code: 'GERAMI', icon: '🪙', defaultPrice: '۷,۲۰۰,۰۰۰', defaultChange: '+۰.۵۰٪ ↗', isPos: true },
  { key: 'usdt', name: 'تتر دیجیتال', englishName: 'Tether USD', code: 'USDT', icon: '₮', defaultPrice: '۶۱,۲۵۰', defaultChange: '+۰.۲۵٪ ↗', isPos: true },
  { key: 'btc', name: 'بیت‌کوین', englishName: 'Bitcoin', code: 'BTC', icon: '₿', defaultPrice: '۴,۱۲۰,۰۰۰,۰۰۰', defaultChange: '+۲.۱۲٪ ↗', isPos: true },
];

export function syncPricesToWidget(
  currencies: CurrencyItem[],
  cryptoList: CryptoItem[],
  goldList: GoldItem[]
): void {
  if (typeof (window as any).AndroidBridge === 'undefined' || !(window as any).AndroidBridge.syncWidgetPrices) {
    return;
  }

  const payload: Record<string, { price: string; change: string; isPositive: boolean }> = {};

  const usd = currencies.find((c) => c.code === 'USD');
  if (usd) {
    payload['usd'] = {
      price: usd.price,
      change: usd.change_24h || '+۲.۱۱٪ ↗',
      isPositive: !usd.change_24h?.includes('-'),
    };
  }

  const usdt = cryptoList.find((c) => c.ticker === 'USDT');
  if (usdt) {
    payload['usdt'] = {
      price: formatPrice(usdt.priceToman, 'persian'),
      change: `+${usdt.change24h}% ↗`,
      isPositive: (usdt.change24h || 0) >= 0,
    };
  }

  const eur = currencies.find((c) => c.code === 'EUR');
  if (eur) {
    payload['eur'] = {
      price: eur.price,
      change: eur.change_24h || '+۲.۰۳٪ ↗',
      isPositive: !eur.change_24h?.includes('-'),
    };
  }

  const aed = currencies.find((c) => c.code === 'AED');
  if (aed) {
    payload['aed'] = {
      price: aed.price,
      change: aed.change_24h || '+۲.۱۰٪ ↗',
      isPositive: !aed.change_24h?.includes('-'),
    };
  }

  const gbp = currencies.find((c) => c.code === 'GBP');
  if (gbp) {
    payload['gbp'] = {
      price: gbp.price,
      change: gbp.change_24h || '+۱.۹۵٪ ↗',
      isPositive: !gbp.change_24h?.includes('-'),
    };
  }

  const btc = cryptoList.find((c) => c.ticker === 'BTC');
  if (btc) {
    payload['btc'] = {
      price: formatPrice(btc.priceToman, 'persian'),
      change: `${btc.change24h}% ↗`,
      isPositive: (btc.change24h || 0) >= 0,
    };
  }

  const gold18 = goldList.find((g) => g.name.includes('۱۸') && !g.name.includes('حباب') && !g.name.includes('دست دوم'));
  if (gold18) {
    payload['gold18k'] = {
      price: gold18.price,
      change: gold18.change_24h || '+۱.۸۲٪ ↗',
      isPositive: !gold18.change_24h?.includes('-'),
    };
  }

  const emami = goldList.find((g) => g.name.includes('امامی') && !g.name.includes('حباب'));
  if (emami) {
    payload['emami'] = {
      price: emami.price,
      change: emami.change_24h || '+۲.۷۳٪ ↗',
      isPositive: !emami.change_24h?.includes('-'),
    };
  }

  const bahar = goldList.find((g) => g.name.includes('بهار') && !g.name.includes('حباب'));
  if (bahar) {
    payload['bahar'] = {
      price: bahar.price,
      change: bahar.change_24h || '+۱.۵۱٪ ↗',
      isPositive: !bahar.change_24h?.includes('-'),
    };
  }

  const half = goldList.find((g) => g.name.includes('نیم') && !g.name.includes('حباب'));
  if (half) {
    payload['half'] = {
      price: half.price,
      change: half.change_24h || '+۱.۱۰٪ ↗',
      isPositive: !half.change_24h?.includes('-'),
    };
  }

  const quarter = goldList.find((g) => g.name.includes('ربع') && !g.name.includes('حباب'));
  if (quarter) {
    payload['quarter'] = {
      price: quarter.price,
      change: quarter.change_24h || '+۰.۸۸٪ ↗',
      isPositive: !quarter.change_24h?.includes('-'),
    };
  }

  const gerami = goldList.find((g) => g.name.includes('گرمی') && !g.name.includes('حباب'));
  if (gerami) {
    payload['gerami'] = {
      price: gerami.price,
      change: gerami.change_24h || '+۰.۵۰٪ ↗',
      isPositive: !gerami.change_24h?.includes('-'),
    };
  }

  try {
    (window as any).AndroidBridge.syncWidgetPrices(JSON.stringify(payload));
  } catch (e) {
    console.error('Widget price sync error:', e);
  }
}

export function setNativeWidgetAsset(assetKey: string): boolean {
  if (typeof (window as any).AndroidBridge !== 'undefined' && (window as any).AndroidBridge.updateDefaultWidgetAsset) {
    try {
      (window as any).AndroidBridge.updateDefaultWidgetAsset(assetKey);
      return true;
    } catch {}
  }
  return false;
}
