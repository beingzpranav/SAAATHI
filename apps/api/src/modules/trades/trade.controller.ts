import type { Request, Response, NextFunction } from 'express';
import type {
  ApiResponse,
  TradeSummary,
  TradeDetail,
  VerifiedOutcomeResponse,
  LearnerClassLevel,
} from '@saathi/shared';
import { tradeService } from './trade.service.js';
import { HTTP_STATUS } from '../../config/constants.js';

class TradeController {
  listTrades = async (
    req: Request,
    res: Response<ApiResponse<TradeSummary[]>>,
    next: NextFunction,
  ) => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const { minEducation, sector } = req.query;

      const trades = await tradeService.getAllTrades({
        minEducation: typeof minEducation === 'string' ? minEducation : undefined,
        sector: typeof sector === 'string' ? sector : undefined,
      });

      res.status(HTTP_STATUS.OK).json({
        data: trades,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getTradeByCode = async (
    req: Request<{ code: string }>,
    res: Response<ApiResponse<TradeDetail>>,
    next: NextFunction,
  ) => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const { code } = req.params;
      const { classLevel } = req.query;

      const trade = await tradeService.getTradeByCode(
        code,
        typeof classLevel === 'string' ? (classLevel as LearnerClassLevel) : undefined,
      );

      res.status(HTTP_STATUS.OK).json({
        data: trade,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getTradeOutcomes = async (
    req: Request<{ code: string }>,
    res: Response<ApiResponse<VerifiedOutcomeResponse>>,
    next: NextFunction,
  ) => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const { code } = req.params;
      const { state, district, block } = req.query;

      if (!state || typeof state !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          data: {} as unknown as VerifiedOutcomeResponse,
          meta: { requestId, timestamp: new Date().toISOString() },
        });
        return;
      }

      const outcome = await tradeService.getTradeOutcomes(code, {
        state,
        district: typeof district === 'string' ? district : (undefined as unknown as string),
        block: typeof block === 'string' ? block : undefined,
      });

      res.status(HTTP_STATUS.OK).json({
        data: outcome,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const tradeController = new TradeController();
