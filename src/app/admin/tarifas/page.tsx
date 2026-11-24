import { createClient } from '@/lib/supabase/server'
import TarifasClient from './TarifasClient'

export default async function TarifasPage() {
  const supabase = await createClient()
  const { data: tariffs } = await supabase
    .from('tariffs')
    .select('*')
    .order('type')
    .order('data_gb')

  // Costo de Vodafone: tolerante si la migración del wallet aún no está aplicada
  const { data: costRows } = await supabase.from('tariff_costs').select('tariff_id, vodafone_cost_usd')
  const costs: Record<string, number> = {}
  for (const c of costRows || []) costs[c.tariff_id] = Number(c.vodafone_cost_usd)

  return <TarifasClient tariffs={tariffs || []} costs={costs} />
}