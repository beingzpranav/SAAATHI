import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  TrendingUp,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient.js';
import { useSessionStore } from '../stores/session.store.js';
import { cn } from '../lib/cn.js';

/* ------------------------------------------------------------------ */
/* Types (mirror backend BhavishyaAgenda)                             */
/* ------------------------------------------------------------------ */
interface AgendaItem {
  order: number;
  topic: string;
  description: string;
  bridgesConcern?: string;
  estimatedMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface TradeHighlight {
  code: string;
  name: string;
  nsqfLevel: number;
  avgSalary: string;
  localDemand: 'HIGH' | 'MEDIUM' | 'LOW';
  costEstimate: string;
}

interface BhavishyaAgenda {
  householdId: string;
  generatedAt: string;
  learnerName: string;
  parentName: string;
  location: string;
  incomeContext: string;
  sessionGoal: string;
  items: AgendaItem[];
  tradeHighlights: TradeHighlight[];
  closingNote: string;
}

/* ------------------------------------------------------------------ */
/* Priority badge                                                      */
/* ------------------------------------------------------------------ */
const PriorityBadge: React.FC<{ priority: AgendaItem['priority'] }> = ({ priority }) => {
  const map = {
    HIGH: { label: 'High', color: 'var(--color-error)', bg: 'var(--color-error-bg)' },
    MEDIUM: { label: 'Medium', color: 'var(--color-student)', bg: 'var(--color-student-light)' },
    LOW: { label: 'Low', color: 'var(--color-subtext)', bg: 'var(--color-muted)' },
  };
  const { label, color, bg } = map[priority];
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Demand badge                                                        */
/* ------------------------------------------------------------------ */
const DemandBadge: React.FC<{ demand: TradeHighlight['localDemand'] }> = ({ demand }) => {
  const map = {
    HIGH: { label: 'High demand', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    MEDIUM: { label: 'Medium demand', color: 'var(--color-student)', bg: 'var(--color-student-light)' },
    LOW: { label: 'Low demand', color: 'var(--color-subtext)', bg: 'var(--color-muted)' },
  };
  const { label, color, bg } = map[demand];
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Agenda item accordion                                               */
/* ------------------------------------------------------------------ */
const AgendaCard: React.FC<{ item: AgendaItem; index: number }> = ({ item, index }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className={cn(
        'rounded-xl border transition-shadow',
        'bg-[var(--color-surface)] border-[var(--color-border)]',
        open && 'shadow-md',
      )}
    >
      <button
        type="button"
        id={`agenda-item-${item.order}`}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          {item.order}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{item.topic}</p>
          {item.bridgesConcern && (
            <p className="text-xs text-[var(--color-subtext)] truncate">
              Bridges: {item.bridgesConcern}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={item.priority} />
          <span className="flex items-center gap-0.5 text-xs text-[var(--color-subtext)]">
            <Clock className="w-3 h-3" />
            {item.estimatedMinutes}m
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-[var(--color-subtext)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--color-subtext)]" />
          )}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-subtext)] leading-relaxed pt-3">
            {item.description}
          </p>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Trade highlight card                                                */
/* ------------------------------------------------------------------ */
const TradeCard: React.FC<{ trade: TradeHighlight }> = ({ trade }) => (
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] p-4 flex flex-col gap-2">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">{trade.name}</p>
        <p className="text-xs text-[var(--color-subtext)]">NSQF Level {trade.nsqfLevel}</p>
      </div>
      <DemandBadge demand={trade.localDemand} />
    </div>
    <div className="flex items-center gap-4 text-xs text-[var(--color-subtext)] pt-1">
      <span className="flex items-center gap-1">
        <IndianRupee className="w-3 h-3" />
        {trade.avgSalary}/mo
      </span>
      <span className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {trade.costEstimate} training cost
      </span>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
export const JointRoomPage: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en';
  const { household } = useSessionStore();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bhavishya-agenda', household?.id],
    queryFn: () => apiClient.get<BhavishyaAgenda>('/bhavishya/agenda'),
    enabled: Boolean(household?.id),
    staleTime: 5 * 60 * 1000,
  });

  const agenda = data?.data;

  if (!household?.id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-[var(--color-error)]" />
        <h1 className="text-xl font-bold text-[var(--color-text)]">No household found</h1>
        <p className="text-sm text-[var(--color-subtext)]">
          Please complete the intake first before accessing the Joint Room.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-primary-light)' }}
        >
          <Sparkles className="w-8 h-8 animate-pulse" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">
            Bhavishya Engine is thinking…
          </h2>
          <p className="text-sm text-[var(--color-subtext)]">
            Synthesising shared concerns and verified local data for your joint session agenda.
          </p>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[var(--color-muted)] animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-[var(--color-error)]" />
        <h1 className="text-xl font-bold text-[var(--color-text)]">Could not generate agenda</h1>
        <p className="text-sm text-[var(--color-subtext)]">
          Share at least one concern from your private window to generate a joint session agenda.
        </p>
        <button
          type="button"
          id="retry-agenda"
          onClick={() => refetch()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalMinutes = agenda.items.reduce((a, i) => a + i.estimatedMinutes, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-muted))',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-primary)' }}
          >
            Joint Room
          </span>
          <Sparkles className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--color-primary)' }} />
          <span className="text-xs text-[var(--color-subtext)]">Bhavishya Engine</span>
        </div>
        <h1
          className="text-2xl font-bold text-[var(--color-text)] mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {lang === 'hi' ? 'संयुक्त परामर्श सत्र' : 'Joint Counselling Session'}
        </h1>
        <p className="text-sm text-[var(--color-subtext)] leading-relaxed mb-4">
          {agenda.sessionGoal}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--color-subtext)]">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {agenda.location}
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee className="w-3 h-3" />
            {agenda.incomeContext}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            ~{totalMinutes} minutes total
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] p-3 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'var(--color-student)' }}
          >
            {agenda.learnerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-[var(--color-subtext)]">Learner</p>
            <p className="text-sm font-semibold text-[var(--color-text)]">{agenda.learnerName}</p>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] p-3 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'var(--color-parent)' }}
          >
            {agenda.parentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-[var(--color-subtext)]">Parent</p>
            <p className="text-sm font-semibold text-[var(--color-text)]">{agenda.parentName}</p>
          </div>
        </div>
      </div>

      {/* Agenda items */}
      <section aria-labelledby="agenda-heading">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h2
            id="agenda-heading"
            className="text-base font-semibold text-[var(--color-text)]"
          >
            Session Agenda
          </h2>
          <span className="ml-auto text-xs text-[var(--color-subtext)]">
            {agenda.items.length} topics
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {agenda.items.map((item, i) => (
            <AgendaCard key={item.order} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Trade highlights */}
      {agenda.tradeHighlights.length > 0 && (
        <section aria-labelledby="trades-heading">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <h2
              id="trades-heading"
              className="text-base font-semibold text-[var(--color-text)]"
            >
              Recommended Trades for Discussion
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agenda.tradeHighlights.map((trade) => (
              <TradeCard key={trade.code} trade={trade} />
            ))}
          </div>
        </section>
      )}

      {/* Closing note */}
      <div
        className="rounded-xl p-5 flex items-start gap-3"
        style={{ background: 'var(--color-success-bg)' }}
      >
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
        <p className="text-sm text-[var(--color-text)] leading-relaxed">{agenda.closingNote}</p>
      </div>

      {/* Regenerate */}
      <div className="flex justify-center">
        <button
          type="button"
          id="regenerate-agenda"
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-subtext)] hover:bg-[var(--color-muted)] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Regenerate Agenda
        </button>
      </div>
    </div>
  );
};
