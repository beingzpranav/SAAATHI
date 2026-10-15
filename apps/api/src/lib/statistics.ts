/**
 * Mathematical and statistical utility functions for SAATHI platform.
 *
 * CRITICAL CONSTRAINT:
 * Only MEDIAN and MIN-MAX RANGE calculations are permitted for salary and earnings.
 * Arithmetic averages (mean) MUST NOT be used or exposed to families,
 * as averages are distorted by extreme outliers and give false expectations.
 */

export interface SalaryRange {
  min: number;
  max: number;
}

export interface SalaryStatistics {
  median: number;
  range: SalaryRange;
}

/**
 * Calculates the exact median of an array of numeric values.
 * Returns 0 if array is empty.
 */
export function calculateMedian(values: number[]): number {
  if (!values || values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);

  if (sorted.length % 2 !== 0) {
    return sorted[half]!;
  }

  return Math.round((sorted[half - 1]! + sorted[half]!) / 2);
}

/**
 * Calculates the min-max range of an array of numeric values.
 */
export function calculateRange(values: number[]): SalaryRange {
  if (!values || values.length === 0) {
    return { min: 0, max: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
  };
}

/**
 * Computes both median and range for a sample distribution.
 */
export function computeSampleSalaryStats(sampleSalaries: number[]): SalaryStatistics {
  return {
    median: calculateMedian(sampleSalaries),
    range: calculateRange(sampleSalaries),
  };
}
