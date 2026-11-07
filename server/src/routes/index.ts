import { Router } from 'express';
import detectionRoutes from './detectionRoutes';
import vocabRoutes from './vocabRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// API routes (support both plural and singular for seamless frontend match)
router.use('/detections', detectionRoutes);
router.use('/detection', detectionRoutes);
router.use('/vocab', vocabRoutes);
router.use('/vocabulary', vocabRoutes);
router.use('/admin', adminRoutes);

export default router;
