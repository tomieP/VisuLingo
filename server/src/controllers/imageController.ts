import { Request, Response, NextFunction } from 'express';
import * as imageService from '../services/imageService';
import fs from 'node:fs';

export async function getImageDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const details = await imageService.getImageDetails(userId, id);
    res.status(200).json({ image: details });
  } catch (error) {
    next(error);
  }
}

export async function getImageFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const type = req.query.type === 'thumbnail' ? 'thumbnail' : 'original';

    const result = await imageService.getImageFile(userId, id, type);

    if (result.isExternal && result.url) {
      res.redirect(result.url);
      return;
    }

    if (result.filePath && fs.existsSync(result.filePath)) {
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Cache-Control', 'private, max-age=900'); // 15 phút cache
      fs.createReadStream(result.filePath).pipe(res);
      return;
    }

    res.status(200).json({
      url: result.url || null,
      signedToken: result.signedToken,
      mimeType: result.mimeType,
    });
  } catch (error) {
    next(error);
  }
}
