import type { ApiErrorDetail } from '@saathi/shared';
import { HTTP_STATUS } from '../config/constants.js';

export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = HTTP_STATUS.UNAUTHORIZED;
  public readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  public readonly statusCode = HTTP_STATUS.FORBIDDEN;
  public readonly code = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  public readonly statusCode = HTTP_STATUS.NOT_FOUND;
  public readonly code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  public readonly statusCode = HTTP_STATUS.CONFLICT;
  public readonly code = 'CONFLICT';
}

export class BadRequestError extends AppError {
  public readonly statusCode = HTTP_STATUS.BAD_REQUEST;
  public readonly code = 'BAD_REQUEST';
}

export class ValidationError extends AppError {
  public readonly statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
  public readonly code = 'VALIDATION_ERROR';

  constructor(message = 'Validation failed', details?: ApiErrorDetail[]) {
    super(message, details);
  }
}
