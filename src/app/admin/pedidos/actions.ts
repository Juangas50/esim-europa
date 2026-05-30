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
  'pending_review', 'scheduled', 'qr_sent', 'activated', 'expired', 'cancelled',
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

// ── Entregar eSIM B2C: valida, genera QR, envía email ────────────────────────
export async function deliverB2COrder(
  orderId: string,
  activationString: string,
  confirmationCode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()

  // 1. Validar cadena de activación (misma regex que el cliente)
  const parsed = parseActivationString(activationString)
  if (!parsed.ok) return { ok: false, error: parsed.error }

  // 2. Validar código de confirmación
  if (!validateConfirmationCode(confirmationCode)) {
    return { ok: false, error: 'Código de confirmación inválido. Deben ser 4-8 dígitos numéricos.' }
  }

  // 3. Buscar el pedido — query simple sin JOIN para evitar error si FK no está configurada
  const supabase = createAdminClient()
  const { data: order, error: fetchError } = await supabase
    .from('b2c_orders')
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

  // 3b. Verificar que la cadena de activación no haya sido usada en otro pedido
  const { data: duplicate } = await supabase
    .from('b2c_orders')
    .select('order_ref')
    .eq('activation_string', parsed.data.raw)
    .neq('id', orderId)
    .neq('status', 'cancelled')
    .maybeSingle()

  if (duplicate) {
    return {
      ok: false,
      error: `Esta cadena ya fue usada en el pedido ${duplicate.order_ref}. Verificá que estés pegando el código correcto.`,
    }
  }

  // 3c. Buscar datos de tarifa por separado si existe tariff_id
  let tariff: { name: string; type: string; data_gb: number; duration_days: number } | null = null
  if (order.tariff_id) {
    const { data: t } = await supabase
      .from('tariffs')
      .select('name, type, data_gb, duration_days')
      .eq('id', order.tariff_id)
      .single()
    tariff = t
  }

  // 4. Generar QR como PNG Buffer
  let qrBuffer: Buffer
  try {
    qrBuffer = await QRCode.toBuffer(parsed.data.lpaUri, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
  } catch (e) {
    console.error('[qr] Error generando QR:', e)
    return { ok: false, error: 'Error generando el código QR. Verificá los datos.' }
  }

  // 5. Armar y enviar email de entrega
  const tmpl = emailEntregaB2C({
    customerName: order.customer_name,
    orderRef: order.order_ref,
    planName: tariff?.name ?? 'eSIM RUTA34',
    planGB: tariff?.data_gb ?? 0,
    planDays: tariff?.duration_days ?? 28,
    planType: tariff?.type ?? 'dataonly',
    activationString: parsed.data.raw,
    confirmationCode: confirmationCode.trim(),
    amountUSD: order.amount_usd ?? 0,
  })

  const { error: emailError } = await sendEmail(
    order.customer_email,
    tmpl.subject,
    tmpl.html,
    [{
      filename: 'esim-qr.png',
      content: qrBuffer,
      content_type: 'image/png',
      content_id: 'esim-qr',   // referenciado como cid:esim-qr en el HTML
    }],
  )

  if (emailError) {
    console.error('[deliver] Error enviando email:', emailError)
    return { ok: false, error: 'Error enviando el email al cliente. Intentá nuevamente.' }
  }

  // 6. Actualizar estado + guardar cadena y código para futuras consultas / reenvío
  await supabase
    .from('b2c_orders')
    .update({
      status: 'qr_sent',
      qr_sent_at: new Date().toISOString(),
      activation_string: parsed.data.raw,
      confirmation_code: confirmationCode.trim(),
    })
    .eq('id', orderId)

  revalidatePath('/admin/pedidos')
  return { ok: true }
}

// ── Reenviar email de entrega — solo pedidos ya entregados con cadena guardada ─
export async function resendDeliveryEmail(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('b2c_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) return { ok: false, error: 'Pedido no encontrado.' }

  if (!order.activation_string) {
    return { ok: false, error: 'No hay cadena de activación guardada. Solo se puede reenviar pedidos entregados desde este portal.' }
  }

  const parsed = parseActivationString(order.activation_string)
  if (!parsed.ok) return { ok: false, error: 'La cadena de activación guardada es inválida.' }

  // Tarifa
  let tariff: { name: string; type: string; data_gb: number; duration_days: number } | null = null
  if (order.tariff_id) {
    const { data: t } = await supabase
      .from('tariffs')
      .select('name, type, data_gb, duration_days')
      .eq('id', order.tariff_id)
      .single()
    tariff = t
  }

  // QR
  let qrBuffer: Buffer
  try {
    qrBuffer = await QRCode.toBuffer(parsed.data.lpaUri, {
      width: 400, margin: 2, color: { dark: '#000000', light: '#FFFFFF' },
    })
  } catch (e) {
    return { ok: false, error: 'Error generando el código QR.' }
  }

  const tmpl = emailEntregaB2C({
    customerName: order.customer_name,
    orderRef: order.order_ref,
    planName: tariff?.name ?? 'eSIM RUTA34',
    planGB: tariff?.data_gb ?? 0,
    planDays: tariff?.duration_days ?? 28,
    planType: tariff?.type ?? 'dataonly',
    activationString: parsed.data.raw,
    confirmationCode: order.confirmation_code ?? '—',
    amountUSD: order.amount_usd ?? 0,
  })

  const { error: emailError } = await sendEmail(
    order.customer_email,
    `[Reenvío] ${tmpl.subject}`,
    tmpl.html,
    [{
      filename: 'esim-qr.png',
      content: qrBuffer,
      content_type: 'image/png',
      content_id: 'esim-qr',
    }],
  )

  if (emailError) {
    console.error('[resend] Error:', emailError)
    return { ok: false, error: 'Error enviando el email. Intentá nuevamente.' }
  }

  return { ok: true }
}
