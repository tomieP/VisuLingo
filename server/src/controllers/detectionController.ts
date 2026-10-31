import { Request, Response, NextFunction } from 'express';
import { analyzeImage } from '../services/detectionService';

export async function analyzeImageController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const result = await analyzeImage(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      req.file.size,
      req.user?.userId,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}