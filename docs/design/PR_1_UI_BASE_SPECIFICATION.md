# PR 1 — ESPECIFICACIONES DE IMPLEMENTACIÓN

## Sistema Base de UI: Navbar, Buttons, Badges, Cards, TopBar

**Fuente:** Design Pack v1.0 — Vision Board + All screens  
**Precisión:** Fidelidad visual 100% al mockup

---

## COMPONENTE 1: BUTTON.TSX

### Estado actual (código):
```tsx
// Hardcoded colors
primary: "bg-[#C9973A] text-[#1B2F4E] hover:bg-[#E8C56A] shadow-[0_2px_12px_-2px_rgba(201,151,58,0.35)]"
secondary: "bg-[#1B2F4E] text-white hover:bg-[#0F1A2E]"
outline: "border border-[#1B2F4E]/15 text-[#1B2F4E] hover:bg-[#1B2F4E]/5 bg-white"
ghost: "text-[#1B2F4E] hover:bg-[#1B2F4E]/6"
```

### Estado deseado (tokens):
```tsx
primary: "bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)] shadow-lg"
secondary: "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-medium)]"
outline: "border border-[var(--color-navy)]/15 text-[var(--color-navy)] hover:bg-[var(--color-navy)]/5 bg-white"
ghost: "text-[var(--color-navy)] hover:bg-[var(--color-navy)]/6"
```

### Cambios específicos:
- ❌ Línea 32: Reemplazar `#C9973A` → `var(--color-gold)`
- ❌ Línea 32: Reemplazar `#1B2F4E` (text) → `var(--color-navy)`
- ❌ Línea 32: Reemplazar `#E8C56A` → `var(--color-gold-light)`
- ❌ Línea 32: Reemplazar hardcoded shadow → `shadow-lg`
- ❌ Línea 34: Reemplazar `#1B2F4E` → `var(--color-navy)`
- ❌ Línea 34: Reemplazar `#0F1A2E` → `var(--color-navy-medium)`
- ❌ Línea 36-37: Reemplazar `#1B2F4E` → `var(--color-navy)`
- ❌ Línea 38-39: Reemplazar `#1B2F4E` → `var(--color-navy)`

### Estados verificados en mockup:
- ✅ Default: Gold background, navy text
- ✅ Hover: Lighter gold (#E8C56A)
- ✅ Pressed: Scale 0.97 (ya existe)
- ✅ Focus: Ring gold (ya existe)
- ✅ Disabled: Opacity 50% (ya existe)

### Riesgo: BAJO
- Solo cambio de valores CSS
- Cero cambio de lógica

---

## COMPONENTE 2: NAVBAR.TSX

### Especificaciones del mockup:
**Navbar flotante (floating navbar)**
- Position: fixed top-5 z-50
- Backdrop: Navy con blur
- Scroll behavior: Oculta al bajar, aparece al subir
- Logo: Gold square (#C9973A) con "34"
- Border: Sutil, dorado tintado
- Height: ~60px

### Cambios de color requeridos:

**Línea 64-66 (scrolled state):**
- ❌ `bg-[#1B2F4E]/95` → `bg-[var(--color-navy)]/95`
- ❌ `shadow-[0_8px_32px_-8px_rgba(27,47,78,0.14)]` → `shadow-lg`
- ❌ `border-[#C9973A]/[0.06]` → `border-[var(--color-gold)]/[0.06]`

**Línea 65 (unscrolled state):**
- ❌ `bg-[#1B2F4E]/85` → `bg-[var(--color-navy)]/85`
- ❌ `border-[#C9973A]/[0.05]` → `border-[var(--color-gold)]/[0.05]`

**Línea 70 (Logo box):**
- ❌ `bg-[#C9973A]` → `bg-[var(--color-gold)]`

**Línea 84 (Nav links hover):**
- ❌ `hover:text-[#1B2F4E]` → `hover:text-[var(--color-navy)]`

**Línea 111 (CTA button):**
- ❌ `bg-[#C9973A]` → `bg-[var(--color-gold)]`
- ❌ `hover:bg-[#E8C56A]` → `hover:bg-[var(--color-gold-light)]`

**Línea 172 (Mobile menu links):**
- ❌ `text-[#1B2F4E]` → `text-[var(--color-navy)]`

**Línea 184 (Mobile CTA):**
- ❌ `bg-[#C9973A]` → `bg-[var(--color-gold)]`

### Verificación en mockup:
- ✅ Navbar flotante con scroll detection
- ✅ Logo gold square
- ✅ Animación de aparición/desaparición en scroll
- ✅ Nav links con hover state

### Riesgo: BAJO
- Solo cambio de valores CSS
- Animaciones no tocadas
- Estructura no tocada

---

## COMPONENTE 3: BADGE.TSX

### Cambios de color:

**Variante `red`:**
- ❌ `bg-[#C9973A]` → `bg-[var(--color-gold)]`

**Variante `dark`:**
- ❌ `bg-[#1B2F4E]` → `bg-[var(--color-navy)]`

**Variante `outline`:**
- ❌ `border-[#1B2F4E]/12` → `border-[var(--color-navy)]/12`
- ❌ `text-[#555555]` → `text-[var(--color-ink-2)]`

**Variante `blue`:**
- ⚠️ MANTENER COMO ESTÁ (legacy, bajo uso)

### Verificación en mockup:
- ✅ Badges usados en pricing plans
- ✅ Gold background para destacados
- ✅ Navy para labels

### Riesgo: BAJO
- Solo cambio de valores CSS

---

## COMPONENTE 4: CARD.TSX (Nuevo componente)

### ¿Existe en código? NO
### ¿Es requerido para PR 1? SÍ — se usa en pricing y otros

### Especificaciones del mockup:
- Border: 1px, navy tintado (rgba(27, 47, 78, 0.06))
- Shadow: Subtle (shadow-sm o shadow-md según contexto)
- Radius: 12-16px (usar --radius-lg o --radius-xl)
- Padding: 24px
- Background: White (#FFFFFF)
- Hover: Subtle lift (shadow increase)

### Crear nuevo componente:
```tsx
// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

// Usar:
// - bg-white
// - border border-[var(--color-border)]
// - shadow-sm
// - rounded-[var(--radius-lg)]
// - p-6 (24px padding)
// - hover:shadow-md (opcional)
```

### Verificación en mockup:
- ✅ Cards en pricing
- ✅ Cards en checkout
- ✅ Spacing consistente

### Riesgo: MEDIUM
- Nuevo componente
- Podría no usarse en todas partes de inmediato
- Pero es necesario para coherencia visual

---

## COMPONENTE 5: TOPBAR.TSX

### Estado actual (código):
Inline styles puros, hardcoded colors:
```tsx
<div style={{
  background: '#181818', borderBottom: '1px solid #2A2A2A',
  padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
}}>
```

### Estado deseado:
Convertir a Tailwind + CSS tokens:
```tsx
<div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--color-border)]"
     style={{ background: 'var(--color-ruta-dark)' }}>
```

### Cambios específicos:

**Línea 17-19 (Container):**
- ❌ Inline style object → Tailwind classes
- ❌ `background: '#181818'` → Usar `--color-ruta-dark` (si existe en globals.css)
- ❌ `borderBottom: '1px solid #2A2A2A'` → `border-b border-[var(--color-border)]`
- ❌ `padding: '14px 24px'` → `px-6 py-3.5`
- ❌ `display: 'flex'` → `flex`
- ❌ `alignItems: 'center'` → `items-center`
- ❌ `justifyContent: 'space-between'` → `justify-between`

**Línea 21 (Title):**
- ❌ Inline style → Tailwind classes
- ❌ `fontSize: 17` → `text-base`
- ❌ `color: '#fff'` → `text-white`
- ❌ `fontWeight: 800` → `font-bold`
- ❌ `margin: 0` → `m-0`

**Línea 22-26 (Avatar):**
- ❌ Inline style → Tailwind classes
- ❌ `background: '#C9973A'` → `bg-[var(--color-gold)]`
- ❌ `width: 30, height: 30` → `w-7 h-7` (28px)
- ❌ `display: 'flex'` → `flex`
- ❌ `alignItems: 'center'` → `items-center`
- ❌ `justifyContent: 'center'` → `justify-center`
- ❌ `color: '#fff'` → `text-white`

### Verificación en mockup:
- ✅ Dark background
- ✅ Gold avatar circle
- ✅ Title en blanco
- ✅ Simple, admin-like

### Riesgo: MEDIUM
- Cambio de inline → Tailwind
- Avatar size cambia ligeramente (30px → 28px)
- Verificar visually después

---

## COMPONENTE 6: CARD USAGE CHECK

### Dónde se usan cards en el código:
```bash
# Buscar componentes tipo card
grep -r "rounded.*shadow" src/components --include="*.tsx"
grep -r "border" src/components --include="*.tsx"
```

### Cards que necesitan actualización:
- ✅ Plans.tsx — Pricing cards
- ✅ Checkout form cards
- ✅ Feature cards (en home)
- ✅ Testimonial cards

**PERO:** Para PR 1, solo actualizar si hay un componente Card.tsx que se reutilice.

---

## RESUMEN DE CAMBIOS PR 1

| Archivo | Cambios | Líneas | Tipo |
|---------|---------|--------|------|
| `Button.tsx` | Reemplazar hardcoded colors por tokens | 32-39 | CSS |
| `Navbar.tsx` | Reemplazar hardcoded colors por tokens | 64-184 | CSS |
| `Badge.tsx` | Reemplazar hardcoded colors por tokens | 15-18 | CSS |
| `Card.tsx` | CREAR nuevo componente base | NEW | NEW |
| `TopBar.tsx` | Convertir inline styles → Tailwind + tokens | 17-26 | REFACTOR |

**Total de archivos modificados: 5**  
**Total de líneas alteradas: ~50 líneas**  
**Nuevos componentes: 1**

---

## VERIFICACIÓN PRE-IMPLEMENTACIÓN

✅ **Tokens disponibles en globals.css:**
- `--color-gold` ✓
- `--color-gold-light` ✓
- `--color-navy` ✓
- `--color-navy-medium` ✓
- `--color-border` ✓
- `--color-ink-2` ✓
- `--color-ruta-dark` ✓
- `--radius-lg` ✓
- `--shadow-sm` ✓
- `--shadow-md` ✓
- `--shadow-lg` ✓

✅ **Componentes a modificar existen:** Button, Navbar, Badge, TopBar ✓

⚠️ **Nuevo componente:** Card.tsx (crear)

---

## CRITERIOS DE ACEPTACIÓN PR 1

- [ ] Button.tsx — All colors using CSS tokens
- [ ] Navbar.tsx — All colors using CSS tokens
- [ ] Badge.tsx — All colors using CSS tokens
- [ ] Card.tsx — Created with token-based styling
- [ ] TopBar.tsx — Converted from inline to Tailwind + tokens
- [ ] `npm run build` → SUCCESS
- [ ] `npm run lint` → No new errors (pre-existing ignored)
- [ ] Visual verification → Navbar visible in browser, buttons look correct
- [ ] No changes to: Hero, Pricing, Checkout, Footer, logic

---

## SIGUIENTES PASOS

1. ✅ Especificaciones documentadas
2. ⏳ Implementación (ahora)
3. ⏳ Build & Lint
4. ⏳ Resumen de cambios
5. ⏳ Esperar aprobación

---

**Comenzando implementación ahora...**
