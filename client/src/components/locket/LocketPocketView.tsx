import { useState, useEffect } from 'react';
import { SavedWord, getSavedWords, removeWord } from '@/utils/storage';
import { Volume2, Trash2, Search, Flame, BookMarked, Eye, EyeOff, FolderPlus, Images, Sparkles } from 'lucide-react';
import { speakWord } from '@/utils/speech';
import { getAlbums, getPhotos, Album, SnapPhoto } from '@/utils/albums';
import { CreateAlbumModal } from './CreateAlbumModal';
import { AlbumDetailModal } from './AlbumDetailModal';

export function LocketPocketView() {
  const [subTab, setSubTab] = useState<'albums' | 'words'>('albums');
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<SnapPhoto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizMode, setQuizMode] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

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

  const handleRemoveWord = (id: string, word: string) => {
    if (window.confirm(`Xóa từ "${word}" khỏi Snapbook của bạn?`)) {
      removeWord(id);
      setSavedWords(getSavedWords());
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

  const filteredWords = savedWords.filter(
    (w) =>
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.meaningVi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24 text-white">
      {/* Profile & Streak Header */}
      <div className="bg-[#161D2B]/90 border border-white/10 rounded-[28px] p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <img
            src={localStorage.getItem('visulingo_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400"
          />
          <div>
            <h3 className="font-extrabold text-base tracking-tight">Snapbook của tôi</h3>
            <p className="text-xs text-slate-400">
              {albums.length} Albums • {photos.length} Ảnh • {savedWords.length} Từ vựng
            </p>
          </div>
        </div>

        {/* Streak badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black">5 Ngày Streak!</span>
        </div>
      </div>

      {/* Sub-tab Switcher: Albums vs Words */}
      <div className="p-1 rounded-2xl bg-[#161D2B] border border-white/10 flex gap-1">
        <button
          type="button"
          onClick={() => setSubTab('albums')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'albums'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Images className="w-3.5 h-3.5" />
          <span>Album ảnh ({albums.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('words')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'words'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>Sổ từ vựng ({savedWords.length})</span>
        </button>
      </div>

      {/* VIEW 1: ALBUMS GALLERY */}
      {subTab === 'albums' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bộ sưu tập theo chủ đề
            </span>
            <button
              type="button"
              onClick={() => setShowCreateAlbum(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-amber-300 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Tạo Album</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {albums.map((album) => {
              const albumPhotos = photos.filter((p) => p.albumId === album.id);
              const cover = albumPhotos[0]?.imageUrl;
              const wordCount = albumPhotos.reduce((acc, p) => acc + p.vocabTags.length, 0);

              return (
                <div
                  key={album.id}
                  onClick={() => setSelectedAlbum(album)}
                  className="group relative bg-[#161D2B] border border-white/10 hover:border-amber-400/80 rounded-[28px] overflow-hidden p-4 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
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
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-500">
                        <Sparkles className="w-6 h-6 opacity-40 text-amber-400" />
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
                      {album.description || `${wordCount} từ vựng đã học`}
                    </p>
                  </div>

                  {/* Words badge */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{wordCount} từ vựng gắn nhãn</span>
                    <span className="text-amber-300 font-bold group-hover:underline">Xem album →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WORDS LIST & QUIZ MODE */}
      {subTab === 'words' && (
        <div className="space-y-3">
          {/* Search & Quiz Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm từ đã lưu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-[#161D2B] border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setQuizMode(!quizMode);
                setRevealedIds(new Set());
              }}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-2xl border transition-all ${
                quizMode
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-[#161D2B] text-slate-300 border-white/10 hover:text-white'
              }`}
              title="Ẩn nghĩa để tự đố bản thân"
            >
              {quizMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{quizMode ? 'Đang đố' : 'Đố vui'}</span>
            </button>
          </div>

          {/* Words List */}
          {savedWords.length === 0 ? (
            <div className="text-center py-12 bg-[#161D2B]/60 border border-white/10 rounded-[32px] p-6 space-y-2">
              <BookMarked className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="text-sm font-bold text-slate-300">Chưa có từ nào trong Snapbook</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Chuyển sang tab Chụp Snap hoặc lướt Snaps bạn bè để lưu từ vựng hay vào đây!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredWords.map((item) => {
                const isRevealed = revealedIds.has(item.id);
                const showMeaning = !quizMode || isRevealed;

                return (
                  <div
                    key={item.id}
                    className="bg-[#161D2B] border border-white/10 hover:border-white/20 rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h4 className="font-extrabold text-base text-white capitalize tracking-tight">
                          {item.word}
                        </h4>
                        {item.ipa && (
                          <span className="text-[11px] font-mono text-amber-300">
                            {item.ipa}
                          </span>
                        )}
                      </div>

                      {showMeaning ? (
                        <p className="text-xs font-semibold text-emerald-400 mt-1">
                          {item.meaningVi}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleReveal(item.id)}
                          className="mt-1 text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Bấm xem đáp án</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => speakWord(item.word)}
                        className="p-2 rounded-xl text-amber-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveWord(item.id, item.word)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={showCreateAlbum}
        onClose={() => setShowCreateAlbum(false)}
        onCreated={() => loadData()}
      />

      {/* Album Detail Modal */}
      <AlbumDetailModal
        album={selectedAlbum}
        photos={photos.filter((p) => p.albumId === selectedAlbum?.id)}
        isOpen={!!selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
        onUpdated={() => loadData()}
      />
    </div>
  );
}
