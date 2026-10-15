import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShopHome } from './ShopHome';
import { ReviewOrderModal } from './ReviewOrderModal';
import { OrderPlacedScreen } from './OrderPlacedScreen';
import { ShopOrders } from './ShopOrders';
import { ShopLedger } from './ShopLedger';
import { ShopProfile } from './ShopProfile';
import { StandingOrdersModal } from './StandingOrdersModal';
import { NotificationDrawer } from '../common/NotificationDrawer';
import {
  ShoppingBag,
  FileText,
  BookOpen,
  User,
  Bell,
  Clock,
  LogOut,
  Store,
  ChevronDown,
  Globe,
  UtensilsCrossed,
} from 'lucide-react';
import { Language } from '../../lib/i18n';
import { formatINR } from '../../lib/formatters';

interface ShopLayoutProps {
  onLogout?: () => void;
}

export const ShopLayout: React.FC<ShopLayoutProps> = ({ onLogout }) => {
  const { currentShop, setCurrentShop, shops, notifications, language, setLanguage, t } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'ledger' | 'profile'>('home');
  const [cartForReview, setCartForReview] = useState<Record<string, number> | null>(null);
  const [justPlacedOrderId, setJustPlacedOrderId] = useState<string | null>(null);
  const [showStandingModal, setShowStandingModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Count unread shop notifications
  const unreadCount = notifications.filter(
    (n) =>
      n.recipient_role === 'shop' &&
      (!n.recipient_shop_id || n.recipient_shop_id === currentShop.id) &&
      !n.is_read
  ).length;

  const handleReviewOrder = (cart: Record<string, number>) => {
    setCartForReview(cart);
  };

  const handleOrderSuccess = (orderId: string) => {
    setCartForReview(null);
    setJustPlacedOrderId(orderId);
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-textPrimary">
      {/* ============================================================== */}
      {/* DESKTOP & MOBILE TOP HEADER                                    */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Active Shop */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-base text-textPrimary tracking-tight block leading-none">
                  Chicken Farms
                </span>
                <span className="text-[10px] text-slate-400 font-medium">By BluNet IT Services</span>
              </div>
            </div>

            {/* Shop Badge / Selector */}
            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-2 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60 max-w-[240px] sm:max-w-xs">
              <Store className="w-3.5 h-3.5 text-brand shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-textPrimary block truncate leading-none">
                  {currentShop.name}
                </span>
                <span className="text-[10px] text-brand font-medium">
                  {currentShop.area_route} • Bal: {formatINR(currentShop.outstanding_balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs (Hidden on mobile, visible on tablet/desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setJustPlacedOrderId(null);
                setActiveTab('home');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'home' && !justPlacedOrderId
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-600 hover:text-textPrimary hover:bg-white/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span>{t.order}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJustPlacedOrderId(null);
                setActiveTab('orders');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-600 hover:text-textPrimary hover:bg-white/60'
              }`}
            >
              <FileText className="w-4 h-4 stroke-[2]" />
              <span>{t.orders}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJustPlacedOrderId(null);
                setActiveTab('ledger');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ledger'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-600 hover:text-textPrimary hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4 stroke-[2]" />
              <span>{t.ledger}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJustPlacedOrderId(null);
                setActiveTab('profile');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-slate-600 hover:text-textPrimary hover:bg-white/60'
              }`}
            >
              <User className="w-4 h-4 stroke-[2]" />
              <span>{t.profile}</span>
            </button>
          </nav>

          {/* Right: Language, Notifications & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer appearance-none"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native}
                  </option>
                ))}
              </select>
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setShowNotificationDrawer(true)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-textPrimary hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-white" />
              )}
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out of consumer account"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN DESKTOP / RESPONSIVE CONTENT AREA                         */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {justPlacedOrderId ? (
          <OrderPlacedScreen
            orderId={justPlacedOrderId}
            onViewOrders={() => {
              setJustPlacedOrderId(null);
              setActiveTab('orders');
            }}
            onNewOrder={() => {
              setJustPlacedOrderId(null);
              setActiveTab('home');
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <ShopHome
                onReviewOrder={handleReviewOrder}
                onOpenStandingOrders={() => setShowStandingModal(true)}
              />
            )}
            {activeTab === 'orders' && <ShopOrders />}
            {activeTab === 'ledger' && <ShopLedger />}
            {activeTab === 'profile' && (
              <ShopProfile
                onOpenStandingOrders={() => setShowStandingModal(true)}
                onLogout={onLogout || (() => {})}
              />
            )}
          </>
        )}
      </main>

      {/* Review Order Modal */}
      {cartForReview && (
        <ReviewOrderModal
          isOpen={Boolean(cartForReview)}
          onClose={() => setCartForReview(null)}
          cart={cartForReview}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Standing Orders Modal */}
      {showStandingModal && (
        <StandingOrdersModal
          isOpen={showStandingModal}
          onClose={() => setShowStandingModal(false)}
        />
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />

      {/* ============================================================== */}
      {/* MOBILE BOTTOM TAB BAR (Visible on mobile screens < md)         */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 px-2 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setJustPlacedOrderId(null);
            setActiveTab('home');
          }}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'home' && !justPlacedOrderId
              ? 'text-brand font-bold'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5 stroke-[2]" />
          <span className="text-[11px]">{t.order}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setJustPlacedOrderId(null);
            setActiveTab('orders');
          }}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'orders'
              ? 'text-brand font-bold'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5 stroke-[2]" />
          <span className="text-[11px]">{t.orders}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setJustPlacedOrderId(null);
            setActiveTab('ledger');
          }}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'ledger'
              ? 'text-brand font-bold'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5 stroke-[2]" />
          <span className="text-[11px]">{t.ledger}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setJustPlacedOrderId(null);
            setActiveTab('profile');
          }}
          className={`flex-1 flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'profile'
              ? 'text-brand font-bold'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <User className="w-5 h-5 mb-0.5 stroke-[2]" />
          <span className="text-[11px]">{t.profile}</span>
        </button>
      </nav>
    </div>
  );
};
