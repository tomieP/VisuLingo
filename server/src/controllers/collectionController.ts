import { Request, Response } from 'express';

export function listCollections(_req: Request, res: Response): void {
  res.status(501).json({ error: 'Collection management is not implemented yet' });
}

export function createCollection(_req: Request, res: Response): void {
  res.status(501).json({ error: 'Collection management is not implemented yet' });
}

export function getCollection(_req: Request, res: Response): void {
  res.status(501).json({ error: 'Collection management is not implemented yet' });
}

export function updateCollection(_req: Request, res: Response): void {
  res.status(501).json({ error: 'Collection management is not implemented yet' });
}

export function deleteCollection(_req: Request, res: Response): void {
  res.status(501).json({ error: 'Collection management is not implemented yet' });
}