import { Router } from 'express';
import detectionRoutes from './detectionRoutes';
import vocabRoutes from './vocabRoutes';
import authRoutes from './authRoutes';
import collectionRoutes from './collectionRoutes';
import adminRoutes from './adminRoutes';

const router = Router();
router.use('/detection', detectionRoutes);
router.use('/vocabulary', vocabRoutes);
router.use('/auth', authRoutes);
router.use('/collections', collectionRoutes);
router.use('/admin', adminRoutes);

export default router;