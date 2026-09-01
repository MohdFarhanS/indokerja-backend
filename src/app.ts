import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { authRateLimiter } from './middlewares/authRateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { authRoutes } from './modules/auth/auth.routes';

const app = express();

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

// route module lain akan di-mount di sini pada Bagian 4
// app.use('/api/jobs', jobsRoutes);
// app.use('/api/applications', applicationsRoutes);
// app.use('/api/companies', companiesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
