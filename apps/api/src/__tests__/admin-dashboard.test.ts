import { describe, it, expect, vi, beforeEach } from 'vitest';
import { kAnon, median, adminAggregationService } from '../modules/admin/admin.service.js';
import { K_ANON_THRESHOLD } from '@saathi/shared';

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    household: {
      count: vi.fn().mockResolvedValue(25),
      findMany: vi.fn().mockResolvedValue([
        { id: 'h1', state: 'Uttar Pradesh', district: 'Varanasi' },
        { id: 'h2', state: 'Uttar Pradesh', district: 'Varanasi' },
        { id: 'h3', state: 'Uttar Pradesh', district: 'Mirzapur' },
      ]),
    },
    user: {
      count: vi.fn().mockImplementation(({ where }: { where: { role: string } }) => {
        if (where?.role === 'LEARNER') return Promise.resolve(15);
        if (where?.role === 'PARENT') return Promise.resolve(12);
        return Promise.resolve(0);
      }),
    },
    decisionCard: {
      count: vi.fn().mockResolvedValue(8),
      findMany: vi.fn().mockResolvedValue([]),
    },
    booking: {
      count: vi.fn().mockImplementation(({ where }: { where?: { status?: string } } = {}) => {
        if (where?.status === 'REQUESTED') return Promise.resolve(3);
        return Promise.resolve(12);
      }),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'b1',
          householdId: 'h1',
          status: 'REQUESTED',
          mode: 'VIDEO',
          scheduledAt: null,
          createdAt: new Date(Date.now() - 2 * 86400000),
          household: { state: 'Uttar Pradesh', district: 'Varanasi' },
          counsellor: { name: 'Dr. Priya Varma' },
        },
        {
          id: 'b2',
          householdId: 'h2',
          status: 'CONFIRMED',
          mode: 'AUDIO_ONLY',
          scheduledAt: new Date(),
          createdAt: new Date(Date.now() - 86400000),
          household: { state: 'Uttar Pradesh', district: 'Mirzapur' },
          counsellor: null,
        },
      ]),
    },
    concern: {
      findMany: vi.fn().mockResolvedValue([
        // 12 concerns in FINANCIAL_WORRY (>= threshold → visible)
        ...Array.from({ length: 12 }, (_, i) => ({
          id: `c-fin-${i}`,
          category: 'FINANCIAL_WORRY',
          preScore: 4,
          postScore: 2,
          resolvedAt: i < 8 ? new Date() : null,
        })),
        // 5 concerns in CAREER_INTEREST (< threshold → suppressed)
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `c-car-${i}`,
          category: 'CAREER_INTEREST',
          preScore: 3,
          postScore: null,
          resolvedAt: null,
        })),
      ]),
    },
    room: {
      count: vi.fn().mockResolvedValue(18),
    },
  },
}));

// ─── Unit tests for k-anonymity helpers ──────────────────────────────────────
describe('K-Anonymity Helper: kAnon()', () => {
  it(`returns null for counts strictly below threshold (${K_ANON_THRESHOLD})`, () => {
    expect(kAnon(0)).toBeNull();
    expect(kAnon(1)).toBeNull();
    expect(kAnon(K_ANON_THRESHOLD - 1)).toBeNull();
  });

  it(`returns the value itself for counts at or above threshold`, () => {
    expect(kAnon(K_ANON_THRESHOLD)).toBe(K_ANON_THRESHOLD);
    expect(kAnon(K_ANON_THRESHOLD + 1)).toBe(K_ANON_THRESHOLD + 1);
    expect(kAnon(100)).toBe(100);
  });

  it('uses K_ANON_THRESHOLD = 10 as the default', () => {
    expect(K_ANON_THRESHOLD).toBe(10);
    expect(kAnon(9)).toBeNull();
    expect(kAnon(10)).toBe(10);
  });

  it('supports custom threshold overrides', () => {
    expect(kAnon(5, 5)).toBe(5);
    expect(kAnon(4, 5)).toBeNull();
    expect(kAnon(3, 3)).toBe(3);
  });
});

// ─── Unit tests for median helper ────────────────────────────────────────────
describe('Median Helper: median()', () => {
  it('returns null for empty arrays', () => {
    expect(median([])).toBeNull();
  });

  it('returns the single element for single-item arrays', () => {
    expect(median([7])).toBe(7);
  });

  it('returns the middle element for odd-length arrays', () => {
    expect(median([1, 3, 5])).toBe(3);
    expect(median([5, 1, 3])).toBe(3); // unsorted input
  });

  it('returns average of two middle elements for even-length arrays', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([4, 1, 3, 2])).toBe(2.5); // unsorted input
  });
});

// ─── Integration-style tests for aggregation service ─────────────────────────
describe('AdminAggregationService', () => {
  describe('getOverview()', () => {
    it('returns correct headline metrics', async () => {
      const overview = await adminAggregationService.getOverview();
      expect(overview.totalHouseholds).toBe(25);
      expect(overview.totalLearners).toBe(15);
      expect(overview.totalParents).toBe(12);
      expect(overview.totalDecisionCards).toBe(8);
      expect(overview.totalCounsellorBookings).toBe(12);
      expect(overview.pendingEscalations).toBe(3);
      expect(overview.reportGeneratedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    it('computes decisionCardCompletionRate correctly', async () => {
      const overview = await adminAggregationService.getOverview();
      // 8 decision cards / 25 households = 32%
      expect(overview.decisionCardCompletionRate).toBe(32);
    });
  });

  describe('getConcernBreakdown() — k-anonymity enforcement', () => {
    it('suppresses CAREER_INTEREST bucket (count 5 < threshold 10)', async () => {
      const breakdown = await adminAggregationService.getConcernBreakdown();
      const careerItem = breakdown.items.find((i) => i.category === 'CAREER_INTEREST');
      expect(careerItem).toBeDefined();
      expect(careerItem!.suppressed).toBe(true);
      expect(careerItem!.count).toBeNull();
      expect(careerItem!.preScoreMedian).toBeNull();
      expect(careerItem!.postScoreMedian).toBeNull();
      expect(careerItem!.sentimentShift).toBeNull();
      expect(careerItem!.resolutionRate).toBeNull();
    });

    it('exposes FINANCIAL_WORRY bucket (count 12 >= threshold 10)', async () => {
      const breakdown = await adminAggregationService.getConcernBreakdown();
      const finItem = breakdown.items.find((i) => i.category === 'FINANCIAL_WORRY');
      expect(finItem).toBeDefined();
      expect(finItem!.suppressed).toBe(false);
      expect(finItem!.count).toBe(12);
      // preMedian of twelve 4s = 4; postMedian of twelve 2s = 2
      expect(finItem!.preScoreMedian).toBe(4);
      expect(finItem!.postScoreMedian).toBe(2);
      // sentimentShift = post - pre = 2 - 4 = -2 (negative = improvement)
      expect(finItem!.sentimentShift).toBe(-2);
    });

    it('correctly counts suppressed buckets', async () => {
      const breakdown = await adminAggregationService.getConcernBreakdown();
      expect(breakdown.suppressedBuckets).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getDecisionFunnel()', () => {
    it('returns all 4 funnel stages in correct order', async () => {
      const funnel = await adminAggregationService.getDecisionFunnel();
      expect(funnel.stages).toHaveLength(4);
      expect(funnel.stages[0]?.stage).toBe('HOUSEHOLD_INTAKE');
      expect(funnel.stages[3]?.stage).toBe('DECISION_CARD');
    });

    it('computes dropoff percentages from previous stage', async () => {
      const funnel = await adminAggregationService.getDecisionFunnel();
      // First stage has no dropoff
      expect(funnel.stages[0]?.dropoffFromPrevious).toBeNull();
      // Subsequent stages have numeric dropoff
      expect(typeof funnel.stages[1]?.dropoffFromPrevious).toBe('number');
    });

    it('computes overall completion rate', async () => {
      const funnel = await adminAggregationService.getDecisionFunnel();
      // 8 decision cards / 25 households = 32%
      expect(funnel.overallCompletionRate).toBe(32);
    });
  });

  describe('getEscalationTracker()', () => {
    it('correctly splits bookings into status buckets', async () => {
      const tracker = await adminAggregationService.getEscalationTracker();
      expect(tracker.pending).toHaveLength(1);
      expect(tracker.confirmed).toHaveLength(1);
      expect(tracker.completed).toHaveLength(0);
    });

    it('computes daysWaiting from booking createdAt', async () => {
      const tracker = await adminAggregationService.getEscalationTracker();
      expect(tracker.pending[0]?.daysWaiting).toBeGreaterThanOrEqual(2);
    });
  });

  describe('exportCsv()', () => {
    it('generates valid CSV for concerns with suppression markers', async () => {
      const result = await adminAggregationService.exportCsv('concerns');
      expect(result.csvContent).toContain('Category,Count,PreScoreMedian');
      expect(result.csvContent).toContain('SUPPRESSED');
      expect(result.filename).toMatch(/saathi-concerns-export-\d{4}-\d{2}-\d{2}\.csv/);
      expect(result.suppressedRowCount).toBeGreaterThanOrEqual(1);
    });

    it('generates valid CSV for decision funnel', async () => {
      const result = await adminAggregationService.exportCsv('decisions');
      expect(result.csvContent).toContain('Stage,LabelEn,Count');
      expect(result.csvContent).toContain('HOUSEHOLD_INTAKE');
      expect(result.csvContent).toContain('DECISION_CARD');
    });

    it('generates valid CSV for escalations', async () => {
      const result = await adminAggregationService.exportCsv('escalations');
      expect(result.csvContent).toContain('BookingId,HouseholdId,Status');
      expect(result.csvContent).toContain('REQUESTED');
    });
  });
});
