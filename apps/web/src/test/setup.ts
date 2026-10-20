import '@testing-library/jest-dom';
import i18n from '../lib/i18n.js';

// Keep component tests deterministic even when a previous test changes the UI language.
void i18n.changeLanguage('en');

// Polyfill window.matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock fetch globally for client-side API requests in jsdom tests
globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();

  // Locations endpoints
  if (url.includes('/locations/states')) {
    return new Response(JSON.stringify({ data: [{ code: 'UP', name: 'Uttar Pradesh' }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (url.includes('/locations/districts')) {
    return new Response(
      JSON.stringify({
        data: [{ code: 'UP_VARANASI', name: 'Varanasi', stateCode: 'UP' }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/locations/blocks')) {
    return new Response(
      JSON.stringify({
        data: [
          { code: 'VAR_KASHI', name: 'Kashi Vidyapeeth', districtCode: 'UP_VARANASI' },
          { code: 'VAR_PINDRA', name: 'Pindra', districtCode: 'UP_VARANASI' },
          { code: 'VAR_SEVAPURI', name: 'Sevapuri', districtCode: 'UP_VARANASI' },
          { code: 'VAR_HARAHUA', name: 'Harahua', districtCode: 'UP_VARANASI' },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Trades outcomes
  if (url.includes('/outcomes')) {
    return new Response(
      JSON.stringify({
        data: {
          tradeId: 'mock-trade-id',
          tradeCode: 'ELECTRICIAN',
          tradeTitleEn: 'Electrician',
          tradeTitleHi: 'इलेक्ट्रीशियन',
          requestedLevel: 'BLOCK',
          actualLevel: 'BLOCK',
          fallbackApplied: false,
          confidenceExplanationEn: 'Verified by local audit',
          confidenceExplanationHi: 'स्थानीय ऑडिट द्वारा सत्यापित',
          record: {
            id: 'mock-rec-id',
            tradeId: 'mock-trade-id',
            geographicLevel: 'BLOCK',
            state: 'Uttar Pradesh',
            district: 'Varanasi',
            block: 'Kashi Vidyapeeth',
            verifiedGraduatesCount: 82,
            medianSalaryMonthly: 19000,
            salaryRangeMin: 15000,
            salaryRangeMax: 26000,
            placementRatePercent: 88.5,
            sampleSize: 130,
            sources: ['NCVT MIS Verified Records 2025'],
            dataDate: '2025-11-15T00:00:00.000Z',
            confidenceLabel: 'HIGH',
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Single trade details
  if (url.includes('/trades/') && !url.endsWith('/trades')) {
    return new Response(
      JSON.stringify({
        data: {
          id: 'mock-trade-id',
          code: 'ELECTRICIAN',
          titleEn: 'Electrician (Power & Home Electrical)',
          titleHi: 'इलेक्ट्रीशियन (पावर और घरेलू वायरिंग)',
          sector: 'Power, Energy & Electrical',
          descriptionEn: 'Hands-on technical trade covering domestic wiring and switchgear.',
          descriptionHi: 'घरेलू वायरिंग और स्विचगियर को कवर करने वाला व्यावहारिक ट्रेड।',
          nsqfLevel: 4,
          durationMonths: 24,
          minEducation: 'Class 10 Pass',
          entryStep: 'CTS Level 4 Certificate',
          ladderSteps: [
            {
              level: 4,
              titleEn: 'Level 4: Licensed Electrician',
              titleHi: 'स्तर 4: लाइसेंस प्राप्त इलेक्ट्रीशियन',
              roleEn: 'Performs power wiring',
              roleHi: 'बिजली वायरिंग करता है',
              minExperienceEn: 'Class 10 Pass',
              minExperienceHi: 'कक्षा 10 उत्तीर्ण',
              medianSalaryMonthly: 18500,
              isStartingStep: true,
            },
          ],
          coursesCount: 2,
          approvedProvidersCount: 2,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Trades list
  if (url.includes('/trades')) {
    return new Response(
      JSON.stringify({
        data: [
          {
            id: 'mock-trade-1',
            code: 'ELECTRICIAN',
            titleEn: 'Electrician (Power & Home Electrical)',
            titleHi: 'इलेक्ट्रीशियन (पावर और घरेलू वायरिंग)',
            sector: 'Power, Energy & Electrical',
            descriptionEn: 'Hands-on technical trade covering domestic wiring.',
            descriptionHi: 'घरेलू वायरिंग को कवर करने वाला व्यावहारिक ट्रेड।',
            nsqfLevel: 4,
            durationMonths: 24,
            minEducation: 'Class 10 Pass',
            entryStep: 'CTS Level 4 Certificate',
          },
          {
            id: 'mock-trade-2',
            code: 'SOLAR_TECH',
            titleEn: 'Solar PV Installation Technician',
            titleHi: 'सोलर पीवी इंस्टॉलेशन तकनीशियन',
            sector: 'Green Energy & Renewables',
            descriptionEn: 'Solar rooftop installation and maintenance.',
            descriptionHi: 'सोलर रूफटॉप इंस्टॉलेशन और रखरखाव।',
            nsqfLevel: 4,
            durationMonths: 12,
            minEducation: 'Class 10 Pass',
            entryStep: 'Surya Mitra NSQF Level 4',
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Household intake
  if (url.includes('/households')) {
    return new Response(
      JSON.stringify({
        data: {
          id: 'mock-household-id',
          name: 'Sharma Household (DEMO)',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Kashi Vidyapeeth',
          incomeBand: '1_5L_TO_3L',
          learnerClassLevel: 'CLASS_10_PASS',
          costFraming: {
            category: 'PARTIAL_AID',
            headlineEn: 'Subsidized Government Fee & Hostel Allowance',
            headlineHi: 'रियायती सरकारी फीस और छात्रावास भत्ता',
            detailsEn: 'Govt ITI fee capped with stipend',
            detailsHi: 'सरकारी आईटीआई फीस मानदेय के साथ',
            stipendEligible: true,
            scholarshipScheme: 'State Technical Education Fee Concession',
          },
          highlightedNsqfLevel: 4,
          primaryConcernKey: 'FEE_AND_JOB_PLACEMENT_SECURITY',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Counselling endpoints
  if (url.includes('/counselling/slots')) {
    return new Response(
      JSON.stringify({
        data: [
          {
            slotTime: '2026-10-20T10:00:00Z',
            counsellorId: 'counsellor-1',
            counsellorName: 'Dr. Priya Varma',
            availableModes: ['VIDEO', 'AUDIO_ONLY'],
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/counselling/counsellor/bookings') || url.includes('/counselling/bookings')) {
    return new Response(
      JSON.stringify({
        data: [
          {
            id: 'booking-1',
            householdId: 'mock-household-id',
            counsellorId: 'counsellor-1',
            requestedSlot: '2026-10-20T10:00:00Z',
            scheduledAt: '2026-10-20T10:00:00Z',
            status: 'CONFIRMED',
            mode: 'VIDEO',
            meetingRoomId: 'saathi-room-varanasi-402',
            counsellorName: 'Dr. Priya Varma',
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/counselling/counsellor/household')) {
    return new Response(
      JSON.stringify({
        data: {
          householdId: 'mock-household-id',
          familyName: 'Sharma Household',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          block: 'Kashi Vidyapeeth',
          incomeBand: '1_5L_TO_3L',
          learnerClassLevel: 'CLASS_10_PASS',
          sharedConcerns: [
            {
              id: 'c-1',
              userId: 'user-learner-1',
              householdId: 'mock-household-id',
              category: 'FINANCIAL_WORRY',
              questionKey: 'Tuition fees',
              answerValue: 'Affordability',
              preScore: 4,
              postScore: 1,
              isShared: true,
              sharedAt: new Date().toISOString(),
              resolvedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          privateConcernsCount: 2,
          recommendedTrades: ['Electrician (Domestic & Industrial)', 'Solar PV Technician'],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Concerns checkpoint
  if (url.includes('/concerns/checkpoint')) {
    return new Response(
      JSON.stringify({
        data: {
          allResolved: true,
          resolvedCount: 2,
          totalConcerns: 2,
          readinessScore: 100,
          readyForDecisionCard: true,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Decision Card endpoints
  if (url.includes('/decision-card/my') || (url.includes('/decision-card') && !url.includes('/sms'))) {
    return new Response(
      JSON.stringify({
        data: {
          id: 'mock-card-id',
          householdId: 'mock-household-id',
          chosenTradeId: 'trade-electrician',
          chosenTradeCode: 'ELECTRICIAN',
          chosenTradeTitleEn: 'Electrician (Domestic & Industrial)',
          chosenTradeTitleHi: 'इलेक्ट्रीशियन (घरेलू और औद्योगिक)',
          nsqfLevel: 4,
          chosenProviderId: 'provider-iti-karaundi',
          chosenProviderName: 'Government ITI Karaundi',
          chosenProviderType: 'GOVERNMENT_ITI',
          chosenProviderAddress: 'Karaundi, BHU Road, Varanasi, Uttar Pradesh 221005',
          chosenProviderContact: '0542-2570123',
          agreedActions: ['Apply online at scvtup.in', 'Submit 10th Marksheet & Income Certificate'],
          openConcerns: [],
          counsellorNotes: 'Approved for Electrician course.',
          counsellorContact: 'Dr. Priya Varma (0542-2570123)',
          verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          feeWaiverEligible: true,
          napsStipendMonthly: 2500,
          createdAt: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/decision-card') && url.includes('/sms')) {
    return new Response(
      JSON.stringify({
        data: {
          smsTextEn: 'SAATHI DECISION: Electrician at Govt ITI Karaundi confirmed for Sharma Family. Tuition: Free. NAPS Stipend: Rs 2500/mo. Verify: saathi.gov.in/v/A1B2C3D4',
          smsTextHi: 'साथी निर्णय: राजकीय आईटीआई करौंदी में इलेक्ट्रीशियन ट्रेड तय।',
          verificationCode: 'A1B2C3D4',
          verificationUrl: 'https://saathi.gov.in/v/A1B2C3D4',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Admin dashboard endpoints (Phase 7)
  if (url.includes('/admin/dashboard/overview')) {
    return new Response(
      JSON.stringify({
        data: {
          totalHouseholds: 248, totalLearners: 248, totalParents: 231,
          totalJointSessions: 189, totalDecisionCards: 142,
          totalCounsellorBookings: 67, pendingEscalations: 12,
          averageReadinessScore: 74, decisionCardCompletionRate: 57,
          reportGeneratedAt: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/admin/dashboard/concerns')) {
    return new Response(
      JSON.stringify({
        data: {
          totalConcerns: 843, suppressedBuckets: 2, reportDate: new Date().toISOString(),
          items: [
            { category: 'FINANCIAL_WORRY', count: 312, preScoreMedian: 4.5, postScoreMedian: 2.1, sentimentShift: -2.4, resolutionRate: 78, suppressed: false },
            { category: 'DISTANCE_TRAVEL', count: null, preScoreMedian: null, postScoreMedian: null, sentimentShift: null, resolutionRate: null, suppressed: true },
          ],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/admin/dashboard/heatmap')) {
    return new Response(
      JSON.stringify({
        data: {
          cells: [{ state: 'Uttar Pradesh', district: 'Varanasi', householdCount: 42, decisionCardCount: 28, averageReadiness: null, suppressed: false }],
          suppressedCells: 0, totalCells: 1, reportDate: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/admin/dashboard/funnel')) {
    return new Response(
      JSON.stringify({
        data: {
          overallCompletionRate: 57, reportDate: new Date().toISOString(),
          stages: [
            { stage: 'HOUSEHOLD_INTAKE', labelEn: 'Household Intake Completed', labelHi: 'पारिवारिक जानकारी दर्ज', count: 248, dropoffFromPrevious: null },
            { stage: 'JOINT_SESSION', labelEn: 'Joint Session Started', labelHi: 'संयुक्त सत्र शुरू', count: 189, dropoffFromPrevious: 24 },
            { stage: 'COUNSELLOR_ESCALATION', labelEn: 'Counsellor Booking Made', labelHi: 'परामर्शदाता नियुक्ति', count: 67, dropoffFromPrevious: 65 },
            { stage: 'DECISION_CARD', labelEn: 'Family Decision Card Issued', labelHi: 'परिवार निर्णय पत्र जारी', count: 142, dropoffFromPrevious: null },
          ],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (url.includes('/admin/dashboard/escalations')) {
    return new Response(
      JSON.stringify({
        data: {
          totalEscalations: 67, reportDate: new Date().toISOString(),
          pending: [{ bookingId: 'b1', householdId: 'h1', status: 'REQUESTED', mode: 'VIDEO', scheduledAt: null, counsellorName: null, district: 'Varanasi', state: 'UP', daysWaiting: 3 }],
          confirmed: [{ bookingId: 'b3', householdId: 'h3', status: 'CONFIRMED', mode: 'VIDEO', scheduledAt: new Date().toISOString(), counsellorName: 'Dr. Priya Varma', district: 'Varanasi', state: 'UP', daysWaiting: 1 }],
          completed: [], cancelled: [],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ data: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
