import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 568, name: '320px (Small Mobile)' },
  { width: 375, height: 667, name: '375px (Standard Mobile)' },
  { width: 768, height: 1024, name: '768px (Tablet)' },
  { width: 1280, height: 800, name: '1280px (Desktop)' },
];

const PAGES_TO_AUDIT = [
  { path: '/', name: 'Landing Page' },
  { path: '/trades', name: 'Trade Explorer' },
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/login', name: 'Login Page' },
  { path: '/counsellor', name: 'Counsellor Console' },
];

test.describe('Responsive Horizontal-Overflow Audit', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      for (const pageInfo of PAGES_TO_AUDIT) {
        test(`has zero horizontal overflow on ${pageInfo.name} at ${vp.width}px width`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });

          // Wait briefly for CSS and layout calculations to stabilize
          await page.waitForTimeout(300);

          // Evaluate root scroll dimensions vs client dimensions
          const dimensions = await page.evaluate(() => {
            const doc = document.documentElement;
            const body = document.body;
            return {
              docScrollWidth: doc.scrollWidth,
              docClientWidth: doc.clientWidth,
              bodyScrollWidth: body ? body.scrollWidth : 0,
              windowInnerWidth: window.innerWidth,
            };
          });

          // Allow at most 1px tolerance for sub-pixel CSS rendering
          expect(
            dimensions.docScrollWidth,
            `Horizontal overflow detected on ${pageInfo.name} at ${vp.width}px. docScrollWidth: ${dimensions.docScrollWidth}, docClientWidth: ${dimensions.docClientWidth}`,
          ).toBeLessThanOrEqual(dimensions.docClientWidth + 1);
        });
      }
    });
  }
});
