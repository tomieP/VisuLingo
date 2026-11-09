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
  Check,
  Play,
  Square,
  BookmarkPlus,
  BookOpen,
  MessageSquare,
  Bell,
  Heart,
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
import { getMoments, MomentPost } from '@/utils/moments';
import { speakWord } from '@/utils/speech';
import { saveWord } from '@/utils/storage';
import {
  AppNotification,
  getNotifications,
  markNotificationAsRead,
  executeNotificationAction,
} from '@/utils/notifications';

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
  const [showSnapPicker, setShowSnapPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'snaps' | 'words'>('snaps');
  const [playingAudioWord, setPlayingAudioWord] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'messages' | 'activity'>('messages');
  const [featuredFriendId, setFeaturedFriendId] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const quickPhotoInputRef = useRef<HTMLInputElement>(null);

  const friends = getFriends();
  const moments = getMoments();

  // Collect distinct vocab words across all friend snaps
  const allSnapVocabWords: Array<{ word: string; meaningVi: string; ipa?: string; authorName: string }> = [];
  const seenWords = new Set<string>();
  moments.forEach((m) => {
    (m.vocabTags || []).forEach((t) => {
      if (!seenWords.has(t.word.toLowerCase())) {
        seenWords.add(t.word.toLowerCase());
        allSnapVocabWords.push({
          word: t.word,
          meaningVi: t.meaningVi,
          ipa: t.ipa,
          authorName: m.author.name,
        });
      }
    });
  });

  const loadChatData = () => {
    setConversations(getConversations());
    setNotifications(getNotifications());
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    loadChatData();
    window.addEventListener('visulingo_chat_changed', loadChatData);
    window.addEventListener('visulingo_notifications_changed', loadChatData);
    return () => {
      window.removeEventListener('visulingo_chat_changed', loadChatData);
      window.removeEventListener('visulingo_notifications_changed', loadChatData);
    };
  }, []);

  useEffect(() => {
    if (initialFriendId) {
      setActiveFriendId(initialFriendId);
    }
  }, [initialFriendId]);

  // When switching friends, mark as read and scroll to bottom ONCE (without locking upward scroll)
  useEffect(() => {
    if (activeFriendId) {
      markConversationAsRead(activeFriendId);
      setTimeout(() => scrollToBottom('auto'), 40);
    }
  }, [activeFriendId]);

  if (!isOpen) return null;

  const currentFriend: FriendProfile | undefined = friends.find((f) => f.id === activeFriendId);
  const currentConvo: Conversation | undefined = activeFriendId ? conversations[activeFriendId] : undefined;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeFriendId) return;

    sendMessageToFriend(activeFriendId, { text: inputText.trim() });
    setInputText('');
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleSendVocabCard = (card: typeof QUICK_VOCAB_SUGGESTIONS[0]) => {
    if (!activeFriendId) return;
    sendMessageToFriend(activeFriendId, {
      text: `Gửi bạn từ vựng hôm nay: "${card.word}" ✨`,
      vocabCard: card,
      audioWord: card.word,
    });
    setShowVocabTray(false);
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleSendFriendSnap = (m: MomentPost) => {
    if (!activeFriendId) return;
    const firstWord = m.vocabTags?.[0];
    sendMessageToFriend(activeFriendId, {
      snapImage: m.imageUrl,
      sharedSnapAuthor: m.author.name,
      text: `Chia sẻ Snap của ${m.author.name}: "${m.caption || 'Học từ vựng cùng nhau'}" 📸`,
      vocabCard: firstWord
        ? { word: firstWord.word, meaningVi: firstWord.meaningVi, ipa: firstWord.ipa }
        : undefined,
      audioWord: firstWord?.word,
    });
    setShowSnapPicker(false);
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleSendSnapWord = (v: { word: string; meaningVi: string; ipa?: string; authorName: string }) => {
    if (!activeFriendId) return;
    sendMessageToFriend(activeFriendId, {
      text: `Học từ vựng "${v.word}" trong Snap của ${v.authorName} nè bạn ơi! ✨`,
      vocabCard: { word: v.word, meaningVi: v.meaningVi, ipa: v.ipa },
      audioWord: v.word,
    });
    setShowSnapPicker(false);
    setTimeout(() => scrollToBottom('smooth'), 50);
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
      setTimeout(() => scrollToBottom('smooth'), 50);
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

  const handleNotificationAction = (notif: AppNotification) => {
    if (notif.actionType === 'view_snap') {
      const f = friends.find((fr) => fr.name.toLowerCase().includes(notif.actor.name.toLowerCase()));
      if (f) setActiveFriendId(f.id);
      return;
    }
    executeNotificationAction(notif.id);
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
          <div className="flex flex-col h-full min-h-0 bg-[#0E131F]">
            {/* Header with Streak Counter */}
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

            {/* Messages Thread (Scrollable container without scroll lock) */}
            <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 overscroll-contain">
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
                            className="hover:scale-125 transition-transform text-xs cursor-pointer"
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
                        <div className="space-y-1">
                          {msg.sharedSnapAuthor && (
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-0.5 ${isMe ? 'text-slate-950/80' : 'text-amber-300'}`}>
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Snap từ {msg.sharedSnapAuthor}</span>
                            </div>
                          )}
                          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-black/60 border border-white/15 shadow-inner">
                            <img
                              src={msg.snapImage}
                              alt="Snap"
                              className="w-full h-full object-cover"
                            />
                          </div>
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
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
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
                              className="p-1.5 rounded-full hover:bg-black/20 transition-colors cursor-pointer"
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
                              className="p-1.5 rounded-full hover:bg-black/20 text-emerald-400 transition-colors cursor-pointer"
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
            </div>

            {/* Tray 1: Quick Vocab Stickers Tray */}
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
                    className="text-slate-400 hover:text-white cursor-pointer"
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
                      className="p-2.5 rounded-2xl bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/10 text-left transition-all cursor-pointer"
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

            {/* Tray 2: Share Friend Snaps & Words Tray */}
            {showSnapPicker && (
              <div className="p-3 bg-[#161D2B] border-t border-white/10 animate-in slide-in-from-bottom-2 duration-150 shrink-0 space-y-2.5 max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPickerTab('snaps')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        pickerTab === 'snaps'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      📸 Snaps bạn bè
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerTab('words')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        pickerTab === 'words'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      💡 Từ vựng trong Snaps
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSnapPicker(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {pickerTab === 'snaps' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {moments.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSendFriendSnap(m)}
                        className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer flex gap-2.5 items-center group"
                      >
                        <img
                          src={m.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-white truncate block group-hover:text-amber-300">
                            Snap của {m.author.name}
                          </span>
                          <span className="text-[10px] text-amber-300 block truncate font-mono">
                            {m.vocabTags.map((t) => t.word).join(', ')}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 group-hover:text-slate-200">
                            Chạm để gửi vào chat ➔
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {allSnapVocabWords.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendSnapWord(v)}
                        className="p-2.5 rounded-2xl bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/10 text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-amber-300 capitalize">
                            {v.word}
                          </span>
                          {v.ipa && <span className="text-[9px] text-slate-400 font-mono">{v.ipa}</span>}
                        </div>
                        <span className="text-[10px] text-slate-300 truncate block mt-0.5 font-medium">
                          {v.meaningVi}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          từ Snap của {v.authorName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Social Input Bar */}
            <form
              onSubmit={handleSendText}
              className="p-3 border-t border-white/10 bg-[#161D2B]/80 backdrop-blur-md flex items-center gap-2 shrink-0"
            >
              {/* Quick Snap Camera */}
              <button
                type="button"
                onClick={() => quickPhotoInputRef.current?.click()}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-amber-400 hover:scale-105 transition-all cursor-pointer"
                title="Gửi ảnh Snap tức thì"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Share Snap & Word Picker Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowSnapPicker(!showSnapPicker);
                  setShowVocabTray(false);
                }}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  showSnapPicker
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-amber-300'
                }`}
                title="Gửi Snap hoặc từ vựng của bạn bè"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Vocab Picker Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowVocabTray(!showVocabTray);
                  setShowSnapPicker(false);
                }}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  showVocabTray
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-amber-300'
                }`}
                title="Gửi gợi ý từ vựng"
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
                className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-slate-950 font-bold shadow-md shadow-amber-400/20 transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================
             VIEW 2: UNIFIED SOCIAL INBOX (MESSAGES + ACTIVITY)
          ======================================================== */
          <div className="flex flex-col h-full bg-[#0E131F]">
            {/* Native Sheet Grabber */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 shrink-0" />

            {/* Clean Header */}
            <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">Tin nhắn</h2>
                {Object.values(conversations).reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black">
                    {Object.values(conversations).reduce((acc, c) => acc + (c.unreadCount || 0), 0)} mới
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sleek Segmented Switcher */}
            <div className="mx-4 mb-2 p-1 rounded-2xl bg-white/[0.05] border border-white/5 flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMainTab('messages')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mainTab === 'messages'
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Trò chuyện</span>
              </button>

              <button
                type="button"
                onClick={() => setMainTab('activity')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mainTab === 'activity'
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Hoạt động</span>
                {unreadNotifsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0E131F]" />
                )}
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {mainTab === 'messages' ? (
                /* ========================================================
                   AUTHENTIC LOCKET-STYLE HERO CAROUSEL + DM LIST
                ======================================================== */
                <div className="flex flex-col h-full overflow-hidden">
                  {/* 1. HERO FRIEND STORIES CAPSULES (Locket-style) */}
                  <div className="pt-2 pb-3 px-3 shrink-0">
                    <div className="flex items-center justify-center gap-3 sm:gap-4.5 overflow-x-auto scrollbar-none py-1">
                      {friends.map((friend) => {
                        const isSelected = (featuredFriendId || (friends[0] && friends[0].id)) === friend.id;
                        const shortName = friend.name.split(' ').pop() || friend.name;
                        const convo = conversations[friend.id];
                        const streak = convo?.streakDays || friend.streak;

                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() => {
                              setFeaturedFriendId(friend.id);
                              setActiveFriendId(friend.id);
                            }}
                            className="flex flex-col items-center shrink-0 cursor-pointer group transition-all"
                          >
                            {/* Portrait Oval/Capsule Frame */}
                            <div
                              className={`relative transition-all duration-300 overflow-hidden ${
                                isSelected
                                  ? 'w-28 sm:w-32 h-40 sm:h-44 rounded-[44px] border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-xl shadow-amber-500/20 scale-105 z-10'
                                  : 'w-22 sm:w-26 h-32 sm:h-36 rounded-[38px] border-2 border-amber-400/70 hover:border-amber-400 opacity-90 hover:opacity-100 hover:scale-102'
                              }`}
                            >
                              <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Flame Streak Pill Badge */}
                              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-[10px] text-amber-300 font-black flex items-center gap-0.5 shadow-md">
                                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{streak}</span>
                              </div>
                            </div>

                            {/* Friend Short Name */}
                            <span
                              className={`text-xs mt-2 transition-colors ${
                                isSelected
                                  ? 'font-extrabold text-amber-400'
                                  : 'font-semibold text-slate-300 group-hover:text-white'
                              }`}
                            >
                              {shortName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. SEAMLESS CONVERSATIONS LIST */}
                  <div className="flex-1 overflow-y-auto space-y-1 pt-1 px-1 border-t border-white/5">
                    {friends.map((friend) => {
                      const convo = conversations[friend.id];
                      const lastMsg = convo?.messages?.[convo.messages.length - 1];
                      const hasUnread = (convo?.unreadCount || 0) > 0;
                      const streak = convo?.streakDays || friend.streak;

                      return (
                        <div
                          key={friend.id}
                          onClick={() => setActiveFriendId(friend.id)}
                          className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group select-none ${
                            hasUnread
                              ? 'bg-white/[0.07] hover:bg-white/[0.09]'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Round Avatar with Online Indicator */}
                            <div className="relative shrink-0">
                              <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-amber-400/60 transition-all"
                              />
                              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0E131F]" />
                            </div>

                            <div className="min-w-0">
                              {/* Friend Name + Flame Streak Number */}
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-sm tracking-tight transition-colors truncate ${
                                    hasUnread
                                      ? 'font-black text-white'
                                      : 'font-semibold text-slate-200 group-hover:text-amber-300'
                                  }`}
                                >
                                  {friend.name}
                                </span>
                                <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5 shrink-0">
                                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
                                  <span>{streak}</span>
                                </span>
                              </div>

                              {/* Message Subtext Preview */}
                              <p
                                className={`text-xs truncate max-w-[180px] sm:max-w-[260px] mt-0.5 ${
                                  hasUnread
                                    ? 'font-bold text-slate-100'
                                    : 'text-slate-400 group-hover:text-slate-300 font-medium'
                                }`}
                              >
                                {lastMsg?.audioWord ? (
                                  <span className="text-sky-300 font-semibold flex items-center gap-1">
                                    <Volume2 className="w-3.5 h-3.5" />
                                    Phát âm: {lastMsg.audioWord}
                                  </span>
                                ) : lastMsg?.snapImage ? (
                                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                                    <Camera className="w-3.5 h-3.5" />
                                    Snap ảnh mới
                                  </span>
                                ) : (
                                  lastMsg?.text || 'Nhắn tin để giữ lửa streak...'
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Right Actions: Time, Unread Dot, and Quick Camera Button */}
                          <div className="flex items-center gap-2.5 shrink-0 ml-2">
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`text-[11px] ${
                                  hasUnread ? 'text-amber-400 font-black' : 'text-slate-400 font-medium'
                                }`}
                              >
                                {lastMsg ? lastMsg.time : ''}
                              </span>
                              {hasUnread && (
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                              )}
                            </div>

                            {/* Direct camera snap shutter */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveFriendId(friend.id);
                                setTimeout(() => quickPhotoInputRef.current?.click(), 100);
                              }}
                              className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors"
                              title="Gửi Snap ảnh ngay"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* 2. ACTIVITY & NOTIFICATIONS LIST */
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-2xl transition-all space-y-2 select-none ${
                        notif.isRead
                          ? 'bg-white/[0.02] hover:bg-white/[0.05] opacity-80'
                          : 'bg-white/[0.06] hover:bg-white/[0.09] ring-1 ring-amber-400/20 shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={notif.actor.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/15"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white tracking-tight">
                                {notif.actor.name}
                              </span>
                              <span className="text-[10px] text-slate-500">• {notif.timeAgo}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                              {notif.text}
                            </p>
                          </div>
                        </div>

                        {notif.snapThumbnail && (
                          <img
                            src={notif.snapThumbnail}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10 shadow-xs"
                          />
                        )}
                      </div>

                      {/* Vocab chips */}
                      {notif.vocabWords && notif.vocabWords.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pl-10">
                          {notif.vocabWords.map((vw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-amber-300 font-mono"
                            >
                              <strong>{vw.word}</strong>: {vw.meaningVi}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action button */}
                      {notif.actionLabel && (
                        <div className="pt-1 pl-10 flex items-center justify-between">
                          <button
                            type="button"
                            disabled={notif.actionCompleted}
                            onClick={() => handleNotificationAction(notif)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              notif.actionCompleted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm shadow-amber-400/20 active:scale-95'
                            }`}
                          >
                            {notif.actionCompleted ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã thực hiện</span>
                              </>
                            ) : notif.actionType === 'reply_reaction' ? (
                              <>
                                <Heart className="w-3.5 h-3.5 fill-slate-950" />
                                <span>{notif.actionLabel}</span>
                              </>
                            ) : (
                              <span>{notif.actionLabel}</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
