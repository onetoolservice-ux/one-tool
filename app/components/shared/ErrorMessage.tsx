/**
 * Shared Error Message Component
 * 
 * Consistent error display across the platform
 * Used for inline error messages and validation feedback
 */

"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export interface ErrorMessageProps {
  message: string;
  className?: string;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className,
  size = 'sm',
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'text-red-600 dark:text-red-400',
        'font-medium',
        sizeClasses[size],
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
