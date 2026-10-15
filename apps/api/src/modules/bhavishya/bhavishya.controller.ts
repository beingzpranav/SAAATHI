import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, BhavishyaAgendaResponse } from '@saathi/shared';
import { bhavishyaEngine } from './bhavishya.engine.js';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError } from '../../lib/errors.js';
import { HTTP_STATUS } from '../../config/constants.js';

class BhavishyaController {
  getAgenda = async (
    req: Request,
    res: Response<ApiResponse<BhavishyaAgendaResponse>>,
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
        throw new BadRequestError('User does not belong to a household. Please complete intake first.');
      }

      const agenda = await bhavishyaEngine.generateJointAgenda(user.householdId);

      res.status(HTTP_STATUS.OK).json({
        data: agenda,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const bhavishyaController = new BhavishyaController();
