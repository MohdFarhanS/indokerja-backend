import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// route module lain akan di-mount di sini pada Bagian 3 & 4
// app.use('/api/auth', authRoutes);
// app.use('/api/jobs', jobsRoutes);
// app.use('/api/applications', applicationsRoutes);
// app.use('/api/companies', companiesRoutes);

app.use(errorHandler);

export default app;