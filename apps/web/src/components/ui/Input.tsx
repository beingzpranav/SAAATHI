import React from 'react';
import { cn } from '../../lib/cn.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, leftIcon, rightIcon, disabled, ...props }, ref) => {
    const inputId = id || React.useId();
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-[#3A2E2A] dark:text-[#F5EFEB]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6A5B55] dark:text-[#B8AAA3]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full min-h-[44px] px-3.5 py-2.5 rounded-[8px] border text-base transition-colors',
              'bg-white text-[#3A2E2A] border-[#E8DDD2] placeholder:text-[#8A7A73]',
              'dark:bg-[#1F1A17] dark:text-[#F5EFEB] dark:border-[#3D3430] dark:placeholder:text-[#6A5B55]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] dark:focus-visible:ring-[#D86A3E]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[#B83226] focus-visible:ring-[#B83226] dark:border-[#E56658]',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#6A5B55] dark:text-[#B8AAA3]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span id={errorId} className="text-xs font-medium text-[#B83226] dark:text-[#E56658]">
            {error}
          </span>
        ) : helperText ? (
          <span id={helperId} className="text-xs text-[#6A5B55] dark:text-[#B8AAA3]">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
