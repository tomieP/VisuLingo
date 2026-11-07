import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Flame,
  Sparkles,
  Camera,
  Compass,
  Volume2,
  BookmarkPlus,
  Heart,
  Tag,
  Check,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { LocketBottomBar } from '@/components/locket/LocketBottomBar';
import { speakWord } from '@/utils/speech';
import { saveWord, getSavedWords } from '@/utils/storage';
import { getMoments, reactToMoment, MomentPost } from '@/utils/moments';

type SortFilter = 'latest' | 'popular' | 'words';

function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<SortFilter>('latest');
  const [moments, setMoments] = useState<MomentPost[]>(getMoments());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedWordIds, setSavedWordIds] = useState<Set<string>>(new Set());

  const savedCount = getSavedWords().length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReact = (momentId: string, reaction: 'fire' | 'heart' | 'sparkles') => {
    reactToMoment(momentId, reaction);
    setMoments(getMoments());
  };

  const handleSaveVocab = (word: string, meaningVi: string, ipa?: string) => {
    saveWord({
      id: crypto.randomUUID(),
      word,
      meaningVi,
      ipa: ipa || '',
      example: '',
      savedAt: new Date().toISOString(),
    });
    setSavedWordIds((prev) => new Set(prev).add(word.toLowerCase()));
    showToast(`Đã lưu "${word}" vào Sổ từ của bạn! ✨`);
  };

  // Collect unique vocabulary tags dynamically from real moments
  const dynamicTags = useMemo(() => {
    const map = new Map<string, number>();
    moments.forEach((m) => {
      (m.vocabTags || []).forEach((t) => {
        const w = t.word.toLowerCase();
        map.set(w, (map.get(w) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
  }, [moments]);

  // Filter & Sort moments
  const filteredMoments = useMemo(() => {
    return moments
      .filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          m.caption.toLowerCase().includes(q) ||
          m.author.name.toLowerCase().includes(q) ||
          (m.vocabTags || []).some(
            (t) =>
              t.word.toLowerCase().includes(q) ||
              t.meaningVi.toLowerCase().includes(q)
          );

        const matchesTag =
          !selectedTag ||
          (m.vocabTags || []).some(
            (t) => t.word.toLowerCase() === selectedTag.toLowerCase()
          );

        return matchesQuery && matchesTag;
      })
      .sort((a, b) => {
        if (sortFilter === 'popular') {
          const likesA = (a.reactions?.heart || 0) + (a.reactions?.fire || 0);
          const likesB = (b.reactions?.heart || 0) + (b.reactions?.fire || 0);
          return likesB - likesA;
        }
        if (sortFilter === 'words') {
          return (b.vocabTags?.length || 0) - (a.vocabTags?.length || 0);
        }
        return 0; // Default latest order
      });
  }, [moments, searchQuery, selectedTag, sortFilter]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black pb-28">
      {/* 1. Mobile-Optimized Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/90 border-b border-white/10 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Quay lại Trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <VisuLingoLogo size="sm" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-xs font-bold text-amber-300 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Khám phá Snaps</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content (Mobile Width Container) */}
      <main className="max-w-md mx-auto px-4 py-4 flex-1 w-full space-y-4">
        {/* ========================================================
            1. INSPIRING DAILY SNAP PROMPT (Tối ưu, sáng tạo, gọn gàng)
        ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-amber-400/15 via-orange-500/10 to-amber-500/5 border border-amber-400/25 shadow-lg backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Thử thách Snapper hôm nay</span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-snug">
              Chụp 1 vật thể quanh bạn để AI bóc tách từ vựng & thắp sáng Streak 🔥
            </p>
          </div>

          <Link
            to="/?tab=snap"
            className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-400/20 active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Snap ngay</span>
          </Link>
        </div>

        {/* ========================================================
            2. SMART SEARCH & DYNAMIC FILTER BAR
        ======================================================== */}
        <div className="space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm đồ vật, từ vựng hoặc Snapper..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#161D2B] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>

          {/* Dynamic Keyword Pills & Sorting */}
          <div className="flex items-center justify-between gap-2">
            {/* Quick Sort Tabs */}
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSortFilter('latest')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  sortFilter === 'latest'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mới nhất
              </button>
              <button
                type="button"
                onClick={() => setSortFilter('popular')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  sortFilter === 'popular'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yêu thích ❤️
              </button>
              <button
                type="button"
                onClick={() => setSortFilter('words')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  sortFilter === 'words'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nhiều từ 📚
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              {filteredMoments.length} Snaps
            </span>
          </div>

          {/* Dynamic Vocab Hashtags (Only when tags exist) */}
          {dynamicTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedTag === null
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                # Tất cả từ vựng
              </button>

              {dynamicTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    selectedTag === tag
                      ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>#{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            3. COMMUNITY SNAPS STREAM (Locket-Style Cards)
        ======================================================== */}
        {filteredMoments.length === 0 ? (
          /* Empty State Sáng Tạo, Thân Thiện */
          <div className="py-16 px-6 text-center rounded-3xl bg-[#161D2B]/60 border border-white/10 space-y-4 my-4 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-full bg-amber-400/15 text-amber-300 mx-auto flex items-center justify-center border border-amber-400/30">
              <Camera className="w-7 h-7 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">Chưa có Snaps nào</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {searchQuery || selectedTag
                  ? 'Không tìm thấy Snap nào phù hợp với tìm kiếm của bạn. Hãy thử từ khóa khác!'
                  : 'Hãy là người đầu tiên chụp ảnh đồ vật, bóc tách từ vựng và chia sẻ cùng cộng đồng Snapper!'}
              </p>
            </div>
            <Link
              to="/?tab=snap"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Chụp khoảnh khắc đầu tiên</span>
            </Link>
          </div>
        ) : (
          /* Stream of Clean, Modern Locket Cards */
          <div className="space-y-4">
            {filteredMoments.map((moment) => {
              const hasTags = (moment.vocabTags || []).length > 0;
              const likes = (moment.reactions?.heart || 0) + (moment.reactions?.fire || 0);

              return (
                <article
                  key={moment.id}
                  className="rounded-3xl bg-[#161D2B]/90 border border-white/10 p-3.5 space-y-3 shadow-xl backdrop-blur-xl transition-all hover:border-white/20"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={moment.author.avatar}
                        alt={moment.author.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/30"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block">
                          {moment.author.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {moment.timeAgo}
                        </span>
                      </div>
                    </div>

                    {/* Reaction Badge */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleReact(moment.id, 'heart')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          moment.userReacted === 'heart'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            moment.userReacted === 'heart' ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                        <span className="font-mono text-[11px]">{likes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReact(moment.id, 'fire')}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          moment.userReacted === 'fire'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-amber-400'
                        }`}
                        title="Thả lửa streak"
                      >
                        <Flame
                          className={`w-3.5 h-3.5 ${
                            moment.userReacted === 'fire' ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Photo Container */}
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-black">
                    <img
                      src={moment.imageUrl}
                      alt={moment.caption || 'Snap photo'}
                      className="w-full h-full object-cover"
                    />

                    {/* Quick Vocab Pill Badge Counter */}
                    {hasTags && (
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{moment.vocabTags.length} từ vựng</span>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  {moment.caption && (
                    <p className="text-xs text-slate-200 font-medium px-0.5 leading-relaxed">
                      {moment.caption}
                    </p>
                  )}

                  {/* Sleek Vocab Tags Grid (Từ vựng bóc tách trực quan) */}
                  {hasTags && (
                    <div className="pt-1 space-y-1.5 border-t border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-0.5">
                        Từ vựng trong ảnh:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {moment.vocabTags.map((t) => {
                          const isSaved = savedWordIds.has(t.word.toLowerCase());
                          return (
                            <div
                              key={t.id}
                              className="p-2 rounded-xl bg-white/[0.04] border border-white/5 hover:border-amber-400/30 flex items-center justify-between gap-2 transition-all"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-amber-300 capitalize truncate">
                                    {t.word}
                                  </span>
                                  {t.ipa && (
                                    <span className="text-[9px] text-slate-400 font-mono truncate">
                                      {t.ipa}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-300 line-clamp-1">
                                  {t.meaningVi}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => speakWord(t.word)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-400 transition-colors cursor-pointer"
                                  title="Nghe phát âm"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveVocab(t.word, t.meaningVi, t.ipa)}
                                  disabled={isSaved}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isSaved
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-400'
                                  }`}
                                  title={isSaved ? 'Đã lưu vào sổ' : 'Lưu vào Sổ từ'}
                                >
                                  {isSaved ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <BookmarkPlus className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating 5-Pill Bottom Navigation Bar */}
      <LocketBottomBar
        activeTab="feed"
        onTabChange={() => {}}
        savedCount={savedCount}
      />
    </div>
  );
}

export default ExplorePage;
