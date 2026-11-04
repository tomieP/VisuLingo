import express from 'express';
import detectionRoutes from './detectionRoutes';
import vocabRoutes from './vocabRoutes';

const router = express.Router();

// API routes
router.use('/detections', detectionRoutes);
router.use('/vocab', vocabRoutes);

export default router;
