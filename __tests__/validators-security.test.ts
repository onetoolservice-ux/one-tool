/**
 * Validator Security Tests
 * 
 * Tests for input validation and sanitization
 */

import { validateEmail, validatePassword, validateURL, validateLength } from '@/app/lib/validation/validators';

describe('Validator Security Tests', () => {
  describe('validateEmail', () => {
    it('should reject XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>@test.com',
        'test@test.com<script>',
        'test@test.com"><img src=x onerror=alert(1)>',
      ];

      xssAttempts.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    it('should reject SQL injection attempts', () => {
      const sqlAttempts = [
        "test' OR '1'='1'@test.com",
        "test'; DROP TABLE users; --@test.com",
      ];

      sqlAttempts.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should enforce minimum length', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 6');
    });

    it('should enforce maximum length', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('less than 128');
    });
  });

  describe('validateURL', () => {
    it('should reject javascript: URLs', () => {
      const result = validateURL('javascript:alert("xss")');
      expect(result.isValid).toBe(false);
    });

    it('should reject data: URLs', () => {
      const result = validateURL('data:text/html,<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
    });

    it('should only allow HTTP and HTTPS', () => {
      const result = validateURL('ftp://example.com');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('should enforce maximum length to prevent DoS', () => {
      const longString = 'a'.repeat(10001);
      const result = validateLength(longString, 1, 1000);
      expect(result.isValid).toBe(false);
    });
  });
});
