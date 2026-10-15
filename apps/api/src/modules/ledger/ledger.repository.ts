import { prisma } from '../../lib/prisma.js';
import { LedgerEventType } from '@prisma/client';
import { hashPayload, calculateBlockHash } from '../../lib/cryptography.js';

class LedgerRepository {
  async getLatestBlock(householdId: string) {
    return prisma.consentLedger.findFirst({
      where: { householdId },
      orderBy: { sequenceNumber: 'desc' },
    });
  }

  async getAllBlocks(householdId: string) {
    return prisma.consentLedger.findMany({
      where: { householdId },
      orderBy: { sequenceNumber: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  async appendBlock(
    householdId: string,
    userId: string,
    eventType: LedgerEventType,
    payload: unknown,
  ) {
    const latest = await this.getLatestBlock(householdId);

    const sequenceNumber = latest ? latest.sequenceNumber + 1 : 1;
    const previousHash = latest ? latest.blockHash : '0'.repeat(64); // Genesis previous hash
    const payloadHash = hashPayload(payload);
    const createdAt = new Date();

    const blockHash = calculateBlockHash({
      previousHash,
      householdId,
      userId,
      eventType,
      payloadHash,
      sequenceNumber,
      createdAt,
    });

    return prisma.consentLedger.create({
      data: {
        householdId,
        userId,
        eventType,
        payload: JSON.stringify(payload),
        payloadHash,
        previousHash,
        blockHash,
        sequenceNumber,
        createdAt,
      },
    });
  }
}

export const ledgerRepository = new LedgerRepository();
