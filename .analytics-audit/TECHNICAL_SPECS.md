# ESPECIFICACIONES TÉCNICAS - AUDITORÍA ANALÍTICA HOME RUTA34

## 🏗️ ARQUITECTURA PROPUESTA

### 1. Hook Centralizado (Recomendado)

```typescript
// src/hooks/useAnalyticsEvent.ts
import { useCallback } from 'react';
import { analytics } from '@/lib/analytics';
import { trackEventGA4 } from '@/lib/analytics-ga4';
import { useMetaEvents } from '@/hooks/useMetaEvents';

interface AnalyticsEventParams {
  event: string;
  category?: string;
  section?: string;
  [key: string]: any;
}

export function useAnalyticsEvent() {
  const { trackAddToCart, trackViewContentList } = useMetaEvents();

  const trackEvent = useCallback((params: AnalyticsEventParams) => {
    const { event, ...rest } = params;

    // Enviar a todos los sistemas
    switch (event) {
      case 'begin_checkout':
        // GA4
        trackEventGA4('select_item', rest);
        // Meta
        trackAddToCart(rest);
        // Custom
        analytics.planSelected(rest);
        break;

      case 'plan_view':
        // GA4
        trackEventGA4('view_item', rest);
        // Meta
        trackViewContentList([rest]);
        break;

      case 'cta_click':
        // GA4 only (for now)
        trackEventGA4('select_promotion', rest);
        break;

      // ... more cases
    }
  }, [trackAddToCart, trackViewContentList]);

  return { trackEvent };
}
```

### 2. Enums para Event Names

```typescript
// src/lib/constants/events.ts
export enum AnalyticsEvent {
  // Core funnel
  SECTION_VIEW = 'section_view',
  PLAN_VIEW = 'plan_view',
  BEGIN_CHECKOUT = 'begin_checkout',
  
  // Navigation
  NAVIGATION_CLICK = 'navigation_click',
  LANGUAGE_SWITCH = 'language_switch',
  MOBILE_MENU_OPEN = 'mobile_menu_open',
  MOBILE_MENU_CLOSE = 'mobile_menu_close',
  
  // Content
  FAQ_OPEN = 'faq_open',
  FAQ_CLOSE = 'faq_close',
  CTA_CLICK = 'cta_click',
  
  // Search
  SEARCH_QUERY = 'search_query',
  SEARCH_SUBMIT = 'search_submit',
  COMPATIBILITY_SEARCH = 'compatibility_search',
  
  // Contact
  CONTACT_INITIATE = 'contact_initiate',
  
  // Social
  SOCIAL_CLICK = 'social_click',
}

export enum AnalyticsSection {
  NAVBAR = 'navbar',
  HERO = 'hero',
  PLANS = 'plans',
  HOW_IT_WORKS = 'how_it_works',
  BENEFITS = 'benefits',
  COMPATIBILITY = 'compatibility',
  FAQ = 'faq',
  CONTACT = 'contact',
  FOOTER = 'footer',
  // ...
}
```

---

## 🔴 FASE 1: DEDUPLICACIÓN Y META EXTENSION

### Task 1.1: Consolidate Plan Selection Event

**Archivo:** `src/components/landing/Plans.tsx`

**Cambio actual (Líneas 232-241):**
```typescript
onClick={() => {
  analytics.planSelected(plan);
  trackSelectPlan({
    id: plan.id,
    name: plan.name,
    price: plan.price_usd,
    size: plan.size,
  });
  trackAddToCart({ id: plan.id, name: plan.name, price_usd: plan.price_usd });
}}
```

**Problema:** 3 tracking calls simultáneamente → posible duplicación

**Solución propuesta:**
```typescript
import { useAnalyticsEvent } from '@/hooks/useAnalyticsEvent';

// Inside component
const { trackEvent } = useAnalyticsEvent();

onClick={() => {
  trackEvent({
    event: AnalyticsEvent.BEGIN_CHECKOUT,
    plan_id: plan.id,
    plan_name: plan.name,
    price_usd: plan.price_usd,
    plan_size: plan.size,
    section: AnalyticsSection.PLANS,
    is_popular: plan.is_popular,
    element_position: index,
  });
}}
```

**Inside useAnalyticsEvent hook:**
```typescript
case AnalyticsEvent.BEGIN_CHECKOUT:
  // GA4 (nueva nomenclatura)
  trackEventGA4('begin_checkout', {
    value: rest.price_usd,
    currency: 'USD',
    items: [{
      item_id: rest.plan_id,
      item_name: rest.plan_name,
      price: rest.price_usd,
      quantity: 1,
    }],
    ...rest,
  });
  
  // Meta Pixel (CAPI)
  trackAddToCart({
    id: rest.plan_id,
    name: rest.plan_name,
    price_usd: rest.price_usd,
  });
  
  // Legacy - remove gradually
  analytics.planSelected({ id: rest.plan_id });
  break;
```

---

### Task 1.2: Deduplicate Hero CTA

**Archivo:** `src/components/landing/Hero.tsx`

**Cambio actual (Líneas 94, 182):**
```typescript
onClick={() => analytics.viewPlansClicked()}
```

**Problema:** Se dispara 2 veces en mobile (tablet + mobile breakpoint)

**Solución propuesta:**
```typescript
// Add session tracking
import { useSessionId } from '@/hooks/useSessionId'; // crear este hook

export default function Hero({ minPrice }: { minPrice?: number }) {
  const sessionId = useSessionId();
  const lastTrackedRef = useRef<string | null>(null);

  const handleCtaClick = useCallback(() => {
    // Solo trackear si no se disparó en el mismo segundo
    const currentEvent = `${sessionId}-hero-cta`;
    if (lastTrackedRef.current !== currentEvent) {
      trackEvent({
        event: AnalyticsEvent.CTA_CLICK,
        cta_type: 'explore_plans',
        section: AnalyticsSection.HERO,
        destination_url: '#planes',
      });
      lastTrackedRef.current = currentEvent;
    }
  }, [sessionId]);

  return (
    // ... en ambos CTAs
    onClick={handleCtaClick}
  );
}
```

---

### Task 1.3: Extend Meta Pixel Coverage

**Archivo:** `src/hooks/useMetaEvents.ts`

**Eventos a agregar:**

```typescript
export function useMetaEvents() {
  // ... existing
  
  // Nuevos eventos
  const trackViewContent = useCallback((params: any) => {
    fbq('track', 'ViewContent', params);
  }, []);

  const trackContact = useCallback((params: any) => {
    fbq('track', 'Contact', params);
  }, []);

  const trackInitiateCheckout = useCallback((params: any) => {
    fbq('track', 'InitiateCheckout', params);
  }, []);

  const trackSearch = useCallback((params: any) => {
    fbq('track', 'Search', {
      search_string: params.query,
      ...params,
    });
  }, []);

  return {
    // ... existing
    trackViewContent,
    trackContact,
    trackInitiateCheckout,
    trackSearch,
  };
}
```

**Dónde aplicar:**
- Contact section: `trackContact()` en click de WhatsApp/Email
- FAQ section: `trackViewContent()` on view
- Device finder: `trackSearch()` on search submit
- Hero CTA: `trackInitiateCheckout()` on click

---

## 🟠 FASE 2: MOBILE + FAQ + CONTACT

### Task 2.1: Mobile Menu Tracking

**Archivo:** `src/components/landing/Navbar.tsx`

**Cambio requerido (Línea 118-146):**

```typescript
// Current
const [open, setOpen] = useState(false);

// Add tracking
const { trackEvent } = useAnalyticsEvent();

useEffect(() => {
  if (open) {
    trackEvent({
      event: AnalyticsEvent.MOBILE_MENU_OPEN,
      section: AnalyticsSection.NAVBAR,
      device: 'mobile',
    });
  } else if (open === false) {
    trackEvent({
      event: AnalyticsEvent.MOBILE_MENU_CLOSE,
      section: AnalyticsSection.NAVBAR,
      device: 'mobile',
    });
  }
}, [open, trackEvent]);

// En clicks de items del menú mobile
{navLinks.map((link, i) => (
  <motion.a
    key={link.href}
    href={link.href}
    onClick={() => {
      trackEvent({
        event: AnalyticsEvent.NAVIGATION_CLICK,
        element_text: link.label,
        destination_url: link.href,
        section: `${AnalyticsSection.NAVBAR}_mobile`,
        device: 'mobile',
      });
      setOpen(false);
    }}
  >
```

---

### Task 2.2: FAQ Tracking

**Archivo:** `src/components/landing/FAQ.tsx`

**Cambio requerido (Línea 130-132):**

```typescript
// Current
const toggle = (i: number) => {
  setOpenIndex(openIndex === i ? null : i);
};

// Add tracking
const { trackEvent } = useAnalyticsEvent();

const toggle = (i: number) => {
  const key = FAQ_KEYS[i];
  
  if (openIndex === i) {
    // Closing
    trackEvent({
      event: AnalyticsEvent.FAQ_CLOSE,
      faq_item_key: key,
      faq_item_number: i + 1,
      section: AnalyticsSection.FAQ,
    });
    setOpenIndex(null);
  } else {
    // Opening
    trackEvent({
      event: AnalyticsEvent.FAQ_OPEN,
      faq_item_key: key,
      faq_item_number: i + 1,
      section: AnalyticsSection.FAQ,
    });
    setOpenIndex(i);
  }
};
```

**Tracking de deep links (Línea 118-127):**

```typescript
// Current
useEffect(() => {
  const hash = window.location.hash;
  if (!hash.startsWith("#faq-")) return;
  // ... auto-open
}, []);

// Add tracking
useEffect(() => {
  const hash = window.location.hash;
  if (!hash.startsWith("#faq-")) return;
  
  const key = hash.replace("#faq-", "");
  const idx = KEY_INDEX[key];
  
  if (idx != null) {
    // Track deep link
    trackEvent({
      event: AnalyticsEvent.FAQ_OPEN,
      faq_item_key: key,
      faq_item_number: idx + 1,
      section: AnalyticsSection.FAQ,
      deep_link: true,
      source: 'hash_navigation',
    });
    
    setOpenIndex(idx);
    setTimeout(() => {
      document.getElementById(`faq-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }
}, [trackEvent]);
```

---

### Task 2.3: Contact Support Tracking

**Archivo:** `src/components/landing/DeviceCompatibilityFinder.tsx`

**Cambio requerido (Línea 190-195):**

```typescript
// En result no compatible
<button
  onClick={() => {
    trackEvent({
      event: AnalyticsEvent.CONTACT_INITIATE,
      contact_channel: 'whatsapp',
      device_model: selectedDevice,
      is_compatible: false,
      section: AnalyticsSection.COMPATIBILITY,
      source: 'device_not_compatible',
    });
    window.location.href = WHATSAPP_URL;
  }}
>
  Consultar por WhatsApp →
</button>
```

**Archivo:** `src/components/landing/Contact.tsx`

**Cambio requerido (Línea 54-75):**

```typescript
{CONTACTS.map(({ icon: Icon, label, value, href, color }, i) => (
  <motion.a
    key={label}
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    onClick={() => {
      const channel = label.toLowerCase(); // 'whatsapp', 'email', 'teléfono'
      trackEvent({
        event: AnalyticsEvent.CONTACT_INITIATE,
        contact_channel: channel,
        destination_url: href,
        section: AnalyticsSection.CONTACT,
        source: 'contact_section',
      });
    }}
    // ... rest
  >
```

---

## 🟡 FASE 3: COMPREHENSIVE TRACKING

### Task 3.1: Navigation Tracking

**Archivos:** `Navbar.tsx`, `Footer.tsx`

```typescript
// Generic for all nav links
const handleNavClick = useCallback((key: string, href: string, linkType: string) => {
  trackEvent({
    event: AnalyticsEvent.NAVIGATION_CLICK,
    link_key: key,
    destination_url: href,
    link_type: linkType, // 'company', 'legal', 'support'
    section: AnalyticsSection.FOOTER,
    element_type: 'link',
  });
}, [trackEvent]);

// Usage in Footer
{[
  { key: "about", href: `/${locale}/sobre` },
  // ...
].map(({ key, href }) => (
  <a
    key={key}
    href={href}
    onClick={() => handleNavClick(key, href, 'company')}
  >
    {t(`links.${key}`)}
  </a>
))}
```

---

### Task 3.2: Social Clicks

**Archivo:** `src/components/landing/SocialLinks.tsx`

```typescript
// Current
<motion.a
  key={name}
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  // Add
  onClick={() => {
    trackEvent({
      event: AnalyticsEvent.SOCIAL_CLICK,
      social_platform: name.toLowerCase(),
      destination_url: href,
      section: AnalyticsSection.SOCIAL_LINKS,
    });
  }}
>
```

---

### Task 3.3: Section Entry Tracking

**Todos los componentes principales:**

```typescript
// En cada componente (Hero, Plans, Benefits, etc.)
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Plans({ plans }: PlansProps) {
  const { ref, inView } = useInView({ once: true, threshold: 0.1 });
  const { trackEvent } = useAnalyticsEvent();

  useEffect(() => {
    if (inView) {
      trackEvent({
        event: AnalyticsEvent.SECTION_VIEW,
        section: AnalyticsSection.PLANS,
        page_path: '/es', // get from usePathname
        item_count: plans.length,
        min_price: Math.min(...plans.map(p => p.price_usd)),
      });
    }
  }, [inView, trackEvent, plans]);

  return (
    <section ref={ref} id="planes">
      {/* ... */}
    </section>
  );
}
```

---

## 📝 MATRIZ DE TESTING

### Plan Selection Event

| Escenario | Acción | Esperado GA4 | Esperado Meta | Notas |
|-----------|--------|------------|-----------|-------|
| Desktop click plan | Click button | `begin_checkout` | `AddToCart` | 1 evento, no duplicado |
| Mobile click plan | Click button | `begin_checkout` | `AddToCart` | 1 evento, no duplicado |
| Tablet click plan | Click button | `begin_checkout` | `AddToCart` | 1 evento, no duplicado |
| Multiple clicks same plan | Rápidos clicks | N eventos | N eventos | No deduplicar intentos reales |
| Params correctos | Cualquier click | `plan_id`, `price_usd`, etc | Mismos params | All params present |

### Mobile Menu

| Escenario | Acción | Evento GA4 | Evento Meta | Notas |
|-----------|--------|-----------|-----------|-------|
| Open menu mobile | Click hamburger | `mobile_menu_open` | ❌ | Solo GA4 |
| Click nav item | Click item | `navigation_click` | ❌ | Cierra menu automático |
| Close menu | Click X | `mobile_menu_close` | ❌ | Solo GA4 |

### FAQ

| Escenario | Acción | Evento GA4 | Evento Meta | Notas |
|-----------|--------|-----------|-----------|-------|
| Open accordion | Click Q | `faq_open` | ❌ | Con faq_item_key |
| Close accordion | Click Q again | `faq_close` | ❌ | Mismo item |
| Deep link | Load /es#faq-chip_vs_esim | `faq_open` + `deep_link=true` | ❌ | Auto-open + track |
| Multiple items open | Si es multi-open | Cada uno por separado | ❌ | Validate logic |

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deploy
- [ ] Código revisado (2+ people)
- [ ] Tests de eventos en dev
- [ ] GA4 Debug mode verificado
- [ ] Meta Pixel verificado en dev
- [ ] Parámetros revisados (sin PII)
- [ ] TypeScript compilation limpio

### Deploy
- [ ] Merge a main
- [ ] Deploy a production
- [ ] Esperar 5 min + refresh page
- [ ] Verificar en GA4 Real Time
- [ ] Verificar en Meta Events Manager

### Post-Deploy (24h)
- [ ] Dashboard GA4: validar evento count
- [ ] Meta Pixel: validar eventos llegan
- [ ] Alertas: sin errores de tracking
- [ ] Usuarios: sin impacto visual
- [ ] Performance: sin degradación

---

## 📊 PARÁMETROS ESTÁNDAR POR EVENTO

### cta_click
```typescript
{
  cta_type: 'explore_plans' | 'buy_now' | 'support',
  section: string,
  destination_url: string,
  element_text?: string,
  element_type?: 'button' | 'link',
  device_type: 'desktop' | 'tablet' | 'mobile',
  language: 'es' | 'pt',
}
```

### begin_checkout
```typescript
{
  plan_id: string,
  plan_name: string,
  price_usd: number,
  plan_size: string,
  section: string,
  is_popular: boolean,
  element_position: number,
  source_section?: string,
  device_type: string,
  language: string,
}
```

### faq_open / faq_close
```typescript
{
  faq_item_key: string,
  faq_item_number: number,
  section: string,
  deep_link?: boolean,
  source?: 'hash_navigation' | 'user_click',
  device_type: string,
  language: string,
}
```

### section_view
```typescript
{
  section: string,
  page_path: string,
  page_title: string,
  device_type: string,
  language: string,
  item_count?: number,
  min_price?: number,
  max_price?: number,
}
```

### navigation_click
```typescript
{
  link_key: string,
  destination_url: string,
  link_type: 'company' | 'legal' | 'support',
  section: string,
  element_type: 'link' | 'logo',
  device_type: string,
  language: string,
}
```

### contact_initiate
```typescript
{
  contact_channel: 'whatsapp' | 'email' | 'phone',
  destination_url: string,
  section: string,
  source: string,
  device_model?: string,
  is_compatible?: boolean,
  device_type: string,
  language: string,
}
```

### social_click
```typescript
{
  social_platform: string,
  destination_url: string,
  section: string,
  device_type: string,
  language: string,
}
```

### search_submit
```typescript
{
  query_text: string,
  query_length: number,
  results_count: number,
  search_type: 'country' | 'device',
  section: string,
  device_type: string,
  language: string,
}
```

---

## ⚠️ VALIDACIÓN DE DATOS

### No rastrear (PII Protection)
```typescript
// NUNCA rastrear:
- user.email
- user.phone
- user.name
- credit_card info
- password
- authentication tokens
```

### Parámetros permitidos
```typescript
// Seguro rastrear:
- anonymous_user_id (hash)
- device_type, device_model (general)
- plan_id, plan_name, price
- generic locations (country code, not IP)
- page paths (no query strings con datos sensibles)
```

---

## 📈 MONITOREO POST-DEPLOY

### GA4 Dashboard
- Event count por event (debe crecer gradualmente)
- % de eventos con parámetros requeridos
- Latencia de eventos (< 1s)
- Comparativa antes/después

### Meta Pixel
- Eventos recibidos en Meta Events Manager
- Match rate de CAPI (target: >95%)
- Conversión tracking (purchase events)

### Alertas
- Si event count < threshold por 1h → Slack alert
- Si % params completos < 90% → Slack alert
- Si latencia > 2s → Log warning

---

## 🎓 RECURSOS Y REFERENCIAS

- [GA4 Event Implementation Guide](https://support.google.com/analytics/answer/9322688)
- [Meta Pixel Conversion API Docs](https://developers.facebook.com/docs/marketing-api/conversion-api)
- [Web Vitals & Analytics](https://web.dev/vitals/)
- [Privacy-First Analytics](https://support.google.com/analytics/answer/11986666)

