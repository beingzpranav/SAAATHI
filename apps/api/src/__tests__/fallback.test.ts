import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeographicLevel } from '@prisma/client';
import { outcomeService } from '../modules/trades/outcome.service.js';
import { tradeRepository } from '../modules/trades/trade.repository.js';

describe('Multi-Tier Fallback Ladder (Block -> District -> State -> National)', () => {
  const mockTrade = {
    id: 'test-trade-id',
    code: 'ELECTRICIAN',
    titleEn: 'Electrician',
    titleHi: 'इलेक्ट्रीशियन',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Tier 1: Returns local BLOCK outcome directly when sample is sufficient (no fallback applied)', async () => {
    vi.spyOn(tradeRepository, 'findOutcomeByLevel').mockImplementation(async (_tradeId, level) => {
      if (level === GeographicLevel.BLOCK) {
        return {
          id: 'rec-block-1',
          tradeId: 'test-trade-id',
          providerId: null,
          geographicLevel: GeographicLevel.BLOCK,
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Pindra',
          verifiedGraduatesCount: 75,
          medianSalaryMonthly: 18500,
          salaryRangeMin: 14000,
          salaryRangeMax: 24000,
          placementRatePercent: 88,
          sampleSize: 110,
          sources: ['UP Kaushal Vikas'],
          dataDate: new Date('2025-12-01'),
          confidenceLabel: 'HIGH' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });

    const result = await outcomeService.resolveOutcomeWithFallback(
      mockTrade,
      'Uttar Pradesh',
      'Varanasi',
      'Pindra',
    );

    expect(result.fallbackApplied).toBe(false);
    expect(result.actualLevel).toBe(GeographicLevel.BLOCK);
    expect(result.record?.medianSalaryMonthly).toBe(18500);
    expect(result.record?.confidenceLabel).toBe('HIGH');
    expect(result.fallbackReason).toBeUndefined();
    expect(result.confidenceExplanationEn).toContain('Pindra block');
  });

  it('Tier 2: Transparently falls back to DISTRICT when block sample is insufficient (< 30)', async () => {
    vi.spyOn(tradeRepository, 'findOutcomeByLevel').mockImplementation(async (_tradeId, level) => {
      if (level === GeographicLevel.BLOCK) {
        // Block sample exists but is too small (< 30)
        return {
          id: 'rec-block-small',
          tradeId: 'test-trade-id',
          providerId: null,
          geographicLevel: GeographicLevel.BLOCK,
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Harahua',
          verifiedGraduatesCount: 8,
          medianSalaryMonthly: 18000,
          salaryRangeMin: 14000,
          salaryRangeMax: 22000,
          placementRatePercent: 80,
          sampleSize: 12, // < 30 triggers fallback!
          sources: ['Pilot'],
          dataDate: new Date('2025-10-01'),
          confidenceLabel: 'LOW' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (level === GeographicLevel.DISTRICT) {
        return {
          id: 'rec-dist-1',
          tradeId: 'test-trade-id',
          providerId: null,
          geographicLevel: GeographicLevel.DISTRICT,
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: null,
          verifiedGraduatesCount: 150,
          medianSalaryMonthly: 19500,
          salaryRangeMin: 15000,
          salaryRangeMax: 26000,
          placementRatePercent: 86.5,
          sampleSize: 220,
          sources: ['District Committee'],
          dataDate: new Date('2025-11-01'),
          confidenceLabel: 'HIGH' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });

    const result = await outcomeService.resolveOutcomeWithFallback(
      mockTrade,
      'Uttar Pradesh',
      'Varanasi',
      'Harahua',
    );

    expect(result.fallbackApplied).toBe(true);
    expect(result.actualLevel).toBe(GeographicLevel.DISTRICT);
    expect(result.requestedLevel).toBe(GeographicLevel.BLOCK);
    expect(result.record?.medianSalaryMonthly).toBe(19500);
    expect(result.record?.confidenceLabel).toBe('HIGH');
    expect(result.fallbackReason).toContain('insufficient sample count');
  });

  it('Tier 3: Falls back to STATE benchmark when no local district data exists', async () => {
    vi.spyOn(tradeRepository, 'findOutcomeByLevel').mockImplementation(async (_tradeId, level) => {
      if (level === GeographicLevel.STATE) {
        return {
          id: 'rec-state-1',
          tradeId: 'test-trade-id',
          providerId: null,
          geographicLevel: GeographicLevel.STATE,
          state: 'Uttar Pradesh',
          district: 'All',
          block: null,
          verifiedGraduatesCount: 800,
          medianSalaryMonthly: 17500,
          salaryRangeMin: 13000,
          salaryRangeMax: 24000,
          placementRatePercent: 82.5,
          sampleSize: 1100,
          sources: ['State Mission'],
          dataDate: new Date('2025-10-01'),
          confidenceLabel: 'MEDIUM' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });

    const result = await outcomeService.resolveOutcomeWithFallback(
      mockTrade,
      'Uttar Pradesh',
      'RemoteDistrict',
      'RemoteBlock',
    );

    expect(result.fallbackApplied).toBe(true);
    expect(result.actualLevel).toBe(GeographicLevel.STATE);
    expect(result.record?.medianSalaryMonthly).toBe(17500);
    expect(result.confidenceExplanationEn).toContain('State benchmark');
  });

  it('Tier 4: Falls back to NATIONAL benchmark when state data is absent', async () => {
    vi.spyOn(tradeRepository, 'findOutcomeByLevel').mockImplementation(async (_tradeId, level) => {
      if (level === GeographicLevel.NATIONAL) {
        return {
          id: 'rec-nat-1',
          tradeId: 'test-trade-id',
          providerId: null,
          geographicLevel: GeographicLevel.NATIONAL,
          state: 'National',
          district: 'All',
          block: null,
          verifiedGraduatesCount: 5000,
          medianSalaryMonthly: 18000,
          salaryRangeMin: 14000,
          salaryRangeMax: 25000,
          placementRatePercent: 84.0,
          sampleSize: 6800,
          sources: ['NCVT National Survey'],
          dataDate: new Date('2025-06-01'),
          confidenceLabel: 'LOW' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });

    const result = await outcomeService.resolveOutcomeWithFallback(
      mockTrade,
      'UnknownState',
      'UnknownDistrict',
    );

    expect(result.fallbackApplied).toBe(true);
    expect(result.actualLevel).toBe(GeographicLevel.NATIONAL);
    expect(result.record?.confidenceLabel).toBe('LOW');
  });

  it('Tier 5: Gracefully handles trades with zero records returning confidence NONE', async () => {
    vi.spyOn(tradeRepository, 'findOutcomeByLevel').mockResolvedValue(null);

    const result = await outcomeService.resolveOutcomeWithFallback(mockTrade, 'NonExistentState');

    expect(result.fallbackApplied).toBe(true);
    expect(result.actualLevel).toBeNull();
    expect(result.record).toBeNull();
    expect(result.fallbackReason).toContain('No verified outcome data');
  });
});
