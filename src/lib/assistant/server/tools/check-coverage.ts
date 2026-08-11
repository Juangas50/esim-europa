/**
 * tools/check-coverage.ts — Cobertura por destino.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DE DÓNDE SALE LA RESPUESTA
 *
 * De `src/lib/coverage.ts`, la misma fuente que consumen el buscador de países
 * de la portada y el modal de cobertura. Una sola lista, tres superficies.
 *
 * Antes esta herramienta solo sabía confirmar España, porque las tres listas
 * que existían en la web se contradecían entre sí y ninguna tenía autoridad
 * para respaldar un «sí, te sirve». Resuelta la decisión comercial y unificadas
 * las listas, la herramienta ya puede responder — y responde exactamente lo
 * mismo que la web, por construcción y no por coincidencia.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LO QUE ESTA HERRAMIENTA NO SABE
 *
 * **Gigas.** Ni uno. La cobertura dice DÓNDE funciona cada producto; cuántos
 * datos puede gastar el cliente fuera de España es un dato del catálogo vivo
 * que cambia cuando cambia una tarifa.
 *
 * Si alguien pregunta «¿cuántos GB tengo en Francia con el Europa Plus?», la
 * respuesta se compone: esta herramienta confirma que Francia está cubierta,
 * `list_plans` aporta el `outsideSpainMaxGb` vigente. Guardar aquí esa cifra
 * crearía una segunda verdad que envejecería en silencio.
 *
 * **Precios y disponibilidad.** Un plan puede estar en esta tabla y no estar a
 * la venta hoy. Quién está a la venta lo dice `list_plans`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import {
  findCoverageCountry,
  plansCovering,
  plansExcluding,
  TOTAL_DESTINATIONS,
} from "@/lib/coverage";
import type { AssistantTool } from "./registry";

const args = z.strictObject({
  country: z
    .string()
    .min(2)
    .max(60)
    .describe("País por el que pregunta la persona, tal y como lo ha escrito."),
});

const result = z.discriminatedUnion("status", [
  z.strictObject({
    /** Reconocido y cubierto por todos los planes. */
    status: z.literal("covered_by_all_plans"),
    country: z.string(),
    countryCode: z.string(),
    includedInPlans: z.array(z.string()).min(1),
  }),
  z.strictObject({
    /** Reconocido, pero alguna gama no lo incluye. */
    status: z.literal("covered_with_exceptions"),
    country: z.string(),
    countryCode: z.string(),
    includedInPlans: z.array(z.string()).min(1),
    excludedFromPlans: z.array(z.string()).min(1),
    message: z.string(),
  }),
  z.strictObject({
    /**
     * No está en la lista de destinos. No es lo mismo que "no funciona": es que
     * no podemos afirmar que funcione, y eso es lo que hay que decir.
     */
    status: z.literal("not_in_coverage"),
    requested: z.string(),
    totalDestinations: z.number().int().positive(),
    message: z.string(),
  }),
]);

export const checkCoverageTool: AssistantTool<z.infer<typeof args>, z.infer<typeof result>> = {
  name: "check_coverage",
  description:
    "Comprueba si un destino está cubierto y por qué gamas. Llámala SIEMPRE que se pregunte por un país concreto, sin excepción. Devuelve nombres comerciales de plan, nunca gigas: si además preguntan cuántos datos pueden gastar allí, necesitas list_plans. Si el destino no está en la lista, dilo tal cual y ofrece contacto con el equipo — no significa que no funcione, significa que no podemos confirmarlo.",
  args,
  result,

  async execute(input) {
    const country = findCoverageCountry(input.country);

    if (!country) {
      return {
        status: "not_in_coverage",
        requested: input.country.slice(0, 60),
        totalDestinations: TOTAL_DESTINATIONS,
        message:
          "Ese destino no está en la lista de cobertura. No afirmes que no funciona: di que no puedes confirmarlo y ofrece ponerle en contacto con el equipo antes de comprar.",
      };
    }

    const included = plansCovering(country);
    const excluded = plansExcluding(country);

    if (excluded.length === 0) {
      return {
        status: "covered_by_all_plans",
        country: country.name,
        countryCode: country.code,
        includedInPlans: [...included],
      };
    }

    return {
      status: "covered_with_exceptions",
      country: country.name,
      countryCode: country.code,
      includedInPlans: [...included],
      excludedFromPlans: [...excluded],
      message:
        "Menciona explícitamente qué gama NO lo incluye antes de que la persona compre. Enterarse después es un reembolso.",
    };
  },
};
