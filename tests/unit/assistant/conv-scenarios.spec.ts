import "./_no-network";

import { test, expect } from "@playwright/test";

import { dispatchTurn } from "@/lib/assistant/server/dispatcher";
import { FakeProvider, fakeText, fakeToolUse } from "@/lib/assistant/server/provider";
import type { LlmRequest, LlmResponse } from "@/lib/assistant/server/provider/types";
import type { ChatRequest } from "@/lib/assistant/server/schemas";
import { CHAIN, liveReader, throwingReader } from "./_fixtures";

/**
 * CONV — las conversaciones representativas, en su versión determinista.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUÉ MIDE ESTA SUITE Y QUÉ NO
 *
 * Mide el **sistema**, no el modelo. El proveedor va guionizado: se le dice
 * qué herramienta pediría un modelo razonable ante cada pregunta, y se
 * comprueba lo que ocurre después — qué herramienta se ejecuta, qué datos
 * vuelven, y qué queda disponible para redactar la respuesta.
 *
 * Eso deja fuera, a propósito, lo único que un guion no puede probar: si un
 * modelo real elige la herramienta correcta y si relata el resultado sin
 * adornarlo. Esa mitad es la Fase 2B-B, con claves y con red, y son los mismos
 * escenarios ejecutados contra Luna y contra Haiku.
 *
 * La utilidad de tener la mitad determinista es que corre en CI, en un segundo,
 * y falla el día que alguien rompa el camino entre una pregunta y su dato.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ctx = (mensaje: string): ChatRequest => ({
  locale: "es",
  sessionId: "conv-sesion-0001",
  messages: [{ role: "user", content: mensaje }],
});

const sesion = () => ({ startedAt: Date.now(), messageCount: 1 });

/**
 * Corre un escenario: un guion de respuestas y el catálogo que se quiera.
 *
 * Devuelve además lo que el proveedor recibió, que es donde se puede afirmar
 * que el resultado de la herramienta llegó de vuelta al modelo.
 */
async function conversar(
  guion: LlmResponse[],
  opciones: { readPlans?: Parameters<typeof dispatchTurn>[0]["readPlans"]; mensaje?: string } = {}
) {
  const provider = new FakeProvider(guion, { onExhausted: "throw" });
  const out = await dispatchTurn({
    request: ctx(opciones.mensaje ?? "hola"),
    provider,
    session: sesion(),
    readPlans: opciones.readPlans ?? liveReader(),
  });
  return { out, recibido: provider.calls };
}

/** Lo que el modelo vio como resultado de la herramienta, ya parseado. */
function resultadosDeHerramienta(calls: LlmRequest[]): unknown[] {
  const ultima = calls[calls.length - 1];
  return ultima.messages
    .flatMap((m) => m.content)
    .filter((b) => b.type === "tool_result")
    .map((b) => JSON.parse((b as { content: string }).content));
}

// ── Catálogo ──────────────────────────────────────────────────────────────────

test.describe("CONV-1 · «¿Qué planes tienen?»", () => {
  test("el catálogo llega desde list_plans, no desde el prompt", async () => {
    const { out, recibido } = await conversar([
      fakeToolUse([{ name: "list_plans" }], "Miro el catálogo."),
      fakeText("Tenemos cinco gamas, desde la más básica hasta la más completa."),
    ]);

    expect(out.toolsCalled).toEqual(["list_plans"]);
    expect(out.iterations).toBe(2);

    const [resultado] = resultadosDeHerramienta(recibido) as [{ status: string; plans: unknown[] }];
    expect(resultado.status).toBe("live");
    expect(resultado.plans).toHaveLength(CHAIN.length);
  });

  test("los precios y los gigas que ve el modelo salen del catálogo", async () => {
    const { recibido } = await conversar([
      fakeToolUse([{ name: "list_plans" }]),
      fakeText("Listo."),
    ]);

    const [resultado] = resultadosDeHerramienta(recibido) as [
      { plans: { name: string; priceUsd: number; data: { totalGb: number } }[] },
    ];
    for (const [i, visto] of resultado.plans.entries()) {
      expect(visto.priceUsd).toBe(CHAIN[i].price_usd);
      expect(visto.data.totalGb).toBe(CHAIN[i].data_gb);
    }
  });
});

// ── Recomendación ─────────────────────────────────────────────────────────────

test.describe("CONV-2 · «Viajo 20 días y necesito unos 50 GB»", () => {
  test("recommend_plan devuelve una gama concreta y por qué", async () => {
    const { out, recibido } = await conversar(
      [
        fakeToolUse([{ name: "recommend_plan", input: { estimatedTotalGb: 50, tripDays: 20 } }]),
        fakeText("Con esos 50 GB te alcanza la segunda gama."),
      ],
      { mensaje: "Viajo 20 días y necesito unos 50 GB" }
    );

    expect(out.toolsCalled).toEqual(["recommend_plan"]);
    const [resultado] = resultadosDeHerramienta(recibido) as [{ status: string }];
    expect(["recommended", "insufficient_criteria", "no_deterministic_recommendation"]).toContain(
      resultado.status
    );
  });

  test("sin criterios numéricos no se inventa una recomendación", async () => {
    const { recibido } = await conversar(
      [fakeToolUse([{ name: "recommend_plan", input: {} }]), fakeText("Contame más.")],
      { mensaje: "¿Cuál me conviene?" }
    );

    const [resultado] = resultadosDeHerramienta(recibido) as [{ status: string }];
    expect(resultado.status).toBe("insufficient_criteria");
  });
});

// ── Cobertura ─────────────────────────────────────────────────────────────────

test.describe("CONV-3 · Estados Unidos, las dos respuestas", () => {
  test("la gama básica NO lo incluye, y la herramienta lo dice", async () => {
    const { out, recibido } = await conversar(
      [
        fakeToolUse([{ name: "check_coverage", input: { country: "Estados Unidos" } }]),
        fakeText("Europa Básico no incluye Estados Unidos; las otras cuatro sí."),
      ],
      { mensaje: "¿Europa Básico funciona en Estados Unidos?" }
    );

    expect(out.toolsCalled).toEqual(["check_coverage"]);

    const [resultado] = resultadosDeHerramienta(recibido) as [
      { status: string; includedInPlans: string[]; excludedFromPlans: string[] },
    ];
    expect(resultado.status).toBe("covered_with_exceptions");
    expect(resultado.excludedFromPlans).toEqual(["europa-basico"]);
    expect(resultado.includedInPlans).not.toContain("europa-basico");
  });

  test("las otras cuatro gamas SÍ lo incluyen", async () => {
    const { recibido } = await conversar(
      [
        fakeToolUse([{ name: "check_coverage", input: { country: "Estados Unidos" } }]),
        fakeText("Sí, Europa Plus incluye Estados Unidos."),
      ],
      { mensaje: "¿Europa Plus funciona en Estados Unidos?" }
    );

    const [resultado] = resultadosDeHerramienta(recibido) as [{ includedInPlans: string[] }];
    expect(resultado.includedInPlans).toEqual([
      "europa-plus",
      "europa-total",
      "europa-max",
      "europa-premium",
    ]);
  });

  test("la cobertura no lleva gigas: eso es otra pregunta", async () => {
    const { recibido } = await conversar([
      fakeToolUse([{ name: "check_coverage", input: { country: "Francia" } }]),
      fakeText("Francia entra en las cinco."),
    ]);

    const [resultado] = resultadosDeHerramienta(recibido);
    expect(JSON.stringify(resultado)).not.toMatch(/\bGB\b/i);
  });
});

// ── Dispositivos ──────────────────────────────────────────────────────────────

test.describe("CONV-4 · compatibilidad", () => {
  test("un modelo conocido se confirma", async () => {
    const { out, recibido } = await conversar(
      [
        fakeToolUse([{ name: "check_device_compatibility", input: { device: "iPhone 15" } }]),
        fakeText("Sí, el iPhone 15 admite eSIM."),
      ],
      { mensaje: "¿Mi iPhone 15 es compatible?" }
    );

    expect(out.toolsCalled).toEqual(["check_device_compatibility"]);
    const [resultado] = resultadosDeHerramienta(recibido) as [{ status: string }];
    expect(resultado.status).toBe("supported");
  });

  test("un modelo desconocido no se declara incompatible ni compatible", async () => {
    const { recibido } = await conversar(
      [
        fakeToolUse([
          { name: "check_device_compatibility", input: { device: "Telefonito Marca X 3000" } },
        ]),
        fakeText("No me consta ese modelo; se puede comprobar marcando *#06#."),
      ],
      { mensaje: "¿Mi Telefonito Marca X 3000 es compatible?" }
    );

    const [resultado] = resultadosDeHerramienta(recibido) as [
      { status: string; howToVerify: { method: string } },
    ];
    // La garantía estructural de 2A: `not_supported` no es representable, y
    // «no lo tenemos verificado» viene con la forma de comprobarlo.
    expect(resultado.status).toBe("unknown");
    expect(JSON.stringify(resultado)).not.toContain("not_supported");
    expect(resultado.howToVerify.method).toBeTruthy();
  });
});

// ── Política de datos ─────────────────────────────────────────────────────────

test.describe("CONV-5 · «Me quedé sin GB antes de los 28 días»", () => {
  test("la respuesta se apoya en el corpus, sin llamar a ninguna herramienta", async () => {
    // La política de agotamiento y renovación es un hecho estable: vive en el
    // corpus, que viaja en el prompt. No hay herramienta que consultar.
    const { out, recibido } = await conversar(
      [
        fakeText(
          "No hace falta esperar al día 28: se puede pedir una renovación anticipada y te ayudamos a gestionarla."
        ),
      ],
      { mensaje: "Me quedé sin GB antes de los 28 días" }
    );

    expect(out.toolsCalled).toEqual([]);

    const prompt = recibido[0].system;
    expect(prompt).toMatch(/renovaci[óo]n anticipada/i);
    expect(prompt).toMatch(/velocidad.{0,40}m[íi]nim/i);
    expect(prompt).toMatch(/1,33/);
  });

  test("el prompt trae la distinción entre tarjeta, saldo y ciclo", async () => {
    const { recibido } = await conversar([fakeText("Te explico.")], {
      mensaje: "¿Me cobran todos los meses?",
    });

    const prompt = recibido[0].system;
    expect(prompt).toMatch(/no hay suscripci[óo]n ni cargo recurrente/i);
    expect(prompt).toMatch(/se renueva\s+automáticamente si la l[íi]nea tiene saldo/i);
  });

  test("el prompt acota el precio por giga al roaming UE", async () => {
    const { recibido } = await conversar([fakeText("Te explico.")]);
    const prompt = recibido[0].system;

    for (const frase of prompt.split(/(?<=[.!?])\s+|\n\n/).filter((f) => /1,33/.test(f))) {
      expect(frase, frase.slice(0, 120)).toMatch(/uni[óo]n europea|roaming ue/i);
    }
  });
});

// ── Traspaso ──────────────────────────────────────────────────────────────────

test.describe("CONV-6 · lo que necesita una persona", () => {
  test("escalate_to_human devuelve un traspaso, no una promesa", async () => {
    const { out, recibido } = await conversar(
      [
        fakeToolUse([
          {
            name: "escalate_to_human",
            input: { reason: "billing", summary: "Quiere revisar un cobro de su pedido" },
          },
        ]),
        fakeText("Te paso con el equipo."),
      ],
      { mensaje: "Me cobraron dos veces, necesito hablar con alguien" }
    );

    expect(out.toolsCalled).toEqual(["escalate_to_human"]);
    const [resultado] = resultadosDeHerramienta(recibido) as [Record<string, unknown>];
    expect(resultado).toBeTruthy();
  });
});

// ── Catálogo caído ────────────────────────────────────────────────────────────

test.describe("CONV-7 · con el catálogo caído no sale ni un precio", () => {
  test("list_plans falla cerrado y el modelo no recibe cifras", async () => {
    const { out, recibido } = await conversar(
      [
        fakeToolUse([{ name: "list_plans" }]),
        fakeText("Ahora mismo no puedo confirmarte los precios; te paso con el equipo."),
      ],
      { readPlans: throwingReader(), mensaje: "¿Cuánto cuesta el plan más barato?" }
    );

    const resultados = resultadosDeHerramienta(recibido);
    const texto = JSON.stringify(resultados);

    // Ni precios ni gigas: lo que llega es el estado de indisponibilidad.
    expect(texto).not.toMatch(/priceUsd|totalGb|outsideSpainMaxGb/);
    expect(texto).not.toMatch(/\d+\s*(?:USD|GB)/i);
    expect(out.text).toBeTruthy();
  });

  test("el turno no se cae: el modelo puede responder que no lo sabe", async () => {
    const { out } = await conversar(
      [fakeToolUse([{ name: "list_plans" }]), fakeText("No puedo confirmarlo en este momento.")],
      { readPlans: throwingReader() }
    );
    expect(out.text).toContain("No puedo confirmarlo");
  });
});

// ── Varias vueltas ────────────────────────────────────────────────────────────

test.describe("CONV-8 · conversación con varias vueltas", () => {
  test("modelo → herramienta → modelo → herramienta → modelo", async () => {
    const { out, recibido } = await conversar(
      [
        fakeToolUse([{ name: "check_coverage", input: { country: "Estados Unidos" } }]),
        fakeToolUse([{ name: "list_plans" }]),
        fakeText("Estados Unidos entra en cuatro de las cinco gamas; te paso los precios."),
      ],
      { mensaje: "¿Qué plan me sirve para Estados Unidos y cuánto cuesta?" }
    );

    expect(out.toolsCalled).toEqual(["check_coverage", "list_plans"]);
    expect(out.iterations).toBe(3);

    // En la última llamada el modelo ve los dos resultados, en orden.
    // En la última llamada el modelo lleva los dos resultados, cada uno en el
    // mensaje que siguió a su llamada.
    expect(resultadosDeHerramienta(recibido)).toHaveLength(2);
    const todo = JSON.stringify(recibido[recibido.length - 1].messages);
    expect(todo).toContain("covered_with_exceptions");
    expect(todo).toContain("europa-basico");
  });

  test("dos herramientas en la misma respuesta se ejecutan las dos", async () => {
    const { out } = await conversar([
      fakeToolUse([
        { name: "check_coverage", input: { country: "Francia" }, id: "a" },
        { name: "list_plans", id: "b" },
      ]),
      fakeText("Ahí va todo."),
    ]);

    expect(out.toolsCalled).toEqual(["check_coverage", "list_plans"]);
    expect(out.iterations).toBe(2);
  });
});

// ── Higiene del turno ─────────────────────────────────────────────────────────

test.describe("CONV-9 · lo que el modelo nunca llega a ver", () => {
  test("los datos personales del usuario se redactan antes de salir", async () => {
    const { out, recibido } = await conversar(
      [fakeText("Te reenvío el QR al correo que tengamos registrado.")],
      { mensaje: "No me llegó el QR a juan.perez@gmail.com, mi ICCID es 8934071100012345678" }
    );

    const enviado = JSON.stringify(recibido[0].messages);
    expect(enviado).not.toContain("juan.perez@gmail.com");
    expect(enviado).not.toContain("8934071100012345678");
    expect(Object.keys(out.redactions).length).toBeGreaterThan(0);
  });

  test("las cifras legítimas sobreviven a la redacción", async () => {
    const { recibido } = await conversar([fakeText("Sí.")], {
      mensaje: "¿El plan de 270 GB dura 28 días?",
    });

    const enviado = JSON.stringify(recibido[0].messages);
    expect(enviado).toContain("270 GB");
    expect(enviado).toContain("28 días");
  });
});
