export interface PriceAlert {
  id: string;
  name: string;
  targetPrice: number;
  condition: 'above' | 'below'; // 'above' = بیشتر از, 'below' = کمتر از
  createdAt: string;
  enabled: boolean;
  isTriggered: boolean;
  lastTriggeredPrice?: number;
}

const STORAGE_KEY = 'kgold_price_alerts';

export function getStoredAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: PriceAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {}
}

export function addAlert(newAlert: {
  name: string;
  targetPrice: number;
  condition: 'above' | 'below';
}): PriceAlert {
  const alerts = getStoredAlerts();
  const alert: PriceAlert = {
    id: 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: newAlert.name,
    targetPrice: newAlert.targetPrice,
    condition: newAlert.condition,
    createdAt: new Date().toISOString(),
    enabled: true,
    isTriggered: false,
  };
  alerts.unshift(alert);
  saveAlerts(alerts);
  return alert;
}

export function deleteAlert(id: string): PriceAlert[] {
  const alerts = getStoredAlerts().filter((a) => a.id !== id);
  saveAlerts(alerts);
  return alerts;
}

export function toggleAlert(id: string): PriceAlert[] {
  const alerts = getStoredAlerts().map((a) => {
    if (a.id === id) {
      return { ...a, enabled: !a.enabled };
    }
    return a;
  });
  saveAlerts(alerts);
  return alerts;
}

/**
 * Checks all active alerts against latest market prices.
 * Returns newly triggered alerts.
 */
export function evaluateAlerts(currentPrices: Record<string, number>): PriceAlert[] {
  const alerts = getStoredAlerts();
  const triggered: PriceAlert[] = [];

  const updated = alerts.map((alert) => {
    if (!alert.enabled) return alert;

    const currentPrice = currentPrices[alert.name];
    if (currentPrice === undefined || currentPrice <= 0) return alert;

    const conditionMet =
      (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
      (alert.condition === 'below' && currentPrice <= alert.targetPrice);

    if (conditionMet && !alert.isTriggered) {
      const triggeredAlert = {
        ...alert,
        isTriggered: true,
        lastTriggeredPrice: currentPrice,
      };
      triggered.push(triggeredAlert);
      return triggeredAlert;
    }

    // Reset if price is no longer in triggered range so it can trigger again next time
    if (!conditionMet && alert.isTriggered) {
      return { ...alert, isTriggered: false };
    }

    return alert;
  });

  if (triggered.length > 0) {
    saveAlerts(updated);
  }

  return triggered;
}
