import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@saathi/shared';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: Role '${req.user.role}' lacks permission for this resource.`,
        ),
      );
    }

    next();
  };
};
