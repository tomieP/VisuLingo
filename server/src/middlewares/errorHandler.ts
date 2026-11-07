import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import logger from '../utils/logger';

const DEFAULT_CODES: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'FILE_TOO_LARGE',
  415: 'INVALID_FORMAT',
  422: 'IMAGE_UNREADABLE',
  429: 'RATE_LIMITED',
  502: 'AI_UPSTREAM_ERROR',
  504: 'AI_TIMEOUT',
  500: 'INTERNAL_ERROR',
};

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Dữ liệu yêu cầu không hợp lệ.',
  401: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  403: 'Không có quyền truy cập.',
  404: 'Tài nguyên không tìm thấy.',
  409: 'Dữ liệu đã tồn tại hoặc xảy ra xung đột.',
  413: 'Kích thước tệp vượt quá giới hạn cho phép (tối đa 10MB).',
  415: 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP.',
  422: 'Tệp hình ảnh bị hỏng hoặc không thể đọc được nội dung.',
  429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
  502: 'Dịch vụ trí tuệ nhân tạo (AI) tạm thời không khả dụng.',
  504: 'Thời gian phản hồi dịch vụ AI đã hết hạn.',
  500: 'Đã xảy ra lỗi máy chủ nội bộ.',
};

/**
 * Centralized error handler with standardized JSON response: { code, message, retryable }
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Handle Multer-specific errors (400-level)
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(413).json({
          code: 'FILE_TOO_LARGE',
          message: DEFAULT_MESSAGES[413],
          retryable: false,
        });
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(415).json({
          code: 'INVALID_FORMAT',
          message: DEFAULT_MESSAGES[415],
          retryable: false,
        });
        return;
      default:
        res.status(400).json({
          code: 'UPLOAD_ERROR',
          message: `Lỗi tải tệp: ${err.message}`,
          retryable: false,
        });
        return;
    }
  }

  const statusCode = (err as any).statusCode || 500;
  const errorCode = (err as any).code || DEFAULT_CODES[statusCode] || 'INTERNAL_ERROR';
  const isRetryable = (err as any).retryable ?? (statusCode === 502 || statusCode === 504);
  const message = (err as any).message && statusCode !== 500 ? err.message : (DEFAULT_MESSAGES[statusCode] || 'Internal server error');

  // Log the error
  logger.error(`[${statusCode}] ${errorCode} ${err.message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Send standardized JSON response
  res.status(statusCode).json({
    code: errorCode,
    message,
    retryable: isRetryable,
  });
}
