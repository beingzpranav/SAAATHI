import React from 'react';
import { cn } from '../../lib/cn.js';

export interface ProgressBarProps {
  value: number; // 0 to max (default 100)
  max?: number;  // defaults to 100
  label?: string;
  variant?: 'primary' | 'student' | 'parent';
  colorVariant?: 'primary' | 'student' | 'parent'; // alias for variant
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  variant = 'primary',
  colorVariant,
  className,
}) => {
  const resolvedVariant = colorVariant ?? variant;
  const clampedValue = Math.min(max, Math.max(0, value));
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;

  const variantStyles = {
    primary: 'bg-[#C4562B] dark:bg-[#D86A3E]',
    student: 'bg-[#EFA531] dark:bg-[#F4B34C]',
    parent: 'bg-[#2F7D5C] dark:bg-[#419B74]',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1', className)}>
      {label && (
        <div className="flex justify-between text-xs font-semibold text-[#6A5B55] dark:text-[#B8AAA3]">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        className="w-full h-2 rounded-full overflow-hidden bg-[#E8DDD2] dark:bg-[#3D3430]"
      >
        <div
          className={cn('h-full transition-all duration-300 ease-out', variantStyles[resolvedVariant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
