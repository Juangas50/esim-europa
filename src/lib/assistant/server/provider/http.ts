/**
 * provider/http.ts — La única puerta por la que el asistente sale a la red.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ EL TRANSPORTE SE INYECTA
 *
 * La Fase 2A garantiza que su suite no abre un socket, y esa garantía la
 * sostiene un candado que sustituye `fetch`, `http`, `https`, `net` y el DNS por
 * funciones que lanzan. Los adaptadores de la 2B sí necesitan hablar con una
 * API, así que hay dos formas de probarlos: levantar el candado —y perder la
 * garantía para toda la suite— o darles el transporte por parámetro.
 *
 * Se hace lo segundo. Cada adaptador recibe un `HttpTransport`; en producción
 * es `fetch`, en los tests es una función que devuelve respuestas capturadas.
 * El candado sigue puesto, y si un adaptador se saltara el transporte inyectado
 * para llamar a `fetch` por su cuenta, el test reventaría — que es exactamente
 * la protección que se quiere.
 *
 * `fetch` se resuelve en el momento de la llamada, no al importar el módulo.
 * Importándolo se capturaría la referencia original y el candado no lo vería.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ⚠️ NADA DE LO QUE ENTRA AQUÍ SALE EN UN ERROR
 *
 * Este módulo maneja la clave de API, las cabeceras que la llevan y el cuerpo
 * de la petición. Ninguna de las tres puede aparecer en un mensaje de error, en
 * un log ni en el contexto del modelo. Los errores que produce llevan el código
 * de estado y una razón corta, y nada más: ver `describeFailure`.
 */

import { AssistantError } from "../errors";

export type HttpTransport = (url: string, init: RequestInit) => Promise<Response>;

/** El transporte de producción. Resuelve `fetch` al llamar, no al importar. */
export const defaultTransport: HttpTransport = (url, init) => globalThis.fetch(url, init);

/**
 * Qué se puede decir de un fallo del proveedor.
 *
 * Solo la familia del problema. Un 401 dice «credencial rechazada», no qué
 * clave se usó; un 500 dice «el proveedor falló», no qué contestó. El cuerpo
 * crudo de una respuesta de error puede repetir fragmentos de la petición —
 * incluido el prompt— y a veces la propia cabecera de autorización.
 */
function describeFailure(status: number): string {
  if (status === 401 || status === 403) return "credencial rechazada por el proveedor";
  if (status === 404) return "modelo o endpoint no encontrado";
  if (status === 429) return "límite de ritmo del proveedor";
  if (status >= 500) return "error del proveedor";
  return "petición rechazada por el proveedor";
}

export interface PostJsonInput {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  transport: HttpTransport;
  signal?: AbortSignal;
  /** Para el mensaje de error. Identificador del adaptador, nunca la clave. */
  providerId: string;
}

/**
 * Envía una petición JSON y devuelve el cuerpo ya parseado.
 *
 * Todo lo que puede salir mal termina en `AssistantError("provider_error")` con
 * un detalle corto y sin secretos: estado no exitoso, JSON malformado,
 * cancelación por timeout y fallo de red.
 */
export async function postJson(input: PostJsonInput): Promise<unknown> {
  const { url, headers, body, transport, signal, providerId } = input;

  let response: Response;
  try {
    response = await transport(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    // Cancelación por el tope de tiempo del turno. Se distingue del resto para
    // que el dispatcher no la confunda con un fallo del proveedor.
    if (signal?.aborted || (err instanceof Error && err.name === "AbortError")) {
      throw new AssistantError("timeout", `${providerId}: petición cancelada`);
    }
    // Fallo de transporte: DNS, TLS, conexión rechazada. El mensaje original
    // puede llevar la URL completa con parámetros; no se propaga.
    throw new AssistantError("provider_error", `${providerId}: no se pudo contactar con el proveedor`);
  }

  if (!response.ok) {
    // El cuerpo NO se lee: no aporta nada que se pueda registrar y sí puede
    // contener eco de la petición.
    throw new AssistantError(
      "provider_error",
      `${providerId}: ${describeFailure(response.status)} (HTTP ${response.status})`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new AssistantError("provider_error", `${providerId}: respuesta ilegible del proveedor`);
  }
}
