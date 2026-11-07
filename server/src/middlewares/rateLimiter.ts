import rateLimit from 'express-rate-limit';

/**
 * Rate limiter: max 10 requests per minute per IP / User (protects /api/detections).
 */
export const detectionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Quá nhiều yêu cầu phân tích ảnh. Vui lòng thử lại sau ít phút.',
    retryable: true,
  },
  keyGenerator: (req) => (req as any).user?.userId || req.ip || 'unknown',
  skip: (req) => req.path === '/health',
});

/**
 * General API rate limiter: 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    retryable: true,
  },
  keyGenerator: (req) => (req as any).user?.userId || req.ip || 'unknown',
});

/**
 * Auth endpoints rate limiter: 20 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau 15 phút.',
    retryable: false,
  },
  keyGenerator: (req) => req.ip || 'unknown',
});
