/**
 * provider/index.ts — Selección de proveedor.
 *
 * En la Fase 2A este archivo tenía un `switch` de un solo caso, y eso era lo
 * que garantizaba que la fase entera no pudiera abrir un socket: no había
 * ninguna rama que construyera un cliente HTTP.
 *
 * En la 2B aparecen los dos adaptadores reales, y la garantía cambia de forma
 * —ya no es «no existe código que salga a la red», que sería falso— pero no
 * desaparece:
 *
 * · El asistente arranca **apagado**. Sin `ASSISTANT_ENABLED=true` no se
 *   construye ningún proveedor.
 * · **`fake` no se puede seleccionar por entorno.** Se construye a mano, desde
 *   un test o desde el script de desarrollo, y por eso no hay ninguna cadena
 *   que un despliegue pueda poner para que el asistente responda un guion
 *   creyéndose real.
 * · Los adaptadores reciben su transporte por parámetro, así que la suite de
 *   tests los ejercita con el candado de red puesto.
 */

import type { LlmProvider } from "./types";
import { FakeProvider } from "./fake";
import { AnthropicProvider } from "./anthropic";
import { OpenAiProvider } from "./openai";
import { AssistantError } from "../errors";
import {
  CONFIGURABLE_PROVIDERS,
  readAssistantConfig,
  type AssistantConfig,
  type ConfigurableProviderId,
  type Env,
} from "./config";
import type { HttpTransport } from "./http";

export * from "./types";
export { FakeProvider, fakeText, fakeToolUse, fakeMaxTokens } from "./fake";
export { AnthropicProvider } from "./anthropic";
export { OpenAiProvider } from "./openai";
export { defaultTransport, type HttpTransport } from "./http";
export {
  API_KEY_VAR,
  CONFIGURABLE_PROVIDERS,
  REASONING_EFFORTS,
  isAssistantEnabled,
  readAssistantConfig,
  type AssistantConfig,
  type ConfigurableProviderId,
  type Env,
  type ReasoningEffort,
} from "./config";

/** Incluye `fake`, que solo se alcanza construyéndolo a mano. */
export type ProviderId = ConfigurableProviderId | "fake";

/** Los que un despliegue puede pedir. `fake` no está, y es a propósito. */
export const AVAILABLE_PROVIDERS: readonly ConfigurableProviderId[] = CONFIGURABLE_PROVIDERS;

export interface CreateProviderOptions {
  /** Inyectable para los tests. En producción, `fetch`. */
  transport?: HttpTransport;
}

/** Construye el adaptador de una configuración ya validada. */
export function createProviderFromConfig(
  config: Extract<AssistantConfig, { enabled: true }>,
  options: CreateProviderOptions = {}
): LlmProvider {
  switch (config.provider) {
    case "anthropic":
      // Sin `reasoningEffort`: es una opción de la otra API y su adaptador no
      // la conoce. Hay un test que comprueba que no se cuela en la petición.
      return new AnthropicProvider({
        apiKey: config.apiKey,
        model: config.model,
        transport: options.transport,
      });
    case "openai":
      return new OpenAiProvider({
        apiKey: config.apiKey,
        model: config.model,
        transport: options.transport,
        reasoningEffort: config.reasoningEffort,
      });
    default: {
      const unreachable: never = config.provider;
      throw new AssistantError(
        "provider_error",
        `proveedor "${String(unreachable)}" no admitido`
      );
    }
  }
}

/**
 * Construye el proveedor a partir del entorno.
 *
 * Devuelve `null` cuando el asistente está apagado — que es un estado
 * deliberado, no un fallo. Lanza cuando está encendido pero mal configurado.
 */
export function createProviderFromEnv(
  env: Env = process.env,
  options: CreateProviderOptions = {}
): LlmProvider | null {
  const config = readAssistantConfig(env);
  if (!config.enabled) return null;
  return createProviderFromConfig(config, options);
}

/** El proveedor de pruebas. Vive aparte para que no se pueda pedir por entorno. */
export function createFakeProvider(): LlmProvider {
  return new FakeProvider([]);
}
