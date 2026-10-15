import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatINR } from '../../lib/formatters';
import {
  Tag,
  Plus,
  Edit2,
  Power,
  X,
  Check,
  RotateCcw,
  Upload,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';

export const AdminRates: React.FC = () => {
  const { products, publishRates, addProduct, updateProduct } = useApp();

  const [activeTab, setActiveTab] = useState<'rates' | 'catalog'>('rates');

  // Mass rate editing state: product_id -> updatedRate
  const [editingRates, setEditingRates] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.id] = p.current_rate;
    });
    return map;
  });

  // Add/Edit Product modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const handleRateChange = (productId: string, val: string) => {
    const parsed = parseFloat(val);
    setEditingRates((prev) => ({
      ...prev,
      [productId]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handlePublishAll = () => {
    if (window.confirm("Publish today's updated chicken rates? All new shop orders will use these prices.")) {
      publishRates(editingRates);
      alert("Today's rates published successfully and broadcast to all retailers!");
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct({
      code: `CK-${(products.length + 1).toString().padStart(2, '0')}`,
      name: '',
      name_kn: '',
      name_hi: '',
      name_te: '',
      unit: 'kg',
      current_rate: 150,
      description: '',
      is_active: true,
      min_order_qty: 2.0,
      step_qty: 0.5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    if (editingProduct.id) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      addProduct(editingProduct as Omit<Product, 'id' | 'yesterday_rate'>);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Tab Toggle */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-textPrimary">Products & Daily Rates</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Manage wholesale rates and inventory cuts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-btn text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('rates')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'rates'
                  ? 'bg-surface text-textPrimary shadow-subtle'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Today's Rates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'catalog'
                  ? 'bg-surface text-textPrimary shadow-subtle'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Product Catalog ({products.length})
            </button>
          </div>

          {activeTab === 'catalog' && (
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="h-9 px-3 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cut</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'rates' ? (
        /* Today's Rates Mass Editor Screen */
        <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
          <div className="p-4 bg-emerald-50/60 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Live Pricing Board
              </span>
              <h2 className="text-base font-bold text-textPrimary mt-0.5">
                Set Wholesale Rates for Today's Orders
              </h2>
              <p className="text-xs text-textSecondary">
                Historical orders retain their booked price. Changes apply to subsequent orders.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublishAll}
              className="h-11 px-6 rounded-btn bg-brand hover:bg-brand-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Publish Rates Now</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                  <th className="p-3">Product Name & Code</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right">Yesterday's Rate</th>
                  <th className="p-3 text-right w-44">Today's Rate (₹)</th>
                  <th className="p-3 text-right">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products
                  .filter((p) => p.is_active)
                  .map((product) => {
                    const currentVal =
                      editingRates[product.id] !== undefined
                        ? editingRates[product.id]
                        : product.current_rate;
                    const diff = currentVal - product.yesterday_rate;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-bold text-textPrimary text-sm block">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-textSecondary">{product.code}</span>
                        </td>
                        <td className="p-3 font-medium text-textSecondary">{product.unit}</td>
                        <td className="p-3 text-right font-medium text-textSecondary tabular-nums">
                          {formatINR(product.yesterday_rate, false)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-semibold text-textSecondary">₹</span>
                            <input
                              type="number"
                              step="1"
                              min="1"
                              value={currentVal}
                              onChange={(e) => handleRateChange(product.id, e.target.value)}
                              className="w-28 h-9 px-2 text-right font-bold text-sm text-textPrimary rounded-btn border border-border bg-surface tabular-nums focus:ring-2 focus:ring-brand focus:outline-none"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold tabular-nums">
                          {diff !== 0 ? (
                            <span
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded ${
                                diff > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {diff > 0 ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )}
                              ₹{Math.abs(diff)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Same</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Product Catalog Table */
        <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-textSecondary font-semibold">
                  <th className="p-3">Code</th>
                  <th className="p-3">Product Name & Translations</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right">Current Rate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-textPrimary">{prod.code}</td>
                    <td className="p-3">
                      <span className="font-bold text-textPrimary text-sm block">{prod.name}</span>
                      <div className="text-[11px] text-textSecondary mt-0.5 space-x-2">
                        {prod.name_kn && <span>ಕನ್ನಡ: {prod.name_kn}</span>}
                        {prod.name_hi && <span>हिन्दी: {prod.name_hi}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-textSecondary">{prod.unit}</td>
                    <td className="p-3 text-right font-bold text-brand tabular-nums">
                      {formatINR(prod.current_rate, false)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          prod.is_active
                            ? 'bg-emerald-50 text-brand border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {prod.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-textSecondary"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProduct(prod.id, { is_active: !prod.is_active })}
                          className={`p-1.5 rounded-md hover:bg-slate-100 ${
                            prod.is_active ? 'text-slate-400 hover:text-red-600' : 'text-brand'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-card border border-border shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-textPrimary">
                {editingProduct.id ? 'Edit Chicken Product' : 'Add New Cut'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.code || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value })}
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface font-mono text-textPrimary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Unit</label>
                  <select
                    value={editingProduct.unit || 'kg'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        unit: e.target.value as 'kg' | 'crate',
                      })
                    }
                    className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="crate">crate (Eggs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Broiler Whole Bird (Skinless)"
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary"
                />
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Kannada Name (ಕನ್ನಡ)</label>
                <input
                  type="text"
                  value={editingProduct.name_kn || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name_kn: e.target.value })}
                  placeholder="ಬ್ರಾಯ್ಲರ್ ಚರ್ಮರಹಿತ"
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary"
                />
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Current Rate (₹)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={editingProduct.current_rate || 0}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      current_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-10 px-3 rounded-btn border border-border bg-surface text-textPrimary tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-textPrimary mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-btn border border-border bg-surface text-textPrimary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-btn border border-border text-textSecondary hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-btn bg-brand hover:bg-brand-hover text-white font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
