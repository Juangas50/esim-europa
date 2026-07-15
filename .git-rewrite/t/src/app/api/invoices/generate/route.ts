export const runtime = 'nodejs'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF } from '@/components/pdf/FacturaPDF'

const UUID_RE   = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE   = /^\d{4}-\d{2}-\d{2}$/

export async function POST(request: Request) {
  // ── P1-02: Verificar sesión y rol admin ───────────────────────────────────
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await sessionClient
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Validar body ──────────────────────────────────────────────────────────
  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { agencyId, periodStart, periodEnd, dueDate } = body as Record<string, string>

  if (!UUID_RE.test(agencyId) || !DATE_RE.test(periodStart) || !DATE_RE.test(periodEnd) || !DATE_RE.test(dueDate)) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // ── Lógica de negocio ─────────────────────────────────────────────────────
  const supabase = createAdminClient()

  const { data: agency } = await supabase.from('agencies').select('*').eq('id', agencyId).single()
  if (!agency) return Response.json({ error: 'Agencia no encontrada' }, { status: 404 })

  const { data: orders } = await supabase
    .from('orders').select('*, tariffs(name)')
    .eq('agency_id', agencyId)
    .gte('created_at', periodStart)
    .lte('created_at', periodEnd + 'T23:59:59')
    .neq('status', 'cancelled')

  if (!orders || orders.length === 0)
    return Response.json({ error: 'No hay pedidos en este período' }, { status: 400 })

  const linesMap: Record<string, { tariff_name: string; units: number; cost_price: number; total: number }> = {}
  for (const order of orders) {
    const key = order.tariff_id
    if (!linesMap[key]) {
      linesMap[key] = { tariff_name: order.tariffs?.name || 'Sin nombre', units: 0, cost_price: order.cost_at_time, total: 0 }
    }
    linesMap[key].units += 1
    linesMap[key].total += order.cost_at_time
  }

  const lines       = Object.values(linesMap)
  const totalAmount = lines.reduce((s, l) => s + l.total, 0)
  const month       = new Date(periodStart).toISOString().slice(0, 7)

  // P2-07: Usar UUID para evitar colisiones en el ref
  const invoiceRef = `FAC-${month}-${crypto.randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase()}`

  const pdfBuffer = await generateInvoicePDF({
    invoiceRef,
    agencyName:  agency.name,
    agencyEmail: agency.email,
    periodStart,
    periodEnd,
    dueDate,
    status: 'pending',
    lines,
    totalAmount,
  })

  // P2-08: Subir con nombre no predecible
  const fileName = `${invoiceRef}-${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(fileName, pdfBuffer, { contentType: 'application/pdf' })
  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName)

  const { data: invoice, error: dbError } = await supabase.from('invoices')
    .insert({
      invoice_ref:  invoiceRef,
      agency_id:    agencyId,
      period_start: periodStart,
      period_end:   periodEnd,
      total_amount: totalAmount,
      status:       'pending',
      pdf_url:      publicUrl,
      due_date:     dueDate,
    })
    .select().single()

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 })

  await supabase.from('invoice_lines').insert(
    lines.map(l => ({ invoice_id: invoice.id, ...l }))
  )

  return Response.json({ invoice, pdfUrl: publicUrl })
}
