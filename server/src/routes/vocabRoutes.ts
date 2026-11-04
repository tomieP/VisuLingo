import { Router } from 'express';
import { lookupWordController } from '../controllers/vocabController';

const router = Router();

// GET /api/vocab/search — vocabulary lookup with cache-first strategy
router.get('/search', lookupWordController);

export default router;
