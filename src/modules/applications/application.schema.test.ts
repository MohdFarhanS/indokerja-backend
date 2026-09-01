import { ApplicationStatus } from '@prisma/client';
import {
  applicationParamsSchema,
  emptyApplicationBodySchema,
  jobApplicationParamsSchema,
  updateApplicationStatusSchema,
} from './application.schema';

const uuid = '10000000-0000-4000-8000-000000000001';

describe('application schemas', () => {
  it('validates UUID route parameters', () => {
    expect(jobApplicationParamsSchema.safeParse({ jobId: uuid }).success).toBe(true);
    expect(applicationParamsSchema.safeParse({ applicationId: uuid }).success).toBe(true);
    expect(jobApplicationParamsSchema.safeParse({ jobId: 'invalid' }).success).toBe(false);
    expect(applicationParamsSchema.safeParse({ applicationId: 'invalid' }).success).toBe(false);
  });

  it('accepts only an empty apply body', () => {
    expect(emptyApplicationBodySchema.safeParse(undefined).success).toBe(true);
    expect(emptyApplicationBodySchema.safeParse({}).success).toBe(true);
  });

  it.each([
    ['client status', { status: ApplicationStatus.ACCEPTED }],
    ['client jobSeekerId', { jobSeekerId: uuid }],
    ['null', null],
    ['array', []],
    ['string', ''],
  ])('rejects %s as an apply body', (_label, body) => {
    expect(emptyApplicationBodySchema.safeParse(body).success).toBe(false);
  });

  it('accepts every ApplicationStatus and rejects invalid or additional fields', () => {
    for (const status of Object.values(ApplicationStatus)) {
      expect(updateApplicationStatusSchema.safeParse({ status }).success).toBe(true);
    }
    expect(updateApplicationStatusSchema.safeParse({ status: 'PENDING' }).success).toBe(false);
    expect(
      updateApplicationStatusSchema.safeParse({ status: ApplicationStatus.REVIEWING, userId: uuid })
        .success,
    ).toBe(false);
  });
});
