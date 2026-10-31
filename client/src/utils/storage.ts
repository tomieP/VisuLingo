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

export function saveWord(word: SavedWord): void {
  try {
    const words = getSavedWords();
    const exists = words.find(w => w.id === word.id);
    if (!exists) {
      words.push(word);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    }
  } catch (error) {
    console.error('Failed to save word:', error);
  }
}

export function removeWord(id: string): void {
  try {
    const words = getSavedWords().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (error) {
    console.error('Failed to remove word:', error);
  }
}

export function clearSavedWords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear words:', error);
  }
}