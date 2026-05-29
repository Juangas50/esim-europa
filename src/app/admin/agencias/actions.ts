'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-role'

const NAME_MAX = 120
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function createAgency(form: { name: string; email: string }) {
  await requireAdmin()

  const name = form.name?.trim().slice(0, NAME_MAX)
  const email = form.email?.trim().toLowerCase()
  if (!name || !EMAIL_RE.test(email)) return { error: { message: 'Invalid input' } }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agencies')
    .insert({ name, email, active: true })
    .select()
    .single()
  return { data, error }
}

export async function savePricing(
  agencyId: string,
  tariffId: string,
  cost: number,
  pvp: number,
) {
  await requireAdmin()

  if (typeof cost !== 'number' || cost < 0 || typeof pvp !== 'number' || pvp < 0) {
    return { error: { message: 'Invalid pricing values' } }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('agency_pricing')
    .upsert(
      { agency_id: agencyId, tariff_id: tariffId, cost_price: cost, pvp },
      { onConflict: 'agency_id,tariff_id' },
    )
  return { error }
}

export async function getPricing(agencyId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase
    .from('agency_pricing')
    .select('*')
    .eq('agency_id', agencyId)
  return data || []
}

export async function getAgencyOrders(agencyId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, tariffs(name)')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function updateAgency(id: string, form: { name: string; email: string }) {
  await requireAdmin()

  const name = form.name?.trim().slice(0, NAME_MAX)
  const email = form.email?.trim().toLowerCase()
  if (!name || !EMAIL_RE.test(email)) return { error: { message: 'Invalid input' } }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agencies')
    .update({ name, email })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function toggleAgencyActive(id: string, active: boolean) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('agencies')
    .update({ active: Boolean(active) })
    .eq('id', id)
  return { error }
}
