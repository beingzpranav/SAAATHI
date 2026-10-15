import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { signAccessToken } from '../lib/jwt.js';
import { ledgerService } from '../modules/ledger/ledger.service.js';

describe('Phase 6: Counselling, Checkpoint & Decision Card Integration Tests', () => {
  const learnerToken = signAccessToken({
    userId: 'user-learner-1',
    email: 'learner@test.com',
    role: 'LEARNER',
  });

  const counsellorToken = signAccessToken({
    userId: 'user-counsellor-1',
    email: 'counsellor@test.com',
    role: 'COUNSELLOR',
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Counselling Slot Discovery & Booking', () => {
    it('GET /api/v1/counselling/slots returns available consultation slots', async () => {
      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue({
        id: 'counsellor-1',
        name: 'Dr. Priya Varma',
      } as any);

      const res = await request(app)
        .get('/api/v1/counselling/slots')
        .set('Cookie', [`saathi_access=${learnerToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('slotTime');
      expect(res.body.data[0]).toHaveProperty('counsellorName');
    });

    it('POST /api/v1/counselling/book books a session with video/audio mode', async () => {
      const mockHousehold = {
        id: 'household-1',
        name: 'Sharma Household',
      };

      const mockBooking = {
        id: 'booking-1',
        householdId: 'household-1',
        counsellorId: 'counsellor-1',
        requestedSlot: new Date('2026-10-20T10:00:00Z'),
        scheduledAt: new Date('2026-10-20T10:00:00Z'),
        status: 'CONFIRMED' as const,
        mode: 'AUDIO_ONLY' as const,
        meetingRoomId: 'saathi-room-12345',
        notes: 'Low bandwidth area, prefer audio call',
        createdAt: new Date(),
        updatedAt: new Date(),
        counsellor: { name: 'Dr. Priya Varma' },
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'user-learner-1',
        householdId: 'household-1',
      } as any);

      vi.spyOn(prisma.household, 'findUnique').mockResolvedValue(mockHousehold as any);
      vi.spyOn(prisma.user, 'findFirst').mockResolvedValue({ id: 'counsellor-1' } as any);
      vi.spyOn(prisma.booking, 'create').mockResolvedValue(mockBooking as any);
      vi.spyOn(ledgerService, 'recordEvent').mockResolvedValue({ id: 'ledger-1' } as any);

      const res = await request(app)
        .post('/api/v1/counselling/book')
        .set('Cookie', [`saathi_access=${learnerToken}`])
        .send({
          requestedSlot: '2026-10-20T10:00:00Z',
          mode: 'AUDIO_ONLY',
          notes: 'Low bandwidth area, prefer audio call',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.mode).toBe('AUDIO_ONLY');
      expect(res.body.data.meetingRoomId).toBe('saathi-room-12345');
    });
  });

  describe('Counsellor Console with Strict Privacy Filters', () => {
    it('GET /api/v1/counselling/counsellor/household/:id enforces strict privacy filters (only shared items)', async () => {
      const mockHouseholdWithConcerns = {
        id: 'household-1',
        name: 'Sharma Family',
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        block: 'Kashi Vidyapeeth',
        incomeBand: '1_5L_TO_3L',
        learnerClassLevel: 'CLASS_10_PASS',
        concerns: [
          {
            id: 'c-1',
            userId: 'user-1',
            householdId: 'household-1',
            category: 'FINANCIAL_WORRY',
            questionKey: 'Fee concern',
            answerValue: 'Wants scholarship',
            preScore: 4,
            postScore: null,
            isShared: true, // SHARED
            sharedAt: new Date(),
            resolvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'c-2',
            userId: 'user-1',
            householdId: 'household-1',
            category: 'SOCIAL_RESPECT',
            questionKey: 'Private parent anxiety',
            answerValue: 'Secret worry about relatives',
            preScore: 5,
            postScore: null,
            isShared: false, // PRIVATE - MUST BE FILTERED
            sharedAt: null,
            resolvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      vi.spyOn(prisma.household, 'findUnique').mockResolvedValue(mockHouseholdWithConcerns as any);
      vi.spyOn(prisma.trade, 'findMany').mockResolvedValue([{ titleEn: 'Electrician' }] as any);

      const res = await request(app)
        .get('/api/v1/counselling/counsellor/household/household-1')
        .set('Cookie', [`saathi_access=${counsellorToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.sharedConcerns.length).toBe(1);
      expect(res.body.data.sharedConcerns[0].id).toBe('c-1');
      // Verify unshared concern is NOT leaked
      expect(res.body.data.sharedConcerns.some((c: any) => c.id === 'c-2')).toBe(false);
      // Verify private concerns count is accurately tallied without content leak
      expect(res.body.data.privateConcernsCount).toBe(1);
    });

    it('rejects non-counsellor access to counsellor console', async () => {
      const res = await request(app)
        .get('/api/v1/counselling/counsellor/household/household-1')
        .set('Cookie', [`saathi_access=${learnerToken}`]);

      expect(res.status).toBe(403);
    });
  });

  describe('Concerns Answered Checkpoint', () => {
    it('POST /api/v1/concerns/checkpoint evaluates concerns and calculates readiness', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'user-learner-1',
        householdId: 'household-1',
      } as any);

      const mockConcern = {
        id: '11111111-1111-1111-1111-111111111111',
        householdId: 'household-1',
        preScore: 4,
      };

      vi.spyOn(prisma.concern, 'findUnique').mockResolvedValue(mockConcern as any);
      vi.spyOn(prisma.concern, 'update').mockResolvedValue({} as any);
      vi.spyOn(ledgerService, 'recordEvent').mockResolvedValue({ id: 'ledger-2' } as any);

      const res = await request(app)
        .post('/api/v1/concerns/checkpoint')
        .set('Cookie', [`saathi_access=${learnerToken}`])
        .send({
          evaluations: [
            {
              concernId: '11111111-1111-1111-1111-111111111111',
              postScore: 1, // Resolved!
              isResolved: true,
              resolutionNotes: 'Govt ITI tuition waiver resolved our worry',
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.allResolved).toBe(true);
      expect(res.body.data.resolvedCount).toBe(1);
      expect(res.body.data.readinessScore).toBe(100);
      expect(res.body.data.readyForDecisionCard).toBe(true);
    });
  });

  describe('Family Decision Card Generation & Cryptographic Verification', () => {
    it('POST /api/v1/decision-card creates verifiable card with SHA-256 hash', async () => {
      const mockTrade = {
        id: 'trade-electrician',
        code: 'ELECTRICIAN',
        titleEn: 'Electrician (Domestic & Industrial)',
        titleHi: 'इलेक्ट्रीशियन (घरेलू और औद्योगिक)',
        nsqfLevel: 4,
      };

      const mockProvider = {
        id: 'provider-iti-karaundi',
        name: 'Government ITI Karaundi',
        type: 'GOVERNMENT_ITI',
        address: 'Karaundi',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        contactPhone: '0542-2570123',
      };

      const mockCard = {
        id: 'card-1',
        householdId: 'household-1',
        chosenTradeId: 'trade-electrician',
        chosenProviderId: 'provider-iti-karaundi',
        agreedActions: ['Apply on UP ITI Admissions Portal', 'Verify NAPS apprenticeship agreement'],
        openConcerns: [],
        counsellorNotes: 'Family fully aligned on solar & electrical pathways.',
        counsellorContact: 'Dr. Priya Varma (9876543212)',
        verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        createdAt: new Date(),
        updatedAt: new Date(),
        chosenTrade: mockTrade,
        chosenProvider: mockProvider,
        household: { incomeBand: 'BELOW_1_5L' },
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'user-learner-1',
        householdId: 'household-1',
      } as any);

      vi.spyOn(prisma.trade, 'findUnique').mockResolvedValue(mockTrade as any);
      vi.spyOn(prisma.provider, 'findUnique').mockResolvedValue(mockProvider as any);
      vi.spyOn(prisma.decisionCard, 'upsert').mockResolvedValue(mockCard as any);
      vi.spyOn(ledgerService, 'recordEvent').mockResolvedValue({ id: 'ledger-3' } as any);

      const res = await request(app)
        .post('/api/v1/decision-card')
        .set('Cookie', [`saathi_access=${learnerToken}`])
        .send({
          chosenTradeId: 'trade-electrician',
          chosenProviderId: 'provider-iti-karaundi',
          agreedActions: [
            'Apply on UP ITI Admissions Portal',
            'Verify NAPS apprenticeship agreement',
          ],
          openConcerns: [],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.verificationHash).toBeDefined();
      expect(res.body.data.feeWaiverEligible).toBe(true);
      expect(res.body.data.napsStipendMonthly).toBe(2500);
    });

    it('GET /api/v1/decision-card/:householdId/sms returns bilingual SMS summary', async () => {
      const mockCard = {
        id: 'card-1',
        householdId: 'household-1',
        chosenTradeId: 'trade-electrician',
        chosenProviderId: 'provider-iti-karaundi',
        agreedActions: ['Apply online'],
        openConcerns: [],
        counsellorNotes: null,
        counsellorContact: '0542-2570123',
        verificationHash: 'a1b2c3d4e5f67890123456789abcdef0',
        createdAt: new Date(),
        chosenTrade: {
          code: 'ELECTRICIAN',
          titleEn: 'Electrician',
          titleHi: 'इलेक्ट्रीशियन',
          nsqfLevel: 4,
        },
        chosenProvider: {
          name: 'Govt ITI Karaundi',
          type: 'GOVERNMENT_ITI',
          address: 'Karaundi',
          district: 'Varanasi',
          state: 'Uttar Pradesh',
          contactPhone: '0542-2570123',
        },
        household: { incomeBand: 'BELOW_1_5L' },
      };

      vi.spyOn(prisma.decisionCard, 'findUnique').mockResolvedValue(mockCard as any);

      const res = await request(app)
        .get('/api/v1/decision-card/household-1/sms')
        .set('Cookie', [`saathi_access=${learnerToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.smsTextEn).toContain('Electrician');
      expect(res.body.data.smsTextHi).toContain('इलेक्ट्रीशियन');
      expect(res.body.data.verificationCode).toBe('A1B2C3D4');
      expect(res.body.data.verificationUrl).toContain('A1B2C3D4');
    });
  });
});
