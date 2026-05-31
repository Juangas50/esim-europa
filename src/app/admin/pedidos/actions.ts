'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'
import { parseActivationString, validateConfirmationCode } from '@/lib/esim/validate'
import { sendEmail } from '@/lib/email/send'
import { emailEntregaB2C } from '@/lib/email/templates'
import QRCode from 'qrcode'

const VALID_STATUSES = new Set([
  'pending_review', 'paid', 'scheduled', 'qr_sent', 'activated', 'expired', 'cancelled',
])

export async function updateOrderStatus(
  orderId: string,
  status: string,
  source: 'b2b' | 'b2c' = 'b2b',
) {
  await requireAdmin()

  if (!VALID_STATUSES.has(status)) {
    return { error: { message: `Invalid status: ${status}` } }
  }

  const supabase = await createClient()
  const table = source === 'b2c' ? 'b2c_orders' : 'orders'
  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq('id', orderId)

  revalidatePath('/admin/pedidos')
  return { error }
}

// ── Helper interno: lógica compartida de entrega ─────────────────────────────
async function _deliverCore(
  orderId: string,
  source: 'b2b' | 'b2c',
  activationString: string,
  confirmationCode: string,
  overrideEmail?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = parseActivationString(activationString)
  if (!parsed.ok) return { ok: false, error: parsed.error }

  if (!validateConfirmationCode(confirmationCode)) {
    return { ok: false, error: 'Código de confirmación inválido. Deben ser 4-8 dígitos numéricos.' }
  }

  const supabase = createAdminClient()
  const table = source === 'b2c' ? 'b2c_orders' : 'orders'

  // Buscar el pedido
  const { data: order, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    console.error('[deliver] fetchError:', fetchError)
    return { ok: false, error: 'Pedido no encontrado.' }
  }
  if (order.status === 'qr_sent') {
    return { ok: false, error: 'Este pedido ya tiene el QR enviado.' }
  }

  // Verificar cadena duplicada en AMBAS tablas (b2c_orders y orders)
  // para garantizar unicidad global independientemente del canal
  const [{ data: dupB2C }, { data: dupB2B }] = await Promise.all([
    supabase
      .from('b2c_orders')
      .select('order_ref, id')
      .eq('activation_string', parsed.data.raw)
      .neq('status', 'cancelled')
      .maybeSingle(),
    supabase
      .from('orders')
      .select('order_ref, id')
      .eq('activation_string', parsed.data.raw)
      .neq('status', 'cancelled')
      .maybeSingle(),
  ])

  // Excluir el propio pedido, buscar cualquier otro que use la misma cadena
  const duplicate = [dupB2C, dupB2B].find(d => d && d.id !== orderId)

  if (duplicate) {
    return {
      ok: false,
      error: `⛔ Esta cadena ya fue asignada al pedido ${duplicate.order_ref}. Cada cadena de activación es única y solo puede usarse una vez. Verificá que estés pegando el código correcto para este cliente.`,
    }
  }

  // Datos de tarifa
  let tariff: { name: string; type: string; data_gb: number; duration_days: number } | null = null
  if (order.tariff_id) {
    const { data: t } = await supabase
      .from('tariffs')
      .select('name, type, data_gb, duration_days')
      .eq('id', order.tariff_id)
      .single()
    tariff = t
  }

  // Generar QR
  let qrBuffer: Buffer
  try {
    qrBuffer = await QRCode.toBuffer(parsed.data.lpaUri, {
      width: 400, margin: 2, color: { dark: '#000000', light: '#FFFFFF' },
    })
  } catch (e) {
    console.error('[qr] Error generando QR:', e)
    return { ok: false, error: 'Error generando el código QR. Verificá los datos.' }
  }

  // Subir a Storage
  let qrUrl: string | undefined
  try {
    await supabase.storage
      .from('qr-codes')
      .upload(`${orderId}.png`, qrBuffer, { contentType: 'image/png', upsert: true })
    const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(`${orderId}.png`)
    qrUrl = urlData.publicUrl
  } catch (e) {
    console.warn('[deliver] No se pudo subir QR a Storage, usando cid: como fallback', e)
  }

  // Email de destino — usar override si se proporcionó, si no el registrado
  const recipientEmail = (overrideEmail && overrideEmail.trim()) ? overrideEmail.trim() : order.customer_email

  // Importe — B2C usa amount_usd, B2B usa pvp_at_time
  const amountUSD = source === 'b2c'
    ? (order.amount_usd ?? 0)
    : (order.pvp_at_time ?? 0)

  // Email de entrega
  const tmpl = emailEntregaB2C({
    customerName: order.customer_name,
    orderRef: order.order_ref,
    planName: tariff?.name ?? 'eSIM RUTA34',
    planGB: tariff?.data_gb ?? 0,
    planDays: tariff?.duration_days ?? 28,
    planType: tariff?.type ?? 'local',
    activationString: parsed.data.raw,
    confirmationCode: confirmationCode.trim(),
    amountUSD,
    qrUrl,
  })

  const { error: emailError } = await sendEmail(
    recipientEmail,
    tmpl.subject,
    tmpl.html,
    [{ filename: 'esim-qr.png', content: qrBuffer, content_type: 'image/png', content_id: 'esim-qr' }],
  )

  if (emailError) {
    console.error('[deliver] Error enviando email:', emailError)
    return { ok: false, error: 'Error enviando el email al cliente. Intentá nuevamente.' }
  }

  // Actualizar estado + guardar cadena + actualizar email si fue corregido
  const updatePayload: Record<string, string> = {
    status: 'qr_sent',
    qr_sent_at: new Date().toISOString(),
    activation_string: parsed.data.raw,
    confirmation_code: confirmationCode.trim(),
  }
  if (overrideEmail && overrideEmail.trim() && overrideEmail.trim() !== order.customer_email) {
    updatePayload.customer_email = overrideEmail.trim()
    console.log(`[deliver] Email actualizado: ${order.customer_email} → ${overrideEmail.trim()}`)
  }

  await supabase
    .from(table)
    .update(updatePayload)
    .eq('id', orderId)

  revalidatePath('/admin/pedidos')
  return { ok: true }
}

// ── Entregar eSIM — funciona para B2C y B2B ───────────────────────────────────
export async function deliverOrder(
  orderId: string,
  source: 'b2b' | 'b2c',
  activationString: string,
  confirmationCode: string,
  overrideEmail?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()
  return _deliverCore(orderId, source, activationString, confirmationCode, overrideEmail)
}

// Alias para compatibilidad — internamente usa deliverOrder
export async function deliverB2COrder(
  orderId: string,
  activationString: string,
  confirmationCode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()
  return _deliverCore(orderId, 'b2c', activationString, confirmationCode)
}

// ── Reenviar email — funciona para B2C y B2B ─────────────────────────────────
export async function resendDeliveryEmail(
  orderId: string,
  source: 'b2b' | 'b2c' = 'b2c',
  overrideEmail?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()

  const supabase = createAdminClient()
  const table = source === 'b2c' ? 'b2c_orders' : 'orders'

  const { data: order } = await supabase
    .from(table)
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) return { ok: false, error: 'Pedido no encontrado.' }

  if (!order.activation_string) {
    return { ok: false, error: 'No hay cadena de activación guardada. Solo se puede reenviar pedidos entregados desde este portal.' }
  }

  const parsed = parseActivationString(order.activation_string)
  if (!parsed.ok) return { ok: false, error: 'La cadena de activación guardada es inválida.' }

  let tariff: { name: string; type: string; data_gb: number; duration_days: number } | null = null
  if (order.tariff_id) {
    const { data: t } = await supabase
      .from('tariffs')
      .select('name, type, data_gb, duration_days')
      .eq('id', order.tariff_id)
      .single()
    tariff = t
  }

  let qrBuffer: Buffer
  try {
    qrBuffer = await QRCode.toBuffer(parsed.data.lpaUri, {
      width: 400, margin: 2, color: { dark: '#000000', light: '#FFFFFF' },
    })
  } catch {
    return { ok: false, error: 'Error generando el código QR.' }
  }

  let qrUrl: string | undefined
  try {
    await supabase.storage
      .from('qr-codes')
      .upload(`${orderId}.png`, qrBuffer, { contentType: 'image/png', upsert: true })
    const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(`${orderId}.png`)
    qrUrl = urlData.publicUrl
  } catch {}

  const recipientEmail = (overrideEmail && overrideEmail.trim()) ? overrideEmail.trim() : order.customer_email
  const amountUSD = source === 'b2c'
    ? (order.amount_usd ?? 0)
    : (order.pvp_at_time ?? 0)

  const tmpl = emailEntregaB2C({
    customerName: order.customer_name,
    orderRef: order.order_ref,
    planName: tariff?.name ?? 'eSIM RUTA34',
    planGB: tariff?.data_gb ?? 0,
    planDays: tariff?.duration_days ?? 28,
    planType: tariff?.type ?? 'local',
    activationString: parsed.data.raw,
    confirmationCode: order.confirmation_code ?? '—',
    amountUSD,
    qrUrl,
  })

  const { error: emailError } = await sendEmail(
    recipientEmail,
    `[Reenvío] ${tmpl.subject}`,
    tmpl.html,
    [{ filename: 'esim-qr.png', content: qrBuffer, content_type: 'image/png', content_id: 'esim-qr' }],
  )

  if (emailError) {
    console.error('[resend] Error:', emailError)
    return { ok: false, error: 'Error enviando el email. Intentá nuevamente.' }
  }

  return { ok: true }
}
