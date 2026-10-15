import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, UserProfile } from '@saathi/shared';
import { authService, type AuthService } from './auth.service.js';
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, getCookieOptions } from '../../lib/jwt.js';
import { HTTP_STATUS } from '../../config/constants.js';
import { UnauthorizedError } from '../../lib/errors.js';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  register = async (
    req: Request,
    res: Response<ApiResponse<{ user: UserProfile }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      const requestId = req.headers['x-request-id'] as string;

      res.cookie(ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(FIFTEEN_MINUTES_MS));
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(SEVEN_DAYS_MS));

      res.status(HTTP_STATUS.CREATED).json({
        data: { user: result.user },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response<ApiResponse<{ user: UserProfile }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      const requestId = req.headers['x-request-id'] as string;

      res.cookie(ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(FIFTEEN_MINUTES_MS));
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(SEVEN_DAYS_MS));

      res.status(HTTP_STATUS.OK).json({
        data: { user: result.user },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (
    req: Request,
    res: Response<ApiResponse<{ user: UserProfile }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME];
      if (!token) {
        throw new UnauthorizedError('Refresh token missing from session cookies.');
      }

      const result = await this.service.refresh(token);
      const requestId = req.headers['x-request-id'] as string;

      res.cookie(ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(FIFTEEN_MINUTES_MS));
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(SEVEN_DAYS_MS));

      res.status(HTTP_STATUS.OK).json({
        data: { user: result.user },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: Request,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      res.clearCookie(ACCESS_COOKIE_NAME, getCookieOptions());
      res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions());

      res.status(HTTP_STATUS.OK).json({
        data: { message: 'Logged out successfully' },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (
    req: Request,
    res: Response<ApiResponse<{ user: UserProfile }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }

      const user = await this.service.getCurrentUser(req.user.userId);
      const requestId = req.headers['x-request-id'] as string;

      res.status(HTTP_STATUS.OK).json({
        data: { user },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
