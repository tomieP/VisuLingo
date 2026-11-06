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
import { speakWord } from '@/utils/speech';
import { saveWord } from '@/utils/storage';

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
    goal: 'Mục tiêu: IELTS 7.5+ & Academic Vocab',
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
    description: 'Chụp 5 ảnh đồ vật quanh bàn làm việc (laptop, keyboard, notebook, mug, lamp).',
    reward: 'Huy hiệu "Thợ Săn Setup" + 50 Lửa',
    participants: 412,
    daysLeft: 3,
    badgeEmoji: '💻',
  },
  {
    id: 'ch-2',
    title: 'Ẩm Thực & Cà Phê Chill ☕🥐',
    description: 'Chụp và phát hiện 10 từ vựng về món ăn, đồ uống tại quán cafe hoặc bữa ăn.',
    reward: 'Huy hiệu "Foodie Lingo" + 70 Lửa',
    participants: 680,
    daysLeft: 5,
    badgeEmoji: '🥐',
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
      { word: 'sofa', meaningVi: 'ghế bành dài' },
      { word: 'cushion', meaningVi: 'gối tựa lưng' },
    ],
  },
  {
    id: 'ts-2',
    authorName: 'Thành Nam',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=80',
    caption: 'Bữa sáng bánh sừng bò giòn tan thơm bơ 🥐',
    likes: 38,
    vocabWords: [
      { word: 'croissant', meaningVi: 'bánh sừng bò' },
      { word: 'bakery', meaningVi: 'tiệm bánh ngọt' },
    ],
  },
];

function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [buddies, setBuddies] = useState<SuggestedBuddy[]>(INITIAL_BUDDIES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    showToast(`Đã lưu từ "${word}" vào Snapbook của bạn!`);
  };

  const filteredBuddies = buddies.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/90 border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Quay lại Bảng tin Snaps"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <VisuLingoLogo size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Khám Phá Cộng Đồng
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-7">
        {/* Search Header Bar */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Khám Phá & Kết Nối Bạn Học
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Tìm bạn bè cùng chí hướng, tham gia thử thách săn từ vựng và cùng nhau giữ lửa Streak 🔥
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên bạn bè, mục tiêu (IELTS, Giao tiếp, IT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#161D2B] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>
        </div>

        {/* ========================================================
            SECTION 1: WEEKLY COMMUNITY CHALLENGES
        ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-black text-white tracking-tight">
                Thử Thách Tuần Này
              </h2>
            </div>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              Cộng điểm Streak 🔥
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CHALLENGES_LIST.map((ch) => (
              <div
                key={ch.id}
                className="p-5 rounded-3xl bg-gradient-to-br from-[#161D2B] to-[#0E131F] border border-white/10 space-y-3 relative overflow-hidden group hover:border-amber-400/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-2xl flex items-center justify-center border border-amber-400/30 shadow-inner">
                    {ch.badgeEmoji}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    Còn {ch.daysLeft} ngày
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-amber-300 font-bold">
                    🎁 {ch.reward}
                  </span>
                  <Link
                    to="/"
                    className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs"
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
            SECTION 2: SUGGESTED STUDY BUDDIES
        ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <h2 className="text-base font-black text-white tracking-tight">
                Gợi Ý Bạn Học Cùng Giữ Lửa
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {filteredBuddies.length} bạn bè phù hợp
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredBuddies.map((buddy) => (
              <div
                key={buddy.id}
                className="p-4 rounded-3xl bg-[#161D2B]/85 border border-white/10 hover:border-amber-400/30 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={buddy.avatar}
                      alt={buddy.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-[#0E131F] border border-amber-400/40 text-[9px] font-black text-amber-300 flex items-center">
                      🔥{buddy.streak}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors block truncate">
                      {buddy.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {buddy.username}
                    </span>
                    <p className="text-[11px] text-amber-300/90 font-medium line-clamp-1 mt-0.5">
                      {buddy.goal}
                    </p>
                  </div>
                </div>

                {buddy.isInvited ? (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    Đã mời
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInviteBuddy(buddy.id, buddy.name)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-xs"
                    title="Mời giữ chuỗi Streak chung"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Mời giữ Streak</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 3: TRENDING SNAPS IN COMMUNITY
        ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-black text-white tracking-tight">
                Snaps Thịnh Hành Trong Ngày
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Bình chọn nhiều nhất</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRENDING_SNAPS.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 rounded-3xl bg-[#161D2B]/80 border border-white/10 space-y-3 group hover:border-amber-400/40 transition-all"
              >
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black">
                  <img src={snap.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold">
                    <img src={snap.authorAvatar} alt="" className="w-4 h-4 rounded-full" />
                    <span>{snap.authorName}</span>
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-rose-400">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span>{snap.likes}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium line-clamp-1">
                  {snap.caption}
                </p>

                {/* Vocab Pills with Sound & Save */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                  {snap.vocabWords.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => speakWord(v.word)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold capitalize"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{v.word}</span>
                      </button>
                      <span className="text-slate-400 text-[11px]">: {v.meaningVi}</span>
                      <button
                        type="button"
                        onClick={() => handleSaveVocab(v.word, v.meaningVi)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors ml-0.5 cursor-pointer"
                        title="Lưu từ này vào Snapbook"
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
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default ExplorePage;
