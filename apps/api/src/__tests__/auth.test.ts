import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/hash.js';
import { signAccessToken } from '../lib/jwt.js';

describe('Auth Module Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('successfully registers an adult user', async () => {
      const mockUser = {
        id: 'user-adult-1',
        email: 'adult@test.com',
        phone: null,
        name: 'Adult User',
        role: 'LEARNER' as const,
        passwordHash: 'hashed_password',
        pinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        language: 'en',
        isMinor: false,
        parentConsentGiven: false,
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Adult User',
        email: 'adult@test.com',
        password: 'Password123!',
        role: 'LEARNER',
        language: 'en',
        isMinor: false,
        parentConsentGiven: false,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('adult@test.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects minor registration without parent consent', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Minor Learner',
        email: 'minor@test.com',
        password: 'Password123!',
        role: 'LEARNER',
        language: 'hi',
        isMinor: true,
        parentConsentGiven: false,
      });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details?.[0]?.message).toContain('Parental consent is mandatory');
    });

    it('returns 409 conflict if email already exists', async () => {
      const existingUser = {
        id: 'existing-id',
        email: 'existing@test.com',
        phone: null,
        name: 'Existing',
        role: 'LEARNER' as const,
        passwordHash: 'hash',
        pinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        language: 'en',
        isMinor: false,
        parentConsentGiven: false,
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser);

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'Password123!',
        role: 'LEARNER',
        language: 'en',
      });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('authenticates valid credentials and sets cookies', async () => {
      const passwordHash = await hashPassword('Password123!');
      const mockUser = {
        id: 'user-login-1',
        email: 'login@test.com',
        phone: null,
        name: 'Login User',
        role: 'LEARNER' as const,
        passwordHash,
        pinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        language: 'en',
        isMinor: false,
        parentConsentGiven: false,
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@test.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('login@test.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 on incorrect password', async () => {
      const passwordHash = await hashPassword('DifferentPassword123!');
      const mockUser = {
        id: 'user-login-2',
        email: 'login@test.com',
        phone: null,
        name: 'Login User',
        role: 'LEARNER' as const,
        passwordHash,
        pinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        language: 'en',
        isMinor: false,
        parentConsentGiven: false,
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@test.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns user profile when authenticated with bearer token', async () => {
      const token = signAccessToken({
        userId: 'user-me-1',
        role: 'LEARNER',
        email: 'me@test.com',
      });

      const mockUser = {
        id: 'user-me-1',
        email: 'me@test.com',
        phone: null,
        name: 'Me User',
        role: 'LEARNER' as const,
        passwordHash: 'hash',
        pinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        language: 'en',
        isMinor: false,
        parentConsentGiven: false,
        householdId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe('user-me-1');
    });

    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Role-Based Authorization on /api/v1/users', () => {
    it('forbids LEARNER from listing users', async () => {
      const learnerToken = signAccessToken({
        userId: 'learner-1',
        role: 'LEARNER',
        email: 'learner@test.com',
      });

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${learnerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows ADMINISTRATOR to list users', async () => {
      const adminToken = signAccessToken({
        userId: 'admin-1',
        role: 'ADMINISTRATOR',
        email: 'admin@test.com',
      });

      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users).toEqual([]);
    });
  });
});
