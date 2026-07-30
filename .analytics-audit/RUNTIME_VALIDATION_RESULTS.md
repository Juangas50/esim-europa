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

## VEREDICTO (ronda anterior, superado por la sección siguiente)

🔴 ~~NO PRODUCTION READY~~ — ver actualización abajo. Los 3 defectos de esta sección (device_category, Meta readiness gap, page_view duplicado) **fueron corregidos** en un commit posterior (`93fac01`), confirmados en Vercel Preview, y esta sesión valida la cobertura que quedaba pendiente.

---

# RONDA 2 — VALIDACIÓN DE COBERTURA PENDIENTE

**Fecha:** 2026-07-30 (continuación, mismo día)
**Commit base:** `93fac01` (3 defectos de la Ronda 1 ya corregidos y confirmados en Preview)
**Método:** Mismo enfoque (interceptación de `dataLayer`/`fbq`/console debug), ampliado con:
- Simulación de webhook de Stripe firmado localmente (HMAC-SHA256 real contra `STRIPE_WEBHOOK_SECRET` de prueba) para validar `purchase` server-side sin depender de Stripe real.
- `curl` directo a `/api/webhooks/stripe` con firma inválida, para confirmar el rechazo de seguridad.
- Suite oficial `tests/qa/meta-pixel.spec.ts` (Playwright Test) — no pudo ejecutarse por falta del binario `chrome-headless-shell` en este sandbox (limitación de entorno, ver nota). Se cubrieron los mismos escenarios (MP-001 a MP-010) con scripts propios usando el binario de Chromium sí disponible.

## 1. Hero CTA — desktop / tablet / mobile

**Selector correcto usado:** `section a[href="#planes"]` (Hero usa `<section>`; el Navbar, que comparte el mismo `href="#planes"` y el mismo texto "Ver planes", usa `<nav>` — el primer intento de esta ronda chocó con el Navbar, quedó corregido para el resto de las pruebas).

| Viewport | Evento | Emisiones | `device_category` | `page_title` | `section` | Meta |
|---|---|---|---|---|---|---|
| Desktop 1440px | `select_promotion` | 1 (sin duplicar) | `desktop` ✅ | `"Page"` ❌ | `hero` ✅ | No mapping (por diseño) ✅ |
| Tablet 834px | `select_promotion` | 1 | `tablet` ✅ | `"Page"` ❌ | `hero` ✅ | No mapping (por diseño) ✅ |
| Mobile 390px | `select_promotion` | 1 | `mobile` ✅ | `"Page"` ❌ | `hero` ✅ | No mapping (por diseño) ✅ |

**Defecto encontrado y corregido:** `page_title` llegaba como el literal genérico `"Page"` en vez del título real de la página. Causa: `trackCTAClick(section, elementText)` (hook de conveniencia) no aceptaba `page_title` como parámetro, y `getAutoParams()` deliberadamente no completa `page_title` (por diseño, cada caller debe indicarlo). Hero.tsx es el único caller real de `trackCTAClick`.

**Fix aplicado:** se extendió `trackCTAClick` para aceptar un tercer parámetro opcional `pageTitle`, y Hero.tsx ahora pasa `"RUTA34 Home - Hero"` en sus 3 variantes responsive. Cambio de 2 archivos, sin afectar otros callers (no había otros).

**No hay CTA secundario en Hero** — confirmado por lectura de código: un único CTA lógico, repetido en 3 variantes responsive (desktop/tablet/mobile) vía clases CSS, nunca más de una visible/clickeable a la vez.

## 2. Device Compatibility — flujo completo

| Interacción | Evento | Emisiones (antes del fix) | Emisiones (después del fix) | Params |
|---|---|---|---|---|
| Escribir "iPhone 14" | `search` | 1 ✅ | 1 ✅ | `search_query`, `search_results_count` correctos |
| Dropdown de resultados aparece | `view_search_results` | 1 ✅ | 1 ✅ | — |
| Click en resultado "iPhone 14" | `view_item` | 1 ✅ | 1 ✅ | `device_model`, `is_compatible:true` |
| Click en resultado (dropdown se cierra) | `view_search_results` | **2** 🔴 (duplicado espurio) | 1 ✅ | — |
| Click "Comprar eSIM" (compatible) | `add_to_cart` | 1 ✅ | 1 ✅ | Solo se dispara con la acción real, no con la sola selección |
| Búsqueda sin resultados ("ZZZNonExistent...") | — | — | — | Muestra "No encontramos ese modelo" |
| — dispositivo "no compatible" + `contact_us` | — | **INALCANZABLE** | **INALCANZABLE** | Ver nota abajo |

**Defecto encontrado y corregido:** `view_search_results` se disparaba dos veces — una al aparecer el dropdown (correcto) y otra al cerrarse tras seleccionar un resultado (espurio). Causa: el evento estaba enganchado a `onAnimationComplete` de un `motion.div` con `AnimatePresence`, callback que Framer Motion invoca tanto al completar la animación de entrada como la de salida, sin distinguir cuál.

**Fix aplicado:** se reemplazó el disparo por-animación por un `useEffect` que detecta la transición `false→true` de visibilidad del dropdown (con un `useRef` para recordar el estado anterior), desacoplado del ciclo de vida de la animación. Ya no se dispara ni al seleccionar un resultado ni al limpiar la búsqueda.

**Hallazgo NO corregido (no es un defecto de tracking):** el flujo "dispositivo no compatible" (`isCompatible.compatible === false` → botón "Consultar por WhatsApp" → `contact_us`) es **código muerto inalcanzable desde la UI actual**. `selectedDevice` solo puede setearse haciendo click en un resultado del buscador, y todo resultado del buscador proviene de `esim-devices.json`, cuyo único criterio de "compatible" es "está en esa misma lista" — por construcción, todo dispositivo seleccionable es compatible. No hay forma en la UI de marcar un dispositivo como "no compatible" y disparar ese `contact_us`. No lo modifiqué (es una decisión de producto/UX, no un bug de instrumentación), solo lo documento porque la tarea pedía explícitamente probar ese camino.

**PII:** `search_query` y `device_model` son solo nombres de modelo (ej. "iPhone 14"), sin datos personales. Cero PII confirmado.

## 3. `add_payment_info`

Ejecutado el checkout completo (plan preseleccionado → StepData 3 sub-pasos → StepPayment) hasta el click en "Pagar".

| Momento | ¿Dispara `add_payment_info`? |
|---|---|
| Montar StepPayment | ❌ No (confirmado — 0 emisiones) |
| Hover sobre el botón "Pagar" | ❌ No |
| Marcar el checkbox de T&C | ❌ No |
| Click en "Pagar" | ✅ Sí, **exactamente 1 vez** |

**Payload confirmado (vía `dataLayer.push`):** `event: add_payment_info, section: checkout, device_category: desktop` (correcto, ya no hardcodeado) + `value`/`currency`/`payment_type` (confirmados por lectura de código, coherentes con el resto).

**Body de `/api/checkout` capturado en la request real:**
```json
{"plan_id":"local-s","payment_method":"stripe","quantity":1,"customer":{"name":"Juan","lastname":"Garcia","email":"test@example.com","country":"AR"},"activation_date":"","locale":"es","meta_event_id":"2fc31b97-..."}
```
Cero datos de tarjeta, cero token, cero `client_secret` — Stripe Checkout maneja la tarjeta en su propia página hosteada, nunca toca el código del cliente. `ga_client_id` no viajó en esta prueba porque no hay cookie `_ga` real en este sandbox (GTM real bloqueado por el proxy) — limitación de entorno, no del código.

**Reintentos:** el botón "Pagar" usa `disabled={loading || !acceptedTerms}`, y `setLoading(true)` es la primera línea de `handlePay()` — un segundo click mientras `loading=true` está bloqueado por el propio `disabled`. Verificado por lectura de código; no se fuzzeó exhaustivamente con doble-click real dado el tiempo disponible, pero el guard es sólido.

**Resultado: PASS. Ningún defecto encontrado en `add_payment_info`.**

## 4. `purchase` server-side (webhook de Stripe)

**Archivo y trigger:** `src/app/api/webhooks/stripe/route.ts`, evento `checkout.session.completed`.

**Arquitectura confirmada por código:**
- **No existe Purchase del lado del browser.** `ConfirmacionView.tsx` recibe la prop `metaEventId` pero nunca la usa para disparar nada — solo dispara `view_item`. Confirmado leyendo el archivo completo. Esto significa que **no hay escenario de deduplicación Pixel+CAPI para Purchase** — solo existe la fuente server-side (CAPI). El comentario en el propio código ("Purchase event... handled server-side via Stripe webhook... this client-side confirmation page only tracks view_item") es preciso y actualizado.
- **Idempotencia:** una única query atómica `UPDATE b2c_orders SET status='paid' ... WHERE order_ref=X AND status='pending_payment'`. Si la orden ya fue procesada, el `WHERE` no matchea ninguna fila, `data` es `null`, y el handler devuelve `{skipped: "already_processed"}` sin reprocesar nada. Patrón correcto y a prueba de condiciones de carrera (atomicidad la garantiza Postgres).
- **`transaction_id`** = `order_ref` (generado en `/api/checkout` al crear la orden).
- **`event_id`** (Meta) = `meta_event_id`, generado una sola vez en `StepPayment.tsx` al hacer click en "Pagar", viaja por `metadata` de la sesión de Stripe hasta el webhook — mismo ID que se usaría para el AddPaymentInfo del Pixel (que si comparte event_id con esta única fuente de Purchase server-side, aunque como no hay Purchase de browser, no hay deduplicación real que verificar en Meta para este evento específico).

**Prueba runtime ejecutada — firma del webhook:**
```
Firma inválida  → 400 {"error":"Invalid signature"}   ✅ correcto (seguridad funciona)
Firma válida    → 200 (procesa o responde "already_processed")  ✅ correcto
Mismo evento enviado 2 veces → ambas responden idéntico, sin duplicar ni crashear  ✅
```

**Limitación de entorno:** no pude crear una orden real en `pending_payment` (Supabase es un dummy inalcanzable en este sandbox), así que el webhook siempre corta antes de llegar a las llamadas de GA4 Measurement Protocol / Meta CAPI. **No pude observar esas dos llamadas de red en vivo.** Lo que sí pude confirmar con certeza — por lectura directa del código — es la forma exacta del payload que se enviaría:

**🔴 Defecto encontrado y corregido — GA4 Measurement Protocol no multiplicaba por `quantity`:**

Antes (líneas 184-193 del webhook):
```js
value: plan.price_usd,                    // ❌ precio de 1 unidad, sin importar quantity
items: [{ ..., quantity: 1 }],            // ❌ hardcodeado a 1
```
Mientras que Meta CAPI, en el mismo webhook, usa `buildPurchasePayload(plan, quantity, orderRef)` que **sí** multiplica correctamente (`value: plan.price_usd * quantity`). Es decir: para una compra grupal de 3 eSIMs a $20 c/u ($60 cobrados), GA4 habría reportado `purchase` con `value: 20` en vez de `60` — un pedido subvaluado en 2/3 de su valor real en todos los reportes de revenue de GA4. Meta, en cambio, ya reportaba el valor correcto.

**Fix aplicado:** `value: plan.price_usd * quantity` y `items[0].quantity: quantity`, igual que ya hacía `buildPurchasePayload` para Meta. Cambio de 2 líneas.

**Hasheo de PII para Meta CAPI:** confirmado correcto — `em` (email) pasa por SHA-256 (`hashSha256()` en `capi.ts`) antes de salir de nuestro servidor; `fbp`/`fbc`/`client_ip_address`/`client_user_agent` NO se hashean (correcto, así lo exige la spec de Meta).

**Resultado: PARCIAL.** Arquitectura correcta y segura (idempotencia, firma, sin Purchase duplicado de browser); defecto real encontrado y corregido en el cálculo de `value`/`quantity` de GA4 MP. No pude confirmar en vivo la llamada de red real a `google-analytics.com/mp/collect` ni a `graph.facebook.com` por falta de una base de datos real en este entorno — **requiere una prueba con Supabase real antes de dar luz verde definitiva a esta parte específica.**

## 5. Riesgo de reload en `/confirmacion`

| Escenario | `view_item` ¿se repite? |
|---|---|
| Carga inicial | Dispara 1 vez (esperado) |
| `reload()` | ✅ Sí, vuelve a disparar |
| Hard reload | ✅ Sí, vuelve a disparar |
| Ir a otra página y volver con el botón "atrás" | ❌ **No** — Chromium restauró la página desde bfcache (back-forward cache), sin re-ejecutar JS, así que el `useEffect` de montaje no corrió de nuevo |
| Adelante → atrás otra vez | ❌ No (mismo motivo, bfcache) |
| Misma URL / mismo `transaction_id` en una segunda pestaña | La pestaña 2 dispara `view_item` 1 vez, de forma independiente — es una vista nueva, no un duplicado del mismo evento |

**No se aplicó ningún fix acá** — no estaba pedido como corrección en esta ronda (solo "documenta si se repite"), y `purchase` (el evento que de verdad importa para no inflar ingresos) es 100% server-side e inmune a todo esto: ni el reload, ni el hard reload, ni el volver atrás, ni dos pestañas pueden generar una segunda compra, porque el cliente nunca dispara `purchase` — solo `view_item`, que es un evento de "vista de página", no de conversión. El riesgo real es únicamente sobre esa métrica de engagement (se infla en reload/hard-reload), no sobre ingresos reportados.

**Severidad: LOW.** Documentado, no corregido, consistente con lo que la tarea pidió para este punto específico.

## Nota sobre la suite oficial `tests/qa/meta-pixel.spec.ts`

No pudo ejecutarse: Playwright Test intenta lanzar un binario (`chrome-headless-shell-1228`) que no está instalado en este sandbox (solo está el Chromium "completo" en `/opt/pw-browsers/chromium`, que es el que usé directamente con el paquete `playwright` en todos los scripts de esta validación). Esto es una limitación de infraestructura del entorno, no algo para "arreglar" tocando `playwright.config.ts` sin que me lo pidan. Los 10 casos de esa suite (MP-001 a MP-010: consentimiento, PageView, ViewContent, navegación SPA, AddToCart/InitiateCheckout, Purchase en carga fresca, deduplicación Pixel+CAPI, idempotencia en reload) cubren, en esencia, los mismos escenarios que sí verifiqué manualmente con mis propios scripts en esta sesión y en la Ronda 1.

También corrí `npm run lint`: 71 errores / 62 warnings preexistentes, **ninguno en los archivos que toqué** (`Hero.tsx`, `DeviceCompatibilityFinder.tsx`, `useAnalytics.ts`, `webhooks/stripe/route.ts`).

`npm run build`: exitoso, sin errores nuevos.

---

## TABLA CONSOLIDADA — GA4

| Evento | Disparado | Emisiones | Parámetros clave | PASS/FAIL |
|---|---|---|---|---|
| `select_promotion` (Hero) | ✅ | 1/click, sin duplicar | `section:hero`, `page_title` corregido | ✅ PASS |
| `search` (Compatibility) | ✅ | 1/keystroke con query no vacía | `search_query`, `search_results_count` | ✅ PASS |
| `view_search_results` | ✅ | 1 (corregido, antes 2) | `search_results_count` | ✅ PASS (post-fix) |
| `view_item` (Compatibility) | ✅ | 1/selección | `device_model`, `is_compatible` | ✅ PASS |
| `add_to_cart` | ✅ | 1/click real | Solo con la acción, no con selección | ✅ PASS |
| `add_payment_info` | ✅ | 1/click "Pagar", nunca antes | `value`, `currency`, `payment_type` | ✅ PASS |
| `purchase` (server) | No confirmado en vivo (sin DB real) | — | `value`/`quantity` corregido en código | ⚠️ PARCIAL |
| `view_item` (confirmación) | ✅ | 1/carga, se repite en reload | `transaction_id`, `value` | ⚠️ Conocido, no corregido |

## TABLA CONSOLIDADA — Meta Pixel (browser, `fbq()`)

| Evento | Mapeado a Meta | Se llama `fbq()` | PASS/FAIL |
|---|---|---|---|
| `select_promotion` (Hero) | ❌ No (por diseño) | No aplica | ✅ PASS (comportamiento esperado) |
| `search`/`view_search_results` | `Search` | No verificado en esta ronda específicamente | ⏭️ Ver Ronda 1 |
| `view_item` → ViewContent | ✅ | Ver Ronda 1 (gap de wiring ya corregido) | ✅ Corregido en Ronda 1 |
| `add_to_cart` → AddToCart | ✅ | No verificado en esta ronda | ⏭️ Pendiente |
| `add_payment_info` → AddPaymentInfo | ✅ | No verificado en esta ronda (fbevents.js bloqueado por proxy) | ⏭️ Pendiente |

## TABLA CONSOLIDADA — Meta CAPI (server)

| Evento | `event_id` usado | Hasheo PII | Verificado en vivo |
|---|---|---|---|
| `Purchase` | `meta_event_id` (mismo desde StepPayment) | ✅ SHA-256 en `em`, correcto | ❌ No (sin DB real, el webhook corta antes) |

---

## DEFECTOS ENCONTRADOS EN ESTA RONDA

| # | Componente | Evento | Causa | Severidad | Estado |
|---|---|---|---|---|---|
| 1 | `Hero.tsx` / `useAnalytics.ts` | `select_promotion` | `page_title` hardcodeado a `"Page"` — `trackCTAClick` no aceptaba el parámetro | MEDIUM | ✅ Corregido |
| 2 | `DeviceCompatibilityFinder.tsx` | `view_search_results` | Duplicado por `onAnimationComplete` disparando en enter Y exit de la animación | MEDIUM | ✅ Corregido |
| 3 | `webhooks/stripe/route.ts` | `purchase` (GA4 MP) | `value`/`quantity` no multiplicaban por cantidad en compras grupales | HIGH (subvalúa ingresos reportados) | ✅ Corregido |
| 4 | `DeviceCompatibilityFinder.tsx` | `contact_us` (rama incompatible) | Código inalcanzable desde la UI actual | LOW (no es bug de tracking) | 📝 Solo documentado |
| 5 | `ConfirmacionView.tsx` | `view_item` | Se repite en reload/hard-reload (no en back/forward por bfcache) | LOW | 📝 Solo documentado (no pedido) |

---

## ESTADO FINAL (ronda anterior, superado por la Ronda 3 más abajo)

🟡 ~~READY WITH MINOR OBSERVATIONS~~ — ver Ronda 3. Una revisión senior independiente del PR completo encontró 2 hallazgos altos (A1, A2) y 3 medios (M1, M2, M3) adicionales que Ronda 2 no había cubierto porque no formaban parte de esos 5 puntos de cobertura pendiente; se corrigen en esta ronda.

Justificación (histórica):
- Los 3 defectos de la Ronda 1 (device_category, Meta readiness, page_view duplicado) están corregidos y confirmados.
- Los 3 defectos reproducibles encontrados en la Ronda 2 (page_title de Hero, view_search_results duplicado, quantity de GA4 MP) están corregidos, con build y lint limpios.
- Quedan 2 observaciones documentadas pero deliberadamente no corregidas (reload de `/confirmacion`, dead-code de "incompatible" en Compatibility) — ninguna afecta el conteo de ingresos ni duplica conversiones reales.

---

# RONDA 3 — CORRECCIÓN DE HALLAZGOS DE LA REVISIÓN SENIOR INDEPENDIENTE

**Fecha:** 2026-07-30 (continuación, mismo día)
**Commit base:** `0f63041` (Ronda 2 ya corregida)
**Origen:** Revisión senior independiente del PR #4 completo (los 35 archivos del diff, no solo los tocados en Rondas 1-2), pedida explícitamente por el usuario, con recomendación final "Approve with comments" señalando 2 hallazgos ALTOS y 3 MEDIOS + 1 observación menor.

## A1 — `initializeAnalytics()` nunca se ejecutaba

**Causa raíz confirmada:** `grep -rn "initializeAnalytics(" src/ | grep -v "lib/analytics/analytics.ts"` no devolvía resultados — ningún layout, provider o componente la invocaba. `globalSharedParams` quedaba en `{}` para siempre.

**Fix aplicado (`src/lib/analytics/analytics.ts`):** en vez de depender de que algún componente la llame explícitamente (con el riesgo de gating por consentimiento si se monta en el lugar equivocado, como pasaría si se hubiera puesto dentro de `GTMScript`/`MetaPixelScript`, que no renderizan hasta aceptar cookies), `track()` ahora se auto-inicializa una sola vez, de forma perezosa, en su primera ejecución real (client-side, después del chequeo SSR ya existente). Un flag a nivel de módulo (`isInitialized`) evita que se repita en cada evento; `getSessionId()` ya cachea el UUID vía cookie de 30 días, así que no hay riesgo de regenerarlo entre renders, navegaciones SPA o el doble-invoke de React Strict Mode.

**Hallazgo adicional durante la corrección (no pedido, pero directamente causado por activar A1):** el mecanismo `eventID: params.session_id` en `MetaProvider.track()` (`src/lib/analytics/providers/meta.ts`) reutilizaba el `session_id` —constante durante toda la sesión— como `eventID` de Meta para **todos** los eventos. Como Meta deduplica por el par `(event_name, event_id)`, cualquier evento repetible (`search`, `view_item`, `add_to_cart`, etc.) que ocurriera dos veces en la misma sesión habría compartido el mismo `eventID` que su primera ocurrencia, y Meta habría descartado la segunda como si fuera una entrega duplicada de la primera — perdiendo silenciosamente una acción real y distinta del usuario. Esto era código dormido antes de A1 (nunca se activaba porque `session_id` nunca llegaba), pero mi propio fix de A1 lo habría activado tal cual. Se retiró esa reutilización: hoy nada en el pipeline genérico de `track()` provee un id único por ocurrencia (el único caso real, `meta_event_id` de `add_payment_info`, se genera y viaja fuera de esta pipeline, directo a los metadatos de Stripe), así que se envía sin `eventID` y se deja que Meta asigne el suyo — documentado con un comentario extenso en el propio código.

**Segundo hallazgo durante la validación runtime de A1 (tampoco pedido, causado igual por activar A1):** con `session_id` ya poblado, ~15 pruebas mostraron el UUID real en el 100% de los casos, pero antes de aplicar este segundo fix, una prueba mostró el valor `[FILTERED_PII]` en vez del UUID. Confirmé con un test aislado que el patrón `PHONE` del filtro de PII (`src/lib/analytics/helpers.ts`) tiene una tasa de falso positivo real de **~3.9%** contra UUIDs aleatorios (secuencias de dígitos dentro del UUID pueden coincidir accidentalmente con la forma de un teléfono). Como `session_id` es un identificador generado por la propia app (nunca texto tipeado por el usuario), estructuralmente no puede ser PII real. Se lo excluyó (junto con `user_id`, mismo caso) del escaneo de PII en `sanitizeParams()`, usando el mecanismo de exclusión por nombre de campo que la función ya tenía (antes solo para password/secret/token/apikey).

**Evidencia runtime (antes → después):**

| Prueba | Antes | Después |
|---|---|---|
| `session_id` en el primer evento de la página | `MISSING` (nunca poblado) | `40af418f-50c2-46a8-812c-d5f0390def52` presente |
| `session_id` tras reload de página | — | Idéntico al anterior — estable |
| `session_id` en 15 cargas de sesión nuevas (cookies limpias) | No probado (no existía) | 15/15 UUIDs reales, 0 filtrados como PII (antes del segundo fix, 1 de ~15 se habría filtrado según la tasa medida) |
| `eventID` en llamadas `fbq()` | `session_id` (reutilizado en todos los eventos) | Sin `eventID` — ninguna llamada capturada reutiliza un id repetido (no se pudo forzar una llamada real a `fbq()` en este sandbox porque `fbevents.js` sigue bloqueado por el proxy de red, mismo límite documentado en Rondas 1-2; verificado por lectura de código que la línea `eventID: params.session_id` ya no existe) |

## A2 — iPad clasificado como `mobile`

**Fix aplicado (`src/lib/analytics/helpers.ts`):** se reordenó `getDeviceCategory()` para que las señales de tablet por user-agent (`ipad`, Android sin token `mobile`, `tablet` genérico) se evalúen **antes** que cualquier comparación de ancho o el chequeo de mobile — así un iPad en landscape más ancho que un laptop sigue siendo tablet. Se usó la convención estándar de UA (los teléfonos Android incluyen el token `Mobile`, las tablets Android no) para distinguir Android phone de Android tablet.

**Evidencia runtime — los 6 escenarios pedidos, todos PASS:**

| Escenario | Viewport | User-Agent | Resultado |
|---|---|---|---|
| iPhone | 390px | iPhone Safari | `mobile` ✅ |
| Android phone | 412px | Android Chrome Mobile | `mobile` ✅ |
| iPad | 768px | iPad Safari | `tablet` ✅ |
| iPad Pro landscape | 1366px | iPad Safari (mismo UA que arriba) | `tablet` ✅ (antes habría sido `mobile`, el caso que motivó el fix) |
| Android tablet | 800px | Android Chrome sin token "Mobile" | `tablet` ✅ (antes habría sido `mobile`) |
| Desktop | 1440px | Sin UA especial | `desktop` ✅ |

No se agregó infraestructura de test unitario (Jest/Vitest) porque el proyecto no la tenía y la instrucción explícita fue no agregar dependencias solo para esto — la validación se hizo con Playwright (ya presente) contra el navegador real.

## M1 — `checkout_step` se descartaba silenciosamente

**Fix aplicado:**
- `src/lib/analytics/types.ts`: se agregó `checkout_step?: "plan" | "data" | "payment"` a `EngagementParams`, junto a `checkout_option`/`checkout_option_value` — valores categóricos acotados a los tres steps reales del checkout (`StepPlan`/`StepData`/`StepPayment`), ya que TRACKING_PLAN.md no define este parámetro explícitamente para `exception` (solo lista `page_path`, `section`, `exception_type`, `exception_description`, `is_fatal`) pero tampoco lo prohíbe, y el pedido explícito del usuario fue tipar y conservar el campo, no removerlo.
- `src/lib/analytics/providers/ga4.ts`: se agregó el forwarding `if (params.checkout_step) payload.checkout_step = params.checkout_step;`, siguiendo el mismo patrón que los campos vecinos.
- **No se eliminó** el índice abierto `[key: string]: unknown` de `EventParams` (instrucción explícita de no tocarlo salvo que fuera imprescindible — no lo era).
- **Meta:** confirmado que `exception` sigue sin mapping en `META_EVENT_MAPPING` (línea `// scroll, select_item, select_promotion, set_checkout_option, exception → Not in Meta`), consistente con la tabla `exception (errors) | ✅ | ❌ | ❌` de TRACKING_PLAN.md — `checkout_step` estructuralmente no puede llegar a Meta porque `MetaProvider.track()` corta antes de construir el payload cuando no hay mapping.

**Validación runtime:** se intentó disparar el evento `exception` real (email no coincidente en StepData) para capturar el payload completo del `dataLayer`, pero se descubrió que la validación de Zod (`refine` a nivel de objeto con `path: ["confirm_email"]`) bloquea el avance del substep 1 del formulario en cuanto detecta el mismatch — es decir, **la UI actual nunca deja llegar a un usuario real hasta el submit final con emails no coincidentes**, lo que en la práctica vuelve inalcanzable ese camino específico del evento `exception` (hallazgo colateral, no pedido, no corregido — ortogonal a analytics, es una validación de formulario). Por esto, `checkout_step` se verificó por code review + build exitoso (los tipos compilan, el forwarding sigue el patrón exacto ya probado para `exception_type`/`exception_description`/`is_fatal` en la misma función) en lugar de una captura en vivo del payload completo.

## M2 — Comentario obsoleto en `StepPayment.tsx`

**Fix aplicado:** se reescribió el comentario junto a `generateMetaEventId()` para reflejar la arquitectura real (Purchase es CAPI-only, `/confirmacion` no dispara ningún Purchase de Pixel desde que se quitó en la Ronda 1), en vez de seguir prometiendo una deduplicación Pixel+CAPI que ya no existe. No se tocó ninguna línea de lógica.

## M3 — `add_to_cart` con `value: 0` en Compatibility

**Verificado contra TRACKING_PLAN.md** (línea 322-336): el evento `add_to_cart` para el botón "Comprar eSIM" desde compatibilidad **sí** está documentado explícitamente como el evento correcto para esa acción ("Usuario hace click en 'Comprar eSIM' desde compatibilidad confirmada") — se aplicó la Opción A del pedido (mantener el evento ya definido) en el sentido de no inventar uno nuevo, pero ajustando el payload: como en ese punto del flujo no hay ningún plan ni precio elegido todavía (el botón solo navega a `/compra` sin plan preseleccionado), se quitaron `value: 0` y `currency: "USD"` en vez de enviar un valor de carrito fabricado. Quedan `device_model`, `is_compatible` y `section`, que son los parámetros que sí describen la acción real.

**Evidencia runtime:** el evento se confirmó disparando correctamente (`[GA4] Event pushed: {event: add_to_cart, section: compatibility, ...}`), una sola vez, solo al click real en "Comprar eSIM" (no antes). La ausencia de `value`/`currency` en el payload final está garantizada por dos hechos verificables: el objeto literal en el código ya no los incluye, y `GA4Provider.track()` solo agrega `payload.value`/`payload.currency` cuando `params.value !== undefined` — no pude capturar el objeto completo del `dataLayer` en este intento puntual por timing de la navegación que dispara el propio botón, pero la garantía es estructural, no depende de una carrera de timing.

## Observación menor — `metaEventId` muerto

**Verificado antes de eliminar:** `grep -rn "metaEventId" src/` mostró que el webhook (`src/app/api/webhooks/stripe/route.ts:213`) usa su propia constante local `metaEventId`, derivada directamente de `session.metadata?.meta_event_id` (metadatos de Stripe) — completamente independiente de la prop de React. Confirmado que retirar la prop no afecta ni al webhook ni al Purchase CAPI.

**Fix aplicado:** se eliminó `metaEventId` de la interfaz `ConfirmacionViewProps`, de su destructuring, del JSX en `page.tsx`, y del campo `mid` en el tipo de `searchParams` y su destructuring (quedó huérfano tras retirar el único uso). No se tocó `checkout/route.ts` — el query param `mid` se sigue generando en la `success_url` de Stripe (parte de una URL pública, inofensivo dejarlo aunque ya no se consuma), retirarlo hubiera sido un cambio fuera del alcance pedido.

---

## VALIDACIÓN TÉCNICA — RONDA 3

- **Build:** exitoso, sin errores nuevos (solo el fallback esperado de Supabase, sin credenciales reales en este sandbox).
- **Lint:** 71 errores / 61 warnings (antes: 71/62 — una advertencia menos, ninguna nueva). Cero errores/warnings nuevos en los 9 archivos tocados.
- **Tests:** no se re-corrió la suite `meta-pixel.spec.ts` en esta ronda (limitación de entorno ya documentada en Ronda 2 — falta el binario `chrome-headless-shell`); la cobertura equivalente se hizo con scripts propios de Playwright contra el mismo Chromium ya usado en las rondas anteriores.

## Búsqueda en todo el repositorio (pedida explícitamente)

```
initializeAnalytics(   → 1 definición + 1 llamada interna (ensureInitialized, nueva) — antes: 0 llamadas
session_id              → SharedParams, AttributionParams, mergeParams, GA4Provider, MetaProvider (ya no como eventID), OPAQUE_ID_FIELDS (nuevo)
eventID / event_id      → solo queda en MetaProvider (ya sin reutilizar session_id) y en meta_event_id (StepPayment → checkout → webhook, sin cambios)
checkout_step            → StepData.tsx (origen), types.ts (nuevo), providers/ga4.ts (nuevo)
metaEventId              → 0 ocurrencias fuera de webhooks/stripe/route.ts (su propia constante local, no relacionada)
add_to_cart con value 0  → 0 ocurrencias (ya no existe en el código)
comentarios Pixel+CAPI dedup → 0 ocurrencias de la afirmación desactualizada; StepPayment.tsx actualizado
```

## TABLA FINAL DE HALLAZGOS

| Hallazgo | Archivo | Corrección | Evidencia | PASS/FAIL |
|---|---|---|---|---|
| A1 — session_id nunca poblado | `analytics.ts` | Auto-init perezoso en `track()`, un flag a nivel de módulo | 15/15 sesiones nuevas con UUID real; estable tras reload | ✅ PASS |
| A1 (colateral) — eventID = session_id | `providers/meta.ts` | Se retiró la reutilización de session_id como eventID | Confirmado por code review; línea eliminada | ✅ PASS |
| A1 (colateral) — session_id filtrado como PII | `helpers.ts` | Excluido del escaneo de PII vía `OPAQUE_ID_FIELDS` | 15/15 pruebas sin `[FILTERED_PII]` (antes: falso positivo confirmado ~3.9%) | ✅ PASS |
| A2 — iPad clasificado como mobile | `helpers.ts` | Reordenado: UA de tablet se chequea antes que mobile/ancho | 6/6 escenarios pedidos correctos | ✅ PASS |
| M1 — checkout_step descartado | `types.ts`, `providers/ga4.ts` | Tipado + forwarding agregado | Build/tipos verificados; captura en vivo bloqueada por validación de formulario preexistente (no relacionada) | ⚠️ PARCIAL (código correcto, no confirmado end-to-end en vivo) |
| M2 — comentario obsoleto | `StepPayment.tsx` | Comentario reescrito, sin cambio funcional | Revisión de código | ✅ PASS |
| M3 — add_to_cart value:0 | `DeviceCompatibilityFinder.tsx` | Se quitaron value/currency fabricados | Evento confirmado disparando correctamente; ausencia de value/currency garantizada estructuralmente | ✅ PASS |
| metaEventId muerto | `ConfirmacionView.tsx`, `page.tsx` | Prop, destructuring y paso eliminados | Build exitoso, grep confirma cero referencias sueltas | ✅ PASS |

---

## ESTADO FINAL — RONDA 3

🟡 **READY WITH MINOR OBSERVATIONS**

No declaro 🟢 Production Ready pese a que build y lint pasan limpios y los 8 hallazgos de la revisión senior están corregidos, porque:
1. M1 (`checkout_step`) no tiene confirmación runtime end-to-end del payload completo — el código es correcto por inspección y tipos, pero no lo vi viajar en un `dataLayer.push()` real.
2. Persisten, sin corregir por decisión explícita de alcance, las observaciones ya documentadas en rondas anteriores: reload de `/confirmacion`, dead-code de "dispositivo no compatible", y la imposibilidad de probar en vivo la llamada real del webhook a GA4 Measurement Protocol / Meta CAPI (sin Supabase real en este entorno).

Ninguno de estos tres puntos es HIGH severity ni compromete duplicación de `purchase`, PII, o consentimiento — son reservas de cobertura, no defectos conocidos sin corregir.
- **Única reserva real:** la llamada de red efectiva de GA4 Measurement Protocol y Meta CAPI en el webhook de `purchase` no pudo verificarse en vivo por falta de una base de datos real en este entorno de pruebas. El código fue revisado línea por línea y corregido donde tenía un defecto claro, pero recomiendo una prueba de extremo a extremo con Stripe test mode + Supabase real (o al menos un staging) antes de considerar esta pieza específica 100% verificada en producción.
