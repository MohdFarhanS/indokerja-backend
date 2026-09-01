import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(UserRole),
  exp: z.number().int().positive(),
});

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/);

  if (!match) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const verified = jwt.verify(match[1], env.JWT_SECRET, { algorithms: ['HS256'] });
    const payload = tokenPayloadSchema.safeParse(verified);

    if (!payload.success) {
      throw new Error('Invalid token payload');
    }

    req.auth = { userId: payload.data.sub, role: payload.data.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }
}
