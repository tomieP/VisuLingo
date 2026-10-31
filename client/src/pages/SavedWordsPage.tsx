import { Navbar } from '@/components/common/Navbar';
import { SavedWordsList } from '@/components/vocabulary/SavedWordsList';
import { BookOpen } from 'lucide-react';

function SavedWordsPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Bộ sưu tập cá nhân</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sổ từ vựng đã lưu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ôn tập các từ vựng bạn đã phát hiện và lưu lại từ những bức ảnh đời thường.
          </p>
        </div>

        <SavedWordsList />
      </main>
    </div>
  );
}

export default SavedWordsPage;
