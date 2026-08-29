/**
 * bench/guards.ts — Lo que la ruta de benchmark acepta, y nada más.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUÉ SE DEFIENDE AQUÍ
 *
 * La ruta de benchmark ejecuta turnos reales contra un modelo real: cada
 * petición **gasta dinero** y habla con un proveedor externo. Eso la convierte
 * en algo distinto del resto de la API, donde lo peor que pasa es que alguien
 * lea datos que no debía.
 *
 * Por eso todo lo que llega por la petición está en lista blanca, y la lista es
 * cerrada:
 *
 * · **Modelo.** Cada proveedor admite una lista cerrada, nombre a nombre. No es
 *   una restricción de configuración sino de seguridad: sin ella, quien tuviera
 *   el secreto podría pedir el modelo más caro del catálogo del proveedor.
 * · **Escenario.** Solo por identificador, de los nueve que existen. **No hay
 *   ningún camino por el que un mensaje escrito en la petición llegue al
 *   modelo**, que es lo que convertiría esta ruta en un proxy de LLM abierto
 *   pagado con la cuenta del proyecto.
 * · **Repeticiones.** Entre 1 y 3. El tope acota lo que puede gastar una sola
 *   petición y, de paso, lo que puede tardar.
 *
 * Todo lo que no encaje se rechaza **antes de construir el proveedor**, así que
 * una petición inválida no llega a abrir una conexión ni a costar nada.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { buscarEscenario, type EscenarioBench } from "./scenarios";

/**
 * Los modelos que compara la Fase 2B, enumerados uno a uno.
 *
 * Es una lista cerrada, no un prefijo ni un patrón: `openai` admite estos dos y
 * ningún otro. La diferencia importa porque el catálogo de un proveedor incluye
 * modelos hasta cien veces más caros, y aquí cada petición gasta dinero real.
 *
 * `gpt-5-nano` entra como challenger de `gpt-5.6-luna` por coste, y comparte
 * adaptador con él: es el mismo proveedor y la misma API, así que no hace falta
 * código nuevo para medirlo.
 */
export const MODELOS_PERMITIDOS = {
  openai: ["gpt-5.6-luna", "gpt-5-nano"],
  anthropic: ["claude-haiku-4-5"],
} as const satisfies Record<string, readonly string[]>;

export type ProveedorBench = keyof typeof MODELOS_PERMITIDOS;

export const MAX_REPETICIONES = 3;

/** Esfuerzos admitidos. Solo llegan al adaptador de OpenAI. */
export const RAZONAMIENTOS_PERMITIDOS = ["minimal", "low", "medium", "high"] as const;
export type RazonamientoBench = (typeof RAZONAMIENTOS_PERMITIDOS)[number];

/**
 * Compara dos secretos sin filtrar por dónde dejan de parecerse.
 *
 * Se comparan los hashes y no las cadenas: `timingSafeEqual` exige longitudes
 * iguales y lanzaría con secretos de distinto tamaño, y capturar esa excepción
 * volvería a hacer observable la longitud. Con SHA-256 los dos lados miden
 * siempre 32 bytes.
 */
export function secretoCoincide(recibido: string | null, esperado: string | undefined): boolean {
  if (!recibido || !esperado) return false;
  const a = createHash("sha256").update(recibido).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
}

/** Extrae el secreto de una cabecera `Authorization: Bearer …`. */
export function leerPortador(cabecera: string | null): string | null {
  if (!cabecera) return null;
  const [esquema, ...resto] = cabecera.trim().split(/\s+/);
  if (esquema.toLowerCase() !== "bearer" || resto.length !== 1) return null;
  return resto[0];
}

/**
 * Comprueba la pareja proveedor/modelo contra la lista blanca.
 *
 * Devuelve `null` ante cualquier combinación que no esté enumerada — proveedor
 * desconocido, modelo de otro proveedor, otro modelo del mismo proveedor, o el
 * modelo correcto mal escrito.
 *
 * El nombre que sale es el de la lista, no el que llegó en la petición: así lo
 * que se manda al proveedor no depende de cómo viniera escrito.
 */
export function resolverModelo(
  proveedor: string | null,
  modelo: string | null
): { proveedor: ProveedorBench; modelo: string } | null {
  if (!proveedor || !modelo) return null;

  const p = proveedor.trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(MODELOS_PERMITIDOS, p)) return null;

  const pedido = modelo.trim();
  const permitido = (MODELOS_PERMITIDOS[p as ProveedorBench] as readonly string[]).find(
    (m) => m === pedido
  );
  if (!permitido) return null;

  return { proveedor: p as ProveedorBench, modelo: permitido };
}

/**
 * Valida las repeticiones: entero entre 1 y `MAX_REPETICIONES`.
 *
 * Ausente significa 1. Cualquier otra cosa —cero, negativos, decimales, texto,
 * o un número por encima del tope— es `null`, no un valor recortado en
 * silencio: quien pide 50 repeticiones no quiere 3, y devolverle 3 le haría
 * creer que midió otra cosa.
 */
export function resolverRepeticiones(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return 1;

  // Solo dígitos decimales. `Number()` por su cuenta acepta cosas que nadie
  // quiso escribir aquí —`0x3` es 3, `1e0` es 1— y el parámetro se lee mejor
  // exigiendo la forma que realmente se espera.
  const texto = raw.trim();
  if (!/^\d+$/.test(texto)) return null;

  const n = Number(texto);
  if (!Number.isInteger(n) || n < 1 || n > MAX_REPETICIONES) return null;
  return n;
}

/** Resuelve el escenario por identificador. Solo los nueve que existen. */
export function resolverEscenario(raw: string | null): EscenarioBench | null {
  if (!raw) return null;
  return buscarEscenario(raw.trim());
}

/**
 * Valida el esfuerzo de razonamiento.
 *
 * Ausente devuelve `null`, que el adaptador interpreta como «no mandes el
 * campo». `undefined` señala un valor escrito que no está admitido, y eso sí es
 * un error: distinguir los dos casos evita ejecutar una comparativa creyendo
 * haber configurado un esfuerzo que nunca se envió.
 */
export function resolverRazonamiento(raw: string | null): RazonamientoBench | null | undefined {
  if (raw === null || raw.trim() === "") return null;
  const v = raw.trim().toLowerCase();
  return (RAZONAMIENTOS_PERMITIDOS as readonly string[]).includes(v)
    ? (v as RazonamientoBench)
    : undefined;
}
