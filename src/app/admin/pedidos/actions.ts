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

  // 3. Buscar el pedido con datos del cliente y tarifa
  const supabase = createAdminClient()
  const { data: order, error: fetchError } = await supabase
    .from('b2c_orders')
    .select('*, tariffs(name, type, data_gb, duration_days)')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return { ok: false, error: 'Pedido no encontrado.' }
  }
  if (order.status === 'qr_sent') {
    return { ok: false, error: 'Este pedido ya tiene el QR enviado.' }
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
    planName: order.tariffs?.name ?? 'eSIM RUTA34',
    planGB: order.tariffs?.data_gb ?? 0,
    planDays: order.tariffs?.duration_days ?? 28,
    planType: order.tariffs?.type ?? 'dataonly',
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

  // 6. Actualizar estado del pedido
  await supabase
    .from('b2c_orders')
    .update({ status: 'qr_sent', qr_sent_at: new Date().toISOString() })
    .eq('id', orderId)

  revalidatePath('/admin/pedidos')
  return { ok: true }
}
