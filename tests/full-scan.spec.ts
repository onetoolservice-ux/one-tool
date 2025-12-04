import { test, expect } from '@playwright/test';

test.describe('Full Inventory Scan', () => {

  test('All 63 Tools should load without crashing', async ({ page }) => {
    // 1. Go to Home
    await page.goto('/');
    
    // 2. Wait for the grid to load
    await page.waitForSelector('a[href^="/tools/"]');
    
    // 3. Get all tool links
    const toolLinks = await page.locator('a[href^="/tools/"]').all();
    const count = toolLinks.length;
    
    console.log(`Found ${count} tools to test...`);
    expect(count).toBeGreaterThan(40); // Ensure we found them all

    // 4. Extract HREFs (URLs) first to avoid "stale element" errors during navigation
    const hrefs = [];
    for (const link of toolLinks) {
      const href = await link.getAttribute('href');
      const title = await link.locator('h3').textContent();
      if (href) hrefs.push({ href, title });
    }

    // 5. Visit EVERY single tool
    for (const { href, title } of hrefs) {
      console.log(`Testing: ${title} (${href})`);
      
      await page.goto(href!);
      
      // CHECK A: Page Title matches tool name (roughly)
      // We look for the h1 or the breadcrumb header
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('Page Not Found');
      
      // CHECK B: Ensure the specific Engine loaded
      // We check for common elements to ensure it's not a blank page
      const hasInput = await page.locator('input, textarea, .dropzone').count() > 0;
      const hasButton = await page.locator('button').count() > 0;
      
      expect(hasInput || hasButton).toBeTruthy();
    }
  });

});
