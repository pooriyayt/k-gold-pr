// Historical Chart Data Generator and Analysis Service
// Realistic market volatility modeling with bounded variance

export type ChartTimeframe = '24h' | '7d' | '30d' | '90d' | '1y';

export interface ChartPoint {
  timestamp: number;
  label: string;
  price: number;
}

export interface ChartAnalysis {
  timeframe: ChartTimeframe;
  points: ChartPoint[];
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  avgPrice: number;
  changePercent: number;
  spread: number;
}

function roundAssetPrice(price: number): number {
  if (price >= 100) return Math.round(price);
  if (price >= 1) return Number(price.toFixed(2));
  if (price >= 0.01) return Number(price.toFixed(4));
  return Number(price.toFixed(6));
}

/**
 * Deterministically generates realistic, bounded historical points based on asset name,
 * asset category volatility, and timeframe.
 */
export function generateHistoricalData(
  assetName: string,
  currentPrice: number,
  timeframe: ChartTimeframe
): ChartAnalysis {
  let count = 24;
  let durationMs = 24 * 60 * 60 * 1000;

  // Determine realistic market volatility bounds per asset class
  const isCrypto =
    assetName.includes('BTC') ||
    assetName.includes('بیت') ||
    assetName.includes('اتریوم') ||
    assetName.includes('سولانا') ||
    assetName.includes('رمزارز');
  const isGold =
    assetName.includes('سکه') ||
    assetName.includes('طلا') ||
    assetName.includes('18K') ||
    assetName.includes('امامی') ||
    assetName.includes('بهار');

  let maxSwing = 0.015; // default max percentage deviation

  if (timeframe === '24h') {
    count = 24;
    durationMs = 24 * 3600 * 1000;
    maxSwing = isCrypto ? 0.04 : isGold ? 0.012 : 0.008; // Currency ~0.8% in 24h
  } else if (timeframe === '7d') {
    count = 28;
    durationMs = 7 * 86400 * 1000;
    maxSwing = isCrypto ? 0.08 : isGold ? 0.028 : 0.018; // Currency ~1.8% in 7d
  } else if (timeframe === '30d') {
    count = 30;
    durationMs = 30 * 86400 * 1000;
    maxSwing = isCrypto ? 0.15 : isGold ? 0.055 : 0.035; // Currency ~3.5% in 30d
  } else if (timeframe === '90d') {
    count = 45;
    durationMs = 90 * 86400 * 1000;
    maxSwing = isCrypto ? 0.25 : isGold ? 0.09 : 0.055; // Currency ~5.5% in 90d
  } else if (timeframe === '1y') {
    count = 52;
    durationMs = 365 * 86400 * 1000;
    maxSwing = isCrypto ? 0.45 : isGold ? 0.18 : 0.12; // Currency ~12% in 1y
  }

  // Proper positive 32-bit PRNG seed from asset name and timeframe
  let seed = 12345;
  const seedString = `${assetName}-${timeframe}`;
  for (let i = 0; i < seedString.length; i++) {
    seed = Math.abs((seed * 31 + seedString.charCodeAt(i)) | 0);
  }
  seed = (seed % 2147483646) + 1;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const now = Date.now();
  const startTime = now - durationMs;
  const stepMs = durationMs / (count - 1);

  // Generate bounded Brownian motion anchored at index count - 1 (today)
  const rawDeltas = new Array(count).fill(0);
  let cumulative = 0;
  for (let i = count - 2; i >= 0; i--) {
    const step = (random() - 0.5) * (maxSwing / Math.sqrt(count)) * 1.6;
    cumulative += step;
    cumulative = Math.max(-maxSwing, Math.min(maxSwing, cumulative));
    rawDeltas[i] = cumulative;
  }

  const rawPrices: number[] = rawDeltas.map((delta) => currentPrice * (1 + delta));
  rawPrices[count - 1] = currentPrice;

  // Format points
  const points: ChartPoint[] = rawPrices.map((p, idx) => {
    const t = startTime + idx * stepMs;
    const date = new Date(t);
    let label = '';
    if (timeframe === '24h') {
      label = `${date.getHours().toString().padStart(2, '0')}:00`;
    } else if (timeframe === '7d' || timeframe === '30d') {
      label = `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      label = `${date.getFullYear()}/${date.getMonth() + 1}`;
    }

    return {
      timestamp: t,
      label,
      price: roundAssetPrice(p),
    };
  });

  const prices = points.map((pt) => pt.price);
  const highPrice = Math.max(...prices);
  const lowPrice = Math.min(...prices);
  const avgPrice = roundAssetPrice(prices.reduce((a, b) => a + b, 0) / prices.length);
  const firstPrice = prices[0] || currentPrice;
  const changePercent = Number((((currentPrice - firstPrice) / firstPrice) * 100).toFixed(2));
  const spread = roundAssetPrice(highPrice - lowPrice);

  return {
    timeframe,
    points,
    currentPrice,
    highPrice,
    lowPrice,
    avgPrice,
    changePercent,
    spread,
  };
}
