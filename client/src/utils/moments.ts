import { enrichVocabTag } from './dictionary';
import { TagThemeId, getActiveTagThemeId } from './tagThemes';

export function getUserAvatar(): string {
  return (
    localStorage.getItem('visulingo_avatar') ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  );
}

export interface VocabTag {
  id: string;
  word: string;
  meaningVi: string;
  ipa?: string;
  example?: string;
  x: number; // percentage (0..100)
  y: number; // percentage (0..100)
  themeId?: TagThemeId;
}

export interface MomentComment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  text: string;
  createdAt?: string;
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
  createdAt?: string;
  timeAgo: string;
  tagThemeId?: TagThemeId;
  vocabTags: VocabTag[];
  reactions: {
    fire: number;
    heart: number;
    sparkles: number;
  };
  userReacted?: 'fire' | 'heart' | 'sparkles' | null;
  comments?: MomentComment[];
}

/**
 * Tính toán thời gian tương đối theo chuẩn tiếng Việt từ timestamp/ISO string
 */
export function formatTimeAgo(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'Vừa xong';

  let timestamp = 0;
  if (typeof dateInput === 'number') {
    timestamp = dateInput;
  } else if (typeof dateInput === 'string') {
    if (dateInput.startsWith('moment-') || dateInput.startsWith('cmt-') || dateInput.startsWith('photo-')) {
      const parsedNum = parseInt(dateInput.replace(/^[a-z]+-/, ''), 10);
      if (!isNaN(parsedNum) && parsedNum > 1000000000000) {
        timestamp = parsedNum;
      }
    }
    if (!timestamp) {
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.getTime();
      }
    }
  } else if (dateInput instanceof Date) {
    timestamp = dateInput.getTime();
  }

  if (!timestamp || isNaN(timestamp)) return 'Vừa xong';

  const now = Date.now();
  const diffMs = now - timestamp;

  // Lệch thời gian nhỏ hoặc vài giây trước
  if (diffMs < 45 * 1000) {
    return 'Vừa xong';
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Hôm qua';
  }
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} tuần trước`;
  }

  const dateObj = new Date(timestamp);
  return `${dateObj.getDate()} thg ${dateObj.getMonth() + 1}`;
}

export function deleteMoment(momentId: string): void {
  const moments = getMoments().filter((m) => m.id !== momentId);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
  window.dispatchEvent(new Event('visulingo_moments_changed'));
}

const MOMENTS_KEY = 'visulingo_locket_moments';

const FAKE_MOMENT_IDS = new Set(['moment-1', 'moment-2', 'moment-3']);
const FAKE_AUTHOR_NAMES = new Set([
  'Minh Quân',
  'Khánh Linh',
  'Thành Nam',
  'Hương Ly',
  'Tuấn Anh',
  'Mai Chi',
]);
const FAKE_IMAGE_SUBSTRINGS = [
  '1518455027359-f3f8164ba6bd', // desk
  '1555041469-a586c61ea9bc', // sofa
  '1533089860892-a7c6f0a88666', // croissant
  '1497215728101-856f4ea42174', // office
  '1555396273-367ea4eb4db5', // noodles
  '1416879595882-3373a0480b5b', // garden
];

export function isFakeMoment(m: MomentPost): boolean {
  if (!m || !m.imageUrl) return true;
  if (FAKE_MOMENT_IDS.has(m.id)) return true;
  if (m.author && FAKE_AUTHOR_NAMES.has(m.author.name)) return true;
  if (FAKE_IMAGE_SUBSTRINGS.some((sub) => m.imageUrl.includes(sub))) return true;
  return false;
}

export function getMoments(): MomentPost[] {
  try {
    const raw = localStorage.getItem(MOMENTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: MomentPost[] = JSON.parse(raw);
    let modified = false;

    // Purge all fake bot accounts, sample Unsplash mock photos, and invalid images
    const filtered = parsed.filter((m) => {
      if (isFakeMoment(m)) return false;
      return true;
    });

    if (filtered.length !== parsed.length) {
      modified = true;
    }

    const sanitized = filtered.map((m) => {
      let item = { ...m };

      // Khôi phục hoặc tạo timestamp chính xác nếu chưa có
      if (!item.createdAt) {
        if (item.id && item.id.startsWith('moment-')) {
          const num = parseInt(item.id.replace('moment-', ''), 10);
          if (!isNaN(num) && num > 1000000000000) {
            item.createdAt = new Date(num).toISOString();
          } else {
            item.createdAt = new Date().toISOString();
          }
        } else {
          item.createdAt = new Date().toISOString();
        }
        modified = true;
      }

      // Cập nhật động timeAgo chính xác theo thời gian thực
      const calculatedTime = formatTimeAgo(item.createdAt || item.id);
      if (item.timeAgo !== calculatedTime) {
        item.timeAgo = calculatedTime;
        modified = true;
      }

      if (!item.comments) {
        item.comments = [];
        modified = true;
      } else {
        item.comments = item.comments.map((c) => {
          let cmt = { ...c };
          if (!cmt.createdAt && cmt.id?.startsWith('cmt-')) {
            const num = parseInt(cmt.id.replace('cmt-', ''), 10);
            if (!isNaN(num) && num > 1000000000000) {
              cmt.createdAt = new Date(num).toISOString();
              modified = true;
            }
          }
          const cmtTime = formatTimeAgo(cmt.createdAt || cmt.id);
          if (cmt.timeAgo !== cmtTime) {
            cmt.timeAgo = cmtTime;
            modified = true;
          }
          return cmt;
        });
      }

      const currentMyAvatar = getUserAvatar();
      const currentDisplayName = localStorage.getItem('visulingo_display_name') || 'Bạn (Me)';
      const isMine =
        item.author.name === 'Bạn (Me)' ||
        item.author.name === currentDisplayName ||
        item.author.name.toLowerCase().includes('bạn');

      if (isMine && item.author.avatar !== currentMyAvatar) {
        item.author.avatar = currentMyAvatar;
        modified = true;
      }

      if (!item.tagThemeId) {
        item.tagThemeId = (item.vocabTags?.[0]?.themeId as TagThemeId) || 'classic';
        modified = true;
      }

      if (item.vocabTags) {
        item.vocabTags = item.vocabTags.map((tag) => {
          const enriched = enrichVocabTag(tag);
          if (!enriched.themeId) {
            enriched.themeId = item.tagThemeId || 'classic';
            modified = true;
          }
          return enriched;
        });
      }
      return item;
    });

    if (modified) {
      localStorage.setItem(MOMENTS_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return [];
  }
}

export function addMoment(moment: Omit<MomentPost, 'id' | 'timeAgo' | 'reactions'>): MomentPost {
  const moments = getMoments();
  const currentActive = getActiveTagThemeId();
  const chosenThemeId = moment.tagThemeId || currentActive;
  const nowIso = new Date().toISOString();

  const tagsWithTheme = (moment.vocabTags || []).map((t) => ({
    ...t,
    themeId: t.themeId || chosenThemeId,
  }));

  const newMoment: MomentPost = {
    ...moment,
    id: `moment-${Date.now()}`,
    createdAt: nowIso,
    timeAgo: 'Vừa xong',
    tagThemeId: chosenThemeId,
    vocabTags: tagsWithTheme,
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

  const currentDisplayName = localStorage.getItem('visulingo_display_name') || 'Bạn (Me)';
  const currentAvatar = getUserAvatar();

  const nowIso = new Date().toISOString();
  const newComment: MomentComment = {
    id: `cmt-${Date.now()}`,
    author: {
      name: currentDisplayName,
      avatar: currentAvatar,
    },
    text: text.trim(),
    createdAt: nowIso,
    timeAgo: 'Vừa xong',
  };

  target.comments.push(newComment);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
  window.dispatchEvent(new Event('visulingo_moments_changed'));
  return newComment;
}
