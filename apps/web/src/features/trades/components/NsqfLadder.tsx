import React from 'react';
import type { NsqfLadderStep } from '@saathi/shared';
import { useTranslation } from 'react-i18next';
import { Award, ChevronRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/cn.js';

export interface NsqfLadderProps {
  steps: NsqfLadderStep[];
  tradeTitle?: string;
  className?: string;
}

export const NsqfLadder: React.FC<NsqfLadderProps> = ({ steps, tradeTitle, className }) => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  return (
    <div
      className={cn(
        'w-full bg-[#FFFDF9] dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430] rounded-xl p-4 sm:p-6 shadow-sm',
        className,
      )}
      aria-label={t('jointRoom.nsqfCareerLadder')}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E8DDD2] dark:border-[#3D3430]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
              {t('jointRoom.nsqfCareerLadder')}
            </h3>
          </div>
          {tradeTitle && (
            <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5">
              {isHi
                ? `${tradeTitle} के लिए स्तरवार प्रगति`
                : `Step-by-step career milestones for ${tradeTitle}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#6A5B55] dark:text-[#B8AAA3] bg-[#F7F3EE] dark:bg-[#2A2320] px-3 py-1.5 rounded-md self-start sm:self-auto">
          <Award className="w-4 h-4 text-[#EFA531]" aria-hidden="true" />
          <span>
            {t('ladder.framework')}
          </span>
        </div>
      </div>

      {/* SVG Ladder Visual Flow */}
      <div className="relative flex flex-col gap-4">
        {steps.map((step, index) => {
          const isHighest = index === steps.length - 1;
          const isStart = step.isStartingStep;

          return (
            <div
              key={step.level}
              className={cn(
                'relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all',
                isStart
                  ? 'bg-[#FDF9EE] dark:bg-[#2F2718] border-[#EFA531] shadow-sm ring-1 ring-[#EFA531]/40'
                  : 'bg-white dark:bg-[#261F1B] border-[#E8DDD2] dark:border-[#3D3430] hover:border-[#C4562B]/40',
              )}
            >
              {/* Level indicator & Role */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={cn(
                    'w-11 h-11 shrink-0 rounded-lg flex flex-col items-center justify-center font-bold font-mono text-xs border',
                    isStart
                      ? 'bg-[#EFA531] text-[#1F1A17] border-[#EFA531]'
                      : isHighest
                        ? 'bg-[#2F7D5C] text-white border-[#2F7D5C]'
                        : 'bg-[#F5EFE8] dark:bg-[#342A24] text-[#7A361C] dark:text-[#EFA531] border-[#E8DDD2] dark:border-[#4A3D36]',
                  )}
                  aria-label={`Level ${step.level}`}
                >
                  <span className="text-[10px] uppercase leading-none text-current opacity-80">
                    LVL
                  </span>
                  <span className="text-base leading-none font-extrabold">{step.level}</span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif text-base sm:text-lg font-bold text-[#1F1A17] dark:text-[#FFFDF9] truncate">
                      {isHi ? step.titleHi : step.titleEn}
                    </h4>
                    {isStart && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#EFA531]/20 text-[#855403] dark:text-[#FAD58F] border border-[#EFA531]/40">
                        <CheckCircle2 className="w-3 h-3 text-[#EFA531]" aria-hidden="true" />
                        {t('ladder.starting')}
                      </span>
                    )}
                    {isHighest && (
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-[#2F7D5C]/15 text-[#1E573F] dark:text-[#64C89D] border border-[#2F7D5C]/30">
                        {t('ladder.lead')}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#4A3D37] dark:text-[#D1C6BD] mt-1 leading-snug">
                    {isHi ? step.roleHi : step.roleEn}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#7A6B63] dark:text-[#A89A92]">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-semibold">{t('ladder.eligibility')}</span>
                      <span>{isHi ? step.minExperienceHi : step.minExperienceEn}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Median Monthly Salary */}
              <div className="w-full sm:w-auto sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8DDD2] dark:border-[#3D3430] shrink-0">
                <span className="block text-xs uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3]">
                  {t('ladder.median')}
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-[#2F7D5C] dark:text-[#50AF85]">
                  ₹{step.medianSalaryMonthly.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-[#6A5B55] dark:text-[#B8AAA3]">
                    {t('tradeDetail.perMonth')}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-[#E8DDD2] dark:border-[#3D3430] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6A5B55] dark:text-[#B8AAA3]">
        <div className="flex items-center gap-1.5">
          <ChevronRight className="w-4 h-4 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
          <span>
            {t('ladder.progression')}
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#7A6B63] dark:text-[#A89A92]">
          {t('ladder.reference')}
        </span>
      </div>
    </div>
  );
};
