/**
 * dispatcher.ts — El bucle.
 *
 * Coordina: valida la sesión, sanea lo que entra, monta el contexto, habla con
 * el proveedor, ejecuta las herramientas que pida y decide cuándo parar.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DÓNDE FALLA CERRADO Y DÓNDE SE RECUPERA
 *
 * No todos los fallos de una herramienta significan lo mismo, y tratarlos igual
 * sería un error en cualquiera de las dos direcciones.
 *
 * · **Herramienta desconocida o argumentos inválidos** → recuperable. Es el
 *   modelo equivocándose, y equivocarse es cosa suya. Se le devuelve un
 *   resultado marcado como error y se le deja corregir. Tirar el turno entero
 *   porque escribió mal un argumento sería malgastar una conversación.
 *
 * · **Resultado que no valida contra su esquema** → se corta el turno. Aquí no
 *   se ha equivocado el modelo: se ha roto una garantía nuestra. Y se ha roto
 *   justo en el dato que esa herramienta existía para fundamentar. Si seguimos,
 *   el modelo responde sobre ese tema sin nada debajo, que es exactamente el
 *   fallo que toda esta arquitectura intenta impedir. Preferimos un mensaje de
 *   error a una respuesta segura de sí misma e infundada.
 *
 * · **El contexto no cabe** → se corta el turno. Ver la nota de `fitToContext`.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ⚠️ REQUISITO PARA HERRAMIENTAS FUTURAS (hardening de la Fase 2D)
 *
 * El `AbortSignal` del turno se le pasa hoy al proveedor, no a las herramientas.
 * Es correcto mientras todas sean lo que son ahora: funciones puras sobre datos
 * ya en memoria, que terminan en microsegundos y no tienen nada que cancelar.
 *
 * Deja de serlo en cuanto una herramienta haga E/S — una consulta a la base de
 * datos, una llamada a un sistema de pedidos, cualquier cosa con latencia. En
 * ese momento el turno respondería «timeout» al usuario mientras la herramienta
 * sigue corriendo y sigue costando dinero.
 *
 * Por eso: **toda herramienta que haga E/S deberá aceptar el `AbortSignal` en su
 * `ToolContext` y respetarlo.** No se implementa ahora porque no hay nada que
 * cancelar y una abstracción sin uso envejece mal; queda anotado como requisito
 * de la Fase 2D, junto al resto del hardening.
 */

import { AssistantError } from "./errors";
import { LIMITS, estimateTokens } from "./limits";
import { logTurn } from "./observability";
import { buildSystemPrompt } from "./prompt/system";
import { sanitizeForModel, type RedactionKind } from "./sanitize";
import { assertSessionWithinLimits, type ChatRequest, type SessionState } from "./schemas";
import { executeTool, neutralToolDefs } from "./tools";
import type { PlansReader } from "./catalog";
import {
  textOf,
  toolUsesOf,
  type LlmContentBlock,
  type LlmMessage,
  type LlmProvider,
  type LlmUsage,
} from "./provider/types";

export interface DispatchInput {
  request: ChatRequest;
  provider: LlmProvider;
  session: SessionState;
  /** Lector de catálogo. En tests, un fake; en producción, el vivo. */
  readPlans?: PlansReader;
  now?: () => number;
  /**
   * Tope de tiempo del turno. Por defecto, `LIMITS.TURN_TIMEOUT_MS`.
   *
   * Es un parámetro y no una constante porque un test del corte por tiempo que
   * tarde veinticinco segundos no se ejecuta, y un test que no se ejecuta no
   * protege nada. `sec-dispatcher.spec.ts` comprueba que el valor por defecto
   * sigue siendo el aprobado.
   */
  timeoutMs?: number;
}

export interface DispatchResult {
  text: string;
  toolsCalled: string[];
  iterations: number;
  /** El modelo se quedó sin tokens de salida a mitad de frase. */
  truncated: boolean;
  redactions: Partial<Record<RedactionKind, number>>;
  usage: LlmUsage;
}

// ── Contexto ──────────────────────────────────────────────────────────────────

function mergeRedactions(
  into: Partial<Record<RedactionKind, number>>,
  from: Partial<Record<RedactionKind, number>>
): void {
  for (const [kind, count] of Object.entries(from) as [RedactionKind, number][]) {
    into[kind] = (into[kind] ?? 0) + count;
  }
}

/**
 * Sanea el historial completo, no solo el último mensaje.
 *
 * También los mensajes marcados como del asistente: llegan en el body, así que
 * cualquiera puede escribir lo que quiera en ellos. Que digan "assistant" no
 * los hace nuestros.
 */
function sanitizeHistory(request: ChatRequest): {
  messages: LlmMessage[];
  redactions: Partial<Record<RedactionKind, number>>;
} {
  const redactions: Partial<Record<RedactionKind, number>> = {};

  const messages = request.messages.map<LlmMessage>((m) => {
    const clean = sanitizeForModel(m.content);
    mergeRedactions(redactions, clean.redactions);
    return { role: m.role, content: [{ type: "text", text: clean.text }] };
  });

  return { messages, redactions };
}

/**
 * Tamaño estimado de lo que se enviaría al proveedor.
 *
 * Exportada para que los tests midan con la misma función que decide, y no con
 * una reimplementación que puede desincronizarse.
 */
export function contextTokens(system: string, messages: LlmMessage[], toolsJson: string): number {
  const body = messages
    .flatMap((m) => m.content)
    .map((b) => (b.type === "text" ? b.text : JSON.stringify(b)))
    .join("\n");
  return estimateTokens(system) + estimateTokens(body) + estimateTokens(toolsJson);
}

/**
 * Encaja el contexto en su presupuesto, antes de **cada** llamada al proveedor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUÉ SE PUEDE RECORTAR Y QUÉ NO
 *
 * El historial previo (`history`) es recortable: se descarta por el principio,
 * que es lo más viejo y lo menos relevante.
 *
 * Lo producido **dentro del turno** (`turn`) no se toca nunca. Son pares de
 * `tool_use` y `tool_result`: el resultado factual de una herramienta y la
 * llamada que lo pidió. Recortarlos tiene dos formas y las dos son
 * inaceptables. Cortar el contenido de un `tool_result` cambia el dato —
 * «330 GB» truncado puede leerse como «33 GB», y toda la disciplina factual de
 * este módulo existe para que eso no pase. Y descartar el mensaje del
 * `tool_use` dejando su `tool_result` produce un contexto estructuralmente roto
 * que ningún proveedor real acepta.
 *
 * Así que si ni siquiera el último mensaje del usuario más lo que ya se ha
 * producido en el turno cabe en el presupuesto, no hay recorte que salve la
 * situación: se corta el turno con `limit_exceeded`. Un error honesto es mejor
 * que una respuesta construida sobre un dato mutilado.
 * ─────────────────────────────────────────────────────────────────────────────
 */
function fitToContext(
  system: string,
  history: LlmMessage[],
  turn: LlmMessage[],
  toolsJson: string
): LlmMessage[] {
  const kept = [...history];

  while (
    kept.length > 1 &&
    contextTokens(system, [...kept, ...turn], toolsJson) > LIMITS.MAX_CONTEXT_TOKENS
  ) {
    kept.shift();
  }

  const total = contextTokens(system, [...kept, ...turn], toolsJson);
  if (total > LIMITS.MAX_CONTEXT_TOKENS) {
    throw new AssistantError(
      "limit_exceeded",
      `el contexto mínimo del turno son ${total} tokens, máximo ${LIMITS.MAX_CONTEXT_TOKENS}`
    );
  }

  return [...kept, ...turn];
}

// ── Bucle ─────────────────────────────────────────────────────────────────────

/** Lo que se va sabiendo del turno mientras corre, para poder registrarlo aunque falle. */
interface TurnAccumulator {
  iterations: number;
  toolsCalled: string[];
  redactions: Partial<Record<RedactionKind, number>>;
  usage: LlmUsage;
}

async function runLoop(
  input: DispatchInput,
  signal: AbortSignal,
  acc: TurnAccumulator
): Promise<DispatchResult> {
  const { request, provider } = input;

  assertSessionWithinLimits(input.session, input.now?.() ?? Date.now());

  const { messages: history, redactions } = sanitizeHistory(request);
  mergeRedactions(acc.redactions, redactions);

  const system = buildSystemPrompt({ locale: request.locale });
  const tools = neutralToolDefs();
  const toolsJson = JSON.stringify(tools);

  /** Lo que este turno ha ido añadiendo: `tool_use` del modelo y sus resultados. */
  const turn: LlmMessage[] = [];

  for (let iteration = 1; iteration <= LIMITS.MAX_ITERATIONS; iteration++) {
    acc.iterations = iteration;

    // Se recalcula en cada vuelta: los resultados de las herramientas de la
    // iteración anterior ya forman parte de lo que se va a enviar.
    const messages = fitToContext(system, history, turn, toolsJson);

    const response = await provider.complete({
      system,
      messages,
      tools,
      maxOutputTokens: LIMITS.MAX_OUTPUT_TOKENS,
      signal,
    });

    acc.usage.inputTokens += response.usage.inputTokens;
    acc.usage.outputTokens += response.usage.outputTokens;
    if (response.usage.cachedInputTokens !== null) {
      acc.usage.cachedInputTokens = (acc.usage.cachedInputTokens ?? 0) + response.usage.cachedInputTokens;
    }

    const toolUses = toolUsesOf(response.content);

    if (response.stopReason !== "tool_use" || toolUses.length === 0) {
      const text = textOf(response.content);
      if (!text) {
        throw new AssistantError("provider_error", `respuesta vacía (stopReason=${response.stopReason})`);
      }
      return {
        text,
        toolsCalled: acc.toolsCalled,
        iterations: iteration,
        truncated: response.stopReason === "max_tokens",
        redactions: acc.redactions,
        usage: acc.usage,
      };
    }

    if (toolUses.length > LIMITS.MAX_TOOL_CALLS_PER_TURN) {
      throw new AssistantError(
        "too_many_tool_calls",
        `${toolUses.length} llamadas en un turno, máximo ${LIMITS.MAX_TOOL_CALLS_PER_TURN}`
      );
    }

    turn.push({ role: "assistant", content: response.content });

    const results: LlmContentBlock[] = [];

    for (const call of toolUses) {
      acc.toolsCalled.push(call.name);
      try {
        const output = await executeTool(call.name, call.input, {
          locale: request.locale,
          readPlans: input.readPlans,
        });
        results.push({
          type: "tool_result",
          toolUseId: call.id,
          content: JSON.stringify(output),
          isError: false,
        });
      } catch (err) {
        if (err instanceof AssistantError && err.code === "invalid_tool_output") {
          // Garantía rota. No se sigue: ver la nota de cabecera.
          throw err;
        }
        if (err instanceof AssistantError) {
          results.push({
            type: "tool_result",
            toolUseId: call.id,
            // Sin detalle técnico: el `detail` lleva nombres de campos y
            // mensajes de esquema, y el modelo los repetiría al usuario.
            content: JSON.stringify({ error: err.code }),
            isError: true,
          });
          continue;
        }
        throw new AssistantError("provider_error", `fallo ejecutando ${call.name}: ${String(err)}`);
      }
    }

    turn.push({ role: "user", content: results });
  }

  throw new AssistantError(
    "max_iterations",
    `se agotaron las ${LIMITS.MAX_ITERATIONS} iteraciones sin respuesta final`
  );
}

/**
 * Ejecuta un turno completo con tope de tiempo, y lo registra.
 *
 * El `AbortController` se le pasa al proveedor además de usarse en la carrera:
 * ganar la carrera solo devuelve el control, no detiene el trabajo de fondo, y
 * una petición al modelo que sigue viva después de haber respondido al usuario
 * se paga igual.
 *
 * El registro ocurre en los dos caminos, y solo con lo que hay en el acumulador
 * — que por construcción no contiene texto de conversación.
 */
export async function dispatchTurn(input: DispatchInput): Promise<DispatchResult> {
  const startedAt = Date.now();
  const budgetMs = input.timeoutMs ?? LIMITS.TURN_TIMEOUT_MS;

  const acc: TurnAccumulator = {
    iterations: 0,
    toolsCalled: [],
    redactions: {},
    usage: { inputTokens: 0, outputTokens: 0, cachedInputTokens: null },
  };

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AssistantError("timeout", `el turno superó ${budgetMs} ms`));
    }, budgetMs);
  });

  const observe = (outcome: "ok" | "error", errorCode?: string) => {
    logTurn({
      sessionId: input.request.sessionId,
      locale: input.request.locale,
      providerId: input.provider.id,
      model: input.provider.model ?? null,
      turn: input.session.messageCount,
      iterations: acc.iterations,
      toolsCalled: acc.toolsCalled,
      redactions: acc.redactions,
      durationMs: Date.now() - startedAt,
      outcome,
      errorCode,
      usage: acc.usage,
    });
  };

  try {
    const result = await Promise.race([runLoop(input, controller.signal, acc), timeout]);
    observe("ok");
    return result;
  } catch (err) {
    // Solo el CÓDIGO. `AssistantError.detail` lleva mensajes de esquema, rutas
    // de campos y, en el peor caso, texto de error de la base de datos. Nada de
    // eso entra en un log.
    observe("error", err instanceof AssistantError ? err.code : "provider_error");
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
