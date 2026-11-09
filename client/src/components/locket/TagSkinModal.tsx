import { useState, useEffect } from 'react';
import { X, Sparkles, Check, Lock, Crown, Zap, Volume2 } from 'lucide-react';
import {
  TAG_THEMES,
  TagThemeId,
  getActiveTagThemeId,
  setActiveTagThemeId,
  isUserSnapBoostVip,
  toggleSnapBoostVip,
  isTagThemeUnlocked,
  purchaseThemeWithXp,
} from '@/utils/tagThemes';
import { getUserXp } from '@/utils/challenges';
import { getUserStreak, getSavedWords } from '@/utils/storage';
import { getMoments, isFakeMoment } from '@/utils/moments';
import { speakWord } from '@/utils/speech';

interface TagSkinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagSkinModal({ isOpen, onClose }: TagSkinModalProps) {
  const [activeThemeId, setActiveThemeIdState] = useState<TagThemeId>(getActiveTagThemeId());
  const [previewThemeId, setPreviewThemeId] = useState<TagThemeId>(getActiveTagThemeId());
  const [isVip, setIsVip] = useState(isUserSnapBoostVip());
  const [userXp, setUserXp] = useState(getUserXp());
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'vip'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Compute real user stats
  const moments = getMoments().filter((m) => !isFakeMoment(m));
  const userStreak = getUserStreak();
  const savedWords = getSavedWords();
  const listenCount = parseInt(localStorage.getItem('visulingo_listen_count') || '0', 10);

  const stats = {
    snaps: moments.length,
    streak: userStreak,
    words: savedWords.length,
    listen: listenCount,
    xp: userXp,
    isVip,
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (!isOpen) return;
    setActiveThemeIdState(getActiveTagThemeId());
    setPreviewThemeId(getActiveTagThemeId());
    setIsVip(isUserSnapBoostVip());
    setUserXp(getUserXp());

    const handleThemeChange = () => {
      setActiveThemeIdState(getActiveTagThemeId());
    };
    const handleVipChange = () => {
      setIsVip(isUserSnapBoostVip());
    };
    const handleXpChange = () => {
      setUserXp(getUserXp());
    };

    window.addEventListener('visulingo_tag_theme_changed', handleThemeChange);
    window.addEventListener('visulingo_snapboost_changed', handleVipChange);
    window.addEventListener('visulingo_xp_changed', handleXpChange);

    return () => {
      window.removeEventListener('visulingo_tag_theme_changed', handleThemeChange);
      window.removeEventListener('visulingo_snapboost_changed', handleVipChange);
      window.removeEventListener('visulingo_xp_changed', handleXpChange);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const previewTheme = TAG_THEMES.find((t) => t.id === previewThemeId) || TAG_THEMES[0];

  const handleToggleVip = () => {
    const next = toggleSnapBoostVip();
    setIsVip(next);
    showToast(next ? 'Đã kích hoạt Gói SnapBoost VIP ✨' : 'Đã tắt Gói SnapBoost VIP');
  };

  const handleEquip = (themeId: TagThemeId) => {
    setActiveTagThemeId(themeId);
    setActiveThemeIdState(themeId);
    showToast('Đã trang bị ngoại trang nhãn thành công!');
  };

  const handleBuyWithXp = (themeId: TagThemeId) => {
    const res = purchaseThemeWithXp(themeId);
    showToast(res.message);
    if (res.success) {
      setUserXp(getUserXp());
      setActiveThemeIdState(themeId);
    }
  };

  const filteredThemes = TAG_THEMES.filter((t) => {
    if (activeTab === 'free') return t.category === 'free_milestone';
    if (activeTab === 'vip') return t.category === 'snapboost_vip';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101520] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                Cửa Hàng Ngoại Trang Nhãn
              </h3>
              <p className="text-[11px] text-slate-400">
                Tùy biến phong cách màu sắc & ánh sáng phát quang cho nhãn từ vựng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto scrollbar-thin">
          {/* SnapBoost VIP Bar & Balance */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border border-amber-400/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Gói SnapBoost VIP</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isVip
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {isVip ? 'Đang kích hoạt' : 'Chưa kích hoạt'}
                  </span>
                </div>
                <span className="text-[10px] text-amber-300/80">
                  Mở khóa toàn bộ ngoại trang cao cấp vĩnh viễn
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 block font-bold">Số dư tích lũy</span>
                <span className="text-xs font-black text-amber-300 font-mono">+{userXp} XP</span>
              </div>

              {/* VIP Quick Switch Toggle */}
              <button
                type="button"
                onClick={handleToggleVip}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                  isVip
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                    : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/15'
                }`}
                title="Bấm để bật/tắt quyền SnapBoost VIP để trải nghiệm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isVip ? 'VIP Bật' : 'Kích hoạt VIP'}</span>
              </button>
            </div>
          </div>

          {/* Live Tag Preview Card on Realistic Backdrop */}
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 h-36 flex flex-col items-center justify-center text-center p-4 shadow-inner">
            {/* Ambient vignette background */}
            <img
              src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80"
              alt="Backdrop preview"
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

            <div className="relative z-10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Xem trước hiệu ứng nhãn thực tế
              </span>

              {/* The Live Floating Pill */}
              <div className="flex justify-center">
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-xl backdrop-blur-md ${previewTheme.classes.pill}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${previewTheme.classes.dot}`} />
                  <span className={`text-xs tracking-tight capitalize ${previewTheme.classes.text}`}>
                    Coffee Cup
                  </span>
                  <button
                    type="button"
                    onClick={() => speakWord('Coffee Cup')}
                    className={`p-0.5 rounded-full hover:scale-110 transition-transform ${previewTheme.classes.speaker}`}
                    title="Nghe phát âm thử"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-bold text-white/90">
                {previewTheme.name}
              </div>
            </div>
          </div>

          {/* Filter Sub-Tabs */}
          <div className="flex items-center gap-2 pt-1 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({TAG_THEMES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('free')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'free'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎁 Cột mốc Miễn phí
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vip')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vip'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 SnapBoost VIP
            </button>
          </div>

          {/* Theme Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredThemes.map((t) => {
              const isCurrentActive = activeThemeId === t.id;
              const isSelectedPreview = previewThemeId === t.id;
              const isUnlocked = isTagThemeUnlocked(t, stats);

              // Calculate milestone progress for locked free items
              let progressText = '';
              let progressPercent = 100;
              if (t.category === 'free_milestone' && t.milestoneType && t.milestoneTarget) {
                let curr = 0;
                let unit = '';
                if (t.milestoneType === 'snaps') {
                  curr = stats.snaps;
                  unit = 'ảnh';
                } else if (t.milestoneType === 'streak') {
                  curr = stats.streak;
                  unit = 'ngày';
                } else if (t.milestoneType === 'words') {
                  curr = stats.words;
                  unit = 'từ';
                } else if (t.milestoneType === 'listen') {
                  curr = stats.listen;
                  unit = 'lần';
                }
                progressText = `${curr}/${t.milestoneTarget} ${unit}`;
                progressPercent = Math.min(100, Math.round((curr / t.milestoneTarget) * 100));
              }

              return (
                <div
                  key={t.id}
                  onClick={() => setPreviewThemeId(t.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelectedPreview
                      ? 'bg-white/10 border-white/30 ring-2 ring-white/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Glow color swatch */}
                        <div
                          className="w-4 h-4 rounded-full border border-white/40"
                          style={{
                            backgroundColor: t.accentColor,
                            boxShadow: `0 0 10px ${t.accentColor}`,
                          }}
                        />
                        <span className="font-bold text-xs text-white leading-tight">
                          {t.name}
                        </span>
                      </div>

                      {t.category === 'snapboost_vip' ? (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          VIP
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                          FREE
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {t.description}
                    </p>

                    {/* Condition badge / Progress */}
                    <div className="text-[10px] text-slate-300 bg-black/40 px-2 py-1 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400 truncate">{t.conditionText}</span>
                      {progressText && !isUnlocked && (
                        <span className="font-bold text-amber-300 shrink-0 font-mono">
                          {progressText}
                        </span>
                      )}
                    </div>

                    {!isUnlocked && progressText && (
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    {isCurrentActive ? (
                      <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đang trang bị</span>
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(t.id);
                        }}
                        className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Trang bị
                      </button>
                    ) : t.xpPrice ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyWithXp(t.id);
                        }}
                        disabled={userXp < t.xpPrice}
                        className={`w-full py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                          userXp >= t.xpPrice
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
                            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Đổi {t.xpPrice} XP</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Chưa mở khóa</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Toast Message */}
        {toastMsg && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
