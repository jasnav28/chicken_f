import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatWeight } from '../../lib/formatters';
import { Download, TrendingUp, BarChart3, PieChart, Users, FileText } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { orders, shops, products, payments } = useApp();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Compute total sales & volume
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
  const allActiveOrders = orders.filter((o) => o.status !== 'Cancelled');

  const totalDeliveredRevenue = deliveredOrders.reduce(
    (sum, o) => sum + (o.final_amount ?? o.estimated_amount),
    0
  );
  const totalDeliveredKg = deliveredOrders.reduce(
    (sum, o) => sum + (o.total_delivered_qty ?? o.total_ordered_qty),
    0
  );

  // Volume per product
  const productVolumeMap: Record<string, { name: string; unit: string; totalQty: number; totalRev: number }> = {};
  allActiveOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!productVolumeMap[item.product_id]) {
        productVolumeMap[item.product_id] = {
          name: item.product_name,
          unit: item.unit,
          totalQty: 0,
          totalRev: 0,
        };
      }
      const qty = item.delivered_qty ?? item.ordered_qty;
      productVolumeMap[item.product_id].totalQty += qty;
      productVolumeMap[item.product_id].totalRev += qty * item.unit_rate;
    });
  });

  // Shop Leaderboard
  const shopPerformance = shops.map((shop) => {
    const shopOrders = orders.filter((o) => o.shop_id === shop.id && o.status !== 'Cancelled');
    const totalOrderedKg = shopOrders.reduce(
      (sum, o) => sum + (o.total_delivered_qty ?? o.total_ordered_qty),
      0
    );
    const totalBilled = shopOrders.reduce(
      (sum, o) => sum + (o.final_amount ?? o.estimated_amount),
      0
    );
    return {
      shop,
      ordersCount: shopOrders.length,
      totalOrderedKg,
      totalBilled,
      outstanding: shop.outstanding_balance,
    };
  });

  shopPerformance.sort((a, b) => b.totalBilled - a.totalBilled);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Shop Name', 'Route', 'Phone', 'Orders Count', 'Total Kg', 'Total Billed (INR)', 'Outstanding (INR)'];
    const rows = shopPerformance.map((s) => [
      `"${s.shop.name}"`,
      `"${s.shop.area_route}"`,
      `"${s.shop.phone}"`,
      s.ordersCount,
      s.totalOrderedKg.toFixed(1),
      s.totalBilled,
      s.outstanding,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ChickenLink_Sales_Report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-textPrimary">Analytics & Business Reports</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Sales volume, revenue and retail performance breakdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex bg-slate-100 p-1 rounded-btn text-xs font-semibold">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  timeframe === t
                    ? 'bg-surface text-textPrimary shadow-subtle'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3.5 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High-level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-card bg-surface border border-border shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
            Total Revenue Billed
          </span>
          <div className="text-2xl font-bold text-brand tabular-nums mt-1">
            {formatINR(totalDeliveredRevenue, false)}
          </div>
          <span className="text-xs text-textSecondary mt-1 block">
            From {deliveredOrders.length} delivered batches
          </span>
        </div>

        <div className="p-4 rounded-card bg-surface border border-border shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
            Total Dispatched Weight
          </span>
          <div className="text-2xl font-bold text-textPrimary tabular-nums mt-1">
            {formatWeight(totalDeliveredKg)}
          </div>
          <span className="text-xs text-textSecondary mt-1 block">
            Average {(totalDeliveredKg / (deliveredOrders.length || 1)).toFixed(1)} kg / drop
          </span>
        </div>

        <div className="p-4 rounded-card bg-surface border border-border shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
            Total Payments Collected
          </span>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {formatINR(
              payments.reduce((sum, p) => sum + p.amount, 0),
              false
            )}
          </div>
          <span className="text-xs text-textSecondary mt-1 block">
            Across {payments.length} transactions
          </span>
        </div>
      </div>

      {/* Product Volume Breakdown */}
      <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
        <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-textPrimary">Volume Sold per Chicken Cut</h2>
          <span className="text-xs text-textSecondary">Sorted by weight demand</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                <th className="p-3">Product Name</th>
                <th className="p-3 text-right">Volume</th>
                <th className="p-3 text-right">Estimated Revenue</th>
                <th className="p-3 w-48">Share of Total Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Object.entries(productVolumeMap).map(([id, item]) => {
                const totalAllKg = Object.values(productVolumeMap).reduce(
                  (sum, i) => sum + i.totalQty,
                  0
                );
                const percent = totalAllKg > 0 ? Math.round((item.totalQty / totalAllKg) * 100) : 0;

                return (
                  <tr key={id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-textPrimary">{item.name}</td>
                    <td className="p-3 text-right font-bold tabular-nums">
                      {formatWeight(item.totalQty, item.unit as 'kg' | 'crate')}
                    </td>
                    <td className="p-3 text-right font-semibold text-brand tabular-nums">
                      {formatINR(item.totalRev, false)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-textSecondary tabular-nums w-8">
                          {percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retailer Shops Sales & Outstanding Leaderboard */}
      <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
        <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-textPrimary">Retailer Shop Performance & Outstanding</h2>
            <p className="text-xs text-textSecondary">Top buying retail counters and balance health</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                <th className="p-3 w-10 text-center">Rank</th>
                <th className="p-3">Shop Name & Owner</th>
                <th className="p-3">Route</th>
                <th className="p-3 text-center">Orders</th>
                <th className="p-3 text-right">Total Weight</th>
                <th className="p-3 text-right">Total Billed</th>
                <th className="p-3 text-right">Current Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shopPerformance.map((s, idx) => (
                <tr key={s.shop.id} className="hover:bg-slate-50/50">
                  <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-3">
                    <span className="font-bold text-textPrimary text-sm block">{s.shop.name}</span>
                    <span className="text-[11px] text-textSecondary">{s.shop.owner_name}</span>
                  </td>
                  <td className="p-3 font-medium text-brand">{s.shop.area_route}</td>
                  <td className="p-3 text-center font-medium text-textPrimary">{s.ordersCount}</td>
                  <td className="p-3 text-right font-bold text-textPrimary tabular-nums">
                    {formatWeight(s.totalOrderedKg)}
                  </td>
                  <td className="p-3 text-right font-bold text-brand tabular-nums">
                    {formatINR(s.totalBilled, false)}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    <span
                      className={`font-bold ${
                        s.outstanding > s.shop.credit_limit * 0.85
                          ? 'text-red-600'
                          : 'text-textPrimary'
                      }`}
                    >
                      {formatINR(s.outstanding, false)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
