import { Request, Response, NextFunction } from 'express';
import { analyzeImage } from '../services/detectionService';
import logger from '../utils/logger';

/**
 * POST /api/detections
 * Upload image and run AI object detection.
 */
export async function analyzeImageController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        code: 'NO_FILE',
        message: 'Image file is required (field name: "image").',
        retryable: false,
      });
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
  } catch (error: any) {
    // If it's a known application error with statusCode, pass through
    if (error.code && error.statusCode) {
      res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
        retryable: error.retryable ?? false,
      });
      return;
    }
    next(error);
  }
}
