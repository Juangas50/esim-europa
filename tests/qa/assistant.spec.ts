import { test, expect, type Page } from '@playwright/test'

/**
 * Asistente conversacional — Fase 1 (UX, motor local simulado).
 *
 * Estos tests cubren la *experiencia*: apertura, foco, teclado, guiones de
 * conversación y derivación a soporte. El motor todavía no es IA, así que las
 * respuestas son deterministas y se pueden afirmar literalmente.
 *
 * También actúan de guardarraíl: ninguna superficie del asistente puede
 * exponer naming del mayorista ni metadata de provisión.
 */

const LAUNCHER = '[data-testid="assistant-launcher"]'
const PANEL = '[data-testid="assistant-panel"]'
const INPUT = '[data-testid="assistant-input"]'
const SUGGESTIONS = '[data-testid="assistant-suggestions"]'
const CLOSE = '[data-testid="assistant-close"]'
const BACKDROP = '[data-testid="assistant-backdrop"]'
const ASSISTANT_MSG = '[data-testid="message-assistant"]'
const USER_MSG = '[data-testid="message-user"]'

/**
 * El banner de cookies comparte el borde inferior con el launcher. Darle una
 * decisión de partida deja la posición del botón en su estado por defecto y
 * quita una animación de en medio; la elevación se prueba aparte.
 */
async function acceptCookies(page: Page) {
  await page.context().addCookies([
    {
      name: 'ruta34_cookie_consent',
      value: 'accepted',
      url: 'http://localhost:3002',
    },
  ])
}

async function openAssistant(page: Page) {
  await page.goto('/es')
  await page.locator(LAUNCHER).click()
  await expect(page.locator(PANEL)).toBeVisible()
}

/** Envía un turno y espera la respuesta (el transporte simula ~700 ms). */
async function sendTurn(page: Page, text: string, expectedReplies: number) {
  await page.locator(INPUT).fill(text)
  await page.locator(INPUT).press('Enter')
  await expect(page.locator(ASSISTANT_MSG)).toHaveCount(expectedReplies, { timeout: 10_000 })
}

test.describe('AS — apertura, cierre y foco', () => {
  test.beforeEach(async ({ page }) => acceptCookies(page))

  test('AS-001 el launcher abre el panel y el botón de cerrar lo cierra', async ({ page }) => {
    await page.goto('/es')

    const launcher = page.locator(LAUNCHER)
    await expect(launcher).toBeVisible()
    await expect(page.locator(PANEL)).toHaveCount(0)

    await launcher.click()
    await expect(page.locator(PANEL)).toBeVisible()

    await page.locator(CLOSE).click()
    await expect(page.locator(PANEL)).toHaveCount(0)
  })

  test('AS-002 al abrir, el foco va al campo de escritura (no a un menú)', async ({ page }) => {
    await openAssistant(page)
    await expect(page.locator(INPUT)).toBeFocused()
  })

  test('AS-003 Escape cierra el panel', async ({ page }) => {
    await openAssistant(page)
    await page.keyboard.press('Escape')
    await expect(page.locator(PANEL)).toHaveCount(0)
  })

  test('AS-004 al cerrar, el foco vuelve al launcher', async ({ page }) => {
    await openAssistant(page)
    await page.keyboard.press('Escape')
    await expect(page.locator(PANEL)).toHaveCount(0)
    await expect(page.locator(LAUNCHER)).toBeFocused()
  })

  test('AS-005 en desktop el panel es un diálogo NO modal y no tapa la página', async ({ page }) => {
    await openAssistant(page)

    const panel = page.locator(PANEL)
    await expect(panel).toHaveAttribute('data-variant', 'desktop')
    await expect(panel).toHaveAttribute('role', 'dialog')
    // Sin aria-modal: la web sigue siendo utilizable con el panel abierto.
    await expect(panel).not.toHaveAttribute('aria-modal', 'true')
    await expect(page.locator(BACKDROP)).toHaveCount(0)

    // El scroll del documento sigue vivo — no hay bloqueo de body.
    const overflow = await page.evaluate(() => document.body.style.overflow)
    expect(overflow).not.toBe('hidden')
  })
})

test.describe('AS — teclado y estado inicial', () => {
  test.beforeEach(async ({ page }) => acceptCookies(page))

  test('AS-006 el estado inicial ofrece saludo y sugerencias como atajo', async ({ page }) => {
    await openAssistant(page)

    await expect(page.locator(PANEL)).toContainText('¿en qué te ayudo?')

    const chips = page.locator(`${SUGGESTIONS} button`)
    await expect(chips).toHaveCount(3)
    await expect(chips.nth(0)).toHaveText('Elegir un plan')

    // El campo de texto está disponible desde el principio: las sugerencias son
    // un atajo, nunca un menú obligatorio.
    await expect(page.locator(INPUT)).toBeEditable()
  })

  test('AS-007 las sugerencias desaparecen tras el primer turno', async ({ page }) => {
    await openAssistant(page)
    await page.locator(`${SUGGESTIONS} button`).first().click()
    await expect(page.locator(SUGGESTIONS)).toHaveCount(0)
    await expect(page.locator(ASSISTANT_MSG)).toHaveCount(1, { timeout: 10_000 })
  })

  test('AS-008 Enter envía el mensaje', async ({ page }) => {
    await openAssistant(page)
    await page.locator(INPUT).fill('Hola')
    await page.locator(INPUT).press('Enter')

    await expect(page.locator(USER_MSG)).toHaveText(['Hola'])
    // Y el campo queda limpio para el turno siguiente.
    await expect(page.locator(INPUT)).toHaveValue('')
  })

  test('AS-009 Shift+Enter inserta un salto de línea sin enviar', async ({ page }) => {
    await openAssistant(page)

    const input = page.locator(INPUT)
    await input.fill('primera')
    await input.press('Shift+Enter')
    await input.pressSequentially('segunda')

    await expect(input).toHaveValue('primera\nsegunda')
    await expect(page.locator(USER_MSG)).toHaveCount(0)
  })
})

test.describe('AS — guiones de conversación', () => {
  test.beforeEach(async ({ page }) => acceptCookies(page))

  test('AS-010 recomendación de plan: responde y ofrece ver planes', async ({ page }) => {
    await openAssistant(page)
    await sendTurn(page, 'Viajo a España e Italia 10 días', 1)

    const reply = page.locator(ASSISTANT_MSG).first()
    await expect(reply).toContainText('Italia')

    // La respuesta refleja la regla real de negocio: los GB de fuera de España
    // son un sub-límite DENTRO de la bolsa total, no una bolsa aparte.
    await expect(reply).toContainText('dentro de la bolsa total')

    const viewPlans = page.locator('[data-action="view_plans"]')
    await expect(viewPlans).toBeVisible()
    await expect(viewPlans).toHaveAttribute('href', '/es#planes')
  })

  test('AS-011 troubleshooting paso a paso y derivación a soporte', async ({ page }) => {
    await openAssistant(page)

    // Paso 1 — el asistente diagnostica antes de responder.
    await sendTurn(page, 'No me anda el internet', 1)
    await expect(page.locator(ASSISTANT_MSG).nth(0)).toContainText(
      '¿La eSIM ya aparece instalada'
    )

    // Paso 2 — la respuesta depende del turno anterior: hay hilo, no respuestas sueltas.
    await sendTurn(page, 'Sí, ya aparece', 2)
    await expect(page.locator(ASSISTANT_MSG).nth(1)).toContainText('Datos móviles')

    // Paso 3 — si el usuario sigue atascado, se deriva a una persona.
    await sendTurn(page, 'Sigue sin funcionar', 3)
    await expect(page.locator(ASSISTANT_MSG).nth(2)).toContainText('Te paso con soporte')
  })

  test('AS-012 la derivación abre WhatsApp con contexto precargado', async ({ page }) => {
    await openAssistant(page)
    await sendTurn(page, 'No me anda el internet', 1)
    await sendTurn(page, 'No lo puedo resolver', 2)

    const handoff = page.locator('[data-action="whatsapp_handoff"]')
    await expect(handoff).toBeVisible()
    await expect(handoff).toHaveAttribute('target', '_blank')
    await expect(handoff).toHaveAttribute('rel', /noopener/)

    const href = await handoff.getAttribute('href')
    expect(href).toContain('wa.me/')
    // No es un enlace pelado: lleva el contexto de la conversación.
    expect(href).toContain('text=')
    expect(decodeURIComponent(href ?? '')).toContain('asistente de la web')
  })

  test('AS-013 el asistente responde en portugués en /pt', async ({ page }) => {
    await page.goto('/pt')
    await page.locator(LAUNCHER).click()
    await expect(page.locator(PANEL)).toBeVisible()

    // Sin claves de traducción crudas ni copy en español colado en PT.
    const panelText = await page.locator(PANEL).innerText()
    expect(panelText).not.toContain('assistant.')
    expect(panelText).not.toContain('Contame')

    await sendTurn(page, 'Vou para a Espanha e Itália', 1)
    await expect(page.locator(ASSISTANT_MSG).first()).toContainText('Itália')
  })
})

test.describe('AS — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test.beforeEach(async ({ page }) => acceptCookies(page))

  test('AS-014 en mobile el panel es una hoja modal con backdrop', async ({ page }) => {
    await openAssistant(page)

    const panel = page.locator(PANEL)
    await expect(panel).toHaveAttribute('data-variant', 'mobile')
    // Aquí sí bloquea la página, así que aria-modal es correcto.
    await expect(panel).toHaveAttribute('aria-modal', 'true')
    await expect(page.locator(BACKDROP)).toBeVisible()

    // La hoja no desborda el viewport.
    const box = await panel.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(390)
  })

  test('AS-015 en mobile tocar el backdrop cierra el panel', async ({ page }) => {
    await openAssistant(page)
    await page.locator(BACKDROP).click({ position: { x: 20, y: 20 } })
    await expect(page.locator(PANEL)).toHaveCount(0)
  })

  test('AS-016 en mobile la conversación funciona igual', async ({ page }) => {
    await openAssistant(page)
    await sendTurn(page, 'Viajo a Europa', 1)
    await expect(page.locator(ASSISTANT_MSG).first()).toBeVisible()
  })
})

test.describe('AS — convivencia con el banner de cookies', () => {
  test('AS-017 sin decisión de cookies el launcher se eleva y sigue siendo clicable', async ({
    page,
  }) => {
    // Referencia: con el consentimiento ya resuelto no hay banner y el launcher
    // se queda en su posición baja.
    await acceptCookies(page)
    await page.goto('/es')
    const launcher = page.locator(LAUNCHER)
    await expect(launcher).toBeVisible()
    const lowered = await launcher.boundingBox()
    expect(lowered).not.toBeNull()

    // Sin decisión guardada, el banner ocupa el borde inferior y el launcher sube.
    await page.context().clearCookies()
    await page.reload()
    await expect(launcher).toBeVisible()

    // La elevación se resuelve tras la hidratación (la posición de partida es
    // la del servidor) y además tiene transición CSS, así que se espera a que
    // el valor se estabilice en vez de medir una sola vez.
    await expect
      .poll(async () => (await launcher.boundingBox())?.y ?? 0, { timeout: 5_000 })
      .toBeLessThan(lowered!.y)

    // Y sigue siendo clicable con el banner en pantalla — nada lo tapa.
    await launcher.click()
    await expect(page.locator(PANEL)).toBeVisible()
  })
})

test.describe('AS — guardarraíl de naming', () => {
  test.beforeEach(async ({ page }) => acceptCookies(page))

  test('AS-018 ninguna superficie del asistente expone naming de proveedor', async ({ page }) => {
    await openAssistant(page)

    // Recorre los tres guiones para que se rendericen todas las respuestas.
    await sendTurn(page, 'Viajo a España e Italia 10 días', 1)
    await sendTurn(page, 'Cómo instalo el QR', 2)
    await sendTurn(page, 'No me anda el internet', 3)
    await sendTurn(page, 'No lo puedo resolver', 4)

    const forbidden = [/vodafone/i, /vodafone_code/i, /provisioning_?code/i, /\bmovistar\b/i]

    const panelText = await page.locator(PANEL).innerText()
    for (const pattern of forbidden) {
      expect(panelText, `el panel no debe mencionar ${pattern}`).not.toMatch(pattern)
    }

    // El HTML completo incluye el payload RSC serializado: si un componente del
    // asistente recibiera metadata de provisión, se vería aquí aunque no se
    // pintara en pantalla.
    const html = await page.content()
    for (const pattern of forbidden) {
      expect(html, `el documento no debe contener ${pattern}`).not.toMatch(pattern)
    }
  })
})
