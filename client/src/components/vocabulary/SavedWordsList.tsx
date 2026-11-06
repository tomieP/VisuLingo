import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  Trash2,
  Search,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  SavedWord,
  getSavedWords,
  removeWord,
  clearSavedWords,
  toggleWordMastered,
} from '@/utils/storage';
import { speakWord } from '@/utils/speech';

export function SavedWordsList() {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'mastered'>('all');

  // Flashcard Modal State
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const loadWords = () => {
    setSavedWords(getSavedWords());
  };

  useEffect(() => {
    loadWords();
    const handleStorage = () => loadWords();
    window.addEventListener('visulingo_saved_words_changed', handleStorage);
    return () => window.removeEventListener('visulingo_saved_words_changed', handleStorage);
  }, []);

  const handleRemove = (id: string, word: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa từ "${word}" khỏi sổ tay?`)) {
      removeWord(id);
      loadWords();
    }
  };

  const handleToggleMastered = (id: string) => {
    toggleWordMastered(id);
    loadWords();
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách từ vựng đã lưu?')) {
      clearSavedWords();
      setSavedWords([]);
    }
  };

  const masteredCount = savedWords.filter((w) => w.isMastered).length;
  const learningCount = savedWords.length - masteredCount;

  // Filtered list
  const filtered = savedWords.filter((w) => {
    const matchSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.meaningVi.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (filterMode === 'learning') return !w.isMastered;
    if (filterMode === 'mastered') return !!w.isMastered;
    return true;
  });

  // Start Flashcard Deck
  const handleStartFlashcard = () => {
    if (savedWords.length === 0) return;
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setIsFlashcardOpen(true);
  };

  const currentFlashcard = savedWords[currentCardIndex];

  return (
    <div className="space-y-5">
      {/* 1. Stat Summary Bar & Flashcard Action CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-[#161D2B]/90 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tổng từ vựng
            </span>
            <span className="text-2xl font-black text-white">{savedWords.length}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#161D2B]/90 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Đã thuộc lòng
            </span>
            <span className="text-2xl font-black text-emerald-400">{masteredCount}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartFlashcard}
          disabled={savedWords.length === 0}
          className="p-4 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Layers className="w-5 h-5" />
          <div className="text-left">
            <span className="text-sm block font-black leading-tight">Luyện Flashcard</span>
            <span className="text-[10px] block opacity-80 font-bold">Lật thẻ phản xạ nhanh</span>
          </div>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#161D2B]/70 border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm từ vựng hoặc nghĩa tiếng Việt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterMode === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({savedWords.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('learning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterMode === 'learning'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Cần ôn ({learningCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('mastered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterMode === 'mastered'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Đã thuộc ({masteredCount})
          </button>

          {savedWords.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors ml-1"
              title="Xóa toàn bộ từ vựng"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#161D2B]/60 rounded-3xl border border-white/10 p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-300 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Chưa tìm thấy từ vựng nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'Thử tìm với từ khóa khác hoặc bấm tất cả để xem danh sách.'
              : 'Hãy chụp ảnh đồ vật để lưu từ mới vào sổ tay Snapbook!'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all mt-2"
          >
            <span>Mở Camera chụp ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* 4. Word Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all flex gap-3.5 items-start group select-none ${
                item.isMastered
                  ? 'bg-[#161D2B]/60 border-emerald-500/30'
                  : 'bg-[#161D2B]/90 border-white/10 hover:border-amber-400/40'
              }`}
            >
              {/* Photo Thumbnail */}
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border border-white/15 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-300">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}

              {/* Info Column */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base capitalize text-white">
                      {item.word}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakWord(item.word)}
                      className="p-1 rounded-full hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mastered toggle badge */}
                  <button
                    type="button"
                    onClick={() => handleToggleMastered(item.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      item.isMastered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{item.isMastered ? 'Đã thuộc' : 'Đánh dấu thuộc'}</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400 block">{item.ipa}</span>

                <p className="text-xs font-semibold text-amber-300 line-clamp-1">
                  {item.meaningVi}
                </p>

                {item.example && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    "{item.example}"
                  </p>
                )}
              </div>

              {/* Delete single button */}
              <button
                type="button"
                onClick={() => handleRemove(item.id, item.word)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
                title="Xóa từ này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          5. FULLSCREEN FLASHCARD STUDY DECK MODAL
      ======================================================== */}
      {isFlashcardOpen && currentFlashcard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0E131F] border border-white/15 rounded-[36px] p-6 shadow-2xl text-white space-y-5 flex flex-col">
            {/* Flashcard Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Flashcard Luyện tập
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({currentCardIndex + 1}/{savedWords.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsFlashcardOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Flashcard Body (3D Flip Simulation) */}
            <div
              onClick={() => {
                setIsCardFlipped(!isCardFlipped);
                if (!isCardFlipped) speakWord(currentFlashcard.word);
              }}
              className="relative w-full aspect-4/3 rounded-3xl bg-[#161D2B] border-2 border-amber-400/30 hover:border-amber-400 shadow-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none group transition-all"
            >
              {!isCardFlipped ? (
                /* Mặt trước (Ảnh + Gợi ý) */
                <div className="space-y-3 flex flex-col items-center">
                  {currentFlashcard.photoUrl && (
                    <img
                      src={currentFlashcard.photoUrl}
                      alt=""
                      className="w-28 h-28 rounded-2xl object-cover shadow-lg border border-white/20"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-300">Đồ vật này tiếng Anh là gì?</h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      (Chạm vào thẻ để lật xem từ vựng & nghe phát âm)
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Chạm để lật thẻ
                  </span>
                </div>
              ) : (
                /* Mặt sau (Từ vựng + IPA + Nghĩa + Audio) */
                <div className="space-y-3 animate-in zoom-in-95 duration-150">
                  <span className="text-3xl font-black text-amber-300 capitalize tracking-tight block">
                    {currentFlashcard.word}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      {currentFlashcard.ipa}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(currentFlashcard.word);
                      }}
                      className="p-1 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-base font-bold text-white">
                    {currentFlashcard.meaningVi}
                  </p>
                  {currentFlashcard.example && (
                    <p className="text-xs text-slate-400 italic max-w-xs">
                      "{currentFlashcard.example}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Deck Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (currentCardIndex > 0) {
                    setCurrentCardIndex(currentCardIndex - 1);
                    setIsCardFlipped(false);
                  }
                }}
                disabled={currentCardIndex === 0}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Mark as review
                    if (currentCardIndex < savedWords.length - 1) {
                      setCurrentCardIndex(currentCardIndex + 1);
                      setIsCardFlipped(false);
                    } else {
                      setIsFlashcardOpen(false);
                      alert('Chúc mừng bạn đã hoàn thành bộ thẻ Flashcard hôm nay! 🔥');
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all cursor-pointer"
                >
                  Cần ôn lại
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleToggleMastered(currentFlashcard.id);
                    if (currentCardIndex < savedWords.length - 1) {
                      setCurrentCardIndex(currentCardIndex + 1);
                      setIsCardFlipped(false);
                    } else {
                      setIsFlashcardOpen(false);
                      alert('Tuyệt vời! Bạn đã ghi nhớ toàn bộ từ vựng và củng cố chuỗi streak! 🔥');
                    }
                  }}
                  className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                >
                  Đã nhớ từ này ✓
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (currentCardIndex < savedWords.length - 1) {
                    setCurrentCardIndex(currentCardIndex + 1);
                    setIsCardFlipped(false);
                  }
                }}
                disabled={currentCardIndex === savedWords.length - 1}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
