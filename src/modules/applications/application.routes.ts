import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validateBody, validateParams } from '../../middlewares/validateRequest';
import * as applicationController from './application.controller';
import {
  applicationParamsSchema,
  emptyApplicationBodySchema,
  jobApplicationParamsSchema,
  updateApplicationStatusSchema,
} from './application.schema';

export const applicationRoutes = Router();
export const jobApplicationRoutes = Router();

jobApplicationRoutes.post(
  '/:jobId/applications',
  authenticate,
  authorize(UserRole.JOB_SEEKER),
  validateParams(jobApplicationParamsSchema),
  validateBody(emptyApplicationBodySchema),
  applicationController.applyToJob,
);

jobApplicationRoutes.get(
  '/:jobId/applications',
  authenticate,
  authorize(UserRole.COMPANY),
  validateParams(jobApplicationParamsSchema),
  applicationController.listJobApplications,
);

applicationRoutes.get(
  '/me',
  authenticate,
  authorize(UserRole.JOB_SEEKER),
  applicationController.listMyApplications,
);

applicationRoutes.patch(
  '/:applicationId/status',
  authenticate,
  authorize(UserRole.COMPANY),
  validateParams(applicationParamsSchema),
  validateBody(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus,
);
