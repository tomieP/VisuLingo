import { SavedWord, getSavedWords, removeWord } from '@/utils/storage';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';

export function SavedWordsList() {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    setSavedWords(getSavedWords());
  }, []);

  const handleRemove = (id: string) => {
    removeWord(id);
    setSavedWords(getSavedWords());
    addToast('Word removed', 'info');
  };

  if (savedWords.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <p className="mt-4 text-gray-500">No saved words yet</p>
        <p className="text-sm text-gray-400">Words you save from image analysis will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Saved Words ({savedWords.length})</h3>
      <ul className="space-y-2">
        {savedWords.map((word) => (
          <li key={word.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{word.word}</p>
              <p className="text-sm text-gray-500 truncate">{word.meaningVi}</p>
              {word.example && (
                <p className="text-xs text-gray-400 italic truncate">"{word.example}"</p>
              )}
            </div>
            <button
              onClick={() => handleRemove(word.id)}
              className="text-red-500 hover:text-red-700 p-2"
              aria-label={`Remove ${word.word}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}