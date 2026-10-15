import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, UserProfile } from '@saathi/shared';
import { usersService, type UsersService } from './users.service.js';
import { HTTP_STATUS } from '../../config/constants.js';

class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  list = async (
    req: Request,
    res: Response<ApiResponse<{ users: UserProfile[] }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const users = await this.service.listUsers();

      res.status(HTTP_STATUS.OK).json({
        data: { users },
        meta: { requestId, timestamp: new Date().toISOString(), total: users.length },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response<ApiResponse<{ user: UserProfile }>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const user = await this.service.getUserById(req.params.id as string);

      res.status(HTTP_STATUS.OK).json({
        data: { user },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
