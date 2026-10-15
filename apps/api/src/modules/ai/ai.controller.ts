import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, AiQueryResponse } from '@saathi/shared';
import { groundedMockAdapter } from '../../lib/llm/mock.adapter.js';
import { prisma } from '../../lib/prisma.js';
import { HTTP_STATUS } from '../../config/constants.js';

class AiController {
  query = async (
    req: Request,
    res: Response<ApiResponse<AiQueryResponse>>,
    next: NextFunction,
  ) => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const { query, language = 'en', tradeCode } = req.body;
      const userId = req.user?.userId;

      let householdContext:
        | {
            householdId: string;
            state: string;
            district: string;
            block: string;
            incomeBand: string;
            learnerClassLevel: string;
          }
        | undefined = undefined;

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { household: true },
        });

        if (user?.household) {
          householdContext = {
            householdId: user.household.id,
            state: user.household.state,
            district: user.household.district,
            block: user.household.block,
            incomeBand: user.household.incomeBand,
            learnerClassLevel: user.household.learnerClassLevel,
          };
        }
      }

      const response = await groundedMockAdapter.query({
        query,
        language,
        tradeCode,
        householdContext,
      });

      res.status(HTTP_STATUS.OK).json({
        data: response,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AiController();
