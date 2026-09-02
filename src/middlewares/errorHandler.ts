import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';

function isJsonParseError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400 &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  );
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (isJsonParseError(err)) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    return;
  }

  res.status(500).json({ success: false, message: 'Internal Server Error' });
}
