import { ApplicationStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import {
  applyToJob,
  listJobApplications,
  listMyApplications,
  updateApplicationStatus,
} from './application.service';

jest.mock('../../config/prisma', () => ({
  prisma: {
    job: { findUnique: jest.fn(), findFirst: jest.fn() },
    application: { findUnique: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const jobFindUnique = prisma.job.findUnique as unknown as jest.Mock;
const jobFindFirst = prisma.job.findFirst as unknown as jest.Mock;
const applicationFindUnique = prisma.application.findUnique as unknown as jest.Mock;
const applicationFindMany = prisma.application.findMany as unknown as jest.Mock;
const transactionMock = prisma.$transaction as unknown as jest.Mock;

const userId = '10000000-0000-4000-8000-000000000001';
const jobId = '20000000-0000-4000-8000-000000000002';
const applicationId = '30000000-0000-4000-8000-000000000003';

function transactionClient() {
  return {
    application: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    applicationStatusHistory: { create: jest.fn() },
  };
}

describe('application service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates an APPLIED application and initial history through one transaction client', async () => {
    const tx = transactionClient();
    const created = { id: applicationId, jobId, status: ApplicationStatus.APPLIED };
    jobFindUnique.mockResolvedValue({ id: jobId });
    applicationFindUnique.mockResolvedValue(null);
    tx.application.create.mockResolvedValue(created);
    tx.applicationStatusHistory.create.mockResolvedValue({ id: 'history-id' });
    transactionMock.mockImplementation((callback) => callback(tx));

    await expect(applyToJob(userId, jobId)).resolves.toEqual(created);
    expect(jobFindUnique).toHaveBeenCalledWith({ where: { id: jobId }, select: { id: true } });
    expect(applicationFindUnique).toHaveBeenCalledWith({
      where: { jobId_jobSeekerId: { jobId, jobSeekerId: userId } },
      select: { id: true },
    });
    expect(tx.application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { jobId, jobSeekerId: userId, status: ApplicationStatus.APPLIED },
      }),
    );
    expect(tx.applicationStatusHistory.create).toHaveBeenCalledWith({
      data: { applicationId, status: ApplicationStatus.APPLIED },
      select: { id: true },
    });
  });

  it('rejects missing jobs and known duplicates before starting a transaction', async () => {
    jobFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: jobId });
    applicationFindUnique.mockResolvedValue({ id: applicationId });

    await expect(applyToJob(userId, jobId)).rejects.toEqual(new AppError(404, 'Job not found'));
    await expect(applyToJob(userId, jobId)).rejects.toEqual(
      new AppError(409, 'You have already applied to this job'),
    );
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('translates a transaction P2002 race to a safe conflict', async () => {
    jobFindUnique.mockResolvedValue({ id: jobId });
    applicationFindUnique.mockResolvedValue(null);
    transactionMock.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
        meta: { target: 'private_constraint' },
      }),
    );

    await expect(applyToJob(userId, jobId)).rejects.toEqual(
      new AppError(409, 'You have already applied to this job'),
    );
  });

  it('scopes My Applications by authenticated identity with a safe projection', async () => {
    applicationFindMany.mockResolvedValue([]);
    await expect(listMyApplications(userId)).resolves.toEqual([]);

    const query = applicationFindMany.mock.calls[0][0];
    expect(query.where).toEqual({ jobSeekerId: userId });
    expect(query.select.job.select.company.select).toEqual({ name: true });
    expect(JSON.stringify(query.select)).not.toContain('passwordHash');
  });

  it('returns only candidates for a job owned by the authenticated Company', async () => {
    jobFindFirst.mockResolvedValue({ id: jobId });
    applicationFindMany.mockResolvedValue([]);

    await expect(listJobApplications(userId, jobId)).resolves.toEqual([]);
    expect(jobFindFirst).toHaveBeenCalledWith({
      where: { id: jobId, company: { userId } },
      select: { id: true },
    });
    const query = applicationFindMany.mock.calls[0][0];
    expect(query.where).toEqual({ jobId });
    expect(query.select.jobSeeker.select).toEqual({ name: true, email: true });
    expect(JSON.stringify(query.select)).not.toContain('passwordHash');
  });

  it('hides missing and foreign Company jobs with the same safe 404', async () => {
    jobFindFirst.mockResolvedValue(null);
    await expect(listJobApplications(userId, jobId)).rejects.toEqual(
      new AppError(404, 'Job not found'),
    );
    expect(applicationFindMany).not.toHaveBeenCalled();
  });

  it('updates status and creates history through one transaction client', async () => {
    const tx = transactionClient();
    const updated = { id: applicationId, jobId, status: ApplicationStatus.REVIEWING };
    tx.application.findFirst.mockResolvedValue({
      id: applicationId,
      status: ApplicationStatus.APPLIED,
    });
    tx.application.update.mockResolvedValue(updated);
    tx.applicationStatusHistory.create.mockResolvedValue({ id: 'history-id' });
    transactionMock.mockImplementation((callback) => callback(tx));

    await expect(
      updateApplicationStatus(userId, applicationId, { status: ApplicationStatus.REVIEWING }),
    ).resolves.toEqual(updated);
    expect(tx.application.findFirst).toHaveBeenCalledWith({
      where: { id: applicationId, job: { company: { userId } } },
      select: { id: true, status: true },
    });
    expect(tx.application.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: ApplicationStatus.REVIEWING } }),
    );
    expect(tx.applicationStatusHistory.create).toHaveBeenCalledWith({
      data: { applicationId, status: ApplicationStatus.REVIEWING },
      select: { id: true },
    });
  });

  it('rejects same status without an update or history row', async () => {
    const tx = transactionClient();
    tx.application.findFirst.mockResolvedValue({
      id: applicationId,
      status: ApplicationStatus.APPLIED,
    });
    transactionMock.mockImplementation((callback) => callback(tx));

    await expect(
      updateApplicationStatus(userId, applicationId, { status: ApplicationStatus.APPLIED }),
    ).rejects.toEqual(new AppError(400, 'Application already has this status'));
    expect(tx.application.update).not.toHaveBeenCalled();
    expect(tx.applicationStatusHistory.create).not.toHaveBeenCalled();
  });

  it('hides missing and foreign applications with a safe 404 and performs no writes', async () => {
    const tx = transactionClient();
    tx.application.findFirst.mockResolvedValue(null);
    transactionMock.mockImplementation((callback) => callback(tx));

    await expect(
      updateApplicationStatus(userId, applicationId, { status: ApplicationStatus.ACCEPTED }),
    ).rejects.toEqual(new AppError(404, 'Application not found'));
    expect(tx.application.update).not.toHaveBeenCalled();
    expect(tx.applicationStatusHistory.create).not.toHaveBeenCalled();
  });
});
