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

const INITIAL_CONVERSATIONS: Record<string, Conversation> = {
  'friend-1': {
    friendId: 'friend-1',
    friendName: 'Minh Quân',
    friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    friendBadge: 'Streak 7 🔥',
    streakDays: 7,
    streakStatus: 'completed',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'friend-1',
        text: 'Hôm nay ông cày được mấy từ rồi? Tui vừa snap được góc bàn học chuẩn IELTS đỉnh lắm 🚀',
        time: '14:20',
      },
      {
        id: 'm2',
        senderId: 'friend-1',
        snapImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=80',
        text: 'Snap bàn học sáng nay nè, AI nhận ra luôn cả laptop với notebook',
        time: '14:21',
      },
      {
        id: 'm3',
        senderId: 'me',
        text: 'Nhìn nghệ ghê! Phát âm từ này nghe thử chuẩn chưa ông ơi',
        time: '14:23',
        reaction: '🔥',
      },
      {
        id: 'm4',
        senderId: 'friend-1',
        audioWord: 'entrepreneur',
        text: 'Nghe thử phát âm chuẩn từ này xem:',
        time: '14:25',
        vocabCard: {
          word: 'entrepreneur',
          meaningVi: 'doanh nhân, người khởi nghiệp',
          ipa: '/ˌɒn.trə.prəˈnɜːr/',
        },
      },
      {
        id: 'm5',
        senderId: 'friend-1',
        text: 'Gửi lại tui 1 snap góc bàn của ông để giữ lửa streak ngày thứ 7 nhé! 🔥',
        time: '14:26',
      },
    ],
  },
  'friend-2': {
    friendId: 'friend-2',
    friendName: 'Khánh Linh',
    friendAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    friendBadge: 'Streak 12 🔥',
    streakDays: 12,
    streakStatus: 'pending',
    unreadCount: 0,
    messages: [
      {
        id: 'm6',
        senderId: 'friend-2',
        snapImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80',
        text: 'Quán cafe mới mở decor cây xanh chill cực kì ☕🌿',
        time: '10:15',
      },
      {
        id: 'm7',
        senderId: 'me',
        text: 'Quán này ở đâu thế Linh? Cuối tuần đi chung săn từ vựng nha!',
        time: '10:18',
        reaction: '❤️',
      },
      {
        id: 'm8',
        senderId: 'friend-2',
        audioWord: 'atmosphere',
        text: 'Okie chốt deal! Học thêm từ này để miêu tả không gian nè:',
        time: '10:20',
        vocabCard: {
          word: 'atmosphere',
          meaningVi: 'bầu không khí, cảm giác không gian',
          ipa: '/ˈæt.məs.fɪər/',
        },
      },
    ],
  },
  'friend-3': {
    friendId: 'friend-3',
    friendName: 'Thành Nam',
    friendAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    friendBadge: 'Streak 4 🔥',
    streakDays: 4,
    streakStatus: 'completed',
    unreadCount: 0,
    messages: [
      {
        id: 'm9',
        senderId: 'friend-3',
        snapImage: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=80',
        text: 'Bánh croissant mới ra lò giòn rụm luôn 🥐',
        time: 'Hôm qua',
      },
      {
        id: 'm10',
        senderId: 'me',
        text: 'Trông ngon xỉu, share bí quyết làm bánh đê ông ơi 🤤',
        time: 'Hôm qua',
      },
    ],
  },
  'friend-4': {
    friendId: 'friend-4',
    friendName: 'Phương Thảo',
    friendAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    friendBadge: 'Streak 9 🔥',
    streakDays: 9,
    streakStatus: 'completed',
    unreadCount: 0,
    messages: [
      {
        id: 'm11',
        senderId: 'friend-4',
        text: 'Thảo vừa quét được mấy từ vựng về outfit siêu xinh nè ✨',
        time: 'T3',
      },
      {
        id: 'm12',
        senderId: 'me',
        text: 'Đỉnh quá! Giữ streak 9 ngày liên tục luôn nha 👏',
        time: 'T3',
        reaction: '👏',
      },
    ],
  },
};

const CHAT_KEY = 'visulingo_chat_conversations_v3';

export function getConversations(): Record<string, Conversation> {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!parsed['friend-4']) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    return parsed;
  } catch {
    return INITIAL_CONVERSATIONS;
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
      streakDays: 5,
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

  // Trigger simulated smart friend auto-reply after 1.2s
  setTimeout(() => {
    simulateFriendReply(friendId);
  }, 1200);

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

const FRIEND_AUTO_REPLIES = [
  'Đỉnh chóp luôn bạn ơi! Tui vừa bấm loa nghe phát âm rồi, từ này hay quá ✨',
  'Tuyệt vời! Hôm nay tui với ông giữ được ngọn lửa Streak cháy rực rồi đó 🔥',
  'Góc snap này đẹp ghê, để tui lưu từ vựng này vào Snapbook ôn lại ngay 📚',
  'Nghe chuẩn bản xứ luôn! Chiều nay rảnh lại thi đua tiếp nhé 🚀',
];

function simulateFriendReply(friendId: string) {
  const convos = getConversations();
  if (!convos[friendId]) return;

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  const randomText =
    FRIEND_AUTO_REPLIES[Math.floor(Math.random() * FRIEND_AUTO_REPLIES.length)];

  const replyMsg: ChatMessage = {
    id: `reply-${Date.now()}`,
    senderId: friendId,
    text: randomText,
    time: timeStr,
  };

  convos[friendId].messages.push(replyMsg);
  localStorage.setItem(CHAT_KEY, JSON.stringify(convos));
  window.dispatchEvent(new Event('visulingo_chat_changed'));
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
