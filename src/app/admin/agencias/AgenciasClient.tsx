'use client'

import { useState, useEffect } from 'react'
import { createAgency, updateAgency, toggleAgencyActive, savePricing, getPricing, getAgencyOrders } from './actions'
import { toast } from '@/lib/toast'

type Agency = { id: string; name: string; email: string; active: boolean }
type Tariff = { id: string; name: string; type: string; data_gb: number; validity_days: number | null; badge: string }
type Pricing = { tariff_id: string; cost_price: number; pvp: number }

const inp = { background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const }

const STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pendiente',  color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  scheduled:      { label: 'Programado', color: '#C9973A', bg: 'rgba(110,193,228,0.15)' },
  qr_sent:        { label: 'QR Enviado', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  activated:      { label: 'Activado',   color: '#22C55E', bg: 'rgba(34,197,94,0.15)'  },
  cancelled:      { label: 'Cancelado',  color: '#7A7A7A', bg: 'rgba(122,122,122,0.15)' },
}

export default function AgenciasClient({ agencies: initial, tariffs }: { agencies: Agency[]; tariffs: Tariff[] }) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const [agencies, setAgencies]       = useState(initial)
  const [managing, setManaging]       = useState<Agency | null>(null)
  const [tab, setTab]                 = useState('precios')
  const [pricing, setPricing]         = useState<Pricing[]>([])
  const [orders, setOrders]           = useState<any[]>([])
  const [adding, setAdding]           = useState(false)
  const [editing, setEditing]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [form, setForm]               = useState({ name: '', email: '' })
  const [editForm, setEditForm]       = useState({ name: '', email: '' })
  const [orderFilter, setOrderFilter] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')

  async function handleManage(agency: Agency) {
    setManaging(agency)
    setEditForm({ name: agency.name, email: agency.email })
    setTab('precios')
    setEditing(false)
    setOrderSearch('')
    setOrderFilter('all')
    setDateFrom('')
    setDateTo('')
    const [p, o] = await Promise.all([getPricing(agency.id), getAgencyOrders(agency.id)])
    setPricing(p)
    setOrders(o)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const result = await createAgency(form)
    if (result.data) {
      setAgencies([...agencies, result.data])
      setAdding(false)
      setForm({ name: '', email: '' })
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!managing) return
    const result = await updateAgency(managing.id, editForm)
    if (result.data) {
      const updated = { ...managing, ...editForm }
      setAgencies(agencies.map(a => a.id === managing.id ? updated : a))
      setManaging(updated)
      setEditing(false)
    }
  }

  async function handleToggleActive() {
    if (!managing) return
    const result = await toggleAgencyActive(managing.id, !managing.active)
    if (!result.error) {
      const updated = { ...managing, active: !managing.active }
      setAgencies(agencies.map(a => a.id === managing.id ? updated : a))
      setManaging(updated)
    }
  }

  function getPrice(tariffId: string, field: 'cost_price' | 'pvp') {
    return pricing.find(p => p.tariff_id === tariffId)?.[field] || 0
  }

  async function handleSavePrice(tariffId: string, cost: number, pvp: number) {
    if (!managing) return
    setSaving(true)
    const result = await savePricing(managing.id, tariffId, cost, pvp)
    if ((result as any)?.error) {
      toast('Error al guardar precio', 'error')
    } else {
      setPricing(prev => {
        const existing = prev.findIndex(p => p.tariff_id === tariffId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { tariff_id: tariffId, cost_price: cost, pvp }
          return updated
        }
        return [...prev, { tariff_id: tariffId, cost_price: cost, pvp }]
      })
      toast('Precio guardado')
    }
    setSaving(false)
  }

  const filteredOrders = orders
    .filter(o => orderFilter === 'all' || o.status === orderFilter)
    .filter(o => orderSearch === '' ||
      `${o.customer_name} ${o.customer_lastname} ${o.order_ref}`
        .toLowerCase().includes(orderSearch.toLowerCase())
    )
    .filter(o => {
      if (!dateFrom && !dateTo) return true
      const orderDate = o.created_at.split('T')[0]
      if (dateFrom && dateTo) return orderDate >= dateFrom && orderDate <= dateTo
      if (dateFrom) return orderDate >= dateFrom
      if (dateTo) return orderDate <= dateTo
      return true
    })

  // ── Vista gestión agencia ──
  if (managing) return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={() => setManaging(null)} style={{ width: 34, height: 34, borderRadius: 9, background: '#232323', border: '1px solid #2A2A2A', color: '#AAAAAA', cursor: 'pointer', fontSize: 18, fontFamily: 'inherit', flexShrink: 0 }}>←</button>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(110,193,228,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏢</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{managing.name}</h2>
              <span style={{ background: managing.active ? 'rgba(34,197,94,0.12)' : 'rgba(122,122,122,0.12)', color: managing.active ? '#22C55E' : '#7A7A7A', border: `1px solid ${managing.active ? 'rgba(34,197,94,0.3)' : 'rgba(122,122,122,0.3)'}`, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {managing.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#7A7A7A', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{managing.email}</div>
          </div>
        </div>
        {/* Acciones */}
        {!editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="flex-1 sm:flex-none" style={{ padding: '8px 14px', background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, color: '#AAAAAA', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              ✏️ Editar
            </button>
            <button onClick={handleToggleActive} className="flex-1 sm:flex-none" style={{ padding: '8px 14px', background: managing.active ? 'rgba(230,0,0,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${managing.active ? 'rgba(230,0,0,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 8, color: managing.active ? '#C9973A' : '#22C55E', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              {managing.active ? '🚫 Desactivar' : '✅ Activar'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="flex flex-col gap-2 w-full sm:flex-row sm:items-center">
            <input required style={{ ...inp }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Nombre agencia" />
            <input required type="email" style={{ ...inp }} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1" style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
              <button type="button" className="flex-1" onClick={() => setEditing(false)} style={{ background: 'transparent', color: '#AAAAAA', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2A2A2A', marginBottom: 22 }}>
        {[
          { id: 'precios', label: '💰 Precios' },
          { id: 'pedidos', label: `📦 Pedidos (${orders.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#C9973A' : 'transparent'}`, color: tab === t.id ? '#fff' : '#7A7A7A', fontWeight: tab === t.id ? 700 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB PRECIOS */}
      {tab === 'precios' && (
        <div>
          <p style={{ color: '#7A7A7A', fontSize: 13, marginBottom: 18 }}>
            Configurá el <strong style={{ color: '#fff' }}>precio coste</strong> (lo que facturamos) y el <strong style={{ color: '#fff' }}>PVP que ve la agencia</strong>. Se guarda automáticamente al salir del campo.
          </p>
          {['prepago', 'dataonly'].map(type => (
            <div key={type}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#7A7A7A', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 20 }}>
                {type === 'prepago' ? 'eSIM Prepago' : 'eSIM DataOnly'}
              </div>
              {tariffs.filter(t => t.type === type).map(t => {
                const cost   = getPrice(t.id, 'cost_price')
                const pvp    = getPrice(t.id, 'pvp')
                const margin = pvp - cost
                return (
                  <div key={t.id} style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#7A7A7A', marginTop: 2 }}>{t.data_gb} GB{t.validity_days ? ` · ${t.validity_days} días` : ''}</div>
                    </div>
                    <div className="flex flex-wrap gap-4 items-end">
                      <PriceInput label="Precio coste" defaultValue={cost} onSave={val => handleSavePrice(t.id, val, pvp)} />
                      <PriceInput label="PVP que ve la agencia" defaultValue={pvp} onSave={val => handleSavePrice(t.id, cost, val)} />
                      <div style={{ textAlign: 'center', minWidth: 56 }}>
                        <div style={{ fontSize: 10, color: '#7A7A7A', fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Margen</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: margin > 0 ? '#22C55E' : '#C9973A' }}>${margin.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          {saving && <div style={{ color: '#C9973A', fontSize: 12, marginTop: 10 }}>Guardando...</div>}
        </div>
      )}

      {/* TAB PEDIDOS */}
      {tab === 'pedidos' && (
        <div>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 240 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7A7A7A', fontSize: 13 }}>🔍</span>
              <input placeholder="Buscar cliente o ref…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                style={{ ...inp, paddingLeft: 30 }} />
            </div>
            <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
              style={{ background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
              <option value="all">Todos los estados</option>
              <option value="pending_review">Pendiente</option>
              <option value="scheduled">Programado</option>
              <option value="qr_sent">QR Enviado</option>
              <option value="activated">Activado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              title="Desde"
              style={{ background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 12px', color: dateFrom ? '#fff' : '#7A7A7A', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              title="Hasta"
              style={{ background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 12px', color: dateTo ? '#fff' : '#7A7A7A', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo('') }}
                style={{ background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 12px', color: '#7A7A7A', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✕ Limpiar fechas
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#7A7A7A' }}>
              {filteredOrders.length} pedido(s) encontrado(s)
            </div>
            <button
              onClick={async () => {
                const now = new Date()
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
                const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().split('T')[0]
                const res = await fetch('/api/invoices/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ agencyId: managing!.id, periodStart: firstDay, periodEnd: lastDay, dueDate }),
                })
                const data = await res.json()
                if (data.pdfUrl) {
                  window.open(data.pdfUrl, '_blank')
                  alert(`Factura ${data.invoice.invoice_ref} generada correctamente`)
                } else if (data.error?.includes('duplicate key') || data.error?.includes('unique')) {
                  alert('Ya existe una factura para este período. No se puede facturar dos veces el mismo mes.')
                } else {
                  alert(data.error || 'Error generando factura')
                }
              }}
              style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              🧾 Generar factura del mes
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#7A7A7A', fontSize: 13, background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A' }}>No hay pedidos que coincidan con los filtros</div>
          ) : isMobile ? (
            // Mobile: cards
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredOrders.map(o => {
                const st = STATUSES[o.status] || STATUSES.pending_review
                return (
                  <div key={o.id} style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#C9973A' }}>{o.order_ref}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: st.bg, color: st.color, marginLeft: 8, flexShrink: 0 }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{o.customer_name} {o.customer_lastname}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: '#7A7A7A' }}>{o.tariffs?.name}</span>
                      <span style={{ fontSize: 11, color: '#7A7A7A' }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Desktop: tabla
            <div style={{ background: '#181818', borderRadius: 14, border: '1px solid #2A2A2A', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                    {['Ref', 'Cliente', 'Tarifa', 'F. Compra', 'F. Activación', 'Estado'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o, i) => {
                    const st = STATUSES[o.status] || STATUSES.pending_review
                    return (
                      <tr key={o.id} style={{ borderBottom: i < filteredOrders.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#7A7A7A', fontFamily: 'monospace' }}>{o.order_ref}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{o.customer_name} {o.customer_lastname}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{o.tariffs?.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#7A7A7A' }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#7A7A7A' }}>{o.activation_date || 'Inmediata'}</td>
                        <td style={{ padding: '12px 16px' }}>
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
      )}
    </div>
  )

  // ── Lista de agencias ──
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setAdding(!adding)} style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Nueva agencia
        </button>
      </div>

      {adding && (
        <form onSubmit={handleCreate} style={{ background: '#181818', border: '1px solid rgba(230,0,0,0.3)', borderRadius: 14, padding: 20, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Nueva agencia</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Nombre *</label>
              <input required style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Viajes Ejemplo" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Email *</label>
              <input required type="email" style={inp} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ventas@agencia.com" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button type="button" onClick={() => setAdding(false)} className="sm:w-auto" style={{ background: 'transparent', color: '#AAAAAA', border: '1px solid #2A2A2A', borderRadius: 9, padding: '10px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            <button type="submit" className="sm:w-auto" style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Crear agencia</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {agencies.length === 0 && <div style={{ color: '#7A7A7A', fontSize: 13, padding: 20 }}>No hay agencias. Creá la primera.</div>}
        {agencies.map(a => (
          <div key={a.id} style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 14, padding: '16px' }}>
            <div className="flex items-center gap-4 mb-3">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(110,193,228,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏢</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                <div style={{ fontSize: 12, color: '#7A7A7A', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
              </div>
              <span style={{ background: a.active ? 'rgba(34,197,94,0.12)' : 'rgba(122,122,122,0.12)', color: a.active ? '#22C55E' : '#7A7A7A', border: `1px solid ${a.active ? 'rgba(34,197,94,0.3)' : 'rgba(122,122,122,0.3)'}`, borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {a.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <button onClick={() => handleManage(a)} style={{ width: '100%', padding: '9px 0', background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, color: '#AAAAAA', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
              Gestionar →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceInput({ label, defaultValue, onSave }: { label: string; defaultValue: number; onSave: (val: number) => void }) {
  const [val, setVal] = useState<string>(defaultValue > 0 ? defaultValue.toString() : '')
  return (
    <div>
      <div style={{ fontSize: 10, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ background: '#232323', border: '1px solid #2A2A2A', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '8px 10px', fontSize: 13, color: '#7A7A7A' }}>$</span>
        <input type="number" min="0" step="0.01" value={val} placeholder="0"
          onChange={e => setVal(e.target.value)}
          onBlur={() => {
            const num = val === '' ? 0 : Number(val)
            if (!isNaN(num) && num >= 0) onSave(num)
          }}
          style={{ width: 70, background: '#232323', border: '1px solid #2A2A2A', borderRadius: '0 8px 8px 0', padding: '8px 10px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
      </div>
    </div>
  )
}