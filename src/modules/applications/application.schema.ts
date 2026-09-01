import { ApplicationStatus } from '@prisma/client';
import { z } from 'zod';

export const jobApplicationParamsSchema = z
  .object({
    jobId: z.string().uuid(),
  })
  .strict();

export const applicationParamsSchema = z
  .object({
    applicationId: z.string().uuid(),
  })
  .strict();

export const emptyApplicationBodySchema = z.preprocess(
  (value) => (value === undefined ? {} : value),
  z.object({}).strict(),
);

export const updateApplicationStatusSchema = z
  .object({
    status: z.enum(ApplicationStatus),
  })
  .strict();

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
