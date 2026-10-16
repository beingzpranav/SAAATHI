import { prisma } from '../../lib/prisma.js';
import {
  K_ANON_THRESHOLD,
  type DashboardOverviewDto,
  type ConcernBreakdownDto,
  type ConcernBreakdownItem,
  type HeatmapDto,
  type HeatmapCell,
  type DecisionFunnelDto,
  type EscalationTrackerDto,
  type EscalationItem,
  type AdminCsvExportDto,
} from '@saathi/shared';

/**
 * K-anonymity suppression helper.
 * Returns null for any numeric count below the threshold, masking the true value.
 * This ensures no individual respondent can be identified from aggregate data.
 */
export function kAnon<T extends number>(value: T, threshold = K_ANON_THRESHOLD): T | null {
  return value < threshold ? null : value;
}

/**
 * Compute the median of a number array. Returns null for empty arrays.
 */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? (sorted[mid] ?? null)
    : ((sorted[mid - 1]! + sorted[mid]!) / 2);
}

class AdminAggregationService {
  // ─── Overview ─────────────────────────────────────────────────────────────

  async getOverview(): Promise<DashboardOverviewDto> {
    const [
      totalHouseholds,
      totalLearners,
      totalParents,
      totalDecisionCards,
      totalBookings,
      pendingBookings,
      roomCount,
    ] = await Promise.all([
      prisma.household.count(),
      prisma.user.count({ where: { role: 'LEARNER' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.decisionCard.count().catch(() => 0),
      prisma.booking.count().catch(() => 0),
      prisma.booking.count({ where: { status: 'REQUESTED' } }).catch(() => 0),
      prisma.room.count().catch(() => 0),
    ]);

    // Compute average readiness from concerns pre/post scores
    const concerns = await prisma.concern.findMany({
      where: { postScore: { not: undefined } },
      select: { preScore: true, postScore: true },
    }).catch(() => []);

    let averageReadiness: number | null = null;
    if (concerns.length >= K_ANON_THRESHOLD) {
      const readinessValues = concerns.map((c) => {
        const pre = c.preScore ?? 5;
        const post = c.postScore ?? pre;
        // Readiness: how much the score improved (5=max anxiety, 1=resolved)
        return Math.round(((pre - post) / (pre - 1 || 1)) * 100);
      });
      const sum = readinessValues.reduce((a, b) => a + b, 0);
      averageReadiness = Math.round(sum / readinessValues.length);
    }

    const completionRate =
      totalHouseholds > 0 ? Math.round((totalDecisionCards / totalHouseholds) * 100) : 0;

    return {
      totalHouseholds,
      totalLearners,
      totalParents,
      totalJointSessions: roomCount,
      totalDecisionCards,
      totalCounsellorBookings: totalBookings,
      pendingEscalations: pendingBookings,
      averageReadinessScore: averageReadiness,
      decisionCardCompletionRate: completionRate,
      reportGeneratedAt: new Date().toISOString(),
    };
  }

  // ─── Concern Breakdown with Sentiment Shifts ──────────────────────────────

  async getConcernBreakdown(): Promise<ConcernBreakdownDto> {
    const concerns = await prisma.concern.findMany({
      select: {
        category: true,
        preScore: true,
        postScore: true,
        resolvedAt: true,
      },
    }).catch(() => []);

    // Group by category
    const byCategory = new Map<string, { pre: number[]; post: number[]; resolved: number }>();
    for (const c of concerns) {
      const cat = c.category;
      if (!byCategory.has(cat)) byCategory.set(cat, { pre: [], post: [], resolved: 0 });
      const bucket = byCategory.get(cat)!;
      if (c.preScore != null) bucket.pre.push(c.preScore);
      if (c.postScore != null) bucket.post.push(c.postScore);
      if (c.resolvedAt != null) bucket.resolved += 1;
    }

    let suppressedBuckets = 0;
    const items: ConcernBreakdownItem[] = [];

    for (const [category, bucket] of byCategory.entries()) {
      const count = bucket.pre.length;
      const suppressed = count < K_ANON_THRESHOLD;
      if (suppressed) suppressedBuckets++;

      const preMedian = suppressed ? null : median(bucket.pre);
      const postMedian = suppressed ? null : median(bucket.post);
      const sentimentShift =
        preMedian != null && postMedian != null ? postMedian - preMedian : null;
      const resolutionRate = suppressed
        ? null
        : Math.round((bucket.resolved / count) * 100);

      items.push({
        category,
        count: kAnon(count),
        preScoreMedian: preMedian,
        postScoreMedian: postMedian,
        sentimentShift,
        resolutionRate,
        suppressed,
      });
    }

    // Sort by count descending (nulls last)
    items.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

    return {
      items,
      totalConcerns: concerns.length,
      suppressedBuckets,
      reportDate: new Date().toISOString(),
    };
  }

  // ─── Geographic Heatmap ───────────────────────────────────────────────────

  async getHeatmap(): Promise<HeatmapDto> {
    const households = await prisma.household.findMany({
      select: { state: true, district: true, id: true },
    }).catch(() => []);

    const decisionCards = await prisma.decisionCard.findMany({
      include: { household: { select: { state: true, district: true } } },
    }).catch(() => []);

    // Group households by state+district
    type GeoKey = string;
    const householdMap = new Map<GeoKey, string[]>();
    for (const h of households) {
      const key = `${h.state}|${h.district}`;
      if (!householdMap.has(key)) householdMap.set(key, []);
      householdMap.get(key)!.push(h.id);
    }

    // Count decision cards by state+district
    const dcMap = new Map<GeoKey, number>();
    for (const dc of decisionCards) {
      const key = `${dc.household?.state ?? 'Unknown'}|${dc.household?.district ?? 'Unknown'}`;
      dcMap.set(key, (dcMap.get(key) ?? 0) + 1);
    }

    let suppressedCells = 0;
    const cells: HeatmapCell[] = [];

    for (const [key, hIds] of householdMap.entries()) {
      const [state, district] = key.split('|') as [string, string];
      const count = hIds.length;
      const suppressed = count < K_ANON_THRESHOLD;
      if (suppressed) suppressedCells++;

      cells.push({
        state,
        district,
        householdCount: kAnon(count),
        decisionCardCount: suppressed ? null : kAnon(dcMap.get(key) ?? 0),
        averageReadiness: null, // Computed separately in richer implementation
        suppressed,
      });
    }

    return {
      cells,
      suppressedCells,
      totalCells: cells.length,
      reportDate: new Date().toISOString(),
    };
  }

  // ─── Decision Funnel ──────────────────────────────────────────────────────

  async getDecisionFunnel(): Promise<DecisionFunnelDto> {
    const [households, rooms, bookings, decisionCards] = await Promise.all([
      prisma.household.count(),
      prisma.room.count().catch(() => 0),
      prisma.booking.count().catch(() => 0),
      prisma.decisionCard.count().catch(() => 0),
    ]);

    const stages = [
      {
        stage: 'HOUSEHOLD_INTAKE',
        labelEn: 'Household Intake Completed',
        labelHi: 'पारिवारिक जानकारी दर्ज',
        count: households,
      },
      {
        stage: 'JOINT_SESSION',
        labelEn: 'Joint Session Started',
        labelHi: 'संयुक्त सत्र शुरू',
        count: rooms,
      },
      {
        stage: 'COUNSELLOR_ESCALATION',
        labelEn: 'Counsellor Booking Made',
        labelHi: 'परामर्शदाता नियुक्ति',
        count: bookings,
      },
      {
        stage: 'DECISION_CARD',
        labelEn: 'Family Decision Card Issued',
        labelHi: 'परिवार निर्णय पत्र जारी',
        count: decisionCards,
      },
    ];

    const stagesWithDropoff = stages.map((s, i) => ({
      ...s,
      dropoffFromPrevious:
        i === 0 || stages[i - 1]!.count === 0
          ? null
          : Math.round((1 - s.count / stages[i - 1]!.count) * 100),
    }));

    const overallCompletionRate =
      households > 0 ? Math.round((decisionCards / households) * 100) : 0;

    return {
      stages: stagesWithDropoff,
      overallCompletionRate,
      reportDate: new Date().toISOString(),
    };
  }

  // ─── Escalation Tracker ───────────────────────────────────────────────────

  async getEscalationTracker(): Promise<EscalationTrackerDto> {
    const bookings = await prisma.booking.findMany({
      include: {
        household: { select: { state: true, district: true } },
        counsellor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    const now = Date.now();

    const toItem = (b: typeof bookings[0]): EscalationItem => ({
      bookingId: b.id,
      householdId: b.householdId,
      status: b.status,
      mode: b.mode,
      scheduledAt: b.scheduledAt?.toISOString() ?? null,
      counsellorName: b.counsellor?.name ?? null,
      district: b.household?.district ?? 'Unknown',
      state: b.household?.state ?? 'Unknown',
      daysWaiting: Math.floor((now - new Date(b.createdAt).getTime()) / 86400000),
    });

    const pending = bookings.filter((b) => b.status === 'REQUESTED').map(toItem);
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').map(toItem);
    const completed = bookings.filter((b) => b.status === 'COMPLETED').map(toItem);
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').map(toItem);

    return {
      pending,
      confirmed,
      completed,
      cancelled,
      totalEscalations: bookings.length,
      reportDate: new Date().toISOString(),
    };
  }

  // ─── CSV Export ───────────────────────────────────────────────────────────

  async exportCsv(type: string): Promise<AdminCsvExportDto> {
    const now = new Date().toISOString();
    let csvContent = '';
    let rowCount = 0;
    let suppressedRowCount = 0;

    if (type === 'concerns') {
      const breakdown = await this.getConcernBreakdown();
      const header = 'Category,Count,PreScoreMedian,PostScoreMedian,SentimentShift,ResolutionRate%,Suppressed\n';
      const rows = breakdown.items.map((item) => {
        if (item.suppressed) {
          suppressedRowCount++;
          return `${item.category},SUPPRESSED,SUPPRESSED,SUPPRESSED,SUPPRESSED,SUPPRESSED,true`;
        }
        rowCount++;
        return [
          item.category,
          item.count ?? '',
          item.preScoreMedian ?? '',
          item.postScoreMedian ?? '',
          item.sentimentShift ?? '',
          item.resolutionRate ?? '',
          'false',
        ].join(',');
      });
      csvContent = header + rows.join('\n');
    } else if (type === 'decisions') {
      const funnel = await this.getDecisionFunnel();
      const header = 'Stage,LabelEn,Count,DropoffPercent\n';
      const rows = funnel.stages.map((s) => {
        rowCount++;
        return `${s.stage},"${s.labelEn}",${s.count},${s.dropoffFromPrevious ?? 'N/A'}`;
      });
      csvContent = header + rows.join('\n');
    } else if (type === 'escalations') {
      const tracker = await this.getEscalationTracker();
      const all = [...tracker.pending, ...tracker.confirmed, ...tracker.completed, ...tracker.cancelled];
      const header = 'BookingId,HouseholdId,Status,Mode,District,State,DaysWaiting\n';
      const rows = all.map((e) => {
        rowCount++;
        return `${e.bookingId},${e.householdId},${e.status},${e.mode},${e.district},${e.state},${e.daysWaiting}`;
      });
      csvContent = header + rows.join('\n');
    } else {
      // households
      const heatmap = await this.getHeatmap();
      const header = 'State,District,HouseholdCount,DecisionCardCount,Suppressed\n';
      const rows = heatmap.cells.map((c) => {
        if (c.suppressed) {
          suppressedRowCount++;
          return `${c.state},${c.district},SUPPRESSED,SUPPRESSED,true`;
        }
        rowCount++;
        return `${c.state},${c.district},${c.householdCount ?? ''},${c.decisionCardCount ?? ''},false`;
      });
      csvContent = header + rows.join('\n');
    }

    return {
      csvContent,
      filename: `saathi-${type}-export-${now.slice(0, 10)}.csv`,
      rowCount,
      suppressedRowCount,
      generatedAt: now,
    };
  }
}

export const adminAggregationService = new AdminAggregationService();
