import type {
  UserProfile,
  RegisterInput,
  LoginInput,
  SupportedLanguage,
  UserRole,
} from '@saathi/shared';
import type { User } from '@prisma/client';
import { authRepository, type AuthRepository } from './auth.repository.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../lib/errors.js';
import { hashPassword, comparePassword } from '../../lib/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  createUserJwtPayload,
} from '../../lib/jwt.js';

export interface AuthTokens {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  private mapUserToProfile(user: User): UserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      language: user.language as SupportedLanguage,
      isMinor: user.isMinor,
      parentConsentGiven: user.parentConsentGiven,
      householdId: user.householdId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async register(input: RegisterInput): Promise<AuthTokens> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.repo.create({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      role: input.role,
      passwordHash,
      language: input.language,
      isMinor: input.isMinor,
      parentConsentGiven: input.parentConsentGiven,
    });

    const jwtPayload = createUserJwtPayload(user);
    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      user: this.mapUserToProfile(user),
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const jwtPayload = createUserJwtPayload(user);
    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      user: this.mapUserToProfile(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    const user = await this.repo.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User session not found.');
    }

    const jwtPayload = createUserJwtPayload(user);
    const newAccessToken = signAccessToken(jwtPayload);
    const newRefreshToken = signRefreshToken({ userId: user.id });

    return {
      user: this.mapUserToProfile(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getCurrentUser(userId: string): Promise<UserProfile> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    return this.mapUserToProfile(user);
  }
}

export const authService = new AuthService();
