/**
 * observability.ts — Qué se apunta de cada turno.
 *
 * Regla única, y no admite excepciones: **aquí no entra texto de conversación**.
 * Ni el mensaje del usuario, ni la respuesta del asistente, ni el resumen del
 * traspaso, ni los argumentos con los que se llamó a una herramienta. Los logs
 * de una aplicación se copian, se exportan y se miran desde sitios que nunca
 * pasaron por una evaluación de protección de datos.
 *
 * Lo que sí se apunta son formas: cuántos turnos, qué herramientas, cuántas
 * iteraciones, por qué se cortó, cuánto tardó y qué CATEGORÍAS de dato personal
 * hubo que redactar. Con eso se depura y se dimensiona; con el contenido no se
 * depura mucho mejor y el riesgo es de otro orden.
 *
 * En 2A esto escribe en la consola del servidor. El destino definitivo se
 * decide en la Fase 2D, junto con el DPA.
 */

import type { RedactionKind } from "./sanitize";

export interface TurnObservation {
  sessionId: string;
  locale: string;
  providerId: string;
  /**
   * Modelo concreto que atendió el turno, cuando el proveedor lo informa.
   *
   * Es un identificador público (`claude-haiku-4-5`, `gpt-5.6-luna`), nunca una
   * clave ni una URL de endpoint: hace falta para atribuir coste y calidad en
   * la comparativa de la Fase 2B, y eso no requiere ningún secreto.
   */
  model: string | null;
  /** Número de mensaje dentro de la sesión. */
  turn: number;
  iterations: number;
  toolsCalled: string[];
  /** Categorías redactadas y cuántas veces. Nunca el contenido. */
  redactions: Partial<Record<RedactionKind, number>>;
  durationMs: number;
  outcome: "ok" | "error";
  /**
   * Código de `AssistantErrorCode` si terminó mal.
   *
   * El **código**, no el `detail`. El detalle de un `AssistantError` lleva
   * rutas de campos, mensajes de esquema y, cuando el fallo viene del
   * catálogo, texto de error de la base de datos. Nada de eso entra aquí.
   */
  errorCode?: string;
  usage?: { inputTokens: number; outputTokens: number; cachedInputTokens: number | null };
}

export function logTurn(obs: TurnObservation): void {
  const line = {
    scope: "assistant",
    ...obs,
    // Explícito para que nadie tenga que confiar en la ausencia: si algún día
    // aparece un campo con texto en este objeto, este marcador queda mintiendo
    // y se ve en la revisión.
    contentLogged: false,
  };

  if (obs.outcome === "error") {
    console.error("[assistant]", JSON.stringify(line));
  } else {
    console.info("[assistant]", JSON.stringify(line));
  }
}
