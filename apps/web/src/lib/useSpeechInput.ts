import { useState, useRef, useCallback, useEffect } from 'react';

export type SpeechLocale = 'en-IN' | 'hi-IN';

export interface UseSpeechInputOptions {
  locale?: SpeechLocale;
  continuous?: boolean;
  interimResults?: boolean;
  /** Future: swap this adapter with a real Bhashini ASR endpoint. */
  bhashiniMode?: boolean;
}

export interface UseSpeechInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// ── Web Speech API types (not in all TS lib versions) ──────────────────────

interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { transcript: string };
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  readonly resultIndex: number;
  [index: number]: ISpeechRecognitionResult | undefined;
}

interface ISpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent {
  readonly error: string;
}

interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type ISpeechRecognitionConstructor = new () => ISpeechRecognition;

function getSpeechRecognitionClass(): ISpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w['SpeechRecognition'] ?? w['webkitSpeechRecognition'] ?? null) as ISpeechRecognitionConstructor | null;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Web Speech API voice input hook with a Bhashini-ready adapter interface.
 *
 * When `bhashiniMode` is true (future), calls can be routed to the Bhashini
 * ASR REST endpoint (https://bhashini.gov.in/ulca/model/api/v0/model/compute)
 * instead of the browser Web Speech API. For now, both paths use SpeechRecognition.
 */
export function useSpeechInput(options: UseSpeechInputOptions = {}): UseSpeechInputReturn {
  const { locale = 'hi-IN', continuous = false, interimResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const SpeechRecognitionClass = getSpeechRecognitionClass();
  const isSupported = SpeechRecognitionClass !== null;

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !SpeechRecognitionClass) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setError(null);
    setInterimTranscript('');

    const recognition = new SpeechRecognitionClass();
    recognition.lang = locale;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let finalPart = '';
      let interimPart = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalPart += text;
        } else {
          interimPart += text;
        }
      }

      if (finalPart) setTranscript((prev) => prev + finalPart);
      setInterimTranscript(interimPart);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      setError(`Speech error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, SpeechRecognitionClass, locale, continuous, interimResults]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
