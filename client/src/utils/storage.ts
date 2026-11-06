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

const DEFAULT_SEED_WORDS: SavedWord[] = [
  {
    id: 'seed-1',
    word: 'laptop',
    meaningVi: 'máy tính xách tay',
    ipa: '/ˈlæp.tɒp/',
    example: 'I am typing on my laptop for my English project.',
    photoUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=80',
    savedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isMastered: true,
  },
  {
    id: 'seed-2',
    word: 'atmosphere',
    meaningVi: 'bầu không khí, cảm giác không gian',
    ipa: '/ˈæt.məs.fɪər/',
    example: 'This coffee shop has a very relaxing atmosphere.',
    photoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80',
    savedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isMastered: false,
  },
  {
    id: 'seed-3',
    word: 'croissant',
    meaningVi: 'bánh sừng bò',
    ipa: '/ˈkwæs.ɒ̃/',
    example: 'Freshly baked croissants smell incredible in the morning.',
    photoUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=80',
    savedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isMastered: false,
  },
  {
    id: 'seed-4',
    word: 'fascinating',
    meaningVi: 'hấp dẫn, lôi cuốn, thú vị',
    ipa: '/ˈfæs.ən.eɪ.tɪŋ/',
    example: 'Learning new vocabulary through real-life images is fascinating.',
    photoUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be45c06b?auto=format&fit=crop&w=500&q=80',
    savedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isMastered: true,
  },
  {
    id: 'seed-5',
    word: 'productive',
    meaningVi: 'năng suất, hiệu quả',
    ipa: '/prəˈdʌk.tɪv/',
    example: 'We had a very productive study session today.',
    photoUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80',
    savedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isMastered: false,
  },
];

export function getSavedWords(): SavedWord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_WORDS));
      return DEFAULT_SEED_WORDS;
    }
    const parsed = JSON.parse(data);
    if (parsed.length === 0) {
      return parsed;
    }
    return parsed;
  } catch {
    return DEFAULT_SEED_WORDS;
  }
}

export function isWordSaved(word: string): boolean {
  try {
    const words = getSavedWords();
    const normalized = word.trim().toLowerCase();
    return words.some(w => w.word.trim().toLowerCase() === normalized);
  } catch {
    return false;
  }
}

export function saveWord(word: SavedWord): boolean {
  try {
    const words = getSavedWords();
    const normalized = word.word.trim().toLowerCase();
    const existingIndex = words.findIndex(w => w.word.trim().toLowerCase() === normalized);
    
    if (existingIndex === -1) {
      words.unshift(word);
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
    const target = words.find(w => w.id === id);
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

export function removeWord(id: string): void {
  try {
    const words = getSavedWords().filter(w => w.id !== id && w.word !== id);
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
