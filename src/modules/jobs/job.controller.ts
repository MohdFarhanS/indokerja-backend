import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/appError';
import { CreateJobInput } from './job.schema';
import * as jobService from './job.service';

export async function listJobs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobs = await jobService.listJobs();
    res.status(200).json({ success: true, data: { jobs } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobId } = req.params as { jobId: string };
    const job = await jobService.getJob(jobId);
    res.status(200).json({ success: true, data: { job } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Authentication required');
    const job = await jobService.createJob(req.auth.userId, req.body as CreateJobInput);
    res.status(201).json({ success: true, message: 'Job created successfully', data: { job } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function listCompanyJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Authentication required');
    const jobs = await jobService.listCompanyJobs(req.auth.userId);
    res.status(200).json({ success: true, data: { jobs } });
  } catch (error: unknown) {
    next(error);
  }
}
