import { JobType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { createJob, getJob, listCompanyJobs, listJobs } from './job.service';

jest.mock('../../config/prisma', () => ({
  prisma: {
    company: { findUnique: jest.fn() },
    job: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  },
}));

const companyFindUniqueMock = prisma.company.findUnique as unknown as jest.Mock;
const jobFindManyMock = prisma.job.findMany as unknown as jest.Mock;
const jobFindUniqueMock = prisma.job.findUnique as unknown as jest.Mock;
const jobCreateMock = prisma.job.create as unknown as jest.Mock;

const userId = '10000000-0000-4000-8000-000000000001';
const companyId = '20000000-0000-4000-8000-000000000002';
const jobId = '30000000-0000-4000-8000-000000000003';
const input = {
  title: 'Backend Developer',
  location: 'Jakarta',
  salary: 12_000_000,
  jobType: JobType.FULL_TIME,
  description: 'Build secure APIs.',
};

describe('job service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists jobs with an explicit safe projection and supports an empty result', async () => {
    jobFindManyMock.mockResolvedValue([]);
    await expect(listJobs()).resolves.toEqual([]);

    expect(jobFindManyMock).toHaveBeenCalledWith({
      select: {
        id: true,
        title: true,
        location: true,
        salary: true,
        jobType: true,
        createdAt: true,
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns job detail safely and translates a missing job to 404', async () => {
    const job = { id: jobId, ...input, company: { name: 'PT Example' } };
    jobFindUniqueMock.mockResolvedValueOnce(job).mockResolvedValueOnce(null);

    await expect(getJob(jobId)).resolves.toEqual(job);
    expect(jobFindUniqueMock.mock.calls[0][0].select).toEqual(
      expect.objectContaining({ description: true, company: { select: { name: true } } }),
    );
    await expect(getJob(jobId)).rejects.toEqual(new AppError(404, 'Job not found'));
  });

  it('derives create ownership from authenticated user identity and maps fields explicitly', async () => {
    companyFindUniqueMock.mockResolvedValue({ id: companyId });
    jobCreateMock.mockResolvedValue({ id: jobId, ...input, company: { name: 'PT Example' } });

    await createJob(userId, input);

    expect(companyFindUniqueMock).toHaveBeenCalledWith({
      where: { userId },
      select: { id: true },
    });
    expect(jobCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: { companyId, ...input } }),
    );
    expect(jobCreateMock.mock.calls[0][0].data).not.toHaveProperty('userId');
  });

  it('rejects a Company account without a Company profile', async () => {
    companyFindUniqueMock.mockResolvedValue(null);
    await expect(createJob(userId, input)).rejects.toEqual(
      new AppError(403, 'Company profile is unavailable'),
    );
    expect(jobCreateMock).not.toHaveBeenCalled();
  });

  it('scopes Company jobs in Prisma using authenticated user identity', async () => {
    jobFindManyMock.mockResolvedValue([]);
    await expect(listCompanyJobs(userId)).resolves.toEqual([]);

    expect(jobFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { company: { userId } } }),
    );
  });
});
