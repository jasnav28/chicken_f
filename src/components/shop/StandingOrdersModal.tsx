import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuantityStepper } from '../common/QuantityStepper';
import { DeliverySlot } from '../../types';
import { X, Check, Power, Layers } from 'lucide-react';

interface StandingOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandingOrdersModal: React.FC<StandingOrdersModalProps> = ({ isOpen, onClose }) => {
  const { currentShop, products, standingOrders, saveStandingOrder, t } = useApp();

  // Find existing standing order for this shop
  const currentStanding = standingOrders.find((s) => s.shop_id === currentShop.id);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (currentStanding) {
      currentStanding.items.forEach((item) => {
        map[item.product_id] = item.qty;
      });
    }
    return map;
  });

  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot>(
    currentStanding?.delivery_slot || 'Morning'
  );
  const [isActive, setIsActive] = useState<boolean>(currentStanding?.is_active ?? true);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    currentStanding?.days_of_week || [0, 1, 2, 3, 4, 5, 6]
  );
  const [notes, setNotes] = useState(currentStanding?.notes || '');

  if (!isOpen) return null;

  const daysList = [
    { day: 1, label: 'Mon' },
    { day: 2, label: 'Tue' },
    { day: 3, label: 'Wed' },
    { day: 4, label: 'Thu' },
    { day: 5, label: 'Fri' },
    { day: 6, label: 'Sat' },
    { day: 0, label: 'Sun' },
  ];

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => ({ product_id: productId, qty }));

    saveStandingOrder(currentShop.id, items, deliverySlot, selectedDays, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface w-full max-w-lg rounded-t-2xl sm:rounded-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand" />
            <div>
              <h2 className="text-base font-bold text-textPrimary">{t.standingOrders}</h2>
              <p className="text-xs text-textSecondary">Automatic recurring daily delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Active Status Toggle */}
          <div className="p-3 rounded-card bg-slate-50 border border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-textPrimary block">Standing Order Status</span>
              <span className="text-[11px] text-textSecondary">
                {isActive ? 'Order auto-generates on selected days' : 'Paused - no orders generated'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-btn text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-brand text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isActive ? 'Active' : 'Paused'}</span>
            </button>
          </div>

          {/* Days of Week Selector */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary mb-1.5">
              Repeat Days
            </label>
            <div className="grid grid-cols-7 gap-1">
              {daysList.map((d) => {
                const isSelected = selectedDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleDay(d.day)}
                    className={`h-9 rounded-btn text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand text-white shadow-sm'
                        : 'bg-slate-100 text-textSecondary hover:bg-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Slot */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary mb-1.5">
              Preferred Delivery Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Morning', 'Afternoon', 'Evening'] as DeliverySlot[]).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setDeliverySlot(slot)}
                  className={`h-10 rounded-btn text-xs font-semibold border transition-all ${
                    deliverySlot === slot
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-surface text-textPrimary border-border hover:bg-slate-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Products & Recurring Quantities */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary mb-1.5">
              Items to Auto-order
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {products
                .filter((p) => p.is_active)
                .map((product) => {
                  const qty = quantities[product.id] || 0;
                  return (
                    <div
                      key={product.id}
                      className="p-2.5 rounded-card border border-border bg-surface flex items-center justify-between gap-2"
                    >
                      <div className="text-xs">
                        <span className="font-semibold text-textPrimary block">{product.name}</span>
                        <span className="text-textSecondary">{product.unit}</span>
                      </div>
                      <QuantityStepper
                        value={qty}
                        onChange={(val) =>
                          setQuantities((prev) => ({ ...prev, [product.id]: val }))
                        }
                        step={product.step_qty}
                        unit={product.unit}
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-textPrimary mb-1">
              Standing Order Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Regular whole bird cut, morning load"
              className="w-full h-11 px-3 rounded-btn border border-border bg-surface text-xs text-textPrimary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 rounded-btn border border-border bg-surface hover:bg-slate-100 text-xs font-semibold text-textSecondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-11 px-6 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Save Standing Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
