import type { ConfidenceLabel, GeographicLevel } from './trade.types.js';

export interface GroundedCitation {
  id: string;
  sourceType: 'TRADE' | 'OUTCOME_RECORD' | 'PROVIDER' | 'NSQF_LADDER' | 'GOVT_SCHEME';
  title: string;
  titleHi?: string;
  verifiedStatistic?: string;
  verifiedStatisticHi?: string;
  confidence: ConfidenceLabel;
  geographicLevel?: GeographicLevel;
  verificationSource?: string;
}

export interface RelatedTradeBrief {
  code: string;
  titleEn: string;
  titleHi: string;
  nsqfLevel: number;
  durationMonths: number;
}

export interface SuggestedQuestion {
  en: string;
  hi: string;
}

export interface AiQueryRequest {
  query: string;
  language?: 'en' | 'hi';
  tradeCode?: string;
  householdId?: string;
}

export interface AiQueryResponse {
  query: string;
  answerEn: string;
  answerHi: string;
  isRefusal: boolean;
  refusalReasonEn?: string;
  refusalReasonHi?: string;
  citations: GroundedCitation[];
  confidence: ConfidenceLabel;
  relatedTrades: RelatedTradeBrief[];
  suggestedQuestions: SuggestedQuestion[];
}

export interface LlmQueryInput {
  query: string;
  language?: 'en' | 'hi';
  householdContext?: {
    householdId: string;
    state: string;
    district: string;
    block: string;
    incomeBand: string;
    learnerClassLevel: string;
  };
  tradeCode?: string;
}
