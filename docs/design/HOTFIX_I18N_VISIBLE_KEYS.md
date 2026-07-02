# HOTFIX-i18n-visible-keys — ANÁLISIS Y PLAN DE CORRECCIÓN

**Fecha:** 2026-07-01  
**Status:** 🔴 BLOQUEANTE — Keys técnicas visibles en UI  
**Prioridad:** P0 — Crítica

---

## 🔴 PROBLEMA IDENTIFICADO

Componentes usan keys de traducción que **NO existen** o **tienen nombres incorrectos** en `messages/es.json` y `messages/pt.json`.

Cuando next-intl no encuentra una key, renderiza el nombre literal (ej: "hero.connected"), causando que aparezca texto técnico en la UI.

---

## 📊 AUDITORÍA COMPLETA

### **HERO.tsx**

**Keys usadas en componente:**
- `t("activateIn2Min")` — ❌ NO EXISTE
- `t("activation")` — ❌ NO EXISTE
- `t("connected")` — ❌ NO EXISTE
- `t("countries")` — ❌ EXISTE EN plans, NO en hero
- `t("cta")` — ✅ OK
- `t("explore")` — ❌ ALIAS INCORRECTO (debería ser `ctaSecondary`)
- `t("headline")` — ✅ OK
- `t("heroAlt")` — ❌ NO EXISTE
- `t("noAutoRenew")` — ❌ ALIAS INCORRECTO (está mezclado en `priceAnchor`)
- `t("sub")` — ✅ OK
- `t("support")` — ❌ NO EXISTE EN hero (existe en footer)
- `t("travelers")` — ❌ NO EXISTE

**Resumen:** 9 de 12 keys problémicas

---

### **PLANS.tsx**

**Keys usadas en componente:**
- `t("activateAnytime")` — ❌ NO EXISTE
- `t("buyPlan")` — ✅ OK (pero se usa `selectPlan` en código)
- `t("coverage")` — ❌ EXISTE EN benefits, NO en plans
- `t("daysDuration")` — ❌ NO EXISTE
- `t("euRoaming")` — ❌ NO EXISTE
- `t("perMonth")` — ✅ OK
- `t("recommended")` — ❌ ALIAS INCORRECTO (debería ser `popular`)
- `t("selectPlan")` — ❌ DEBERÍA SER `buyPlan`
- `t("subtitle")` — ✅ OK
- `t("title")` — ✅ OK

**Resumen:** 6 de 10 keys problémicas

---

### **Otros componentes**

- **Benefits.tsx**: `t("title")` ✅ OK
- **Compatibility.tsx**: Todas ✅ OK
- **Testimonials.tsx**: `t("aggregate")` ❌ NO EXISTE (pero usado como fallback)
- **FAQ.tsx**: `t("title")` ✅ OK
- **Footer.tsx**: Todas ✅ OK
- **PR5.1 nuevos**: No usan `t()` directamente

---

## ✅ PLAN DE CORRECCIÓN

### **Estrategia:**

1. **Cambiar referencias en componentes** (alias incorrectos):
   - Hero: `t("explore")` → `t("ctaSecondary")`
   - Plans: `t("selectPlan")` → `t("buyPlan")`
   - Plans: `t("recommended")` → `t("popular")`

2. **Agregar keys faltantes** a `messages/es.json` y `messages/pt.json`:
   - `hero.activateIn2Min`
   - `hero.activation`
   - `hero.connected`
   - `hero.countries`
   - `hero.heroAlt`
   - `hero.noAutoRenew`
   - `hero.support`
   - `hero.travelers`
   - `plans.activateAnytime`
   - `plans.coverage` (copiar de benefits si existe, o crear)
   - `plans.daysDuration`
   - `plans.euRoaming`
   - `testimonials.aggregate`

3. **Verificar** que no hay más keys técnicas visibles

---

## 📝 CAMBIOS ESPECÍFICOS

### **A. En Hero.tsx (línea 78):**
```diff
- {t("explore")}
+ {t("ctaSecondary")}
```

### **B. En Plans.tsx (línea 52):**
```diff
- {t("recommended")}
+ {t("popular")}
```

### **C. En Plans.tsx (búsqueda de "selectPlan"):**
```diff
- {t("selectPlan")}
+ {t("buyPlan")}
```

### **D. En messages/es.json — Agregar a "hero":**
```json
"hero": {
  ...existentes...,
  "activateIn2Min": "Activa en 2 minutos",
  "activation": "Activación instantánea",
  "connected": "Internet activado",
  "countries": "Países",
  "heroAlt": "Viajero con teléfono usando eSIM en Europa",
  "noAutoRenew": "Sin renovación automática",
  "support": "Soporte 24/7",
  "travelers": "Viajeros satisfechos"
}
```

### **E. En messages/es.json — Agregar a "plans":**
```json
"plans": {
  ...existentes...,
  "activateAnytime": "Activa cuando quieras",
  "coverage": "Cobertura en 30+ países",
  "daysDuration": "días",
  "euRoaming": "Roaming UE",
  "noAutoRenew": "Sin renovación automática"
}
```

### **F. En messages/es.json — Agregar a "testimonials":**
```json
"testimonials": {
  ...existentes...,
  "aggregate": "Agregadas"
}
```

### **G. En messages/pt.json — Equivalentes en portugués:**
(Copiar estructura anterior con traducciones a PT-BR)

---

## 🔄 VALIDACIÓN

Una vez aplicados los cambios:

```bash
npm run build          # ✅ PASS
npm run lint           # ✅ 0 nuevos errores
npx tsc --noEmit      # ✅ PASS
# Capturas en 3 breakpoints
# Verificar visualmente: NO hay keys tipo "hero.", "plans.", etc. en UI
```

---

## 📅 TIMELINE

**Estimado:** 2-3 horas
- Cambios en componentes: 30 min
- Agregar keys a JSON: 1 hora
- Validación (build/lint/tsc): 15 min
- Capturas y QA visual: 30 min

---

## ⚠️ NOTAS

- **NO cambiar diseño durante este hotfix**
- **NO tocar checkout, precios, rutas**
- **SOLO correcciones de i18n**
- Después de este hotfix, PR5.1 podrá ser resumida
- Hero redesign pendiente para PR posterior (Hero-visual)

---

**Status:** Listo para implementar  
**Bloqueante para:** PR5.1 merge  
**Depende de:** (nada)  
**Depende de esto:** PR5.1 validation

