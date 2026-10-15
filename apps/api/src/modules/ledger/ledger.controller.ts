import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, LedgerEntryDto, LedgerVerifyResponse, RecordLedgerInput } from '@saathi/shared';
import { ledgerService } from './ledger.service.js';
import { HTTP_STATUS } from '../../config/constants.js';

class LedgerController {
  recordEvent = async (
    req: Request<unknown, unknown, RecordLedgerInput>,
    res: Response<ApiResponse<LedgerEntryDto>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const entry = await ledgerService.recordEvent(
        userId,
        req.body.eventType,
        req.body.payload,
      );

      res.status(HTTP_STATUS.CREATED).json({
        data: entry,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getHouseholdLedger = async (
    req: Request<{ householdId: string }>,
    res: Response<ApiResponse<LedgerEntryDto[]>>,
    next: NextFunction,
  ) => {
    try {
      const { householdId } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const entries = await ledgerService.getHouseholdLedger(householdId);

      res.status(HTTP_STATUS.OK).json({
        data: entries,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  verifyChain = async (
    req: Request<{ householdId: string }>,
    res: Response<ApiResponse<LedgerVerifyResponse>>,
    next: NextFunction,
  ) => {
    try {
      const { householdId } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const result = await ledgerService.verifyChain(householdId);

      res.status(HTTP_STATUS.OK).json({
        data: result,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const ledgerController = new LedgerController();
