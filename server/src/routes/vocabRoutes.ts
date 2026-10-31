import { Router } from 'express';
import { lookupWordController } from '../controllers/vocabController';

const router = Router();
router.get('/lookup', lookupWordController);

export default router;