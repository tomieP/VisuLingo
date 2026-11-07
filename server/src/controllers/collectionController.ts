import { Request, Response, NextFunction } from 'express';
import * as collectionService from '../services/collectionService';

export async function listCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const collections = await collectionService.listCollections(userId);
    res.status(200).json({ data: collections });
  } catch (error) {
    next(error);
  }
}

export async function createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, theme, description, isPublic, coverImageId } = req.body as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Tên bộ sưu tập không được để trống', retryable: false });
      return;
    }

    const collection = await collectionService.createCollection(userId, {
      name,
      theme: typeof theme === 'string' ? theme : undefined,
      description: typeof description === 'string' ? description : undefined,
      isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
      coverImageId: typeof coverImageId === 'string' ? coverImageId : undefined,
    });

    res.status(201).json({ message: 'Tạo bộ sưu tập thành công', collection });
  } catch (error) {
    next(error);
  }
}

export async function getCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const collection = await collectionService.getCollection(userId, id);
    res.status(200).json({ collection });
  } catch (error) {
    next(error);
  }
}

export async function updateCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { name, theme, description, isPublic, coverImageId } = req.body as Record<string, unknown>;

    const collection = await collectionService.updateCollection(userId, id, {
      name: typeof name === 'string' ? name : undefined,
      theme: typeof theme === 'string' ? theme : undefined,
      description: typeof description === 'string' ? description : undefined,
      isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
      coverImageId: typeof coverImageId === 'string' || coverImageId === null ? coverImageId : undefined,
    });

    res.status(200).json({ message: 'Cập nhật bộ sưu tập thành công', collection });
  } catch (error) {
    next(error);
  }
}

export async function deleteCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    await collectionService.deleteCollection(userId, id);
    res.status(200).json({ message: 'Đã xóa bộ sưu tập thành công' });
  } catch (error) {
    next(error);
  }
}

export async function addImageToCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { analysisId, imageId } = req.body as Record<string, unknown>;

    const result = await collectionService.addImageToCollection(
      userId,
      id,
      typeof analysisId === 'string' ? analysisId : undefined,
      typeof imageId === 'string' ? imageId : undefined,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeImageFromCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id, imageId } = req.params as { id: string; imageId: string };

    const result = await collectionService.removeImageFromCollection(userId, id, imageId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCollectionVocabulary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = await collectionService.getCollectionVocabulary(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
