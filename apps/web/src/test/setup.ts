import '@testing-library/jest-dom';

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

  return new Response(JSON.stringify({ data: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
