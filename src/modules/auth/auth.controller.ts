import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/appError';
import { LoginInput, RegisterInput } from './auth.schema';
import * as authService from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.register(req.body as RegisterInput);
    res.status(201).json({ success: true, message: 'Registration successful', data: { user } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await authService.login(req.body as LoginInput);
    res.status(200).json({ success: true, message: 'Login successful', data });
  } catch (error: unknown) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Authentication required');
    const user = await authService.getCurrentUser(req.auth.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (error: unknown) {
    next(error);
  }
}
