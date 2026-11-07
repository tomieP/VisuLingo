import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes (require valid JWT)
router.get('/me', authenticateJwt, getProfile);
router.get('/profile', authenticateJwt, getProfile);

export default router;
