import { z } from 'zod';

export const ledgerEventTypeEnum = z.enum([
  'MINOR_CONSENT',
  'SHARE_CONCERN',
  'SHARE_PREFERENCE',
  'DECISION_AGREEMENT',
]);
export type LedgerEventType = z.infer<typeof ledgerEventTypeEnum>;

export const concernCategoryEnum = z.enum([
  'CAREER_INTEREST',
  'WORK_ENVIRONMENT',
  'FINANCIAL_WORRY',
  'SOCIAL_RESPECT',
  'MIGRATION_DISTANCE',
  'TIME_HORIZON',
]);
export type ConcernCategory = z.infer<typeof concernCategoryEnum>;

export const saveConcernSchema = z.object({
  category: concernCategoryEnum,
  questionKey: z.string().min(1, 'Question key is required'),
  answerValue: z.string().min(1, 'Answer value is required'),
  preScore: z.number().int().min(1).max(5).default(3),
});
export type SaveConcernInput = z.infer<typeof saveConcernSchema>;

export const updateConcernScoreSchema = z.object({
  postScore: z.number().int().min(1).max(5),
});
export type UpdateConcernScoreInput = z.infer<typeof updateConcernScoreSchema>;

export const shareConcernSchema = z.object({
  isShared: z.boolean(),
});
export type ShareConcernInput = z.infer<typeof shareConcernSchema>;

export const setPinSchema = z.object({
  pin: z
    .string()
    .min(4, 'PIN must be at least 4 digits or pattern steps')
    .max(16, 'PIN is too long'),
});
export type SetPinInput = z.infer<typeof setPinSchema>;

export const verifyPinSchema = z.object({
  pin: z.string().min(1, 'PIN is required'),
});
export type VerifyPinInput = z.infer<typeof verifyPinSchema>;

export const recordLedgerSchema = z.object({
  eventType: ledgerEventTypeEnum,
  payload: z.record(z.unknown()),
});
export type RecordLedgerInput = z.infer<typeof recordLedgerSchema>;
