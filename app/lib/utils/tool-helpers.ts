/**
 * Tool Helper Utilities
 * 
 * Common utilities for tool components
 * Standardized error handling, loading states, validation
 */

import { showToast } from '@/app/shared/Toast';
import { parseSupabaseError, getErrorMessage, ErrorCode } from '../errors/error-handler';
import { validateEmail, validatePassword, validateRequired, validateLength, validateURL, ValidationResult } from '../validation/validators';
import { logger } from './logger';

/**
 * Safe async wrapper with error handling
 * Catches errors and shows user-friendly messages
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorMessage = 'An error occurred. Please try again.'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await asyncFn();
    return { data, error: null };
  } catch (error) {
    const message = getErrorMessage(error);
    showToast(message || errorMessage, 'error');
    return { data: null, error: message || errorMessage };
  }
}

/**
 * Safe async wrapper that throws (for use with try-catch)
 */
export async function safeAsyncThrow<T>(
  asyncFn: () => Promise<T>,
  errorMessage = 'An error occurred. Please try again.'
): Promise<T> {
  try {
    return await asyncFn();
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message || errorMessage);
  }
}

/**
 * Validation helper for tool inputs
 * Returns validation result and shows error if invalid
 */
export function validateToolInput(
  value: string,
  validators: Array<(val: string) => ValidationResult>,
  errorMessage?: string
): boolean {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) {
      if (errorMessage || result.error) {
        showToast(errorMessage || result.error || 'Invalid input', 'error');
      }
      return false;
    }
  }
  return true;
}

/**
 * Common validators for tools
 */
export const toolValidators = {
  email: (value: string) => validateEmail(value),
  password: (value: string) => validatePassword(value),
  required: (value: string, fieldName = 'Field') => validateRequired(value, fieldName),
  length: (value: string, min?: number, max?: number, fieldName = 'Field') => 
    validateLength(value, min, max, fieldName),
  url: (value: string) => validateURL(value),
};

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format number with commas
 */
export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency} ${formatNumber(amount)}`;
}

/**
 * Debounce function for inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for frequent events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(obj: any, fallback = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return fallback;
  }
}

/**
 * Copy to clipboard with error handling
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    logger.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
