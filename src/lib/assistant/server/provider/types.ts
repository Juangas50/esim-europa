/**
 * provider/types.ts — La frontera con el modelo.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ ESTA ABSTRACCIÓN EXISTE ANTES QUE NINGÚN PROVEEDOR
 *
 * El proveedor no está decidido, y se decidirá midiendo. Para que esa medición
 * sea justa, los dos candidatos tienen que ejecutar exactamente el mismo
 * dispatcher, las mismas herramientas y el mismo prompt: si cada uno arrastra
 * su propio bucle, lo que se compara son dos integraciones, no dos modelos.
 *
 * De ahí la forma de estos tipos. Son un mínimo común honesto:
 *
 * · Bloques de contenido con `text`, `tool_use` y `tool_result`, que es el
 *   vocabulario que ambas familias de API saben expresar.
 * · `stopReason` normalizado, porque cada proveedor lo llama distinto.
 * · `usage` con entrada, salida y entrada cacheada por separado — sin ese
 *   desglose no se puede comparar coste, que es una de las cinco dimensiones
 *   de la decisión.
 *
 * Lo que NO hay aquí es igual de deliberado: ni `system` dentro de `messages`,
 * ni nombres de campo de ningún SDK, ni tipos importados de ninguna librería.
 * Cada adaptador de la Fase 2B traduce en su borde y se traga las diferencias.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { NeutralToolDef } from "../tools/registry";

export type LlmContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; toolUseId: string; content: string; isError: boolean };

export interface LlmMessage {
  role: "user" | "assistant";
  content: LlmContentBlock[];
}

export type LlmStopReason =
  /** El modelo terminó de hablar. */
  | "end_turn"
  /** Pide ejecutar herramientas antes de seguir. */
  | "tool_use"
  /** Se topó con el techo de tokens de salida. */
  | "max_tokens"
  /** Se negó a responder. */
  | "refusal";

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
  /** Parte de la entrada servida desde caché, si el proveedor lo informa. */
  cachedInputTokens: number | null;
}

export interface LlmRequest {
  system: string;
  messages: LlmMessage[];
  tools: NeutralToolDef[];
  maxOutputTokens: number;
  /** Cancelación por timeout. El proveedor debe respetarla. */
  signal?: AbortSignal;
}

export interface LlmResponse {
  content: LlmContentBlock[];
  stopReason: LlmStopReason;
  usage: LlmUsage;
}

export interface LlmProvider {
  /** Identificador del adaptador, para logs y para el informe de la Fase 2B. */
  readonly id: string;
  /**
   * Modelo concreto que atiende las peticiones, cuando aplica.
   *
   * Identificador público del modelo, nunca una clave ni un endpoint. En 2A no
   * lo informa nadie; en 2B lo informarán los dos adaptadores para poder
   * atribuir coste y calidad turno a turno.
   */
  readonly model?: string;
  complete(req: LlmRequest): Promise<LlmResponse>;
}

// ── Ayudas ────────────────────────────────────────────────────────────────────

export function textOf(content: LlmContentBlock[]): string {
  return content
    .filter((b): b is Extract<LlmContentBlock, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export function toolUsesOf(content: LlmContentBlock[]) {
  return content.filter(
    (b): b is Extract<LlmContentBlock, { type: "tool_use" }> => b.type === "tool_use"
  );
}
