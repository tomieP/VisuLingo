import { Request, Response, NextFunction } from 'express';
import * as savedWordService from '../services/savedWordService';

export async function listSavedWords(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const q = req.query.q as string | undefined;

    const result = await savedWordService.listSavedWords(userId, page, limit, q);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function saveWord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { vocabularyId, word, imageId } = req.body as Record<string, unknown>;

    if (!vocabularyId && !word) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Yêu cầu vocabularyId hoặc word', retryable: false });
      return;
    }

    const result = await savedWordService.saveWord(
      userId,
      typeof vocabularyId === 'string' ? vocabularyId : undefined,
      typeof word === 'string' ? word : undefined,
      typeof imageId === 'string' ? imageId : undefined,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteSavedWord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    await savedWordService.deleteSavedWord(userId, id);
    res.status(200).json({ message: 'Đã xóa từ khỏi danh sách' });
  } catch (error) {
    next(error);
  }
}
