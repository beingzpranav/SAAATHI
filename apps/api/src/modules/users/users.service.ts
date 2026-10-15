import type { UserProfile, UserRole, SupportedLanguage } from '@saathi/shared';
import { usersRepository, type UsersRepository } from './users.repository.js';
import { NotFoundError } from '../../lib/errors.js';

export class UsersService {
  constructor(private readonly repo: UsersRepository = usersRepository) {}

  async getUserById(id: string): Promise<UserProfile> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

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

  async listUsers(limit = 20): Promise<UserProfile[]> {
    const users = await this.repo.findAll(limit);
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role as UserRole,
      language: u.language as SupportedLanguage,
      isMinor: u.isMinor,
      parentConsentGiven: u.parentConsentGiven,
      householdId: u.householdId,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));
  }
}

export const usersService = new UsersService();
