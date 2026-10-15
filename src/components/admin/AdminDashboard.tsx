import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatWeight, getTodayDate, formatDateIST } from '../../lib/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShoppingBag,
  Scale,
  Truck,
  IndianRupee,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (screen: string) => void;
  onSelectOrder: (orderId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onSelectOrder }) => {
  const { orders, shops, products, standingOrders, generateOrdersFromStanding } = useApp();

  const today = getTodayDate();
  const todayOrders = orders.filter((o) => o.order_date === today || o.delivery_date === today);
  const pendingDeliveries = orders.filter((o) => ['Confirmed', 'Out for delivery'].includes(o.status));

  // Compute Total kg to procure per product for upcoming deliveries
  const procurementMap: Record<string, { product_name: string; unit: string; total_qty: number }> = {};
  let totalProcurementKg = 0;

  orders
    .filter((o) => ['Placed', 'Confirmed'].includes(o.status))
    .forEach((ord) => {
      ord.items.forEach((item) => {
        if (!procurementMap[item.product_id]) {
          procurementMap[item.product_id] = {
            product_name: item.product_name,
            unit: item.unit,
            total_qty: 0,
          };
        }
        procurementMap[item.product_id].total_qty += item.ordered_qty;
        totalProcurementKg += item.ordered_qty;
      });
    });

  // Outstanding payments across all shops
  const totalOutstanding = shops.reduce((sum, s) => sum + s.outstanding_balance, 0);

  // Over-credit-limit shops
  const creditAlertShops = shops.filter((s) => s.outstanding_balance >= s.credit_limit * 0.85);

  // 7-day sales calculation from real orders
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const shortDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    const dayOrders = orders.filter(
      (o) => (o.order_date === dateStr || o.delivery_date === dateStr) && o.status !== 'Cancelled'
    );
    const daySales = dayOrders.reduce((sum, o) => sum + (o.final_amount ?? o.estimated_amount), 0);
    const dayKg = dayOrders.reduce((sum, o) => sum + (o.total_delivered_qty ?? o.total_ordered_qty), 0);

    return {
      day: dayLabel,
      date: shortDate,
      sales: daySales,
      kg: dayKg,
    };
  });
  const maxSales = Math.max(1, ...last7Days.map((d) => d.sales));

  const handleGenerateStanding = () => {
    const count = generateOrdersFromStanding();
    alert(`Generated ${count} recurring standing order(s) for tomorrow.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Standing Auto-Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Distributor Dashboard</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Realtime operations, procurement and delivery overview
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateStanding}
          className="self-start sm:self-auto px-4 py-2 rounded-btn bg-emerald-50 hover:bg-emerald-100 text-brand border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Run Daily Standing Orders ({standingOrders.filter((s) => s.is_active).length})</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 rounded-card bg-surface border border-border hover:border-slate-300 transition-all cursor-pointer shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
              Today's Orders
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-brand flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-textPrimary tabular-nums mt-2">
            {todayOrders.length}
          </div>
          <div className="text-xs text-textSecondary mt-1 flex items-center gap-1">
            <span className="text-brand font-semibold">{orders.filter((o) => o.status === 'Placed').length}</span>
            <span>new orders need confirmation</span>
          </div>
        </div>

        {/* Card 2: Total Kg to Procure */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 rounded-card bg-surface border border-border hover:border-slate-300 transition-all cursor-pointer shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
              Kg to Procure
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-textPrimary tabular-nums mt-2">
            {formatWeight(totalProcurementKg)}
          </div>
          <div className="text-xs text-textSecondary mt-1">
            Across {Object.keys(procurementMap).length} chicken cuts
          </div>
        </div>

        {/* Card 3: Pending Deliveries */}
        <div
          onClick={() => onNavigate('deliveries')}
          className="p-4 rounded-card bg-surface border border-border hover:border-slate-300 transition-all cursor-pointer shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
              Pending Deliveries
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-textPrimary tabular-nums mt-2">
            {pendingDeliveries.length}
          </div>
          <div className="text-xs text-textSecondary mt-1">
            Ready on active delivery routes
          </div>
        </div>

        {/* Card 4: Total Outstanding Payments */}
        <div
          onClick={() => onNavigate('payments')}
          className="p-4 rounded-card bg-surface border border-border hover:border-slate-300 transition-all cursor-pointer shadow-subtle"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
              Total Outstanding
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-800 tabular-nums mt-2">
            {formatINR(totalOutstanding, false)}
          </div>
          <div className="text-xs text-textSecondary mt-1">
            Across {shops.length} retailer shops
          </div>
        </div>
      </div>

      {/* Mid Section: Procurement Breakdown & Credit Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Procurement Breakdown Table (2 Columns) */}
        <div className="lg:col-span-2 rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
          <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-textPrimary">
                Procurement Weight Breakdown (Next Dispatch)
              </h2>
              <p className="text-xs text-textSecondary">
                Exact poultry load required from farm/abattoir
              </p>
            </div>
            <span className="text-xs font-bold text-brand bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full tabular-nums">
              Total: {formatWeight(totalProcurementKg)}
            </span>
          </div>

          <div className="divide-y divide-border text-xs">
            {Object.keys(procurementMap).length === 0 ? (
              <div className="p-6 text-center text-textSecondary">
                All placed orders have been dispatched or delivered.
              </div>
            ) : (
              Object.entries(procurementMap).map(([id, item]) => {
                const percent = Math.min(100, Math.round((item.total_qty / totalProcurementKg) * 100));
                return (
                  <div key={id} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-textPrimary">{item.product_name}</span>
                        <span className="font-bold text-textPrimary tabular-nums">
                          {formatWeight(item.total_qty, item.unit as 'kg' | 'crate')}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Credit Limit Alerts (1 Column) */}
        <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-textPrimary">Credit Limit Alerts</h2>
          </div>

          <div className="p-3 flex-1 overflow-y-auto divide-y divide-border text-xs">
            {creditAlertShops.length === 0 ? (
              <div className="p-6 text-center text-textSecondary">
                All retailer credit limits are healthy.
              </div>
            ) : (
              creditAlertShops.map((shop) => (
                <div key={shop.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between font-semibold text-textPrimary">
                    <span>{shop.name}</span>
                    <span className="text-amber-700 tabular-nums">
                      {formatINR(shop.outstanding_balance, false)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-textSecondary mt-0.5">
                    <span>Route: {shop.area_route}</span>
                    <span>Limit: {formatINR(shop.credit_limit, false)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-border bg-slate-50 text-right">
            <button
              type="button"
              onClick={() => onNavigate('shops')}
              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Shops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Sales Volume Bar Chart */}
      <div className="p-5 rounded-card border border-border bg-surface shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-textPrimary">Last 7 Days Sales Trend</h2>
            <p className="text-xs text-textSecondary">Daily revenue and meat volume dispatched</p>
          </div>
          <span className="text-xs font-semibold text-brand flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High weekend volume</span>
          </span>
        </div>

        {/* Simple Accessible Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 border-b border-border">
          {last7Days.map((item) => {
            const heightPercent = Math.max(12, Math.round((item.sales / maxSales) * 100));
            return (
              <div key={item.date} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] text-textSecondary tabular-nums mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{(item.sales / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full max-w-[42px] bg-emerald-100 group-hover:bg-brand rounded-t-md transition-all relative flex items-center justify-center"
                  style={{ height: `${heightPercent}%` }}
                >
                  <span className="text-[9px] font-bold text-brand group-hover:text-white tabular-nums hidden sm:inline">
                    {item.kg}kg
                  </span>
                </div>
                <span className="text-xs font-semibold text-textPrimary mt-2">{item.day}</span>
                <span className="text-[10px] text-slate-400">{item.date.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
        <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-textPrimary">Recent Live Orders</h2>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-border">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-textPrimary text-sm">{order.shop_name}</span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
                <div className="text-textSecondary flex items-center gap-2 mt-0.5 text-[11px]">
                  <span>{order.order_number}</span>
                  <span>•</span>
                  <span>{order.shop_area}</span>
                  <span>•</span>
                  <span>Slot: {order.delivery_slot}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-textPrimary text-sm tabular-nums block">
                  {formatWeight(order.total_delivered_qty ?? order.total_ordered_qty)}
                </span>
                <span className="font-semibold text-brand tabular-nums">
                  {formatINR(order.final_amount ?? order.estimated_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
