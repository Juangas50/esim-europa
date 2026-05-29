export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NuevoPedidoClient from './NuevoPedidoClient'

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

  const { data: tariffs } = await supabase
    .from('tariffs')
    .select('*')
    .eq('active', true)
    .order('type')
    .order('data_gb')

  const { data: pricing } = await supabase
    .from('agency_pricing')
    .select('*')
    .eq('agency_id', agencyId)

  return (
    <NuevoPedidoClient
      tariffs={tariffs || []}
      pricing={pricing || []}
      agencyId={agencyId}
      sellerId={user.id}
    />
  )
}