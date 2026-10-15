import React from 'react';
import { cn } from '../../lib/cn.js';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-[4px]',
    rectangular: 'rounded-[8px]',
    circular: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-[#E8DDD2]/60 dark:bg-[#3D3430]/60',
        variantStyles[variant],
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
