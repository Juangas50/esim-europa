# Mejoras Futuras — RUTA34 Design System

**Fecha:** 2026-07-01  
**Prioridad:** Media  
**Fase:** Post-PR5.1

---

## 1. Sustituir Pills de Texto por SVGs Reales — Payment Methods

**Descripción:**
PR5.1 implementa payment methods como pills de texto ("Visa", "Mastercard", etc.). Para máxima claridad visual y profesionalismo, estos deben ser reemplazados por logos SVG reales.

**Actual:**
```jsx
<div className="px-3 py-1.5 rounded-full bg-white border border-[var(--color-border)]">
  <span className="text-xs font-bold text-[var(--color-navy)]">
    {name}
  </span>
</div>
```

**Propuesto:**
```jsx
<img 
  src={`/logos/payment/${name.toLowerCase()}.svg`}
  alt={name}
  className="h-6 w-auto"
/>
```

**Archivo a modificar:** `src/components/landing/PaymentMethods.tsx`

**Logos necesarios:**
- `/public/logos/payment/visa.svg`
- `/public/logos/payment/mastercard.svg`
- `/public/logos/payment/apple-pay.svg`
- `/public/logos/payment/google-pay.svg`
- `/public/logos/payment/paypal.svg`

**Beneficio:** Mayor claridad, profesionalismo, reconocimiento visual.

**Esfuerzo:** 2-3 horas (buscar/crear SVGs + integración)

---

## 2. Revisar Alternancia Visual de Contact Section

**Descripción:**
Contact tiene background `warm-white` igual que TrustBadges, creando monotonía visual. Futuras iteraciones deben evaluar cambiar Contact a background `white`.

**Actual:**
```
TrustBadges: warm-white
Contact: warm-white (repetición)
```

**Propuesto:**
```
TrustBadges: warm-white
Contact: white (mejor alternancia)
```

**Archivo a modificar:** `src/components/landing/Contact.tsx` (línea 34)

**Cambio:**
```diff
- className="py-10 md:py-16 px-4 bg-[var(--color-warm-white)]"
+ className="py-10 md:py-16 px-4 bg-white"
```

**Consideración:** Necesita verificación visual en capturas para asegurar que el contraste con cards y borders siga siendo óptimo.

**Esfuerzo:** 30 minutos

---

## 3. Optimizar Densidad Mobile — Conditional Grid

**Descripción:**
Mobile scroll es muy largo (~19K pixels). Si analytics mostran bounce/abandonment alto en mobile, considerar cambios de layout:
- Contact cards: grid 2-col en tablet+
- Accordeón para secciones no críticas en mobile

**Actual:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  {/* 3 cards stacked en mobile */}
</div>
```

**Propuesto (solo si datos lo justifican):**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 2 cols en tablet, 3 en desktop */}
</div>
```

**Condición:** Ejecutar análisis de bounce rate en mobile antes de implementar.

**Archivos afectados:**
- `src/components/landing/Contact.tsx`
- `src/components/landing/Guarantees.tsx`

**Esfuerzo:** 1-2 horas (con justificación data)

---

## 4. (Bonus) Mejorar Icon Contrast en TrustBadges

**Descripción:**
Icons duotone (gold) en warm-white tienen contraste marginal (~3.5:1, target 4.5:1 AA).

**Opciones:**
- Aumentar `size` de icono (32 → 40)
- Cambiar weight a `bold` en lugar de `duotone`
- Usar background pill alrededor del icon

**Archivo:** `src/components/landing/TrustBadges.tsx`

**Esfuerzo:** 30 minutos

---

## Timeline Recomendada

1. **Inmediato (PR5.2):** Payment logos SVGs
2. **Sprint siguiente:** Alternancia Contact (si feedback visual lo justifica)
3. **Post analytics:** Optimización mobile (si bounce rate > umbral)
4. **Bonus:** Icon contrast (quick win)

---

## Notas

- Las correcciones actuales (PR5.1) son funcionales y visualmente aceptables
- Estas mejoras son **optimizaciones**, no críticas
- Priorizar **payment logos SVGs** para profesionalismo
- Esperar **datos de analytics** antes de cambios de layout en mobile

---

**Documento de referencia:** `docs/design/FUTURE_IMPROVEMENTS.md`  
**Creado:** 2026-07-01  
**Última actualización:** 2026-07-01
