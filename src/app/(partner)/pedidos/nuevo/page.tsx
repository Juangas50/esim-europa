export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NuevoPedidoClient, { type Tariff, type Recent } from './NuevoPedidoClient'

export default async function NuevoPedidoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  const agencyId = profile?.agency_id
  if (!agencyId) redirect('/pedidos')

  const [{ data: tariffs }, { data: pricing }, { data: agency }, { data: recent }] = await Promise.all([
    supabase.from('tariffs').select('id, name, type, data_gb, validity_days').eq('active', true).order('type').order('data_gb'),
    supabase.from('agency_pricing').select('tariff_id, cost_price, pvp').eq('agency_id', agencyId),
    supabase.from('agencies').select('billing_model').eq('id', agencyId).maybeSingle(),
    supabase
      .from('orders')
      .select('id, order_ref, customer_name, customer_lastname, status, cost_at_time, pvp_at_time, created_at, tariffs(name)')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Wallet: solo agencias prepago. Consulta tolerante (si falla, se trata como postpago).
  const prepaid = agency?.billing_model === 'prepaid'
  let balance: number | null = null
  let threshold = 100
  if (prepaid) {
    const { data: w } = await supabase
      .from('agency_wallets').select('balance, low_balance_threshold').eq('agency_id', agencyId).maybeSingle()
    if (w) { balance = Number(w.balance); threshold = Number(w.low_balance_threshold) }
  }

  return (
    <NuevoPedidoClient
      tariffs={(tariffs || []) as unknown as Tariff[]}
      pricing={(pricing || []).map(p => ({ tariff_id: p.tariff_id, cost_price: Number(p.cost_price), pvp: Number(p.pvp) }))}
      agencyId={agencyId}
      billingModel={prepaid && balance != null ? 'prepaid' : 'postpaid'}
      initialBalance={balance}
      threshold={threshold}
      recent={(recent || []) as unknown as Recent[]}
    />
  )
}
