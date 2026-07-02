# HOTFIX-i18n-visible-keys — AUDITORÍA COMPLETA

**Fecha:** 2026-07-01  
**Status:** 🔴 AUDITORÍA EN PROCESO

---

## 📋 HALLAZGOS

### CRÍTICOS: Keys usadas pero NO coinciden con traducciones

#### **Hero.tsx**

| Línea | Key usada | Existe en es.json | Acción necesaria |
|-------|-----------|-------------------|------------------|
| 78 | `t("explore")` | ❌ NO | Cambiar a `t("ctaSecondary")` |
| 85 | `t("noAutoRenew")` | ⚠️ PARCIAL | Key no existe sola; está en `priceAnchor` → Solución: crear key separada o remover |

#### **Plans.tsx** (Pendiente lectura)

Necesito leer Plans.tsx para verificar:
- `activateAnytime`
- `coverage`
- `daysDuration`
- `euRoaming`
- `recommended`
- `selectPlan`

---

## Próximos pasos

1. Leer Plans.tsx completamente
2. Comparar cada key contra es.json y pt.json
3. Crear tabla completa de correcciones
4. Aplicar fixes
5. Validar visualmente
6. Generar documento final

---

