/**
 * dto.ts — La forma en que un plan llega al modelo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ ESTE DTO NO ES `Plan`
 *
 * `Plan` (en `src/types/index.ts`) tiene `data_gb` y `eu_data_gb`. Esos nombres
 * son ambiguos leídos en frío: invitan a sumarlos. No se suman. `data_gb` es la
 * bolsa TOTAL y `eu_data_gb` es el máximo de ESA MISMA bolsa que puede gastarse
 * fuera de España.
 *
 * Un modelo de lenguaje que lea `data_gb: 270, eu_data_gb: 23` puede concluir
 * "293 GB". Sería una mentira comercial publicada por nosotros.
 *
 * La defensa no es una frase en el system prompt — las frases se olvidan bajo
 * presión conversacional. La defensa es la forma del dato:
 *
 *   · los campos se llaman `totalGb` y `outsideSpainMaxGb`;
 *   · van dentro de un objeto con discriminador `kind` explícito;
 *   · un `refine` de Zod rechaza `outsideSpainMaxGb > totalGb`.
 *
 * La contradicción es irrepresentable. Si alguien cambia el mapper y rompe la
 * invariante, el catálogo falla en validación en vez de llegar al modelo.
 *
 * Tampoco viaja aquí NADA de provisión: ni código de tarifa, ni tallas de
 * operador, ni el `id` interno con forma `local-*` como si fuera nombre. La
 * identidad pública del producto es `name` y nada más.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import type { Plan } from "@/types";
import { toPlanKey } from "@/lib/plan-key";

// ── Esquema ───────────────────────────────────────────────────────────────────

const dataAllowanceSchema = z.discriminatedUnion("kind", [
  /**
   * Línea española con número: una bolsa total, de la cual una parte puede
   * gastarse en roaming fuera de España.
   */
  z.strictObject({
    kind: z.literal("spain_line_with_roaming_cap"),
    totalGb: z.number().positive(),
    /** Máximo de `totalGb` gastable fuera de España. `null` = no informado. */
    outsideSpainMaxGb: z.number().positive().nullable(),
  }),
  /** Solo datos, sin número ni llamadas. */
  z.strictObject({
    kind: z.literal("data_only"),
    totalGb: z.number().positive(),
    outsideSpainMaxGb: z.number().positive().nullable(),
  }),
]);

export const assistantPlanSchema = z
  .strictObject({
    planId: z.string().min(1),
    /**
     * Clave comercial estable (`europa-basico`).
     *
     * Es la que permite cruzar este plan con la fuente de cobertura sin que el
     * modelo tenga que adivinar por el nombre. `planId` no sirve para eso: es
     * el identificador de la fila, y cambia según de dónde salga el catálogo.
     */
    key: z.string().min(1),
    /** Nombre comercial Ruta34. Única identidad pública del producto. */
    name: z.string().min(1),
    data: dataAllowanceSchema,
    validityDays: z.number().int().positive(),
    activationWindowDays: z.number().int().positive(),
    priceUsd: z.number().nonnegative(),
    includesSpanishNumber: z.boolean(),
    includesUnlimitedCallsSmsInSpain: z.boolean(),
  })
  .refine((p) => p.data.outsideSpainMaxGb === null || p.data.outsideSpainMaxGb <= p.data.totalGb, {
    message:
      "outsideSpainMaxGb no puede superar totalGb: es un subconjunto de la misma bolsa, no una bolsa aparte",
    path: ["data", "outsideSpainMaxGb"],
  });

export type AssistantPlanDto = z.infer<typeof assistantPlanSchema>;

// ── Mapper ────────────────────────────────────────────────────────────────────

/**
 * `Plan` → DTO del asistente.
 *
 * Traduce los nombres ambiguos a nombres que no admiten lectura aditiva, y
 * descarta todo campo que el modelo no necesita (slug, badge, position,
 * is_popular, features, countries_count).
 *
 * `countries_count` queda fuera deliberadamente: hoy no hay una lista
 * contractual canónica de países, así que ese número no puede sostener ninguna
 * afirmación de cobertura. La cobertura la resuelve `check_coverage`.
 */
export function toAssistantPlanDto(plan: Plan): AssistantPlanDto {
  const isLocal = plan.type === "local";

  const dto: AssistantPlanDto = {
    planId: plan.id,
    key: toPlanKey(plan.name),
    name: plan.name,
    data: {
      kind: isLocal ? "spain_line_with_roaming_cap" : "data_only",
      totalGb: plan.data_gb,
      outsideSpainMaxGb: plan.eu_data_gb ?? null,
    },
    validityDays: plan.duration_days,
    activationWindowDays: plan.activation_days,
    priceUsd: plan.price_usd,
    includesSpanishNumber: isLocal,
    includesUnlimitedCallsSmsInSpain: isLocal,
  };

  // Validar aquí y no solo en el borde: si el mapper produce una contradicción,
  // queremos el fallo en el punto donde se creó, no tres capas más arriba.
  return assistantPlanSchema.parse(dto);
}
