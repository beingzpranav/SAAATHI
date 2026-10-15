export type ConfidenceLabel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type GeographicLevel = 'BLOCK' | 'DISTRICT' | 'STATE' | 'NATIONAL';

export type ProviderType =
  'GOVERNMENT_ITI' | 'PRIVATE_ITI' | 'POLYTECHNIC' | 'VOCATIONAL_TRAINING_CENTRE';

export interface NsqfLadderStep {
  level: number;
  titleEn: string;
  titleHi: string;
  roleEn: string;
  roleHi: string;
  minExperienceEn: string;
  minExperienceHi: string;
  medianSalaryMonthly: number;
  isStartingStep: boolean;
}

export interface TradeSummary {
  id: string;
  code: string;
  titleEn: string;
  titleHi: string;
  sector: string;
  descriptionEn: string;
  descriptionHi: string;
  nsqfLevel: number;
  durationMonths: number;
  minEducation: string;
  entryStep: string;
}

export interface TradeDetail extends TradeSummary {
  ladderSteps: NsqfLadderStep[];
  coursesCount: number;
  approvedProvidersCount: number;
}

export interface ProviderSummary {
  id: string;
  name: string;
  type: ProviderType;
  state: string;
  district: string;
  block: string;
  address: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  affiliation: string;
}

export interface CourseSummary {
  id: string;
  tradeId: string;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  titleEn: string;
  titleHi: string;
  feeInr: number;
  stipendMonthlyInr: number;
  durationMonths: number;
  videoUrl1: string;
  videoUrl2: string;
}

export interface OutcomeRecordDto {
  id: string;
  tradeId: string;
  providerId?: string | null;
  geographicLevel: GeographicLevel;
  state: string;
  district: string;
  block?: string | null;
  verifiedGraduatesCount: number;
  medianSalaryMonthly: number;
  salaryRangeMin: number;
  salaryRangeMax: number;
  placementRatePercent: number;
  sampleSize: number;
  sources: string[];
  dataDate: string;
  confidenceLabel: ConfidenceLabel;
}

export interface VerifiedOutcomeResponse {
  tradeId: string;
  tradeCode: string;
  tradeTitleEn: string;
  tradeTitleHi: string;
  record: OutcomeRecordDto | null;
  requestedLevel: GeographicLevel;
  actualLevel: GeographicLevel | null;
  fallbackApplied: boolean;
  fallbackReason?: string | null;
  confidenceExplanationEn: string;
  confidenceExplanationHi: string;
}

export interface LocationState {
  code: string;
  name: string;
}

export interface LocationDistrict {
  code: string;
  name: string;
  stateCode: string;
}

export interface LocationBlock {
  code: string;
  name: string;
  districtCode: string;
}
