import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { authenticateJwt } from './middlewares/authMiddleware';
import authRoutes from './routes/authRoutes';
import savedWordRoutes from './routes/savedWordRoutes';

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

// Saved words routes (require JWT auth)
app.use('/api/saved-words', authenticateJwt, savedWordRoutes);

app.use(errorHandler);

export default app;
