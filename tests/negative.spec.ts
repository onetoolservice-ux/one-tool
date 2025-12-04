import { test, expect } from '@playwright/test';

test.describe('Negative Scenarios (Chaos Testing)', () => {

  // 1. THE 404 CHECK
  test('Visiting a fake URL shows the proper Error Page', async ({ page }) => {
    await page.goto('/tools/finance/this-tool-does-not-exist');
    
    // Check for our custom 404 component text
    await expect(page.locator('text=Page not found')).toBeVisible();
    
    // Ensure the "Back to Dashboard" button exists
    await expect(page.locator('a', { hasText: 'Back' })).toBeVisible();
  });

  // 2. THE BAD FILE CHECK
  test('Smart Scan rejects invalid file types (Text file)', async ({ page }) => {
    await page.goto('/tools/documents/smart-scan');

    // Create a fake text file in memory
    const buffer = Buffer.from('This is a text file, not an image.');
    
    // Try to force-upload it to the image acceptor
    await page.locator('input[type="file"]').setInputFiles({
      name: 'virus.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    // WAIT: Give it a second to potentially crash or process
    await page.waitForTimeout(1000);

    // CHECK: The "Page 1" preview should NOT appear.
    // If it appears, the app blindly accepted a text file as an image.
    await expect(page.locator('text=Page 1')).not.toBeVisible();
    
    // CHECK: App should still be alive.
    // FIX: Look specifically for the H2 Heading to avoid ambiguity
    await expect(page.locator('h2', { hasText: 'Smart Scan' })).toBeVisible();
  });

  // 3. THE EMPTY INPUT CHECK
  test('Salary Slip handles empty input gracefully', async ({ page }) => {
    await page.goto('/tools/business/salary-slip');
    
    // Find the CTC input
    const input = page.locator('input[placeholder*="Annual CTC"]');
    
    // Clear it completely
    await input.clear();
    
    // The "Net Pay" should typically show 0 or NaN, but NOT crash the page
    // We check if the "Net Salary Payable" section is still visible
    await expect(page.locator('text=Net Salary Payable')).toBeVisible();
    
    // Ensure no Red Screen of Death (Next.js Error overlay)
    await expect(page.locator('text=Runtime Error')).not.toBeVisible();
  });

});
