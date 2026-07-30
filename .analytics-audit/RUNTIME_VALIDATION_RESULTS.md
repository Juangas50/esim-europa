# VALIDACIÓN EN RUNTIME — RESULTADOS REALES

**Fecha:** 2026-07-30
**Método:** App levantada localmente (dev en :3000, build de producción en :3001), recorrida con Chromium vía Playwright. Se interceptó `window.dataLayer.push()` y se leyeron los `console.log` de debug de `analytics.ts`/`ga4.ts`/`meta.ts` (activos solo en `NODE_ENV=development`; en producción se usó interceptación directa de `dataLayer`).
**IDs usados:** `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID` dummy, solo en `.env.local` local (gitignored, no commiteado, ya eliminado al cerrar la sesión), únicamente para activar las rutas de código.

## Limitación del entorno (importante, no es un bug del producto)

El proxy saliente de este entorno bloquea las conexiones reales a `googletagmanager.com` y `connect.facebook.net` (`net::ERR_TUNNEL_CONNECTION_FAILED`). Esto significa:
- **No pude verificar la entrega real a GA4 DebugView ni a Meta Events Manager** (esos paneles requieren credenciales reales y conectividad real que no están disponibles aquí).
- Lo que sí pude verificar con certeza: **qué llama exactamente el código de la app** — el payload exacto que se empuja a `window.dataLayer` (lo que GTM consumiría) y las llamadas exactas a `window.fbq(...)` (lo que Meta Pixel consumiría). Esta es la капa de la que dependen ambos paneles; si el payload aquí está mal, estará mal en los paneles reales también.

No declaro "GA4 lo recibió" ni "Meta lo recibió" — declaro "el código intentó enviar X con estos parámetros exactos", que es lo que puedo demostrar con evidencia real.

---

## TABLA 1 — GA4 (dataLayer.push, capa de la que GTM/gtag toma los datos)

| Evento | Disparado | Parámetros capturados | OK/FAIL |
|---|---|---|---|
| `view_item_list` (Plans) | ✅ Sí, al cargar home | `section, item_list_id, item_list_name, ecommerce.items[5]` correctos | ⚠️ OK excepto `device_category` |
| `select_item` (Navbar) | ✅ Sí, al click en link nav | `section:navbar, element_text, element_type, destination_url` correctos | ⚠️ OK excepto `device_category` |
| `select_item` (FAQ) | ✅ Sí, solo al abrir (no al cerrar) | `section:faq` correcto | ⚠️ OK excepto `device_category` |
| `select_item` (Footer) | ✅ Sí, al click en link footer | `section:footer` correcto | ⚠️ OK excepto `device_category` |
| `contact_us` (WhatsApp) | ✅ Sí | `contact_method:whatsapp, destination_url:[FILTERED_PII]` | ✅ OK (PII correctamente filtrado) |
| `contact_us` (Email) | ✅ Sí | `contact_method:email, destination_url:[FILTERED_PII]` | ✅ OK (PII correctamente filtrado) |
| `begin_checkout` (Plans "Comprar") | ✅ Sí, una sola vez | `section:plans` + params confirmados por código (plan_id, price_usd, value) — payload completo no capturable por timing de navegación | ⚠️ Parcialmente verificado |
| `page_view` (StepPlan / Step 1) | No ejercitado (plan preseleccionado saltea Step 1) | — | ⏭️ No aplicable en este flujo |
| `page_view` (StepData / Step 2) | ✅ Sí — **PERO DUPLICADO** | Payload idéntico, **2 pushes con timestamp EXACTAMENTE IGUAL**, confirmado en build de producción | 🔴 **FAIL — duplicado real, no es artefacto de dev** |
| `set_checkout_option` (quantity) | No ejercitado (UI no encontrada con selector +) | — | ⏭️ No verificado |
| `set_checkout_option` (activation_type) | ✅ Sí, 1 evento por click, sin duplicar | `checkout_option_value` correcto para cada cambio | ⚠️ OK excepto `device_category` |
| `exception` (email mismatch) | No ejercitado (formulario se llenó sin mismatch) | — | ⏭️ No verificado |
| `page_view` (StepPayment / Step 3) | No alcanzado (formulario StepData no avanzó en el harness de prueba) | — | ⏭️ No verificado |
| `add_payment_info` | No alcanzado | — | ⏭️ No verificado |
| `view_item` (Confirmación) | ✅ Sí, al cargar | `transaction_id, item_id` correctos (via query params de prueba) | ⚠️ OK excepto `device_category` |
| `view_item` (Confirmación, reload) | ✅ Sí, **se repite en cada reload** | Mismo payload | 🔴 **FAIL — comportamiento conocido y ya documentado como riesgo, ahora confirmado** |

---

## TABLA 2 — Meta Pixel (llamadas reales a `window.fbq(...)`)

| Evento | Meta mapping existe | Se llamó a `fbq()` | Parámetros | OK/FAIL |
|---|---|---|---|---|
| `page_view` → PageView | ✅ Sí | ✅ Sí (en navegaciones posteriores a la primera) | `{}` (esperado, PageView no lleva custom data) | ⚠️ Ver hallazgo #2 abajo |
| `select_item` (FAQ/Footer/Navbar) | ❌ **No existe mapping** (por diseño, comentado explícitamente en `constants.ts`) | No aplica | — | ✅ Comportamiento intencional, no es bug |
| `contact_us` | ✅ Sí | ❌ **Nunca llegó a `fbq()`** cuando se dispara en la MISMA página donde se acaba de aceptar el consentimiento | — | 🔴 **FAIL — ver hallazgo #2** |
| `begin_checkout` → InitiateCheckout | ✅ Sí | ❌ **Nunca llegó a `fbq()`** en el mismo escenario (misma página, consentimiento recién otorgado) | — | 🔴 **FAIL — ver hallazgo #2** |
| `set_checkout_option` | ❌ No existe mapping (por diseño) | No aplica | — | ✅ Comportamiento intencional |
| `add_payment_info` → AddPaymentInfo | ✅ Sí | No alcanzado en el test | — | ⏭️ No verificado |
| `purchase` → Purchase | ✅ Sí | Server-side, fuera del alcance de este test de browser | — | ⏭️ Requiere test de webhook de Stripe (no ejecutado) |
| `view_item` → ViewContent | ✅ Sí | No confirmado en confirmación (mismo patrón del hallazgo #2, sin red real disponible para diferenciar) | — | ⏭️ Inconcluso |

---

## HALLAZGOS CONFIRMADOS (con evidencia reproducible)

### Hallazgo #1 — CRÍTICO: `device_category` hardcodeado a `"mobile"` en absolutamente todos los eventos

- **Componente:** Prácticamente todos — `Plans.tsx`, `Navbar.tsx`, `FAQ.tsx`, `Contact.tsx`, `Footer.tsx`, `DeviceCompatibilityFinder.tsx`, `PurchaseFlow.tsx`, `StepPlan.tsx`, `StepData.tsx`, `StepPayment.tsx`, `ConfirmacionView.tsx` (25+ ocurrencias, ver `grep -rn 'device_category: "mobile"' src/`)
- **Evento(s):** TODOS los que usan `track()` directamente con params explícitos (contraste: los que usan `trackCTAClick()`/`trackContact()` etc. si reciben `device_category` correcto vía `getAutoParams()`, pero estos wrappers no se usan en Phase 1/2).
- **Causa:** Cada llamada a `track(eventName, {...})` incluye `device_category: "mobile"` como valor literal en el objeto de params. Como `useAnalytics().track()` hace `{...autoParams, ...params}`, el valor literal SIEMPRE gana sobre el valor real detectado por `getDeviceCategory()`.
- **Evidencia runtime:** Con viewport de escritorio (1440×900) en el navegador de prueba, **todos** los eventos capturados en `dataLayer` muestran `device_category: "mobile"` — confirmado en `view_item_list`, `select_item`, `contact_us`, `begin_checkout`, `page_view`, `set_checkout_option`, `view_item`.
- **Impacto:** Toda segmentación por dispositivo en GA4 (desktop vs mobile vs tablet) está corrompida — el 100% del tráfico se reporta como "mobile" sin importar el dispositivo real.
- **Solución recomendada (no implementada, solo documentada):** Eliminar el literal `device_category: "mobile"` de cada llamada a `track()` y dejar que `getAutoParams()` (ya presente en `useAnalytics`) lo complete automáticamente, igual que ya hace para `page_path`/`language`.

---

### Hallazgo #2 — CRÍTICO: eventos Meta se pierden silenciosamente si se disparan en la misma página donde se acepta el consentimiento

- **Componente:** `src/lib/analytics/providers/meta.ts`
- **Evento(s):** Cualquier evento mapeado a Meta (`begin_checkout`, `contact_us`, etc.) disparado sin una navegación de página completa posterior a aceptar cookies.
- **Causa exacta:** `markMetaPixelReady()` en `src/lib/analytics/providers/meta.ts` (línea 209) **nunca es invocado por ningún código real de la app**. El único lugar donde se dispara el evento `onLoad` real de `fbevents.js` es `MetaPixel.tsx`, y ese componente importa `markMetaPixelReady` desde el módulo **legacy** `@/lib/meta/pixel.ts` (línea 6), no desde `@/lib/analytics/providers/meta.ts`. Son dos funciones con el mismo nombre en módulos distintos — la del sistema nuevo (Phase 1/2, el que usa `analytics.track()`) queda huérfana.
  - En la práctica esto "a veces funciona" porque el constructor de `MetaProvider` chequea una sola vez, al construirse, si `window.fbq` ya existe como función (el stub síncrono definido inline). Si la construcción del módulo ocurre después de que el stub ya se inyectó (como pasó en navegaciones posteriores en mis pruebas), `pixelReady` queda `true` por casualidad. Pero en la MISMA carga de página donde el usuario acaba de aceptar el consentimiento (el stub recién se inyecta después, vía `useEffect`), el módulo ya se construyó antes con `pixelReady=false`, y como nada vuelve a llamarlo, el evento queda encolado en `pendingEvents` **para siempre**, sin error, sin log, sin aviso.
- **Evidencia runtime:** En la home page (`/es`), tras aceptar cookies (sin recargar), se disparó `contact_us` (WhatsApp y Email) y `begin_checkout` (click en "Comprar" de Plans) — ambos con mapping válido a Meta. GA4 los recibió correctamente (`dataLayer.push` confirmado). **Meta: cero logs, cero llamadas a `fbq()`** para ninguno de los dos. En cambio, tras una navegación completa a `/es/compra`, `page_view` **sí** llegó a `fbq()`.
- **Impacto:** Los dos eventos de mayor valor para optimización de campañas de Meta Ads (`InitiateCheckout` y `Contact`) se pierden precisamente en el escenario más común: usuario nuevo que acepta cookies y en la misma visita hace click en "Comprar" o contacta por WhatsApp, sin recargar la página.
- **Solución recomendada (no implementada, solo documentada):** En `MetaPixel.tsx`, el callback `onLoad` de `fbevents.js` debe llamar también a `markMetaPixelReady` del módulo `@/lib/analytics/providers/meta.ts` (además del legacy), o unificar ambos sistemas en una sola función.

---

### Hallazgo #3 — ALTO: `page_view` de StepData se duplica exactamente, confirmado en build de PRODUCCIÓN

- **Componente:** `src/components/purchase/StepData.tsx` (useEffect líneas 140-148)
- **Evento:** `page_view` (`"RUTA34 Checkout - Step 2: Customer Information"`)
- **Causa:** No confirmada al 100%, pero **descartado que sea React Strict Mode** (que solo aplica en dev): se reprodujo el duplicado exacto (dos pushes a `dataLayer` con **timestamp idéntico al milisegundo**) en un build de producción real (`next build && next start`). Un timestamp idéntico indica dos ejecuciones síncronas del mismo efecto en el mismo tick, consistente con un doble-montaje del componente (posible relación con el warning de hydration-mismatch observado en los logs del servidor de dev, causado por el `nonce` de CSP que difiere entre SSR y CSR en varios componentes — ver `JsonLd`, requiere investigación adicional para confirmar la causa raíz exacta).
- **Evidencia runtime:** Prod build, `/es/compra?plan=local-s` → 2 pushes idénticos:
  ```
  {"event":"page_view","page_path":"/es/compra","page_title":"RUTA34 Checkout - Step 2: Customer Information",...,"timestamp":"2026-07-30T19:05:56.323Z"}
  {"event":"page_view","page_path":"/es/compra","page_title":"RUTA34 Checkout - Step 2: Customer Information",...,"timestamp":"2026-07-30T19:05:56.323Z"}
  ```
- **Impacto:** Duplica el conteo de `page_view` para el Step 2 del checkout en GA4 — infla las métricas de esa vista específica.
- **Solución recomendada (no implementada, solo documentada):** Aplicar el mismo patrón de guard con `useRef` ya usado en `StepPayment.tsx` para `payment_method`, o investigar y resolver la causa del posible doble-montaje/hydration-mismatch a nivel de layout (afecta potencialmente a más componentes, no solo analytics).

---

### Hallazgo #4 (positivo) — Filtro de PII funciona correctamente end-to-end

- **Evidencia:** El parámetro `destination_url` en `contact_us` (que originalmente contiene el número de WhatsApp o el email en la URL `wa.me/...` / `mailto:...`) llega al `dataLayer` real como `'[FILTERED_PII]'`, no como el valor original. Confirmado en el payload completo capturado, no solo en el log de advertencia.
- **Conclusión:** El sistema de protección de PII (`src/lib/analytics/helpers.ts`) funciona correctamente en producción real, no solo en teoría.

---

## Interacciones NO verificadas en esta sesión (limitación del harness de prueba, no evidencia de bug)

- `select_promotion` real de Hero.tsx (mi selector chocó con el link del Navbar que también apunta a `#planes`)
- `search` / `view_search_results` / `view_item` / `add_to_cart` de `DeviceCompatibilityFinder.tsx` (código revisado, luce correcto, pero no confirmado en runtime)
- `set_checkout_option` de cantidad de eSIMs en StepData
- `exception` por email mismatch
- `add_payment_info` (no se alcanzó StepPayment en el flujo de prueba — el formulario de StepData no avanzó más allá del substep de envío)
- `purchase` server-side vía webhook de Stripe (fuera del alcance de un test de browser; requiere test de webhook dedicado)

Recomiendo una segunda ronda de pruebas dirigida específicamente a estos puntos antes de dar luz verde definitiva.

---

## VEREDICTO

🔴 **NO PRODUCTION READY**

Razones (evidencia real, no supuesta):
1. `device_category` corrupto en el 100% de los eventos — HIGH severity, HIGH confidence.
2. Pérdida silenciosa de eventos críticos para Meta Ads (`InitiateCheckout`, `Contact`) en el escenario de consentimiento-recién-otorgado — HIGH severity, HIGH confidence.
3. Duplicación confirmada de `page_view` en Step 2 del checkout, reproducida en build de producción — MEDIUM-HIGH severity, HIGH confidence.
4. Reload de `/confirmacion` sigue re-disparando `view_item` (riesgo ya conocido, ahora confirmado) — LOW-MEDIUM severity.
5. Cobertura de pruebas incompleta: `add_payment_info`, `purchase` (server), Compatibility y Hero CTA no fueron confirmados en runtime.

Ningún hallazgo aquí requirió ni recibió una corrección de código — por instrucción explícita, esta fase fue solo de validación y documentación.
