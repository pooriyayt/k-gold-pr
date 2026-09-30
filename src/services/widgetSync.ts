import { CurrencyItem, CryptoItem, GoldItem } from '../types';
import { formatPrice } from './format';

export const WIDGET_ASSET_OPTIONS = [
  { key: 'usd', name: 'دلار آمریکا', code: 'USD', icon: '🇺🇸', defaultPrice: '۶۱,۳۰۰' },
  { key: 'usdt', name: 'تتر دیجیتال', code: 'USDT', icon: '₮', defaultPrice: '۶۱,۲۵۰' },
  { key: 'gold18k', name: 'طلای ۱۸ عیار', code: '18K', icon: '🪙', defaultPrice: '۳,۷۵۰,۰۰۰' },
  { key: 'emami', name: 'سکه تمام امامی', code: 'EMAMI', icon: '🟡', defaultPrice: '۴۳,۸۰۰,۰۰۰' },
  { key: 'bahar', name: 'سکه بهار آزادی', code: 'BAHAR', icon: '🟡', defaultPrice: '۳۸,۹۰۰,۰۰۰' },
  { key: 'half', name: 'نیم سکه', code: 'HALF', icon: '🟡', defaultPrice: '۲۳,۵۰۰,۰۰۰' },
  { key: 'quarter', name: 'ربع سکه', code: 'QUARTER', icon: '🟡', defaultPrice: '۱۵,۵۰۰,۰۰۰' },
  { key: 'gerami', name: 'سکه گرمی', code: 'GERAMI', icon: '🟡', defaultPrice: '۷,۲۰۰,۰۰۰' },
  { key: 'eur', name: 'یورو اروپا', code: 'EUR', icon: '🇪🇺', defaultPrice: '۶۶,۴۰۰' },
  { key: 'aed', name: 'درهم امارات', code: 'AED', icon: '🇦🇪', defaultPrice: '۱۶,۶۸۰' },
  { key: 'gbp', name: 'پوند انگلیس', code: 'GBP', icon: '🇬🇧', defaultPrice: '۷۸,۲۰۰' },
  { key: 'btc', name: 'بیت‌کوین', code: 'BTC', icon: '₿', defaultPrice: '۴,۱۲۰,۰۰۰,۰۰۰' },
];

export function syncPricesToWidget(
  currencies: CurrencyItem[],
  cryptoList: CryptoItem[],
  goldList: GoldItem[]
): void {
  if (typeof (window as any).AndroidBridge === 'undefined' || !(window as any).AndroidBridge.syncWidgetPrices) {
    return;
  }

  const payload: Record<string, { price: string; prevPrice: string; isPositive: boolean }> = {};

  const usd = currencies.find((c) => c.code === 'USD');
  if (usd) {
    payload['usd'] = {
      price: usd.price,
      prevPrice: usd.price,
      isPositive: !usd.change_24h?.includes('-'),
    };
  }

  const usdt = cryptoList.find((c) => c.ticker === 'USDT');
  if (usdt) {
    payload['usdt'] = {
      price: formatPrice(usdt.priceToman, 'persian'),
      prevPrice: formatPrice(usdt.priceToman, 'persian'),
      isPositive: (usdt.change24h || 0) >= 0,
    };
  }

  const eur = currencies.find((c) => c.code === 'EUR');
  if (eur) {
    payload['eur'] = {
      price: eur.price,
      prevPrice: eur.price,
      isPositive: !eur.change_24h?.includes('-'),
    };
  }

  const aed = currencies.find((c) => c.code === 'AED');
  if (aed) {
    payload['aed'] = {
      price: aed.price,
      prevPrice: aed.price,
      isPositive: !aed.change_24h?.includes('-'),
    };
  }

  const gbp = currencies.find((c) => c.code === 'GBP');
  if (gbp) {
    payload['gbp'] = {
      price: gbp.price,
      prevPrice: gbp.price,
      isPositive: !gbp.change_24h?.includes('-'),
    };
  }

  const btc = cryptoList.find((c) => c.ticker === 'BTC');
  if (btc) {
    payload['btc'] = {
      price: formatPrice(btc.priceToman, 'persian'),
      prevPrice: formatPrice(btc.priceToman, 'persian'),
      isPositive: (btc.change24h || 0) >= 0,
    };
  }

  const gold18 = goldList.find((g) => g.name.includes('۱۸') && !g.name.includes('حباب') && !g.name.includes('دست دوم'));
  if (gold18) {
    payload['gold18k'] = {
      price: gold18.price,
      prevPrice: gold18.price,
      isPositive: !gold18.change_24h?.includes('-'),
    };
  }

  const emami = goldList.find((g) => g.name.includes('امامی') && !g.name.includes('حباب'));
  if (emami) {
    payload['emami'] = {
      price: emami.price,
      prevPrice: emami.price,
      isPositive: !emami.change_24h?.includes('-'),
    };
  }

  const bahar = goldList.find((g) => g.name.includes('بهار') && !g.name.includes('حباب'));
  if (bahar) {
    payload['bahar'] = {
      price: bahar.price,
      prevPrice: bahar.price,
      isPositive: !bahar.change_24h?.includes('-'),
    };
  }

  const half = goldList.find((g) => g.name.includes('نیم') && !g.name.includes('حباب'));
  if (half) {
    payload['half'] = {
      price: half.price,
      prevPrice: half.price,
      isPositive: !half.change_24h?.includes('-'),
    };
  }

  const quarter = goldList.find((g) => g.name.includes('ربع') && !g.name.includes('حباب'));
  if (quarter) {
    payload['quarter'] = {
      price: quarter.price,
      prevPrice: quarter.price,
      isPositive: !quarter.change_24h?.includes('-'),
    };
  }

  const gerami = goldList.find((g) => g.name.includes('گرمی') && !g.name.includes('حباب'));
  if (gerami) {
    payload['gerami'] = {
      price: gerami.price,
      prevPrice: gerami.price,
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
