import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, displayName } = req.body as Record<string, unknown>;

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email không hợp lệ', retryable: false });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Mật khẩu tối thiểu 8 ký tự', retryable: false });
      return;
    }

    const result = await authService.register(
      email as string,
      password as string,
      typeof displayName === 'string' ? displayName : undefined,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as Record<string, unknown>;

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email không hợp lệ', retryable: false });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Mật khẩu tối thiểu 8 ký tự', retryable: false });
      return;
    }

    const result = await authService.login(email as string, password as string);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const profile = await authService.getCurrentUser(userId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

export function getServerTime(_req: Request, res: Response): void {
  const now = new Date();
  res.status(200).json({
    serverTime: now.toISOString(),
    timestamp: now.getTime(),
    serverDate: now.toISOString().slice(0, 10),
  });
}

export async function getStreak(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await authService.getUserStreak(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function recordStreak(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await authService.recordUserStreak(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function searchUsersController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string) || '';
    const users = await authService.searchUsers(q);
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}
