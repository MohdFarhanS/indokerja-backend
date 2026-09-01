import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validateBody, validateParams } from '../../middlewares/validateRequest';
import * as jobController from './job.controller';
import { createJobSchema, jobParamsSchema } from './job.schema';

export const jobRoutes = Router();
export const companyJobRoutes = Router();

jobRoutes.get('/', authenticate, authorize(UserRole.JOB_SEEKER), jobController.listJobs);
jobRoutes.get(
  '/:jobId',
  authenticate,
  authorize(UserRole.JOB_SEEKER),
  validateParams(jobParamsSchema),
  jobController.getJob,
);
jobRoutes.post(
  '/',
  authenticate,
  authorize(UserRole.COMPANY),
  validateBody(createJobSchema),
  jobController.createJob,
);

companyJobRoutes.get('/', authenticate, authorize(UserRole.COMPANY), jobController.listCompanyJobs);
