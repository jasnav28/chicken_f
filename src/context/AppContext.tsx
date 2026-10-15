import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Shop,
  Product,
  Order,
  Payment,
  LedgerEntry,
  StandingOrder,
  AppSettings,
  NotificationItem,
  OrderStatus,
  PaymentMode,
  DeliverySlot,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_SHOPS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_LEDGER,
  INITIAL_STANDING_ORDERS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { Language, translations } from '../lib/i18n';
import { soundEffects } from '../lib/audio';
import { whatsAppService } from '../lib/whatsapp';
import { getTodayDate } from '../lib/formatters';
import { api } from '../lib/api';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentShop: Shop;
  setCurrentShop: (shop: Shop) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;

  // Data
  products: Product[];
  shops: Shop[];
  orders: Order[];
  payments: Payment[];
  ledger: LedgerEntry[];
  standingOrders: StandingOrder[];
  notifications: NotificationItem[];
  settings: AppSettings;

  // Actions
  placeOrder: (
    items: { productId: string; orderedQty: number }[],
    deliveryDate: string,
    deliverySlot: DeliverySlot,
    notes?: string
  ) => Promise<Order>;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    deliveredItems?: { itemId: string; deliveredQty: number }[]
  ) => void;
  updateOrderDeliveredWeights: (
    orderId: string,
    deliveredItems: { itemId: string; deliveredQty: number }[]
  ) => void;
  bulkConfirmOrders: (orderIds: string[]) => void;
  recordPayment: (
    shopId: string,
    amount: number,
    mode: PaymentMode,
    refNo?: string,
    note?: string
  ) => Payment;
  publishRates: (updatedRates: Record<string, number>) => void;
  addShop: (shopData: Omit<Shop, 'id' | 'created_at' | 'outstanding_balance'>) => Shop;
  updateShop: (shopId: string, shopData: Partial<Shop>) => void;
  toggleShopStatus: (shopId: string) => void;
  addProduct: (productData: Omit<Product, 'id' | 'yesterday_rate'>) => Product;
  updateProduct: (productId: string, productData: Partial<Product>) => void;
  saveStandingOrder: (
    shopId: string,
    items: { product_id: string; qty: number }[],
    deliverySlot: DeliverySlot,
    daysOfWeek: number[],
    notes?: string
  ) => void;
  generateOrdersFromStanding: () => number;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App State initialized with LocalStorage cache or mock defaults
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('ckl_role') as UserRole) || 'shop';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ckl_lang') as Language) || 'en';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ckl_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ckl_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('ckl_shops');
    return saved ? JSON.parse(saved) : INITIAL_SHOPS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ckl_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('ckl_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('ckl_ledger');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>(() => {
    const saved = localStorage.getItem('ckl_standing');
    return saved ? JSON.parse(saved) : INITIAL_STANDING_ORDERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('ckl_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Current Shop for the Shop role
  const [currentShop, setCurrentShopState] = useState<Shop>(() => {
    const savedShopId =
      localStorage.getItem('ckl_authenticated_shop_id') ||
      localStorage.getItem('ckl_active_shop_id');
    const savedShops = localStorage.getItem('ckl_shops');
    if (savedShops) {
      try {
        const parsed: Shop[] = JSON.parse(savedShops);
        const found = parsed.find((s) => s.id === savedShopId);
        if (found) return found;
        if (parsed.length > 0) return parsed[0];
      } catch (e) {}
    }
    return {
      id: '',
      username: '',
      password: '',
      name: '',
      owner_name: '',
      phone: '',
      address: '',
      area_route: 'North Route',
      credit_limit: 50000,
      outstanding_balance: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  });

  // Fetch real data from PostgreSQL API
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteData = async () => {
      try {
        const [
          remoteShops,
          remoteProducts,
          remoteOrders,
          remotePayments,
          remoteLedger,
          remoteSettings,
        ] = await Promise.allSettled([
          api.getShops(),
          api.getProducts(),
          api.getOrders(),
          api.getPayments(),
          api.getLedger(),
          api.getSettings(),
        ]);

        if (!isMounted) return;

        if (remoteShops.status === 'fulfilled' && Array.isArray(remoteShops.value)) {
          setShops(remoteShops.value);
          const savedShopId =
            localStorage.getItem('ckl_authenticated_shop_id') ||
            localStorage.getItem('ckl_active_shop_id');
          const matched = remoteShops.value.find((s) => s.id === savedShopId);
          if (matched) {
            setCurrentShopState(matched);
          } else if (remoteShops.value.length > 0 && !savedShopId) {
            setCurrentShopState(remoteShops.value[0]);
          }
        }

        if (
          remoteProducts.status === 'fulfilled' &&
          Array.isArray(remoteProducts.value) &&
          remoteProducts.value.length > 0
        ) {
          setProducts(remoteProducts.value);
        }

        if (remoteOrders.status === 'fulfilled' && Array.isArray(remoteOrders.value)) {
          setOrders(remoteOrders.value);
        }

        if (remotePayments.status === 'fulfilled' && Array.isArray(remotePayments.value)) {
          setPayments(remotePayments.value);
        }

        if (remoteLedger.status === 'fulfilled' && Array.isArray(remoteLedger.value)) {
          setLedger(remoteLedger.value);
        }

        if (
          remoteSettings.status === 'fulfilled' &&
          remoteSettings.value &&
          !remoteSettings.value.error
        ) {
          setSettings((prev) => ({ ...prev, ...remoteSettings.value }));
        }
      } catch (err) {
        console.warn('API sync notice:', err);
      }
    };

    fetchRemoteData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('ckl_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('ckl_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ckl_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ckl_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ckl_shops', JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem('ckl_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ckl_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('ckl_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('ckl_standing', JSON.stringify(standingOrders));
  }, [standingOrders]);

  useEffect(() => {
    localStorage.setItem('ckl_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentShop) {
      localStorage.setItem('ckl_active_shop_id', currentShop.id);
    }
  }, [currentShop]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrentShop = (shop: Shop) => {
    setCurrentShopState(shop);
  };

  const t = translations[language] || translations.en;

  // Actions
  const placeOrder = async (
    itemsList: { productId: string; orderedQty: number }[],
    deliveryDate: string,
    deliverySlot: DeliverySlot,
    notes?: string
  ): Promise<Order> => {
    const todayStr = getTodayDate();
    const count = orders.length + 1;
    const orderNumber = `CKL-${todayStr.replace(/-/g, '')}-${count.toString().padStart(3, '0')}`;

    let totalWeight = 0;
    let estimatedTotal = 0;

    const orderItems = itemsList.map((item, index) => {
      const product = products.find((p) => p.id === item.productId);
      const customPrice = currentShop.custom_rates?.[item.productId];
      const unitRate = customPrice !== undefined ? customPrice : product?.current_rate || 150;
      const amount = item.orderedQty * unitRate;

      totalWeight += item.orderedQty;
      estimatedTotal += amount;

      return {
        id: `item-${Date.now()}-${index}`,
        order_id: `ord-${Date.now()}`,
        product_id: item.productId,
        product_name: product?.name || 'Chicken Item',
        unit: product?.unit || 'kg',
        ordered_qty: item.orderedQty,
        unit_rate: unitRate,
        total_amount: amount,
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      shop_id: currentShop.id,
      shop_name: currentShop.name,
      shop_phone: currentShop.phone,
      shop_area: currentShop.area_route,
      shop_address: currentShop.address,
      order_date: todayStr,
      delivery_date: deliveryDate,
      delivery_slot: deliverySlot,
      status: 'Placed',
      notes: notes?.trim() || undefined,
      total_ordered_qty: totalWeight,
      estimated_amount: estimatedTotal,
      items: orderItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update orders list
    setOrders((prev) => [newOrder, ...prev]);

    // Create notification for admin
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipient_role: 'admin',
      title: `New Order: ${currentShop.name}`,
      message: `${currentShop.name} placed order #${orderNumber} for ${deliverySlot} (${totalWeight.toFixed(1)} kg, ₹${estimatedTotal.toLocaleString('en-IN')})`,
      timestamp: new Date().toISOString(),
      is_read: false,
      order_id: newOrder.id,
      type: 'order',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Sound alert
    if (settings.sound_alert_enabled) {
      soundEffects.playOrderBell();
    }

    // Save order to PostgreSQL
    if (currentShop.id) {
      api.createOrder({
        shop_id: currentShop.id,
        delivery_date: deliveryDate,
        delivery_slot: deliverySlot,
        notes: notes || '',
        items: itemsList.map((item) => ({
          product_id: item.productId,
          ordered_qty: item.orderedQty,
        })),
      }).catch((err) => console.warn('Could not sync order to database:', err));
    }

    return newOrder;
  };

  const updateOrderDeliveredWeights = (
    orderId: string,
    deliveredItems: { itemId: string; deliveredQty: number }[]
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        let totalDelivered = 0;
        let finalAmount = 0;

        const updatedItems = ord.items.map((item) => {
          const matched = deliveredItems.find((d) => d.itemId === item.id);
          const delQty = matched !== undefined ? matched.deliveredQty : item.delivered_qty ?? item.ordered_qty;
          const lineAmount = delQty * item.unit_rate;

          totalDelivered += delQty;
          finalAmount += lineAmount;

          return {
            ...item,
            delivered_qty: delQty,
            total_amount: lineAmount,
          };
        });

        return {
          ...ord,
          items: updatedItems,
          total_delivered_qty: totalDelivered,
          final_amount: finalAmount,
          updated_at: new Date().toISOString(),
        };
      })
    );

    api.updateDeliveredWeights(orderId, deliveredItems).catch((err) =>
      console.warn('Could not sync delivered weights:', err)
    );
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    deliveredItems?: { itemId: string; deliveredQty: number }[]
  ) => {
    setOrders((prevOrders) => {
      return prevOrders.map((ord) => {
        if (ord.id !== orderId) return ord;

        let updatedItems = ord.items;
        let totalDelivered = ord.total_delivered_qty;
        let finalTotal = ord.final_amount;

        if (deliveredItems && deliveredItems.length > 0) {
          totalDelivered = 0;
          finalTotal = 0;
          updatedItems = ord.items.map((item) => {
            const match = deliveredItems.find((d) => d.itemId === item.id);
            const delQty = match !== undefined ? match.deliveredQty : item.delivered_qty ?? item.ordered_qty;
            const lineTotal = delQty * item.unit_rate;
            totalDelivered! += delQty;
            finalTotal! += lineTotal;
            return {
              ...item,
              delivered_qty: delQty,
              total_amount: lineTotal,
            };
          });
        }

        // If transitioning to Delivered and no final amount set, calculate from delivered or ordered
        if (newStatus === 'Delivered') {
          if (!finalTotal) {
            finalTotal = ord.estimated_amount;
            totalDelivered = ord.total_ordered_qty;
          }
          const invoiceNum = ord.invoice_number || `INV-CKL-${ord.order_number.replace('CKL-', '')}`;
          const todayDate = getTodayDate();

          // Append to Ledger (Debit entry increases outstanding)
          const targetShop = shops.find((s) => s.id === ord.shop_id);
          const currentBal = targetShop ? targetShop.outstanding_balance : 0;
          const newBal = currentBal + finalTotal;

          const newLedgerEntry: LedgerEntry = {
            id: `led-${Date.now()}`,
            shop_id: ord.shop_id,
            entry_date: todayDate,
            entry_type: 'INVOICE',
            reference_id: ord.id,
            reference_no: invoiceNum,
            description: `Delivery Bill #${invoiceNum} (${totalDelivered?.toFixed(1) || ord.total_ordered_qty} kg)`,
            debit: finalTotal,
            credit: 0,
            balance_after: newBal,
            created_at: new Date().toISOString(),
          };

          setLedger((prevLedger) => [newLedgerEntry, ...prevLedger]);

          // Update Shop outstanding balance
          setShops((prevShops) =>
            prevShops.map((s) => (s.id === ord.shop_id ? { ...s, outstanding_balance: newBal } : s))
          );

          if (currentShop.id === ord.shop_id) {
            setCurrentShopState((prev) => ({ ...prev, outstanding_balance: newBal }));
          }

          // Shop notification
          const shopNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            recipient_role: 'shop',
            recipient_shop_id: ord.shop_id,
            title: `Order Delivered: #${ord.order_number}`,
            message: `Your order has been delivered. Final invoice #${invoiceNum} for ₹${finalTotal.toLocaleString('en-IN')} has been generated.`,
            timestamp: new Date().toISOString(),
            is_read: false,
            order_id: ord.id,
            type: 'order',
          };
          setNotifications((prev) => [shopNotif, ...prev]);

          return {
            ...ord,
            status: newStatus,
            items: updatedItems,
            total_delivered_qty: totalDelivered,
            final_amount: finalTotal,
            invoice_number: invoiceNum,
            invoice_date: todayDate,
            updated_at: new Date().toISOString(),
          };
        }

        // For other status transitions
        return {
          ...ord,
          status: newStatus,
          items: updatedItems,
          total_delivered_qty: totalDelivered,
          final_amount: finalTotal,
          updated_at: new Date().toISOString(),
        };
      });
    });

    if (settings.sound_alert_enabled) {
      soundEffects.playSuccessTone();
    }

    api.updateOrderStatus(orderId, newStatus).catch((err) =>
      console.warn('Could not sync status:', err)
    );
  };

  const bulkConfirmOrders = (orderIds: string[]) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (orderIds.includes(ord.id) && ord.status === 'Placed') {
          return {
            ...ord,
            status: 'Confirmed',
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    if (settings.sound_alert_enabled) {
      soundEffects.playSuccessTone();
    }
  };

  const recordPayment = (
    shopId: string,
    amount: number,
    mode: PaymentMode,
    refNo?: string,
    note?: string
  ): Payment => {
    const todayDate = getTodayDate();
    const targetShop = shops.find((s) => s.id === shopId);
    const shopName = targetShop?.name || 'Retail Shop';
    const currentBal = targetShop ? targetShop.outstanding_balance : 0;
    const newBal = Math.max(0, currentBal - amount);

    const receiptNo = `REC-${todayDate.replace(/-/g, '')}-${(payments.length + 1).toString().padStart(2, '0')}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receipt_no: receiptNo,
      shop_id: shopId,
      shop_name: shopName,
      amount,
      payment_mode: mode,
      payment_date: todayDate,
      reference_no: refNo?.trim() || undefined,
      note: note?.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Append to Ledger
    const newLedgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      shop_id: shopId,
      entry_date: todayDate,
      entry_type: 'PAYMENT',
      reference_id: newPayment.id,
      reference_no: receiptNo,
      description: `${mode} Payment received ${refNo ? `(Ref: ${refNo})` : ''}`,
      debit: 0,
      credit: amount,
      balance_after: newBal,
      created_at: new Date().toISOString(),
    };

    setLedger((prev) => [newLedgerEntry, ...prev]);

    // Update shop outstanding
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, outstanding_balance: newBal } : s))
    );

    if (currentShop.id === shopId) {
      setCurrentShopState((prev) => ({ ...prev, outstanding_balance: newBal }));
    }

    // Notification to shop
    const shopNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipient_role: 'shop',
      recipient_shop_id: shopId,
      title: 'Payment Received',
      message: `Received ₹${amount.toLocaleString('en-IN')} via ${mode}. Outstanding balance updated to ₹${newBal.toLocaleString('en-IN')}.`,
      timestamp: new Date().toISOString(),
      is_read: false,
      type: 'payment',
    };
    setNotifications((prev) => [shopNotif, ...prev]);

    if (settings.sound_alert_enabled) {
      soundEffects.playSuccessTone();
    }

    api.recordPayment({
      shop_id: shopId,
      amount,
      mode,
      reference_no: refNo?.trim() || '',
      notes: note?.trim() || '',
      payment_date: todayDate,
    }).catch((err) => console.warn('Could not sync payment:', err));

    return newPayment;
  };

  const publishRates = (updatedRates: Record<string, number>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        const newRate = updatedRates[prod.id];
        if (newRate !== undefined && newRate !== prod.current_rate) {
          return {
            ...prod,
            yesterday_rate: prod.current_rate,
            current_rate: newRate,
          };
        }
        return prod;
      })
    );

    // Broadcast notification to shops
    const rateNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipient_role: 'shop',
      title: "Today's Rates Published",
      message: "Distributor has updated and published today's wholesale chicken rates. Check rates before ordering.",
      timestamp: new Date().toISOString(),
      is_read: false,
      type: 'rate',
    };
    setNotifications((prev) => [rateNotif, ...prev]);

    if (settings.sound_alert_enabled) {
      soundEffects.playSuccessTone();
    }

    api.publishRates(updatedRates).catch((err) => console.warn('Could not sync rates:', err));
  };

  const addShop = (shopData: Omit<Shop, 'id' | 'created_at' | 'outstanding_balance'>): Shop => {
    const newShop: Shop = {
      ...shopData,
      id: `shop-${Date.now()}`,
      outstanding_balance: 0,
      created_at: new Date().toISOString(),
    };
    setShops((prev) => [...prev, newShop]);

    api.createShop(newShop).catch((err) => console.warn('Could not sync new shop:', err));

    return newShop;
  };

  const updateShop = (shopId: string, shopData: Partial<Shop>) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...shopData } : s))
    );
    if (currentShop.id === shopId) {
      setCurrentShopState((prev) => ({ ...prev, ...shopData }));
    }
    api.updateShop(shopId, shopData).catch((err) => console.warn('Could not sync shop update:', err));
  };

  const toggleShopStatus = (shopId: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, is_active: !s.is_active } : s))
    );
    api.toggleShopStatus(shopId).catch((err) => console.warn('Could not sync toggle status:', err));
  };

  const addProduct = (productData: Omit<Product, 'id' | 'yesterday_rate'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      yesterday_rate: productData.current_rate,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (productId: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...productData } : p))
    );
  };

  const saveStandingOrder = (
    shopId: string,
    items: { product_id: string; qty: number }[],
    deliverySlot: DeliverySlot,
    daysOfWeek: number[],
    notes?: string
  ) => {
    setStandingOrders((prev) => {
      const existing = prev.filter((s) => s.shop_id !== shopId);
      const newEntry: StandingOrder = {
        id: `stand-${Date.now()}`,
        shop_id: shopId,
        items,
        delivery_slot: deliverySlot,
        days_of_week: daysOfWeek,
        is_active: true,
        notes,
        created_at: new Date().toISOString(),
      };
      return [...existing, newEntry];
    });
  };

  const generateOrdersFromStanding = (): number => {
    const todayDay = new Date().getDay(); // 0=Sun, 1=Mon, ...
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    let createdCount = 0;

    standingOrders.forEach((stand) => {
      if (!stand.is_active || !stand.days_of_week.includes(todayDay)) return;

      const shop = shops.find((s) => s.id === stand.shop_id);
      if (!shop || !shop.is_active) return;

      // Check if order already exists for this shop & delivery date
      const alreadyOrdered = orders.some(
        (o) => o.shop_id === stand.shop_id && o.delivery_date === tomorrowStr
      );
      if (alreadyOrdered) return;

      const itemsList = stand.items.map((i) => ({
        productId: i.product_id,
        orderedQty: i.qty,
      }));

      // Create order
      placeOrder(itemsList, tomorrowStr, stand.delivery_slot, `Standing Auto Order: ${stand.notes || ''}`);
      createdCount++;
    });

    return createdCount;
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const resetDemoData = () => {
    localStorage.removeItem('ckl_orders');
    localStorage.removeItem('ckl_payments');
    localStorage.removeItem('ckl_ledger');
    localStorage.removeItem('ckl_shops');
    localStorage.removeItem('ckl_standing');
    localStorage.removeItem('ckl_notifications');
    setOrders([]);
    setPayments([]);
    setLedger([]);
    setShops([]);
    setStandingOrders([]);
    setNotifications([]);
    setCurrentShopState({
      id: '',
      username: '',
      password: '',
      name: '',
      owner_name: '',
      phone: '',
      address: '',
      area_route: 'North Route',
      credit_limit: 50000,
      outstanding_balance: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentShop,
        setCurrentShop,
        language,
        setLanguage,
        t,
        products,
        shops,
        orders,
        payments,
        ledger,
        standingOrders,
        notifications,
        settings,
        placeOrder,
        updateOrderStatus,
        updateOrderDeliveredWeights,
        bulkConfirmOrders,
        recordPayment,
        publishRates,
        addShop,
        updateShop,
        toggleShopStatus,
        addProduct,
        updateProduct,
        saveStandingOrder,
        generateOrdersFromStanding,
        updateSettings,
        markNotificationRead,
        clearAllNotifications,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
