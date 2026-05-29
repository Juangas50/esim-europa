'use server'

import { createClient } from '@/lib/supabase/server'

export async function createAgency(form: { name: string; email: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agencies')
    .insert({ name: form.name, email: form.email, active: true })
    .select()
    .single()
  return { data, error }
}

export async function savePricing(agencyId: string, tariffId: string, cost: number, pvp: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('agency_pricing')
    .upsert({ agency_id: agencyId, tariff_id: tariffId, cost_price: cost, pvp }, { onConflict: 'agency_id,tariff_id' })
  return { error }
}

export async function getPricing(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('agency_pricing')
    .select('*')
    .eq('agency_id', agencyId)
  return data || []
}

export async function getAgencyOrders(agencyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, tariffs(name)')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
  return data || []
}export async function updateAgency(id: string, form: { name: string; email: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agencies')
    .update({ name: form.name, email: form.email })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function toggleAgencyActive(id: string, active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('agencies')
    .update({ active })
    .eq('id', id)
  return { error }
}