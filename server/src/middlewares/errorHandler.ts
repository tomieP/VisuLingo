import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import logger from '../utils/logger';

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(413).json({ error: 'File size too large' });
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(415).json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are supported' });
        return;
      default:
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
    }
  }

  // Handle known error shapes
  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  logger.error(`[${statusCode}] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({ error: message, status: statusCode });
}