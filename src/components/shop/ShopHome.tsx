import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuantityStepper } from '../common/QuantityStepper';
import { formatINR, formatWeight, getTodayDate, isPastCutoff } from '../../lib/formatters';
import { Clock, RotateCcw, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface ShopHomeProps {
  onReviewOrder: (cart: Record<string, number>) => void;
  onOpenStandingOrders: () => void;
}

export const ShopHome: React.FC<ShopHomeProps> = ({ onReviewOrder, onOpenStandingOrders }) => {
  const { currentShop, products, orders, settings, t, language } = useApp();

  // Cart state: product_id -> qty
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const cutoffPassed = isPastCutoff(settings.cutoff_time);

  const handleQuantityChange = (productId: string, val: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (val <= 0) {
        delete next[productId];
      } else {
        next[productId] = val;
      }
      return next;
    });
  };

  // Find last delivered or confirmed order for "Repeat Last Order"
  const pastShopOrders = orders.filter((o) => o.shop_id === currentShop.id);
  const lastOrder = pastShopOrders[0];

  const handleRepeatLastOrder = () => {
    if (!lastOrder) return;
    const repeated: Record<string, number> = {};
    lastOrder.items.forEach((item) => {
      repeated[item.product_id] = item.ordered_qty;
    });
    setQuantities(repeated);
  };

  // Calculate cart summary
  let totalKg = 0;
  let estimatedAmount = 0;
  let itemsCount = 0;

  Object.entries(quantities).forEach(([prodId, qty]) => {
    if (qty > 0) {
      const prod = products.find((p) => p.id === prodId);
      const customPrice = currentShop.custom_rates?.[prodId];
      const rate = customPrice !== undefined ? customPrice : prod?.current_rate || 0;
      totalKg += qty;
      estimatedAmount += qty * rate;
      itemsCount += 1;
    }
  });

  const getLocalizedProductName = (prod: (typeof products)[0]) => {
    if (language === 'kn' && prod.name_kn) return prod.name_kn;
    if (language === 'hi' && prod.name_hi) return prod.name_hi;
    if (language === 'te' && prod.name_te) return prod.name_te;
    return prod.name;
  };

  return (
    <div className="pb-28">
      {/* Shop Greeting Header */}
      <div className="p-4 bg-surface border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              {currentShop.area_route}
            </span>
            <h1 className="text-xl font-bold text-textPrimary leading-tight mt-0.5">
              {currentShop.name}
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Quick Standing Orders Trigger */}
          <button
            type="button"
            onClick={onOpenStandingOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-brand border border-brand/20 hover:bg-emerald-100 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recurring</span>
          </button>
        </div>

        {/* Order Cutoff Notice Banner */}
        <div
          className={`mt-3 p-3 rounded-card border flex items-center gap-2.5 ${
            cutoffPassed
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          }`}
        >
          <Clock className={`w-4 h-4 shrink-0 ${cutoffPassed ? 'text-amber-600' : 'text-brand'}`} />
          <div className="flex-1 text-xs">
            {cutoffPassed ? (
              <span className="font-medium">
                Today's cutoff (9:00 PM) has passed. Orders will be scheduled for next morning delivery.
              </span>
            ) : (
              <span>{t.cutoffAlert}</span>
            )}
          </div>
        </div>

        {/* Repeat Last Order Button */}
        {lastOrder && (
          <button
            type="button"
            onClick={handleRepeatLastOrder}
            className="w-full mt-3 h-11 flex items-center justify-center gap-2 rounded-btn bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-textPrimary text-xs font-semibold border border-border transition-colors touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-textSecondary" />
            <span>
              {t.repeatOrder} ({formatWeight(lastOrder.total_ordered_qty)}, {formatINR(lastOrder.estimated_amount, false)})
            </span>
          </button>
        )}
      </div>

      {/* Product List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-section-title text-textPrimary">Fresh Chicken Catalog</h2>
          <span className="text-xs text-textSecondary">{products.filter((p) => p.is_active).length} items available</span>
        </div>

        {products
          .filter((p) => p.is_active)
          .map((product) => {
            const customPrice = currentShop.custom_rates?.[product.id];
            const activeRate = customPrice !== undefined ? customPrice : product.current_rate;
            const currentQty = quantities[product.id] || 0;
            const isSelected = currentQty > 0;

            const rateDiff = activeRate - product.yesterday_rate;

            return (
              <div
                key={product.id}
                className={`p-3.5 rounded-card border transition-all ${
                  isSelected
                    ? 'bg-emerald-50/40 border-brand/60 shadow-sm'
                    : 'bg-surface border-border hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-textPrimary text-base leading-snug">
                        {getLocalizedProductName(product)}
                      </h3>
                      {customPrice !== undefined && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                          Special Rate
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-textSecondary mt-0.5 line-clamp-1">
                      {product.description}
                    </p>

                    {/* Rate per kg */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-brand tabular-nums">
                        {formatINR(activeRate, false)}
                      </span>
                      <span className="text-xs text-textSecondary">{t.perKg}</span>

                      {/* Daily Rate Trend */}
                      {product.yesterday_rate > 0 && rateDiff !== 0 && (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded font-medium tabular-nums ${
                            rateDiff > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rateDiff > 0 ? `+₹${rateDiff}` : `-₹${Math.abs(rateDiff)}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="shrink-0 flex flex-col items-end">
                    <QuantityStepper
                      value={currentQty}
                      onChange={(newVal) => handleQuantityChange(product.id, newVal)}
                      step={product.step_qty}
                      min={0}
                      unit={product.unit}
                    />
                    {currentQty > 0 && (
                      <span className="text-xs font-semibold text-textPrimary tabular-nums mt-1">
                        = {formatINR(currentQty * activeRate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Sticky Bottom Bar for Ordering */}
      {itemsCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-[480px] mx-auto p-3 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-textSecondary flex items-center gap-1.5">
                <span className="font-medium text-textPrimary">{itemsCount} items</span>
                <span>•</span>
                <span className="font-semibold text-textPrimary tabular-nums">
                  {formatWeight(totalKg)}
                </span>
              </div>
              <div className="text-lg font-bold text-textPrimary tabular-nums leading-tight">
                {formatINR(estimatedAmount)}
                <span className="text-[11px] text-textSecondary font-normal ml-1">(Est.)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onReviewOrder(quantities)}
              className="h-12 px-5 rounded-btn bg-brand hover:bg-brand-hover active:bg-brand-dark text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors touch-manipulation"
            >
              <span>{t.reviewOrder}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
