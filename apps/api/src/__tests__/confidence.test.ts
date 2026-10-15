import { describe, it, expect } from 'vitest';
import { GeographicLevel } from '@prisma/client';
import { outcomeService } from '../modules/trades/outcome.service.js';

describe('Confidence Scoring Rules', () => {
  it('awards HIGH confidence for BLOCK level with sampleSize >= 100 and verifiedCount >= 50', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.BLOCK, 120, 65);
    expect(evaluation.label).toBe('HIGH');
    expect(evaluation.sufficientForLevel).toBe(true);
  });

  it('awards MEDIUM confidence for BLOCK level with sampleSize between 30 and 99', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.BLOCK, 45, 28);
    expect(evaluation.label).toBe('MEDIUM');
    expect(evaluation.sufficientForLevel).toBe(true);
  });

  it('flags BLOCK level sample as insufficient if sampleSize < 30', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.BLOCK, 18, 12);
    expect(evaluation.label).toBe('LOW');
    expect(evaluation.sufficientForLevel).toBe(false);
  });

  it('awards HIGH confidence for DISTRICT level with sampleSize >= 100 and verifiedCount >= 40', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.DISTRICT, 150, 80);
    expect(evaluation.label).toBe('HIGH');
    expect(evaluation.sufficientForLevel).toBe(true);
  });

  it('awards MEDIUM confidence for DISTRICT level with sampleSize between 30 and 99', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.DISTRICT, 60, 35);
    expect(evaluation.label).toBe('MEDIUM');
    expect(evaluation.sufficientForLevel).toBe(true);
  });

  it('flags DISTRICT level sample as insufficient if sampleSize < 30', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.DISTRICT, 22, 14);
    expect(evaluation.label).toBe('LOW');
    expect(evaluation.sufficientForLevel).toBe(false);
  });

  it('awards MEDIUM confidence for STATE level with sampleSize >= 50', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.STATE, 300, 200);
    expect(evaluation.label).toBe('MEDIUM');
    expect(evaluation.sufficientForLevel).toBe(true);
  });

  it('awards LOW confidence for STATE level with sampleSize < 50', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.STATE, 35, 20);
    expect(evaluation.label).toBe('LOW');
    expect(evaluation.sufficientForLevel).toBe(true);
  });

  it('awards LOW confidence for NATIONAL level regardless of size due to loss of local fidelity', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.NATIONAL, 5000, 3500);
    expect(evaluation.label).toBe('LOW');
    expect(evaluation.sufficientForLevel).toBe(true);
  });

  it('returns NONE for zero or negative sample sizes', () => {
    const evaluation = outcomeService.evaluateConfidence(GeographicLevel.BLOCK, 0, 0);
    expect(evaluation.label).toBe('NONE');
    expect(evaluation.sufficientForLevel).toBe(false);
  });
});
