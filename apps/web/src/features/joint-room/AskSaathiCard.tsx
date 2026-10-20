import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Search,
  ShieldCheck,
  Share2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import type { AiQueryResponse, GroundedCitation } from '@saathi/shared';
import { apiClient } from '../../lib/apiClient.js';
import { useJointRoomStore } from '../../stores/jointRoom.store.js';
import { TranslatedText } from '../../components/common/TranslatedText.js';
import { translationClient } from '../../lib/translationClient.js';

interface AskSaathiCardProps {
  initialPrompt?: string;
  onTradeSelect?: (tradeCode: string) => void;
}

export const AskSaathiCard: React.FC<AskSaathiCardProps> = ({
  initialPrompt,
  onTradeSelect,
}) => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const lang = currentLanguage.startsWith('hi') ? 'hi' : 'en';
  const { sendMessage } = useJointRoomStore();

  const [queryText, setQueryText] = useState(initialPrompt || '');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);

  // Sync when global language changes
  React.useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const mutation = useMutation({
    mutationFn: (text: string) =>
      apiClient.post<AiQueryResponse>('/ai/query', {
        query: text,
        language: selectedLanguage,
      }),
  });

  const response = mutation.data?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    mutation.mutate(queryText.trim());
  };

  const handleShareToChat = async () => {
    if (!response) return;
    let textToShare = response.answerEn;
    if (selectedLanguage === 'hi') {
      textToShare = response.answerHi;
    } else if (selectedLanguage !== 'en') {
      try {
        textToShare = await translationClient.translate(
          response.answerEn,
          selectedLanguage,
          'en',
          'generated',
        );
      } catch {
        textToShare = response.answerEn;
      }
    }
    sendMessage(`[Verified Grounded Fact via SAATHI AI]:\n${textToShare}`);
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              {t('jointRoom.askSaathi')}
            </h3>
            <p className="text-[11px] text-[var(--color-subtext)]">
              {t('jointRoom.verifiedDistrictData')}
            </p>
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden text-xs">
          <button
            type="button"
            id="ai-lang-en"
            onClick={() => setSelectedLanguage('en')}
            className={`px-2.5 py-1 font-medium transition-colors ${
              selectedLanguage === 'en'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-subtext)]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            id="ai-lang-hi"
            onClick={() => setSelectedLanguage('hi')}
            className={`px-2.5 py-1 font-medium transition-colors ${
              selectedLanguage === 'hi'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-subtext)]'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--color-subtext)] absolute left-3 top-3" />
          <input
            type="text"
            id="ask-saathi-input"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder={t('jointRoom.askPlaceholder')}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] pl-9 pr-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-subtext)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <button
          type="submit"
          id="ask-saathi-submit"
          disabled={mutation.isPending || !queryText.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity flex items-center gap-1.5 shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          {mutation.isPending ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>{t('jointRoom.consult')}</span>
        </button>
      </form>

      {/* Loading state */}
      {mutation.isPending && (
        <div className="p-6 rounded-xl bg-[var(--color-raised)] flex flex-col items-center gap-3 text-center animate-pulse">
          <Sparkles className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
          <p className="text-xs text-[var(--color-subtext)]">
            {t('chat.loadingAi')}
          </p>
        </div>
      )}

      {/* Error state */}
      {mutation.isError && (
        <div className="p-4 rounded-xl border border-[var(--color-error)] bg-[var(--color-error-bg)] flex items-start gap-2 text-xs text-[var(--color-error)]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {t('chat.queryError')}
          </span>
        </div>
      )}

      {/* Result Display */}
      {response && (
        <div className="flex flex-col gap-4">
          {/* Refusal Notice */}
          {response.isRefusal ? (
            <div className="p-4 rounded-xl border border-[var(--color-amber)] bg-[var(--color-student-light)] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--color-student)]">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('chat.outOfScope')}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text)] leading-relaxed">
                {selectedLanguage === 'hi'
                  ? response.refusalReasonHi
                  : response.refusalReasonEn}
              </p>
            </div>
          ) : (
            /* Grounded Answer */
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--color-success)] flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('chat.grounded')} • {response.confidence} {t('confidence.high')}
                </span>
                <button
                  type="button"
                  id="share-ai-response-chat"
                  onClick={handleShareToChat}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {t('chat.shareFamily')}
                </button>
              </div>

              <div className="text-sm text-[var(--color-text)] whitespace-pre-line leading-relaxed">
                {selectedLanguage === 'hi' ? (
                  response.answerHi
                ) : selectedLanguage === 'en' ? (
                  response.answerEn
                ) : (
                  <TranslatedText text={response.answerEn} context="generated" />
                )}
              </div>

              {/* Citations section */}
              {response.citations && response.citations.length > 0 && (
                <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-subtext)] flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3 text-[var(--color-primary)]" />
                    {t('chat.citations')} ({response.citations.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {response.citations.map((c: GroundedCitation) => (
                      <div
                        key={c.id}
                        className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px] flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-[var(--color-primary)] truncate">
                          {c.title}
                        </span>
                        {c.verifiedStatistic && (
                          <span className="text-[var(--color-text)] font-medium">
                            {c.verifiedStatistic}
                          </span>
                        )}
                        {c.verificationSource && (
                          <span className="text-[9px] text-[var(--color-subtext)] truncate">
                            {c.verificationSource}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Trades */}
          {response.relatedTrades && response.relatedTrades.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-subtext)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[var(--color-primary)]" />
                {t('chat.discussedTrades')}
              </span>
              <div className="flex flex-wrap gap-2">
                {response.relatedTrades.map((trade) => (
                  <button
                    key={trade.code}
                    type="button"
                    onClick={() => onTradeSelect?.(trade.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
                  >
                    <span>{lang === 'hi' ? trade.titleHi : trade.titleEn}</span>
                    <span className="text-[10px] text-[var(--color-subtext)]">
                      {t('chat.level')} {trade.nsqfLevel}
                    </span>
                    <ChevronRight className="w-3 h-3 text-[var(--color-subtext)]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Follow-up Questions */}
          {response.suggestedQuestions && response.suggestedQuestions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-subtext)]">
                Suggested Follow-up
              </span>
              <div className="flex flex-col gap-1">
                {response.suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const text = selectedLanguage === 'hi' ? q.hi : q.en;
                      setQueryText(text);
                      mutation.mutate(text);
                    }}
                    className="text-left text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 py-0.5"
                  >
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    <span>{selectedLanguage === 'hi' ? q.hi : q.en}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
