'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string, source: 'b2b' | 'b2c' = 'b2b') {
  const supabase = await createClient()
  const table = source === 'b2c' ? 'b2c_orders' : 'orders'
  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq('id', orderId)
  revalidatePath('/admin/pedidos')
  return { error }
}
