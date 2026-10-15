import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { guardrails } from '../lib/llm/guardrails.js';
import { groundedMockAdapter } from '../lib/llm/mock.adapter.js';

describe('AI Guardrails & Grounded Retrieval Engine', () => {
  describe('Guardrails Out-of-Scope Enforcement', () => {
    it('refuses cooking and recipe questions', () => {
      const result = guardrails.checkScope('How to bake a chocolate cake?');
      expect(result.allowed).toBe(false);
      expect(result.refusalResponse).toBeDefined();
      expect(result.refusalResponse?.isRefusal).toBe(true);
      expect(result.refusalResponse?.confidence).toBe('NONE');
      expect(result.refusalResponse?.citations).toHaveLength(0);
      expect(result.refusalResponse?.suggestedQuestions.length).toBeGreaterThan(0);
    });

    it('refuses entertainment and cricket questions', () => {
      const result = guardrails.checkScope('Who won the cricket world cup?');
      expect(result.allowed).toBe(false);
      expect(result.refusalResponse?.isRefusal).toBe(true);
      expect(result.refusalResponse?.refusalReasonEn).toContain('outside the scope of SAATHI');
    });

    it('refuses political queries', () => {
      const result = guardrails.checkScope('Tell me about the prime minister election');
      expect(result.allowed).toBe(false);
      expect(result.refusalResponse?.isRefusal).toBe(true);
    });

    it('refuses medical advice queries', () => {
      const result = guardrails.checkScope('What medicine should I take for fever and cough?');
      expect(result.allowed).toBe(false);
      expect(result.refusalResponse?.isRefusal).toBe(true);
    });

    it('refuses financial speculation queries', () => {
      const result = guardrails.checkScope('Should I invest in crypto or bitcoin?');
      expect(result.allowed).toBe(false);
      expect(result.refusalResponse?.isRefusal).toBe(true);
    });

    it('refuses non-vocational professions like astronaut', () => {
      const result = guardrails.checkScope('How can I become an astronaut or rocket scientist?');
      expect(result.allowed).toBe(false);
      expect(result.refusalResponse?.isRefusal).toBe(true);
    });

    it('refuses extremely short queries', () => {
      const result = guardrails.checkScope('hi');
      expect(result.allowed).toBe(false);
      expect(result.refusalResponse?.isRefusal).toBe(true);
    });

    it('allows valid vocational ITI queries', () => {
      const result = guardrails.checkScope('What is the salary and duration for Electrician trade?');
      expect(result.allowed).toBe(true);
    });

    it('allows Hindi vocational queries', () => {
      const result = guardrails.checkScope('सोलर तकनीशियन कोर्स का वेतन और अवधि क्या है?');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Grounded Mock Adapter & Verification', () => {
    it('returns grounded response with verified citations for Electrician trade', async () => {
      const response = await groundedMockAdapter.query({
        query: 'What is the salary and placement for Electrician trade in Varanasi?',
        language: 'en',
      });

      expect(response.isRefusal).toBe(false);
      expect(response.answerEn).toContain('Electrician');
      expect(response.answerHi).toBeDefined();
      expect(response.citations.length).toBeGreaterThan(0);

      // Verify citation properties
      const tradeCitation = response.citations.find((c) => c.sourceType === 'TRADE');
      expect(tradeCitation).toBeDefined();
      expect(tradeCitation?.title).toContain('Electrician');

      const outcomeCitation = response.citations.find((c) => c.sourceType === 'OUTCOME_RECORD');
      expect(outcomeCitation).toBeDefined();
      expect(outcomeCitation?.verifiedStatistic).toBeDefined();

      const schemeCitation = response.citations.find((c) => c.sourceType === 'GOVT_SCHEME');
      expect(schemeCitation).toBeDefined();
      expect(schemeCitation?.title).toContain('Apprenticeship');
    });

    it('returns grounded response for Solar PV technician trade', async () => {
      const response = await groundedMockAdapter.query({
        query: 'Tell me about Solar PV technician career and training',
        tradeCode: 'SOLAR_TECH',
      });

      expect(response.isRefusal).toBe(false);
      expect(response.citations.length).toBeGreaterThanOrEqual(1);
      expect(response.answerEn).toContain('Solar');
    });

    it('returns financial scheme guidance with 100% tuition waiver citations', async () => {
      const response = await groundedMockAdapter.query({
        query: 'What stipends and fee waivers are available for ITI students?',
      });

      expect(response.isRefusal).toBe(false);
      const schemeCitation = response.citations.find((c) => c.sourceType === 'GOVT_SCHEME');
      expect(schemeCitation).toBeDefined();
      expect(response.answerEn).toContain('NAPS');
      expect(response.answerHi).toContain('मानदेय');
    });

    it('returns comparative salary breakdown across trades', async () => {
      const response = await groundedMockAdapter.query({
        query: 'What is the median salary across vocational trades?',
      });

      expect(response.isRefusal).toBe(false);
      expect(response.citations.length).toBeGreaterThan(0);
      expect(response.relatedTrades.length).toBeGreaterThan(0);
    });

    it('provides dual language text (English and Hindi) on valid queries', async () => {
      const response = await groundedMockAdapter.query({
        query: 'What is the minimum eligibility for CNC operator trade?',
        tradeCode: 'CNC_OPERATOR',
      });

      expect(response.answerEn).toBeTruthy();
      expect(response.answerHi).toBeTruthy();
      expect(response.suggestedQuestions.length).toBeGreaterThan(0);
    });
  });

  describe('API Endpoint POST /api/v1/ai/query', () => {
    it('returns HTTP 200 with standard envelope for valid query', async () => {
      const res = await request(app)
        .post('/api/v1/ai/query')
        .send({
          query: 'What is the median salary for Electrician graduates in Varanasi?',
          language: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.isRefusal).toBe(false);
      expect(res.body.data.citations).toBeInstanceOf(Array);
      expect(res.body.data.citations.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('requestId');
    });

    it('returns HTTP 200 with refusal data when out of scope query is sent to API', async () => {
      const res = await request(app)
        .post('/api/v1/ai/query')
        .send({
          query: 'How do I cook butter chicken biryani?',
          language: 'en',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isRefusal).toBe(true);
      expect(res.body.data.confidence).toBe('NONE');
      expect(res.body.data.citations).toHaveLength(0);
      expect(res.body.data.refusalReasonEn).toBeDefined();
    });

    it('returns HTTP 422 validation error if query is less than 3 characters', async () => {
      const res = await request(app)
        .post('/api/v1/ai/query')
        .send({
          query: 'a',
        });

      expect(res.status).toBe(422);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

  });
});
