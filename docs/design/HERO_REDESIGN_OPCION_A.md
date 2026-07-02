# HERO Redesign — Opción A Controlada

**Status:** ✅ APROBADO  
**Fecha:** 2026-07-01  
**Fase:** Especificación pre-implementación

---

## 🎬 VISIÓN

Transformar Hero de layout SaaS (dos columnas separadas) a **escena editorial premium travel** donde:
- Imagen es protagonista (fondo integrado, no columna)
- Texto vive **dentro** de la escena (superpuesto, no separado)
- Navbar flotante se integra naturalmente
- Sensación cinematográfica de viaje, no landing corporate

---

## 📐 ARQUITECTURA TÉCNICA — OPCIÓN A CONTROLADA

### **Estructura Conceptual**

```
┌─────────────────────────────────────────┐
│  NAVBAR (flotante, z-50, integrado)     │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │  IMAGEN (fondo full-height)       │  │
│  │  - border-radius: 2.5-4rem        │  │
│  │  - max-width: ~90vw / 1200px      │  │
│  │  - object-cover editorializado    │  │
│  │                                   │  │
│  │ [OVERLAY suave + GRADIENTE]       │  │
│  │ from-navy/30 (left) to-transparent│  │
│  │                                   │  │
│  │ TEXTO (superpuesto)               │  │
│  │ LEFT side, dentro escena          │  │
│  │ - white/navy text                 │  │
│  │ - contraste asegurado por gradient│  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  TRUST METRICS (abajo, dentro sección)  │
│  - separadas visualmente de imagen      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎯 CAMBIOS ESPECÍFICOS

### **1. Container Principal**

**Antes:**
```jsx
<section className="min-h-[100dvh] flex flex-col items-center justify-center py-20 px-4">
  <div className="flex flex-col lg:flex-row gap-12">
    {/* LEFT: Text Column */}
    {/* RIGHT: Image Column */}
  </div>
</section>
```

**Después:**
```jsx
<section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
  {/* Background: Sutil, sin tapar contenido */}
  <div className="absolute inset-0 bg-white/50 pointer-events-none" />
  
  <div className="relative z-10 w-full max-w-[1200px] mx-auto">
    {/* Hero Con Imagen Integrada */}
    <motion.div className="relative rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-2xl">
      {/* Imagen de fondo */}
      <Image 
        src="/images/imagen8.png"
        alt="..." 
        fill 
        className="object-cover"
        priority
      />
      
      {/* Overlay suave + Gradiente lateral */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy)]/35 via-[var(--color-navy)]/20 to-transparent" />
      
      {/* Contenido: Texto superpuesto DENTRO de la imagen */}
      <div className="relative z-20 h-full min-h-[500px] lg:min-h-[700px] flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
        {/* Texto LEFT, dentro escena */}
        <motion.div className="max-w-md lg:max-w-lg">
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
            {t("headline")}
          </h1>
          <p className="text-white/90 text-lg sm:text-xl leading-relaxed mb-10">
            {t("sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* CTAs */}
          </div>
          {/* Price anchor */}
        </motion.div>
      </div>
    </motion.div>
    
    {/* Trust Metrics — separado visualmente, abajo */}
    <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-24 pt-16 border-t border-[var(--color-border)]">
      {/* 4 metrics */}
    </motion.div>
  </div>
</section>
```

---

### **2. Navbar Integration**

**Antes:** Navbar fija encima, sensación pegada

**Después:**
```jsx
// Navbar: Fixed, z-50, con backdrop suave
<nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)]/30">
  {/* Navbar content — integrado, no pegado */}
</nav>

// Hero: pt-32 para dejar espacio, no ocultarse
<section className="pt-32 ...">
```

---

### **3. Imagen + Overlay**

**Especificaciones:**
- `border-radius`: 40px (2.5rem) móvil, 64px (4rem) desktop
- `object-cover`: Cubre área completa
- `shadow-2xl`: Sombra cinematográfica sutil
- **Overlay gradiente**:
  ```jsx
  bg-gradient-to-r from-[var(--color-navy)]/35 via-[var(--color-navy)]/20 to-transparent
  ```
  - Navy 35% a la izquierda (protege texto)
  - Degrada a transparente a la derecha (respeta foto)
  - NO es overlay oscuro/opaco

---

### **4. Responsive Móvil**

**Desktop:** Texto dentro de la imagen (superpuesto)

**Mobile:**
```jsx
// Grid stacked
<div className="flex flex-col">
  {/* Imagen llena arriba */}
  <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden">
    <Image ... />
    <div className="overlay" />
    {/* NO hay texto aquí en mobile */}
  </div>
  
  {/* Texto DEBAJO, fuera de la imagen */}
  <div className="mt-8 px-4">
    <h1>{t("headline")}</h1>
    <p>{t("sub")}</p>
    {/* CTAs */}
  </div>
</div>
```

---

### **5. Colors & Tokens**

- **Fondo sección:** Blanco o warm-white sutil (no interferir)
- **Overlay:** `navy/35` → `navy/20` → `transparent`
- **Texto:** Blanco (contraste asegurado por gradiente)
- **CTAs:** Gold button (estándar), navy border button
- **Navbar:** White/80 backdrop blur (integrado, no dominante)

---

## 📁 ARCHIVOS A TOCAR

### **Phase 1: HOTFIX i18n (NO cambiar diseño)**
- `src/components/landing/Hero.tsx` — SOLO corregir keys
- `messages/es.json` — Agregar keys faltantes
- `messages/pt.json` — Agregar keys faltantes

### **Phase 2: Redesign Visual Hero (DESPUÉS de Phase 1)**
- `src/components/landing/Hero.tsx` — Rediseño completo (reescritura ~80%)
- Posiblemente: `src/components/landing/Navbar.tsx` — Ajustes de integración
- Screenshots nuevas

### **Phase 3: Validación**
- Build/Lint/TypeScript check
- Capturas desktop/tablet/mobile
- QA visual

---

## 🎨 TOKENS USADOS

```
--color-navy: #1B2F4E          // Overlay left
--color-gold: #C9973A          // CTA buttons
--color-warm-white: #FFFCF7    // Alt background
--color-ink: #1B2F4E           // Navy text alt
--color-border: computed        // Dividers
```

---

## 📊 ANTES vs. DESPUÉS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Layout** | 2-col grid (left text, right image) | 1 container con imagen fondo + texto superpuesto |
| **Imagen** | Columna derecha, separada | Fondo protagonista, integrated |
| **Texto** | En su propia columna | Dentro de la escena, superpuesto |
| **Overlay** | Ninguno | Gradiente navy/cream controlado |
| **Navbar** | Pegada encima | Integrada, flotante con backdrop blur |
| **Border-radius** | 1.5rem (small) | 2.5-4rem (cinematográfico) |
| **Mobile** | Texto-imagen apilado | Imagen grande arriba, texto abajo sin superponer |
| **Sensación** | SaaS landing | Editorial premium travel |

---

## ✅ VALIDACIÓN VISUAL

Tras implementar, verificar:
- [ ] Texto legible (contraste assegurado)
- [ ] Imagen no está "pegada" (border-radius visible)
- [ ] Navbar parece parte de la escena, no elemento independiente
- [ ] Mobile: imagen prominente, texto separado y legible
- [ ] Gradiente overlay suave (no tapar foto)
- [ ] Sensación de "viaje editorial" (NOT corporate SaaS)

---

## ⚠️ RESTRICCIONES

- ✅ Mantener navegación + lógica
- ✅ Mantener planes/precios/checkout
- ✅ Mantener rutas
- ❌ NO cambiar design system
- ❌ NO agregar nuevos componentes
- ❌ NO cambiar otros heroes/secciones

---

**Listo para Phase 1 (i18n hotfix) → Phase 2 (visual redesign)**

