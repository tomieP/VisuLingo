import { useState, useEffect } from 'react';
import { X, Flame, Sparkles, CheckCheck, Check, Heart, BookPlus, Trophy } from 'lucide-react';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  executeNotificationAction,
} from '@/utils/notifications';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithFriend?: (friendName: string) => void;
}

export function NotificationsModal({
  isOpen,
  onClose,
  onOpenChatWithFriend,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'vocab'>('all');

  const loadNotifs = () => setNotifications(getNotifications());

  useEffect(() => {
    loadNotifs();
    window.addEventListener('visulingo_notifications_changed', loadNotifs);
    return () => window.removeEventListener('visulingo_notifications_changed', loadNotifs);
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifs =
    activeTab === 'vocab'
      ? notifications.filter((n) => n.type === 'vocab_share' || n.type === 'streak')
      : notifications;

  const handleAction = (e: React.MouseEvent, notif: AppNotification) => {
    e.stopPropagation();
    if (notif.actionType === 'view_snap' && onOpenChatWithFriend) {
      onClose();
      onOpenChatWithFriend(notif.actor.name);
      return;
    }
    executeNotificationAction(notif.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 px-3 sm:px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161D2B]/95 border border-white/15 rounded-[32px] p-4 sm:p-5 shadow-2xl text-white space-y-3.5 max-h-[82vh] flex flex-col backdrop-blur-xl ring-1 ring-white/10">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Hoạt động thông minh</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Tương tác và chia sẻ từ vựng thời gian thực</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đọc hết</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smart Filter Tabs */}
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Tất cả hoạt động
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'vocab'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <BookPlus className="w-3 h-3" />
            <span>Từ vựng & Thưởng</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Chưa có thông báo nào trong mục này.
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3 rounded-2xl border transition-all space-y-2 select-none ${
                  notif.isRead
                    ? 'bg-white/3 border-white/5 opacity-80 hover:opacity-100 hover:bg-white/6'
                    : 'bg-gradient-to-r from-amber-400/10 via-white/5 to-white/5 border-amber-400/30 shadow-md'
                }`}
              >
                {/* Header row of notification item */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={notif.actor.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                      />
                      {notif.type === 'reaction' && (
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#161D2B] border border-amber-400/40">
                          <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        </span>
                      )}
                      {notif.type === 'streak' && (
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#161D2B] border border-amber-400/40">
                          <Trophy className="w-2.5 h-2.5 text-amber-400" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white tracking-tight">
                          {notif.actor.name}
                        </span>
                        {notif.actor.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300">
                            {notif.actor.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">• {notif.timeAgo}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{notif.text}</p>
                    </div>
                  </div>

                  {/* Optional Snap Thumbnail preview */}
                  {notif.snapThumbnail && (
                    <img
                      src={notif.snapThumbnail}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10 ring-1 ring-white/5 shadow-xs"
                    />
                  )}
                </div>

                {/* Vocab preview chips if available */}
                {notif.vocabWords && notif.vocabWords.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pl-10">
                    {notif.vocabWords.map((vw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-amber-300 font-mono"
                      >
                        <strong>{vw.word}</strong>: {vw.meaningVi}
                      </span>
                    ))}
                  </div>
                )}

                {/* Smart Action Button */}
                {notif.actionLabel && (
                  <div className="pt-1 pl-10 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={notif.actionCompleted}
                      onClick={(e) => handleAction(e, notif)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        notif.actionCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm shadow-amber-400/20 active:scale-95'
                      }`}
                    >
                      {notif.actionCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã hoàn thành</span>
                        </>
                      ) : notif.actionType === 'reply_reaction' ? (
                        <>
                          <Heart className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{notif.actionLabel}</span>
                        </>
                      ) : (
                        <span>{notif.actionLabel}</span>
                      )}
                    </button>

                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
