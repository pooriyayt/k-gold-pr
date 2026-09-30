import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Plus, Trash2, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { PriceAlert, getStoredAlerts, addAlert, deleteAlert, toggleAlert } from '../../services/alerts';
import { formatPrice } from '../../services/format';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceMap: Record<string, number>;
  defaultAssetName?: string;
}

const COMMON_ASSETS = [
  'تتر',
  'دلار آمریکا',
  'سکه امامی',
  'طلای ۱۸ عیار',
  'نیم سکه',
  'ربع سکه',
  'یورو اروپا',
  'درهم امارات',
  'بیت کوین',
  'اتریوم',
];

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  priceMap,
  defaultAssetName,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>(defaultAssetName || 'تتر');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setAlerts(getStoredAlerts());
      if (defaultAssetName) {
        setSelectedAsset(defaultAssetName);
      }
      setIsAdding(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultAssetName]);

  // Set default target price based on current price
  useEffect(() => {
    const cur = priceMap[selectedAsset] || 0;
    if (cur > 0 && !targetPrice) {
      const suggested = condition === 'above' ? Math.round(cur * 1.02) : Math.round(cur * 0.98);
      setTargetPrice(suggested.toString());
    }
  }, [selectedAsset, condition, priceMap]);

  if (!isOpen) return null;

  const currentPrice = priceMap[selectedAsset] || 0;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetPrice);
    if (!target || target <= 0) return;

    try {
      Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    addAlert({
      name: selectedAsset,
      targetPrice: target,
      condition,
    });

    setAlerts(getStoredAlerts());
    setIsAdding(false);
    setTargetPrice('');
  };

  const handleDelete = (id: string) => {
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    const updated = deleteAlert(id);
    setAlerts(updated);
  };

  const handleToggle = (id: string) => {
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    const updated = toggleAlert(id);
    setAlerts(updated);
  };

  const handleApplyPercent = (percent: number) => {
    if (currentPrice <= 0) return;
    const calc = Math.round(currentPrice * (1 + percent / 100));
    setTargetPrice(calc.toString());
    setCondition(percent >= 0 ? 'above' : 'below');
    try {
      Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-[#0B0F19] border-t border-white/10 rounded-t-[32px] p-4 sm:p-5 pb-8 shadow-2xl animate-slideUp text-right flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar relative"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        {/* Top Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3 cursor-pointer shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <h2 className="text-base font-black text-white flex items-center justify-end gap-1.5">
                <span>هشدارهای هوشمند قیمت</span>
                <Bell className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                اعلان درون‌برنامه‌ای به محض رسیدن به تارگت قیمتی
              </p>
            </div>
          </div>
        </div>

        {/* Add Alert Button or Form */}
        {!isAdding ? (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              const cur = priceMap[selectedAsset] || 0;
              if (cur > 0) setTargetPrice(Math.round(cur * 1.02).toString());
            }}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 mb-3 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تنظیم هشدار جدید برای دارایی‌ها</span>
          </button>
        ) : (
          <form onSubmit={handleCreateAlert} className="bg-[#141B2A]/90 border border-amber-500/30 rounded-2xl p-4 mb-3 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-amber-400">تنظیم هشدار قیمت جدید</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                انصراف
              </button>
            </div>

            {/* Asset Selection */}
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">انتخاب دارایی:</label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {COMMON_ASSETS.map((asset) => (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset);
                      const cur = priceMap[asset] || 0;
                      if (cur > 0) setTargetPrice(Math.round(cur * 1.02).toString());
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                      selectedAsset === asset
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Price Banner */}
            {currentPrice > 0 && (
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">قیمت لحظه‌ای {selectedAsset}:</span>
                <span className="font-mono font-black text-amber-400 tabular-nums">
                  {formatPrice(currentPrice, 'persian')} تومان
                </span>
              </div>
            )}

            {/* Condition: Above vs Below */}
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">شرط فعال‌سازی:</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCondition('above')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    condition === 'above'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-sm'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>افزایش به بالاتر از</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition('below')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    condition === 'below'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>کاهش به کمتر از</span>
                </button>
              </div>
            </div>

            {/* Target Price Input */}
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">
                قیمت هدف هشدار (تومان):
              </label>
              <input
                type="number"
                inputMode="numeric"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="مثال: ۲۴۵۰۰۰"
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-black text-left text-lg tabular-nums focus:outline-none focus:border-amber-400"
              />

              {/* Quick Percent Presets */}
              <div className="flex gap-1.5 pt-2">
                {[
                  { label: '+۲٪', val: 2 },
                  { label: '+۵٪', val: 5 },
                  { label: '-۲٪', val: -2 },
                  { label: '-۵٪', val: -5 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPercent(preset.val)}
                    className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-slate-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs active:scale-98 transition-all"
            >
              ثبت و فعال‌سازی هشدار
            </button>
          </form>
        )}

        {/* Existing Alerts List */}
        <div className="space-y-2 mb-3">
          <span className="text-xs font-bold text-slate-300 block mb-1">
            هشدارهای فعال ({alerts.length}):
          </span>

          {alerts.length === 0 ? (
            <div className="bg-[#141B2A]/60 border border-white/5 rounded-2xl p-6 text-center text-xs text-slate-500">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <span>هنوز هشداری تنظیم نکرده‌اید. با فشردن کلید بالا می‌توانید برای تغییرات قیمت آلارم بگذارید.</span>
            </div>
          ) : (
            alerts.map((al) => {
              const cur = priceMap[al.name] || 0;
              const isAbove = al.condition === 'above';

              return (
                <div
                  key={al.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    al.isTriggered
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : al.enabled
                      ? 'bg-[#141B2A]/90 border-white/10'
                      : 'bg-white/[0.02] border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(al.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        al.enabled
                          ? isAbove
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {isAbove ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{al.name}</span>
                        <span className="text-[10px] text-slate-400">
                          ({isAbove ? 'بالاتر از' : 'کمتر از'})
                        </span>
                      </div>
                      <div className="font-mono font-black text-amber-400 text-xs tabular-nums mt-0.5">
                        {formatPrice(al.targetPrice, 'persian')} تومان
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {al.isTriggered && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[9px] animate-pulse">
                        تارگت زده شد!
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(al.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 active:scale-90 transition-transform"
                      title="حذف هشدار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-98 transition-all shrink-0"
        >
          بستن
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
