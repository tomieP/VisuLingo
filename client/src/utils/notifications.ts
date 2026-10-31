export interface AppNotification {
  id: string;
  type: 'reaction' | 'comment' | 'snap' | 'streak';
  actor: {
    name: string;
    avatar: string;
  };
  text: string;
  timeAgo: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'reaction',
    actor: {
      name: 'Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    text: 'đã thả 🔥 vào bài viết Snap của bạn.',
    timeAgo: '10 phút trước',
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'snap',
    actor: {
      name: 'Khánh Linh',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    },
    text: 'vừa đăng Snap mới trong album "Weekend Coffee & Chill" ☕',
    timeAgo: '35 phút trước',
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'comment',
    actor: {
      name: 'Thành Nam',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    },
    text: 'đã bình luận: "Bánh này gọi là croissant nè! 🥐"',
    timeAgo: '1 giờ trước',
    isRead: true,
  },
  {
    id: 'notif-4',
    type: 'streak',
    actor: {
      name: 'VisuLingo Bot',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    },
    text: 'Chúc mừng bạn đã duy trì chuỗi học 5 ngày liên tiếp 🔥!',
    timeAgo: 'Hôm nay',
    isRead: true,
  },
];

const NOTIFICATIONS_KEY = 'visulingo_notifications';

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
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

export function markAllNotificationsAsRead(): void {
  const notifs = getNotifications();
  notifs.forEach((n) => (n.isRead = true));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event('visulingo_notifications_changed'));
}

export function getUnreadNotificationsCount(): number {
  return getNotifications().filter((n) => !n.isRead).length;
}
