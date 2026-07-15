import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// ── Status mapping B2C → portal ───────────────────────────────────────────────
function mapB2CStatus(s: string): string {
  const map: Record<string, string> = {
    pending_payment: 'pending_review',
    paid:            'scheduled',
    processing:      'scheduled',
    qr_sent:         'qr_sent',
    active:          'activated',
    expired:         'expired',
    cancelled:       'cancelled',
  }
  return map[s] ?? 'pending_review'
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pendiente',
  scheduled:      'Programado',
  qr_sent:        'QR Enviado',
  activated:      'Activado',
  expired:        'Expirado',
  cancelled:      'Cancelado',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending_review: { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  scheduled:      { bg: 'rgba(110,193,228,0.15)', color: '#6EC1E4' },
  qr_sent:        { bg: 'rgba(167,139,250,0.15)', color: '#A78BFA' },
  activated:      { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E' },
  expired:        { bg: 'rgba(122,122,122,0.15)', color: '#7A7A7A' },
  cancelled:      { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const thisMonthPrefix = new Date().toISOString().slice(0, 7)
  const today = new Date().toISOString().split('T')[0]

  // ── Fetch ambas tablas en paralelo ────────────────────────────────────────
  const [{ data: b2bOrders }, { data: b2cOrders }] = await Promise.all([
    supabase.from('orders').select('id, order_ref, customer_name, customer_lastname, type, status, activation_date, created_at, pvp_at_time').order('created_at', { ascending: false }),
    supabase.from('b2c_orders').select('id, order_ref, customer_name, customer_lastname, status, activation_date, created_at, amount_usd').order('created_at', { ascending: false }),
  ])

  // ── Normalizar B2C ────────────────────────────────────────────────────────
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

  // ── Métricas ──────────────────────────────────────────────────────────────
  const pending        = allOrders.filter(o => o.status === 'pending_review')
  const scheduledToday = allOrders.filter(o => o.activation_date === today && o.status === 'scheduled')
  const activated      = allOrders.filter(o => o.status === 'activated')
  const thisMonth      = allOrders.filter(o => o.created_at?.startsWith(thisMonthPrefix))
  const b2cCount       = allOrders.filter(o => o.source === 'b2c').length
  const b2bCount       = allOrders.filter(o => o.source === 'b2b').length

  return (
    <div>
      {(pending.length > 0 || scheduledToday.length > 0) && (
        <Link href="/admin/pedidos" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'rgba(230,0,0,0.08)', border: '1px solid rgba(230,0,0,0.25)', borderRadius: 13, padding: '16px 20px', marginBottom: 22, display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 7 }}>
                Pendientes para hoy — {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              {pending.length > 0 && (
                <div style={{ fontSize: 13, color: '#AAAAAA' }}>
                  📋 <strong style={{ color: '#fff' }}>{pending.length} pedido(s)</strong> esperando revisión
                </div>
              )}
              {scheduledToday.length > 0 && (
                <div style={{ fontSize: 13, color: '#AAAAAA', marginTop: 3 }}>
                  🔔 <strong style={{ color: '#fff' }}>{scheduledToday.length} eSIM(s)</strong> programadas para activar hoy
                </div>
              )}
            </div>
            <div style={{ color: '#E60000', fontSize: 13, fontWeight: 700, flexShrink: 0, alignSelf: 'center' }}>
              Gestionar →
            </div>
          </div>
        </Link>
      )}

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Pedidos este mes', value: thisMonth.length, color: '#E60000' },
          { label: 'eSIM activas',     value: activated.length,  color: '#22C55E' },
          { label: 'Pendientes',        value: pending.length,    color: '#F59E0B' },
          { label: 'Activaciones hoy', value: scheduledToday.length, color: '#6EC1E4' },
        ].map(s => (
          <Link key={s.label} href="/admin/pedidos" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A', padding: 18, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, color: '#7A7A7A', marginBottom: 10, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 6 }}>Ver todos →</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Canal breakdown ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
        {[
          { label: '🏢 Pedidos por agencia', value: b2bCount, sub: 'Portal B2B', color: '#E60000' },
          { label: '💻 Pedidos por la web',  value: b2cCount, sub: 'esimruta34.com', color: '#A78BFA' },
        ].map(s => (
          <Link key={s.label} href="/admin/pedidos" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, minWidth: 44, textAlign: 'right' }}>{s.value}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Últimos pedidos (unificado) ───────────────────────────────────── */}
      <div style={{ background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Últimos pedidos</span>
          <Link href="/admin/pedidos" style={{ color: '#6EC1E4', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Ver todos →</Link>
        </div>
        {allOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#7A7A7A', fontSize: 13 }}>No hay pedidos todavía</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                {['Referencia', 'Cliente', 'Canal', 'Estado', 'Importe', 'Fecha'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allOrders.slice(0, 10).map((o, i) => {
                const sc = STATUS_COLORS[o.status] ?? STATUS_COLORS.pending_review
                return (
                  <tr key={o.id} style={{ borderBottom: i < 9 ? '1px solid #2A2A2A' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#7A7A7A', fontFamily: 'monospace' }}>{o.order_ref}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{o.customer_name} {o.customer_lastname}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: o.source === 'b2c' ? 'rgba(167,139,250,0.15)' : 'rgba(230,0,0,0.15)',
                        color: o.source === 'b2c' ? '#A78BFA' : '#E60000',
                        borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 700,
                      }}>
                        {o.source === 'b2c' ? '💻 Web' : '🏢 Agencia'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: sc.bg, color: sc.color }}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                      ${o.pvp_at_time.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#7A7A7A' }}>
                      {new Date(o.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
