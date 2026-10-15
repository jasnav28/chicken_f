import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR, formatWeight } from '../../lib/formatters';
import { CheckCircle2, ArrowRight, ShoppingBag, FileText } from 'lucide-react';

interface OrderPlacedScreenProps {
  orderId: string;
  onViewOrders: () => void;
  onNewOrder: () => void;
}

export const OrderPlacedScreen: React.FC<OrderPlacedScreenProps> = ({
  orderId,
  onViewOrders,
  onNewOrder,
}) => {
  const { orders, t } = useApp();
  const order = orders.find((o) => o.id === orderId);

  if (!order) return null;

  return (
    <div className="p-6 max-w-md mx-auto text-center py-12">
      {/* Green Check Circle */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <h1 className="text-2xl font-bold text-textPrimary">{t.orderPlaced}</h1>
      <p className="text-sm text-textSecondary mt-1">
        Distributor has received your order and is scheduling dispatch.
      </p>

      {/* Order Summary Card */}
      <div className="my-6 p-4 rounded-card border border-border bg-surface text-left space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <span className="text-xs text-textSecondary block">Order Number</span>
            <span className="font-bold text-textPrimary text-base">{order.order_number}</span>
          </div>
          <StatusBadge status={order.status} size="md" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-textSecondary block">Delivery Date</span>
            <span className="font-semibold text-textPrimary">{order.delivery_date}</span>
          </div>
          <div>
            <span className="text-textSecondary block">Delivery Slot</span>
            <span className="font-semibold text-textPrimary">{order.delivery_slot}</span>
          </div>
          <div>
            <span className="text-textSecondary block">Total Ordered</span>
            <span className="font-semibold text-textPrimary tabular-nums">
              {formatWeight(order.total_ordered_qty)}
            </span>
          </div>
          <div>
            <span className="text-textSecondary block">Estimated Amount</span>
            <span className="font-semibold text-brand tabular-nums">
              {formatINR(order.estimated_amount)}
            </span>
          </div>
        </div>

        {order.notes && (
          <div className="pt-2 border-t border-border text-xs text-textSecondary">
            <span className="font-semibold text-textPrimary">Note: </span>
            {order.notes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={onViewOrders}
          className="w-full h-12 rounded-btn bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors touch-manipulation"
        >
          <FileText className="w-4 h-4" />
          <span>Track in Orders List</span>
        </button>

        <button
          type="button"
          onClick={onNewOrder}
          className="w-full h-12 rounded-btn bg-surface hover:bg-slate-100 text-textPrimary font-semibold text-sm border border-border flex items-center justify-center gap-2 transition-colors touch-manipulation"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Place Another Order</span>
        </button>
      </div>
    </div>
  );
};
