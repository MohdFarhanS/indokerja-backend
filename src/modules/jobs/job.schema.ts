import { JobType } from '@prisma/client';
import { z } from 'zod';

const POSTGRES_INTEGER_MAX = 2_147_483_647;

export const createJobSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    location: z.string().trim().min(1).max(150),
    salary: z.number().int().positive().max(POSTGRES_INTEGER_MAX),
    jobType: z.enum(JobType),
    description: z.string().trim().min(1).max(10_000),
  })
  .strict();

export const jobParamsSchema = z
  .object({
    jobId: z.string().uuid(),
  })
  .strict();

export type CreateJobInput = z.infer<typeof createJobSchema>;
