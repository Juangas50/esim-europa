# 🔴 CHECKLIST OBLIGATORIO PARA TODOS LOS PRs

**Vigencia:** A partir de PR2 en adelante (TODO PR visual)  
**Aplicable a:** Cada PR que incluya cambios visuales/CSS  
**Incumplimiento:** PR será rechazado automáticamente

---

## Checklist Completo (11 items)

Cada PR DEBE completar TODOS estos items en orden:

### ✅ 1. Build OK
```bash
npm run build
```
- ✅ Compilación exitosa
- ✅ Sin errores TypeScript
- ✅ Tiempo < 10s

**Evidencia:** Output de consola mostrando "Compiled successfully"

---

### ✅ 2. Lint OK
```bash
npm run lint
```
- ✅ Cero nuevos errores
- ✅ Warnings aceptables (pre-existentes OK)

**Evidencia:** Output de consola mostrando número de problemas

---

### ✅ 3. TypeScript OK
```bash
npx tsc --noEmit
```
- ✅ Cero errores de tipo
- ✅ Imports correctos
- ✅ Props correctas

**Evidencia:** "No errors found" o similar

---

### ✅ 4. Captura Desktop (1440px)
```bash
# Server corriendo en puerto 3000
node scripts/capture-screenshots.js

# Genera: docs/design/previews/PR{N}_desktop.png
```
- ✅ Viewport: 1440×900
- ✅ Archivo guardado: `PR{N}_desktop.png`
- ✅ Tamaño > 500KB (imagen real, no blank)

**Evidencia:** Imagen guardada y visible

---

### ✅ 5. Captura Tablet (768px)
```bash
# Crear script: scripts/capture-screenshots-tablet.js
# Viewport: 768×1024

node scripts/capture-screenshots-tablet.js

# Genera: docs/design/previews/PR{N}_tablet.png
```
- ✅ Viewport: 768×1024
- ✅ Archivo guardado: `PR{N}_tablet.png`
- ✅ Responsive correcto

**Evidencia:** Imagen guardada y visible

---

### ✅ 6. Captura Mobile (375px)
```bash
# Ya generado por capture-screenshots.js
# Viewport: 375×812

# Verifica: docs/design/previews/PR{N}_mobile.png
```
- ✅ Viewport: 375×812
- ✅ Archivo guardado: `PR{N}_mobile.png`
- ✅ Sin horizontal scroll

**Evidencia:** Imagen guardada y visible

---

### ✅ 7. Comparación con Design Pack
**Manual (requerido para aprobación)**

Comparar lado a lado:
- Desktop: `PR{N}_desktop.png` vs `Design Pack/[seción]/[mockup]_desktop.png`
- Tablet: `PR{N}_tablet.png` vs `Design Pack/[sección]/[mockup]_tablet.png`
- Mobile: `PR{N}_mobile.png` vs `Design Pack/[sección]/[mockup]_mobile.png`

**Criterios de comparación:**
1. Composición (layout, alineación)
2. Jerarquía tipográfica (tamaños, pesos)
3. Espaciado (padding, gaps, márgenes)
4. Colores (paleta, tokens, tonos)
5. Elementos visuales (sombras, bordes, radius)
6. Responsive (comportamiento en 3 breakpoints)

**Evidencia:** Análisis punto a punto registrado

---

### ✅ 8. Lista de Diferencias
**Documento: `PR{N}_DIFFERENCES.md`**

Formato requerido:
```markdown
# PR{N} — Diferencias Detectadas

## Desktop (1440px)
| Elemento | Mockup | Real | Status |
|----------|--------|------|--------|
| Hero Headline | text-8xl | text-8xl | ✅ Match |
| Hero Gap | 96px | 96px | ✅ Match |
| ... | ... | ... | ... |

## Tablet (768px)
| Elemento | Mockup | Real | Status |
|----------|--------|------|--------|
| ... | ... | ... | ... |

## Mobile (375px)
| Elemento | Mockup | Real | Status |
|----------|--------|------|--------|
| ... | ... | ... | ... |

## Resumen
- ✅ Matches: X
- ⚠ Diferencias menores: X (no requieren fix)
- ❌ Diferencias importantes: X (requieren fix)

## Diferencias Críticas (Requieren corrección)
- ❌ [Elemento]: [Descripción del problema]
- ❌ [Elemento]: [Descripción del problema]
```

**Criterio de crítico:**
- ❌ Afecta jerarquía visual (tamaño headline, énfasis)
- ❌ Afecta composición (alineación, posicionamiento)
- ❌ Afecta espaciado principal (gutter, padding, gaps)
- ❌ Afecta tipografía principal (weight, size, font)

**No crítico:**
- ⚠ Pequeñas variaciones subpixel
- ⚠ Sombras/blur ligeramente diferentes
- ⚠ Tonos de gris levemente distintos

**Evidencia:** Documento con tabla comparativa

---

### ✅ 9. Corrección Automática de Diferencias Críticas
**Proceso iterativo si se detectaron ❌**

Si hay diferencias críticas:
1. Identificar componente y propiedad
2. Editar código fuente
3. Verificar `npm run build` y `npm run lint`
4. Regenerar capturas (items 4-6)
5. Repetir comparación (item 7-8)
6. Iterar hasta que NO haya diferencias críticas

**Evidencia:** Commits de corrección + capturas actualizadas

---

### ✅ 10. Nueva Captura (Post-correcciones)
**Si se aplicaron correcciones en item 9:**

```bash
npm run dev  # Terminal 1

# Terminal 2:
node scripts/capture-screenshots.js
node scripts/capture-screenshots-tablet.js

# Genera nuevas: PR{N}_desktop.png, PR{N}_tablet.png, PR{N}_mobile.png
```

- ✅ Todas las diferencias críticas resueltas
- ✅ Nuevas capturas guardan evidencia de fix
- ✅ Comparación sin diferencias críticas

**Evidencia:** Nuevas imágenes en `docs/design/previews/`

---

### ✅ 11. Informe Final del PR
**Documento: `PR{N}_FINAL_REPORT.md`**

Formato requerido:
```markdown
# PR{N} — Informe Final

**Fecha:** YYYY-MM-DD  
**Status:** ✅ APROBADO / ❌ RECHAZADO  
**Fidelidad Visual:** X%

## Resumen Ejecutivo
[Descripción de cambios visuales]

## Cambios Implementados
- [Componente]: [Cambio]
- [Componente]: [Cambio]

## Verificaciones
- ✅ Build: PASS
- ✅ Lint: PASS
- ✅ TypeScript: PASS
- ✅ Desktop: PASS
- ✅ Tablet: PASS
- ✅ Mobile: PASS

## Análisis Visual

### Desktop (1440px)
- Composición: ✅ Match
- Tipografía: ✅ Match
- Espaciado: ✅ Match
- Colores: ✅ Match
- **Fidelidad Desktop:** X%

### Tablet (768px)
- Composición: ✅ Match
- Responsive: ✅ Match
- **Fidelidad Tablet:** X%

### Mobile (375px)
- Composición: ✅ Match
- Touch-friendly: ✅ Match
- **Fidelidad Mobile:** X%

## Fidelidad Visual Global
**[Desktop% + Tablet% + Mobile%] / 3 = X%**

## Diferencias Críticas Resueltas
- ✅ [Si las había, documentar solución]

## Scope Respetado
- ✅ Sin cambios de lógica
- ✅ Sin cambios de rutas
- ✅ Sin cambios de precios
- ✅ Solo cambios visuales

## Checklist Final
- ✅ Build OK
- ✅ Lint OK
- ✅ TypeScript OK
- ✅ 3x Capturas OK
- ✅ Comparación OK
- ✅ Diferencias documentadas
- ✅ Correcciones aplicadas
- ✅ Nuevas capturas OK
- ✅ Informe final generado

## Aprobación
✅ **LISTO PARA MERGE** — Fidelidad ≥95%, sin diferencias críticas
```

**Evidencia:** Documento con análisis completo

---

## Requerimientos No Negociables

### 🔴 NUNCA aceptar:
- ❌ Porcentajes de fidelidad sin evidencia visual
- ❌ "Probablemente match" sin comparación real
- ❌ Capturas sin viewport correcto
- ❌ Diferencias críticas sin corrección

### 🟢 SIEMPRE requerir:
- ✅ 3 capturas: Desktop (1440), Tablet (768), Mobile (375)
- ✅ Comparación visual lado a lado contra mockup
- ✅ Documento detallado de diferencias
- ✅ Fidelidad calculada desde evidencia visual
- ✅ Corrección automática de críticas

### 📏 Umbrales:
- **Fidelidad mínima:** 95%
- **Meta ideal:** ≥99%
- **Diferencias críticas permitidas:** 0
- **Diferencias menores toleradas:** Sí (pero documentadas)

---

## Plantilla PR Description (Markdown)

```markdown
## PR{N}: [Descripción visual]

### Cambios
- [Componente]: [Cambio visual]
- [Componente]: [Cambio visual]

### Verificaciones
- ✅ Build OK
- ✅ Lint OK
- ✅ TypeScript OK

### Capturas
**Desktop (1440×900):**
![PR{N} Desktop](docs/design/previews/PR{N}_desktop.png)

**Tablet (768×1024):**
![PR{N} Tablet](docs/design/previews/PR{N}_tablet.png)

**Mobile (375×812):**
![PR{N} Mobile](docs/design/previews/PR{N}_mobile.png)

### Comparación con Design Pack
[Link a PR{N}_DIFFERENCES.md]

### Fidelidad Visual
- Desktop: X%
- Tablet: X%
- Mobile: X%
- **Global:** X% (✅ / ❌)

### Scope Respetado
- ✅ Sin lógica de negocio
- ✅ Sin rutas
- ✅ Sin precios/Stripe
- ✅ Solo visual

### Documentación
- [PR{N}_DIFFERENCES.md](docs/design/PR{N}_DIFFERENCES.md)
- [PR{N}_FINAL_REPORT.md](docs/design/PR{N}_FINAL_REPORT.md)
```

---

## Proceso Automático (CI/CD Futuro)

Cuando CI/CD esté habilitado, estos steps deben ser automáticos:

1. **Build Check:** `npm run build`
2. **Lint Check:** `npm run lint`
3. **Type Check:** `npx tsc --noEmit`
4. **Screenshot Generation:** Puppeteer (3 viewports)
5. **Upload Artifacts:** Screenshots a build artifacts
6. **Notify:** Comentario en PR con capturas

---

## Incumplimiento

Si un PR no cumple este checklist:

1. ❌ **Rechazado automáticamente**
2. 📝 Listar items faltantes
3. 🔧 Requerimientos para aprobación
4. 🔄 Resubmit cuando completado

**No hay excepciones.**

---

## Vigencia

**Obligatorio desde:** PR3 en adelante (PR2 ya cerrado)  
**Aplicable a:** TODO PR con cambios visuales  
**Exención:** Solo si PR es 100% backend/API (sin componentes React)

---

**Última actualización:** 2026-06-30  
**Versión:** 1.0 — Establecido como mandatorio
