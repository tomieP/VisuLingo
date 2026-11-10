import { query, queryOne } from '../config/database';
import logger from '../utils/logger';

export interface MomentRecord {
  id: string;
  userId?: string | null;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  caption: string;
  imageUrl: string;
  tagThemeId: string;
  vocabTags: any[];
  reactions: {
    fire: number;
    heart: number;
  };
  comments?: any[];
  createdAt: string;
  timeAgo?: string;
}

function computeTimeAgo(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch {
    return 'Gần đây';
  }
}

export async function listMoments(limit = 60): Promise<MomentRecord[]> {
  try {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    let rows: any[] = [];
    try {
      rows = await query<any>(
        `SELECT id, user_id, author_name, author_avatar, author_badge, caption,
                image_url, tag_theme_id, vocab_tags, reactions, comments, created_at
         FROM moments
         ORDER BY created_at DESC
         LIMIT $1`,
        [safeLimit]
      );
    } catch (err: any) {
      if (err?.code === '42703') {
        // Nếu database chưa có cột comments, tự động tạo và query lại
        try {
          await query(`ALTER TABLE moments ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb`);
          rows = await query<any>(
            `SELECT id, user_id, author_name, author_avatar, author_badge, caption,
                    image_url, tag_theme_id, vocab_tags, reactions, comments, created_at
             FROM moments
             ORDER BY created_at DESC
             LIMIT $1`,
            [safeLimit]
          );
        } catch {
          rows = await query<any>(
            `SELECT id, user_id, author_name, author_avatar, author_badge, caption,
                    image_url, tag_theme_id, vocab_tags, reactions, created_at
             FROM moments
             ORDER BY created_at DESC
             LIMIT $1`,
            [safeLimit]
          );
        }
      } else {
        throw err;
      }
    }

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      author: {
        name: r.author_name || 'Snapper',
        avatar: r.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        badge: r.author_badge || 'Hôm nay 🔥',
      },
      caption: r.caption || '',
      imageUrl: r.image_url,
      tagThemeId: r.tag_theme_id || 'classic',
      vocabTags: Array.isArray(r.vocab_tags) ? r.vocab_tags : [],
      reactions: r.reactions || { fire: 0, heart: 0 },
      comments: Array.isArray(r.comments) ? r.comments : [],
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      timeAgo: computeTimeAgo(r.created_at),
    }));
  } catch (err: any) {
    logger.warn('[MomentService] listMoments error (database might be initializing):', err?.message || err);
    return [];
  }
}

export async function createMoment(data: {
  userId?: string | null;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: string;
  caption?: string;
  imageUrl: string;
  tagThemeId?: string;
  vocabTags?: any[];
}): Promise<MomentRecord> {
  const authorName = (data.authorName || 'Snapper').trim();
  const authorAvatar = data.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  const authorBadge = data.authorBadge || 'Hôm nay 🔥';
  const caption = (data.caption || '').trim();
  const tagThemeId = data.tagThemeId || 'classic';
  const vocabTagsJson = JSON.stringify(data.vocabTags || []);
  const initialReactions = JSON.stringify({ fire: 0, heart: 0 });

  const row = await queryOne<any>(
    `INSERT INTO moments (user_id, author_name, author_avatar, author_badge, caption, image_url, tag_theme_id, vocab_tags, reactions)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
     RETURNING id, user_id, author_name, author_avatar, author_badge, caption, image_url, tag_theme_id, vocab_tags, reactions, created_at`,
    [
      data.userId || null,
      authorName,
      authorAvatar,
      authorBadge,
      caption,
      data.imageUrl,
      tagThemeId,
      vocabTagsJson,
      initialReactions,
    ]
  );

  return {
    id: row.id,
    userId: row.user_id,
    author: {
      name: row.author_name,
      avatar: row.author_avatar,
      badge: row.author_badge,
    },
    caption: row.caption || '',
    imageUrl: row.image_url,
    tagThemeId: row.tag_theme_id || 'classic',
    vocabTags: Array.isArray(row.vocab_tags) ? row.vocab_tags : [],
    reactions: row.reactions || { fire: 0, heart: 0 },
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    timeAgo: 'Vừa xong',
  };
}

export async function reactToMoment(momentId: string, type: 'fire' | 'heart'): Promise<{ fire: number; heart: number }> {
  const fieldKey = type === 'heart' ? 'heart' : 'fire';
  const current = await queryOne<any>(`SELECT reactions FROM moments WHERE id = $1`, [momentId]);
  const currentReactions = current?.reactions || { fire: 0, heart: 0 };
  const currentCount = parseInt(currentReactions[fieldKey] || '0', 10);
  const updatedCount = isNaN(currentCount) ? 1 : currentCount + 1;
  const newReactions = { ...currentReactions, [fieldKey]: updatedCount };

  await query(`UPDATE moments SET reactions = $1::jsonb WHERE id = $2`, [JSON.stringify(newReactions), momentId]);
  return newReactions;
}

export async function addComment(
  momentId: string,
  comment: { authorName: string; authorAvatar?: string; text: string }
): Promise<any> {
  const newCmt = {
    id: `cmt-${Date.now()}`,
    author: {
      name: comment.authorName || 'Snapper',
      avatar:
        comment.authorAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    text: comment.text,
    createdAt: new Date().toISOString(),
    timeAgo: 'Vừa xong',
  };

  try {
    await query(
      `UPDATE moments
       SET comments = COALESCE(comments, '[]'::jsonb) || $1::jsonb
       WHERE id = $2`,
      [JSON.stringify([newCmt]), momentId]
    );
  } catch (err: any) {
    if (err?.code === '42703') {
      try {
        await query(`ALTER TABLE moments ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb`);
        await query(
          `UPDATE moments
           SET comments = COALESCE(comments, '[]'::jsonb) || $1::jsonb
           WHERE id = $2`,
          [JSON.stringify([newCmt]), momentId]
        );
      } catch {}
    }
  }

  return newCmt;
}

export async function deleteMoment(momentId: string, userId?: string, isAdmin?: boolean): Promise<boolean> {
  if (isAdmin) {
    await query(`DELETE FROM moments WHERE id = $1`, [momentId]);
    return true;
  }

  if (userId) {
    const res = await query(`DELETE FROM moments WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`, [momentId, userId]);
    return true;
  }

  await query(`DELETE FROM moments WHERE id = $1`, [momentId]);
  return true;
}
