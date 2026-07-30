# 📊 Analytics Infrastructure

Complete, centralized, type-safe analytics system for esimruta34.com. Single entry point for GA4 and Meta Pixel tracking, with automatic shared parameter injection and PII protection.

## 🎯 Core Principles

1. **Centralized** - Single `analytics.track()` API for all events
2. **Type-Safe** - All events and parameters are fully typed (TypeScript)
3. **Provider-Agnostic** - GA4 + Meta Pixel + future providers without component changes
4. **Privacy-First** - Automatic PII filtering and validation
5. **Deduplication** - Prevents duplicate events in same session
6. **No Direct Access** - Components cannot call `gtag()`, `fbq()`, or `dataLayer.push()` directly

## 📁 File Structure

```
src/lib/analytics/
├── types.ts              # TypeScript interfaces for all events/parameters
├── constants.ts          # Event names, config, predefined values
├── helpers.ts            # Utilities: validation, privacy, session mgmt
├── analytics.ts          # Central analytics.track() implementation
├── events.ts             # Event builder functions (optional convenience)
├── useAnalytics.ts       # React hook for components
├── providers/
│   ├── ga4.ts           # GA4 event dispatcher
│   ├── meta.ts          # Meta Pixel event dispatcher
│   └── index.ts         # Provider exports
├── index.ts             # Main module export
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Initialize Analytics (Once at App Start)

In your root layout or app initialization:

```typescript
"use client";

import { initializeAnalytics } from "@/lib/analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    initializeAnalytics({
      page_path: window.location.pathname,
      page_title: document.title,
      language: "es", // Get from i18n context
      device_category: "desktop", // Auto-detected
    });
  }, []);

  return null;
}
```

### 2. Track Events from Components

#### Using the Hook (Recommended for React Components)

```typescript
"use client";

import { useAnalytics } from "@/lib/analytics";

export function PlansSection() {
  const { track, trackPlanSelected, trackSearch } = useAnalytics();

  const handlePlanClick = (plan) => {
    trackPlanSelected(plan.id, plan.name, plan.price_usd);
    // Automatically includes page_path, language, device_category, timestamp
  };

  return (
    <button onClick={() => handlePlanClick(plan)}>
      Buy {plan.name}
    </button>
  );
}
```

#### Using Direct API (For Non-React or Server Components)

```typescript
import { analytics } from "@/lib/analytics";

analytics.track("begin_checkout", {
  page_path: "/es",
  page_title: "RUTA34 Home",
  language: "es",
  device_category: "mobile",
  plan_id: "plan-123",
  plan_name: "Europa Plus",
  price_usd: 29.99,
  currency: "USD",
  section: "plans",
  value: 29.99,
});
```

## 📋 API Reference

### Main Function: `analytics.track()`

```typescript
track(
  eventName: EventName,
  params: EventParams
): void
```

**Parameters:**
- `eventName` - Event type from `EVENT_NAMES` constants
- `params` - Event parameters (see Types section)

**Example:**

```typescript
analytics.track("select_item", {
  page_path: "/es/checkout",
  page_title: "Checkout",
  language: "es",
  device_category: "desktop",
  section: "navbar",
  element_text: "Planes",
  element_type: "link",
});
```

### Convenience Methods

#### `trackPageView(pageParams)`

```typescript
analytics.trackPageView({
  page_title: "RUTA34 Home",
  language: "es",
});
```

#### `trackCTAClick(section, elementText, params?)`

```typescript
analytics.trackCTAClick("hero", "Comprar Ahora", {
  section: "hero",
});
```

#### `trackPlanSelected(planId, planName, price)`

```typescript
analytics.trackPlanSelected("plan-123", "Europa Plus", 29.99);
```

#### `trackSearch(searchType, query, resultsCount, params?)`

```typescript
analytics.trackSearch("country", "españa", 5, {
  section: "benefits",
});
```

#### `trackContact(method, location, params?)`

```typescript
analytics.trackContact("whatsapp", "device_finder");
```

#### `trackException(type, description, isFatal?, params?)`

```typescript
analytics.trackException(
  "validation_error",
  "Email format invalid",
  false
);
```

## 📊 Event Types

### Available Events (from TRACKING_PLAN.md)

```typescript
type EventName =
  // Navigation & Page
  | "page_view"
  | "scroll"
  // Lists & Items
  | "view_item_list"
  | "view_item"
  | "select_item"
  | "select_promotion"
  // Search
  | "search"
  | "view_search_results"
  // E-commerce
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "set_checkout_option"
  // Purchase (CRITICAL)
  | "purchase"
  // Contact
  | "contact_us"
  // Errors
  | "exception";
```

### Required Parameters (All Events)

```typescript
interface UniversalParams {
  page_path: string;           // "/es", "/pt"
  page_title: string;          // "RUTA34 Home"
  language: string;            // "es", "pt"
  device_category: string;     // "desktop", "tablet", "mobile"
  timestamp?: string;          // Auto-generated ISO8601
}
```

### Optional Parameter Categories

**Context** - Where the interaction happened:
- `section` - Section name (hero, plans, faq, etc)
- `element_id` - HTML element ID
- `element_text` - Visible button/link text
- `element_type` - button, link, tab, accordion, card
- `position_index` - 0-based position in list

**Attribution** - Traffic source:
- `source` - "direct", "google", "facebook"
- `medium` - "organic", "cpc", "social"
- `campaign` - Campaign name
- `content` - Content variant

**Plan/Product**:
- `plan_id`, `plan_name`, `plan_slug`
- `price_usd`, `currency`
- `data_gb`, `eu_data_gb`
- `is_popular`, `plan_position`

**Search**:
- `search_type` - "country", "device", "faq"
- `search_query` - Search text
- `search_results_count` - Number of results

**Device**:
- `device_model` - "iPhone 15 Pro"
- `device_manufacturer` - "Apple"
- `is_compatible` - true/false
- `compatibility_source` - "manual_search"

**Contact**:
- `contact_method` - "whatsapp", "email", "phone"
- `contact_location` - "contact_section", "device_finder"
- `destination_url` - Target URL

**E-commerce**:
- `value` - Total value
- `items` - Array of item objects
- `transaction_id` - For purchase event
- `tax`, `shipping`, `coupon`

## 🛡️ Privacy & Security

### Automatic PII Filtering

The system automatically detects and filters sensitive data:

```
❌ BLOCKED: Emails, phone numbers, credit cards, SSNs
❌ BLOCKED: Parameter names with "password", "token", "secret"
✅ ALLOWED: Device model, plan name, price, language
```

### Validation

All events are validated before sending:
- Required parameters checked
- Device category validated
- PII detection and filtering
- Empty/null values handled

### Consent Management

Events only send to Meta Pixel if user has accepted analytics consent (checked via `ruta34_cookie_consent` cookie).

## 🔧 Configuration

### Debug Mode

Enable debug logging:

```typescript
import { setAnalyticsDebugMode } from "@/lib/analytics";

setAnalyticsDebugMode(true);
// Logs all events to console
```

### Provider Configuration

Configure providers via environment variables:

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789
```

### Advanced: Custom Parameters

Add custom parameters beyond standard set:

```typescript
analytics.track("page_view", {
  page_path: "/es",
  page_title: "Home",
  language: "es",
  device_category: "mobile",
  // Custom parameters
  custom_field: "value",
  ab_test_variant: "v2",
});
```

## 📚 Advanced Usage

### Event Builders (Optional)

For more type-safe event creation:

```typescript
import { createBeginCheckoutEvent } from "@/lib/analytics";

const event = createBeginCheckoutEvent({
  page_path: "/es",
  page_title: "RUTA34",
  language: "es",
  device_category: "mobile",
  plan_id: "plan-123",
  plan_name: "Europa Plus",
  price_usd: 29.99,
});

analytics.track("begin_checkout", event);
```

### Session Management

Access session information:

```typescript
import { getSessionId, getCookie } from "@/lib/analytics";

const sessionId = getSessionId(); // Gets or creates UUID
const fbpCookie = getCookie("_fbp"); // Meta Pixel ID
```

### Deduplication

The system prevents duplicate events from firing multiple times:

```typescript
import { hasEventFiredInSession } from "@/lib/analytics";

if (!hasEventFiredInSession("purchase", sessionId)) {
  analytics.track("purchase", { ... });
}
```

## ✅ Testing

### Manual Testing in Browser

1. Open DevTools Console
2. Enable debug mode: `window.__analyticsDebug = true`
3. All events will log to console before sending
4. Check GA4 Real-Time reports (5-10s delay)
5. Check Meta Events Manager

### Validation Checklist

- [ ] Event appears in GA4 Real-Time (10s)
- [ ] Event appears in Meta Events Manager
- [ ] Parameters are correct
- [ ] No PII in parameters
- [ ] No console errors
- [ ] No duplicate events
- [ ] Session ID is consistent
- [ ] Timestamp is ISO8601

## 🚨 Common Issues

**Q: Event not showing in GA4?**
- Check GA4 measurement ID is set
- Verify event name matches GA4 standard
- Check console for errors
- Wait 10-15 seconds for Real-Time display

**Q: Event showing in GA4 but not Meta?**
- Check consent cookie (`ruta34_cookie_consent`)
- Check Meta Pixel ID is set
- Verify event has Meta mapping
- Check fbq() is available in window

**Q: Getting "PII detected" warnings?**
- Remove email/phone/SSN from parameters
- Check parameter names don't include sensitive terms
- Use hashed IDs instead of raw user data

**Q: Events duplicating?**
- Ensure single `analytics.track()` call per interaction
- Check for multiple event handlers on same element
- Use session deduplication for critical events

## 📖 Related Files

- **TRACKING_PLAN.md** - Definitive spec for all 45+ events
- **AUDIT_HOME_ANALYTICS.md** - 87 interactions audit
- **EXECUTIVE_SUMMARY.md** - Business context and risks
- **components/analytics/GTM.tsx** - GTM script loader
- **components/analytics/MetaPixel.tsx** - Meta Pixel loader

## 🔗 Resources

- [GA4 Events Guide](https://support.google.com/analytics/answer/9322688)
- [Meta Pixel Reference](https://developers.facebook.com/docs/facebook-pixel)
- [Analytics Debugger Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger)
- [Meta Events Manager](https://business.facebook.com/events_manager)

---

**Last Updated:** July 30, 2026  
**Status:** Production Ready  
**Next Phase:** Component instrumentation (Phase 2)
