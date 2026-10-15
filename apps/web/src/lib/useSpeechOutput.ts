import { useState, useCallback, useRef } from 'react';
import type { SpeechLocale } from './useSpeechInput.js';

export interface UseSpeechOutputReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string, locale?: SpeechLocale) => void;
  cancel: () => void;
}

/**
 * Web Speech Synthesis hook for read-aloud (TTS) support.
 * Supports en-IN and hi-IN voices. Falls back gracefully when synthesis
 * is unavailable (Lite mode text display is always shown as a fallback).
 */
export function useSpeechOutput(defaultLocale: SpeechLocale = 'hi-IN'): UseSpeechOutputReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  const speak = useCallback(
    (text: string, locale: SpeechLocale = defaultLocale) => {
      if (!isSupported) return;

      // Cancel any in-progress speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.9;   // Slightly slower for comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Prefer a voice matching the requested locale
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.startsWith(locale.slice(0, 2))) ?? null;
      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, defaultLocale],
  );

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSpeaking, isSupported, speak, cancel };
}
