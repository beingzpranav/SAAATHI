import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'student' | 'parent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[44px]';

    const variantStyles = {
      primary:
        'bg-[#C4562B] text-white hover:bg-[#AF4A23] active:bg-[#993E1B] focus-visible:ring-[#C4562B] dark:bg-[#D86A3E] dark:hover:bg-[#E27E53]',
      student:
        'bg-[#EFA531] text-[#291F0E] hover:bg-[#E59922] active:bg-[#D48A14] focus-visible:ring-[#EFA531] dark:bg-[#F4B34C] dark:hover:bg-[#F8C26E]',
      parent:
        'bg-[#2F7D5C] text-white hover:bg-[#266A4E] active:bg-[#1E573F] focus-visible:ring-[#2F7D5C] dark:bg-[#419B74] dark:hover:bg-[#50AF85]',
      secondary:
        'bg-[#F3ECE4] text-[#3A2E2A] hover:bg-[#EADDCF] active:bg-[#DFCFBF] focus-visible:ring-[#3A2E2A] dark:bg-[#2A2320] dark:text-[#F5EFEB] dark:hover:bg-[#3D3430]',
      outline:
        'border-2 border-[#E8DDD2] bg-transparent text-[#3A2E2A] hover:bg-[#F9F4EE] active:bg-[#F3ECE4] focus-visible:ring-[#C4562B] dark:border-[#3D3430] dark:text-[#F5EFEB] dark:hover:bg-[#2A2320]',
      ghost:
        'bg-transparent text-[#3A2E2A] hover:bg-[#F3ECE4] active:bg-[#EADDCF] focus-visible:ring-[#C4562B] dark:text-[#F5EFEB] dark:hover:bg-[#2A2320]',
      danger:
        'bg-[#B83226] text-white hover:bg-[#A32B20] active:bg-[#8E241B] focus-visible:ring-[#B83226] dark:bg-[#E56658] dark:hover:bg-[#EC7C6F]',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[36px]',
      md: 'px-5 py-2.5 text-base gap-2 min-h-[44px]',
      lg: 'px-6 py-3.5 text-lg gap-2.5 min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            <span>{children}</span>
            {rightIcon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
