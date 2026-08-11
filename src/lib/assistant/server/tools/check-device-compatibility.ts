/**
 * tools/check-device-compatibility.ts — ¿Le sirve su móvil?
 *
 * Envoltorio fino sobre `devices.ts`. Toda la lógica de coincidencia vive allí;
 * aquí solo están el contrato con el modelo y la garantía estructural que más
 * importa: **el esquema de salida no tiene un valor `not_supported`**.
 *
 * No es un descuido ni una simplificación. Nuestra lista es de modelos
 * verificados, no un censo del mercado. Que un móvil no aparezca significa que
 * no lo hemos comprobado, no que no funcione. Sin ese valor en el enum, ninguna
 * versión futura de este archivo — ni ningún modelo creativo — puede emitir un
 * "no sirve" que no podemos sostener.
 */

import { z } from "zod";
import { lookupDevice } from "../devices";
import type { AssistantTool } from "./registry";

const args = z.strictObject({
  device: z
    .string()
    .min(2)
    .max(80)
    .describe("Marca y modelo tal y como los ha escrito la persona, por ejemplo 'iphone 15' o 'galaxy s23 ultra'."),
});

const result = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("supported"),
    matchType: z.enum(["exact", "family"]),
    brand: z.string(),
    matchedModels: z.array(z.string()).min(1).max(3),
    notes: z.array(z.string()),
  }),
  z.strictObject({
    /**
     * No hay tercera opción. `unknown` significa "no lo tenemos verificado", y
     * así hay que contarlo: nunca como incompatibilidad.
     */
    status: z.literal("unknown"),
    brandRecognized: z.string().nullable(),
    howToVerify: z.strictObject({ method: z.string(), indicator: z.string() }),
    notes: z.array(z.string()),
  }),
]);

export const checkDeviceCompatibilityTool: AssistantTool<
  z.infer<typeof args>,
  z.infer<typeof result>
> = {
  name: "check_device_compatibility",
  description:
    "Comprueba si un móvil concreto está en la lista de dispositivos verificados con eSIM. Devuelve 'supported' o 'unknown'. NUNCA devuelve que un móvil sea incompatible, y tú tampoco puedes decirlo: si el resultado es 'unknown', explica el método de comprobación que te devuelve (marcar *#06# y buscar el código EID) en vez de dar por hecho que no funciona. Recuerda además que el móvil tiene que estar libre de operador.",
  args,
  result,

  async execute(input) {
    return lookupDevice(input.device);
  },
};
