import { concernRepository } from './concern.repository.js';
import { ledgerService } from '../ledger/ledger.service.js';
import { prisma } from '../../lib/prisma.js';
import { MAPPING_QUESTIONS } from './mapping-questions.data.js';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../lib/errors.js';
import type {
  SaveConcernInput,
  ConcernDto,
  MappingQuestion,
  ConcernCategory,
} from '@saathi/shared';

class ConcernService {
  getQuestionsForRole(role: 'LEARNER' | 'PARENT'): MappingQuestion[] {
    return MAPPING_QUESTIONS.filter((q) => q.targetRole === role);
  }

  async saveConcern(userId: string, input: SaveConcernInput): Promise<ConcernDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!user?.householdId) {
      throw new BadRequestError('User does not belong to a household. Please complete intake first.');
    }

    const concern = await concernRepository.upsertConcern(
      userId,
      user.householdId,
      input,
    );

    return this.formatConcernDto(concern);
  }

  async getMyConcerns(userId: string): Promise<ConcernDto[]> {
    const concerns = await concernRepository.findByUserId(userId);
    return concerns.map((c) => this.formatConcernDto(c));
  }

  async updatePostScore(
    userId: string,
    concernId: string,
    postScore: number,
  ): Promise<ConcernDto> {
    const concern = await concernRepository.findById(concernId);
    if (!concern) {
      throw new NotFoundError('Concern not found.');
    }

    if (concern.userId !== userId) {
      throw new UnauthorizedError('You are not authorized to update this concern.');
    }

    const updated = await concernRepository.updatePostScore(concernId, postScore);

    // Track sentiment shift event in SystemEvent table
    const shift = concern.preScore - postScore; // Positive shift indicates reduced worry/anxiety
    await prisma.systemEvent.create({
      data: {
        eventType: 'CONCERN_SCORE_SHIFT',
        aggregateId: concern.householdId,
        concernCode: concern.category,
        sentimentShift: shift,
      },
    });

    return this.formatConcernDto(updated);
  }

  async toggleShare(
    userId: string,
    concernId: string,
    isShared: boolean,
  ): Promise<ConcernDto> {
    const concern = await concernRepository.findById(concernId);
    if (!concern) {
      throw new NotFoundError('Concern not found.');
    }

    if (concern.userId !== userId) {
      throw new UnauthorizedError('You are not authorized to share this concern.');
    }

    const updated = await concernRepository.setShareStatus(concernId, isShared);

    // If sharing to joint room, cryptographically record in Consent Ledger
    if (isShared) {
      await ledgerService.recordEvent(userId, 'SHARE_CONCERN', {
        concernId: updated.id,
        category: updated.category,
        questionKey: updated.questionKey,
        action: 'CONSENT_TO_SHARE_IN_JOINT_ROOM',
        timestamp: new Date().toISOString(),
      });
    }

    return this.formatConcernDto(updated);
  }

  /**
   * CRITICAL PRIVACY ASSURANCE:
   * Returns ONLY concerns where `isShared: true`.
   * Unshared private concerns are strictly omitted.
   */
  async getHouseholdSharedConcerns(householdId: string): Promise<ConcernDto[]> {
    const sharedConcerns = await concernRepository.findSharedByHouseholdId(householdId);
    return sharedConcerns.map((c) => this.formatConcernDto(c));
  }

  private formatConcernDto(concern: {
    id: string;
    userId: string;
    householdId: string;
    category: string;
    questionKey: string;
    answerValue: string;
    preScore: number;
    postScore: number | null;
    isShared: boolean;
    sharedAt: Date | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ConcernDto {
    return {
      id: concern.id,
      userId: concern.userId,
      householdId: concern.householdId,
      category: concern.category as ConcernCategory,
      questionKey: concern.questionKey,
      answerValue: concern.answerValue,
      preScore: concern.preScore,
      postScore: concern.postScore,
      isShared: concern.isShared,
      sharedAt: concern.sharedAt ? concern.sharedAt.toISOString() : null,
      resolvedAt: concern.resolvedAt ? concern.resolvedAt.toISOString() : null,
      createdAt: concern.createdAt.toISOString(),
      updatedAt: concern.updatedAt.toISOString(),
    };
  }
}

export const concernService = new ConcernService();
