import { Vocabulary } from '@/types/vocabulary';
import { Button } from '@/components/common/Button';
import { saveWord } from '@/utils/storage';
import { useToast } from '@/components/common/Toast';

interface VocabCardProps {
  vocab: Vocabulary;
  imageId?: string;
  onSaved?: () => void;
}

export function VocabCard({ vocab, imageId, onSaved }: VocabCardProps) {
  const { addToast } = useToast();

  const handleSave = () => {
    const savedWord = {
      id: crypto.randomUUID(),
      word: vocab.word,
      meaningVi: vocab.meaningVi,
      ipa: vocab.ipa,
      example: vocab.example,
      imageId,
      savedAt: new Date().toISOString(),
    };
    saveWord(savedWord);
    addToast(`Saved "${vocab.word}"`, 'success');
    onSaved?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {vocab.word}
            {vocab.ipa && (
              <span className="text-lg font-normal text-gray-500">/{vocab.ipa}/</span>
            )}
          </h3>
          <p className="mt-2 text-lg text-gray-700">{vocab.meaningVi}</p>
          {vocab.example && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="italic text-gray-600">"{vocab.example}"</p>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleSave}>
          Save Word
        </Button>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
        Source: {vocab.source === 'api' ? 'Dictionary API' : 'Manual entry'}
      </div>
    </div>
  );
}