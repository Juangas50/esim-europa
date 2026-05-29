import { createClient } from '@/lib/supabase/server'
import PedidosClient from './PedidosClient'
import type { UnifiedOrder } from './PedidosClient'

// ── Status mapping B2C → portal ───────────────────────────────────────────────
function mapB2CStatus(s: string): string {
  const map: Record<string, string> = {
    pending_payment: 'pending_review',
    paid:            'scheduled',
    processing:      'scheduled',
    qr_sent:         'qr_sent',
    active:          'activated',
    expired:         'expired',
    cancelled:       'cancelled',
  }
  return map[s] ?? 'pending_review'
}

export default async function PedidosAdminPage() {
  const supabase = await createClient()

  // ── B2B orders ────────────────────────────────────────────────────────────
  const { data: b2bOrders } = await supabase
    .from('orders')
    .select(`*, agencies(name), users(full_name), tariffs(name, type)`)
    .order('created_at', { ascending: false })

  // ── B2C orders (desde la web esim-europa) ────────────────────────────────
  const { data: b2cOrders } = await supabase
    .from('b2c_orders')
    .select(`*, tariffs(name, type)`)
    .order('created_at', { ascending: false })

  // ── Normalizar B2B ────────────────────────────────────────────────────────
  const normalised_b2b: UnifiedOrder[] = (b2bOrders ?? []).map(o => ({
    id:                   o.id,
    order_ref:            o.order_ref,
    type:                 o.type ?? 'prepago',
    status:               o.status,
    customer_name:        o.customer_name,
    customer_lastname:    o.customer_lastname,
    customer_email:       o.customer_email,
    customer_passport:    o.customer_passport ?? null,
    customer_nationality: o.customer_nationality ?? null,
    activation_date:      o.activation_date ?? null,
    pvp_at_time:          o.pvp_at_time ?? 0,
    cost_at_time:         o.cost_at_time ?? null,
    created_at:           o.created_at,
    agencies:             o.agencies ?? null,
    users:                o.users ?? null,
    tariffs:              o.tariffs ?? null,
    source:               'b2b',
    payment_method:       null,
  }))

  // ── Normalizar B2C ────────────────────────────────────────────────────────
  const normalised_b2c: UnifiedOrder[] = (b2cOrders ?? []).map(o => ({
    id:                   o.id,
    order_ref:            o.order_ref,
    type:                 o.tariffs?.type ?? 'local',
    status:               mapB2CStatus(o.status),
    customer_name:        o.customer_name,
    customer_lastname:    o.customer_lastname,
    customer_email:       o.customer_email,
    customer_passport:    null,
    customer_nationality: o.customer_country ?? null,
    activation_date:      o.activation_date ?? null,
    pvp_at_time:          o.amount_usd ?? 0,
    cost_at_time:         null,
    created_at:           o.created_at,
    agencies:             null,
    users:                null,
    tariffs:              o.tariffs ? { name: o.tariffs.name } : null,
    source:               'b2c',
    payment_method:       o.payment_method ?? null,
  }))

  // ── Unificar y ordenar por fecha desc ─────────────────────────────────────
  const all = [...normalised_b2b, ...normalised_b2c].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return <PedidosClient orders={all} />
}
