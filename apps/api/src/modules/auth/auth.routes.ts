import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rateLimit.js';
import { registerSchema, loginSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  authController.register,
);
authRouter.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);
