import { createHash } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/errors.js';

import { ledgerService } from '../ledger/ledger.service.js';
import type {
  DecisionCardDto,
  SmsSummaryResponse,
  CreateDecisionCardSchema,
} from '@saathi/shared';

export class DecisionCardService {
  /**
   * Issues or updates a Family Decision Card with cryptographic verification and ledger entry.
   */
  async createDecisionCard(
    userId: string,
    householdId: string,
    input: CreateDecisionCardSchema,
  ): Promise<DecisionCardDto> {
    const trade = await prisma.trade.findUnique({
      where: { id: input.chosenTradeId },
    });
    if (!trade) {
      throw new NotFoundError('Selected trade not found.');
    }

    const provider = await prisma.provider.findUnique({
      where: { id: input.chosenProviderId },
    });
    if (!provider) {
      throw new NotFoundError('Selected training provider not found.');
    }

    // Cryptographic hash over agreed family decision elements
    const hashPayload = [
      householdId,
      trade.id,
      provider.id,
      input.agreedActions.slice().sort().join('|'),
      new Date().toISOString().split('T')[0],
    ].join(':');

    const verificationHash = createHash('sha256').update(hashPayload).digest('hex');

    const card = await prisma.decisionCard.upsert({
      where: { householdId },
      update: {
        chosenTradeId: input.chosenTradeId,
        chosenProviderId: input.chosenProviderId,
        agreedActions: input.agreedActions,
        openConcerns: input.openConcerns,
        counsellorNotes: input.counsellorNotes || null,
        counsellorContact: input.counsellorContact || null,
        verificationHash,
      },
      create: {
        householdId,
        chosenTradeId: input.chosenTradeId,
        chosenProviderId: input.chosenProviderId,
        agreedActions: input.agreedActions,
        openConcerns: input.openConcerns,
        counsellorNotes: input.counsellorNotes || null,
        counsellorContact: input.counsellorContact || null,
        verificationHash,
      },
      include: {
        chosenTrade: true,
        chosenProvider: true,
        household: true,
      },
    });

    // Record agreement block in immutable digital consent ledger
    await ledgerService.recordEvent(userId, 'DECISION_AGREEMENT', {
      action: 'FAMILY_DECISION_CARD_SIGNED',
      decisionCardId: card.id,
      chosenTradeCode: trade.code,
      chosenProviderName: provider.name,
      verificationHash,
      agreedActionsCount: input.agreedActions.length,
      timestamp: new Date().toISOString(),
    });

    return this.formatDecisionCardDto(card);
  }

  /**
   * Retrieves an issued Decision Card by household ID.
   */
  async getDecisionCard(householdId: string): Promise<DecisionCardDto> {
    const card = await prisma.decisionCard.findUnique({
      where: { householdId },
      include: {
        chosenTrade: true,
        chosenProvider: true,
        household: true,
      },
    });

    if (!card) {
      throw new NotFoundError('No Decision Card has been generated for this household yet.');
    }

    return this.formatDecisionCardDto(card);
  }

  /**
   * Generates formatted SMS summary strings for the family in Hindi and English.
   */
  async generateSmsSummary(householdId: string): Promise<SmsSummaryResponse> {
    const card = await this.getDecisionCard(householdId);
    const verificationCode = card.verificationHash.slice(0, 8).toUpperCase();
    const verificationUrl = `https://saathi.gov.in/verify/${verificationCode}`;

    const smsTextEn = `[SAATHI SIH 2026] Family Decision Card Confirmed. Trade: ${card.chosenTradeTitleEn} (NSQF Level ${card.nsqfLevel}). Center: ${card.chosenProviderName}. Govt Stipend: ₹${card.napsStipendMonthly.toLocaleString('en-IN')}/mo. Verification Code: ${verificationCode}. View official card: ${verificationUrl}`;

    const smsTextHi = `[साथी SIH 2026] पारिवारिक निर्णय पत्र जारी। ट्रेड: ${card.chosenTradeTitleHi} (एनएसक्यूएफ स्तर ${card.nsqfLevel})। केंद्र: ${card.chosenProviderName}। सरकारी मानदेय: ₹${card.napsStipendMonthly.toLocaleString('en-IN')}/माह। सत्यापन कोड: ${verificationCode}। कार्ड देखें: ${verificationUrl}`;

    return {
      smsTextEn,
      smsTextHi,
      recipientPhone: card.chosenProviderContact || 'Household Primary Phone',
      verificationCode,
      verificationUrl,
    };
  }

  private formatDecisionCardDto(card: {
    id: string;
    householdId: string;
    chosenTradeId: string;
    chosenProviderId: string;
    agreedActions: string[];
    openConcerns: string[];
    counsellorNotes: string | null;
    counsellorContact: string | null;
    verificationHash: string;
    createdAt: Date;
    chosenTrade: { code: string; titleEn: string; titleHi: string; nsqfLevel: number };
    chosenProvider: {
      name: string;
      type: string;
      address: string;
      district: string;
      state: string;
      contactPhone?: string | null;
    };
    household?: { incomeBand: string } | null;
  }): DecisionCardDto {
    const incomeBand = card.household?.incomeBand || 'BELOW_1_5L';

    const feeWaiverEligible = incomeBand === 'BELOW_1_5L' || incomeBand === '1_5L_TO_3L';

    return {
      id: card.id,
      householdId: card.householdId,
      chosenTradeId: card.chosenTradeId,
      chosenTradeCode: card.chosenTrade.code,
      chosenTradeTitleEn: card.chosenTrade.titleEn,
      chosenTradeTitleHi: card.chosenTrade.titleHi,
      nsqfLevel: card.chosenTrade.nsqfLevel,
      chosenProviderId: card.chosenProviderId,
      chosenProviderName: card.chosenProvider.name,
      chosenProviderType: card.chosenProvider.type,
      chosenProviderAddress: `${card.chosenProvider.address}, ${card.chosenProvider.district}, ${card.chosenProvider.state}`,
      chosenProviderContact: card.chosenProvider.contactPhone || card.counsellorContact,
      agreedActions: card.agreedActions,
      openConcerns: card.openConcerns,
      counsellorNotes: card.counsellorNotes,
      counsellorContact: card.counsellorContact,
      verificationHash: card.verificationHash,
      feeWaiverEligible,
      napsStipendMonthly: 2500,
      createdAt: card.createdAt.toISOString(),
    };
  }
}

export const decisionCardService = new DecisionCardService();
