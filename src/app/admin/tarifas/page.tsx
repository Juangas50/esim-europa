import { createClient } from '@/lib/supabase/server'
import TarifasClient from './TarifasClient'

export default async function TarifasPage() {
  const supabase = await createClient()
  const { data: tariffs } = await supabase
    .from('tariffs')
    .select('*')
    .order('type')
    .order('data_gb')

  return <TarifasClient tariffs={tariffs || []} />
}