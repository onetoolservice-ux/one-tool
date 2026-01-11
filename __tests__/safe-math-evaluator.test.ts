/**
 * Tests for Safe Math Evaluator
 */

import { safeEvaluate } from '@/app/lib/utils/safe-math-evaluator';

describe('safeEvaluate', () => {
  describe('Basic arithmetic', () => {
    it('should evaluate simple addition', () => {
      expect(safeEvaluate('2 + 3')).toBe(5);
    });

    it('should evaluate simple subtraction', () => {
      expect(safeEvaluate('10 - 4')).toBe(6);
    });

    it('should evaluate simple multiplication', () => {
      expect(safeEvaluate('3 * 4')).toBe(12);
    });

    it('should evaluate simple division', () => {
      expect(safeEvaluate('12 / 3')).toBe(4);
    });

    it('should handle decimal numbers', () => {
      expect(safeEvaluate('2.5 + 3.7')).toBeCloseTo(6.2);
    });
  });

  describe('Order of operations', () => {
    it('should respect multiplication precedence', () => {
      expect(safeEvaluate('2 + 3 * 4')).toBe(14);
    });

    it('should respect division precedence', () => {
      expect(safeEvaluate('10 - 8 / 2')).toBe(6);
    });

    it('should handle parentheses', () => {
      expect(safeEvaluate('(2 + 3) * 4')).toBe(20);
    });

    it('should handle nested parentheses', () => {
      expect(safeEvaluate('((2 + 3) * 4) / 2')).toBe(10);
    });
  });

  describe('Edge cases', () => {
    it('should handle division by zero', () => {
      expect(() => safeEvaluate('5 / 0')).toThrow('Division by zero');
    });

    it('should handle negative numbers', () => {
      expect(safeEvaluate('5 - 10')).toBe(-5);
    });

    it('should handle unary minus', () => {
      expect(safeEvaluate('-5 + 3')).toBe(-2);
    });

    it('should handle zero', () => {
      expect(safeEvaluate('0 + 0')).toBe(0);
    });
  });

  describe('Input validation', () => {
    it('should reject invalid characters', () => {
      expect(() => safeEvaluate('2 + alert("xss")')).toThrow('Invalid characters');
    });

    it('should reject empty expression', () => {
      expect(() => safeEvaluate('')).toThrow('Empty expression');
    });

    it('should reject whitespace-only expression', () => {
      expect(() => safeEvaluate('   ')).toThrow('Empty expression');
    });

    it('should reject unbalanced parentheses', () => {
      expect(() => safeEvaluate('(2 + 3')).toThrow('Unbalanced parentheses');
    });

    it('should reject extra closing parentheses', () => {
      expect(() => safeEvaluate('2 + 3)')).toThrow('Unbalanced parentheses');
    });

    it('should reject expressions with letters', () => {
      expect(() => safeEvaluate('2 + abc')).toThrow('Invalid characters');
    });

    it('should reject expressions with special characters', () => {
      expect(() => safeEvaluate('2 + 3; alert(1)')).toThrow('Invalid characters');
    });
  });

  describe('Complex expressions', () => {
    it('should evaluate complex expression', () => {
      expect(safeEvaluate('(10 + 5) * 2 - 8 / 4')).toBe(28);
    });

    it('should evaluate expression with multiple operations', () => {
      expect(safeEvaluate('2 * 3 + 4 * 5')).toBe(26);
    });

    it('should handle multiple levels of nesting', () => {
      expect(safeEvaluate('((1 + 2) * 3) + (4 * 5)')).toBe(29);
    });
  });

  describe('Whitespace handling', () => {
    it('should handle spaces in expression', () => {
      expect(safeEvaluate('2 + 3')).toBe(5);
    });

    it('should handle no spaces', () => {
      expect(safeEvaluate('2+3')).toBe(5);
    });

    it('should handle extra spaces', () => {
      expect(safeEvaluate('  2  +  3  ')).toBe(5);
    });
  });
});
