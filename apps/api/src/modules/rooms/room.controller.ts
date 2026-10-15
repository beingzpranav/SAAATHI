import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, PinVerifyResponse, SetPinInput, VerifyPinInput } from '@saathi/shared';
import { roomService } from './room.service.js';
import { HTTP_STATUS } from '../../config/constants.js';

class RoomController {
  setPin = async (
    req: Request<unknown, unknown, SetPinInput>,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const result = await roomService.setPin(userId, req.body.pin);

      res.status(HTTP_STATUS.OK).json({
        data: { message: result.message },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  verifyPin = async (
    req: Request<unknown, unknown, VerifyPinInput>,
    res: Response<ApiResponse<PinVerifyResponse>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const result = await roomService.verifyPin(userId, req.body.pin);

      const status = result.unlocked
        ? HTTP_STATUS.OK
        : result.lockedUntil
          ? 423 // Locked
          : HTTP_STATUS.UNAUTHORIZED;

      res.status(status).json({
        data: result,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getStatus = async (
    req: Request,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const status = await roomService.getRoomStatus(userId);

      res.status(HTTP_STATUS.OK).json({
        data: status,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const roomController = new RoomController();
