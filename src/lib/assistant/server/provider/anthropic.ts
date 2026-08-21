/**
 * provider/anthropic.ts — Adaptador de la Messages API.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUÉ HACE Y QUÉ NO
 *
 * Traduce, y nada más. De los tipos neutrales al vocabulario de la API en la
 * ida, y del vocabulario de la API a los tipos neutrales en la vuelta. No
 * decide cuándo llamar, ni cuántas veces, ni qué hacer con lo que vuelva: de
 * eso se ocupa el dispatcher, que es el mismo para los dos proveedores — si
 * cada adaptador arrastrase su bucle, la comparativa de la Fase 2B compararía
 * integraciones en vez de modelos.
 *
 * Ningún tipo de esta API sale de este archivo. Las formas de la petición y la
 * respuesta se declaran aquí abajo como interfaces locales, no se exportan, y
 * el resto del sistema sigue viendo solo `LlmRequest` y `LlmResponse`.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Correspondencia de los bloques de contenido:
 *
 *   neutral                     Messages API
 *   ─────────────────────────   ──────────────────────────────────────────
 *   text                        { type: "text", text }
 *   tool_use                    { type: "tool_use", id, name, input }
 *   tool_result                 { type: "tool_result", tool_use_id, content, is_error }
 *
 * Y de las razones de parada: `stop_sequence` se normaliza a `end_turn` porque
 * para el dispatcher significan lo mismo —el modelo terminó—, y `refusal` se
 * conserva porque no significa lo mismo en absoluto.
 */

import type { NeutralToolDef } from "../tools/registry";
import { AssistantError } from "../errors";
import { defaultTransport, postJson, type HttpTransport } from "./http";
import type {
  LlmContentBlock,
  LlmProvider,
  LlmRequest,
  LlmResponse,
  LlmStopReason,
} from "./types";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
/** Versión de la API. Va en cabecera y es obligatoria. */
const API_VERSION = "2023-06-01";

// ── Forma de la API. No se exporta: muere en este archivo. ────────────────────

interface WireTextBlock {
  type: "text";
  text: string;
}
interface WireToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
}
interface WireToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error: boolean;
}
type WireBlock = WireTextBlock | WireToolUseBlock | WireToolResultBlock;

interface WireResponse {
  content?: WireBlock[];
  stop_reason?: string | null;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number | null;
    cache_creation_input_tokens?: number | null;
  };
}

// ── Ida ───────────────────────────────────────────────────────────────────────

function toWireBlock(block: LlmContentBlock): WireBlock {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };
    case "tool_use":
      return { type: "tool_use", id: block.id, name: block.name, input: block.input };
    case "tool_result":
      return {
        type: "tool_result",
        tool_use_id: block.toolUseId,
        content: block.content,
        is_error: block.isError,
      };
  }
}

function toWireTools(tools: NeutralToolDef[]) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    // El esquema neutral ya viene sin `$schema`: lo quita `toNeutralToolDef`.
    input_schema: t.parameters,
  }));
}

// ── Vuelta ────────────────────────────────────────────────────────────────────

function toStopReason(raw: string | null | undefined): LlmStopReason {
  switch (raw) {
    case "tool_use":
      return "tool_use";
    case "max_tokens":
      return "max_tokens";
    case "refusal":
      return "refusal";
    case "end_turn":
    case "stop_sequence":
      return "end_turn";
    default:
      // Una razón nueva no se adivina. El dispatcher trata `end_turn` como
      // «hay respuesta final», así que devolver eso ante lo desconocido daría
      // por buena una parada que quizá no lo es.
      throw new AssistantError("provider_error", `anthropic: stop_reason desconocido "${raw}"`);
  }
}

function toNeutralBlocks(blocks: WireBlock[]): LlmContentBlock[] {
  const out: LlmContentBlock[] = [];
  for (const b of blocks) {
    if (b.type === "text") out.push({ type: "text", text: b.text });
    else if (b.type === "tool_use") {
      out.push({ type: "tool_use", id: b.id, name: b.name, input: b.input });
    }
    // Un `tool_result` en la respuesta no tiene sentido: lo produce el cliente.
    // Se ignora en vez de propagarlo.
  }
  return out;
}

// ── Adaptador ─────────────────────────────────────────────────────────────────

export interface AnthropicProviderOptions {
  apiKey: string;
  model: string;
  /** Inyectable para poder probar sin abrir un socket. */
  transport?: HttpTransport;
}

export class AnthropicProvider implements LlmProvider {
  readonly id = "anthropic";
  readonly model: string;

  private readonly apiKey: string;
  private readonly transport: HttpTransport;

  constructor(options: AnthropicProviderOptions) {
    if (!options.apiKey) throw new AssistantError("provider_error", "anthropic: falta la credencial");
    if (!options.model) throw new AssistantError("provider_error", "anthropic: falta el modelo");
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.transport = options.transport ?? defaultTransport;
  }

  async complete(req: LlmRequest): Promise<LlmResponse> {
    const raw = (await postJson({
      url: ENDPOINT,
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": API_VERSION,
      },
      body: {
        model: this.model,
        max_tokens: req.maxOutputTokens,
        system: req.system,
        tools: toWireTools(req.tools),
        messages: req.messages.map((m) => ({
          role: m.role,
          content: m.content.map(toWireBlock),
        })),
      },
      transport: this.transport,
      signal: req.signal,
      providerId: this.id,
    })) as WireResponse;

    if (!Array.isArray(raw?.content)) {
      throw new AssistantError("provider_error", "anthropic: respuesta sin bloques de contenido");
    }

    return {
      content: toNeutralBlocks(raw.content),
      stopReason: toStopReason(raw.stop_reason),
      usage: {
        inputTokens: raw.usage?.input_tokens ?? 0,
        outputTokens: raw.usage?.output_tokens ?? 0,
        // La lectura de caché es la que abarata; la escritura se cobra con
        // prima. Se informa la lectura, que es lo que el modelo de coste usa.
        cachedInputTokens: raw.usage?.cache_read_input_tokens ?? null,
      },
    };
  }
}
