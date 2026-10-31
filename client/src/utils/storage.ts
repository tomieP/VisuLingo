const STORAGE_KEY = 'visulingo_saved_words';

export interface SavedWord {
  id: string;
  word: string;
  meaningVi: string;
  ipa: string;
  example: string;
  imageId?: string;
  savedAt: string;
}

export function getSavedWords(): SavedWord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
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
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('visulingo_saved_words_changed', { detail: 0 }));
  } catch (error) {
    console.error('Failed to clear words:', error);
  }
}
