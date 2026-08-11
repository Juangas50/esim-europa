/**
 * tools/recommend-plan.ts — Recomendación determinista.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EL ALGORITMO, ENTERO
 *
 *   El plan más barato que satisface las restricciones numéricas que el usuario
 *   ha dicho en voz alta.
 *
 * Eso es todo. No hay pesos, no hay puntuaciones, no hay "el Plus suele ser el
 * que mejor va". Funciona porque los planes forman una cadena totalmente
 * ordenada: al ordenarlos por precio, los gigas totales y el tope fuera de
 * España crecen a la vez. En una cadena así, "el más barato que cumple" es una
 * respuesta única y demostrable, no una opinión.
 *
 * Esa propiedad es del catálogo de hoy, no una ley. Por eso se **verifica en
 * cada llamada**: si alguien da de alta mañana una tarifa que la rompe, la
 * herramienta se declara incompetente (`no_deterministic_recommendation`) y el
 * modelo pasa a comparar con `list_plans`. Prefiero que se calle a que empiece
 * a inventar un criterio de desempate.
 *
 * Y si no hay ninguna restricción explícita, no recomienda: pide los datos que
 * le faltan. Recomendar sin criterio es adivinar con aire de autoridad.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import { getAssistantCatalog } from "../catalog";
import { assistantPlanSchema, type AssistantPlanDto } from "../dto";
import type { AssistantTool } from "./registry";

// ── Entrada ───────────────────────────────────────────────────────────────────

const args = z.strictObject({
  estimatedTotalGb: z
    .number()
    .positive()
    .max(2000)
    .optional()
    .describe("Gigas totales que la persona estima consumir durante todo el viaje."),
  estimatedGbOutsideSpain: z
    .number()
    .positive()
    .max(2000)
    .optional()
    .describe("De esos gigas, cuántos calcula gastar fuera de España."),
  tripDays: z
    .number()
    .int()
    .positive()
    .max(365)
    .optional()
    .describe("Duración del viaje en días."),
  budgetMaxUsd: z
    .number()
    .positive()
    .max(10000)
    .optional()
    .describe("Tope de gasto en dólares, si la persona lo ha mencionado."),
});

type Args = z.infer<typeof args>;

// ── Salida ────────────────────────────────────────────────────────────────────

const reasonSchema = z.strictObject({
  code: z.enum([
    "cheapest_meeting_constraints",
    "meets_total_gb",
    "meets_outside_spain_gb",
    "within_budget",
    "only_plan_available",
  ]),
  required: z.number().nullable(),
  planValue: z.number().nullable(),
});

const warningSchema = z.strictObject({
  code: z.enum(["trip_exceeds_validity", "budget_exceeded", "requested_gb_above_catalog_max"]),
  required: z.number().nullable(),
  planValue: z.number().nullable(),
});

const result = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("recommended"),
    plan: assistantPlanSchema,
    reasons: z.array(reasonSchema),
    warnings: z.array(warningSchema),
  }),
  z.strictObject({
    /** Lo pedido supera el plan más grande. Se ofrece el techo, avisando. */
    status: z.literal("exceeds_catalog"),
    plan: assistantPlanSchema,
    reasons: z.array(reasonSchema),
    warnings: z.array(warningSchema),
  }),
  z.strictObject({
    status: z.literal("insufficient_criteria"),
    missing: z.array(z.enum(["estimatedTotalGb", "estimatedGbOutsideSpain", "tripDays"])),
    message: z.string(),
  }),
  z.strictObject({
    status: z.literal("no_deterministic_recommendation"),
    message: z.string(),
  }),
  z.strictObject({
    status: z.literal("unavailable"),
    message: z.string(),
  }),
]);

type Result = z.infer<typeof result>;

// ── Cadena ordenada ───────────────────────────────────────────────────────────

/**
 * Ordena por precio.
 *
 * Los desempates por gigas y por `planId` están para que el recorrido sea
 * estable ante el mismo catálogo, **no** para elegir: un empate de precio entre
 * candidatos se rechaza antes de llegar a seleccionar nada (ver `hasPriceTie`).
 */
function sortChain(plans: AssistantPlanDto[]): AssistantPlanDto[] {
  return [...plans].sort(
    (a, b) =>
      a.priceUsd - b.priceUsd ||
      a.data.totalGb - b.data.totalGb ||
      a.planId.localeCompare(b.planId)
  );
}

/**
 * ¿Hay empate de precio en cabeza?
 *
 * `candidates` viene ordenado, así que basta con mirar los dos primeros. Si el
 * segundo cuesta lo mismo que el primero, «el más barato» deja de designar a un
 * único plan y la herramienta ya no puede responder sin inventarse un criterio
 * de desempate.
 *
 * Deliberadamente NO se desempata por «más gigas por el mismo precio». Suena
 * razonable y probablemente acierte casi siempre, pero es exactamente el tipo de
 * preferencia implícita que esta herramienta existe para no tener: mañana
 * alguien discutiría si un plan con más días y menos gigas gana o pierde, y la
 * discusión no la resuelve el código.
 */
function hasPriceTie(candidates: AssistantPlanDto[]): boolean {
  return candidates.length >= 2 && candidates[0].priceUsd === candidates[1].priceUsd;
}

/**
 * ¿Sigue siendo una cadena?
 *
 * Dos condiciones. Una: todos los planes tienen que ser del mismo tipo. Elegir
 * entre una línea con número y una de solo datos no es una optimización, es una
 * preferencia, y no le corresponde a esta herramienta. Dos: al subir el precio
 * no puede bajar ninguna de las dos magnitudes de datos.
 */
function isMonotonicChain(sorted: AssistantPlanDto[]): boolean {
  if (sorted.length === 0) return false;

  const kinds = new Set(sorted.map((p) => p.data.kind));
  if (kinds.size > 1) return false;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.data.totalGb < prev.data.totalGb) return false;

    const a = prev.data.outsideSpainMaxGb;
    const b = curr.data.outsideSpainMaxGb;
    // O ninguno lo informa, o lo informan los dos y no decrece.
    if ((a === null) !== (b === null)) return false;
    if (a !== null && b !== null && b < a) return false;
  }

  return true;
}

// ── Herramienta ───────────────────────────────────────────────────────────────

export const recommendPlanTool: AssistantTool<Args, Result> = {
  name: "recommend_plan",
  description:
    "Recomienda el plan más barato que cubre unas necesidades CONCRETAS de viaje. Solo llámala cuando la persona te haya dado al menos una cifra: gigas estimados, gigas fuera de España o días de viaje. Si no te ha dado ninguna, pregunta tú antes en vez de llamarla. No sirve para comparar planes en general: para eso usa list_plans.",
  args,
  result,

  async execute(input, ctx) {
    const hasConstraint =
      input.estimatedTotalGb !== undefined ||
      input.estimatedGbOutsideSpain !== undefined ||
      input.tripDays !== undefined;

    if (!hasConstraint) {
      return {
        status: "insufficient_criteria",
        missing: ["estimatedTotalGb", "estimatedGbOutsideSpain", "tripDays"],
        message:
          "No hay ninguna cifra sobre la que decidir. Pregunta cuántos días dura el viaje y qué uso de datos calcula hacer antes de volver a llamarme.",
      };
    }

    const catalog = await getAssistantCatalog(ctx.readPlans);
    if (catalog.status === "unavailable") {
      return {
        status: "unavailable",
        message:
          "El catálogo no está disponible en este momento. No puedes recomendar ningún plan ni dar precios.",
      };
    }

    const sorted = sortChain(catalog.plans);

    if (!isMonotonicChain(sorted)) {
      return {
        status: "no_deterministic_recommendation",
        message:
          "El catálogo actual no permite una recomendación objetiva. Usa list_plans y ayuda a comparar sin decidir por la persona.",
      };
    }

    const warnings: z.infer<typeof warningSchema>[] = [];

    // Restricciones duras: gigas totales y gigas fuera de España.
    const surviving = sorted.filter((plan) => {
      if (input.estimatedTotalGb !== undefined && plan.data.totalGb < input.estimatedTotalGb) {
        return false;
      }
      if (input.estimatedGbOutsideSpain !== undefined) {
        const cap = plan.data.outsideSpainMaxGb;
        if (cap === null || cap < input.estimatedGbOutsideSpain) return false;
      }
      return true;
    });

    // Empate de precio entre candidatos: no hay «el más barato», hay dos.
    // Se comprueba sobre los que sobreviven al filtro, no sobre el catálogo
    // entero: un empate entre planes que no cumplen las restricciones no afecta
    // a la decisión y no tiene por qué bloquearla.
    if (hasPriceTie(surviving)) {
      return {
        status: "no_deterministic_recommendation",
        message:
          "Hay más de un plan al mismo precio que cubre lo que necesita. Usa list_plans, enséñale las diferencias y deja que elija.",
      };
    }

    const exceeded = surviving.length === 0;

    // El techo del catálogo se ofrece como referencia cuando nada cumple, así
    // que tiene el mismo problema: si dos planes empatan en el precio más alto,
    // «el techo» tampoco designa a uno solo.
    const ceiling = [...sorted].reverse();
    if (exceeded && hasPriceTie(ceiling)) {
      return {
        status: "no_deterministic_recommendation",
        message:
          "Lo que necesita supera el catálogo y hay varios planes empatados en el precio más alto. Usa list_plans para enseñárselos.",
      };
    }

    const top = ceiling[0];
    const chosen = exceeded ? top : surviving[0];

    const reasons: z.infer<typeof reasonSchema>[] = [];

    if (!exceeded) {
      reasons.push({ code: "cheapest_meeting_constraints", required: null, planValue: chosen.priceUsd });
      if (sorted.length === 1) {
        reasons.push({ code: "only_plan_available", required: null, planValue: null });
      }
      if (input.estimatedTotalGb !== undefined) {
        reasons.push({
          code: "meets_total_gb",
          required: input.estimatedTotalGb,
          planValue: chosen.data.totalGb,
        });
      }
      if (input.estimatedGbOutsideSpain !== undefined) {
        reasons.push({
          code: "meets_outside_spain_gb",
          required: input.estimatedGbOutsideSpain,
          planValue: chosen.data.outsideSpainMaxGb,
        });
      }
    } else {
      // Nada cumple. Se ofrece el techo del catálogo y se dice por qué se queda
      // corto, con el número exacto. Callarlo sería vender de más.
      const requestedTotal = input.estimatedTotalGb ?? null;
      const requestedOutside = input.estimatedGbOutsideSpain ?? null;
      const overTotal = requestedTotal !== null && requestedTotal > top.data.totalGb;

      warnings.push({
        code: "requested_gb_above_catalog_max",
        required: overTotal ? requestedTotal : requestedOutside,
        planValue: overTotal ? top.data.totalGb : top.data.outsideSpainMaxGb,
      });
    }

    // El viaje más largo que la validez no descarta el plan, pero tiene que
    // decirse: es la sorpresa más cara que se puede llevar un cliente.
    if (input.tripDays !== undefined && input.tripDays > chosen.validityDays) {
      warnings.push({
        code: "trip_exceeds_validity",
        required: input.tripDays,
        planValue: chosen.validityDays,
      });
    }

    // El presupuesto NUNCA degrada la recomendación por debajo de lo que la
    // persona dijo necesitar. Se le da el plan correcto y se le dice que se
    // pasa de lo que había previsto; decidir es suyo.
    if (input.budgetMaxUsd !== undefined) {
      if (chosen.priceUsd <= input.budgetMaxUsd) {
        reasons.push({ code: "within_budget", required: input.budgetMaxUsd, planValue: chosen.priceUsd });
      } else {
        warnings.push({ code: "budget_exceeded", required: input.budgetMaxUsd, planValue: chosen.priceUsd });
      }
    }

    return exceeded
      ? { status: "exceeds_catalog", plan: chosen, reasons, warnings }
      : { status: "recommended", plan: chosen, reasons, warnings };
  },
};
