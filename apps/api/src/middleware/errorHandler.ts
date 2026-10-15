import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '@saathi/shared';
import { AppError } from '../lib/errors.js';
import { HTTP_STATUS } from '../config/constants.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void => {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  if (err instanceof AppError) {
    logger.warn(
      {
        requestId,
        code: err.code,
        statusCode: err.statusCode,
        message: err.message,
        details: err.details,
      },
      'Handled application error',
    );

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
    return;
  }

  logger.error(
    {
      requestId,
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack,
    },
    'Unhandled server error',
  );

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
      requestId,
    },
  });
};
