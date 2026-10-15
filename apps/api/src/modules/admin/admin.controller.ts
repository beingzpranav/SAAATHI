import type { Request, Response, NextFunction } from 'express';
import { adminAggregationService } from './admin.service.js';
import { HTTP_STATUS } from '../../config/constants.js';
import type { ApiResponse } from '@saathi/shared';

class AdminController {
  getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminAggregationService.getOverview();
      const payload: ApiResponse<typeof data> = {
        data,
        meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
      };
      res.status(HTTP_STATUS.OK).json(payload);
    } catch (err) {
      next(err);
    }
  };

  getConcernBreakdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminAggregationService.getConcernBreakdown();
      const payload: ApiResponse<typeof data> = {
        data,
        meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
      };
      res.status(HTTP_STATUS.OK).json(payload);
    } catch (err) {
      next(err);
    }
  };

  getHeatmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminAggregationService.getHeatmap();
      const payload: ApiResponse<typeof data> = {
        data,
        meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
      };
      res.status(HTTP_STATUS.OK).json(payload);
    } catch (err) {
      next(err);
    }
  };

  getDecisionFunnel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminAggregationService.getDecisionFunnel();
      const payload: ApiResponse<typeof data> = {
        data,
        meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
      };
      res.status(HTTP_STATUS.OK).json(payload);
    } catch (err) {
      next(err);
    }
  };

  getEscalationTracker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await adminAggregationService.getEscalationTracker();
      const payload: ApiResponse<typeof data> = {
        data,
        meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
      };
      res.status(HTTP_STATUS.OK).json(payload);
    } catch (err) {
      next(err);
    }
  };

  exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const type = (req.query['type'] as string) || 'concerns';
      const data = await adminAggregationService.exportCsv(type);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${data.filename}"`);
      res.setHeader('X-Row-Count', data.rowCount.toString());
      res.setHeader('X-Suppressed-Row-Count', data.suppressedRowCount.toString());
      res.status(HTTP_STATUS.OK).send(data.csvContent);
    } catch (err) {
      next(err);
    }
  };
}

export const adminController = new AdminController();
