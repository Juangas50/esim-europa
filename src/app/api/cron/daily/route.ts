import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { emailAlertaAdmin } from '@/lib/email/templates'

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
