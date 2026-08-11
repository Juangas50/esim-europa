/**
 * catalog.ts — Acceso fail closed al catálogo para el asistente.
 *
 * REGLA: si `getPlansWithSource()` no devuelve `source: "supabase"`, el
 * asistente NO entrega precios ni GB como datos actuales. Ni del fallback, ni
 * aproximados, ni "según nuestra información habitual".
 *
 * El fallback de `plans.ts` existe para que la tienda no se quede en blanco
 * durante una caída: el usuario ve una página y hay un aviso de contexto. Una
 * conversación no tiene ese contexto. Si el asistente dice "el Europa Plus son
 * 20 dólares", eso es una afirmación de precio en primera persona, y si el
 * catálogo vivo dice otra cosa acabamos de prometer un precio que no vamos a
 * respetar. Callar es peor experiencia y mejor negocio.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ EL LECTOR SE INYECTA
 *
 * `plans-server.ts` importa `@/lib/supabase/server`, que importa `next/headers`.
 * Un import estático desde aquí ataría este módulo — y por tanto los tests — al
 * runtime de Next y a un cliente de Supabase real.
 *
 * El lector por defecto se carga con un `import()` perezoso dentro de la
 * función, y los tests pasan su propio lector. Es lo que hace que la suite de la
 * Fase 2A no abra un socket: no hay ruta de código que llegue a la red.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Plan } from "@/types";
import { toAssistantPlanDto, type AssistantPlanDto } from "./dto";

/** Lo que devuelve `getPlansWithSource()`, sin importar el módulo. */
export interface PlansSnapshot {
  plans: Plan[];
  source: "supabase" | "fallback";
}

export type PlansReader = (opts?: { webOnly?: boolean }) => Promise<PlansSnapshot>;

export type CatalogResult =
  | { status: "live"; plans: AssistantPlanDto[] }
  /**
   * No hay catálogo utilizable. `reason` es para los logs; jamás se le pasa al
   * modelo, porque puede contener mensajes de error de la base de datos.
   */
  | { status: "unavailable"; reason: string };

/** Lector real. Se resuelve tarde para no arrastrar Next ni Supabase al import. */
const liveReader: PlansReader = async (opts) => {
  const { getPlansWithSource } = await import("@/lib/plans-server");
  return getPlansWithSource(opts);
};

/**
 * Catálogo listo para el asistente, o nada.
 *
 * `webOnly: true` siempre: el asistente es una superficie de venta B2C y no
 * debe conocer tarifas ocultas en la web.
 */
export async function getAssistantCatalog(readPlans: PlansReader = liveReader): Promise<CatalogResult> {
  let snapshot: PlansSnapshot;

  try {
    snapshot = await readPlans({ webOnly: true });
  } catch (err) {
    return { status: "unavailable", reason: `excepción leyendo el catálogo: ${String(err)}` };
  }

  if (snapshot.source !== "supabase") {
    return {
      status: "unavailable",
      reason: `source="${snapshot.source}" — fail closed, no se entregan precios ni GB`,
    };
  }

  if (!snapshot.plans || snapshot.plans.length === 0) {
    return { status: "unavailable", reason: "el catálogo vivo no devolvió ningún plan" };
  }

  try {
    return { status: "live", plans: snapshot.plans.map(toAssistantPlanDto) };
  } catch (err) {
    // Un plan que no valida (p. ej. GB de roaming por encima del total) invalida
    // la respuesta entera. No se sirve el subconjunto "bueno": si una fila está
    // mal, no sabemos qué más está mal.
    return { status: "unavailable", reason: `un plan no pasó validación de DTO: ${String(err)}` };
  }
}
