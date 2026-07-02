# 🚀 Quick Reference — Pipeline Visual

**Para copiar y pegar en terminal cuando inicias un nuevo PR.**

---

## Resumen de 30 Segundos

Cada PR visual requiere:
1. Build ✅ + Lint ✅ + TypeScript ✅
2. 3 screenshots: Desktop (1440), Tablet (768), Mobile (375)
3. Comparar vs Design Pack
4. Documentar diferencias
5. Corregir si hay críticas
6. Informe final
7. Merge cuando ≥95% fidelidad

**Documentación:** `docs/PIPELINE_VISUAL_MANDATORY.md`

---

## Flujo Rápido (Copy-Paste)

```bash
# 1. Hacer cambios visuales
# (editar archivo en src/components/...)

# 2. Verificar builds
npm run build
npm run lint
npx tsc --noEmit

# 3. Iniciar dev server (Terminal 1)
npm run dev

# 4. Capturar screenshots (Terminal 2)
node scripts/capture-screenshots.js        # Desktop + Mobile
node scripts/capture-screenshots-tablet.js # Tablet

# 5. MANUAL: Comparar vs Design Pack
# - Abrir: docs/design/previews/PR{N}_*.png
# - Vs: Design Pack mockups
# - Documentar en: PR{N}_DIFFERENCES.md

# 6. Corregir diferencias críticas (si aplica)
# - Editar componente
# - Repetir: npm run build → screenshots → comparar

# 7. Crear informe: PR{N}_FINAL_REPORT.md

# 8. Verificar checklist y merge
```

---

## Checklist de 11 Pasos

```
[ ] 1. Build OK
[ ] 2. Lint OK
[ ] 3. TypeScript OK
[ ] 4. Captura Desktop (1440)
[ ] 5. Captura Tablet (768)
[ ] 6. Captura Mobile (375)
[ ] 7. Comparación vs Design Pack
[ ] 8. Diferencias documentadas
[ ] 9. Correcciones (si críticas)
[ ] 10. Nueva captura (post-fix)
[ ] 11. Informe final
```

---

## Scripts

```bash
# Quality checks
npm run build               # Build check
npm run lint                # Lint check
npx tsc --noEmit           # TypeScript check

# Screenshots (OBLIGATORIO)
node scripts/capture-screenshots.js        # Desktop + Mobile
node scripts/capture-screenshots-tablet.js # Tablet

# Server
npm run dev                 # Dev server (terminal 1)
./scripts/wait-for-dev.sh   # Check server ready
```

---

## Documentos a Generar por PR

**Cada PR genera 3 documentos:**

1. **`PR{N}_DIFFERENCES.md`** — Tabla de diferencias
   ```markdown
   | Elemento | Mockup | Real | Status |
   |----------|--------|------|--------|
   | Headline | text-8xl | text-8xl | ✅ |
   | ... | ... | ... | ... |
   
   Críticas: 0
   Menores: 0
   ```

2. **`PR{N}_FINAL_REPORT.md`** — Resumen ejecutivo
   ```markdown
   # PR{N} Final Report
   
   Fidelidad: X% (Desktop) / X% (Tablet) / X% (Mobile)
   Global: X%
   
   ✅ APROBADO (≥95%)
   ```

3. **Screenshots en `docs/design/previews/`**
   - `PR{N}_desktop.png` (1440×900)
   - `PR{N}_tablet.png` (768×1024)
   - `PR{N}_mobile.png` (375×812)

---

## Umbrales Obligatorios

| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Fidelidad visual | 95% | ≥99% |
| Diferencias críticas | 0 | 0 |
| Diferencias menores | Toleradas | 0 |
| Build status | PASS | PASS |
| Lint status | PASS | PASS |
| TypeScript | PASS | PASS |

---

## Diferencias: Crítica vs Menor

### ❌ CRÍTICA (Requiere fix)
- Headline más pequeño/grande
- Layout distinto (asimétrico vs simétrico)
- Spacing importante cambió
- Color incorrecto
- Tipografía weight/size diferente
- Composición no coincide

### ⚠ MENOR (Tolerable)
- Subpixel mismatch
- Tonos de gris levemente distintos
- Sombras ligeramente diferentes
- Rounded corners 1-2px diferente
- Transiciones/animaciones (no CSS)

---

## Quick Troubleshooting

| Problema | Solución |
|----------|----------|
| Screenshot en blanco | Verificar `npm run dev`, luego `npm run build` |
| Script falla "Server not ready" | Esperar 5s y reintentar |
| Build error | Leer error completo, corregir tipo/import |
| Lint error nuevo | Corregir antes de screenshots |
| Diferencia difícil de ver | Usar zoom en imagen o medir píxeles |

---

## Template PR Description

```markdown
## PR{N}: [Descripción de cambios]

### Verificaciones
- ✅ Build OK
- ✅ Lint OK
- ✅ TypeScript OK

### Capturas

**Desktop (1440×900)**
![PR{N} Desktop](docs/design/previews/PR{N}_desktop.png)

**Tablet (768×1024)**
![PR{N} Tablet](docs/design/previews/PR{N}_tablet.png)

**Mobile (375×812)**
![PR{N} Mobile](docs/design/previews/PR{N}_mobile.png)

### Fidelidad Visual
- Desktop: X%
- Tablet: X%
- Mobile: X%
- **Global: X%** ✅ (≥95%)

### Documentación
- [Diferencias](docs/design/PR{N}_DIFFERENCES.md)
- [Informe Final](docs/design/PR{N}_FINAL_REPORT.md)

### Scope Respetado
- ✅ Solo visual (sin lógica)
- ✅ Sin rutas/precios
- ✅ Sin Stripe/Supabase
```

---

## Ejemplos Reales

### PR2 (Reference)

```
Build:      PASS ✅
Lint:       PASS ✅ (0 nuevos)
TypeScript: PASS ✅

Desktop:    PR2_desktop.png → 100% match
Tablet:     PR2_tablet.png → 100% match
Mobile:     PR2_mobile.png → 100% match

Fidelidad:  100% ✅
Críticas:   0 ✅
Status:     APROBADO ✅
```

---

## Dónde Encontrar Documentación

| Pregunta | Documento |
|----------|-----------|
| "¿Cuál es el pipeline completo?" | `PIPELINE_VISUAL_MANDATORY.md` |
| "¿Cuáles son los 11 pasos?" | `PR_CHECKLIST_MANDATORY.md` |
| "¿Cómo captur screenshots?" | Scripts: `capture-screenshots*.js` |
| "¿Qué es crítica vs menor?" | `PIPELINE_VISUAL_MANDATORY.md` → Paso 8 |
| "¿Qué fidelidad necesito?" | `QUICK_REFERENCE.md` (este) → Umbrales |
| "¿Cómo verifico?" | Checklist de 11 pasos |

---

## Estado Actual

- ✅ PR2 CERRADA (100% fidelidad)
- 🔄 PR3 PRÓXIMA (usar este pipeline)
- 📋 Pipeline OBLIGATORIO (sin excepciones)
- 🚀 Listo para continuar

---

**Última actualización:** 2026-06-30  
**Vigencia:** PR3 en adelante (obligatorio)
