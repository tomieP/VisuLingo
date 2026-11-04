import { Router } from 'express';
import { listSavedWords, saveWord, deleteSavedWord } from '../controllers/savedWordController';

const router = Router();

// All routes require authenticateJwt — applied at app.use level in app.ts
router.get('/', listSavedWords);
router.post('/', saveWord);
router.delete('/:id', deleteSavedWord);

export default router;
