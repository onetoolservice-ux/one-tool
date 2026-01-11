/**
 * Shared Components Index
 * 
 * Central export for all shared components
 * Makes importing easier: import { Button, Input } from '@/app/components/shared'
 */

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { LoadingSpinner, FullPageLoader, InlineLoader } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { ErrorMessage } from './ErrorMessage';
export type { ErrorMessageProps } from './ErrorMessage';

export { CopyButton } from './CopyButton';
export type { CopyButtonProps } from './CopyButton';

export { useCopyToClipboard } from '@/app/hooks/useCopyToClipboard';
