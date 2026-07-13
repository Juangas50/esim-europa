import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function mapB2CStatus(s: string): string {
  const map: Record<string, string> = {
    pending_payment: 'pending_review',
    paid:            'paid',
    processing:      'paid',
    qr_sent:         'qr_sent',
    active:          'activated',
    expired:         'expired',
    cancelled:       'cancelled',
  }
  return map[s] ?? 'pending_review'
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pendiente',
  paid:           '⚡ Tramitar',
  scheduled:      'Programado',
  qr_sent:        'QR Enviado',
  activated:      'Activado',
  expired:        'Expirado',
  cancelled:      'Cancelado',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending_review: { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  paid:           { bg: 'rgba(230,0,0,0.18)',      color: '#C9973A' },
  scheduled:      { bg: 'rgba(110,193,228,0.15)', color: '#C9973A' },
  qr_sent:        { bg: 'rgba(167,139,250,0.15)', color: '#A78BFA' },
  activated:      { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E' },
  expired:        { bg: 'rgba(122,122,122,0.15)', color: '#64748B' },
  cancelled:      { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const thisMonthPrefix = new Date().toISOString().slice(0, 7)
  const today = new Date().toISOString().split('T')[0]

  const [{ data: b2bOrders }, { data: b2cOrders }] = await Promise.all([
    supabase.from('orders').select('id, order_ref, customer_name, customer_lastname, type, status, activation_date, created_at, pvp_at_time').order('created_at', { ascending: false }),
    supabase.from('b2c_orders').select('id, order_ref, customer_name, customer_lastname, status, activation_date, created_at, amount_usd').order('created_at', { ascending: false }),
  ])

  type Row = {
    id: string; order_ref: string; customer_name: string; customer_lastname: string
    type: string; status: string; activation_date: string | null; created_at: string
    pvp_at_time: number; source: 'b2b' | 'b2c'
  }

  const allOrders: Row[] = [
    ...(b2bOrders ?? []).map(o => ({
      id: o.id, order_ref: o.order_ref, customer_name: o.customer_name,
      customer_lastname: o.customer_lastname, type: o.type ?? 'prepago',
      status: o.status, activation_date: o.activation_date ?? null,
      created_at: o.created_at, pvp_at_time: o.pvp_at_time ?? 0, source: 'b2b' as const,
    })),
    ...(b2cOrders ?? []).map(o => ({
      id: o.id, order_ref: o.order_ref, customer_name: o.customer_name,
      customer_lastname: o.customer_lastname, type: 'dataonly',
      status: mapB2CStatus(o.status), activation_date: o.activation_date ?? null,
      created_at: o.created_at, pvp_at_time: o.amount_usd ?? 0, source: 'b2c' as const,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const toTramitar     = allOrders.filter(o => o.status === 'paid')
  const pending        = allOrders.filter(o => o.status === 'pending_review')
  const scheduledToday = allOrders.filter(o => o.activation_date === today && o.status === 'scheduled')
  const activated      = allOrders.filter(o => o.status === 'activated')
  const thisMonth      = allOrders.filter(o => o.created_at?.startsWith(thisMonthPrefix))
  const b2cCount       = allOrders.filter(o => o.source === 'b2c').length
  const b2bCount       = allOrders.filter(o => o.source === 'b2b').length

  const urgentCount = toTramitar.length + scheduledToday.length

  return (
    <div>
      {/* ── Alerta urgente ──────────────────────────────────────────────── */}
      {urgentCount > 0 && (
        <Link href="/admin/pedidos" style={{ textDecoration: 'none', display: 'block', marginBottom: 18 }}>
          <div style={{ background: 'rgba(230,0,0,0.08)', border: '1px solid rgba(230,0,0,0.25)', borderRadius: 13, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 5 }}>
                Pedidos pendientes para hoy
              </div>
              {toTramitar.length > 0 && (
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  ⚡ <strong style={{ color: '#C9973A' }}>{toTramitar.length} pedido(s)</strong> para tramitar
                </div>
              )}
              {scheduledToday.length > 0 && (
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>
                  🔔 <strong style={{ color: '#fff' }}>{scheduledToday.length} eSIM(s)</strong> programadas para hoy
                </div>
              )}
            </div>
            <div style={{ color: '#C9973A', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              Tramitar →
            </div>
          </div>
        </Link>
      )}

      {/* ── Stats — 2 cols mobile, 4 cols desktop ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Pedidos este mes', value: thisMonth.length,      color: '#C9973A' },
          { label: 'eSIM activas',     value: activated.length,       color: '#22C55E' },
          { label: '⚡ Para tramitar', value: toTramitar.length,      color: '#C9973A' },
          { label: 'Activaciones hoy', value: scheduledToday.length,  color: '#C9973A' },
        ].map(s => (
          <Link key={s.label} href="/admin/pedidos" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8, fontWeight: 600, lineHeight: 1.3 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Canal breakdown — 2 cols siempre ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: '🏢 Agencias',  value: b2bCount, sub: 'Portal B2B',      color: '#C9973A' },
          { label: '💻 Web',       value: b2cCount, sub: 'esimruta34.com',  color: '#A78BFA' },
        ].map(s => (
          <Link key={s.label} href="/admin/pedidos" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, minWidth: 36 }}>{s.value}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Últimos pedidos ─────────────────────────────────────────────── */}
      <div style={{ background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #2D4A72', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Últimos pedidos</span>
          <Link href="/admin/pedidos" style={{ color: '#C9973A', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Ver todos →</Link>
        </div>

        {allOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No hay pedidos todavía</div>
        ) : (
          <>
            {/* Desktop: tabla */}
            <div className="hidden md:block">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2D4A72' }}>
                    {['Referencia', 'Cliente', 'Canal', 'Estado', 'Importe', 'Fecha'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allOrders.slice(0, 10).map((o, i) => {
                    const sc = STATUS_COLORS[o.status] ?? STATUS_COLORS.pending_review
                    return (
                      <tr key={o.id} style={{ borderBottom: i < 9 ? '1px solid #2D4A72' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748B', fontFamily: 'monospace' }}>{o.order_ref}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{o.customer_name} {o.customer_lastname}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: o.source === 'b2c' ? 'rgba(167,139,250,0.15)' : 'rgba(230,0,0,0.15)', color: o.source === 'b2c' ? '#A78BFA' : '#C9973A', borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 700 }}>
                            {o.source === 'b2c' ? '💻 Web' : '🏢 Agencia'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: sc.bg, color: sc.color }}>
                            {STATUS_LABELS[o.status] ?? o.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>US${o.pvp_at_time.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748B' }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-[#2D4A72]">
              {allOrders.slice(0, 8).map(o => {
                const sc = STATUS_COLORS[o.status] ?? STATUS_COLORS.pending_review
                const isPending = o.status === 'paid' || o.status === 'pending_review'
                return (
                  <Link key={o.id} href="/admin/pedidos" style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#C9973A' }}>{o.order_ref}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: sc.bg, color: sc.color, flexShrink: 0, marginLeft: 8 }}>
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{o.customer_name} {o.customer_lastname}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: o.source === 'b2c' ? '#A78BFA' : '#C9973A', fontWeight: 700 }}>
                            {o.source === 'b2c' ? '💻 Web' : '🏢 Agencia'}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: isPending ? '#C9973A' : '#fff' }}>
                          US${o.pvp_at_time.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
