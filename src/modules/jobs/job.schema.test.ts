import { JobType } from '@prisma/client';
import { createJobSchema, jobParamsSchema } from './job.schema';

const validJob = {
  title: '  Backend Developer  ',
  location: '  Jakarta  ',
  salary: 12_000_000,
  jobType: JobType.FULL_TIME,
  description: '  Build secure APIs.  ',
};

describe('job schemas', () => {
  it('accepts valid input and trims text fields', () => {
    expect(createJobSchema.parse(validJob)).toEqual({
      ...validJob,
      title: 'Backend Developer',
      location: 'Jakarta',
      description: 'Build secure APIs.',
    });
  });

  it.each([
    ['missing title', { ...validJob, title: undefined }],
    ['empty title', { ...validJob, title: '  ' }],
    ['missing location', { ...validJob, location: undefined }],
    ['zero salary', { ...validJob, salary: 0 }],
    ['negative salary', { ...validJob, salary: -1 }],
    ['floating salary', { ...validJob, salary: 1.5 }],
    ['string salary', { ...validJob, salary: '12000000' }],
    ['salary outside PostgreSQL integer range', { ...validJob, salary: 2_147_483_648 }],
    ['invalid job type', { ...validJob, jobType: 'PERMANENT' }],
    ['empty description', { ...validJob, description: ' ' }],
    ['client companyId', { ...validJob, companyId: '10000000-0000-4000-8000-000000000001' }],
    ['server id', { ...validJob, id: '10000000-0000-4000-8000-000000000001' }],
  ])('rejects %s', (_label, input) => {
    expect(createJobSchema.safeParse(input).success).toBe(false);
  });

  it('accepts only UUID job parameters', () => {
    expect(
      jobParamsSchema.safeParse({ jobId: '10000000-0000-4000-8000-000000000001' }).success,
    ).toBe(true);
    expect(jobParamsSchema.safeParse({ jobId: 'invalid' }).success).toBe(false);
  });
});
