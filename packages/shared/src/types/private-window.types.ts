import type { LedgerEventType, ConcernCategory } from '../schemas/private-window.schema.js';

export interface MappingQuestionOption {
  value: string;
  labelEn: string;
  labelHi: string;
  initialScore: number;
}

export interface MappingQuestion {
  id: string;
  category: ConcernCategory;
  targetRole: 'LEARNER' | 'PARENT';
  questionEn: string;
  questionHi: string;
  hintEn?: string;
  hintHi?: string;
  options: MappingQuestionOption[];
}

export interface ConcernDto {
  id: string;
  userId: string;
  householdId: string;
  category: ConcernCategory;
  questionKey: string;
  answerValue: string;
  preScore: number;
  postScore: number | null;
  isShared: boolean;
  sharedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PinVerifyResponse {
  unlocked: boolean;
  remainingAttempts?: number;
  lockedUntil?: string | null;
  message?: string;
}

export interface LedgerEntryDto {
  id: string;
  householdId: string;
  userId: string;
  eventType: LedgerEventType;
  payload: string | null;
  payloadHash: string;
  previousHash: string;
  blockHash: string;
  sequenceNumber: number;
  createdAt: string;
}

export interface LedgerVerifyResponse {
  isValid: boolean;
  unbrokenChainLength: number;
  brokenAtId: string | null;
  timestamp: string;
}

export interface BhavishyaAgendaItem {
  id: string;
  category: ConcernCategory;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  titleEn: string;
  titleHi: string;
  learnerPerspectiveEn: string;
  learnerPerspectiveHi: string;
  parentPerspectiveEn: string;
  parentPerspectiveHi: string;
  verifiedResolutionEn: string;
  verifiedResolutionHi: string;
  recommendedActions: string[];
}

export interface BhavishyaAgendaResponse {
  householdId: string;
  sharedConcernsCount: number;
  unsharedConcernsCount: number;
  readinessScore: number; // 0-100%
  agendaItems: BhavishyaAgendaItem[];
}
