/**
 * Tests for Application Constants
 */

import {
  MAX_PDF_FILE_SIZE,
  MAX_IMAGE_FILE_SIZE,
  MAX_GENERAL_FILE_SIZE,
  MAX_INPUT_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
} from '@/app/lib/constants';

describe('Application Constants', () => {
  describe('File Size Limits', () => {
    it('should define MAX_PDF_FILE_SIZE as 50MB', () => {
      expect(MAX_PDF_FILE_SIZE).toBe(50 * 1024 * 1024);
    });

    it('should define MAX_IMAGE_FILE_SIZE as 10MB', () => {
      expect(MAX_IMAGE_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should define MAX_GENERAL_FILE_SIZE as 100MB', () => {
      expect(MAX_GENERAL_FILE_SIZE).toBe(100 * 1024 * 1024);
    });

    it('should have correct size relationships', () => {
      expect(MAX_PDF_FILE_SIZE).toBeGreaterThan(MAX_IMAGE_FILE_SIZE);
      expect(MAX_GENERAL_FILE_SIZE).toBeGreaterThan(MAX_PDF_FILE_SIZE);
    });
  });

  describe('Validation Limits', () => {
    it('should define MAX_INPUT_LENGTH', () => {
      expect(MAX_INPUT_LENGTH).toBe(10000);
      expect(typeof MAX_INPUT_LENGTH).toBe('number');
    });

    it('should define MAX_EMAIL_LENGTH', () => {
      expect(MAX_EMAIL_LENGTH).toBe(255);
      expect(typeof MAX_EMAIL_LENGTH).toBe('number');
    });

    it('should define MAX_NAME_LENGTH', () => {
      expect(MAX_NAME_LENGTH).toBe(200);
      expect(typeof MAX_NAME_LENGTH).toBe('number');
    });
  });

  describe('Cache TTLs', () => {
    it('should export USER_PROFILE_CACHE_TTL', () => {
      // Import dynamically to check if it exists
      const constants = require('@/app/lib/constants');
      expect(constants.USER_PROFILE_CACHE_TTL).toBeDefined();
      expect(typeof constants.USER_PROFILE_CACHE_TTL).toBe('number');
    });

    it('should export TOOLS_CACHE_TTL', () => {
      const constants = require('@/app/lib/constants');
      expect(constants.TOOLS_CACHE_TTL).toBeDefined();
      expect(typeof constants.TOOLS_CACHE_TTL).toBe('number');
    });
  });
});
