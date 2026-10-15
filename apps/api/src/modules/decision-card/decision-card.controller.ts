import type { Request, Response, NextFunction } from 'express';
import type {
  ApiResponse,
  DecisionCardDto,
  SmsSummaryResponse,
  CreateDecisionCardSchema,
} from '@saathi/shared';
import { decisionCardService } from './decision-card.service.js';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError } from '../../lib/errors.js';
import { HTTP_STATUS } from '../../config/constants.js';

class DecisionCardController {
  createCard = async (
    req: Request<unknown, unknown, CreateDecisionCardSchema>,
    res: Response<ApiResponse<DecisionCardDto>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { householdId: true },
      });

      if (!user?.householdId) {
        throw new BadRequestError('User does not belong to a household.');
      }

      const card = await decisionCardService.createDecisionCard(
        userId,
        user.householdId,
        req.body,
      );

      res.status(HTTP_STATUS.CREATED).json({
        data: card,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getCard = async (
    req: Request<{ householdId: string }>,
    res: Response<ApiResponse<DecisionCardDto>>,
    next: NextFunction,
  ) => {
    try {
      const { householdId } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const card = await decisionCardService.getDecisionCard(householdId);

      res.status(HTTP_STATUS.OK).json({
        data: card,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getMyCard = async (
    req: Request,
    res: Response<ApiResponse<DecisionCardDto>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { householdId: true },
      });

      if (!user?.householdId) {
        throw new BadRequestError('User does not belong to a household.');
      }

      const card = await decisionCardService.getDecisionCard(user.householdId);

      res.status(HTTP_STATUS.OK).json({
        data: card,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getSmsSummary = async (
    req: Request<{ householdId: string }>,
    res: Response<ApiResponse<SmsSummaryResponse>>,
    next: NextFunction,
  ) => {
    try {
      const { householdId } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const summary = await decisionCardService.generateSmsSummary(householdId);

      res.status(HTTP_STATUS.OK).json({
        data: summary,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const decisionCardController = new DecisionCardController();
