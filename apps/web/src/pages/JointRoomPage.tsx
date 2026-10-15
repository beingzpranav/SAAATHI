import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Sparkles,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  BookOpen,

  MessageSquare,
  Shield,
  TrendingUp,
  MapPin,
  IndianRupee,
  Activity,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { BhavishyaAgendaResponse, BhavishyaAgendaItem } from '@saathi/shared';
import { apiClient } from '../lib/apiClient.js';
import { useSessionStore } from '../stores/session.store.js';
import { useJointRoomStore } from '../stores/jointRoom.store.js';
import { JointChatPanel } from '../features/joint-room/JointChatPanel.js';
import { AskSaathiCard } from '../features/joint-room/AskSaathiCard.js';
import { SharedConcernsView } from '../features/joint-room/SharedConcernsView.js';
import { NsqfLadderView } from '../features/joint-room/NsqfLadderView.js';
import { cn } from '../lib/cn.js';

type JointTab = 'agenda' | 'chat' | 'concerns' | 'ladder';

/* ------------------------------------------------------------------ */
/* Priority badge                                                      */
/* ------------------------------------------------------------------ */
const PriorityBadge: React.FC<{ priority: BhavishyaAgendaItem['priority'] }> = ({ priority }) => {
  const map = {
    HIGH: { label: 'High Priority', color: 'var(--color-error)', bg: 'var(--color-error-bg)' },
    MEDIUM: { label: 'Medium Priority', color: 'var(--color-student)', bg: 'var(--color-student-light)' },
    LOW: { label: 'Low Priority', color: 'var(--color-subtext)', bg: 'var(--color-muted)' },
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
/* Agenda Item Accordion Card                                         */
/* ------------------------------------------------------------------ */
const AgendaItemCard: React.FC<{
  item: BhavishyaAgendaItem;
  index: number;
  lang: 'en' | 'hi';
}> = ({ item, index, lang }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all overflow-hidden',
        'bg-[var(--color-surface)] border-[var(--color-border)]',
        open && 'shadow-md border-[var(--color-primary)]/40',
      )}
    >
      <button
        type="button"
        id={`agenda-item-${index}`}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--color-raised)] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
          style={{ background: 'var(--color-primary)' }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--color-text)] truncate">
            {lang === 'hi' ? item.titleHi : item.titleEn}
          </p>
          <p className="text-xs text-[var(--color-primary)] font-medium">
            Bridge: {item.category.replace('_', ' ')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={item.priority} />
          {open ? (
            <ChevronDown className="w-4 h-4 text-[var(--color-subtext)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--color-subtext)]" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-4">
          {/* Dual Perspective Bridge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-[var(--color-student)]/30 bg-[var(--color-student-light)] flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-student)] flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Learner Perspective
              </span>
              <p className="text-xs text-[var(--color-text)] leading-relaxed">
                {lang === 'hi' ? item.learnerPerspectiveHi : item.learnerPerspectiveEn}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--color-parent)]/30 bg-[var(--color-parent-light)] flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-parent)] flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" />
                Parent Worry / Hope
              </span>
              <p className="text-xs text-[var(--color-text)] leading-relaxed">
                {lang === 'hi' ? item.parentPerspectiveHi : item.parentPerspectiveEn}
              </p>
            </div>
          </div>

          {/* Verified Resolution */}
          <div
            className="p-3.5 rounded-xl border flex flex-col gap-1.5"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-raised)',
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-success)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Regional Resolution
            </span>
            <p className="text-xs text-[var(--color-text)] leading-relaxed font-medium">
              {lang === 'hi' ? item.verifiedResolutionHi : item.verifiedResolutionEn}
            </p>
          </div>

          {/* Recommended actions */}
          {item.recommendedActions && item.recommendedActions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-subtext)]">
                Agreed Action Steps
              </span>
              <ul className="flex flex-col gap-1 pl-4 list-disc text-xs text-[var(--color-text)]">
                {item.recommendedActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Joint Room Page                                               */
/* ------------------------------------------------------------------ */
export const JointRoomPage: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en';
  const { user, household } = useSessionStore();
  const { isConnected, connect, disconnect, participants } = useJointRoomStore();

  const [activeTab, setActiveTab] = useState<JointTab>('agenda');

  // Connect socket on mount, disconnect on unmount
  useEffect(() => {
    if (household?.id) {
      connect(household.id, user);
    }
    return () => {
      disconnect();
    };
  }, [household?.id, user, connect, disconnect]);

  // Fetch Bhavishya synthesized agenda
  const {
    data,
    isLoading,
    error,
    refetch: refetchAgenda,
  } = useQuery({
    queryKey: ['bhavishya-agenda', household?.id],
    queryFn: () => apiClient.get<BhavishyaAgendaResponse>('/bhavishya/agenda'),
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
          Please complete family intake first before entering the Joint Room.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Top Session Banner */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden border border-[var(--color-border)] shadow-sm"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-surface))',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                isConnected ? 'bg-[var(--color-success)] animate-pulse' : 'bg-[var(--color-error)]',
              )}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
              {isConnected ? 'Family Live Room • Connected' : 'Connecting Room…'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--color-subtext)]">
            <Users className="w-3.5 h-3.5" />
            <span>
              {participants.length > 0 ? `${participants.length} Active in Room` : 'Family Session'}
            </span>
          </div>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {lang === 'hi' ? 'संयुक्त परामर्श कक्ष' : 'Family Joint Counselling Room'}
        </h1>

        <p className="text-sm text-[var(--color-subtext)] leading-relaxed max-w-2xl mb-4">
          {lang === 'hi'
            ? 'भविष्य इंजन द्वारा संश्लेषित कार्यसूची, वास्तविक समय पारिवारिक चैट और सत्यापित क्षेत्रीय व्यावसायिक डेटा के साथ मिलकर निर्णय लें।'
            : 'A unified family space bridging student aspirations and parent worries with verified local career outcomes and grounded AI counselling.'}
        </p>

        {/* Household Context Tags */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-subtext)]">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-raised)] border border-[var(--color-border)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            {household.district}, {household.state}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-raised)] border border-[var(--color-border)]">
            <IndianRupee className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            {household.incomeBand.replace(/_/g, ' ')}
          </span>
          {agenda && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-raised)] border border-[var(--color-border)]">
              <Activity className="w-3.5 h-3.5 text-[var(--color-success)]" />
              Alignment Readiness: {agenda.readinessScore}%
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 gap-1 shadow-sm overflow-x-auto">
        <button
          type="button"
          id="joint-tab-agenda"
          onClick={() => setActiveTab('agenda')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'agenda'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-subtext)] hover:text-[var(--color-text)]',
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'hi' ? 'सत्र कार्यसूची' : 'Session Agenda'}</span>
          {agenda && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {agenda.agendaItems.length}
            </span>
          )}
        </button>

        <button
          type="button"
          id="joint-tab-chat"
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'chat'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-subtext)] hover:text-[var(--color-text)]',
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पारिवारिक चैट व एआई' : 'Live Chat & AI'}</span>
        </button>

        <button
          type="button"
          id="joint-tab-concerns"
          onClick={() => setActiveTab('concerns')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'concerns'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-subtext)] hover:text-[var(--color-text)]',
          )}
        >
          <Shield className="w-4 h-4" />
          <span>{lang === 'hi' ? 'केवल साझा चिंताएं' : 'Shared Items'}</span>
        </button>

        <button
          type="button"
          id="joint-tab-ladder"
          onClick={() => setActiveTab('ladder')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0',
            activeTab === 'ladder'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-subtext)] hover:text-[var(--color-text)]',
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{lang === 'hi' ? 'एनएसक्यूएफ सीढ़ी' : 'NSQF Ladder'}</span>
        </button>
      </div>

      {/* Tab 1: Agenda */}
      {activeTab === 'agenda' && (
        <div className="flex flex-col gap-6">
          {isLoading && (
            <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col items-center gap-3 text-center animate-pulse">
              <Sparkles className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Bhavishya Engine is synthesizing your joint agenda…
              </p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-2xl border border-[var(--color-error)] bg-[var(--color-error-bg)] text-center flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
              <p className="text-sm font-medium text-[var(--color-text)]">
                Could not load synthesized agenda. Share at least one concern from your private window.
              </p>
              <button
                type="button"
                id="retry-agenda-btn"
                onClick={() => refetchAgenda()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Retry
              </button>
            </div>
          )}

          {agenda && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                  <h2 className="text-base font-bold text-[var(--color-text)]">
                    {lang === 'hi' ? 'तैयार चर्चा बिंदु' : 'Synthesized Session Agenda'}
                  </h2>
                </div>
                <span className="text-xs text-[var(--color-subtext)]">
                  {agenda.agendaItems.length} {lang === 'hi' ? 'विषय' : 'topics structured'}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {agenda.agendaItems.map((item, idx) => (
                  <AgendaItemCard key={item.id} item={item} index={idx} lang={lang} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live Chat & AI */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <JointChatPanel />
          <AskSaathiCard />
        </div>
      )}

      {/* Tab 3: Shared Items Only */}
      {activeTab === 'concerns' && (
        <div className="flex flex-col gap-6">
          <SharedConcernsView />
        </div>
      )}

      {/* Tab 4: NSQF Career Ladder */}
      {activeTab === 'ladder' && (
        <div className="flex flex-col gap-6">
          <NsqfLadderView />
        </div>
      )}
    </div>
  );
};
