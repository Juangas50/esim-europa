/**
 * _fixtures.ts — Datos de prueba.
 *
 * Los planes reproducen la forma del catálogo de producción (cinco gamas, misma
 * validez, cadena creciente en precio y en gigas) sin ser una copia de sus
 * cifras: los tests afirman sobre el comportamiento del algoritmo, no sobre
 * cuánto vale hoy el Europa Plus. Si mañana cambian los precios, estos tests
 * tienen que seguir pasando.
 */

import type { Plan } from "@/types";
import type { PlansReader, PlansSnapshot } from "@/lib/assistant/server/catalog";

export function plan(overrides: Partial<Plan> & Pick<Plan, "id" | "name">): Plan {
  return {
    slug: overrides.id,
    type: "local",
    data_gb: 100,
    eu_data_gb: 10,
    duration_days: 28,
    activation_days: 365,
    price_usd: 10,
    zone: "europa",
    features: [],
    ...overrides,
  } as Plan;
}

/** Cadena de cinco gamas, ordenada y coherente. */
export const CHAIN: Plan[] = [
  plan({ id: "p1", name: "Gama 1", price_usd: 15, data_gb: 90, eu_data_gb: 15 }),
  plan({ id: "p2", name: "Gama 2", price_usd: 20, data_gb: 270, eu_data_gb: 23 }),
  plan({ id: "p3", name: "Gama 3", price_usd: 30, data_gb: 330, eu_data_gb: 30 }),
  plan({ id: "p4", name: "Gama 4", price_usd: 40, data_gb: 380, eu_data_gb: 45 }),
  plan({ id: "p5", name: "Gama 5", price_usd: 50, data_gb: 430, eu_data_gb: 60 }),
];

/**
 * Catálogo grande, para empujar el presupuesto de contexto.
 *
 * Los precios y los gigas crecen a la vez, así que sigue siendo una cadena
 * monótona: lo que se quiere medir es el tamaño del resultado, no romper
 * `recommend_plan` por el camino.
 */
export function manyPlans(n: number): Plan[] {
  return Array.from({ length: n }, (_, i) =>
    plan({
      id: `bulk-${i}`,
      name: `Gama de prueba número ${i}`,
      price_usd: 10 + i,
      data_gb: 50 + i,
      eu_data_gb: 5 + i,
    })
  );
}

/** El catálogo vivo respondió. */
export function liveReader(plans: Plan[] = CHAIN): PlansReader {
  return async (): Promise<PlansSnapshot> => ({ plans, source: "supabase" });
}

/** Supabase falló y `plans-server` sirvió el fallback local. */
export function fallbackReader(plans: Plan[] = CHAIN): PlansReader {
  return async (): Promise<PlansSnapshot> => ({ plans, source: "fallback" });
}

/** La lectura reventó. */
export function throwingReader(): PlansReader {
  return async () => {
    throw new Error("conexión rechazada");
  };
}

/** Respondió, pero sin tarifas activas. */
export function emptyReader(): PlansReader {
  return async (): Promise<PlansSnapshot> => ({ plans: [], source: "supabase" });
}
