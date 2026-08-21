#!/usr/bin/env node
/**
 * assistant-benchmark.mjs — Fase 2B-B: los mismos escenarios, contra modelos
 * reales.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ESTE SCRIPT SÍ SALE A INTERNET Y SÍ GASTA DINERO
 *
 * Por eso vive aquí y no en `tests/`: la suite de CI corre con el candado de
 * red puesto y no puede tocar una clave real. Este se ejecuta a mano, con las
 * credenciales en el entorno del que lo lanza, y escribe un informe.
 *
 * No decide nada. Mide y tabula; la elección de proveedor la hace una persona
 * leyendo el informe, y ese es el motivo de que el script no imprima un
 * «ganador».
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Uso:
 *
 *   ASSISTANT_ENABLED=true \
 *   ASSISTANT_PROVIDER=openai ASSISTANT_MODEL=gpt-5.6-luna OPENAI_API_KEY=… \
 *   ASSISTANT_REASONING_EFFORT=low \
 *   node --experimental-strip-types scripts/assistant-benchmark.mjs
 *
 *   ASSISTANT_ENABLED=true \
 *   ASSISTANT_PROVIDER=anthropic ASSISTANT_MODEL=claude-haiku-4-5 ANTHROPIC_API_KEY=… \
 *   node --experimental-strip-types scripts/assistant-benchmark.mjs
 *
 * Cada ejecución añade su bloque a `docs/assistant/PROVIDER_REPORT.md`. Se
 * lanza una vez por modelo y luego se comparan los bloques.
 *
 * Opciones por entorno:
 *   BENCH_REPEATS=3     repeticiones por escenario (por defecto 1)
 *   BENCH_OUT=ruta.md   destino del informe
 *
 * `ASSISTANT_REASONING_EFFORT` solo afecta a OpenAI, y queda anotado en el
 * informe junto al modelo: dos ejecuciones con esfuerzos distintos no son
 * comparables entre sí, y sin registrarlo la comparativa no es reproducible.
 *
 * ⚠️ Los precios por millón de tokens se pasan por entorno y se registran con
 * su fecha. No se hardcodean: una tarifa escrita en el código envejece sin que
 * nadie se entere y contamina la comparación.
 *   BENCH_PRICE_IN=…  BENCH_PRICE_CACHED_IN=…  BENCH_PRICE_OUT=…
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// ── Escenarios ────────────────────────────────────────────────────────────────

/**
 * Los mismos casos que la suite determinista, en su versión abierta: aquí no
 * se guioniza nada, se le pregunta al modelo y se observa qué hace.
 *
 * `espera` describe lo que un turno correcto debería producir. No se usa para
 * puntuar automáticamente la naturalidad —eso lo lee una persona—, sino para
 * marcar en el informe los turnos que merecen revisión.
 */
const ESCENARIOS = [
  {
    id: "CONV-1",
    mensaje: "¿Qué planes tienen?",
    espera: { herramientas: ["list_plans"] },
  },
  {
    id: "CONV-2",
    mensaje: "Viajo 20 días y necesito unos 50 GB, ¿cuál me conviene?",
    espera: { herramientas: ["recommend_plan"] },
  },
  {
    id: "CONV-3a",
    mensaje: "¿El plan Europa Básico funciona en Estados Unidos?",
    espera: { herramientas: ["check_coverage"], contiene: [/no/i], noContiene: [] },
  },
  {
    id: "CONV-3b",
    mensaje: "¿Y el Europa Plus funciona en Estados Unidos?",
    espera: { herramientas: ["check_coverage"], contiene: [/s[ií]/i] },
  },
  {
    id: "CONV-4a",
    mensaje: "¿Mi iPhone 15 es compatible?",
    espera: { herramientas: ["check_device_compatibility"] },
  },
  {
    id: "CONV-4b",
    mensaje: "¿Y mi Telefonito Marca X 3000 es compatible?",
    espera: {
      herramientas: ["check_device_compatibility"],
      // Lo que NO puede decir: que es incompatible.
      noContiene: [/no es compatible/i, /no funciona/i, /incompatible/i],
    },
  },
  {
    id: "CONV-5",
    mensaje: "Me quedé sin GB antes de los 28 días, ¿qué hago?",
    espera: {
      contiene: [/renov/i],
      noContiene: [/sin cargos adicionales/i, /se corta/i, /se bloquea/i],
    },
  },
  {
    id: "CONV-6",
    mensaje: "Me cobraron dos veces el mismo pedido, necesito hablar con alguien",
    espera: { herramientas: ["escalate_to_human"] },
  },
  {
    id: "CONV-7",
    mensaje: "¿Cuánto cuesta el plan más barato?",
    catalogo: "caido",
    espera: {
      // Con el catálogo caído no puede salir ni una cifra de precio.
      noContiene: [/US\$\s?\d/, /\d+\s*d[óo]lares/i],
    },
  },
];

// ── Utilidades ────────────────────────────────────────────────────────────────

const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

function percentil(valores, p) {
  if (valores.length === 0) return 0;
  const orden = [...valores].sort((a, b) => a - b);
  return orden[Math.min(orden.length - 1, Math.floor((p / 100) * orden.length))];
}

/** Coste del turno con los precios que se hayan pasado, o `null` si no hay. */
function coste(usage, precios) {
  if (!precios) return null;
  const cacheadas = usage.cachedInputTokens ?? 0;
  const frescas = Math.max(0, usage.inputTokens - cacheadas);
  return (
    (frescas * precios.entrada + cacheadas * precios.cacheada + usage.outputTokens * precios.salida) /
    1_000_000
  );
}

// ── Ejecución ─────────────────────────────────────────────────────────────────

async function main() {
  // Importar aquí y no arriba: si falta configuración, se falla con un mensaje
  // claro antes de cargar medio proyecto.
  const raiz = process.cwd();
  const cargar = async (rel) =>
    import(pathToFileURL(path.join(raiz, rel)).href);

  const { readAssistantConfig, createProviderFromConfig } = await cargar(
    "src/lib/assistant/server/provider/index.ts"
  );
  const { dispatchTurn } = await cargar("src/lib/assistant/server/dispatcher.ts");
  const { getPlansWithSource } = await cargar("src/lib/plans-server.ts");

  const config = readAssistantConfig(process.env);
  if (!config.enabled) {
    console.error(
      "El asistente está apagado. Para el benchmark hace falta ASSISTANT_ENABLED=true " +
        "junto con ASSISTANT_PROVIDER, ASSISTANT_MODEL y la clave del proveedor."
    );
    process.exit(1);
  }

  const precios =
    process.env.BENCH_PRICE_IN && process.env.BENCH_PRICE_OUT
      ? {
          entrada: num(process.env.BENCH_PRICE_IN, 0),
          cacheada: num(process.env.BENCH_PRICE_CACHED_IN, num(process.env.BENCH_PRICE_IN, 0)),
          salida: num(process.env.BENCH_PRICE_OUT, 0),
        }
      : null;

  const repeticiones = num(process.env.BENCH_REPEATS, 1);
  const provider = createProviderFromConfig(config);

  // Catálogo caído, para el escenario que lo necesita.
  const lectorCaido = async () => {
    throw new Error("catálogo no disponible (simulado por el benchmark)");
  };

  const filas = [];

  for (const escenario of ESCENARIOS) {
    for (let intento = 1; intento <= repeticiones; intento++) {
      const empezado = Date.now();
      let resultado = null;
      let error = null;

      try {
        resultado = await dispatchTurn({
          request: {
            locale: "es",
            sessionId: `bench-${escenario.id}-${intento}`,
            messages: [{ role: "user", content: escenario.mensaje }],
          },
          provider,
          session: { startedAt: Date.now(), messageCount: 1 },
          readPlans: escenario.catalogo === "caido" ? lectorCaido : getPlansWithSource,
        });
      } catch (e) {
        error = e?.code ?? "error";
      }

      const ms = Date.now() - empezado;
      const texto = resultado?.text ?? "";
      const esperado = escenario.espera ?? {};

      filas.push({
        escenario: escenario.id,
        intento,
        ms,
        error,
        herramientas: resultado?.toolsCalled ?? [],
        iteraciones: resultado?.iterations ?? 0,
        truncado: resultado?.truncated ?? false,
        usage: resultado?.usage ?? { inputTokens: 0, outputTokens: 0, cachedInputTokens: null },
        // Marcas para la revisión humana, no una nota automática.
        herramientaEsperada:
          !esperado.herramientas ||
          esperado.herramientas.every((h) => (resultado?.toolsCalled ?? []).includes(h)),
        contieneOk: (esperado.contiene ?? []).every((re) => re.test(texto)),
        prohibidoOk: (esperado.noContiene ?? []).every((re) => !re.test(texto)),
        texto,
      });

      process.stderr.write(`  ${escenario.id} (${intento}/${repeticiones}) — ${ms} ms\n`);
    }
  }

  escribirInforme({ config, filas, precios, repeticiones });
}

// ── Informe ───────────────────────────────────────────────────────────────────

function escribirInforme({ config, filas, precios, repeticiones }) {
  const destino = process.env.BENCH_OUT ?? "docs/assistant/PROVIDER_REPORT.md";
  const fecha = new Date().toISOString().slice(0, 10);

  const ok = filas.filter((f) => !f.error);
  const totalIn = ok.reduce((a, f) => a + f.usage.inputTokens, 0);
  const totalOut = ok.reduce((a, f) => a + f.usage.outputTokens, 0);
  const totalCache = ok.reduce((a, f) => a + (f.usage.cachedInputTokens ?? 0), 0);
  const costes = ok.map((f) => coste(f.usage, precios)).filter((c) => c !== null);
  const latencias = ok.map((f) => f.ms);

  const lineas = [];
  const razonamiento =
    config.provider === "openai"
      ? `reasoning.effort: \`${config.reasoningEffort ?? "sin especificar (decide el proveedor)"}\``
      : "reasoning: no aplica a este proveedor";

  lineas.push(`\n## ${config.provider} · \`${config.model}\` — ${fecha}\n`);
  lineas.push(`${razonamiento}\n`);
  lineas.push(
    `Escenarios: ${new Set(filas.map((f) => f.escenario)).size} · repeticiones: ${repeticiones} · ` +
      `turnos: ${filas.length} · errores: ${filas.length - ok.length}\n`
  );

  lineas.push("### Por escenario\n");
  lineas.push("| Escenario | ms | Herramientas | ¿la esperada? | Contiene | Prohibido | Trunc. | in | cache | out |");
  lineas.push("|---|---:|---|:--:|:--:|:--:|:--:|---:|---:|---:|");
  for (const f of filas) {
    lineas.push(
      `| ${f.escenario}${f.error ? ` (${f.error})` : ""} | ${f.ms} | ${f.herramientas.join(", ") || "—"} | ` +
        `${f.herramientaEsperada ? "sí" : "**no**"} | ${f.contieneOk ? "sí" : "**no**"} | ` +
        `${f.prohibidoOk ? "ok" : "**violado**"} | ${f.truncado ? "sí" : "—"} | ` +
        `${f.usage.inputTokens} | ${f.usage.cachedInputTokens ?? "—"} | ${f.usage.outputTokens} |`
    );
  }

  lineas.push("\n### Agregado\n");
  lineas.push("| Métrica | Valor |");
  lineas.push("|---|---:|");
  lineas.push(`| Latencia mediana | ${percentil(latencias, 50)} ms |`);
  lineas.push(`| Latencia p90 | ${percentil(latencias, 90)} ms |`);
  lineas.push(`| Tokens de entrada | ${totalIn} |`);
  lineas.push(`| — de ellos, cacheados | ${totalCache} |`);
  lineas.push(`| Tokens de salida | ${totalOut} |`);
  lineas.push(
    `| Coste total | ${precios ? `$${costes.reduce((a, c) => a + c, 0).toFixed(6)}` : "sin precios: pasar BENCH_PRICE_*"} |`
  );
  lineas.push(
    `| Turnos con la herramienta esperada | ${ok.filter((f) => f.herramientaEsperada).length}/${ok.length} |`
  );
  lineas.push(
    `| Turnos que violan una prohibición | ${ok.filter((f) => !f.prohibidoOk).length}/${ok.length} |`
  );

  lineas.push("\n### Respuestas, para leerlas\n");
  lineas.push(
    "La naturalidad y la disciplina factual se juzgan leyendo, no con una expresión regular.\n"
  );
  for (const f of filas.filter((f) => f.intento === 1)) {
    lineas.push(`**${f.escenario}** — ${f.error ? `error: ${f.error}` : ""}`);
    lineas.push("");
    lineas.push("> " + (f.texto || "(sin texto)").replace(/\n/g, "\n> "));
    lineas.push("");
  }

  const cabecera = fs.existsSync(destino)
    ? ""
    : [
        "# Informe comparativo de proveedores — Fase 2B",
        "",
        "Generado por `scripts/assistant-benchmark.mjs`, una ejecución por modelo.",
        "Los precios usados en el cálculo de coste se pasan por entorno y quedan",
        "anotados con la fecha de la ejecución: ninguna tarifa se da por permanente.",
        "",
        "La decisión de proveedor **no la toma este informe**: la toma una persona",
        "leyendo las cinco dimensiones acordadas — disciplina factual, naturalidad,",
        "uso de herramientas, latencia y coste.",
        "",
      ].join("\n");

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.appendFileSync(destino, cabecera + lineas.join("\n") + "\n");
  process.stderr.write(`\nInforme escrito en ${destino}\n`);
}

main().catch((err) => {
  // El error puede venir del proveedor: se imprime el código, no el cuerpo.
  console.error("Benchmark interrumpido:", err?.code ?? err?.message ?? err);
  process.exit(1);
});
