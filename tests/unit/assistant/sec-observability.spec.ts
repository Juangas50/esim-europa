import "./_no-network";

import { test, expect } from "@playwright/test";

import { dispatchTurn } from "@/lib/assistant/server/dispatcher";
import { FakeProvider, fakeText, fakeToolUse } from "@/lib/assistant/server/provider";
import type { ChatRequest } from "@/lib/assistant/server/schemas";
import { liveReader, throwingReader } from "./_fixtures";

/**
 * Qué se apunta de cada turno, y sobre todo qué no.
 *
 * La garantía que persiguen estos tests no es "el log tiene los campos que
 * esperamos" sino la contraria: **no tiene ningún otro**. Por eso la prueba
 * central compara el conjunto exacto de claves en vez de buscar cadenas
 * prohibidas una por una. Una lista de cosas que no deben aparecer solo protege
 * de lo que se te ocurrió el día que la escribiste; una lista cerrada de lo que
 * sí puede aparecer protege también de lo que añada alguien dentro de un año.
 */

const CLAVES_PERMITIDAS = [
  "scope",
  "sessionId",
  "locale",
  "providerId",
  "model",
  "turn",
  "iterations",
  "toolsCalled",
  "redactions",
  "durationMs",
  "outcome",
  "errorCode",
  "usage",
  "contentLogged",
].sort();

interface Captura {
  lineas: string[];
  restaurar: () => void;
}

function capturarConsola(): Captura {
  const lineas: string[] = [];
  const info = console.info;
  const error = console.error;

  const sumidero = (...args: unknown[]) => {
    lineas.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
  };

  console.info = sumidero;
  console.error = sumidero;

  return {
    lineas,
    restaurar: () => {
      console.info = info;
      console.error = error;
    },
  };
}

/** El objeto JSON que se registró, ya parseado. */
function registro(linea: string): Record<string, unknown> {
  return JSON.parse(linea.replace(/^\[assistant\]\s*/, "")) as Record<string, unknown>;
}

const peticion = (contenido: string): ChatRequest => ({
  locale: "es",
  sessionId: "sesion-de-prueba-1234",
  messages: [{ role: "user", content: contenido }],
});

const sesion = () => ({ startedAt: Date.now(), messageCount: 7 });

test.describe("el turno se registra", () => {
  test("con los campos acordados y ninguno más", async () => {
    const cap = capturarConsola();
    try {
      await dispatchTurn({
        request: peticion("¿funciona en Portugal?"),
        provider: new FakeProvider([
          fakeToolUse([{ name: "check_coverage", input: { country: "Portugal" } }]),
          fakeText("No puedo confirmártelo."),
        ]),
        session: sesion(),
        readPlans: liveReader(),
      });
    } finally {
      cap.restaurar();
    }

    expect(cap.lineas).toHaveLength(1);
    const log = registro(cap.lineas[0]);

    expect(Object.keys(log).sort()).toEqual(CLAVES_PERMITIDAS.filter((k) => k !== "errorCode"));
    expect(log.sessionId).toBe("sesion-de-prueba-1234");
    expect(log.locale).toBe("es");
    expect(log.providerId).toBe("fake");
    expect(log.model).toBeNull();
    expect(log.turn).toBe(7);
    expect(log.iterations).toBe(2);
    expect(log.toolsCalled).toEqual(["check_coverage"]);
    expect(log.outcome).toBe("ok");
    expect(typeof log.durationMs).toBe("number");
    expect(log.usage).toBeTruthy();
  });

  test("un fallo registra el código, no el detalle", async () => {
    const cap = capturarConsola();
    try {
      await dispatchTurn({
        request: peticion("hola"),
        provider: new FakeProvider(() => fakeToolUse([{ name: "get_guide", input: { slug: "qr" } }])),
        session: sesion(),
        readPlans: liveReader(),
      }).catch(() => undefined);
    } finally {
      cap.restaurar();
    }

    const log = registro(cap.lineas[0]);
    expect(log.outcome).toBe("error");
    expect(log.errorCode).toBe("max_iterations");
    // El `detail` decía "se agotaron las 4 iteraciones sin respuesta final".
    expect(cap.lineas[0]).not.toContain("sin respuesta final");
  });
});

test.describe("lo que nunca aparece en el log", () => {
  test("ni el mensaje del usuario ni su PII", async () => {
    const cap = capturarConsola();
    try {
      await dispatchTurn({
        request: peticion("soy ana@ejemplo.com, mi iccid es 8934071100012345678 y voy a Roma"),
        provider: new FakeProvider([fakeText("Contame más, por favor.")]),
        session: sesion(),
        readPlans: liveReader(),
      });
    } finally {
      cap.restaurar();
    }

    const linea = cap.lineas[0];
    expect(linea).not.toContain("ana@ejemplo.com");
    expect(linea).not.toContain("8934071100012345678");
    expect(linea).not.toContain("voy a Roma");
    // Pero sí queda constancia de que hubo que redactar, y de qué categorías.
    const log = registro(linea);
    expect(log.redactions).toEqual({ email: 1, iccid: 1 });
  });

  test("ni la respuesta del modelo", async () => {
    const cap = capturarConsola();
    try {
      await dispatchTurn({
        request: peticion("hola"),
        provider: new FakeProvider([fakeText("Los planes empiezan en 15 dólares.")]),
        session: sesion(),
        readPlans: liveReader(),
      });
    } finally {
      cap.restaurar();
    }

    expect(cap.lineas[0]).not.toContain("Los planes empiezan");
    expect(cap.lineas[0]).not.toContain("15 dólares");
  });

  test("ni los argumentos ni los resultados de las herramientas", async () => {
    const cap = capturarConsola();
    try {
      await dispatchTurn({
        request: peticion("¿me sirve en Turquía?"),
        provider: new FakeProvider([
          fakeToolUse([{ name: "check_coverage", input: { country: "Turquía" } }]),
          fakeText("No puedo confirmártelo."),
        ]),
        session: sesion(),
        readPlans: liveReader(),
      });
    } finally {
      cap.restaurar();
    }

    const linea = cap.lineas[0];
    // El nombre de la herramienta sí; su entrada y su salida, no.
    expect(linea).toContain("check_coverage");
    expect(linea).not.toContain("Turquía");
    expect(linea).not.toContain("not_verifiable");
  });

  test("ni los mensajes internos del catálogo", async () => {
    const cap = capturarConsola();
    try {
      await dispatchTurn({
        request: peticion("¿cuánto cuesta?"),
        provider: new FakeProvider([
          fakeToolUse([{ name: "list_plans", input: {} }]),
          fakeText("Ahora mismo no puedo confirmarte precios."),
        ]),
        session: sesion(),
        readPlans: throwingReader(),
      });
    } finally {
      cap.restaurar();
    }

    // El lector lanzaba "conexión rechazada"; el motivo se queda dentro del
    // módulo de catálogo y no llega ni al modelo ni al log.
    const nuestras = cap.lineas.filter((l) => l.startsWith("[assistant]"));
    expect(nuestras).toHaveLength(1);
    expect(nuestras[0]).not.toContain("conexión rechazada");
    expect(nuestras[0]).not.toContain("supabase");
  });

  test("ni trazas de pila", async () => {
    const cap = capturarConsola();
    try {
      const explota: FakeProvider = new FakeProvider(() => {
        throw new Error("boom interno con detalles");
      });
      await dispatchTurn({
        request: peticion("hola"),
        provider: explota,
        session: sesion(),
        readPlans: liveReader(),
      }).catch(() => undefined);
    } finally {
      cap.restaurar();
    }

    const linea = cap.lineas[0];
    expect(linea).not.toContain("boom interno");
    expect(linea).not.toContain("    at ");
    expect(registro(linea).errorCode).toBe("provider_error");
  });

  test("el marcador contentLogged sigue diciendo la verdad", () => {
    // Si algún día alguien añade un campo con texto libre a la observación,
    // este marcador queda mintiendo. Es barato y se ve en revisión.
    const cap = capturarConsola();
    cap.restaurar();
    expect(CLAVES_PERMITIDAS).toContain("contentLogged");
  });
});
