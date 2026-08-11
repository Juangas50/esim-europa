/**
 * provider/index.ts — Selección de proveedor.
 *
 * En la Fase 2A solo hay una opción, y esto es lo que garantiza que la fase
 * entera no pueda hacer una llamada de red: no existe ninguna rama de código
 * que construya un cliente HTTP, porque no hay ningún adaptador que construir.
 * No es una promesa del documento, es que el `switch` tiene un solo caso.
 *
 * En la Fase 2B aparecerán aquí `openai` y `anthropic`, y este archivo empezará
 * a leer configuración. Hasta entonces, pedir cualquier otro proveedor es un
 * error inmediato y explícito.
 */

import type { LlmProvider } from "./types";
import { FakeProvider } from "./fake";

export * from "./types";
export { FakeProvider, fakeText, fakeToolUse, fakeMaxTokens } from "./fake";

export type ProviderId = "fake";

/** Proveedores disponibles hoy. La lista crece en la Fase 2B, no antes. */
export const AVAILABLE_PROVIDERS: readonly ProviderId[] = ["fake"] as const;

export function createProvider(id: ProviderId = "fake"): LlmProvider {
  switch (id) {
    case "fake":
      return new FakeProvider([]);
    default: {
      // Alcanzable solo si alguien fuerza el tipo. Falla ruidosamente en vez de
      // caer en un proveedor por defecto que sí hable con la red.
      const unreachable: never = id;
      throw new Error(
        `Proveedor "${String(unreachable)}" no disponible: la Fase 2A solo admite el proveedor de pruebas.`
      );
    }
  }
}
