/**
 * bench/report.ts — Compone el bloque de informe de una tirada.
 *
 * Devuelve una cadena y no escribe nada. Esa separación es la que permite que
 * la tirada ocurra en un sitio —una función de Vercel, con sistema de ficheros
 * de solo lectura— y el informe se componga en otro, sin que el formato se
 * bifurque: las dos mitades de la comparativa pasan por esta misma función, así
 * que sus tablas son comparables columna a columna por construcción y no
 * porque alguien se haya fijado.
 */

import type { FilaBench } from "./run";

export interface PreciosBench {
  /** Dólares por millón de tokens. */
  entrada: number;
  cacheada: number;
  salida: number;
}

export interface ConfigInforme {
  provider: string;
  model: string;
  /** Solo lo usa OpenAI; en el resto se anota que no aplica. */
  reasoningEffort?: string | null;
  /** Dónde se ejecutó. Distingue tiradas que no son comparables entre sí. */
  entorno?: string;
}

export function percentil(valores: number[], p: number): number {
  if (valores.length === 0) return 0;
  const orden = [...valores].sort((a, b) => a - b);
  return orden[Math.min(orden.length - 1, Math.floor((p / 100) * orden.length))];
}

/** Coste del turno con los precios que se hayan pasado, o `null` si no hay. */
export function coste(usage: FilaBench["usage"], precios: PreciosBench | null): number | null {
  if (!precios) return null;
  const cacheadas = usage.cachedInputTokens ?? 0;
  const frescas = Math.max(0, usage.inputTokens - cacheadas);
  return (
    (frescas * precios.entrada + cacheadas * precios.cacheada + usage.outputTokens * precios.salida) /
    1_000_000
  );
}

/** Cabecera del documento. Solo se escribe cuando el fichero aún no existe. */
export const CABECERA_INFORME = [
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

export function construirInforme({
  config,
  filas,
  precios,
  repeticiones,
  fecha = new Date().toISOString().slice(0, 10),
}: {
  config: ConfigInforme;
  filas: FilaBench[];
  precios: PreciosBench | null;
  repeticiones: number;
  fecha?: string;
}): string {
  const ok = filas.filter((f) => !f.error);
  const totalIn = ok.reduce((a, f) => a + f.usage.inputTokens, 0);
  const totalOut = ok.reduce((a, f) => a + f.usage.outputTokens, 0);
  const totalCache = ok.reduce((a, f) => a + (f.usage.cachedInputTokens ?? 0), 0);
  const costes = ok.map((f) => coste(f.usage, precios)).filter((c): c is number => c !== null);
  const latencias = ok.map((f) => f.ms);

  const lineas: string[] = [];
  const razonamiento =
    config.provider === "openai"
      ? `reasoning.effort: \`${config.reasoningEffort ?? "sin especificar (decide el proveedor)"}\``
      : "reasoning: no aplica a este proveedor";

  lineas.push(`\n## ${config.provider} · \`${config.model}\` — ${fecha}\n`);
  lineas.push(`${razonamiento}\n`);
  if (config.entorno) {
    // Dos tiradas medidas en máquinas distintas no comparan latencia, por
    // mucho que sus tablas tengan la misma pinta.
    lineas.push(`Entorno de ejecución: **${config.entorno}**\n`);
  }
  lineas.push(
    `Escenarios: ${new Set(filas.map((f) => f.escenario)).size} · repeticiones: ${repeticiones} · ` +
      `turnos: ${filas.length} · errores: ${filas.length - ok.length}\n`
  );

  lineas.push("### Por escenario\n");
  lineas.push(
    "| Escenario | ms | Herramientas | ¿la esperada? | Contiene | Prohibido | Trunc. | in | cache | out |"
  );
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
    `| Coste total | ${
      precios ? `$${costes.reduce((a, c) => a + c, 0).toFixed(6)}` : "sin precios: pasar BENCH_PRICE_*"
    } |`
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
  lineas.push(
    "Se vuelcan **todas** las repeticiones, no solo la primera: cuando un turno se " +
      "desvía suele hacerlo en una de las tres, y esa es justo la que hay que leer. " +
      "Los turnos marcados con ⚠️ son los que no cumplieron alguna expectativa.\n"
  );
  for (const f of filas) {
    const marcas: string[] = [];
    if (!f.herramientaEsperada) marcas.push("no llamó a la herramienta esperada");
    if (!f.contieneOk) marcas.push("no contiene lo esperado");
    if (!f.prohibidoOk) marcas.push("**dice algo prohibido**");
    if (f.error) marcas.push(`error: ${f.error}`);

    lineas.push(
      `**${f.escenario} · repetición ${f.intento}**${marcas.length ? ` — ⚠️ ${marcas.join("; ")}` : ""}`
    );
    lineas.push("");
    lineas.push("> " + (f.texto || "(sin texto)").replace(/\n/g, "\n> "));
    lineas.push("");
  }

  return lineas.join("\n") + "\n";
}
