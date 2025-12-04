import { test, expect } from '@playwright/test';

test.describe('OneTool Hero Apps', () => {

  // 1. HOMEPAGE
  test('Homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/OneTool/);
    // Check for "Good Morning" or similar greeting text
    await expect(page.locator('text=Good')).toBeVisible(); 
  });

  // 2. SEARCH
  test('Search redirects correctly', async ({ page }) => {
    await page.goto('/');
    // Use getByPlaceholder which is more robust
    const searchInput = page.getByPlaceholder(/Search tools/i);
    await searchInput.click();
    await searchInput.fill('salary');
    await expect(page).toHaveURL(/\?q=salary/);
  });

  // 3. BUDGET
  test('Smart Budget loads', async ({ page }) => {
    await page.goto('/tools/finance/smart-budget');
    // Check for the Recharts container or main header
    // Using .first() on the locator BEFORE passing to expect
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible(); 
  });

  // 4. SCAN
  test('Smart Scan loads', async ({ page }) => {
    await page.goto('/tools/documents/smart-scan');
    // Fix: Move .first() inside the expect call
    await expect(page.locator('text=Upload').first()).toBeVisible();
  });

  // 5. JSON EDITOR
  test('JSON Editor loads', async ({ page }) => {
    await page.goto('/tools/developer/smart-json');
    // Look for the "Format" or "Prettify" button
    await expect(page.locator('button', { hasText: 'Format' })).toBeVisible();
  });

  // 6. CONVERTER
  test('Converter loads', async ({ page }) => {
    await page.goto('/tools/documents/universal-converter');
    // Look for "1. Category" label
    await expect(page.locator('text=1. Category')).toBeVisible();
  });

});
