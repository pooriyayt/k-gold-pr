export interface PortfolioItem {
  id: string;
  category: 'gold' | 'coin' | 'currency' | 'crypto';
  name: string;
  unitLabel: string; // e.g. 'عدد', 'گرم', 'دلار', 'تتر'
  amount: number;
  buyPricePerUnit: number; // in Toman
  createdAt: string;
}

export interface PortfolioSummary {
  totalCurrentValue: number;
  totalBuyValue: number;
  totalProfitLoss: number;
  profitLossPercent: number;
  items: {
    item: PortfolioItem;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
    sharePercent: number;
  }[];
}

const STORAGE_KEY = 'kgold_portfolio_items';

export function getStoredPortfolio(): PortfolioItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePortfolio(items: PortfolioItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function addPortfolioItem(entry: {
  category: 'gold' | 'coin' | 'currency' | 'crypto';
  name: string;
  unitLabel: string;
  amount: number;
  buyPricePerUnit: number;
}): PortfolioItem {
  const items = getStoredPortfolio();
  const newItem: PortfolioItem = {
    id: 'pf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    category: entry.category,
    name: entry.name,
    unitLabel: entry.unitLabel,
    amount: entry.amount,
    buyPricePerUnit: entry.buyPricePerUnit,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  savePortfolio(items);
  return newItem;
}

export function deletePortfolioItem(id: string): PortfolioItem[] {
  const items = getStoredPortfolio().filter((i) => i.id !== id);
  savePortfolio(items);
  return items;
}

export function calculatePortfolio(
  items: PortfolioItem[],
  priceMap: Record<string, number>
): PortfolioSummary {
  let totalCurrentValue = 0;
  let totalBuyValue = 0;

  const evaluated = items.map((item) => {
    const currentPrice = priceMap[item.name] || item.buyPricePerUnit;
    const currentValue = item.amount * currentPrice;
    const buyValue = item.amount * item.buyPricePerUnit;
    const profitLoss = currentValue - buyValue;
    const profitLossPercent = buyValue > 0 ? (profitLoss / buyValue) * 100 : 0;

    totalCurrentValue += currentValue;
    totalBuyValue += buyValue;

    return {
      item,
      currentPrice,
      currentValue,
      profitLoss,
      profitLossPercent,
      sharePercent: 0,
    };
  });

  // Calculate share percent
  evaluated.forEach((e) => {
    e.sharePercent = totalCurrentValue > 0 ? (e.currentValue / totalCurrentValue) * 100 : 0;
  });

  const totalProfitLoss = totalCurrentValue - totalBuyValue;
  const profitLossPercent = totalBuyValue > 0 ? (totalProfitLoss / totalBuyValue) * 100 : 0;

  return {
    totalCurrentValue,
    totalBuyValue,
    totalProfitLoss,
    profitLossPercent,
    items: evaluated,
  };
}
