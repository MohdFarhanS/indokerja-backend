import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { authRateLimiter } from './middlewares/authRateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { applicationRoutes, jobApplicationRoutes } from './modules/applications/application.routes';
import { companyJobRoutes, jobRoutes } from './modules/jobs/job.routes';

const app = express();

// Vercel Functions run behind one trusted reverse-proxy hop.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(['/api/auth/login', '/api/auth/register'], authRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs', jobApplicationRoutes);
app.use('/api/company/jobs', companyJobRoutes);
app.use('/api/applications', applicationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
