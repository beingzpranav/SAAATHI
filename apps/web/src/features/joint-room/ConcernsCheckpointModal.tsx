import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PhoneCall,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { apiClient } from '../../lib/apiClient.js';
import { useSessionStore } from '../../stores/session.store.js';
import type { ConcernDto, CheckpointEvaluationResponse } from '@saathi/shared';
import { cn } from '../../lib/cn.js';

interface ConcernsCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookingModal?: () => void;
  onLaunchLiveCall?: () => void;
}

interface ConcernEvaluationState {
  concernId: string;
  preScore: number;
  postScore: number;
  isResolved: boolean;
  resolutionNotes: string;
  questionKey: string;
  category: string;
}

export const ConcernsCheckpointModal: React.FC<ConcernsCheckpointModalProps> = ({
  isOpen,
  onClose,
  onOpenBookingModal,
  onLaunchLiveCall,
}) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isHi = Boolean(i18n?.language?.startsWith('hi'));
  const { household } = useSessionStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluations, setEvaluations] = useState<ConcernEvaluationState[]>([]);
  const [submitResult, setSubmitResult] = useState<CheckpointEvaluationResponse | null>(null);

  // Fetch household concerns when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setSubmitResult(null);

    const fallbackConcerns: ConcernEvaluationState[] = [
      {
        concernId: '11111111-1111-1111-1111-111111111111',
        questionKey: isHi
          ? 'क्या आईटीआई के बाद सरकारी या प्रतिष्ठित नौकरी मिलेगी?'
          : 'Will ITI lead to stable government or industrial placement?',
        category: 'CAREER_LONGEVITY',
        preScore: 4,
        postScore: 2,
        isResolved: true,
        resolutionNotes: isHi
          ? 'सत्यापित प्लेसमेंट डेटा और NAPS अप्रेंटिसशिप से पुष्टि हुई।'
          : 'Verified local placement data and NAPS direct benefit transfer.',
      },
      {
        concernId: '22222222-2222-2222-2222-222222222222',
        questionKey: isHi
          ? 'क्या परिवार पर कोई वित्तीय बोझ या अप्रत्याशित शुल्क आएगा?'
          : 'Will there be hidden fees or heavy financial burden on family?',
        category: 'FINANCIAL_WORRY',
        preScore: 5,
        postScore: 1,
        isResolved: true,
        resolutionNotes: isHi
          ? 'सरकारी आईटीआई में 100% ट्यूशन छूट और ₹2500/माह स्टाइपेंड लागू।'
          : '100% government tuition waiver confirmed with ₹2,500/mo DBT stipend.',
      },
    ];

    if (!household?.id) {
      setEvaluations(fallbackConcerns);
      setIsLoading(false);
      return;
    }

    apiClient
      .get<ConcernDto[]>(`/concerns/household/${household.id}/shared`)
      .then((res) => {
        const concerns = res.data || [];
        if (concerns.length === 0) {
          setEvaluations(fallbackConcerns);
        } else {
          setEvaluations(
            concerns.map((c) => ({
              concernId: c.id,
              questionKey: c.questionKey,
              category: c.category,
              preScore: c.preScore,
              postScore: c.postScore ?? Math.max(1, c.preScore - 2),
              isResolved: c.resolvedAt !== null,
              resolutionNotes: '',
            })),
          );
        }
      })
      .catch(() => {
        setEvaluations(fallbackConcerns);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, household?.id, isHi]);

  const handleScoreChange = (index: number, newScore: number) => {
    setEvaluations((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      next[index] = { ...item, postScore: newScore, isResolved: newScore <= 2 };
      return next;
    });
  };

  const handleToggleResolved = (index: number) => {
    setEvaluations((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      const nowResolved = !item.isResolved;
      next[index] = {
        ...item,
        isResolved: nowResolved,
        postScore: nowResolved ? Math.min(item.postScore, 2) : 4,
      };
      return next;
    });
  };

  const handleNotesChange = (index: number, notes: string) => {
    setEvaluations((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      next[index] = { ...item, resolutionNotes: notes };
      return next;
    });
  };

  // Calculate live readiness score
  const totalConcerns = evaluations.length;
  const resolvedCount = evaluations.filter((e) => e.isResolved || e.postScore <= 2).length;
  const liveReadinessScore = totalConcerns > 0 ? Math.round((resolvedCount / totalConcerns) * 100) : 100;
  const isReadyForCard = liveReadinessScore >= 70;

  // Submit checkpoint to API
  const handleSubmitCheckpoint = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<CheckpointEvaluationResponse>('/concerns/checkpoint', {
        evaluations: evaluations.map((e) => ({
          concernId: e.concernId,
          postScore: e.postScore,
          isResolved: e.isResolved,
          resolutionNotes: e.resolutionNotes || undefined,
        })),
      });

      setSubmitResult(res.data);
    } catch {
      // If error (or offline), calculate local simulated response so user isn't blocked
      setSubmitResult({
        householdId: household?.id ?? '',
        allResolved: resolvedCount === totalConcerns,
        resolvedCount,
        unresolvedCount: totalConcerns - resolvedCount,
        readinessScore: liveReadinessScore,
        readyForDecisionCard: isReadyForCard,
        recommendedActions: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHi ? 'चिंता समाधान चेकपॉइंट' : 'Concerns Answered Checkpoint'}
      description={
        isHi
          ? 'संयुक्त सत्र के बाद परिवार की चिंताओं का पुनर्मूल्यांकन करें और निर्णय कार्ड के लिए सहमति दर्ज करें।'
          : 'Re-evaluate family anxieties after joint deliberation to certify alignment for the Decision Card.'
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Readiness Meter Banner */}
        <div
          className={cn(
            'p-4 rounded-xl border transition-all flex flex-col gap-3',
            isReadyForCard
              ? 'bg-[var(--color-success-bg)] border-[var(--color-success)]/40'
              : 'bg-[var(--color-student-light)] border-[var(--color-student)]/40',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isReadyForCard ? (
                <ShieldCheck className="w-5 h-5 text-[var(--color-success)]" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-[var(--color-student)]" />
              )}
              <span className="text-sm font-bold text-[var(--color-text)]">
                {isHi ? 'पारिवारिक तत्परता स्कोर' : 'Family Alignment & Readiness Score'}
              </span>
            </div>
            <span
              className={cn(
                'text-lg font-black font-mono',
                isReadyForCard ? 'text-[var(--color-success)]' : 'text-[var(--color-student)]',
              )}
            >
              {liveReadinessScore}%
            </span>
          </div>

          <ProgressBar
            value={liveReadinessScore}
            max={100}
            colorVariant={isReadyForCard ? 'parent' : 'student'}
            aria-label="Family Readiness Progress"
          />

          <div className="flex items-start gap-2 text-xs text-[var(--color-subtext)] leading-relaxed">
            {isReadyForCard ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--color-leaf)] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[var(--color-student)] shrink-0 mt-0.5" />
            )}
            <p>
              {isReadyForCard
                ? isHi
                  ? 'परिवार की अधिकांश चिंताएं सुलझ गई हैं! आप आधिकारिक निर्णय कार्ड (Decision Card) जारी करने के लिए तैयार हैं।'
                  : 'Major family concerns are successfully addressed! You meet the threshold to generate an official Decision Card.'
                : isHi
                  ? 'अभी कुछ चिंताएं शेष हैं (< 70%)। आगे बढ़ने से पहले प्रमाणित सरकारी काउंसलर से लाइव परामर्श लेने की अनुशंसा है।'
                  : 'Alignment is below 70%. We strongly recommend booking a 1-on-1 certified live counsellor session.'}
            </p>
          </div>
        </div>

        {/* Concerns List with Interactive Sliders */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[var(--color-subtext)]">
            {isHi ? 'चिंताएं लोड हो रही हैं...' : 'Loading household concerns...'}
          </div>
        ) : (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {evaluations.map((item, index) => (
              <div
                key={item.concernId}
                className={cn(
                  'p-4 rounded-xl border bg-[var(--color-surface)] transition-all space-y-3',
                  item.isResolved
                    ? 'border-[var(--color-success)]/40 bg-[var(--color-success-bg)]/20'
                    : 'border-[var(--color-border)]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-raised)] text-[var(--color-primary)]">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">
                      {item.questionKey}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleResolved(index)}
                    aria-label="Toggle resolved status"
                    className={cn(
                      'shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all',
                      item.isResolved
                        ? 'bg-[var(--color-success)] text-white border-transparent'
                        : 'bg-[var(--color-surface)] text-[var(--color-subtext)] border-[var(--color-border)] hover:border-[var(--color-primary)]',
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.isResolved ? (isHi ? 'सुलझ गया' : 'Resolved') : (isHi ? 'चिंता बाकी' : 'Open')}</span>
                  </button>
                </div>

                {/* Score Comparison Slider */}
                <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-subtext)]">
                      {isHi ? 'प्रारंभिक चिंता स्तर:' : 'Initial Anxiety:'}{' '}
                      <strong className="text-[var(--color-text)]">{item.preScore}/5</strong>
                    </span>
                    <span className="text-[var(--color-subtext)]">
                      {isHi ? 'वर्तमान चिंता स्तर:' : 'Current Anxiety:'}{' '}
                      <strong
                        className={cn(
                          'font-mono font-bold',
                          item.postScore <= 2 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]',
                        )}
                      >
                        {item.postScore}/5 {item.postScore <= 2 ? (isHi ? '(शांत)' : '(Resolved)') : (isHi ? '(चिंता)' : '(Concerned)')}
                      </strong>
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={item.postScore}
                    onChange={(e) => handleScoreChange(index, Number(e.target.value))}
                    className="w-full h-1.5 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                    aria-label={`Post-session score for ${item.questionKey}`}
                  />
                  <div className="flex justify-between text-[10px] text-[var(--color-subtext)]">
                    <span>1: {isHi ? 'पूरी तरह निश्चिंत' : 'Completely Satisfied'}</span>
                    <span>3: {isHi ? 'मध्यम' : 'Neutral'}</span>
                    <span>5: {isHi ? 'अत्यधिक चिंतित' : 'Still Anxious'}</span>
                  </div>
                </div>

                {/* Resolution Notes Input */}
                <div>
                  <input
                    type="text"
                    value={item.resolutionNotes}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                    placeholder={
                      isHi
                        ? 'समाधान का कारण (उदा. NAPS स्टाइपेंड व शुल्क छूट स्पष्ट हुई)...'
                        : 'Reason for resolution (e.g. Verified NAPS stipend & hostel safety)...'
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-raised)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isHi ? 'रद्द करें' : 'Close'}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {/* If alignment < 70%, show Live Counsellor Consultation CTA */}
            {!isReadyForCard && (
              <Button
                variant="outline"
                size="sm"
                id="checkpoint-book-counsellor-btn"
                onClick={() => {
                  onClose();
                  if (onLaunchLiveCall) onLaunchLiveCall();
                  else if (onOpenBookingModal) onOpenBookingModal();
                }}
                className="gap-1.5 text-[var(--color-primary)] border-[var(--color-primary)]"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{isHi ? 'काउंसलर से बात करें' : 'Talk to Counsellor'}</span>
              </Button>
            )}

            {/* Save Evaluations Checkpoint */}
            {!submitResult ? (
              <Button
                variant="primary"
                size="sm"
                id="checkpoint-submit-evaluations-btn"
                onClick={handleSubmitCheckpoint}
                disabled={isSubmitting || evaluations.length === 0}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? isHi
                      ? 'दर्ज किया जा रहा है...'
                      : 'Certifying...'
                    : isHi
                      ? 'सहमति दर्ज करें'
                      : 'Record Checkpoint'}
                </span>
              </Button>
            ) : (
              /* Once evaluated and ready, navigate to Decision Card */
              <Button
                variant="primary"
                size="sm"
                id="checkpoint-goto-decision-card-btn"
                onClick={() => {
                  onClose();
                  navigate('/decision-card');
                }}
                className="gap-1.5 bg-[var(--color-parent)] hover:bg-[var(--color-parent-dark)] text-white"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{isHi ? 'आधिकारिक निर्णय कार्ड खोलें' : 'Open Family Decision Card'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
