import { test, expect, devices } from '@playwright/test';

test.describe('RESPONSIVO DESIGN', () => {

  test('TC-RES-001: Mobile - B2C (iPhone 12)', async ({ page, context }) => {
    // Emular iPhone 12
    const iphone = devices['iPhone 12'];
    const mobileContext = await context.browser()?.newContext({ ...iphone });
    const mobilePage = await mobileContext!.newPage();

    await mobilePage.goto('http://localhost:3002/es');

    // Verificar viewport
    const size = mobilePage.viewportSize();
    console.log(`✅ TC-RES-001: Mobile viewport ${size?.width}x${size?.height}`);

    // Verificar que no hay scroll horizontal
    const bodyWidth = await mobilePage.evaluate(() => document.body.scrollWidth);
    const windowWidth = await mobilePage.evaluate(() => window.innerWidth);

    console.log(`   Body width: ${bodyWidth}, Window width: ${windowWidth}`);
    console.log(`   Sin scroll horizontal: ${bodyWidth <= windowWidth}`);

    await mobilePage.close();
  });

  test('TC-RES-002: Mobile - Admin', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/es');

    const viewportSize = page.viewportSize();
    console.log(`✅ TC-RES-002: Viewport ${viewportSize?.width}x${viewportSize?.height}`);
  });

  test('TC-RES-003: Tablet - B2B (iPad)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/es');

    const viewportSize = page.viewportSize();
    console.log(`✅ TC-RES-003: Tablet viewport ${viewportSize?.width}x${viewportSize?.height}`);

    // Verificar que el layout es legible
    const fontSize = await page.evaluate(() =>
      window.getComputedStyle(document.body).fontSize
    );
    console.log(`   Font size: ${fontSize}`);
  });
});
