export type UserRole = 'shop' | 'admin';

export type OrderStatus = 'Placed' | 'Confirmed' | 'Out for delivery' | 'Delivered' | 'Cancelled';

export type PaymentMode = 'Cash' | 'UPI' | 'Bank' | 'Cheque';

export type DeliverySlot = 'Morning' | 'Afternoon' | 'Evening';

export type LedgerEntryType = 'INVOICE' | 'PAYMENT' | 'ADJUSTMENT';

export interface Shop {
  id: string;
  username: string; // User ID for consumer login
  password?: string; // Password created by admin
  name: string;
  owner_name: string;
  phone: string;
  email?: string;
  address: string;
  area_route: string; // e.g. "North Route", "South Market", "Central Area"
  credit_limit: number;
  outstanding_balance: number;
  custom_rates?: Record<string, number>; // product_id -> rate
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  name_kn?: string; // Kannada
  name_hi?: string; // Hindi
  name_te?: string; // Telugu
  unit: 'kg' | 'crate';
  current_rate: number;
  yesterday_rate: number;
  description: string;
  image_url?: string;
  is_active: boolean;
  min_order_qty: number;
  step_qty: number;
}

export interface DailyRate {
  id: string;
  product_id: string;
  rate_date: string;
  rate_per_unit: number;
  published_at: string;
  published_by: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit: 'kg' | 'crate';
  ordered_qty: number;
  delivered_qty?: number;
  unit_rate: number;
  total_amount: number;
}

export interface Order {
  id: string;
  order_number: string; // e.g. CKL-20261014-001
  shop_id: string;
  shop_name: string;
  shop_phone: string;
  shop_area: string;
  shop_address: string;
  order_date: string;
  delivery_date: string;
  delivery_slot: DeliverySlot;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  total_ordered_qty: number;
  total_delivered_qty?: number;
  estimated_amount: number;
  final_amount?: number;
  invoice_number?: string;
  invoice_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  receipt_no: string;
  shop_id: string;
  shop_name: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_date: string;
  reference_no?: string;
  note?: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  shop_id: string;
  entry_date: string;
  entry_type: LedgerEntryType;
  reference_id: string; // order_id or payment_id
  reference_no: string; // invoice_number or receipt_no
  description: string;
  debit: number; // Invoices increase outstanding
  credit: number; // Payments reduce outstanding
  balance_after: number;
  created_at: string;
}

export interface StandingOrder {
  id: string;
  shop_id: string;
  items: { product_id: string; qty: number }[];
  delivery_slot: DeliverySlot;
  days_of_week: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_role: 'admin' | 'shop';
  recipient_shop_id?: string;
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  order_id?: string;
  type: 'order' | 'payment' | 'rate' | 'system';
}

export interface AppSettings {
  business_name: string;
  owner_name: string;
  phone: string;
  address: string;
  gstin?: string;
  fssai?: string;
  cutoff_time: string; // "21:00"
  delivery_slots: DeliverySlot[];
  invoice_prefix: string;
  invoice_footer: string;
  upi_id: string;
  bank_details: {
    bank_name: string;
    account_number: string;
    ifsc: string;
    branch: string;
  };
  whatsapp_enabled: boolean;
  whatsapp_distributor_phone: string;
  sound_alert_enabled: boolean;
  standing_orders_auto_generate: boolean;
}
