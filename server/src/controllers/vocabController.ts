import { Request, Response, NextFunction } from 'express';
import { lookupWord } from '../services/vocabService';

export async function lookupWordController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const word = typeof req.query.word === 'string' ? req.query.word : '';
    if (!word.trim()) {
      res.status(400).json({ error: 'Query parameter "word" is required' });
      return;
    }

    const vocabulary = await lookupWord(word);
    if (!vocabulary) {
      res.status(404).json({ error: `No vocabulary found for "${word}"` });
      return;
    }
    res.status(200).json(vocabulary);
  } catch (error) {
    next(error);
  }
}