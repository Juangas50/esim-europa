# CLAUDE_CODE_PROMPTS.md

## Prompt 0 — Auditoría inicial del repo

```md
Quiero implementar la evolución visual premium de Ruta34 siguiendo la documentación y mockups en `/docs/design`.

NO cambies lógica de negocio.
NO cambies rutas.
NO cambies precios.
NO menciones Vodafone.
NO implementes área privada.
NO rompas el checkout existente.

Primero analiza el proyecto y dime:
1. Stack usado.
2. Estructura de componentes.
3. Dónde están Home, checkout, emails y estilos globales.
4. Qué archivos tocarías.
5. Plan de implementación por fases.

No modifiques código todavía.
```

---

## Prompt 1 — Fase 1: Design tokens

```md
Implementa solo la Fase 1: Design Tokens y estilos base.

Referencias:
- `/docs/design/01_Art_Direction/01_design_vision_board.png`
- `/docs/design/00_Docs/DESIGN_REFERENCE.md`

Objetivo:
- Paleta Ruta34.
- Tipografía.
- Espaciados.
- Radios.
- Sombras.
- Botones base.
- Cards base.
- Inputs base.

No modifiques pantallas todavía.
Mantén compatibilidad con lo existente.
Antes de cambiar, explícame los archivos que vas a tocar.
```

---

## Prompt 2 — Fase 2: Home V2

```md
Implementa la Home V2 siguiendo estas referencias:

- `/docs/design/02_Home/01_home_desktop_v2_full.png`
- `/docs/design/02_Home/02_home_mobile_v2.png`
- `/docs/design/01_Art_Direction/02_hero_v2_three_concepts.png`

Prioridades:
1. Eliminar fondo gris.
2. Usar fondo crema/blanco cálido.
3. Hero con fotografía integrada.
4. Pricing premium.
5. Testimonios más humanos.
6. CTA final fuerte.
7. Mobile first.

No cambies checkout.
No cambies lógica de planes.
No cambies precios.
```

---

## Prompt 3 — Fase 3: Pricing

```md
Implementa la nueva experiencia visual de Pricing usando:

- `/docs/design/03_Pricing/01_pricing_experience_desktop.png`

Objetivo:
- Plan recomendado muy claro.
- Cards premium.
- Beneficios visibles.
- Jerarquía clara de GB, días y precio.
- Mantener precios y datos reales existentes.
- No inventar planes.
```

---

## Prompt 4 — Fase 4: Checkout

```md
Implementa el rediseño visual del checkout manteniendo exactamente el flujo actual.

Referencias:
- `/docs/design/05_Checkout/01_checkout_full_flow_concept.png`
- `/docs/design/05_Checkout/02_checkout_desktop_pack.png`
- `/docs/design/04_Mobile/02_mobile_checkout_flow.png`

Pantallas:
1. Datos del viajero.
2. Validación de identidad.
3. Activación.
4. Pago.
5. Confirmación.

Mantén los mismos campos y validaciones.
Solo mejora UI, jerarquía, copy visual y experiencia.
```

---

## Prompt 5 — Fase 5: Loader, email, guía y errores

```md
Implementa loader, email, guía de instalación y estados de error usando:

- `/docs/design/06_Email_Guide_Loader/01_final_success_loader_email_guide_errors.png`
- `/docs/design/06_Email_Guide_Loader/02_loader_email_guide_variant.png`

Requisitos:
- Loader de compra con estados: validando pedido, generando eSIM, generando QR, enviando email.
- Email responsive con QR protagonista.
- Página de guía de instalación web, no PDF.
- Estados de error: pago no procesado, tarjeta rechazada, documento inválido, email no entregado.
- Botón WhatsApp visible en email y guía.
```

---

## Prompt 6 — QA visual

```md
Realiza QA visual completo.

Revisa:
- Mobile Safari.
- Desktop responsive.
- Contrastes.
- Espaciados.
- Estados hover/focus/disabled.
- Build.
- Lint.
- Performance básica.
- Que no se haya alterado lógica de negocio.

Entrega lista de issues antes de corregir.
```
