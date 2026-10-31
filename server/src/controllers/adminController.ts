import { Request, Response } from 'express';

export function getStats(_req: Request, res: Response): void {
  res.status(501).json({ error: 'Admin operations are not implemented yet' });
}

export function listUsers(_req: Request, res: Response): void {
  res.status(501).json({ error: 'Admin operations are not implemented yet' });
}