import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

function validateCredentials(email: unknown, password: unknown): string | null {
  if (typeof email !== 'string' || !email.includes('@')) return 'A valid email is required';
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName } = req.body as Record<string, unknown>;
    const validationError = validateCredentials(email, password);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }
    const result = await authService.register(email as string, password as string, firstName as string | undefined, lastName as string | undefined);
    res.status(201).json(result);
  } catch (error: any) {
    if (error?.code === '23505') {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as Record<string, unknown>;
    const validationError = validateCredentials(email, password);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }
    const result = await authService.login(email as string, password as string);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export function getProfile(req: Request, res: Response): void {
  res.status(200).json({ user: req.user });
}