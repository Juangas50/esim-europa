'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-role'

const VALID_TYPES = new Set(['local', 'dataonly', 'prepago'])

type TariffForm = {
  client_name: string
  vodafone_code: string
  type: string
  data_gb: number | string
  eu_data_gb?: number | string | null
  validity_days?: number | string | null
  badge?: string | null
  highlight?: boolean
  position?: number | string | null
  price_usd?: number | string | null
  description?: string | null
}

function validateTariffForm(form: TariffForm) {
  const client_name = String(form.client_name ?? '').trim().slice(0, 120)
  if (!client_name) return null

  const vodafone_code = String(form.vodafone_code ?? '').trim().slice(0, 50)
  if (!vodafone_code) return null

  const type = String(form.type ?? '').trim()
  if (!VALID_TYPES.has(type)) return null

  const data_gb = Number(form.data_gb)
  if (isNaN(data_gb) || data_gb < 0 || data_gb > 9999) return null

  return {
    name: client_name,
    vodafone_code,
    type,
    data_gb,
    eu_data_gb: form.eu_data_gb != null ? Number(form.eu_data_gb) : null,
    validity_days: form.validity_days ? Number(form.validity_days) : null,
    badge: form.badge ? String(form.badge).trim().slice(0, 1000) : null,
    highlight: Boolean(form.highlight),
    position: form.position != null ? Number(form.position) : null,
    price_usd: form.price_usd != null ? Number(form.price_usd) : null,
  }
}

export async function createTariff(form: TariffForm) {
  await requireAdmin()
  const validated = validateTariffForm(form)
  if (!validated) return { error: { message: 'Invalid tariff data' } }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tariffs')
    .insert({ ...validated, active: true })
    .select()
    .single()
  return { data, error }
}

export async function deleteTariff(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('tariffs').delete().eq('id', id)
  return { error }
}

export async function updateTariff(id: string, form: TariffForm) {
  await requireAdmin()
  const validated = validateTariffForm(form)
  if (!validated) return { error: { message: 'Invalid tariff data' } }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tariffs')
    .update(validated)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}


/**
 * Costo interno de Vodafone por eSIM (solo admin; la tabla tariff_costs no tiene política para agencias).
 * Se congela en cada venta (order_internal_costs) para calcular el margen real de RUTA34.
 */
export async function saveTariffCost(tariffId: string, cost: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireAdmin()
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tariffId)) return { ok: false, error: 'Tarifa inválida.' }
  if (typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0 || cost > 100000) return { ok: false, error: 'Costo inválido.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('tariff_costs')
    .upsert({ tariff_id: tariffId, vodafone_cost_usd: Math.round(cost * 100) / 100, updated_at: new Date().toISOString(), updated_by: session.userId }, { onConflict: 'tariff_id' })
  if (error) return { ok: false, error: 'No se pudo guardar el costo.' }
  return { ok: true }
}
