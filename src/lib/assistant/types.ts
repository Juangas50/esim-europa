/**
 * Contratos del asistente de Ruta34.
 *
 * ⚠️ REGLA DE PRODUCTO: el asistente trabaja únicamente con identidad comercial
 * Ruta34 (Europa Básico / Plus / Total / Max / Premium). Ninguna estructura de
 * este módulo puede transportar metadata de provisión del mayorista — ni código
 * de tarifa, ni tallas de operador. Ver `src/lib/plans-server.ts`.
 */

/** Quién habla. No hay personas ficticias: el asistente es "Ruta34". */
export type AssistantRole = "user" | "assistant";

export type GuideSlug = "install-iphone" | "install-android" | "qr" | "troubleshooting";

/**
 * Acción contextual que puede acompañar a una respuesta.
 *
 * Es **dato, no JSX**: el componente de mensaje nunca conoce botones concretos.
 * Para añadir una acción nueva basta con sumar una variante aquí y su caso en
 * `resolveAction()` — ningún componente cambia.
 */
export type AssistantAction =
  | { kind: "view_plans" }
  | { kind: "view_plan"; planId: string }
  | { kind: "open_compatibility" }
  | { kind: "open_guide"; slug: GuideSlug }
  | { kind: "whatsapp_handoff" };

/** Acción ya resuelta a algo que la UI puede pintar. */
export interface ResolvedAction {
  id: string;
  label: string;
  href: string;
  external: boolean;
}

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  /** Texto ya traducido y listo para mostrar. */
  content: string;
  actions?: AssistantAction[];
  /**
   * Etiqueta interna del guion que produjo el mensaje. Permite al motor mock
   * saber en qué paso de la conversación está. Nunca se muestra al usuario.
   */
  intent?: string;
}

/** Respuesta del motor, aún sin traducir. */
export interface AssistantReply {
  /** Clave dentro del namespace `assistant.replies` de los archivos de mensajes. */
  replyKey: string;
  intent: string;
  actions?: AssistantAction[];
}

export interface AssistantSendRequest {
  input: string;
  history: AssistantMessage[];
  locale: string;
}

/**
 * Frontera con el backend.
 *
 * Hoy la implementa `MockTransport` (local, sin IA). En la fase siguiente la
 * implementará un `HttpTransport` contra `/api/assistant/chat` **sin tocar
 * ningún componente de UI**.
 */
export interface AssistantTransport {
  send(req: AssistantSendRequest): Promise<AssistantReply>;
}
