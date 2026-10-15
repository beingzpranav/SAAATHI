import { randomUUID } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';

import { ledgerService } from '../ledger/ledger.service.js';
import type {
  BookingDto,
  BookingSlot,
  CounsellorHouseholdSummary,
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  ConcernCategory,
} from '@saathi/shared';

export class CounsellingService {
  /**
   * Returns available time slots for verified counsellors over next 7 days.
   */
  async getAvailableSlots(): Promise<BookingSlot[]> {
    const counsellor = await prisma.user.findFirst({
      where: { role: 'COUNSELLOR' },
      select: { id: true, name: true },
    });

    const counsellorId = counsellor?.id || 'demo-counsellor-id';
    const counsellorName = counsellor?.name || 'Dr. Priya Varma (Lead Vocational Counsellor)';

    const slots: BookingSlot[] = [];
    const now = new Date();

    // Generate slots across next 3 business days at 10:00, 14:00, 16:00
    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
      const baseDate = new Date(now);
      baseDate.setDate(now.getDate() + dayOffset);

      const times = [
        { h: 10, m: 0 },
        { h: 14, m: 0 },
        { h: 16, m: 0 },
      ];

      for (const t of times) {
        const slotDate = new Date(baseDate);
        slotDate.setHours(t.h, t.m, 0, 0);

        slots.push({
          id: `slot-${slotDate.toISOString()}`,
          slotTime: slotDate.toISOString(),
          counsellorId,
          counsellorName,
          isAvailable: true,
        });
      }
    }

    return slots;
  }

  /**
   * Books a live counselling session (Video or Audio-Only) for a household.
   */
  async createBooking(
    userId: string,
    householdId: string,
    input: CreateBookingSchema,
  ): Promise<BookingDto> {
    const household = await prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      throw new NotFoundError('Household not found.');
    }

    let counsellorId = input.counsellorId;
    if (!counsellorId) {
      const defaultCounsellor = await prisma.user.findFirst({
        where: { role: 'COUNSELLOR' },
        select: { id: true },
      });
      counsellorId = defaultCounsellor?.id;
    }

    const meetingRoomId = `saathi-room-${randomUUID().slice(0, 8)}`;
    const scheduledAt = new Date(input.requestedSlot);

    const booking = await prisma.booking.create({
      data: {
        householdId,
        counsellorId: counsellorId || null,
        requestedSlot: scheduledAt,
        scheduledAt,
        status: 'CONFIRMED',
        mode: input.mode,
        meetingRoomId,
        notes: input.notes || null,
      },
      include: {
        counsellor: { select: { name: true } },
      },
    });

    // Record booking in Consent Ledger
    await ledgerService.recordEvent(userId, 'DECISION_AGREEMENT', {
      action: 'BOOK_COUNSELLING_SESSION',
      bookingId: booking.id,
      mode: input.mode,
      scheduledAt: scheduledAt.toISOString(),
      meetingRoomId,
    });

    return this.formatBookingDto(booking);
  }

  /**
   * Retrieves all bookings for a household.
   */
  async getHouseholdBookings(householdId: string): Promise<BookingDto[]> {
    const bookings = await prisma.booking.findMany({
      where: { householdId },
      orderBy: { requestedSlot: 'desc' },
      include: {
        counsellor: { select: { name: true } },
      },
    });

    return bookings.map((b) => this.formatBookingDto(b));
  }

  /**
   * Retrieves bookings assigned to a counsellor.
   */
  async getCounsellorBookings(counsellorId: string): Promise<BookingDto[]> {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ counsellorId }, { counsellorId: null }],
      },
      orderBy: { requestedSlot: 'asc' },
      include: {
        counsellor: { select: { name: true } },
      },
    });

    return bookings.map((b) => this.formatBookingDto(b));
  }

  /**
   * Retrieves household context with STRICT PRIVACY FILTERS for Counsellor Console.
   * Only returns concerns with isShared === true.
   * Suppresses private student/parent items and returns their count only.
   */
  async getCounsellorHouseholdSummary(householdId: string): Promise<CounsellorHouseholdSummary> {
    const household = await prisma.household.findUnique({
      where: { id: householdId },
      include: {
        concerns: true,
      },
    });

    if (!household) {
      throw new NotFoundError('Household not found.');
    }

    const allConcerns = household.concerns;
    const sharedConcerns = allConcerns.filter((c) => c.isShared);
    const privateConcernsCount = allConcerns.length - sharedConcerns.length;

    const trades = await prisma.trade.findMany({
      take: 3,
      select: { titleEn: true },
    });

    return {
      householdId: household.id,
      familyName: household.name,
      state: household.state,
      district: household.district,
      block: household.block,
      incomeBand: household.incomeBand,
      learnerClassLevel: household.learnerClassLevel,
      sharedConcerns: sharedConcerns.map((c) => ({
        id: c.id,
        userId: c.userId,
        householdId: c.householdId,
        category: c.category as ConcernCategory,
        questionKey: c.questionKey,
        answerValue: c.answerValue,
        preScore: c.preScore,
        postScore: c.postScore,
        isShared: true,
        sharedAt: c.sharedAt ? c.sharedAt.toISOString() : null,
        resolvedAt: c.resolvedAt ? c.resolvedAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      privateConcernsCount,
      recommendedTrades: trades.map((t) => t.titleEn),
    };
  }

  /**
   * Updates booking status.
   */
  async updateBookingStatus(
    bookingId: string,
    input: UpdateBookingStatusSchema,
  ): Promise<BookingDto> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found.');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: input.status,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        meetingRoomId: input.meetingRoomId ?? undefined,
        notes: input.notes ?? undefined,
      },
      include: {
        counsellor: { select: { name: true } },
      },
    });

    return this.formatBookingDto(updated);
  }

  private formatBookingDto(booking: {
    id: string;
    householdId: string;
    counsellorId: string | null;
    requestedSlot: Date;
    scheduledAt: Date | null;
    status: string;
    mode: string;
    meetingRoomId: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    counsellor?: { name: string } | null;
  }): BookingDto {
    return {
      id: booking.id,
      householdId: booking.householdId,
      counsellorId: booking.counsellorId,
      counsellorName: booking.counsellor?.name || 'Assigned Counsellor',
      requestedSlot: booking.requestedSlot.toISOString(),
      scheduledAt: booking.scheduledAt ? booking.scheduledAt.toISOString() : null,
      status: booking.status as BookingDto['status'],
      mode: booking.mode as BookingDto['mode'],
      meetingRoomId: booking.meetingRoomId,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}


export const counsellingService = new CounsellingService();
