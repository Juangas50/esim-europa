# VISUAL IMPLEMENTATION PLAN — RUTA34 DESIGN PACK v1.0

**Documento de auditoría visual**  
**Fecha de análisis:** 2026-06-30  
**Fuente:** ~/Downloads/Ruta34_Design_Pack_v1.0  
**Estado:** Análisis completo — SIN IMPLEMENTACIÓN APLICADA

---

## 1. INVENTARIO DE IMÁGENES

### Estructura de la carpeta de diseño:
```
Ruta34_Design_Pack_v1.0/
├── 00_Docs/                          (Documentación)
├── 01_Art_Direction/                 (Dirección de arte)
│   ├── 01_design_vision_board.png    (1.7 MB)
│   └── 02_hero_v2_three_concepts.png (1.7 MB)
├── 02_Home/                          (Página de inicio)
│   ├── 01_home_desktop_v2_full.png   (1.6 MB)
│   └── 02_home_mobile_v2.png         (1.6 MB)
├── 03_Pricing/                       (Sección de precios)
│   └── 01_pricing_experience_desktop.png (1.5 MB)
├── 04_Mobile/                        (Vistas mobile)
│   ├── 01_mobile_home_checkout_pack.png (1.7 MB)
│   └── 02_mobile_checkout_flow.png   (1.5 MB)
├── 05_Checkout/                      (Flujo de checkout)
│   ├── 01_checkout_full_flow_concept.png (1.6 MB)
│   └── 02_checkout_desktop_pack.png  (1.5 MB)
├── 06_Email_Guide_Loader/            (Email, guía, loader)
│   ├── 01_final_success_loader_email_guide_errors.png (1.6 MB)
│   └── 02_loader_email_guide_variant.png (1.4 MB)
└── 07_Archive_Raw/                   (Conceptos raw/alternos)
    └── [22 imágenes de concepto]
```

### Clasificación por categoría:

#### **HOME (Página de inicio)**
- `01_design_vision_board.png` — Brand system & typography guide
- `02_hero_v2_three_concepts.png` — 3 hero layout concepts
- `01_home_desktop_v2_full.png` — Desktop full homepage
- `02_home_mobile_v2.png` — Mobile responsive homepage

#### **PRICING (Sección de precios)**
- `01_pricing_experience_desktop.png` — Pricing grid & comparison

#### **CHECKOUT (Flujo de compra)**
- `01_checkout_full_flow_concept.png` — Full checkout journey
- `02_checkout_desktop_pack.png` — Desktop checkout variants
- `02_mobile_checkout_flow.png` — Mobile checkout flow

#### **MOBILE (Vistas responsivas)**
- `01_mobile_home_checkout_pack.png` — Mobile hero + pricing + checkout
- Integrado en vistas de HOME y CHECKOUT

#### **EMAIL, GUIDE, LOADER**
- `01_final_success_loader_email_guide_errors.png` — Email templates, loaders, success states
- `02_loader_email_guide_variant.png` — Loader variants, setup guide, error states

#### **ARCHIVE/RAW (Conceptos alternativos)**
- 22 imágenes de concepto generado (inspiration, alternativas, no implementar)

---

## 2. ANÁLISIS VISUAL POR COMPONENTE

### 2.1 DIRECCIÓN DE ARTE & SISTEMA VISUAL

#### **Design Vision Board** (`01_design_vision_board.png`)

**Composición:**
- Header: Navbar simple con logo, nav links, CTA
- Hero image: Pareja en balcón al atardecer (viaje temático)
- Paleta de colores: Navy (#1B2F4E), Gold (#C9973A), Warm neutrals
- Tipografía: Serif display + Sans-serif body
- Iconografía: 8-12 iconos de línea refinados
- Imágenes de referencia: Viajes urbanos, playas, montañas
- Layout: 2 columnas con ratio 60/40

**Jerarquía visual:**
1. Imagen hero (dominante)
2. Paleta de colores (2da relevancia)
3. Tipografía (3ra)
4. Iconografía (soporte)

**Espaciados:**
- Padding hero: ~40px lateral, ~60px vertical
- Gaps entre elementos: 24px, 32px, 48px
- Márgenes de contenido: Simétricos

**Colores identificados:**
- Primary Navy: #1B2F4E
- Secondary Navy: #2D4A72
- Accent Gold: #C9973A
- Light Gold: #E8C56A
- Warm White: #FFFCF7
- Cream: #FAF7F2

**Tipografía:**
- Display/Headlines: Serif font (Prata-like), weight 400, tracking tight
- Body: Sans-serif (Inter-like), weight 400-600
- Labels: Sans-serif, weight 600-700, uppercase, tracking wide

**Sombras:**
- Sutil, navy-tinted (no gris puro)
- Rango: xs (micro) → lg (cards)

**Iconografía:**
- Línea refinada, peso 1.5-2px
- Estilo: Moderno, minimalista
- Uso: Features, benefits, nav, status indicators

---

#### **Hero Concepts (3 variantes)** (`02_hero_v2_three_concepts.png`)

**Layouts analizados:**

**Concepto A: Imagen dominante izquierda**
- 60% imagen, 40% contenido
- Headline serif grande
- Subheadline + CTA
- Pricing badge

**Concepto B: Imagen media**
- 50/50 split
- Headline centrado
- Subheadline + pricing
- CTA en gold

**Concepto C: Imagen pequeña lateral**
- 30% imagen, 70% contenido blanco
- Headline large serif
- 3 líneas de valor proposition
- Navy CTA

**Patrones comunes:**
- Headline siempre serif, weight 400, tracking -0.02em
- Subheadline sans-serif, weight 400, line-height 1.6
- Precios en gold o navy
- CTA buttons: Gold (primary) o Navy (secondary)
- Fotografía: Viajes/atardecer/conexión

---

### 2.2 PÁGINA DE INICIO (HOME)

#### **Desktop Fullpage** (`01_home_desktop_v2_full.png`)

**Secciones identificadas:**

1. **Navbar**
   - Background: Navy semi-transparent + backdrop blur
   - Logo: Gold box + "RUTA34" text
   - Nav links: Links claros, hover state (gold or light)
   - CTA button: Gold background
   - Height: ~60px
   - Spacing: px-4 md:px-8

2. **Hero Section**
   - Image-dominant layout (similar a concepto A)
   - Headline: "Llegás a tu destino. Nosotros te conectamos."
   - Subheadline: Descriptive copy
   - Visual: Pareja en aeropuerto/viaje
   - CTA buttons: Gold (primary), Navy (secondary)
   - Overlay: Slight dark gradient for text readability

3. **Features Grid**
   - 4 cards en fila
   - Icon + heading + description
   - Icons: 48px, line weight 2
   - Card padding: 24px
   - No visible border/shadow (or very subtle)

4. **Pricing Section**
   - Headline: "Planes flexibles para viajar sin preocupaciones"
   - 3 cards side-by-side (responsive to 2 col tablet, 1 col mobile)
   - Card structure:
     - Top: Plan name + badge (if special)
     - Data amount: Large text (20 GB)
     - Price: Gold text or navy
     - Description: Small text
     - CTA button: Gold
   - Spacing: 24px gap between cards

5. **Social Proof / Testimonials**
   - Star ratings + customer names
   - Quote text
   - Avatar (circular, small)
   - Layout: Carousel or grid

6. **Trust Metrics**
   - Icons + numbers + labels
   - Example: "100K+ travelers", "2 min activation", "30+ countries"
   - Layout: 3 cols on desktop, 1 col on mobile

7. **Footer**
   - Background: Navy or cream
   - Links organized by category
   - Social icons
   - Legal links (Terms, Privacy, etc.)

**Responsiveness:**
- Desktop: Full width, max-width ~1400px
- Tablet: 2 columns for pricing
- Mobile: 1 column stack, full width

---

#### **Mobile Responsive** (`02_home_mobile_v2.png`)

**Vistas mostradas:**

1. **Mobile Hero**
   - Full-screen image background
   - Headline overlay in white
   - Subheadline
   - CTA button (full width or 90% width)
   - Padding: 16px sides, 24px top/bottom

2. **Mobile Features**
   - Features stacked vertically
   - Icon + text per row
   - No cards (just text + spacing)

3. **Mobile Pricing**
   - Single column stack
   - Cards full width
   - Price prominent
   - Button full width

4. **Mobile Testimonials**
   - Single column
   - Carousel-like (one at a time)
   - Larger text for readability

**Key differences from desktop:**
- No sidebars, all full width
- Text sizes increased for mobile
- Buttons full width or near-full (90%)
- Padding reduced to 16px (from 24-32px)
- Gap between elements reduced slightly

---

### 2.3 SECCIÓN DE PRECIOS

#### **Pricing Experience Desktop** (`01_pricing_experience_desktop.png`)

**Layout:**
- Headline + description at top
- Pricing cards in grid (3 cols on desktop)
- Comparison table below cards
- Testimonial/social proof section

**Pricing Card Structure:**
- Top section: Plan name + badge
- Center: Data amount (bold, gold)
- Validity: "20 days" or "unlimited"
- Price: Large gold or navy text
- Features: Checkmark list (icon + text)
- CTA: Button, full width

**Card Styling:**
- Background: White or very light
- Border: Subtle (possibly navy/gold tint, 1px)
- Border radius: 12-16px
- Padding: 24px
- Shadow: Subtle (no harsh shadows)
- Spacing between cards: 24px

**Comparison Table:**
- Rows: Feature names
- Cols: Plan names
- Icons or checkmarks for included features
- Alternating row backgrounds (optional)

**Visual hierarchy:**
1. Plan name (heading)
2. Data amount (huge, gold)
3. Price (large, gold or navy)
4. Features (body text)
5. CTA (button)

---

### 2.4 FLUJO DE CHECKOUT

#### **Full Checkout Concept** (`01_checkout_full_flow_concept.png`)

**Steps identified:**

1. **Step 1: Plan Selection**
   - Cards with plan options
   - Click to expand or select
   - Data amount, price, validity visible

2. **Step 2: Customer Data**
   - Form fields: Name, email, phone, etc.
   - Validation messages (inline, near field)
   - Error states: Red border on field + error text

3. **Step 3: Confirmation**
   - Summary of plan selected
   - Summary of data entered
   - Total price
   - Payment method selector

4. **Step 4: Success**
   - Checkmark icon (green or gold)
   - "Purchase successful" message
   - QR code for activation
   - Instructions for activation

**Input styling:**
- Border: 1px, navy or gray
- Focus ring: Gold, 2-3px
- Placeholder: Light gray text
- Error: Red/gold border
- Padding: 12px horizontal, 8px vertical

**Button states:**
- Default: Gold background, navy text
- Hover: Lighter gold (#E8C56A)
- Pressed: Scale 0.98-0.99
- Disabled: 50% opacity

**Modal/QR display:**
- Dark overlay behind
- White card with QR
- Instructions below QR
- Close button (X)

---

#### **Desktop Checkout Pack** (`02_checkout_desktop_pack.png`)

**Multiple screens shown:**

1. **Checkout Step 1** — Plan selection card layout
2. **Checkout Step 2** — Form with inputs
3. **Checkout Step 3** — Confirmation summary
4. **Success Screen** — QR + activation guide
5. **Error State** — Red border on field + error message
6. **Loading State** — Spinner (indeterminate)

**Consistent elements:**
- Navbar at top
- Step indicator (1, 2, 3 with progress line)
- Centered content container (600-700px wide)
- Footer with links/legal

---

#### **Mobile Checkout Flow** (`02_mobile_checkout_flow.png` & `01_mobile_home_checkout_pack.png`)

**Mobile-specific changes:**
- Full width cards/inputs (minus 16px padding)
- Step indicator horizontal (mobile-friendly)
- Buttons full width
- Font sizes increased
- Fewer items per row (1 col only)

**Step flow:**
1. Hero + plan cards
2. Enter data
3. Review
4. Success with QR

---

### 2.5 EMAIL TEMPLATES & LOADER STATES

#### **Success & Error States** (`01_final_success_loader_email_guide_errors.png`)

**Email Templates:**

1. **Purchase Confirmation Email**
   - Header: RUTA34 logo
   - Subject: "Tu eSIM está lista"
   - Body: Plan details, QR code, activation instructions
   - Footer: Social links, legal

2. **Activation Success Email**
   - Header: Checkmark icon (green or gold)
   - Subject: "¡Ya estás conectado!"
   - Body: Connection status, instructions for app
   - Footer: Support link, legal

3. **Error/Troubleshooting Email**
   - Header: Attention icon
   - Subject: "Necesitamos confirmación"
   - Body: Issue description, resolution steps
   - CTA: "Resolver aquí"
   - Footer: Support contact

**Email styling:**
- Background: Cream (#FFFCF7) or white
- Card background: White
- Text: Navy (#1B2F4E)
- Accents: Gold (#C9973A)
- Links: Gold or navy with underline
- Font: Same as web (sans-serif body)

**Loader State:**
- Spinner animation (circular, rotating)
- Color: Gold or navy gradient
- Text: "Procesando..." or similar
- Duration: Indeterminate until action completes

**Success State:**
- Checkmark icon (animated, appears with scale/fade)
- Color: Green (#4ade80) or gold
- Message: "¡Listo!" or "Activado"
- Secondary action: "Descargar instrucciones" (CTA)

**Error State:**
- Warning/X icon (red or gold)
- Message: Clear error description
- Action: "Reintentar" or "Contactar soporte"

---

#### **Loader & Guide Variants** (`02_loader_email_guide_variant.png`)

**Loader variations:**
1. Circular spinner (rotating)
2. Progress bar (linear)
3. Step progress (numbered steps)
4. Pulsing animation (breathing effect)

**Setup/Installation Guide:**
- Step-by-step visual guide
- Icons for each step
- QR codes for download app
- Instructions in text
- Screenshot examples

**Color usage in states:**
- Loading: Navy or gold spinner
- Success: Green checkmark
- Error: Red or gold warning
- Info: Blue or gold info icon

---

### 2.6 ICONOGRAFÍA & COMPONENTES

#### **Identificados en vision board:**

**Icon types:**
- Feature icons (globe, wifi, lightning, etc.) — 24-48px
- Status icons (checkmark, X, warning) — 16-32px
- Navigation icons (menu, close, etc.) — 20-24px
- Payment icons (credit card, etc.) — 24-32px

**Visual style:**
- Line weight: 1.5-2px
- Corner radius: Slightly rounded (0-4px)
- Color: Navy, gold, or white (depending on background)
- Consistency: Same stroke width across all

---

## 3. COMPARACIÓN CON CÓDIGO ACTUAL

### 3.1 QUÉ YA EXISTE

✅ **Componentes presentes en codebase:**
- `Button.tsx` — Variants: primary, secondary, outline, ghost
- `Badge.tsx` — Variants: red, blue, dark, outline
- `Navbar.tsx` — Floating navbar with scroll detection
- `Hero.tsx` — Hero section with image + content
- `Plans.tsx` — Pricing grid (exists, needs visual update)
- `TopBar.tsx` — Admin top bar

✅ **Estilos presentes:**
- CSS custom properties en `globals.css` (Fase 1 completada)
- Color tokens: navy, gold, warm-white, etc.
- Shadow system: shadow-xs → shadow-lg
- Spacing scale: space-xs → space-3xl
- Border radius: radius-sm → radius-2xl

✅ **Funcionalidad presente:**
- Checkout flow (PurchaseFlow.tsx)
- Form validation
- Stripe integration
- Multi-step checkout
- QR display

---

### 3.2 QUÉ DEBE MODIFICARSE

⚠️ **Cambios necesarios en componentes:**

| Componente | Issue | Cambio requerido | Impacto |
|-----------|-------|-----------------|--------|
| **Button.tsx** | Hardcoded hex colors | Usar CSS tokens | BAJO — solo CSS |
| **Navbar.tsx** | Colores hardcoded, borders no tintados | Reemplazar hex con tokens | BAJO — solo CSS |
| **Badge.tsx** | Variantes usan hardcoded colors | Usar tokens | BAJO — solo CSS |
| **TopBar.tsx** | Inline styles puros | Convertir a Tailwind + tokens | MEDIUM — refactor style |
| **Plans.tsx** | Visual no coincide con design | Actualizar card layout + spacing | MEDIUM — refactor visuals |
| **Checkout form inputs** | Inline styles sin sistema | Crear Input component base | MEDIUM-HIGH — nuevo componente |
| **Footer** | No visible en desktop mockup | Verificar diseño + espaciados | MEDIUM — posible refactor |
| **Testimonials section** | Visible en mockup, verificar en código | Verificar layout + avatar sizes | LOW — si existe |

---

### 3.3 QUÉ PUEDE REUTILIZARSE

✅ **Reutilizable como-está:**
- Shadow system (Fase 1) → Aplicar en cards
- Color tokens (Fase 1) → Aplicar en todos los componentes
- Spacing scale (Fase 1) → Mantener consistencia
- Border radius system (Fase 1) → Mantener consistencia
- Button component structure → Solo reemplazar colores (Fase 2)

✅ **Reutilizable con ajustes menores:**
- Navbar: Mantener estructura, actualizar colores
- Hero: Mantener layout, puede necesitar image optimization
- Plans cards: Mantener estructura, ajustar padding/spacing
- Checkout steps: Mantener flujo, refactor visual

---

### 3.4 QUÉ CONVIENE RECONSTRUIR

🔨 **Componentes a reconstruir:**

1. **Input component** (nuevo)
   - Actualmente: Inline `<input>` elements en formularios
   - Propuesta: Crear `src/components/ui/Input.tsx`
   - Ventaja: Consistencia, reutilización, accesibilidad
   - Contendrá: Label, input, error message, helper text

2. **Card component** (nuevo o refactor)
   - Actualmente: Inline styling en cards
   - Propuesta: Crear `src/components/ui/Card.tsx` o estandarizar
   - Contendrá: Border, shadow, padding, hover states

3. **FormField component** (nuevo)
   - Actualmente: Form fields dispersos sin patrón
   - Propuesta: Wrapper que combine Label + Input + Error
   - Ventaja: DRY principle, accesibilidad mejorada

---

## 4. ORDEN ÓPTIMO DE IMPLEMENTACIÓN

### Fases recomendadas (basadas en dependencias + riesgo):

```
FASE 1: ✅ COMPLETADA
└─ Design tokens en globals.css

FASE 2: UI Components Base (propuesto)
├─ Button.tsx (depende de tokens)
├─ Badge.tsx (depende de tokens)
├─ Navbar.tsx (depende de Button + tokens)
└─ TopBar.tsx (depende de tokens)

FASE 3: Componentes de Formulario (propuesto)
├─ Crear Input.tsx component
├─ Crear Card.tsx component
├─ Crear FormField.tsx wrapper
└─ Refactor PurchaseFlow inputs

FASE 4: Página de Inicio (propuesto)
├─ Hero.tsx (visual refinement)
├─ Home sections (Features, Benefits, etc.)
├─ Plans.tsx (pricing cards refactor)
├─ Testimonials section
└─ Footer

FASE 5: Checkout visual (propuesto)
├─ Refactor PurchaseFlow layout
├─ Step indicator component
├─ Form styling consistency
├─ Success/Error screens
└─ QR modal refinement

FASE 6: Email & Loader (propuesto)
├─ Email templates refactor
├─ Loader animation states
├─ Success/Error animations
└─ Loading skeletons
```

### Razón del orden:

1. **TOKENS PRIMERO** (Fase 1) — Todas las fases siguientes dependen
2. **UI ATOMS SEGUNDO** (Fase 2) — Button, Badge, Input son bloques básicos
3. **NAVBAR TERCERO** — Usa Button, visible en todas las páginas
4. **FORMS CUARTO** — Depende de Button + Input
5. **HOME QUINTO** — Integra navegación + botones + cards
6. **CHECKOUT SEXTO** — Depende de formularios
7. **EMAIL/LOADER ÚLTIMO** — No bloquea otras secciones

---

## 5. RIESGOS IDENTIFICADOS

### 5.1 Riesgos por área

#### **Responsive Design**
- ⚠️ **RIESGO:** Cambiar padding/spacing podría romper mobile layout
- **Mitigación:** Testear en 3 breakpoints (mobile 375px, tablet 768px, desktop 1440px)
- **Testing:** Verificar no hay horizontal scroll, text readable

#### **Accesibilidad**
- ⚠️ **RIESGO:** Cambiar colores podría afectar contrast ratios
- **Mitigación:** WCAG AA mínimo 4.5:1 para body text, 3:1 para large text
- **Tools:** WAVE, Lighthouse, Color Contrast Checker

#### **Rendimiento**
- ⚠️ **RIESGO:** Añadir sombras/blur podría aumentar paint time
- **Mitigación:** Usar `will-change: transform` solo en elementos animados
- **Tools:** Chrome DevTools Performance tab

#### **Lógica existente**
- ⚠️ **RIESGO BAJO:** Los cambios de Fase 1-2 son CSS only
- ⚠️ **RIESGO MEDIUM:** Fase 3+ requiere refactor de inputs (podría afectar form submission)
- **Mitigación:** Mantener onChange/onBlur handlers, solo cambiar estilos

#### **Checkout flow**
- ⚠️ **RIESGO MEDIUM:** PurchaseFlow es crítico (genera ingresos)
- **Restricción:** NO TOCAR lógica, solo CSS visual
- **Mitigación:** Testear completo: plan selection → data entry → payment → success

#### **Email templates**
- ⚠️ **RIESGO:** Cambios CSS en email pueden no renderizar igual en clientes
- **Tools:** Litmus, Email on Acid para testear
- **Nota:** Proceder con cuidado, posible refactor de Fase 6

---

### 5.2 Cambios que podrían romper cosas

| Cambio | Riesgo | Mitigación |
|--------|--------|-----------|
| Cambiar Button padding | BAJO | Test visual en diferentes textos |
| Cambiar Input border radius | BAJO | Verificar focus rings visibles |
| Cambiar Navbar height | MEDIUM | Verificar no overlap con hero |
| Convertir inline styles a Tailwind | MEDIUM | Test responsive en todos breakpoints |
| Añadir new Input component | MEDIUM | Deprecate old inline inputs gradually |
| Cambiar form field spacing | MEDIUM | Test con errores, labels largos |
| Refactor checkout cards | HIGH | Manual testing: purchase flow completo |

---

## 6. NIVEL DE FIDELIDAD

### 6.1 Por sección

#### **HOME HERO**
- ✅ **Reproducible al 100%**
- Foto existente en codebase
- Layout: Split 60/40 o centered
- Tipografía: Ya se usa Prata + Inter
- **Limitaciones:** Foto puede necesitar optimización

#### **NAVBAR**
- ✅ **Reproducible al 100%**
- Componente ya existe
- Solo cambiar colores + borders
- **Limitaciones:** Ninguna técnica

#### **PRICING CARDS**
- ⚠️ **Requiere adaptación menor**
- Layout existe en Plans.tsx
- Cambios: Padding, borders, spacing
- **Limitaciones:** Si hay más de 3 planes, puede necesitar scroll

#### **CHECKOUT FLOW**
- ⚠️ **Reproducible al ~95%**
- Flujo existe, validación existe
- Cambios: Visual refinement, form styling
- **Limitaciones:** Inputs pueden necesitar componente nuevo

#### **EMAIL TEMPLATES**
- ⚠️ **Requiere adaptación**
- HTML emails tienen limitaciones de CSS
- Algunos estilos (gradients, animations) pueden no funcionar
- **Limitaciones:** Cliente de email (Gmail, Outlook, etc.) puede ignorar algunos estilos

#### **LOADER STATES**
- ✅ **Reproducible al 100%**
- Framer Motion ya en proyecto
- Animaciones factibles
- **Limitaciones:** Performance si mucho anidamiento

#### **FOOTER**
- ✅ **Reproducible al 100%**
- Estructura simple (links + copyright)
- **Limitaciones:** Ninguna

#### **MOBILE RESPONSIVE**
- ✅ **Reproducible al 100%**
- Tailwind responsive classes usadas
- Breakpoints: sm (640), md (768), lg (1024), xl (1280)
- **Limitaciones:** Verificar en device real (no solo DevTools)

---

### 6.2 Puntuación de fidelidad por componente

| Componente | Fidelidad | Complejidad | Esfuerzo |
|-----------|-----------|------------|----------|
| Navbar | 100% | Baja | 2 horas |
| Hero | 95% | Media | 4 horas |
| Buttons | 100% | Muy baja | 1 hora |
| Badges | 100% | Muy baja | 30 min |
| Pricing cards | 90% | Media | 3 horas |
| Checkout form | 85% | Alta | 6-8 horas |
| Testimonials | 100% | Baja | 2 horas |
| Footer | 100% | Baja | 1 hora |
| Email templates | 70% | Alta | 4 horas |
| Loader animations | 95% | Alta | 3 horas |
| **TOTAL** | **~89%** | **Media** | **~25-30 horas** |

---

## 7. DECISIONES VISUALES OBSERVADAS

### Color system (confirmado desde design pack):
- **Primary Navy:** #1B2F4E (backgrounds, text)
- **Secondary Navy:** #2D4A72 (hover states, accents)
- **Accent Gold:** #C9973A (CTA, highlights)
- **Light Gold:** #E8C56A (hover on buttons)
- **Warm White:** #FFFCF7 (light backgrounds)
- **Cream:** #FAF7F2 (card backgrounds)
- **Dark bg:** #0F172A (admin, footer dark)
- **Success:** #4ade80 or similar (checkmarks)
- **Error:** #dc2626 or similar (validation, alerts)

### Typography decisions:
- **Display:** Serif (Prata or equivalent) — Headlines H1, H2
- **Body:** Sans-serif (Inter or equivalent) — Paragraphs, labels
- **Monospace:** (Suggested but not shown in mockups)

### Spacing system (observed):
- **4pt scale:** xs (4px), sm (8px), md (12px), base (16px), lg (24px), xl (32px), 2xl (48px), 3xl (64px)

### Border radius:
- **Cards:** 12-16px
- **Buttons:** 24px (full rounded)
- **Inputs:** 8px
- **Modals:** 16-20px

### Shadow system:
- **xs:** Subtle (2px blur)
- **sm:** Cards (4px blur)
- **md:** Hoverable elements (12px blur)
- **lg:** Modals, dropdowns (24px blur)

---

## 8. TABLA RESUMEN DE DIFERENCIAS

| Elemento | Actual | Design Pack | Acción |
|----------|--------|-------------|--------|
| **Colores Button** | Hardcoded hex | Usar tokens (Fase 1) | Reemplazar → Fase 2 |
| **Colores Navbar** | Hardcoded hex | Usar tokens | Reemplazar → Fase 2 |
| **Spacing Pricing** | Variable | 24px gaps | Estandarizar → Fase 4 |
| **Input styling** | Inline styles | Componente base | Crear → Fase 3 |
| **Hero layout** | Flexible | 60/40 split | Ajustar → Fase 4 |
| **Checkout flow** | Existe, visual genérica | Diseño premium | Refactor visual → Fase 5 |
| **Email templates** | Existe, genérico | Diseño brand | Refactor → Fase 6 |
| **Loader** | Puede existir | Con animación premium | Mejorar → Fase 6 |

---

## 9. PRÓXIMOS PASOS (SIN IMPLEMENTACIÓN)

### Checklist pre-implementación Fase 2:

- [ ] Análisis visual completado (este documento)
- [ ] Documentación de design pack revisada
- [ ] Comparación código ↔ design realizada
- [ ] Riesgos identificados y mitigados
- [ ] Orden de fases confirmado con stakeholders
- [ ] Aprobación para proceder a implementación

### Preparación para Fase 2:

- Verificar que Fase 1 (Design Tokens) esté 100% completada
- Revisar que tokens en `globals.css` están disponibles
- Preparar test plan para cambios visuales
- Setup de viewport testing (mobile 375px, tablet 768px, desktop 1440px)

### Criterio de aceptación Fase 2:

✅ Button.tsx — Todos los colores usando CSS tokens  
✅ Badge.tsx — Todos los colores usando CSS tokens  
✅ Navbar.tsx — Todos los colores usando CSS tokens  
✅ TopBar.tsx — Converted to Tailwind + CSS tokens  
✅ Build success (`npm run build`)  
✅ Lint pass (no new errors)  
✅ Visual verification — Navbar y botones en navegador  

---

## 10. NOTAS IMPORTANTES

**NO IMPLEMENTAR TODAVÍA:**
- Este es un documento de análisis solamente
- Ningún código ha sido modificado
- Ningún cambio visual ha sido aplicado
- Esperar aprobación explícita antes de proceder

**Fuente de verdad:**
- Design Pack v1.0 es la fuente de verdad visual
- Si código diverge del design, design prevalece
- Documentar excepciones técnicas (no ignorarlas)

**Scope de este análisis:**
- HOME, PRICING, CHECKOUT, EMAIL, LOADER
- No incluye: Admin panel, Partner portal, API
- No incluye: Dark mode (si no está en design pack)

**Limitaciones conocidas:**
- Email rendering varía por cliente (Gmail ≠ Outlook)
- Mobile puede tener limitaciones por viewport
- Rendimiento debe verificarse en device real

---

**Documento preparado:** 2026-06-30  
**Estado:** ANÁLISIS COMPLETO — ESPERANDO APROBACIÓN  
**Siguiente paso:** Implementación Fase 2 (UI Components Base)
