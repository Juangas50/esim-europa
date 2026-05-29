import { createClient } from '@/lib/supabase/server'
import AgenciasClient from './AgenciasClient'

export default async function AgenciasPage() {
  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from('agencies')
    .select('*')
    .order('name')

  const { data: tariffs } = await supabase
    .from('tariffs')
    .select('*')
    .eq('active', true)
    .order('type')

  return <AgenciasClient agencies={agencies || []} tariffs={tariffs || []} />
}