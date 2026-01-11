/**
 * Shared Textarea Component
 * 
 * Professional, consistent textarea component with validation states
 * Accessible by default with focus states and error handling
 */

"use client";

import React from 'react';
import { cn } from '@/app/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  rows?: number;
}

const TextareaComponent = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      rows = 4,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            className={cn(
              // Base styles
              'w-full',
              'px-4 py-2.5',
              'text-sm',
              'font-medium',
              'bg-white dark:bg-slate-800',
              'border rounded-lg',
              'text-slate-900 dark:text-white',
              'placeholder:text-slate-500 dark:placeholder:text-slate-500',
              'resize-none',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed',
              // Error state - Always visible borders (SAP style)
              hasError
                ? 'border-red-500 focus:border-red-500'
                : 'border-blue-300 dark:border-blue-600',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${textareaId}-helper`}
            className="text-xs text-slate-600 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextareaComponent.displayName = 'Textarea';

export const Textarea = TextareaComponent;
export default Textarea;
