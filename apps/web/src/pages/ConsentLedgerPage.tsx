import React, { useState } from 'react';
import {
  ShieldCheck,
  Link2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Hash,
  AlertTriangle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient.js';
import { useSessionStore } from '../stores/session.store.js';
import { cn } from '../lib/cn.js';

/* ------------------------------------------------------------------ */
/* Types (mirror backend LedgerEntryDto)                              */
/* ------------------------------------------------------------------ */
interface LedgerEntry {
  id: string;
  householdId: string;
  userId: string;
  eventType: string;
  payload: unknown;
  payloadHash: string;
  previousHash: string;
  blockHash: string;
  sequenceNumber: number;
  createdAt: string;
}

interface VerifyResponse {
  isValid: boolean;
  unbrokenChainLength: number;
  brokenAtId: string | null;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/* Event type display                                                  */
/* ------------------------------------------------------------------ */
const EVENT_META: Record<string, { label: string; color: string; bg: string }> = {
  MINOR_CONSENT: {
    label: 'Minor Consent',
    color: 'var(--color-student)',
    bg: 'var(--color-student-light)',
  },
  SHARE_CONCERN: {
    label: 'Shared Concern',
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-light)',
  },
  SHARE_PREFERENCE: {
    label: 'Shared Preference',
    color: 'var(--color-parent)',
    bg: 'var(--color-parent-light)',
  },
  DECISION_AGREEMENT: {
    label: 'Decision Agreement',
    color: 'var(--color-success)',
    bg: 'var(--color-success-bg)',
  },
};

const getEventMeta = (type: string) =>
  EVENT_META[type] ?? {
    label: type,
    color: 'var(--color-subtext)',
    bg: 'var(--color-muted)',
  };

/* ------------------------------------------------------------------ */
/* Hash chip (truncated)                                              */
/* ------------------------------------------------------------------ */
const HashChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] uppercase tracking-wider text-[var(--color-subtext)]">{label}</span>
    <code className="text-[11px] font-mono text-[var(--color-text)] bg-[var(--color-muted)] px-2 py-0.5 rounded-md break-all">
      {value.slice(0, 16)}…{value.slice(-8)}
    </code>
  </div>
);

/* ------------------------------------------------------------------ */
/* Individual ledger block card                                        */
/* ------------------------------------------------------------------ */
const BlockCard: React.FC<{ entry: LedgerEntry; isBroken: boolean }> = ({ entry, isBroken }) => {
  const [open, setOpen] = useState(false);
  const meta = getEventMeta(entry.eventType);
  const date = new Date(entry.createdAt);

  return (
    <div
      className={cn(
        'rounded-xl border transition-shadow',
        isBroken
          ? 'border-[var(--color-error)] bg-[var(--color-error-bg)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]',
        open && 'shadow-md',
      )}
    >
      <button
        type="button"
        id={`ledger-block-${entry.sequenceNumber}`}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Block number */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: meta.bg, color: meta.color }}
        >
          #{entry.sequenceNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            {isBroken && (
              <span className="text-xs text-[var(--color-error)] font-medium">
                Chain broken
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-subtext)] mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {date.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Hash className="w-3.5 h-3.5 text-[var(--color-subtext)]" />
          <span className="text-[11px] font-mono text-[var(--color-subtext)]">
            {entry.blockHash.slice(0, 8)}
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-[var(--color-subtext)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--color-subtext)]" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <HashChip label="Block Hash" value={entry.blockHash} />
          <HashChip label="Previous Hash" value={entry.previousHash} />
          <HashChip label="Payload Hash" value={entry.payloadHash} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-subtext)]">
              Payload
            </span>
            <pre className="text-[11px] font-mono text-[var(--color-text)] bg-[var(--color-muted)] px-2 py-1.5 rounded-md overflow-x-auto max-h-28">
              {JSON.stringify(entry.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
export const ConsentLedgerPage: React.FC = () => {
  const { household } = useSessionStore();
  const householdId = household?.id;

  const { data: ledgerData, isLoading: loadingLedger } = useQuery({
    queryKey: ['ledger', householdId],
    queryFn: () => apiClient.get<LedgerEntry[]>(`/ledger/${householdId}`),
    enabled: Boolean(householdId),
  });

  const { data: verifyData, isLoading: loadingVerify } = useQuery({
    queryKey: ['ledger-verify', householdId],
    queryFn: () => apiClient.get<VerifyResponse>(`/ledger/${householdId}/verify`),
    enabled: Boolean(householdId),
  });

  const entries = ledgerData?.data ?? [];
  const verification = verifyData?.data;
  const isChainValid = verification?.isValid ?? true;

  if (!householdId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="w-10 h-10 text-[var(--color-error)]" />
        <h1 className="text-xl font-bold text-[var(--color-text)]">No household found</h1>
        <p className="text-sm text-[var(--color-subtext)]">
          Complete household intake to view the consent ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-primary)' }}
          >
            Digital Consent Ledger
          </span>
        </div>
        <h1
          className="text-2xl font-bold text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Immutable Consent Trail
        </h1>
        <p className="text-sm text-[var(--color-subtext)] mt-1 leading-relaxed">
          Every consent and sharing decision is permanently recorded using SHA-256 hash chaining.
          No record can be altered without breaking the chain.
        </p>
      </div>

      {/* Chain integrity banner */}
      {!loadingVerify && verification && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: isChainValid ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
          }}
        >
          {isChainValid ? (
            <CheckCircle2
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: 'var(--color-success)' }}
            />
          ) : (
            <XCircle
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: 'var(--color-error)' }}
            />
          )}
          <div>
            <p
              className="text-sm font-semibold"
              style={{
                color: isChainValid ? 'var(--color-success)' : 'var(--color-error)',
              }}
            >
              {isChainValid
                ? `Chain intact — ${verification.unbrokenChainLength} verified blocks`
                : `Chain integrity broken at block ${verification.brokenAtId ?? 'unknown'}`}
            </p>
            <p className="text-xs text-[var(--color-subtext)] mt-0.5">
              Last verified: {new Date(verification.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Blocks', value: entries.length, icon: Link2 },
          {
            label: 'Consents',
            value: entries.filter((e) => e.eventType === 'MINOR_CONSENT').length,
            icon: ShieldCheck,
          },
          {
            label: 'Shared Items',
            value: entries.filter((e) =>
              ['SHARE_CONCERN', 'SHARE_PREFERENCE'].includes(e.eventType),
            ).length,
            icon: CheckCircle2,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] p-4 flex flex-col gap-1"
          >
            <Icon className="w-4 h-4 mb-1" style={{ color: 'var(--color-primary)' }} />
            <p className="text-xl font-bold text-[var(--color-text)]">{value}</p>
            <p className="text-xs text-[var(--color-subtext)]">{label}</p>
          </div>
        ))}
      </div>

      {/* Block list */}
      <section aria-labelledby="blocks-heading">
        <h2
          id="blocks-heading"
          className="text-base font-semibold text-[var(--color-text)] mb-4"
        >
          Consent Blocks
        </h2>

        {loadingLedger && (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-[var(--color-muted)] animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {!loadingLedger && entries.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--color-subtext)]">
            No consent events recorded yet. Events are logged as you share concerns and sign
            agreements in the joint session.
          </div>
        )}

        {!loadingLedger && entries.length > 0 && (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <BlockCard
                key={entry.id}
                entry={entry}
                isBroken={
                  !isChainValid && verification?.brokenAtId === entry.id
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Educational note */}
      <div
        className="rounded-xl p-5 border border-[var(--color-border)]"
        style={{ background: 'var(--color-raised)' }}
      >
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">
          How hash-chaining works
        </h3>
        <p className="text-xs text-[var(--color-subtext)] leading-relaxed">
          Each block stores a SHA-256 hash of its own payload, plus the hash of the previous block.
          This creates an unbreakable cryptographic chain — if any block is altered, all subsequent
          hashes become invalid, making tampering immediately detectable. Your consents are safe.
        </p>
      </div>
    </div>
  );
};
