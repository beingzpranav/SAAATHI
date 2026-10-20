import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { ConcernDto } from '@saathi/shared';
import { apiClient } from '../../lib/apiClient.js';
import { useSessionStore } from '../../stores/session.store.js';
import { cn } from '../../lib/cn.js';

interface SharedConcernsViewProps {
  onConcernClick?: (concern: ConcernDto) => void;
}

const ScorePill: React.FC<{ score: number | null; label: string }> = ({ score, label }) => {
  if (score === null || score === undefined) return null;
  const color =
    score <= 2
      ? 'var(--color-success)'
      : score === 3
        ? 'var(--color-student)'
        : 'var(--color-error)';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}15`,
      }}
    >
      <span>{label}:</span>
      <span>{score}/5</span>
    </span>
  );
};

export const SharedConcernsView: React.FC<SharedConcernsViewProps> = ({ onConcernClick }) => {
  const { t } = useTranslation();
  const { household, user } = useSessionStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['shared-concerns', household?.id],
    queryFn: () => apiClient.get<ConcernDto[]>(`/concerns/household/${household?.id}/shared`),
    enabled: Boolean(household?.id),
    staleTime: 30 * 1000,
  });

  const concerns = data?.data || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-40 bg-[var(--color-muted)] rounded" />
        <div className="h-20 bg-[var(--color-raised)] rounded-xl" />
        <div className="h-20 bg-[var(--color-raised)] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="text-sm font-bold text-[var(--color-text)]">
            {t('jointRoom.sharedConcernsOnly')}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-subtext)] font-medium">
            {concerns.length} {t('jointRoom.active')}
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-subtext)] flex items-center gap-1">
          <Lock className="w-3 h-3 text-[var(--color-success)]" />
          {t('jointRoom.privacyProtected')}
        </span>
      </div>

      <p className="text-xs text-[var(--color-subtext)] leading-relaxed">
        {t('jointRoom.sharedConcernsDescription')}
      </p>

      {/* Concerns list */}
      {concerns.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-raised)] text-center flex flex-col items-center gap-2">
          <Eye className="w-6 h-6 text-[var(--color-subtext)]" />
          <p className="text-xs font-medium text-[var(--color-text)]">
            {t('jointRoom.noConcernsShared')}
          </p>
          <p className="text-[11px] text-[var(--color-subtext)] max-w-sm">
            {t('jointRoom.noConcernsDescription')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {concerns.map((c) => {
            const isMyConcern = c.userId === user?.id;

            return (
              <div
                key={c.id}
                onClick={() => onConcernClick?.(c)}
                className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] hover:border-[var(--color-primary)] transition-all cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
                        isMyConcern
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-muted)] text-[var(--color-text)]',
                      )}
                    >
                      {isMyConcern ? t('jointRoom.myItem') : t('jointRoom.familyMember')}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--color-primary)] uppercase">
                      {c.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ScorePill score={c.preScore} label="Pre" />
                    {c.postScore !== null && <ScorePill score={c.postScore} label="Post" />}
                  </div>
                </div>

                <p className="text-sm font-medium text-[var(--color-text)] leading-snug">
                  {c.questionKey}
                </p>

                <div className="flex items-center justify-between text-xs text-[var(--color-subtext)] pt-1">
                  <span className="flex items-center gap-1 text-[var(--color-success)] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {c.answerValue}
                  </span>
                  {c.sharedAt && (
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3" />
                      {t('jointRoom.sharedOn')} {new Date(c.sharedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
        >
          <Sparkles className="w-3 h-3" />
          {t('jointRoom.refreshSharedList')}
        </button>
      </div>
    </div>
  );
};
