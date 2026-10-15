import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { GroundedCitation } from '@saathi/shared';

import { useJointRoomStore } from '../../stores/jointRoom.store.js';
import { useSessionStore } from '../../stores/session.store.js';
import { cn } from '../../lib/cn.js';

interface JointChatPanelProps {
  onSelectPrompt?: (prompt: string) => void;
}

const QUICK_PROMPTS = [
  {
    en: 'What is the median salary for Electrician in our district?',
    hi: 'हमारे जिले में इलेक्ट्रीशियन का औसत वेतन क्या है?',
  },
  {
    en: 'Is there a monthly NAPS stipend during training?',
    hi: 'क्या प्रशिक्षण के दौरान मासिक एनएपीएस मानदेय मिलता है?',
  },
  {
    en: 'How long is the Solar Technician course?',
    hi: 'सोलर तकनीशियन कोर्स की अवधि कितनी है?',
  },
];

const CitationPill: React.FC<{ citation: GroundedCitation }> = ({ citation }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-block mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
      >
        <ShieldCheck className="w-3 h-3 text-[var(--color-success)]" />
        <span className="font-semibold">{citation.title}</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-1 p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-raised)] text-xs text-[var(--color-text)] flex flex-col gap-1 max-w-sm">
          {citation.verifiedStatistic && (
            <p className="font-medium text-[var(--color-text)]">
              {citation.verifiedStatistic}
            </p>
          )}
          {citation.verificationSource && (
            <p className="text-[10px] text-[var(--color-subtext)]">
              Source: {citation.verificationSource}
            </p>
          )}
          <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--color-success)]">
            Verified Level: {citation.confidence}
          </span>
        </div>
      )}
    </div>
  );
};

export const JointChatPanel: React.FC<JointChatPanelProps> = ({ onSelectPrompt }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en';
  const { user } = useSessionStore();
  const { messages, isConnected, sendMessage, sendTyping, typingUsers } = useJointRoomStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !isConnected) return;

    sendMessage(input.trim());
    setInput('');
    sendTyping(false);
  };

  const typingNames = Object.values(typingUsers).filter(Boolean);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col h-[520px] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-raised)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              isConnected ? 'bg-[var(--color-success)] animate-pulse' : 'bg-[var(--color-error)]',
            )}
          />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            {lang === 'hi' ? 'पारिवारिक लाइव चैट' : 'Family Real-Time Chat'}
          </h3>
        </div>
        <span className="text-xs text-[var(--color-subtext)] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
          {lang === 'hi' ? 'साथी एआई सुगमकर्ता सक्रिय' : 'Saathi AI Grounded'}
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => {
          const isMe = user?.id === msg.senderId;
          const isAi = msg.senderRole === 'AI';
          const isLearner = msg.senderRole === 'LEARNER';
          const isParent = msg.senderRole === 'PARENT';

          return (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2 max-w-[85%]',
                isMe ? 'ml-auto flex-row-reverse' : 'mr-auto',
              )}
            >
              {/* Avatar Icon */}
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold mt-1',
                  isAi && 'bg-[var(--color-primary)] shadow-sm',
                  isLearner && 'bg-[var(--color-student)]',
                  isParent && 'bg-[var(--color-parent)]',
                  !isAi && !isLearner && !isParent && 'bg-[var(--color-subtext)]',
                )}
              >
                {isAi ? (
                  <Bot className="w-4 h-4" />
                ) : isLearner ? (
                  <GraduationCap className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm',
                  isAi &&
                    'bg-[var(--color-raised)] border border-[var(--color-primary)] text-[var(--color-text)] shadow-sm',
                  !isAi &&
                    isMe &&
                    'bg-[var(--color-primary)] text-white font-medium rounded-tr-sm',
                  !isAi &&
                    !isMe &&
                    'bg-[var(--color-muted)] text-[var(--color-text)] rounded-tl-sm',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      isMe ? 'text-white/80' : 'text-[var(--color-subtext)]',
                    )}
                  >
                    {msg.senderName}
                  </span>
                  <span
                    className={cn(
                      'text-[9px]',
                      isMe ? 'text-white/60' : 'text-[var(--color-subtext)]',
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                  {msg.text}
                </p>

                {/* Citations list for grounded AI answers */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-border)] mt-2">
                    {msg.citations.map((c) => (
                      <CitationPill key={c.id} citation={c} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingNames.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-subtext)] animate-pulse pl-9">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            <span>
              {typingNames.join(', ')} {lang === 'hi' ? 'टाइप कर रहे हैं...' : 'typing…'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex gap-2 overflow-x-auto">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            type="button"
            id={`quick-prompt-${i}`}
            onClick={() => {
              const text = lang === 'hi' ? p.hi : p.en;
              setInput(text);
              onSelectPrompt?.(text);
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-[var(--color-border)] bg-[var(--color-raised)] text-[var(--color-subtext)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {lang === 'hi' ? p.hi : p.en}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-2"
      >
        <input
          type="text"
          id="joint-chat-input"
          value={input}
          onChange={handleInputChange}
          placeholder={
            lang === 'hi'
              ? 'संदेश लिखें या @ai से सवाल पूछें...'
              : 'Type a message or ask @ai a vocational question…'
          }
          className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] px-3.5 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-subtext)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <button
          type="submit"
          id="joint-chat-send-btn"
          disabled={!input.trim() || !isConnected}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-opacity shrink-0"
          style={{ background: 'var(--color-primary)' }}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
