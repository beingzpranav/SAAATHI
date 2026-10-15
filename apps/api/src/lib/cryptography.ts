import { createHash } from 'node:crypto';

export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function hashPayload(payload: unknown): string {
  const normalized = JSON.stringify(payload, Object.keys(payload as object).sort());
  return sha256(normalized);
}

export interface BlockParams {
  previousHash: string;
  householdId: string;
  userId: string;
  eventType: string;
  payloadHash: string;
  sequenceNumber: number;
  createdAt: Date | string;
}

export function calculateBlockHash(params: BlockParams): string {
  const timestampIso =
    params.createdAt instanceof Date ? params.createdAt.toISOString() : new Date(params.createdAt).toISOString();

  const dataToHash = [
    params.previousHash,
    params.householdId,
    params.userId,
    params.eventType,
    params.payloadHash,
    params.sequenceNumber.toString(),
    timestampIso,
  ].join('|');

  return sha256(dataToHash);
}

export interface ChainVerificationResult {
  isValid: boolean;
  unbrokenChainLength: number;
  brokenAtId: string | null;
}

export function verifyChainIntegrity(
  entries: Array<{
    id: string;
    previousHash: string;
    householdId: string;
    userId: string;
    eventType: string;
    payloadHash: string;
    blockHash: string;
    sequenceNumber: number;
    createdAt: Date;
  }>,
): ChainVerificationResult {
  if (entries.length === 0) {
    return { isValid: true, unbrokenChainLength: 0, brokenAtId: null };
  }

  // Sorted by sequenceNumber ascending
  const sorted = [...entries].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]!;

    // 1. Verify genesis block or link to previous block
    if (i === 0) {
      if (current.sequenceNumber !== 1) {
        return { isValid: false, unbrokenChainLength: 0, brokenAtId: current.id };
      }
    } else {
      const prev = sorted[i - 1]!;
      if (current.previousHash !== prev.blockHash) {
        return { isValid: false, unbrokenChainLength: i, brokenAtId: current.id };
      }
      if (current.sequenceNumber !== prev.sequenceNumber + 1) {
        return { isValid: false, unbrokenChainLength: i, brokenAtId: current.id };
      }
    }

    // 2. Re-calculate block hash and compare
    const expectedHash = calculateBlockHash({
      previousHash: current.previousHash,
      householdId: current.householdId,
      userId: current.userId,
      eventType: current.eventType,
      payloadHash: current.payloadHash,
      sequenceNumber: current.sequenceNumber,
      createdAt: current.createdAt,
    });

    if (current.blockHash !== expectedHash) {
      return { isValid: false, unbrokenChainLength: i, brokenAtId: current.id };
    }
  }

  return {
    isValid: true,
    unbrokenChainLength: sorted.length,
    brokenAtId: null,
  };
}
