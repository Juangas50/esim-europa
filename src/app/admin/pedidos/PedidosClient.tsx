'use client'

import { useState } from 'react'
import { updateOrderStatus } from './actions'

// ── Tipo unificado ────────────────────────────────────────────────────────────
export type UnifiedOrder = {
  id: string
  order_ref: string
  type: string
  status: string
  customer_name: string
  customer_lastname: string
  customer_email: string
  customer_passport: string | null
  customer_nationality: string | null
  activation_date: string | null
  pvp_at_time: number
  cost_at_time: number | null
  created_at: string
  agencies: { name: string } | null
  users: { full_name: string } | null
  tariffs: { name: string } | null
  source: 'b2b' | 'b2c'
  payment_method: string | null
}

// ── Estados ───────────────────────────────────────────────────────────────────
const STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pendiente revisión', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  scheduled:      { label: 'Programado',          color: '#6EC1E4', bg: 'rgba(110,193,228,0.15)' },
  qr_sent:        { label: 'QR Enviado',           color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  activated:      { label: 'Activado',             color: '#22C55E', bg: 'rgba(34,197,94,0.15)'  },
  expired:        { label: 'Expirado',             color: '#7A7A7A', bg: 'rgba(122,122,122,0.15)' },
  cancelled:      { label: 'Cancelado',            color: '#EF4444', bg: 'rgba(239,68,68,0.15)'  },
}

const STATUS_FILTERS = [
  { id: 'all',            label: 'Todos' },
  { id: 'pending_review', label: 'Pendientes' },
  { id: 'scheduled',      label: 'Programados' },
  { id: 'qr_sent',        label: 'QR Enviado' },
  { id: 'activated',      label: 'Activados' },
  { id: 'cancelled',      label: 'Cancelados' },
]

const SOURCE_FILTERS = [
  { id: 'all', label: '🌐 Todos los canales' },
  { id: 'b2b', label: '🏢 Agencias' },
  { id: 'b2c', label: '💻 Web' },
]

function SourceBadge({ source }: { source: 'b2b' | 'b2c' }) {
  if (source === 'b2c') return (
    <span style={{ background: 'rgba(110,193,228,0.12)', color: '#6EC1E4', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      💻 Web
    </span>
  )
  return (
    <span style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      🏢 Agencia
    </span>
  )
}

export default function PedidosClient({ orders: initial }: { orders: UnifiedOrder[] }) {
  const [orders, setOrders]       = useState(initial)
  const [statusFilter, setStatus] = useState('all')
  const [sourceFilter, setSource] = useState('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<UnifiedOrder | null>(null)
  const [updating, setUpdating]   = useState<string | null>(null)

  const filtered = orders.filter(o => {
    if (sourceFilter !== 'all' && o.source !== sourceFilter) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !o.order_ref.toLowerCase().includes(q) &&
        !o.customer_name.toLowerCase().includes(q) &&
        !o.customer_lastname.toLowerCase().includes(q) &&
        !o.customer_email.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  async function handleStatus(orderId: string, status: string, source: 'b2b' | 'b2c') {
    setUpdating(orderId)
    await updateOrderStatus(orderId, status, source)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status } : null)
    setUpdating(null)
  }

  const totalB2C = orders.filter(o => o.source === 'b2c').length
  const totalB2B = orders.filter(o => o.source === 'b2b').length

  return (
    <div>
      {/* Resumen canales */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total pedidos',    value: orders.length,  color: '#fff'    },
          { label: '💻 Desde la web', value: totalB2C,       color: '#6EC1E4' },
          { label: '🏢 Agencias',     value: totalB2B,       color: '#A78BFA' },
        ].map(s => (
          <div key={s.label} style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 10, padding: '12px 18px', minWidth: 130 }}>
            <div style={{ fontSize: 11, color: '#7A7A7A', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Filtros canal + búsqueda */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {SOURCE_FILTERS.map(f => (
              <button key={f.id} onClick={() => setSource(f.id)} style={{
                padding: '6px 14px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer',
                border: `1px solid ${sourceFilter === f.id ? '#6EC1E4' : '#2A2A2A'}`,
                background: sourceFilter === f.id ? 'rgba(110,193,228,0.15)' : 'transparent',
                color: sourceFilter === f.id ? '#6EC1E4' : '#7A7A7A',
                fontWeight: sourceFilter === f.id ? 700 : 400, fontSize: 12,
              }}>
                {f.label}
              </button>
            ))}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ref., nombre, email..."
              style={{
                marginLeft: 'auto', background: '#181818', border: '1px solid #2A2A2A',
                borderRadius: 8, padding: '6px 14px', color: '#fff', fontSize: 12,
                fontFamily: 'inherit', outline: 'none', width: 220,
              }}
            />
          </div>

          {/* Filtros estado */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => {
              const base = sourceFilter === 'all' ? orders : orders.filter(o => o.source === sourceFilter)
              const count = f.id === 'all' ? base.length : base.filter(o => o.status === f.id).length
              return (
                <button key={f.id} onClick={() => setStatus(f.id)} style={{
                  padding: '6px 14px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer',
                  border: `1px solid ${statusFilter === f.id ? '#E60000' : '#2A2A2A'}`,
                  background: statusFilter === f.id ? 'rgba(230,0,0,0.15)' : 'transparent',
                  color: statusFilter === f.id ? '#fff' : '#7A7A7A',
                  fontWeight: statusFilter === f.id ? 700 : 400, fontSize: 12,
                }}>
                  {f.label} <span style={{ opacity: 0.6 }}>({count})</span>
                </button>
              )
            })}
          </div>

          {/* Tabla */}
          <div style={{ background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#7A7A7A', fontSize: 13 }}>No hay pedidos</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                    {['Ref / Fecha', 'Canal', 'Cliente', 'Tarifa', 'Estado', 'Acción', ''].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => {
                    const st = STATUSES[o.status] ?? STATUSES.pending_review
                    const isSelected = selected?.id === o.id
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelected(isSelected ? null : o)}
                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid #2A2A2A' : 'none', cursor: 'pointer', background: isSelected ? 'rgba(230,0,0,0.06)' : 'transparent', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(230,0,0,0.06)' : 'transparent' }}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 11, color: '#ccc', fontFamily: 'monospace' }}>{o.order_ref}</div>
                          <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <SourceBadge source={o.source} />
                          {o.source === 'b2b' && (
                            <div style={{ marginTop: 4 }}>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{o.agencies?.name ?? '—'}</div>
                              <div style={{ fontSize: 11, color: '#7A7A7A' }}>{o.users?.full_name}</div>
                            </div>
                          )}
                          {o.source === 'b2c' && o.payment_method && (
                            <div style={{ fontSize: 10, color: '#555', marginTop: 3, textTransform: 'capitalize' }}>{o.payment_method}</div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 13 }}>{o.customer_name} {o.customer_lastname}</div>
                          <div style={{ fontSize: 11, color: '#7A7A7A' }}>{o.customer_email}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 13, marginBottom: 4 }}>{o.tariffs?.name ?? '—'}</div>
                          <span style={{
                            background: (o.type === 'prepago' || o.type === 'local') ? 'rgba(230,0,0,0.15)' : 'rgba(110,193,228,0.15)',
                            color: (o.type === 'prepago' || o.type === 'local') ? '#E60000' : '#6EC1E4',
                            borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700,
                          }}>
                            {(o.type === 'prepago' || o.type === 'local') ? 'SIM Local' : 'DataOnly'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                          <select
                            disabled={updating === o.id}
                            onChange={e => { if (e.target.value) handleStatus(o.id, e.target.value, o.source); e.target.value = '' }}
                            defaultValue=""
                            style={{ background: '#232323', border: '1px solid #2A2A2A', borderRadius: 7, padding: '6px 10px', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                            <option value="" disabled>{updating === o.id ? 'Guardando...' : 'Cambiar estado'}</option>
                            <option value="pending_review">🔄 Pendiente revisión</option>
                            <option value="scheduled">📅 Programado</option>
                            <option value="qr_sent">📤 QR enviado</option>
                            <option value="activated">✅ Activado</option>
                            <option value="cancelled">❌ Cancelar</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ color: isSelected ? '#E60000' : '#6EC1E4', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {isSelected ? '✕ Cerrar' : '👁 Ver'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel detalle */}
        {selected && (
          <div style={{ width: 300, flexShrink: 0, background: '#181818', border: '1px solid #2A2A2A', borderRadius: 14, padding: 20, position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Detalle pedido</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SourceBadge source={selected.source} />
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#7A7A7A', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
            </div>
            {([
              { label: 'Referencia',    value: selected.order_ref },
              { label: 'Canal',         value: selected.source === 'b2c' ? '💻 esimruta34.com' : '🏢 Agencia' },
              ...(selected.source === 'b2b' ? [
                { label: 'Agencia',     value: selected.agencies?.name },
                { label: 'Vendedor',    value: selected.users?.full_name },
              ] : [
                { label: 'Método pago', value: selected.payment_method ?? '—' },
              ]),
              { label: 'Tarifa',        value: selected.tariffs?.name },
              { label: 'Tipo',          value: (selected.type === 'prepago' || selected.type === 'local') ? 'SIM Local' : 'DataOnly' },
              { label: 'Cliente',       value: `${selected.customer_name} ${selected.customer_lastname}` },
              ...(selected.customer_passport ? [{ label: 'Pasaporte',    value: selected.customer_passport }] : []),
              { label: 'Nacionalidad',  value: selected.customer_nationality },
              { label: 'Email',         value: selected.customer_email },
              { label: 'F. compra',     value: new Date(selected.created_at).toLocaleDateString('es-AR') },
              { label: 'F. activación', value: selected.activation_date ?? 'Inmediata' },
              { label: 'PVP',           value: `$${selected.pvp_at_time.toFixed(2)}` },
              ...(selected.cost_at_time != null ? [{ label: 'Coste', value: `$${selected.cost_at_time.toFixed(2)}` }] : []),
            ] as { label: string; value: string | null | undefined }[]).map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
                <span style={{ fontSize: 11, color: '#7A7A7A', flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>{r.value || '—'}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: '#7A7A7A', marginBottom: 8 }}>Estado actual</div>
              <span style={{ background: STATUSES[selected.status]?.bg, color: STATUSES[selected.status]?.color, borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                {STATUSES[selected.status]?.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
