import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechInput } from '../../lib/useSpeechInput.js';
import type { SpeechLocale } from '../../lib/useSpeechInput.js';
import { cn } from '../../lib/cn.js';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  locale?: SpeechLocale;
  /** Optional label override for screen readers */
  label?: string;
  className?: string;
  id?: string;
}

/**
 * Icon-first mic button for voice input.
 * Pulses while listening, shows interim transcript in a tooltip-style bubble.
 * Falls back silently if Web Speech API is unavailable.
 */
export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  locale = 'hi-IN',
  label,
  className,
  id = 'voice-input-btn',
}) => {
  const { isListening, isSupported, transcript, interimTranscript, startListening, stopListening, resetTranscript } =
    useSpeechInput({ locale, continuous: false, interimResults: true });

  // Fire callback when we get a final transcript
  React.useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  if (!isSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <button
        id={id}
        type="button"
        aria-label={label ?? (isListening ? 'Stop voice input' : 'Start voice input')}
        aria-pressed={isListening}
        onClick={handleClick}
        className={cn(
          'relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
          isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110'
            : 'bg-[var(--color-raised)] border border-[var(--color-border)] text-[var(--color-subtext)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40',
          className,
        )}
      >
        {isListening ? (
          <>
            {/* Pulse ring animation */}
            <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
            <MicOff className="w-4 h-4 relative z-10" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Interim transcript bubble */}
      {isListening && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 shadow-lg z-50 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
            <Loader2 className="w-3 h-3 text-red-500 animate-spin" />
            <span className="text-xs font-semibold text-red-500">Listening…</span>
          </div>
          <p className="text-xs text-[var(--color-subtext)] min-h-[1rem]">
            {interimTranscript || '…'}
          </p>
        </div>
      )}
    </div>
  );
};
