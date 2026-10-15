import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shop } from '../../types';
import { formatINR, formatDateIST } from '../../lib/formatters';
import {
  Search,
  Plus,
  Store,
  Edit2,
  Power,
  X,
  Phone,
  MapPin,
  CreditCard,
  Key,
  Copy,
  Check,
  Lock,
  User,
  Shield,
} from 'lucide-react';

interface AdminShopsProps {
  onRecordPaymentForShop: (shopId: string) => void;
}

export const AdminShops: React.FC<AdminShopsProps> = ({ onRecordPaymentForShop }) => {
  const { shops, orders, ledger, addShop, updateShop, toggleShopStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Partial<Shop> | null>(null);

  // Password reset modal state
  const [resetPasswordShop, setResetPasswordShop] = useState<Shop | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Distinct areas
  const areas = Array.from(new Set(shops.map((s) => s.area_route)));

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shop.username && shop.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      shop.phone.includes(searchTerm) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter === 'All' || shop.area_route === areaFilter;
    return matchesSearch && matchesArea;
  });

  const handleOpenAddShop = () => {
    setEditingShop({
      username: `shop_${Math.floor(100 + Math.random() * 900)}`,
      password: 'shop' + Math.floor(100 + Math.random() * 900),
      name: '',
      owner_name: '',
      phone: '',
      email: '',
      address: '',
      area_route: areas[0] || 'North Route',
      credit_limit: 50000,
      is_active: true,
      custom_rates: {},
    });
    setIsEditingModalOpen(true);
  };

  const handleOpenEditShop = (shop: Shop) => {
    setEditingShop({ ...shop });
    setIsEditingModalOpen(true);
  };

  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop || !editingShop.name || !editingShop.phone || !editingShop.username) {
      alert('Please fill in User ID, Shop name and Phone number.');
      return;
    }

    if (editingShop.id) {
      // Edit existing
      updateShop(editingShop.id, editingShop);
      if (selectedShop?.id === editingShop.id) {
        setSelectedShop({ ...selectedShop, ...(editingShop as Shop) });
      }
    } else {
      // Add new consumer profile
      const created = addShop({
        username: editingShop.username,
        password: editingShop.password || 'shop123',
        name: editingShop.name,
        owner_name: editingShop.owner_name || editingShop.name,
        phone: editingShop.phone,
        email: editingShop.email || '',
        address: editingShop.address || 'Bangalore',
        area_route: editingShop.area_route || 'North Route',
        credit_limit: editingShop.credit_limit || 50000,
        is_active: true,
        custom_rates: {},
      });
      setSelectedShop(created);
    }
    setIsEditingModalOpen(false);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordShop || !newPasswordInput) return;

    updateShop(resetPasswordShop.id, { password: newPasswordInput });
    if (selectedShop?.id === resetPasswordShop.id) {
      setSelectedShop({ ...selectedShop, password: newPasswordInput });
    }
    alert(`Password for ${resetPasswordShop.name} updated to "${newPasswordInput}".`);
    setResetPasswordShop(null);
    setNewPasswordInput('');
  };

  const handleCopyCredentials = (shop: Shop) => {
    const text = `🐔 *CHICKENLINK / RESTOPILOT LOGIN CREDENTIALS*
----------------------------------------
*Shop:* ${shop.name}
*User ID:* ${shop.username}
*Password:* ${shop.password || 'shop123'}
*Website:* ${window.location.origin}/login
----------------------------------------
_Please login to view daily rates and place orders._`;

    navigator.clipboard.writeText(text);
    setCopiedId(shop.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-textSecondary absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search consumers by User ID, name, phone..."
              className="w-full h-11 pl-9 pr-3 rounded-btn border border-border text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="h-11 px-3 rounded-btn border border-border bg-surface text-xs font-medium text-textPrimary"
          >
            <option value="All">All Routes</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAddShop}
          className="h-11 px-4 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Consumer Profile</span>
        </button>
      </div>

      {/* Shops Table */}
      <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
        <div className="p-3 bg-slate-50 border-b border-border flex items-center justify-between text-xs font-bold text-textSecondary uppercase tracking-wider">
          <span>Registered Consumers ({filteredShops.length})</span>
          <span className="text-[11px] font-normal normal-case text-slate-500">
            Click row for details & credential copy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                <th className="p-3">User ID (Login)</th>
                <th className="p-3">Shop Name & Owner</th>
                <th className="p-3">Route</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-right">Credit Limit</th>
                <th className="p-3 text-right">Outstanding</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Credentials & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-textSecondary">
                    No retailer consumers found.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => {
                  const isHighRisk = shop.outstanding_balance > shop.credit_limit * 0.85;

                  return (
                    <tr
                      key={shop.id}
                      onClick={() => setSelectedShop(shop)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <span className="font-mono font-bold text-xs text-brand bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block max-w-fit">
                          {shop.username}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          Pass: {shop.password || '••••••'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-textPrimary text-sm block">
                          {shop.name}
                        </span>
                        <span className="text-[11px] text-textSecondary">{shop.owner_name}</span>
                      </td>
                      <td className="p-3 font-medium text-textPrimary">{shop.area_route}</td>
                      <td className="p-3 font-mono text-textPrimary">{shop.phone}</td>
                      <td className="p-3 text-right font-medium text-textSecondary tabular-nums">
                        {formatINR(shop.credit_limit, false)}
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        <span
                          className={`font-bold text-sm ${
                            isHighRisk ? 'text-red-600' : 'text-brand'
                          }`}
                        >
                          {formatINR(shop.outstanding_balance, false)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            shop.is_active
                              ? 'bg-emerald-50 text-brand border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {shop.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy credentials */}
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(shop)}
                            title="Copy User ID & Password"
                            className="p-1.5 rounded-md hover:bg-slate-200 text-textSecondary hover:text-brand"
                          >
                            {copiedId === shop.id ? (
                              <Check className="w-3.5 h-3.5 text-brand" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setResetPasswordShop(shop);
                              setNewPasswordInput('pass' + Math.floor(100 + Math.random() * 900));
                            }}
                            title="Reset Password"
                            className="p-1.5 rounded-md hover:bg-slate-200 text-textSecondary hover:text-amber-600"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Shop */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditShop(shop)}
                            title="Edit Profile"
                            className="p-1.5 rounded-md hover:bg-slate-200 text-textSecondary hover:text-textPrimary"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => toggleShopStatus(shop.id)}
                            title={shop.is_active ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-md hover:bg-slate-200 ${
                              shop.is_active ? 'text-slate-400 hover:text-red-600' : 'text-brand'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shop Detail Drawer */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedShop(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-xl bg-surface shadow-2xl flex flex-col border-l border-border">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-textPrimary leading-tight">
                      {selectedShop.name}
                    </h3>
                    <p className="text-xs text-textSecondary">
                      User ID: <span className="font-mono text-brand font-bold">{selectedShop.username}</span> • {selectedShop.area_route}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditShop(selectedShop)}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-textSecondary"
                    title="Edit Shop Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedShop(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {/* Consumer Credentials Card */}
                <div className="p-3.5 rounded-card bg-emerald-50/70 border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-brand uppercase tracking-wider flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" />
                      <span>Consumer Login Credentials</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(selectedShop)}
                      className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy for WhatsApp</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="p-2 rounded bg-white border border-emerald-100">
                      <span className="text-[10px] text-textSecondary block uppercase">User ID</span>
                      <strong className="text-textPrimary text-xs">{selectedShop.username}</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-textSecondary block uppercase">Password</span>
                        <strong className="text-textPrimary text-xs">{selectedShop.password || 'shop123'}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResetPasswordShop(selectedShop);
                          setNewPasswordInput('pass' + Math.floor(100 + Math.random() * 900));
                        }}
                        className="text-[11px] text-brand hover:underline font-sans"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credit & Balance KPI */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-card bg-slate-50 border border-border">
                    <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider block">
                      Outstanding Balance
                    </span>
                    <span className="text-xl font-bold text-brand tabular-nums">
                      {formatINR(selectedShop.outstanding_balance)}
                    </span>
                  </div>

                  <div className="p-3 rounded-card bg-slate-50 border border-border">
                    <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider block">
                      Credit Limit
                    </span>
                    <span className="text-xl font-bold text-textPrimary tabular-nums">
                      {formatINR(selectedShop.credit_limit)}
                    </span>
                  </div>
                </div>

                {/* Quick Record Payment Action */}
                <button
                  type="button"
                  onClick={() => {
                    const shopId = selectedShop.id;
                    setSelectedShop(null);
                    onRecordPaymentForShop(shopId);
                  }}
                  className="w-full h-11 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Record Payment for this Consumer</span>
                </button>

                {/* Shop Address & Details */}
                <div className="p-3 rounded-card border border-border bg-surface text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Owner Name:</span>
                    <span className="font-semibold text-textPrimary">{selectedShop.owner_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Phone Number:</span>
                    <span className="font-mono font-semibold text-textPrimary">
                      {selectedShop.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Delivery Route:</span>
                    <span className="font-semibold text-brand">{selectedShop.area_route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Address:</span>
                    <span className="text-textPrimary text-right max-w-xs">{selectedShop.address}</span>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-card border border-border overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-border flex items-center justify-between text-xs font-bold text-textSecondary uppercase">
                    <span>Recent Orders</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-border text-xs">
                    {orders
                      .filter((o) => o.shop_id === selectedShop.id)
                      .slice(0, 4)
                      .map((o) => (
                        <div key={o.id} className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-textPrimary block">
                              {o.order_number}
                            </span>
                            <span className="text-textSecondary text-[11px]">
                              {o.delivery_date} • {formatINR(o.final_amount ?? o.estimated_amount)}
                            </span>
                          </div>
                          <span className="text-textSecondary font-medium">{o.status}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Consumer Modal */}
      {isEditingModalOpen && editingShop && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-card border border-border shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base text-textPrimary">
                  {editingShop.id ? 'Edit Consumer Profile' : 'Create New Consumer Profile'}
                </h3>
                <p className="text-xs text-textSecondary">
                  Create User ID and password for consumer login
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShop} className="space-y-3.5 mt-4 text-xs">
              {/* Credentials Section */}
              <div className="p-3 rounded-card bg-emerald-50/50 border border-emerald-100 space-y-2">
                <span className="font-bold text-brand uppercase tracking-wider text-[11px] block">
                  Login Credentials (Used by Consumer)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-textPrimary mb-1">
                      User ID / Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingShop.username || ''}
                      onChange={(e) =>
                        setEditingShop({
                          ...editingShop,
                          username: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                        })
                      }
                      placeholder="e.g. star_chicken"
                      className="w-full h-10 px-3 rounded-btn border border-border bg-surface font-mono text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-textPrimary mb-1">
                      Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingShop.password || ''}
                      onChange={(e) =>
                        setEditingShop({ ...editingShop, password: e.target.value })
                      }
                      placeholder="e.g. star123"
                      className="w-full h-10 px-3 rounded-btn border border-border bg-surface font-mono text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Shop Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">
                    Shop / Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingShop.name || ''}
                    onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
                    placeholder="e.g. Star Chicken Center"
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={editingShop.owner_name || ''}
                    onChange={(e) =>
                      setEditingShop({ ...editingShop, owner_name: e.target.value })
                    }
                    placeholder="e.g. Rafiq Ahmed"
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editingShop.phone || ''}
                    onChange={(e) => setEditingShop({ ...editingShop, phone: e.target.value })}
                    placeholder="9845012345"
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={editingShop.email || ''}
                    onChange={(e) => setEditingShop({ ...editingShop, email: e.target.value })}
                    placeholder="shop@example.com"
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={editingShop.address || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, address: e.target.value })}
                  placeholder="Shop number, Street, Landmark, Area"
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Delivery Route / Area</label>
                  <input
                    type="text"
                    value={editingShop.area_route || ''}
                    onChange={(e) => setEditingShop({ ...editingShop, area_route: e.target.value })}
                    placeholder="e.g. North Route"
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={editingShop.credit_limit || 50000}
                    onChange={(e) =>
                      setEditingShop({
                        ...editingShop,
                        credit_limit: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary tabular-nums focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="h-10 px-4 rounded-btn border border-border text-textSecondary hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-btn bg-brand hover:bg-brand-hover text-white font-semibold shadow-sm"
                >
                  Save Consumer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordShop && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-card border border-border shadow-2xl p-5">
            <h3 className="font-bold text-base text-textPrimary">Reset Consumer Password</h3>
            <p className="text-xs text-textSecondary mt-1">
              Reset password for <strong>{resetPasswordShop.name}</strong> ({resetPasswordShop.username})
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-textPrimary mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface font-mono font-bold text-sm text-textPrimary focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordShop(null)}
                  className="h-9 px-3 rounded-btn border border-border text-textSecondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-btn bg-brand hover:bg-brand-hover text-white font-semibold"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
