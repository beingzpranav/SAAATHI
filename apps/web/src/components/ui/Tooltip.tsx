import React, { useState } from 'react';
import { cn } from '../../lib/cn.js';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = React.useId();

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      })}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-[6px] shadow-md whitespace-nowrap pointer-events-none transition-opacity',
            'bg-[#3A2E2A] text-white dark:bg-[#F5EFEB] dark:text-[#171311]',
            positionStyles[position],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
