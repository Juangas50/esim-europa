import { createAdminClient } from '@/lib/supabase/server'
import PedidosClient from './PedidosClient'
import type { UnifiedOrder } from './PedidosClient'

// ── Status mapping B2C → portal ───────────────────────────────────────────────
function mapB2CStatus(s: string): string {
  const map: Record<string, string> = {
    pending_payment: 'pending_review',
    paid:            'paid',
    processing:      'paid',
    qr_sent:         'qr_sent',
    active:          'activated',
    expired:         'expired',
    cancelled:       'cancelled',
  }
  return map[s] ?? 'pending_review'
}

export default async function PedidosAdminPage() {
  const supabase = createAdminClient()

  // ── B2B orders ────────────────────────────────────────────────────────────
  const { data: b2bOrders } = await supabase
    .from('orders')
    .select(`*, agencies(name), users(full_name), tariffs(name, type), activation_string, confirmation_code`)
    .order('created_at', { ascending: false })

  // ── B2C orders ────────────────────────────────────────────────────────────
  const { data: b2cOrders } = await supabase
    .from('b2c_orders')
    .select(`*, tariffs(name, type)`)
    .order('created_at', { ascending: false })

  // ── Normalizar B2B (siempre individuales, group_count = 1) ────────────────
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
    activation_string:    o.activation_string ?? null,
    confirmation_code:    o.confirmation_code ?? null,
    group_count:          1,
    group_orders:         [{
      id:                 o.id,
      order_ref:          o.order_ref,
      activation_string:  o.activation_string ?? null,
      confirmation_code:  o.confirmation_code ?? null,
      status:             o.status,
    }],
  }))

  // ── Normalizar B2C — agrupar por payment_id (compras de varias eSIMs) ────
  const b2cList = b2cOrders ?? []

  // Agrupar por payment_id; órdenes sin payment_id van como individuales
  const groups = new Map<string, typeof b2cList>()
  for (const o of b2cList) {
    const key = o.payment_id ?? o.id
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(o)
  }

  const normalised_b2c: UnifiedOrder[] = [...groups.values()].map(group => {
    // Ordenar por fecha para que el primero sea el representante
    group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const first = group[0]

    // Estado del grupo: paid si alguno está paid, qr_sent si TODOS están qr_sent
    const allQrSent = group.every(o => o.status === 'qr_sent')
    const anyPaid   = group.some(o => o.status === 'paid')
    const groupStatus = allQrSent ? 'qr_sent' : anyPaid ? 'paid' : mapB2CStatus(first.status)

    return {
      id:                   first.id,
      order_ref:            first.order_ref,
      type:                 first.tariffs?.type ?? 'local',
      status:               groupStatus,
      customer_name:        first.customer_name,
      customer_lastname:    first.customer_lastname,
      customer_email:       first.customer_email,
      customer_passport:    null,
      customer_nationality: first.customer_country ?? null,
      activation_date:      first.activation_date ?? null,
      pvp_at_time:          group.reduce((s, o) => s + (o.amount_usd ?? 0), 0),
      cost_at_time:         null,
      created_at:           first.created_at,
      agencies:             null,
      users:                null,
      tariffs:              first.tariffs ? { name: first.tariffs.name } : null,
      source:               'b2c',
      payment_method:       first.payment_method ?? null,
      // Para grupos: activation_string/code del pedido representativo (single = igual)
      activation_string:    group.length === 1 ? (first.activation_string ?? null) : null,
      confirmation_code:    group.length === 1 ? (first.confirmation_code ?? null) : null,
      group_count:          group.length,
      group_orders:         group.map(o => ({
        id:                o.id,
        order_ref:         o.order_ref,
        activation_string: o.activation_string ?? null,
        confirmation_code: o.confirmation_code ?? null,
        status:            o.status,
      })),
    }
  })

  // ── Unificar y ordenar por fecha desc ─────────────────────────────────────
  const all = [...normalised_b2b, ...normalised_b2c].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return <PedidosClient orders={all} />
}
