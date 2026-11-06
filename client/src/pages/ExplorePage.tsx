import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Flame,
  UserPlus,
  Sparkles,
  Camera,
  Compass,
  Trophy,
  Check,
  Volume2,
  BookmarkPlus,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { LocketBottomBar } from '@/components/locket/LocketBottomBar';
import { speakWord } from '@/utils/speech';
import { saveWord, getSavedWords } from '@/utils/storage';

interface SuggestedBuddy {
  id: string;
  name: string;
  username: string;
  avatar: string;
  streak: number;
  goal: string;
  mutualCount: number;
  isInvited?: boolean;
}

const INITIAL_BUDDIES: SuggestedBuddy[] = [
  {
    id: 'b-1',
    name: 'Hoàng Long',
    username: '@long_ielts',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    streak: 15,
    goal: 'Mục tiêu: IELTS 7.5+ & Từ vựng Học thuật',
    mutualCount: 3,
  },
  {
    id: 'b-2',
    name: 'Bảo Trâm',
    username: '@tram_traveler',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    streak: 8,
    goal: 'Mục tiêu: Tiếng Anh Du lịch & Giao tiếp',
    mutualCount: 2,
  },
  {
    id: 'b-3',
    name: 'Đức Anh',
    username: '@ducanh_dev',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    streak: 11,
    goal: 'Mục tiêu: Từ vựng Công nghệ & IT',
    mutualCount: 4,
  },
  {
    id: 'b-4',
    name: 'Minh Thư',
    username: '@thu_coffeesnap',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    streak: 6,
    goal: 'Mục tiêu: Giao tiếp đời sống thường ngày',
    mutualCount: 1,
  },
];

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  participants: number;
  daysLeft: number;
  badgeEmoji: string;
}

const CHALLENGES_LIST: CommunityChallenge[] = [
  {
    id: 'ch-1',
    title: 'Góc Bàn Học & Công Nghệ 💻',
    description: 'Chụp 5 ảnh đồ vật quanh bàn làm việc (laptop, notebook, mug).',
    reward: '+50 Lửa Streak',
    participants: 412,
    daysLeft: 3,
    badgeEmoji: '💻',
  },
  {
    id: 'ch-2',
    title: 'Ẩm Thực & Cà Phê Chill ☕🥐',
    description: 'Chụp và phát hiện 10 từ vựng về món ăn, thức uống quán xá.',
    reward: '+70 Lửa Streak',
    participants: 680,
    daysLeft: 5,
    badgeEmoji: '🥐',
  },
  {
    id: 'ch-3',
    title: 'Cây Cảnh & Phòng Khách 🌿',
    description: 'Khám phá các vật dụng trong nhà và cây xanh thư giãn.',
    reward: '+40 Lửa Streak',
    participants: 290,
    daysLeft: 7,
    badgeEmoji: '🌿',
  },
];

interface TrendingSnap {
  id: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  vocabWords: Array<{ word: string; meaningVi: string }>;
}

const TRENDING_SNAPS: TrendingSnap[] = [
  {
    id: 'ts-1',
    authorName: 'Khánh Linh',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80',
    caption: 'Quán cafe có chiếc sofa xanh decor siêu vintage 🌿',
    likes: 42,
    vocabWords: [
      { word: 'sofa', meaningVi: 'ghế xô-pha' },
      { word: 'cushion', meaningVi: 'gối tựa lưng' },
    ],
  },
  {
    id: 'ts-2',
    authorName: 'Thành Nam',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=80',
    caption: 'Bánh sừng bò mới ra lò thơm bơ giòn rụm 🥐',
    likes: 38,
    vocabWords: [
      { word: 'croissant', meaningVi: 'bánh sừng bò' },
      { word: 'bakery', meaningVi: 'tiệm bánh ngọt' },
    ],
  },
];

const FILTER_PILLS = ['Tất cả', 'IELTS 7.5+', 'Công nghệ IT', 'Cà phê & Đời sống'];

function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const [buddies, setBuddies] = useState<SuggestedBuddy[]>(INITIAL_BUDDIES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const savedCount = getSavedWords().length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInviteBuddy = (buddyId: string, name: string) => {
    setBuddies((prev) =>
      prev.map((b) => (b.id === buddyId ? { ...b, isInvited: true } : b))
    );
    showToast(`Đã gửi lời mời cùng giữ lửa Streak tới ${name}! 🔥`);
  };

  const handleSaveVocab = (word: string, meaningVi: string) => {
    saveWord({
      id: crypto.randomUUID(),
      word,
      meaningVi,
      ipa: '',
      example: '',
      savedAt: new Date().toISOString(),
    });
    showToast(`Đã lưu từ "${word}" vào Snapbook của bạn! ✨`);
  };

  const filteredBuddies = buddies.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'IELTS 7.5+') return b.goal.includes('IELTS');
    if (selectedFilter === 'Công nghệ IT') return b.goal.includes('IT');
    if (selectedFilter === 'Cà phê & Đời sống') return b.goal.includes('đời sống') || b.goal.includes('Du lịch');
    return true;
  });

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
              <span>Khám phá</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content (Mobile Width Container) */}
      <main className="max-w-md mx-auto px-3.5 py-4 flex-1 w-full space-y-4.5">
        {/* Mobile Search & Filter Chips */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm bạn bè, mục tiêu IELTS, IT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#161D2B] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setSelectedFilter(pill)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedFilter === pill
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 1: WEEKLY COMMUNITY CHALLENGES (HORIZONTAL SCROLL)
        ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Thử Thách Tuần Này
              </h2>
            </div>
            <span className="text-[10px] font-bold text-amber-300">
              Vuốt để xem thêm →
            </span>
          </div>

          {/* Horizontal Track Carousel */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
            {CHALLENGES_LIST.map((ch) => (
              <div
                key={ch.id}
                className="w-68 shrink-0 p-3.5 rounded-2xl bg-gradient-to-br from-[#161D2B] to-[#0E131F] border border-white/10 space-y-2.5 shadow-md flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-xl flex items-center justify-center border border-amber-400/30">
                    {ch.badgeEmoji}
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    {ch.reward}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xs text-white truncate">
                    {ch.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono text-[10px]">
                    Còn {ch.daysLeft} ngày
                  </span>
                  <Link
                    to="/?tab=snap"
                    className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tham gia</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 2: SUGGESTED STUDY BUDDIES (MOBILE CARDS)
        ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Gợi Ý Bạn Học Cùng Giữ Lửa
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {filteredBuddies.length} bạn bè
            </span>
          </div>

          <div className="space-y-2">
            {filteredBuddies.map((buddy) => (
              <div
                key={buddy.id}
                className="p-3 rounded-2xl bg-[#161D2B] border border-white/10 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={buddy.avatar}
                      alt={buddy.name}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-white/15"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-[#0E131F] border border-amber-400 text-[9px] font-black text-amber-300 flex items-center">
                      🔥{buddy.streak}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-white truncate">
                        {buddy.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {buddy.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-300 font-medium line-clamp-1">
                      {buddy.goal}
                    </p>
                  </div>
                </div>

                {buddy.isInvited ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3" />
                    <span>Đã mời</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInviteBuddy(buddy.id, buddy.name)}
                    className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-[10px] transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 shadow-xs"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Mời giữ lửa</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 3: TRENDING SNAPS IN COMMUNITY
        ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                Snaps Thịnh Hành
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Bình chọn nhiều</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {TRENDING_SNAPS.map((snap) => (
              <div
                key={snap.id}
                className="p-2 rounded-2xl bg-[#161D2B] border border-white/10 space-y-2 shadow-sm"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
                  <img src={snap.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-bold text-white">
                    <img src={snap.authorAvatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                    <span className="truncate max-w-[60px]">{snap.authorName}</span>
                  </div>

                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-bold text-rose-400">
                    <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                    <span>{snap.likes}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-200 font-medium truncate px-0.5">
                  {snap.caption}
                </p>

                {/* Vocab Tag Buttons */}
                <div className="space-y-1 px-0.5">
                  {snap.vocabWords.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-1 rounded-lg bg-white/5 border border-white/5 text-[10px]"
                    >
                      <button
                        type="button"
                        onClick={() => speakWord(v.word)}
                        className="text-amber-300 hover:text-white font-bold capitalize flex items-center gap-1 cursor-pointer truncate"
                      >
                        <Volume2 className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{v.word}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveVocab(v.word, v.meaningVi)}
                        className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5 cursor-pointer shrink-0"
                        title="Lưu từ vào Snapbook"
                      >
                        <BookmarkPlus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
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
