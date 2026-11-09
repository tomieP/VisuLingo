import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  X,
  Flame,
  Settings as SettingsIcon,
  Camera,
  Trash2,
  Share2,
  CheckCircle2,
  Lock,
  Volume2,
  Trophy,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { LocketBottomBar } from '@/components/locket/LocketBottomBar';
import { getCurrentUser, getUserUsername, setUserUsername } from '@/services/authService';
import { getSavedWords, getUserStreak, getLocalDateString } from '@/utils/storage';
import { getAuthoritativeDate } from '@/utils/authoritativeTime';
import { getMoments, MomentPost, deleteMoment, isFakeMoment } from '@/utils/moments';
import { speakWord } from '@/utils/speech';
import { getBadges, evaluateBadges, EvaluatedBadge } from '@/utils/badges';
import {
  getEvaluatedChallenges,
  claimChallengeReward,
  getUserXp,
  EvaluatedChallenge,
} from '@/utils/challenges';
import { getActiveTagTheme } from '@/utils/tagThemes';
import { getFriends } from '@/utils/friends';
import { TagSkinModal } from '@/components/locket/TagSkinModal';
import { isUserSnapBoostVip } from '@/utils/tagThemes';



function ProfilePage() {
  const currentUser = getCurrentUser();
  const userTag = getUserUsername();
  const savedWords = getSavedWords();
  const [moments, setMoments] = useState<MomentPost[]>(getMoments());
  const [activeTab, setActiveTab] = useState<'snaps' | 'missions' | 'badges'>('snaps');
  const [isTagSkinOpen, setIsTagSkinOpen] = useState(false);
  const [isVip, setIsVip] = useState(isUserSnapBoostVip());
  const [challenges, setChallenges] = useState<EvaluatedChallenge[]>(getEvaluatedChallenges());
  const [userXp, setUserXp] = useState<number>(getUserXp());
  const [activeTheme, setActiveTheme] = useState(getActiveTagTheme());
  const [copiedToast, setCopiedToast] = useState(false);
  const [userStreak, setUserStreakState] = useState(getUserStreak());
  const userLevel = Math.max(1, Math.floor(savedWords.length / 5) + 1);

  const [currentTag, setCurrentTag] = useState(userTag);
  const [displayName, setDisplayName] = useState(
    currentUser?.firstName
      ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
      : (localStorage.getItem('visulingo_display_name') || 'lowkey')
  );
  const [bio, setBio] = useState(
    localStorage.getItem('visulingo_bio') ||
    'Mỗi ngày chụp và nạp 10 từ vựng qua ảnh thực tế. Cùng nhau giữ lửa streak! 🚀'
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editBio, setEditBio] = useState('');

  const [userAvatar, setUserAvatar] = useState<string>(
    localStorage.getItem('visulingo_avatar') ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleAvatarChange = () => {
      setUserAvatar(
        localStorage.getItem('visulingo_avatar') ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      );
    };
    const handleMomentsChange = () => {
      setMoments(getMoments());
    };
    window.addEventListener('visulingo_avatar_changed', handleAvatarChange);
    window.addEventListener('visulingo_moments_changed', handleMomentsChange);
    const handleBadgesChange = () => setMoments(getMoments());
    window.addEventListener('visulingo_badges_changed', handleBadgesChange);
    const handleVipChange = () => setIsVip(isUserSnapBoostVip());
    window.addEventListener('visulingo_snapboost_changed', handleVipChange);

    const handleChallengesChange = () => {
      setChallenges(getEvaluatedChallenges());
      setUserXp(getUserXp());
    };
    const handleThemeChange = () => setActiveTheme(getActiveTagTheme());
    const handleStreakChange = () => setUserStreakState(getUserStreak());

    window.addEventListener('visulingo_challenges_progress_changed', handleChallengesChange);
    window.addEventListener('visulingo_challenges_changed', handleChallengesChange);
    window.addEventListener('visulingo_xp_changed', handleChallengesChange);
    window.addEventListener('visulingo_tag_theme_changed', handleThemeChange);
    window.addEventListener('visulingo_streak_changed', handleStreakChange);
    return () => {
      window.removeEventListener('visulingo_avatar_changed', handleAvatarChange);
      window.removeEventListener('visulingo_moments_changed', handleMomentsChange);
      window.removeEventListener('visulingo_badges_changed', handleBadgesChange);
      window.removeEventListener('visulingo_snapboost_changed', handleVipChange);
      window.removeEventListener('visulingo_challenges_progress_changed', handleChallengesChange);
      window.removeEventListener('visulingo_challenges_changed', handleChallengesChange);
      window.removeEventListener('visulingo_xp_changed', handleChallengesChange);
      window.removeEventListener('visulingo_tag_theme_changed', handleThemeChange);
      window.removeEventListener('visulingo_streak_changed', handleStreakChange);
    };
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setUserAvatar(url);
        localStorage.setItem('visulingo_avatar', url);
        window.dispatchEvent(new Event('visulingo_avatar_changed'));
        window.dispatchEvent(new Event('visulingo_moments_changed'));
      };
      reader.readAsDataURL(file);
    }
  };

  const myMoments = moments.filter(
    (m) =>
      !isFakeMoment(m) &&
      (m.author.name === displayName ||
        m.author.name.toLowerCase().includes('bạn') ||
        (currentUser?.firstName && m.author.name.includes(currentUser.firstName)))
  );

  const friends = getFriends();
  const listenCount = parseInt(localStorage.getItem('visulingo_listen_count') || '0', 10);
  const badges: EvaluatedBadge[] = evaluateBadges(getBadges(), {
    snapsCount: myMoments.length,
    savedWordsCount: savedWords.length,
    streakDays: userStreak,
    friendsCount: friends.length,
    listenCount,
  });

  // Dynamic 7-day week calendar based on authoritative server time & actual activity
  const now = getAuthoritativeDate();
  const currentDayOfWeek = now.getDay();
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  let streakHistory: string[] = [];
  try {
    const rawHistory = localStorage.getItem('visulingo_streak_history');
    streakHistory = rawHistory ? JSON.parse(rawHistory) : [];
  } catch {}

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = getLocalDateString(d);
    const isToday = d.toDateString() === now.toDateString();
    const hasActivity = isToday
      ? userStreak > 0 || myMoments.some((m) => m.createdAt && getLocalDateString(new Date(m.createdAt)) === dateStr)
      : streakHistory.includes(dateStr) || myMoments.some((m) => m.createdAt && getLocalDateString(new Date(m.createdAt)) === dateStr);
    return {
      day: label,
      date: d.getDate().toString().padStart(2, '0'),
      completed: hasActivity,
      isToday,
    };
  });

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
        <div className="p-4 sm:p-5 rounded-[28px] bg-gradient-to-br from-[#161D2B] via-[#121824] to-[#0D121D] border border-white/10 relative overflow-hidden shadow-2xl space-y-3.5">
          {/* Ambient Lighting Accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Profile Header: Avatar & Core Info */}
          <div className="flex items-start sm:items-center gap-3.5 relative z-10">
            {/* Avatar with Halo Streak Ring - strictly bounded dimensions */}
            <div
              className="relative shrink-0 group cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
              title="Nhấp để đổi ảnh đại diện"
            >
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 shadow-lg shadow-amber-400/20 ring-2 ring-amber-400/30 overflow-hidden flex items-center justify-center relative">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full rounded-[14px] object-cover group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[14px]">
                  <Camera className="w-5 h-5 text-amber-300 drop-shadow" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-400 text-[10px] font-black text-amber-300 flex items-center gap-0.5 shadow-md">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                {userStreak}d
              </span>
            </div>

            {/* User Meta */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                  {displayName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black flex items-center gap-1 shadow-xs">
                  <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  Level {userLevel}
                </span>

                <button
                  type="button"
                  onClick={() => setIsTagSkinOpen(true)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                    isVip
                      ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-xs'
                      : 'bg-purple-500/20 border border-purple-400/30 text-purple-300 hover:bg-purple-500/30'
                  }`}
                  title="Mở SnapBoost Studio & Đổi màu nhãn"
                >
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  <span>SnapBoost {isVip ? 'VIP ✨' : ''}</span>
                </button>
              </div>

              {/* Customizable @Tag pill */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditDisplayName(displayName);
                    setEditTag(currentTag);
                    setEditBio(bio);
                    setIsEditingProfile(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-amber-400/15 border border-white/10 hover:border-amber-400/30 text-xs text-amber-300 font-mono font-bold transition-all cursor-pointer group"
                  title="Chạm để đổi @tag và hồ sơ"
                >
                  <span>@{currentTag}</span>
                  <Pencil className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 text-slate-400 group-hover:text-amber-300" />
                </button>
              </div>
            </div>
          </div>

          {/* User Bio Quote */}
          <div className="relative z-10">
            <p className="text-xs text-slate-300 leading-relaxed italic bg-white/[0.02] px-3 py-2 rounded-xl border border-white/5">
              "{bio}"
            </p>
          </div>

          {/* Unified Clean 3-Stats Row */}
          <div className="py-2.5 px-2 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-around divide-x divide-white/5 text-center relative z-10">
            <div className="flex-1 px-1">
              <div className="text-base sm:text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                {userStreak}d
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Chuỗi Streak</div>
            </div>

            <div className="flex-1 px-1">
              <div className="text-base sm:text-lg font-black text-white">
                {myMoments.length}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ảnh Snaps</div>
            </div>

            <div className="flex-1 px-1">
              <div className="text-base sm:text-lg font-black text-amber-300">
                {savedWords.length}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Từ vựng đã lưu</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-0.5 relative z-10">
            <button
              type="button"
              onClick={() => {
                setEditDisplayName(displayName);
                setEditTag(currentTag);
                setEditBio(bio);
                setIsEditingProfile(true);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-400" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>

            <button
              type="button"
              onClick={handleShareProfile}
              className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              title="Chia sẻ hồ sơ"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* SnapBoost Studio Access Bar */}
        <div
          onClick={() => setIsTagSkinOpen(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border border-amber-400/25 hover:border-amber-400/40 transition-all cursor-pointer shadow-md flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">Ngoại Trang Nhãn SnapBoost</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {isVip ? 'VIP ✨' : 'Tùy biến'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Đang dùng: <span className="text-amber-300 font-bold">{activeTheme.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Đổi màu
          </button>
        </div>

        {/* ========================================================
            PROFILE 3-TAB SEGMENTED BAR: SNAPS, MISSIONS, BADGES
        ======================================================== */}
        <div className="p-1 rounded-2xl bg-[#121824]/90 border border-white/10 backdrop-blur-md flex gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('snaps')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'snaps'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snaps ({myMoments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Nhiệm vụ ({challenges.filter((c) => c.isCompleted).length}/{challenges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Huy hiệu ({badges.filter((b) => b.isUnlocked).length}/{badges.length})</span>
          </button>
        </div>

        {/* ========================================================
            TAB: NHIỆM VỤ HẰNG NGÀY & TÍCH LŨY XP
        ======================================================== */}
        {activeTab === 'missions' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Total XP Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-400/30 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kho điểm kinh nghiệm (XP)
                  </span>
                  <span className="text-xl font-black text-amber-300 font-mono">
                    +{userXp} XP
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Làm nhiệm vụ nhận XP đổi quà
              </span>
            </div>

            {/* Daily Missions List */}
            <div className="space-y-2.5">
              {challenges.map((c) => {
                const canClaim = c.isCompleted && !c.isClaimed;
                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                      c.isClaimed
                        ? 'bg-[#121824]/50 border-white/5 opacity-70'
                        : c.isCompleted
                        ? 'bg-amber-500/10 border-amber-400/40 shadow-md shadow-amber-400/10'
                        : 'bg-[#161D2B] border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {c.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{c.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{c.description}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {c.isClaimed ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ Đã nhận
                          </span>
                        ) : canClaim ? (
                          <button
                            type="button"
                            onClick={() => {
                              claimChallengeReward(c.id);
                              setChallenges(getEvaluatedChallenges());
                              setUserXp(getUserXp());
                            }}
                            className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md shadow-amber-400/30 animate-pulse"
                          >
                            Nhận +{c.rewardXp} XP ✨
                          </button>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            +{c.rewardXp} XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Tiến trình hôm nay</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {c.currentCount}/{c.targetCount}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-300"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: HUY HIỆU & CHUỖI HỌC (GỒM LỊCH 7 NGÀY + DANH HIỆU)
        ======================================================== */}
        {activeTab === 'badges' && (
          <div className="space-y-3.5">
            {/* Lịch giữ lửa 7 ngày */}
            <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-white/10 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Chuỗi giữ lửa tuần này
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  {userStreak > 0 ? `Đã giữ ${userStreak} ngày liên tục 🔥` : 'Chưa kích hoạt'}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((w, i) => (
                  <div
                    key={i}
                    className={`py-1.5 px-1 rounded-xl border flex flex-col items-center gap-0.5 ${
                      w.completed
                        ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="text-[9px] font-bold block">{w.day}</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center">
                      {w.completed ? (
                        <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      )}
                    </div>
                    <span className="text-[8px] font-mono">{w.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block px-0.5">
                Danh hiệu & Điều kiện mở khóa
              </span>
            {badges.map((badge) => (
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
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Xóa ảnh Snap này khỏi hồ sơ của bạn?')) {
                            deleteMoment(moment.id);
                          }
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-500 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
                        title="Xóa Snap này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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


      </main>

      {/* Floating 5-Pill Bottom Navigation Bar */}
      <LocketBottomBar
        activeTab="pocket"
        onTabChange={() => {}}
        savedCount={savedWords.length}
      />
      {/* Tag Skin Modal */}
      <TagSkinModal
        isOpen={isTagSkinOpen}
        onClose={() => setIsTagSkinOpen(false)}
      />

      {/* Modal: Edit Profile Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#161D2B] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-extrabold text-sm text-white">Chỉnh sửa Hồ sơ Snapper</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tên hiển thị</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Tên của bạn"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>

              {/* @Tag */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tên @tag</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    placeholder="tag_cua_ban"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-mono focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Cho phép chữ thường, số, dấu gạch dưới và dấu chấm.</p>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tiểu sử (Bio)</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Giới thiệu bản thân và mục tiêu học..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-hidden focus:border-amber-400 resize-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editDisplayName.trim()) {
                    setDisplayName(editDisplayName.trim());
                    localStorage.setItem('visulingo_display_name', editDisplayName.trim());
                  }
                  if (editTag.trim()) {
                    const saved = setUserUsername(editTag);
                    setCurrentTag(saved);
                  }
                  if (editBio.trim()) {
                    setBio(editBio.trim());
                    localStorage.setItem('visulingo_bio', editBio.trim());
                  }
                  setIsEditingProfile(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-md shadow-amber-400/20 active:scale-98 transition-all"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
