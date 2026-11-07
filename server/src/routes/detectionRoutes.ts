import { Router } from 'express';
import { upload, validateUploadedImage } from '../middlewares/uploadMiddleware';
import { analyzeImageController } from '../controllers/detectionController';
import { detectionLimiter } from '../middlewares/rateLimiter';
import { optionalAuthenticate } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/detections — guest and authenticated analysis
router.post(
  '/',
  optionalAuthenticate,
  detectionLimiter,
  upload.single('image'),
  validateUploadedImage,
  analyzeImageController,
);

// Backward-compatible alias
router.post(
  '/analyze',
  optionalAuthenticate,
  detectionLimiter,
  upload.single('image'),
  validateUploadedImage,
  analyzeImageController,
);

export default router;
