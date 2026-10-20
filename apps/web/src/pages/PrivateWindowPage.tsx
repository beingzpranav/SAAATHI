import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  Unlock,
  BookOpen,
  Heart,
  Trash2,
  Share2,
  CheckCircle2,
  Loader2,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient.js';
import { useSessionStore } from '../stores/session.store.js';
import { useRoomStore } from '../stores/room.store.js';
import { PinLockModal } from '../features/rooms/PinLockModal.js';
import { AddConcernForm } from '../features/concerns/AddConcernForm.js';
import { cn } from '../lib/cn.js';
import { TranslatedText } from '../components/common/TranslatedText.js';
import { useDynamicTranslate } from '../lib/useDynamicTranslate.js';
import type { ConcernDto } from '@saathi/shared';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type ConcernItem = ConcernDto;

interface MappingQuestion {
  id: string;
  targetRole: 'LEARNER' | 'PARENT';
  category: string;
  questionEn: string;
  questionHi: string;
  options?: { value: string; labelEn: string; labelHi: string }[];
}

/* ------------------------------------------------------------------ */
/* Small helper components                                             */
/* ------------------------------------------------------------------ */
const SectionHeading: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({
  icon,
  title,
  sub,
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-primary-light)]">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-semibold text-[var(--color-text)] leading-tight">
        <TranslatedText text={title} context="app_ui" />
      </h2>
      {sub && (
        <p className="text-xs text-[var(--color-subtext)]">
          <TranslatedText text={sub} context="app_ui" />
        </p>
      )}
    </div>
  </div>
);

const ScorePill: React.FC<{ label: string; value?: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
    style={{ borderColor: color, color, background: `${color}18` }}
  >
    {label}: {value ?? '—'}/10
  </span>
);

/* ------------------------------------------------------------------ */
/* Concern card                                                        */
/* ------------------------------------------------------------------ */
const ConcernCard: React.FC<{
  concern: ConcernItem;
  accentColor: string;
  onDelete: (id: string) => void;
  onToggleShare: (id: string, share: boolean) => void;
  isSharing: boolean;
  recentlyShared: boolean;
}> = ({ concern, accentColor, onDelete, onToggleShare, isSharing, recentlyShared }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'rounded-xl border p-4 flex flex-col gap-2 transition-all duration-300 hover:shadow-md',
        concern.isShared
          ? 'bg-[var(--color-success-bg)]/35 border-[var(--color-success)]/50'
          : 'bg-[var(--color-surface)] border-[var(--color-border)]',
        recentlyShared && 'ring-2 ring-[var(--color-success)]/30 shadow-lg scale-[1.01]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[var(--color-text)] flex-1 leading-relaxed">
          <TranslatedText text={concern.questionKey} context="app_ui" />
        </p>
        <span
          className="text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          <TranslatedText text={concern.category.replace(/_/g, ' ')} context="app_ui" />
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <ScorePill label={t('privateWindow.before')} value={concern.preScore} color="var(--color-subtext)" />
        <ScorePill label={t('privateWindow.after')} value={concern.postScore ?? 0} color="var(--color-success)" />
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
        <button
          type="button"
          id={`share-concern-${concern.id}`}
          onClick={() => onToggleShare(concern.id, !concern.isShared)}
          disabled={isSharing}
          aria-pressed={concern.isShared}
          className={cn(
            'relative overflow-visible flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-300 disabled:cursor-wait disabled:opacity-80',
            concern.isShared
              ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
              : 'bg-[var(--color-muted)] text-[var(--color-subtext)] hover:text-[var(--color-text)]',
            recentlyShared && 'scale-105 shadow-sm',
          )}
          title={
            concern.isShared
              ? t('privateWindow.sharedWithHousehold')
              : t('privateWindow.shareWithHousehold')
          }
        >
          {isSharing ? (
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          ) : concern.isShared ? (
            <span className="relative flex h-3.5 w-3.5 items-center justify-center">
              {recentlyShared && (
                <span
                  className="absolute inset-0 rounded-full bg-[var(--color-success)]/40 animate-ping"
                  aria-hidden="true"
                />
              )}
              <CheckCircle2 className="relative w-3.5 h-3.5 animate-in zoom-in duration-300" aria-hidden="true" />
            </span>
          ) : (
            <Share2 className="w-3 h-3" aria-hidden="true" />
          )}
          <TranslatedText
            text={
              isSharing
                ? t('privateWindow.sharing')
                : concern.isShared
                  ? t('privateWindow.shared')
                  : t('privateWindow.share')
            }
            context="app_ui"
          />
        </button>
        <button
          type="button"
          id={`delete-concern-${concern.id}`}
          onClick={() => onDelete(concern.id)}
          className="ml-auto flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
          title={t('privateWindow.delete')}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};


/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
export const PrivateWindowPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split('-')[0] || 'en';
  const { user } = useSessionStore();
  const { isUnlocked, lockRoom } = useRoomStore();
  const [showPin, setShowPin] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [recentlySharedId, setRecentlySharedId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const qc = useQueryClient();

  const isLearner = user?.role === 'LEARNER';
  const accentColor = isLearner ? 'var(--color-student)' : 'var(--color-parent)';
  const accentKey: 'student' | 'parent' = isLearner ? 'student' : 'parent';
  const pinTitle = useDynamicTranslate(
    t(isLearner ? 'privateWindow.studentPin' : 'privateWindow.parentPin'),
    'app_ui',
  );

  /* ---- Concerns ---- */
  const { data: concernsData, isLoading: loadingConcerns } = useQuery({
    queryKey: ['my-concerns', user?.id],
    queryFn: () => apiClient.get<ConcernItem[]>('/concerns/my'),
    enabled: isUnlocked,
  });

  /* ---- Mapping questions ---- */
  const { data: questionsData } = useQuery({
    queryKey: ['mapping-questions'],
    queryFn: () => apiClient.get<MappingQuestion[]>('/concerns/questions'),
    enabled: isUnlocked,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/concerns/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-concerns', user?.id] }),
  });

  const shareMutation = useMutation({
    mutationFn: ({ id, share }: { id: string; share: boolean }) =>
      apiClient.post(`/concerns/${id}/share`, { isShared: share }),
    onMutate: ({ id }) => {
      setSharingId(id);
      setShareError(null);
    },
    onSuccess: (_, variables) => {
      if (variables.share) {
        setRecentlySharedId(variables.id);
        window.setTimeout(() => {
          setRecentlySharedId((current) => (current === variables.id ? null : current));
        }, 1800);
      }
      qc.invalidateQueries({ queryKey: ['my-concerns', user?.id] });
    },
    onError: () => {
      setShareError(
        t('privateWindow.shareError'),
      );
    },
    onSettled: () => setSharingId(null),
  });

  const handleUnlocked = useCallback(() => {
    setShowPin(false);
  }, []);

  const concerns = concernsData?.data ?? [];
  const questions =
    questionsData?.data?.filter((q) =>
      isLearner ? q.targetRole === 'LEARNER' : q.targetRole === 'PARENT',
    ) ?? [];

  /* ---- Locked gate ---- */
  if (!isUnlocked) {
    return (
      <>
        <PinLockModal
          isOpen={showPin}
          onUnlocked={handleUnlocked}
          onCancel={() => setShowPin(false)}
          accentColor={accentKey}
          title={pinTitle.translatedText}
        />
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: `${accentColor}20` }}
          >
            <Lock className="w-9 h-9" style={{ color: accentColor }} />
          </div>
          <div className="text-center max-w-sm">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
            >
              <TranslatedText text={t('privateWindow.title')} context="app_ui" />
            </h1>
            <p className="text-sm text-[var(--color-subtext)] leading-relaxed">
              <TranslatedText text={t('privateWindow.description')} context="app_ui" />
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              type="button"
              id="enter-private-room"
              onClick={() => setShowPin(true)}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ background: accentColor }}
            >
              <TranslatedText text={t('privateWindow.unlock')} context="app_ui" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-subtext)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <TranslatedText text={t('privateWindow.security')} context="app_ui" />
          </div>
        </div>
      </>
    );
  }

  /* ---- Unlocked view ---- */
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Unlock className="w-4 h-4" style={{ color: accentColor }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: accentColor }}>
              <TranslatedText text={t('privateWindow.window')} context="app_ui" />
            </span>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            <TranslatedText
              text={isLearner ? t('privateWindow.studentSpace') : t('privateWindow.parentSpace')}
              context="app_ui"
            />
          </h1>
          <p className="text-sm text-[var(--color-subtext)] mt-0.5">
            <TranslatedText text={t('privateWindow.onlyYou')} context="app_ui" />
          </p>
        </div>
        <button
          type="button"
          id="lock-room"
          onClick={lockRoom}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-[var(--color-border)] text-[var(--color-subtext)] hover:bg-[var(--color-muted)] transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          <TranslatedText text={t('privateWindow.lock')} context="app_ui" />
        </button>
      </div>

      {/* My Concerns */}
      <section aria-labelledby="concerns-heading">
        <SectionHeading
          icon={<Heart className="w-4 h-4" style={{ color: accentColor }} />}
          title={t('privateWindow.myConcerns')}
          sub={t('privateWindow.manageConcerns')}
        />
        <div className="flex flex-col gap-3">
          <AddConcernForm
            accentColor={accentColor}
            onAddSuccess={() => {
              qc.invalidateQueries({ queryKey: ['my-concerns', user?.id] });
            }}
          />
          {loadingConcerns && (
            <div className="text-xs text-[var(--color-subtext)] animate-pulse py-4 text-center">
              <TranslatedText text={t('privateWindow.loading')} context="app_ui" />
            </div>
          )}
          {concerns.length === 0 && !loadingConcerns && (
            <div className="py-6 text-center text-sm text-[var(--color-subtext)]">
              <TranslatedText text={t('privateWindow.empty')} context="app_ui" />
            </div>
          )}
          {shareError && (
            <div role="alert" className="rounded-lg border border-[var(--color-error)]/40 bg-[var(--color-error-bg)] px-3 py-2 text-xs text-[var(--color-error)]">
              <TranslatedText text={shareError} context="app_ui" />
            </div>
          )}
          {concerns.map((c) => (
            <ConcernCard
              key={c.id}
              concern={c}
              accentColor={accentColor}
              onDelete={(id) => deleteMutation.mutate(id)}
              onToggleShare={(id, share) => shareMutation.mutate({ id, share })}
              isSharing={sharingId === c.id}
              recentlyShared={recentlySharedId === c.id}
            />
          ))}
        </div>
      </section>

      {/* Self-assessment questions */}
      {questions.length > 0 && (
        <section aria-labelledby="assessment-heading">
          <SectionHeading
            icon={<BarChart2 className="w-4 h-4" style={{ color: accentColor }} />}
            title={t('privateWindow.selfAssessment')}
            sub={t('privateWindow.selfAssessmentDescription')}
          />
          <div className="flex flex-col gap-4">
            {questions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] p-4"
              >
                <p className="text-sm text-[var(--color-text)] leading-relaxed mb-3">
                  <TranslatedText
                    text={lang === 'hi' ? q.questionHi : q.questionEn}
                    context="app_ui"
                  />
                </p>
                {q.options && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        id={`q-${q.id}-opt-${opt.value}`}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-current transition-colors text-[var(--color-subtext)] hover:text-[var(--color-text)]"
                      >
                        <TranslatedText
                          text={lang === 'hi' ? opt.labelHi : opt.labelEn}
                          context="app_ui"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Guidance block */}
      <section>
        <SectionHeading
          icon={<BookOpen className="w-4 h-4" style={{ color: accentColor }} />}
          title="How This Works"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: '1', text: 'Add your concerns privately — no one else can see them.' },
            { step: '2', text: 'When you are ready, share selected concerns for the joint session.' },
            { step: '3', text: 'Track how your worry score changes before and after counselling.' },
          ].map(({ step, text }) => (
            <div
              key={step}
              className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)]"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ background: accentColor }}
              >
                {step}
              </div>
              <p className="text-xs text-[var(--color-subtext)] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
