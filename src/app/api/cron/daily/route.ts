import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { emailAlertaAdmin } from '@/lib/email/templates'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const today = new Date().toISOString().split('T')[0]

  const { data: pendingReview } = await supabase
    .from('orders')
    .select('*, agencies(name)')
    .eq('status', 'pending_review')

  const { data: scheduledToday } = await supabase
    .from('orders')
    .select('*, tariffs(name)')
    .eq('status', 'scheduled')
    .eq('activation_date', today)

  const total = (pendingReview?.length || 0) + (scheduledToday?.length || 0)

  if (total === 0) {
    return Response.json({ message: 'Sin alertas hoy', date: today })
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean)

  const tmpl = emailAlertaAdmin({
    pendingReview: pendingReview || [],
    scheduledToday: scheduledToday || [],
    date: new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  })

  for (const email of adminEmails) {
    await sendEmail(email.trim(), tmpl.subject, tmpl.html)
  }

  return Response.json({
    message: `Alertas enviadas a ${adminEmails.length} admin(s)`,
    pendingReview: pendingReview?.length || 0,
    scheduledToday: scheduledToday?.length || 0,
  })
}