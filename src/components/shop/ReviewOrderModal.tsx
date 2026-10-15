import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatWeight, getTomorrowDate } from '../../lib/formatters';
import { DeliverySlot } from '../../types';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, number>;
  onOrderSuccess: (orderId: string) => void;
}

export const ReviewOrderModal: React.FC<ReviewOrderModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
}) => {
  const { currentShop, products, placeOrder, settings, t } = useApp();

  const [deliveryDate, setDeliveryDate] = useState(getTomorrowDate());
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot>('Morning');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Build items list
  const selectedItems = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([prodId, qty]) => {
      const product = products.find((p) => p.id === prodId)!;
      const customPrice = currentShop.custom_rates?.[prodId];
      const rate = customPrice !== undefined ? customPrice : product.current_rate;
      return {
        product,
        qty,
        rate,
        total: qty * rate,
      };
    });

  const totalQty = selectedItems.reduce((sum, item) => sum + item.qty, 0);
  const estimatedTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);

  // Credit limit calculation
  const projectBalance = currentShop.outstanding_balance + estimatedTotal;
  const isExceedingCredit = projectBalance > currentShop.credit_limit;

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      const itemsPayload = selectedItems.map((i) => ({
        productId: i.product.id,
        orderedQty: i.qty,
      }));

      const newOrder = await placeOrder(itemsPayload, deliveryDate, deliverySlot, notes);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#15803D', '#22C55E', '#F59E0B'],
      });

      onOrderSuccess(newOrder.id);
    } catch (err) {
      alert('Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface w-full max-w-lg rounded-t-2xl sm:rounded-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-textPrimary">{t.reviewOrder}</h2>
            <p className="text-xs text-textSecondary">{currentShop.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Items Summary Table */}
          <div className="rounded-card border border-border overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-border text-xs font-semibold text-textSecondary flex justify-between">
              <span>Ordered Product</span>
              <span>Weight & Price</span>
            </div>
            <div className="divide-y divide-border">
              {selectedItems.map((item) => (
                <div key={item.product.id} className="p-3 flex items-center justify-between text-sm">
                  <div>
                    <h4 className="font-semibold text-textPrimary leading-snug">{item.product.name}</h4>
                    <span className="text-xs text-textSecondary">
                      @ {formatINR(item.rate, false)} / {item.product.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-textPrimary tabular-nums block">
                      {formatWeight(item.qty, item.product.unit)}
                    </span>
                    <span className="text-xs text-textSecondary tabular-nums">
                      {formatINR(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="bg-slate-50 p-3 border-t border-border flex justify-between items-center">
              <div>
                <span className="text-xs text-textSecondary block">Total Weight</span>
                <span className="font-bold text-textPrimary tabular-nums">{formatWeight(totalQty)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-textSecondary block">Estimated Amount</span>
                <span className="text-lg font-bold text-brand tabular-nums">{formatINR(estimatedTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>{t.deliveryDate}</span>
            </label>
            <input
              type="date"
              value={deliveryDate}
              min={getTomorrowDate()}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full h-12 px-3 rounded-btn border border-border bg-surface text-textPrimary text-sm font-medium focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          {/* Delivery Slot Selection */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>{t.deliverySlot}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Morning', 'Afternoon', 'Evening'] as DeliverySlot[]).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setDeliverySlot(slot)}
                  className={`h-11 rounded-btn text-xs font-semibold border transition-all flex flex-col items-center justify-center ${
                    deliverySlot === slot
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-surface text-textPrimary border-border hover:bg-slate-50'
                  }`}
                >
                  <span>{slot}</span>
                  <span className="text-[10px] opacity-75">
                    {slot === 'Morning' ? '6-9 AM' : slot === 'Afternoon' ? '1-3 PM' : '6-8 PM'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Cutting instructions */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary mb-1">Special Cutting / Delivery Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 12-piece cut, deliver skinless separately, need before 7am"
              className="w-full p-2.5 rounded-btn border border-border bg-surface text-textPrimary text-xs focus:ring-2 focus:ring-brand focus:outline-none resize-none"
            />
          </div>

          {/* Credit Limit Alert if Exceeding */}
          {isExceedingCredit && (
            <div className="p-3 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Credit Limit Warning</span>
                Your outstanding balance ({formatINR(currentShop.outstanding_balance)}) plus this order
                estimated at {formatINR(estimatedTotal)} will total {formatINR(projectBalance)}, exceeding
                your credit limit of {formatINR(currentShop.credit_limit)}.
              </div>
            </div>
          )}

          {/* Important Billing Disclaimer */}
          <div className="p-3 rounded-card bg-slate-50 border border-border text-xs text-textSecondary flex gap-2">
            <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-textPrimary font-semibold">Important: </strong>
              {t.estimatedNote}
            </p>
          </div>
        </div>

        {/* Footer with Place Order Button */}
        <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-textSecondary block">Est. Total</span>
            <span className="text-xl font-bold text-brand tabular-nums">{formatINR(estimatedTotal)}</span>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || selectedItems.length === 0}
            className="flex-1 max-w-[240px] h-12 rounded-btn bg-brand hover:bg-brand-hover active:bg-brand-dark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 touch-manipulation"
          >
            {isSubmitting ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.placeOrder}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
