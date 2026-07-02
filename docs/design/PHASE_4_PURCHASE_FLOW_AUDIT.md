# PHASE 4 — PURCHASE FLOW COMPLETE AUDIT

**Fecha:** 2026-07-02  
**Proyecto:** RUTA34 Telecom — eSIM Platform  
**Status:** ANALYSIS ONLY — NO CHANGES MADE

---

## 📊 EXECUTIVE SUMMARY

### Audit Scope
- **Total Files Analyzed:** 5 main components + 1 API route + 1 success page + utilities
- **Lines of Code:** ~1,200 lines (components only, excluding node_modules)
- **Versions Used:** React 19.2.4, Next.js 16.2.6, Tailwind CSS v4, Framer Motion, Stripe API
- **Coverage:** 100% of checkout user journey

### Overall Assessment

**CURRENT STATE: Functional but misaligned with Design System**

The purchase flow is technically functional and contains proper validation, error handling, and analytics. However, it suffers from critical visual and UX inconsistencies when compared to the Premium Editorial Design System established in Phase 2-3 (Aman Style, Premium Travel Composition).

**Key Findings:**
- ❌ Visual hierarchy inconsistent with Home Page
- ❌ Spacing and padding standards not aligned with Design System
- ❌ Color system uses custom hex values instead of Design System tokens
- ❌ Typography scales and weights differ from approved standards
- ❌ Animation principles (Framer Motion) present but inconsistent
- ❌ Form components lack premium styling
- ❌ No mobile-first responsive breakpoints matching Home
- ❌ Summary sidebars feel generic, not premium
- ❌ Loading and error states minimal
- ❌ Success page quality acceptable but could be elevated
- ✅ Functional validation is solid
- ✅ Analytics tracking is comprehensive
- ✅ Accessibility basics covered
- ✅ Security (Stripe integration) implemented correctly

---

## 🗺️ CUSTOMER JOURNEY MAP

### Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ START: User clicks "Elegir plan" from Home Page                         │
└─────────────────────────────────────────┬───────────────────────────────┘
                                          │
                        ┌─────────────────▼──────────────────┐
                        │ STEP 1: Plan Selection             │
                        │ /compra?plan=[id]                  │
                        └──────────────────┬──────────────────┘
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  │ User selects:                                    │
                  │ • Plan type (Local or DataOnly)                 │
                  │ • Specific plan (Europa Plus, Data50GB, etc)    │
                  │ • Quantity (1-10 eSIMs)                        │
                  │ → Continues to Step 2                           │
                  └────────────────────────┬───────────────────────┘
                                           │
                        ┌─────────────────▼──────────────────┐
                        │ STEP 2: Customer Data              │
                        │ (3 sub-steps)                      │
                        └──────────────────┬──────────────────┘
                                           │
                   ┌───────────────────────┴────────────────────────┐
                   │ SUBSTEP 2.1: Basic Info                       │
                   │ • Full name + lastname                        │
                   │ • Email + email confirmation                  │
                   │ • Quantity re-selection                       │
                   └───────────────┬─────────────────────────────┘
                                   │
                   ┌───────────────▼─────────────────────────────┐
                   │ SUBSTEP 2.2: Identity Validation            │
                   │ • Country selection (auto-detect by IP)     │
                   │ • Passport number                           │
                   │ • Date of birth (18+ required)              │
                   └───────────────┬─────────────────────────────┘
                                   │
                   ┌───────────────▼─────────────────────────────┐
                   │ SUBSTEP 2.3: Activation Settings            │
                   │ • Activation type (now vs scheduled)        │
                   │ • Activation date (if scheduled)            │
                   │ • Device compatibility confirmation         │
                   │ • FAQ inline                                │
                   │ → Continues to Step 3                      │
                   └───────────────┬─────────────────────────────┘
                                   │
                        ┌──────────▼──────────────┐
                        │ STEP 3: Payment         │
                        │ /compra (same URL)      │
                        └──────────────┬──────────┘
                                       │
                   ┌───────────────────┴────────────────────┐
                   │ User:                                  │
                   │ • Selects payment method (Stripe)     │
                   │ • Reviews order summary               │
                   │ • Accepts terms & conditions          │
                   │ • Clicks "Pagar [amount]"             │
                   └───────────────────┬────────────────────┘
                                       │
            ┌──────────────────────────▼──────────────────────────┐
            │ API /checkout POST                                  │
            │ • Rate limiting (10 req/IP/min)                   │
            │ • Validates all input server-side                  │
            │ • Creates b2c_orders row (pending_payment)         │
            │ • Creates Stripe checkout session                  │
            │ • Returns session URL                              │
            └──────────────────────────┬──────────────────────────┘
                                       │
            ┌──────────────────────────▼──────────────────────────┐
            │ USER REDIRECTS TO STRIPE CHECKOUT                   │
            │ (Hosted Checkout - Stripe UI, not custom form)      │
            │ • Stripe payment form                               │
            │ • Card entry / Apple Pay / Google Pay               │
            │ • Cardholder details                                │
            │ • 2FA if required                                   │
            └──────────────────────────┬──────────────────────────┘
                                       │
            ┌──────────────────────────▼──────────────────────────┐
            │ STRIPE PROCESSES PAYMENT                             │
            │ Success → success_url with session_id              │
            │ Cancel  → cancel_url back to /compra?plan=[id]     │
            └──────────────────────────┬──────────────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │ SUCCESS PAGE               │
                        │ /confirmacion?ref=[ref]    │
                        │ &qty=[qty]&plan=[id]       │
                        │ &session_id=[session_id]   │
                        └──────────────┬──────────────┘
                                       │
                   ┌───────────────────┴────────────────────┐
                   │ User sees:                            │
                   │ • Checkmark icon (green)              │
                   │ • "Compra realizada" title            │
                   │ • Order reference number              │
                   │ • 3-step next actions                 │
                   │ • Email confirmation notice           │
                   │ • WhatsApp support link               │
                   │ • Back to home link                   │
                   └───────────────────┬────────────────────┘
                                       │
                   ┌───────────────────▼────────────────────┐
                   │ BACKGROUND PROCESSES                  │
                   │ • Stripe webhook → order status update │
                   │ • Email sent (QR code)                 │
                   │ • GA4 purchase event                   │
                   │ • Order processing begins              │
                   └───────────────────────────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │ END: Email + QR received    │
                        │ User activates eSIM         │
                        └────────────────────────────┘
```

### Error & Recovery Paths

**User Journey Branching:**

1. **Plan Selection Errors:**
   - No plan selected → "Continuar" button disabled
   - Invalid quantity → Clamped to 1-10 range

2. **Data Entry Errors:**
   - Email mismatch → Error message on confirm_email field
   - Missing required fields → Auto-focus + error message
   - Age validation → Max DOB set to 18 years ago
   - Passport validation → Min 5 chars
   - Device compatibility not checked → Checkbox required

3. **Payment Errors:**
   - API rate limit (10 req/IP/min) → 429 response
   - Stripe session creation fails → Generic "Error al procesar el pago"
   - Network failure → Error retained until retry
   - Invalid terms acceptance → "Pagar" button disabled until checked

4. **Recovery Options:**
   - All steps have back buttons
   - User can edit any step without losing progress
   - Can switch payment method (currently Stripe only)
   - MercadoPago returns 501 (not implemented) with helpful message

---

## 🎨 UX AUDIT BY SCREEN

### STEP 1: PLAN SELECTION

**File:** `src/components/purchase/StepPlan.tsx`

#### Visual Assessment

| Aspect | Rating | Details |
|--------|:------:|---------|
| **Hierarchy** | 6/10 | Plan cards readable but not premium; no clear CTA visual weight |
| **Spacing** | 5/10 | Gaps feel cramped (gap-3 between cards); padding inside cards (p-5) smaller than Design System |
| **Color** | 4/10 | Uses direct hex (#C9973A, #1B2F4E) instead of CSS variables from Design System |
| **Typography** | 6/10 | Font sizes reasonable but not aligned with Design System scales |
| **Responsiveness** | 7/10 | Grid layout responsive but gaps too small on mobile |
| **Animation** | 6/10 | Tab transition smooth (layoutId), card selection has tap scale, but no continuous micro-interactions |
| **Trust** | 7/10 | Badge for popular plan, feature list helps |
| **Mobile** | 5/10 | Summary sidebar not visible on mobile — information loss |
| **Accessibility** | 7/10 | Radio buttons accessible, labels clear, but some focus states could be stronger |
| **Consistency w/ Home** | 3/10 | Breaks from Home's premium editorial feel; feels like traditional checkout |

#### Component Breakdown

**Left Side (Plan List):**
- Tab switcher (Local / DataOnly) — works fine but tab background animation feels generic
- Plan cards:
  - Border: 2px (good visibility)
  - Color on select: gold (#C9973A)
  - Shadow on select: weak (0_4px_24px_-8px with red — red is wrong, should use navy)
  - Pricing section: right-aligned, small text for "per month"
  - Features: None shown until step 2

**Quantity Selector:**
- Buttons 1-10 (w-10 h-10) — good for desktop, cramped on mobile
- Color on select: gold background, white text
- Hover state: subtle gold/10 background
- No visual feedback for click (no scale)

**Right Sidebar (Summary):**
- Sticky positioning (top-6)
- Shows selected plan name, type badge, top 4 features
- Quantity multiplication (if qty > 1)
- Total price (bold, 2xl)
- "USD · pago único" disclaimer
- CTA button: "Continuar"

#### Issues Identified

1. **Shadow Color Wrong** — Red shadow (#e60000) when selected; should use navy or transparent
2. **No Micro-Interactions** — Plan cards should have subtle scale/lift on hover
3. **Sidebar Hidden on Mobile** — No mobile summary shown; critical info inaccessible
4. **Spacing Inconsistent** — Gap-3 between cards, but Design System uses consistent 8px increments (gap-6 standard in Home)
5. **Badge Not Premium** — Red badge feels default Bootstrap, not Aman Style
6. **Tab Switcher Bland** — No visual distinction from rest of UI
7. **No Confirmation State** — After selection, should show visual confirmation (e.g., checkmark)

---

### STEP 2: CUSTOMER DATA

**File:** `src/components/purchase/StepData.tsx`

#### Visual Assessment

| Aspect | Rating | Details |
|--------|:------:|---------|
| **Hierarchy** | 5/10 | Sub-step indicators present but visual hierarchy weak |
| **Spacing** | 4/10 | Form fields cramped (gap-6 is Design System, but internal margins too tight) |
| **Color** | 3/10 | Form inputs use border-[#1B2F4E]/12 — too light; focus color not prominent |
| **Typography** | 5/10 | Labels present but font weight inconsistent with Design System |
| **Responsiveness** | 6/10 | Responsive grid for name/lastname, but cramped on tablet |
| **Animation** | 3/10 | No step transitions between substeps; abrupt changes |
| **Trust** | 4/10 | Error states functional but not elegant; red color harsh |
| **Mobile** | 4/10 | Form fields stacked but summary sidebar blocks content |
| **Accessibility** | 6/10 | Labels present, error messages linked to fields, but focus states weak |
| **Consistency w/ Home** | 2/10 | Form styling completely different from Design System; looks like generic web form |

#### Component Breakdown

**Substep 2.1 — Basic Info:**
- Heading: "Tu información básica" + subtext
- Quantity selector (repeated from Step 1) — duplication, should be single state
- Name + Lastname fields (grid-cols-2, sm:grid-cols-2)
  - Input class: border-[#1B2F4E]/12, focus border gold, focus ring gold/10
  - Placeholder: "Juan", "García"
  - Auto-complete: given-name, family-name
- Email + Confirm Email
  - Email fields have auto-complete
  - Confirm email has `onPaste: preventDefault()` — good security pattern
  - Helper text: "Te vamos a enviar los QR a este email..."
- Error display: WarningCircle icon + red text below field

**Substep 2.2 — Identity Validation:**
- Heading: "Validación de identidad" + compliance note
- Country dropdown (auto-populated by IP geolocation)
- Passport input (text, min 5 chars)
- DOB input (date picker, max = 18 years ago)
- Helper text: "Usamos esto para verificar..."

**Substep 2.3 — Activation Settings:**
- Heading: "Cuándo empieza tu plan"
- For Local plans:
  - Radio button: "Activación inmediata" with subtext
  - Radio button: "Programar fecha" with date picker (min today, max 12 months)
  - Blue background wrapper (#EBF6FC) — too light, doesn't match Design System
- For DataOnly plans:
  - Info box: "Se envía el QR... 60 días para escanearlo"
  - Info color: #C9973A (gold) — good but inconsistent with blue substep 2.2
- Device compatibility checkbox:
  - Checkbox with required validation
  - Link to compatible devices list
  - Error state: bg-red-50 border-red-300 — harsh

**Navigation:**
- Back button (text, no variant styling)
- Continue button (gold background)
- No visual indication of progress between substeps

#### Issues Identified

1. **Substep Transitions Not Animated** — No fade/slide between substeps; feels jarring
2. **Color Inconsistency** — Substep 2.1 no background, 2.2 no background, 2.3 light blue — no visual unity
3. **Quantity Selector Duplication** — Already in Step 1, repeated here; state should sync
4. **Form Input Styling Generic** — Border too light; focus ring barely visible
5. **Helper Text Color** — #999 too light for some backgrounds; contrast issue
6. **Mobile Summary Hidden** — Sticky sidebar blocks form on phones
7. **Passport Field Too Generic** — No country-specific formatting hints (AR? MX?)
8. **FAQ Placement** — At end of step 2.3, not visible until user scrolls down
9. **Date Picker Native** — No custom styling; looks inconsistent with form

---

### STEP 3: PAYMENT

**File:** `src/components/purchase/StepPayment.tsx`

#### Visual Assessment

| Aspect | Rating | Details |
|--------|:------:|---------|
| **Hierarchy** | 6/10 | Payment method selection clear, summary clear, but overall layout generic |
| **Spacing** | 5/10 | Card padding adequate but gaps feel loose (space-y-5) |
| **Color** | 5/10 | Trust badges use proper colors but payment method card is too subtle |
| **Typography** | 6/10 | Text sizing okay but weights inconsistent |
| **Responsiveness** | 7/10 | Layout responsive, payment method stacks well on mobile |
| **Animation** | 5/10 | Card logos fade in when Stripe selected, but minimal micro-interactions |
| **Trust** | 8/10 | Stripe badge, lock icons, T&C links — good trust signals |
| **Mobile** | 6/10 | Summary sidebar visible but cramped |
| **Accessibility** | 6/10 | Radio buttons accessible but focus states weak |
| **Consistency w/ Home** | 3/10 | Trust badges don't match Design System aesthetic |

#### Component Breakdown

**Payment Method Section:**
- "Elegí tu método de pago" heading
- Radio button options:
  - **Stripe (Card):**
    - Radio circle + text
    - Subtext: "Tarjeta de crédito, Apple Pay, Link"
    - Card logos appear on select (Visa, Mastercard, Amex)
    - Border color on select: gold (#C9973A)
    - Background on select: gold/3 (very light)
  - **MercadoPago:** (hidden, commented out as "próximamente")
- CreditCard icon (right aligned)

**Trust Badges:**
- Lock icon + "Pago seguro"
- Stripe badge: inline-flex with shield icon, "Procesado por Stripe" text + Stripe logo SVG
- Background: #F8F8F8 (gray)
- Border: subtle

**Informational Text:**
- Stripe explanation: "El pago se procesa de forma segura..."
- No emoji used (good)

**Terms & Conditions:**
- Checkbox (required)
- Text: "He leído y acepto los Términos y Condiciones..." (localized for PT/ES)
- Links are underlined (accessibility good)
- Background: #F8F8F8
- Error state: red background if not checked

**Order Summary (Sticky Sidebar):**
- Plan name × quantity
- Email (truncated if long)
- Total price (2xl, bold)
- "USD · pago único · sin renovación automática"
- Mini trust badge at bottom: lock + "No almacenamos datos de tarjeta"

**CTA Button:**
- "Pagar [AMOUNT]" with ArrowRight icon
- Disabled if terms not accepted or loading
- Loading state: spinner + "Procesando..."
- Styling: primary variant (gold)

#### Issues Identified

1. **Only One Payment Method** — Stripe; MercadoPago hidden (shows 501 "próximamente")
2. **Generic Trust Badges** — Work but feel corporate, not premium
3. **T&C Box Too Prominent** — Takes up significant space; could be more elegant
4. **No Payment Method Icons** — Card logos shown only when Stripe selected; should show alongside
5. **No Error Recovery UI** — If payment fails, error message appears but no retry animation
6. **Processing Spinner Boring** — Basic CSS spinner; could be more polished
7. **No Address Fields** — Stripe requires no additional fields (best practice), but US/Locale assumption could be clearer
8. **Summary Not Totaled** — No breakdown (plan × qty + any future discounts/fees)

---

### SUCCESS PAGE (CONFIRMATION)

**File:** `src/app/[locale]/confirmacion/page.tsx`

#### Visual Assessment

| Aspect | Rating | Details |
|--------|:------:|---------|
| **Hierarchy** | 8/10 | Clear visual hierarchy; icon, title, order ref prominent |
| **Spacing** | 7/10 | Good breathing room; margins generous |
| **Color** | 7/10 | Green checkmark (emerald) appropriate; background soft |
| **Typography** | 8/10 | Title bold, steps numbered, clear hierarchy |
| **Responsiveness** | 8/10 | Centered layout responsive; works well on mobile |
| **Animation** | 7/10 | Stagger animation on enter; smooth fade-in of elements |
| **Trust** | 9/10 | Order reference visible; next steps clear |
| **Mobile** | 8/10 | Excellent on mobile; no horizontal scroll |
| **Accessibility** | 7/10 | CheckCircle icon descriptive; semantics clear |
| **Consistency w/ Home** | 6/10 | Not as premium as Home, but acceptable success page |

#### Component Breakdown

**Layout:**
- Centered max-width 520px
- min-height-[100dvh] (good, uses dvh not vh)
- Padding responsive (px-4)

**Icon:**
- CheckCircle (40px) in emerald circle (emerald-50 bg, emerald-100 border, emerald-500 icon)
- Good visual confirmation

**Title:**
- "¡Compra realizada!" (text-2xl sm:text-3xl)
- Font black, tracking tight
- Navy color

**Subtitle:**
- "Te enviamos un email con el QR" (text-[#555555])
- Leading relaxed

**Order Reference:**
- Monospace font
- Centered in white box with border
- Label: "NÚMERO DE PEDIDO"
- Value: [orderRef] (e.g., "RUTA-20260702-ABC123")

**Next Steps:**
- Heading: "Próximos pasos"
- Numbered list (1, 2, 3 in gold circles)
- Steps (from i18n):
  1. "Revisá tu email..." (QR)
  2. "Escanear QR..." (App)
  3. "Disfruta tu conexión" (Use it)

**SLA Notice:**
- Clock icon + "Procesamos tu compra en menos de 2 horas"
- Gray text, small

**CTA:**
- WhatsApp link (navy button, "Contactá a soporte")
- Back to home link (text link, gray)

**Animation:**
- Stagger effect (all elements cascade in)
- FadeUp variant on each element
- Smooth, not rushed

#### Issues Identified

1. **Not Aligned with Design System** — Emerald color not in Design System (navy + gold theme)
2. **Success Page Isolated** — Different visual language from checkout flow
3. **No Order Details** — Order reference only; no itemized receipt
4. **Limited Next Actions** — Only WhatsApp support and back home
5. **Timestamp Missing** — When was order created? (Could show "Procesada el 2 de julio a las 14:32")
6. **No Email Resend Option** — If user didn't receive email, no way to trigger resend
7. **No Social Share** — "Compartir compra" could encourage referrals
8. **QR Not Shown** — Page tells user to check email, but QR not previewed here

---

### FAQ COMPONENT (INLINE)

**File:** `src/components/purchase/PurchaseFAQ.tsx`

#### Visual Assessment

| Aspect | Rating | Details |
|--------|:------:|---------|
| **Hierarchy** | 6/10 | Accordion structure clear but not prominent |
| **Spacing** | 6/10 | Padding adequate but could breathe more |
| **Color** | 5/10 | Icon gold (good), text generic |
| **Typography** | 6/10 | Questions bold, answers readable |
| **Responsiveness** | 7/10 | Accordion works on mobile |
| **Animation** | 4/10 | No animation on expand/collapse; instant reveal |
| **Trust** | 7/10 | Device compatibility list comprehensive |
| **Mobile** | 6/10 | Works but device list very long |
| **Accessibility** | 5/10 | Buttons used (good) but no ARIA labels for accordion |
| **Consistency w/ Home** | 3/10 | Accordion style doesn't match Design System |

#### Issues Identified

1. **No Expand/Collapse Animation** — Should slide open smoothly
2. **Device List Overwhelming** — 13 brands × multiple models; UI breaks on mobile
3. **Caret Icon** — Rotates but no transition; feels abrupt
4. **Placement** — At end of Step 2.3; not discoverable until user scrolls
5. **No Search** — Device list not filterable; hard to find your device
6. **Emoji in Content** — "📱", "📆", "ℹ️", "⚠️" — violates Design System (should use icons)
7. **Link Colors** — "Ver celulares compatibles" link uses gold; consistent but could be more subtle

---

## 🔍 GAP ANALYSIS: Current vs. Design System

### Design System Reference (From Phase 2-3)

**Established Standards:**
- **Color Palette:**
  - Navy: #1B2F4E (primary)
  - Gold: #C9973A (accent)
  - Warm White: #FFF8F4 (backgrounds)
  - Borders: #1B2F4E/8 to #1B2F4E/12 (subtle)
  
- **Typography:**
  - Display: text-5xl lg:text-6xl, font-display, tracking-tight
  - Headline: text-lg sm:text-2xl, font-black
  - Body: text-base, leading-relaxed, text-[#555]
  - Accent: font-black or font-bold depending on context
  
- **Spacing System:**
  - Gap between major sections: gap-6 (Home standard)
  - Card padding: p-6 to p-8 (Home standard)
  - Field gaps: gap-3 inside forms (compact)
  - Margins: mb-4 to mb-6 (consistent increments)
  
- **Components:**
  - Cards: rounded-2xl, border border-black/[0.07], shadow-sm or none
  - Buttons: rounded-xl (or full for secondary), transition-all, motion-safe:active:scale-[0.97]
  - Inputs: rounded-xl, border-[#1B2F4E]/12, focus:border gold focus:ring gold/10
  - Badges: Inline with icon + text, color-coded
  
- **Motion:**
  - EASE_OUT: [0.23, 1, 0.32, 1]
  - Durations: 0.3s (main), 0.2s (secondary)
  - Micro-interactions: Subtle scale/fade on interaction
  - Stagger: 0.05-0.08s between items
  
- **Aesthetic:**
  - Premium, editorial, travel-focused
  - 85% imagery, 15% interface (when applicable)
  - Clean typography hierarchy
  - Generous whitespace
  - Subtle shadows and gradients only
  - No neon, no excessive glow, no skeuomorphism

### Current Implementation Deviations

#### 1. Color System

| Element | Current | Design System | Gap |
|---------|---------|---------------|-----|
| Primary Navy | #1B2F4E | #1B2F4E | ✅ Correct |
| Gold Accent | #C9973A | #C9973A | ✅ Correct |
| Backgrounds | #F8F8F8 | #FFF8F4 (warm white) | ❌ Too cold |
| Borders | #ddd, #1B2F4E/8 | #1B2F4E/8 | ⚠️ Inconsistent |
| Error Red | #DC2626 | Not in Design System | ❌ Harsh |
| Focus Ring | gold/10 | gold/10 | ✅ Correct |
| Emerald (Success) | emerald-50/100/500 | Not in palette | ❌ Foreign color |

**Issue:** Success page uses emerald; should use gold or navy gradient

#### 2. Typography

| Element | Current | Design System | Gap |
|---------|---------|---------------|-----|
| Main H1 | text-2xl | text-4xl-6xl | ❌ Too small |
| Section H3 | text-lg | text-xl-2xl | ⚠️ Small |
| Body | text-sm | text-base | ❌ Too small |
| Labels | text-sm | text-sm | ✅ Correct |
| Numbers (Price) | text-2xl | text-3xl-4xl | ⚠️ Small |

**Issue:** Overall typography scale 1-2 notches too small; feels cramped vs. Home

#### 3. Spacing

| Component | Current | Design System | Gap |
|-----------|---------|---------------|-----|
| Card padding | p-5 | p-6 to p-8 | ❌ Cramped |
| Field gap | gap-6 | gap-6 | ✅ Correct |
| Section gap | space-y-6 | gap-6-8 | ⚠️ Tight |
| Border radius | rounded-2xl | rounded-2xl | ✅ Correct |
| Summary sidebar gap-y | space-y-2 | space-y-3 | ❌ Dense |

**Issue:** Overall spacing feels compressed; cards and fields crowded vs. Home

#### 4. Button Styling

| Aspect | Current | Design System | Gap |
|--------|---------|---------------|-----|
| Border radius | rounded-xl | rounded-xl | ✅ Correct |
| Font weight | font-bold/semibold | font-bold | ✅ Correct |
| Padding | px-4 py-3 (md), px-7 py-3.5 (lg) | Consistent | ✅ Correct |
| Active scale | 0.97 | 0.97 | ✅ Correct |
| Disabled opacity | opacity-50 | opacity-50 | ✅ Correct |
| **Styling** | Direct colors | CSS Variables | ❌ Uses hex not vars |

**Issue:** Buttons look good but should use CSS custom properties (--color-gold, --color-navy)

#### 5. Card/Container Styling

| Aspect | Current | Design System | Gap |
|--------|---------|---------------|-----|
| Border radius | rounded-2xl | rounded-2xl | ✅ Correct |
| Border | border-black/[0.07] | border-black/[0.07] | ✅ Correct |
| Shadow | Shadow-lg or none | None or subtle | ⚠️ Some too prominent |
| Background | #ffffff or #F0F0F0 | #ffffff or #FFF8F4 | ⚠️ Gray instead of warm |

**Issue:** Background cards use #F0F0F0 (gray) instead of #FFF8F4 (warm white)

#### 6. Input Styling

| Aspect | Current | Design System | Gap |
|--------|---------|---------------|-----|
| Border color | border-[#1B2F4E]/12 | border-[#1B2F4E]/12 | ✅ Correct |
| Focus border | focus:border-[#C9973A] | focus:border-gold | ✅ Correct |
| Focus ring | focus:ring-[#C9973A]/10 | focus:ring-gold/10 | ✅ Correct |
| Placeholder | placeholder:text-[#999] | placeholder:text-ink-2 | ✅ Correct |
| Background | bg-white | bg-white | ✅ Correct |

**Issue:** Input styling is correct

#### 7. Form State Colors

| State | Current | Issue |
|-------|---------|-------|
| Error | #DC2626 | Not in Design System; too harsh |
| Success | emerald | Not available; should use gold |
| Warning | #FFF8F0 with orange | Not consistent with Design System |
| Info | #EBF6FC with blue | Not consistent; should use navy/gold |

**Issue:** Form states use colors outside Design System palette

#### 8. Animation & Motion

| Aspect | Current | Design System | Gap |
|--------|---------|---------------|-----|
| EASE_OUT | [0.23, 1, 0.32, 1] | [0.23, 1, 0.32, 1] | ✅ Correct |
| Duration | 0.2-0.3s | 0.3s standard | ⚠️ Slightly fast |
| Stagger | 0.05-0.08s | 0.05s+ | ✅ Correct |
| Micro-interactions | Minimal | Should have more | ❌ Sparse |
| Page transitions | Fade + scale | Should match Home | ❌ Different |

**Issue:** Not enough micro-interactions; feels static vs. dynamic Home

#### 9. Responsive Breakpoints

| Breakpoint | Current | Design System | Gap |
|------------|---------|---------------|-----|
| sm (640px) | Used | Used | ✅ Correct |
| md (768px) | Limited | Used heavily | ⚠️ Underused |
| lg (1024px) | Used for sidebar | Used | ✅ Correct |
| Tablet behavior | Summary sidebar hides | Should adapt | ❌ Content loss |

**Issue:** Mobile summary sidebar hidden; tablet layout breaks

#### 10. Aesthetic Misalignment

| Aspect | Current Feel | Design System Feel | Gap |
|--------|--------------|-------------------|-----|
| Overall | Transactional, SaaS-like | Premium, Editorial, Travel | ❌ Major |
| Language | Functional, form-focused | Narrative, experience-focused | ❌ Major |
| Visual Density | Compressed, efficient | Spacious, generous | ❌ Major |
| Trust Signals | Present (badges, security) | Present + premium feel | ⚠️ Institutional vs. Premium |

**Issue:** Entire checkout feels like utilitarian transaction, not premium travel experience

---

## 🎯 PRIORITY ISSUES (Ranked by Impact)

### CRITICAL (P0) — Blocks Premium Feel

1. **Color System Misalignment**
   - Success page uses emerald (not in palette)
   - Info boxes use arbitrary blue (#EBF6FC)
   - Gray backgrounds (#F0F0F0) instead of warm white
   - Error red (#DC2626) is harsh
   - **Impact:** Visual incoherence with Design System
   - **Effort:** Low (CSS only)

2. **Typography Scale Too Small**
   - All headings and body text 1-2 notches smaller than Home
   - Prices (2xl) should be 3xl-4xl
   - **Impact:** Feels cramped, less premium
   - **Effort:** Medium (may require layout adjustments)

3. **Mobile Summary Hidden**
   - Sidebar with order total not visible on mobile
   - User loses trust signals at critical payment moment
   - **Impact:** High conversion impact
   - **Effort:** Medium (layout restructuring)

4. **Spacing Too Tight**
   - Card padding p-5 instead of p-6/p-8
   - Section gaps space-y-5 instead of space-y-6/gap-8
   - Sidebar spacing cramped (space-y-2)
   - **Impact:** Feels dense, not premium
   - **Effort:** Low (CSS padding/margin changes)

5. **Card Background Color**
   - Gray (#F0F0F8) instead of warm white (#FFF8F4)
   - Gives institutional feel instead of premium
   - **Impact:** Visual tone shift
   - **Effort:** Low (CSS color change)

### HIGH (P1) — Affects Premium Perception

6. **Minimal Micro-Interactions**
   - No hover effects on plan cards (no lift/scale)
   - No smooth transitions between substeps in Step 2
   - FAQ accordion no expand animation
   - Payment method selection no visual feedback
   - **Impact:** Feels static vs. dynamic Home
   - **Effort:** Medium (Framer Motion additions)

7. **Form Validation States**
   - Error states use harsh red (#DC2626)
   - Success state uses emerald (not in palette)
   - Info boxes not cohesive
   - **Impact:** Breaks premium aesthetic during errors
   - **Effort:** Low (color + styling)

8. **No CSS Custom Properties**
   - Buttons, cards, inputs use hardcoded hex values
   - Not leveraging Design System tokens
   - Makes future changes harder
   - **Impact:** Technical debt, maintainability
   - **Effort:** Medium (refactoring)

9. **Input Focus States**
   - Focus rings visible but subtle
   - Should be more prominent for premium feel
   - **Impact:** Accessibility + premium feel
   - **Effort:** Low (CSS ring adjustment)

10. **Success Page Color Scheme**
    - Emerald/green theme breaks from navy+gold
    - Should integrate with Design System
    - **Impact:** Tonal disconnect at moment of success
    - **Effort:** Low (color updates)

### MEDIUM (P2) — UX Improvements

11. **Quantity Selector Duplication**
    - Appears in Step 1 and Step 2.1
    - State not unified
    - **Impact:** Confusing, potential data mismatch
    - **Effort:** Medium (state management)

12. **Substep Transitions Not Animated**
    - User moves between substeps instantly
    - Should have fade/slide transition
    - **Impact:** Feels jarring
    - **Effort:** Low (Framer Motion)

13. **FAQ Placement**
    - At end of Step 2.3, below device checkbox
    - Not discoverable; user must scroll far
    - **Impact:** Low engagement with FAQ
    - **Effort:** Medium (restructuring)

14. **Device List UI**
    - Long accordion with 13+ brands
    - No search/filter
    - Overwhelming on mobile
    - **Impact:** Hard to find device
    - **Effort:** High (UI redesign + search)

15. **Order Summary Details**
    - Success page shows only order ref
    - No itemized receipt
    - No order details view
    - **Impact:** User uncertainty
    - **Effort:** Medium (new component)

### LOW (P3) — Polish

16. **Emoji in Content**
    - "📱", "📆", "⚠️" used instead of icons
    - Violates Design System (SVG icons only)
    - **Impact:** Inconsistent icon language
    - **Effort:** Low (replace with icons)

17. **Processing Spinner**
    - Basic CSS spinner
    - Should be more premium (Framer Motion)
    - **Impact:** Micro-polish
    - **Effort:** Low (animation update)

18. **Card Shadow Colors**
    - Red shadow on select (#e60000) — wrong color
    - Should use navy or transparent
    - **Impact:** Color theory error
    - **Effort:** Low (CSS fix)

19. **Tab Switcher Design**
    - Functional but generic
    - Could be more premium (underline, scale)
    - **Impact:** Polish
    - **Effort:** Low

20. **Loading States**
    - Minimal feedback; only processing spinner
    - Could have skeleton screens
    - **Impact:** User perception of speed
    - **Effort:** Medium

---

## 🏗️ IMPLEMENTATION ROADMAP

### BLOCK A: Color System Alignment (1 PR)
**Difficulty:** Low  
**Risk:** Low  
**Impact:** High  
**Effort:** 2-3 hours

- [ ] Replace all color hardcodes with Design System hex values
- [ ] Change success page emerald → gold/navy
- [ ] Change info box blue → navy/gold combinations
- [ ] Change gray backgrounds → warm white
- [ ] Update error red → darker, softer tone
- [ ] Verify contrast ratios (WCAG AA)

**Files to modify:**
- `StepPlan.tsx` (card shadow, backgrounds)
- `StepData.tsx` (info boxes, backgrounds)
- `StepPayment.tsx` (backgrounds)
- `ConfirmacionPage.tsx` (emerald colors)

---

### BLOCK B: Typography & Spacing System (1 PR)
**Difficulty:** Medium  
**Risk:** Medium (layout changes)  
**Impact:** High  
**Effort:** 4-5 hours

- [ ] Increase all heading sizes (+1-2 notches)
- [ ] Increase body text from sm to base
- [ ] Increase price typography (2xl → 3xl/4xl)
- [ ] Increase card padding (p-5 → p-6/p-8)
- [ ] Adjust section gaps (space-y-5 → space-y-6/gap-8)
- [ ] Update sidebar spacing (space-y-2 → space-y-3)
- [ ] Test on mobile to ensure no overflow

**Files to modify:**
- `StepPlan.tsx` (card sizes, typography)
- `StepData.tsx` (form spacing, typography)
- `StepPayment.tsx` (card sizes)
- `ConfirmacionPage.tsx` (typography)

---

### BLOCK C: Mobile Responsiveness (1 PR)
**Difficulty:** High  
**Risk:** High (layout restructuring)  
**Impact:** Critical  
**Effort:** 6-8 hours

- [ ] Make summary sidebar visible on mobile (restructure as top card or drawer)
- [ ] Ensure all form fields readable on 375px
- [ ] Test quantity selector on mobile (buttons too small?)
- [ ] Device list needs search/filter for mobile
- [ ] Test hero image aspect ratio on tablet
- [ ] Implement hidden/visible strategy for different breakpoints

**Files to modify:**
- `StepPlan.tsx` (summary sidebar layout)
- `StepData.tsx` (summary sidebar layout)
- `StepPayment.tsx` (summary sidebar layout)
- `PurchaseFAQ.tsx` (device list search)

---

### BLOCK D: Micro-Interactions & Animation (1 PR)
**Difficulty:** Medium  
**Risk:** Low  
**Impact:** Medium (feel/polish)  
**Effort:** 4-6 hours

- [ ] Add hover lift/scale to plan cards
- [ ] Add smooth transitions between substeps
- [ ] Add expand/collapse animation to FAQ accordion
- [ ] Add micro-interactions to payment method selection
- [ ] Upgrade processing spinner (Framer Motion spring physics)
- [ ] Add stagger to success page elements (already done, but verify)
- [ ] Add quantity button press feedback (scale)

**Files to modify:**
- `StepPlan.tsx` (card hover effects)
- `StepData.tsx` (substep transitions)
- `StepPayment.tsx` (method selection animation)
- `PurchaseFAQ.tsx` (accordion animation)
- `ConfirmacionPage.tsx` (verify existing stagger)

---

### BLOCK E: Form State Styling (1 PR)
**Difficulty:** Low  
**Risk:** Low  
**Impact:** Medium  
**Effort:** 2-3 hours

- [ ] Replace error states (harsh red → softer tone with icon)
- [ ] Replace success states (emerald → gold)
- [ ] Replace info boxes (arbitrary blue → navy/gold)
- [ ] Add consistent form state color palette
- [ ] Update focus ring prominence
- [ ] Replace all emoji with SVG icons

**Files to modify:**
- `StepData.tsx` (error/info styling)
- `StepPayment.tsx` (T&C checkbox styling)
- `PurchaseFAQ.tsx` (emoji → icons)

---

### BLOCK F: CSS Variable Refactoring (1 PR)
**Difficulty:** Medium  
**Risk:** Low  
**Impact:** Medium (maintainability)  
**Effort:** 3-4 hours

- [ ] Create Design System CSS variables file (--color-gold, --color-navy, --color-ink, etc.)
- [ ] Replace all hardcoded hex in purchase components with CSS vars
- [ ] Replace all hardcoded sizes with custom properties
- [ ] Create Tailwind CSS config to reference custom properties
- [ ] Verify all colors, shadows, radii match Design System

**Files to modify:**
- All component files (sed/find-replace for consistency)
- Update global CSS or Tailwind config

---

### BLOCK G: Mobile Summary Redesign (1 PR)
**Difficulty:** High  
**Risk:** High  
**Impact:** Critical  
**Effort:** 5-7 hours

**Two approach options:**
1. **Sticky Top Card** — Summary as collapsible card at top on mobile (show/hide)
2. **Bottom Drawer** — Summary in drawer accessible via sheet from bottom

**Recommendation:** Sticky top card (simpler, less disruptive)

- [ ] Extract summary into reusable component
- [ ] Create mobile-specific summary layout (card, not sidebar)
- [ ] Make summary sticky on mobile (top or bottom)
- [ ] Test interaction flow on 375px, 768px, 1440px
- [ ] Ensure no layout shift or overflow

**Files to modify:**
- `StepPlan.tsx` (extract summary)
- `StepData.tsx` (extract summary)
- `StepPayment.tsx` (extract summary)
- Create `PurchaseSummary.tsx` (new component)

---

### BLOCK H: Success Page Elevation (1 PR)
**Difficulty:** Medium  
**Risk:** Low  
**Impact:** Medium  
**Effort:** 3-4 hours

- [ ] Change emerald → navy/gold color scheme
- [ ] Add order details/itemized receipt
- [ ] Add email resend button
- [ ] Add timestamp ("Procesada el X a las XX:XX")
- [ ] Consider QR preview (or "QR enviado al email")
- [ ] Add social share buttons (optional)
- [ ] Increase typography scale

**Files to modify:**
- `ConfirmacionPage.tsx` (complete redesign)
- Create `ConfirmationDetails.tsx` (new component)

---

### BLOCK I: FAQ Search & Device Filter (1 PR)
**Difficulty:** High  
**Risk:** Medium  
**Impact:** Medium (UX)  
**Effort:** 4-6 hours

- [ ] Add search input to filter devices by brand/model
- [ ] Implement fuzzy search (brand name or model number)
- [ ] Reorganize device list into expandable sections
- [ ] Add "Copy model name" button
- [ ] Test with common devices (iPhone, Samsung Galaxy, etc.)
- [ ] Mobile: ensure search input accessible

**Files to modify:**
- `PurchaseFAQ.tsx` (major refactor)

---

### BLOCK J: Quantity State Unification (1 PR)
**Difficulty:** Low  
**Risk:** Low  
**Impact:** Low (prevent bugs)  
**Effort:** 1-2 hours

- [ ] Move quantity to top-level PurchaseFlow state
- [ ] Remove duplicate quantity selector from Step 2.1
- [ ] Keep single quantity selector in Step 1
- [ ] Sync state across all steps
- [ ] Test that quantity persists when navigating steps

**Files to modify:**
- `PurchaseFlow.tsx` (lift quantity to parent state)
- `StepData.tsx` (remove duplicate quantity selector)

---

## 📋 IMPLEMENTATION ORDER (Recommended Sequence)

### Phase 4.1 (Week 1)
1. **BLOCK A** — Color System Alignment (2-3h)
   - Unblocks visual coherence for all following PRs
   
2. **BLOCK B** — Typography & Spacing (4-5h)
   - Paired with BLOCK A for overall design system consistency
   
3. **BLOCK J** — Quantity State Unification (1-2h)
   - Quick bug prevention, low risk

### Phase 4.2 (Week 2)
4. **BLOCK E** — Form State Styling (2-3h)
   - Straightforward CSS updates
   
5. **BLOCK F** — CSS Variable Refactoring (3-4h)
   - Technical debt cleanup; enables future maintenance
   
6. **BLOCK D** — Micro-Interactions & Animation (4-6h)
   - Adds premium feel; moderate complexity

### Phase 4.3 (Week 3)
7. **BLOCK C** — Mobile Responsiveness (6-8h)
   - High complexity but critical; do after major styling settled
   
8. **BLOCK G** — Mobile Summary Redesign (5-7h)
   - Paired with BLOCK C; improves mobile experience significantly

### Phase 4.4 (Week 4)
9. **BLOCK H** — Success Page Elevation (3-4h)
   - Polish final touchpoint
   
10. **BLOCK I** — FAQ Search & Device Filter (4-6h)
    - Feature enhancement; improves UX but not blocking

**Total Estimated Effort:** 35-50 hours (4-6 weeks for one developer, or 2-3 weeks for two developers)

---

## ✅ QUALITY GATES FOR EACH PR

### Definition of Done (Per PR)

**Code Quality:**
- [ ] No new ESLint errors
- [ ] TypeScript compiles without errors
- [ ] No console warnings or errors
- [ ] Code follows component patterns established in Home
- [ ] Tailwind CSS classes grouped and organized

**Visual Quality:**
- [ ] Screenshots of all breakpoints (375px, 768px, 1440px)
- [ ] Comparison with Design System reference
- [ ] Color contrast verified (WCAG AA minimum)
- [ ] Typography hierarchy verified
- [ ] Spacing consistent with Design System

**Interaction Quality:**
- [ ] All form validations working
- [ ] Error states tested and visible
- [ ] Back buttons tested on all steps
- [ ] Mobile touch targets ≥44px
- [ ] Loading states tested (network throttle simulated)

**Responsive Quality:**
- [ ] No horizontal scroll on any breakpoint
- [ ] Content readable on 375px (minimum)
- [ ] Tablet (768px) layout optimal
- [ ] Desktop (1440px) layout optimal
- [ ] Tested on actual devices (not just browser)

**Accessibility:**
- [ ] Form labels properly associated
- [ ] Error messages linked to fields
- [ ] Focus order logical
- [ ] Screen reader tested (basic)
- [ ] Color not only conveying meaning
- [ ] Motion respects prefers-reduced-motion

**Analytics:**
- [ ] All existing analytics events fire correctly
- [ ] No double-tracking on step transitions
- [ ] GA4 events properly formatted

**Performance:**
- [ ] No new performance regressions
- [ ] LCP < 2.5s (Core Web Vitals)
- [ ] CLS < 0.1 (no layout shifts)
- [ ] First Contentful Paint < 1.5s

**Testing:**
- [ ] Manual end-to-end test (Step 1 → Step 3 → Success)
- [ ] Error path tested (invalid email, missing passport, etc.)
- [ ] Back navigation tested
- [ ] Mobile test (actual device or good emulation)

---

## 🚨 RISKS & MITIGATION

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Layout shifts during styling updates | High | High | Use CSS Grid/Flexbox carefully; test on multiple devices |
| Mobile summary restructure breaks layout | High | High | Create new component; test incrementally; use branch for experimentation |
| Typography changes affect form heights | Medium | Medium | Plan padding adjustments ahead; test thoroughly |
| State management for quantity breaks | Low | Medium | Unit test quantity state lift; verify across all steps |
| Framer Motion conflicts with Tailwind transitions | Low | Low | Use CSS variables for durations; avoid conflicting duration specs |

### UX Risks

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Changes confuse users mid-purchase | Low | High | Don't change step flow; only visual updates |
| Mobile summary removal causes confusion | Medium | High | A/B test before full rollout; add onboarding if needed |
| New animations feel slow | Low | Medium | Keep duration ≤300ms; test with network throttle |

### Timeline Risks

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Mobile work takes longer than estimated | High | Medium | Start BLOCK C early; allocate 8-10 hours, not 6-8 |
| CSS Variable refactoring introduces bugs | Low | High | Create branch; test against old version; incremental rollout |
| Design System misalignment discovered mid-work | Low | Medium | Daily visual comparison; weekly design sync |

---

## 🎯 SUCCESS CRITERIA

### For Each Block

**BLOCK A (Color):**
- [ ] All colors match Design System or Design System-approved palette
- [ ] Success page uses navy/gold, not emerald
- [ ] No arbitrary blues or grays outside Design System
- [ ] WCAG AA contrast verified

**BLOCK B (Typography & Spacing):**
- [ ] Headlines feel premium (larger, more prominent)
- [ ] Body text readable and generous
- [ ] Prices dramatic and prominent
- [ ] Cards breathe (not cramped)
- [ ] Spacing proportional to Home

**BLOCK C (Mobile):**
- [ ] No horizontal scroll on 375px
- [ ] Summary visible and accessible on mobile
- [ ] Form fields readable on all breakpoints
- [ ] Touch targets ≥44px
- [ ] Tested on actual device

**BLOCK D (Micro-Interactions):**
- [ ] Cards lift on hover (desktop)
- [ ] Substeps fade/slide between states
- [ ] FAQ smooth expand/collapse
- [ ] Payment method selection has feedback
- [ ] All animations <300ms

**BLOCK E (Form States):**
- [ ] Error states visible and actionable
- [ ] No harsh red colors
- [ ] All emoji replaced with icons
- [ ] Success state uses Design System colors

**BLOCK F (CSS Variables):**
- [ ] All color hardcodes replaced with CSS vars
- [ ] All sizes use Design System increments
- [ ] Build passes without warnings
- [ ] No visual regressions vs. block-by-block changes

**BLOCK G (Mobile Summary):**
- [ ] Summary accessible on mobile without hiding other content
- [ ] No layout shift on expand/collapse
- [ ] Sticky positioning works on mobile browsers (iOS, Android)
- [ ] Desktop layout unchanged

**BLOCK H (Success Page):**
- [ ] Color scheme matches Design System
- [ ] Order details visible
- [ ] Next steps clear and prominent
- [ ] Email resend option works

**BLOCK I (FAQ Search):**
- [ ] Search filters devices in real-time
- [ ] Results show matching brands/models
- [ ] Mobile keyboard works properly
- [ ] No performance lag with large device list

**BLOCK J (Quantity State):**
- [ ] Quantity persists across steps
- [ ] No duplicates or conflicts
- [ ] State syncs correctly in all directions

### Overall Success (Entire Phase 4)

**Visual Consistency:**
- Checkout flow feels visually cohesive with Home Page
- Color palette, typography, spacing consistent throughout
- No "jarring" transitions between checkout and success
- Premium editorial aesthetic maintained

**UX Improvement:**
- Customer journey clear and intuitive
- Mobile experience parity with desktop
- Error states helpful and not discouraging
- Trust signals prominent throughout

**Code Quality:**
- All components follow Design System patterns
- CSS custom properties used consistently
- Accessibility baseline met (WCAG AA)
- No performance regressions

**Measurable Metrics:**
- Conversion rate should not decrease (or improve)
- Mobile traffic should not drop
- Form completion time should not increase
- Support requests about unclear steps should not increase

---

## 📝 NEXT STEPS (After Approval)

1. **User Approves Plan** → I wait for explicit "Go ahead with BLOCK A" (or similar)
2. **Phase 4.1 Execution** → Create PR branches, implement BLOCKS A, B, J
3. **QA/Testing** → Each PR tested per Definition of Done
4. **Review** → User reviews screenshots, gives feedback
5. **Iterate** → If feedback, adjust; otherwise move to Phase 4.2
6. **Repeat** → Cycle through remaining blocks

**NO CODE CHANGES UNTIL APPROVAL.**

---

## 📚 REFERENCE MATERIALS

- Home Page Design System: `/docs/design/PHASE_2_HERO_REDESIGN_OPCIÓN_C.md`
- Color Reference: Design System CSS variables (extracted from Home)
- Typography Reference: Design System scales (extracted from Home)
- Spacing Reference: Home Page component padding/margin patterns
- Animation Reference: EASE_OUT curve and Framer Motion patterns from Home

---

**Report Generated:** 2026-07-02  
**Analysis Status:** ✅ Complete  
**Code Changes:** ❌ None (Analysis Only)  
**Ready for Implementation:** Pending User Approval

