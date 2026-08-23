/**
 * bench/run.ts — Ejecuta un escenario y devuelve la fila que va al informe.
 *
 * Este módulo es lo que garantiza que la comparativa compare modelos y no
 * integraciones: el mismo `dispatchTurn`, el mismo cableado del catálogo y la
 * misma forma de medir, tanto si el benchmark se lanza desde la línea de
 * comandos como desde la ruta que corre en Vercel. Lo único que cambia entre
 * una tirada y otra es el proveedor que se le pasa.
 *
 * No decide nada ni puntúa: mide, marca lo que se desvía de lo esperado y se
 * aparta.
 */

import { dispatchTurn } from "@/lib/assistant/server/dispatcher";
import type { LlmProvider } from "@/lib/assistant/server/provider/types";
import { getPlansWithSource } from "@/lib/plans-server";
import type { EscenarioBench } from "./scenarios";

export interface UsoTurno {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number | null;
}

export interface FilaBench {
  escenario: string;
  intento: number;
  ms: number;
  /** Código del error, nunca su cuerpo ni su traza. */
  error: string | null;
  herramientas: string[];
  iteraciones: number;
  truncado: boolean;
  usage: UsoTurno;
  herramientaEsperada: boolean;
  contieneOk: boolean;
  prohibidoOk: boolean;
  texto: string;
}

/**
 * Catálogo caído, para el escenario que lo necesita.
 *
 * Se simula fallando la lectura, no devolviendo una lista vacía: lo que se
 * quiere provocar es la ruta degradada de verdad, la que hace que el asistente
 * no pueda dar precios.
 */
const lectorCaido = async (): Promise<never> => {
  throw new Error("catálogo no disponible (simulado por el benchmark)");
};

/** Ejecuta un escenario una vez y devuelve su fila. */
export async function ejecutarTurno(
  escenario: EscenarioBench,
  intento: number,
  provider: LlmProvider
): Promise<FilaBench> {
  const empezado = Date.now();
  let resultado: Awaited<ReturnType<typeof dispatchTurn>> | null = null;
  let error: string | null = null;

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
    // Solo el código: el detalle de un error de proveedor puede arrastrar
    // cabeceras o cuerpo de la respuesta.
    error = (e as { code?: string })?.code ?? "error";
  }

  const ms = Date.now() - empezado;
  const texto = resultado?.text ?? "";
  const esperado = escenario.espera ?? {};
  const herramientas = resultado?.toolsCalled ?? [];

  return {
    escenario: escenario.id,
    intento,
    ms,
    error,
    herramientas,
    iteraciones: resultado?.iterations ?? 0,
    truncado: resultado?.truncated ?? false,
    usage: resultado?.usage ?? { inputTokens: 0, outputTokens: 0, cachedInputTokens: null },
    // Marcas para la revisión humana, no una nota automática.
    herramientaEsperada:
      !esperado.herramientas || esperado.herramientas.every((h) => herramientas.includes(h)),
    contieneOk: (esperado.contiene ?? []).every((re) => re.test(texto)),
    prohibidoOk: (esperado.noContiene ?? []).every((re) => !re.test(texto)),
    texto,
  };
}

/** Ejecuta un escenario `repeticiones` veces, en serie. */
export async function ejecutarEscenario(
  escenario: EscenarioBench,
  repeticiones: number,
  provider: LlmProvider,
  alTerminarTurno?: (fila: FilaBench) => void
): Promise<FilaBench[]> {
  const filas: FilaBench[] = [];

  // En serie a propósito: en paralelo las latencias se contaminarían entre sí y
  // la mediana dejaría de significar lo que dice que significa.
  for (let intento = 1; intento <= repeticiones; intento++) {
    const fila = await ejecutarTurno(escenario, intento, provider);
    filas.push(fila);
    alTerminarTurno?.(fila);
  }

  return filas;
}
