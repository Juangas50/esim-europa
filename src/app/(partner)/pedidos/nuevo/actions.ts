'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email/send'
import { emailConfirmacionPartner, emailAvisoClienteProgramado, emailSaldoBajo } from '@/lib/email/templates'
import { usd, walletErrorMessage, isInsufficientBalance } from '@/lib/wallet'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/

type CreateOrderInput = {
  tariffId: string
  customerName: string
  customerLastname: string
  customerPassport: string
  customerNationality: string
  customerDob: string
  customerEmail: string
  activationDate: string | null
}

export type CreateOrderResult =
  | { ok: true; orderRef: string; billingModel: 'prepaid' | 'postpaid'; balanceAfter: number | null; lowBalance: boolean }
  | { ok: false; error: string; insufficientBalance?: boolean }

function isAdultDob(dob: string): boolean {
  if (!DATE_RE.test(dob)) return false
  const d = new Date(`${dob}T00:00:00Z`)
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dob) return false
  const t = new Date()
  const limit = new Date(Date.UTC(t.getUTCFullYear() - 18, t.getUTCMonth(), t.getUTCDate()))
  return d.getTime() <= limit.getTime()
}

/**
 * Crea un pedido de agencia. La agencia sale SIEMPRE de la sesión (nunca del cliente) y el
 * precio, el descuento de saldo y la inserción ocurren juntos en la función SQL
 * `create_agency_order` (una sola transacción, con bloqueo del wallet).
 */
export async function createOrder(data: CreateOrderInput): Promise<CreateOrderResult> {
  const session = await requireAuth()
  const agencyId = session.agencyId
  if (!agencyId) return { ok: false, error: 'Tu usuario no pertenece a ninguna agencia.' }

  if (!UUID_RE.test(data.tariffId)) return { ok: false, error: 'Tarifa inválida.' }
  if (!EMAIL_RE.test(data.customerEmail.trim())) return { ok: false, error: 'El email del cliente no es válido.' }
  const name = data.customerName.trim().slice(0, 100)
  const lastname = data.customerLastname.trim().slice(0, 100)
  const passport = data.customerPassport.trim().slice(0, 30)
  if (name.length < 2 || lastname.length < 2) return { ok: false, error: 'Falta el nombre o el apellido del cliente.' }
  if (passport.length < 5) return { ok: false, error: 'El pasaporte debe tener al menos 5 caracteres.' }
  if (!isAdultDob(data.customerDob)) return { ok: false, error: 'El titular debe ser mayor de 18 años.' }

  let activationDate: string | null = data.activationDate
  if (activationDate) {
    const today = new Date().toISOString().slice(0, 10)
    const max = new Date(); max.setFullYear(max.getFullYear() + 1)
    if (!DATE_RE.test(activationDate) || activationDate < today || activationDate > max.toISOString().slice(0, 10)) {
      return { ok: false, error: 'La fecha de activación no es válida.' }
    }
  } else {
    activationDate = null
  }

  const supabase = await createClient()

  const { data: res, error } = await supabase.rpc('create_agency_order', {
    p_agency_id: agencyId,
    p_tariff_id: data.tariffId,
    p_customer_name: name,
    p_customer_lastname: lastname,
    p_customer_passport: passport,
    p_customer_nationality: data.customerNationality.trim().slice(0, 60) || 'Argentina',
    p_customer_dob: data.customerDob,
    p_customer_email: data.customerEmail.trim().toLowerCase(),
    p_activation_date: activationDate,
  })

  if (error || !res) {
    return { ok: false, error: walletErrorMessage(error?.message), insufficientBalance: isInsufficientBalance(error?.message) }
  }

  const result = res as {
    order_ref: string; billing_model: 'prepaid' | 'postpaid'
    balance_after: number | null; low_balance_alert: boolean; low_balance_threshold: number | null
  }

  // ── Emails (best effort: el pedido ya está creado y cobrado; un fallo de correo no lo revierte) ──
  try {
    const [{ data: seller }, { data: tariff }, { data: agency }, { data: authData }] = await Promise.all([
      supabase.from('users').select('full_name').eq('id', session.userId).single(),
      supabase.from('tariffs').select('name, type').eq('id', data.tariffId).single(),
      supabase.from('agencies').select('name, email').eq('id', agencyId).single(),
      supabase.auth.getUser(),
    ])
    const sellerEmail = authData?.user?.email
    if (sellerEmail) {
      const tmpl = emailConfirmacionPartner({
        orderRef: result.order_ref,
        sellerName: seller?.full_name || 'Partner',
        customerName: name,
        customerLastname: lastname,
        tariffName: tariff?.name || '',
        type: tariff?.type || 'prepago',
        activationDate,
      })
      await sendEmail(sellerEmail, tmpl.subject, tmpl.html)
    }
    if (activationDate && tariff?.type === 'prepago') {
      const tmpl = emailAvisoClienteProgramado({
        customerName: name, tariffName: tariff?.name || '', activationDate, type: tariff?.type || 'prepago',
      })
      await sendEmail(data.customerEmail.trim().toLowerCase(), tmpl.subject, tmpl.html)
    }
    // Aviso de saldo bajo: solo a la agencia, una vez al cruzar el umbral hacia abajo
    if (result.low_balance_alert && agency?.email && result.balance_after != null) {
      const tmpl = emailSaldoBajo({
        agencyName: agency.name,
        balance: usd(result.balance_after),
        threshold: usd(result.low_balance_threshold),
      })
      await sendEmail(agency.email, tmpl.subject, tmpl.html)
    }
  } catch (err) {
    console.error('[createOrder] email post-venta falló:', err)
  }

  revalidatePath('/pedidos')
  revalidatePath('/pedidos/nuevo')
  revalidatePath('/wallet')
  return {
    ok: true,
    orderRef: result.order_ref,
    billingModel: result.billing_model,
    balanceAfter: result.balance_after,
    lowBalance: !!result.low_balance_alert,
  }
}
