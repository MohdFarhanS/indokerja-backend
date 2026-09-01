import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/appError';
import { UpdateApplicationStatusInput } from './application.schema';
import * as applicationService from './application.service';

export async function applyToJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Authentication required');
    const { jobId } = req.params as { jobId: string };
    const application = await applicationService.applyToJob(req.auth.userId, jobId);
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function listMyApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Authentication required');
    const applications = await applicationService.listMyApplications(req.auth.userId);
    res.status(200).json({ success: true, data: { applications } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function listJobApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Authentication required');
    const { jobId } = req.params as { jobId: string };
    const applications = await applicationService.listJobApplications(req.auth.userId, jobId);
    res.status(200).json({ success: true, data: { applications } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateApplicationStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Authentication required');
    const { applicationId } = req.params as { applicationId: string };
    const application = await applicationService.updateApplicationStatus(
      req.auth.userId,
      applicationId,
      req.body as UpdateApplicationStatusInput,
    );
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: { application },
    });
  } catch (error: unknown) {
    next(error);
  }
}
