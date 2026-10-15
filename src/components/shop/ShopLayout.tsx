import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShopHome } from './ShopHome';
import { ReviewOrderModal } from './ReviewOrderModal';
import { OrderPlacedScreen } from './OrderPlacedScreen';
import { ShopOrders } from './ShopOrders';
import { ShopLedger } from './ShopLedger';
import { ShopProfile } from './ShopProfile';
import { StandingOrdersModal } from './StandingOrdersModal';
import { ConsumerLogin } from './ConsumerLogin';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { ShoppingBag, FileText, BookOpen, User, Bell } from 'lucide-react';

export const ShopLayout: React.FC = () => {
  const { currentShop, notifications, t } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'ledger' | 'profile'>('home');
  const [cartForReview, setCartForReview] = useState<Record<string, number> | null>(null);
  const [justPlacedOrderId, setJustPlacedOrderId] = useState<string | null>(null);
  const [showStandingModal, setShowStandingModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  if (!isLoggedIn) {
    return <ConsumerLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Count unread shop notifications
  const unreadCount = notifications.filter(
    (n) => n.recipient_role === 'shop' && (!n.recipient_shop_id || n.recipient_shop_id === currentShop.id) && !n.is_read
  ).length;

  const handleReviewOrder = (cart: Record<string, number>) => {
    setCartForReview(cart);
  };

  const handleOrderSuccess = (orderId: string) => {
    setCartForReview(null);
    setJustPlacedOrderId(orderId);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex justify-center">
      {/* 480px Centered Container for Mobile-First Shop Experience */}
      <div className="w-full max-w-[480px] min-h-screen bg-background border-x border-border flex flex-col relative shadow-sm">
        {/* Top App Header */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
              CL
            </div>
            <div>
              <div className="text-sm font-bold text-textPrimary leading-none">ChickenLink</div>
              <div className="text-[11px] text-brand font-medium truncate max-w-[200px] mt-0.5">
                {currentShop.name}
              </div>
            </div>
          </div>

          {/* Right Action: Notification Bell */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowNotificationDrawer(true)}
              className="relative p-2 rounded-full text-slate-600 hover:text-textPrimary hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
              )}
            </button>
          </div>
        </header>

        {/* Main Tab Content */}
        <main className="flex-1">
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
                  onLogout={() => setIsLoggedIn(false)}
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

        {/* Bottom Tab Bar with 4 Tabs */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 px-2 shadow-sm">
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
    </div>
  );
};
