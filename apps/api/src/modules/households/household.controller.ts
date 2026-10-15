import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, HouseholdSummary, HouseholdIntakeInput } from '@saathi/shared';
import { householdService } from './household.service.js';
import { HTTP_STATUS } from '../../config/constants.js';

class HouseholdController {
  saveIntake = async (
    req: Request<unknown, unknown, HouseholdIntakeInput>,
    res: Response<ApiResponse<HouseholdSummary>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const summary = await householdService.saveIntake(userId, req.body);

      res.status(HTTP_STATUS.OK).json({
        data: summary,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getIntake = async (
    req: Request,
    res: Response<ApiResponse<HouseholdSummary>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const summary = await householdService.getIntakeByUserId(userId);

      res.status(HTTP_STATUS.OK).json({
        data: summary,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const householdController = new HouseholdController();
