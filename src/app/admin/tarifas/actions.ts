'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-role'

const VALID_TYPES = new Set(['local', 'dataonly', 'prepago'])

type TariffForm = {
  client_name: string
  vodafone_code: string
  type: string
  data_gb: number | string
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
    validity_days: form.validity_days ? Number(form.validity_days) : null,
    badge: form.badge ? String(form.badge).trim().slice(0, 20) : null,
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
