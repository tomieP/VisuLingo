import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import savedWordRoutes from './routes/savedWordRoutes';
import collectionRoutes from './routes/collectionRoutes';
import imageRoutes from './routes/imageRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no rate limiting)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'visulingo-server' });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Existing routes (detections, vocab)
app.use('/api', routes);

// Auth routes (authLimiter applied inside authRoutes)
app.use('/api/auth', authRoutes);

// Saved words routes (all protected by authenticateJwt)
app.use('/api/saved-words', savedWordRoutes);

// Collections routes (all protected by authenticateJwt)
app.use('/api/collections', collectionRoutes);

// Images routes (all protected by authenticateJwt)
app.use('/api/images', imageRoutes);

// Admin routes (all protected by authenticateJwt + requireRole('admin'))
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

export default app;
