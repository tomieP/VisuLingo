import multer from 'multer';
import { env } from '../config/env';
import { SUPPORTED_IMAGE_TYPES } from '../config/constants';
import { Request } from 'express';

const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (SUPPORTED_IMAGE_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
  }
}

/**
 * Multer middleware for single image upload.
 * - Stores file in memory (buffer)
 * - Validates file type (JPEG, PNG, WebP)
 * - Limits file size based on MAX_UPLOAD_MB
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 1,
  },
});