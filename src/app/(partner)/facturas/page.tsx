import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function FacturasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, invoice_lines(*)')
    .eq('agency_id', profile?.agency_id)
    .order('created_at', { ascending: false })

  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    paid:    { label: 'Pagada',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
    overdue: { label: 'Vencida',   color: '#C9973A', bg: 'rgba(201,151,58,0.1)'  },
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black text-[var(--color-navy)] m-0">Mis facturas</h2>
        <p className="text-[#8A8A8A] text-sm mt-1.5">
          Facturación mensual basada en pedidos activados. El pago se gestiona con tu ejecutivo RUTA34.
        </p>
      </div>

      {!invoices || invoices.length === 0 ? (
        <div className="bg-white border border-[#E9E2D8] rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">🧾</div>
          <div className="font-bold text-base text-[var(--color-navy)] mb-2">Sin facturas todavía</div>
          <div className="text-[#8A8A8A] text-sm">Las facturas se generan mensualmente desde RUTA34.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {invoices.map(inv => {
            const st = STATUS[inv.status] || STATUS.pending
            return (
              <div key={inv.id} className="bg-white border border-[#E9E2D8] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-2xl">🧾</span>
                      <div>
                        <div className="font-black text-base text-[var(--color-navy)]">{inv.invoice_ref}</div>
                        <div className="text-xs text-[#8A8A8A] mt-0.5">
                          {new Date(inv.period_start).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })} · Vence: {new Date(inv.due_date).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                    </div>

                    {inv.invoice_lines && inv.invoice_lines.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#E9E2D8]">
                        <div className="text-xs text-[#8A8A8A] font-bold uppercase tracking-widest mb-2">Desglose</div>
                        {inv.invoice_lines.map((line: any) => (
                          <div key={line.id} className="flex justify-between text-sm mb-1 gap-5">
                            <span className="text-[#AAAAAA]">{line.tariff_name} × {line.units} ud <span className="text-xs text-[#8A8A8A]">(${line.cost_price}c/u)</span></span>
                            <span className="font-bold text-[var(--color-navy)]">${line.total}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2.5">
                    <div className="text-3xl font-black text-[var(--color-gold)]">${inv.total_amount}</div>
                    <span className="px-3 py-1 rounded text-xs font-bold" style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}40` }}>{st.label}</span>
                    {inv.pdf_url && (
                      <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white border border-[#E9E2D8] hover:border-[#C9973A] rounded-lg px-3 py-1.5 text-[#8A8A8A] text-xs font-semibold no-underline cursor-pointer transition-colors">
                        ⬇ Descargar PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}