import { X, Flame, Sparkles, Crown } from 'lucide-react';
import { getFriends } from '@/utils/friends';
import { getCurrentUser, getUserUsername } from '@/services/authService';
import { getUserStreak } from '@/utils/storage';

interface FriendLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendLeaderboardModal({ isOpen, onClose }: FriendLeaderboardModalProps) {
  if (!isOpen) return null;

  const friends = getFriends();
  const currentUser = getCurrentUser();
  const userTag = getUserUsername();
  const streak = getUserStreak();
  const myName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : (localStorage.getItem('visulingo_display_name') || 'Bạn (Me)');
  const myAvatar =
    localStorage.getItem('visulingo_avatar') ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  // Combine user with friends and rank purely by streak days
  const allRanked = [
    {
      id: 'me',
      name: `${myName} (Bạn)`,
      username: `@${userTag}`,
      avatar: myAvatar,
      badge: streak > 0 ? `Streak ${streak} 🔥` : 'Mới bắt đầu 🌱',
      streak,
      isMe: true,
    },
    ...friends.map((f) => ({
      id: f.id,
      name: f.name,
      username: f.username,
      avatar: f.avatar,
      badge: f.badge,
      streak: f.streak,
      isMe: false,
    })),
  ].sort((a, b) => b.streak - a.streak);

  const top1 = allRanked[0];
  const top2 = allRanked[1];
  const top3 = allRanked[2];

  const myRank = allRanked.findIndex((item) => item.isMe) + 1;
  const personAhead = myRank > 1 ? allRanked[myRank - 2] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161D2B] border border-white/15 rounded-[36px] p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                Bảng xếp hạng Streak
              </h3>
              <p className="text-[11px] text-slate-400">Đua chuỗi ngày học liên tục cùng bạn bè 🔥</p>
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

        {/* Podium Top 3 */}
        <div className="grid grid-cols-3 gap-2 pt-2 pb-3 items-end text-center shrink-0">
          {/* Top 2 */}
          {top2 && (
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-black text-slate-300">#2 🥈</span>
              <div className="relative">
                <img
                  src={top2.avatar}
                  alt={top2.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-400 shadow-md"
                />
              </div>
              <span className="text-xs font-bold truncate max-w-[75px] text-slate-200">
                {top2.name.split(' ').pop()}
              </span>
              <span className="text-[10px] font-extrabold text-amber-300 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>{top2.streak} ngày</span>
              </span>
            </div>
          )}

          {/* Top 1 */}
          {top1 && (
            <div className="flex flex-col items-center space-y-1 -mt-2">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
              <div className="relative">
                <img
                  src={top1.avatar}
                  alt={top1.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-400 shadow-xl shadow-amber-400/30"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#161D2B] border border-amber-400 text-[9px] font-black text-amber-300">
                  #1 🥇
                </span>
              </div>
              <span className="text-xs font-extrabold truncate max-w-[90px] text-amber-300">
                {top1.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[11px] border border-amber-400/30 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>{top1.streak} ngày</span>
              </span>
            </div>
          )}

          {/* Top 3 */}
          {top3 && (
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-black text-amber-600">#3 🥉</span>
              <div className="relative">
                <img
                  src={top3.avatar}
                  alt={top3.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-600 shadow-md"
                />
              </div>
              <span className="text-xs font-bold truncate max-w-[75px] text-slate-200">
                {top3.name.split(' ').pop()}
              </span>
              <span className="text-[10px] font-extrabold text-amber-300 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>{top3.streak} ngày</span>
              </span>
            </div>
          )}
        </div>

        {/* Motivational Card for user */}
        {personAhead && (
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-slate-200">
                Bạn đang giữ chuỗi <strong>🔥 {streak} ngày</strong>. Học mỗi ngày để bám đuổi{' '}
                <strong className="text-amber-300">{personAhead.name.split(' ').pop()}</strong> (
                {personAhead.streak} ngày)!
              </p>
            </div>
          </div>
        )}

        {/* Full Streak Ranking List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {allRanked.map((user, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  user.isMe
                    ? 'bg-amber-400/15 border-amber-400/40 ring-1 ring-amber-400/30'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 text-center text-xs font-black ${
                      rank === 1
                        ? 'text-amber-400'
                        : rank === 2
                        ? 'text-slate-300'
                        : rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    #{rank}
                  </span>

                  <img
                    src={user.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          user.isMe ? 'text-amber-300' : 'text-white'
                        }`}
                      >
                        {user.name}
                      </span>
                      {user.isMe && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                          Tôi
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {user.username}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{user.streak} ngày</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
