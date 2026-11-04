import { Router } from 'express';
import { authenticateJwt, requireRole } from '../middlewares/authMiddleware';
import { ROLES } from '../config/constants';
import { getStats, listUsers } from '../controllers/adminController';

const router = Router();
router.use(authenticateJwt, requireRole([ROLES.ADMIN]));
router.get('/stats', getStats);
router.get('/users', listUsers);

export default router;
