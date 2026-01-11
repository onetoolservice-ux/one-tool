/**
 * Shared Loading Spinner Component
 * 
 * Consistent loading indicator across the platform
 * Subtle, professional animation
 */

"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2
        className={cn('animate-spin text-indigo-600 dark:text-indigo-400', sizeClasses[size])}
      />
      {text && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{text}</p>
      )}
    </div>
  );
};

/**
 * Full page loading spinner
 */
export const FullPageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

/**
 * Inline loading spinner (for buttons, small areas)
 */
export const InlineLoader: React.FC<{ className?: string }> = ({ className }) => {
  return <LoadingSpinner size="sm" className={className} />;
};
