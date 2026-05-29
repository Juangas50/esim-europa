export const runtime = 'nodejs'

import { createAdminClient } from '@/lib/supabase/admin'
import { generateInvoicePDF } from '@/components/pdf/FacturaPDF'

export async function POST(request: Request) {
  const { agencyId, periodStart, periodEnd, dueDate } = await request.json()
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
    if (!linesMap[key]) linesMap[key] = { tariff_name: order.tariffs?.name || 'Sin nombre', units: 0, cost_price: order.cost_at_time, total: 0 }
    linesMap[key].units += 1
    linesMap[key].total += order.cost_at_time
  }

  const lines = Object.values(linesMap)
  const totalAmount = lines.reduce((s, l) => s + l.total, 0)
  const month = new Date(periodStart).toISOString().slice(0, 7)
  const invoiceRef = `FAC-${month}-${agency.name.slice(0, 3).toUpperCase()}`

  const pdfBuffer = await generateInvoicePDF({
    invoiceRef,
    agencyName: agency.name,
    agencyEmail: agency.email,
    periodStart,
    periodEnd,
    dueDate,
    status: 'pending',
    lines,
    totalAmount,
  })

  const fileName = `${invoiceRef}-${Date.now()}.pdf`
  const { error: uploadError } = await supabase.storage.from('invoices').upload(fileName, pdfBuffer, { contentType: 'application/pdf' })
  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName)

  const { data: invoice, error: dbError } = await supabase.from('invoices')
    .insert({ invoice_ref: invoiceRef, agency_id: agencyId, period_start: periodStart, period_end: periodEnd, total_amount: totalAmount, status: 'pending', pdf_url: publicUrl, due_date: dueDate })
    .select().single()

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 })

  await supabase.from('invoice_lines').insert(lines.map(l => ({ invoice_id: invoice.id, ...l })))

  return Response.json({ invoice, pdfUrl: publicUrl })
}
