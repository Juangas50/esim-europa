import "./_no-network";

import { test, expect } from "@playwright/test";

import { dispatchTurn, contextTokens } from "@/lib/assistant/server/dispatcher";
import { LIMITS } from "@/lib/assistant/server/limits";
import { AssistantError } from "@/lib/assistant/server/errors";
import { FakeProvider, fakeText, fakeToolUse, fakeMaxTokens } from "@/lib/assistant/server/provider";
import type { LlmProvider, LlmRequest, LlmResponse } from "@/lib/assistant/server/provider";
import type { ChatRequest } from "@/lib/assistant/server/schemas";
import { TOOL_FLAGS } from "@/lib/assistant/server/tools";
import { CHAIN, liveReader, fallbackReader, manyPlans } from "./_fixtures";

/**
 * El bucle, empujado contra cada uno de sus topes.
 *
 * Todo lo de aquí se apoya en el proveedor de mentira, y esa es la razón de que
 * exista: un modelo real no se deja guionizar para pedir cuatro herramientas
 * seguidas ni para quedarse colgado, que es justo lo que hay que provocar para
 * saber que los límites funcionan.
 */

const ctx = (messages: ChatRequest["messages"]): ChatRequest => ({
  locale: "es",
  sessionId: "sesion-de-prueba-1234",
  messages,
});

const sesionNueva = () => ({ startedAt: Date.now(), messageCount: 1 });

function correr(provider: LlmProvider, mensaje = "hola", extra: Partial<Parameters<typeof dispatchTurn>[0]> = {}) {
  return dispatchTurn({
    request: ctx([{ role: "user", content: mensaje }]),
    provider,
    session: sesionNueva(),
    readPlans: liveReader(),
    ...extra,
  });
}

test.describe("camino feliz", () => {
  test("devuelve el texto del modelo", async () => {
    const out = await correr(new FakeProvider([fakeText("Hola, ¿en qué te ayudo?")]));
    expect(out.text).toBe("Hola, ¿en qué te ayudo?");
    expect(out.iterations).toBe(1);
    expect(out.toolsCalled).toEqual([]);
  });

  test("ejecuta una herramienta y vuelve al modelo con el resultado", async () => {
    const provider = new FakeProvider([
      fakeToolUse([{ name: "check_coverage", input: { country: "España" } }]),
      fakeText("Sí, España está cubierta."),
    ]);

    const out = await correr(provider, "¿funciona en España?");

    expect(out.toolsCalled).toEqual(["check_coverage"]);
    expect(out.iterations).toBe(2);

    // La segunda llamada al modelo lleva el resultado de la herramienta.
    const segunda = provider.calls[1];
    const bloques = segunda.messages.flatMap((m) => m.content);
    const resultado = bloques.find((b) => b.type === "tool_result");
    expect(resultado).toBeTruthy();
    expect(JSON.stringify(resultado)).toContain("covered_by_all_plans");
  });

  test("las tres herramientas de un turno se ejecutan", async () => {
    const provider = new FakeProvider([
      fakeToolUse([
        { name: "check_coverage", input: { country: "España" } },
        { name: "check_device_compatibility", input: { device: "iphone 15" } },
        { name: "get_guide", input: { slug: "qr" } },
      ]),
      fakeText("Listo."),
    ]);

    const out = await correr(provider);
    expect(out.toolsCalled).toHaveLength(3);
  });
});

test.describe("topes del bucle", () => {
  test("corta a la cuarta herramienta de un mismo turno", async () => {
    const provider = new FakeProvider([
      fakeToolUse([
        { name: "check_coverage", input: { country: "España" } },
        { name: "check_coverage", input: { country: "Francia" } },
        { name: "check_coverage", input: { country: "Italia" } },
        { name: "check_coverage", input: { country: "Portugal" } },
      ]),
    ]);

    await expect(correr(provider)).rejects.toThrow(/too_many_tool_calls/);
  });

  test("corta a las cuatro iteraciones", async () => {
    // Un modelo que pide herramientas eternamente. Sin este tope, una sola
    // conversación puede gastar lo que quiera.
    const provider = new FakeProvider(() =>
      fakeToolUse([{ name: "get_guide", input: { slug: "qr" } }])
    );

    await expect(correr(provider)).rejects.toThrow(/max_iterations/);
    expect(provider.calls).toHaveLength(LIMITS.MAX_ITERATIONS);
  });

  test("corta por tiempo y aborta la petición en curso", async () => {
    let abortada = false;

    const colgado: LlmProvider = {
      id: "colgado",
      complete(req: LlmRequest): Promise<LlmResponse> {
        return new Promise((_, reject) => {
          req.signal?.addEventListener("abort", () => {
            abortada = true;
            reject(new Error("abortada"));
          });
        });
      },
    };

    await expect(correr(colgado, "hola", { timeoutMs: 50 })).rejects.toThrow(/timeout/);
    // Ganar la carrera no basta: la petición de fondo sigue costando dinero si
    // nadie la corta.
    expect(abortada).toBe(true);
  });

  test("el tope de tiempo por defecto es el aprobado", async () => {
    // El parámetro existe para los tests; el valor de producción es este.
    expect(LIMITS.TURN_TIMEOUT_MS).toBe(25_000);
  });

  test("el tope de tokens de salida se le pasa al proveedor", async () => {
    const provider = new FakeProvider([fakeText("ok")]);
    await correr(provider);
    expect(provider.calls[0].maxOutputTokens).toBe(LIMITS.MAX_OUTPUT_TOKENS);
  });

  test("una respuesta truncada se marca, no se pierde", async () => {
    const out = await correr(new FakeProvider([fakeMaxTokens("El plan incluye")]));
    expect(out.truncated).toBe(true);
    expect(out.text).toBe("El plan incluye");
  });
});

test.describe("errores de herramienta", () => {
  test("una herramienta desconocida es recuperable: el modelo puede corregir", async () => {
    const provider = new FakeProvider([
      fakeToolUse([{ name: "borrar_pedidos", input: {} }]),
      fakeText("Perdón, me equivoqué de herramienta."),
    ]);

    const out = await correr(provider);
    expect(out.text).toContain("me equivoqué");

    const resultado = provider.calls[1].messages
      .flatMap((m) => m.content)
      .find((b) => b.type === "tool_result");
    expect(resultado && "isError" in resultado && resultado.isError).toBe(true);
  });

  test("unos argumentos inválidos también son recuperables", async () => {
    const provider = new FakeProvider([
      fakeToolUse([{ name: "get_guide", input: { slug: "inventada" } }]),
      fakeText("Te paso la guía correcta."),
    ]);
    const out = await correr(provider);
    expect(out.toolsCalled).toEqual(["get_guide"]);
    expect(out.text).toContain("guía correcta");
  });

  test("el error que se le devuelve al modelo no lleva detalle técnico", async () => {
    const provider = new FakeProvider([
      fakeToolUse([{ name: "get_guide", input: { slug: "inventada" } }]),
      fakeText("ok"),
    ]);
    await correr(provider);

    const resultado = provider.calls[1].messages
      .flatMap((m) => m.content)
      .find((b) => b.type === "tool_result");
    const contenido = resultado && "content" in resultado ? resultado.content : "";
    // Un mensaje de esquema repetido al usuario es una fuga de implementación.
    expect(contenido).not.toContain("invalid_enum");
    expect(contenido).not.toContain("slug");
    expect(contenido).toContain("invalid_tool_input");
  });

  test("una herramienta apagada se comporta como inexistente", async () => {
    TOOL_FLAGS.check_coverage = false;
    try {
      const provider = new FakeProvider([
        fakeToolUse([{ name: "check_coverage", input: { country: "España" } }]),
        fakeText("No puedo confirmarlo."),
      ]);
      const out = await correr(provider);
      expect(out.text).toContain("No puedo confirmarlo");
    } finally {
      TOOL_FLAGS.check_coverage = true;
    }
  });
});

test.describe("sanitización antes del modelo", () => {
  test("el mensaje del usuario llega saneado", async () => {
    const provider = new FakeProvider([fakeText("ok")]);
    await correr(provider, "mi iccid es 8934071100012345678 y mi mail ana@ejemplo.com");

    const enviado = JSON.stringify(provider.calls[0].messages);
    expect(enviado).not.toContain("8934071100012345678");
    expect(enviado).not.toContain("ana@ejemplo.com");
  });

  test("el historial marcado como del asistente también se sanea", async () => {
    // Lo manda el navegador. Que diga "assistant" no lo hace nuestro.
    const provider = new FakeProvider([fakeText("ok")]);
    await dispatchTurn({
      request: ctx([
        { role: "user", content: "hola" },
        { role: "assistant", content: "tu iccid es 8934071100012345678" },
        { role: "user", content: "¿y entonces?" },
      ]),
      provider,
      session: sesionNueva(),
      readPlans: liveReader(),
    });

    expect(JSON.stringify(provider.calls[0].messages)).not.toContain("8934071100012345678");
  });

  test("informa de las categorías redactadas, sin el contenido", async () => {
    const out = await correr(new FakeProvider([fakeText("ok")]), "mi imei es 356938035643809");
    expect(out.redactions.imei).toBe(1);
    expect(JSON.stringify(out.redactions)).not.toContain("356938035643809");
  });
});

test.describe("el catálogo degradado no filtra precios al contexto", () => {
  test("ni un solo número del catálogo llega al modelo", async () => {
    const provider = new FakeProvider([
      fakeToolUse([{ name: "list_plans", input: {} }]),
      fakeText("Ahora mismo no puedo confirmarte precios."),
    ]);

    await dispatchTurn({
      request: ctx([{ role: "user", content: "¿cuánto cuesta?" }]),
      provider,
      session: sesionNueva(),
      readPlans: fallbackReader(),
    });

    const contexto = JSON.stringify(provider.calls[1]);
    for (const p of CHAIN) {
      expect(contexto, `se filtró el precio de ${p.name}`).not.toContain(`"priceUsd":${p.price_usd}`);
      expect(contexto, `se filtró el nombre ${p.name}`).not.toContain(p.name);
    }
  });

  test("con catálogo vivo sí llegan, que es lo que debe pasar", async () => {
    const provider = new FakeProvider([
      fakeToolUse([{ name: "list_plans", input: {} }]),
      fakeText("Estos son los planes."),
    ]);

    await correr(provider, "¿cuánto cuesta?");

    const contexto = JSON.stringify(provider.calls[1]);
    expect(contexto).toContain(CHAIN[0].name);
    expect(contexto).toContain("totalGb");
    // Y con los nombres del DTO, no con los ambiguos del modelo de datos.
    expect(contexto).not.toContain("eu_data_gb");
  });
});

test.describe("presupuesto de contexto durante todo el turno", () => {
  /** Historial largo, para que el recorte tenga de dónde quitar. */
  const historialLargo = (): ChatRequest["messages"] =>
    Array.from({ length: 23 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `mensaje ${i} ` + "x".repeat(980),
    })).concat([{ role: "user" as const, content: "y entonces, ¿qué planes hay?" }]);

  /** Dos vueltas pidiendo tres herramientas, y a la tercera responde. */
  const tresPorVuelta = () =>
    new FakeProvider((_req, i) =>
      i < 2
        ? fakeToolUse([
            { name: "list_plans", input: {}, id: `a${i}` },
            { name: "list_plans", input: {}, id: `b${i}` },
            { name: "list_plans", input: {}, id: `c${i}` },
          ])
        : fakeText("Estos son los planes.")
    );

  test("ninguna llamada al proveedor supera el presupuesto", async () => {
    // Tres list_plans por iteración: cada vuelta añade miles de tokens de
    // resultados encima de un historial que ya venía lleno.
    const provider = tresPorVuelta();

    await dispatchTurn({
      request: ctx(historialLargo()),
      provider,
      session: sesionNueva(),
      readPlans: liveReader(manyPlans(15)),
    });

    expect(provider.calls.length).toBeGreaterThan(1);

    for (const [i, call] of provider.calls.entries()) {
      const tokens = contextTokens(call.system, call.messages, JSON.stringify(call.tools));
      expect(
        tokens,
        `la llamada ${i + 1} envió ${tokens} tokens, presupuesto ${LIMITS.MAX_CONTEXT_TOKENS}`
      ).toBeLessThanOrEqual(LIMITS.MAX_CONTEXT_TOKENS);
    }
  });

  test("para caber, recorta el historial viejo y no los resultados del turno", async () => {
    const provider = tresPorVuelta();

    await dispatchTurn({
      request: ctx(historialLargo()),
      provider,
      session: sesionNueva(),
      readPlans: liveReader(manyPlans(15)),
    });

    const ultima = provider.calls[provider.calls.length - 1];
    const texto = JSON.stringify(ultima.messages);

    // El mensaje más viejo se ha ido...
    expect(texto).not.toContain("mensaje 0 ");
    // ...la pregunta que hay que responder sigue...
    expect(texto).toContain("y entonces, ¿qué planes hay?");
    // ...y los resultados de las herramientas están enteros, no recortados.
    const resultados = ultima.messages
      .flatMap((m) => m.content)
      .filter((b) => b.type === "tool_result");
    expect(resultados.length).toBeGreaterThan(0);
    for (const r of resultados) {
      if (r.type !== "tool_result") continue;
      expect(() => JSON.parse(r.content)).not.toThrow();
    }
  });

  test("si el resultado de una tool no cabe, falla en vez de mutilarlo", async () => {
    // 400 planes son más tokens que todo el presupuesto. No hay recorte del
    // historial que lo arregle, y truncar el resultado cambiaría los datos.
    const provider = new FakeProvider([
      fakeToolUse([{ name: "list_plans", input: {} }]),
      fakeText("no debería llegar aquí"),
    ]);

    await expect(
      dispatchTurn({
        request: ctx([{ role: "user", content: "¿qué planes hay?" }]),
        provider,
        session: sesionNueva(),
        readPlans: liveReader(manyPlans(400)),
      })
    ).rejects.toThrow(/limit_exceeded/);

    // Lo que importa: se cortó ANTES de mandar el contexto sobredimensionado.
    expect(provider.calls).toHaveLength(1);
  });
});

test.describe("contexto enviado", () => {
  test("el system prompt va aparte, no como un mensaje más", async () => {
    const provider = new FakeProvider([fakeText("ok")]);
    await correr(provider);
    expect(provider.calls[0].system.length).toBeGreaterThan(500);
    expect(provider.calls[0].messages.every((m) => m.role !== "assistant" || true)).toBe(true);
    // Ningún mensaje con rol "system": esa distinción la hace cada adaptador.
    expect(provider.calls[0].messages.map((m) => m.role)).not.toContain("system");
  });

  test("se anuncian las seis herramientas", async () => {
    const provider = new FakeProvider([fakeText("ok")]);
    await correr(provider);
    expect(provider.calls[0].tools).toHaveLength(6);
  });

  test("los límites de sesión se aplican antes de llamar al modelo", async () => {
    const provider = new FakeProvider([fakeText("ok")]);
    await expect(
      dispatchTurn({
        request: ctx([{ role: "user", content: "hola" }]),
        provider,
        session: { startedAt: Date.now(), messageCount: LIMITS.MAX_MESSAGES_PER_SESSION },
        readPlans: liveReader(),
      })
    ).rejects.toThrow(/limit_exceeded/);

    // Lo que importa: no se gastó una llamada al modelo.
    expect(provider.calls).toHaveLength(0);
  });

  test("un fallo del bucle es un AssistantError con código", async () => {
    try {
      await correr(new FakeProvider(() => fakeToolUse([{ name: "get_guide", input: { slug: "qr" } }])));
      throw new Error("debería haber lanzado");
    } catch (err) {
      expect(err).toBeInstanceOf(AssistantError);
      expect((err as AssistantError).code).toBe("max_iterations");
    }
  });
});
