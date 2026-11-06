import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Settings as SettingsIcon,
  Sparkles,
  Camera,
  Share2,
  CheckCircle2,
  Lock,
  Volume2,
  TrendingUp,
  BrainCircuit,
  Zap,
  Clock,
  Target,
  Trophy,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { getCurrentUser } from '@/services/authService';
import { getSavedWords } from '@/utils/storage';
import { getMoments } from '@/utils/moments';
import { speakWord } from '@/utils/speech';

interface BadgeTier {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  tierLabel: string;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  unit: string;
  tip: string;
}

const SMART_BADGES: BadgeTier[] = [
  {
    id: 'badge-camera',
    title: 'Thợ Săn Thị Giác',
    description: 'Quét và nhận diện đồ vật thực tế qua AI Camera',
    icon: '📸',
    tier: 'gold',
    tierLabel: 'Huy Chương Vàng',
    isUnlocked: true,
    currentValue: 24,
    targetValue: 20,
    unit: 'đồ vật',
    tip: 'Đã hoàn thành xuất sắc!',
  },
  {
    id: 'badge-streak',
    title: 'Chiến Thần Giữ Lửa',
    description: 'Duy trì chuỗi học tập và snap liên tục mỗi ngày',
    icon: '🔥',
    tier: 'silver',
    tierLabel: 'Huy Chương Bạc',
    isUnlocked: false,
    currentValue: 5,
    targetValue: 7,
    unit: 'ngày liên tục',
    tip: 'Chỉ còn 2 ngày nữa để mở khóa!',
  },
  {
    id: 'badge-audio',
    title: 'Phát Âm Chuẩn Bản Xứ',
    description: 'Nghe phát âm chuẩn IPA và luyện phản xạ âm thanh',
    icon: '🗣️',
    tier: 'gold',
    tierLabel: 'Huy Chương Vàng',
    isUnlocked: true,
    currentValue: 62,
    targetValue: 50,
    unit: 'lần luyện',
    tip: 'Đã mở khóa cấp Vàng!',
  },
  {
    id: 'badge-social',
    title: 'Đôi Bạn Cùng Tiến',
    description: 'Kết nối và chia sẻ từ vựng Snap với bạn bè',
    icon: '🤝',
    tier: 'bronze',
    tierLabel: 'Huy Chương Đồng',
    isUnlocked: true,
    currentValue: 4,
    targetValue: 4,
    unit: 'bạn học',
    tip: 'Đã kết nối đủ 4 người bạn!',
  },
  {
    id: 'badge-master',
    title: 'Bậc Thầy Trí Nhớ',
    description: 'Thuộc lòng vững vàng 50 từ vựng theo phương pháp SRS',
    icon: '👑',
    tier: 'diamond',
    tierLabel: 'Huy Chương Kim Cương',
    isUnlocked: false,
    currentValue: 32,
    targetValue: 50,
    unit: 'từ thuộc lòng',
    tip: 'Đạt 64% - Cố lên bạn ơi!',
  },
  {
    id: 'badge-theme',
    title: 'Nhà Thám Hiểm Cafe',
    description: 'Tạo album và sưu tầm từ vựng không gian cà phê',
    icon: '☕',
    tier: 'bronze',
    tierLabel: 'Huy Chương Đồng',
    isUnlocked: true,
    currentValue: 8,
    targetValue: 5,
    unit: 'ảnh snap',
    tip: 'Đã hoàn thành cấp Đồng!',
  },
];

// 28 days activity heatmap data (4 weeks x 7 days)
const HEATMAP_DAYS = [
  { day: 'T2', count: 4, level: 2 },
  { day: 'T3', count: 6, level: 3 },
  { day: 'T4', count: 8, level: 3 },
  { day: 'T5', count: 3, level: 1 },
  { day: 'T6', count: 12, level: 4 },
  { day: 'T7', count: 7, level: 3 },
  { day: 'CN', count: 5, level: 2 },
  { day: 'T2', count: 3, level: 1 },
  { day: 'T3', count: 9, level: 3 },
  { day: 'T4', count: 11, level: 4 },
  { day: 'T5', count: 6, level: 2 },
  { day: 'T6', count: 14, level: 4 },
  { day: 'T7', count: 8, level: 3 },
  { day: 'CN', count: 4, level: 2 },
  { day: 'T2', count: 5, level: 2 },
  { day: 'T3', count: 7, level: 3 },
  { day: 'T4', count: 10, level: 4 },
  { day: 'T5', count: 6, level: 2 },
  { day: 'T6', count: 15, level: 4 },
  { day: 'T7', count: 9, level: 3 },
  { day: 'CN', count: 6, level: 2 },
  { day: 'T2', count: 8, level: 3 },
  { day: 'T3', count: 10, level: 4 },
  { day: 'T4', count: 12, level: 4 },
  { day: 'T5', count: 9, level: 3 },
  { day: 'T6', count: 16, level: 4 },
  { day: 'T7', count: 8, level: 3 },
  { day: 'Hôm nay', count: 10, level: 4 },
];

function ProfilePage() {
  const currentUser = getCurrentUser();
  const savedWords = getSavedWords();
  const moments = getMoments();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'snaps'>('overview');
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<{ day: string; count: number } | null>(null);

  const userAvatar =
    localStorage.getItem('visulingo_avatar') ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  const myMoments = moments.filter(
    (m) => m.author.name.toLowerCase().includes('bạn') || m.author.name.includes('Phúc')
  );

  const masteredCount = savedWords.filter((w) => w.isMastered).length;
  const retentionPercent = savedWords.length > 0 ? Math.round((masteredCount / savedWords.length) * 100) : 78;

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black pb-28">
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
              title="Cài đặt tài khoản"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Copied Toast */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-xl animate-in fade-in duration-200">
          Đã sao chép liên kết hồ sơ của bạn! 📋
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* ========================================================
            1. INTELLIGENT LEARNER PASS (HERO IDENTITY CARD)
        ======================================================== */}
        <div className="p-6 sm:p-7 rounded-[36px] bg-gradient-to-b from-[#182133] via-[#121927] to-[#0D121D] border border-white/15 relative overflow-hidden shadow-2xl space-y-5">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left relative z-10">
            {/* Dynamic Halo Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-200 shadow-xl shadow-amber-400/25 ring-4 ring-amber-400/20">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-[#0B0F17]"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-[#0B0F17] border border-amber-400 text-xs font-black text-amber-300 flex items-center gap-1 shadow-md">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                5d
              </span>
            </div>

            {/* User Title & Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Nguyễn Hoàng Phúc'}
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/10 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider self-center sm:self-auto flex items-center gap-1 shadow-xs">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Level 3 • Visual Explorer
                </span>
              </div>

              <p className="text-xs text-slate-400 font-mono">@phuc_visulingo</p>
              <p className="text-xs text-slate-300 max-w-lg pt-0.5 leading-relaxed">
                "Mỗi ngày chụp và nạp 10 từ vựng qua ảnh thực tế. Mục tiêu IELTS 7.5 và giao tiếp tự nhiên! 🚀"
              </p>

              {/* Level XP Progress Bar */}
              <div className="pt-2 max-w-md space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Tiến trình lên Cấp 4:</span>
                  <span className="text-amber-400 font-bold">780 / 1000 XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{ width: '78%' }}
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core Learning Velocity Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 relative z-10">
            {/* Metric 1 */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                Chuỗi Streak
              </span>
              <span className="text-lg font-black text-amber-400">5 ngày 🔥</span>
              <span className="text-[10px] text-slate-500 block">Kỷ lục: 12 ngày</span>
            </div>

            {/* Metric 2 */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-emerald-400" />
                Độ bền trí nhớ
              </span>
              <span className="text-lg font-black text-emerald-400">{retentionPercent}%</span>
              <span className="text-[10px] text-slate-500 block">{masteredCount} từ thuộc lòng</span>
            </div>

            {/* Metric 3 */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3 h-3 text-sky-400" />
                Mục tiêu hôm nay
              </span>
              <span className="text-lg font-black text-white">8/10 từ</span>
              <span className="text-[10px] text-sky-300 font-medium block">Đạt 80% kế hoạch</span>
            </div>

            {/* Metric 4 */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" />
                Giờ vàng học
              </span>
              <span className="text-lg font-black text-purple-300">08:30 Sáng</span>
              <span className="text-[10px] text-slate-500 block">Nhớ lâu nhất</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. SEGMENTED PROFILE TABS
        ======================================================== */}
        <div className="p-1 rounded-2xl bg-[#161D2B]/90 border border-white/10 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Thói quen & Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tủ huy hiệu danh dự ({SMART_BADGES.filter((b) => b.isUnlocked).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snaps')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'snaps'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Khoảnh khắc của tôi ({myMoments.length})</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: HABIT HEATMAP & LEARNING INSIGHTS
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* 30-Day Activity Heatmap Card */}
            <div className="p-5 sm:p-6 rounded-[30px] bg-[#161D2B] border border-white/10 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Nhật Ký Giữ Lửa 28 Ngày Gần Nhất
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mỗi ô vuông thể hiện số từ vựng bạn đã nạp và chụp qua AI Camera
                  </p>
                </div>

                {selectedHeatmapDay && (
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-in fade-in">
                    {selectedHeatmapDay.day}: Học {selectedHeatmapDay.count} từ ✨
                  </span>
                )}
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
                {HEATMAP_DAYS.map((item, idx) => {
                  const bgClass =
                    item.level === 4
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/40'
                      : item.level === 3
                      ? 'bg-amber-500/70'
                      : item.level === 2
                      ? 'bg-amber-500/40'
                      : 'bg-white/10';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedHeatmapDay(item)}
                      className={`h-9 rounded-xl ${bgClass} border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:scale-110 hover:border-amber-400 transition-all group relative`}
                      title={`${item.day}: ${item.count} từ vựng`}
                    >
                      <span className="text-[10px] font-bold text-slate-950 group-hover:text-black">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                <span>Ít học</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-white/10 border border-white/10" />
                  <span className="w-3 h-3 rounded-md bg-amber-500/40" />
                  <span className="w-3 h-3 rounded-md bg-amber-500/70" />
                  <span className="w-3 h-3 rounded-md bg-amber-400" />
                </div>
                <span>Chăm chỉ cực đỉnh 🔥</span>
              </div>
            </div>

            {/* Smart Learning Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Insight 1: Favorite Topics */}
              <div className="p-4 rounded-[26px] bg-[#161D2B] border border-white/10 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>📊</span>
                  Chủ đề bạn snap nhiều nhất
                </span>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-white">💻 Công nghệ & Bàn làm việc</span>
                      <span className="text-amber-400 font-bold">45%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div style={{ width: '45%' }} className="h-full bg-amber-400 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-white">☕ Cà phê, Quán xá & Đồ uống</span>
                      <span className="text-amber-400 font-bold">35%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div style={{ width: '35%' }} className="h-full bg-amber-400/80 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-white">🌿 Đời sống & Đồ dùng trong nhà</span>
                      <span className="text-amber-400 font-bold">20%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div style={{ width: '20%' }} className="h-full bg-amber-400/60 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight 2: Social Retention */}
              <div className="p-4 rounded-[26px] bg-[#161D2B] border border-white/10 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>🤝</span>
                  Tương tác giữ lửa cùng bạn bè
                </span>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <span>Đã gửi snap đố từ vựng:</span>
                    <span className="font-bold text-amber-300">18 lần</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <span>Bạn học tương tác nhiều nhất:</span>
                    <span className="font-bold text-white">Khánh Linh (12d 🔥)</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <span>Thời gian học trung bình:</span>
                    <span className="font-bold text-emerald-400">14 phút / ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: CURATED TIERED BADGES SHOWCASE
        ======================================================== */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SMART_BADGES.map((badge) => {
              const percent = Math.min(100, Math.round((badge.currentValue / badge.targetValue) * 100));

              return (
                <div
                  key={badge.id}
                  className={`p-4 sm:p-5 rounded-[28px] border transition-all space-y-3 relative overflow-hidden ${
                    badge.isUnlocked
                      ? 'bg-gradient-to-b from-[#182234] to-[#121927] border-amber-400/40 shadow-xl'
                      : 'bg-[#161D2B]/50 border-white/5 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                          badge.isUnlocked
                            ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300'
                            : 'bg-white/5 border border-white/10 text-slate-500'
                        }`}
                      >
                        {badge.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-white">{badge.title}</h4>
                          {badge.isUnlocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          {badge.tierLabel}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        badge.isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {badge.description}
                  </p>

                  {/* Progress Bar & Tip */}
                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{badge.tip}</span>
                      <span className="font-bold text-white">
                        {badge.currentValue}/{badge.targetValue} {badge.unit}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.isUnlocked
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================
            TAB 3: MY PERSONAL SNAPS SHOWCASE
        ======================================================== */}
        {activeTab === 'snaps' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Khoảnh khắc đời thực bạn đã chia sẻ ({myMoments.length})
              </span>
              <Link
                to="/?tab=snap"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Chụp Snap mới</span>
              </Link>
            </div>

            {myMoments.length === 0 ? (
              <div className="p-8 text-center rounded-[28px] bg-[#161D2B]/50 border border-white/10 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-amber-400 opacity-60" />
                <p className="text-sm font-bold text-white">Bạn chưa chụp snap nào</p>
                <p className="text-xs text-slate-400">
                  Hãy dùng camera AI quét đồ vật và chia sẻ khoảnh khắc đầu tiên của bạn!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {myMoments.map((moment) => (
                  <div
                    key={moment.id}
                    className="p-3.5 rounded-[28px] bg-[#161D2B] border border-white/10 space-y-3 group"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-black/60 border border-white/10">
                      <img
                        src={moment.imageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-white">
                        {moment.timeAgo}
                      </span>
                    </div>

                    <p className="text-xs text-white font-medium line-clamp-1">
                      {moment.caption || 'Khoảnh khắc học từ vựng'}
                    </p>

                    {/* Vocab Tags in Snap */}
                    <div className="flex flex-wrap gap-1.5">
                      {moment.vocabTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => speakWord(tag.word)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-slate-950 border border-white/10 text-[11px] font-bold text-amber-300 transition-all cursor-pointer"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-3 h-3" />
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
      </main>
    </div>
  );
}

export default ProfilePage;
