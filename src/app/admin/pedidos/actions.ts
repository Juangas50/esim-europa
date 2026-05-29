'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES = new Set([
  'pending_review', 'scheduled', 'qr_sent', 'activated', 'expired', 'cancelled',
])

export async function updateOrderStatus(
  orderId: string,
  status: string,
  source: 'b2b' | 'b2c' = 'b2b',
) {
  await requireAdmin()

  if (!VALID_STATUSES.has(status)) {
    return { error: { message: `Invalid status: ${status}` } }
  }

  const supabase = await createClient()
  const table = source === 'b2c' ? 'b2c_orders' : 'orders'
  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq('id', orderId)

  revalidatePath('/admin/pedidos')
  return { error }
}
