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
