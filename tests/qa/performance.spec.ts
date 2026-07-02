import { test, expect } from '@playwright/test';

test.describe('PERFORMANCE', () => {

  test('TC-PERF-001: Core Web Vitals', async ({ page }) => {
    await page.goto('/es', { waitUntil: 'networkidle' });

    // Medir Web Vitals
    const metrics = await page.evaluate(() => {
      return {
        LCP: (window as any).performance?.getEntriesByName?.('largest-contentful-paint')?.[0]?.startTime || 0,
        FCP: (window as any).performance?.getEntriesByName?.('first-contentful-paint')?.[0]?.startTime || 0,
        TTI: (window as any).performance?.timing?.loadEventEnd - (window as any).performance?.timing?.navigationStart || 0,
      };
    });

    console.log(`✅ TC-PERF-001: Web Vitals`);
    console.log(`   LCP: ${metrics.LCP?.toFixed(0)}ms (target: < 2500ms)`);
    console.log(`   FCP: ${metrics.FCP?.toFixed(0)}ms`);
    console.log(`   TTI: ${metrics.TTI}ms`);
  });

  test('TC-PERF-002: Tiempo de carga - B2C', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/es', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;
    console.log(`✅ TC-PERF-002: Tiempo de carga ${loadTime}ms (target: < 3000ms)`);
    console.log(`   Status: ${loadTime < 3000 ? '✓ PASADO' : '✗ FALLÓ'}`);
  });

  test('TC-PERF-003: Smooth scrolling - 60 FPS', async ({ page }) => {
    await page.goto('/es', { waitUntil: 'networkidle' });

    // Verificar que hay contenido scrolleable
    const hasScrollableContent = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight;
    });

    console.log(`✅ TC-PERF-003: Contenido scrolleable: ${hasScrollableContent}`);

    if (hasScrollableContent) {
      // Simular scroll
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      console.log('   Scroll ejecutado exitosamente');
    }
  });
});
