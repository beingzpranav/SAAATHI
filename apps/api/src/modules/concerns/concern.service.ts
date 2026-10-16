import { concernRepository } from './concern.repository.js';
import { ledgerService } from '../ledger/ledger.service.js';
import { prisma } from '../../lib/prisma.js';
import { MAPPING_QUESTIONS } from './mapping-questions.data.js';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';
import type {
  SaveConcernInput,
  ConcernDto,
  MappingQuestion,
  ConcernCategory,
  CheckpointEvaluationItem,
  CheckpointEvaluationResponse,
} from '@saathi/shared';


class ConcernService {
  getQuestionsForRole(role: 'LEARNER' | 'PARENT'): MappingQuestion[] {
    return MAPPING_QUESTIONS.filter((q) => q.targetRole === role);
  }

  async saveConcern(userId: string, input: SaveConcernInput): Promise<ConcernDto> {
    logger.info({ userId, questionKey: input.questionKey }, 'Creating concern');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, householdId: true, name: true, role: true },
    });

    if (!user?.householdId) {
      throw new BadRequestError('User does not belong to a household. Please complete intake first.');
    }

    // DEBUG: Log the user creating the concern
    logger.debug({ 
      creatingUserId: userId, 
      userName: user.name,
      userRole: user.role,
      householdId: user.householdId 
    }, 'User creating concern');

    const concern = await concernRepository.upsertConcern(
      userId,
      user.householdId,
      input,
    );

    logger.info({ concernId: concern.id, userId: concern.userId }, 'Concern created successfully');

    return this.formatConcernDto(concern);
  }

  async getMyConcerns(userId: string): Promise<ConcernDto[]> {
    logger.info({ userId }, 'Fetching concerns for user');
    const concerns = await concernRepository.findByUserId(userId);
    
    // DEBUG: Log each concern's userId to verify privacy isolation
    concerns.forEach(concern => {
      logger.debug({ 
        concernId: concern.id, 
        concernUserId: concern.userId,
        requestingUserId: userId,
        match: concern.userId === userId 
      }, 'Concern privacy check');
    });
    
    logger.info({ count: concerns.length, userId }, 'Found concerns');
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

  async evaluateCheckpoint(
    userId: string,
    evaluations: CheckpointEvaluationItem[],
  ): Promise<CheckpointEvaluationResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!user?.householdId) {
      throw new BadRequestError('User does not belong to a household.');
    }

    const householdId = user.householdId;
    let resolvedCount = 0;
    let unresolvedCount = 0;

    for (const ev of evaluations) {
      const concern = await prisma.concern.findUnique({
        where: { id: ev.concernId },
      });

      if (concern && concern.householdId === householdId) {
        const isResolved = ev.isResolved || ev.postScore <= 2;
        await prisma.concern.update({
          where: { id: ev.concernId },
          data: {
            postScore: ev.postScore,
            resolvedAt: isResolved ? new Date() : null,
          },
        });

        if (isResolved) {
          resolvedCount++;
        } else {
          unresolvedCount++;
        }
      }
    }

    const totalEvaluated = resolvedCount + unresolvedCount;
    const readinessScore = totalEvaluated > 0 ? Math.round((resolvedCount / totalEvaluated) * 100) : 0;
    const allResolved = unresolvedCount === 0 && resolvedCount > 0;
    const readyForDecisionCard = readinessScore >= 70;

    await ledgerService.recordEvent(userId, 'DECISION_AGREEMENT', {
      milestone: 'CONCERNS_ANSWERED_CHECKPOINT',
      resolvedCount,
      unresolvedCount,
      readinessScore,
      readyForDecisionCard,
      timestamp: new Date().toISOString(),
    });

    const recommendedActions: string[] = [];
    if (readyForDecisionCard) {
      recommendedActions.push('Family alignment achieved. Proceed to issue official Family Decision Card.');
      recommendedActions.push('Confirm admission schedule and UP Scholarship portal registration.');
    } else {
      recommendedActions.push(
        `${unresolvedCount} concerns remain unaddressed. We recommend booking a 15-minute live consultation with a certified counsellor.`,
      );
    }

    return {
      householdId,
      allResolved,
      resolvedCount,
      unresolvedCount,
      readinessScore,
      readyForDecisionCard,
      recommendedActions,
    };
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
