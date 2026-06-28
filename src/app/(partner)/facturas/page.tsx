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
    pending: { label: 'Pendiente', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
    paid:    { label: 'Pagada',    color: '#22C55E', bg: 'rgba(34,197,94,0.15)'  },
    overdue: { label: 'Vencida',   color: '#C9973A', bg: 'rgba(230,0,0,0.15)'   },
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Mis facturas</h2>
        <p style={{ color: '#7A7A7A', fontSize: 13, marginTop: 6 }}>
          Facturación mensual basada en pedidos activados. El pago se gestiona con tu ejecutivo RUTA34.
        </p>
      </div>

      {!invoices || invoices.length === 0 ? (
        <div style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 14, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🧾</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Sin facturas todavía</div>
          <div style={{ color: '#7A7A7A', fontSize: 13 }}>Las facturas se generan mensualmente desde RUTA34.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {invoices.map(inv => {
            const st = STATUS[inv.status] || STATUS.pending
            return (
              <div key={inv.id} style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>🧾</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{inv.invoice_ref}</div>
                        <div style={{ fontSize: 12, color: '#7A7A7A', marginTop: 2 }}>
                          {new Date(inv.period_start).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })} · Vence: {new Date(inv.due_date).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                    </div>

                    {inv.invoice_lines && inv.invoice_lines.length > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2A2A2A' }}>
                        <div style={{ fontSize: 10, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Desglose</div>
                        {inv.invoice_lines.map((line: any) => (
                          <div key={line.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, gap: 20 }}>
                            <span style={{ color: '#AAAAAA' }}>{line.tariff_name} × {line.units} ud <span style={{ fontSize: 11, color: '#7A7A7A' }}>(${line.cost_price}c/u)</span></span>
                            <span style={{ fontWeight: 700 }}>${line.total}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ fontSize: 28, fontWeight: 900 }}>${inv.total_amount}</div>
                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}44`, borderRadius: 6, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{st.label}</span>
                    {inv.pdf_url && (
                      <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '7px 14px', color: '#AAAAAA', fontSize: 12, fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
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