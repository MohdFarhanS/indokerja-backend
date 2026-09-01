import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { validateBody } from '../../middlewares/validateRequest';
import * as authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.get('/me', authenticate, authController.me);
