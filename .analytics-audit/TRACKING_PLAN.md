# 📊 TRACKING PLAN - ESIM RUTA34
**Fuente de Verdad para Instrumentación Analítica**

**Versión:** 1.0  
**Fecha:** 30 de Julio, 2026  
**Estado:** DRAFT - Pendiente Validación  
**Responsable:** Equipo Analytics  

---

## 🎯 PRINCIPIOS GUÍA

1. **GA4 First** → Usar eventos estándar de GA4 siempre que sea posible
2. **Nomenclatura Única** → Nunca duplicar eventos, reutilizar parámetros
3. **Parámetros Compartidos** → Minimizar el número de parámetros únicos
4. **Conversiones Claras** → Solo marcar verdaderas conversiones
5. **Privacidad Primero** → Cero PII en tracking
6. **Mantenibilidad** → Código limpio, fácil de testear

---

## 📐 MODELO DE PARÁMETROS COMPARTIDOS

Estos parámetros deben acompañar **prácticamente todos los eventos** para garantizar análisis cohesivos.

### Parámetros Universales (Siempre)

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `page_path` | string | `/es`, `/pt` | Ruta de la página actual |
| `page_title` | string | `RUTA34 Home`, `Checkout - Paso 1` | Título SEO de la página |
| `language` | string | `es`, `pt` | Idioma del usuario (ISO 639-1) |
| `device_category` | string | `desktop`, `tablet`, `mobile` | Tipo de dispositivo (GA4 estándar) |
| `timestamp` | ISO8601 | `2026-07-30T16:40:00Z` | Hora exacta del evento (auto) |

### Parámetros de Contexto (Frecuentes)

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `section` | string | `hero`, `plans`, `compatibility`, `faq` | Sección donde ocurre el evento |
| `element_id` | string | `btn-buy-now`, `cta-hero-primary` | ID único del elemento HTML |
| `element_text` | string | `Comprar Ahora`, `Ver Planes` | Texto visible del elemento |
| `element_type` | string | `button`, `link`, `tab`, `accordion`, `card` | Tipo de elemento interactuable |
| `position_index` | number | `0`, `1`, `2` | Índice en lista (0-based) |

### Parámetros de Tráfico/Atribución (Sesión)

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `source` | string | `direct`, `google`, `facebook` | Fuente de tráfico (UTM source) |
| `medium` | string | `organic`, `cpc`, `social`, `email` | Medio de tráfico (UTM medium) |
| `campaign` | string | `summer-sale-2026` | Campaña (UTM campaign) |
| `content` | string | `banner-hero`, `sidebar-cta` | Variante del contenido (UTM content) |
| `session_id` | string | UUID | ID único de sesión |
| `user_id` | string | Hash anónimo | ID anónimo del usuario |

### Parámetros de Plan/Producto (Cuando aplique)

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `plan_id` | string | UUID | ID único del plan en DB |
| `plan_name` | string | `Europa Plus`, `Europa Total` | Nombre comercial del plan |
| `plan_slug` | string | `europa-plus`, `europa-total` | Slug para URLs |
| `data_gb` | number | `10`, `20`, `50` | GB incluidos en el plan |
| `eu_data_gb` | number | `5`, `10` | GB de EU roaming (si aplica) |
| `price_usd` | number | `19.99`, `49.99` | Precio en USD |
| `price_original_usd` | number | `24.99` | Precio original (si hay descuento) |
| `currency` | string | `USD` | Moneda ISO 4217 |
| `is_popular` | boolean | `true`, `false` | Si el plan es destacado |
| `plan_position` | number | `0`, `1`, `2` | Posición en grid |

### Parámetros de Búsqueda (Buscador)

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `search_type` | string | `country`, `device`, `faq` | Tipo de búsqueda |
| `search_query` | string | `iphone 15`, `españa` | Texto de búsqueda |
| `search_results_count` | number | `5`, `12` | Número de resultados |

### Parámetros de Dispositivo (Compatibilidad)

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `device_model` | string | `iPhone 15 Pro`, `Samsung Galaxy S24` | Modelo exacto |
| `device_manufacturer` | string | `Apple`, `Samsung` | Fabricante |
| `is_compatible` | boolean | `true`, `false` | eSIM compatible |
| `compatibility_source` | string | `manual_search`, `auto_detection` | Cómo se verificó |

### Parámetros de Contacto

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `contact_method` | string | `whatsapp`, `email`, `phone`, `contact_form` | Canal de contacto |
| `contact_location` | string | `contact_section`, `device_finder`, `faq` | Dónde se inició |

---

## 📋 TABLA MAESTRA DE EVENTOS

### 🏠 HOME / NAVEGACIÓN

#### **page_view** (GA4 Estándar)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `page_view` |
| **Descripción** | Carga de cualquier página del sitio |
| **Se Dispara** | Automático en page load |
| **Elemento** | Page (global) |
| **Parámetros** | `page_path`, `page_title`, `language`, `device_category`, `source`, `medium`, `campaign` |
| **Tipos Parámetro** | string, string, string, string, string, string, string |
| **Ejemplo** | `page_path="/es"`, `page_title="RUTA34 Home"`, `language="es"` |
| **GA4** | ✅ Sí (automático) |
| **Meta Pixel** | ✅ ViewContent |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🔴 Alta |
| **Notas** | Incluir siempre en analytics.pageview. No duplicar si ya viene de GTM |

---

#### **scroll** (GA4 Personalizado)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `scroll` |
| **Descripción** | Usuario hace scroll a una sección específica |
| **Se Dispara** | Cuando entra a viewport (Intersection Observer) |
| **Elemento** | Section (hero, plans, faq, etc) |
| **Parámetros** | `page_path`, `section`, `scroll_percentage`, `timestamp` |
| **Tipos Parámetro** | string, string, number, ISO8601 |
| **Ejemplo** | `section="plans"`, `scroll_percentage=25` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ❌ No |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Disparar cuando el 25%, 50%, 75% y 100% del viewport entra en cada sección |

---

#### **view_item_list** (GA4 Estándar)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `view_item_list` |
| **Descripción** | Usuario ve una lista de productos (ej: planes) |
| **Se Dispara** | Cuando la sección de planes entra en viewport |
| **Elemento** | Plans Grid Container |
| **Parámetros** | `page_path`, `page_title`, `section`, `item_list_id`, `item_list_name`, `items` (array) |
| **Tipos Parámetro** | string, string, string, string, string, array |
| **Ejemplo** | `section="plans"`, `item_list_name="eu_plans"`, `items=[{item_id, item_name, price_usd}]` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ ViewContentList |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🔴 Alta |
| **Notas** | Se dispara UNA SOLA VEZ por sesión (once:true en Intersection Observer) |

---

#### **select_item** (GA4 Estándar - Para Links)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `select_item` |
| **Descripción** | Click en un enlace de navegación (menu, logo, footer links) |
| **Se Dispara** | Click en elemento link/a |
| **Elemento** | Navbar links, Logo, Footer links |
| **Parámetros** | `page_path`, `section`, `element_id`, `element_text`, `destination_url`, `link_type` |
| **Tipos Parámetro** | string, string, string, string, string, string |
| **Ejemplo** | `section="navbar"`, `element_text="Planes"`, `destination_url="#planes"`, `link_type="anchor"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ❌ No |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🔴 Alta |
| **Notas** | NO incluir CTA buttons (usar select_promotion). Solo links de navegación |

---

#### **select_promotion** (GA4 Estándar - Para CTAs)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `select_promotion` |
| **Descripción** | Click en botón CTA principal (Hero, How It Works, etc) |
| **Se Dispara** | Click en botón con clase .cta-primary |
| **Elemento** | Button (Comprar Ahora, Explorar planes, etc) |
| **Parámetros** | `page_path`, `section`, `element_id`, `element_text`, `promotion_id`, `promotion_name`, `destination_url` |
| **Tipos Parámetro** | string, string, string, string, string, string, string |
| **Ejemplo** | `section="hero"`, `element_text="Comprar Ahora"`, `promotion_name="hero_cta_primary"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ InitiateCheckout (si es relevante) |
| **Conversión GA4** | ⚠️ Solo si lleva a checkout |
| **Prioridad** | 🔴 Alta |
| **Notas** | Los CTAs de Hero, HowItWorks van aquí. NOT plan selection (usar begin_checkout) |

---

#### **view_search_results** (GA4 Personalizado)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `view_search_results` |
| **Descripción** | Se muestran resultados de búsqueda (país o dispositivo) |
| **Se Dispara** | Cuando se muestran resultados después de search_query |
| **Elemento** | Search results list |
| **Parámetros** | `page_path`, `section`, `search_type`, `search_query`, `search_results_count` |
| **Tipos Parámetro** | string, string, string, string, number |
| **Ejemplo** | `section="benefits"`, `search_type="country"`, `search_query="españa"`, `search_results_count=5` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ Search |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Se dispara cuando hay resultados (no en caso de "no results") |

---

#### **search** (GA4 Estándar)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `search` |
| **Descripción** | Usuario tipea en un buscador y envía (submit) |
| **Se Dispara** | Enter key o click en search button |
| **Elemento** | Search input + button |
| **Parámetros** | `page_path`, `section`, `search_type`, `search_query`, `search_results_count` |
| **Tipos Parámetro** | string, string, string, string, number |
| **Ejemplo** | `section="compatibility"`, `search_type="device"`, `search_query="iphone"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ Search |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Dispara cuando usuario presiona Enter o hace click en search button |

---

### 💳 PLANES

#### **view_item** (GA4 Estándar)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `view_item` |
| **Descripción** | Usuario ve un plan individual en detalle |
| **Se Dispara** | Click en "Ver más" o hover prolongado (2s) |
| **Elemento** | Plan card |
| **Parámetros** | `page_path`, `section`, `plan_id`, `plan_name`, `price_usd`, `currency`, `data_gb`, `is_popular`, `plan_position` |
| **Tipos Parámetro** | string, string, string, string, number, string, number, boolean, number |
| **Ejemplo** | `plan_id="uuid"`, `plan_name="Europa Plus"`, `price_usd=29.99`, `data_gb=20`, `is_popular=true` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ ViewContent |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🔴 Alta |
| **Notas** | Se dispara por plan card individual (no por la lista completa) |

---

#### **begin_checkout** (GA4 Estándar) ⭐ CRÍTICO
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `begin_checkout` |
| **Descripción** | Usuario hace click en "Comprar" de un plan |
| **Se Dispara** | Click en botón "Comprar" o "Seleccionar Plan" |
| **Elemento** | Plan card CTA button |
| **Parámetros** | `page_path`, `section`, `plan_id`, `plan_name`, `price_usd`, `currency`, `data_gb`, `plan_position`, `value`, `items` (array) |
| **Tipos Parámetro** | string, string, string, string, number, string, number, number, number, array |
| **Ejemplo** | `plan_id="uuid"`, `plan_name="Europa Plus"`, `value=29.99`, `currency="USD"`, `items=[{item_id, item_name, price}]` |
| **GA4** | ✅ Sí (CONVERSIÓN) |
| **Meta Pixel** | ✅ AddToCart + InitiateCheckout |
| **Conversión GA4** | ✅ **SÍ** |
| **Prioridad** | 🔴 **CRÍTICA** |
| **Notas** | **IMPORTANTE:** Consolidar aquí. NO disparar 3 eventos simultáneamente. Este es el único evento de selección de plan |

---

#### **view_cart** (GA4 Estándar - Opcional)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `view_cart` |
| **Descripción** | Usuario ve el carrito de compra (si existe) |
| **Se Dispara** | Página /checkout o modal carrito |
| **Elemento** | Cart container |
| **Parámetros** | `page_path`, `section`, `value`, `currency`, `items` (array) |
| **Tipos Parámetro** | string, string, number, string, array |
| **Ejemplo** | `value=29.99`, `currency="USD"`, `items=[...]` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ ViewContent |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Si no hay carrito visible, puede omitirse. Usar si hay checkout multi-step |

---

### 📱 COMPATIBILIDAD

#### **search** (GA4 Estándar - Reutilizado)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `search` |
| **Descripción** | Usuario busca si su dispositivo es compatible |
| **Se Dispara** | User types + results appear |
| **Elemento** | Device search input |
| **Parámetros** | `page_path`, `section`, `search_type`, `search_query`, `search_results_count` |
| **Tipos Parámetro** | string, string, string, string, number |
| **Ejemplo** | `section="compatibility"`, `search_type="device"`, `search_query="iphone 15 pro"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ Search |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Reutilizar el evento search. Diferenciar con parámetro search_type |

---

#### **view_item** (GA4 Personalizado - Dispositivo)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `view_item` |
| **Descripción** | Usuario ve resultado de compatibilidad de un dispositivo |
| **Se Dispara** | Click en resultado o auto-open |
| **Elemento** | Device result card |
| **Parámetros** | `page_path`, `section`, `device_model`, `device_manufacturer`, `is_compatible`, `compatibility_source` |
| **Tipos Parámetro** | string, string, string, string, boolean, string |
| **Ejemplo** | `device_model="iPhone 15 Pro"`, `device_manufacturer="Apple"`, `is_compatible=true` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ ViewContent |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Se dispara cuando se ve el resultado (compatible o no compatible) |

---

#### **add_to_cart** (GA4 Estándar - Personalizado)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `add_to_cart` |
| **Descripción** | Usuario hace click en "Comprar eSIM" desde compatibilidad confirmada |
| **Se Dispara** | Click en botón "Comprar eSIM" (resultado compatible) |
| **Elemento** | CTA button en result card |
| **Parámetros** | `page_path`, `section`, `device_model`, `is_compatible`, `value`, `currency`, `items` |
| **Tipos Parámetro** | string, string, string, boolean, number, string, array |
| **Ejemplo** | `section="compatibility"`, `device_model="iPhone 15 Pro"`, `is_compatible=true` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ AddToCart |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Similar a begin_checkout pero desde otro contexto (device finder) |

---

#### **contact_us** (GA4 Personalizado)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `contact_us` |
| **Descripción** | Usuario hace click en "Consultar por WhatsApp" (dispositivo no compatible) |
| **Se Dispara** | Click en botón contacto desde resultado no compatible |
| **Elemento** | Contact CTA button |
| **Parámetros** | `page_path`, `section`, `device_model`, `is_compatible`, `contact_method`, `contact_location` |
| **Tipos Parámetro** | string, string, string, boolean, string, string |
| **Ejemplo** | `device_model="Xiaomi"`, `is_compatible=false`, `contact_method="whatsapp"`, `contact_location="device_finder"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ Contact |
| **Conversión GA4** | ⚠️ Opcional (marcar si es conversión relevante) |
| **Prioridad** | 🟡 Media |
| **Notas** | Rastrear intentos de contacto desde no compatible. Importante para support planning |

---

### ❓ FAQ

#### **select_item** (GA4 Personalizado - Accordion)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `select_item` |
| **Descripción** | Usuario abre una pregunta del FAQ |
| **Se Dispara** | Click en accordion title |
| **Elemento** | FAQ accordion button |
| **Parámetros** | `page_path`, `section`, `element_id`, `element_text`, `faq_index`, `faq_key` |
| **Tipos Parámetro** | string, string, string, string, number, string |
| **Ejemplo** | `element_text="¿Qué es una eSIM?"`, `faq_index=2`, `faq_key="what_is_esim"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ❌ No |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Usar select_item reutilizando nomenclatura. Diferencia con section=faq |

---

#### **page_view** (GA4 - Deep Link)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `page_view` |
| **Descripción** | Usuario accede directamente a una pregunta via hash (#faq-item) |
| **Se Dispara** | Page load con #faq-ITEM_KEY |
| **Elemento** | Page (global) |
| **Parámetros** | `page_path`, `page_title`, `faq_deep_link`, `faq_key` |
| **Tipos Parámetro** | string, string, boolean, string |
| **Ejemplo** | `faq_deep_link=true`, `faq_key="what_is_esim"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ ViewContent |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Adicionar parámetros al page_view estándar cuando hay deep link |

---

### 📞 CONTACTO / FOOTER

#### **contact_us** (GA4 Estándar)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `contact_us` |
| **Descripción** | Usuario hace click en WhatsApp, Email o Teléfono |
| **Se Dispara** | Click en link/botón de contacto |
| **Elemento** | Contact card / Link |
| **Parámetros** | `page_path`, `section`, `contact_method`, `contact_location`, `destination_url` |
| **Tipos Parámetro** | string, string, string, string, string |
| **Ejemplo** | `section="contact"`, `contact_method="whatsapp"`, `destination_url="https://wa.me/..."` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ Contact |
| **Conversión GA4** | ⚠️ Opcional |
| **Prioridad** | 🟡 Media |
| **Notas** | Centralizar aquí todos los contactos (contacto, footer, FAQ, compatibilidad) |

---

#### **select_item** (GA4 - Social Links)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `select_item` |
| **Descripción** | Usuario hace click en red social (Instagram, LinkedIn, Twitter, TikTok) |
| **Se Dispara** | Click en social icon |
| **Elemento** | Social link |
| **Parámetros** | `page_path`, `section`, `element_text`, `destination_url`, `social_platform` |
| **Tipos Parámetro** | string, string, string, string, string |
| **Ejemplo** | `section="footer"`, `element_text="Instagram"`, `social_platform="instagram"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ (si es relevante) |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟢 Baja |
| **Notas** | Parámetro social_platform diferencia entre plataformas |

---

#### **select_item** (GA4 - Legal Links)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `select_item` |
| **Descripción** | Usuario hace click en Privacidad, Términos, Cookies |
| **Se Dispara** | Click en link legal |
| **Elemento** | Footer legal link |
| **Parámetros** | `page_path`, `section`, `element_text`, `element_id`, `destination_url` |
| **Tipos Parámetro** | string, string, string, string, string |
| **Ejemplo** | `section="footer"`, `element_text="Política de Privacidad"`, `element_id="link-privacy"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ❌ No |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟢 Baja |
| **Notas** | Rastrear para compliance (quién accede a privacidad, términos, etc) |

---

### 💰 CHECKOUT / PURCHASE

#### **add_payment_info** (GA4 Estándar)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `add_payment_info` |
| **Descripción** | Usuario completa formulario de pago y está listo para comprar |
| **Se Dispara** | Click en "Completar compra" / "Pagar" |
| **Elemento** | Checkout form submit button |
| **Parámetros** | `page_path`, `value`, `currency`, `payment_type`, `items` (array) |
| **Tipos Parámetro** | string, number, string, string, array |
| **Ejemplo** | `value=29.99`, `currency="USD"`, `payment_type="credit_card"` |
| **GA4** | ✅ Sí (CONVERSIÓN) |
| **Meta Pixel** | ✅ AddPaymentInfo |
| **Conversión GA4** | ✅ **SÍ** |
| **Prioridad** | 🔴 **CRÍTICA** |
| **Notas** | Se dispara cuando usuario confirma y payment provider toma el control |

---

#### **purchase** (GA4 Estándar) ⭐ MÁXIMA PRIORIDAD
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `purchase` |
| **Descripción** | Compra completada exitosamente |
| **Se Dispara** | Página de confirmación / webhook success |
| **Elemento** | Confirmation page (server-side event) |
| **Parámetros** | `page_path`, `transaction_id`, `value`, `currency`, `tax`, `shipping`, `items` (array), `coupon` |
| **Tipos Parámetro** | string, string, number, string, number, number, array, string |
| **Ejemplo** | `transaction_id="TXN123"`, `value=29.99`, `currency="USD"`, `items=[{item_id, item_name, price, quantity}]` |
| **GA4** | ✅ Sí (CONVERSIÓN PRINCIPAL) |
| **Meta Pixel** | ✅ Purchase (CRITICAL) |
| **Conversión GA4** | ✅ **SÍ** (Marked as conversion) |
| **Prioridad** | 🔴 **CRÍTICA** |
| **Notas** | **EVENTO MÁS IMPORTANTE.** Debe ser server-side (webhook de Stripe) + client-side. Never duplicate. Validar transaction_id único |

---

#### **view_item** (GA4 - Order Confirmation)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `view_item` |
| **Descripción** | Usuario ve la página de confirmación de compra |
| **Se Dispara** | Página /confirmacion carga |
| **Elemento** | Confirmation page container |
| **Parámetros** | `page_path`, `page_title`, `transaction_id`, `value`, `currency` |
| **Tipos Parámetro** | string, string, string, number, string |
| **Ejemplo** | `page_path="/es/confirmacion"`, `page_title="Compra Confirmada"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ✅ ViewContent |
| **Conversión GA4** | ❌ No (purchase es el conversion) |
| **Prioridad** | 🟡 Media |
| **Notas** | Rastrear visualización de confirmación como complemento a purchase |

---

#### **exception** (GA4 Personalizado - Errores)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `exception` |
| **Descripción** | Error de validación o pago rechazado |
| **Se Dispara** | User interactúa con campo inválido o pago falla |
| **Elemento** | Form field / Error message |
| **Parámetros** | `page_path`, `section`, `exception_type`, `exception_description`, `is_fatal` |
| **Tipos Parámetro** | string, string, string, string, boolean |
| **Ejemplo** | `section="checkout"`, `exception_type="validation_error"`, `exception_description="Email inválido"`, `is_fatal=false` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ❌ No |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟡 Media |
| **Notas** | Importante para QA. Rastrear errores comunes de validación |

---

#### **set_checkout_option** (GA4 Personalizado)
| Atributo | Valor |
|----------|-------|
| **Nombre Evento** | `set_checkout_option` |
| **Descripción** | Usuario elige/cambia opción en checkout (pais, idioma, método de pago) |
| **Se Dispara** | Change event en select/radio |
| **Elemento** | Form control (select, radio, checkbox) |
| **Parámetros** | `page_path`, `section`, `checkout_option`, `checkout_option_value` |
| **Tipos Parámetro** | string, string, string, string |
| **Ejemplo** | `checkout_option="country"`, `checkout_option_value="AR"` |
| **GA4** | ✅ Sí |
| **Meta Pixel** | ❌ No |
| **Conversión GA4** | ❌ No |
| **Prioridad** | 🟢 Baja |
| **Notas** | Rastrear cambios de opciones en checkout (país, pais de entrega, etc) |

---

## 📊 MATRIZ DE EVENTOS POR PÁGINA/SECCIÓN

### HOME
| Evento | GA4 | Meta | Conversión | Prioridad |
|--------|-----|------|-----------|-----------|
| `page_view` | ✅ | ✅ | ❌ | 🔴 |
| `scroll` | ✅ | ❌ | ❌ | 🟡 |
| `view_item_list` | ✅ | ✅ | ❌ | 🔴 |
| `select_item` (nav) | ✅ | ❌ | ❌ | 🔴 |
| `select_promotion` (CTA) | ✅ | ✅ | ⚠️ | 🔴 |
| `search` | ✅ | ✅ | ❌ | 🟡 |
| `view_search_results` | ✅ | ✅ | ❌ | 🟡 |
| `contact_us` | ✅ | ✅ | ⚠️ | 🟡 |

### PLANES
| Evento | GA4 | Meta | Conversión | Prioridad |
|--------|-----|------|-----------|-----------|
| `view_item_list` | ✅ | ✅ | ❌ | 🔴 |
| `view_item` | ✅ | ✅ | ❌ | 🔴 |
| `begin_checkout` ⭐ | ✅ | ✅ | ✅ | 🔴 |
| `view_cart` | ✅ | ✅ | ❌ | 🟡 |

### COMPATIBILIDAD
| Evento | GA4 | Meta | Conversión | Prioridad |
|--------|-----|------|-----------|-----------|
| `search` | ✅ | ✅ | ❌ | 🟡 |
| `view_search_results` | ✅ | ✅ | ❌ | 🟡 |
| `view_item` | ✅ | ✅ | ❌ | 🟡 |
| `add_to_cart` | ✅ | ✅ | ❌ | 🟡 |
| `contact_us` | ✅ | ✅ | ⚠️ | 🟡 |

### FAQ
| Evento | GA4 | Meta | Conversión | Prioridad |
|--------|-----|------|-----------|-----------|
| `select_item` | ✅ | ❌ | ❌ | 🟡 |
| `page_view` (deep link) | ✅ | ✅ | ❌ | 🟡 |

### FOOTER / CONTACTO
| Evento | GA4 | Meta | Conversión | Prioridad |
|--------|-----|------|-----------|-----------|
| `contact_us` | ✅ | ✅ | ⚠️ | 🟡 |
| `select_item` (social) | ✅ | ✅ | ❌ | 🟢 |
| `select_item` (legal) | ✅ | ❌ | ❌ | 🟢 |

### CHECKOUT
| Evento | GA4 | Meta | Conversión | Prioridad |
|--------|-----|------|-----------|-----------|
| `add_payment_info` | ✅ | ✅ | ✅ | 🔴 |
| `purchase` ⭐ | ✅ | ✅ | ✅ | 🔴 |
| `view_item` (confirmation) | ✅ | ✅ | ❌ | 🟡 |
| `exception` (errors) | ✅ | ❌ | ❌ | 🟡 |
| `set_checkout_option` | ✅ | ❌ | ❌ | 🟢 |

---

## 🎯 EVENTOS CRÍTICOS (NO DUPLICAR NUNCA)

### Nivel 1: MÁXIMA PRIORIDAD
1. **`purchase`** ⭐ - Conversion principal
2. **`begin_checkout`** ⭐ - Plan selection (UN SOLO EVENTO)
3. **`page_view`** - Carga de página

### Nivel 2: MUY IMPORTANTE
4. **`add_payment_info`** - User listo para pagar
5. **`view_item_list`** - Ver planes
6. **`view_item`** - Ver plan individual
7. **`contact_us`** - Cualquier tipo de contacto

### Regla de Oro
**NUNCA disparar el mismo evento 2+ veces simultáneamente.**

Ejemplo de lo que NUNCA debe ocurrir:
```
❌ INCORRECTO:
begin_checkout()  // Custom
trackSelectPlan() // GA4
trackAddToCart()  // Meta
// 3 eventos simultáneamente = DEDUPLICACIÓN

✅ CORRECTO:
trackEvent({
  event: 'begin_checkout',
  params: {...}
})
// Dentro de la función se envía a GA4 + Meta
```

---

## 📋 MATRIZ DE VALIDACIÓN

### Checklist Pre-Implementación

- [ ] Todos los eventos están en esta tabla
- [ ] No hay duplicación de eventos
- [ ] Parámetros están documentados
- [ ] Ejemplos de valores son realistas
- [ ] GA4 y Meta asignados correctamente
- [ ] Conversiones marcadas solo en events correctos
- [ ] Nomenclatura sigue estándares GA4
- [ ] Parámetros compartidos son reutilizados
- [ ] No hay PII en parámetros
- [ ] Se define elemento HTML (element_id, element_type)
- [ ] Se especifica cuándo se dispara (on click, on load, etc)

---

## 🔐 REGLAS DE PRIVACIDAD Y SEGURIDAD

### ✅ PERMITIDO
- `page_path`, `page_title` (URLs públicas)
- `plan_name`, `plan_id`, `price_usd` (datos de producto)
- `device_model`, `device_manufacturer` (genérico)
- `language`, `country` (genérico)
- `session_id`, `user_id` (hash anónimo)
- `timestamp` (hora en UTC)

### ❌ PROHIBIDO (NUNCA TRACKEAR)
- Nombres/apellidos del usuario
- Email / teléfono personal
- IP address
- Número de tarjeta de crédito
- Contraseñas
- Información de contacto personalizada
- Device UDID / IMEI
- Datos sensibles personales

### ⚠️ ZONA GRIS (Preguntar a Legal)
- País del usuario (usar solo si es genérico)
- Dispositivo específico del usuario (usar `device_model` genérico, no IMEI)
- Identificador externo del usuario (debe ser hash anónimo)

---

## 📌 NOTAS DE IMPLEMENTACIÓN

### Orden de Implementación Recomendado

**FASE 1 (Week 1-2) - CRÍTICA**
1. `page_view` (automático, base de todo)
2. `begin_checkout` (plan selection, un solo evento)
3. `purchase` (conversion principal)
4. `add_payment_info` (pre-conversion)

**FASE 2 (Week 3-4) - ALTA**
5. `view_item_list`, `view_item` (plans)
6. `select_item` (navigation)
7. `search`, `view_search_results` (búsqueda)
8. `contact_us` (contacto)

**FASE 3 (Week 5-6) - MEDIA**
9. `scroll`, `view_cart` (engagement)
10. `view_search_results`, `exception` (errors)

**FASE 4 (Week 7+) - BAJA**
11. `set_checkout_option` (opciones)
12. Social links, legal links (baja prioridad)

### Testing Strategy

Para cada evento:
1. Verificar en GA4 Real Time (aparece en 10s)
2. Verificar parámetros son correctos
3. Verificar en Meta Events Manager
4. Verificar no hay duplicación de eventos
5. Verificar no hay eventos fantasma

---

## 📞 PREGUNTAS / ACLARACIONES

| Pregunta | Respuesta | Responsable |
|----------|-----------|-------------|
| ¿Quién define qué es "conversión"? | Analytics Lead + Product | Analytics |
| ¿Deduplicar eventos por session_id? | Sí, usar UUID de sesión | Engineering |
| ¿Rastrear eventos offline (SMS, push)? | Fuera de scope de este plan | Product |
| ¿Sincronizar con CRM? | Fuera de scope (usar Segment si existe) | Growth |
| ¿Timezone UTC o local? | UTC siempre | Engineering |
| ¿Qué hacer con eventos antiguos? | Migration plan separado | Data |

---

## ✅ SIGN-OFF

**Tracking Plan Status:** DRAFT  
**Fecha Creación:** 30 de Julio, 2026  
**Última Revisión:** (Pendiente validación del team)  
**Próximo Review:** Post-implementación Phase 1

**Aprobaciones Requeridas:**
- [ ] Analytics Lead
- [ ] Product Manager
- [ ] Engineering Lead
- [ ] Legal (si requiere revisión de privacidad)
- [ ] Data/Analytics Engineer

---

**Este documento es la fuente de verdad para toda la instrumentación analítica de esimruta34.com.**  
**No implementes nada que no esté en esta tabla.**  
**Cualquier cambio debe documentarse y aprobarse aquí primero.**

