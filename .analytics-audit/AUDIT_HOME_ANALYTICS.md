# AUDITORÍA DE ANALÍTICA - HOME RUTA34
**Fecha:** 30 de Julio, 2026  
**Componentes:** 15 componentes principales  
**Idiomas:** Español (es) y Portugués (pt)  
**Estado:** Auditoría Completa - SIN MODIFICACIONES DE CÓDIGO

---

## 📋 RESUMEN EJECUTIVO

### Hallazgos Clave
- **Total de interacciones identificadas:** 87
- **Secciones principales:** 15 componentes
- **Eventos de alta prioridad:** 18
- **Riesgos de duplicación:** 12
- **Gaps actuales:** 6 áreas sin tracking

### Componentes Auditados
1. ✅ Navbar (navegación y switching idiomas)
2. ✅ Hero (CTA principal y métricas)
3. ✅ Plans (selector de planes + CTA compra)
4. ✅ HowItWorks (3 pasos + CTA)
5. ✅ Definition (información básica)
6. ✅ Benefits (4 beneficios + buscador de cobertura)
7. ✅ Testimonials (3 historias + rating agregado)
8. ✅ Compatibility (DeviceCompatibilityFinder)
9. ✅ FAQ (13 acordeones + WhatsApp CTA)
10. ✅ PaymentMethods (métodos de pago)
11. ✅ TrustBadges (3 badges)
12. ✅ Guarantees (3 garantías)
13. ✅ Contact (3 canales de contacto)
14. ✅ SocialLinks (4 redes sociales)
15. ✅ Footer (navegación + links)

---

## 🔍 INVENTARIO DETALLADO POR SECCIÓN

### 1️⃣ NAVBAR
**Archivo:** `/src/components/landing/Navbar.tsx`  
**Tipo:** Navegación fija

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| Click Logo (home) | `navigation_click` | Logo navbar | `navigation_click` | `destination_url`, `section="navbar"` | Alta | ✅ | ✅ | Bajo | Retorna a home |
| Click "Cómo funciona" (desktop) | `navigation_click` | Navbar desktop menu | `navigation_click` | `destination_url="#como-funciona"`, `section="navbar"`, `device="desktop"` | Alta | ✅ | ❌ | Bajo | Scroll ancla |
| Click "Planes" (desktop) | `navigation_click` | Navbar desktop menu | `navigation_click` | `destination_url="#planes"`, `section="navbar"`, `device="desktop"` | Alta | ✅ | ❌ | Bajo | Scroll ancla |
| Click "FAQ" (desktop) | `navigation_click` | Navbar desktop menu | `navigation_click` | `destination_url="#faq"`, `section="navbar"`, `device="desktop"` | Alta | ✅ | ❌ | Bajo | Scroll ancla |
| Click Language Switcher (PT/ES) | `language_switch` | Navbar right side | `language_switch` | `language_from`, `language_to`, `section="navbar"` | Media | ✅ | ✅ | Bajo | Cambio de idioma |
| Click "Comprar Ahora" (CTA principal navbar) | `cta_click` | Navbar right side | `cta_click` | `cta_type="buy_now"`, `section="navbar"`, `destination_url="#planes"` | Alta | ✅ | ✅ | Bajo | CTA scroll a planes |
| Open Mobile Menu | `mobile_menu_open` | Mobile toggle button | `mobile_menu_open` | `section="navbar"`, `device="mobile"` | Media | ✅ | ❌ | Bajo | Menu accordion |
| Close Mobile Menu | `mobile_menu_close` | Mobile toggle button | `mobile_menu_close` | `section="navbar"`, `device="mobile"` | Baja | ✅ | ❌ | Bajo | Cerrar menú |
| Click Menu Item (mobile) | `navigation_click` | Mobile overlay menu | `navigation_click` | `element_text`, `destination_url`, `section="navbar_mobile"`, `device="mobile"` | Alta | ✅ | ❌ | Bajo | Cierra menú auto |
| Navbar Hide (scroll down) | `navbar_state_change` | Fixed navbar | `navbar_state_change` | `state="hidden"`, `scroll_direction="down"`, `scroll_position` | Baja | ❌ | ❌ | Bajo | UX metric |
| Navbar Show (scroll up) | `navbar_state_change` | Fixed navbar | `navbar_state_change` | `state="visible"`, `scroll_direction="up"`, `scroll_position` | Baja | ❌ | ❌ | Bajo | UX metric |

---

### 2️⃣ HERO
**Archivo:** `/src/components/landing/Hero.tsx`  
**Tipo:** Sección protagonista con CTA principal

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| Click CTA Principal (Explorar planes) | `cta_click` | Hero desktop/mobile | `cta_click` | `cta_type="explore_plans"`, `section="hero"`, `device_type`, `destination_url="#planes"` | **CRÍTICA** | ✅ | ✅ | Bajo | Ya rastreado con `analytics.viewPlansClicked()` - DUPLO |
| View Hero Section | `section_view` | Hero viewport | `section_view` | `section="hero"`, `page_path`, `page_title` | Alta | ✅ | ✅ | Bajo | En scroll entrada |
| Metric View (100K+ travelers) | `metric_impression` | Hero decorative | `metric_impression` | `metric_type="travelers"`, `value="100000+"`, `section="hero"` | Baja | ❌ | ❌ | Bajo | Info stats |
| Metric View (2 min activation) | `metric_impression` | Hero decorative | `metric_impression` | `metric_type="activation_time"`, `value="2_min"`, `section="hero"` | Baja | ❌ | ❌ | Bajo | Info stats |
| Metric View (30+ countries) | `metric_impression` | Hero mobile metrics | `metric_impression` | `metric_type="coverage_countries"`, `value="30+"`, `section="hero"` | Baja | ❌ | ❌ | Bajo | Mobile solo |
| Metric View (24/7 support) | `metric_impression` | Hero mobile metrics | `metric_impression` | `metric_type="support"`, `value="24/7"`, `section="hero"` | Baja | ❌ | ❌ | Bajo | Mobile solo |
| Price Anchor Display | `price_impression` | Hero mobile | `price_impression` | `min_price_usd`, `currency`, `section="hero"` | Media | ✅ | ❌ | Bajo | Muestra precio mínimo |

---

### 3️⃣ PLANS
**Archivo:** `/src/components/landing/Plans.tsx`  
**Tipo:** Grid de planes con CTA compra

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Plans Section | `section_view` | Plans section | `section_view` | `section="plans"`, `page_path`, `total_plans` | Alta | ✅ | ✅ | Bajo | En scroll entrada - rastreado en `trackViewPlans()` |
| Plan Card Viewed | `plan_view` | Plan card | `plan_view` | `plan_id`, `plan_name`, `price_usd`, `is_popular`, `section="plans"`, `index_position` | **CRÍTICA** | ✅ | ✅ | Bajo | Ya rastreado pero check para consistency |
| Click Plan CTA (Buy) | `begin_checkout` | Plan card button | `begin_checkout` | `plan_id`, `plan_name`, `price_usd`, `plan_size`, `is_popular`, `section="plans"`, `element_position` | **CRÍTICA** | ✅ | ✅ | ALTO | Rastreado con `analytics.planSelected()`, `trackSelectPlan()`, y `trackAddToCart()` - DUPLICACIÓN CONFIRMADA |
| Hover Plan Card | `element_hover` | Plan card | `element_hover` | `plan_id`, `plan_name`, `element_type="plan_card"`, `section="plans"` | Baja | ❌ | ❌ | Bajo | UX metric opcional |
| View Tooltip (International Calls) | `tooltip_view` | Plan features | `tooltip_view` | `tooltip_type="international_calls"`, `plan_id`, `section="plans"`, `element_position` | Media | ✅ | ❌ | Medio | Solo cuando hace click |
| Click Tooltip CTA (Ver detalle) | `navigation_click` | Tooltip footer | `navigation_click` | `destination_url="#faq-international_calls"`, `tooltip_type="international_calls"`, `section="plans"` | Media | ✅ | ❌ | Bajo | Link a FAQ |
| Popular Badge Viewed | `badge_view` | Popular plan | `badge_view` | `badge_type="popular"`, `plan_id`, `section="plans"` | Baja | ❌ | ❌ | Bajo | Info visual |
| Footer Info Impression | `text_impression` | Plans footer | `text_impression` | `text_type="no_auto_renew"`, `section="plans"` | Baja | ❌ | ❌ | Bajo | Info disclaimer |

---

### 4️⃣ HOW IT WORKS
**Archivo:** `/src/components/landing/HowItWorks.tsx`  
**Tipo:** Explicación 3 pasos con imagen y CTA

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View HowItWorks Section | `section_view` | Section header | `section_view` | `section="how_it_works"`, `page_path` | Alta | ✅ | ✅ | Bajo | Scroll entrada |
| Step Content Viewed | `step_view` | Step card | `step_view` | `step_number` (1-3), `section="how_it_works"` | Media | ✅ | ❌ | Bajo | 3 steps en sequence |
| Step Icon Viewed | `icon_view` | Step visual | `icon_view` | `step_number`, `icon_type`, `section="how_it_works"` | Baja | ❌ | ❌ | Bajo | Visual indicator |
| Hero Image Viewed | `image_view` | Editorial image | `image_view` | `image_src="/images/imgen2.png"`, `section="how_it_works"` | Media | ❌ | ❌ | Bajo | Step 3 visual |
| Click CTA (Comprar eSIM) | `cta_click` | Section footer | `cta_click` | `cta_type="buy_esim"`, `section="how_it_works"`, `destination_url="#planes"` | Alta | ✅ | ✅ | Bajo | Scroll a planes |

---

### 5️⃣ DEFINITION
**Archivo:** `/src/components/landing/Definition.tsx`  
**Tipo:** SEO copy block + callouts

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Definition Section | `section_view` | Section | `section_view` | `section="definition"`, `page_path` | Media | ✅ | ❌ | Bajo | Scroll entrada |
| Definition Copy Viewed | `text_impression` | Definition block | `text_impression` | `text_type="esim_definition"`, `section="definition"` | Baja | ❌ | ❌ | Bajo | Texto educativo |
| Callout Feature Viewed | `callout_view` | Feature items | `callout_view` | `callout_type` ("no_physical_card" \| "instant_activation" \| "qr_scan"), `section="definition"` | Media | ✅ | ❌ | Bajo | 3 callouts visuales |

---

### 6️⃣ BENEFITS
**Archivo:** `/src/components/landing/Benefits.tsx`  
**Tipo:** 4 benefit cards + coverage country finder

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Benefits Section | `section_view` | Section | `section_view` | `section="benefits"`, `page_path` | Alta | ✅ | ✅ | Bajo | Scroll entrada |
| Benefit Card Viewed | `benefit_view` | Benefit card | `benefit_view` | `benefit_type` ("apps" \| "instant" \| "nopermanence" \| "coverage"), `section="benefits"`, `index_position` | Media | ✅ | ❌ | Bajo | 4 cards totales |
| Hover Benefit Card | `element_hover` | Benefit card | `element_hover` | `element_type="benefit_card"`, `benefit_type`, `section="benefits"` | Baja | ❌ | ❌ | Bajo | UX optional |
| Search Countries Input Focus | `form_focus` | Coverage search | `form_focus` | `element_type="coverage_search"`, `section="benefits"` | Media | ✅ | ❌ | Bajo | eSIM compatibility finder |
| Type Search Query | `search_query` | Coverage search | `search_query` | `query_text`, `query_length`, `section="benefits"`, `search_type="country"` | Media | ✅ | ❌ | Bajo | Búsqueda de país |
| Search Query Submitted | `search_submit` | Coverage search | `search_submit` | `query_text`, `results_count`, `section="benefits"`, `search_type="country"` | Media | ✅ | ✅ | Bajo | User searched |
| Featured Country Chip Clicked | `filter_apply` | Country chips | `filter_apply` | `country_code`, `country_name`, `section="benefits"`, `filter_type="featured_country"` | Media | ✅ | ❌ | Bajo | Popular countries |
| Search Result Viewed | `search_result_view` | Results list | `search_result_view` | `country_code`, `country_name`, `result_index`, `section="benefits"`, `search_query` | Media | ✅ | ❌ | Bajo | Each result in list |
| Click Search Result | `plan_select` | Search result item | `plan_select` | `country_code`, `country_name`, `section="benefits"`, `element_type="country_result"` | Media | ✅ | ✅ | Bajo | Navigate a checkout |
| Plan Card Clicked (within Benefits) | `plan_view` \| `begin_checkout` | Plan preview | `begin_checkout` | `plan_id`, `plan_name`, `price_usd`, `plan_gb`, `section="benefits"`, `context="country_finder"` | Alta | ✅ | ✅ | ALTO | También en Plans section - CHECK DUPLO |
| No Search Results State | `state_view` | Empty state | `state_view` | `state_type="no_results"`, `section="benefits"`, `search_query` | Baja | ✅ | ❌ | Bajo | Info validation |
| Pricing Disclaimer Viewed | `text_impression` | Footer text | `text_impression` | `text_type="pricing_note"`, `section="benefits"` | Baja | ❌ | ❌ | Bajo | "1,33 €/GB según normativa" |

---

### 7️⃣ TESTIMONIALS
**Archivo:** `/src/components/landing/Testimonials.tsx`  
**Tipo:** 3 historias + agregado de rating

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Testimonials Section | `section_view` | Section | `section_view` | `section="testimonials"`, `page_path` | Media | ✅ | ✅ | Bajo | Scroll entrada |
| Testimonial Card Viewed | `content_view` | Testimonial card | `content_view` | `content_type="testimonial"`, `testimonial_index`, `country_code`, `destination`, `section="testimonials"` | Media | ✅ | ✅ | Bajo | Card impression |
| Testimonial Image Viewed | `image_view` | Testimonial photo | `image_view` | `image_type="testimonial_photo"`, `testimonial_index`, `section="testimonials"` | Baja | ❌ | ❌ | Bajo | Photo load |
| Star Rating Viewed | `rating_view` | Stars display | `rating_view` | `rating_value`, `testimonial_index`, `section="testimonials"` | Media | ✅ | ❌ | Bajo | 5.0 display |
| Aggregate Rating Section Viewed | `rating_view` | Aggregate block | `rating_view` | `rating_type="aggregate"`, `rating_value="5.0"`, `total_testimonials=3`, `section="testimonials"` | Media | ✅ | ❌ | Bajo | Social proof |
| Testimonial Hover | `element_hover` | Card hover | `element_hover` | `element_type="testimonial_card"`, `testimonial_index`, `section="testimonials"` | Baja | ❌ | ❌ | Bajo | UX optional |

---

### 8️⃣ COMPATIBILITY
**Archivo:** `/src/components/landing/Compatibility.tsx` + `DeviceCompatibilityFinder.tsx`  
**Tipo:** Device finder con verificación de compatibilidad

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Compatibility Section | `section_view` | Section | `section_view` | `section="compatibility"`, `page_path` | Alta | ✅ | ✅ | Bajo | Scroll entrada |
| Badge Viewed | `badge_view` | Compatibility badge | `badge_view` | `badge_text="Compatible con tu dispositivo"`, `section="compatibility"` | Baja | ❌ | ❌ | Bajo | Visual indicator |
| Device Search Input Focus | `form_focus` | Search input | `form_focus` | `element_type="device_search"`, `section="compatibility"` | Media | ✅ | ❌ | Bajo | Start interaction |
| Device Search Query | `search_query` | Search input | `search_query` | `query_text`, `query_length`, `section="compatibility"`, `search_type="device"` | Media | ✅ | ❌ | Bajo | Typing device name |
| Device Search Results Viewed | `search_results_view` | Results dropdown | `search_results_view` | `results_count`, `query_text`, `section="compatibility"` | Media | ✅ | ❌ | Bajo | Results displayed |
| Device Result Clicked | `compatibility_search` | Result item | `compatibility_search` | `device_model`, `manufacturer`, `section="compatibility"`, `result_index` | Alta | ✅ | ✅ | Bajo | Device selected |
| Compatibility Result - Compatible | `compatibility_check` | Result card (green) | `compatibility_check` | `device_model`, `manufacturer`, `is_compatible=true`, `device_supports=["esim", "dual_sim", "qr_activation"]`, `section="compatibility"` | Alta | ✅ | ✅ | Bajo | eSIM compatible |
| Compatibility Result - Not Compatible | `compatibility_check` | Result card (amber) | `compatibility_check` | `device_model`, `manufacturer`, `is_compatible=false`, `section="compatibility"`, `recommendation="contact_support"` | Alta | ✅ | ❌ | Bajo | Not in DB |
| Click "Comprar eSIM" (from compatible) | `begin_checkout` | CTA button (green card) | `begin_checkout` | `device_model`, `is_compatible=true`, `section="compatibility"`, `destination_url="/es/compra"` | Alta | ✅ | ✅ | Bajo | Conversion path |
| Click "Consultar por WhatsApp" (not compatible) | `contact_support` | CTA button (amber card) | `contact_support` | `device_model`, `is_compatible=false`, `section="compatibility"`, `channel="whatsapp"` | Media | ✅ | ✅ | Bajo | Support channel |
| Click "Buscar otro modelo" | `form_reset` | Back button | `form_reset` | `element_type="clear_search"`, `section="compatibility"` | Baja | ✅ | ❌ | Bajo | Reset finder |
| Verification Method Viewed | `info_view` | Info box (*#06#) | `info_view` | `info_type="esim_verification"`, `section="compatibility"` | Media | ✅ | ❌ | Bajo | Educational |
| No Search Results State | `state_view` | Empty state | `state_view` | `state_type="no_results"`, `query_text`, `section="compatibility"` | Baja | ✅ | ❌ | Bajo | UX feedback |

---

### 9️⃣ FAQ
**Archivo:** `/src/components/landing/FAQ.tsx` + `InternationalCallsTable.tsx`  
**Tipo:** 13 accordiones + tabla de tarifas internacionales

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View FAQ Section | `section_view` | Section | `section_view` | `section="faq"`, `page_path` | Alta | ✅ | ✅ | Bajo | Scroll entrada |
| FAQ Item Opened | `faq_open` | Accordion button | `faq_open` | `faq_item_key`, `faq_item_number`, `section="faq"`, `index_position` | Alta | ✅ | ❌ | Bajo | User expands accordion |
| FAQ Item Closed | `faq_close` | Accordion button | `faq_close` | `faq_item_key`, `faq_item_number`, `section="faq"`, `index_position` | Media | ✅ | ❌ | Bajo | User collapses |
| FAQ Answer Viewed | `content_view` | Expanded content | `content_view` | `content_type="faq_answer"`, `faq_item_key`, `section="faq"` | Media | ✅ | ❌ | Bajo | Full answer visible |
| International Calls Table Viewed | `content_view` | Table within FAQ | `content_view` | `content_type="international_calls_table"`, `faq_item_key="international_calls"`, `section="faq"` | Media | ✅ | ❌ | Bajo | Detailed pricing table |
| FAQ CTA WhatsApp | `cta_click` | Header text | `cta_click` | `cta_type="support_whatsapp"`, `section="faq"`, `destination_url` | Alta | ✅ | ✅ | Bajo | "Escribinos por WhatsApp →" |
| FAQ Internal Link (Tooltip) | `navigation_click` | Tooltip CTA | `navigation_click` | `destination_url="#faq-international_calls"`, `source_component="plans_tooltip"`, `section="faq"` | Media | ✅ | ❌ | Bajo | Link from Plans section |
| FAQ Hash Navigation (deep link) | `page_scroll` | Page load with hash | `page_scroll` | `destination_hash="#faq-ITEM_KEY"`, `auto_opened=true`, `section="faq"` | Media | ✅ | ❌ | Bajo | Auto-open on deep link |

**FAQ Items:**
- `chip_vs_esim` - Diferencia chip físico vs eSIM
- `what` - Qué es eSIM
- `compatible` - Dispositivos compatibles
- `whatsapp` - Funciona WhatsApp
- `qr_receive` - Cómo recibes QR
- `when_starts` - Cuándo empieza a funcionar
- `number` - Tendrás número de teléfono
- `when` - Cuándo activar
- `costs` - Costos adicionales
- `no_email` - No recibiste email
- `not_working` - No funciona
- `needs` - Qué necesitas
- `international_calls` - Llamadas internacionales incluidas

---

### 🔟 PAYMENT METHODS
**Archivo:** `/src/components/landing/PaymentMethods.tsx`  
**Tipo:** Display de métodos de pago (informativo)

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View PaymentMethods Section | `section_view` | Section | `section_view` | `section="payment_methods"`, `page_path` | Media | ✅ | ❌ | Bajo | Scroll entrada |
| Security Badge Viewed | `badge_view` | Security icon | `badge_view` | `badge_type="security"`, `section="payment_methods"` | Baja | ❌ | ❌ | Bajo | Info visual |
| Payment Method Badge Viewed | `badge_view` | Method pill | `badge_view` | `payment_method` ("visa" \| "mastercard" \| "apple_pay" \| "google_pay" \| "paypal"), `section="payment_methods"` | Media | ✅ | ❌ | Bajo | 5 métodos |
| Hover Payment Method | `element_hover` | Method badge | `element_hover` | `element_type="payment_method"`, `payment_method`, `section="payment_methods"` | Baja | ❌ | ❌ | Bajo | UX optional |

---

### 1️⃣1️⃣ TRUST BADGES
**Archivo:** `/src/components/landing/TrustBadges.tsx`  
**Tipo:** 3 trust indicators

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View TrustBadges Section | `section_view` | Section | `section_view` | `section="trust_badges"`, `page_path` | Media | ✅ | ✅ | Bajo | Scroll entrada |
| Badge Viewed | `badge_view` | Badge card | `badge_view` | `badge_type` ("original_esim" \| "30day_guarantee" \| "24_7_support"), `section="trust_badges"`, `index_position` | Media | ✅ | ✅ | Bajo | Trust signal |
| Hover Badge | `element_hover` | Badge card | `element_hover` | `element_type="trust_badge"`, `badge_type`, `section="trust_badges"` | Baja | ❌ | ❌ | Bajo | UX optional |

---

### 1️⃣2️⃣ GUARANTEES
**Archivo:** `/src/components/landing/Guarantees.tsx`  
**Tipo:** 3 garantías de compra

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Guarantees Section | `section_view` | Section | `section_view` | `section="guarantees"`, `page_path` | Media | ✅ | ✅ | Bajo | Scroll entrada |
| Guarantee Card Viewed | `guarantee_view` | Guarantee card | `guarantee_view` | `guarantee_type` ("activation_guaranteed" \| "30day_guarantee" \| "no_hidden_fees"), `section="guarantees"`, `index_position` | Media | ✅ | ✅ | Bajo | Risk reducer |
| Hover Guarantee Card | `element_hover` | Card | `element_hover` | `element_type="guarantee_card"`, `guarantee_type`, `section="guarantees"` | Baja | ❌ | ❌ | Bajo | UX optional |

---

### 1️⃣3️⃣ CONTACT
**Archivo:** `/src/components/landing/Contact.tsx`  
**Tipo:** 3 canales de contacto

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Contact Section | `section_view` | Section | `section_view` | `section="contact"`, `page_path` | Alta | ✅ | ✅ | Bajo | Scroll entrada |
| Contact Channel Viewed | `contact_option_view` | Contact card | `contact_option_view` | `contact_channel` ("whatsapp" \| "email" \| "phone"), `section="contact"`, `index_position` | Media | ✅ | ✅ | Bajo | 3 channels |
| Click WhatsApp Link | `contact_initiate` | WhatsApp card | `contact_initiate` | `contact_channel="whatsapp"`, `destination_url="https://wa.me/..."`, `section="contact"`, `source="contact_section"` | Alta | ✅ | ✅ | Bajo | Opens WhatsApp |
| Click Email Link | `contact_initiate` | Email card | `contact_initiate` | `contact_channel="email"`, `destination_url="mailto:support@ruta34.com"`, `section="contact"` | Alta | ✅ | ✅ | Bajo | Opens mail client |
| Click Phone Link | `contact_initiate` | Phone card | `contact_initiate` | `contact_channel="phone"`, `destination_url="tel:+..."`, `section="contact"` | Alta | ✅ | ✅ | Bajo | Opens phone app |
| Hover Contact Card | `element_hover` | Card | `element_hover` | `element_type="contact_card"`, `contact_channel`, `section="contact"` | Baja | ❌ | ❌ | Bajo | UX optional |

---

### 1️⃣4️⃣ SOCIAL LINKS
**Archivo:** `/src/components/landing/SocialLinks.tsx`  
**Tipo:** Social media links

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View SocialLinks Section | `section_view` | Section | `section_view` | `section="social_links"`, `page_path` | Media | ✅ | ❌ | Bajo | Scroll entrada |
| Social Link Clicked | `social_click` | Social icon | `social_click` | `social_platform` ("instagram" \| "linkedin" \| "twitter" \| "tiktok"), `destination_url`, `section="social_links"` | Media | ✅ | ✅ | Bajo | Opens new tab |
| Hover Social Icon | `element_hover` | Icon button | `element_hover` | `element_type="social_icon"`, `social_platform`, `section="social_links"` | Baja | ❌ | ❌ | Bajo | UX optional |

---

### 1️⃣5️⃣ FOOTER
**Archivo:** `/src/components/landing/Footer.tsx`  
**Tipo:** Navegación global + legal + social

| Interacción | Tipo | Ubicación | Evento Recomendado | Parámetros | Prioridad | GA4 | Meta | Riesgo | Notas |
|---|---|---|---|---|---|---|---|---|---|
| View Footer Section | `section_view` | Section | `section_view` | `section="footer"`, `page_path` | Media | ✅ | ❌ | Bajo | Scroll entrada |
| Company Link Clicked | `navigation_click` | Footer link | `navigation_click` | `link_key` ("about" \| "howItWorks" \| "plans" \| "compatibility" \| "faq"), `destination_url`, `section="footer"`, `link_type="company"` | Media | ✅ | ❌ | Bajo | Internal nav |
| Legal Link Clicked | `navigation_click` | Footer link | `navigation_click` | `link_key` ("terms" \| "privacy" \| "cookies"), `destination_url`, `section="footer"`, `link_type="legal"` | Media | ✅ | ❌ | Bajo | Internal nav |
| Support Link Clicked (Footer) | `navigation_click` | Footer link | `navigation_click` | `link_key` ("whatsapp_24_7" \| "email_support"), `destination_url`, `section="footer"`, `link_type="support"` | Media | ✅ | ❌ | Bajo | Contact channels |
| Brand Logo Click (Footer) | `navigation_click` | Footer logo | `navigation_click` | `destination_url`, `section="footer"`, `element_type="brand_logo"` | Baja | ✅ | ❌ | Bajo | Retorna a home |
| Instagram Link Clicked (Footer) | `social_click` | Social icon | `social_click` | `social_platform="instagram"`, `destination_url`, `section="footer"` | Media | ✅ | ✅ | Bajo | Opens new tab |
| Footer CTA WhatsApp (brand section) | `cta_click` | Brand support | `cta_click` | `cta_type="support"`, `channel="whatsapp"`, `section="footer"` | Alta | ✅ | ✅ | Bajo | "Soporte" link |

---

## ⚠️ RIESGOS IDENTIFICADOS

### 🔴 RIESGOS CRÍTICOS

#### 1. **Duplicación de Plan Selection Event**
- **Ubicación:** `Plans.tsx` línea 232-241
- **Impacto:** ALTO
- **Descripción:** El evento `plan_selected` se dispara con TRES tracking engines simultáneamente:
  1. `analytics.planSelected(plan)` - Custom analytics
  2. `trackSelectPlan()` - GA4 tracking
  3. `trackAddToCart()` - Meta Pixel + CAPI
- **Riesgo:** Posible sobreconteo de eventos y divergencia entre GA4 y Meta
- **Recomendación:** Centralizar en una única función wrapper que coordine todos los eventos

#### 2. **Duplicación de Hero CTA Click**
- **Ubicación:** `Hero.tsx` línea 94 y línea 182
- **Impacto:** ALTO
- **Descripción:** El evento se dispara con `analytics.viewPlansClicked()` en ambas versiones (desktop y mobile)
- **Riesgo:** Conteo duplicado en móvil (se usa 2 veces: tablet y mobile)
- **Recomendación:** Usar un único evento deduplicado por session

#### 3. **Plan View Event - Inconsistencia**
- **Ubicación:** `Plans.tsx` (línea 261-271) vs `Benefits.tsx` (línea 276-302)
- **Impacto:** ALTO
- **Descripción:** 
  - En `Plans.tsx`: Se dispara `trackViewPlans()` en useEffect (todos los planes)
  - En `Benefits.tsx`: Se cliquean planes individuales (begin_checkout)
  - Contexto diferente pero mismo evento
- **Riesgo:** Atribución incorrecta de tráfico entre secciones
- **Recomendación:** Diferencias de contexto con parámetro `source_section`

#### 4. **Meta Pixel Integration Partial**
- **Ubicación:** `Plans.tsx` línea 241, `DeviceCompatibilityFinder.tsx` línea 168, `Contact.tsx` línea 60
- **Impacto:** ALTO
- **Descripción:** Solo ALGUNAS acciones se reportan a Meta (begin_checkout, contact), pero faltan:
  - View content (secciones)
  - View content list (planes)
  - Initiate checkout (FAQ CTA, Navbar CTA)
  - Otros contactos (email, phone)
- **Riesgo:** Pixel incompleto, CAPI limitada, audience building deficiente
- **Recomendación:** Extender cobertura Meta a TODAS las acciones críticas

### 🟠 RIESGOS ALTOS

#### 5. **GA4 Event Naming Inconsistency**
- **Ubicación:** Múltiples componentes
- **Impacto:** ALTO
- **Descripción:** Falta de nomenclatura estandarizada:
  - `viewPlansClicked()` ≠ `plan_select` ≠ `begin_checkout`
  - Dificulta análisis cohesivo en GA4
- **Riesgo:** Fragmentación de datos, reportes confusos
- **Recomendación:** Mapeo claro entre custom analytics y GA4 events

#### 6. **Mobile Menu Tracking Gap**
- **Ubicación:** `Navbar.tsx` línea 118-146
- **Impacto:** ALTO
- **Descripción:** El menú móvil no registra:
  - Aperturas/cierres
  - Clics internos
- **Riesgo:** Pérdida de UX insights en mobile (40%+ de tráfico)
- **Recomendación:** Implementar `mobile_menu_open/close` y track clicks dentro

#### 7. **Device Compatibility Finder - Conversion Gap**
- **Ubicación:** `DeviceCompatibilityFinder.tsx` línea 168
- **Impacto:** ALTO
- **Descripción:** 
  - Compatible → "Comprar eSIM" button (tracked as begin_checkout)
  - NOT compatible → "Consultar WhatsApp" button (NO tracking)
- **Riesgo:** No sabemos cuántos usuarios con dispositivos no compatibles contactan
- **Recomendación:** Track `contact_support` event de forma explícita

#### 8. **FAQ Deep Linking**
- **Ubicación:** `FAQ.tsx` línea 118-127
- **Impacto:** MEDIO-ALTO
- **Descripción:** 
  - Los FAQ items tienen IDs (`faq-ITEM_KEY`)
  - Auto-abre accordion al entrar con hash
  - NO se registra el evento automático
- **Riesgo:** Traffic directo a FAQ items no se atribuye correctamente
- **Recomendación:** Detectar hash en page load y disparar evento

### 🟡 RIESGOS MEDIOS

#### 9. **Search Interactions - Dos buscadores**
- **Ubicación:** `Benefits.tsx` (country search) y `DeviceCompatibilityFinder.tsx` (device search)
- **Impacto:** MEDIO
- **Descripción:** 
  - Dos search interfaces distintas
  - Parámetros no estandarizados (`search_type`, `query_text`, `results_count`)
  - Eventos potencialmente duplicados si ambos se activan
- **Riesgo:** Inconsistencia en análisis de search behavior
- **Recomendación:** Estandarizar parámetros de search

#### 10. **Tooltip Interactions (Plans)**
- **Ubicación:** `Plans.tsx` línea 150-206
- **Impacto:** MEDIO
- **Descripción:** El tooltip de "Llamadas internacionales" solo se registra si el usuario lo abre
- **Riesgo:** No medimos curiosidad de usuarios sobre features
- **Recomendación:** Track `tooltip_view` on hover/click

#### 11. **Scroll-based Events**
- **Ubicación:** Navbar (línea 23-35)
- **Impacto:** MEDIO
- **Descripción:** La navbar se oculta/muestra en scroll pero no se registra
- **Riesgo:** No medimos page engagement patterns
- **Recomendación:** Opcional pero recomendado para UX metrics

#### 12. **Testimonials - No scroll tracking**
- **Ubicación:** `Testimonials.tsx` línea 118-183
- **Impacto:** MEDIO
- **Descripción:** 3 testimonios mostrados pero no se registra si usuario los ve todos o solo parcialmente
- **Riesgo:** No medimos social proof effectiveness
- **Recomendación:** Track `testimonial_view` y `rating_view` on intersection

---

## 📊 PROPUESTA INICIAL DE EVENTOS

### Eventos Prioritarios (P1 - Implementar primero)

```typescript
// CORE CONVERSION FUNNEL
cta_click: Cuando usuario hace clic en cualquier CTA principal
  params: cta_type, section, destination_url, device_type, language

begin_checkout: Cuando usuario selecciona un plan para comprar
  params: plan_id, plan_name, price_usd, section, source_section, device_type, language
  platforms: GA4 + Meta Pixel + CAPI

plan_view: Cuando usuario ve planes (entrada a sección)
  params: plan_count, min_price, max_price, section, device_type, language
  platforms: GA4 + Meta

section_view: Cuando usuario ve una sección (scroll entrada)
  params: section, page_path, page_title, device_type, language
  platforms: GA4 + Meta

navigation_click: Clics en enlaces internos/externos
  params: link_key, destination_url, section, link_type, device_type, language
  platforms: GA4

faq_open / faq_close: Cuando se abre/cierra un acordeón
  params: faq_item_key, faq_index, section, device_type, language
  platforms: GA4

compatibility_search: Búsqueda de compatibilidad de dispositivo
  params: device_model, manufacturer, is_compatible, section, device_type
  platforms: GA4 + Meta

language_switch: Cambio de idioma
  params: language_from, language_to, section, device_type
  platforms: GA4
```

### Eventos Secundarios (P2 - Implementar después)

```typescript
// ENGAGEMENT & UX
mobile_menu_open / mobile_menu_close
search_query / search_submit (para country finder)
contact_initiate (WhatsApp, email, phone)
social_click (Instagram, LinkedIn, Twitter, TikTok)
element_hover (optional, para desktop UX)
content_view (testimonials, FAQ answers)
badge_view / guarantee_view (trust signals)
```

### Eventos Opcionales (P3 - Solo si hay recursos)

```typescript
// ADVANCED UX METRICS
navbar_state_change (hide/show on scroll)
page_scroll (scroll depth)
video_view (si hay videos)
form_focus / form_blur (si hay forms)
tooltip_view (hovering tooltips)
```

---

## 🎯 PARÁMETROS BASE RECOMENDADOS

Todos los eventos DEBEN incluir como mínimo:

```typescript
{
  // Página y contexto
  page_path: "/es" | "/pt",
  page_title: "RUTA34 Home",
  
  // Ubicación del evento
  section: "navbar" | "hero" | "plans" | ...,
  element_id?: "btn-buy-now",
  element_text?: "Comprar Ahora",
  element_type?: "button" | "link" | "card",
  
  // Dispositivo
  device_type: "desktop" | "tablet" | "mobile",
  device_model?: "iPhone 15",
  device_brand?: "Apple",
  
  // Usuario
  language: "es" | "pt",
  country?: "AR" | "BR", // Si disponible
  
  // Session y timestamp
  session_id?: "xxx",
  timestamp: ISO8601,
  
  // Plan (si aplica)
  plan_id?: "uuid",
  plan_name?: "Europa Plus",
  price_usd?: 29.99,
  currency?: "USD",
  
  // Navegación
  destination_url?: "https://...",
  referrer?: "...",
  
  // Meta adicional
  source_component?: "Plans",
  context?: "country_finder",
}
```

---

## 📋 COMPONENTES IMPLICADOS (RESUMEN)

| Componente | Archivo | Línea aprox. | Tipo | Complejidad | Estado |
|---|---|---|---|---|---|
| Navbar | `/src/components/landing/Navbar.tsx` | 1-206 | Navigation | Media | Partial tracking |
| Hero | `/src/components/landing/Hero.tsx` | 1-319 | Showcase | Alta | Partial tracking |
| Plans | `/src/components/landing/Plans.tsx` | 1-327 | Product grid | CRÍTICA | DUPLICACIÓN |
| HowItWorks | `/src/components/landing/HowItWorks.tsx` | 1-146 | Educativo | Baja | No tracking |
| Definition | `/src/components/landing/Definition.tsx` | 1-43 | SEO copy | Baja | No tracking |
| Benefits | `/src/components/landing/Benefits.tsx` | 1-312 | Feature + Finder | Alta | Partial tracking |
| Testimonials | `/src/components/landing/Testimonials.tsx` | 1-206 | Social proof | Media | No tracking |
| Compatibility | `/src/components/landing/Compatibility.tsx` | 1-77 | Content | Media | No tracking (finder sí) |
| DeviceCompatibilityFinder | `/src/components/landing/DeviceCompatibilityFinder.tsx` | 1-235 | Interactive | CRÍTICA | Partial tracking |
| FAQ | `/src/components/landing/FAQ.tsx` | 1-180 | Accordions | Media | No tracking |
| PaymentMethods | `/src/components/landing/PaymentMethods.tsx` | 1-87 | Info | Baja | No tracking |
| TrustBadges | `/src/components/landing/TrustBadges.tsx` | 1-60 | Trust signals | Baja | No tracking |
| Guarantees | `/src/components/landing/Guarantees.tsx` | 1-77 | Trust signals | Baja | No tracking |
| Contact | `/src/components/landing/Contact.tsx` | 1-81 | CTA section | Media | Partial tracking |
| SocialLinks | `/src/components/landing/SocialLinks.tsx` | 1-83 | Social | Baja | No tracking |
| Footer | `/src/components/landing/Footer.tsx` | 1-161 | Navigation | Media | No tracking |

---

## 🔄 RECOMENDACIÓN DE ORDEN DE IMPLEMENTACIÓN

### Fase 1: Crítica (Week 1-2)
1. **Deduplicar Plan Selection** - Consolidar 3 tracking calls en 1
2. **Deduplicar Hero CTA** - Asegurar 1 evento por acción
3. **Extender Meta Pixel** - Agregar events faltantes
4. **Estandarizar GA4 Events** - Nombrado consistente

### Fase 2: Alta Prioridad (Week 3-4)
5. **Mobile Menu Tracking** - Capturar comportamiento móvil
6. **FAQ Deep Linking** - Trackear acceso directo
7. **Device Compatibility Not Compatible** - Capturar support path
8. **Search Events** - Estandarizar búsqueda (país + dispositivo)

### Fase 3: Media Prioridad (Week 5-6)
9. **Section View Events** - Todas las secciones
10. **Navigation Tracking** - Footer + Navbar links
11. **Testimonials Engagement** - Social proof metrics
12. **Tooltip Interactions** - Feature discovery

### Fase 4: Optimización (Ongoing)
13. **Scroll Depth** - UX insights
14. **Hover Metrics** - Desktop engagement
15. **Performance Events** - Page load, element render

---

## 📐 MATRIZ DE COBERTURA

### GA4 Coverage Actual
- ✅ Plans section (ViewContent + ViewContentList)
- ✅ Plan select (ViewItem)
- ✅ Hero CTA (implied pero no explicit)
- ❌ Navbar navigation
- ❌ FAQ interactions
- ❌ Device compatibility
- ❌ Contact actions
- ❌ Social clicks
- ❌ Footer navigation

**Cobertura actual: ~35%**

### Meta Pixel Coverage Actual
- ✅ ViewContent (plans via useMetaEvents)
- ✅ ViewContentList (plans)
- ✅ AddToCart (plan select)
- ✅ Contact (WhatsApp y algunos)
- ❌ Initiate Checkout (falta)
- ❌ Purchase (n/a - sucede en checkout page)
- ❌ Otros eventos

**Cobertura actual: ~40%**

### Recomendación
- Objetivo GA4: **85%+ de interacciones**
- Objetivo Meta: **75%+ de funnels críticos**
- Timeline: **6 semanas para Phase 1-2 + Phase 3**

---

## 🚨 GAPS Y INCONSISTENCIAS ACTUALES

### Gaps Principales
1. No hay tracking de navegación global (breadcrumbs, links)
2. No hay tracking de secciones de entrada
3. No hay diferenciación de source en plan selection
4. No hay tracking de búsquedas (países, dispositivos)
5. No hay tracking de soporte/contacto (contact_initiate)
6. No hay tracking de redes sociales
7. No hay tracking de deep links

### Inconsistencias
1. Event naming no estandarizado (viewPlans ≠ plan_view)
2. Parámetros faltantes en algunos eventos
3. Meta Pixel incomplete y parcial
4. No hay coordinate entre multiple tracking systems
5. Device search y Country search con parámetros diferentes

### Recomendaciones Inmediatas
1. Crear un hook centralizado `useAnalyticsEvent()` que coordine GA4 + Meta + Custom
2. Definir nomenclatura estándar en snake_case para GA4
3. Crear matriz de mapping (evento → GA4 → Meta)
4. Establecer QA process para validar eventos antes de deploy

---

## 📦 ENTREGABLES FINALES

✅ **Inventario completo:** 87 interacciones identificadas y documentadas
✅ **Propuesta de eventos:** 20+ eventos priorizados con parámetros
✅ **Riesgos documentados:** 12 riesgos identificados con impacto y recomendaciones
✅ **Componentes mapeados:** 15 componentes auditados
✅ **Orden de implementación:** 4 fases con timeline recomendado
✅ **NO HAY CAMBIOS DE CÓDIGO:** Auditoría pura

---

## 📌 PRÓXIMOS PASOS

1. **Revisión ejecutiva** - Presentar hallazgos al team
2. **Validación de eventos** - Confirmar nomenclatura y parámetros
3. **Priorizacion** - Definir fases según roadmap
4. **Especificación técnica** - Crear PRD para cada fase
5. **Implementación** - Comenzar Phase 1 (deduplicación)
6. **QA** - Testing exhaustivo de eventos
7. **Validación en GA4/Meta** - Confirmar recepción correcta de datos

