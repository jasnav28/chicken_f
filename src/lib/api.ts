/**
 * PostgreSQL API Client for ChickenLink / RestoPilot
 */

const envUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE = envUrl
  ? envUrl.endsWith('/api')
    ? envUrl
    : `${envUrl.replace(/\/$/, '')}/api`
  : '/api';

export const api = {
  // 1. Auth
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async adminLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin login failed');
    return data;
  },

  // 2. Shops / Consumers
  async getShops() {
    const res = await fetch(`${API_BASE}/shops`);
    if (!res.ok) throw new Error('Failed to fetch shops');
    return res.json();
  },

  async createShop(shopData: any) {
    const res = await fetch(`${API_BASE}/shops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create consumer');
    return data;
  },

  async updateShop(id: string, shopData: any) {
    const res = await fetch(`${API_BASE}/shops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update consumer');
    return data;
  },

  async resetConsumerPassword(id: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/shops/${id}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  async toggleShopStatus(id: string) {
    const res = await fetch(`${API_BASE}/shops/${id}/status`, {
      method: 'PATCH',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle status');
    return data;
  },

  // 3. Products & Rates
  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async publishRates(rates: Record<string, number>) {
    const res = await fetch(`${API_BASE}/products/publish-rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to publish rates');
    return data;
  },

  // 4. Orders
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create order');
    return data;
  },

  async updateOrderStatus(id: string, status: string, finalAmount?: number, totalDeliveredQty?: number) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, final_amount: finalAmount, total_delivered_qty: totalDeliveredQty }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data;
  },

  async updateDeliveredWeights(id: string, deliveredItems: { itemId: string; deliveredQty: number }[]) {
    const res = await fetch(`${API_BASE}/orders/${id}/delivered-weights`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivered_items: deliveredItems }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update weights');
    return data;
  },

  // 5. Payments & Ledger
  async getPayments() {
    const res = await fetch(`${API_BASE}/payments`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async recordPayment(paymentData: any) {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record payment');
    return data;
  },

  async getLedger(shopId?: string) {
    const url = shopId ? `${API_BASE}/ledger?shop_id=${shopId}` : `${API_BASE}/ledger`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch ledger');
    return res.json();
  },

  // 6. Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settingsData: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data;
  },
};
