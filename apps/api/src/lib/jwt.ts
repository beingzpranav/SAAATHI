import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import type { JwtAccessPayload, UserRole } from '@saathi/shared';
import { env } from '../config/env.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const ACCESS_COOKIE_NAME = 'saathi_access';
export const REFRESH_COOKIE_NAME = 'saathi_refresh';

export const getCookieOptions = (maxAgeMs?: number): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: maxAgeMs,
});

export function signAccessToken(payload: JwtAccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
}

export function createUserJwtPayload(user: {
  id: string;
  role: string;
  email: string;
}): JwtAccessPayload {
  return {
    userId: user.id,
    role: user.role as UserRole,
    email: user.email,
  };
}
