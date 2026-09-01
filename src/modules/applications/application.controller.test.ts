import { ApplicationStatus, UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as applicationService from './application.service';
import {
  applyToJob,
  listJobApplications,
  listMyApplications,
  updateApplicationStatus,
} from './application.controller';

jest.mock('./application.service');

const applyToJobMock = applicationService.applyToJob as jest.Mock;
const listMyApplicationsMock = applicationService.listMyApplications as jest.Mock;
const listJobApplicationsMock = applicationService.listJobApplications as jest.Mock;
const updateApplicationStatusMock = applicationService.updateApplicationStatus as jest.Mock;

const userId = '10000000-0000-4000-8000-000000000001';
const jobId = '20000000-0000-4000-8000-000000000002';
const applicationId = '30000000-0000-4000-8000-000000000003';

function responseMock(): Response {
  const response = { status: jest.fn(), json: jest.fn() };
  response.status.mockReturnValue(response);
  return response as unknown as Response;
}

describe('application controller', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('derives apply identity from authentication and returns 201', async () => {
    const application = { id: applicationId };
    applyToJobMock.mockResolvedValue(application);
    const req = {
      auth: { userId, role: UserRole.JOB_SEEKER },
      params: { jobId },
      body: {},
    } as unknown as Request;
    const res = responseMock();

    await applyToJob(req, res, next);

    expect(applyToJobMock).toHaveBeenCalledWith(userId, jobId);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { application } }),
    );
  });

  it('uses authenticated identity for both application lists', async () => {
    listMyApplicationsMock.mockResolvedValue([]);
    listJobApplicationsMock.mockResolvedValue([]);
    const req = {
      auth: { userId, role: UserRole.COMPANY },
      params: { jobId },
    } as unknown as Request;

    await listMyApplications(req, responseMock(), next);
    await listJobApplications(req, responseMock(), next);

    expect(listMyApplicationsMock).toHaveBeenCalledWith(userId);
    expect(listJobApplicationsMock).toHaveBeenCalledWith(userId, jobId);
  });

  it('maps only validated status input to the status service and returns 200', async () => {
    const application = { id: applicationId, status: ApplicationStatus.REVIEWING };
    updateApplicationStatusMock.mockResolvedValue(application);
    const req = {
      auth: { userId, role: UserRole.COMPANY },
      params: { applicationId },
      body: { status: ApplicationStatus.REVIEWING },
    } as unknown as Request;
    const res = responseMock();

    await updateApplicationStatus(req, res, next);

    expect(updateApplicationStatusMock).toHaveBeenCalledWith(userId, applicationId, {
      status: ApplicationStatus.REVIEWING,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
