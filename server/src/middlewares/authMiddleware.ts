import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedUser {
  userId: string;
  role: string;
}

interface JwtPayload {
  userId: string;
  role: string;
}

/**
 * 1. authenticateJwt:
 * - Trích xuất token từ Header Authorization: Bearer <token>.
 * - Giải mã JWT token. Nếu thiếu token, token hết hạn hoặc không hợp lệ:
 *   -> Trả về lỗi HTTP 401 (code: "UNAUTHORIZED", message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn", retryable: false).
 * - Gán thông tin người dùng vào context yêu cầu: req.user = { userId: payload.userId, role: payload.role }.
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

  const token = authHeader.substring(7).trim();
  if (!token) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      retryable: false,
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId || !decoded.role) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        retryable: false,
      });
      return;
    }

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
 * 2. requireRole(roles: string[]):
 * - Middleware kiểm tra req.user.role. Nếu không nằm trong danh sách được phép:
 *   -> Trả về lỗi HTTP 403 (code: "FORBIDDEN", message: "Không có quyền truy cập", retryable: false).
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

/**
 * 3. optionalAuthenticate:
 * - Dùng cho các endpoint cho phép cả khách và người dùng đăng nhập (ví dụ: upload & analyze ảnh).
 * - Nếu có token hợp lệ thì gán req.user, nếu không có hoặc lỗi token thì vẫn cho phép đi tiếp dưới tư cách khách.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (decoded && decoded.userId && decoded.role) {
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
    }
    next();
  } catch {
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
