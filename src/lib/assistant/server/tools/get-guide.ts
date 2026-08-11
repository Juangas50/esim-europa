/**
 * tools/get-guide.ts — Guías bajo demanda.
 *
 * Una sola herramienta con un enum cerrado en vez de una por guía. El enum es
 * lo que la hace segura: no hay ruta de código donde un `slug` inventado
 * devuelva contenido, porque Zod rechaza el argumento antes de llegar aquí.
 */

import { z } from "zod";
import { GUIDES, GUIDE_SLUGS } from "../corpus/guides";
import type { AssistantTool } from "./registry";

const args = z.strictObject({
  slug: z
    .enum(GUIDE_SLUGS)
    .describe(
      "Guía que hace falta: 'install-iphone' e 'install-android' para instalar, 'qr' para dudas sobre el código, 'troubleshooting' cuando la eSIM ya está instalada y no da conexión."
    ),
});

const result = z.strictObject({
  slug: z.enum(GUIDE_SLUGS),
  content: z.string(),
});

export const getGuideTool: AssistantTool<z.infer<typeof args>, z.infer<typeof result>> = {
  name: "get_guide",
  description:
    "Devuelve los pasos de una de las cuatro guías de ayuda. Úsala en vez de explicar la instalación de memoria: los menús cambian entre versiones y la guía es lo que está verificado.",
  args,
  result,

  async execute(input) {
    return { slug: input.slug, content: GUIDES[input.slug] };
  },
};
