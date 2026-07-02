# 🔴 PIPELINE VISUAL — OBLIGATORIO PARA TODOS LOS PRs

**Establecido:** 2026-06-30  
**Vigencia:** PR3 en adelante (TODO PR visual)  
**Incumplimiento:** PR será rechazado automáticamente

---

## Resumen Ejecutivo

Cada PR visual DEBE completar este pipeline de 11 pasos. No hay atajos, no hay excepciones.

**Objetivo:** Garantizar fidelidad visual ≥95% contra Design Pack con correcciones automáticas.

---

## Quick Start (PR3 y adelante)

```bash
# 1. Hacer cambios visuales
nano src/components/landing/[Component].tsx

# 2. Verificar builds
npm run build && npm run lint

# 3. Capturar en 3 breakpoints
npm run dev  # Terminal 1
# Terminal 2:
node scripts/capture-screenshots.js       # Desktop (1440) + Mobile (375)
node scripts/capture-screenshots-tablet.js # Tablet (768)

# 4. Comparar vs Design Pack (MANUAL)
# Abrir lado a lado:
#   - docs/design/previews/PR{N}_desktop.png
#   - Design Pack mockup
# Documentar en PR{N}_DIFFERENCES.md

# 5. Corregir diferencias críticas
# Si hay ❌, editar código, regenerar, iterar

# 6. Generar informe final
# Crear PR{N}_FINAL_REPORT.md

# 7. Merge cuando aprobado
```

---

## Los 11 Pasos (Detallado)

### 1️⃣ Build OK
```bash
npm run build
```
**Checklist:**
- [ ] Compilación exitosa
- [ ] Sin errores TypeScript
- [ ] Output: "Compiled successfully in Xs"

**Si falla:**
- Revisar error en consola
- Corregir tipo/import
- Reintentar

---

### 2️⃣ Lint OK
```bash
npm run lint
```
**Checklist:**
- [ ] Cero nuevos errores
- [ ] Output: "X problems (pre-existing OK)"

**Si falla:**
- Pre-existentes: ignore
- Nuevos: corregir

---

### 3️⃣ TypeScript OK
```bash
npx tsc --noEmit
```
**Checklist:**
- [ ] Cero errores de tipo
- [ ] Output: "No errors found"

**Si falla:**
- Revisar imports
- Revisar props types
- Corregir tipos

---

### 4️⃣ Captura Desktop (1440px)
```bash
# Terminal 1: Server debe estar corriendo
npm run dev

# Terminal 2:
node scripts/capture-screenshots.js
```

**Output esperado:**
```
✅ Server is ready
🎬 Launching browser...
📷 Capturing desktop screenshot (1440x900)...
✅ Saved: PR2_desktop.png
📷 Capturing mobile screenshot (375x812)...
✅ Saved: PR2_mobile.png
```

**Checklist:**
- [ ] `PR{N}_desktop.png` existe
- [ ] Tamaño > 500KB (no blanco)
- [ ] Viewport: 1440×900
- [ ] Contenido visible

**Si falla:**
- Ver error en consola
- Verificar server: `curl http://localhost:3000`
- Reintentar script

---

### 5️⃣ Captura Tablet (768px)
```bash
# Terminal 2 (mismo server de arriba):
node scripts/capture-screenshots-tablet.js
```

**Output esperado:**
```
✅ Server is ready
🎬 Launching browser...
📷 Capturing tablet screenshot (768x1024)...
✅ Saved: PR2_tablet.png
```

**Checklist:**
- [ ] `PR{N}_tablet.png` existe
- [ ] Tamaño > 300KB
- [ ] Viewport: 768×1024
- [ ] Layout responsive visible

**Si falla:**
- Mismo debug que Desktop

---

### 6️⃣ Captura Mobile (375px)
**Ya generada en paso 4**, pero verificar:

```bash
ls -lh docs/design/previews/PR{N}_mobile.png
```

**Checklist:**
- [ ] `PR{N}_mobile.png` existe
- [ ] Tamaño > 200KB
- [ ] Viewport: 375×812
- [ ] Sin horizontal scroll

---

### 7️⃣ Comparación con Design Pack (MANUAL — CRÍTICO)

**Herramienta:** Visor de imágenes lado-a-lado (Preview, Photos, etc.)

**Comparar:**

| Breakpoint | Real | Mockup | Diferencias |
|-----------|------|--------|------------|
| Desktop | `PR{N}_desktop.png` | `Design Pack/[sección]/[mockup]_desktop.png` | [Documentar] |
| Tablet | `PR{N}_tablet.png` | `Design Pack/[sección]/[mockup]_tablet.png` | [Documentar] |
| Mobile | `PR{N}_mobile.png` | `Design Pack/[sección]/[mockup]_mobile.png` | [Documentar] |

**Checklist de Elementos (por breakpoint):**

**Composición:**
- [ ] Layout general coincide
- [ ] Alineaciones correctas
- [ ] Flujo visual sigue mockup

**Tipografía:**
- [ ] Tamaños coinciden (headlines, body)
- [ ] Pesos correctos (bold, regular)
- [ ] Line-height correcto

**Espaciado:**
- [ ] Padding coincide
- [ ] Gaps entre elementos correctos
- [ ] Márgenes superiores/inferiores OK

**Colores:**
- [ ] Paleta correcta (navy, gold, etc.)
- [ ] Tonos coinciden
- [ ] Contraste OK

**Elementos Visuales:**
- [ ] Sombras similares
- [ ] Bordes correctos
- [ ] Radios corners OK

**Responsive:**
- [ ] Desktop: 3+ cols si aplica
- [ ] Tablet: 2 cols si aplica
- [ ] Mobile: 1 col, full-width

---

### 8️⃣ Lista de Diferencias (DOCUMENTAR)

**Archivo:** `PR{N}_DIFFERENCES.md`

**Formato requerido:**

```markdown
# PR{N} — Diferencias Visuales Detectadas

**Fecha:** YYYY-MM-DD  
**Breakpoints:** 1440px (Desktop), 768px (Tablet), 375px (Mobile)

## Desktop (1440px)

| Elemento | Mockup | Real | Diferencia | Status |
|----------|--------|------|-----------|--------|
| Hero Headline | text-8xl | text-8xl | — | ✅ Match |
| Hero Gap | 96px | 96px | — | ✅ Match |
| CTA Button | gold bg | gold bg | — | ✅ Match |
| Pricing Cards | 3 cols | 3 cols | — | ✅ Match |
| Popular Card | navy ring | navy ring | — | ✅ Match |
| ... | ... | ... | ... | ... |

**Resumen Desktop:**
- ✅ Matches: 15
- ⚠ Menores: 0
- ❌ Críticas: 0

## Tablet (768px)

| Elemento | Mockup | Real | Diferencia | Status |
|----------|--------|------|-----------|--------|
| ... | ... | ... | ... | ... |

**Resumen Tablet:**
- ✅ Matches: X
- ⚠ Menores: X
- ❌ Críticas: X

## Mobile (375px)

| Elemento | Mockup | Real | Diferencia | Status |
|----------|--------|------|-----------|--------|
| ... | ... | ... | ... | ... |

**Resumen Mobile:**
- ✅ Matches: X
- ⚠ Menores: X
- ❌ Críticas: X

---

## Diferencias Críticas (REQUIEREN CORRECCIÓN)

❌ = Afecta jerarquía, composición, espaciado o tipografía principal

- ❌ [Elemento]: [Descripción exacta del problema]
  - Ubicación: [línea en archivo]
  - Solución: [qué cambiar]

---

## Diferencias Menores (TOLERADAS)

⚠ = Subpixel, tonos gris, sombras leves

- ⚠ [Elemento]: [Descripción]
  - Impacto: Mínimo
  - Decisión: Mantener (no afecta UX)
```

**Checklist:**
- [ ] Documento creado
- [ ] Tabla completa (todos los elementos)
- [ ] Diferencias clasificadas correctamente
- [ ] Problemas críticos identificados

---

### 9️⃣ Corrección Automática (SI hay ❌)

**Si NO hay diferencias críticas:** Ir al paso 10.

**Si hay diferencias críticas:**

1. **Identificar:** Ubicación exacta (componente + línea)
2. **Editar:** Cambiar propiedad CSS/clase Tailwind
3. **Verificar:** `npm run build` + `npm run lint`
4. **Regenerar:** Paso 4-6 (nuevas capturas)
5. **Comparar:** Paso 7 (documentar fix)
6. **Iterar:** Repetir hasta cero críticas

**Ejemplo:**
```
❌ Detectado: Hero headline más pequeño que mockup
- Archivo: src/components/landing/Hero.tsx:52
- Actual: lg:text-7xl
- Fix: lg:text-8xl
- Build: ✅ PASS
- Screenshot: ✅ REGENERADO
- Comparación: ✅ MATCH ahora
```

---

### 🔟 Nueva Captura (Post-correcciones)

**Solo si se aplicaron correcciones en paso 9:**

```bash
node scripts/capture-screenshots.js
node scripts/capture-screenshots-tablet.js
```

**Checklist:**
- [ ] Desktop regenerado
- [ ] Tablet regenerado
- [ ] Mobile regenerado
- [ ] Ninguna diferencia crítica pendiente
- [ ] Actualizar PR{N}_DIFFERENCES.md

---

### 1️⃣1️⃣ Informe Final del PR

**Archivo:** `PR{N}_FINAL_REPORT.md`

```markdown
# PR{N} — Informe Final

**Fecha:** 2026-06-30  
**Status:** ✅ APROBADO  
**Componentes:** Hero, Pricing  
**Cambios:** Ajuste de headline, spacing

---

## Cambios Implementados
- src/components/landing/Hero.tsx: text-8xl (line 52)
- Impacto: Alineación con mockup

---

## Verificaciones Ejecutadas
- ✅ Build: PASS (8.3s, 34 routes)
- ✅ Lint: PASS (0 nuevos errores)
- ✅ TypeScript: PASS (no errors)

---

## Capturas Generadas
- ✅ Desktop (1440×900): PR2_desktop.png
- ✅ Tablet (768×1024): PR2_tablet.png
- ✅ Mobile (375×812): PR2_mobile.png

---

## Análisis Visual

### Desktop (1440px)
| Criterio | Mockup | Real | Status |
|----------|--------|------|--------|
| Composición | Asimétrica | Asimétrica | ✅ |
| Headline | text-8xl | text-8xl | ✅ |
| Espaciado | 96px gaps | 96px gaps | ✅ |
| Colores | Navy, Gold | Navy, Gold | ✅ |
| **Fidelidad:** | — | — | **100%** |

### Tablet (768px)
| Criterio | Mockup | Real | Status |
|----------|--------|------|--------|
| Responsive | 2-3 cols | 2-3 cols | ✅ |
| **Fidelidad:** | — | — | **100%** |

### Mobile (375px)
| Criterio | Mockup | Real | Status |
|----------|--------|------|--------|
| Stack | 1 col | 1 col | ✅ |
| Full-width | Sí | Sí | ✅ |
| **Fidelidad:** | — | — | **100%** |

---

## Fidelidad Visual Global
**(100 + 100 + 100) / 3 = 100%** ✅✅✅

---

## Checklist Final
- ✅ Build OK
- ✅ Lint OK
- ✅ TypeScript OK
- ✅ Captura Desktop OK
- ✅ Captura Tablet OK
- ✅ Captura Mobile OK
- ✅ Comparación con Design Pack OK
- ✅ Diferencias documentadas
- ✅ Correcciones aplicadas
- ✅ Nueva captura generada
- ✅ Informe final completado

---

## Aprobación
✅ **LISTO PARA MERGE**

Fidelidad visual: 100% (umbral: ≥95%)  
Diferencias críticas: 0 (requerido: 0)  
Scope respetado: Sí (solo visual)

---

**Auditor:** Visual Pipeline  
**Fecha:** 2026-06-30
```

**Checklist:**
- [ ] Documento creado
- [ ] Fidelidad calculada desde evidencia
- [ ] Todos los 11 pasos completados
- [ ] Checklist final verificado

---

## Documentos Generados por PR

Cada PR DEBE generar estos 3 documentos:

```
docs/design/
├── PR{N}_DIFFERENCES.md      ← Tabla detallada de diferencias
├── PR{N}_FINAL_REPORT.md     ← Informe completo con fidelidad
└── previews/
    ├── PR{N}_desktop.png     ← Captura 1440×900
    ├── PR{N}_tablet.png      ← Captura 768×1024
    └── PR{N}_mobile.png      ← Captura 375×812
```

---

## Requerimientos No Negociables

### 🔴 NUNCA:
- ❌ Aceptar % sin evidencia visual (imágenes)
- ❌ Decir "probablemente match" sin comparación real
- ❌ Saltarse capturas en algún breakpoint
- ❌ Dejar diferencias críticas sin corrección
- ❌ Usar descripciones genéricas ("ajustado", "mejorado")

### 🟢 SIEMPRE:
- ✅ 3 capturas: Desktop, Tablet, Mobile
- ✅ Comparación visual lado-a-lado
- ✅ Documento detallado de diferencias
- ✅ Fidelidad desde evidencia real
- ✅ Corrección automática de críticas

### 📏 Umbrales Obligatorios:
- **Fidelidad mínima:** 95%
- **Meta ideal:** ≥99%
- **Diferencias críticas permitidas:** 0
- **Diferencias menores toleradas:** Sí (documentadas)

---

## Flujo de Rechazo

Si un PR no cumple:

```
1. ❌ Rechazado
2. 📝 Listar items faltantes de checklist
3. 🔧 Acciones requeridas para aprobación
4. 🔄 Resubmit cuando completado
```

**No hay excepciones. No hay atajos.**

---

## Scripts Disponibles

```bash
# Build
npm run build

# Lint
npm run lint

# Dev server
npm run dev

# Screenshots (Desktop + Mobile)
node scripts/capture-screenshots.js

# Screenshots (Tablet)
node scripts/capture-screenshots-tablet.js

# TypeScript check
npx tsc --noEmit
```

---

## Checklist de Aproximación (Para Nuevo PR)

```markdown
## PR{N}: [Descripción]

### Pre-Flight
- [ ] Cambios visuales solo (sin lógica)
- [ ] Dev server corriendo: `npm run dev`
- [ ] Browser console sin errores

### Pipeline Obligatorio
- [ ] Step 1: Build OK
- [ ] Step 2: Lint OK
- [ ] Step 3: TypeScript OK
- [ ] Step 4: Captura Desktop
- [ ] Step 5: Captura Tablet
- [ ] Step 6: Captura Mobile
- [ ] Step 7: Comparación vs Design Pack
- [ ] Step 8: Diferencias documentadas
- [ ] Step 9: Correcciones aplicadas (si aplica)
- [ ] Step 10: Nueva captura (si aplica)
- [ ] Step 11: Informe final

### Documentación
- [ ] `PR{N}_DIFFERENCES.md` creado
- [ ] `PR{N}_FINAL_REPORT.md` creado
- [ ] 3 screenshots en `docs/design/previews/`

### Fidelidad
- [ ] Desktop: X%
- [ ] Tablet: X%
- [ ] Mobile: X%
- [ ] Global: X% (≥95%?)

### Aprobación
- [ ] Fidelidad ≥95%
- [ ] Diferencias críticas = 0
- [ ] Scope respetado (solo visual)
- [ ] ✅ LISTO PARA MERGE
```

---

## Vigencia

**Establecido:** 2026-06-30  
**Obligatorio desde:** PR3  
**Aplica a:** TODO PR con cambios visuales  
**Exención:** Solo PRs 100% backend (sin componentes React)

---

**Version:** 1.0  
**Status:** 🔴 MANDATORIO E INVARIANTE
