import { SavedWordsList } from '@/components/vocabulary/SavedWordsList';
import { saveWord } from '@/utils/storage';

function SavedWordsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Saved Words</h1>
          <p className="text-gray-500 mt-1">Your personal vocabulary collection</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SavedWordsList />
      </main>
    </div>
  );
}

export default SavedWordsPage;