import { useState, useEffect, useRef } from 'react';
import { X, Send, ArrowLeft, Volume2, Sparkles, BookOpen, MessageSquare, CheckCheck } from 'lucide-react';
import {
  getConversations,
  sendMessageToFriend,
  markConversationAsRead,
  Conversation,
} from '@/utils/chat';
import { getFriends, FriendProfile } from '@/utils/friends';
import { speakWord } from '@/utils/speech';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFriendId?: string | null;
}

const QUICK_VOCAB_STICKERS = [
  { word: 'fluctuation', meaningVi: 'sự dao động, biến động', ipa: '/ˌflʌk.tʃuˈeɪ.ʃən/' },
  { word: 'fascinating', meaningVi: 'hấp dẫn, lôi cuốn', ipa: '/ˈfæs.ən.eɪ.tɪŋ/' },
  { word: 'cozy', meaningVi: 'ấm cúng, thoải mái', ipa: '/ˈkəʊ.zi/' },
  { word: 'delightful', meaningVi: 'thú vị, tuyệt vời', ipa: '/dɪˈlaɪt.fəl/' },
];

export function DirectChatModal({ isOpen, onClose, initialFriendId }: DirectChatModalProps) {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [activeFriendId, setActiveFriendId] = useState<string | null>(initialFriendId || null);
  const [inputText, setInputText] = useState('');
  const [showVocabPicker, setShowVocabPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const friends = getFriends();

  const loadChatData = () => {
    setConversations(getConversations());
  };

  useEffect(() => {
    loadChatData();
    window.addEventListener('visulingo_chat_changed', loadChatData);
    return () => window.removeEventListener('visulingo_chat_changed', loadChatData);
  }, []);

  useEffect(() => {
    if (initialFriendId) {
      setActiveFriendId(initialFriendId);
      markConversationAsRead(initialFriendId);
    }
  }, [initialFriendId]);

  useEffect(() => {
    if (activeFriendId) {
      markConversationAsRead(activeFriendId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeFriendId, conversations]);

  if (!isOpen) return null;

  const currentFriend: FriendProfile | undefined = friends.find((f) => f.id === activeFriendId);
  const currentConvo: Conversation | undefined = activeFriendId ? conversations[activeFriendId] : undefined;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeFriendId) return;

    sendMessageToFriend(activeFriendId, inputText);
    setInputText('');
  };

  const handleSendVocabCard = (card: typeof QUICK_VOCAB_STICKERS[0]) => {
    if (!activeFriendId) return;
    sendMessageToFriend(activeFriendId, `Chia sẻ từ vựng mới: "${card.word}" ✨`, card);
    setShowVocabPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[92vh] sm:h-[620px] bg-[#161D2B] border-t sm:border border-white/15 rounded-t-[36px] sm:rounded-[36px] shadow-2xl text-white flex flex-col overflow-hidden">
        {/* ROOM VIEW: Chatting with a friend */}
        {activeFriendId && currentFriend ? (
          <div className="flex flex-col h-full">
            {/* Room Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-[#0B0F17]/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveFriendId(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <img
                    src={currentFriend.avatar}
                    alt={currentFriend.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#161D2B]" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">{currentFriend.name}</span>
                    {currentFriend.badge && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300">
                        {currentFriend.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Đang hoạt động</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center py-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-400 font-mono">
                  Cuộc trò chuyện được bảo mật • Bắt đầu học từ vựng cùng nhau
                </span>
              </div>

              {currentConvo?.messages?.map((msg) => {
                const isMe = msg.senderId === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div
                      className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-medium rounded-tr-xs shadow-md shadow-amber-400/10'
                          : 'bg-white/8 text-slate-100 border border-white/10 rounded-tl-xs backdrop-blur-md'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Attached Vocab Card if any */}
                      {msg.vocabCard && (
                        <div
                          className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                            isMe
                              ? 'bg-black/15 border-black/20 text-slate-950'
                              : 'bg-black/40 border-white/10 text-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs capitalize">
                                {msg.vocabCard.word}
                              </span>
                              {msg.vocabCard.ipa && (
                                <span className="text-[10px] opacity-75 font-mono">
                                  {msg.vocabCard.ipa}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] opacity-90 block">
                              {msg.vocabCard.meaningVi}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => speakWord(msg.vocabCard?.word || '')}
                            className="p-1.5 rounded-full hover:bg-black/20 transition-colors"
                            title="Phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 px-1 text-[9px] text-slate-500 font-medium">
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-amber-400" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Vocab Stickers Selector */}
            {showVocabPicker && (
              <div className="p-3 bg-[#0B0F17]/90 border-t border-white/10 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Chia sẻ nhanh từ vựng hay:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVocabPicker(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_VOCAB_STICKERS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendVocabCard(item)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/10 text-left transition-all text-xs"
                    >
                      <span className="font-bold text-amber-300 block capitalize">{item.word}</span>
                      <span className="text-[10px] text-slate-300 line-clamp-1">{item.meaningVi}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-white/10 bg-[#0B0F17]/50 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                onClick={() => setShowVocabPicker(!showVocabPicker)}
                className={`p-2 rounded-full border transition-all ${
                  showVocabPicker
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-amber-300 hover:bg-white/10'
                }`}
                title="Chia sẻ từ vựng"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Nhắn tin cho bạn bè..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 focus:border-amber-400 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-slate-950 font-bold shadow-md shadow-amber-400/20 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* CONVERSATIONS LIST VIEW */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0F17]/60 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Tin nhắn bạn bè</h3>
                  <p className="text-[11px] text-slate-400">Trò chuyện và cùng nhau học từ vựng</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {friends.map((friend) => {
                const convo = conversations[friend.id];
                const lastMsg = convo?.messages?.[convo.messages.length - 1];
                const hasUnread = (convo?.unreadCount || 0) > 0;

                return (
                  <div
                    key={friend.id}
                    onClick={() => setActiveFriendId(friend.id)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/5 hover:border-amber-400/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-amber-400 transition-all"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#161D2B]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                            {friend.name}
                          </span>
                          {friend.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300">
                              {friend.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[210px] mt-0.5">
                          {lastMsg ? lastMsg.text : 'Bắt đầu trò chuyện cùng học từ vựng...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className="text-[9px] text-slate-500 font-medium">
                        {lastMsg ? lastMsg.time : 'Mới'}
                      </span>
                      {hasUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
