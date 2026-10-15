import { z } from 'zod';

export const createBookingSchema = z.object({
  requestedSlot: z.string({ required_error: 'Requested slot timestamp is required' }),
  mode: z.enum(['VIDEO', 'AUDIO_ONLY']).default('VIDEO'),
  counsellorId: z.string().uuid('Invalid counsellor ID').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
  scheduledAt: z.string().optional(),
  meetingRoomId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type UpdateBookingStatusSchema = z.infer<typeof updateBookingStatusSchema>;
