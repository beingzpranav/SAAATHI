import React from 'react';
import type { TradeSummary, VerifiedOutcomeResponse, HouseholdSummary } from '@saathi/shared';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { ConfidenceBadge, FallbackNotice } from './ConfidenceBadge.js';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, GraduationCap, ArrowRight, Banknote, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/cn.js';

export interface TradeCardProps {
  trade: TradeSummary;
  outcome?: VerifiedOutcomeResponse | null;
  household?: HouseholdSummary | null;
  className?: string;
}

export const TradeCard: React.FC<TradeCardProps> = ({ trade, outcome, household, className }) => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const record = outcome?.record;
  const costFraming = household?.costFraming;

  return (
    <Card
      data-testid="trade-card"
      className={cn(
        'flex flex-col justify-between hover:shadow-md transition-shadow border-[#E8DDD2] dark:border-[#3D3430] bg-[#FFFDF9] dark:bg-[#1F1A17]',
        className,
      )}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F4EDE4] dark:bg-[#2F2622] text-[#7A361C] dark:text-[#EFA531]">
              NSQF Level {trade.nsqfLevel}
            </span>
            {outcome?.record?.confidenceLabel ? (
              <ConfidenceBadge
                label={outcome.record.confidenceLabel}
                geographicLevel={outcome.actualLevel || undefined}
              />
            ) : null}
          </div>

          <CardTitle className="font-serif text-xl text-[#1F1A17] dark:text-[#FFFDF9]">
            {isHi ? trade.titleHi : trade.titleEn}
          </CardTitle>

          <CardDescription className="text-xs uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3] font-medium mt-1">
            {trade.sector}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <p className="text-[#4A3D37] dark:text-[#D1C6BD] text-xs sm:text-sm line-clamp-2">
            {isHi ? trade.descriptionHi : trade.descriptionEn}
          </p>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-lg bg-[#FAF6F0] dark:bg-[#28211D] border border-[#E8DDD2]/60 dark:border-[#3D3430]/60">
            <div className="flex items-center gap-1.5 text-[#554640] dark:text-[#C5B8B1]">
              <Clock
                className="w-3.5 h-3.5 text-[#C4562B] dark:text-[#E27E53]"
                aria-hidden="true"
              />
              <span>
                {trade.durationMonths} {t('tradeDetail.months')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#554640] dark:text-[#C5B8B1]">
              <GraduationCap
                className="w-3.5 h-3.5 text-[#C4562B] dark:text-[#E27E53]"
                aria-hidden="true"
              />
              <span className="truncate">{trade.minEducation}</span>
            </div>
          </div>

          {/* Verified Outcomes Highlight - MEDIAN ONLY, NO AVERAGES */}
          {record ? (
            <div className="space-y-2 pt-2 border-t border-[#E8DDD2] dark:border-[#3D3430]">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3]">
                    {t('trades.verifiedMedianSalary')}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-xl font-bold text-[#2F7D5C] dark:text-[#50AF85]">
                      ₹{record.medianSalaryMonthly.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#6A5B55] dark:text-[#B8AAA3]">
                      {t('trades.perMonth')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[11px] uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3]">
                    {t('trades.placementRate')}
                  </span>
                  <span className="font-mono text-lg font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
                    {record.placementRatePercent}%
                  </span>
                </div>
              </div>

              {/* Salary Range */}
              <div className="flex items-center justify-between text-xs text-[#6A5B55] dark:text-[#B8AAA3]">
                <span>{t('trades.salaryRange')}</span>
                <span className="font-mono font-medium text-[#3A2E2A] dark:text-[#E2D8D1]">
                  ₹{record.salaryRangeMin.toLocaleString('en-IN')} – ₹
                  {record.salaryRangeMax.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7A6B63] dark:text-[#A89A92]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D5C]" aria-hidden="true" />
                  <span>
                    {record.verifiedGraduatesCount} {t('trades.verifiedAlumni')}
                  </span>
                </span>
                <span className="font-mono text-[10px]">
                  {record.sources[0]?.split(' ')[0] || 'Govt MIS'}
                </span>
              </div>

              {/* Fallback Notice if triggered */}
              {outcome.fallbackApplied && outcome.actualLevel && (
                <FallbackNotice
                  actualLevel={outcome.actualLevel}
                  requestedLevel={outcome.requestedLevel}
                  reason={outcome.fallbackReason}
                />
              )}
            </div>
          ) : (
            <div className="text-xs text-[#7A6B63] dark:text-[#A89A92] py-2 italic">
              {t('trades.verificationInProgress')}
            </div>
          )}

          {/* Dynamic Personalized Cost Framing */}
          {costFraming && (
            <div className="p-2.5 rounded-lg bg-[#F8EDE7] dark:bg-[#34221A] border border-[#C4562B]/20 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#8E320F] dark:text-[#EFA531]">
                <Banknote className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isHi ? costFraming.headlineHi : costFraming.headlineEn}</span>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="pt-3 border-t border-[#E8DDD2] dark:border-[#3D3430]">
        <Button variant="outline" className="w-full flex items-center justify-center gap-2" asChild>
          <Link to={`/trades/${trade.code}`}>
            <span>{t('trades.viewLadder')}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
