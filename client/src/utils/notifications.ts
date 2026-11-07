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

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const parsed: AppNotification[] = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((n) => !['notif-1', 'notif-2', 'notif-3', 'notif-4'].includes(n.id))
      : [];
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
