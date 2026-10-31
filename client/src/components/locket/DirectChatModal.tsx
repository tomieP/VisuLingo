import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  ArrowLeft,
  Volume2,
  Sparkles,
  Camera,
  Flame,
  CheckCheck,
  Smile,
  Play,
  Square,
  BookmarkPlus,
  BookOpen,
} from 'lucide-react';
import {
  getConversations,
  sendMessageToFriend,
  reactToMessage,
  markConversationAsRead,
  Conversation,
  ChatMessage,
} from '@/utils/chat';
import { getFriends, FriendProfile } from '@/utils/friends';
import { speakWord } from '@/utils/speech';
import { saveWord } from '@/utils/storage';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFriendId?: string | null;
}

const QUICK_VOCAB_SUGGESTIONS = [
  { word: 'fascinating', meaningVi: 'hấp dẫn, lôi cuốn', ipa: '/ˈfæs.ən.eɪ.tɪŋ/' },
  { word: 'productive', meaningVi: 'năng suất, hiệu quả', ipa: '/prəˈdʌk.tɪv/' },
  { word: 'cozy', meaningVi: 'ấm cúng, thoải mái', ipa: '/ˈkəʊ.zi/' },
  { word: 'aesthetic', meaningVi: 'có gu thẩm mỹ, nghệ thuật', ipa: '/esˈθet.ɪk/' },
];

export function DirectChatModal({ isOpen, onClose, initialFriendId }: DirectChatModalProps) {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [activeFriendId, setActiveFriendId] = useState<string | null>(initialFriendId || null);
  const [inputText, setInputText] = useState('');
  const [showVocabTray, setShowVocabTray] = useState(false);
  const [playingAudioWord, setPlayingAudioWord] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickPhotoInputRef = useRef<HTMLInputElement>(null);

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

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeFriendId) return;

    sendMessageToFriend(activeFriendId, { text: inputText.trim() });
    setInputText('');
  };

  const handleSendVocabCard = (card: typeof QUICK_VOCAB_SUGGESTIONS[0]) => {
    if (!activeFriendId) return;
    sendMessageToFriend(activeFriendId, {
      text: `Gửi bạn từ vựng hôm nay: "${card.word}" ✨`,
      vocabCard: card,
      audioWord: card.word,
    });
    setShowVocabTray(false);
  };

  const handleSendQuickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFriendId) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const snapUrl = ev.target?.result as string;
      sendMessageToFriend(activeFriendId, {
        snapImage: snapUrl,
        text: 'Vừa snap xong một khoảnh khắc mới nè 📸',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePlayAudio = (word: string) => {
    setPlayingAudioWord(word);
    speakWord(word, () => setPlayingAudioWord(null));
  };

  const handleReact = (msgId: string, emoji: string) => {
    if (!activeFriendId) return;
    reactToMessage(activeFriendId, msgId, emoji);
  };

  const handleSaveWordToSnapbook = (word: string, meaningVi: string, ipa?: string) => {
    saveWord({
      id: crypto.randomUUID(),
      word,
      meaningVi,
      ipa: ipa || '',
      example: '',
      savedAt: new Date().toISOString(),
    });
    alert(`Đã lưu "${word}" vào Snapbook của bạn!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[92vh] sm:h-[640px] bg-[#0E131F] border-t sm:border border-white/15 rounded-t-[36px] sm:rounded-[36px] shadow-2xl text-white flex flex-col overflow-hidden">
        {/* Hidden photo input for quick camera snap */}
        <input
          ref={quickPhotoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleSendQuickPhoto}
          className="hidden"
        />

        {/* ========================================================
            VIEW 1: ACTIVE CHAT ROOM
        ======================================================== */}
        {activeFriendId && currentFriend ? (
          <div className="flex flex-col h-full bg-[#0E131F]">
            {/* 1. Header with Streak Counter */}
            <div className="p-3 sm:p-3.5 border-b border-white/10 bg-[#161D2B]/90 backdrop-blur-xl shrink-0 space-y-2">
              <div className="flex items-center justify-between">
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
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0E131F]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-white">{currentFriend.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentFriend.username}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Đang online
                    </span>
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

              {/* Shared Streak Banner */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                  <span>
                    {currentConvo?.streakDays || currentFriend.streak} ngày streak giữ lửa cùng nhau
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-black">
                  Đã snap hôm nay ✓
                </span>
              </div>
            </div>

            {/* 2. Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {currentConvo?.messages?.map((msg: ChatMessage) => {
                const isMe = msg.senderId === 'me';
                const isHovered = hoveredMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                    className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group`}
                  >
                    {/* Quick Reactions Trigger Pill on Hover */}
                    {isHovered && (
                      <div
                        className={`absolute -top-7 ${
                          isMe ? 'right-2' : 'left-2'
                        } flex items-center gap-1 bg-[#161D2B] border border-white/15 px-2 py-0.5 rounded-full shadow-xl z-20 animate-in fade-in zoom-in-90 duration-100`}
                      >
                        {['🔥', '❤️', '💡', '👏'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReact(msg.id, emoji)}
                            className="hover:scale-125 transition-transform text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`relative max-w-[82%] sm:max-w-[75%] rounded-[24px] p-3 text-xs leading-relaxed space-y-2 transition-all ${
                        isMe
                          ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-medium rounded-br-xs shadow-lg shadow-amber-400/10'
                          : 'bg-[#182030] text-slate-100 border border-white/10 rounded-bl-xs shadow-md'
                      }`}
                    >
                      {/* Photo Snap in Message */}
                      {msg.snapImage && (
                        <div className="rounded-2xl overflow-hidden aspect-4/3 bg-black/60 border border-white/15 shadow-inner">
                          <img
                            src={msg.snapImage}
                            alt="Snap"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Text */}
                      {msg.text && <p className="font-medium">{msg.text}</p>}

                      {/* Voice Note / Audio Pronunciation Waveform */}
                      {msg.audioWord && (
                        <div
                          className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 ${
                            isMe
                              ? 'bg-black/15 border-black/20 text-slate-950'
                              : 'bg-black/40 border-white/10 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(msg.audioWord!)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                                isMe
                                  ? 'bg-slate-950 text-amber-300'
                                  : 'bg-amber-400 text-slate-950'
                              }`}
                            >
                              {playingAudioWord === msg.audioWord ? (
                                <Square className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>

                            {/* Sound waveform bars */}
                            <div className="flex items-center gap-1">
                              {[8, 14, 22, 12, 18, 10, 16, 20, 12, 6].map((h, i) => (
                                <span
                                  key={i}
                                  style={{ height: `${h}px` }}
                                  className={`w-1 rounded-full transition-all ${
                                    playingAudioWord === msg.audioWord
                                      ? 'bg-amber-400 animate-pulse'
                                      : isMe
                                      ? 'bg-slate-950/40'
                                      : 'bg-white/40'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold opacity-80">
                            0:03
                          </span>
                        </div>
                      )}

                      {/* Vocab Card Widget */}
                      {msg.vocabCard && (
                        <div
                          className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
                            isMe
                              ? 'bg-black/15 border-black/20 text-slate-950'
                              : 'bg-black/50 border-white/10 text-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs capitalize">
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

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => speakWord(msg.vocabCard?.word || '')}
                              className="p-1.5 rounded-full hover:bg-black/20 transition-colors"
                              title="Phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveWordToSnapbook(
                                  msg.vocabCard!.word,
                                  msg.vocabCard!.meaningVi,
                                  msg.vocabCard!.ipa
                                )
                              }
                              className="p-1.5 rounded-full hover:bg-black/20 text-emerald-400 transition-colors"
                              title="Lưu vào Snapbook"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reaction Badge & Timestamp */}
                    <div className="flex items-center gap-1 px-1 text-[9px] text-slate-500 font-medium">
                      {msg.reaction && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#182030] border border-white/15 text-[10px] shadow-sm animate-bounce">
                          {msg.reaction}
                        </span>
                      )}
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-amber-400" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. Quick Vocab Stickers Tray */}
            {showVocabTray && (
              <div className="p-3 bg-[#161D2B] border-t border-white/10 animate-in slide-in-from-bottom-2 duration-150 shrink-0">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Chia sẻ từ vựng chuẩn ngữ cảnh:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVocabTray(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_VOCAB_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendVocabCard(item)}
                      className="p-2.5 rounded-2xl bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/10 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-amber-300 capitalize">
                          {item.word}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{item.ipa}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                        {item.meaningVi}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Social Input Bar */}
            <form
              onSubmit={handleSendText}
              className="p-3 border-t border-white/10 bg-[#161D2B]/80 backdrop-blur-md flex items-center gap-2 shrink-0"
            >
              {/* Quick Snap Camera */}
              <button
                type="button"
                onClick={() => quickPhotoInputRef.current?.click()}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-amber-400 hover:scale-105 transition-all"
                title="Gửi ảnh Snap tức thì"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Vocab Picker Toggle */}
              <button
                type="button"
                onClick={() => setShowVocabTray(!showVocabTray)}
                className={`p-2 rounded-full border transition-all ${
                  showVocabTray
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-amber-300'
                }`}
                title="Gửi thẻ từ vựng"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={`Nhắn cho ${currentFriend.name.split(' ').pop()}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 focus:border-amber-400 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-slate-950 font-bold shadow-md shadow-amber-400/20 transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================
             VIEW 2: CONVERSATIONS LIST
          ======================================================== */
          <div className="flex flex-col h-full bg-[#0E131F]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#161D2B]/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Tin nhắn bạn bè</h3>
                  <p className="text-[11px] text-slate-400">Giữ lửa streak & trao đổi từ vựng hàng ngày</p>
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

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {friends.map((friend) => {
                const convo = conversations[friend.id];
                const lastMsg = convo?.messages?.[convo.messages.length - 1];
                const hasUnread = (convo?.unreadCount || 0) > 0;

                return (
                  <div
                    key={friend.id}
                    onClick={() => setActiveFriendId(friend.id)}
                    className="flex items-center justify-between p-3.5 rounded-[26px] bg-[#161D2B]/70 hover:bg-[#161D2B] border border-white/5 hover:border-amber-400/40 transition-all cursor-pointer group shadow-sm hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-amber-400 transition-all"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0E131F]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white group-hover:text-amber-300 transition-colors">
                            {friend.name}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold px-1.5 py-0.2 rounded-full bg-amber-400/15">
                            <Flame className="w-2.5 h-2.5 fill-amber-400" />
                            {convo?.streakDays || friend.streak}d
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate max-w-[210px] mt-0.5 font-medium">
                          {lastMsg?.snapImage
                            ? '📸 Đã gửi một Snap ảnh'
                            : lastMsg?.text || 'Bắt đầu trò chuyện cùng học từ vựng...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {lastMsg ? lastMsg.time : 'Mới'}
                      </span>
                      {hasUnread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
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
