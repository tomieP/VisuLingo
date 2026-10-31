export interface VocabTag {
  id: string;
  word: string;
  meaningVi: string;
  ipa?: string;
  example?: string;
  x: number; // percentage (0..100)
  y: number; // percentage (0..100)
}

export interface MomentComment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  timeAgo: string;
}

export interface MomentPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  caption: string;
  imageUrl: string;
  timeAgo: string;
  vocabTags: VocabTag[];
  reactions: {
    fire: number;
    heart: number;
    sparkles: number;
  };
  userReacted?: 'fire' | 'heart' | 'sparkles' | null;
  comments?: MomentComment[];
}

const INITIAL_MOMENTS: MomentPost[] = [
  {
    id: 'moment-1',
    author: {
      name: 'Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Streak 7🔥',
    },
    caption: 'Góc học tập sáng nay, chuẩn bị cày IELTS 🚀',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80',
    timeAgo: '12 phút trước',
    reactions: { fire: 18, heart: 32, sparkles: 14 },
    vocabTags: [
      { id: 't1', word: 'laptop', meaningVi: 'máy tính xách tay', ipa: '/ˈlæp.tɒp/', x: 30, y: 35 },
      { id: 't2', word: 'coffee cup', meaningVi: 'ly cà phê', ipa: '/ˈkɒf.i kʌp/', x: 67, y: 46 },
      { id: 't3', word: 'notebook', meaningVi: 'quyển sổ tay', ipa: '/ˈnəʊt.bʊk/', x: 38, y: 75 },
    ],
    comments: [
      {
        id: 'c1',
        author: {
          name: 'Khánh Linh',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        },
        text: 'Góc học tập xịn quá bạn ơi! Chúc bạn sớm đạt 7.5 nhé 🚀',
        timeAgo: '8 phút trước',
      },
      {
        id: 'c2',
        author: {
          name: 'Thành Nam',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        },
        text: 'Chiếc ly cà phê nhìn nghệ ghê ☕',
        timeAgo: '4 phút trước',
      },
    ],
  },
  {
    id: 'moment-2',
    author: {
      name: 'Khánh Linh',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      badge: 'Top 1 tuần 🏆',
    },
    caption: 'Chill một chút sau giờ làm việc 🌿',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    timeAgo: '45 phút trước',
    reactions: { fire: 24, heart: 49, sparkles: 21 },
    vocabTags: [
      { id: 't4', word: 'sofa', meaningVi: 'ghế xô-pha', ipa: '/ˈsəʊ.fə/', x: 45, y: 55 },
      { id: 't5', word: 'houseplant', meaningVi: 'cây cảnh trong nhà', ipa: '/ˈhaʊs.plɑːnt/', x: 80, y: 35 },
      { id: 't6', word: 'cushion', meaningVi: 'gối tựa lưng', ipa: '/ˈkʊʃ.ən/', x: 32, y: 42 },
    ],
    comments: [
      {
        id: 'c3',
        author: {
          name: 'Minh Quân',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        },
        text: 'Không gian yên bình ghê, học từ vựng lúc này thì siêu vào ✨',
        timeAgo: '20 phút trước',
      },
    ],
  },
  {
    id: 'moment-3',
    author: {
      name: 'Thành Nam',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      badge: 'Level 4 🌟',
    },
    caption: 'Bữa sáng nạp năng lượng! Cả nhà thấy món này gọi là gì? 🍞',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80',
    timeAgo: '2 giờ trước',
    reactions: { fire: 15, heart: 27, sparkles: 8 },
    vocabTags: [
      { id: 't7', word: 'croissant', meaningVi: 'bánh sừng bò', ipa: '/ˈkrwɑː.sɒ̃/', x: 50, y: 45 },
      { id: 't8', word: 'coffee', meaningVi: 'cà phê', ipa: '/ˈkɒf.i/', x: 75, y: 32 },
      { id: 't9', word: 'fork', meaningVi: 'chiếc nĩa / dĩa', ipa: '/fɔːk/', x: 22, y: 65 },
    ],
    comments: [],
  },
];

const MOMENTS_KEY = 'visulingo_locket_moments';
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80';

export function getMoments(): MomentPost[] {
  try {
    const raw = localStorage.getItem(MOMENTS_KEY);
    if (!raw) {
      localStorage.setItem(MOMENTS_KEY, JSON.stringify(INITIAL_MOMENTS));
      return INITIAL_MOMENTS;
    }
    const parsed: MomentPost[] = JSON.parse(raw);
    let modified = false;

    // Sanitize any expired blob URLs from previous tests and ensure comments array exists
    const sanitized = parsed.map((m) => {
      let item = { ...m };
      if (!item.comments) {
        item.comments = [];
        modified = true;
      }
      if (!item.imageUrl || item.imageUrl.startsWith('blob:')) {
        item.imageUrl = FALLBACK_PHOTO;
        modified = true;
      }
      return item;
    });

    if (modified) {
      localStorage.setItem(MOMENTS_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return INITIAL_MOMENTS;
  }
}

export function addMoment(moment: Omit<MomentPost, 'id' | 'timeAgo' | 'reactions'>): MomentPost {
  const moments = getMoments();
  const newMoment: MomentPost = {
    ...moment,
    id: `moment-${Date.now()}`,
    timeAgo: 'Vừa xong',
    reactions: { fire: 1, heart: 1, sparkles: 0 },
    comments: [],
  };
  moments.unshift(newMoment);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
  window.dispatchEvent(new Event('visulingo_moments_changed'));
  return newMoment;
}

export function reactToMoment(momentId: string, reaction: 'fire' | 'heart' | 'sparkles'): void {
  const moments = getMoments();
  const target = moments.find((m) => m.id === momentId);
  if (target) {
    if (target.userReacted === reaction) {
      target.reactions[reaction] = Math.max(0, target.reactions[reaction] - 1);
      target.userReacted = null;
    } else {
      if (target.userReacted) {
        target.reactions[target.userReacted] = Math.max(0, target.reactions[target.userReacted] - 1);
      }
      target.reactions[reaction] += 1;
      target.userReacted = reaction;
    }
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
    window.dispatchEvent(new Event('visulingo_moments_changed'));
  }
}

export function addCommentToMoment(momentId: string, text: string): MomentComment | null {
  const moments = getMoments();
  const target = moments.find((m) => m.id === momentId);
  if (!target) return null;

  if (!target.comments) target.comments = [];

  const newComment: MomentComment = {
    id: `cmt-${Date.now()}`,
    author: {
      name: 'Bạn (Me)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    text: text.trim(),
    timeAgo: 'Vừa xong',
  };

  target.comments.push(newComment);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
  window.dispatchEvent(new Event('visulingo_moments_changed'));
  return newComment;
}
