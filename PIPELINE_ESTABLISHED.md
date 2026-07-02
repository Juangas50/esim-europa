# ✅ PIPELINE VISUAL ESTABLECIDO

**Fecha:** 2026-06-30  
**Status:** 🔴 **OBLIGATORIO E INVARIANTE**  
**Vigencia:** PR3 en adelante

---

## Qué Está Establecido

### ✅ 1. Checklist Obligatorio de 11 Pasos

Cada PR visual DEBE completar:

```
1. Build OK
2. Lint OK
3. TypeScript OK
4. Captura Desktop (1440px)
5. Captura Tablet (768px)
6. Captura Mobile (375px)
7. Comparación vs Design Pack (manual)
8. Lista de diferencias (documentada)
9. Corrección automática (si críticas)
10. Nueva captura (post-correcciones)
11. Informe final
```

**Documentación:** `docs/PR_CHECKLIST_MANDATORY.md`

---

### ✅ 2. Scripts Automatizados

Disponibles en `scripts/`:

- `capture-screenshots.js` — Desktop (1440) + Mobile (375)
- `capture-screenshots-tablet.js` — Tablet (768)
- `wait-for-dev.sh` — Server health check

**Uso:**
```bash
npm run dev  # Terminal 1
node scripts/capture-screenshots.js       # Terminal 2
node scripts/capture-screenshots-tablet.js
```

---

### ✅ 3. Documentos Requeridos por PR

Cada PR genera 3 artefactos obligatorios:

1. **`PR{N}_DIFFERENCES.md`**
   - Tabla comparativa (Mockup vs Real)
   - Por breakpoint: Desktop, Tablet, Mobile
   - Clasificación: ✅ Match, ⚠ Menor, ❌ Crítica

2. **`PR{N}_FINAL_REPORT.md`**
   - Resumen ejecutivo
   - Fidelidad calculada desde evidencia visual
   - Checklist de 11 pasos verificado

3. **Screenshots en `docs/design/previews/`**
   - `PR{N}_desktop.png` (1440×900)
   - `PR{N}_tablet.png` (768×1024)
   - `PR{N}_mobile.png` (375×812)

---

### ✅ 4. Requerimientos No Negociables

**NUNCA:**
- ❌ Aceptar % sin evidencia visual (imágenes)
- ❌ Saltarse capturas en algún breakpoint
- ❌ Dejar diferencias críticas sin corrección
- ❌ Descripciones genéricas ("ajustado", "mejorado")

**SIEMPRE:**
- ✅ 3 capturas: Desktop, Tablet, Mobile
- ✅ Comparación visual lado-a-lado
- ✅ Documento detallado de diferencias
- ✅ Fidelidad desde evidencia real
- ✅ Corrección automática de críticas

---

### ✅ 5. Umbrales Obligatorios

| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Fidelidad visual global | 95% | ≥99% |
| Diferencias críticas | 0 | 0 |
| Build status | PASS | PASS |
| Lint status | PASS | PASS |
| TypeScript errors | 0 | 0 |

**Cálculo de fidelidad:**
```
Global Fidelity = (Desktop% + Tablet% + Mobile%) / 3
```

---

### ✅ 6. Definición: Crítica vs Menor

**❌ CRÍTICA** (Requiere fix antes de merge):
- Headline/título más pequeño o grande (jerarquía)
- Layout completamente distinto (composición)
- Spacing importante cambió (padding/gap)
- Color incorrecto (paleta)
- Tipografía weight/size diferente (tipografía)
- Alineación no coincide (posicionamiento)

**⚠ MENOR** (Tolerable, documentada):
- Variaciones subpixel
- Tonos gris levemente distintos
- Sombras ligeramente diferentes
- Rounded corners ±1-2px
- Animaciones/transiciones no-CSS

---

### ✅ 7. Corrección Automática

**Loop iterativo si hay críticas:**

1. Identificar componente + propiedad
2. Editar código fuente
3. Verificar: `npm run build` + `npm run lint`
4. Regenerar: Screenshots (3 breakpoints)
5. Comparar nuevamente
6. Repetir hasta 0 críticas
7. Documentar en `PR{N}_DIFFERENCES.md`

---

### ✅ 8. Proceso de Aprobación

```
PR Submitted
    ↓
Ejecutar 11 pasos
    ↓
¿Fidelidad ≥95%? NO → Rechazado + Items faltantes
    ↓
¿Críticas = 0?   NO → Corregir + Loop
    ↓
¿Documentado?    NO → Crear docs
    ↓
✅ APROBADO PARA MERGE
```

**No hay excepciones. No hay atajos.**

---

## Documentación Relacionada

### Guías Completas
- `docs/PIPELINE_VISUAL_MANDATORY.md` — Pipeline completo (11 pasos)
- `docs/PR_CHECKLIST_MANDATORY.md` — Checklist detallado por paso
- `docs/QUICK_REFERENCE.md` — Guía rápida (copy-paste)

### Referencias Técnicas
- `docs/VALIDATION_PIPELINE.md` — V1 (inicial)
- `scripts/capture-screenshots.js` — Desktop/Mobile
- `scripts/capture-screenshots-tablet.js` — Tablet

### Evidencia PR2
- `docs/design/PR2_VISUAL_AUDIT_v2.md` — Auditoría final (100%)
- `docs/design/PR2_CLOSURE.md` — Aprobación
- `docs/design/previews/PR2_*.png` — Screenshots

### Proyecto
- `docs/PROJECT_STATUS.md` — Estado general
- `PIPELINE_ESTABLISHED.md` — Este archivo

---

## Estado Actual

| Item | Status |
|------|--------|
| PR1 (Tokens) | ✅ COMPLETADA |
| PR2 (Hero+Pricing) | ✅ CERRADA (100% fidelidad) |
| Pipeline establecido | 🔴 OBLIGATORIO |
| Scripts automatizados | ✅ DISPONIBLES |
| Documentación completa | ✅ GENERADA |

---

## Próximos Pasos

1. **PR3 (cuando esté lista):**
   - Ejecutar pipeline completo (11 pasos)
   - Generar 3 documentos
   - Generar 3 screenshots
   - Alcanzar ≥95% fidelidad
   - Merge cuando aprobado

2. **PRs futuros:**
   - Mismo proceso iterativo
   - Pipeline es no-negociable
   - Estándares se mantienen

3. **CI/CD (futuro):**
   - Automatizar: Build, Lint, TypeScript, Screenshots
   - Notificación automática con capturas
   - Validación en pipeline

---

## Resumen Ejecutivo

### Lo Que Está Establecido

✅ **Checklist de 11 pasos** — Obligatorio, sin excepciones  
✅ **Scripts de captura** — Desktop, Tablet, Mobile  
✅ **Umbrales de fidelidad** — 95% mínimo, ≥99% ideal, 0 críticas  
✅ **Documentación requerida** — 3 docs + 3 screenshots por PR  
✅ **Corrección automática** — Loop iterativo para críticas  
✅ **Validación manual** — Comparación vs Design Pack lado-a-lado  
✅ **Requerimientos no-negociables** — Nunca % sin evidencia  

### Vigencia

**Obligatorio desde:** PR3 en adelante  
**Aplica a:** TODO PR con cambios visuales  
**Exención:** Solo PRs 100% backend (sin React)

### Incumplimiento

Si un PR no cumple:
1. ❌ Rechazado
2. 📝 Listar items faltantes
3. 🔧 Acciones requeridas
4. 🔄 Resubmit cuando completado

---

## Quick Links

| Necesito... | Ir a... |
|------------|---------|
| Ver pipeline completo | `docs/PIPELINE_VISUAL_MANDATORY.md` |
| Checklist de 11 pasos | `docs/PR_CHECKLIST_MANDATORY.md` |
| Guía rápida (copy-paste) | `docs/QUICK_REFERENCE.md` |
| Scripts disponibles | `scripts/` |
| Evidencia PR2 | `docs/design/PR2_*.md` |
| Estado del proyecto | `docs/PROJECT_STATUS.md` |

---

## Conclusión

**Pipeline visual establecido y documentado completamente.**

**Estándares no negociables:** 95% mínimo, 0 críticas, 3 screenshots, evidencia visual obligatoria.

**PR3 y adelante deben seguir este pipeline sin excepciones.**

---

**Establecido:** 2026-06-30  
**Status:** 🔴 MANDATORIO E INVARIANTE  
**Próximo:** PR3 (aplicar pipeline)

---

## 🎯 Acción Inmediata

Cuando inicies PR3:
1. Lee: `docs/QUICK_REFERENCE.md` (30 segundos)
2. Copia/pega: Flujo de terminal
3. Ejecuta: 11 pasos del checklist
4. Genera: 3 documentos + 3 screenshots
5. Compara: Vs Design Pack
6. Corrige: Si hay críticas
7. Reporta: Fidelidad final
8. Merge: Cuando ≥95%

**¡Listo para continuar!**
