import { test, expect, Page, Route } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * META PIXEL + CONVERSIONS API — Suite de regresión
 * ─────────────────────────────────────────────────────────────────────────
 * Cubre: gating de consentimiento (incluido el reintento diferido de
 * ViewContent — ver lib/meta/pixel.ts), carga del Pixel, PageView en
 * navegación SPA, AddToCart/InitiateCheckout, Purchase en carga fresca de
 * /confirmacion (bug de carrera corregido), y deduplicación por event_id.
 *
 * IMPORTANTE — no se genera tráfico real hacia Meta ni compras reales:
 *   - fbevents.js se reemplaza por un stub local que nunca sale de la
 *     máquina de test.
 *   - Todo beacon a facebook.com/tr se intercepta y se responde con un 200
 *     falso — nunca llega a los servidores reales de Meta.
 *   - Además de los dos mocks anteriores, HAY UNA RED DE SEGURIDAD: cualquier
 *     request a *.facebook.com o *.facebook.net que NO sea una de las dos
 *     rutas explícitamente simuladas se considera una fuga real y hace
 *     fallar el test inmediatamente (ver mockMetaNetwork/leakedRequests).
 *   - El único tramo que Playwright NO puede interceptar es la llamada
 *     servidor-a-servidor que hace /api/meta/capi hacia graph.facebook.com
 *     (corre en el proceso de `next dev`, no en el navegador). Por eso
 *     assertNoRealMetaServerCredentials() lee .env.local/.env.development
 *     directamente y aborta toda la suite si META_ACCESS_TOKEN/
 *     META_DATASET_ID tuvieran un valor real — sin esas credenciales,
 *     sendMetaCapiEvent() (ver lib/meta/capi.ts) hace no-op por diseño.
 *   - La página /confirmacion se visita directamente con query params falsos
 *     — solo dispara un SELECT de lectura contra Supabase para un order_ref
 *     inexistente, sin crear ni modificar ningún pedido real.
 *   - Nunca se llama a /api/checkout ni al webhook de Stripe.
 */

const META_PIXEL_ID = '1696937848015682'; // debe coincidir con NEXT_PUBLIC_META_PIXEL_ID en .env.development
const TEST_PLAN_ID = '2bf430af-8a08-4425-a188-7bf8df18cfd8'; // "Europa Básico" — ver src/lib/plans.ts

interface CapturedFbEvent {
  id: string;
  ev: string;
  eid: string;
  cd: Record<string, unknown>;
}

interface CapturedCapiRequest {
  event_name: string;
  event_id: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────
// Guardia de credenciales — el único tramo que page.route() no puede cubrir
// ─────────────────────────────────────────────────────────────────────────
/**
 * /api/meta/capi corre server-side dentro de `next dev` y, si tuviera
 * credenciales reales, haría un fetch server-to-server a graph.facebook.com
 * que Playwright JAMÁS puede interceptar (no pasa por el navegador). La
 * única forma honesta de blindar esto es verificar, antes de correr nada,
 * que los archivos de entorno que `next dev` realmente carga no tengan
 * credenciales reales configuradas — sin ellas, sendMetaCapiEvent() en
 * lib/meta/capi.ts hace no-op (ver el chequeo `if (!datasetId || !accessToken)`).
 */
function assertNoRealMetaServerCredentials(): void {
  const projectRoot = resolve(__dirname, '..', '..');
  const envFiles = ['.env.local', '.env.development'];

  for (const file of envFiles) {
    const fullPath = resolve(projectRoot, file);
    if (!existsSync(fullPath)) continue;

    const content = readFileSync(fullPath, 'utf-8');
    const accessToken = content.match(/^META_ACCESS_TOKEN=(.*)$/m)?.[1]?.trim() ?? '';
    const datasetId = content.match(/^META_DATASET_ID=(.*)$/m)?.[1]?.trim() ?? '';

    if (accessToken || datasetId) {
      throw new Error(
        `[meta-network-guard] ${file} tiene META_ACCESS_TOKEN/META_DATASET_ID configurados. ` +
          'Esta suite NO debe correr con credenciales reales de Meta: /api/meta/capi haría una ' +
          'llamada real server-to-server a graph.facebook.com que Playwright no puede interceptar ' +
          '(ocurre en el proceso de next dev, no en el navegador). Vaciá esas variables antes de ' +
          'correr los tests.'
      );
    }
  }
}

test.beforeAll(() => {
  assertNoRealMetaServerCredentials();
});

// ─────────────────────────────────────────────────────────────────────────
// Red de seguridad de red — ningún test debe contactar Meta de verdad
// ─────────────────────────────────────────────────────────────────────────
/** Compartido entre beforeEach/afterEach y mockMetaNetwork (por test, se resetea solo). */
let leakedRequests: string[] = [];

test.beforeEach(() => {
  leakedRequests = [];
});

test.afterEach(() => {
  expect(leakedRequests, `Tráfico real hacia Meta detectado y abortado: ${leakedRequests.join(', ')}`).toEqual([]);
});

/**
 * Stub de fbevents.js — replica solo el contrato que nos importa:
 *   - define window.fbq.callMethod (así el stub deja de encolar llamadas)
 *   - drena window.fbq.queue (igual que la librería real de Meta)
 * y traduce cada llamada 'track' en un beacon de imagen a facebook.com/tr,
 * igual que el Pixel real, para que Playwright lo intercepte como una
 * request de red genuina.
 */
function fakeFbEventsScript(): string {
  return `
(function () {
  if (!window.fbq) return;
  window.__fbqPixelId = window.__fbqPixelId || null;
  // Retenemos cada Image() en un array global — si no, el objeto queda sin
  // referencias vivas y el motor puede recolectarlo como basura antes de que
  // el navegador llegue a emitir la request (perdiendo el beacon en el test).
  window.__fbqBeacons = window.__fbqBeacons || [];
  window.fbq.callMethod = function () {
    var args = Array.prototype.slice.call(arguments);
    if (args[0] === 'init') { window.__fbqPixelId = args[1]; return; }
    if (args[0] !== 'track') return;
    var eventName = args[1];
    var customData = args[2] || {};
    var eventId = (args[3] && args[3].eventID) || '';
    var params = new URLSearchParams();
    params.set('id', window.__fbqPixelId || '');
    params.set('ev', eventName);
    if (eventId) params.set('eid', eventId);
    params.set('cd', JSON.stringify(customData));
    var img = new Image();
    window.__fbqBeacons.push(img);
    img.src = 'https://www.facebook.com/tr?' + params.toString();
  };
  if (window.fbq.queue && window.fbq.queue.length) {
    var pending = window.fbq.queue.splice(0, window.fbq.queue.length);
    pending.forEach(function (a) { window.fbq.callMethod.apply(null, a); });
  }
})();
`;
}

/**
 * Intercepta toda la red relacionada con Meta para un `page` dado.
 * `fbEventsJsDelayMs` simula una carga lenta de fbevents.js — se usa para
 * reproducir a propósito la ventana de carrera que originalmente perdía el
 * evento Purchase (ver MP-007).
 *
 * Se registran PRIMERO los patrones amplios "cualquier facebook.com/net" como
 * red de seguridad (fallan fuerte), y DESPUÉS los específicos que sí
 * esperamos — Playwright prioriza el handler registrado más recientemente,
 * así que los específicos "ganan" para sus rutas exactas y todo lo demás cae
 * en la red de seguridad.
 */
async function mockMetaNetwork(page: Page, opts: { fbEventsJsDelayMs?: number } = {}) {
  const fbEvents: CapturedFbEvent[] = [];
  const capiRequests: CapturedCapiRequest[] = [];
  let fbEventsJsRequested = false;
  let trRequested = false;

  const failOnRealMetaTraffic = async (route: Route) => {
    const url = route.request().url();
    leakedRequests.push(url);
    await route.abort('failed');
  };

  // Red de seguridad — cualquier dominio de Meta no cubierto explícitamente
  // abajo termina acá y se aborta + registra como fuga real.
  await page.route('**facebook.com/**', failOnRealMetaTraffic);
  await page.route('**facebook.net/**', failOnRealMetaTraffic);

  // Sin barra fija antes del dominio — la URL real es "https://connect.facebook.net/..."
  // pero un patrón "**/connect.facebook.net/..." puede fallar para subdominios
  // con un punto antes (ej. "www.facebook.com/tr"), donde no hay "/" justo
  // antes del dominio.
  await page.route('**connect.facebook.net/en_US/fbevents.js', async (route: Route) => {
    fbEventsJsRequested = true;
    if (opts.fbEventsJsDelayMs) {
      await new Promise((r) => setTimeout(r, opts.fbEventsJsDelayMs));
    }
    await route.fulfill({ contentType: 'application/javascript', body: fakeFbEventsScript() });
  });

  await page.route('**facebook.com/tr**', async (route: Route) => {
    trRequested = true;
    const url = new URL(route.request().url());
    let cd: Record<string, unknown> = {};
    try {
      cd = JSON.parse(url.searchParams.get('cd') ?? '{}');
    } catch {
      cd = {};
    }
    fbEvents.push({
      id: url.searchParams.get('id') ?? '',
      ev: url.searchParams.get('ev') ?? '',
      eid: url.searchParams.get('eid') ?? '',
      cd,
    });
    await route.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('') });
  });

  // /api/meta/capi es same-origin (nuestro propio dev server) — no hace falta
  // bloquearlo, solo observar el body que mandó el cliente. La llamada real
  // hacia Meta que ese endpoint podría hacer (graph.facebook.com) corre
  // server-side y ya está cubierta por assertNoRealMetaServerCredentials().
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.url().includes('/api/meta/capi')) {
      try {
        capiRequests.push(JSON.parse(req.postData() ?? '{}'));
      } catch {
        // ignorar body no-JSON
      }
    }
  });

  return {
    fbEvents,
    capiRequests,
    wasFbEventsJsRequested: () => fbEventsJsRequested,
    wasTrRequested: () => trRequested,
  };
}

async function acceptCookies(page: Page) {
  await page.getByRole('button', { name: 'Aceptar todas' }).click();
}

/** Espera a que el pixel esté realmente listo (callMethod asignado por el fake fbevents.js). */
async function waitForPixelReady(page: Page) {
  await page.waitForFunction(
    () =>
      typeof (window as unknown as { fbq?: { callMethod?: unknown } }).fbq === 'function' &&
      typeof (window as unknown as { fbq?: { callMethod?: unknown } }).fbq?.callMethod === 'function'
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Sin consentimiento
// ─────────────────────────────────────────────────────────────────────────
test.describe('META PIXEL — Sin consentimiento', () => {
  test('MP-001: no carga el Pixel, no existe window.fbq, no hay requests a Meta ni a /api/meta/capi', async ({ page }) => {
    const { fbEvents, capiRequests, wasFbEventsJsRequested, wasTrRequested } = await mockMetaNetwork(page);

    await page.goto('/es');
    // No hay ningún evento positivo que esperar acá — el punto es probar la
    // AUSENCIA de actividad, así que damos un margen fijo generoso.
    await page.waitForTimeout(1500);

    const fbqType = await page.evaluate(() => typeof (window as unknown as { fbq?: unknown }).fbq);
    expect(fbqType).toBe('undefined');
    expect(wasFbEventsJsRequested()).toBe(false);
    expect(wasTrRequested()).toBe(false);
    expect(fbEvents.length).toBe(0);
    expect(capiRequests.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 2. Después de aceptar cookies
// ─────────────────────────────────────────────────────────────────────────
test.describe('META PIXEL — Tras aceptar cookies', () => {
  test('MP-002: carga el Pixel con el Pixel ID configurado', async ({ page }) => {
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);
    await expect.poll(() => fbEvents.length).toBeGreaterThan(0);

    expect(fbEvents.every((e) => e.id === META_PIXEL_ID)).toBe(true);
  });

  test('MP-003: registra PageView tras aceptar', async ({ page }) => {
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);

    await expect.poll(() => fbEvents.filter((e) => e.ev === 'PageView').length).toBeGreaterThanOrEqual(1);
  });

  test('MP-004: registra ViewContent tras aceptar (landing), disparado una sola vez vía reintento diferido', async ({ page }) => {
    // Plans.tsx dispara ViewContent en su efecto de montaje, que corre ANTES
    // de que el usuario llegue a aceptar el banner (requiere un click
    // humano). useMetaEvents().fire() detecta la falta de consentimiento en
    // ese instante y encola la llamada como pendiente (queueViewContentRetry,
    // ver lib/meta/pixel.ts) en vez de dispararla o descartarla. Cuando
    // MetaPixelScript detecta "accepted", flushViewContentRetry() la dispara
    // una única vez — este test verifica ese camino completo.
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);

    await expect.poll(() => fbEvents.filter((e) => e.ev === 'ViewContent').length).toBeGreaterThanOrEqual(1);

    // No debe duplicarse: aunque Plans.tsx pueda re-renderizar, solo hay UNA
    // llamada pendiente guardada (nunca una cola), y flush la limpia
    // inmediatamente al dispararla — un segundo flush (ej. por Strict Mode)
    // es un no-op seguro.
    await page.waitForTimeout(500);
    expect(fbEvents.filter((e) => e.ev === 'ViewContent').length).toBe(1);
  });

  test('MP-004b: NO dispara ViewContent si el usuario rechaza las cookies', async ({ page }) => {
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es');
    await page.getByRole('button', { name: 'Solo necesarias' }).click();

    // Margen generoso — el punto es probar que nunca llega, no medir latencia.
    await page.waitForTimeout(1500);

    expect(fbEvents.filter((e) => e.ev === 'ViewContent').length).toBe(0);
    expect(await page.evaluate(() => typeof (window as unknown as { fbq?: unknown }).fbq)).toBe('undefined');
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 3. Navegación SPA
// ─────────────────────────────────────────────────────────────────────────
test.describe('META PIXEL — Navegación SPA', () => {
  test('MP-005: cada cambio de ruta SPA genera exactamente un PageView, sin duplicados', async ({ page }) => {
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es/destinos');
    await acceptCookies(page);
    await waitForPixelReady(page);
    await expect.poll(() => fbEvents.filter((e) => e.ev === 'PageView').length).toBeGreaterThanOrEqual(1);

    const pageViewsBefore = fbEvents.filter((e) => e.ev === 'PageView').length;

    // Navegación SPA real vía next/link (destinos/page.tsx) — Playwright no
    // debe recargar la página completa; MetaPixelRouteTracker es lo único
    // que debe disparar el PageView extra.
    await page.locator('a[href="/es/destinos/espana"]').click();
    await page.waitForURL('**/destinos/espana');

    await expect
      .poll(() => fbEvents.filter((e) => e.ev === 'PageView').length - pageViewsBefore)
      .toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 4. Checkout
// ─────────────────────────────────────────────────────────────────────────
test.describe('META PIXEL — Checkout', () => {
  test('MP-006: AddToCart e InitiateCheckout incluyen content_ids, content_type, value, currency y event_id', async ({ page }) => {
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);
    await expect.poll(() => fbEvents.some((e) => e.ev === 'PageView')).toBe(true);

    // Clic en "Elegir plan" de la primera tarjeta — dispara AddToCart y
    // navega (full reload, <a href> normal) a /compra?plan=...
    await page.locator('a[href*="/compra?plan="]').first().click();
    await page.waitForURL('**/compra?plan=**');
    await waitForPixelReady(page);

    await expect.poll(() => fbEvents.some((e) => e.ev === 'InitiateCheckout')).toBe(true);

    const addToCart = fbEvents.find((e) => e.ev === 'AddToCart');
    const initiateCheckout = fbEvents.find((e) => e.ev === 'InitiateCheckout');

    expect(addToCart, 'AddToCart no se registró').toBeTruthy();
    expect(initiateCheckout, 'InitiateCheckout no se registró').toBeTruthy();

    for (const evt of [addToCart!, initiateCheckout!]) {
      expect(evt.cd.content_ids).toBeTruthy();
      expect(evt.cd.content_type).toBe('product');
      expect(typeof evt.cd.value).toBe('number');
      expect(evt.cd.currency).toBe('USD');
      expect(evt.eid).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 5. Purchase en /confirmacion — carga fresca (regresión del bug de carrera)
// ─────────────────────────────────────────────────────────────────────────
test.describe('META PIXEL — Purchase en confirmación (carga fresca)', () => {
  test('MP-007: Purchase se registra aunque fbevents.js todavía esté cargando', async ({ page }) => {
    // fbEventsJsDelayMs fuerza la misma ventana de carrera que originalmente
    // perdía el evento Purchase — ver lib/meta/pixel.ts (pixelReady/pendingCalls)
    // y components/analytics/MetaPixel.tsx (stub con callMethod/queue).
    const { fbEvents } = await mockMetaNetwork(page, { fbEventsJsDelayMs: 400 });

    // Aceptar cookies en el home primero, como en el flujo real
    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);

    const eventId = `qa-purchase-${Date.now()}`;
    const orderRef = 'R34-QA-FRESH';

    // Simula el arribo desde el redirect de Stripe (mismos query params que
    // arma checkout/route.ts en success_url) — sin generar ninguna sesión ni
    // cobro real. order_ref no existe en Supabase → SELECT de lectura vacío.
    await page.goto(`/es/confirmacion?ref=${orderRef}&plan=${TEST_PLAN_ID}&qty=1&mid=${eventId}`);

    // Deliberadamente NO esperamos a waitForPixelReady antes de mirar los
    // eventos — el objetivo del test es justo que Purchase llegue pese al
    // delay artificial de fbevents.js.
    await expect.poll(() => fbEvents.filter((e) => e.ev === 'Purchase').length, { timeout: 8000 }).toBe(1);

    const purchase = fbEvents.find((e) => e.ev === 'Purchase')!;
    expect(purchase.eid).toBe(eventId);
    expect(purchase.cd.transaction_id).toBe(orderRef);
    expect(purchase.cd.content_ids).toEqual([TEST_PLAN_ID]);
    expect(purchase.cd.content_type).toBe('product');
    expect(typeof purchase.cd.value).toBe('number');
    expect(purchase.cd.currency).toBe('USD');
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 6. Deduplicación por event_id
// ─────────────────────────────────────────────────────────────────────────
test.describe('META PIXEL — Deduplicación', () => {
  test('MP-008: Pixel y /api/meta/capi comparten el mismo event_id (AddToCart)', async ({ page }) => {
    const { fbEvents, capiRequests } = await mockMetaNetwork(page);

    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);
    await expect.poll(() => fbEvents.some((e) => e.ev === 'PageView')).toBe(true);

    await page.locator('a[href*="/compra?plan="]').first().click();
    await page.waitForURL('**/compra?plan=**');

    await expect.poll(() => fbEvents.some((e) => e.ev === 'AddToCart')).toBe(true);
    await expect.poll(() => capiRequests.some((r) => r.event_name === 'AddToCart')).toBe(true);

    const addToCartPixel = fbEvents.find((e) => e.ev === 'AddToCart')!;
    const addToCartCapi = capiRequests.find((r) => r.event_name === 'AddToCart')!;

    expect(addToCartCapi.event_id).toBe(addToCartPixel.eid);
  });

  test('MP-009: un único Purchase por carga de /confirmacion', async ({ page }) => {
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);

    const eventId = `qa-dedupe-${Date.now()}`;
    await page.goto(`/es/confirmacion?ref=R34-QA-DEDUPE&plan=${TEST_PLAN_ID}&qty=1&mid=${eventId}`);
    await waitForPixelReady(page);

    await expect.poll(() => fbEvents.filter((e) => e.ev === 'Purchase').length, { timeout: 8000 }).toBe(1);
    expect(fbEvents.find((e) => e.ev === 'Purchase')!.eid).toBe(eventId);

    // NOTA DE ALCANCE: el evento Purchase autoritativo por Conversions API lo
    // manda el webhook de Stripe server-to-server (ver
    // src/app/api/webhooks/stripe/route.ts), no el navegador — por diseño la
    // página de confirmación NO llama a /api/meta/capi para Purchase (ver
    // hooks/useMetaEvents.ts, trackPurchase). La deduplicación entre el Pixel
    // del navegador y el CAPI del webhook depende de que ambos usen el MISMO
    // event_id determinístico (el "mid" que viaja por metadata de Stripe) —
    // verificar ESE enlace cruzado con un test E2E de navegador requeriría
    // invocar el webhook real de Stripe con una firma válida y una orden real
    // en Supabase, lo cual violaría la restricción de no generar datos reales.
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 7. Idempotencia en recarga de /confirmacion
// ─────────────────────────────────────────────────────────────────────────
test.describe('META PIXEL — Idempotencia en recarga', () => {
  test('MP-010: recargar /confirmacion reutiliza el mismo event_id (permite que Meta deduplique)', async ({ page }) => {
    const { fbEvents } = await mockMetaNetwork(page);

    await page.goto('/es');
    await acceptCookies(page);
    await waitForPixelReady(page);

    const eventId = `qa-idem-${Date.now()}`;
    const url = `/es/confirmacion?ref=R34-QA-IDEM&plan=${TEST_PLAN_ID}&qty=1&mid=${eventId}`;

    await page.goto(url);
    await waitForPixelReady(page);
    await expect.poll(() => fbEvents.filter((e) => e.ev === 'Purchase').length, { timeout: 8000 }).toBe(1);

    // Recargar la misma URL — el event_id viaja en el query param `mid`, no
    // se regenera en el cliente en cada carga.
    await page.reload();
    await waitForPixelReady(page);
    await expect.poll(() => fbEvents.filter((e) => e.ev === 'Purchase').length, { timeout: 8000 }).toBe(2);

    // La implementación actual NO tiene una memoria propia en el cliente que
    // bloquee el segundo disparo (no existe esa protección hoy) — lo que sí
    // garantiza es que el event_id nunca cambia entre cargas, así que aunque
    // el Pixel dispare Purchase dos veces, Meta las cuenta como una sola
    // conversión (mismo event_name + mismo event_id + mismo pixel).
    const purchases = fbEvents.filter((e) => e.ev === 'Purchase');
    expect(purchases[0].eid).toBe(eventId);
    expect(purchases[1].eid).toBe(eventId);
  });
});
