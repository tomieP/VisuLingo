import rateLimit from 'express-rate-limit';

/**
 * Rate limiter: max 10 requests per minute per IP (protects /api/detections).
 */
export const detectionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
    retryable: false,
  },
  keyGenerator: (req) => req.ip || 'unknown',
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

/**
 * General API rate limiter: 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

/**
 * Auth endpoints rate limiter: 20 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});