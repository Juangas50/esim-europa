'use server'

import { createClient } from '@/lib/supabase/server'

export async function createTariff(form: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tariffs')
    .insert({
      name: form.name,
      type: form.type,
      data_gb: Number(form.data_gb),
      validity_days: form.validity_days ? Number(form.validity_days) : null,
      badge: form.badge || null,
      highlight: form.highlight,
      active: true,
    })
    .select()
    .single()

  return { data, error }
}

export async function deleteTariff(id: string) {
  const supabase = await createClient()
  await supabase.from('tariffs').delete().eq('id', id)
}export async function updateTariff(id: string, form: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tariffs')
    .update({
      name: form.name,
      type: form.type,
      data_gb: Number(form.data_gb),
      validity_days: form.validity_days ? Number(form.validity_days) : null,
      badge: form.badge || null,
      highlight: form.highlight,
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}