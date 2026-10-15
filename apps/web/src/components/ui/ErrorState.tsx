import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button } from './Button.js';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this section. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-[12px] border border-[#B83226]/30 bg-[#FDF2F0] dark:bg-[#2E1C1A] dark:border-[#E56658]/40',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-[8px] bg-[#B83226]/10 dark:bg-[#E56658]/10 flex items-center justify-center mb-4 text-[#B83226] dark:text-[#E56658]">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-[#8E241B] dark:text-[#F8B3AC] mb-2">{title}</h3>
      <p className="text-sm text-[#8E241B]/80 dark:text-[#F8B3AC]/80 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
