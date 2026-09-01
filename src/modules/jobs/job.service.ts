import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { CreateJobInput } from './job.schema';

const companyNameSelect = {
  name: true,
} satisfies Prisma.CompanySelect;

const jobListSelect = {
  id: true,
  title: true,
  location: true,
  salary: true,
  jobType: true,
  createdAt: true,
  company: { select: companyNameSelect },
} satisfies Prisma.JobSelect;

const jobDetailSelect = {
  ...jobListSelect,
  description: true,
} satisfies Prisma.JobSelect;

export async function listJobs() {
  return prisma.job.findMany({
    select: jobListSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: jobDetailSelect,
  });

  if (!job) throw new AppError(404, 'Job not found');
  return job;
}

export async function createJob(userId: string, input: CreateJobInput) {
  const company = await prisma.company.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!company) throw new AppError(403, 'Company profile is unavailable');

  return prisma.job.create({
    data: {
      companyId: company.id,
      title: input.title,
      location: input.location,
      salary: input.salary,
      jobType: input.jobType,
      description: input.description,
    },
    select: jobDetailSelect,
  });
}

export async function listCompanyJobs(userId: string) {
  return prisma.job.findMany({
    where: { company: { userId } },
    select: jobDetailSelect,
    orderBy: { createdAt: 'desc' },
  });
}
