/**
 * provider/config.ts — Qué proveedor, qué modelo y con qué credencial.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REGLAS QUE ESTE ARCHIVO HACE CUMPLIR
 *
 * · **El asistente arranca apagado.** Solo `ASSISTANT_ENABLED=true` lo
 *   enciende; cualquier otro valor, incluida la ausencia de la variable, lo
 *   deja apagado y ningún proveedor llega a construirse. Es deliberado: un
 *   despliegue al que se le olvidó la variable no debe empezar a gastar dinero
 *   por su cuenta.
 *
 * · **`fake` no es un valor admitido.** El proveedor de pruebas existe para los
 *   tests y para desarrollo, y se construye pasándolo a mano. No hay ninguna
 *   cadena que un despliegue pueda poner en el entorno para que el asistente
 *   responda un guion creyéndose real.
 *
 * · **Si falta algo, se dice cuál falta y se para.** Un proveedor sin clave o
 *   sin modelo no arranca a medias: falla en la lectura de configuración, antes
 *   del primer turno.
 *
 * · **Ningún valor de aquí se registra.** Se puede decir «falta
 *   ANTHROPIC_API_KEY»; no se puede decir cuánto mide ni cómo empieza.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ⚠️ VARIABLES DE ENTORNO Y DESPLIEGUES
 *
 * En Vercel, cambiar una variable de entorno **no afecta a los despliegues ya
 * publicados**: entra en vigor con un despliegue nuevo o un redeploy. Esto vale
 * también para `ASSISTANT_MODEL` y para el kill switch: apagar el asistente
 * cambiando `ASSISTANT_ENABLED` requiere redesplegar para que surta efecto. Si
 * hiciera falta un apagado inmediato sin despliegue, tendría que resolverse con
 * otro mecanismo —una bandera en base de datos consultada en caliente—, y eso
 * es trabajo de la Fase 2D, no de aquí.
 *
 * ⚠️ NINGUNA DE ESTAS VARIABLES LLEVA PREFIJO `NEXT_PUBLIC_`
 *
 * Y no puede llevarlo: `NEXT_PUBLIC_` se inlinea en el bundle del navegador, de
 * modo que una clave con ese prefijo queda publicada en el código fuente de la
 * página. Este módulo solo se importa desde el servidor.
 */

import { AssistantError } from "../errors";

/** Proveedores que un despliegue puede seleccionar. `fake` no está aquí. */
export const CONFIGURABLE_PROVIDERS = ["openai", "anthropic"] as const;
export type ConfigurableProviderId = (typeof CONFIGURABLE_PROVIDERS)[number];

/** Variable de la que cada proveedor toma su credencial. */
export const API_KEY_VAR: Record<ConfigurableProviderId, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
};

/**
 * Esfuerzo de razonamiento.
 *
 * Es una opción **de OpenAI**: la consume su adaptador y nadie más. Se lee aquí
 * porque la configuración vive en un sitio, pero que esté en `AssistantConfig`
 * no la hace transversal — el adaptador de Anthropic la ignora, y hay un test
 * que comprueba que no llega a su petición.
 *
 * Los niveles son los documentados para la familia GPT-5. Si el proveedor
 * añadiera o retirara alguno, esta lista es lo único que hay que tocar; y si un
 * modelo concreto rechaza un nivel admitido aquí, eso llega como error del
 * proveedor por el camino normal.
 */
export const REASONING_EFFORTS = ["minimal", "low", "medium", "high"] as const;
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

export type AssistantConfig =
  | { enabled: false }
  | {
      enabled: true;
      provider: ConfigurableProviderId;
      model: string;
      apiKey: string;
      /** Solo lo usa OpenAI. `null` = no se manda nada y decide el proveedor. */
      reasoningEffort: ReasoningEffort | null;
    };

export type Env = Record<string, string | undefined>;

function isConfigurable(value: string): value is ConfigurableProviderId {
  return (CONFIGURABLE_PROVIDERS as readonly string[]).includes(value);
}

/**
 * Lee la configuración del entorno.
 *
 * Devuelve `{ enabled: false }` cuando el asistente está apagado — que no es un
 * error, es un estado. Lanza cuando está encendido pero mal configurado.
 */
export function readAssistantConfig(env: Env = process.env): AssistantConfig {
  if ((env.ASSISTANT_ENABLED ?? "").trim().toLowerCase() !== "true") {
    return { enabled: false };
  }

  const provider = (env.ASSISTANT_PROVIDER ?? "").trim().toLowerCase();
  if (!provider) {
    throw new AssistantError(
      "provider_error",
      `ASSISTANT_ENABLED=true pero falta ASSISTANT_PROVIDER (${CONFIGURABLE_PROVIDERS.join(" | ")})`
    );
  }
  if (!isConfigurable(provider)) {
    // Mensaje explícito para el caso que más va a intentarse.
    const extra =
      provider === "fake"
        ? " — el proveedor de pruebas no se puede seleccionar por entorno"
        : "";
    throw new AssistantError(
      "provider_error",
      `ASSISTANT_PROVIDER="${provider}" no es un proveedor admitido (${CONFIGURABLE_PROVIDERS.join(" | ")})${extra}`
    );
  }

  const model = (env.ASSISTANT_MODEL ?? "").trim();
  if (!model) {
    throw new AssistantError(
      "provider_error",
      `ASSISTANT_ENABLED=true con proveedor "${provider}" pero falta ASSISTANT_MODEL`
    );
  }

  const keyVar = API_KEY_VAR[provider];
  const apiKey = (env[keyVar] ?? "").trim();
  if (!apiKey) {
    // Se nombra la variable, nunca su contenido ni su longitud.
    throw new AssistantError(
      "provider_error",
      `ASSISTANT_ENABLED=true con proveedor "${provider}" pero falta ${keyVar}`
    );
  }

  return { enabled: true, provider, model, apiKey, reasoningEffort: readReasoningEffort(env) };
}

/**
 * Lee `ASSISTANT_REASONING_EFFORT`.
 *
 * Ausente o vacío significa «no mandes nada y que decida el proveedor», que no
 * es lo mismo que un nivel concreto. Un valor que no está en la lista **no se
 * ignora en silencio**: quien escribe `ASSISTANT_REASONING_EFFORT=bajo` cree
 * haber configurado algo, y arrancar como si no lo hubiera puesto haría que la
 * comparativa midiera otra cosa de la que su autor cree.
 */
function readReasoningEffort(env: Env): ReasoningEffort | null {
  const raw = (env.ASSISTANT_REASONING_EFFORT ?? "").trim().toLowerCase();
  if (!raw) return null;

  if (!(REASONING_EFFORTS as readonly string[]).includes(raw)) {
    throw new AssistantError(
      "provider_error",
      `ASSISTANT_REASONING_EFFORT="${raw}" no es un valor admitido (${REASONING_EFFORTS.join(" | ")})`
    );
  }
  return raw as ReasoningEffort;
}

/** Atajo para las superficies que solo necesitan saber si hay asistente. */
export function isAssistantEnabled(env: Env = process.env): boolean {
  return readAssistantConfig(env).enabled;
}
