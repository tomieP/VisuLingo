import { Router } from 'express';
import detectionRoutes from './detectionRoutes';
import vocabRoutes from './vocabRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// API routes
router.use('/detections', detectionRoutes);
router.use('/vocab', vocabRoutes);
router.use('/admin', adminRoutes);

export default router;
