import { GeographicLevel } from '@prisma/client';
import type { ConfidenceLabel, OutcomeRecordDto, VerifiedOutcomeResponse } from '@saathi/shared';
import { tradeRepository } from './trade.repository.js';

class OutcomeService {
  /**
   * Pure confidence scoring rule based on geographic proximity, sample size, and verified count.
   *
   * Threshold rules:
   * - BLOCK:
   *   - sampleSize >= 100 & verifiedCount >= 50 => HIGH
   *   - sampleSize >= 30 => MEDIUM
   *   - sampleSize < 30 => INSUFFICIENT (triggers fallback)
   * - DISTRICT:
   *   - sampleSize >= 100 & verifiedCount >= 40 => HIGH
   *   - sampleSize >= 30 => MEDIUM
   *   - sampleSize < 30 => INSUFFICIENT (triggers fallback)
   * - STATE:
   *   - sampleSize >= 50 => MEDIUM
   *   - sampleSize < 50 => LOW
   * - NATIONAL:
   *   - Always LOW (broad aggregate, lacks local granularity)
   */
  public evaluateConfidence(
    level: GeographicLevel,
    sampleSize: number,
    verifiedCount: number,
  ): { label: ConfidenceLabel; sufficientForLevel: boolean } {
    if (sampleSize <= 0) {
      return { label: 'NONE', sufficientForLevel: false };
    }

    switch (level) {
      case GeographicLevel.BLOCK:
        if (sampleSize >= 100 && verifiedCount >= 50) {
          return { label: 'HIGH', sufficientForLevel: true };
        }
        if (sampleSize >= 30) {
          return { label: 'MEDIUM', sufficientForLevel: true };
        }
        return { label: 'LOW', sufficientForLevel: false };

      case GeographicLevel.DISTRICT:
        if (sampleSize >= 100 && verifiedCount >= 40) {
          return { label: 'HIGH', sufficientForLevel: true };
        }
        if (sampleSize >= 30) {
          return { label: 'MEDIUM', sufficientForLevel: true };
        }
        return { label: 'LOW', sufficientForLevel: false };

      case GeographicLevel.STATE:
        if (sampleSize >= 50) {
          return { label: 'MEDIUM', sufficientForLevel: true };
        }
        return { label: 'LOW', sufficientForLevel: true };

      case GeographicLevel.NATIONAL:
      default:
        return { label: 'LOW', sufficientForLevel: true };
    }
  }

  /**
   * Executes the multi-tier fallback ladder:
   * Tier 1: BLOCK
   * Tier 2: DISTRICT
   * Tier 3: STATE
   * Tier 4: NATIONAL
   * Tier 5: NONE
   */
  async resolveOutcomeWithFallback(
    trade: { id: string; code: string; titleEn: string; titleHi: string },
    state: string,
    district?: string,
    block?: string,
  ): Promise<VerifiedOutcomeResponse> {
    const requestedLevel: GeographicLevel = block
      ? GeographicLevel.BLOCK
      : district
        ? GeographicLevel.DISTRICT
        : GeographicLevel.STATE;

    // 1. Try BLOCK level if block is requested
    if (block && district) {
      const blockRecord = await tradeRepository.findOutcomeByLevel(
        trade.id,
        GeographicLevel.BLOCK,
        state,
        district,
        block,
      );

      if (blockRecord) {
        const { label, sufficientForLevel } = this.evaluateConfidence(
          GeographicLevel.BLOCK,
          blockRecord.sampleSize,
          blockRecord.verifiedGraduatesCount,
        );

        if (sufficientForLevel) {
          return {
            tradeId: trade.id,
            tradeCode: trade.code,
            tradeTitleEn: trade.titleEn,
            tradeTitleHi: trade.titleHi,
            record: this.formatRecordDto(blockRecord, label),
            requestedLevel,
            actualLevel: GeographicLevel.BLOCK,
            fallbackApplied: false,
            confidenceExplanationEn: `High local precision: Based on ${blockRecord.verifiedGraduatesCount} verified graduates from ${block} block.`,
            confidenceExplanationHi: `उच्च स्थानीय सटीकता: ${block} ब्लॉक के ${blockRecord.verifiedGraduatesCount} सत्यापित स्नातकों पर आधारित।`,
          };
        }
      }
    }

    // 2. Try DISTRICT level
    if (district) {
      const districtRecord = await tradeRepository.findOutcomeByLevel(
        trade.id,
        GeographicLevel.DISTRICT,
        state,
        district,
      );

      if (districtRecord) {
        const { label, sufficientForLevel } = this.evaluateConfidence(
          GeographicLevel.DISTRICT,
          districtRecord.sampleSize,
          districtRecord.verifiedGraduatesCount,
        );

        if (sufficientForLevel) {
          const fallbackReason = block
            ? `Block-level verified data for ${block} has insufficient sample count (< 30 verified graduates); displaying verified district-level outcomes for ${district}.`
            : undefined;

          return {
            tradeId: trade.id,
            tradeCode: trade.code,
            tradeTitleEn: trade.titleEn,
            tradeTitleHi: trade.titleHi,
            record: this.formatRecordDto(districtRecord, label),
            requestedLevel,
            actualLevel: GeographicLevel.DISTRICT,
            fallbackApplied: requestedLevel === GeographicLevel.BLOCK,
            fallbackReason,
            confidenceExplanationEn: `District-wide verification: Based on ${districtRecord.verifiedGraduatesCount} verified alumni across ${district} district.`,
            confidenceExplanationHi: `जिला स्तरीय सत्यापन: ${district} जिले के ${districtRecord.verifiedGraduatesCount} सत्यापित पूर्व छात्रों पर आधारित।`,
          };
        }
      }
    }

    // 3. Try STATE level
    const stateRecord = await tradeRepository.findOutcomeByLevel(
      trade.id,
      GeographicLevel.STATE,
      state,
    );

    if (stateRecord) {
      const { label } = this.evaluateConfidence(
        GeographicLevel.STATE,
        stateRecord.sampleSize,
        stateRecord.verifiedGraduatesCount,
      );

      const fallbackReason = `Local district/block samples for ${district || 'requested area'} are currently insufficient; displaying verified state-level benchmark data for ${state}.`;

      return {
        tradeId: trade.id,
        tradeCode: trade.code,
        tradeTitleEn: trade.titleEn,
        tradeTitleHi: trade.titleHi,
        record: this.formatRecordDto(stateRecord, label),
        requestedLevel,
        actualLevel: GeographicLevel.STATE,
        fallbackApplied: requestedLevel !== GeographicLevel.STATE,
        fallbackReason,
        confidenceExplanationEn: `State benchmark: Based on ${stateRecord.verifiedGraduatesCount} verified graduates across ${state}. Local block numbers are being surveyed.`,
        confidenceExplanationHi: `राज्य बेंचमार्क: ${state} के ${stateRecord.verifiedGraduatesCount} सत्यापित स्नातकों पर आधारित। स्थानीय ब्लॉक डेटा एकत्रित किया जा रहा है।`,
      };
    }

    // 4. Try NATIONAL level
    const nationalRecord = await tradeRepository.findOutcomeByLevel(
      trade.id,
      GeographicLevel.NATIONAL,
      'National',
    );

    if (nationalRecord) {
      return {
        tradeId: trade.id,
        tradeCode: trade.code,
        tradeTitleEn: trade.titleEn,
        tradeTitleHi: trade.titleHi,
        record: this.formatRecordDto(nationalRecord, 'LOW'),
        requestedLevel,
        actualLevel: GeographicLevel.NATIONAL,
        fallbackApplied: true,
        fallbackReason:
          'Local and state surveys in progress; showing national verified outcome benchmarks.',
        confidenceExplanationEn:
          'National benchmark: Indicative average salary and placement rate from national NCVT records.',
        confidenceExplanationHi:
          'राष्ट्रीय बेंचमार्क: राष्ट्रीय एनसीवीटी रिकॉर्ड से सांकेतिक वेतन और प्लेसमेंट दर।',
      };
    }

    // 5. NONE found
    return {
      tradeId: trade.id,
      tradeCode: trade.code,
      tradeTitleEn: trade.titleEn,
      tradeTitleHi: trade.titleHi,
      record: null,
      requestedLevel,
      actualLevel: null,
      fallbackApplied: true,
      fallbackReason:
        'No verified outcome data is currently recorded for this trade in the specified region.',
      confidenceExplanationEn:
        'Data collection in progress. Verified records from regional training centers will be posted soon.',
      confidenceExplanationHi:
        'डेटा संग्रहण प्रगति पर है। क्षेत्रीय प्रशिक्षण केंद्रों से सत्यापित रिकॉर्ड जल्द जोड़े जाएंगे।',
    };
  }

  private formatRecordDto(
    record: {
      id: string;
      tradeId: string;
      providerId: string | null;
      geographicLevel: GeographicLevel;
      state: string;
      district: string;
      block: string | null;
      verifiedGraduatesCount: number;
      medianSalaryMonthly: number;
      salaryRangeMin: number;
      salaryRangeMax: number;
      placementRatePercent: number;
      sampleSize: number;
      sources: string[];
      dataDate: Date;
    },
    confidenceLabel: ConfidenceLabel,
  ): OutcomeRecordDto {
    return {
      id: record.id,
      tradeId: record.tradeId,
      providerId: record.providerId,
      geographicLevel: record.geographicLevel as GeographicLevel,
      state: record.state,
      district: record.district,
      block: record.block,
      verifiedGraduatesCount: record.verifiedGraduatesCount,
      medianSalaryMonthly: record.medianSalaryMonthly,
      salaryRangeMin: record.salaryRangeMin,
      salaryRangeMax: record.salaryRangeMax,
      placementRatePercent: record.placementRatePercent,
      sampleSize: record.sampleSize,
      sources: record.sources,
      dataDate: record.dataDate.toISOString(),
      confidenceLabel,
    };
  }
}

export const outcomeService = new OutcomeService();
