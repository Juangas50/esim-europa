/**
 * /api/assistant/bench — Ejecuta la comparativa de la Fase 2B desde Vercel.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE ESTA RUTA
 *
 * La comparativa necesita hablar con OpenAI y con Anthropic desde el mismo
 * sitio, con el catálogo real de Supabase delante, y medir latencias en
 * condiciones idénticas para los dos modelos. El entorno de desarrollo del
 * proyecto no tiene salida hacia OpenAI, así que la única forma de medir a los
 * dos en las mismas condiciones es ejecutarlos desde un despliegue.
 *
 * **Es una herramienta de medición, no una funcionalidad del producto.** Vive
 * apagada salvo que se encienda a propósito, y su sitio es el despliegue de
 * *Preview* de la rama, nunca producción.
 *
 * ⚠️ RETIRAR ANTES DE PRODUCCIÓN
 *
 * Cuando la Fase 2B cierre, esta ruta se borra. Mientras exista, la única cosa
 * que impide que un tercero gaste dinero de la cuenta es `BENCH_SECRET`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CÓMO SE DEFIENDE
 *
 * · **`BENCH_ENABLED` distinto de `true` → 404.** No 401: un 401 confirma que
 *   la ruta está ahí. Es el mismo criterio que usa `/api/dev/email-preview`.
 * · **Secreto incorrecto → 404**, por lo mismo, y comparado en tiempo constante.
 * · **Proveedor y modelo en lista blanca → si no, 404** sin construir el
 *   proveedor ni abrir conexión.
 * · **Escenario solo por identificador.** No hay ningún parámetro que meta
 *   texto libre en la conversación.
 * · La respuesta lleva filas de medición y nada más: ni claves, ni cabeceras,
 *   ni cuerpos de error del proveedor. De un fallo del proveedor sale su código.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * El informe **no se compone aquí**: el sistema de ficheros de una función es
 * de solo lectura y efímero. La ruta devuelve las filas en JSON y el markdown
 * lo arma `construirInforme()` en local, que es la misma función que generó el
 * bloque anterior. Así las dos mitades de la comparativa salen con el mismo
 * formato por construcción.
 */

import { ejecutarEscenario } from "@/lib/assistant/bench/run";
import {
  leerPortador,
  resolverEscenario,
  resolverModelo,
  resolverRazonamiento,
  resolverRepeticiones,
  secretoCoincide,
  MAX_REPETICIONES,
} from "@/lib/assistant/bench/guards";
import { IDS_ESCENARIOS } from "@/lib/assistant/bench/scenarios";
import { API_KEY_VAR, createProviderFromConfig } from "@/lib/assistant/server/provider";

export const dynamic = "force-dynamic";

/**
 * Una petición ejecuta como mucho tres turnos contra un modelo real. Con lo
 * medido en la primera mitad de la comparativa eso son decenas de segundos, no
 * minutos; el tope real lo impone el plan de Vercel, y por eso la comparativa
 * se lanza escenario a escenario en vez de los nueve de una vez.
 */
export const maxDuration = 300;

/** Lo mismo para el que no está autorizado y para el que no debería saber que existe. */
const noExiste = () => new Response("Not found", { status: 404 });

const malaPeticion = (motivo: string) =>
  Response.json({ error: motivo }, { status: 400 });

export async function GET(request: Request) {
  if ((process.env.BENCH_ENABLED ?? "").trim().toLowerCase() !== "true") return noExiste();

  const portador = leerPortador(request.headers.get("authorization"));
  if (!secretoCoincide(portador, process.env.BENCH_SECRET)) return noExiste();

  const { searchParams } = new URL(request.url);

  // Lista blanca de modelos. Antes que nada, para que una combinación no
  // admitida no llegue a construir un cliente ni a costar un céntimo.
  const modelo = resolverModelo(searchParams.get("provider"), searchParams.get("model"));
  if (!modelo) return noExiste();

  // A partir de aquí quien pregunta tiene el secreto y ha pedido una
  // combinación válida, así que los errores de parámetros se explican: sirven
  // para operar la comparativa y no revelan nada que no supiera ya.
  const escenario = resolverEscenario(searchParams.get("escenario"));
  if (!escenario) {
    return malaPeticion(`escenario no reconocido (${IDS_ESCENARIOS.join(" | ")})`);
  }

  const repeticiones = resolverRepeticiones(searchParams.get("repeticiones"));
  if (repeticiones === null) {
    return malaPeticion(`repeticiones tiene que ser un entero entre 1 y ${MAX_REPETICIONES}`);
  }

  const razonamiento = resolverRazonamiento(searchParams.get("reasoning"));
  if (razonamiento === undefined) {
    return malaPeticion("reasoning no admitido (minimal | low | medium | high)");
  }

  const variableClave = API_KEY_VAR[modelo.proveedor];
  const apiKey = (process.env[variableClave] ?? "").trim();
  if (!apiKey) {
    // Se nombra la variable que falta, nunca su contenido.
    return Response.json({ error: `falta ${variableClave} en el entorno` }, { status: 500 });
  }

  const provider = createProviderFromConfig({
    enabled: true,
    provider: modelo.proveedor,
    model: modelo.modelo,
    apiKey,
    reasoningEffort: razonamiento,
  });

  const filas = await ejecutarEscenario(escenario, repeticiones, provider);

  return Response.json({
    meta: {
      provider: modelo.proveedor,
      model: modelo.modelo,
      // Se anota lo que se pidió, no lo que el proveedor haya decidido por su
      // cuenta: dos tiradas con esfuerzos distintos no son comparables, y sin
      // esta marca el informe no lo sabría.
      reasoningEffort: razonamiento,
      escenario: escenario.id,
      repeticiones,
    },
    filas,
  });
}
