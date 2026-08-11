/**
 * tools/index.ts — El ejecutor.
 *
 * Un único punto por el que pasan todas las llamadas a herramientas, con tres
 * comprobaciones en el camino:
 *
 * 1. ¿Existe la herramienta y está activada? Si no, `unknown_tool`.
 * 2. ¿Validan los argumentos? Si no, `invalid_tool_input`.
 * 3. ¿Valida el resultado? Si no, `invalid_tool_output`.
 *
 * La tercera es la menos obvia y la más valiosa. Sin ella, todas las garantías
 * de este módulo —que `check_device_compatibility` nunca diga "incompatible",
 * que el catálogo degradado no cuele precios, que un plan no anuncie más gigas
 * de roaming que gigas totales— serían convenciones que alguien romperá al
 * refactorizar. Con ella, romperlas hace fallar la llamada.
 */

import { AssistantError } from "../errors";
import {
  isToolEnabled,
  toNeutralToolDef,
  type AnyAssistantTool,
  type NeutralToolDef,
  type ToolContext,
} from "./registry";
import { listPlansTool } from "./list-plans";
import { recommendPlanTool } from "./recommend-plan";
import { checkCoverageTool } from "./check-coverage";
import { checkDeviceCompatibilityTool } from "./check-device-compatibility";
import { getGuideTool } from "./get-guide";
import { escalateToHumanTool } from "./escalate";

export * from "./registry";

export const ALL_TOOLS: AnyAssistantTool[] = [
  listPlansTool,
  recommendPlanTool,
  checkCoverageTool,
  checkDeviceCompatibilityTool,
  getGuideTool,
  escalateToHumanTool,
];

/** Herramientas activas. Es lo único que se le anuncia al modelo. */
export function enabledTools(): AnyAssistantTool[] {
  return ALL_TOOLS.filter((t) => isToolEnabled(t.name));
}

/** Definiciones neutrales de las herramientas activas, para los adaptadores. */
export function neutralToolDefs(): NeutralToolDef[] {
  return enabledTools().map(toNeutralToolDef);
}

/**
 * Ejecuta una herramienta por nombre.
 *
 * `rawArgs` viene del modelo, así que es dato no confiable: puede tener campos
 * de más, tipos equivocados o nombres inventados.
 */
export async function executeTool(
  name: string,
  rawArgs: unknown,
  ctx: ToolContext
): Promise<unknown> {
  const tool = enabledTools().find((t) => t.name === name);
  if (!tool) {
    // Mismo error para "no existe" y "está apagada", a propósito: el modelo no
    // tiene por qué distinguirlos, y la diferencia solo importa en los logs.
    throw new AssistantError("unknown_tool", `herramienta "${name}" desconocida o desactivada`);
  }

  const parsedArgs = tool.args.safeParse(rawArgs ?? {});
  if (!parsedArgs.success) {
    const summary = parsedArgs.error.issues
      .map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join("; ");
    throw new AssistantError("invalid_tool_input", `${name} — ${summary}`);
  }

  const output = await tool.execute(parsedArgs.data, ctx);

  const parsedResult = tool.result.safeParse(output);
  if (!parsedResult.success) {
    const summary = parsedResult.error.issues
      .map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join("; ");
    throw new AssistantError("invalid_tool_output", `${name} — ${summary}`);
  }

  return parsedResult.data;
}
