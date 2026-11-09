import { incrementChallengeProgress } from './challenges';
import api from '@/services/api';

const STORAGE_KEY = 'visulingo_saved_words';

export interface SavedWord {
  id: string;
  word: string;
  meaningVi: string;
  ipa: string;
  example: string;
  imageId?: string;
  photoUrl?: string;
  savedAt: string;
  isMastered?: boolean;
}

export function getSavedWords(): SavedWord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Đồng bộ danh sách từ đã lưu từ CSDL PostgreSQL qua Backend API
 */
export async function syncSavedWordsFromApi(): Promise<SavedWord[]> {
  const token = localStorage.getItem('visulingo_token');
  if (!token) {
    return getSavedWords();
  }

  try {
    const res = await api.get<{ data: any[] }>('/saved-words?page=1&limit=50');
    if (res.data?.data) {
      const currentLocal = getSavedWords();
      const masteredSet = new Set(currentLocal.filter((w) => w.isMastered).map((w) => w.word.toLowerCase()));

      const mapped: SavedWord[] = res.data.data.map((item) => ({
        id: item.id,
        word: item.word,
        meaningVi: item.meaningVi,
        ipa: item.ipa || '',
        example: item.example || '',
        imageId: item.imageId,
        photoUrl: item.imageUrl,
        savedAt: item.savedAt,
        isMastered: masteredSet.has(item.word.toLowerCase()),
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      window.dispatchEvent(new CustomEvent('visulingo_saved_words_changed', { detail: mapped.length }));
      return mapped;
    }
  } catch (err) {
    console.warn('Backend sync for saved words not available, using local cache:', err);
  }

  return getSavedWords();
}

export function isWordSaved(word: string): boolean {
  try {
    const words = getSavedWords();
    const normalized = word.trim().toLowerCase();
    return words.some((w) => w.word.trim().toLowerCase() === normalized);
  } catch {
    return false;
  }
}

export async function saveWord(word: SavedWord): Promise<boolean> {
  try {
    const token = localStorage.getItem('visulingo_token');
    let backendSavedId = word.id;

    if (token) {
      try {
        const res = await api.post<{ id?: string; vocabularyId?: string }>('/saved-words', {
          word: word.word,
          imageId: word.imageId,
        });
        if (res.data?.id) {
          backendSavedId = res.data.id;
        }
      } catch (err: any) {
        if (err?.response?.status === 409) {
          // Từ đã có trong CSDL
          return false;
        }
      }
    }

    const words = getSavedWords();
    const normalized = word.word.trim().toLowerCase();
    const existingIndex = words.findIndex((w) => w.word.trim().toLowerCase() === normalized);

    if (existingIndex === -1) {
      words.unshift({ ...word, id: backendSavedId });
      incrementChallengeProgress('save_words', 1);
      recordDailyStreak();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
      window.dispatchEvent(new CustomEvent('visulingo_saved_words_changed', { detail: words.length }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to save word:', error);
    return false;
  }
}

export function toggleWordMastered(id: string): boolean {
  try {
    const words = getSavedWords();
    const target = words.find((w) => w.id === id);
    if (target) {
      target.isMastered = !target.isMastered;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
      window.dispatchEvent(new CustomEvent('visulingo_saved_words_changed', { detail: words.length }));
      return target.isMastered;
    }
    return false;
  } catch (error) {
    console.error('Failed to toggle mastered:', error);
    return false;
  }
}

export async function removeWord(id: string): Promise<void> {
  try {
    const token = localStorage.getItem('visulingo_token');
    if (token && !id.startsWith('seed-')) {
      try {
        await api.delete(`/saved-words/${id}`);
      } catch (err) {
        console.warn('Backend delete error for saved word:', err);
      }
    }

    const words = getSavedWords().filter((w) => w.id !== id && w.word !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    window.dispatchEvent(new CustomEvent('visulingo_saved_words_changed', { detail: words.length }));
  } catch (error) {
    console.error('Failed to remove word:', error);
  }
}

export function clearSavedWords(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('visulingo_saved_words_changed', { detail: 0 }));
  } catch (error) {
    console.error('Failed to clear words:', error);
  }
}

const STREAK_KEY = 'visulingo_user_streak';
const STREAK_LAST_DATE_KEY = 'visulingo_user_streak_last_date';
const STREAK_HISTORY_KEY = 'visulingo_streak_history';

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export function getUserStreak(): number {
  try {
    const rawCount = localStorage.getItem(STREAK_KEY);
    const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);
    let count = rawCount !== null ? parseInt(rawCount, 10) : 0;
    if (isNaN(count) || count < 0) count = 0;

    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    if (!lastDate) {
      return count;
    }

    // Nếu lần hoạt động gần nhất là hôm nay hoặc hôm qua, streak vẫn được duy trì an toàn
    if (lastDate === today || lastDate === yesterday) {
      return count;
    }

    // Nếu đã bỏ lỡ hơn 1 ngày (lần cuối trước hôm qua), chuỗi streak bị đứt và trở về 0
    if (count !== 0) {
      localStorage.setItem(STREAK_KEY, '0');
      window.dispatchEvent(new Event('visulingo_streak_changed'));
    }
    return 0;
  } catch {
    return 0;
  }
}

export function setUserStreak(streak: number): void {
  const safeStreak = Math.max(0, streak);
  localStorage.setItem(STREAK_KEY, safeStreak.toString());
  if (safeStreak > 0) {
    localStorage.setItem(STREAK_LAST_DATE_KEY, getLocalDateString());
  }
  window.dispatchEvent(new Event('visulingo_streak_changed'));
}

/**
 * Ghi nhận hoạt động học tập trong ngày (chụp snap / lưu từ / hoàn thành thử thách)
 * Tự động tăng chuỗi nếu liên tiếp ngày hôm qua, hoặc bắt đầu 1 nếu sang chuỗi mới
 */
export function recordDailyStreak(): { streak: number; isNewStreakDay: boolean } {
  try {
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();
    const lastDate = localStorage.getItem(STREAK_LAST_DATE_KEY);
    const rawCount = localStorage.getItem(STREAK_KEY);
    let currentStreak = rawCount !== null ? parseInt(rawCount, 10) : 0;
    if (isNaN(currentStreak) || currentStreak < 0) currentStreak = 0;

    // Đã duy trì streak hôm nay rồi
    if (lastDate === today && currentStreak > 0) {
      return { streak: currentStreak, isNewStreakDay: false };
    }

    let newStreak = 1;
    if (lastDate === yesterday && currentStreak > 0) {
      // Giữ lửa liên tiếp sang ngày mới!
      newStreak = currentStreak + 1;
    } else {
      // Bắt đầu chuỗi mới
      newStreak = 1;
    }

    localStorage.setItem(STREAK_KEY, newStreak.toString());
    localStorage.setItem(STREAK_LAST_DATE_KEY, today);

    // Lưu vào lịch sử các ngày giữ streak
    try {
      const historyRaw = localStorage.getItem(STREAK_HISTORY_KEY);
      const history: string[] = historyRaw ? JSON.parse(historyRaw) : [];
      if (!history.includes(today)) {
        history.push(today);
        localStorage.setItem(STREAK_HISTORY_KEY, JSON.stringify(history));
      }
    } catch {}

    window.dispatchEvent(new Event('visulingo_streak_changed'));
    incrementChallengeProgress('maintain_streak', 1);

    return { streak: newStreak, isNewStreakDay: true };
  } catch {
    return { streak: 1, isNewStreakDay: false };
  }
}
