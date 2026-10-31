import { useState, useEffect } from 'react';
import { X, Bell, Flame, MessageCircle, Sparkles, CheckCheck } from 'lucide-react';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/utils/notifications';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifs = () => setNotifications(getNotifications());

  useEffect(() => {
    loadNotifs();
    window.addEventListener('visulingo_notifications_changed', loadNotifs);
    return () => window.removeEventListener('visulingo_notifications_changed', loadNotifs);
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  const handleItemClick = (notif: AppNotification) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
  };

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'reaction':
        return <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />;
      case 'comment':
        return <MessageCircle className="w-3 h-3 text-blue-400" />;
      case 'snap':
        return <Sparkles className="w-3 h-3 text-purple-400" />;
      case 'streak':
        return <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161D2B] border border-white/15 rounded-[32px] p-5 shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                Thông báo
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white font-black">
                    {unreadCount} mới
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Hoạt động từ bạn bè và hệ thống</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="p-1.5 text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Đã đọc hết</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Chưa có thông báo nào mới.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-white/3 border-white/5 opacity-75 hover:opacity-100 hover:bg-white/5'
                    : 'bg-amber-400/10 border-amber-400/30 hover:bg-amber-400/15'
                }`}
              >
                {/* Actor Avatar with event badge */}
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={notif.actor.avatar}
                    alt={notif.actor.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#161D2B] border border-white/10 shadow-xs">
                    {renderIcon(notif.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs text-slate-200 leading-snug">
                    <strong className="text-white font-bold">{notif.actor.name}</strong>{' '}
                    <span>{notif.text}</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {notif.timeAgo}
                  </span>
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1 shadow-xs shadow-amber-400/50" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
