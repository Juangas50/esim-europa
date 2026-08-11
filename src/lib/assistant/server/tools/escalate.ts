/**
 * tools/escalate.ts — Derivación a una persona.
 *
 * La derivación no es el fracaso del asistente: en un producto donde media
 * docena de preguntas frecuentes no se pueden responder con certeza, es una de
 * sus funciones principales.
 *
 * Lo único delicado aquí es el resumen que se arrastra a WhatsApp. Lo escribe
 * el modelo, y el modelo ha estado leyendo mensajes de un cliente que puede
 * haber pegado un ICCID o un número de tarjeta. Por eso el resumen vuelve a
 * pasar por el sanitizador antes de salir: la primera pasada limpia lo que
 * entra al contexto, esta limpia lo que sale de él.
 */

import { z } from "zod";
import { sanitizeForModel } from "../sanitize";
import type { AssistantTool } from "./registry";

const args = z.strictObject({
  reason: z
    .enum([
      "order_issue",
      "coverage_not_verifiable",
      "needs_personal_data",
      "unresolved",
      "user_request",
    ])
    .describe("Por qué se deriva."),
  summary: z
    .string()
    .min(5)
    .max(300)
    .describe(
      "Una o dos frases con lo que necesita la persona, para que el equipo no le haga repetirlo. Sin datos personales."
    ),
});

const result = z.strictObject({
  status: z.literal("ready"),
  channel: z.literal("whatsapp"),
  reason: z.string(),
  /** Resumen ya saneado, listo para precargarse en el mensaje. */
  handoffSummary: z.string(),
  /** Si el saneado tuvo que redactar algo, el modelo debe saberlo. */
  redacted: z.boolean(),
});

export const escalateToHumanTool: AssistantTool<z.infer<typeof args>, z.infer<typeof result>> = {
  name: "escalate_to_human",
  description:
    "Prepara el traspaso a una persona del equipo por WhatsApp. Úsala cuando haya un problema con un pedido concreto, cuando la cobertura de un destino no se pueda verificar, cuando haga falta un dato personal, cuando la persona lo pida o cuando lleves dos intentos sin resolver. No escribas datos personales en el resumen.",
  args,
  result,

  async execute(input) {
    const sanitized = sanitizeForModel(input.summary);

    return {
      status: "ready",
      channel: "whatsapp",
      reason: input.reason,
      handoffSummary: sanitized.text,
      redacted: Object.keys(sanitized.redactions).length > 0,
    };
  },
};
