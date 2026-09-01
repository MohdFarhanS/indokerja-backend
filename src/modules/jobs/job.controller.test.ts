import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as jobService from './job.service';
import { createJob, getJob, listCompanyJobs, listJobs } from './job.controller';

jest.mock('./job.service');

const listJobsMock = jobService.listJobs as jest.Mock;
const getJobMock = jobService.getJob as jest.Mock;
const createJobMock = jobService.createJob as jest.Mock;
const listCompanyJobsMock = jobService.listCompanyJobs as jest.Mock;

function responseMock(): Response {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response);
  return response as unknown as Response;
}

describe('job controller', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('returns list, detail, create, and Company-list response contracts', async () => {
    const jobs = [{ id: 'job-id' }];
    const job = { id: 'job-id' };
    listJobsMock.mockResolvedValue(jobs);
    getJobMock.mockResolvedValue(job);
    createJobMock.mockResolvedValue(job);
    listCompanyJobsMock.mockResolvedValue(jobs);

    const listResponse = responseMock();
    await listJobs({} as Request, listResponse, next);
    expect(listResponse.json).toHaveBeenCalledWith({ success: true, data: { jobs } });

    const detailResponse = responseMock();
    await getJob({ params: { jobId: 'job-id' } } as unknown as Request, detailResponse, next);
    expect(detailResponse.json).toHaveBeenCalledWith({ success: true, data: { job } });

    const authenticatedRequest = {
      auth: { userId, role: UserRole.COMPANY },
      body: {},
    } as Request;
    const createResponse = responseMock();
    await createJob(authenticatedRequest, createResponse, next);
    expect(createJobMock).toHaveBeenCalledWith(userId, {});
    expect(createResponse.status).toHaveBeenCalledWith(201);

    const companyResponse = responseMock();
    await listCompanyJobs(authenticatedRequest, companyResponse, next);
    expect(listCompanyJobsMock).toHaveBeenCalledWith(userId);
    expect(companyResponse.json).toHaveBeenCalledWith({ success: true, data: { jobs } });
  });
});

const userId = '10000000-0000-4000-8000-000000000001';
