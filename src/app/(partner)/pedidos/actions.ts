'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'
import { walletErrorMessage } from '@/lib/wallet'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Cancela un pedido de la propia agencia. Solo es posible mientras RUTA34 no haya empezado a
 * gestionarlo; la función SQL `cancel_agency_order` lo valida con bloqueo de fila y devuelve el
 * saldo en la misma transacción (si la agencia es prepago).
 */
export async function cancelOrder(orderId: string): Promise<
  { ok: true; refunded: boolean; balanceAfter: number | null } | { ok: false; error: string }
> {
  await requireAuth()
  if (!UUID_RE.test(orderId)) return { ok: false, error: 'Pedido inválido.' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('cancel_agency_order', { p_order_id: orderId })
  if (error || !data) return { ok: false, error: walletErrorMessage(error?.message) }

  revalidatePath('/pedidos')
  revalidatePath('/pedidos/nuevo')
  revalidatePath('/wallet')
  const r = data as { refunded: boolean; balance_after: number | null }
  return { ok: true, refunded: r.refunded, balanceAfter: r.balance_after }
}
