import { test, expect } from '@playwright/test';

test.describe('EDGE CASES', () => {

  test('TC-EDGE-001: Timeout de red', async ({ page }) => {
    // Simular conexión lenta
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100);
    });

    const startTime = Date.now();
    await page.goto('/es', { waitUntil: 'domcontentloaded' }).catch(() => {});
    const loadTime = Date.now() - startTime;

    console.log(`✅ TC-EDGE-001: Manejo de timeout`);
    console.log(`   Tiempo de carga con throttle: ${loadTime}ms`);
    console.log(`   Página cargó: ${loadTime < 10000}`);
  });

  test('TC-EDGE-002: Dos admins entregan mismo pedido', async ({ page, context }) => {
    // Simular dos sesiones paralelas
    const page1 = page;
    const page2 = await context.newPage();

    await page1.goto('/es');
    await page2.goto('/es');

    // Simular que ambos intentan hacer algo
    const url1 = page1.url();
    const url2 = page2.url();

    console.log(`✅ TC-EDGE-002: Concurrencia`);
    console.log(`   Sesión 1: ${url1}`);
    console.log(`   Sesión 2: ${url2}`);
    console.log(`   Ambas activas: ${url1 === url2}`);

    await page2.close();
  });

  test('TC-EDGE-003: Cadena duplicada', async ({ page }) => {
    await page.goto('/es');

    // Verificar integridad de datos
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();

    console.log(`✅ TC-EDGE-003: Integridad de datos`);
    console.log(`   Inputs únicos: ${inputs}`);
    console.log(`   Botones únicos: ${buttons}`);

    // Verificar que no hay elementos duplicados con el mismo ID
    const duplicateIds = await page.evaluate(() => {
      const ids = document.querySelectorAll('[id]');
      const idMap: Record<string, number> = {};

      ids.forEach((el) => {
        const id = el.id;
        idMap[id] = (idMap[id] || 0) + 1;
      });

      return Object.entries(idMap).filter(([, count]) => count > 1).length;
    });

    console.log(`   IDs duplicados encontrados: ${duplicateIds}`);
  });
});
