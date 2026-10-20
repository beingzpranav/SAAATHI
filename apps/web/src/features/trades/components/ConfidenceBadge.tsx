import React from 'react';
import type { ConfidenceLabel, GeographicLevel } from '@saathi/shared';
import { Badge } from '../../../components/ui/Badge.js';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/cn.js';

export interface ConfidenceBadgeProps {
  label: ConfidenceLabel;
  geographicLevel?: GeographicLevel;
  className?: string;
  showIcon?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  label,
  geographicLevel,
  className,
  showIcon = true,
}) => {
  const { t } = useTranslation();

  const badgeConfig: Record<
    ConfidenceLabel,
    {
      variant: 'confidence-high' | 'confidence-medium' | 'confidence-low' | 'confidence-none';
      key: string;
      Icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    HIGH: {
      variant: 'confidence-high',
      key: 'confidence.high',
      Icon: ShieldCheck,
    },
    MEDIUM: {
      variant: 'confidence-medium',
      key: 'confidence.medium',
      Icon: ShieldCheck,
    },
    LOW: {
      variant: 'confidence-low',
      key: 'confidence.low',
      Icon: ShieldAlert,
    },
    NONE: {
      variant: 'confidence-none',
      key: 'confidence.none',
      Icon: HelpCircle,
    },
  };

  const config = badgeConfig[label] || badgeConfig.NONE;
  const Icon = config.Icon;

  return (
    <Badge
      variant={config.variant}
      className={cn('inline-flex items-center gap-1.5 font-medium', className)}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{t(config.key)}</span>
      {geographicLevel && (
        <span className="text-[11px] opacity-75 font-mono">[{geographicLevel}]</span>
      )}
    </Badge>
  );
};

export interface FallbackNoticeProps {
  actualLevel: GeographicLevel;
  requestedLevel: GeographicLevel;
  reason?: string | null;
  className?: string;
}

export const FallbackNotice: React.FC<FallbackNoticeProps> = ({
  actualLevel,
  reason,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 p-3 rounded-lg bg-[#FDF9EE] dark:bg-[#2A2315] border border-[#EFA531]/40 text-xs text-[#6B4605] dark:text-[#F8C26E]',
        className,
      )}
      role="status"
    >
      <AlertTriangle className="w-4 h-4 text-[#EFA531] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <span className="font-bold">
          {t('confidence.transparency', { level: actualLevel })}
        </span>
        {reason && <p className="mt-0.5 text-[#7A5A1B] dark:text-[#E2B774]">{reason}</p>}
      </div>
    </div>
  );
};
