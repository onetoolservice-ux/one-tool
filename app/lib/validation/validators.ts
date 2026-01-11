/**
 * Validation Utilities
 * 
 * Comprehensive validation functions for forms and data
 */

import { ErrorCode, createError } from '../errors/error-handler';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: ErrorCode;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: 'Email is required',
      errorCode: ErrorCode.VALIDATION_REQUIRED,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
      errorCode: ErrorCode.VALIDATION_INVALID_EMAIL,
    };
  }

  return { isValid: true };
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return {
      isValid: false,
      error: 'Password is required',
      errorCode: ErrorCode.VALIDATION_REQUIRED,
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters',
      errorCode: ErrorCode.VALIDATION_TOO_SHORT,
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Password must be less than 128 characters',
      errorCode: ErrorCode.VALIDATION_TOO_LONG,
    };
  }

  return { isValid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string | null | undefined, fieldName = 'Field'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
      errorCode: ErrorCode.VALIDATION_REQUIRED,
    };
  }

  return { isValid: true };
}

/**
 * Text length validation
 */
export function validateLength(
  value: string,
  min?: number,
  max?: number,
  fieldName = 'Field'
): ValidationResult {
  if (min !== undefined && value.length < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min} characters`,
      errorCode: ErrorCode.VALIDATION_TOO_SHORT,
    };
  }

  if (max !== undefined && value.length > max) {
    return {
      isValid: false,
      error: `${fieldName} must be less than ${max} characters`,
      errorCode: ErrorCode.VALIDATION_TOO_LONG,
    };
  }

  return { isValid: true };
}

/**
 * URL validation
 */
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      error: 'URL is required',
      errorCode: ErrorCode.VALIDATION_REQUIRED,
    };
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol',
        errorCode: ErrorCode.VALIDATION_INVALID_FORMAT,
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL',
      errorCode: ErrorCode.VALIDATION_INVALID_FORMAT,
    };
  }
}

/**
 * Validate multiple fields at once
 */
export function validateFields(fields: Record<string, ValidationResult>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, result] of Object.entries(fields)) {
    if (!result.isValid) {
      isValid = false;
      if (result.error) {
        errors[fieldName] = result.error;
      }
    }
  }

  return { isValid, errors };
}
