'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAgency } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email/send'
import { emailConfirmacionPartner, emailAvisoClienteProgramado } from '@/lib/email/templates'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function createOrder(data: {
  agencyId: string; sellerId: string; tariffId: string; type: string;
  customerName: string; customerLastname: string; customerPassport: string;
  customerNationality: string; customerDob: string; customerEmail: string;
  activationDate: string | null;
}) {
  // ── P1-05: Verificar que el usuario autenticado pertenece a la agencia ──────
  await requireAgency(data.agencyId)

  // ── Validación de inputs ──────────────────────────────────────────────────
  if (!UUID_RE.test(data.agencyId) || !UUID_RE.test(data.tariffId)) {
    return { error: 'Invalid IDs' }
  }
  if (!['prepago', 'dataonly'].includes(data.type)) {
    return { error: 'Invalid type' }
  }
  if (!EMAIL_RE.test(data.customerEmail)) {
    return { error: 'Invalid email' }
  }
  const customerName     = data.customerName.trim().slice(0, 100)
  const customerLastname = data.customerLastname.trim().slice(0, 100)
  if (!customerName || !customerLastname) return { error: 'Missing customer name' }

  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  // ── Precio/costo siempre server-side — nunca confiar en lo que manda el cliente ──
  const { data: pricingRow } = await supabase
    .from('agency_pricing')
    .select('pvp, cost_price')
    .eq('agency_id', data.agencyId)
    .eq('tariff_id', data.tariffId)
    .single()

  if (!pricingRow || pricingRow.pvp <= 0) {
    return { error: 'Tarifa no disponible para esta agencia' }
  }

  // ── P2-09: orderRef con crypto — no más contador secuencial ──────────────
  const orderRef = `R34-${crypto.randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase()}`
  const status   = data.activationDate ? 'scheduled' : 'pending_review'

  // Datos para el email (con admin client para getUserById)
  const [{ data: seller }, { data: tariff }] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', data.sellerId).single(),
    supabase.from('tariffs').select('name').eq('id', data.tariffId).single(),
  ])

  const { error } = await supabase
    .from('orders')
    .insert({
      order_ref:            orderRef,
      agency_id:            data.agencyId,
      seller_id:            data.sellerId,
      tariff_id:            data.tariffId,
      type:                 data.type,
      customer_name:        customerName,
      customer_lastname:    customerLastname,
      customer_passport:    data.customerPassport.trim().slice(0, 30),
      customer_nationality: data.customerNationality.trim().slice(0, 60),
      customer_dob:         data.customerDob || null,
      customer_email:       data.customerEmail.trim().toLowerCase(),
      activation_date:      data.activationDate,
      status,
      pvp_at_time:          pricingRow.pvp,
      cost_at_time:         pricingRow.cost_price,
    })

  if (error) return { error: error.message }

  // ── Emails ────────────────────────────────────────────────────────────────
  // Usar adminClient para getUserById (requiere service role)
  const { data: authUser } = await adminSupabase.auth.admin.getUserById(data.sellerId)
  const sellerEmail = authUser?.user?.email

  if (sellerEmail) {
    const tmpl = emailConfirmacionPartner({
      orderRef,
      sellerName:       seller?.full_name || 'Partner',
      customerName,
      customerLastname,
      tariffName:       tariff?.name || '',
      type:             data.type,
      activationDate:   data.activationDate,
    })
    await sendEmail(sellerEmail, tmpl.subject, tmpl.html)
  }

  if (data.activationDate && data.type === 'prepago') {
    const tmpl = emailAvisoClienteProgramado({
      customerName,
      tariffName:     tariff?.name || '',
      activationDate: data.activationDate,
      type:           data.type,
    })
    await sendEmail(data.customerEmail.trim().toLowerCase(), tmpl.subject, tmpl.html)
  }

  revalidatePath('/pedidos')
  return { orderRef }
}
