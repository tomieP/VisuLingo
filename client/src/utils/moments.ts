import api from '@/services/api';
import { enrichVocabTag } from './dictionary';
import { TagThemeId, getActiveTagThemeId } from './tagThemes';
import { recordDailyStreak, getLocalDateString } from './storage';
import { getAuthoritativeNow } from './authoritativeTime';
import { addNotification } from './notifications';

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
  confidence?: number;
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
  userId?: string | null;
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
 * Kiểm tra xem bài Snap có thuộc về tài khoản người dùng hiện tại không
 * So khớp qua:
 * 1. Database user_id chuẩn xác từ Neon PostgreSQL
 * 2. Tên hiển thị (được chuẩn hóa khoảng trắng và chữ hoa thường)
 * 3. Họ tên, @username hoặc email tiền tố của người dùng
 * 4. Nhãn mặc định Bạn (Me) khi đăng local
 */
export function isAuthorCurrentUser(
  m: MomentPost,
  currentUser?: { id?: string; firstName?: string; lastName?: string; username?: string; email?: string } | null,
  displayName?: string
): boolean {
  if (!m) return false;

  // 1. So khớp theo ID cơ sở dữ liệu (tuyệt đối chính xác)
  if (currentUser?.id && m.userId && String(m.userId) === String(currentUser.id)) {
    return true;
  }

  const clean = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const authorClean = clean(m.author?.name);
  if (!authorClean) return false;

  // 2. Tên mặc định của chính người dùng máy này
  if (authorClean === 'bạn (me)' || authorClean === 'bạn' || authorClean === 'me') {
    return true;
  }

  // 3. Khớp tên hiển thị hiện tại
  if (displayName) {
    const dClean = clean(displayName);
    if (dClean === authorClean || authorClean.includes(dClean) || dClean.includes(authorClean)) {
      return true;
    }
  }

  // 4. Khớp thông tin tài khoản đang đăng nhập
  if (currentUser) {
    const fullName = clean(`${currentUser.firstName || ''} ${currentUser.lastName || ''}`);
    if (fullName && (fullName === authorClean || authorClean.includes(fullName) || fullName.includes(authorClean))) {
      return true;
    }
    const firstName = clean(currentUser.firstName);
    if (firstName && firstName.length >= 2 && authorClean.includes(firstName)) {
      return true;
    }
    const username = clean(currentUser.username).replace(/^@+/, '');
    if (username && username.length >= 3 && (authorClean.includes(username) || username.includes(authorClean))) {
      return true;
    }
    const emailPrefix = clean(currentUser.email?.split('@')[0]);
    if (emailPrefix && emailPrefix.length >= 3 && (authorClean.includes(emailPrefix) || emailPrefix.includes(authorClean))) {
      return true;
    }
  } else {
    // Chế độ khách (chưa đăng nhập): giữ lại bài tạo trên trình duyệt này
    if (m.id && m.id.startsWith('moment-')) {
      return true;
    }
  }

  return false;
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

  const now = getAuthoritativeNow();
  const diffMs = now - timestamp;

  // Lệch thời gian nhỏ, vừa tạo, hoặc timestamp tương lai do lệch nhẹ clock
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

  // Xóa trên Neon PostgreSQL Cloud trong nền
  if (!momentId.startsWith('moment-')) {
    api.delete(`/moments/${momentId}`).catch(() => {});
  }
}

const MOMENTS_KEY = 'visulingo_locket_moments';

const FAKE_MOMENT_IDS = new Set([
  'moment-1',
  'moment-2',
  'moment-3',
  '88c43880-822f-4bc9-b7b1-e6def109f71b',
  '1f0844a6-5a63-4f76-bebd-81a50bc147cd',
  '76d2d0a1-f6f9-4704-abab-60a67b3e4c0e',
  '0fd10246-1c95-42d3-ace8-9c43dbb22613',
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
  // Bất kỳ bài đăng nào có Cloud UUID (từ Neon PostgreSQL) thì 100% là bài người dùng thật!
  if (m.id && !m.id.startsWith('moment-') && m.id.length >= 20) {
    return false;
  }
  if (FAKE_MOMENT_IDS.has(m.id)) return true;
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

    // Nếu người dùng đã có bài đăng hôm nay, kích hoạt / duy trì ngọn lửa streak
    const today = getLocalDateString();
    const hasTodayMoment = sanitized.some((m) => {
      const d = m.createdAt ? getLocalDateString(new Date(m.createdAt)) : '';
      return d === today;
    });
    if (hasTodayMoment) {
      recordDailyStreak();
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
  const nowMs = getAuthoritativeNow();
  const nowIso = new Date(nowMs).toISOString();

  // Kích hoạt / Tăng chuỗi Streak khi đăng khoảnh khắc mới
  recordDailyStreak();

  const tagsWithTheme = (moment.vocabTags || []).map((t) => ({
    ...t,
    themeId: t.themeId || chosenThemeId,
  }));

  const localTempId = `moment-${nowMs}`;
  const newMoment: MomentPost = {
    ...moment,
    id: localTempId,
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

  // Đồng bộ ngay lập tức lên Neon Cloud PostgreSQL để người khác thấy bài đăng
  api
    .post<{ moment: MomentPost }>('/moments', {
      authorName: moment.author.name,
      authorAvatar: moment.author.avatar,
      authorBadge: moment.author.badge,
      caption: moment.caption,
      imageUrl: moment.imageUrl,
      tagThemeId: chosenThemeId,
      vocabTags: tagsWithTheme,
    })
    .then((res) => {
      if (res.data?.moment?.id) {
        const cloudId = res.data.moment.id;
        const currentList = getMoments();
        const updatedList = currentList.map((m) => (m.id === localTempId ? { ...m, id: cloudId } : m));
        localStorage.setItem(MOMENTS_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new Event('visulingo_moments_changed'));
      }
    })
    .catch((err) => {
      console.warn('Đang chờ kết nối Cloud để đồng bộ bài đăng:', err?.message || err);
    });

  return newMoment;
}

export function reactToMoment(momentId: string, reaction: 'fire' | 'heart' | 'sparkles'): void {
  const moments = getMoments();
  const target = moments.find((m) => m.id === momentId);
  if (target) {
    if (!target.reactions) {
      target.reactions = { fire: 0, heart: 0, sparkles: 0 };
    }
    target.reactions.fire = target.reactions.fire || 0;
    target.reactions.heart = target.reactions.heart || 0;
    target.reactions.sparkles = target.reactions.sparkles || 0;

    if (target.userReacted === reaction) {
      target.reactions[reaction] = Math.max(0, target.reactions[reaction] - 1);
      target.userReacted = null;
    } else {
      if (target.userReacted) {
        target.reactions[target.userReacted] = Math.max(0, target.reactions[target.userReacted] - 1);
      }
      target.reactions[reaction] += 1;
      target.userReacted = reaction;

      // Kích hoạt thông báo khi thả tim / lửa / lấp lánh
      const currentDisplayName = localStorage.getItem('visulingo_display_name') || 'Bạn';
      const reactionEmoji = reaction === 'heart' ? '❤️ tim' : reaction === 'fire' ? '🔥 lửa' : '✨';
      addNotification({
        type: 'reaction',
        actor: {
          name: currentDisplayName,
          avatar: getUserAvatar(),
          badge: 'Tương tác 🔥',
        },
        text: `đã thả ${reactionEmoji} vào bức ảnh của ${target.author.name}!`,
        snapThumbnail: target.imageUrl,
        actionLabel: 'Xem Snap',
        actionType: 'view_snap',
      });
    }
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
    window.dispatchEvent(new Event('visulingo_moments_changed'));

    // Đồng bộ phản ứng thả tim / lửa lên Neon Cloud
    if (!momentId.startsWith('moment-')) {
      const serverType = reaction === 'sparkles' ? 'fire' : reaction;
      api.post(`/moments/${momentId}/react`, { type: serverType }).catch(() => {});
    }
  }
}

let isSyncingMoments = false;

/**
 * Đồng bộ bài đăng hai chiều giữa Cloud Neon PostgreSQL và trình duyệt
 * Giúp người dùng trên các điện thoại / thiết bị khác nhau xem được bài đăng của nhau
 */
export async function syncCloudMoments(): Promise<MomentPost[]> {
  if (isSyncingMoments) return getMoments();
  isSyncingMoments = true;

  try {
    const res = await api.get<{ moments: MomentPost[] }>('/moments');
    const cloudMoments = res.data?.moments;

    if (Array.isArray(cloudMoments)) {
      const currentList = getMoments();

      const mergedMap = new Map<string, MomentPost>();

      // 1. Đưa các bài đăng thực tế từ Cloud vào làm chuẩn, bảo tồn tương tác local
      cloudMoments.forEach((cm) => {
        if (!isFakeMoment(cm)) {
          const localExisting = currentList.find((m) => m.id === cm.id);
          const localComments = localExisting?.comments || [];
          const cloudComments = cm.comments || [];

          // Gộp comments từ cloud và local không trùng lặp
          const commentMap = new Map<string, MomentComment>();
          cloudComments.forEach((c) => commentMap.set(c.id, c));
          localComments.forEach((c) => commentMap.set(c.id, c));
          const mergedComments = Array.from(commentMap.values());

          // Bảo toàn trạng thái thả tim / lửa của người dùng máy này
          const preservedUserReacted = localExisting?.userReacted || cm.userReacted || null;

          const merged: MomentPost = {
            ...cm,
            userId: cm.userId || (cm as any).user_id || localExisting?.userId || null,
            comments: mergedComments,
            userReacted: preservedUserReacted,
            reactions: {
              fire: Math.max(cm.reactions?.fire || 0, localExisting?.reactions?.fire || 0),
              heart: Math.max(cm.reactions?.heart || 0, localExisting?.reactions?.heart || 0),
              sparkles: Math.max(cm.reactions?.sparkles || 0, localExisting?.reactions?.sparkles || 0),
            },
          };
          mergedMap.set(cm.id, merged);
        }
      });

      // 2. Chỉ giữ lại các bài đăng local thật người dùng vừa chụp trên máy này (bắt đầu bằng 'moment-')
      currentList.forEach((lm) => {
        if (lm.id && lm.id.startsWith('moment-') && !isFakeMoment(lm)) {
          if (!mergedMap.has(lm.id)) {
            mergedMap.set(lm.id, lm);

            // Tự động đẩy lên Cloud Neon PostgreSQL
            api
              .post<{ moment: MomentPost }>('/moments', {
                authorName: lm.author.name,
                authorAvatar: lm.author.avatar,
                authorBadge: lm.author.badge,
                caption: lm.caption,
                imageUrl: lm.imageUrl,
                tagThemeId: lm.tagThemeId,
                vocabTags: lm.vocabTags,
              })
              .then((upRes) => {
                if (upRes.data?.moment?.id) {
                  const updated = getMoments().map((m) =>
                    m.id === lm.id ? { ...m, id: upRes.data.moment.id } : m
                  );
                  localStorage.setItem(MOMENTS_KEY, JSON.stringify(updated));
                  window.dispatchEvent(new Event('visulingo_moments_changed'));
                }
              })
              .catch(() => {});
          }
        }
      });

      const mergedList = Array.from(mergedMap.values());

      // Sắp xếp bài mới nhất lên đầu
      mergedList.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      if (JSON.stringify(mergedList) !== JSON.stringify(currentList)) {
        localStorage.setItem(MOMENTS_KEY, JSON.stringify(mergedList));
        window.dispatchEvent(new Event('visulingo_moments_changed'));
      }

      return mergedList;
    }
  } catch (err) {
    // Offline hoặc server chưa sẵn sàng: fallback mượt mà với local storage
  } finally {
    isSyncingMoments = false;
  }

  return getMoments();
}

// Tự động kích hoạt đồng bộ đám mây khi mở ứng dụng và định kỳ
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncCloudMoments();
  }, 1000);

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      syncCloudMoments();
    }
  }, 20000);

  window.addEventListener('focus', () => {
    syncCloudMoments();
  });
}

export function addCommentToMoment(momentId: string, text: string): MomentComment | null {
  const moments = getMoments();
  const target = moments.find((m) => m.id === momentId);
  if (!target) return null;

  if (!target.comments) target.comments = [];

  const currentDisplayName = localStorage.getItem('visulingo_display_name') || 'Bạn (Me)';
  const currentAvatar = getUserAvatar();

  const nowMs = getAuthoritativeNow();
  const nowIso = new Date(nowMs).toISOString();
  const newComment: MomentComment = {
    id: `cmt-${nowMs}`,
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

  // Kích hoạt thông báo khi có bình luận mới
  const truncatedText = text.trim().slice(0, 45) + (text.trim().length > 45 ? '...' : '');
  addNotification({
    type: 'comment',
    actor: {
      name: currentDisplayName,
      avatar: currentAvatar,
      badge: 'Bình luận 💬',
    },
    text: `đã bình luận: "${truncatedText}"`,
    snapThumbnail: target.imageUrl,
    actionLabel: 'Xem Snap',
    actionType: 'view_snap',
  });

  // Đồng bộ bình luận lên máy chủ Neon Cloud PostgreSQL
  if (!momentId.startsWith('moment-')) {
    api
      .post(`/moments/${momentId}/comments`, {
        authorName: currentDisplayName,
        authorAvatar: currentAvatar,
        text: text.trim(),
      })
      .catch(() => {});
  }

  return newComment;
}
