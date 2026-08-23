#!/usr/bin/env node
/**
 * assistant-benchmark.mjs — Fase 2B-B: los mismos escenarios, contra modelos
 * reales, desde la línea de comandos.
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
 * ⚠️ **Este camino no sirve para comparar los dos proveedores** si la máquina
 * que lo lanza no llega a los dos. Escenarios, ejecución e informe son los
 * mismos que usa `/api/assistant/bench`, pero la latencia se mide desde donde
 * se ejecute y el catálogo es el que vea esa máquina. Para una comparativa
 * válida las dos mitades tienen que salir del mismo sitio.
 *
 * Uso:
 *
 *   ASSISTANT_ENABLED=true \
 *   ASSISTANT_PROVIDER=anthropic ASSISTANT_MODEL=claude-haiku-4-5 ANTHROPIC_API_KEY=… \
 *   npm run assistant:bench
 *
 * Se lanza por `npm run` y no con `node` a pelo porque importa los módulos
 * TypeScript del proyecto, y eso necesita los hooks de resolución de
 * `scripts/ts-hooks.mjs` — ver ese fichero para el porqué.
 *
 * Opciones por entorno:
 *   BENCH_REPEATS=3     repeticiones por escenario (por defecto 1)
 *   BENCH_OUT=ruta.md   destino del informe
 *   BENCH_ENV="…"       etiqueta de dónde se ejecutó, que va al informe
 *
 * ⚠️ Los precios por millón de tokens se pasan por entorno y se registran con
 * su fecha. No se hardcodean: una tarifa escrita en el código envejece sin que
 * nadie se entere y contamina la comparación.
 *   BENCH_PRICE_IN=…  BENCH_PRICE_CACHED_IN=…  BENCH_PRICE_OUT=…
 */

import fs from "node:fs";
import path from "node:path";

import { ESCENARIOS } from "@/lib/assistant/bench/scenarios";
import { ejecutarEscenario } from "@/lib/assistant/bench/run";
import { CABECERA_INFORME, construirInforme } from "@/lib/assistant/bench/report";
import { createProviderFromConfig, readAssistantConfig } from "@/lib/assistant/server/provider";

const num = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

async function main() {
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

  const filas = [];
  for (const escenario of ESCENARIOS) {
    const delEscenario = await ejecutarEscenario(escenario, repeticiones, provider, (fila) =>
      process.stderr.write(`  ${fila.escenario} (${fila.intento}/${repeticiones}) — ${fila.ms} ms\n`)
    );
    filas.push(...delEscenario);
  }

  escribirInforme({ config, filas, precios, repeticiones });
}

function escribirInforme({ config, filas, precios, repeticiones }) {
  const destino = process.env.BENCH_OUT ?? "docs/assistant/PROVIDER_REPORT.md";

  const bloque = construirInforme({
    config: {
      provider: config.provider,
      model: config.model,
      reasoningEffort: config.reasoningEffort,
      entorno: process.env.BENCH_ENV ?? "línea de comandos",
    },
    filas,
    precios,
    repeticiones,
  });

  const cabecera = fs.existsSync(destino) ? "" : CABECERA_INFORME;

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.appendFileSync(destino, cabecera + bloque);
  process.stderr.write(`\nInforme escrito en ${destino}\n`);
}

main().catch((err) => {
  // El error puede venir del proveedor: se imprime el código, no el cuerpo.
  console.error("Benchmark interrumpido:", err?.code ?? err?.message ?? err);
  process.exit(1);
});
