/**
 * tools/registry.ts — Qué herramientas existen y cómo se describen.
 *
 * El registro es la frontera entre "lo que el asistente puede hacer" y "cómo se
 * lo contamos a un modelo concreto". Las definiciones que hay aquí son
 * neutrales: nombre, descripción y esquema JSON. Ningún formato de proveedor
 * asoma por este archivo, y esa es la razón de que exista — en la Fase 2B, cada
 * adaptador traduce esta forma a la suya sin que las herramientas se enteren.
 */

import { z } from "zod";
import type { PlansReader } from "../catalog";

// ── Contrato de una herramienta ───────────────────────────────────────────────

export interface ToolContext {
  locale: "es" | "pt";
  /** Lector de catálogo inyectable. En tests, un fake; en producción, el vivo. */
  readPlans?: PlansReader;
}

export interface AssistantTool<A = unknown, R = unknown> {
  name: string;
  /** Descripción que lee el modelo. Debe decir también cuándo NO usarla. */
  description: string;
  args: z.ZodType<A>;
  /**
   * Esquema del resultado. No es decorativo: el ejecutor valida la salida antes
   * de devolverla al modelo. Es lo que convierte reglas como "esta herramienta
   * nunca dice que un móvil sea incompatible" en algo estructural en vez de una
   * convención que alguien romperá dentro de seis meses.
   */
  result: z.ZodType<R>;
  execute: (args: A, ctx: ToolContext) => Promise<R>;
}

/**
 * Una herramienta cualquiera, para colecciones heterogéneas.
 *
 * `unknown` no vale: `AssistantTool<Args, Result>` no es asignable a
 * `AssistantTool<unknown, unknown>` porque `execute` es contravariante en sus
 * argumentos. El `any` está confinado a este alias, y la seguridad real la
 * aporta el ejecutor, que valida entrada y salida contra los esquemas de cada
 * herramienta antes de que nada cruce la frontera.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAssistantTool = AssistantTool<any, any>;

// ── Interruptores ─────────────────────────────────────────────────────────────

/**
 * Activación por herramienta.
 *
 * Existe para poder apagar una sin tocar el dispatcher ni el prompt. El caso
 * previsto es `check_coverage`: si al medir la Fase 2B resulta que ensucia más
 * de lo que aporta, se apaga aquí y el modelo deja de verla.
 *
 * Una herramienta apagada no se anuncia y no se puede ejecutar: si el modelo la
 * invoca de todas formas (por ejemplo arrastrándola de un turno anterior), el
 * ejecutor responde `unknown_tool`.
 */
export const TOOL_FLAGS: Record<string, boolean> = {
  list_plans: true,
  recommend_plan: true,
  check_coverage: true,
  check_device_compatibility: true,
  get_guide: true,
  escalate_to_human: true,
};

export function isToolEnabled(name: string): boolean {
  return TOOL_FLAGS[name] === true;
}

// ── Exportación neutral ───────────────────────────────────────────────────────

/** Definición de herramienta tal y como la consumirá cualquier adaptador. */
export interface NeutralToolDef {
  name: string;
  description: string;
  /** JSON Schema (draft 2020-12) de los argumentos, sin la clave `$schema`. */
  parameters: Record<string, unknown>;
}

export function toNeutralToolDef(tool: AnyAssistantTool): NeutralToolDef {
  const schema = z.toJSONSchema(tool.args) as Record<string, unknown>;
  // `$schema` sobra en la definición de una tool y algunos proveedores la
  // rechazan. Se quita aquí, una vez, en vez de en cada adaptador.
  delete schema.$schema;

  return { name: tool.name, description: tool.description, parameters: schema };
}
