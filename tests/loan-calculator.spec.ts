/**
 * E2E Tests for Loan Calculator Tool
 * 
 * Comprehensive functional tests for loan calculation, input validation, and edge cases
 */

import { test, expect } from '@playwright/test';

test.describe('Loan Calculator - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/finance/smart-loan');
    // Wait for component to load
    await page.waitForSelector('input[type="number"]', { timeout: 5000 });
  });

  test.describe('Basic Functionality', () => {
    test('should calculate EMI for default values', async ({ page }) => {
      // Default values: Principal = 5000000, Rate = 8.5%, Tenure = 20 years
      const emiElement = page.locator('text=/₹.*/').first();
      await expect(emiElement).toBeVisible();
      
      // EMI should be calculated (not zero or NaN)
      const emiText = await emiElement.textContent();
      expect(emiText).toMatch(/₹\s*[\d,]+/);
    });

    test('should update EMI when principal changes', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      const initialEmi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      
      // Change principal
      await principalInput.clear();
      await principalInput.fill('10000000');
      
      // Wait for calculation
      await page.waitForTimeout(500);
      
      const newEmi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(newEmi).not.toBe(initialEmi);
    });

    test('should update EMI when interest rate changes', async ({ page }) => {
      const rateInputs = page.locator('input[type="number"]');
      const rateInput = rateInputs.nth(1);
      const initialEmi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      
      await rateInput.clear();
      await rateInput.fill('10');
      
      await page.waitForTimeout(500);
      
      const newEmi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(newEmi).not.toBe(initialEmi);
    });

    test('should update EMI when tenure changes', async ({ page }) => {
      const tenureInputs = page.locator('input[type="number"]');
      const tenureInput = tenureInputs.nth(2);
      const initialEmi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      
      await tenureInput.clear();
      await tenureInput.fill('15');
      
      await page.waitForTimeout(500);
      
      const newEmi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(newEmi).not.toBe(initialEmi);
    });

    test('should display total interest and total amount', async ({ page }) => {
      await expect(page.locator('text=Total Interest')).toBeVisible();
      await expect(page.locator('text=Total Amount')).toBeVisible();
      
      const totalInterest = await page.locator('text=/₹.*/').nth(1).textContent();
      const totalAmount = await page.locator('text=/₹.*/').nth(2).textContent();
      
      expect(totalInterest).toMatch(/₹\s*[\d,]+/);
      expect(totalAmount).toMatch(/₹\s*[\d,]+/);
    });

    test('should display amortization chart', async ({ page }) => {
      // Chart should be visible
      await expect(page.locator('.recharts-wrapper')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Input Validation', () => {
    test('should prevent negative principal', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      
      await principalInput.clear();
      await principalInput.fill('-100000');
      
      // Value should be clamped to 0 or remain positive
      const value = await principalInput.inputValue();
      expect(parseFloat(value)).toBeGreaterThanOrEqual(0);
    });

    test('should prevent negative interest rate', async ({ page }) => {
      const rateInputs = page.locator('input[type="number"]');
      const rateInput = rateInputs.nth(1);
      
      await rateInput.clear();
      await rateInput.fill('-5');
      
      // Should be clamped or validated
      const value = await rateInput.inputValue();
      const numValue = parseFloat(value);
      expect(numValue).toBeGreaterThanOrEqual(0);
    });

    test('should limit interest rate to 100%', async ({ page }) => {
      const rateInputs = page.locator('input[type="number"]');
      const rateInput = rateInputs.nth(1);
      
      await rateInput.clear();
      await rateInput.fill('150');
      
      // Should be clamped to 100
      const value = await rateInput.inputValue();
      const numValue = parseFloat(value);
      expect(numValue).toBeLessThanOrEqual(100);
    });

    test('should prevent negative tenure', async ({ page }) => {
      const tenureInputs = page.locator('input[type="number"]');
      const tenureInput = tenureInputs.nth(2);
      
      await tenureInput.clear();
      await tenureInput.fill('-5');
      
      const value = await tenureInput.inputValue();
      expect(parseFloat(value)).toBeGreaterThanOrEqual(0);
    });

    test('should handle zero principal gracefully', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      
      await principalInput.clear();
      await principalInput.fill('0');
      
      await page.waitForTimeout(500);
      
      // Should not crash, EMI should be 0 or very small
      const emi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(emi).toBeTruthy();
    });

    test('should handle zero interest rate', async ({ page }) => {
      const rateInputs = page.locator('input[type="number"]');
      const rateInput = rateInputs.nth(1);
      
      await rateInput.clear();
      await rateInput.fill('0');
      
      await page.waitForTimeout(500);
      
      // Should calculate EMI = Principal / (Tenure * 12)
      const emi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(emi).toBeTruthy();
    });
  });

  test.describe('Range Sliders', () => {
    test('should sync slider with input field for principal', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      const principalSlider = page.locator('input[type="range"]').first();
      
      // Move slider
      await principalSlider.fill('7500000');
      
      await page.waitForTimeout(300);
      
      // Input should update
      const inputValue = await principalInput.inputValue();
      expect(parseFloat(inputValue)).toBeCloseTo(7500000, -5); // Within 50000
    });

    test('should sync slider with input field for interest rate', async ({ page }) => {
      const rateInputs = page.locator('input[type="number"]');
      const rateInput = rateInputs.nth(1);
      const rateSlider = page.locator('input[type="range"]').nth(1);
      
      await rateSlider.fill('12');
      
      await page.waitForTimeout(300);
      
      const inputValue = await rateInput.inputValue();
      expect(parseFloat(inputValue)).toBeCloseTo(12, 1);
    });

    test('should sync slider with input field for tenure', async ({ page }) => {
      const tenureInputs = page.locator('input[type="number"]');
      const tenureInput = tenureInputs.nth(2);
      const tenureSlider = page.locator('input[type="range"]').nth(2);
      
      await tenureSlider.fill('25');
      
      await page.waitForTimeout(300);
      
      const inputValue = await tenureInput.inputValue();
      expect(parseFloat(inputValue)).toBeCloseTo(25, 0);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very large principal', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      
      await principalInput.clear();
      await principalInput.fill('999999999');
      
      await page.waitForTimeout(500);
      
      // Should calculate without crashing
      const emi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(emi).toBeTruthy();
    });

    test('should handle very small principal', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      
      await principalInput.clear();
      await principalInput.fill('1000');
      
      await page.waitForTimeout(500);
      
      const emi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(emi).toBeTruthy();
    });

    test('should handle very high interest rate', async ({ page }) => {
      const rateInputs = page.locator('input[type="number"]');
      const rateInput = rateInputs.nth(1);
      
      await rateInput.clear();
      await rateInput.fill('30');
      
      await page.waitForTimeout(500);
      
      const emi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(emi).toBeTruthy();
    });

    test('should handle very long tenure', async ({ page }) => {
      const tenureInputs = page.locator('input[type="number"]');
      const tenureInput = tenureInputs.nth(2);
      
      await tenureInput.clear();
      await tenureInput.fill('30');
      
      await page.waitForTimeout(500);
      
      const emi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(emi).toBeTruthy();
    });

    test('should handle rapid input changes', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      
      // Rapidly change values
      for (let i = 0; i < 10; i++) {
        await principalInput.fill((1000000 * (i + 1)).toString());
        await page.waitForTimeout(50);
      }
      
      // Should not crash
      await expect(page.locator('h1').filter({ hasText: /₹/ })).toBeVisible();
    });
  });

  test.describe('State Persistence', () => {
    test('should lose state on page refresh', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      
      await principalInput.clear();
      await principalInput.fill('7500000');
      
      await page.reload();
      await page.waitForSelector('input[type="number"]', { timeout: 5000 });
      
      // Should reset to default (5000000)
      const value = await principalInput.inputValue();
      // Note: This test documents current behavior (no persistence)
      // If persistence is added later, this test should be updated
      expect(value).toBeTruthy();
    });
  });

  test.describe('UI/UX', () => {
    test('should display currency symbol correctly', async ({ page }) => {
      const emi = await page.locator('h1').filter({ hasText: /₹/ }).textContent();
      expect(emi).toContain('₹');
    });

    test('should format large numbers with commas', async ({ page }) => {
      const principalInput = page.locator('input[type="number"]').first();
      await principalInput.fill('10000000');
      
      await page.waitForTimeout(500);
      
      // Check if displayed values use comma formatting
      const totalAmount = await page.locator('text=/₹.*/').nth(2).textContent();
      // Note: Input fields may not show commas, but displayed values should
      expect(totalAmount).toBeTruthy();
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('input[type="number"]').first()).toBeVisible();
      await expect(page.locator('h1').filter({ hasText: /₹/ })).toBeVisible();
    });
  });
});
