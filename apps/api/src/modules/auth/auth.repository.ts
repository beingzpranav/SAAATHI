import type { User, Prisma, ConsentLedger } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
    });
  }

  async recordConsent(data: Prisma.ConsentLedgerCreateInput): Promise<ConsentLedger> {
    return prisma.consentLedger.create({
      data,
    });
  }
}

export const authRepository = new AuthRepository();
