/**
 * Unit Tests for Validation Utilities
 * 
 * Tests all validation functions in app/lib/validation/validators.ts
 */

import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength,
  validateURL,
  validateFields,
  ValidationResult,
} from '@/app/lib/validation/validators';
import { ErrorCode } from '@/app/lib/errors/error-handler';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'user123@example-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user@example',
        'user name@example.com',
        'user@example .com',
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.errorCode).toBe(ErrorCode.VALIDATION_INVALID_EMAIL);
      });
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
      expect(result.errorCode).toBe(ErrorCode.VALIDATION_REQUIRED);
    });

    it('should reject whitespace-only email', () => {
      const result = validateEmail('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('validatePassword', () => {
    it('should validate passwords with correct length', () => {
      const validPasswords = [
        '123456', // minimum
        'password123',
        'a'.repeat(128), // maximum
      ];

      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject passwords that are too short', () => {
      const shortPasswords = ['', '12345', 'abc'];

      shortPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('at least 6 characters');
        expect(result.errorCode).toBe(ErrorCode.VALIDATION_TOO_SHORT);
      });
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('less than 128 characters');
      expect(result.errorCode).toBe(ErrorCode.VALIDATION_TOO_LONG);
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
      expect(result.errorCode).toBe(ErrorCode.VALIDATION_REQUIRED);
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty strings', () => {
      const validValues = ['text', '123', 'a', '   trimmed   '];

      validValues.forEach((value) => {
        const result = validateRequired(value);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject empty strings', () => {
      const invalidValues = ['', '   ', null, undefined];

      invalidValues.forEach((value) => {
        const result = validateRequired(value as any);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('required');
        expect(result.errorCode).toBe(ErrorCode.VALIDATION_REQUIRED);
      });
    });

    it('should use custom field name in error message', () => {
      const result = validateRequired('', 'Email');
      expect(result.error).toContain('Email');
    });
  });

  describe('validateLength', () => {
    it('should validate strings within length range', () => {
      const result = validateLength('hello', 3, 10);
      expect(result.isValid).toBe(true);
    });

    it('should reject strings shorter than minimum', () => {
      const result = validateLength('hi', 3, 10, 'Username');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
      expect(result.error).toContain('Username');
      expect(result.errorCode).toBe(ErrorCode.VALIDATION_TOO_SHORT);
    });

    it('should reject strings longer than maximum', () => {
      const result = validateLength('a'.repeat(11), 3, 10, 'Description');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('less than 10 characters');
      expect(result.error).toContain('Description');
      expect(result.errorCode).toBe(ErrorCode.VALIDATION_TOO_LONG);
    });

    it('should validate with only minimum length', () => {
      const result = validateLength('hello', 3);
      expect(result.isValid).toBe(true);
    });

    it('should validate with only maximum length', () => {
      const result = validateLength('hello', undefined, 10);
      expect(result.isValid).toBe(true);
    });

    it('should accept strings at exact boundaries', () => {
      expect(validateLength('abc', 3, 3).isValid).toBe(true);
      expect(validateLength('ab', 3, 3).isValid).toBe(false);
      expect(validateLength('abcd', 3, 3).isValid).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('should validate correct HTTP/HTTPS URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://example.com',
        'https://example.com/path',
        'https://example.com:8080/path?query=value',
        'https://subdomain.example.com',
      ];

      validURLs.forEach((url) => {
        const result = validateURL(url);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidURLs = [
        'not-a-url',
        'example.com',
        'ftp://example.com',
        'file:///path/to/file',
        'javascript:alert(1)',
      ];

      invalidURLs.forEach((url) => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should reject non-HTTP/HTTPS protocols', () => {
      const result = validateURL('ftp://example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('HTTP or HTTPS');
      expect(result.errorCode).toBe(ErrorCode.VALIDATION_INVALID_FORMAT);
    });

    it('should reject empty URL', () => {
      const result = validateURL('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
      expect(result.errorCode).toBe(ErrorCode.VALIDATION_REQUIRED);
    });

    it('should reject malformed URLs', () => {
      const result = validateURL('http://');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid URL');
    });
  });

  describe('validateFields', () => {
    it('should return valid when all fields are valid', () => {
      const fields = {
        email: validateEmail('test@example.com'),
        password: validatePassword('password123'),
        url: validateURL('https://example.com'),
      };

      const result = validateFields(fields);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return invalid when any field is invalid', () => {
      const fields = {
        email: validateEmail('invalid-email'),
        password: validatePassword('password123'),
        url: validateURL('https://example.com'),
      };

      const result = validateFields(fields);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeUndefined();
      expect(result.errors.url).toBeUndefined();
    });

    it('should collect all field errors', () => {
      const fields = {
        email: validateEmail('invalid'),
        password: validatePassword('123'),
        url: validateURL('not-a-url'),
      };

      const result = validateFields(fields);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.url).toBeDefined();
    });
  });
});
