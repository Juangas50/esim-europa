# Implementation Plan — HOTFIX i18n + HERO Redesign Opción A

**Status:** ✅ Especificación completa, listo para implementación  
**Fecha:** 2026-07-01

---

## 📋 FASES DE IMPLEMENTACIÓN

### **FASE 1: HOTFIX i18n (3-4 horas)**

**Objetivo:** Corregir todas las keys técnicas visibles en UI  
**Archivos a modificar:**

#### **1. src/components/landing/Hero.tsx**
- Línea 78: `t("explore")` → `t("ctaSecondary")`

#### **2. src/components/landing/Plans.tsx**
- Línea ~52: `t("recommended")` → `t("popular")`
- Búsqueda de `t("selectPlan")` → `t("buyPlan")`

#### **3. messages/es.json**
Agregar a sección "hero":
```json
"activateIn2Min": "Activa en 2 minutos",
"activation": "Activación instantánea",
"connected": "Internet activado",
"countries": "Países",
"heroAlt": "Viajero con teléfono usando eSIM en Europa",
"noAutoRenew": "Sin renovación automática",
"support": "Soporte 24/7",
"travelers": "Viajeros satisfechos"
```

Agregar a sección "plans":
```json
"activateAnytime": "Activa cuando quieras",
"coverage": "Cobertura en 30+ países",
"daysDuration": "días",
"euRoaming": "Roaming UE",
"noAutoRenew": "Sin renovación automática"
```

Agregar a sección "testimonials":
```json
"aggregate": "Agregadas"
```

#### **4. messages/pt.json**
Agregar equivalentes en portugués para todas las keys anteriores

---

### **FASE 2: HERO Redesign Opción A (5-6 horas)**

**Objetivo:** Transformar Hero de SaaS layout a editorial premium travel  
**Archivo principal:** `src/components/landing/Hero.tsx` (reescritura ~80%)

**Cambios clave:**

1. **Estructura HTML**
   - Remover flex col-row grid
   - Crear container único con imagen fondo integrada
   - Texto superpuesto con position relative/absolute z-index

2. **Imagen**
   - Usar como background layer
   - Aplicar border-radius grande (2.5-4rem)
   - Agregar overlay gradiente: `from-navy/35 to-transparent`
   - Aplicar max-width controlado (no 100vw puro)

3. **Texto**
   - Superpuesto sobre imagen (z-20)
   - LEFT aligned, dentro de la escena
   - Text color: white (contraste asegurado por overlay)

4. **Navbar**
   - pt-32 en hero (dejar espacio)
   - Navbar: fixed z-50 bg-white/80 backdrop-blur

5. **Responsive Mobile**
   - Imagen arriba (h-[500px])
   - Overlay + gradiente
   - Texto DEBAJO (separado), no superpuesto
   - Imagen prominente, texto legible

---

### **FASE 3: Validación (1-2 horas)**

**Verificaciones técnicas:**

```bash
# 1. Build
npm run build           # ✅ PASS expected

# 2. Lint
npm run lint            # ✅ 0 nuevos errores esperados

# 3. TypeScript
npx tsc --noEmit       # ✅ PASS expected

# 4. Capturas
node scripts/capture-full-page.js
# - PR5.1_FINAL_desktop_v2.png
# - PR5.1_FINAL_tablet_v2.png
# - PR5.1_FINAL_mobile_v2.png
```

**Verificaciones visuales:**

- [ ] NO hay keys técnicas visibles (hero.*, plans.*, etc.)
- [ ] Imagen integrada como fondo (no columna separada)
- [ ] Texto legible (contraste asegurado)
- [ ] Navbar integrado (parece parte de escena)
- [ ] Mobile: imagen prominente, texto separado
- [ ] Border-radius visible (cinematográfico)
- [ ] Overlay suave (no tapar foto)
- [ ] Sensación editorial travel (no SaaS)

---

## 📁 ARCHIVOS A TOCAR

### **Total: 5 archivos**

```
src/components/landing/
├── Hero.tsx                    (REESCRITURA 80% - Phase 2)
├── Navbar.tsx                  (AJUSTES menores - Phase 2)
└── Plans.tsx                   (CAMBIO 1 línea - Phase 1)

messages/
├── es.json                     (AGREGAR keys - Phase 1)
└── pt.json                     (AGREGAR keys - Phase 1)

docs/design/
├── HOTFIX_I18N_VISIBLE_KEYS.md (EXISTE)
├── HERO_REDESIGN_OPCION_A.md   (EXISTE)
└── IMPLEMENTATION_PLAN.md      (ESTE)
```

---

## 🔄 ORDEN DE EJECUCIÓN

1. **HOTFIX i18n (Phase 1)** — Debe hacerse PRIMERO
   - Editar Plans.tsx (1 cambio)
   - Editar Hero.tsx (1 cambio)
   - Editar es.json (agregar keys)
   - Editar pt.json (agregar keys)
   - Build + Lint + TypeScript + Capturas
   - Confirmar visualmente que NO hay keys técnicas

2. **HERO Redesign (Phase 2)** — DESPUÉS de Phase 1 aprobada
   - Reescribir Hero.tsx completamente
   - Ajustes en Navbar.tsx
   - Build + Lint + TypeScript + Capturas
   - QA visual

3. **Validación Final (Phase 3)**
   - Ejecutar full test suite
   - Capturas finales
   - Reporte de cierre

---

## ⏱️ ESTIMACIÓN

| Fase | Tarea | Estimado |
|------|-------|----------|
| 1 | Editar 2 componentes | 30 min |
| 1 | Agregar keys a JSON | 1 h |
| 1 | Build/Lint/TypeScript/Capturas | 1 h |
| 1 | QA visual i18n | 30 min |
| **Fase 1 Total** | | **3 horas** |
| 2 | Reescribir Hero.tsx | 2 h |
| 2 | Ajustes Navbar | 30 min |
| 2 | Build/Lint/TypeScript/Capturas | 1 h |
| 2 | QA visual redesign | 1 h |
| **Fase 2 Total** | | **4.5 horas** |
| 3 | Validación final | 1 h |
| **Total** | | **~8.5 horas** |

---

## 🚦 BLOQUEOS Y DEPENDENCIAS

```
Phase 1 (i18n hotfix)
        ↓ (requiere PASS de todos tests)
Phase 2 (HERO redesign)
        ↓ (requiere PASS de todos tests)
Phase 3 (Validación final)
        ↓
PR5.1 puede ser resumida/aprobada
```

---

## ✅ DEFINICIÓN DE DONE

**Fase 1:**
- [ ] 0 keys técnicas visibles en UI
- [ ] Build PASS
- [ ] Lint PASS
- [ ] TypeScript PASS
- [ ] Capturas sin keys técnicas

**Fase 2:**
- [ ] Hero parece editorial travel, NO SaaS
- [ ] Imagen integrada (no columna)
- [ ] Texto superpuesto legible
- [ ] Navbar integrado
- [ ] Mobile responsive correcto
- [ ] Build PASS
- [ ] Lint PASS
- [ ] TypeScript PASS
- [ ] Capturas confirman cambios

**Fase 3:**
- [ ] QA visual final approved
- [ ] Documentación completa
- [ ] Listo para merge

---

**Listo para iniciador Phase 1 (HOTFIX i18n)**

Aguardando confirmación para proceder.

