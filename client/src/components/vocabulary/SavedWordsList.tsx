import { SavedWord, getSavedWords, removeWord, clearSavedWords } from '@/utils/storage';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  Trash2,
  Search,
  BookOpen,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { speakWord } from '@/utils/speech';

export function SavedWordsList() {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedWords(getSavedWords());

    const handleStorage = () => setSavedWords(getSavedWords());
    window.addEventListener('visulingo_saved_words_changed', handleStorage);
    return () => window.removeEventListener('visulingo_saved_words_changed', handleStorage);
  }, []);

  const handleRemove = (id: string, word: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa từ "${word}" khỏi sổ tay?`)) {
      removeWord(id);
      setSavedWords(getSavedWords());
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách từ vựng đã lưu?')) {
      clearSavedWords();
      setSavedWords([]);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (savedWords.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 opacity-70" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Sổ từ vựng đang trống</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
          Hãy tải lên một bức ảnh bất kỳ và nhấn "Lưu từ này" để xây dựng vốn từ cá nhân của bạn.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:scale-105"
        >
          <span>Khám phá từ vựng qua ảnh ngay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const filtered = savedWords.filter(
    (w) =>
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.meaningVi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Control Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng (tiếng Anh hoặc tiếng Việt)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all"
          />
        </div>

        {/* Study Mode & Clear All Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStudyMode(!studyMode);
              setRevealedIds(new Set());
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all border ${
              studyMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Ẩn nghĩa để ôn tập từ vựng như flashcard"
          >
            {studyMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{studyMode ? 'Thoát chế độ đố' : 'Chế độ ôn tập Flashcard'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
            title="Xóa toàn bộ sổ từ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Words Grid */}
      <div className="grid sm:grid-cols-2 gap-3.5">
        {filtered.map((item) => {
          const isRevealed = revealedIds.has(item.id);
          const showMeaning = !studyMode || isRevealed;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h4 className="text-xl font-bold text-slate-900 capitalize tracking-tight">
                      {item.word}
                    </h4>
                    {item.ipa && (
                      <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {item.ipa.startsWith('/') ? item.ipa : `/${item.ipa}/`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => speakWord(item.word)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.word)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Xóa từ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Meaning section (Interactive toggle in study mode) */}
                <div className="mt-2.5">
                  {showMeaning ? (
                    <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.meaningVi}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleReveal(item.id)}
                      className="w-full text-left text-xs font-semibold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 hover:bg-amber-100/70 transition-colors flex items-center justify-between"
                    >
                      <span>❓ Bấm để lật xem nghĩa tiếng Việt</span>
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  )}
                </div>

                {/* Example sentence */}
                {item.example && (
                  <p className="mt-2 text-xs text-slate-500 italic line-clamp-2 pl-2 border-l-2 border-slate-200">
                    "{item.example}"
                  </p>
                )}
              </div>

              {/* Saved Date */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Đã lưu:{' '}
                  {new Date(item.savedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-indigo-600 font-medium">#vocabulary</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
