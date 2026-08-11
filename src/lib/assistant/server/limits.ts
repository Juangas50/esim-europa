/**
 * limits.ts — Límites duros del asistente.
 *
 * Punto único de verdad para todo lo que acota una conversación. Están aquí
 * como constantes y no como variables de entorno a propósito: en Fase 2A no
 * existe configuración externa, y un límite que se puede aflojar desde el panel
 * de Vercel deja de ser un límite.
 *
 * Los valores son los aprobados como punto de partida. Los diarios por IP no
 * viven aquí: son provisionales hasta medir comportamiento real (NAT, redes
 * móviles, hoteles, aeropuertos) y se definirán en la Fase 2D junto al
 * contador distribuido.
 */

export const LIMITS = {
  /** Caracteres máximos de un mensaje de usuario. */
  MAX_MESSAGE_CHARS: 1_000,
  /** Mensajes máximos aceptados en el historial de una request. */
  MAX_MESSAGES_PER_REQUEST: 24,
  /** Tamaño máximo del body en bytes. */
  MAX_BODY_BYTES: 32 * 1024,
  /** Presupuesto de contexto aproximado (prefijo + historial + tools). */
  MAX_CONTEXT_TOKENS: 15_000,
  /** Tokens máximos de salida por llamada al modelo. */
  MAX_OUTPUT_TOKENS: 600,
  /** Tool calls máximas que se ejecutan en una misma respuesta del modelo. */
  MAX_TOOL_CALLS_PER_TURN: 3,
  /** Vueltas máximas del bucle modelo → tools → modelo. */
  MAX_ITERATIONS: 4,
  /** Tiempo máximo de un turno completo, en milisegundos. */
  TURN_TIMEOUT_MS: 25_000,
  /** Mensajes máximos en una sesión. */
  MAX_MESSAGES_PER_SESSION: 30,
  /** Vida máxima de una sesión, en milisegundos. */
  SESSION_TTL_MS: 45 * 60 * 1_000,
} as const;

/**
 * Presupuesto del prefijo cacheable (system prompt + corpus + definiciones de
 * tools). No es un límite de seguridad: es una alarma de coste. Si el corpus
 * crece por encima de esto, cada conversación pasa a costar notablemente más y
 * queremos enterarnos al ejecutar los tests, no en la factura.
 */
export const PREFIX_TOKEN_BUDGET = 12_000;

/**
 * Estimación de tokens sin tokenizador.
 *
 * Deliberadamente aproximada y **conservadora al alza** (3,5 caracteres por
 * token en vez de los ~4 habituales en castellano). Sirve para cortar
 * conversaciones y vigilar el presupuesto del prefijo, no para facturar. El
 * recuento exacto lo dará el proveedor en `usage` cuando exista, en Fase 2B.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}
