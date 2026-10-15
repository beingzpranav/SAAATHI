import { z } from 'zod';

export const incomeBandEnum = z.enum(['BELOW_1_5L', '1_5L_TO_3L', '3L_TO_5L', 'ABOVE_5L']);
export type IncomeBand = z.infer<typeof incomeBandEnum>;

export const learnerClassLevelEnum = z.enum([
  'CLASS_8_PASS',
  'CLASS_10_PASS',
  'CLASS_12_PASS',
  'GRADUATE',
]);
export type LearnerClassLevel = z.infer<typeof learnerClassLevelEnum>;

export const householdIntakeSchema = z.object({
  name: z.string().trim().min(2, 'Household name must be at least 2 characters').max(100),
  state: z.string().trim().min(2, 'State is required'),
  district: z.string().trim().min(2, 'District is required'),
  block: z.string().trim().min(2, 'Block is required'),
  incomeBand: incomeBandEnum,
  learnerClassLevel: learnerClassLevelEnum,
});

export type HouseholdIntakeInput = z.infer<typeof householdIntakeSchema>;

export interface HouseholdSummary {
  id: string;
  name: string;
  state: string;
  district: string;
  block: string;
  incomeBand: IncomeBand;
  learnerClassLevel: LearnerClassLevel;
  costFraming: {
    category: 'FULL_SUBSIDY' | 'PARTIAL_AID' | 'STANDARD' | 'PREMIUM_ROI';
    headlineEn: string;
    headlineHi: string;
    detailsEn: string;
    detailsHi: string;
    stipendEligible: boolean;
    scholarshipScheme: string;
  };
  highlightedNsqfLevel: number;
  primaryConcernKey: string;
  createdAt: string;
  updatedAt: string;
}
