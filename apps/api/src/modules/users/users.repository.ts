import type { User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(limit = 20): Promise<User[]> {
    return prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const usersRepository = new UsersRepository();
