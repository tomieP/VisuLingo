import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Rate limiter: protects /api/detections (Vision AI).
 * 60 req/min in prod, 300 req/min in dev.
 */
export const detectionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 300 : 180,
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
 * General API rate limiter:
 * Generous limits with Reverse Proxy IP support.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    retryable: true,
  },
  keyGenerator: (req) => (req as any).user?.userId || req.ip || 'unknown',
  skip: (req) =>
    isDev ||
    req.path === '/health' ||
    req.path.startsWith('/auth') ||
    req.path.startsWith('/admin') ||
    req.path.startsWith('/moments'),
});

/**
 * Auth endpoints rate limiter (register / login):
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ít phút.',
    retryable: false,
  },
  skip: () => isDev,
  keyGenerator: (req) => req.ip || 'unknown',
});
