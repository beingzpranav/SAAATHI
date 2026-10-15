import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { Button } from './Button.js';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-[12px] border border-dashed border-[#E8DDD2] bg-white/50 dark:bg-[#1F1A17]/50 dark:border-[#3D3430]',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-[8px] bg-[#F3ECE4] dark:bg-[#2A2320] flex items-center justify-center mb-4 text-[#6A5B55] dark:text-[#B8AAA3]">
        {icon || <Inbox className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-bold text-[#3A2E2A] dark:text-[#F5EFEB] mb-2">{title}</h3>
      <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
