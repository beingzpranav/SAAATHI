import React from 'react';
import { useDynamicTranslate } from '../../lib/useDynamicTranslate.js';

interface TranslatedTextProps {
  text: string;
  context?: 'app_ui' | 'message' | 'notification' | 'generated';
  className?: string;
  fallback?: React.ReactNode;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  context = 'message',
  className = '',
  fallback,
}) => {
  const { translatedText, isTranslating } = useDynamicTranslate(text, context);

  if (isTranslating && fallback) {
    return <>{fallback}</>;
  }

  return (
    <span className={`${className} ${isTranslating ? 'opacity-85 transition-opacity' : ''}`}>
      {translatedText}
    </span>
  );
};
