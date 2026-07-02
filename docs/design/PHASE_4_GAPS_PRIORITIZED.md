# PHASE 4 — PRIORITIZED GAP ANALYSIS

**Fecha:** 2026-07-02  
**Objetivo:** Listar todas las brechas entre checkout actual y Design System aprobado  
**Format:** Grouped by severity and theme

---

## 🔴 CRITICAL GAPS (P0) — Blocks Premium Feel

### Gap 1: Success Page Color Scheme
**Severity:** 🔴 Critical  
**Component:** ConfirmacionPage.tsx  
**Current:** Emerald/green theme (emerald-50, emerald-100, emerald-500)  
**Standard:** Navy + Gold (Design System)  
**Impact:** Tonal disconnect at moment of success; breaks brand consistency  
**Fix:** Replace emerald colors with navy (checkmark) and gold (accents)  
**Effort:** 30 minutes

```
❌ BEFORE:
  Checkmark circle: bg-emerald-50 border-emerald-100 icon-emerald-500
  
✅ AFTER:
  Checkmark circle: bg-gold/10 border-gold/20 icon-gold
  OR
  Checkmark circle: bg-navy/5 border-navy/10 icon-navy
```

---

### Gap 2: Info Box Color Inconsistency
**Severity:** 🔴 Critical  
**Component:** StepData.tsx (Substep 2.2, 2.3)  
**Current:** Arbitrary blue (#EBF6FC) + gold borders/text  
**Standard:** Navy + Gold combinations from Design System  
**Impact:** Breaks visual unity; looks corporate/default  
**Fix:** Replace blue backgrounds with navy/gold from Design System  
**Effort:** 45 minutes

```
❌ BEFORE:
  Substep 2.2 info: bg-[#EBF6FC] border-[#C9973A]/30
  Substep 2.3 info (dataonly): bg-[#EBF6FC]
  
✅ AFTER:
  Substep 2.2 info: bg-gold/5 border-gold/20 OR bg-[#F9FAFB] border-navy/10
  Substep 2.3 info: Same as above
```

---

### Gap 3: Gray Backgrounds Instead of Warm White
**Severity:** 🔴 Critical  
**Component:** Multiple (StepPlan, StepData)  
**Current:** #F0F0F0 (cold gray) used in background cards  
**Standard:** #FFF8F4 (warm white) from Design System  
**Impact:** Cold institutional feel instead of premium/warm  
**Fix:** Global find-replace: #F0F0F0 → #FFF8F4  
**Effort:** 15 minutes

```
❌ BEFORE:
  Quantity box: bg-[#F0F0F0]
  
✅ AFTER:
  Quantity box: bg-[#FFF8F4]
```

---

### Gap 4: Typography Scale Too Small
**Severity:** 🔴 Critical  
**Component:** All components (StepPlan, StepData, StepPayment, ConfirmacionPage)  
**Current:** Headings 20-30% smaller than Design System  
**Standard:** Headline text-4xl sm:text-5xl; Body text-base; Prices text-3xl-4xl  
**Impact:** Feels cramped, less premium, hard to read on mobile  
**Fix:** Increase all sizes by 1-2 notches  
**Effort:** 2-3 hours

```
Granular Changes:
  Page title (H1):
    ❌ text-2xl → ✅ text-4xl sm:text-5xl (StepPlan/StepData/StepPayment)
    
  Section heading (H3):
    ❌ text-lg → ✅ text-xl sm:text-2xl
    
  Body text:
    ❌ text-sm → ✅ text-base
    
  Price display:
    ❌ text-2xl → ✅ text-3xl lg:text-4xl
    
  Labels:
    Keep text-sm (correct)
    
  Success page title:
    ❌ text-2xl sm:text-3xl → ✅ text-3xl sm:text-4xl
```

---

### Gap 5: Mobile Summary Sidebar Hidden
**Severity:** 🔴 Critical  
**Component:** StepPlan, StepData, StepPayment (all use sticky sidebar)  
**Current:** `lg:col-span-1` sidebar hidden on mobile; order total not visible  
**Standard:** Summary always accessible (Design System uses mobile-first approach)  
**Impact:** User loses critical trust signals (total price, security badge) at point of payment decision  
**Fix:** Restructure summary as collapsible top card on mobile or drawer  
**Effort:** 5-7 hours

```
❌ BEFORE (mobile):
  Layout: grid grid-cols-1 lg:grid-cols-3
  On mobile: sidebar completely hidden
  Result: User doesn't see total price until click "Continuar"
  
✅ AFTER (mobile):
  Create <PurchaseSummary /> component
  Mobile: Sticky card at top or collapsible drawer
  Desktop: Keep sidebar as-is
  Tablet: Adapt (hidden/show toggle)
```

---

## 🟠 HIGH IMPACT GAPS (P1) — Affects Premium Perception

### Gap 6: Card Padding Too Tight
**Severity:** 🟠 High  
**Component:** StepPlan, StepData, StepPayment  
**Current:** p-5 (20px) on most cards  
**Standard:** p-6 to p-8 (24px to 32px) from Design System  
**Impact:** Cards feel cramped, not generous/premium  
**Fix:** Increase padding uniformly  
**Effort:** 30 minutes

```
❌ BEFORE:
  <div className="...p-5...">
  
✅ AFTER:
  <div className="...p-6...">  // or p-8 for larger cards
```

---

### Gap 7: No Hover/Interaction Effects on Plan Cards
**Severity:** 🟠 High  
**Component:** StepPlan.tsx (plan card selection)  
**Current:** Cards static; selection only shows border + shadow  
**Standard:** Premium cards should lift/scale on hover  
**Impact:** Feels static vs. dynamic Home Page aesthetic  
**Fix:** Add Framer Motion hover animation (scale, translateY)  
**Effort:** 1-2 hours

```
❌ BEFORE:
  <motion.button>
    onClick + whileTap only, no whileHover
    
✅ AFTER:
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.99 }}
  >
```

---

### Gap 8: Substep Transitions Not Animated
**Severity:** 🟠 High  
**Component:** StepData.tsx (between substep 1 → 2 → 3)  
**Current:** Instant switch; no animation  
**Standard:** Smooth fade/slide using Framer Motion  
**Impact:** Feels jarring; breaks premium continuity  
**Fix:** Wrap substep content in AnimatePresence with fade  
**Effort:** 1-2 hours

```
❌ BEFORE:
  {substep === 1 && <div>...content...</div>}
  {substep === 2 && <div>...different content...</div>}
  
✅ AFTER:
  <AnimatePresence mode="wait">
    <motion.div key={substep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {substep === 1 && <div>...content...</div>}
      {substep === 2 && <div>...different content...</div>}
    </motion.div>
  </AnimatePresence>
```

---

### Gap 9: FAQ Accordion No Animation
**Severity:** 🟠 High  
**Component:** PurchaseFAQ.tsx  
**Current:** Instant expand/collapse; caret rotates but content appears  
**Standard:** Smooth height animation + fade  
**Impact:** Feels abrupt; not premium  
**Fix:** Add Framer Motion height animation on accordion open  
**Effort:** 1-2 hours

```
❌ BEFORE:
  {open && <div className="pb-4 px-1 pl-8">{children}</div>}
  
✅ AFTER:
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
```

---

### Gap 10: Error States Color Too Harsh
**Severity:** 🟠 High  
**Component:** StepData.tsx (error messages)  
**Current:** Error red #DC2626 (harsh, high saturation)  
**Standard:** Softer tone or Design System palette  
**Impact:** Discouraging to user; breaks premium feel  
**Fix:** Replace with softer error color (e.g., rose-600, or custom)  
**Effort:** 30 minutes

```
❌ BEFORE:
  Error text: text-[#DC2626]
  Error background: bg-red-50
  
✅ AFTER:
  Error text: text-rose-700 (or softer)
  Error background: bg-rose-50
```

---

### Gap 11: No CSS Custom Properties
**Severity:** 🟠 High  
**Component:** All (architecture issue)  
**Current:** Hardcoded hex values (#1B2F4E, #C9973A, etc.)  
**Standard:** CSS variables (--color-navy, --color-gold, --color-ink)  
**Impact:** Maintenance burden; future Design System changes require code edits  
**Fix:** Create CSS variable set + refactor components  
**Effort:** 3-4 hours

```
❌ BEFORE:
  className="...text-[#1B2F4E] bg-[#C9973A]..."
  
✅ AFTER:
  className="...text-navy bg-gold..."  // using CSS vars
  OR via Tailwind:
  className="...text-[var(--color-navy)] bg-[var(--color-gold)]..."
```

---

### Gap 12: Success Page Missing Order Details
**Severity:** 🟠 High  
**Component:** ConfirmacionPage.tsx  
**Current:** Shows only order reference + next steps  
**Standard:** Should show itemized receipt, timestamp, plan details  
**Impact:** User uncertain about what they purchased  
**Fix:** Add order details section + timestamp  
**Effort:** 1-2 hours

```
❌ BEFORE:
  Order ref only
  
✅ AFTER:
  Order ref
  Plan name × quantity
  Price
  Timestamp (Procesada el X a las XX:XX)
  Email confirmation
  Next steps
```

---

## 🟡 MEDIUM IMPACT GAPS (P2) — UX Improvements

### Gap 13: Quantity Selector Duplicated
**Severity:** 🟡 Medium  
**Component:** StepPlan.tsx + StepData.tsx (Substep 2.1)  
**Current:** Quantity selector appears in both Step 1 and Step 2.1  
**Standard:** Single source of truth; state lifted to parent  
**Impact:** Potential data mismatch; confusing UX  
**Fix:** Remove from Step 2.1; only keep in Step 1  
**Effort:** 1-2 hours

---

### Gap 14: Form Field Borders Too Light
**Severity:** 🟡 Medium  
**Component:** StepData.tsx (all inputs)  
**Current:** border-[#1B2F4E]/12 (4.8% opacity — very light)  
**Standard:** Should be more visible (8-12% better)  
**Impact:** Subtle visibility issue; focus states unclear  
**Fix:** Increase to border-[#1B2F4E]/10 or higher  
**Effort:** 15 minutes

---

### Gap 15: Device List Overwhelming
**Severity:** 🟡 Medium  
**Component:** PurchaseFAQ.tsx  
**Current:** 13 brands, 100+ models in single accordion (no search)  
**Standard:** Searchable, filterable list  
**Impact:** User can't easily find their device on mobile  
**Fix:** Add search input + filter by brand/model  
**Effort:** 4-6 hours

---

### Gap 16: Emoji Instead of Icons
**Severity:** 🟡 Medium  
**Component:** StepData.tsx, PurchaseFAQ.tsx  
**Current:** Uses emoji: "📱", "📆", "⚠️", "ℹ️"  
**Standard:** Design System uses SVG icons only  
**Impact:** Inconsistent icon language  
**Fix:** Replace all emoji with SVG icons (Phosphor icons already in use)  
**Effort:** 1 hour

```
❌ BEFORE:
  <p>📱 Usamos esto para...</p>
  <span>📆 Programar fecha</span>
  
✅ AFTER:
  <p><DeviceMobile size={16} /> Usamos esto para...</p>
  <span><Calendar size={16} /> Programar fecha</span>
```

---

### Gap 17: No Visual Feedback on Quantity Button Press
**Severity:** 🟡 Medium  
**Component:** StepPlan.tsx, StepData.tsx (quantity buttons)  
**Current:** Click triggers state change but no visual feedback  
**Standard:** Should scale/fade on press (motion-safe:active:scale-[0.97])  
**Impact:** Subtle polish issue  
**Fix:** Add Framer Motion whileTap to buttons  
**Effort:** 30 minutes

---

### Gap 18: Payment Method Selection No Animation
**Severity:** 🟡 Medium  
**Component:** StepPayment.tsx  
**Current:** Radio selection works; Stripe logo appears but no smooth transition  
**Standard:** Should fade in smoothly  
**Impact:** Feels abrupt  
**Fix:** Add motion.div with fadeIn on card logos  
**Effort:** 45 minutes

---

### Gap 19: Processing Spinner Generic
**Severity:** 🟡 Medium  
**Component:** StepPayment.tsx (loading state)  
**Current:** Basic CSS spinner (`animate-spin` with border)  
**Standard:** Premium spinner with Framer Motion spring physics  
**Impact:** Doesn't match premium aesthetic  
**Fix:** Replace with premium Framer Motion spinner  
**Effort:** 1 hour

---

### Gap 20: Input Focus Ring Subtle
**Severity:** 🟡 Medium  
**Component:** StepData.tsx (all inputs)  
**Current:** focus:ring-[#C9973A]/10 (very faint)  
**Standard:** Should be more prominent (focus:ring-4 or increase opacity)  
**Impact:** Focus state barely visible; accessibility issue  
**Fix:** Increase ring opacity or size  
**Effort:** 15 minutes

```
❌ BEFORE:
  focus:ring-2 focus:ring-[#C9973A]/10
  
✅ AFTER:
  focus:ring-4 focus:ring-[#C9973A]/20  // larger, more visible
```

---

## 🟢 LOW IMPACT GAPS (P3) — Polish

### Gap 21: Tab Switcher Generic Design
**Severity:** 🟢 Low  
**Component:** StepPlan.tsx (Local/DataOnly tabs)  
**Current:** Functional tab switcher; white background on active  
**Standard:** Could be more premium (underline, scale, color)  
**Impact:** Minor polish  
**Fix:** Enhance tab visual (optional)  
**Effort:** 1 hour

---

### Gap 22: Card Shadow Color Wrong
**Severity:** 🟢 Low  
**Component:** StepPlan.tsx  
**Current:** shadow-[0_4px_24px_-8px_rgba(230,0,0,0.2)] — red shadow  
**Standard:** Navy or transparent shadow  
**Impact:** Color theory error; subtle  
**Fix:** Change rgba(230,0,0,0.2) → rgba(27,47,78,0.1)  
**Effort:** 5 minutes

```
❌ BEFORE:
  shadow-[0_4px_24px_-8px_rgba(230,0,0,0.2)]  // red
  
✅ AFTER:
  shadow-[0_4px_24px_-8px_rgba(27,47,78,0.1)]  // navy
```

---

### Gap 23: No Email Resend Button
**Severity:** 🟢 Low  
**Component:** ConfirmacionPage.tsx  
**Current:** Shows "Revisá tu email" but no resend option  
**Standard:** Include "Reenviar QR por email" button  
**Impact:** User support issue if email not received  
**Fix:** Add resend button (calls new API endpoint)  
**Effort:** 1-2 hours

---

### Gap 24: Missing Order Timestamp
**Severity:** 🟢 Low  
**Component:** ConfirmacionPage.tsx  
**Current:** Shows order ref but not when order was created  
**Standard:** Include "Procesada el X de julio a las 14:32"  
**Impact:** User context  
**Fix:** Add timestamp from order creation  
**Effort:** 30 minutes

---

### Gap 25: No Social Share Option
**Severity:** 🟢 Low  
**Component:** ConfirmacionPage.tsx  
**Current:** No share functionality  
**Standard:** Could include "Compartir con amigos" (referral)  
**Impact:** Missed referral opportunity  
**Fix:** Add share buttons (optional, low priority)  
**Effort:** 2-3 hours

---

## 📊 SUMMARY TABLE

| Gap # | Title | Severity | Component | Effort | Block |
|-------|-------|----------|-----------|--------|-------|
| 1 | Success page emerald → gold | 🔴 | ConfirmacionPage | 30m | H |
| 2 | Info box blue → navy/gold | 🔴 | StepData | 45m | E |
| 3 | Gray bg → warm white | 🔴 | Multiple | 15m | A |
| 4 | Typography scale +1-2 | 🔴 | All | 2-3h | B |
| 5 | Mobile summary hidden | 🔴 | All | 5-7h | G |
| 6 | Card padding p-5 → p-6 | 🟠 | Multiple | 30m | B |
| 7 | No card hover effects | 🟠 | StepPlan | 1-2h | D |
| 8 | Substep transitions | 🟠 | StepData | 1-2h | D |
| 9 | FAQ no animation | 🟠 | PurchaseFAQ | 1-2h | D |
| 10 | Error red too harsh | 🟠 | StepData | 30m | E |
| 11 | No CSS variables | 🟠 | All | 3-4h | F |
| 12 | Success page no details | 🟠 | ConfirmacionPage | 1-2h | H |
| 13 | Quantity duplicated | 🟡 | StepPlan/Data | 1-2h | J |
| 14 | Input borders too light | 🟡 | StepData | 15m | B |
| 15 | Device list no search | 🟡 | PurchaseFAQ | 4-6h | I |
| 16 | Emoji instead of icons | 🟡 | Multiple | 1h | E |
| 17 | Quantity no press feedback | 🟡 | StepPlan/Data | 30m | D |
| 18 | Payment selection no animation | 🟡 | StepPayment | 45m | D |
| 19 | Spinner generic | 🟡 | StepPayment | 1h | D |
| 20 | Focus ring subtle | 🟡 | StepData | 15m | B |
| 21 | Tab switcher generic | 🟢 | StepPlan | 1h | D |
| 22 | Card shadow red | 🟢 | StepPlan | 5m | A |
| 23 | No email resend | 🟢 | ConfirmacionPage | 1-2h | H |
| 24 | Missing timestamp | 🟢 | ConfirmacionPage | 30m | H |
| 25 | No social share | 🟢 | ConfirmacionPage | 2-3h | H |

---

## 🔗 MAPPING TO BLOCKS

**BLOCK A (Color System):** Gaps 1, 3, 22  
**BLOCK B (Typography & Spacing):** Gaps 4, 6, 14, 20  
**BLOCK C (Mobile):** Gap 5 (primary)  
**BLOCK D (Animations):** Gaps 7, 8, 9, 17, 18, 19, 21  
**BLOCK E (Form States):** Gaps 2, 10, 16  
**BLOCK F (CSS Variables):** Gap 11  
**BLOCK G (Mobile Summary):** Gap 5 (implementation)  
**BLOCK H (Success Page):** Gaps 1, 12, 23, 24, 25  
**BLOCK I (FAQ Search):** Gap 15  
**BLOCK J (Quantity):** Gap 13  

---

**Total Gaps Identified:** 25  
**Critical:** 5  
**High:** 7  
**Medium:** 8  
**Low:** 5  

