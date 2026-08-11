/**
 * provider/fake.ts — Proveedor de mentira, para probar todo lo que no es el
 * modelo.
 *
 * Es el único proveedor que existe en la Fase 2A, y no habla con nadie: no hace
 * `fetch`, no lee variables de entorno, no tiene cliente HTTP. Devuelve lo que
 * se le haya guionizado.
 *
 * Sirve para lo que un modelo real hace mal como sujeto de pruebas: ser
 * predecible. Con él se puede afirmar que el dispatcher corta a las cuatro
 * iteraciones, que rechaza la cuarta herramienta de un turno, que un resultado
 * inválido no llega al usuario y que con el catálogo caído no sale ningún
 * precio — todo ello sin depender de que un modelo se porte bien ese día.
 */

import type { LlmProvider, LlmRequest, LlmResponse, LlmContentBlock } from "./types";

/** Guion: una respuesta por llamada, o una función que decide sobre la marcha. */
export type FakeScript = LlmResponse[] | ((req: LlmRequest, callIndex: number) => LlmResponse);

export interface FakeProviderOptions {
  /** Qué devolver cuando se agota un guion en forma de lista. */
  onExhausted?: "throw" | "end_turn";
}

export class FakeProvider implements LlmProvider {
  readonly id = "fake";
  /** Todo lo que ha recibido, para poder afirmar sobre el contexto enviado. */
  readonly calls: LlmRequest[] = [];

  private index = 0;

  constructor(
    private readonly script: FakeScript,
    private readonly options: FakeProviderOptions = {}
  ) {}

  async complete(req: LlmRequest): Promise<LlmResponse> {
    // La señal se comprueba de verdad: así el test del timeout ejercita el mismo
    // camino que ejercitará un proveedor real.
    if (req.signal?.aborted) {
      throw new Error("aborted");
    }

    this.calls.push(req);
    const callIndex = this.index++;

    if (typeof this.script === "function") {
      return this.script(req, callIndex);
    }

    const next = this.script[callIndex];
    if (next) return next;

    if (this.options.onExhausted === "throw") {
      throw new Error(`FakeProvider: guion agotado en la llamada ${callIndex + 1}`);
    }

    return fakeText("(sin más guion)");
  }
}

// ── Constructores de respuestas ───────────────────────────────────────────────

const NO_USAGE = { inputTokens: 0, outputTokens: 0, cachedInputTokens: null };

export function fakeText(text: string): LlmResponse {
  return { content: [{ type: "text", text }], stopReason: "end_turn", usage: NO_USAGE };
}

export function fakeToolUse(
  calls: Array<{ name: string; input?: unknown; id?: string }>,
  leadingText?: string
): LlmResponse {
  const content: LlmContentBlock[] = [];
  if (leadingText) content.push({ type: "text", text: leadingText });

  calls.forEach((call, i) => {
    content.push({
      type: "tool_use",
      id: call.id ?? `fake-${i}`,
      name: call.name,
      input: call.input ?? {},
    });
  });

  return { content, stopReason: "tool_use", usage: NO_USAGE };
}

export function fakeMaxTokens(partial: string): LlmResponse {
  return { content: [{ type: "text", text: partial }], stopReason: "max_tokens", usage: NO_USAGE };
}
