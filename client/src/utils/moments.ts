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

const INITIAL_MOMENTS: MomentPost[] = [];

export function deleteMoment(momentId: string): void {
  const moments = getMoments().filter((m) => m.id !== momentId);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
  window.dispatchEvent(new Event('visulingo_moments_changed'));
}

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
