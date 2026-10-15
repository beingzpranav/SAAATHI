import { describe, it, expect } from 'vitest';
import { householdService } from '../modules/households/household.service.js';

describe('Household Intake Logic - Dynamic Cost Framing and NSQF Step Highlighting', () => {
  it('frames costs with 100% fee waiver & stipend eligibility for BELOW_1_5L income band', () => {
    const framing = householdService.computeCostFraming('BELOW_1_5L');
    expect(framing.category).toBe('FULL_SUBSIDY');
    expect(framing.stipendEligible).toBe(true);
    expect(framing.headlineEn).toContain('100% Tuition Fee Waiver');
    expect(framing.headlineHi).toContain('100% ट्यूशन फीस माफ़ी');
    expect(framing.scholarshipScheme).toContain('UP Post-Matric');
  });

  it('frames costs with subsidized fees for 1_5L_TO_3L income band', () => {
    const framing = householdService.computeCostFraming('1_5L_TO_3L');
    expect(framing.category).toBe('PARTIAL_AID');
    expect(framing.stipendEligible).toBe(true);
    expect(framing.headlineEn).toContain('Subsidized Government Fee');
  });

  it('frames costs with ROI & industry apprenticeship for 3L_TO_5L income band', () => {
    const framing = householdService.computeCostFraming('3L_TO_5L');
    expect(framing.category).toBe('STANDARD');
    expect(framing.headlineEn).toContain('High Return on Investment');
  });

  it('frames costs with premium specialization for ABOVE_5L income band', () => {
    const framing = householdService.computeCostFraming('ABOVE_5L');
    expect(framing.category).toBe('PREMIUM_ROI');
    expect(framing.stipendEligible).toBe(false);
    expect(framing.headlineEn).toContain('Specialized Advanced Tech');
  });

  it('highlights NSQF Level 3 for Class 8 learners', () => {
    const level = householdService.computeHighlightedNsqfLevel('CLASS_8_PASS');
    expect(level).toBe(3);
  });

  it('highlights NSQF Level 4 for Class 10 and Class 12 learners', () => {
    expect(householdService.computeHighlightedNsqfLevel('CLASS_10_PASS')).toBe(4);
    expect(householdService.computeHighlightedNsqfLevel('CLASS_12_PASS')).toBe(4);
  });

  it('highlights NSQF Level 5 for Graduates', () => {
    const level = householdService.computeHighlightedNsqfLevel('GRADUATE');
    expect(level).toBe(5);
  });

  it('prioritizes primary concern key based on household economic reality', () => {
    expect(householdService.computePrimaryConcernKey('BELOW_1_5L')).toBe(
      'STIPEND_IMMEDIATE_EARNING',
    );
    expect(householdService.computePrimaryConcernKey('1_5L_TO_3L')).toBe(
      'FEE_AND_JOB_PLACEMENT_SECURITY',
    );
    expect(householdService.computePrimaryConcernKey('3L_TO_5L')).toBe(
      'CAREER_GROWTH_AND_DIPLOMA_PATH',
    );
    expect(householdService.computePrimaryConcernKey('ABOVE_5L')).toBe(
      'INDUSTRY_REPUTATION_AND_HIGHER_DEGREE',
    );
  });
});
