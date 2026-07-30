import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { emailAlertaAdmin, emailRecordatorioActivacion } from '@/lib/email/templates'

export async function GET(request: Request) {
  // ── P1-03: Secret en Authorization header, no en query string ────────────
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Usar service role key para bypasear RLS y leer todos los pedidos
  const supabase = createAdminClient()

  const today = new Date().toISOString().split('T')[0]

  // Auto-cancelar b2c_orders en pending_payment con más de 24h (Stripe ya expiró la sesión)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: cancelled } = await supabase
    .from('b2c_orders')
    .update({ status: 'cancelled' })
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff)
    .select('id')

  console.log(`[cron] Auto-cancelados ${cancelled ?? 0} b2c_orders abandonados`)

  // Recordatorio 24h-antes para activaciones B2C programadas para mañana.
  // status='paid' excluye pedidos cuyo QR ya se entregó a mano antes de tiempo
  // (status pasaría a 'qr_sent') y reminder_sent_at evita reenviarlo si el
  // cron corre más de una vez el mismo día.
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.esimruta34.com'

  const { data: dueTomorrow } = await supabase
    .from('b2c_orders')
    .select('id, order_ref, customer_name, customer_email, activation_date, reschedule_token, tariffs(name)')
    .eq('status', 'paid')
    .eq('activation_date', tomorrow)
    .is('reminder_sent_at', null)

  if (dueTomorrow && dueTomorrow.length > 0) {
    const formattedDate = new Date(`${tomorrow}T00:00:00`).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    const results = await Promise.all(dueTomorrow.map(async (order: any) => {
      const tmpl = emailRecordatorioActivacion({
        customerName: order.customer_name,
        orderRef: order.order_ref,
        planName: order.tariffs?.name ?? 'tu eSIM',
        activationDate: formattedDate,
        rescheduleUrl: `${baseUrl}/es/reprogramar?ref=${encodeURIComponent(order.order_ref)}&token=${order.reschedule_token}`,
      })
      const { error } = await sendEmail(order.customer_email, tmpl.subject, tmpl.html)
      if (!error) {
        await supabase.from('b2c_orders').update({ reminder_sent_at: new Date().toISOString() }).eq('id', order.id)
      }
      return { orderRef: order.order_ref, error }
    }))

    const failed = results.filter(r => r.error)
    console.log(`[cron] Recordatorios 24h enviados: ${results.length - failed.length}/${results.length}`)
    if (failed.length > 0) console.error('[cron] Fallos enviando recordatorio:', failed)
  }

  const [{ data: pendingReview }, { data: scheduledToday }] = await Promise.all([
    supabase.from('orders').select('*, agencies(name)').eq('status', 'pending_review'),
    supabase.from('orders').select('*, tariffs(name)').eq('status', 'scheduled').eq('activation_date', today),
  ])

  const total = (pendingReview?.length || 0) + (scheduledToday?.length || 0)

  if (total === 0) {
    return Response.json({ message: 'Sin alertas hoy', date: today })
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean)
  if (adminEmails.length === 0) {
    return Response.json({ message: 'Sin admin emails configurados', date: today })
  }

  const tmpl = emailAlertaAdmin({
    pendingReview: pendingReview || [],
    scheduledToday: scheduledToday || [],
    date: new Date().toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }),
  })

  await Promise.all(
    adminEmails.map(email => sendEmail(email.trim(), tmpl.subject, tmpl.html))
  )

  return Response.json({
    message: `Alertas enviadas a ${adminEmails.length} admin(s)`,
    pendingReview: pendingReview?.length || 0,
    scheduledToday: scheduledToday?.length || 0,
  })
}
