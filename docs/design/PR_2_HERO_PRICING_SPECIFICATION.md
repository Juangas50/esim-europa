# PR 2 — ESPECIFICACIONES DE IMPLEMENTACIÓN

## Hero + Pricing Sections

**Fuente:** Design Pack v1.0 — Home Desktop, Home Mobile, Pricing Desktop  
**Scope:** Únicamente visual refinement, NO cambios de lógica  
**Restricciones:** No tocar Checkout, Footer, copy, precios (Stripe)

---

## COMPONENTE 1: HERO.TSX

### Estado actual (código):
```tsx
// src/components/landing/Hero.tsx
- Image-based hero with overlay
- Headline + subheadline
- CTA buttons (primary + secondary)
- Trust metrics at bottom
- Mobile responsive
```

### Mockups de referencia:
- `01_Art_Direction/02_hero_v2_three_concepts.png` (3 conceptos)
- `02_Home/01_home_desktop_v2_full.png` (hero top section)
- `02_Home/02_home_mobile_v2.png` (hero mobile)

### Cambios visuales requeridos:

**Layout (Desktop):**
- Hero image ratio: ~132% padding-bottom (actual: correcto)
- Split: ~60% image, 40% content overlay OR 50/50
- Content positioned: bottom-left o center-right
- Image: Full viewport width, object-position 50% 8%

**Content overlay:**
- Background: Dark gradient (black/80 to transparent)
- Position: Absolute, bottom-left or overlaid
- Headline: Serif (Prata), large, weight 400
- Subheadline: Sans-serif, weight 400
- CTA buttons: Primary (gold) + Secondary (navy outline)
- Spacing: Headline to subheadline: 12px, Subheadline to buttons: 16px

**Image:**
- Source: `/images/imagen8.png` (viajando en Europa)
- Object-fit: cover
- Object-position: 50% 8% (focus on faces)

**Mobile:**
- Image: Full width
- Content: Overlay at bottom (40% of viewport height)
- Headline: Responsive text size (clamp)
- Buttons: Full width or 90% width
- Padding: 16px sides

### Color palette:
- Background overlay: black/80 (rgba(0,0,0,0.8))
- Headline text: white
- Subheadline: white/90
- Buttons: Use token colors (primary gold, secondary navy)

### Typography:
- Headline: font-display (Prata), text-5xl sm:text-6xl lg:text-7xl
- Subheadline: font-sans, text-lg sm:text-xl
- Both: leading-tight or leading-relaxed (check mockup)

### Sombras:
- Content container: shadow-lg for elevation
- Image overlay gradient: Fade from dark to transparent

### Cambios específicos a Hero.tsx:

1. **Verificar image object-position** — Should focus on faces (50% 8%)
2. **Verificar content alignment** — Match mockup layout
3. **Button styling** — Use new tokens from PR1
4. **Trust metrics styling** — Icons + numbers + labels at bottom
5. **Responsive behavior** — Check mobile layout

### Responsive breakpoints:
- Mobile (375px): Full width, stacked buttons
- Tablet (768px): Adjusted padding, 1.5x buttons
- Desktop (1440px): Full hero, side-by-side content

---

## COMPONENTE 2: PLANS.TSX (Pricing)

### Estado actual (código):
```tsx
// src/components/landing/Plans.tsx
- Pricing grid (3 columns on desktop)
- Cards with plan name, data, price, features
- CTA button per card
- Mobile: Stack to 1 column
```

### Mockups de referencia:
- `03_Pricing/01_pricing_experience_desktop.png` (full pricing section)
- `02_Home/02_home_mobile_v2.png` (pricing mobile)
- `04_Mobile/01_mobile_home_checkout_pack.png` (mobile pricing)

### Cambios visuales requeridos:

**Layout (Desktop):**
- Heading + description at top
- Grid: 3 columns, equal width
- Card spacing (gap): 24px between cards
- Card width on desktop: ~360px (or calc-based)

**Card structure:**
```
┌─────────────────────┐
│ Plan Name + Badge   │  (8px)
│ Data (large)        │  (24px to validity)
│ Validity            │  (12px to price)
│ Price (large, gold) │  (16px to features)
│ Features list       │  (16px to button)
│ [CTA Button]        │
└─────────────────────┘
```

**Card styling:**
- Background: white (#FFFFFF)
- Border: 1px var(--color-border)
- Shadow: shadow-sm (or no shadow, check mockup)
- Radius: rounded-lg (8px)
- Padding: 24px (all sides)
- Hover: shadow-md (optional)

**Badge (if plan is highlighted):**
- Position: Top-right or inline with name
- Background: var(--color-gold)
- Text: white
- Padding: px-3 py-1
- Font: text-xs font-semibold

**Data amount:**
- Font size: Large (text-2xl or text-3xl)
- Color: var(--color-gold) OR var(--color-navy)
- Weight: font-bold

**Price:**
- Font size: text-2xl or text-3xl
- Color: var(--color-gold)
- Weight: font-bold
- Suffix: "/month" or "/plan"

**Validity:**
- Font size: text-sm
- Color: var(--color-ink-2)
- Text: "20 days validity" or "Unlimited"

**Features list:**
- Icon + text per feature
- Icon color: var(--color-gold) or var(--color-navy)
- Font size: text-sm
- Line height: 1.6
- Spacing between items: 8px

**CTA button:**
- Style: Primary (gold background)
- Width: Full width (100%) within card
- Height: 44px minimum
- Text: "Comprar ahora" or "Contratar"
- Hover: shadow-md, color lighter gold

**Heading section:**
- Title: "Planes flexibles para viajar sin preocupaciones"
- Subtitle: Description text
- Styling: Center-aligned or left-aligned (check mockup)
- Spacing: Title to cards: 32px

**Mobile (375px):**
- Grid: 1 column (full width)
- Card width: 90% or calc(100% - 32px)
- Padding: 16px sides
- Cards stack vertically

**Tablet (768px):**
- Grid: 2 columns (optional, check design)
- OR remain 1 column
- Card width: calc(50% - 12px) if 2 cols

### Color palette:
- Card background: white
- Border: var(--color-border)
- Data/Price text: var(--color-gold)
- Feature text: var(--color-ink)
- Buttons: var(--color-gold), hover var(--color-gold-light)

### Sombras:
- Default: shadow-sm (0 4px 12px 0 rgba(27, 47, 78, 0.06))
- Hover: shadow-md (0 12px 24px -2px rgba(27, 47, 78, 0.08))

### Cambios específicos a Plans.tsx:

1. **Card component usage** — Use new Card.tsx from PR1
2. **Spacing** — Verify gap-6 (24px) between cards
3. **Button styling** — Use primary variant
4. **Data/Price colors** — Use var(--color-gold)
5. **Features layout** — Icon + text alignment
6. **Mobile responsive** — Full width on mobile

### Responsive breakpoints:
- Mobile (375px): 1 column, 90% width
- Tablet (768px): 2 columns or 1 (check design)
- Desktop (1440px): 3 columns, max-w-7xl container

---

## IMPLEMENTACIÓN CHECKLIST

### Hero.tsx changes:
- [ ] Verify image object-position (50% 8%)
- [ ] Check headline/subheadline styling (serif vs sans)
- [ ] Button styling uses PR1 tokens
- [ ] Trust metrics icons + numbers styled
- [ ] Gradient overlay darkness adjusted if needed
- [ ] Mobile padding and responsive
- [ ] No text copy changes
- [ ] No button logic changes

### Plans.tsx changes:
- [ ] Use Card.tsx component (from PR1)
- [ ] Card spacing: gap-6 (24px)
- [ ] Data/Price text: var(--color-gold)
- [ ] Feature list: icon + text aligned
- [ ] Button: Full width, primary style
- [ ] Mobile: 1 column, full width
- [ ] Tablet: 2 or 1 column (per design)
- [ ] Desktop: 3 columns, max-w-7xl
- [ ] Badge (if needed): Styled with tokens
- [ ] No price changes
- [ ] No feature list changes
- [ ] No button logic changes

### Build & Lint:
- [ ] npm run build → SUCCESS
- [ ] npm run lint → No new errors
- [ ] All 34 routes compile

### Visual validation:
- [ ] Desktop: Hero + Pricing screenshots
- [ ] Mobile: Hero + Pricing screenshots
- [ ] Responsive: Test at 375px, 768px, 1440px
- [ ] Colors: Match tokens in globals.css
- [ ] Spacing: Match Design Pack
- [ ] Compare with mockups (100% match goal)
- [ ] Hover states work
- [ ] No layout shifts (CLS < 0.1)

---

## DESIGN PACK REFERENCES

**Hero images:**
- `01_design_vision_board.png` — Brand overview
- `02_hero_v2_three_concepts.png` — 3 hero layouts (A, B, C)
- `01_home_desktop_v2_full.png` — Desktop full page (hero visible)
- `02_home_mobile_v2.png` — Mobile hero

**Pricing images:**
- `01_pricing_experience_desktop.png` — Pricing grid
- `01_home_desktop_v2_full.png` — Pricing cards visible
- `02_home_mobile_v2.png` — Mobile pricing

---

## RESTRICCIONES (NO tocar):

- ❌ Checkout flow (PurchaseFlow.tsx)
- ❌ Footer
- ❌ Copy/text content
- ❌ Precios (managed by Stripe)
- ❌ Rutas
- ❌ Lógica funcional

---

## SIGUIENTE PASO

1. Revisar mockups de Design Pack
2. Comparar con código actual
3. Implementar cambios visuales
4. Ejecutar `npm run dev`
5. Tomar capturas Desktop (1440px)
6. Tomar capturas Mobile (375px)
7. Verificar responsive (768px)
8. Comparar con mockups
9. Generar resumen de cambios
10. Esperar aprobación

---

**Comenzando implementación ahora...**
