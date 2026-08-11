/**
 * tools/list-plans.ts — El catálogo, o nada.
 */

import { z } from "zod";
import { getAssistantCatalog } from "../catalog";
import { assistantPlanSchema } from "../dto";
import type { AssistantTool } from "./registry";

const args = z.strictObject({});

const result = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("live"),
    plans: z.array(assistantPlanSchema),
  }),
  z.strictObject({
    status: z.literal("unavailable"),
    /** Texto apto para el modelo. El motivo técnico se queda en los logs. */
    message: z.string(),
  }),
]);

export const listPlansTool: AssistantTool<z.infer<typeof args>, z.infer<typeof result>> = {
  name: "list_plans",
  description:
    "Devuelve el catálogo vigente de planes con su precio, gigas totales, tope de gigas fuera de España, validez y ventana de activación. Es la ÚNICA fuente válida para cualquier precio o cantidad de gigas. Si devuelve status 'unavailable', no puedes dar ningún precio ni ninguna cifra de datos por ningún otro medio.",
  args,
  result,

  async execute(_args, ctx) {
    const catalog = await getAssistantCatalog(ctx.readPlans);

    if (catalog.status === "unavailable") {
      // El `reason` lleva mensajes de la base de datos. No sale de aquí.
      return {
        status: "unavailable",
        message:
          "El catálogo no está disponible en este momento. No hay precios ni gigas que puedas dar; invita a consultar la web o al equipo.",
      };
    }

    return { status: "live", plans: catalog.plans };
  },
};
