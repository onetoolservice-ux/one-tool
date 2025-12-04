import { test, expect } from '@playwright/test';

const TOOLS_TO_TEST = [
  '/tools/business/invoice-generator',
  '/tools/documents/smart-pdf-merge',
  '/tools/finance/smart-budget',
  '/tools/developer/smart-json',
  '/tools/productivity/life-os',
  '/tools/converters/unit-converter'
];

test.describe('Layout Integrity Check', () => {

  for (const url of TOOLS_TO_TEST) {
    test(`Page ${url} has correct layout structure`, async ({ page }) => {
      await page.goto(url);
      
      // 1. Check Navbar (Logo Existence)
      await expect(page.locator('header a[href="/"]')).toBeVisible();

      // 2. Check Footer (Copyright)
      await expect(page.locator('footer')).toContainText('OneTool');

      // 3. Check Main Tool Container (should act as a ToolShell)
      // We look for the "Back" button which is part of the ToolShell
      await expect(page.locator('a[href^="/?cat="]')).toBeVisible();
    });
  }

});
