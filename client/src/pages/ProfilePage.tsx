import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Settings as SettingsIcon,
  Award,
  Sparkles,
  Camera,
  Calendar,
  Share2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { getCurrentUser } from '@/services/authService';
import { getSavedWords } from '@/utils/storage';
import { getMoments } from '@/utils/moments';

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: string;
  category: string;
}

const BADGES_LIST: BadgeItem[] = [
  {
    id: 'b-1',
    title: 'Thợ Săn Hình Ảnh',
    description: 'Chụp và quét thành công 20 đồ vật thực tế qua AI Camera',
    icon: '📸',
    isUnlocked: true,
    progress: '24/20 đồ vật',
    category: 'Khám phá',
  },
  {
    id: 'b-2',
    title: 'Chiến Thần Giữ Lửa',
    description: 'Duy trì chuỗi học tập Streak liên tục trong 7 ngày',
    icon: '🔥',
    isUnlocked: false,
    progress: '5/7 ngày',
    category: 'Streak',
  },
  {
    id: 'b-3',
    title: 'Góc Chill & Cà Phê',
    description: 'Ghi lại 5 khoảnh khắc học tập tại quán cafe hoặc bàn làm việc',
    icon: '☕',
    isUnlocked: true,
    progress: '5/5 ảnh',
    category: 'Đời sống',
  },
  {
    id: 'b-4',
    title: 'Bản Xứ Tí Hon',
    description: 'Nghe phát âm chuẩn IPA và luyện đọc trên 50 từ vựng',
    icon: '🗣️',
    isUnlocked: true,
    progress: '62/50 lần',
    category: 'Phát âm',
  },
  {
    id: 'b-5',
    title: 'Đôi Bạn Cùng Tiến',
    description: 'Kết nối và chia sẻ từ vựng với ít nhất 4 người bạn',
    icon: '🤝',
    isUnlocked: true,
    progress: '4/4 bạn bè',
    category: 'Mạng xã hội',
  },
  {
    id: 'b-6',
    title: 'Bậc Thầy Từ Vựng',
    description: 'Tích lũy và thuộc lòng 100 từ vựng vào Snapbook',
    icon: '👑',
    isUnlocked: false,
    progress: '35/100 từ',
    category: 'Cao thủ',
  },
];

function ProfilePage() {
  const currentUser = getCurrentUser();
  const savedWords = getSavedWords();
  const moments = getMoments();
  const [activeTab, setActiveTab] = useState<'badges' | 'snaps' | 'stats'>('badges');
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
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/90 border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Quay lại Trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <VisuLingoLogo size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareProfile}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Chia sẻ hồ sơ"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Cài đặt"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Profile Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-[36px] bg-gradient-to-b from-[#161D2B] to-[#0E131F] border border-white/10 relative overflow-hidden space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar with Streak Flame Halo */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-200 shadow-xl shadow-amber-400/20">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-[#0B0F17]"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-[#0B0F17] border border-amber-400/50 text-xs font-black text-amber-300 flex items-center gap-1 shadow-md">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                5
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Nguyễn Hoàng Phúc'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider self-center sm:self-auto">
                  Học viên Tích Cực
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">@phuc_visulingo</p>
              <p className="text-xs text-slate-300 max-w-md pt-1">
                "Mỗi ngày học 10 từ vựng qua ảnh chụp đời thường. Giữ lửa cùng đồng đội! 🚀"
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Gia nhập T10/2026
                </span>
                <span>•</span>
                <span>TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 text-center">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Chuỗi Streak
              </span>
              <span className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400" />
                5 ngày
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Từ vựng Snap
              </span>
              <span className="text-xl font-black text-white">{savedWords.length} từ</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Huy hiệu mở
              </span>
              <span className="text-xl font-black text-emerald-400">
                {BADGES_LIST.filter((b) => b.isUnlocked).length}/{BADGES_LIST.length}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#161D2B]/80 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Huy hiệu thành tựu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snaps')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'snaps'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Snaps của tôi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Thống kê thói quen</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: BADGES GRID
        ======================================================== */}
        {activeTab === 'badges' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Huy hiệu mở khóa bằng chuỗi học tập
              </span>
              <span className="text-xs font-bold text-amber-300">
                {BADGES_LIST.filter((b) => b.isUnlocked).length} / {BADGES_LIST.length} Đã đạt
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {BADGES_LIST.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-3xl border transition-all space-y-3 relative overflow-hidden ${
                    badge.isUnlocked
                      ? 'bg-[#161D2B]/90 border-amber-400/40 hover:border-amber-400 shadow-lg shadow-amber-400/5'
                      : 'bg-[#161D2B]/40 border-white/5 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                      {badge.icon}
                    </div>

                    {badge.isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã mở khóa
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Chưa mở
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-white">{badge.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 uppercase font-mono">{badge.category}</span>
                    <span className="font-bold text-amber-300 font-mono">{badge.progress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: MY SNAPS GRID
        ======================================================== */}
        {activeTab === 'snaps' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kho ảnh đời thường đã chia sẻ
              </span>
              <Link
                to="/"
                className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Chụp thêm snap mới</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {myMoments.length > 0 ? (
                myMoments.map((snap) => (
                  <div
                    key={snap.id}
                    className="relative aspect-4/3 rounded-2xl overflow-hidden group border border-white/10"
                  >
                    <img
                      src={snap.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                      <span className="text-[11px] font-bold text-white line-clamp-1">
                        {snap.caption || 'Khoảnh khắc học từ vựng'}
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        {snap.vocabTags.map((t) => t.word).join(', ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-[#161D2B]/50 rounded-3xl border border-white/10 p-6 space-y-2">
                  <p className="text-xs text-slate-400">Bạn chưa đăng bài Snap nào hôm nay.</p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    <span>Mở Camera chụp ngay</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: HABIT & STATS
        ======================================================== */}
        {activeTab === 'stats' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-white">Thói quen giữ lửa Streak</h3>
              <p className="text-xs text-slate-400">
                Bạn đang duy trì tiến độ học tập xuất sắc hơn 85% người học khác!
              </p>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center pt-2">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => {
                const isLearned = i < 5;
                return (
                  <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 block">{day}</span>
                    <div className="flex justify-center">
                      {isLearned ? (
                        <Flame className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20" />
                      )}
                    </div>
                    <span className={`text-[10px] font-bold block ${isLearned ? 'text-amber-300' : 'text-slate-500'}`}>
                      {isLearned ? '+10 từ' : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Toast alert */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>Đã sao chép liên kết hồ sơ của bạn!</span>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
