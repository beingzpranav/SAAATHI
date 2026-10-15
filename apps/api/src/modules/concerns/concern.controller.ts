import type { Request, Response, NextFunction } from 'express';
import type {
  ApiResponse,
  ConcernDto,
  MappingQuestion,
  SaveConcernInput,
  UpdateConcernScoreInput,
  ShareConcernInput,
} from '@saathi/shared';
import { concernService } from './concern.service.js';
import { HTTP_STATUS } from '../../config/constants.js';

class ConcernController {
  getQuestions = (
    req: Request,
    res: Response<ApiResponse<MappingQuestion[]>>,
    next: NextFunction,
  ) => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const userRole = req.user!.role === 'PARENT' ? 'PARENT' : 'LEARNER';
      const questions = concernService.getQuestionsForRole(userRole);

      res.status(HTTP_STATUS.OK).json({
        data: questions,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  saveConcern = async (
    req: Request<unknown, unknown, SaveConcernInput>,
    res: Response<ApiResponse<ConcernDto>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const concern = await concernService.saveConcern(userId, req.body);

      res.status(HTTP_STATUS.CREATED).json({
        data: concern,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getMyConcerns = async (
    req: Request,
    res: Response<ApiResponse<ConcernDto[]>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const concerns = await concernService.getMyConcerns(userId);

      res.status(HTTP_STATUS.OK).json({
        data: concerns,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  updateScore = async (
    req: Request<{ id: string }, unknown, UpdateConcernScoreInput>,
    res: Response<ApiResponse<ConcernDto>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const updated = await concernService.updatePostScore(userId, id, req.body.postScore);

      res.status(HTTP_STATUS.OK).json({
        data: updated,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  toggleShare = async (
    req: Request<{ id: string }, unknown, ShareConcernInput>,
    res: Response<ApiResponse<ConcernDto>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const updated = await concernService.toggleShare(userId, id, req.body.isShared);

      res.status(HTTP_STATUS.OK).json({
        data: updated,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getHouseholdShared = async (
    req: Request<{ householdId: string }>,
    res: Response<ApiResponse<ConcernDto[]>>,
    next: NextFunction,
  ) => {
    try {
      const { householdId } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const shared = await concernService.getHouseholdSharedConcerns(householdId);

      res.status(HTTP_STATUS.OK).json({
        data: shared,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const concernController = new ConcernController();
