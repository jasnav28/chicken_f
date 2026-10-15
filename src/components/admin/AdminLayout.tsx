import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminDeliverySheet } from './AdminDeliverySheet';
import { AdminShops } from './AdminShops';
import { AdminRates } from './AdminRates';
import { AdminPayments } from './AdminPayments';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';
import { NotificationDrawer } from '../common/NotificationDrawer';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Store,
  Tag,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { notifications, settings, updateSettings, setRole } = useApp();

  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const [selectedOrderIdForDrawer, setSelectedOrderIdForDrawer] = useState<string | null>(null);
  const [preselectedShopIdForPayment, setPreselectedShopIdForPayment] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Unread notifications for admin
  const unreadCount = notifications.filter((n) => n.recipient_role === 'admin' && !n.is_read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'deliveries', label: 'Delivery Sheet', icon: Truck },
    { id: 'shops', label: 'Shops', icon: Store },
    { id: 'rates', label: 'Products & Rates', icon: Tag },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (screenId: string) => {
    setActiveScreen(screenId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrderFromDashboard = (orderId: string) => {
    setSelectedOrderIdForDrawer(orderId);
    setActiveScreen('orders');
  };

  const handleRecordPaymentForShop = (shopId: string) => {
    setPreselectedShopIdForPayment(shopId);
    setActiveScreen('payments');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="no-print sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-textPrimary hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              CL
            </div>
            <div>
              <span className="font-bold text-sm text-textPrimary leading-none block">
                {settings.business_name}
              </span>
              <span className="text-[11px] text-brand font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Distributor Admin Portal</span>
              </span>
            </div>
          </div>
        </div>

        {/* Header Right: Sound Toggle, Notifications */}
        <div className="flex items-center gap-2">
          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={() => updateSettings({ sound_alert_enabled: !settings.sound_alert_enabled })}
            title={settings.sound_alert_enabled ? 'Sound alerts enabled' : 'Sound alerts muted'}
            className={`p-2 rounded-full border transition-colors ${
              settings.sound_alert_enabled
                ? 'border-emerald-200 text-brand bg-emerald-50 hover:bg-emerald-100'
                : 'border-slate-200 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {settings.sound_alert_enabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 rounded-full text-slate-600 hover:text-textPrimary hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1400px] w-full mx-auto">
        {/* Left Sidebar on Desktop */}
        <aside
          className={`no-print fixed inset-y-0 left-0 top-16 z-30 w-64 bg-surface border-r border-border p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary px-3 block mb-2">
              Management Menu
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Shop View Switcher in sidebar */}
          <div className="pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setRole('shop')}
              className="w-full p-2.5 rounded-btn border border-border bg-slate-50 hover:bg-slate-100 text-textPrimary text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4 text-brand" />
              <span>Switch to Shop Mobile View</span>
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop for drawer menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Admin Content Area (max 1200px width inside container) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
          {activeScreen === 'dashboard' && (
            <AdminDashboard
              onNavigate={handleNavigate}
              onSelectOrder={handleSelectOrderFromDashboard}
            />
          )}
          {activeScreen === 'orders' && (
            <AdminOrders initialSelectedOrderId={selectedOrderIdForDrawer} />
          )}
          {activeScreen === 'deliveries' && <AdminDeliverySheet />}
          {activeScreen === 'shops' && (
            <AdminShops onRecordPaymentForShop={handleRecordPaymentForShop} />
          )}
          {activeScreen === 'rates' && <AdminRates />}
          {activeScreen === 'payments' && (
            <AdminPayments preselectedShopId={preselectedShopIdForPayment} />
          )}
          {activeScreen === 'reports' && <AdminReports />}
          {activeScreen === 'settings' && <AdminSettings />}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />
    </div>
  );
};
