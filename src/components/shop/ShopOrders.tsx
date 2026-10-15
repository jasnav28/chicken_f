import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR, formatWeight, formatDateTimeIST } from '../../lib/formatters';
import { Order, OrderStatus } from '../../types';
import { downloadInvoicePDF } from '../../lib/invoicePdf';
import { whatsAppService } from '../../lib/whatsapp';
import {
  FileText,
  Download,
  Share2,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  Calendar,
} from 'lucide-react';

export const ShopOrders: React.FC = () => {
  const { currentShop, orders, settings, t } = useApp();

  const [filter, setFilter] = useState<'All' | 'Active' | 'Delivered' | 'Cancelled'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders for the active shop
  const shopOrders = orders.filter((o) => o.shop_id === currentShop.id);

  const filtered = shopOrders.filter((o) => {
    if (filter === 'Active') return ['Placed', 'Confirmed', 'Out for delivery'].includes(o.status);
    if (filter === 'Delivered') return o.status === 'Delivered';
    if (filter === 'Cancelled') return o.status === 'Cancelled';
    return true;
  });

  const getTimelineSteps = (status: OrderStatus) => {
    const steps: { name: OrderStatus; label: string; icon: React.ElementType }[] = [
      { name: 'Placed', label: 'Placed', icon: Clock },
      { name: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
      { name: 'Out for delivery', label: 'Out for Delivery', icon: Truck },
      { name: 'Delivered', label: 'Delivered', icon: PackageCheck },
    ];

    const statusOrder: OrderStatus[] = ['Placed', 'Confirmed', 'Out for delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, idx) => {
      const isCompleted = currentIndex >= idx;
      const isCurrent = currentIndex === idx;
      return {
        ...step,
        isCompleted,
        isCurrent,
      };
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">{t.orders}</h1>
          <p className="text-xs sm:text-sm text-textSecondary">{shopOrders.length} total orders recorded</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {(['All', 'Active', 'Delivered', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-white text-textPrimary shadow-sm'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List (Responsive Grid on Computer) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-card border border-border">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-textPrimary">No orders found</p>
            <p className="text-xs text-textSecondary mt-1">Place your daily chicken order to track here.</p>
          </div>
        ) : (
          filtered.map((order) => {
            const isDelivered = order.status === 'Delivered';
            const displayAmount = isDelivered && order.final_amount ? order.final_amount : order.estimated_amount;
            const displayWeight = isDelivered && order.total_delivered_qty ? order.total_delivered_qty : order.total_ordered_qty;

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="p-4 rounded-card border border-border bg-surface hover:border-slate-300 transition-all cursor-pointer shadow-subtle active:bg-slate-50 touch-manipulation"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-textPrimary">{order.order_number}</span>
                    <div className="flex items-center gap-2 text-xs text-textSecondary mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {order.delivery_date}
                      </span>
                      <span>•</span>
                      <span>{order.delivery_slot}</span>
                    </div>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                {/* Items Summary snippet */}
                <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between text-xs">
                  <div className="text-textSecondary truncate max-w-[220px]">
                    {order.items.map((i) => `${i.product_name} (${formatWeight(i.ordered_qty, i.unit)})`).join(', ')}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {/* Bottom line: Weight and Amount */}
                <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-xs">
                    <span className="text-textSecondary">{isDelivered ? 'Delivered: ' : 'Ordered: '}</span>
                    <span className="font-semibold text-textPrimary tabular-nums">
                      {formatWeight(displayWeight)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-brand tabular-nums">
                      {formatINR(displayAmount)}
                    </span>
                    {!isDelivered && (
                      <span className="text-[10px] text-textSecondary ml-1">(Est.)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface w-full max-w-lg rounded-t-2xl sm:rounded-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-textPrimary">{selectedOrder.order_number}</h3>
                  <StatusBadge status={selectedOrder.status} size="sm" />
                </div>
                <p className="text-xs text-textSecondary mt-0.5">
                  Placed {formatDateTimeIST(selectedOrder.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Order Status Timeline */}
              {selectedOrder.status !== 'Cancelled' && (
                <div className="p-3.5 rounded-card bg-slate-50 border border-border">
                  <span className="text-xs font-semibold text-textSecondary block mb-3">Order Progress</span>
                  <div className="grid grid-cols-4 gap-1 relative">
                    {getTimelineSteps(selectedOrder.status).map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.name} className="flex flex-col items-center text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              step.isCompleted
                                ? 'bg-brand text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-medium leading-tight ${
                              step.isCurrent
                                ? 'text-brand font-bold'
                                : step.isCompleted
                                ? 'text-textPrimary'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items Breakdown Table (Ordered vs Delivered) */}
              <div className="rounded-card border border-border overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-border text-xs font-semibold text-textSecondary grid grid-cols-12">
                  <span className="col-span-5">Product</span>
                  <span className="col-span-2 text-right">Rate</span>
                  <span className="col-span-2 text-right">Ordered</span>
                  <span className="col-span-3 text-right">Delivered</span>
                </div>
                <div className="divide-y divide-border">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 text-xs grid grid-cols-12 items-center">
                      <div className="col-span-5 font-semibold text-textPrimary leading-snug">
                        {item.product_name}
                      </div>
                      <div className="col-span-2 text-right text-textSecondary tabular-nums">
                        {formatINR(item.unit_rate, false)}
                      </div>
                      <div className="col-span-2 text-right text-textSecondary tabular-nums">
                        {formatWeight(item.ordered_qty, item.unit)}
                      </div>
                      <div className="col-span-3 text-right font-bold text-textPrimary tabular-nums">
                        {item.delivered_qty !== undefined ? (
                          <span className="text-brand">{formatWeight(item.delivered_qty, item.unit)}</span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="bg-slate-50 p-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-textSecondary block">Total Quantity</span>
                    <span className="text-xs font-semibold text-textPrimary tabular-nums">
                      {selectedOrder.total_delivered_qty !== undefined
                        ? `${formatWeight(selectedOrder.total_delivered_qty)} (Delivered)`
                        : `${formatWeight(selectedOrder.total_ordered_qty)} (Ordered)`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-textSecondary block">
                      {selectedOrder.status === 'Delivered' ? 'Final Billed Total' : 'Estimated Total'}
                    </span>
                    <span className="text-lg font-bold text-brand tabular-nums">
                      {formatINR(selectedOrder.final_amount ?? selectedOrder.estimated_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-3 rounded-card bg-surface border border-border space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Delivery Date:</span>
                  <span className="font-semibold text-textPrimary">{selectedOrder.delivery_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Delivery Slot:</span>
                  <span className="font-semibold text-textPrimary">{selectedOrder.delivery_slot}</span>
                </div>
                {selectedOrder.invoice_number && (
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Invoice Number:</span>
                    <span className="font-semibold text-brand">{selectedOrder.invoice_number}</span>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="pt-1.5 border-t border-border">
                    <span className="text-textSecondary block">Order Notes:</span>
                    <span className="text-textPrimary">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between gap-2">
              {/* WhatsApp Support Query */}
              <a
                href={whatsAppService.getDeepLink(
                  settings.phone,
                  `Hello Distributor, regarding my order #${selectedOrder.order_number} (${selectedOrder.delivery_date}, ${selectedOrder.delivery_slot}): `
                )}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-4 rounded-btn border border-border bg-surface hover:bg-slate-100 text-textPrimary text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Query</span>
              </a>

              {/* Download Invoice PDF */}
              <button
                type="button"
                onClick={() => downloadInvoicePDF(selectedOrder, settings, currentShop.outstanding_balance)}
                className="flex-1 h-11 px-4 rounded-btn bg-brand hover:bg-brand-hover active:bg-brand-dark text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
