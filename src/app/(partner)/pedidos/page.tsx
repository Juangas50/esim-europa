export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PedidosPartnerClient from './PedidosPartnerClient'

export default async function MisPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, tariffs(name)')
    .eq('agency_id', profile?.agency_id)
    .order('created_at', { ascending: false })

  return <PedidosPartnerClient orders={orders || []} />
}