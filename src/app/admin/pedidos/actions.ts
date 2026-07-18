'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'
import { parseActivationString, validateConfirmationCode } from '@/lib/esim/validate'
import { sendEmail } from '@/lib/email/send'
import { emailEntregaB2C, emailEntregaMultiple } from '@/lib/email/templates'
import QRCode from 'qrcode'

// B2B (`orders`) y B2C (`b2c_orders`) tienen CHECK constraints de status
// distintos en la base de datos — usar un único set compartido dejaba pasar
// estados que la tabla B2C rechaza (y viceversa). Ver supabase/migrations/
// 20260524_b2c_orders.sql para el constraint real de b2c_orders.
const VALID_STATUSES_B2B = new Set([
  'pending_review', 'paid', 'scheduled', 'qr_sent', 'activated', 'expired', 'cancelled',
])
const VALID_STATUSES_B2C = new Set([
  'pending_payment', 'paid', 'processing', 'qr_sent', 'active', 'expired', 'cancelled', 'error',
])

export async function updateOrderStatus(
  orderId: string,
  status: string,
  source: 'b2b' | 'b2c' = 'b2b',
) {
  await requireAdmin()

  const validStatuses = source === 'b2c' ? VALID_STATUSES_B2C : VALID_STATUSES_B2B
  if (!validStatuses.has(status)) {
    return { error: { message: `Invalid status: ${status}` } }
  }

  // b2c_orders solo permite escritura a service_role (ver migración de RLS) —
  // el cliente con RLS no puede actualizarla y falla en silencio (0 filas, sin error).
  const supabase = createAdminClient()
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
  let tariff: { name: string; type: string; data_gb: number; eu_data_gb?: number; validity_days: number } | null = null
  if (order.tariff_id) {
    const { data: t, error: tariffError } = await supabase
      .from('tariffs')
      .select('name, type, data_gb, eu_data_gb, validity_days')
      .eq('id', order.tariff_id)
      .single()
    if (tariffError || !t) {
      console.error('[deliver] Error cargando tarifa:', tariffError)
      return { ok: false, error: 'No se pudo cargar la información de la tarifa. Intentá nuevamente.' }
    }
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

  // Subir a Storage — si falla, el email NO debe salir: se aborta y el pedido
  // queda visible en estado de error en vez de silenciarlo con el fallback cid:.
  let qrUrl: string | undefined
  try {
    const { error: uploadError } = await supabase.storage
      .from('qr-codes')
      .upload(`${orderId}.png`, qrBuffer, { contentType: 'image/png', upsert: true })
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(`${orderId}.png`)
    qrUrl = urlData.publicUrl
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido subiendo el QR'
    console.error('[deliver] Fallo subiendo QR a Storage, abortando entrega:', e)
    if (table === 'b2c_orders') {
      await supabase.from(table).update({ status: 'error', delivery_error: message }).eq('id', orderId)
    }
    // TODO: `orders` (B2B) no tiene columna delivery_error/status 'error' verificada en
    // migraciones — si se quiere el mismo tracking para B2B, agregar la migración análoga.
    return { ok: false, error: `No se pudo subir el QR a Storage, la entrega fue abortada: ${message}` }
  }

  // Email de destino — usar override si se proporcionó, si no el registrado
  const recipientEmail = (overrideEmail && overrideEmail.trim()) ? overrideEmail.trim() : order.customer_email

  // Importe — B2C usa amount_usd, B2B usa pvp_at_time
  const amountUSD = source === 'b2c'
    ? (order.amount_usd ?? 0)
    : (order.pvp_at_time ?? 0)

  // Actualizar estado + guardar cadena PRIMERO (antes de enviar email)
  const updatePayload: Record<string, string | null> = {
    status: 'qr_sent',
    activation_string: parsed.data.raw,
    confirmation_code: confirmationCode.trim(),
  }
  if (table === 'b2c_orders') {
    updatePayload.delivery_error = null // limpiar un posible error de un intento anterior
  }
  if (overrideEmail && overrideEmail.trim() && overrideEmail.trim() !== order.customer_email) {
    updatePayload.customer_email = overrideEmail.trim()
    console.log(`[deliver] Email actualizado: ${order.customer_email} → ${overrideEmail.trim()}`)
  }

  const { error: updateError } = await supabase
    .from(table)
    .update(updatePayload)
    .eq('id', orderId)

  if (updateError) {
    console.error('[deliver] Error guardando datos:', updateError)
    return { ok: false, error: 'Error guardando los datos en la BD. Intentá nuevamente.' }
  }

  // Ahora enviar email (los datos ya están guardados)
  const tmpl = emailEntregaB2C({
    customerName: order.customer_name,
    orderRef: order.order_ref,
    planName: tariff?.name ?? 'eSIM RUTA34',
    planGB: tariff?.data_gb ?? 0,
    planEUGB: tariff?.eu_data_gb,
    planDays: tariff?.validity_days ?? 28,
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
    console.warn('[deliver] Email no se envió, pero datos SÍ están guardados:', emailError)
    return { ok: true } // ← Los datos YA están guardados, solo el email falló
  }

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

  let tariff: { name: string; type: string; data_gb: number; validity_days: number } | null = null
  if (order.tariff_id) {
    const { data: t } = await supabase
      .from('tariffs')
      .select('name, type, data_gb, validity_days')
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
    const { error: uploadError } = await supabase.storage
      .from('qr-codes')
      .upload(`${orderId}.png`, qrBuffer, { contentType: 'image/png', upsert: true })
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(`${orderId}.png`)
    qrUrl = urlData.publicUrl
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido subiendo el QR'
    console.error('[resend] Fallo subiendo QR a Storage, abortando reenvío:', e)
    // El pedido ya fue entregado antes (status sigue en qr_sent) — solo dejamos
    // constancia del fallo de este reenvío puntual, sin marcar status 'error'.
    if (table === 'b2c_orders') {
      await supabase.from(table).update({ delivery_error: message }).eq('id', orderId)
    }
    return { ok: false, error: `No se pudo subir el QR a Storage, el reenvío fue abortado: ${message}` }
  }

  const recipientEmail = (overrideEmail && overrideEmail.trim()) ? overrideEmail.trim() : order.customer_email
  const amountUSD = source === 'b2c'
    ? (order.amount_usd ?? 0)
    : (order.pvp_at_time ?? 0)

  const tmpl = emailEntregaB2C({
    customerName: order.customer_name,
    orderRef: order.order_ref,
    planName: tariff?.name ?? 'eSIM RUTA34',
    planGB: tariff?.data_gb ?? 0,
    planDays: tariff?.validity_days ?? 28,
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

  if (table === 'b2c_orders' && order.delivery_error) {
    await supabase.from(table).update({ delivery_error: null }).eq('id', orderId)
  }

  return { ok: true }
}

// ── Reenvío de grupo MultiSIM ─────────────────────────────────────────────────
export async function resendGroupOrders(
  groupOrderIds: string[],
  recipientEmail: string,
  customerName: string,
  amountUSD: number,
  overrideEmail?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()

  const supabase = createAdminClient()
  const toEmail = (overrideEmail?.trim()) ? overrideEmail.trim() : recipientEmail

  // Obtener datos de cada pedido del grupo
  const { data: orders } = await supabase
    .from('b2c_orders')
    .select('id, order_ref, activation_string, confirmation_code, tariff_id, status')
    .in('id', groupOrderIds)

  if (!orders || orders.length === 0) return { ok: false, error: 'Pedidos no encontrados.' }

  const missing = orders.filter(o => !o.activation_string)
  if (missing.length > 0) {
    return { ok: false, error: `${missing.length} eSIM(s) sin cadena guardada. Solo se puede reenviar pedidos entregados desde este portal.` }
  }

  // Obtener tarifa del primer pedido
  let tariff: { name: string; type: string; data_gb: number; validity_days: number } | null = null
  const firstTariffId = orders[0]?.tariff_id
  if (firstTariffId) {
    const { data: t } = await supabase.from('tariffs').select('name, type, data_gb, validity_days').eq('id', firstTariffId).single()
    tariff = t
  }

  // Regenerar N QRs
  const esimItems: Array<{ label: string; orderRef: string; activationString: string; confirmationCode: string; qrUrl?: string }> = []

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i]
    const parsed = parseActivationString(o.activation_string!)
    if (!parsed.ok) return { ok: false, error: `Cadena inválida en pedido ${o.order_ref}` }

    let qrUrl: string | undefined
    try {
      const qrBuffer = await QRCode.toBuffer(parsed.data.lpaUri, { width: 400, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } })
      const { error: uploadError } = await supabase.storage.from('qr-codes').upload(`${o.id}.png`, qrBuffer, { contentType: 'image/png', upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(`${o.id}.png`)
      qrUrl = urlData.publicUrl
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido subiendo el QR'
      console.error(`[resend-group] Fallo subiendo QR de ${o.order_ref}, abortando reenvío del grupo:`, e)
      // Grupo ya entregado antes — no se marca 'error' de status, solo se deja
      // constancia del fallo de este reenvío y se aborta el envío completo.
      await supabase.from('b2c_orders').update({ delivery_error: message }).eq('id', o.id)
      return { ok: false, error: `No se pudo subir el QR de ${o.order_ref}, el reenvío del grupo fue abortado: ${message}` }
    }

    esimItems.push({
      label: `eSIM ${i + 1} de ${orders.length}`,
      orderRef: o.order_ref,
      activationString: o.activation_string!,
      confirmationCode: o.confirmation_code ?? '—',
      qrUrl,
    })
  }

  const tmpl = emailEntregaMultiple({
    customerName,
    totalCount: orders.length,
    planName: tariff?.name ?? 'eSIM RUTA34',
    planGB: tariff?.data_gb ?? 0,
    planDays: tariff?.validity_days ?? 28,
    planType: tariff?.type ?? 'local',
    amountUSD,
    esims: esimItems,
  })

  const { error: emailError } = await sendEmail(toEmail, `[Reenvío] ${tmpl.subject}`, tmpl.html)
  if (emailError) return { ok: false, error: 'Error enviando el email. Intentá nuevamente.' }

  await supabase.from('b2c_orders').update({ delivery_error: null }).in('id', groupOrderIds)

  return { ok: true }
}

// ── Entrega de grupo MultiSIM — valida todas las cadenas y envía 1 email ─────
export async function deliverGroupOrders(
  deliveries: Array<{ orderId: string; activationString: string; confirmationCode: string }>,
  recipientEmail: string,
  planInfo: { name: string; data_gb: number; validity_days: number; type: string },
  customerName: string,
  amountUSD: number,
  overrideEmail?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()

  if (deliveries.length === 0) return { ok: false, error: 'Sin pedidos a entregar.' }

  const supabase = createAdminClient()
  const toEmail = (overrideEmail?.trim()) ? overrideEmail.trim() : recipientEmail

  // 1. Validar todas las cadenas y códigos
  const parsed = deliveries.map(d => {
    const p = parseActivationString(d.activationString)
    if (!p.ok) return { ok: false as const, error: `Cadena inválida en pedido ${d.orderId}: ${p.error}`, orderId: d.orderId }
    if (!validateConfirmationCode(d.confirmationCode)) return { ok: false as const, error: `Código inválido en pedido ${d.orderId}`, orderId: d.orderId }
    return { ok: true as const, parsed: p.data, orderId: d.orderId, confirmationCode: d.confirmationCode.trim() }
  })

  const firstError = parsed.find(p => !p.ok)
  if (firstError && !firstError.ok) return { ok: false, error: firstError.error }

  const validParsed = parsed as Array<{ ok: true; parsed: NonNullable<ReturnType<typeof parseActivationString> & { ok: true }>['data']; orderId: string; confirmationCode: string }>

  // 2. Verificar cadenas duplicadas globalmente (en AMBAS tablas)
  for (const d of validParsed) {
    const [{ data: dupB2C }, { data: dupB2B }] = await Promise.all([
      supabase.from('b2c_orders').select('order_ref, id').eq('activation_string', d.parsed.raw).neq('status', 'cancelled').maybeSingle(),
      supabase.from('orders').select('order_ref, id').eq('activation_string', d.parsed.raw).neq('status', 'cancelled').maybeSingle(),
    ])
    const dup = [dupB2C, dupB2B].find(x => x && !deliveries.map(dd => dd.orderId).includes(x.id))
    if (dup) return { ok: false, error: `⛔ La cadena de eSIM ${validParsed.indexOf(d) + 1} ya fue usada en el pedido ${dup.order_ref}.` }
  }

  // 3. Verificar que no haya duplicados entre las propias cadenas del grupo
  const rawStrings = validParsed.map(d => d.parsed.raw)
  const uniqueRaws = new Set(rawStrings)
  if (uniqueRaws.size !== rawStrings.length) return { ok: false, error: '⛔ Hay cadenas repetidas dentro del grupo. Cada eSIM necesita una cadena distinta.' }

  // 4. Generar N QRs y subirlos a Storage
  const esimItems: Array<{ label: string; orderRef: string; activationString: string; confirmationCode: string; qrUrl?: string }> = []

  for (let i = 0; i < validParsed.length; i++) {
    const d = deliveries[i]
    const p = validParsed[i]
    let qrUrl: string | undefined
    try {
      const qrBuffer = await QRCode.toBuffer(p.parsed.lpaUri, { width: 400, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } })
      const { error: uploadError } = await supabase.storage.from('qr-codes').upload(`${d.orderId}.png`, qrBuffer, { contentType: 'image/png', upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(`${d.orderId}.png`)
      qrUrl = urlData.publicUrl
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido subiendo el QR'
      console.error(`[group-deliver] QR ${i + 1} no subido a Storage, abortando entrega del grupo:`, e)
      // Nada del grupo se entregó todavía (el email/UPDATE final va después) —
      // marcar todo el lote en error para que quede visible y no se reintente a medias.
      await supabase.from('b2c_orders')
        .update({ status: 'error', delivery_error: message })
        .in('id', deliveries.map(dd => dd.orderId))
      return { ok: false, error: `No se pudo subir el QR de eSIM ${i + 1}, la entrega del grupo fue abortada: ${message}` }
    }

    // También guardar el order_ref del pedido
    const { data: orderData } = await supabase.from('b2c_orders').select('order_ref').eq('id', d.orderId).single()

    esimItems.push({
      label: `eSIM ${i + 1} de ${deliveries.length}`,
      orderRef: orderData?.order_ref ?? d.orderId,
      activationString: p.parsed.raw,
      confirmationCode: p.confirmationCode,
      qrUrl,
    })
  }

  // 5. Enviar UN email con todas las eSIMs
  const tmpl = emailEntregaMultiple({
    customerName,
    totalCount: deliveries.length,
    planName: planInfo.name,
    planGB: planInfo.data_gb,
    planDays: planInfo.validity_days,
    planType: planInfo.type,
    amountUSD,
    esims: esimItems,
  })

  const { error: emailError } = await sendEmail(toEmail, tmpl.subject, tmpl.html)
  if (emailError) {
    console.error('[group-deliver] Error email:', emailError)
    return { ok: false, error: 'Error enviando el email. Intentá nuevamente.' }
  }

  // 6. Actualizar todos los pedidos del grupo
  for (let i = 0; i < deliveries.length; i++) {
    const d = deliveries[i]
    const p = validParsed[i]
    await supabase.from('b2c_orders').update({
      status: 'qr_sent',
      qr_sent_at: new Date().toISOString(),
      activation_string: p.parsed.raw,
      confirmation_code: p.confirmationCode,
      delivery_error: null, // limpiar un posible error de un intento anterior
      ...(overrideEmail?.trim() ? { customer_email: overrideEmail.trim() } : {}),
    }).eq('id', d.orderId)
  }

  revalidatePath('/admin/pedidos')
  return { ok: true }
}
