import { Router } from 'express';
import { listSavedWords, saveWord, deleteSavedWord, checkSavedStatus } from '../controllers/savedWordController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

// Tất cả route bắt buộc yêu cầu authenticateJwt
router.use(authenticateJwt);

router.get('/', listSavedWords);
router.get('/check', checkSavedStatus);
router.post('/', saveWord);
router.delete('/:id', deleteSavedWord);

export default router;
