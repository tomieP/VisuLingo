import { useState, useEffect } from 'react';
import {
  SavedWord,
  getSavedWords,
  syncSavedWordsFromApi,
  removeWord,
  toggleWordMastered,
  getUserStreak,
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
  Pencil,
} from 'lucide-react';
import { speakWord } from '@/utils/speech';
import { getAlbums, syncCollectionsFromApi, getPhotos, Album, SnapPhoto } from '@/utils/albums';
import { getCurrentUser, getUserUsername, setUserUsername } from '@/services/authService';
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
  const [userTag, setUserTag] = useState(getUserUsername());
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const loadData = () => {
    setSavedWords(getSavedWords());
    setAlbums(getAlbums());
    setPhotos(getPhotos());
    void syncSavedWordsFromApi().then((words) => {
      if (words && words.length >= 0) setSavedWords(words);
    });
    void syncCollectionsFromApi().then((fetchedAlbums) => {
      if (fetchedAlbums && fetchedAlbums.length >= 0) setAlbums(fetchedAlbums);
    });
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
    const handleUsername = () => setUserTag(getUserUsername());
    window.addEventListener('visulingo_username_changed', handleUsername);

    return () => {
      window.removeEventListener('visulingo_saved_words_changed', handleWords);
      window.removeEventListener('visulingo_albums_changed', handleAlbums);
      window.removeEventListener('visulingo_username_changed', handleUsername);
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

  const currentUser = getCurrentUser();
  const userStreak = getUserStreak();
  const rawName =
    (currentUser?.firstName && currentUser.firstName.trim()) ||
    (currentUser?.email && currentUser.email.split('@')[0]) ||
    (localStorage.getItem('visulingo_display_name') && localStorage.getItem('visulingo_display_name')!.trim()) ||
    'Snapper';
  const userDisplayName = `Sổ tay của ${rawName}`;


  return (
    <div className="max-w-md mx-auto space-y-4 pb-28 text-white">
      {/* 1. Creative Pocket Profile & Stats Header (Clean, Mobile-First & Friendly) */}
      <div className="p-4 sm:p-5 rounded-[28px] bg-gradient-to-br from-[#182030] via-[#121824] to-[#0A0E17] border border-white/10 shadow-xl relative overflow-hidden space-y-3.5">
        {/* Ambient Subtle Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Row: User Avatar, Name, and Flame Streak Capsule */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={
                  localStorage.getItem('visulingo_avatar') ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt="Avatar"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/50 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-950/90 border border-amber-400/70 text-[9px] font-black text-amber-300 shadow flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {userStreak}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1 truncate">
                  <span className="truncate">{userDisplayName}</span>
                </h3>

                {/* Interactive @Username Tag Badge */}
                <button
                  type="button"
                  onClick={() => {
                    setTagInput(userTag);
                    setIsEditingTag(true);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/40 text-[11px] font-mono font-bold text-amber-300 transition-all cursor-pointer group shadow-xs"
                  title="Chạm để đổi tên @tag của bạn"
                >
                  <span>@{userTag}</span>
                  <Pencil className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 text-slate-400 group-hover:text-amber-300" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                <span>{albums.length} Album</span>
                <span>•</span>
                <span>{photos.length} Snaps</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">{savedWords.length} Từ</span>
              </div>
            </div>
          </div>

          {/* Sleek Flame Streak Pill */}
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/15 border border-amber-400/35 text-amber-300 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{userStreak} ngày</span>
          </div>
        </div>

        {/* Bottom Row: Vocab Progress Bar & Micro Chips */}
        {savedWords.length > 0 ? (
          <div className="pt-2.5 border-t border-white/5 space-y-1.5 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã thuộc: {masteredCount}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  <Sparkles className="w-3 h-3" />
                  Cần ôn: {reviewCount}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400">
                {Math.round((masteredCount / (savedWords.length || 1)) * 100)}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((masteredCount / (savedWords.length || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-xs text-slate-400 relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">Chưa có từ nào được lưu. Hãy chụp ảnh đồ vật để bắt đầu tích lũy nhé!</span>
          </div>
        )}
      </div>

      {/* 2. Modern Segmented Tab Control (Locket Glass Style) */}
      <div className="p-1 rounded-2xl bg-[#121824]/90 border border-white/10 backdrop-blur-md flex gap-1 shadow-lg">
        <button
          type="button"
          onClick={() => setSubTab('albums')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'albums'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Images className="w-4 h-4" />
          <span>Bộ sưu tập Album</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              subTab === 'albums'
                ? 'bg-slate-950/20 text-slate-950'
                : 'bg-white/10 text-slate-300'
            }`}
          >
            {albums.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('words')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'words'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Sổ từ & Ôn tập</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              subTab === 'words'
                ? 'bg-slate-950/20 text-slate-950'
                : 'bg-white/10 text-slate-300'
            }`}
          >
            {savedWords.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          VIEW 1: ALBUMS GALLERY WITH CREATE & ADD PHOTOS
      ======================================================== */}
      {subTab === 'albums' && (
        <div className="space-y-3.5">
          {/* Action Bar (Balanced & Intuitive) */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Chủ đề Kỷ Niệm
              </h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400 border border-white/5">
                {albums.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCreateAlbum(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Tạo Album</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAlbumForAddingPhoto(albums[0] || null);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-400/20 cursor-pointer active:scale-95"
                title="Thêm ảnh khoảnh khắc vào Album"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Thêm ảnh</span>
              </button>
            </div>
          </div>

          {/* Albums Grid */}
          {albums.length === 0 ? (
            <div className="p-8 text-center rounded-[28px] bg-[#161D2B]/50 border border-white/10 space-y-3">
              <FolderPlus className="w-10 h-10 mx-auto text-amber-400 opacity-60" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Chưa có bộ sưu tập nào</p>
                <p className="text-xs text-slate-400">
                  Tạo album đầu tiên để gom nhóm các ảnh khoảnh khắc và từ vựng theo chủ đề!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAlbum(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300 transition-all cursor-pointer shadow-md shadow-amber-400/20 active:scale-95"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Tạo Album đầu tiên</span>
              </button>
            </div>
          ) : (
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
          )}
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
                    {reviewCount > 0 ? `${reviewCount} từ cần ôn tập hôm nay` : `Toàn bộ ${savedWords.length} từ trong sổ`}
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
      {/* Modal: Edit @Username Tag */}
      {isEditingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#161D2B] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  @
                </div>
                <h4 className="font-extrabold text-sm text-white">Đổi tên @tag của bạn</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingTag(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-medium">Tên định danh (@username)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xs">@</span>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="ten_cua_ban"
                  autoFocus
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Chỉ dùng chữ cái thường, số, dấu gạch dưới (_) hoặc chấm (.).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingTag(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tagInput.trim()) {
                    const saved = setUserUsername(tagInput);
                    setUserTag(saved);
                    setIsEditingTag(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-amber-400/20"
              >
                Lưu tên @tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
