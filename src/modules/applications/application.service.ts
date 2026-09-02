import { ApplicationStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { UpdateApplicationStatusInput } from './application.schema';

const duplicateMessage = 'You have already applied to this job';

const createdApplicationSelect = {
  id: true,
  jobId: true,
  status: true,
  createdAt: true,
} satisfies Prisma.ApplicationSelect;

const myApplicationSelect = {
  id: true,
  status: true,
  createdAt: true,
  job: {
    select: {
      id: true,
      title: true,
      location: true,
      jobType: true,
      company: { select: { name: true } },
    },
  },
} satisfies Prisma.ApplicationSelect;

const candidateApplicationSelect = {
  id: true,
  status: true,
  createdAt: true,
  job: { select: { id: true, title: true } },
  jobSeeker: { select: { name: true, email: true } },
} satisfies Prisma.ApplicationSelect;

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function applyToJob(userId: string, jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!job) throw new AppError(404, 'Job not found');

  const duplicate = await prisma.application.findUnique({
    where: { jobId_jobSeekerId: { jobId, jobSeekerId: userId } },
    select: { id: true },
  });
  if (duplicate) throw new AppError(409, duplicateMessage);

  try {
    return await prisma.$transaction(async (transaction) => {
      const application = await transaction.application.create({
        data: { jobId, jobSeekerId: userId, status: ApplicationStatus.APPLIED },
        select: createdApplicationSelect,
      });

      await transaction.applicationStatusHistory.create({
        data: { applicationId: application.id, status: ApplicationStatus.APPLIED },
        select: { id: true },
      });

      return application;
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) throw new AppError(409, duplicateMessage);
    throw error;
  }
}

export async function listMyApplications(userId: string) {
  return prisma.application.findMany({
    where: { jobSeekerId: userId },
    select: myApplicationSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function listJobApplications(userId: string, jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { company: { select: { userId: true } } },
  });
  if (!job) throw new AppError(404, 'Job not found');
  if (job.company.userId !== userId) throw new AppError(403, 'Forbidden');

  return prisma.application.findMany({
    where: { jobId },
    select: candidateApplicationSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  input: UpdateApplicationStatusInput,
) {
  return prisma.$transaction(async (transaction) => {
    const application = await transaction.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        job: { select: { company: { select: { userId: true } } } },
      },
    });
    if (!application) throw new AppError(404, 'Application not found');
    if (application.job.company.userId !== userId) throw new AppError(403, 'Forbidden');
    if (application.status === input.status) {
      throw new AppError(400, 'Application already has this status');
    }

    const updatedApplication = await transaction.application.update({
      where: { id: application.id },
      data: { status: input.status },
      select: createdApplicationSelect,
    });

    await transaction.applicationStatusHistory.create({
      data: { applicationId: application.id, status: input.status },
      select: { id: true },
    });

    return updatedApplication;
  });
}
