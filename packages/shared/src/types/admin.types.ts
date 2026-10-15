// ─── Admin Dashboard DTOs ─────────────────────────────────────────────────────

/**
 * K-anonymity suppression constant.
 * Any metric bucket with fewer than K_ANON_THRESHOLD respondents is
 * suppressed and replaced with null to protect individual privacy.
 */
export const K_ANON_THRESHOLD = 10;

export interface DashboardOverviewDto {
  totalHouseholds: number;
  totalLearners: number;
  totalParents: number;
  totalJointSessions: number;
  totalDecisionCards: number;
  totalCounsellorBookings: number;
  pendingEscalations: number;
  averageReadinessScore: number | null; // null if suppressed
  decisionCardCompletionRate: number; // 0–100 percent
  reportGeneratedAt: string;
}

export interface ConcernBreakdownItem {
  category: string;
  count: number | null;        // null = k-anon suppressed
  preScoreMedian: number | null;
  postScoreMedian: number | null;
  sentimentShift: number | null; // postMedian - preMedian; negative = improvement
  resolutionRate: number | null; // percent resolved
  suppressed: boolean;
}

export interface ConcernBreakdownDto {
  items: ConcernBreakdownItem[];
  totalConcerns: number;
  suppressedBuckets: number;
  reportDate: string;
}

export interface HeatmapCell {
  state: string;
  district: string;
  householdCount: number | null; // null = suppressed
  decisionCardCount: number | null;
  averageReadiness: number | null;
  suppressed: boolean;
}

export interface HeatmapDto {
  cells: HeatmapCell[];
  suppressedCells: number;
  totalCells: number;
  reportDate: string;
}

export interface DecisionFunnelStage {
  stage: string;
  labelEn: string;
  labelHi: string;
  count: number;
  dropoffFromPrevious: number | null; // percent drop from previous stage
}

export interface DecisionFunnelDto {
  stages: DecisionFunnelStage[];
  overallCompletionRate: number;
  reportDate: string;
}

export interface EscalationItem {
  bookingId: string;
  householdId: string;
  status: string;
  mode: string;
  scheduledAt: string | null;
  counsellorName: string | null;
  district: string;
  state: string;
  daysWaiting: number;
}

export interface EscalationTrackerDto {
  pending: EscalationItem[];
  confirmed: EscalationItem[];
  completed: EscalationItem[];
  cancelled: EscalationItem[];
  totalEscalations: number;
  reportDate: string;
}

export interface AdminCsvExportDto {
  csvContent: string;
  filename: string;
  rowCount: number;
  suppressedRowCount: number;
  generatedAt: string;
}
