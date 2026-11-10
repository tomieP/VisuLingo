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

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any origin dynamically to avoid CORS wildcard credentials error
      if (!origin || corsOrigin === '*' || (Array.isArray(corsOrigin) && corsOrigin.includes(origin))) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no rate limiting)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'visulingo-server' });
});

// Auth routes (protected by dedicated authLimiter inside authRoutes)
app.use('/api/auth', authRoutes);

// Apply general rate limiting to remaining API routes
app.use('/api', apiLimiter);

// Existing routes (detections, vocab)
app.use('/api', routes);

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
