export interface DecisionCardDto {
  id: string;
  householdId: string;
  chosenTradeId: string;
  chosenTradeCode: string;
  chosenTradeTitleEn: string;
  chosenTradeTitleHi: string;
  nsqfLevel: number;
  chosenProviderId: string;
  chosenProviderName: string;
  chosenProviderType: string;
  chosenProviderAddress: string;
  chosenProviderContact?: string | null;
  agreedActions: string[];
  openConcerns: string[];
  counsellorNotes?: string | null;
  counsellorContact?: string | null;
  verificationHash: string;
  feeWaiverEligible: boolean;
  napsStipendMonthly: number;
  createdAt: string;
}

export interface SmsSummaryResponse {
  smsTextEn: string;
  smsTextHi: string;
  recipientPhone: string;
  verificationCode: string;
  verificationUrl: string;
}

export interface CheckpointEvaluationItem {
  concernId: string;
  postScore: number;
  isResolved: boolean;
  resolutionNotes?: string;
}

export interface CheckpointEvaluationRequest {
  evaluations: CheckpointEvaluationItem[];
}

export interface CheckpointEvaluationResponse {
  householdId: string;
  allResolved: boolean;
  resolvedCount: number;
  unresolvedCount: number;
  readinessScore: number;
  readyForDecisionCard: boolean;
  recommendedActions: string[];
}
