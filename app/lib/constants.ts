/**
 * Application Constants
 * Centralized constants for file size limits, validation rules, etc.
 */

// File Size Limits
export const MAX_PDF_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_GENERAL_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Validation Limits
export const MAX_INPUT_LENGTH = 10000;
export const MAX_EMAIL_LENGTH = 255;
export const MAX_NAME_LENGTH = 200;

// Cache TTLs
export const USER_PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const TOOLS_CACHE_TTL = 60 * 60 * 1000; // 1 hour
