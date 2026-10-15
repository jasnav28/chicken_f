import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatWeight, getTodayDate, getTomorrowDate } from '../../lib/formatters';
import { DeliverySlot, Order } from '../../types';
import { downloadDeliverySheetPDF } from '../../lib/deliverySheetPdf';
import {
  Printer,
  Download,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';

export const AdminDeliverySheet: React.FC = () => {
  const { orders, settings } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>('Morning');
  const [copiedRoute, setCopiedRoute] = useState<string | null>(null);

  // Filter orders for the selected date and slot (excluding Cancelled)
  const deliveryOrders = orders.filter(
    (o) =>
      o.delivery_date === selectedDate &&
      o.delivery_slot === selectedSlot &&
      o.status !== 'Cancelled'
  );

  // Group orders by area/route
  const routeGroups = deliveryOrders.reduce<Record<string, Order[]>>((acc, order) => {
    const route = order.shop_area || 'General Route';
    if (!acc[route]) acc[route] = [];
    acc[route].push(order);
    return acc;
  }, {});

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadDeliverySheetPDF(selectedDate, selectedSlot, deliveryOrders, settings);
  };

  const handleCopyRouteSummary = (routeName: string, routeOrders: Order[]) => {
    const text = `🚚 *DELIVERY DISPATCH - ${routeName.toUpperCase()}*
Date: ${selectedDate} | Slot: ${selectedSlot}
Drops: ${routeOrders.length} shops
-----------------------------------
${routeOrders
  .map(
    (o, i) =>
      `${i + 1}. *${o.shop_name}* (${o.shop_phone})\n   Addr: ${o.shop_address}\n   Items: ${o.items
        .map((it) => `${it.product_name} (${it.delivered_qty ?? it.ordered_qty} ${it.unit})`)
        .join(', ')}\n   Collect: ${formatINR(o.final_amount ?? o.estimated_amount)}`
  )
  .join('\n\n')}
-----------------------------------
Total Drops: ${routeOrders.length}`;

    navigator.clipboard.writeText(text);
    setCopiedRoute(routeName);
    setTimeout(() => setCopiedRoute(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar (hidden on print) */}
      <div className="no-print bg-surface p-4 rounded-card border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-textPrimary">Delivery & Dispatch Sheet</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Route-wise loading slips and driver cash collection lists
          </p>
        </div>

        {/* Date & Slot Pickers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-border rounded-btn px-2.5 py-1.5">
            <Calendar className="w-4 h-4 text-brand" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-textPrimary focus:outline-none"
            />
          </div>

          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value as DeliverySlot)}
            className="h-9 px-3 rounded-btn border border-border bg-slate-50 text-xs font-semibold text-textPrimary focus:outline-none"
          >
            <option value="Morning">Morning (6-9 AM)</option>
            <option value="Afternoon">Afternoon (1-3 PM)</option>
            <option value="Evening">Evening (6-8 PM)</option>
          </select>

          {/* Print & PDF Buttons */}
          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3.5 rounded-btn border border-border bg-surface hover:bg-slate-100 text-xs font-semibold text-textPrimary flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="h-9 px-3.5 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Body */}
      {Object.keys(routeGroups).length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-card border border-border">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-base text-textPrimary">No scheduled deliveries</h3>
          <p className="text-xs text-textSecondary mt-1">
            No active orders found for {selectedDate} ({selectedSlot}).
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(routeGroups).map(([routeName, routeOrders]) => {
            const totalRouteWeight = routeOrders.reduce(
              (sum, o) => sum + (o.total_delivered_qty ?? o.total_ordered_qty),
              0
            );
            const totalRouteCollect = routeOrders.reduce(
              (sum, o) => sum + (o.final_amount ?? o.estimated_amount),
              0
            );

            return (
              <div
                key={routeName}
                className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle print-page-break"
              >
                {/* Route Header */}
                <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Route Delivery Batch
                    </span>
                    <h2 className="text-base font-bold">{routeName}</h2>
                    <span className="text-xs text-slate-300">
                      {routeOrders.length} Drops • {formatWeight(totalRouteWeight)} • Collect:{' '}
                      {formatINR(totalRouteCollect, false)}
                    </span>
                  </div>

                  {/* Share Route WhatsApp snippet button */}
                  <div className="no-print flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyRouteSummary(routeName, routeOrders)}
                      className="px-3 py-1.5 rounded-btn bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      {copiedRoute === routeName ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Route Summary</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy for Driver WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Route Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Shop & Contact</th>
                        <th className="p-3">Delivery Address</th>
                        <th className="p-3">Order Items</th>
                        <th className="p-3 text-right">Weight</th>
                        <th className="p-3 text-right">To Collect (₹)</th>
                        <th className="p-3 w-28 text-center">Receiver Sign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {routeOrders.map((order, idx) => {
                        const totalWeight = order.total_delivered_qty ?? order.total_ordered_qty;
                        const collectAmount = order.final_amount ?? order.estimated_amount;

                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50">
                            <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-3">
                              <span className="font-bold text-textPrimary text-sm block">
                                {order.shop_name}
                              </span>
                              <span className="text-[11px] text-textSecondary font-mono">
                                Ph: {order.shop_phone}
                              </span>
                            </td>
                            <td className="p-3 text-textSecondary max-w-xs">{order.shop_address}</td>
                            <td className="p-3">
                              <div className="space-y-0.5">
                                {order.items.map((i) => (
                                  <div key={i.id} className="text-[11px] text-textPrimary">
                                    • {i.product_name}:{' '}
                                    <strong className="font-semibold">
                                      {formatWeight(i.delivered_qty ?? i.ordered_qty, i.unit)}
                                    </strong>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold text-textPrimary tabular-nums whitespace-nowrap">
                              {formatWeight(totalWeight)}
                            </td>
                            <td className="p-3 text-right font-bold text-brand tabular-nums whitespace-nowrap">
                              {formatINR(collectAmount, false)}
                            </td>
                            <td className="p-3 text-center border-l border-dashed border-slate-200">
                              <div className="h-9 border-b border-slate-300"></div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
