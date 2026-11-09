export interface VocabCardAttachment {
  word: string;
  meaningVi: string;
  ipa?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or friendId
  text?: string;
  time: string;
  vocabCard?: VocabCardAttachment;
  audioWord?: string;
  snapImage?: string;
  sharedSnapAuthor?: string;
  reaction?: string;
}

export interface Conversation {
  friendId: string;
  friendName: string;
  friendAvatar: string;
  friendBadge?: string;
  streakDays: number;
  streakStatus: 'completed' | 'pending';
  messages: ChatMessage[];
  unreadCount: number;
}

const CHAT_KEY = 'visulingo_chat_conversations_v3';

const BANNED_CHAT_IDS = new Set([
  'friend-1',
  'friend-2',
  'friend-3',
  'friend-4',
  'sug-1',
  'sug-2',
  'sug-3',
]);

export function getConversations(): Record<string, Conversation> {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const clean: Record<string, Conversation> = {};
    let modified = false;

    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([k, v]) => {
        if (!BANNED_CHAT_IDS.has(k)) {
          clean[k] = v as Conversation;
        } else {
          modified = true;
        }
      });
    }

    if (modified) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(clean));
    }

    return clean;
  } catch {
    return {};
  }
}

export function sendMessageToFriend(
  friendId: string,
  payload: {
    text?: string;
    vocabCard?: VocabCardAttachment;
    snapImage?: string;
    audioWord?: string;
    sharedSnapAuthor?: string;
  }
): ChatMessage {
  const convos = getConversations();
  if (!convos[friendId]) {
    convos[friendId] = {
      friendId,
      friendName: 'Bạn bè',
      friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      streakDays: 1,
      streakStatus: 'completed',
      unreadCount: 0,
      messages: [],
    };
  }

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    senderId: 'me',
    text: payload.text,
    time: timeStr,
    vocabCard: payload.vocabCard,
    snapImage: payload.snapImage,
    audioWord: payload.audioWord,
    sharedSnapAuthor: payload.sharedSnapAuthor,
  };

  convos[friendId].messages.push(newMsg);
  localStorage.setItem(CHAT_KEY, JSON.stringify(convos));
  window.dispatchEvent(new Event('visulingo_chat_changed'));

  return newMsg;
}

export function reactToMessage(friendId: string, messageId: string, reactionEmoji: string): void {
  const convos = getConversations();
  const convo = convos[friendId];
  if (!convo) return;

  const msg = convo.messages.find((m) => m.id === messageId);
  if (msg) {
    msg.reaction = msg.reaction === reactionEmoji ? undefined : reactionEmoji;
    localStorage.setItem(CHAT_KEY, JSON.stringify(convos));
    window.dispatchEvent(new Event('visulingo_chat_changed'));
  }
}

export function markConversationAsRead(friendId: string): void {
  const convos = getConversations();
  if (convos[friendId]) {
    convos[friendId].unreadCount = 0;
    localStorage.setItem(CHAT_KEY, JSON.stringify(convos));
    window.dispatchEvent(new Event('visulingo_chat_changed'));
  }
}

export function shareSnapToFriendChat(
  friendId: string,
  moment: {
    author: { name: string };
    imageUrl: string;
    caption?: string;
    vocabTags: Array<{ word: string; meaningVi: string; ipa?: string }>;
  },
  chosenWord?: { word: string; meaningVi: string; ipa?: string }
): ChatMessage {
  const selectedWord = chosenWord || moment.vocabTags?.[0];
  return sendMessageToFriend(friendId, {
    snapImage: moment.imageUrl,
    sharedSnapAuthor: moment.author.name,
    text: chosenWord
      ? `Học từ "${chosenWord.word}" trong Snap của ${moment.author.name} nè bạn ơi! ✨`
      : `Xem Snap của ${moment.author.name} nè: "${moment.caption || 'Khoảnh khắc học từ vựng'}" 📸`,
    vocabCard: selectedWord
      ? {
          word: selectedWord.word,
          meaningVi: selectedWord.meaningVi,
          ipa: selectedWord.ipa,
        }
      : undefined,
    audioWord: selectedWord?.word,
  });
}

export function getTotalUnreadChatCount(): number {
  const convos = getConversations();
  return Object.values(convos).reduce((acc, c) => acc + (c.unreadCount || 0), 0);
}
