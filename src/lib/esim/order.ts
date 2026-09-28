/**
 * Orden canónico de eSIMs dentro de una misma compra (payment_id).
 *
 * Regla aprobada (FASE 4B, sección 1): created_at ASC, id ASC como
 * desempate. Se usa SIEMPRE que se muestre "eSIM X de N" — Email 1/2/4/6
 * y cualquier caller nuevo — para que la misma eSIM conserve la misma
 * posición durante todo el lifecycle, sin depender del orden incidental
 * de arrays de JS, INSERT RETURNING, selección del admin o de qué filas
 * decidió reprogramar el cliente.
 *
 * No requiere ninguna columna nueva: created_at + id ya existen en
 * b2c_orders desde la migración base.
 */

export interface CanonicalOrderable {
  id: string;
  created_at: string;
  order_ref: string;
}

/** Ordena un grupo de filas por el criterio canónico. No muta el array de entrada. */
export function canonicalSort<T extends CanonicalOrderable>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const byDate = Date.parse(a.created_at) - Date.parse(b.created_at);
    if (byDate !== 0) return byDate;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

/**
 * Etiqueta "eSIM X de N" para una fila dentro de su grupo, calculada
 * contra el tamaño y orden del grupo COMPLETO (no del subconjunto que
 * se esté mostrando) — así una reprogramación parcial de 2 de 3 eSIMs
 * sigue mostrando "eSIM 1 de 3" / "eSIM 3 de 3", nunca "1 de 2"/"2 de 2".
 */
export function labelWithinGroup(orderRef: string, canonicalGroup: CanonicalOrderable[]): string {
  const total = canonicalGroup.length;
  const position = canonicalGroup.findIndex((r) => r.order_ref === orderRef) + 1;
  return `eSIM ${position} de ${total}`;
}

/**
 * Agrupa filas por payment_id + activation_date — el "grupo de
 * recordatorio" (FASE 4B §7): una compra con activation_date distinta por
 * eSIM (por reprogramaciones previas) produce un grupo por cada fecha, no
 * un único grupo por payment_id. "TODAS" en un link de reprogramación
 * significa únicamente las eSIMs de ESE grupo, nunca todas las que
 * comparten payment_id sin importar la fecha. Cada grupo devuelto ya está
 * en orden canónico.
 */
export function groupByPaymentAndActivationDate<
  T extends CanonicalOrderable & { payment_id: string | null; activation_date: string | null },
>(rows: T[]): T[][] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = `${row.payment_id ?? row.id}::${row.activation_date ?? ""}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }
  return [...groups.values()].map(canonicalSort);
}
