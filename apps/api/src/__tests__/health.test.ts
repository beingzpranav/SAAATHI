import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('API Foundation and Health Endpoints', () => {
  it('GET /health returns healthy status wrapped in standard envelope', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data).toHaveProperty('uptimeSeconds');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('requestId');
    expect(res.headers['x-request-id']).toBe(res.body.meta.requestId);
  });

  it('GET /ready returns readiness status and checks', async () => {
    const res = await request(app).get('/ready');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.checks).toBeDefined();
    expect(res.body.data.checks.database).toBe('connected');
  });

  it('GET /api/v1 returns API root confirmation', async () => {
    const res = await request(app).get('/api/v1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('SAATHI API v1 running');
    expect(res.body.data.version).toBe('0.1.0');
  });

  it('GET non-existent route returns 404 in standard error envelope', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.error).toHaveProperty('requestId');
  });
});
