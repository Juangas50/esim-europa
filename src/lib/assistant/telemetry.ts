/**
 * Costuras de analítica del asistente.
 *
 * ⚠️ FASE 1: deliberadamente vacías. No se envía nada al `dataLayer`, a GA4 ni a
 * Meta. Existen para que los puntos de medición queden fijados en la
 * arquitectura desde el principio y conectarlos después sea rellenar cuatro
 * cuerpos de función, sin tocar componentes.
 *
 * Cuando se activen, el destino natural es el catálogo tipado de
 * `src/lib/analytics/index.ts`, que ya empuja al dataLayer con gating de
 * consentimiento.
 */

export interface AssistantOpenPayload {
  source: "launcher" | "suggestion" | "deeplink";
}

export interface AssistantMessagePayload {
  turn: number;
}

export interface AssistantActionPayload {
  actionId: string;
}

export interface AssistantHandoffPayload {
  /** Etiqueta del guion desde el que se derivó. */
  intent: string;
}

/* eslint-disable @typescript-eslint/no-unused-vars */

/** assistant_open */
export function trackAssistantOpen(_payload: AssistantOpenPayload): void {
  // Fase 1: sin implementación.
}

/** assistant_message_sent */
export function trackAssistantMessageSent(_payload: AssistantMessagePayload): void {
  // Fase 1: sin implementación.
}

/** assistant_action_clicked */
export function trackAssistantActionClicked(_payload: AssistantActionPayload): void {
  // Fase 1: sin implementación.
}

/** assistant_whatsapp_handoff */
export function trackAssistantWhatsappHandoff(_payload: AssistantHandoffPayload): void {
  // Fase 1: sin implementación.
}
