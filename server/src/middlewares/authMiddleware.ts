import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * Mandatory JWT authentication middleware.
 * Extracts token from Authorization header, verifies it, and attaches user info to req.user.
 * Returns 401 if token is missing, expired, or invalid.
 */
export function authenticateJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      retryable: false,
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      retryable: false,
    });
    return;
  }
}

/**
 * Role-based authorization middleware.
 * Checks if req.user.role is included in allowed roles.
 * Returns 403 if not authorized.
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        retryable: false,
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Không có quyền truy cập',
        retryable: false,
      });
      return;
    }

    next();
  };
}

export interface AuthenticatedUser {
  userId: string;
  role: string;
}

/**
 * Optional JWT authentication middleware.
 * Adds req.user if token is valid; otherwise proceeds as unauthenticated.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next();
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
