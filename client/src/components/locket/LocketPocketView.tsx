import { useState, useEffect } from 'react';
import {
  SavedWord,
  getSavedWords,
  removeWord,
  toggleWordMastered,
} from '@/utils/storage';
import {
  Volume2,
  Trash2,
  Search,
  Flame,
  BookmarkCheck,
  CheckCircle2,
  FolderPlus,
  Images,
  Sparkles,
  Camera,
  RotateCw,
  X,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';
import { speakWord } from '@/utils/speech';
import { getAlbums, getPhotos, Album, SnapPhoto } from '@/utils/albums';
import { CreateAlbumModal } from './CreateAlbumModal';
import { AlbumDetailModal } from './AlbumDetailModal';
import { AddPhotoToAlbumModal } from './AddPhotoToAlbumModal';

interface LocketPocketViewProps {
  initialSubTab?: 'albums' | 'words';
}

export function LocketPocketView({ initialSubTab = 'albums' }: LocketPocketViewProps) {
  const [subTab, setSubTab] = useState<'albums' | 'words'>(initialSubTab);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<SnapPhoto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'needs_review' | 'mastered'>('all');

  // Flashcard Deck State
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Modal states
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumForAddingPhoto, setAlbumForAddingPhoto] = useState<Album | null>(null);

  const loadData = () => {
    setSavedWords(getSavedWords());
    setAlbums(getAlbums());
    setPhotos(getPhotos());
  };

  useEffect(() => {
    loadData();
    const handleWords = () => setSavedWords(getSavedWords());
    const handleAlbums = () => {
      setAlbums(getAlbums());
      setPhotos(getPhotos());
    };

    window.addEventListener('visulingo_saved_words_changed', handleWords);
    window.addEventListener('visulingo_albums_changed', handleAlbums);

    return () => {
      window.removeEventListener('visulingo_saved_words_changed', handleWords);
      window.removeEventListener('visulingo_albums_changed', handleAlbums);
    };
  }, []);

  const handlePlayAudio = (word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlayingWord(word);
    speakWord(word, () => setPlayingWord(null));
  };

  const handleToggleMastered = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleWordMastered(id);
    setSavedWords(getSavedWords());
  };

  const handleRemoveWord = (id: string, word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Xóa từ "${word}" khỏi Snapbook của bạn?`)) {
      removeWord(id);
      setSavedWords(getSavedWords());
    }
  };

  // Calculations
  const masteredCount = savedWords.filter((w) => w.isMastered).length;
  const reviewCount = savedWords.length - masteredCount;
  const retentionPercent = savedWords.length > 0 ? Math.round((masteredCount / savedWords.length) * 100) : 0;

  // Filtered words
  const filteredWords = savedWords.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.meaningVi.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'needs_review') return !w.isMastered;
    if (filterMode === 'mastered') return !!w.isMastered;
    return true;
  });

  const deckWords = filterMode === 'needs_review'
    ? savedWords.filter((w) => !w.isMastered)
    : savedWords;

  const currentDeckWord = deckWords[currentDeckIndex] || deckWords[0];

  const handleDeckNext = () => {
    setIsFlipped(false);
    setCurrentDeckIndex((prev) => (prev + 1) % deckWords.length);
  };


  return (
    <div className="max-w-md mx-auto space-y-4 pb-28 text-white">
      {/* 1. Intelligent Memory & Snapbook Header */}
      <div className="p-4 sm:p-5 rounded-[32px] bg-gradient-to-b from-[#161D2B] via-[#111722] to-[#0B0F17] border border-white/10 shadow-2xl relative overflow-hidden space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  localStorage.getItem('visulingo_avatar') ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-black/80 border border-amber-400 text-[9px] font-black text-amber-300">
                5🔥
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base tracking-tight text-white">Snapbook Tri Thức</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black">
                  SRS Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {albums.length} Album • {photos.length} Khoảnh khắc • {savedWords.length} Từ vựng
              </p>
            </div>
          </div>

          {/* Quick Memory Retention Gauge */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-medium">Độ bền trí nhớ</span>
            <div className="flex items-center gap-1 text-emerald-400 font-black text-base">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{retentionPercent}%</span>
            </div>
          </div>
        </div>

        {/* Smart Memory Retention Bar */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-bold flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
              Tiến độ ghi nhớ thông minh:
            </span>
            <span className="text-amber-400 font-bold">{masteredCount}/{savedWords.length} từ</span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
            <div
              style={{ width: `${retentionPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              title="Đã thuộc lòng"
            />
            <div
              style={{ width: `${100 - retentionPercent}%` }}
              className="h-full bg-amber-400/60 transition-all duration-500"
              title="Cần ôn tập"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {masteredCount} Thuộc lòng
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {reviewCount} Cần kích hoạt hôm nay
            </span>
          </div>
        </div>
      </div>

      {/* 2. Seamless Sub-tab Switcher: Albums vs Words */}
      <div className="p-1 rounded-2xl bg-[#161D2B]/90 border border-white/10 flex gap-1">
        <button
          type="button"
          onClick={() => setSubTab('albums')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'albums'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Images className="w-4 h-4" />
          <span>Bộ sưu tập Album ({albums.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('words')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'words'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Sổ từ & Flashcard ({savedWords.length})</span>
        </button>
      </div>

      {/* ========================================================
          VIEW 1: ALBUMS GALLERY WITH CREATE & ADD PHOTOS
      ======================================================== */}
      {subTab === 'albums' && (
        <div className="space-y-3.5">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Album ảnh theo chủ đề
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAlbumForAddingPhoto(albums[0] || null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Thêm ảnh khoảnh khắc vào Album"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Thêm ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateAlbum(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-amber-300 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Tạo Album</span>
              </button>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {albums.map((album) => {
              const albumPhotos = photos.filter((p) => p.albumId === album.id);
              const cover = albumPhotos[0]?.imageUrl;
              const wordCount = albumPhotos.reduce((acc, p) => acc + p.vocabTags.length, 0);

              return (
                <div
                  key={album.id}
                  onClick={() => setSelectedAlbum(album)}
                  className="group relative bg-[#161D2B] border border-white/10 hover:border-amber-400/80 rounded-[28px] overflow-hidden p-4 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                >
                  {/* Album Cover Thumbnail */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/60 mb-3 border border-white/5">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-slate-400 gap-1">
                        <Sparkles className="w-6 h-6 opacity-40 text-amber-400" />
                        <span className="text-[10px]">Chưa có ảnh</span>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 text-2xl p-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
                      {album.emoji}
                    </span>

                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                      {albumPhotos.length} ảnh
                    </span>
                  </div>

                  {/* Album Meta */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                      {album.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {album.description || `${wordCount} từ vựng đã gắn nhãn`}
                    </p>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">
                      {wordCount} từ vựng
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlbumForAddingPhoto(album);
                        }}
                        className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-[10px] font-bold transition-all cursor-pointer"
                        title="Thêm ảnh vào album này"
                      >
                        + Thêm ảnh
                      </button>
                      <span className="text-amber-300 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                        Xem →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: SMART VOCABULARY & FLASHCARDS
      ======================================================== */}
      {subTab === 'words' && (
        <div className="space-y-3.5">
          {/* Interactive Flashcard 3D Deck CTA Button */}
          {deckWords.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setCurrentDeckIndex(0);
                setIsFlipped(false);
                setIsDeckOpen(true);
              }}
              className="w-full p-4 rounded-[26px] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-slate-950" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black uppercase tracking-tight">
                      Luyện Flashcard 3D Thông Minh
                    </span>
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  </div>
                  <span className="text-[11px] font-semibold opacity-85 block">
                    {reviewCount > 0 ? `${reviewCount} từ cần kích hoạt lại trí nhớ` : `Toàn bộ ${savedWords.length} từ trong sổ`}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          )}

          {/* Search & Filter Pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng hoặc nghĩa tiếng Việt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-2xl bg-[#161D2B] border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterMode === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({savedWords.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('needs_review')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  filterMode === 'needs_review'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 border border-white/10 text-amber-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Cần ôn tập ({reviewCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('mastered')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  filterMode === 'mastered'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 border border-white/10 text-emerald-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã thuộc lòng ({masteredCount})</span>
              </button>
            </div>
          </div>

          {/* Words List */}
          {filteredWords.length === 0 ? (
            <div className="p-8 text-center rounded-[28px] bg-[#161D2B]/50 border border-white/10 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-amber-400 opacity-60" />
              <p className="text-sm font-bold text-white">Chưa tìm thấy từ vựng nào</p>
              <p className="text-xs text-slate-400">
                Hãy dùng AI Camera quét các đồ vật xung quanh để nạp từ vựng mới vào Snapbook!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className={`p-3.5 rounded-[24px] border transition-all flex items-start justify-between gap-3 group ${
                    word.isMastered
                      ? 'bg-[#161D2B]/70 border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-[#161D2B] border-white/10 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Audio speaker button */}
                    <button
                      type="button"
                      onClick={(e) => handlePlayAudio(word.word, e)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
                        playingWord === word.word
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-white/5 hover:bg-white/15 text-amber-300'
                      }`}
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-white capitalize tracking-tight">
                          {word.word}
                        </span>
                        {word.ipa && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {word.ipa}
                          </span>
                        )}
                        {word.isMastered ? (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black text-emerald-400">
                            Đã thuộc ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full bg-amber-400/15 border border-amber-400/30 text-[9px] font-black text-amber-300">
                            Cần ôn 🔥
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        {word.meaningVi}
                      </p>

                      {word.example && (
                        <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                          "{word.example}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleMastered(word.id, e)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        word.isMastered
                          ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-400/10'
                          : 'text-slate-400 hover:text-amber-400 hover:bg-white/10'
                      }`}
                      title={word.isMastered ? 'Đánh dấu cần ôn tập' : 'Đánh dấu đã thuộc lòng'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveWord(word.id, word.word, e)}
                      className="p-1.5 rounded-full text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Xóa từ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          FULL-SCREEN INTERACTIVE 3D FLASHCARD STUDY DECK
      ======================================================== */}
      {isDeckOpen && currentDeckWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm flex flex-col items-center space-y-4">
            {/* Top Deck Header */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Thẻ {currentDeckIndex + 1} / {deckWords.length}
              </span>
              <button
                type="button"
                onClick={() => setIsDeckOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-80 rounded-[36px] bg-[#161D2B] border-2 border-amber-400/60 p-6 flex flex-col justify-between items-center text-center shadow-2xl cursor-pointer relative overflow-hidden transition-all duration-300 hover:border-amber-400 group select-none"
            >
              {/* Context Photo Watermark if available */}
              {currentDeckWord.photoUrl && (
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <img src={currentDeckWord.photoUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Card Badge */}
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400 z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {isFlipped ? 'Mặt sau: Nghĩa & Phát âm' : 'Mặt trước: Thử đoán nghĩa'}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  Chạm để lật
                </span>
              </div>

              {/* Card Center Content */}
              <div className="my-auto space-y-2 z-10">
                {!isFlipped ? (
                  <>
                    <h2 className="text-3xl font-black text-white capitalize tracking-tight">
                      {currentDeckWord.word}
                    </h2>
                    {currentDeckWord.ipa && (
                      <p className="text-sm text-amber-400 font-mono">
                        {currentDeckWord.ipa}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 pt-2">
                      (Nghĩ trong đầu nghĩa tiếng Việt trước khi lật nhé!)
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                      Ý nghĩa tiếng Việt
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      {currentDeckWord.meaningVi}
                    </h2>
                    {currentDeckWord.example && (
                      <p className="text-xs text-slate-300 italic pt-1 max-w-xs">
                        "{currentDeckWord.example}"
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Pronunciation audio trigger */}
              <button
                type="button"
                onClick={(e) => handlePlayAudio(currentDeckWord.word, e)}
                className="z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Phát âm giọng bản xứ</span>
              </button>
            </div>

            {/* SRS Recall Action Controls */}
            <div className="w-full grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (currentDeckWord.isMastered) {
                    toggleWordMastered(currentDeckWord.id);
                    setSavedWords(getSavedWords());
                  }
                  handleDeckNext();
                }}
                className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Cần ôn lại</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!currentDeckWord.isMastered) {
                    toggleWordMastered(currentDeckWord.id);
                    setSavedWords(getSavedWords());
                  }
                  handleDeckNext();
                }}
                className="py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã nhớ từ này ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={showCreateAlbum}
        onClose={() => setShowCreateAlbum(false)}
        onCreated={() => loadData()}
      />

      {/* Album Detail Modal (View photos, delete album, add photo) */}
      <AlbumDetailModal
        album={selectedAlbum}
        photos={selectedAlbum ? photos.filter((p) => p.albumId === selectedAlbum.id) : []}
        isOpen={!!selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
        onUpdated={() => loadData()}
      />

      {/* Direct Add Photo Modal for Albums */}
      <AddPhotoToAlbumModal
        album={albumForAddingPhoto}
        isOpen={!!albumForAddingPhoto}
        onClose={() => setAlbumForAddingPhoto(null)}
        onPhotoAdded={() => loadData()}
      />
    </div>
  );
}
