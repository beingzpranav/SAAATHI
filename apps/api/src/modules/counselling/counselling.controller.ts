import type { Request, Response, NextFunction } from 'express';
import type {
  ApiResponse,
  BookingDto,
  BookingSlot,
  CounsellorHouseholdSummary,
  CreateBookingSchema,
  UpdateBookingStatusSchema,
} from '@saathi/shared';
import { counsellingService } from './counselling.service.js';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError } from '../../lib/errors.js';
import { HTTP_STATUS } from '../../config/constants.js';

class CounsellingController {
  getAvailableSlots = async (
    req: Request,
    res: Response<ApiResponse<BookingSlot[]>>,
    next: NextFunction,
  ) => {
    try {
      const requestId = req.headers['x-request-id'] as string;
      const slots = await counsellingService.getAvailableSlots();

      res.status(HTTP_STATUS.OK).json({
        data: slots,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  createBooking = async (
    req: Request<unknown, unknown, CreateBookingSchema>,
    res: Response<ApiResponse<BookingDto>>,
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

      const booking = await counsellingService.createBooking(
        userId,
        user.householdId,
        req.body,
      );

      res.status(HTTP_STATUS.CREATED).json({
        data: booking,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getMyBookings = async (
    req: Request,
    res: Response<ApiResponse<BookingDto[]>>,
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

      const bookings = await counsellingService.getHouseholdBookings(user.householdId);

      res.status(HTTP_STATUS.OK).json({
        data: bookings,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getCounsellorBookings = async (
    req: Request,
    res: Response<ApiResponse<BookingDto[]>>,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const requestId = req.headers['x-request-id'] as string;
      const bookings = await counsellingService.getCounsellorBookings(userId);

      res.status(HTTP_STATUS.OK).json({
        data: bookings,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  getCounsellorHouseholdSummary = async (
    req: Request<{ householdId: string }>,
    res: Response<ApiResponse<CounsellorHouseholdSummary>>,
    next: NextFunction,
  ) => {
    try {
      const { householdId } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const summary = await counsellingService.getCounsellorHouseholdSummary(householdId);

      res.status(HTTP_STATUS.OK).json({
        data: summary,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: Request<{ id: string }, unknown, UpdateBookingStatusSchema>,
    res: Response<ApiResponse<BookingDto>>,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const requestId = req.headers['x-request-id'] as string;
      const updated = await counsellingService.updateBookingStatus(id, req.body);

      res.status(HTTP_STATUS.OK).json({
        data: updated,
        meta: { requestId, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const counsellingController = new CounsellingController();
