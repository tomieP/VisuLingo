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
      if (!item.comments) {
        item.comments = [];
        modified = true;
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

  const tagsWithTheme = (moment.vocabTags || []).map((t) => ({
    ...t,
    themeId: t.themeId || chosenThemeId,
  }));

  const newMoment: MomentPost = {
    ...moment,
    id: `moment-${Date.now()}`,
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

  const newComment: MomentComment = {
    id: `cmt-${Date.now()}`,
    author: {
      name: currentDisplayName,
      avatar: currentAvatar,
    },
    text: text.trim(),
    timeAgo: 'Vừa xong',
  };

  target.comments.push(newComment);
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
  window.dispatchEvent(new Event('visulingo_moments_changed'));
  return newComment;
}
