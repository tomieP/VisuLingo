import { Request, Response, NextFunction } from 'express';
import * as momentService from '../services/momentService';

export async function getMoments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const moments = await momentService.listMoments(limit);
    res.status(200).json({ moments });
  } catch (error) {
    next(error);
  }
}

export async function createMoment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId || null;
    const { authorName, authorAvatar, authorBadge, caption, imageUrl, tagThemeId, vocabTags } = req.body;

    if (!imageUrl) {
      res.status(400).json({ message: 'Thiếu hình ảnh bài đăng (imageUrl)' });
      return;
    }

    const created = await momentService.createMoment({
      userId,
      authorName,
      authorAvatar,
      authorBadge,
      caption,
      imageUrl,
      tagThemeId,
      vocabTags,
    });

    res.status(201).json({ moment: created });
  } catch (error) {
    next(error);
  }
}

export async function reactToMoment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { type } = req.body; // 'fire' | 'heart'
    const reactions = await momentService.reactToMoment(id, type === 'heart' ? 'heart' : 'fire');
    res.status(200).json({ reactions });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { authorName, authorAvatar, text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Nội dung bình luận không được rỗng' });
      return;
    }
    const comment = await momentService.addComment(id, { authorName, authorAvatar, text });
    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}

export async function deleteMoment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user?.userId || null;
    const isAdmin = (req as any).user?.role === 'admin';

    await momentService.deleteMoment(id, userId, isAdmin);
    res.status(200).json({ success: true, message: 'Đã xóa bài viết' });
  } catch (error) {
    next(error);
  }
}
