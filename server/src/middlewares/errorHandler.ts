import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import logger from '../utils/logger';

/**
 * Centralized error handler with consistent JSON shape.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Handle Multer-specific errors (400-level)
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(413).json({
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds the maximum limit.',
          retryable: false,
        });
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(415).json({
          code: 'INVALID_FORMAT',
          message: 'Invalid file type. Only JPEG, PNG, and WebP images are supported.',
          retryable: false,
        });
        return;
      default:
        res.status(400).json({
          code: 'UPLOAD_ERROR',
          message: `Upload error: ${err.message}`,
          retryable: false,
        });
        return;
    }
  }

  // Known application errors (4xx/5xx)
  const statusCode = (err as any).statusCode || 500;
  const errorCode = (err as any).code || 'INTERNAL_ERROR';
  const isRetryable = (err as any).retryable ?? false;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  // Log the error
  logger.error(`[${statusCode}] ${errorCode} ${err.message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Send error response
  res.status(statusCode).json({
    code: errorCode,
    message,
    retryable: isRetryable,
  });
}
