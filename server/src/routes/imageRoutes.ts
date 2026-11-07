import { Router } from 'express';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { getImageDetails, getImageFile } from '../controllers/imageController';

const router = Router();

// Truy xuất thông tin và file ảnh yêu cầu authenticateJwt
router.use(authenticateJwt);

router.get('/:id', getImageDetails);
router.get('/:id/file', getImageFile);

export default router;
