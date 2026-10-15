import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR, formatWeight, formatDateTimeIST, getTodayDate } from '../../lib/formatters';
import { Order, OrderStatus } from '../../types';
import { downloadInvoicePDF } from '../../lib/invoicePdf';
import { whatsAppService } from '../../lib/whatsapp';
import {
  Search,
  Filter,
  CheckCircle2,
  X,
  Download,
  Share2,
  Calendar,
  Save,
  CheckSquare,
  Square,
  AlertTriangle,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface AdminOrdersProps {
  initialSelectedOrderId?: string | null;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ initialSelectedOrderId }) => {
  const {
    orders,
    shops,
    updateOrderStatus,
    updateOrderDeliveredWeights,
    bulkConfirmOrders,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All'); // 'All', 'Today', 'Tomorrow'
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(() => {
    if (initialSelectedOrderId) {
      return orders.find((o) => o.id === initialSelectedOrderId) || null;
    }
    return null;
  });

  // Delivered weights state in drawer
  const [deliveredWeights, setDeliveredWeights] = useState<Record<string, number>>({});

  // Sync drawer order on list updates
  React.useEffect(() => {
    if (drawerOrder) {
      const refreshed = orders.find((o) => o.id === drawerOrder.id);
      if (refreshed) {
        setDrawerOrder(refreshed);
      }
    }
  }, [orders]);

  // Open drawer helper
  const handleOpenDrawer = (order: Order) => {
    setDrawerOrder(order);
    const initialWeights: Record<string, number> = {};
    order.items.forEach((item) => {
      initialWeights[item.id] = item.delivered_qty ?? item.ordered_qty;
    });
    setDeliveredWeights(initialWeights);
  };

  // Distinct areas
  const areas = Array.from(new Set(shops.map((s) => s.area_route)));

  // Filter orders
  const today = getTodayDate();
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shop_phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesArea = areaFilter === 'All' || o.shop_area === areaFilter;

    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = o.delivery_date === today;
    }

    return matchesSearch && matchesStatus && matchesArea && matchesDate;
  });

  // Multi-select helpers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const selectable = filteredOrders.filter((o) => o.status === 'Placed').map((o) => o.id);
    if (selectedIds.length === selectable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable);
    }
  };

  const handleBulkConfirm = () => {
    if (selectedIds.length === 0) return;
    bulkConfirmOrders(selectedIds);
    setSelectedIds([]);
  };

  // Drawer Weight Change
  const handleWeightInputChange = (itemId: string, val: string) => {
    const parsed = parseFloat(val);
    setDeliveredWeights((prev) => ({
      ...prev,
      [itemId]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  // Save weights & update status in drawer
  const handleSaveDeliveredWeights = () => {
    if (!drawerOrder) return;
    const payload = Object.entries(deliveredWeights).map(([itemId, deliveredQty]) => ({
      itemId,
      deliveredQty,
    }));
    updateOrderDeliveredWeights(drawerOrder.id, payload);
    alert('Delivered weights updated and final amounts recalculated.');
  };

  const handleDrawerStatusChange = (newStatus: OrderStatus) => {
    if (!drawerOrder) return;
    const payload = Object.entries(deliveredWeights).map(([itemId, deliveredQty]) => ({
      itemId,
      deliveredQty,
    }));
    updateOrderStatus(drawerOrder.id, newStatus, payload);
  };

  const getShopOutstanding = (shopId: string) => {
    const matched = shops.find((s) => s.id === shopId);
    return matched ? matched.outstanding_balance : 0;
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Search, Filters, Bulk Confirm */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-textSecondary absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by shop name, order #, or phone..."
              className="w-full h-11 pl-9 pr-3 rounded-btn border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          {/* Bulk Confirm Button */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkConfirm}
              className="h-11 px-4 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Bulk Confirm ({selectedIds.length})</span>
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border text-xs">
          <span className="text-textSecondary font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-btn border border-border bg-surface text-xs font-medium text-textPrimary"
          >
            <option value="All">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Out for delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Area/Route Filter */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="h-9 px-2.5 rounded-btn border border-border bg-surface text-xs font-medium text-textPrimary"
          >
            <option value="All">All Areas/Routes</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 px-2.5 rounded-btn border border-border bg-surface text-xs font-medium text-textPrimary"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today's Delivery</option>
          </select>

          <span className="text-slate-400 ml-auto">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {/* Orders Table (Desktop) / Cards (Mobile) */}
      <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
        {/* Bulk select bar */}
        <div className="p-3 bg-slate-50 border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-textSecondary hover:text-textPrimary flex items-center gap-1.5 font-medium"
            >
              {selectedIds.length > 0 && selectedIds.length === filteredOrders.filter((o) => o.status === 'Placed').length ? (
                <CheckSquare className="w-4 h-4 text-brand" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select Placed Orders</span>
            </button>
          </div>
          <span className="text-textSecondary">Click row to open order drawer</span>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                <th className="p-3 w-8"></th>
                <th className="p-3">Order #</th>
                <th className="p-3">Shop Name & Route</th>
                <th className="p-3">Delivery Date & Slot</th>
                <th className="p-3 text-right">Ordered Qty</th>
                <th className="p-3 text-right">Delivered Qty</th>
                <th className="p-3 text-right">Amount (₹)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-textSecondary">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const isDelivered = order.status === 'Delivered';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleOpenDrawer(order)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3" onClick={(e) => handleToggleSelect(order.id, e)}>
                        {order.status === 'Placed' ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                          />
                        ) : null}
                      </td>
                      <td className="p-3 font-semibold text-textPrimary whitespace-nowrap">
                        {order.order_number}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-textPrimary">{order.shop_name}</div>
                        <div className="text-[11px] text-textSecondary">{order.shop_area}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-medium text-textPrimary">{order.delivery_date}</div>
                        <div className="text-[11px] text-textSecondary">{order.delivery_slot}</div>
                      </td>
                      <td className="p-3 text-right font-medium text-textPrimary tabular-nums">
                        {formatWeight(order.total_ordered_qty)}
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums">
                        {order.total_delivered_qty !== undefined ? (
                          <span className="text-brand">{formatWeight(order.total_delivered_qty)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-textPrimary tabular-nums">
                        {formatINR(order.final_amount ?? order.estimated_amount)}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {drawerOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOrder(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-xl bg-surface shadow-2xl flex flex-col border-l border-border">
              {/* Drawer Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-textPrimary">{drawerOrder.order_number}</h3>
                    <StatusBadge status={drawerOrder.status} size="sm" />
                  </div>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {drawerOrder.shop_name} • {drawerOrder.shop_phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOrder(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {/* Status Progression Controls */}
                <div className="p-3.5 rounded-card bg-slate-50 border border-border">
                  <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                    Change Order Status
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      disabled={drawerOrder.status === 'Confirmed'}
                      onClick={() => handleDrawerStatusChange('Confirmed')}
                      className={`h-9 px-2.5 rounded-btn text-xs font-semibold border transition-all ${
                        drawerOrder.status === 'Confirmed'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-surface text-blue-700 border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      Confirm
                    </button>

                    <button
                      type="button"
                      disabled={drawerOrder.status === 'Out for delivery'}
                      onClick={() => handleDrawerStatusChange('Out for delivery')}
                      className={`h-9 px-2.5 rounded-btn text-xs font-semibold border transition-all ${
                        drawerOrder.status === 'Out for delivery'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-surface text-purple-700 border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      Out for Delivery
                    </button>

                    <button
                      type="button"
                      disabled={drawerOrder.status === 'Delivered'}
                      onClick={() => handleDrawerStatusChange('Delivered')}
                      className={`h-9 px-2.5 rounded-btn text-xs font-semibold border transition-all ${
                        drawerOrder.status === 'Delivered'
                          ? 'bg-brand text-white border-brand'
                          : 'bg-surface text-brand border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      Mark Delivered
                    </button>

                    <button
                      type="button"
                      disabled={drawerOrder.status === 'Cancelled'}
                      onClick={() => handleDrawerStatusChange('Cancelled')}
                      className={`h-9 px-2.5 rounded-btn text-xs font-semibold border transition-all ${
                        drawerOrder.status === 'Cancelled'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-surface text-red-700 border-red-200 hover:bg-red-50'
                      }`}
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>

                {/* Delivered Weights Input Table */}
                <div className="rounded-card border border-border overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-textPrimary block">Line Items & Delivered Weights</span>
                      <span className="text-[11px] text-textSecondary">
                        Enter exact scale weight per line item. Final invoice calculates automatically.
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-border text-xs">
                    {drawerOrder.items.map((item) => {
                      const weightVal =
                        deliveredWeights[item.id] !== undefined
                          ? deliveredWeights[item.id]
                          : item.delivered_qty ?? item.ordered_qty;
                      const lineCalc = weightVal * item.unit_rate;

                      return (
                        <div key={item.id} className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-textPrimary text-sm">{item.product_name}</h4>
                              <span className="text-textSecondary">
                                Ordered: {formatWeight(item.ordered_qty, item.unit)} @ {formatINR(item.unit_rate, false)}/{item.unit}
                              </span>
                            </div>
                            <span className="font-bold text-brand text-sm tabular-nums">
                              {formatINR(lineCalc)}
                            </span>
                          </div>

                          {/* Delivered Weight Input */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-textSecondary text-[11px]">Delivered Weight ({item.unit}):</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={weightVal}
                              onChange={(e) => handleWeightInputChange(item.id, e.target.value)}
                              className="w-28 h-9 px-2.5 rounded-btn border border-border bg-surface text-xs font-bold text-textPrimary tabular-nums focus:ring-2 focus:ring-brand focus:outline-none"
                            />
                            <span className="text-[11px] text-slate-400">
                              (Diff: {(weightVal - item.ordered_qty).toFixed(1)} {item.unit})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weight Save Button */}
                  <div className="p-3 bg-slate-50 border-t border-border flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDeliveredWeights}
                      className="px-3.5 py-2 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Recalculate & Save Weights</span>
                    </button>
                  </div>
                </div>

                {/* Delivery & Shop Address */}
                <div className="p-3 rounded-card bg-surface border border-border text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Shop Address:</span>
                    <span className="font-medium text-textPrimary text-right max-w-xs">{drawerOrder.shop_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Area / Route:</span>
                    <span className="font-semibold text-brand">{drawerOrder.shop_area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Delivery Slot:</span>
                    <span className="font-semibold text-textPrimary">{drawerOrder.delivery_slot} ({drawerOrder.delivery_date})</span>
                  </div>
                  {drawerOrder.invoice_number && (
                    <div className="flex justify-between pt-1 border-t border-border">
                      <span className="text-textSecondary">Invoice Number:</span>
                      <span className="font-mono font-bold text-brand">{drawerOrder.invoice_number}</span>
                    </div>
                  )}
                  {drawerOrder.notes && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-textSecondary block font-medium">Shop Notes:</span>
                      <p className="text-textPrimary mt-0.5">{drawerOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between gap-2">
                {/* Send WhatsApp Dispatch/Invoice Update */}
                <a
                  href={whatsAppService.getDeepLink(
                    drawerOrder.shop_phone,
                    drawerOrder.status === 'Delivered'
                      ? whatsAppService.createInvoiceMessage(drawerOrder, settings, getShopOutstanding(drawerOrder.shop_id))
                      : whatsAppService.createConfirmationMessage(drawerOrder, settings)
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-4 rounded-btn border border-border bg-surface hover:bg-slate-100 text-xs font-semibold text-textPrimary flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Shop</span>
                </a>

                {/* Download PDF Invoice */}
                <button
                  type="button"
                  onClick={() =>
                    downloadInvoicePDF(drawerOrder, settings, getShopOutstanding(drawerOrder.shop_id))
                  }
                  className="flex-1 h-11 px-4 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Invoice PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
