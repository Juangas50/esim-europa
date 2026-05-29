'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email/send'
import { emailConfirmacionPartner, emailAvisoClienteProgramado } from '@/lib/email/templates'

export async function createOrder(data: {
  agencyId: string; sellerId: string; tariffId: string; type: string;
  customerName: string; customerLastname: string; customerPassport: string;
  customerNationality: string; customerDob: string; customerEmail: string;
  activationDate: string | null; pvpAtTime: number; costAtTime: number;
}) {
  const supabase = await createClient()

  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const orderRef = `R34-${String((count || 0) + 1).padStart(4, '0')}`
  const status = data.activationDate ? 'scheduled' : 'pending_review'

  // Obtener datos para el email
  const { data: seller } = await supabase.from('users').select('full_name').eq('id', data.sellerId).single()
  const { data: tariff } = await supabase.from('tariffs').select('name').eq('id', data.tariffId).single()

  const { error } = await supabase
    .from('orders')
    .insert({
      order_ref: orderRef,
      agency_id: data.agencyId,
      seller_id: data.sellerId,
      tariff_id: data.tariffId,
      type: data.type,
      customer_name: data.customerName,
      customer_lastname: data.customerLastname,
      customer_passport: data.customerPassport,
      customer_nationality: data.customerNationality,
      customer_dob: data.customerDob,
      customer_email: data.customerEmail,
      activation_date: data.activationDate,
      status,
      pvp_at_time: data.pvpAtTime,
      cost_at_time: data.costAtTime,
    })

  if (error) return { error: error.message }

  // Email al partner
  const { data: agencyUser } = await supabase
    .from('users')
    .select('*, auth_email:id')
    .eq('id', data.sellerId)
    .single()

  const { data: authUser } = await supabase.auth.admin.getUserById(data.sellerId)
  const sellerEmail = authUser?.user?.email

  if (sellerEmail) {
    const tmpl = emailConfirmacionPartner({
      orderRef,
      sellerName: seller?.full_name || 'Partner',
      customerName: data.customerName,
      customerLastname: data.customerLastname,
      tariffName: tariff?.name || '',
      type: data.type,
      activationDate: data.activationDate,
    })
    await sendEmail(sellerEmail, tmpl.subject, tmpl.html)
  }

  // Email al cliente si hay fecha programada
  if (data.activationDate && data.type === 'prepago') {
    const tmpl = emailAvisoClienteProgramado({
      customerName: data.customerName,
      tariffName: tariff?.name || '',
      activationDate: data.activationDate,
      type: data.type,
    })
    await sendEmail(data.customerEmail, tmpl.subject, tmpl.html)
  }

  revalidatePath('/pedidos')
  return { orderRef }
}