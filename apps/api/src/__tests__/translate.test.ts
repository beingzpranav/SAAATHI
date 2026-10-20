import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Real-Time Dynamic Multilingual Translation Endpoints', () => {
  it('GET /api/v1/translate/languages returns all 8 Indian languages + English', async () => {
    const res = await request(app).get('/api/v1/translate/languages');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('languages');

    const languages = res.body.data.languages;
    // Check 8 Indian languages + English
    expect(languages).toHaveProperty('en');
    expect(languages).toHaveProperty('hi'); // Hindi
    expect(languages).toHaveProperty('bn'); // Bengali
    expect(languages).toHaveProperty('ta'); // Tamil
    expect(languages).toHaveProperty('te'); // Telugu
    expect(languages).toHaveProperty('mr'); // Marathi
    expect(languages).toHaveProperty('gu'); // Gujarati
    expect(languages).toHaveProperty('kn'); // Kannada
    expect(languages).toHaveProperty('ml'); // Malayalam

    expect(languages.hi.native).toBe('हिन्दी');
    expect(languages.bn.native).toBe('বাংলা');
    expect(languages.ta.native).toBe('தமிழ்');
  });

  it('GET /api/v1/translate/health returns health status and cache stats', async () => {
    const res = await request(app).get('/api/v1/translate/health');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.cache).toHaveProperty('size');
    expect(res.body.data.cache).toHaveProperty('maxSize');
  });

  it('POST /api/v1/translate returns original texts when source equals target language', async () => {
    const res = await request(app)
      .post('/api/v1/translate')
      .send({
        texts: ['Hello World', 'Vocational Training'],
        sourceLanguage: 'en',
        targetLanguage: 'en',
        context: 'app_ui',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.translations).toEqual(['Hello World', 'Vocational Training']);
    expect(res.body.data.sourceLanguage).toBe('en');
    expect(res.body.data.targetLanguage).toBe('en');
  });

  it('POST /api/v1/translate validates payload and rejects empty texts', async () => {
    const res = await request(app)
      .post('/api/v1/translate')
      .send({
        texts: [],
        sourceLanguage: 'en',
        targetLanguage: 'hi',
      });

    expect(res.status).toBe(422);
  });

  it('POST /api/v1/translate rejects invalid language codes', async () => {
    const res = await request(app)
      .post('/api/v1/translate')
      .send({
        texts: ['Hello'],
        sourceLanguage: 'invalid_code',
        targetLanguage: 'hi',
      });

    expect(res.status).toBe(422);
  });
});
