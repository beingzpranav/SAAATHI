import React from 'react';
import { cn } from '../../lib/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'student' | 'parent' | 'interactive';
  isClickable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', isClickable = false, children, ...props }, ref) => {
    const variantStyles = {
      default:
        'bg-white border-[#E8DDD2] text-[#3A2E2A] dark:bg-[#1F1A17] dark:border-[#3D3430] dark:text-[#F5EFEB]',
      student:
        'bg-white border-[#EFA531] text-[#3A2E2A] dark:bg-[#1F1A17] dark:border-[#EFA531]/60 dark:text-[#F5EFEB]',
      parent:
        'bg-white border-[#2F7D5C] text-[#3A2E2A] dark:bg-[#1F1A17] dark:border-[#2F7D5C]/60 dark:text-[#F5EFEB]',
      interactive:
        'bg-white border-[#E8DDD2] text-[#3A2E2A] hover:border-[#C4562B] dark:bg-[#1F1A17] dark:border-[#3D3430] dark:hover:border-[#D86A3E] cursor-pointer hover:shadow-md transition-all',
    };

    return (
      <div
        ref={ref}
        tabIndex={isClickable ? 0 : undefined}
        role={isClickable ? 'button' : undefined}
        className={cn(
          'rounded-[12px] border p-6 shadow-sm transition-colors',
          variantStyles[variant],
          isClickable &&
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] dark:focus-visible:ring-[#D86A3E] active:scale-[0.99]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
