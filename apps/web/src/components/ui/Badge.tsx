import React from 'react';
import { cn } from '../../lib/cn.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'primary'
    | 'student'
    | 'parent'
    | 'neutral'
    | 'demo'
    | 'confidence-high'
    | 'confidence-medium'
    | 'confidence-low'
    | 'confidence-none';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-[#F8EDE7] text-[#993E1B] border border-[#C4562B]/30 dark:bg-[#32211B] dark:text-[#E27E53] dark:border-[#D86A3E]/30',
    student:
      'bg-[#FDF4E5] text-[#915B06] border border-[#EFA531]/30 dark:bg-[#342817] dark:text-[#F8C26E] dark:border-[#F4B34C]/30',
    parent:
      'bg-[#EBF4F0] text-[#1E573F] border border-[#2F7D5C]/30 dark:bg-[#1B2F25] dark:text-[#50AF85] dark:border-[#419B74]/30',
    neutral:
      'bg-[#F3ECE4] text-[#3A2E2A] border border-[#E8DDD2] dark:bg-[#2A2320] dark:text-[#F5EFEB] dark:border-[#3D3430]',
    demo: 'bg-[#F5EAE1] text-[#7A361C] border border-[#C4562B] font-mono tracking-wider font-bold dark:bg-[#2F211C] dark:text-[#EFA531]',
    'confidence-high':
      'bg-[#EBF4F0] text-[#1E573F] border border-[#2F7D5C] font-semibold dark:bg-[#1B2F25] dark:text-[#419B74]',
    'confidence-medium':
      'bg-[#FDF4E5] text-[#805007] border border-[#EFA531] font-semibold dark:bg-[#342817] dark:text-[#F4B34C]',
    'confidence-low':
      'bg-[#FDF2F0] text-[#8E241B] border border-[#B83226] font-semibold dark:bg-[#2E1C1A] dark:text-[#E56658]',
    'confidence-none':
      'bg-[#F3ECE4] text-[#6A5B55] border border-[#E8DDD2] font-semibold dark:bg-[#28211D] dark:text-[#B8AAA3]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-[4px]',
    md: 'text-sm px-2.5 py-1 rounded-[6px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium select-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
