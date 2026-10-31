export interface VocabCardAttachment {
  word: string;
  meaningVi: string;
  ipa?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or friendId
  text: string;
  time: string;
  vocabCard?: VocabCardAttachment;
}

export interface Conversation {
  friendId: string;
  friendName: string;
  friendAvatar: string;
  friendBadge?: string;
  messages: ChatMessage[];
  unreadCount: number;
}

const INITIAL_CONVERSATIONS: Record<string, Conversation> = {
  'friend-1': {
    friendId: 'friend-1',
    friendName: 'Minh Quân',
    friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    friendBadge: 'Streak 7🔥',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'friend-1',
        text: 'Hôm nay mình vừa săn được mấy từ vựng về góc học tập chuẩn IELTS xịn lắm! 🚀',
        time: '14:20',
      },
      {
        id: 'm2',
        senderId: 'me',
        text: 'Hay quá! Cho mình xin một từ làm mẫu với Quân ơi 💡',
        time: '14:22',
      },
      {
        id: 'm3',
        senderId: 'friend-1',
        text: 'Đây nè, từ này rất hay gặp trong đề thi:',
        time: '14:23',
        vocabCard: {
          word: 'bookshelf',
          meaningVi: 'giá sách, kệ sách',
          ipa: '/ˈbʊk.ʃelf/',
        },
      },
      {
        id: 'm4',
        senderId: 'friend-1',
        text: 'Bạn thử snap góc bàn của bạn xem AI nhận ra được bao nhiêu từ?',
        time: '14:25',
      },
    ],
  },
  'friend-2': {
    friendId: 'friend-2',
    friendName: 'Khánh Linh',
    friendAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    friendBadge: 'Top 1 tuần 🏆',
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        senderId: 'friend-2',
        text: 'Cuối tuần này rảnh không, cùng đi cafe chụp snap từ vựng nhé ☕🌿',
        time: '10:15',
      },
      {
        id: 'm6',
        senderId: 'me',
        text: 'Ok luôn Linh ơi, nhớ mang máy để săn thêm từ vựng nhé!',
        time: '10:18',
      },
    ],
  },
  'friend-3': {
    friendId: 'friend-3',
    friendName: 'Thành Nam',
    friendAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    friendBadge: 'Streak 4 🔥',
    unreadCount: 0,
    messages: [
      {
        id: 'm7',
        senderId: 'friend-3',
        text: 'Bánh croissant sáng nay mình làm ngon xỉu luôn 🥐',
        time: 'Hôm qua',
      },
    ],
  },
};

const CHAT_KEY = 'visulingo_chat_conversations';

export function getConversations(): Record<string, Conversation> {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONVERSATIONS;
  }
}

export function sendMessageToFriend(
  friendId: string,
  text: string,
  vocabCard?: VocabCardAttachment
): ChatMessage {
  const convos = getConversations();
  if (!convos[friendId]) {
    convos[friendId] = {
      friendId,
      friendName: 'Bạn bè',
      friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      unreadCount: 0,
      messages: [],
    };
  }

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    senderId: 'me',
    text: text.trim(),
    time: timeStr,
    vocabCard,
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

const FRIEND_AUTO_REPLIES = [
  'Đỉnh chóp bạn ơi! Từ này mình cũng vừa lưu vào Snapbook nè ✨',
  'Hay quá! Cùng giữ streak 7 ngày tới luôn nhé 🔥',
  'Nghe chuẩn luôn, phát âm tiếng Anh từ này cũng dễ nhớ nữa 🚀',
  'Góc nhìn xịn ghê, chiều nay rảnh mình lại snap tiếp nhé 📸',
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

export function getTotalUnreadChatCount(): number {
  const convos = getConversations();
  return Object.values(convos).reduce((acc, c) => acc + (c.unreadCount || 0), 0);
}
