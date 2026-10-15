import type { Request, Response, NextFunction } from 'express';
import type { JwtAccessPayload } from '@saathi/shared';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken, ACCESS_COOKIE_NAME } from '../lib/jwt.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // Check httpOnly cookies first
    if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
      token = req.cookies[ACCESS_COOKIE_NAME];
    }
    // Check Authorization: Bearer <token> fallback
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing. Please log in.');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired authentication token.'));
    }
  }
};
