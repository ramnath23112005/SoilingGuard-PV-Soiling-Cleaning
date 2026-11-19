import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isTest } from './config/env';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import apiRoutes from './routes/api.routes';
import adminRoutes from './routes/admin.routes';
import { isConnected } from './config/db';
import { cloudinaryConfigured } from './config/cloudinary';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL === '*' ? true : env.CLIENT_URL.split(','),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (!isTest) {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        uptime: Math.round(process.uptime()),
        environment: env.NODE_ENV,
        database: isConnected() ? 'connected' : 'disconnected',
        storage: cloudinaryConfigured ? 'cloudinary' : 'placeholder (dev fallback)',
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use('/api', apiLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api', apiRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
