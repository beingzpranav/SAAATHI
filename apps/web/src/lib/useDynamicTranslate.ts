import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translationClient } from './translationClient.js';

interface UseDynamicTranslateResult {
  translatedText: string;
  isTranslating: boolean;
  currentLanguage: string;
}

/**
 * React hook to translate dynamic texts (chat messages, notifications, AI responses)
 * in real-time based on the current i18n language.
 */
export function useDynamicTranslate(
  text: string,
  context: 'app_ui' | 'message' | 'notification' | 'generated' = 'message'
): UseDynamicTranslateResult {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    if (!text || currentLanguage === 'en') {
      setTranslatedText(text);
      setIsTranslating(false);
      return;
    }

    let isMounted = true;
    setIsTranslating(true);

    translationClient
      .translate(text, currentLanguage, 'en', context)
      .then((translated) => {
        if (isMounted) {
          setTranslatedText(translated);
          setIsTranslating(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslatedText(text);
          setIsTranslating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, currentLanguage, context]);

  return { translatedText, isTranslating, currentLanguage };
}
