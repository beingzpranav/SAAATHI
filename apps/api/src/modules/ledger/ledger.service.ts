import { ledgerRepository } from './ledger.repository.js';
import { prisma } from '../../lib/prisma.js';
import { verifyChainIntegrity } from '../../lib/cryptography.js';
import { BadRequestError } from '../../lib/errors.js';
import type { LedgerEntryDto, LedgerVerifyResponse, LedgerEventType } from '@saathi/shared';
import { LedgerEventType as PrismaLedgerEventType } from '@prisma/client';

class LedgerService {
  async recordEvent(
    userId: string,
    eventType: LedgerEventType,
    payload: unknown,
  ): Promise<LedgerEntryDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!user?.householdId) {
      throw new BadRequestError('User does not belong to a household. Please complete intake first.');
    }

    const block = await ledgerRepository.appendBlock(
      user.householdId,
      userId,
      eventType as PrismaLedgerEventType,
      payload,
    );

    return {
      id: block.id,
      householdId: block.householdId,
      userId: block.userId,
      eventType: block.eventType as LedgerEventType,
      payload: block.payload,
      payloadHash: block.payloadHash,
      previousHash: block.previousHash,
      blockHash: block.blockHash,
      sequenceNumber: block.sequenceNumber,
      createdAt: block.createdAt.toISOString(),
    };
  }

  async getHouseholdLedger(householdId: string): Promise<LedgerEntryDto[]> {
    const blocks = await ledgerRepository.getAllBlocks(householdId);

    return blocks.map((b) => ({
      id: b.id,
      householdId: b.householdId,
      userId: b.userId,
      eventType: b.eventType as LedgerEventType,
      payload: b.payload,
      payloadHash: b.payloadHash,
      previousHash: b.previousHash,
      blockHash: b.blockHash,
      sequenceNumber: b.sequenceNumber,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async verifyChain(householdId: string): Promise<LedgerVerifyResponse> {
    const blocks = await ledgerRepository.getAllBlocks(householdId);
    if (!blocks || blocks.length === 0) {
      return {
        isValid: true,
        unbrokenChainLength: 0,
        brokenAtId: null,
        timestamp: new Date().toISOString(),
      };
    }

    const verification = verifyChainIntegrity(blocks);

    return {
      isValid: verification.isValid,
      unbrokenChainLength: verification.unbrokenChainLength,
      brokenAtId: verification.brokenAtId,
      timestamp: new Date().toISOString(),
    };
  }
}

export const ledgerService = new LedgerService();
