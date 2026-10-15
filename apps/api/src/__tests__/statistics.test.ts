import { describe, it, expect } from 'vitest';
import { calculateMedian, calculateRange, computeSampleSalaryStats } from '../lib/statistics.js';

describe('Statistical Utility - Median and Range Calculations (No Averages)', () => {
  it('correctly calculates the median for an odd number of salary samples', () => {
    const salaries = [14000, 15000, 18500, 22000, 24000];
    const median = calculateMedian(salaries);
    expect(median).toBe(18500);
  });

  it('correctly calculates the median for an even number of salary samples', () => {
    const salaries = [14000, 16000, 18000, 20000];
    const median = calculateMedian(salaries);
    expect(median).toBe(17000);
  });

  it('returns median unaffected by extreme outlier that would distort arithmetic mean', () => {
    // 5 graduates: 4 earn around ~18k, 1 extreme outlier earns 1,00,000 (relative business)
    const salaries = [16000, 17500, 18000, 19500, 100000];
    const median = calculateMedian(salaries);

    // Mean would be 34,200 (misleadingly high by 85%)
    const mean = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    expect(mean).toBe(34200);

    // Median stays honest and reflective of typical vocational reality: 18,000
    expect(median).toBe(18000);
    expect(median).toBeLessThan(mean);
  });

  it('correctly calculates min-max range', () => {
    const salaries = [21000, 14500, 18000, 26000, 16000];
    const range = calculateRange(salaries);
    expect(range.min).toBe(14500);
    expect(range.max).toBe(26000);
  });

  it('returns zeroes gracefully for empty sample sets', () => {
    expect(calculateMedian([])).toBe(0);
    expect(calculateRange([])).toEqual({ min: 0, max: 0 });
  });

  it('computes composite salary statistics cleanly', () => {
    const salaries = [15000, 18000, 22000];
    const stats = computeSampleSalaryStats(salaries);
    expect(stats.median).toBe(18000);
    expect(stats.range.min).toBe(15000);
    expect(stats.range.max).toBe(22000);
  });
});
