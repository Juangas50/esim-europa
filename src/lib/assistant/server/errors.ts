/**
 * errors.ts — Motivos por los que un turno del asistente termina mal.
 *
 * Todo fallo del asistente es un valor tipado, no una excepción suelta ni un
 * string libre. Así el dispatcher puede decidir qué se le cuenta al usuario y
 * qué se queda en los logs, y los tests pueden afirmar sobre el motivo exacto.
 */

export type AssistantErrorCode =
  /** El body no cumple el esquema o excede un límite estructural. */
  | "invalid_request"
  /** Se superó un límite de la conversación (mensajes, sesión, contexto). */
  | "limit_exceeded"
  /** El turno tardó más de `TURN_TIMEOUT_MS`. */
  | "timeout"
  /** El modelo pidió más tool calls de las permitidas en un turno. */
  | "too_many_tool_calls"
  /** Se agotaron las iteraciones del bucle sin respuesta final. */
  | "max_iterations"
  /** El modelo invocó una tool inexistente o desactivada. */
  | "unknown_tool"
  /** Los argumentos de la tool no validan contra su esquema. */
  | "invalid_tool_input"
  /** El resultado de una tool no valida contra su esquema de salida. */
  | "invalid_tool_output"
  /** Fallo del proveedor de modelo. */
  | "provider_error";

export class AssistantError extends Error {
  constructor(
    readonly code: AssistantErrorCode,
    /**
     * Detalle técnico. Va a los logs del servidor, **nunca** al usuario ni al
     * contexto del modelo: puede contener nombres de tools, esquemas o trazas.
     */
    readonly detail: string
  ) {
    super(`${code}: ${detail}`);
    this.name = "AssistantError";
  }
}

/**
 * Clave de traducción del mensaje que sí ve el usuario.
 *
 * Es una clave y no un texto porque el copy vive en `messages/*.json`, igual
 * que en la Fase 1. Varios códigos comparten mensaje a propósito: al usuario no
 * le sirve saber si nos quedamos sin iteraciones o sin tiempo.
 */
export function userFacingKey(code: AssistantErrorCode): string {
  switch (code) {
    case "invalid_request":
    case "limit_exceeded":
      return "assistant.errors.limit";
    case "timeout":
    case "max_iterations":
      return "assistant.errors.slow";
    default:
      return "assistant.errors.generic";
  }
}
