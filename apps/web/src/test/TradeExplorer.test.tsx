import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TradeCard } from '../features/trades/components/TradeCard.js';
import { ConfidenceBadge, FallbackNotice } from '../features/trades/components/ConfidenceBadge.js';
import type { TradeSummary, VerifiedOutcomeResponse } from '@saathi/shared';

describe('TradeCard and Verification Components', () => {
  const mockTrade: TradeSummary = {
    id: 'trade-elec',
    code: 'ELECTRICIAN',
    titleEn: 'Electrician (Power & Home Electrical)',
    titleHi: 'इलेक्ट्रीशियन (पावर और घरेलू वायरिंग)',
    sector: 'Power, Energy & Electrical',
    descriptionEn: 'Hands-on technical trade covering domestic wiring and switchgear.',
    descriptionHi: 'घरेलू वायरिंग और स्विचगियर को कवर करने वाला व्यावहारिक ट्रेड।',
    nsqfLevel: 4,
    durationMonths: 24,
    minEducation: 'Class 10 Pass',
    entryStep: 'CTS Level 4',
  };

  const mockOutcome: VerifiedOutcomeResponse = {
    tradeId: 'trade-elec',
    tradeCode: 'ELECTRICIAN',
    tradeTitleEn: 'Electrician',
    tradeTitleHi: 'इलेक्ट्रीशियन',
    requestedLevel: 'BLOCK',
    actualLevel: 'BLOCK',
    fallbackApplied: false,
    confidenceExplanationEn: 'Verified from 68 alumni',
    confidenceExplanationHi: '68 सत्यापित पूर्व छात्रों से प्रमाणित',
    record: {
      id: 'rec-1',
      tradeId: 'trade-elec',
      geographicLevel: 'BLOCK',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Pindra',
      verifiedGraduatesCount: 68,
      medianSalaryMonthly: 18500,
      salaryRangeMin: 14000,
      salaryRangeMax: 24500,
      placementRatePercent: 86.8,
      sampleSize: 114,
      sources: ['UPSDM 2025', 'NCVT MIS'],
      dataDate: '2025-12-01T00:00:00.000Z',
      confidenceLabel: 'HIGH',
    },
  };

  it('renders trade details and verified median salary accurately (no averages)', () => {
    render(
      <BrowserRouter>
        <TradeCard trade={mockTrade} outcome={mockOutcome} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Electrician/i)).toBeInTheDocument();
    expect(screen.getByText('NSQF Level 4')).toBeInTheDocument();
    expect(screen.getByText(/18,500/)).toBeInTheDocument();
    expect(screen.getByText(/86.8%/)).toBeInTheDocument();
    expect(screen.getByText(/14,000 – ₹24,500/)).toBeInTheDocument();
    expect(screen.getByText(/High Confidence|उच्च विश्वसनीयता/i)).toBeInTheDocument();
  });

  it('renders fallback transparency notice when fallbackApplied is true', () => {
    const fallbackOutcome: VerifiedOutcomeResponse = {
      ...mockOutcome,
      requestedLevel: 'BLOCK',
      actualLevel: 'DISTRICT',
      fallbackApplied: true,
      fallbackReason: 'Block sample count insufficient; showing district data for Varanasi.',
    };

    render(
      <BrowserRouter>
        <TradeCard trade={mockTrade} outcome={fallbackOutcome} />
      </BrowserRouter>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByText(/Showing DISTRICT-level verified data|DISTRICT स्तर का सत्यापित डेटा/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Block sample count insufficient/i)).toBeInTheDocument();
  });

  it('renders ConfidenceBadge with appropriate styling and geographic tag', () => {
    render(<ConfidenceBadge label="HIGH" geographicLevel="BLOCK" />);
    expect(screen.getByText(/High Confidence|उच्च विश्वसनीयता/i)).toBeInTheDocument();
    expect(screen.getByText('[BLOCK]')).toBeInTheDocument();
  });

  it('renders standalone FallbackNotice with custom reason', () => {
    render(
      <FallbackNotice
        actualLevel="STATE"
        requestedLevel="BLOCK"
        reason="Local block surveys are in progress."
      />,
    );
    expect(
      screen.getByText(/Showing STATE-level verified data|STATE स्तर का सत्यापित डेटा/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Local block surveys are in progress.')).toBeInTheDocument();
  });
});
