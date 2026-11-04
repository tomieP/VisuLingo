import { Request, Response, NextFunction } from 'express';

/**
 * GET /api/vocab/search?q=word
 * Look up vocabulary word with cache-first strategy.
 */
export async function lookupWordController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const word = typeof req.query.q === 'string' ? req.query.q : '';
    const normalized = word.trim().toLowerCase();

    if (!normalized) {
      res.status(400).json({
        code: 'INVALID_QUERY',
        message: 'Query parameter "q" is required.',
        retryable: false,
      });
      return;
    }

    // Service layer will handle cache-first logic
    const vocabulary = await lookupWord(normalized);

    if (!vocabulary) {
      res.status(404).json({
        code: 'WORD_NOT_FOUND',
        message: `No vocabulary found for "${normalized}".`,
        retryable: false,
      });
      return;
    }

    // Success response
    res.status(200).json({
      word: vocabulary.word,
      meaningVi: vocabulary.meaningVi,
      ipa: vocabulary.ipa,
      example: vocabulary.example,
      source: vocabulary.source,
    });
  } catch (error: any) {
    next(error);
  }
}
