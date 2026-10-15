import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, id, options, disabled, ...props }, ref) => {
    const selectId = id || React.useId();
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold text-[#3A2E2A] dark:text-[#F5EFEB]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full min-h-[44px] appearance-none px-3.5 py-2.5 pr-10 rounded-[8px] border text-base transition-colors cursor-pointer',
              'bg-white text-[#3A2E2A] border-[#E8DDD2]',
              'dark:bg-[#1F1A17] dark:text-[#F5EFEB] dark:border-[#3D3430]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] dark:focus-visible:ring-[#D86A3E]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[#B83226] focus-visible:ring-[#B83226] dark:border-[#E56658]',
              className,
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 flex items-center pointer-events-none text-[#6A5B55] dark:text-[#B8AAA3]">
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </div>
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

Select.displayName = 'Select';
