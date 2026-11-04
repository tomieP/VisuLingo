import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticateJwt, getProfile);

export default router;