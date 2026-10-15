import type { ConcernDto } from './private-window.types.js';

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type BookingMode = 'VIDEO' | 'AUDIO_ONLY';

export interface BookingSlot {
  id: string;
  slotTime: string;
  counsellorId: string;
  counsellorName: string;
  isAvailable: boolean;
}

export interface BookingDto {
  id: string;
  householdId: string;
  counsellorId?: string | null;
  counsellorName?: string | null;
  requestedSlot: string;
  scheduledAt?: string | null;
  status: BookingStatus;
  mode: BookingMode;
  meetingRoomId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CounsellorHouseholdSummary {
  householdId: string;
  familyName: string;
  state: string;
  district: string;
  block: string;
  incomeBand: string;
  learnerClassLevel: string;
  sharedConcerns: ConcernDto[];
  privateConcernsCount: number; // Privacy filtered / anonymized count
  recommendedTrades: string[];
}
