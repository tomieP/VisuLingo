import { useState } from 'react';
import { X, Send, Check, Volume2, Flame } from 'lucide-react';
import { MomentPost, VocabTag } from '@/utils/moments';
import { getFriends, FriendProfile } from '@/utils/friends';
import { shareSnapToFriendChat } from '@/utils/chat';
import { speakWord } from '@/utils/speech';

interface ShareSnapModalProps {
  isOpen: boolean;
  onClose: () => void;
  moment: MomentPost;
  onOpenChatWithFriend?: (friendId: string) => void;
}

export function ShareSnapModal({
  isOpen,
  onClose,
  moment,
  onOpenChatWithFriend,
}: ShareSnapModalProps) {
  const friends = getFriends();
  const [selectedWord, setSelectedWord] = useState<VocabTag | null>(
    moment.vocabTags[0] || null
  );
  const [sentFriendIds, setSentFriendIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendToFriend = (friend: FriendProfile) => {
    shareSnapToFriendChat(
      friend.id,
      {
        author: moment.author,
        imageUrl: moment.imageUrl,
        caption: moment.caption,
        vocabTags: moment.vocabTags,
      },
      selectedWord || undefined
    );

    setSentFriendIds((prev) => [...prev, friend.id]);
    setToastMessage(`Đã gửi Snap tới ${friend.name}!`);

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0E131F] border border-white/15 rounded-[32px] p-5 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Gửi Snap vào đoạn chat</h3>
              <p className="text-[10px] text-slate-400">
                Snap của <span className="text-amber-300 font-semibold">{moment.author.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snap Preview Box */}
        <div className="flex gap-3 p-3 rounded-2xl bg-[#161D2B] border border-white/10 shrink-0">
          <img
            src={moment.imageUrl}
            alt=""
            className="w-16 h-16 rounded-xl object-cover border border-white/15 shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs text-slate-300 line-clamp-1 font-medium">
              {moment.caption || 'Khoảnh khắc học từ vựng tiếng Anh'}
            </p>

            <span className="text-[10px] text-amber-300 font-bold block">
              Chọn từ vựng để gửi kèm:
            </span>

            {/* Word Chips Selection */}
            <div className="flex flex-wrap gap-1">
              {moment.vocabTags.map((tag) => {
                const isSelected = selectedWord?.id === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setSelectedWord(tag);
                      speakWord(tag.word);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{tag.word}</span>
                    <Volume2 className="w-2.5 h-2.5 opacity-70" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Friend Selection List */}
        <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold text-slate-400 block px-1">
            Gửi cho bạn bè trong danh sách:
          </span>

          <div className="space-y-1.5">
            {friends.map((friend) => {
              const hasSent = sentFriendIds.includes(friend.id);

              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/15 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">
                          {friend.name}
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center">
                          <Flame className="w-2.5 h-2.5 fill-amber-400" />
                          {friend.streak}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {friend.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasSent ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          Đã gửi
                        </span>
                        {onOpenChatWithFriend && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenChatWithFriend(friend.id);
                            }}
                            className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold transition-all shadow-xs"
                          >
                            Mở chat
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendToFriend(friend)}
                        className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Gửi</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold text-center animate-in fade-in zoom-in-95 duration-150">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
