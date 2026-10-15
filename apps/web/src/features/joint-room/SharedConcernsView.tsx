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
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en';
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
            {lang === 'hi' ? 'केवल साझा की गई चिंताएं' : 'Shared Concerns Only'}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-subtext)] font-medium">
            {concerns.length} {lang === 'hi' ? 'सक्रिय' : 'active'}
          </span>
        </div>
        <span className="text-[11px] text-[var(--color-subtext)] flex items-center gap-1">
          <Lock className="w-3 h-3 text-[var(--color-success)]" />
          {lang === 'hi' ? 'गोपनीयता सुरक्षित' : 'Zero Unshared Leakage'}
        </span>
      </div>

      <p className="text-xs text-[var(--color-subtext)] leading-relaxed">
        {lang === 'hi'
          ? 'इस संयुक्त कक्ष में केवल वही प्रश्न और प्राथमिकताएं दिखाई देती हैं जिन्हें शिक्षार्थी या अभिभावक ने अपनी निजी खिड़की में स्वेच्छा से "परिवार के साथ साझा करें" चुना है।'
          : 'Strict privacy isolation: Only concerns voluntarily toggled to "Share with Family" in the Private Window are visible here.'}
      </p>

      {/* Concerns list */}
      {concerns.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-raised)] text-center flex flex-col items-center gap-2">
          <Eye className="w-6 h-6 text-[var(--color-subtext)]" />
          <p className="text-xs font-medium text-[var(--color-text)]">
            {lang === 'hi' ? 'अभी तक कोई चिंता साझा नहीं की गई है' : 'No concerns shared yet'}
          </p>
          <p className="text-[11px] text-[var(--color-subtext)] max-w-sm">
            {lang === 'hi'
              ? 'चिंता या प्राथमिकता साझा करने के लिए अपनी निजी खिड़की में "परिवार के साथ साझा करें" बटन दबाएं।'
              : 'Family members can toggle "Share with Family" on any item in their Private Window to discuss it here.'}
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
                      {isMyConcern ? 'My Item' : 'Family Member'}
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
                      Shared {new Date(c.sharedAt).toLocaleDateString()}
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
          {lang === 'hi' ? 'सूची ताज़ा करें' : 'Refresh Shared List'}
        </button>
      </div>
    </div>
  );
};
