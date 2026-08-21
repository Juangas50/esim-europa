import "./_no-network";

import { test, expect } from "@playwright/test";

import { AnthropicProvider } from "@/lib/assistant/server/provider/anthropic";
import { OpenAiProvider } from "@/lib/assistant/server/provider/openai";
import {
  readAssistantConfig,
  API_KEY_VAR,
  REASONING_EFFORTS,
} from "@/lib/assistant/server/provider/config";
import { createProviderFromConfig } from "@/lib/assistant/server/provider";
import { neutralToolDefs } from "@/lib/assistant/server/tools";
import { AssistantError } from "@/lib/assistant/server/errors";
import type { HttpTransport } from "@/lib/assistant/server/provider/http";
import type { LlmRequest } from "@/lib/assistant/server/provider/types";

/**
 * Los dos adaptadores, sin abrir un socket.
 *
 * El candado de red sigue instalado —es el primer import de este archivo—, así
 * que si un adaptador se saltara el transporte inyectado para llamar a `fetch`
 * por su cuenta, estos tests reventarían. Esa es la razón de que el transporte
 * se inyecte y no se importe.
 *
 * ⚠️ QUÉ PRUEBAN Y QUÉ NO
 *
 * Prueban la **traducción**: que lo neutral se convierte en el vocabulario de
 * cada API y vuelve. Las respuestas de ejemplo están escritas a partir del
 * contrato documentado de cada proveedor, no capturadas de una llamada real.
 * Que el formato de la petición sea el que cada API acepta hoy se verifica en
 * la Fase 2B-B, la primera vez que se hable con ellas de verdad. Hasta
 * entonces, esto protege la lógica, no la compatibilidad de cable.
 */

const CLAVE = "clave-de-mentira-para-tests";

/** Un transporte que devuelve lo que se le diga y guarda lo que recibió. */
function transporteQueDevuelve(body: unknown, status = 200) {
  const recibido: { url: string; init: RequestInit }[] = [];
  const transport: HttpTransport = async (url, init) => {
    recibido.push({ url, init });
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  };
  return { transport, recibido };
}

function peticion(overrides: Partial<LlmRequest> = {}): LlmRequest {
  return {
    system: "Sos el asistente de Ruta34.",
    messages: [{ role: "user", content: [{ type: "text", text: "¿Qué planes tenés?" }] }],
    tools: neutralToolDefs(),
    maxOutputTokens: 600,
    ...overrides,
  };
}

/** Lo que devuelve el cuerpo de la petición que se envió. */
function cuerpoEnviado(recibido: { init: RequestInit }[]): Record<string, unknown> {
  return JSON.parse(String(recibido[0].init.body));
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

test.describe("adaptador de Anthropic", () => {
  const respuestaConTexto = {
    content: [{ type: "text", text: "Tenemos cinco gamas." }],
    stop_reason: "end_turn",
    usage: { input_tokens: 120, output_tokens: 18, cache_read_input_tokens: 100 },
  };

  test("traduce una respuesta de texto", async () => {
    const { transport } = transporteQueDevuelve(respuestaConTexto);
    const p = new AnthropicProvider({ apiKey: CLAVE, model: "claude-haiku-4-5", transport });

    const res = await p.complete(peticion());

    expect(res.stopReason).toBe("end_turn");
    expect(res.content).toEqual([{ type: "text", text: "Tenemos cinco gamas." }]);
    expect(res.usage).toEqual({ inputTokens: 120, outputTokens: 18, cachedInputTokens: 100 });
  });

  test("traduce una llamada a herramienta", async () => {
    const { transport } = transporteQueDevuelve({
      content: [
        { type: "text", text: "Miro el catálogo." },
        { type: "tool_use", id: "toolu_1", name: "list_plans", input: {} },
      ],
      stop_reason: "tool_use",
      usage: { input_tokens: 10, output_tokens: 5 },
    });
    const p = new AnthropicProvider({ apiKey: CLAVE, model: "claude-haiku-4-5", transport });

    const res = await p.complete(peticion());

    expect(res.stopReason).toBe("tool_use");
    expect(res.content).toContainEqual({
      type: "tool_use",
      id: "toolu_1",
      name: "list_plans",
      input: {},
    });
  });

  test("manda el prompt de sistema fuera de los mensajes", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaConTexto);
    const p = new AnthropicProvider({ apiKey: CLAVE, model: "claude-haiku-4-5", transport });
    await p.complete(peticion());

    const body = cuerpoEnviado(recibido);
    expect(body.system).toContain("Ruta34");
    expect(JSON.stringify(body.messages)).not.toContain("Sos el asistente");
    expect(body.model).toBe("claude-haiku-4-5");
    expect(body.max_tokens).toBe(600);
  });

  test("traduce los resultados de herramienta con su identificador", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaConTexto);
    const p = new AnthropicProvider({ apiKey: CLAVE, model: "claude-haiku-4-5", transport });

    await p.complete(
      peticion({
        messages: [
          { role: "user", content: [{ type: "text", text: "hola" }] },
          {
            role: "assistant",
            content: [{ type: "tool_use", id: "toolu_9", name: "list_plans", input: {} }],
          },
          {
            role: "user",
            content: [
              { type: "tool_result", toolUseId: "toolu_9", content: '{"ok":true}', isError: false },
            ],
          },
        ],
      })
    );

    const body = cuerpoEnviado(recibido);
    expect(JSON.stringify(body.messages)).toContain('"tool_use_id":"toolu_9"');
    expect(JSON.stringify(body.messages)).toContain('"is_error":false');
  });

  test("las herramientas viajan con su esquema", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaConTexto);
    const p = new AnthropicProvider({ apiKey: CLAVE, model: "claude-haiku-4-5", transport });
    await p.complete(peticion());

    const tools = cuerpoEnviado(recibido).tools as { name: string; input_schema: unknown }[];
    expect(tools.map((t) => t.name)).toContain("check_coverage");
    expect(tools[0].input_schema).toBeTruthy();
    // `$schema` lo quita el registro neutral, una vez, para los dos adaptadores.
    expect(JSON.stringify(tools)).not.toContain("$schema");
  });

  test("normaliza las razones de parada", async () => {
    for (const [wire, esperado] of [
      ["end_turn", "end_turn"],
      ["stop_sequence", "end_turn"],
      ["max_tokens", "max_tokens"],
      ["refusal", "refusal"],
      ["tool_use", "tool_use"],
    ] as const) {
      const { transport } = transporteQueDevuelve({
        content:
          wire === "tool_use"
            ? [{ type: "tool_use", id: "t", name: "list_plans", input: {} }]
            : [{ type: "text", text: "x" }],
        stop_reason: wire,
        usage: { input_tokens: 1, output_tokens: 1 },
      });
      const p = new AnthropicProvider({ apiKey: CLAVE, model: "m", transport });
      expect((await p.complete(peticion())).stopReason, wire).toBe(esperado);
    }
  });

  test("una razón de parada desconocida no se da por buena", async () => {
    const { transport } = transporteQueDevuelve({
      content: [{ type: "text", text: "x" }],
      stop_reason: "algo_nuevo",
      usage: {},
    });
    const p = new AnthropicProvider({ apiKey: CLAVE, model: "m", transport });
    await expect(p.complete(peticion())).rejects.toThrow(/stop_reason desconocido/);
  });

  test("sin lectura de caché informada, el campo es null y no cero", async () => {
    const { transport } = transporteQueDevuelve({
      content: [{ type: "text", text: "x" }],
      stop_reason: "end_turn",
      usage: { input_tokens: 5, output_tokens: 2 },
    });
    const p = new AnthropicProvider({ apiKey: CLAVE, model: "m", transport });
    expect((await p.complete(peticion())).usage.cachedInputTokens).toBeNull();
  });
});

// ── OpenAI ────────────────────────────────────────────────────────────────────

test.describe("adaptador de OpenAI", () => {
  const respuestaConTexto = {
    output: [{ type: "message", content: [{ type: "output_text", text: "Tenemos cinco gamas." }] }],
    status: "completed",
    usage: { input_tokens: 200, output_tokens: 22, input_tokens_details: { cached_tokens: 180 } },
  };

  test("traduce una respuesta de texto", async () => {
    const { transport } = transporteQueDevuelve(respuestaConTexto);
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "gpt-5.6-luna", transport });

    const res = await p.complete(peticion());

    expect(res.stopReason).toBe("end_turn");
    expect(res.content).toEqual([{ type: "text", text: "Tenemos cinco gamas." }]);
    expect(res.usage).toEqual({ inputTokens: 200, outputTokens: 22, cachedInputTokens: 180 });
  });

  test("deduce tool_use de que haya llamadas, porque no hay campo que lo diga", async () => {
    const { transport } = transporteQueDevuelve({
      output: [
        { type: "function_call", call_id: "call_1", name: "list_plans", arguments: "{}" },
      ],
      status: "completed",
      usage: {},
    });
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "gpt-5.6-luna", transport });

    const res = await p.complete(peticion());
    expect(res.stopReason).toBe("tool_use");
    expect(res.content).toEqual([
      { type: "tool_use", id: "call_1", name: "list_plans", input: {} },
    ]);
  });

  test("los argumentos llegan serializados y se parsean", async () => {
    const { transport } = transporteQueDevuelve({
      output: [
        {
          type: "function_call",
          call_id: "call_2",
          name: "check_coverage",
          arguments: '{"country":"Francia"}',
        },
      ],
      status: "completed",
      usage: {},
    });
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });

    const res = await p.complete(peticion());
    expect(res.content[0]).toMatchObject({ input: { country: "Francia" } });
  });

  test("argumentos ilegibles son un fallo del proveedor, no de la herramienta", async () => {
    const { transport } = transporteQueDevuelve({
      output: [{ type: "function_call", call_id: "c", name: "check_coverage", arguments: "{no" }],
      status: "completed",
      usage: {},
    });
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });
    await expect(p.complete(peticion())).rejects.toThrow(/argumentos ilegibles/);
  });

  test("aplana el turno en elementos de primer nivel, en orden", async () => {
    // La diferencia grande con la otra API: la llamada y su resultado no van
    // dentro de un mensaje, van al lado.
    const { transport, recibido } = transporteQueDevuelve(respuestaConTexto);
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });

    await p.complete(
      peticion({
        messages: [
          { role: "user", content: [{ type: "text", text: "hola" }] },
          {
            role: "assistant",
            content: [
              { type: "text", text: "miro" },
              { type: "tool_use", id: "call_7", name: "list_plans", input: { a: 1 } },
            ],
          },
          {
            role: "user",
            content: [
              { type: "tool_result", toolUseId: "call_7", content: '{"ok":1}', isError: false },
            ],
          },
        ],
      })
    );

    const input = cuerpoEnviado(recibido).input as { type: string; call_id?: string }[];
    expect(input.map((i) => i.type)).toEqual([
      "message",
      "message",
      "function_call",
      "function_call_output",
    ]);
    // El vínculo entre llamada y resultado es `call_id` en las dos.
    expect(input[2].call_id).toBe("call_7");
    expect(input[3].call_id).toBe("call_7");
  });

  test("los argumentos salen serializados, no como objeto", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaConTexto);
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });

    await p.complete(
      peticion({
        messages: [
          {
            role: "assistant",
            content: [{ type: "tool_use", id: "c1", name: "get_guide", input: { slug: "instalar" } }],
          },
        ],
      })
    );

    const input = cuerpoEnviado(recibido).input as { arguments?: unknown }[];
    expect(typeof input[0].arguments).toBe("string");
    expect(JSON.parse(String(input[0].arguments))).toEqual({ slug: "instalar" });
  });

  test("el prompt de sistema va en instructions", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaConTexto);
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "gpt-5.6-luna", transport });
    await p.complete(peticion());

    const body = cuerpoEnviado(recibido);
    expect(String(body.instructions)).toContain("Ruta34");
    expect(body.max_output_tokens).toBe(600);
    expect(body.model).toBe("gpt-5.6-luna");
  });

  test("quedarse sin tokens de salida se traduce a max_tokens", async () => {
    const { transport } = transporteQueDevuelve({
      output: [{ type: "message", content: [{ type: "output_text", text: "a medias" }] }],
      status: "incomplete",
      incomplete_details: { reason: "max_output_tokens" },
      usage: {},
    });
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });
    expect((await p.complete(peticion())).stopReason).toBe("max_tokens");
  });

  test("el filtro de contenido se traduce a refusal", async () => {
    const { transport } = transporteQueDevuelve({
      output: [],
      status: "incomplete",
      incomplete_details: { reason: "content_filter" },
      usage: {},
    });
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });
    expect((await p.complete(peticion())).stopReason).toBe("refusal");
  });

  test("ignora elementos de salida que no sabe interpretar", async () => {
    const { transport } = transporteQueDevuelve({
      output: [
        { type: "reasoning", summary: [] },
        { type: "message", content: [{ type: "output_text", text: "hola" }] },
      ],
      status: "completed",
      usage: {},
    });
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });
    expect((await p.complete(peticion())).content).toEqual([{ type: "text", text: "hola" }]);
  });
});

// ── Razonamiento: solo OpenAI ─────────────────────────────────────────────────

test.describe("esfuerzo de razonamiento", () => {
  const respuestaOpenAi = {
    output: [{ type: "message", content: [{ type: "output_text", text: "ok" }] }],
    status: "completed",
    usage: {},
  };
  const respuestaAnthropic = {
    content: [{ type: "text", text: "ok" }],
    stop_reason: "end_turn",
    usage: {},
  };

  test("el valor configurado llega a la petición de OpenAI", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaOpenAi);
    const p = new OpenAiProvider({
      apiKey: CLAVE,
      model: "gpt-5.6-luna",
      transport,
      reasoningEffort: "low",
    });
    await p.complete(peticion());

    expect(cuerpoEnviado(recibido).reasoning).toEqual({ effort: "low" });
  });

  test("los cuatro niveles admitidos viajan tal cual", async () => {
    for (const nivel of REASONING_EFFORTS) {
      const { transport, recibido } = transporteQueDevuelve(respuestaOpenAi);
      const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport, reasoningEffort: nivel });
      await p.complete(peticion());
      expect(cuerpoEnviado(recibido).reasoning, nivel).toEqual({ effort: nivel });
    }
  });

  test("sin configurar, el campo no se manda: no es lo mismo que un nivel", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaOpenAi);
    const p = new OpenAiProvider({ apiKey: CLAVE, model: "m", transport });
    await p.complete(peticion());

    expect(cuerpoEnviado(recibido)).not.toHaveProperty("reasoning");
  });

  test("Anthropic no recibe esa configuración por ningún camino", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaAnthropic);
    // Se construye desde la configuración, que es donde podría colarse.
    const provider = createProviderFromConfig(
      {
        enabled: true,
        provider: "anthropic",
        model: "claude-haiku-4-5",
        apiKey: CLAVE,
        reasoningEffort: "low",
      },
      { transport }
    );
    await provider.complete(peticion());

    const body = cuerpoEnviado(recibido);
    expect(body).not.toHaveProperty("reasoning");
    expect(JSON.stringify(body)).not.toContain("effort");
    // Y el adaptador tampoco lo expone como propiedad suya.
    expect(provider).not.toHaveProperty("reasoningEffort");
  });

  test("con OpenAI sí llega desde la misma configuración", async () => {
    const { transport, recibido } = transporteQueDevuelve(respuestaOpenAi);
    const provider = createProviderFromConfig(
      {
        enabled: true,
        provider: "openai",
        model: "gpt-5.6-luna",
        apiKey: CLAVE,
        reasoningEffort: "low",
      },
      { transport }
    );
    await provider.complete(peticion());

    expect(cuerpoEnviado(recibido).reasoning).toEqual({ effort: "low" });
  });

  test("un valor inválido falla al leer la configuración, no en el primer turno", () => {
    const base = {
      ASSISTANT_ENABLED: "true",
      ASSISTANT_PROVIDER: "openai",
      ASSISTANT_MODEL: "gpt-5.6-luna",
      OPENAI_API_KEY: "k",
    };
    for (const invalido of ["bajo", "LOW ", "extra-high", "0", "true", "máximo"]) {
      // «LOW » con espacio sí vale: se normaliza. El resto no.
      if (invalido.trim().toLowerCase() === "low") continue;
      expect(
        () => readAssistantConfig({ ...base, ASSISTANT_REASONING_EFFORT: invalido }),
        invalido
      ).toThrow(/no es un valor admitido/);
    }
  });

  test("un valor inválido no se ignora en silencio", () => {
    // Lo peligroso no es fallar: es arrancar como si no se hubiera configurado
    // nada y medir otra cosa de la que su autor cree estar midiendo.
    let leyo: unknown = "no lanzó";
    try {
      leyo = readAssistantConfig({
        ASSISTANT_ENABLED: "true",
        ASSISTANT_PROVIDER: "openai",
        ASSISTANT_MODEL: "m",
        OPENAI_API_KEY: "k",
        ASSISTANT_REASONING_EFFORT: "bajísimo",
      });
    } catch {
      leyo = "lanzó";
    }
    expect(leyo).toBe("lanzó");
  });

  test("ausente y vacío significan «que decida el proveedor»", () => {
    const base = {
      ASSISTANT_ENABLED: "true",
      ASSISTANT_PROVIDER: "openai",
      ASSISTANT_MODEL: "m",
      OPENAI_API_KEY: "k",
    };
    const sinVariable = readAssistantConfig(base);
    const vacia = readAssistantConfig({ ...base, ASSISTANT_REASONING_EFFORT: "  " });
    expect(sinVariable.enabled && sinVariable.reasoningEffort).toBeNull();
    expect(vacia.enabled && vacia.reasoningEffort).toBeNull();
  });

  test("se normaliza mayúsculas y espacios", () => {
    const config = readAssistantConfig({
      ASSISTANT_ENABLED: "true",
      ASSISTANT_PROVIDER: "openai",
      ASSISTANT_MODEL: "m",
      OPENAI_API_KEY: "k",
      ASSISTANT_REASONING_EFFORT: " LOW ",
    });
    expect(config.enabled && config.reasoningEffort).toBe("low");
  });
});

// ── Errores, en los dos ────────────────────────────────────────────────────────

test.describe("los fallos del proveedor no filtran nada", () => {
  const adaptadores = [
    { nombre: "anthropic", crear: (t: HttpTransport) => new AnthropicProvider({ apiKey: CLAVE, model: "m", transport: t }) },
    { nombre: "openai", crear: (t: HttpTransport) => new OpenAiProvider({ apiKey: CLAVE, model: "m", transport: t }) },
  ];

  for (const { nombre, crear } of adaptadores) {
    for (const status of [401, 403, 429, 500, 503]) {
      test(`${nombre}: HTTP ${status} termina en provider_error sin secretos`, async () => {
        const transport: HttpTransport = async () =>
          new Response(
            // Un cuerpo de error que repite la petición entera, incluida la
            // credencial. Es el caso que hay que no filtrar.
            JSON.stringify({ error: { message: `falló con la clave ${CLAVE}`, request: "..." } }),
            { status }
          );
        const p = crear(transport);

        const err = await p.complete(peticion()).catch((e) => e);
        expect(err).toBeInstanceOf(AssistantError);
        expect((err as AssistantError).code).toBe("provider_error");

        const texto = `${(err as AssistantError).message} ${(err as AssistantError).detail}`;
        expect(texto).not.toContain(CLAVE);
        expect(texto).not.toContain("Bearer");
        expect(texto).not.toContain("x-api-key");
        expect(texto).not.toContain("Sos el asistente");
        expect(texto).toContain(String(status));
      });
    }

    test(`${nombre}: JSON malformado termina en provider_error`, async () => {
      const transport: HttpTransport = async () =>
        new Response("no soy json", { status: 200, headers: { "content-type": "application/json" } });
      const err = await crear(transport).complete(peticion()).catch((e) => e);
      expect((err as AssistantError).code).toBe("provider_error");
      expect((err as AssistantError).detail).toMatch(/ilegible/);
    });

    test(`${nombre}: una respuesta sin la forma esperada no se da por buena`, async () => {
      const transport: HttpTransport = async () =>
        new Response(JSON.stringify({ algo: "otra cosa" }), { status: 200 });
      const err = await crear(transport).complete(peticion()).catch((e) => e);
      expect((err as AssistantError).code).toBe("provider_error");
    });

    test(`${nombre}: la cancelación del turno se distingue de un fallo`, async () => {
      const controller = new AbortController();
      controller.abort();
      const transport: HttpTransport = async () => {
        const e = new Error("aborted");
        e.name = "AbortError";
        throw e;
      };
      const err = await crear(transport)
        .complete(peticion({ signal: controller.signal }))
        .catch((e) => e);
      expect((err as AssistantError).code).toBe("timeout");
    });

    test(`${nombre}: un fallo de red no propaga el mensaje original`, async () => {
      const transport: HttpTransport = async () => {
        throw new Error(`getaddrinfo ENOTFOUND api.interna.ruta34 con clave ${CLAVE}`);
      };
      const err = await crear(transport).complete(peticion()).catch((e) => e);
      expect((err as AssistantError).code).toBe("provider_error");
      expect(`${(err as AssistantError).detail}`).not.toContain(CLAVE);
      expect(`${(err as AssistantError).detail}`).not.toContain("api.interna");
    });
  }
});

// ── Configuración ─────────────────────────────────────────────────────────────

test.describe("configuración por entorno", () => {
  const base = {
    ASSISTANT_ENABLED: "true",
    ASSISTANT_PROVIDER: "anthropic",
    ASSISTANT_MODEL: "claude-haiku-4-5",
    ANTHROPIC_API_KEY: "k",
  };

  test("apagado por defecto", () => {
    expect(readAssistantConfig({}).enabled).toBe(false);
    expect(readAssistantConfig({ ASSISTANT_ENABLED: "" }).enabled).toBe(false);
    expect(readAssistantConfig({ ASSISTANT_ENABLED: "1" }).enabled).toBe(false);
    expect(readAssistantConfig({ ASSISTANT_ENABLED: "yes" }).enabled).toBe(false);
  });

  test("solo «true» lo enciende, con espacios y mayúsculas toleradas", () => {
    expect(readAssistantConfig({ ...base, ASSISTANT_ENABLED: " TRUE " }).enabled).toBe(true);
  });

  test("apagado no mira nada más: ni siquiera falla por falta de clave", () => {
    expect(readAssistantConfig({ ASSISTANT_ENABLED: "false", ASSISTANT_PROVIDER: "openai" })).toEqual({
      enabled: false,
    });
  });

  test("encendido sin proveedor, sin modelo o sin clave falla nombrando qué falta", () => {
    expect(() => readAssistantConfig({ ASSISTANT_ENABLED: "true" })).toThrow(/ASSISTANT_PROVIDER/);
    expect(() =>
      readAssistantConfig({ ASSISTANT_ENABLED: "true", ASSISTANT_PROVIDER: "openai" })
    ).toThrow(/ASSISTANT_MODEL/);
    expect(() =>
      readAssistantConfig({
        ASSISTANT_ENABLED: "true",
        ASSISTANT_PROVIDER: "openai",
        ASSISTANT_MODEL: "gpt-5.6-luna",
      })
    ).toThrow(/OPENAI_API_KEY/);
  });

  test("cada proveedor toma su propia variable de credencial", () => {
    expect(API_KEY_VAR).toEqual({ openai: "OPENAI_API_KEY", anthropic: "ANTHROPIC_API_KEY" });
    // La del otro proveedor no sirve.
    expect(() =>
      readAssistantConfig({
        ASSISTANT_ENABLED: "true",
        ASSISTANT_PROVIDER: "anthropic",
        ASSISTANT_MODEL: "m",
        OPENAI_API_KEY: "k",
      })
    ).toThrow(/ANTHROPIC_API_KEY/);
  });

  test("ningún error de configuración repite el valor de la credencial", () => {
    const secreto = "sk-secreto-que-no-debe-salir";
    const err = (() => {
      try {
        readAssistantConfig({
          ASSISTANT_ENABLED: "true",
          ASSISTANT_PROVIDER: "anthropic",
          ANTHROPIC_API_KEY: secreto,
        });
      } catch (e) {
        return e as AssistantError;
      }
    })();
    expect(err?.message).not.toContain(secreto);
  });

  test("ninguna variable del asistente puede llevar prefijo público", () => {
    // `NEXT_PUBLIC_` se inlinea en el bundle del navegador: una clave con ese
    // prefijo quedaría publicada en el código fuente de la página.
    for (const nombre of [
      "ASSISTANT_ENABLED",
      "ASSISTANT_PROVIDER",
      "ASSISTANT_MODEL",
      ...Object.values(API_KEY_VAR),
    ]) {
      expect(nombre.startsWith("NEXT_PUBLIC_"), nombre).toBe(false);
    }
  });
});
