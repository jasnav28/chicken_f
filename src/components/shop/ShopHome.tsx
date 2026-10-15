import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuantityStepper } from '../common/QuantityStepper';
import { formatINR, formatWeight, getTodayDate, isPastCutoff } from '../../lib/formatters';
import {
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  ShoppingBag,
  Trash2,
  Sparkles,
} from 'lucide-react';

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

  const handleClearCart = () => {
    setQuantities({});
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
    <div className="space-y-6 pb-24 md:pb-12">
      {/* ============================================================== */}
      {/* TOP GREETING & CUTOFF STATUS BANNER (Computer & Mobile)       */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-brand">
              {currentShop.area_route}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight mt-1">
            {currentShop.name}
          </h1>

          <p className="text-xs sm:text-sm text-textSecondary mt-0.5">
            Owner: <strong className="text-slate-700">{currentShop.owner_name}</strong> • Phone:{' '}
            <span className="font-mono text-slate-700">{currentShop.phone}</span>
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {lastOrder && (
            <button
              type="button"
              onClick={handleRepeatLastOrder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-textPrimary text-xs font-semibold border border-slate-200 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-brand" />
              <span>
                {t.repeatOrder} ({formatWeight(lastOrder.total_ordered_qty)},{' '}
                {formatINR(lastOrder.estimated_amount, false)})
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenStandingOrders}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-brand border border-brand/20 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Recurring Daily Orders</span>
          </button>
        </div>
      </div>

      {/* Order Cutoff Alert Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          cutoffPassed
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <Clock className={`w-5 h-5 shrink-0 ${cutoffPassed ? 'text-amber-600' : 'text-brand'}`} />
          <div>
            <span className="font-bold">
              {cutoffPassed ? "Today's 9:00 PM cutoff has passed." : "Order Cutoff Time: 9:00 PM"}
            </span>
            <span className="text-xs block sm:inline sm:ml-2 text-slate-600">
              {cutoffPassed
                ? 'New orders will be dispatched in the next scheduled delivery slot.'
                : 'Place orders before 9:00 PM for tomorrow morning delivery.'}
            </span>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-white/80 border border-slate-200/60 shadow-xs">
          Daily Fresh Broiler
        </span>
      </div>

      {/* ============================================================== */}
      {/* 2-COLUMN DESKTOP LAYOUT (Catalog on Left + Sticky Cart on Right) */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT: Product Catalog Grid */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-xl font-bold text-textPrimary tracking-tight">
                Fresh Chicken Catalog
              </h2>
              <p className="text-xs text-textSecondary mt-0.5">
                Wholesale broiler rates published daily by distributor
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              {products.filter((p) => p.is_active).length} Cuts Available
            </span>
          </div>

          {/* Responsive Computer Grid: 1 col on mobile, 2 cols on md, 2 or 3 cols on xl */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/50 border-brand shadow-sm ring-1 ring-brand/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Title & Special Rate Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-textPrimary text-base leading-snug">
                            {getLocalizedProductName(product)}
                          </h3>
                          {language !== 'en' && (
                            <span className="text-[11px] text-slate-400 block font-normal">
                              {product.name}
                            </span>
                          )}
                        </div>

                        {customPrice !== undefined && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                            Custom Rate
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-textSecondary mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Rate per kg & Daily Trend */}
                      <div className="flex items-center gap-2 mt-3 mb-4">
                        <span className="text-xl font-extrabold text-brand tabular-nums">
                          {formatINR(activeRate, false)}
                        </span>
                        <span className="text-xs text-textSecondary font-medium">/{product.unit}</span>

                        {product.yesterday_rate > 0 && rateDiff !== 0 && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md font-semibold tabular-nums ml-auto ${
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

                    {/* Quantity Stepper & Subtotal */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-xs">
                        {currentQty > 0 ? (
                          <div>
                            <span className="text-slate-400 text-[10px] block">Line Total</span>
                            <span className="font-extrabold text-sm text-textPrimary tabular-nums">
                              {formatINR(currentQty * activeRate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Step: {product.step_qty} {product.unit}</span>
                        )}
                      </div>

                      <QuantityStepper
                        value={currentQty}
                        onChange={(newVal) => handleQuantityChange(product.id, newVal)}
                        step={product.step_qty}
                        min={0}
                        unit={product.unit}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* RIGHT: Desktop Sticky Order Summary Sidebar (hidden on mobile, visible on desktop >= lg) */}
        <aside className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-24 self-start bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <h3 className="font-extrabold text-base text-textPrimary tracking-tight">
                Order Summary
              </h3>
            </div>
            {itemsCount > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                title="Clear order items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {itemsCount === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Your order is empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Use the plus / minus buttons on any chicken cut to add weights to your order.
              </p>
            </div>
          ) : (
            <>
              {/* Selected Items List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                {Object.entries(quantities)
                  .filter(([_, qty]) => qty > 0)
                  .map(([prodId, qty]) => {
                    const prod = products.find((p) => p.id === prodId);
                    if (!prod) return null;
                    const customPrice = currentShop.custom_rates?.[prodId];
                    const rate = customPrice !== undefined ? customPrice : prod.current_rate;
                    const subtotal = qty * rate;

                    return (
                      <div key={prodId} className="pt-2.5 first:pt-0 flex items-start justify-between text-xs">
                        <div className="flex-1 pr-2">
                          <span className="font-bold text-textPrimary block">{prod.name}</span>
                          <span className="text-[11px] text-slate-400">
                            {formatWeight(qty)} × {formatINR(rate, false)}
                          </span>
                        </div>
                        <span className="font-extrabold text-textPrimary tabular-nums">
                          {formatINR(subtotal)}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Total Calculation Card */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Selected Products</span>
                  <span className="font-semibold text-textPrimary">{itemsCount} cuts</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Order Weight</span>
                  <span className="font-bold text-textPrimary text-sm tabular-nums">
                    {formatWeight(totalKg)}
                  </span>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-textPrimary block">Estimated Amount</span>
                    <span className="text-[10px] text-slate-400">Final bill based on scale weight</span>
                  </div>
                  <span className="text-2xl font-black text-brand tabular-nums">
                    {formatINR(estimatedAmount)}
                  </span>
                </div>
              </div>

              {/* Primary Review & Place Order Button */}
              <button
                type="button"
                onClick={() => onReviewOrder(quantities)}
                className="w-full h-12 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition-all touch-manipulation"
              >
                <span>{t.reviewOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Outstanding Balance Alert */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1 text-slate-600">
            <div className="flex items-center justify-between font-semibold">
              <span>Account Outstanding:</span>
              <span className="text-brand tabular-nums font-bold">
                {formatINR(currentShop.outstanding_balance)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Credit Limit:</span>
              <span className="tabular-nums">{formatINR(currentShop.credit_limit)}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/* MOBILE STICKY BOTTOM BAR (visible on screens < lg)             */}
      {/* ============================================================== */}
      {itemsCount > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 z-30 bg-white/95 backdrop-blur-md border-t border-border shadow-2xl">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-textSecondary flex items-center gap-1.5">
                <span className="font-semibold text-textPrimary">{itemsCount} items</span>
                <span>•</span>
                <span className="font-bold text-textPrimary tabular-nums">
                  {formatWeight(totalKg)}
                </span>
              </div>
              <div className="text-lg font-black text-textPrimary tabular-nums leading-tight">
                {formatINR(estimatedAmount)}
                <span className="text-[10px] text-textSecondary font-normal ml-1">(Est.)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onReviewOrder(quantities)}
              className="h-12 px-5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-dark text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-colors touch-manipulation"
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
