/**
 * Comprehensive Error Handling System
 * 
 * Centralized error handling with user-friendly messages,
 * error codes, and logging capabilities
 */

export enum ErrorCode {
  // Auth Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  
  // Database Errors
  DB_DUPLICATE_ENTRY = 'DB_DUPLICATE_ENTRY',
  DB_FOREIGN_KEY_VIOLATION = 'DB_FOREIGN_KEY_VIOLATION',
  DB_NOT_FOUND = 'DB_NOT_FOUND',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  
  // Permission Errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ADMIN_ONLY = 'ADMIN_ONLY',
  ROLE_CHANGE_FORBIDDEN = 'ROLE_CHANGE_FORBIDDEN',
  
  // Validation Errors
  VALIDATION_REQUIRED = 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_TOO_SHORT = 'VALIDATION_TOO_SHORT',
  VALIDATION_TOO_LONG = 'VALIDATION_TOO_LONG',
  VALIDATION_INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  
  // System Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  
  // User Management Errors
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
  USER_DELETE_FAILED = 'USER_DELETE_FAILED',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string; // User-friendly message
  originalError?: Error | unknown;
  details?: Record<string, any>;
}

/**
 * Maps error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email before signing in.',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'User account not found.',
  
  [ErrorCode.DB_DUPLICATE_ENTRY]: 'This record already exists.',
  [ErrorCode.DB_FOREIGN_KEY_VIOLATION]: 'Cannot delete this item because it is in use.',
  [ErrorCode.DB_NOT_FOUND]: 'The requested item was not found.',
  [ErrorCode.DB_CONSTRAINT_VIOLATION]: 'Invalid data provided.',
  
  [ErrorCode.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ErrorCode.ADMIN_ONLY]: 'This action requires administrator privileges.',
  [ErrorCode.ROLE_CHANGE_FORBIDDEN]: 'You cannot change your own role.',
  
  [ErrorCode.VALIDATION_REQUIRED]: 'This field is required.',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid format.',
  [ErrorCode.VALIDATION_TOO_SHORT]: 'Value is too short.',
  [ErrorCode.VALIDATION_TOO_LONG]: 'Value is too long.',
  [ErrorCode.VALIDATION_INVALID_EMAIL]: 'Please enter a valid email address.',
  
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred.',
  
  [ErrorCode.USER_ALREADY_EXISTS]: 'A user with this email already exists.',
  [ErrorCode.USER_NOT_FOUND]: 'User not found.',
  [ErrorCode.USER_UPDATE_FAILED]: 'Failed to update user.',
  [ErrorCode.USER_DELETE_FAILED]: 'Failed to delete user.',
};

/**
 * Parse Supabase errors and convert to AppError
 */
export function parseSupabaseError(error: unknown): AppError {
  if (typeof error !== 'object' || error === null) {
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'Unknown error occurred',
      userMessage: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
      originalError: error,
    };
  }

  const errorObj = error as Record<string, any>;
  const errorMessage = errorObj.message || errorObj.error_description || String(error);
  const errorCode = errorObj.code || errorObj.error_code;

  // Handle Supabase Auth errors
  if (errorCode === 'invalid_credentials' || errorMessage.includes('Invalid login credentials')) {
    return {
      code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorCode.AUTH_INVALID_CREDENTIALS],
      originalError: error,
    };
  }

  if (errorCode === 'email_not_confirmed' || errorMessage.includes('Email not confirmed')) {
    return {
      code: ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorCode.AUTH_EMAIL_NOT_VERIFIED],
      originalError: error,
    };
  }

  if (errorCode === 'user_already_registered' || errorMessage.includes('already registered')) {
    return {
      code: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorCode.AUTH_EMAIL_ALREADY_EXISTS],
      originalError: error,
    };
  }

  // Handle PostgreSQL errors
  if (errorCode === '23505' || errorMessage.includes('duplicate key')) {
    return {
      code: ErrorCode.DB_DUPLICATE_ENTRY,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorCode.DB_DUPLICATE_ENTRY],
      originalError: error,
      details: { constraint: errorObj.constraint, table: errorObj.table },
    };
  }

  if (errorCode === '23503' || errorMessage.includes('foreign key constraint')) {
    return {
      code: ErrorCode.DB_FOREIGN_KEY_VIOLATION,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorCode.DB_FOREIGN_KEY_VIOLATION],
      originalError: error,
    };
  }

  if (errorCode === '23514' || errorMessage.includes('check constraint')) {
    return {
      code: ErrorCode.DB_CONSTRAINT_VIOLATION,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorCode.DB_CONSTRAINT_VIOLATION],
      originalError: error,
    };
  }

  // Handle permission errors
  if (errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
    return {
      code: ErrorCode.PERMISSION_DENIED,
      message: errorMessage,
      userMessage: ERROR_MESSAGES[ErrorCode.PERMISSION_DENIED],
      originalError: error,
    };
  }

  // Generic error
  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: errorMessage,
    userMessage: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
    originalError: error,
  };
}

/**
 * Create an AppError from an error code
 */
export function createError(
  code: ErrorCode,
  message?: string,
  details?: Record<string, any>
): AppError {
  return {
    code,
    message: message || code,
    userMessage: ERROR_MESSAGES[code],
    details,
  };
}

/**
 * Check if error is a specific error code
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as AppError).code === code;
  }
  return false;
}

/**
 * Extract user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'userMessage' in error) {
    return (error as AppError).userMessage;
  }
  
  if (error instanceof Error) {
    return parseSupabaseError(error).userMessage;
  }
  
  return parseSupabaseError(error).userMessage;
}
