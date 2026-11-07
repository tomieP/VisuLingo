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

export function getUserStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  } catch {
    return 0;
  }
}

export function setUserStreak(streak: number): void {
  localStorage.setItem(STREAK_KEY, streak.toString());
  window.dispatchEvent(new Event('visulingo_streak_changed'));
}
