/**
 * _no-network.ts — La red, cerrada con llave.
 *
 * "La Fase 2A no habla con ningún proveedor" no debería ser una frase de un
 * documento. Este módulo la convierte en una propiedad que la suite comprueba:
 * al importarlo, cualquier intento de salir a la red desde el código bajo prueba
 * lanza una excepción y el test que lo provocó falla.
 *
 * Cubre las cuatro puertas por las que se sale de un proceso de Node:
 * `fetch` (que es la que usan el cliente de Supabase y los SDK de los
 * proveedores de modelos), `http`/`https`, `net` y la resolución de DNS. No hace
 * distingos por destino: no es una lista negra de dominios que haya que ir
 * ampliando, es que no se sale.
 *
 * Se importa el primero en cada `*.spec.ts` de esta carpeta, y
 * `sec-no-network.spec.ts` verifica que ninguno se lo salta.
 */

import http from "node:http";
import https from "node:https";
import net from "node:net";
import dns from "node:dns";

export class NetworkAccessError extends Error {
  constructor(via: string, target: string) {
    super(
      `Acceso a red bloqueado en los tests de Fase 2A (vía ${via} → ${target}). ` +
        `Ningún módulo de esta fase debe salir a internet: inyectá un lector o un proveedor falso.`
    );
    this.name = "NetworkAccessError";
  }
}

function describeTarget(args: unknown[]): string {
  const first = args[0];
  if (typeof first === "string") return first;
  if (first instanceof URL) return first.toString();
  if (first && typeof first === "object") {
    const o = first as Record<string, unknown>;
    if (typeof o.url === "string") return o.url;
    if (typeof o.host === "string" || typeof o.hostname === "string") {
      return String(o.hostname ?? o.host);
    }
  }
  if (typeof first === "number") return `puerto ${first}`;
  return "destino desconocido";
}

function block(via: string): (...args: unknown[]) => never {
  return (...args: unknown[]) => {
    throw new NetworkAccessError(via, describeTarget(args));
  };
}

let installed = false;

export function installNoNetworkGuard(): void {
  if (installed) return;
  installed = true;

  // `fetch` rechaza en vez de lanzar en seco: es como falla de verdad, y así el
  // código bajo prueba recorre su propio camino de error en lugar de reventar
  // por un sitio por el que nunca reventaría en producción.
  globalThis.fetch = (async (...args: unknown[]) => {
    throw new NetworkAccessError("fetch", describeTarget(args));
  }) as unknown as typeof fetch;

  // `http`/`https` cubren cualquier cliente que no use fetch.
  http.request = block("http.request") as unknown as typeof http.request;
  http.get = block("http.get") as unknown as typeof http.get;
  https.request = block("https.request") as unknown as typeof https.request;
  https.get = block("https.get") as unknown as typeof https.get;

  // `net` cubre a quien abra el socket a mano. No se toca
  // `net.Socket.prototype.connect`: el runner lo usa para hablar con sus
  // workers, y romperlo tiraría la suite entera en vez de un test.
  net.connect = block("net.connect") as unknown as typeof net.connect;
  net.createConnection = block("net.createConnection") as unknown as typeof net.createConnection;

  // DNS: red que ni siquiera llega a abrir una conexión, pero sí sale de la
  // máquina y sí delata una dependencia externa.
  dns.lookup = block("dns.lookup") as unknown as typeof dns.lookup;
  dns.promises.lookup = block("dns.promises.lookup") as unknown as typeof dns.promises.lookup;
}

installNoNetworkGuard();
