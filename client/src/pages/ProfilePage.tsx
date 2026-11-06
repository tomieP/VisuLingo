import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Settings as SettingsIcon,
  Camera,
  Share2,
  CheckCircle2,
  Lock,
  Volume2,
  Trophy,
  Zap,
  Target,
  Calendar,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { LocketBottomBar } from '@/components/locket/LocketBottomBar';
import { getCurrentUser } from '@/services/authService';
import { getSavedWords } from '@/utils/storage';
import { getMoments } from '@/utils/moments';
import { speakWord } from '@/utils/speech';

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  progressText: string;
  percent: number;
}

const PROFILE_BADGES: BadgeItem[] = [
  {
    id: 'b-camera',
    title: 'Thợ Săn Thị Giác',
    description: 'Chụp và nhận diện đồ vật thực tế qua AI Camera',
    icon: '📸',
    category: 'Khám phá',
    isUnlocked: true,
    progressText: '24/20 đồ vật',
    percent: 100,
  },
  {
    id: 'b-streak',
    title: 'Chiến Thần Giữ Lửa',
    description: 'Duy trì chuỗi học tập Streak liên tục mỗi ngày',
    icon: '🔥',
    category: 'Streak',
    isUnlocked: false,
    progressText: '5/7 ngày (Còn 2 ngày)',
    percent: 71,
  },
  {
    id: 'b-audio',
    title: 'Phát Âm Bản Xứ',
    description: 'Nghe phát âm chuẩn IPA và luyện phản xạ âm thanh',
    icon: '🗣️',
    category: 'Phát âm',
    isUnlocked: true,
    progressText: '62/50 lần nghe',
    percent: 100,
  },
  {
    id: 'b-buddies',
    title: 'Đôi Bạn Cùng Tiến',
    description: 'Kết nối và chia sẻ từ vựng Snap với bạn bè',
    icon: '🤝',
    category: 'Cộng đồng',
    isUnlocked: true,
    progressText: '4/4 bạn học',
    percent: 100,
  },
  {
    id: 'b-master',
    title: 'Bậc Thầy Từ Vựng',
    description: 'Tích lũy và ghi nhớ 50 từ vựng vào Snapbook cá nhân',
    icon: '👑',
    category: 'Từ vựng',
    isUnlocked: false,
    progressText: '35/50 từ',
    percent: 70,
  },
  {
    id: 'b-cafe',
    title: 'Nhà Thám Hiểm Cafe',
    description: 'Tạo album và sưu tầm từ vựng không gian cà phê',
    icon: '☕',
    category: 'Đời sống',
    isUnlocked: true,
    progressText: '8/5 ảnh snap',
    percent: 100,
  },
];

const WEEK_DAYS = [
  { day: 'T2', date: '02', completed: true, snaps: 3 },
  { day: 'T3', date: '03', completed: true, snaps: 2 },
  { day: 'T4', date: '04', completed: true, snaps: 4 },
  { day: 'T5', date: '05', completed: true, snaps: 1 },
  { day: 'T6', date: '06', completed: true, snaps: 5 },
  { day: 'T7', date: '07', completed: false, snaps: 0 },
  { day: 'CN', date: '08', completed: false, snaps: 0 },
];

function ProfilePage() {
  const currentUser = getCurrentUser();
  const savedWords = getSavedWords();
  const moments = getMoments();
  const [activeTab, setActiveTab] = useState<'badges' | 'snaps' | 'streak'>('badges');
  const [copiedToast, setCopiedToast] = useState(false);

  const userAvatar =
    localStorage.getItem('visulingo_avatar') ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  const myMoments = moments.filter(
    (m) => m.author.name.toLowerCase().includes('bạn') || m.author.name.includes('Phúc')
  );

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

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
            <button
              type="button"
              onClick={handleShareProfile}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Chia sẻ hồ sơ"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white transition-colors"
              title="Cài đặt"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-xl animate-in fade-in duration-150">
          Đã sao chép liên kết hồ sơ của bạn! 📋
        </div>
      )}

      {/* 2. Main Mobile Container */}
      <main className="max-w-md mx-auto px-3.5 py-4 flex-1 w-full space-y-4">
        {/* ========================================================
            HERO PROFILE CARD (MOBILE-OPTIMIZED)
        ======================================================== */}
        <div className="p-4 sm:p-5 rounded-[28px] bg-[#121824]/95 border border-white/10 relative overflow-hidden shadow-xl space-y-3.5">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            {/* Avatar with Halo Streak Ring */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-200 shadow-lg shadow-amber-400/20 ring-2 ring-amber-400/30">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-[#0B0F17]"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#0B0F17] border border-amber-400 text-[10px] font-black text-amber-300 flex items-center gap-0.5 shadow-md">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                5d
              </span>
            </div>

            {/* User Meta */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg font-black text-white tracking-tight truncate">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Nguyễn Hoàng Phúc'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  Level 3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">@phuc_visulingo</p>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                "Mỗi ngày chụp và nạp 10 từ vựng qua ảnh thực tế. Cùng nhau giữ lửa streak! 🚀"
              </p>
            </div>
          </div>

          {/* Core Practical Stats (4 Mobile Metric Chips) */}
          <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-white/10 text-center relative z-10">
            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                Streak
              </span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-400" />
                5d
              </span>
            </div>

            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                Snaps
              </span>
              <span className="text-sm font-black text-white">{myMoments.length} ảnh</span>
            </div>

            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                Sổ từ
              </span>
              <span className="text-sm font-black text-amber-300">{savedWords.length} từ</span>
            </div>

            <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                Huy hiệu
              </span>
              <span className="text-sm font-black text-emerald-400">
                {PROFILE_BADGES.filter((b) => b.isUnlocked).length}/6
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            SEGMENTED SUB-TABS (MOBILE THUMB ZONE)
        ======================================================== */}
        <div className="p-1 rounded-2xl bg-[#161D2B]/90 border border-white/10 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Huy hiệu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snaps')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'snaps'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snaps của tôi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('streak')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'streak'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch giữ lửa</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: HUY HIỆU DANH DỰ (TOUCH-FRIENDLY CARDS)
        ======================================================== */}
        {activeTab === 'badges' && (
          <div className="space-y-2.5">
            {PROFILE_BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  badge.isUnlocked
                    ? 'bg-[#161D2B] border-amber-400/30'
                    : 'bg-[#121824]/60 border-white/5 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      badge.isUnlocked
                        ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300'
                        : 'bg-white/5 border border-white/10 text-slate-500'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-white truncate">{badge.title}</h4>
                      {badge.isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {badge.description}
                    </p>
                    <span className="text-[10px] text-amber-300 font-semibold block">
                      Tiến trình: {badge.progressText}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      badge.isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {badge.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            TAB 2: SNAPS CỦA TÔI (MOBILE 2-COLUMN GRID)
        ======================================================== */}
        {activeTab === 'snaps' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                Khoảnh khắc thực tế ({myMoments.length})
              </span>
              <Link
                to="/?tab=snap"
                className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Camera className="w-3 h-3" />
                <span>+ Chụp mới</span>
              </Link>
            </div>

            {myMoments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#161D2B]/60 border border-white/10 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-amber-400 opacity-60" />
                <p className="text-xs font-bold text-white">Chưa có snap nào</p>
                <p className="text-[11px] text-slate-400">
                  Hãy bấm máy chụp đồ vật đầu tiên để khoe với bạn bè!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {myMoments.map((moment) => (
                  <div
                    key={moment.id}
                    className="p-2 rounded-2xl bg-[#161D2B] border border-white/10 space-y-2 group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
                      <img src={moment.imageUrl} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.2 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-bold text-white">
                        {moment.timeAgo}
                      </span>
                    </div>

                    <p className="text-[11px] text-white font-medium truncate px-0.5">
                      {moment.caption || 'Khoảnh khắc học từ vựng'}
                    </p>

                    <div className="flex flex-wrap gap-1 px-0.5">
                      {moment.vocabTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => speakWord(tag.word)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold text-amber-300 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-2.5 h-2.5" />
                          <span className="capitalize">{tag.word}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: LỊCH GIỮ LỬA TUẦN NÀY (CLEAN 7-DAY STREAK ROW)
        ======================================================== */}
        {activeTab === 'streak' && (
          <div className="space-y-3.5">
            {/* Weekly Row */}
            <div className="p-4 rounded-2xl bg-[#161D2B] border border-white/10 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Chuỗi Giữ Lửa Tuần Này
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Đã hoàn thành 5/7 ngày liên tục 🔥
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black">
                  Đang giữ lửa
                </span>
              </div>

              {/* 7 Days Row */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {WEEK_DAYS.map((w, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                      w.completed
                        ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="text-[9px] font-bold block">{w.day}</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center">
                      {w.completed ? (
                        <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </div>
                    <span className="text-[8px] font-mono">{w.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goal Card */}
            <div className="p-4 rounded-2xl bg-[#161D2B] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  Mục tiêu hôm nay
                </span>
                <span className="text-amber-400 font-bold">8 / 10 từ</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div style={{ width: '80%' }} className="h-full bg-amber-400 rounded-full" />
              </div>
              <p className="text-[11px] text-slate-400">
                Chỉ còn 2 từ nữa để hoàn thành mục tiêu ngày và giữ lửa streak!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Floating 5-Pill Bottom Navigation Bar */}
      <LocketBottomBar
        activeTab="pocket"
        onTabChange={() => {}}
        savedCount={savedWords.length}
      />
    </div>
  );
}

export default ProfilePage;
