'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWindowSize } from '@/hooks/useWindowSize'

const STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pendiente revisión', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  scheduled:      { label: 'Programado',         color: '#6EC1E4', bg: 'rgba(110,193,228,0.15)' },
  qr_sent:        { label: 'QR Enviado',          color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  activated:      { label: 'Activado',            color: '#22C55E', bg: 'rgba(34,197,94,0.15)'  },
  cancelled:      { label: 'Cancelado',           color: '#7A7A7A', bg: 'rgba(122,122,122,0.15)' },
}

export default function PedidosPartnerClient({ orders }: { orders: any[] }) {
  const router = useRouter()
  const { isMobile } = useWindowSize()
  const [search, setSearch] = useState('')

  const filtered = orders.filter(o =>
    `${o.customer_name} ${o.customer_lastname} ${o.order_ref}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#7A7A7A', fontSize: 14 }}>🔍</span>
          <input placeholder="Buscar por cliente o referencia…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: '#181818', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 13px 9px 33px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <button onClick={() => router.push('/pedidos/nuevo')}
          style={{ background: '#E60000', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Nuevo pedido
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A', padding: 40, textAlign: 'center', color: '#7A7A7A', fontSize: 13 }}>
          {orders.length === 0 ? 'Todavía no hiciste ningún pedido.' : 'No se encontraron resultados.'}
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(o => {
            const st = STATUSES[o.status] || STATUSES.pending_review
            return (
              <div key={o.id} style={{ background: '#181818', borderRadius: 12, border: '1px solid #2A2A2A', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{o.customer_name} {o.customer_lastname}</div>
                    <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 2 }}>{o.customer_email}</div>
                  </div>
                  <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{st.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#7A7A7A', fontFamily: 'monospace' }}>{o.order_ref}</span>
                  <span style={{ color: '#444' }}>·</span>
                  <span style={{ fontSize: 12 }}>{o.tariffs?.name}</span>
                  <span style={{ background: o.type === 'prepago' ? 'rgba(230,0,0,0.15)' : 'rgba(110,193,228,0.15)', color: o.type === 'prepago' ? '#E60000' : '#6EC1E4', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>
                    {o.type === 'prepago' ? 'Prepago' : 'DataOnly'}
                  </span>
                  {o.activation_date && <span style={{ fontSize: 11, color: '#7A7A7A' }}>{o.activation_date}</span>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                {['Ref', 'Cliente', 'Tarifa', 'Tipo', 'Activación', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const st = STATUSES[o.status] || STATUSES.pending_review
                return (
                  <tr key={o.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                    <td style={{ padding: '13px 16px', fontSize: 11, color: '#7A7A7A', fontFamily: 'monospace' }}>{o.order_ref}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{o.customer_name} {o.customer_lastname}</div>
                      <div style={{ fontSize: 11, color: '#7A7A7A' }}>{o.customer_email}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13 }}>{o.tariffs?.name}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: o.type === 'prepago' ? 'rgba(230,0,0,0.15)' : 'rgba(110,193,228,0.15)', color: o.type === 'prepago' ? '#E60000' : '#6EC1E4', borderRadius: 5, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>
                        {o.type === 'prepago' ? 'Prepago' : 'DataOnly'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: '#7A7A7A' }}>{o.activation_date || 'Cliente activa'}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
