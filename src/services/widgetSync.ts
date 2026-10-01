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
  { key: 'usdt', name: 'تتر', englishName: 'Tether', code: 'USDT', icon: '₮', defaultPrice: '۶۱,۲۵۰', defaultChange: '+۰.۲۵٪ ↗', isPos: true },
  { key: 'btc', name: 'بیت‌کوین', englishName: 'Bitcoin', code: 'BTC', icon: '₿', defaultPrice: '۴,۱۲۰,۰۰۰,۰۰۰', defaultChange: '+۲.۱۲٪ ↗', isPos: true },
];

export function toPersianDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/0/g, '۰')
    .replace(/1/g, '۱')
    .replace(/2/g, '۲')
    .replace(/3/g, '۳')
    .replace(/4/g, '۴')
    .replace(/5/g, '۵')
    .replace(/6/g, '۶')
    .replace(/7/g, '۷')
    .replace(/8/g, '۸')
    .replace(/9/g, '۹')
    .replace(/%/g, '٪');
}

export function formatWidgetChange(val: number | string | undefined, isPositive?: boolean): string {
  if (val === undefined || val === null) return '+۰.۰۰٪ ↗';
  if (typeof val === 'number') {
    const isNeg = val < 0;
    const sign = isNeg ? '-' : '+';
    const arrow = isNeg ? ' ↘' : ' ↗';
    return toPersianDigits(`${sign}${Math.abs(val).toFixed(2)}٪${arrow}`);
  }
  const isNeg = val.includes('-') || isPositive === false;
  const clean = val.replace(/[+-\s%٪↗↘]/g, '').trim();
  const sign = isNeg ? '-' : '+';
  const arrow = isNeg ? ' ↘' : ' ↗';
  return toPersianDigits(`${sign}${clean}٪${arrow}`);
}

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
    const isPos = !usd.change_24h?.includes('-');
    payload['usd'] = {
      price: toPersianDigits(usd.price),
      change: formatWidgetChange(usd.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const usdt = cryptoList.find((c) => c.ticker === 'USDT');
  if (usdt) {
    const isPos = (usdt.change24h || 0) >= 0;
    payload['usdt'] = {
      price: toPersianDigits(formatPrice(usdt.priceToman, 'english')),
      change: formatWidgetChange(usdt.change24h, isPos),
      isPositive: isPos,
    };
  }

  const eur = currencies.find((c) => c.code === 'EUR');
  if (eur) {
    const isPos = !eur.change_24h?.includes('-');
    payload['eur'] = {
      price: toPersianDigits(eur.price),
      change: formatWidgetChange(eur.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const aed = currencies.find((c) => c.code === 'AED');
  if (aed) {
    const isPos = !aed.change_24h?.includes('-');
    payload['aed'] = {
      price: toPersianDigits(aed.price),
      change: formatWidgetChange(aed.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const gbp = currencies.find((c) => c.code === 'GBP');
  if (gbp) {
    const isPos = !gbp.change_24h?.includes('-');
    payload['gbp'] = {
      price: toPersianDigits(gbp.price),
      change: formatWidgetChange(gbp.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const btc = cryptoList.find((c) => c.ticker === 'BTC');
  if (btc) {
    const isPos = (btc.change24h || 0) >= 0;
    payload['btc'] = {
      price: toPersianDigits(formatPrice(btc.priceToman, 'english')),
      change: formatWidgetChange(btc.change24h, isPos),
      isPositive: isPos,
    };
  }

  const gold18 = goldList.find((g) => g.name.includes('۱۸') && !g.name.includes('حباب') && !g.name.includes('دست دوم'));
  if (gold18) {
    const isPos = !gold18.change_24h?.includes('-');
    payload['gold18k'] = {
      price: toPersianDigits(gold18.price),
      change: formatWidgetChange(gold18.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const emami = goldList.find((g) => g.name.includes('امامی') && !g.name.includes('حباب'));
  if (emami) {
    const isPos = !emami.change_24h?.includes('-');
    payload['emami'] = {
      price: toPersianDigits(emami.price),
      change: formatWidgetChange(emami.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const bahar = goldList.find((g) => g.name.includes('بهار') && !g.name.includes('حباب'));
  if (bahar) {
    const isPos = !bahar.change_24h?.includes('-');
    payload['bahar'] = {
      price: toPersianDigits(bahar.price),
      change: formatWidgetChange(bahar.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const half = goldList.find((g) => g.name.includes('نیم') && !g.name.includes('حباب'));
  if (half) {
    const isPos = !half.change_24h?.includes('-');
    payload['half'] = {
      price: toPersianDigits(half.price),
      change: formatWidgetChange(half.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const quarter = goldList.find((g) => g.name.includes('ربع') && !g.name.includes('حباب'));
  if (quarter) {
    const isPos = !quarter.change_24h?.includes('-');
    payload['quarter'] = {
      price: toPersianDigits(quarter.price),
      change: formatWidgetChange(quarter.change_24h, isPos),
      isPositive: isPos,
    };
  }

  const gerami = goldList.find((g) => g.name.includes('گرمی') && !g.name.includes('حباب'));
  if (gerami) {
    const isPos = !gerami.change_24h?.includes('-');
    payload['gerami'] = {
      price: toPersianDigits(gerami.price),
      change: formatWidgetChange(gerami.change_24h, isPos),
      isPositive: isPos,
    };
  }

  try {
    (window as any).AndroidBridge.syncWidgetPrices(JSON.stringify(payload));
  } catch (e) {
    console.error('Widget price sync error:', e);
  }
}

export function setNativeWidgetAssets(assetKeys: string[]): boolean {
  if (typeof (window as any).AndroidBridge !== 'undefined') {
    if ((window as any).AndroidBridge.updateDefaultWidgetAssets) {
      try {
        (window as any).AndroidBridge.updateDefaultWidgetAssets(assetKeys.join(','));
        return true;
      } catch {}
    } else if ((window as any).AndroidBridge.updateDefaultWidgetAsset) {
      try {
        (window as any).AndroidBridge.updateDefaultWidgetAsset(assetKeys[0] || 'usd');
        return true;
      } catch {}
    }
  }
  return false;
}

export function setNativeWidgetAsset(assetKey: string): boolean {
  return setNativeWidgetAssets([assetKey]);
}

