import { getMockReply } from "./mock-engine";
import type { AssistantSendRequest, AssistantReply, AssistantTransport } from "./types";

/** Latencia simulada para que el indicador de escritura se perciba natural. */
const MOCK_DELAY_MS = 700;

/**
 * Transporte local sin IA — Fase 1.
 *
 * Reproduce la forma asíncrona del backend real (incluida una espera) para que
 * la UI se construya contra la misma interfaz que usará después.
 */
export class MockTransport implements AssistantTransport {
  constructor(private readonly delayMs: number = MOCK_DELAY_MS) {}

  async send({ input, history }: AssistantSendRequest): Promise<AssistantReply> {
    const reply = getMockReply(input, history);
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    return reply;
  }
}

/**
 * Punto de conmutación hacia el backend real.
 *
 * En la fase siguiente, esta función devolverá un `HttpTransport` que llame a
 * `POST /api/assistant/chat`. Ningún componente de UI necesita cambiar: todos
 * consumen la interfaz `AssistantTransport`.
 */
export function createAssistantTransport(): AssistantTransport {
  return new MockTransport();
}
