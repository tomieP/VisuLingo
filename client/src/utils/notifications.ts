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

const NOTIFICATIONS_KEY = 'visulingo_smart_notifications';

const BANNED_NOTIF_IDS = new Set(['notif-1', 'notif-2', 'notif-3', 'notif-4']);
const BANNED_ACTOR_NAMES = new Set([
  'Minh Quân',
  'Khánh Linh',
  'Thành Nam',
  'Hương Ly',
  'Tuấn Anh',
  'Mai Chi',
]);

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed: AppNotification[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const filtered = parsed.filter(
      (n) => !BANNED_NOTIF_IDS.has(n.id) && (!n.actor || !BANNED_ACTOR_NAMES.has(n.actor.name))
    );

    if (filtered.length !== parsed.length) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
    }

    return filtered;
  } catch {
    return [];
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

export function addNotification(
  notif: Omit<AppNotification, 'id' | 'timeAgo' | 'isRead'> & { id?: string; timeAgo?: string }
): AppNotification {
  const notifs = getNotifications();
  const newNotif: AppNotification = {
    id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: notif.type,
    actor: notif.actor,
    text: notif.text,
    timeAgo: notif.timeAgo || 'Vừa xong',
    isRead: false,
    snapThumbnail: notif.snapThumbnail,
    vocabWords: notif.vocabWords,
    actionLabel: notif.actionLabel,
    actionType: notif.actionType,
    actionCompleted: false,
  };

  // Đưa thông báo mới nhất lên đầu danh sách
  notifs.unshift(newNotif);
  // Giữ tối đa 50 thông báo gần nhất
  const trimmed = notifs.slice(0, 50);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event('visulingo_notifications_changed'));

  // Bắn sự kiện hiển thị Toast nổi trên màn hình
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('visulingo_new_notification_toast', { detail: newNotif }));
  }

  return newNotif;
}
