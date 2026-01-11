/**
 * Unit Tests for Tool Helper Utilities
 * 
 * Tests utility functions in app/lib/utils/tool-helpers.ts
 */

import {
  formatFileSize,
  formatNumber,
  formatCurrency,
  debounce,
  throttle,
  safeJsonParse,
  safeJsonStringify,
  copyToClipboard,
  downloadFile,
} from '@/app/lib/utils/tool-helpers';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('Tool Helper Utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should format fractional sizes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2560)).toBe('2.5 KB');
    });

    it('should handle very large sizes', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 5)).toBe('5 GB');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with default 2 decimals', () => {
      expect(formatNumber(1234.567)).toBe('1,234.57');
      expect(formatNumber(1000)).toBe('1,000.00');
    });

    it('should format numbers with custom decimals', () => {
      expect(formatNumber(1234.567, 0)).toBe('1,235');
      expect(formatNumber(1234.567, 4)).toBe('1,234.5670');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0.00');
      expect(formatNumber(0, 0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234.567)).toBe('-1,234.57');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default rupee symbol', () => {
      expect(formatCurrency(1234.56)).toBe('₹ 1,234.56');
      expect(formatCurrency(1000000)).toBe('₹ 1,000,000.00');
    });

    it('should format currency with custom symbol', () => {
      expect(formatCurrency(1234.56, '$')).toBe('$ 1,234.56');
      expect(formatCurrency(1234.56, '€')).toBe('€ 1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₹ 0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1234.56)).toBe('₹ -1,234.56');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should limit function execution frequency', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);

      throttledFn();
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1); // Still 1, throttled

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments correctly', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn('arg1');
      expect(fn).toHaveBeenCalledWith('arg1');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"key": "value"}';
      const result = safeJsonParse(json, {});
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const invalidJson = '{invalid json}';
      const fallback = { default: true };
      const result = safeJsonParse(invalidJson, fallback);
      expect(result).toBe(fallback);
    });

    it('should return fallback for empty string', () => {
      const result = safeJsonParse('', {});
      expect(result).toEqual({});
    });

    it('should parse arrays', () => {
      const json = '[1, 2, 3]';
      const result = safeJsonParse(json, []);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('safeJsonStringify', () => {
    it('should stringify valid objects', () => {
      const obj = { key: 'value', number: 123 };
      const result = safeJsonStringify(obj);
      expect(result).toBe('{"key":"value","number":123}');
    });

    it('should return fallback for circular references', () => {
      const circular: any = { key: 'value' };
      circular.self = circular;

      const result = safeJsonStringify(circular, '{}');
      expect(result).toBe('{}');
    });

    it('should return fallback for invalid values', () => {
      const invalid = { func: () => {} };
      const result = safeJsonStringify(invalid, '{}');
      expect(result).toBe('{}');
    });

    it('should use custom fallback', () => {
      const invalid = { func: () => {} };
      const result = safeJsonStringify(invalid, '{"error": true}');
      expect(result).toBe('{"error": true}');
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const text = 'test text';
      const result = await copyToClipboard(text);
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('should return false on clipboard error', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      const result = await copyToClipboard('test');
      expect(result).toBe(false);
    });
  });

  describe('downloadFile', () => {
    beforeEach(() => {
      // Mock URL.createObjectURL and revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement and appendChild
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create and trigger download', () => {
      downloadFile('content', 'test.txt', 'text/plain');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should use default MIME type', () => {
      downloadFile('content', 'test.txt');

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
