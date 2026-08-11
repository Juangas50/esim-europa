/**
 * schemas.ts — Validación del borde de entrada.
 *
 * Todo lo que llega de fuera pasa por aquí antes de tocar nada. Los esquemas
 * son estrictos (`strictObject`): una clave de más es un rechazo, no un campo
 * que se ignora en silencio. Un cliente que manda campos desconocidos o está
 * desactualizado o está probando.
 *
 * Los límites numéricos no se repiten aquí: se leen de `limits.ts`, que es el
 * único sitio donde se cambian.
 */

import { z } from "zod";
import { LIMITS } from "./limits";
import { AssistantError } from "./errors";

// ── Mensajes ──────────────────────────────────────────────────────────────────

export const chatMessageSchema = z.strictObject({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(LIMITS.MAX_MESSAGE_CHARS),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// ── Request ───────────────────────────────────────────────────────────────────

export const chatRequestSchema = z
  .strictObject({
    locale: z.enum(["es", "pt"]),
    /**
     * Identificador opaco de sesión generado en el cliente. No es
     * autenticación: sirve para aplicar los límites por sesión y para
     * correlacionar logs. Formato acotado para que no se use como canal.
     */
    sessionId: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/),
    messages: z
      .array(chatMessageSchema)
      .min(1)
      .max(LIMITS.MAX_MESSAGES_PER_REQUEST),
  })
  .refine((r) => r.messages[r.messages.length - 1]?.role === "user", {
    message: "el último mensaje tiene que ser del usuario",
    path: ["messages"],
  });

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// ── Puerta de entrada ─────────────────────────────────────────────────────────

/**
 * Valida el body crudo.
 *
 * El tamaño se comprueba **antes** de parsear el JSON: parsear 10 MB para luego
 * rechazarlos ya es haber gastado el trabajo que el límite pretendía evitar.
 */
export function parseChatRequest(rawBody: string): ChatRequest {
  const bytes = Buffer.byteLength(rawBody, "utf8");
  if (bytes > LIMITS.MAX_BODY_BYTES) {
    throw new AssistantError("limit_exceeded", `body de ${bytes} bytes, máximo ${LIMITS.MAX_BODY_BYTES}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new AssistantError("invalid_request", "el body no es JSON válido");
  }

  const result = chatRequestSchema.safeParse(parsed);
  if (!result.success) {
    // Los `issues` llevan rutas y mensajes de esquema: van al log, no al cliente
    // ni al modelo. El dispatcher decide qué se devuelve al navegador.
    const summary = result.error.issues
      .map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`)
      .join("; ");
    throw new AssistantError("invalid_request", summary);
  }

  return result.data;
}

// ── Sesión ────────────────────────────────────────────────────────────────────

export interface SessionState {
  startedAt: number;
  messageCount: number;
}

/**
 * Comprueba los límites de sesión.
 *
 * Best-effort y por diseño: en 2A el estado de sesión lo aporta quien llama, y
 * en la Fase 2C vivirá en memoria del proceso. Eso no protege frente a un
 * atacante — le basta con cambiar de `sessionId` — y no pretende hacerlo. Es
 * higiene frente a un usuario normal que se enreda en una conversación
 * infinita. La barrera real contra el abuso es el contador distribuido y el
 * tope de gasto del proveedor, que son trabajo de la Fase 2D.
 */
export function assertSessionWithinLimits(state: SessionState, now: number = Date.now()): void {
  if (state.messageCount >= LIMITS.MAX_MESSAGES_PER_SESSION) {
    throw new AssistantError(
      "limit_exceeded",
      `sesión con ${state.messageCount} mensajes, máximo ${LIMITS.MAX_MESSAGES_PER_SESSION}`
    );
  }
  const age = now - state.startedAt;
  if (age > LIMITS.SESSION_TTL_MS) {
    throw new AssistantError("limit_exceeded", `sesión de ${Math.round(age / 1000)} s, máximo ${LIMITS.SESSION_TTL_MS / 1000} s`);
  }
}
