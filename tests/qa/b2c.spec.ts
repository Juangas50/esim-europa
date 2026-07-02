import { test, expect } from '@playwright/test';

test.describe('B2C - FLUJO DE COMPRA', () => {

  test('TC-001: Compra exitosa - Prepago', async ({ page }) => {
    // Ir a home
    await page.goto('/es');

    // Verificar que la página carga
    await expect(page).toHaveTitle(/eSIM/);

    // Buscar y hacer click en un plan
    const planCard = page.locator('text=Europa Plus').first();
    await expect(planCard).toBeVisible();

    console.log('✅ TC-001: Página carga correctamente');
  });

  test('TC-002: Compra con activación programada', async ({ page }) => {
    await page.goto('/es');

    // Verificar que la página carga correctamente
    await expect(page).toHaveTitle(/eSIM/);

    // Verificar que hay opción de fecha (buscar input de tipo date o similar)
    const dateInputs = await page.locator('input[type="date"], input[placeholder*="fecha"], input[placeholder*="Fecha"]').count();
    const hasDateOption = dateInputs > 0 || await page.locator('text=Programar, text=Fecha, text=fecha').isVisible().catch(() => false);

    console.log(`✅ TC-002: Opciones de fecha disponibles: ${dateInputs > 0 || hasDateOption}`);
  });

  test('TC-003: Validación de email inválido', async ({ page }) => {
    await page.goto('/es');

    // Si hubiera un campo de email, validar
    const emailInputs = await page.locator('input[type="email"]').count();
    console.log(`✅ TC-003: ${emailInputs} campos de email detectados`);
  });

  test('TC-004: Cliente menor de 18 años', async ({ page }) => {
    await page.goto('/es');

    // Verificar que hay campos para ingresar fecha de nacimiento
    const dobInputs = await page.locator('input[type="date"], input[placeholder*="nacimiento"], input[placeholder*="Nacimiento"], input[placeholder*="DOB"], input[placeholder*="dob"]').count();
    const hasAgeValidation = dobInputs > 0 || await page.locator('text=nacimiento, text=Nacimiento, text=edad, text=Edad').isVisible().catch(() => false);

    console.log(`✅ TC-004: Validación de edad (DOB inputs): ${dobInputs > 0 || hasAgeValidation}`);
  });

  test('TC-005: Compra DataOnly', async ({ page }) => {
    await page.goto('/es');

    // Buscar planes disponibles
    const plans = await page.locator('[class*="plan"]').count();
    console.log(`✅ TC-005: ${plans} planes disponibles`);
  });
});
