import multer from 'multer';
import { env } from '../config/env';
import { Request } from 'express';

const storage = multer.memoryStorage();

/**
 * Check actual file content, not only client-provided MIME type.
 */
function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
      buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a) {
    return 'image/png';
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // MIME is checked again after buffering; reject obvious invalid claims early.
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    const error: any = new Error('Invalid image format');
    error.code = 'INVALID_FORMAT';
    error.statusCode = 415;
    cb(error);
    return;
  }
  cb(null, true);
}

/**
 * Single-image upload. Content validation runs in validateUploadedImage after multer.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 1,
  },
});

export function validateUploadedImage(req: Request, _res: unknown, next: (error?: any) => void): void {
  if (!req.file) {
    next();
    return;
  }

  const actualMime = detectImageMime(req.file.buffer);
  if (!actualMime || actualMime !== req.file.mimetype) {
    const error: any = new Error('File content does not match a supported image format.');
    error.code = 'INVALID_FORMAT';
    error.statusCode = 415;
    error.retryable = false;
    next(error);
    return;
  }

  if (req.file.size > env.MAX_UPLOAD_MB * 1024 * 1024) {
    const error: any = new Error(`File exceeds maximum size of ${env.MAX_UPLOAD_MB}MB.`);
    error.code = 'FILE_TOO_LARGE';
    error.statusCode = 413;
    error.retryable = false;
    next(error);
    return;
  }

  next();
}
