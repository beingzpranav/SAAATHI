import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '@saathi/shared';
import { HTTP_STATUS } from '../config/constants.js';

export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response<ApiErrorResponse>) => {
    const requestId = req.headers['x-request-id'] as string;
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP, please try again after 15 minutes.',
        requestId,
      },
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // limit sensitive auth attempts to 30 per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response<ApiErrorResponse>) => {
    const requestId = req.headers['x-request-id'] as string;
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many login or registration attempts. Please try again after 15 minutes.',
        requestId,
      },
    });
  },
});
