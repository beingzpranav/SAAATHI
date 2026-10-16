import { prisma } from '../../lib/prisma.js';
import type { SaveConcernInput } from '@saathi/shared';

class ConcernRepository {
  async upsertConcern(
    userId: string,
    householdId: string,
    input: SaveConcernInput,
  ) {
    const existing = await prisma.concern.findFirst({
      where: {
        userId,
        householdId,
        questionKey: input.questionKey,
      },
    });

    if (existing) {
      return prisma.concern.update({
        where: { id: existing.id },
        data: {
          category: input.category,
          answerValue: input.answerValue,
          preScore: input.preScore,
        },
      });
    }

    return prisma.concern.create({
      data: {
        userId,
        householdId,
        category: input.category,
        questionKey: input.questionKey,
        answerValue: input.answerValue,
        preScore: input.preScore,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.concern.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(concernId: string) {
    return prisma.concern.findUnique({
      where: { id: concernId },
    });
  }

  async updatePostScore(concernId: string, postScore: number) {
    return prisma.concern.update({
      where: { id: concernId },
      data: {
        postScore,
        resolvedAt: new Date(),
      },
    });
  }

  async setShareStatus(concernId: string, isShared: boolean) {
    return prisma.concern.update({
      where: { id: concernId },
      data: {
        isShared,
        sharedAt: isShared ? new Date() : null,
      },
    });
  }

  async deleteById(concernId: string) {
    return prisma.concern.delete({
      where: { id: concernId },
    });
  }

  /**
   * CRITICAL PRIVACY GUARANTEE:
   * Only records with `isShared: true` are returned to the household or joint agenda.
   * Private unshared records are strictly quarantined.
   */
  async findSharedByHouseholdId(householdId: string) {
    return prisma.concern.findMany({
      where: {
        householdId,
        isShared: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { sharedAt: 'asc' },
    });
  }
}

export const concernRepository = new ConcernRepository();
