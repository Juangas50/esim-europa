/**
 * plan-key.ts — La identidad comercial de un producto Ruta34.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ ESTE MÓDULO EXISTE
 *
 * Un plan se ha venido identificando de tres formas distintas según quién
 * preguntara: el UUID de la fila en la base de datos, un identificador interno
 * heredado del mayorista, y una talla de operador. Ninguna de las tres sirve
 * para relacionar un producto con nada fuera de su propia tabla:
 *
 * · el UUID solo existe en el catálogo vivo, así que cualquier cosa que lo use
 *   se rompe en cuanto el catálogo cae y entra el fallback;
 * · el identificador interno y la talla son naming del proveedor, y no pueden
 *   salir a ninguna superficie pública.
 *
 * La clave comercial se deriva del **nombre público**, que es el único dato que
 * existe en las dos fuentes y que además es el que el cliente ve:
 *
 *     "Europa Básico"  → "europa-basico"
 *     "Europa Premium" → "europa-premium"
 *
 * Eso la hace estable sin necesidad de una columna nueva: mientras el nombre
 * comercial no cambie, la clave no cambia; y si el nombre cambia, la clave debe
 * cambiar, porque es otro producto de cara al cliente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Las cinco claves comerciales vigentes. Orden de gama, de menor a mayor. */
export const PLAN_KEYS = [
  "europa-basico",
  "europa-plus",
  "europa-total",
  "europa-max",
  "europa-premium",
] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

/**
 * Nombre comercial → clave.
 *
 * Determinista y sin estado: la misma entrada da la misma salida en el
 * navegador, en el servidor y en un test.
 */
export function toPlanKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[áàäâã]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöôõ]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/ç/g, "c")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** ¿Es una de las cinco claves vigentes? */
export function isKnownPlanKey(key: string): key is PlanKey {
  return (PLAN_KEYS as readonly string[]).includes(key);
}
