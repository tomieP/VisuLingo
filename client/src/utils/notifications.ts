import { saveWord } from './storage';

export interface VocabSnippet {
  word: string;
  meaningVi: string;
}

export interface AppNotification {
  id: string;
  type: 'reaction' | 'comment' | 'snap' | 'vocab_share' | 'streak';
  actor: {
    name: string;
    avatar: string;
    badge?: string;
  };
  text: string;
  timeAgo: string;
  isRead: boolean;
  snapThumbnail?: string;
  vocabWords?: VocabSnippet[];
  actionLabel?: string;
  actionType?: 'reply_reaction' | 'save_words' | 'view_snap' | 'claim_streak';
  actionCompleted?: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'reaction',
    actor: {
      name: 'Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Streak 7🔥',
    },
    text: 'đã thả 🔥 vào Snap "Góc học tập sáng nay"',
    timeAgo: '5 phút trước',
    isRead: false,
    snapThumbnail: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=200&q=80',
    actionLabel: 'Bắn tim lại ❤️',
    actionType: 'reply_reaction',
  },
  {
    id: 'notif-2',
    type: 'vocab_share',
    actor: {
      name: 'Khánh Linh',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      badge: 'Top 1 tuần 🏆',
    },
    text: 'vừa ghim 2 từ mới vào album "Weekend Coffee"',
    timeAgo: '20 phút trước',
    isRead: false,
    snapThumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80',
    vocabWords: [
      { word: 'latte', meaningVi: 'cà phê sữa ý' },
      { word: 'barista', meaningVi: 'người pha chế' },
    ],
    actionLabel: '+ Lưu 2 từ vào sổ',
    actionType: 'save_words',
  },
  {
    id: 'notif-3',
    type: 'comment',
    actor: {
      name: 'Thành Nam',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      badge: 'Streak 4 🔥',
    },
    text: 'đã bình luận: "Bánh này gọi là croissant nè! 🥐"',
    timeAgo: '1 giờ trước',
    isRead: true,
    actionLabel: 'Trả lời 💬',
    actionType: 'view_snap',
  },
  {
    id: 'notif-4',
    type: 'streak',
    actor: {
      name: 'VisuLingo AI',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    },
    text: 'Duy trì chuỗi streak 5 ngày liên tiếp! Bạn đã học chăm chỉ hôm nay.',
    timeAgo: 'Hôm nay',
    isRead: true,
    actionLabel: 'Thắp sáng Streak 🔥',
    actionType: 'claim_streak',
  },
];

const NOTIFICATIONS_KEY = 'visulingo_smart_notifications';

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed: AppNotification[] = JSON.parse(raw);
    if (!parsed[0]?.actionLabel) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return parsed;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function markNotificationAsRead(id: string): void {
  const notifs = getNotifications();
  const target = notifs.find((n) => n.id === id);
  if (target) {
    target.isRead = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event('visulingo_notifications_changed'));
  }
}

export function executeNotificationAction(notifId: string): void {
  const notifs = getNotifications();
  const target = notifs.find((n) => n.id === notifId);
  if (!target) return;

  target.actionCompleted = true;
  target.isRead = true;

  if (target.actionType === 'save_words' && target.vocabWords) {
    target.vocabWords.forEach((vw) => {
      saveWord({
        id: crypto.randomUUID(),
        word: vw.word,
        meaningVi: vw.meaningVi,
        ipa: '',
        example: '',
        savedAt: new Date().toISOString(),
      });
    });
  }

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event('visulingo_notifications_changed'));
  window.dispatchEvent(new Event('visulingo_saved_words_changed'));
}

export function markAllNotificationsAsRead(): void {
  const notifs = getNotifications();
  notifs.forEach((n) => (n.isRead = true));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event('visulingo_notifications_changed'));
}

export function getUnreadNotificationsCount(): number {
  return getNotifications().filter((n) => !n.isRead).length;
}
