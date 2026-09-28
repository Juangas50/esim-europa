// Resolución compartida de "grupo autorizado" para reprogramar — usada por
// el Server Component (page.tsx, solo lectura) y por la server action de
// escritura (actions.ts). Alternativa A aprobada: no hay tabla ni token
// opaco nuevo, se reutiliza (order_ref, reschedule_token) por fila.
import { createAdminClient } from "@/lib/supabase/server"
import { canonicalSort, type CanonicalOrderable } from "@/lib/esim/order"

export interface ReprogramarPair {
  ref: string
  token: string
}

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// order_ref real: generateOrderRef() produce "R34-<base36>-<hex6>" — este
// charset es más amplio a propósito (por si el formato cambia), pero
// excluye todo carácter que rompería la sintaxis de filtro de PostgREST
// (',', '(', ')', '.', etc.), que es lo que realmente hay que garantizar
// acá al construir el filtro .or() a mano.
const REF_RE = /^[A-Za-z0-9_-]{1,60}$/
export const MAX_PAIRS = 10

/** Parsea "ref1:token1,ref2:token2,..." — null si el formato es inválido. */
export function parsePairsParam(raw: string): ReprogramarPair[] | null {
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0 || parts.length > MAX_PAIRS) return null

  const pairs: ReprogramarPair[] = []
  for (const part of parts) {
    const sep = part.indexOf(":")
    if (sep === -1) return null
    const ref = part.slice(0, sep)
    const token = part.slice(sep + 1)
    if (!REF_RE.test(ref) || !TOKEN_RE.test(token)) return null
    pairs.push({ ref, token })
  }

  const uniqueRefs = new Set(pairs.map((p) => p.ref))
  if (uniqueRefs.size !== pairs.length) return null // refs repetidos → link corrupto

  return pairs
}

export function isValidLegacyPair(ref: string | undefined, token: string | undefined): ReprogramarPair | null {
  if (!ref || !token) return null
  if (!REF_RE.test(ref) || !TOKEN_RE.test(token)) return null
  return { ref, token }
}

export interface ResolvedRow extends CanonicalOrderable {
  status: string
  activation_date: string | null
  customer_name: string
  customer_email: string
  payment_id: string | null
  locale: string
  tariff_name: string | null
}

export type ResolveResult =
  | { ok: true; rows: ResolvedRow[] }
  | { ok: false; error: string }

const GENERIC_INVALID_ERROR = "No encontramos tu pedido. El link puede haber expirado."

/**
 * Resuelve y autoriza un grupo de pares (ref, token) — all-or-nothing:
 * cada par declarado debe resolver EXACTAMENTE una fila real, y todas las
 * filas resueltas deben compartir el mismo payment_id (nunca se autoriza
 * solo por payment_id — cada par ya se validó individualmente antes).
 * Cualquier par inválido rechaza el conjunto completo, cero side effects.
 */
export async function resolveAuthorizedGroup(pairs: ReprogramarPair[]): Promise<ResolveResult> {
  if (pairs.length === 0 || pairs.length > MAX_PAIRS) return { ok: false, error: GENERIC_INVALID_ERROR }

  const supabase = createAdminClient()
  const orFilter = pairs
    .map((p) => `and(order_ref.eq.${p.ref},reschedule_token.eq.${p.token})`)
    .join(",")

  const { data, error } = await supabase
    .from("b2c_orders")
    .select("id, order_ref, status, activation_date, created_at, customer_name, customer_email, payment_id, locale, tariffs(name)")
    .or(orFilter)

  if (error || !data) return { ok: false, error: GENERIC_INVALID_ERROR }
  if (data.length !== pairs.length) return { ok: false, error: GENERIC_INVALID_ERROR }

  const paymentIds = new Set(data.map((r) => r.payment_id))
  if (paymentIds.size > 1) return { ok: false, error: GENERIC_INVALID_ERROR }

  const rows: ResolvedRow[] = data.map((r) => ({
    id: r.id,
    order_ref: r.order_ref,
    created_at: r.created_at,
    status: r.status,
    activation_date: r.activation_date,
    customer_name: r.customer_name,
    customer_email: r.customer_email,
    payment_id: r.payment_id,
    locale: r.locale,
    tariff_name: (r as unknown as { tariffs: { name: string } | null }).tariffs?.name ?? null,
  }))

  return { ok: true, rows: canonicalSort(rows) }
}
