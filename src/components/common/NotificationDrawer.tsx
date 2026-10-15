import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Check, X } from 'lucide-react';
import { formatDateTimeIST } from '../../lib/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { role, currentShop, notifications, markNotificationRead, clearAllNotifications } = useApp();

  if (!isOpen) return null;

  // Filter relevant notifications for current view
  const filteredNotifications = notifications.filter((n) => {
    if (role === 'admin') {
      return n.recipient_role === 'admin';
    }
    return n.recipient_role === 'shop' && (!n.recipient_shop_id || n.recipient_shop_id === currentShop.id);
  });

  const unreadCount = filteredNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-surface shadow-xl flex flex-col border-l border-border">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand" />
              <h2 className="text-base font-semibold text-textPrimary">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-brand text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  title="Mark all as read"
                  className="text-xs text-textSecondary hover:text-brand font-medium flex items-center gap-1 p-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-textSecondary">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !notif.is_read ? 'bg-brand-light/30 border-l-4 border-brand' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-textPrimary">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-textSecondary mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    {formatDateTimeIST(notif.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
