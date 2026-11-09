import { useState, useEffect } from 'react';
import { X, Target, Sparkles, CheckCircle2, Gift } from 'lucide-react';
import {
  getEvaluatedChallenges,
  claimChallengeReward,
  getUserXp,
  EvaluatedChallenge,
} from '@/utils/challenges';

interface DailyChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyChallengesModal({ isOpen, onClose }: DailyChallengesModalProps) {
  const [challenges, setChallenges] = useState<EvaluatedChallenge[]>([]);
  const [userXp, setUserXp] = useState<number>(getUserXp());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setChallenges(getEvaluatedChallenges());
    setUserXp(getUserXp());
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();

    const handleProgress = () => {
      loadData();
    };
    const handleXp = () => {
      setUserXp(getUserXp());
    };

    window.addEventListener('visulingo_challenges_progress_changed', handleProgress);
    window.addEventListener('visulingo_challenges_changed', handleProgress);
    window.addEventListener('visulingo_xp_changed', handleXp);

    return () => {
      window.removeEventListener('visulingo_challenges_progress_changed', handleProgress);
      window.removeEventListener('visulingo_challenges_changed', handleProgress);
      window.removeEventListener('visulingo_xp_changed', handleXp);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClaim = (challenge: EvaluatedChallenge) => {
    const success = claimChallengeReward(challenge.id);
    if (success) {
      showToast(`🎉 Chúc mừng! Bạn nhận được +${challenge.rewardXp} XP`);
      loadData();
    }
  };

  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const totalCount = challenges.length;
  const overallPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161D2B] border border-white/15 rounded-[36px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <Target className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                Thử thách hôm nay
              </h3>
              <p className="text-[11px] text-slate-400">Hoàn thành nhiệm vụ để tích lũy XP & danh hiệu</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User XP Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-400/15 via-yellow-500/10 to-transparent border border-amber-400/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider block">
                Điểm kinh nghiệm
              </span>
              <span className="text-base font-black text-amber-400">
                {userXp} <span className="text-xs text-amber-300 font-bold">XP</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Tiến độ hôm nay</span>
            <span className="text-xs font-black text-white">
              {completedCount}/{totalCount} ({overallPercent}%)
            </span>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs text-center shadow-lg animate-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Challenges List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {challenges.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Gift className="w-8 h-8 mx-auto text-amber-400/50" />
              <p className="text-xs">Chưa có thử thách nào được kích hoạt.</p>
            </div>
          ) : (
            challenges.map((c) => {
              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    c.isClaimed
                      ? 'bg-white/[0.02] border-white/5 opacity-65'
                      : c.isCompleted
                      ? 'bg-amber-400/10 border-amber-400/40 shadow-sm shadow-amber-400/10'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                        {c.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                          {c.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{c.description}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                      +{c.rewardXp} XP
                    </span>
                  </div>

                  {/* Progress Bar & Action */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Tiến trình</span>
                        <span className="font-bold text-slate-300">
                          {c.currentCount}/{c.targetCount}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            c.isCompleted ? 'bg-amber-400' : 'bg-slate-400'
                          }`}
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0">
                      {c.isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã nhận
                        </span>
                      ) : c.isCompleted ? (
                        <button
                          type="button"
                          onClick={() => handleClaim(c)}
                          className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black shadow-md shadow-amber-400/30 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                        >
                          Nhận thưởng ✨
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5 rounded-full bg-white/5">
                          Đang làm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
