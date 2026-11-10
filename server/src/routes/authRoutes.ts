import { Router } from 'express';
import { register, login, getProfile, getServerTime, getStreak, recordStreak, searchUsersController } from '../controllers/authController';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public routes
router.get('/time', getServerTime);
router.get('/users/search', searchUsersController);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes (require valid JWT)
router.get('/me', authenticateJwt, getProfile);
router.get('/profile', authenticateJwt, getProfile);
router.get('/streak', authenticateJwt, getStreak);
router.post('/streak', authenticateJwt, recordStreak);

export default router;
