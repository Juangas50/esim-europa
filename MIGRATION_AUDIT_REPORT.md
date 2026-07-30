# 🔍 Analytics Migration Audit Report

**Date:** July 30, 2026  
**Status:** Complete Scan - No Code Modified  
**Scope:** All UI components using old analytics system  
**Target:** Migration to `analytics.track()` API

---

## 📊 Executive Summary

**Total Issues Found:** 16 files with 50+ tracking calls  
**Severity:** High (blocks Phase 2 implementation)  
**Impact:** Components cannot use new infrastructure until migrated  
**Effort:** ~4-6 hours (Phase 2 activity)

### Issue Breakdown

| Category | Count | Files | Status |
|----------|-------|-------|--------|
| Old analytics.* methods | 15 | 6 | ⚠️ Critical |
| Analytics GA4 helpers | 6 | 3 | ⚠️ Critical |
| useMetaEvents hook | 7 | 5 | ⚠️ Critical |
| Direct fbq calls | 2 | 2 | ⚠️ Critical |
| Direct dataLayer calls | 1 | 1 | ⚠️ Critical |
| **TOTAL** | **31** | **16** | **NEEDS MIGRATION** |

---

## 🔴 Critical Issues by Component

### 1. **Plans Component** 
**File:** `src/components/landing/Plans.tsx`

**Current (Old) Code:**
```typescript
// Line 12-13
import { trackSelectPlan, trackViewPlans } from "@/lib/analytics-ga4";
import { useMetaEvents } from "@/hooks/useMetaEvents";

// Line 34
const { trackAddToCart } = useMetaEvents();

// Line 233
onClick={() => analytics.planSelected(plan)}

// Line 234-241
trackSelectPlan({
  id: plan.id,
  name: plan.name,
  price: plan.price_usd,
  size: plan.type,
})

// Line 259
const { trackViewContentList } = useMetaEvents();

// Line 263-269
trackViewPlans(
  visiblePlans.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price_usd,
  }))
)
```

**Issues Identified:**
- ❌ `analytics.planSelected()` - Old custom method
- ❌ `trackSelectPlan()` - Old GA4 helper
- ❌ `trackViewPlans()` - Old GA4 helper
- ❌ `trackAddToCart()` - Old Meta hook method
- ❌ `trackViewContentList()` - Old Meta hook method

**Migration Strategy:**
```typescript
// NEW: Single unified approach
import { analytics } from "@/lib/analytics";
import { useAnalytics } from "@/lib/analytics";

export function Plans() {
  const { track } = useAnalytics();

  // Plan list view
  useEffect(() => {
    track("view_item_list", {
      page_path: "/es",  // From context/params
      page_title: "RUTA34 Home",
      language: "es",
      device_category: "mobile",  // Auto-detected
      section: "plans",
      item_list_id: "all-plans",
      item_list_name: "eu_plans",
      items: visiblePlans.map(p => ({
        item_id: p.id,
        item_name: p.name,
        price: p.price_usd,
      })),
    });
  }, [visiblePlans]);

  // Individual plan view
  const handleViewPlan = (plan) => {
    track("view_item", {
      page_path: "/es",
      page_title: "RUTA34 Home",
      language: "es",
      device_category: "mobile",
      section: "plans",
      plan_id: plan.id,
      plan_name: plan.name,
      price_usd: plan.price_usd,
      is_popular: plan.isPopular,
      plan_position: plans.indexOf(plan),
    });
  };

  // Plan selection (checkout)
  const handlePlanClick = (plan) => {
    track("begin_checkout", {
      page_path: "/es",
      page_title: "RUTA34 Home",
      language: "es",
      device_category: "mobile",
      section: "plans",
      plan_id: plan.id,
      plan_name: plan.name,
      price_usd: plan.price_usd,
      currency: "USD",
      value: plan.price_usd,
    });
  };
}
```

**Time Estimate:** 45 minutes

---

### 2. **Hero Component**
**File:** `src/components/landing/Hero.tsx`

**Current (Old) Code:**
```typescript
// Lines 94, 182, 265
onClick={() => analytics.viewPlansClicked()}
```

**Issues Identified:**
- ❌ `analytics.viewPlansClicked()` - Old custom method
- ❌ Called 3 times in component (potential duplicates)

**Migration Strategy:**
```typescript
import { useAnalytics } from "@/lib/analytics";

export function Hero() {
  const { trackCTAClick } = useAnalytics();

  const handleViewPlansClick = () => {
    trackCTAClick("hero", "Ver Planes", {
      section: "hero",
    });
    // Navigate to plans
    document.getElementById("planes").scrollIntoView();
  };

  return (
    <>
      <button onClick={handleViewPlansClick}>Ver Planes</button>
      {/* Other instances */}
      <button onClick={handleViewPlansClick}>Explorar Planes</button>
    </>
  );
}
```

**Time Estimate:** 20 minutes

---

### 3. **PurchaseFlow Component**
**File:** `src/components/purchase/PurchaseFlow.tsx`

**Current (Old) Code:**
```typescript
// Line 12
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/analytics-ga4";

// Line 13
import { useMetaEvents } from "@/hooks/useMetaEvents";

// Line 37
const { trackViewContent, trackInitiateCheckout } = useMetaEvents();

// Lines 42, 148
analytics.checkoutStarted(initialPlan);
analytics.checkoutStarted(plan);

// Lines 150-154
trackBeginCheckout({
  id: plan.id,
  name: plan.name,
  price: plan.price_usd,
})
```

**Issues Identified:**
- ❌ `analytics.checkoutStarted()` - Old custom method (called 2x)
- ❌ `trackBeginCheckout()` - Old GA4 helper
- ❌ `trackViewContent()` - Old Meta hook method
- ❌ `trackInitiateCheckout()` - Old Meta hook method

**Migration Strategy:**
```typescript
import { useAnalytics } from "@/lib/analytics";

export function PurchaseFlow() {
  const { trackConversion } = useAnalytics();

  useEffect(() => {
    if (initialPlan) {
      trackConversion("begin_checkout", {
        page_path: `/checkout`,
        page_title: "Checkout - Plan Selection",
        language: locale,
        device_category: "mobile",
        section: "checkout",
        plan_id: initialPlan.id,
        plan_name: initialPlan.name,
        price_usd: initialPlan.price_usd,
        currency: "USD",
        value: initialPlan.price_usd,
      });
    }
  }, [initialPlan]);

  // Similarly for other tracking points
}
```

**Time Estimate:** 30 minutes

---

### 4. **StepData Component (Checkout)**
**File:** `src/components/purchase/StepData.tsx`

**Current (Old) Code:**
```typescript
// Line 139
analytics.checkoutStepViewed(2, "data", plan);

// Line 174
analytics.emailMismatchError();

// Line 179
analytics.checkoutStepCompleted(2, "data", plan);

// Line 233
if (n !== quantity) analytics.quantitySelected(n, plan);

// Lines 428, 451
onChange={() => analytics.activationOptionSelected("now", plan)}
onChange={() => analytics.activationOptionSelected("schedule", plan)}
```

**Issues Identified:**
- ❌ `analytics.checkoutStepViewed()` - Old custom method
- ❌ `analytics.emailMismatchError()` - Old custom method
- ❌ `analytics.checkoutStepCompleted()` - Old custom method
- ❌ `analytics.quantitySelected()` - Old custom method
- ❌ `analytics.activationOptionSelected()` - Old custom method (2x)

**Migration Strategy:**
```typescript
import { useAnalytics } from "@/lib/analytics";

export function StepData() {
  const { track, trackException } = useAnalytics();

  useEffect(() => {
    track("page_view", {
      page_path: "/checkout/step-2",
      page_title: "Checkout - Step 2: Data",
      language: locale,
      device_category: "mobile",
    });
  }, []);

  const handleEmailMismatch = () => {
    trackException(
      "validation_error",
      "Email addresses do not match",
      false,
      { section: "checkout", page_path: "/checkout/step-2" }
    );
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity !== quantity) {
      track("set_checkout_option", {
        page_path: "/checkout/step-2",
        page_title: "Checkout - Step 2",
        language: locale,
        device_category: "mobile",
        section: "checkout",
        checkout_option: "quantity",
        checkout_option_value: String(newQuantity),
      });
    }
  };

  const handleActivationChange = (option) => {
    track("set_checkout_option", {
      page_path: "/checkout/step-2",
      page_title: "Checkout - Step 2",
      language: locale,
      device_category: "mobile",
      section: "checkout",
      checkout_option: "activation",
      checkout_option_value: option,
    });
  };
}
```

**Time Estimate:** 40 minutes

---

### 5. **StepPayment Component**
**File:** `src/components/purchase/StepPayment.tsx`

**Current (Old) Code:**
```typescript
// Line 11
import { useMetaEvents } from "@/hooks/useMetaEvents";

// Line 77
const { trackAddPaymentInfo } = useMetaEvents();

// Line 81
analytics.checkoutStepViewed(3, "payment", plan);

// Line 92
analytics.paymentMethodSelected(method, plan);

// Line 100
analytics.checkoutPaymentInitiated(plan, method, formData.customer_country);

// Line 106
trackAddPaymentInfo({ id: plan.id, name: plan.name, price_usd: plan.price_usd }, formData.quantity ?? 1);
```

**Issues Identified:**
- ❌ `analytics.checkoutStepViewed()` - Old custom method
- ❌ `analytics.paymentMethodSelected()` - Old custom method
- ❌ `analytics.checkoutPaymentInitiated()` - Old custom method
- ❌ `trackAddPaymentInfo()` - Old Meta hook method

**Migration Strategy:**
```typescript
import { useAnalytics } from "@/lib/analytics";

export function StepPayment() {
  const { track, trackConversion } = useAnalytics();

  useEffect(() => {
    track("page_view", {
      page_path: "/checkout/step-3",
      page_title: "Checkout - Step 3: Payment",
      language: locale,
      device_category: "mobile",
    });
  }, []);

  const handlePaymentMethodChange = (method) => {
    track("set_checkout_option", {
      page_path: "/checkout/step-3",
      page_title: "Checkout - Step 3: Payment",
      language: locale,
      device_category: "mobile",
      section: "checkout",
      checkout_option: "payment_method",
      checkout_option_value: method,
    });
  };

  const handlePaymentSubmit = async () => {
    // Track that user is about to pay (conversion point)
    trackConversion("add_payment_info", {
      page_path: "/checkout/step-3",
      page_title: "Checkout - Step 3: Payment",
      language: locale,
      device_category: "mobile",
      section: "checkout",
      plan_id: plan.id,
      plan_name: plan.name,
      price_usd: plan.price_usd,
      currency: "USD",
      value: plan.price_usd * (formData.quantity ?? 1),
      payment_type: selectedMethod,
      items: [{
        item_id: plan.id,
        item_name: plan.name,
        price: plan.price_usd,
        quantity: formData.quantity ?? 1,
      }],
    });

    // Then submit to payment provider
  };
}
```

**Time Estimate:** 35 minutes

---

### 6. **StepPlan Component**
**File:** `src/components/purchase/StepPlan.tsx`

**Current (Old) Code:**
```typescript
// Line 79
if (plan) analytics.checkoutStepViewed(1, "plan", plan);

// Line 281
analytics.checkoutStepCompleted(1, "plan", selectedPlan);
```

**Issues Identified:**
- ❌ `analytics.checkoutStepViewed()` - Old custom method
- ❌ `analytics.checkoutStepCompleted()` - Old custom method

**Migration Strategy:**
```typescript
import { useAnalytics } from "@/lib/analytics";

export function StepPlan() {
  const { track } = useAnalytics();

  useEffect(() => {
    if (plan) {
      track("page_view", {
        page_path: "/checkout/step-1",
        page_title: "Checkout - Step 1: Plan Selection",
        language: locale,
        device_category: "mobile",
      });
    }
  }, [plan]);

  const handlePlanSelection = (selectedPlan) => {
    track("select_item", {
      page_path: "/checkout/step-1",
      page_title: "Checkout - Step 1: Plan Selection",
      language: locale,
      device_category: "mobile",
      section: "checkout",
      element_text: selectedPlan.name,
      plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
      price_usd: selectedPlan.price_usd,
    });
  };
}
```

**Time Estimate:** 20 minutes

---

### 7. **Confirmation View**
**File:** `src/app/[locale]/confirmacion/ConfirmacionView.tsx`

**Current (Old) Code:**
```typescript
// Line 9
import { useMetaEvents } from "@/hooks/useMetaEvents";

// Lines 39
const { trackPurchase } = useMetaEvents();

// Lines 43-44
analytics.purchaseConfirmedPageViewed(orderRef, planId);
analytics.confirmationViewed(orderRef, quantity);

// Later (from useMetaEvents call)
trackPurchase(...)
```

**Issues Identified:**
- ❌ `analytics.purchaseConfirmedPageViewed()` - Old custom method
- ❌ `analytics.confirmationViewed()` - Old custom method
- ❌ `trackPurchase()` - Old Meta hook method

**Migration Strategy:**
```typescript
import { analytics, useAnalytics } from "@/lib/analytics";

export function ConfirmacionView() {
  useEffect(() => {
    if (orderRef && planId) {
      // Track purchase (CRITICAL EVENT)
      analytics.trackConversion("purchase", {
        page_path: `/es/confirmacion`,
        page_title: "Order Confirmed",
        language: "es",
        device_category: "mobile",
        section: "checkout",
        transaction_id: orderRef,
        value: orderValue, // Must be obtained from order data
        currency: "USD",
        items: [{
          item_id: planId,
          item_name: planName,
          price: planPrice,
          quantity: quantity ?? 1,
        }],
      });

      // Also track page view of confirmation
      analytics.track("page_view", {
        page_path: `/es/confirmacion`,
        page_title: "Order Confirmed",
        language: "es",
        device_category: "mobile",
      });
    }
  }, [orderRef, planId]);
}
```

**Time Estimate:** 25 minutes

---

### 8. **MetaPixel Component (Script Loader)**
**File:** `src/components/analytics/MetaPixel.tsx`

**Current (Old) Code:**
```typescript
// Line 7
import { useMetaEvents } from "@/hooks/useMetaEvents";

// Line 109
const { trackPageView } = useMetaEvents();

// Line 117-120 (in useEffect)
trackPageView({
  content_name: document.title,
  content_type: "website",
});
```

**Issues Identified:**
- ❌ `useMetaEvents()` hook used (now deprecated)
- ❌ `trackPageView()` from old hook (now deprecated)
- ⚠️ This component manages Meta Pixel script loading

**Note:** This component should remain focused on **script loading only**. Page view tracking should be moved to layout or app-level initialization.

**Migration Strategy:**
```typescript
// MetaPixel.tsx should ONLY handle script loading
// Remove all analytics tracking from this component

import { markMetaPixelReady } from "@/lib/analytics";

export function MetaPixelScript() {
  useEffect(() => {
    // Call this when Pixel is fully loaded
    markMetaPixelReady();
  }, []);

  return (
    // Script tag only - no tracking
  );
}

// Instead, put page tracking in app layout or use app-level initialization:
// In app/[locale]/layout.tsx or root layout:
import { initializeAnalytics } from "@/lib/analytics";

export default function RootLayout() {
  useEffect(() => {
    initializeAnalytics({
      page_path: window.location.pathname,
      page_title: document.title,
      language: "es", // From i18n
      device_category: "mobile", // Auto-detected
    });

    // Track page view
    analytics.trackPageView({
      page_title: document.title,
    });
  }, []);

  return (
    <>
      <MetaPixelScript />
      {/* rest of layout */}
    </>
  );
}
```

**Time Estimate:** 15 minutes

---

## 📋 Old System Files & Functions to Remove

### Files Still in Use (Will Be Deprecated)

**`src/lib/analytics-ga4.ts`** (97 lines)
- `trackGAEvent()`
- `trackViewPlans()`
- `trackSelectPlan()`
- `trackBeginCheckout()`
- `trackAddPaymentInfo()`
- `trackCheckoutError()`
- `trackStripeRedirect()`

**`src/hooks/useMetaEvents.ts`** (150+ lines)
- `useMetaEvents()` hook
- `trackPageView()`
- `trackViewContent()`
- `trackViewContentList()`
- `trackInitiateCheckout()`
- `trackAddToCart()`
- `trackAddPaymentInfo()`
- `trackPurchase()`
- Direct calls to `fbqTrack()`

**`src/lib/analytics/index.ts`** (UPDATED - Old Object Removed)
- Old `analytics` object with custom methods (ALREADY REPLACED IN PHASE 3)
- ✅ Already replaced with centralized exports

### Old Analytics Object Methods (Already Removed from index.ts)

All these were in the old system and should no longer be used:
- ❌ `analytics.planSelected()`
- ❌ `analytics.checkoutStarted()`
- ❌ `analytics.checkoutStepViewed()`
- ❌ `analytics.checkoutStepCompleted()`
- ❌ `analytics.paymentMethodSelected()`
- ❌ `analytics.checkoutPaymentInitiated()`
- ❌ `analytics.purchaseConfirmedPageViewed()`
- ❌ `analytics.whatsappClicked()`
- ❌ `analytics.faqItemOpened()`
- ❌ `analytics.viewPlansClicked()`
- ❌ `analytics.gbGuideOpened()`
- ❌ `analytics.quantitySelected()`
- ❌ `analytics.emailMismatchError()`
- ❌ `analytics.activationOptionSelected()`
- ❌ `analytics.confirmationViewed()`
- ❌ `analytics.swipePlanCarousel()`

---

## 🗺️ Migration Map: Old → New

### Event Mappings

| Old Method | Old File | → | New Event | New File |
|-----------|----------|---|-----------|----------|
| `analytics.planSelected()` | index.ts | → | `track("begin_checkout")` | analytics.ts |
| `analytics.viewPlansClicked()` | index.ts | → | `trackCTAClick()` | analytics.ts |
| `analytics.checkoutStarted()` | index.ts | → | `track("begin_checkout")` | analytics.ts |
| `analytics.checkoutStepViewed()` | index.ts | → | `track("page_view")` | analytics.ts |
| `analytics.checkoutStepCompleted()` | index.ts | → | `track("select_item")` | analytics.ts |
| `analytics.emailMismatchError()` | index.ts | → | `trackException()` | analytics.ts |
| `analytics.quantitySelected()` | index.ts | → | `track("set_checkout_option")` | analytics.ts |
| `analytics.activationOptionSelected()` | index.ts | → | `track("set_checkout_option")` | analytics.ts |
| `analytics.paymentMethodSelected()` | index.ts | → | `track("set_checkout_option")` | analytics.ts |
| `analytics.checkoutPaymentInitiated()` | index.ts | → | `trackConversion("add_payment_info")` | analytics.ts |
| `analytics.purchaseConfirmedPageViewed()` | index.ts | → | `trackConversion("purchase")` | analytics.ts |
| `analytics.confirmationViewed()` | index.ts | → | `track("page_view")` | analytics.ts |
| `trackViewPlans()` | analytics-ga4.ts | → | `track("view_item_list")` | analytics.ts |
| `trackSelectPlan()` | analytics-ga4.ts | → | `track("view_item")` | analytics.ts |
| `trackBeginCheckout()` | analytics-ga4.ts | → | `track("begin_checkout")` | analytics.ts |
| `trackAddPaymentInfo()` | analytics-ga4.ts | → | `track("add_payment_info")` | analytics.ts |
| `useMetaEvents().trackPageView()` | useMetaEvents.ts | → | `analytics.trackPageView()` | analytics.ts |
| `useMetaEvents().trackViewContent()` | useMetaEvents.ts | → | `track("view_item")` | analytics.ts |
| `useMetaEvents().trackInitiateCheckout()` | useMetaEvents.ts | → | `track("begin_checkout")` | analytics.ts |
| `useMetaEvents().trackAddToCart()` | useMetaEvents.ts | → | `track("add_to_cart")` | analytics.ts |
| `useMetaEvents().trackAddPaymentInfo()` | useMetaEvents.ts | → | `track("add_payment_info")` | analytics.ts |
| `useMetaEvents().trackPurchase()` | useMetaEvents.ts | → | `trackConversion("purchase")` | analytics.ts |

---

## ⚡ Migration Timeline

### Phase 2 Implementation (Proposed)

```
Week 1-2: Component Migration
├─ Day 1-2: Plans.tsx (45 min)
├─ Day 2: Hero.tsx (20 min)
├─ Day 3: PurchaseFlow.tsx (30 min)
├─ Day 3-4: StepData.tsx (40 min)
├─ Day 4: StepPayment.tsx (35 min)
├─ Day 4: StepPlan.tsx (20 min)
├─ Day 5: ConfirmacionView.tsx (25 min)
├─ Day 5: MetaPixel.tsx (15 min)
└─ Testing & Validation (2+ hours)

Week 3: Testing & Cleanup
├─ Full regression testing
├─ GA4 Real-Time validation
├─ Meta Events Manager validation
├─ Remove old files (analytics-ga4.ts, useMetaEvents.ts)
└─ Update imports in any remaining files
```

**Total Effort:** ~4-5 hours active development + 2-3 hours testing

---

## 📋 Detailed Component Migration Checklist

### Plans Component
- [ ] Remove `import { trackSelectPlan, trackViewPlans } from "@/lib/analytics-ga4"`
- [ ] Remove `import { useMetaEvents } from "@/hooks/useMetaEvents"`
- [ ] Add `import { useAnalytics } from "@/lib/analytics"`
- [ ] Replace `analytics.planSelected()` with `track("begin_checkout")`
- [ ] Replace `trackSelectPlan()` with `track("view_item")`
- [ ] Replace `trackViewPlans()` with `track("view_item_list")`
- [ ] Replace `trackAddToCart()` with auto-handling in `track("begin_checkout")`
- [ ] Replace `trackViewContentList()` with auto-handling in `track("view_item_list")`
- [ ] Test all three methods work
- [ ] Check no duplicates in GA4 Real-Time
- [ ] Check events appear in Meta Events Manager

### Hero Component
- [ ] Remove `analytics.viewPlansClicked()` calls (all 3 instances)
- [ ] Add `import { useAnalytics } from "@/lib/analytics"`
- [ ] Add `trackCTAClick()` for each button
- [ ] Consolidate to single handler if possible
- [ ] Test all three button click points
- [ ] Verify no duplicate events in GA4

### PurchaseFlow Component
- [ ] Remove old imports (trackBeginCheckout, useMetaEvents)
- [ ] Add new import (useAnalytics)
- [ ] Replace `analytics.checkoutStarted()` (2x) with `track("begin_checkout")`
- [ ] Replace `trackBeginCheckout()` with same
- [ ] Replace `trackViewContent()` with auto-handling
- [ ] Replace `trackInitiateCheckout()` with auto-handling
- [ ] Test checkout flow end-to-end
- [ ] Verify events in GA4 Real-Time

### StepData Component
- [ ] Remove old analytics calls
- [ ] Add useAnalytics hook
- [ ] Replace step tracking with `page_view` events
- [ ] Replace error tracking with `trackException()`
- [ ] Replace quantity/activation changes with `set_checkout_option` events
- [ ] Test all form interactions
- [ ] Verify no duplicate events

### StepPayment Component
- [ ] Remove useMetaEvents import
- [ ] Add useAnalytics import
- [ ] Replace step viewed with page_view
- [ ] Replace method selection with set_checkout_option
- [ ] Replace payment initiated with add_payment_info (conversion)
- [ ] Test payment flow

### StepPlan Component
- [ ] Remove old analytics calls
- [ ] Add useAnalytics import
- [ ] Replace step tracking with page_view
- [ ] Replace step completion with select_item
- [ ] Test plan selection flow

### ConfirmacionView
- [ ] Remove useMetaEvents import
- [ ] Import trackConversion from analytics
- [ ] Replace old methods with trackConversion("purchase")
- [ ] Ensure transaction_id is captured
- [ ] Test purchase confirmation tracking
- [ ] Verify in both GA4 and Meta

### MetaPixel Component
- [ ] Remove useMetaEvents import
- [ ] Remove tracking code (only keep script loading)
- [ ] Move page tracking to app layout
- [ ] Call markMetaPixelReady() when script loads

---

## 🔍 Verification Checklist

After each component migration:

- [ ] TypeScript compilation passes (no errors)
- [ ] No console errors or warnings
- [ ] Event appears in GA4 Real-Time within 10 seconds
- [ ] Event parameters are correct
- [ ] No duplicate events sent
- [ ] Event appears in Meta Events Manager (if consent given)
- [ ] Conversion events marked correctly
- [ ] Session ID is consistent across events
- [ ] No PII in parameters
- [ ] Mobile and desktop tested
- [ ] Previous functionality not broken

---

## 📊 Files Affected Summary

### Components Requiring Changes (8)
```
✓ src/components/landing/Plans.tsx            (50 min)
✓ src/components/landing/Hero.tsx             (20 min)
✓ src/components/purchase/PurchaseFlow.tsx    (30 min)
✓ src/components/purchase/StepData.tsx        (40 min)
✓ src/components/purchase/StepPayment.tsx     (35 min)
✓ src/components/purchase/StepPlan.tsx        (20 min)
✓ src/app/[locale]/confirmacion/ConfirmacionView.tsx (25 min)
✓ src/components/analytics/MetaPixel.tsx      (15 min)

Total: ~4.5 hours
```

### Files To Remove/Deprecate (2)
```
✗ src/lib/analytics-ga4.ts               → Remove completely
✗ src/hooks/useMetaEvents.ts             → Remove completely
```

### Files Already Updated (1)
```
✓ src/lib/analytics/index.ts             → DONE (Phase 3)
```

---

## 🎯 Success Criteria

Migration is complete when:

1. ✅ All old analytics calls replaced with new API
2. ✅ No TypeScript errors or warnings
3. ✅ All events appear in GA4 Real-Time
4. ✅ All conversion events tracked
5. ✅ No duplicate events
6. ✅ Meta Pixel events sent (with consent)
7. ✅ Old files removed from codebase
8. ✅ Full regression testing passed
9. ✅ Performance metrics stable
10. ✅ Data quality validated

---

## 📞 Support & Questions

### Common Migration Questions

**Q: Should I migrate one component at a time or all together?**  
A: One at a time. Test each component fully before moving to next. This allows easier debugging.

**Q: Can old and new systems run together?**  
A: No. Mixing will cause duplicate events. Migrate completely or not at all.

**Q: How do I test if events are being tracked?**  
A: Enable debug mode: `setAnalyticsDebugMode(true)`, check console logs, verify in GA4 Real-Time.

**Q: What if I don't know the required parameters?**  
A: Check TRACKING_PLAN.md for event specifications. Use TypeScript errors as guide.

**Q: How do I handle conditional tracking?**  
A: Same way as old system - wrap in if statements. New system validates parameters.

---

## 🚀 Next Steps

1. **Approve Migration Plan** - Review this audit with team
2. **Assign Components** - Distribute 8 components among developers
3. **Start Phase 2** - Begin migrations Monday
4. **Daily Stand-ups** - Review progress, blockers, testing results
5. **Staging Validation** - Test in staging before production
6. **Production Deploy** - Once all testing passes

---

**Audit Status:** ✅ COMPLETE  
**Report Generated:** July 30, 2026  
**Ready for Phase 2:** YES  
**Estimated Phase 2 Duration:** 4-6 hours active dev + 2-3 hours testing  

**Next Action:** Review findings with product/engineering team and schedule Phase 2 kickoff.
