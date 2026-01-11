/**
 * Safe Storage Tests
 */

import { safeLocalStorage, safeSessionStorage } from '@/app/lib/utils/storage';

describe('Safe Storage', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('safeLocalStorage', () => {
    it('should store and retrieve values', () => {
      const testData = { key: 'value', number: 123 };
      safeLocalStorage.setItem('test', testData);
      const retrieved = safeLocalStorage.getItem('test');
      expect(retrieved).toEqual(testData);
    });

    it('should return default value when key does not exist', () => {
      const result = safeLocalStorage.getItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should handle quota exceeded gracefully', () => {
      // Try to store a very large object
      const largeData = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const result = safeLocalStorage.setItem('large', largeData);
      expect(result).toBe(false);
    });

    it('should remove items', () => {
      safeLocalStorage.setItem('test', 'value');
      expect(safeLocalStorage.removeItem('test')).toBe(true);
      expect(safeLocalStorage.getItem('test')).toBeNull();
    });

    it('should get storage usage', () => {
      safeLocalStorage.setItem('test', 'value');
      const usage = safeLocalStorage.getUsage();
      expect(usage.used).toBeGreaterThan(0);
      expect(usage.percentage).toBeGreaterThanOrEqual(0);
      expect(usage.percentage).toBeLessThanOrEqual(100);
    });
  });
});
