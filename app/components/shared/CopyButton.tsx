/**
 * Shared Copy Button Component
 * 
 * Consistent copy-to-clipboard button with feedback
 * Uses the useCopyToClipboard hook for standardized behavior
 */

"use client";

import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/app/hooks/useCopyToClipboard';
import { cn } from '@/app/lib/utils';

export interface CopyButtonProps {
  text: string;
  successMessage?: string;
  variant?: 'icon' | 'button' | 'icon-text';
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  successMessage,
  variant = 'icon',
  size = 'md',
  className,
  showIcon = true,
}) => {
  const { copy, copied } = useCopyToClipboard();

  const handleClick = () => {
    copy(text, successMessage);
  };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-lg',
          'bg-slate-100 dark:bg-slate-800',
          'hover:bg-slate-200 dark:hover:bg-slate-700',
          'text-slate-600 dark:text-slate-400',
          'hover:text-slate-900 dark:hover:text-slate-200',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          sizeClasses[size],
          className
        )}
        aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  }

  if (variant === 'icon-text') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-2',
          'px-3 py-1.5',
          'rounded-lg',
          'bg-slate-100 dark:bg-slate-800',
          'hover:bg-slate-200 dark:hover:bg-slate-700',
          'text-xs font-semibold',
          'text-slate-700 dark:text-slate-300',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          className
        )}
      >
        {showIcon && (copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />)}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2',
        'px-4 py-2',
        'rounded-lg',
        'bg-indigo-600 text-white',
        'hover:bg-indigo-700',
        'text-sm font-semibold',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={!text}
    >
      {showIcon && (copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />)}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};
