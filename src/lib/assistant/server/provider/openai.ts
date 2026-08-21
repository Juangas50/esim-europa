/**
 * provider/openai.ts — Adaptador de la Responses API.
 *
 * Se usa la Responses API —`POST /v1/responses`— por ser la que OpenAI
 * recomienda para integraciones nuevas. Igual que el adaptador de Anthropic:
 * traduce en su borde, no decide nada, y ningún tipo de esta API se exporta.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DONDE LAS DOS APIS SE PARECEN MENOS
 *
 * En Anthropic, la conversación es una lista de mensajes y cada mensaje lleva
 * bloques; una llamada a herramienta es un bloque dentro del mensaje del
 * asistente, y su resultado es otro bloque dentro del siguiente mensaje del
 * usuario.
 *
 * Aquí no. La conversación es una lista plana de **elementos**, y la llamada a
 * herramienta y su resultado son elementos de primer nivel —`function_call` y
 * `function_call_output`— hermanos de los mensajes, no contenidos en ellos. Por
 * eso la traducción de ida no es un `map` sino un aplanado: un mensaje neutral
 * con tres bloques puede convertirse en tres elementos.
 *
 * El vínculo entre llamada y resultado tampoco se llama igual: aquí es
 * `call_id`, y los argumentos viajan **serializados como texto**, no como
 * objeto. Los dos detalles son fáciles de pasar por alto y rompen el bucle sin
 * hacer ruido, así que hay un test para cada uno.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { NeutralToolDef } from "../tools/registry";
import { AssistantError } from "../errors";
import { defaultTransport, postJson, type HttpTransport } from "./http";
import type { ReasoningEffort } from "./config";
import type {
  LlmContentBlock,
  LlmMessage,
  LlmProvider,
  LlmRequest,
  LlmResponse,
  LlmStopReason,
} from "./types";

const ENDPOINT = "https://api.openai.com/v1/responses";

// ── Forma de la API. No se exporta. ───────────────────────────────────────────

type WireInputItem =
  | { type: "message"; role: "user" | "assistant"; content: { type: string; text: string }[] }
  | { type: "function_call"; call_id: string; name: string; arguments: string }
  | { type: "function_call_output"; call_id: string; output: string };

interface WireOutputMessage {
  type: "message";
  content?: { type: string; text?: string }[];
}
interface WireOutputFunctionCall {
  type: "function_call";
  call_id: string;
  name: string;
  arguments: string;
}
type WireOutputItem = WireOutputMessage | WireOutputFunctionCall | { type: string };

interface WireResponse {
  output?: WireOutputItem[];
  status?: string;
  incomplete_details?: { reason?: string } | null;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    input_tokens_details?: { cached_tokens?: number | null } | null;
  };
}

// ── Ida ───────────────────────────────────────────────────────────────────────

/**
 * Aplana los mensajes neutrales en la lista de elementos que espera la API.
 *
 * Los bloques de texto de un mismo mensaje se agrupan en un solo elemento; las
 * llamadas y los resultados salen como elementos propios, en el orden en que
 * aparecían. El orden importa: la API exige que un `function_call_output` venga
 * después de su `function_call`.
 */
function toWireInput(messages: LlmMessage[]): WireInputItem[] {
  const items: WireInputItem[] = [];

  for (const message of messages) {
    const texts: string[] = [];

    const flushTexts = () => {
      if (texts.length === 0) return;
      items.push({
        type: "message",
        role: message.role,
        content: [
          {
            // El tipo de la parte depende de quién habla: lo que entra es
            // `input_text`, lo que el modelo produjo es `output_text`.
            type: message.role === "user" ? "input_text" : "output_text",
            text: texts.join("\n"),
          },
        ],
      });
      texts.length = 0;
    };

    for (const block of message.content) {
      if (block.type === "text") {
        texts.push(block.text);
        continue;
      }
      flushTexts();
      if (block.type === "tool_use") {
        items.push({
          type: "function_call",
          call_id: block.id,
          name: block.name,
          // Serializados: aquí los argumentos viajan como cadena, no como objeto.
          arguments: JSON.stringify(block.input ?? {}),
        });
      } else {
        items.push({
          type: "function_call_output",
          call_id: block.toolUseId,
          output: block.content,
        });
      }
    }

    flushTexts();
  }

  return items;
}

function toWireTools(tools: NeutralToolDef[]) {
  return tools.map((t) => ({
    type: "function" as const,
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}

// ── Vuelta ────────────────────────────────────────────────────────────────────

function parseArguments(raw: string, toolName: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    // Argumentos ilegibles no se pasan a medias: el ejecutor los rechazaría de
    // todas formas, pero con un error que apuntaría a la herramienta en vez de
    // al proveedor.
    throw new AssistantError(
      "provider_error",
      `openai: argumentos ilegibles en la llamada a ${toolName}`
    );
  }
}

function toNeutralBlocks(output: WireOutputItem[]): LlmContentBlock[] {
  const blocks: LlmContentBlock[] = [];

  for (const item of output) {
    if (item.type === "message") {
      const parts = (item as WireOutputMessage).content ?? [];
      const text = parts
        .filter((p) => p.type === "output_text" && typeof p.text === "string")
        .map((p) => p.text as string)
        .join("");
      if (text) blocks.push({ type: "text", text });
      continue;
    }
    if (item.type === "function_call") {
      const call = item as WireOutputFunctionCall;
      blocks.push({
        type: "tool_use",
        id: call.call_id,
        name: call.name,
        input: parseArguments(call.arguments, call.name),
      });
    }
    // Cualquier otro tipo de elemento —razonamiento, herramientas alojadas— se
    // ignora: el dispatcher solo sabe de texto y de llamadas a herramientas.
  }

  return blocks;
}

function toStopReason(raw: WireResponse, blocks: LlmContentBlock[]): LlmStopReason {
  if (raw.status === "incomplete" && raw.incomplete_details?.reason === "max_output_tokens") {
    return "max_tokens";
  }
  if (raw.status === "incomplete" && raw.incomplete_details?.reason === "content_filter") {
    return "refusal";
  }
  // No hay un campo equivalente a `stop_reason`: que el modelo quiera usar una
  // herramienta se deduce de que haya producido llamadas.
  return blocks.some((b) => b.type === "tool_use") ? "tool_use" : "end_turn";
}

// ── Adaptador ─────────────────────────────────────────────────────────────────

export interface OpenAiProviderOptions {
  apiKey: string;
  model: string;
  transport?: HttpTransport;
  /**
   * Esfuerzo de razonamiento del modelo.
   *
   * Sin valor no se manda el campo y decide el proveedor — que no es lo mismo
   * que mandar un nivel concreto, y por eso se distingue. Es una opción de esta
   * API y por eso vive aquí y no en los tipos neutrales: el adaptador de
   * Anthropic no la conoce ni la recibe.
   *
   * Afecta al coste y a la latencia, así que la comparativa de la Fase 2B lo
   * registra junto al modelo: dos ejecuciones con esfuerzos distintos no son
   * comparables entre sí.
   */
  reasoningEffort?: ReasoningEffort | null;
}

export class OpenAiProvider implements LlmProvider {
  readonly id = "openai";
  readonly model: string;

  /** Público para que el informe de la comparativa lo anote junto al modelo. */
  readonly reasoningEffort: ReasoningEffort | null;

  private readonly apiKey: string;
  private readonly transport: HttpTransport;

  constructor(options: OpenAiProviderOptions) {
    if (!options.apiKey) throw new AssistantError("provider_error", "openai: falta la credencial");
    if (!options.model) throw new AssistantError("provider_error", "openai: falta el modelo");
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.reasoningEffort = options.reasoningEffort ?? null;
    this.transport = options.transport ?? defaultTransport;
  }

  async complete(req: LlmRequest): Promise<LlmResponse> {
    const raw = (await postJson({
      url: ENDPOINT,
      headers: { authorization: `Bearer ${this.apiKey}` },
      body: {
        model: this.model,
        // El prompt de sistema va en su propio campo, no como un mensaje más.
        instructions: req.system,
        input: toWireInput(req.messages),
        tools: toWireTools(req.tools),
        max_output_tokens: req.maxOutputTokens,
        // Solo si se configuró: el campo ausente y un nivel concreto no
        // significan lo mismo.
        ...(this.reasoningEffort ? { reasoning: { effort: this.reasoningEffort } } : {}),
      },
      transport: this.transport,
      signal: req.signal,
      providerId: this.id,
    })) as WireResponse;

    if (!Array.isArray(raw?.output)) {
      throw new AssistantError("provider_error", "openai: respuesta sin elementos de salida");
    }

    const content = toNeutralBlocks(raw.output);

    return {
      content,
      stopReason: toStopReason(raw, content),
      usage: {
        inputTokens: raw.usage?.input_tokens ?? 0,
        outputTokens: raw.usage?.output_tokens ?? 0,
        cachedInputTokens: raw.usage?.input_tokens_details?.cached_tokens ?? null,
      },
    };
  }
}
