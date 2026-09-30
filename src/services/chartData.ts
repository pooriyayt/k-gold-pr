// Historical Chart Data Generator and Analysis Service

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

/**
 * Deterministically generates smooth historical points based on asset name and timeframe
 */
export function generateHistoricalData(
  assetName: string,
  currentPrice: number,
  timeframe: ChartTimeframe
): ChartAnalysis {
  let count = 24;
  let durationMs = 24 * 60 * 60 * 1000;
  let volatility = 0.015; // 1.5%

  if (timeframe === '7d') {
    count = 28;
    durationMs = 7 * 24 * 60 * 60 * 1000;
    volatility = 0.035;
  } else if (timeframe === '30d') {
    count = 30;
    durationMs = 30 * 24 * 60 * 60 * 1000;
    volatility = 0.065;
  } else if (timeframe === '90d') {
    count = 45;
    durationMs = 90 * 24 * 60 * 60 * 1000;
    volatility = 0.12;
  } else if (timeframe === '1y') {
    count = 52;
    durationMs = 365 * 24 * 60 * 60 * 1000;
    volatility = 0.22;
  }

  // Create seed from asset name string
  let seed = 0;
  for (let i = 0; i < assetName.length; i++) {
    seed = (seed * 31 + assetName.charCodeAt(i)) & 0xffffffff;
  }
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const now = Date.now();
  const startTime = now - durationMs;
  const stepMs = durationMs / (count - 1);

  // Generate walk backwards from currentPrice
  const rawPrices: number[] = new Array(count);
  rawPrices[count - 1] = currentPrice;

  // Trend factor
  const overallTrend = (random() - 0.45) * volatility; // slight upward bias
  let rolling = currentPrice;

  for (let i = count - 2; i >= 0; i--) {
    const shock = (random() - 0.5) * (volatility / Math.sqrt(count)) * 2;
    const trendStep = overallTrend / count;
    rolling = rolling / (1 + shock + trendStep);
    rawPrices[i] = rolling;
  }

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
      price: Math.round(p),
    };
  });

  const prices = points.map((pt) => pt.price);
  const highPrice = Math.max(...prices);
  const lowPrice = Math.min(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const firstPrice = prices[0] || currentPrice;
  const changePercent = Number((((currentPrice - firstPrice) / firstPrice) * 100).toFixed(2));
  const spread = highPrice - lowPrice;

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
