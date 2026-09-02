import { ApplicationStatus, JobType, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import request from 'supertest';
import app from '../app';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

type AuthSession = { userId: string; token: string };

const created = {
  userIds: [] as string[],
  companyIds: [] as string[],
  jobIds: [] as string[],
  applicationIds: [] as string[],
};

function authorization(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getCreatedId(body: unknown, resource: 'user' | 'job' | 'application') {
  if (!isRecord(body) || !isRecord(body.data)) return undefined;
  const createdResource = body.data[resource];
  if (!isRecord(createdResource) || typeof createdResource.id !== 'string') {
    return undefined;
  }
  return createdResource.id;
}

function expectSafeJson(body: unknown) {
  const serialized = JSON.stringify(body);
  expect(serialized).not.toMatch(
    /passwordHash|JWT_SECRET|DATABASE_URL|PrismaClient|"stack"\s*:|stack trace|node_modules/i,
  );
}

describe('Stage 6 backend HTTP and database workflow', () => {
  jest.setTimeout(90_000);

  beforeAll(() => {
    if (env.NODE_ENV === 'production') {
      throw new Error('Stage 6 integration tests refuse to mutate a production database');
    }
  });

  afterAll(async () => {
    try {
      if (created.applicationIds.length > 0) {
        await prisma.applicationStatusHistory.deleteMany({
          where: { applicationId: { in: created.applicationIds } },
        });
        await prisma.application.deleteMany({ where: { id: { in: created.applicationIds } } });
      }
      if (created.jobIds.length > 0) {
        await prisma.job.deleteMany({ where: { id: { in: created.jobIds } } });
      }
      if (created.companyIds.length > 0) {
        await prisma.company.deleteMany({ where: { id: { in: created.companyIds } } });
      }
      if (created.userIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
      }

      const remainingRecords = await Promise.all([
        prisma.applicationStatusHistory.count({
          where: { applicationId: { in: created.applicationIds } },
        }),
        prisma.application.count({ where: { id: { in: created.applicationIds } } }),
        prisma.job.count({ where: { id: { in: created.jobIds } } }),
        prisma.company.count({ where: { id: { in: created.companyIds } } }),
        prisma.user.count({ where: { id: { in: created.userIds } } }),
      ]);
      if (remainingRecords.some((count) => count !== 0)) {
        throw new Error(
          `Stage 6 cleanup incomplete for tracked record IDs: ${created.userIds.join(',')}`,
        );
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it('proves the complete cross-role workflow and persistence invariants', async () => {
    const suffix = randomUUID();
    const password = `Stage6-${randomUUID()}!`;

    async function registerAndLogin(
      label: string,
      role: UserRole,
      companyDescription?: string,
    ): Promise<AuthSession> {
      const email = `stage6-${label}-${suffix}@example.test`;
      const registration =
        role === UserRole.COMPANY
          ? { companyName: `Stage 6 ${label}`, companyDescription, email, password, role }
          : { name: `Stage 6 ${label}`, email, password, role };
      const registered = await request(app).post('/api/auth/register').send(registration);
      const userId = registered.status === 201 ? getCreatedId(registered.body, 'user') : undefined;
      if (userId) created.userIds.push(userId);

      if (role === UserRole.COMPANY && userId) {
        const company = await prisma.company.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (company) created.companyIds.push(company.id);
      }

      expect(registered.status).toBe(201);
      expectSafeJson(registered.body);
      expect(userId).toBeDefined();
      if (!userId) throw new Error('Successful registration response did not contain a user ID');

      const loggedIn = await request(app).post('/api/auth/login').send({ email, password });
      expect(loggedIn.status).toBe(200);
      expectSafeJson(loggedIn.body);
      return { userId, token: loggedIn.body.data.accessToken as string };
    }

    const companyA = await registerAndLogin('company-a', UserRole.COMPANY, 'Synthetic test');
    const companyB = await registerAndLogin('company-b', UserRole.COMPANY);
    const seeker = await registerAndLogin('seeker', UserRole.JOB_SEEKER);

    const anonymous = await request(app).post(`/api/jobs/${randomUUID()}/applications`);
    expect(anonymous.status).toBe(401);

    const createJob = await request(app)
      .post('/api/jobs')
      .set(authorization(companyA.token))
      .send({
        title: `Stage 6 API Engineer ${suffix}`,
        location: 'Jakarta',
        salary: 12_000_000,
        jobType: JobType.FULL_TIME,
        description: 'Synthetic Stage 6 integration vacancy',
      });
    const jobId = createJob.status === 201 ? getCreatedId(createJob.body, 'job') : undefined;
    if (jobId) created.jobIds.push(jobId);

    expect(createJob.status).toBe(201);
    expectSafeJson(createJob.body);
    expect(jobId).toBeDefined();
    if (!jobId) throw new Error('Successful Job response did not contain a Job ID');
    expect(createJob.body.data.job.company).toEqual({ name: 'Stage 6 company-a' });

    const jobs = await request(app).get('/api/jobs').set(authorization(seeker.token));
    expect(jobs.status).toBe(200);
    expect(jobs.body.data.jobs).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: jobId })]),
    );

    const detail = await request(app).get(`/api/jobs/${jobId}`).set(authorization(seeker.token));
    expect(detail.status).toBe(200);
    expect(detail.body.data.job).toEqual(
      expect.objectContaining({ id: jobId, description: 'Synthetic Stage 6 integration vacancy' }),
    );

    const companyCannotApply = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set(authorization(companyA.token));
    expect(companyCannotApply.status).toBe(403);

    const apply = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set(authorization(seeker.token));
    const applicationId =
      apply.status === 201 ? getCreatedId(apply.body, 'application') : undefined;
    if (applicationId) created.applicationIds.push(applicationId);

    expect(apply.status).toBe(201);
    expect(apply.body.data.application.status).toBe(ApplicationStatus.APPLIED);
    expect(applicationId).toBeDefined();
    if (!applicationId)
      throw new Error('Successful Apply response did not contain an Application ID');

    const duplicate = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set(authorization(seeker.token));
    expect(duplicate.status).toBe(409);
    expectSafeJson(duplicate.body);

    const initialDatabaseState = await prisma.application.findUniqueOrThrow({
      where: { id: applicationId },
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    expect(initialDatabaseState.jobSeekerId).toBe(seeker.userId);
    expect(initialDatabaseState.status).toBe(ApplicationStatus.APPLIED);
    expect(initialDatabaseState.statusHistory.map((entry) => entry.status)).toEqual([
      ApplicationStatus.APPLIED,
    ]);
    expect(await prisma.application.count({ where: { jobId, jobSeekerId: seeker.userId } })).toBe(
      1,
    );

    const myApplications = await request(app)
      .get('/api/applications/me')
      .set(authorization(seeker.token));
    expect(myApplications.status).toBe(200);
    expect(myApplications.body.data.applications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: applicationId, status: ApplicationStatus.APPLIED }),
      ]),
    );

    const candidates = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set(authorization(companyA.token));
    expect(candidates.status).toBe(200);
    expect(candidates.body.data.applications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: applicationId,
          jobSeeker: expect.objectContaining({
            email: expect.any(String),
            name: expect.any(String),
          }),
        }),
      ]),
    );
    expectSafeJson(candidates.body);

    const seekerCannotViewCandidates = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set(authorization(seeker.token));
    expect(seekerCannotViewCandidates.status).toBe(403);
    const seekerCannotUpdate = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(authorization(seeker.token))
      .send({ status: ApplicationStatus.REVIEWING });
    expect(seekerCannotUpdate.status).toBe(403);

    const sameTargetUpdates = await Promise.all([
      request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set(authorization(companyA.token))
        .send({ status: ApplicationStatus.REVIEWING }),
      request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set(authorization(companyA.token))
        .send({ status: ApplicationStatus.REVIEWING }),
    ]);
    expect(sameTargetUpdates.map((response) => response.status).sort()).toEqual([200, 409]);
    expect(sameTargetUpdates.find((response) => response.status === 409)?.body.message).toBe(
      'Application status changed. Please refresh and try again.',
    );

    const stateAfterSameTargetUpdates = await prisma.application.findUniqueOrThrow({
      where: { id: applicationId },
      include: { statusHistory: true },
    });
    expect(stateAfterSameTargetUpdates.status).toBe(ApplicationStatus.REVIEWING);
    expect(
      stateAfterSameTargetUpdates.statusHistory.filter(
        (entry) => entry.status === ApplicationStatus.REVIEWING,
      ),
    ).toHaveLength(1);

    const refreshed = await request(app)
      .get('/api/applications/me')
      .set(authorization(seeker.token));
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.applications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: applicationId, status: ApplicationStatus.REVIEWING }),
      ]),
    );

    const historyCountAfterUpdate = await prisma.applicationStatusHistory.count({
      where: { applicationId },
    });
    expect(historyCountAfterUpdate).toBe(2);

    const sameStatus = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(authorization(companyA.token))
      .send({ status: ApplicationStatus.REVIEWING });
    expect(sameStatus.status).toBe(400);
    expect(sameStatus.body.message).toBe('Application already has this status');

    const invalidStatus = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(authorization(companyA.token))
      .send({ status: 'PENDING' });
    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.message).toBe('Validation failed');

    const foreignCandidates = await request(app)
      .get(`/api/jobs/${jobId}/applications`)
      .set(authorization(companyB.token));
    expect(foreignCandidates.status).toBe(403);
    expect(foreignCandidates.body.data).toBeUndefined();

    const foreignUpdate = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set(authorization(companyB.token))
      .send({ status: ApplicationStatus.ACCEPTED });
    expect(foreignUpdate.status).toBe(403);
    expect(foreignUpdate.body.data).toBeUndefined();

    const missingJob = await request(app)
      .get(`/api/jobs/${randomUUID()}/applications`)
      .set(authorization(companyA.token));
    expect(missingJob.status).toBe(404);
    const missingApplication = await request(app)
      .patch(`/api/applications/${randomUUID()}/status`)
      .set(authorization(companyA.token))
      .send({ status: ApplicationStatus.ACCEPTED });
    expect(missingApplication.status).toBe(404);

    const finalDatabaseState = await prisma.application.findUniqueOrThrow({
      where: { id: applicationId },
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    expect(finalDatabaseState.status).toBe(ApplicationStatus.REVIEWING);
    expect(finalDatabaseState.statusHistory.map((entry) => entry.status)).toEqual([
      ApplicationStatus.APPLIED,
      ApplicationStatus.REVIEWING,
    ]);
    expect(finalDatabaseState.statusHistory).toHaveLength(historyCountAfterUpdate);

    const differentTargetUpdates = await Promise.all([
      request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set(authorization(companyA.token))
        .send({ status: ApplicationStatus.SHORTLISTED }),
      request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set(authorization(companyA.token))
        .send({ status: ApplicationStatus.ACCEPTED }),
    ]);
    expect(differentTargetUpdates.map((response) => response.status).sort()).toEqual([200, 409]);

    const acceptedDifferentTarget = differentTargetUpdates.find(
      (response) => response.status === 200,
    );
    const stateAfterDifferentTargetUpdates = await prisma.application.findUniqueOrThrow({
      where: { id: applicationId },
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    expect(stateAfterDifferentTargetUpdates.status).toBe(
      acceptedDifferentTarget?.body.data.application.status,
    );
    expect(stateAfterDifferentTargetUpdates.statusHistory).toHaveLength(
      historyCountAfterUpdate + 1,
    );
    const latestHistory =
      stateAfterDifferentTargetUpdates.statusHistory[
        stateAfterDifferentTargetUpdates.statusHistory.length - 1
      ];
    expect(latestHistory.status).toBe(stateAfterDifferentTargetUpdates.status);
  });
});
