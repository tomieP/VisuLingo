import { useState } from 'react';
import { FriendProfile } from '@/utils/friends';
import { Sparkles, UserPlus, Search, X } from 'lucide-react';
import { AddFriendModal } from './AddFriendModal';

interface FriendsStoryBarProps {
  friends: FriendProfile[];
  selectedFriendId: string | null;
  onSelectFriend: (friendId: string | null) => void;
  onOpenProfile: (friend: FriendProfile) => void;
}

export function FriendsStoryBar({
  friends,
  selectedFriendId,
  onSelectFriend,
  onOpenProfile,
}: FriendsStoryBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

  // Filter friends list by name or username
  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Sleek Top Header Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            Bạn bè <span className="text-amber-400 font-extrabold">({friends.length})</span>
          </span>
        </div>

        {/* Minimal Search Input */}
        <div className="relative flex items-center">
          <Search className="w-3 h-3 absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 sm:w-40 pl-7 pr-6 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 focus:bg-[#161D2B] border border-white/10 focus:border-amber-400/80 text-white placeholder-slate-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 p-0.5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Story Avatar Row (Hidden scrollbars via scrollbar-none) */}
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-0.5 pt-0.5">
        {/* 'All' button (only show when not searching) */}
        {!searchQuery && (
          <button
            type="button"
            onClick={() => onSelectFriend(null)}
            className={`flex flex-col items-center gap-1 shrink-0 transition-all select-none ${
              selectedFriendId === null ? 'opacity-100 scale-102' : 'opacity-65 hover:opacity-90'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                selectedFriendId === null
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black ring-3 ring-amber-400/30 shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-white border border-white/15'
              }`}
            >
              <span className="text-[11px] font-black">Tất cả</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Feed</span>
          </button>
        )}

        {/* Filtered Friends List */}
        {filteredFriends.length === 0 ? (
          <div className="py-2 px-2 text-xs text-slate-400 italic">
            Không tìm thấy bạn "{searchQuery}"
          </div>
        ) : (
          filteredFriends.map((friend) => {
            const isSelected = selectedFriendId === friend.id;

            return (
              <div
                key={friend.id}
                className={`flex flex-col items-center gap-1 shrink-0 transition-all select-none ${
                  isSelected ? 'scale-102' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {/* Avatar with ring */}
                <div
                  onClick={() => {
                    if (isSelected) {
                      onOpenProfile(friend);
                    } else {
                      onSelectFriend(friend.id);
                    }
                  }}
                  className={`relative w-12 h-12 rounded-full p-0.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-3 ring-amber-400 shadow-lg shadow-amber-400/30'
                      : 'bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 hover:scale-105'
                  }`}
                  title={`${friend.name} - Bấm để lọc Snaps, bấm đúp để xem Album`}
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-full h-full rounded-full object-cover border-2 border-[#0B0F17]"
                  />

                  {/* Streak flame badge */}
                  <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.1 rounded-full bg-[#161D2B] border border-amber-400/50 text-[8px] font-black text-amber-300 flex items-center shadow-xs">
                    🔥{friend.streak}
                  </span>
                </div>

                {/* Name */}
                <button
                  type="button"
                  onClick={() => onOpenProfile(friend)}
                  className="text-[10px] font-bold text-slate-300 hover:text-amber-300 truncate max-w-[56px] text-center"
                  title={`Xem hồ sơ của ${friend.name}`}
                >
                  {friend.name.split(' ').pop()}
                </button>
              </div>
            );
          })
        )}

        {/* Add Friend button */}
        {!searchQuery && (
          <button
            type="button"
            onClick={() => setIsAddFriendOpen(true)}
            className="flex flex-col items-center gap-1 shrink-0 opacity-55 hover:opacity-100 transition-opacity"
            title="Thêm bạn bè mới"
          >
            <div className="w-12 h-12 rounded-full border border-dashed border-white/20 hover:border-white/40 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-400">+ Bạn</span>
          </button>
        )}
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
      />
    </div>
  );
}
