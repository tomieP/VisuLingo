import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { ROLES } from '../config/constants';
import { getStats, listUsers } from '../controllers/adminController';

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/stats', getStats);
router.get('/users', listUsers);

export default router;