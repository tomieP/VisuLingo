import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import { analyzeImageController } from '../controllers/detectionController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Guest analysis supported; optional JWT lets service associate image with user.
router.post('/analyze', upload.single('image'), (req, res, next) => {
  // Authentication remains optional for this endpoint in current phase.
  void authenticate;
  analyzeImageController(req, res, next);
});

export default router;