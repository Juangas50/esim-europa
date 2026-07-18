'use client'

import { useState, useEffect } from 'react'
import { updateOrderStatus, deliverOrder, deliverGroupOrders, resendDeliveryEmail, resendGroupOrders } from './actions'
import { parseActivationString, validateConfirmationCode } from '@/lib/esim/validate'
import { toast } from '@/lib/toast'

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
  activation_string: string | null
  confirmation_code: string | null
  // Motivo del último fallo de generación/entrega de QR (status === 'error')
  delivery_error: string | null
  // MultiSIM: datos de cada pedido individual dentro de la compra
  group_count: number
  group_orders: Array<{
    id: string
    order_ref: string
    activation_string: string | null
    confirmation_code: string | null
    status: string
  }>
}

// ── Estados ───────────────────────────────────────────────────────────────────
const STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pendiente revisión', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  paid:           { label: '⚡ Tramitar',         color: '#C9973A', bg: 'rgba(230,0,0,0.18)'   },
  scheduled:      { label: 'Programado',          color: '#C9973A', bg: 'rgba(110,193,228,0.15)' },
  qr_sent:        { label: 'QR Enviado',           color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  activated:      { label: 'Activado',             color: '#22C55E', bg: 'rgba(34,197,94,0.15)'  },
  expired:        { label: 'Expirado',             color: '#64748B', bg: 'rgba(122,122,122,0.15)' },
  cancelled:      { label: 'Cancelado',            color: '#EF4444', bg: 'rgba(239,68,68,0.15)'  },
  error:          { label: '⚠️ Error de entrega',   color: '#DC2626', bg: 'rgba(220,38,38,0.18)'  },
}

// "tramitar" agrupa paid (B2C) + pending_review (B2B): son lo mismo operativamente
const STATUS_FILTERS = [
  { id: 'all',      label: 'Todos'        },
  { id: 'tramitar', label: '⚡ Tramitar'  },
  { id: 'scheduled',label: 'Programados'  },
  { id: 'qr_sent',  label: 'QR Enviado'  },
  { id: 'activated',label: 'Activados'   },
  { id: 'cancelled',label: 'Cancelados'  },
]

function isTramitar(status: string) {
  return status === 'paid' || status === 'pending_review'
}

// b2c_orders y orders tienen CHECK constraints de status distintos en la DB —
// el dropdown debe ofrecer/enviar el valor crudo real de cada tabla, no el
// status "unificado" que se usa solo para mostrar (ver mapB2CStatus en page.tsx).
const STATUS_OPTIONS_B2B = [
  { value: 'pending_review', label: 'Pendiente revisión' },
  { value: 'scheduled',      label: 'Programado' },
  { value: 'qr_sent',        label: 'QR enviado' },
  { value: 'activated',      label: 'Activado' },
  { value: 'cancelled',      label: 'Cancelar' },
]
const STATUS_OPTIONS_B2C = [
  { value: 'paid',       label: 'Pagado' },
  { value: 'processing', label: 'Procesando' },
  { value: 'qr_sent',    label: 'QR enviado' },
  { value: 'active',     label: 'Activado' },
  { value: 'expired',    label: 'Expirado' },
  { value: 'cancelled',  label: 'Cancelar' },
]

const SOURCE_FILTERS = [
  { id: 'all', label: '🌐 Todos los canales' },
  { id: 'b2b', label: '🏢 Agencias' },
  { id: 'b2c', label: '💻 Web' },
]

function SourceBadge({ source }: { source: 'b2b' | 'b2c' }) {
  if (source === 'b2c') return (
    <span style={{ background: 'rgba(110,193,228,0.12)', color: '#C9973A', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
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
  const [orders, setOrders]         = useState(initial)
  const [statusFilter, setStatus]   = useState('tramitar')
  const [sourceFilter, setSource]   = useState('all')
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<UnifiedOrder | null>(null)
  const [updating, setUpdating]     = useState<string | null>(null)
  const [isMobile, setIsMobile]     = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Estado del formulario de entrega (single) ────────────────────────────
  const [activation, setActivation]   = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [deliverEmail, setDeliverEmail] = useState('')
  const [delivering, setDelivering]   = useState(false)
  const [deliverError, setDeliverError] = useState<string | null>(null)
  const [deliverOk, setDeliverOk]     = useState(false)

  // ── Estado del formulario de entrega (multi) ──────────────────────────────
  const [groupActivations, setGroupActivations] = useState<Record<string, string>>({})
  const [groupCodes, setGroupCodes]             = useState<Record<string, string>>({})
  const [groupDelivering, setGroupDelivering]   = useState(false)
  const [groupError, setGroupError]             = useState<string | null>(null)
  const [groupOk, setGroupOk]                   = useState(false)

  // ── Estado del reenvío ────────────────────────────────────────────────────
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending]     = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendOk, setResendOk]       = useState(false)
  const [showScheduledWarning, setShowScheduledWarning] = useState(false)

  // Validación en tiempo real
  const activationParsed  = parseActivationString(activation)
  const confirmationValid = validateConfirmationCode(confirmation)
  const canDeliver        = activationParsed.ok && confirmationValid && !delivering

  function resetDeliveryForm(newSelected?: UnifiedOrder | null) {
    setActivation(''); setConfirmation('')
    setDeliverError(null); setDeliverOk(false)
    setResendError(null); setResendOk(false)
    setGroupActivations({}); setGroupCodes({})
    setGroupError(null); setGroupOk(false)
    const email = newSelected?.customer_email ?? ''
    setDeliverEmail(email)
    setResendEmail(email)
  }

  // Entrega de grupo
  async function handleGroupDeliver() {
    if (!selected || groupDelivering) return
    setGroupDelivering(true)
    setGroupError(null)

    const deliveries = selected.group_orders.map(o => ({
      orderId: o.id,
      activationString: groupActivations[o.id] ?? '',
      confirmationCode: groupCodes[o.id] ?? '',
    }))

    const result = await deliverGroupOrders(
      deliveries,
      selected.customer_email,
      {
        name: selected.tariffs?.name ?? 'eSIM RUTA34',
        data_gb: 0,
        validity_days: 28,
        type: selected.type ?? 'local',
      },
      `${selected.customer_name} ${selected.customer_lastname}`,
      selected.pvp_at_time,
      deliverEmail.trim() || selected.customer_email,
    )

    if (result.ok) {
      setGroupOk(true)
      setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: 'qr_sent' } : o))
      setSelected(prev => prev ? { ...prev, status: 'qr_sent' } : null)
      toast(`✅ ${selected.group_count} QRs enviados correctamente`)
    } else {
      setGroupError(result.error)
      toast(result.error, 'error')
    }
    setGroupDelivering(false)
  }

  async function handleResend() {
    if (!selected || resending) return
    setResending(true)
    setResendError(null)
    setResendOk(false)

    const toEmail = resendEmail.trim() || selected.customer_email

    let result: { ok: boolean; error?: string }
    if (selected.group_count > 1) {
      // Reenvío de grupo: busca activation_strings en la DB
      result = await resendGroupOrders(
        selected.group_orders.map(o => o.id),
        selected.customer_email,
        `${selected.customer_name} ${selected.customer_lastname}`,
        selected.pvp_at_time,
        toEmail !== selected.customer_email ? toEmail : undefined,
      )
    } else {
      result = await resendDeliveryEmail(selected.id, selected.source, toEmail !== selected.customer_email ? toEmail : undefined)
    }

    if (result.ok) { setResendOk(true); toast(`Email reenviado a ${toEmail}`) }
    else { setResendError(result.error ?? 'Error'); toast(result.error ?? 'Error', 'error') }
    setResending(false)
  }

  const filtered = orders.filter(o => {
    if (sourceFilter !== 'all' && o.source !== sourceFilter) return false
    if (statusFilter === 'tramitar' && !isTramitar(o.status)) return false
    if (statusFilter !== 'all' && statusFilter !== 'tramitar' && o.status !== statusFilter) return false
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
    const result = await updateOrderStatus(orderId, status, source)
    if (result.error) {
      toast('Error al actualizar el estado', 'error')
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      if (selected?.id === orderId) {
        if (status === 'cancelled') {
          // Cerrar panel de detalles si se cancela
          setSelected(null)
          resetDeliveryForm(null)
          toast('✅ Pedido cancelado')
        } else {
          setSelected(prev => prev ? { ...prev, status } : null)
          toast('Estado actualizado')
        }
      } else {
        toast('Estado actualizado')
      }
    }
    setUpdating(null)
  }

  async function handleDeliver() {
    if (!selected || !canDeliver) return
    // Si es programado, mostrar modal de confirmación
    if (selected.status === 'scheduled' && selected.activation_date) {
      setShowScheduledWarning(true)
      return
    }
    await executeDeliver()
  }

  async function executeDeliver() {
    if (!selected || !canDeliver) return
    setDelivering(true)
    setDeliverError(null)
    const result = await deliverOrder(selected.id, selected.source, activation, confirmation, deliverEmail.trim() || selected.customer_email)
    if (result.ok) {
      setDeliverOk(true)
      setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: 'qr_sent' } : o))
      setSelected(prev => prev ? { ...prev, status: 'qr_sent' } : null)
      toast('✅ QR enviado correctamente')
    } else {
      setDeliverError(result.error)
      toast(result.error, 'error')
    }
    setDelivering(false)
    setShowScheduledWarning(false)
  }

  const totalB2C = orders.filter(o => o.source === 'b2c').length
  const totalB2B = orders.filter(o => o.source === 'b2b').length

  return (
    <>
      {/* Resumen canales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total de pedidos',  value: orders.length,  icon: '📊', accent: '#1B2F4E' },
          { label: 'Desde web',         value: totalB2C,       icon: '💻', accent: '#C9973A' },
          { label: 'De agencias',       value: totalB2B,       icon: '🏢', accent: '#059669' },
        ].map(s => (
          <div key={s.label} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.accent, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 20, opacity: 0.5 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', minHeight: '100vh' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Filtros canal */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {SOURCE_FILTERS.map(f => (
              <button key={f.id} onClick={() => setSource(f.id)} style={{
                padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer',
                border: `1px solid ${sourceFilter === f.id ? '#C9973A' : '#EDE8E0'}`,
                background: sourceFilter === f.id ? '#fff' : 'transparent',
                color: sourceFilter === f.id ? '#C9973A' : '#64748B',
                fontWeight: sourceFilter === f.id ? 700 : 500, fontSize: 13,
                transition: 'all 0.2s ease',
              }}>
                {f.label}
              </button>
            ))}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ref., nombre, email..."
              style={{
                marginLeft: 'auto', background: '#fff', border: '1px solid #EDE8E0',
                borderRadius: 8, padding: '8px 14px', color: '#1E293B', fontSize: 13,
                fontFamily: 'inherit', outline: 'none', minWidth: 240,
              }}
            />
          </div>

          {/* Filtros estado */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => {
              const base = sourceFilter === 'all' ? orders : orders.filter(o => o.source === sourceFilter)
              const count = f.id === 'all' ? base.length
                : f.id === 'tramitar' ? base.filter(o => isTramitar(o.status)).length
                : base.filter(o => o.status === f.id).length
              return (
                <button key={f.id} onClick={() => setStatus(f.id)} style={{
                  padding: '8px 16px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer',
                  border: `1px solid ${statusFilter === f.id ? '#C9973A' : '#EDE8E0'}`,
                  background: statusFilter === f.id ? '#fff' : 'transparent',
                  color: statusFilter === f.id ? '#C9973A' : '#64748B',
                  fontWeight: statusFilter === f.id ? 700 : 500, fontSize: 13,
                  transition: 'all 0.2s ease',
                }}>
                  {f.label} <span style={{ opacity: 0.5, marginLeft: 4 }}>({count})</span>
                </button>
              )
            })}
          </div>

          {/* ── Mobile: cards ────────────────────────────────────────────── */}
          {isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#64748B', fontSize: 14, background: '#fff', borderRadius: 12, border: '1px solid #EDE8E0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ marginBottom: 8 }}>Sin pedidos</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>No hay registros que coincidan con los filtros</div>
                </div>
              ) : filtered.map(o => {
                const st = STATUSES[o.status] ?? STATUSES.pending_review
                const isPending = o.status === 'paid'
                return (
                  <div
                    key={o.id}
                    onClick={() => { setSelected(o); resetDeliveryForm() }}
                    style={{ background: '#fff', border: `2px solid ${selected?.id === o.id ? '#C9973A' : '#EDE8E0'}`, borderRadius: 12, padding: 16, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#C9973A', fontWeight: 700 }}>{o.order_ref}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: st.bg, color: st.color, marginLeft: 8, flexShrink: 0 }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#1B2F4E' }}>{o.customer_name} {o.customer_lastname}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{o.customer_email}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <SourceBadge source={o.source} />
                        {o.tariffs?.name && <span style={{ fontSize: 12, color: '#1B2F4E', fontWeight: 500 }}>{o.tariffs.name}</span>}
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</span>
                      </div>
                      {isPending && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#C9973A' }}>Tramitar →</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Desktop: tabla ───────────────────────────────────────────── */}
          {!isMobile && (
          <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                <div style={{ marginBottom: 8 }}>Sin pedidos</div>
                <div style={{ fontSize: 13, color: '#94A3B8' }}>No hay registros que coincidan con los filtros</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#ffffff' }}>
                    {['Ref / Fecha', 'Canal', 'Cliente', 'Tarifa', 'Estado', 'Acción', ''].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
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
                        onClick={() => { const next = isSelected ? null : o; setSelected(next); resetDeliveryForm(next) }}
                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid #EDE8E0' : 'none', cursor: 'pointer', background: isSelected ? '#F0FDF4' : 'transparent', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#FAFBFC' }}
                        onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#F0FDF4' : 'transparent' }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 12, color: '#C9973A', fontFamily: 'monospace', fontWeight: 700 }}>{o.order_ref}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <SourceBadge source={o.source} />
                          {o.source === 'b2b' && (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2F4E' }}>{o.agencies?.name ?? '—'}</div>
                              <div style={{ fontSize: 11, color: '#64748B' }}>{o.users?.full_name}</div>
                            </div>
                          )}
                          {o.source === 'b2c' && o.payment_method && (
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, textTransform: 'capitalize' }}>{o.payment_method}</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#1B2F4E' }}>{o.customer_name} {o.customer_lastname}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{o.customer_email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 500, color: '#1B2F4E' }}>{o.tariffs?.name ?? '—'}</div>
                          <span style={{
                            background: (o.type === 'prepago' || o.type === 'local') ? 'rgba(201,151,58,0.1)' : 'rgba(5,150,105,0.1)',
                            color: (o.type === 'prepago' || o.type === 'local') ? '#C9973A' : '#059669',
                            borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                          }}>
                            {(o.type === 'prepago' || o.type === 'local') ? 'SIM Local' : 'DataOnly'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                          <select
                            disabled={updating === o.id}
                            onChange={e => { if (e.target.value) handleStatus(o.id, e.target.value, o.source); e.target.value = '' }}
                            defaultValue=""
                            style={{ background: '#fff', border: '1px solid #EDE8E0', borderRadius: 7, padding: '7px 11px', color: '#1B2F4E', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                            <option value="" disabled>{updating === o.id ? 'Guardando...' : 'Cambiar estado'}</option>
                            {(o.source === 'b2c' ? STATUS_OPTIONS_B2C : STATUS_OPTIONS_B2B).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: '#C9973A', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {isSelected ? '✕ Cerrar' : '→ Ver'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          )} {/* fin !isMobile */}
        </div>

        {/* Modal overlay — Detalle pedido */}
        {selected && (
          <>
            {/* Overlay oscuro */}
            <div
              onClick={() => { setSelected(null); resetDeliveryForm(null) }}
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              }}
            />

            {/* Modal */}
            <div style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}>
              <div style={{
                background: '#FAF7F2', border: '1px solid #E2E8F0', borderRadius: 16,
                width: '100%', maxWidth: '700px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}>
                {/* Header sticky */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '20px 28px', borderBottom: '1px solid #E2E8F0',
                  flexShrink: 0, position: 'sticky', top: 0, background: '#FAF7F2', zIndex: 10,
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, color: '#1B2F4E' }}>Detalle del Pedido</div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#C9973A', fontWeight: 600 }}>Ref: {selected.order_ref}</div>
                  </div>
                  <button
                    onClick={() => { setSelected(null); resetDeliveryForm(null) }}
                    style={{
                      background: 'transparent', border: 'none', color: '#94A3B8',
                      cursor: 'pointer', fontSize: 28, padding: 0, fontFamily: 'inherit',
                      transition: 'color 0.2s', width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1B2F4E'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    ✕
                  </button>
                </div>

                {/* Contenido scrolleable */}
                <div style={{
                  overflowY: 'auto', flex: 1, padding: '28px',
                }}>
            {selected.delivery_error && (
              <div style={{
                background: 'rgba(220,38,38,0.1)', border: '1px solid #DC2626', borderRadius: 10,
                padding: '14px 16px', marginBottom: 20, color: '#DC2626', fontSize: 13, fontWeight: 500,
              }}>
                ⚠️ <strong>Falló la última entrega:</strong> {selected.delivery_error}
              </div>
            )}
            {([
              { label: 'Referencia',    value: selected.order_ref, icon: '🔖' },
              { label: 'Canal',         value: selected.source === 'b2c' ? '💻 esimruta34.com' : '🏢 Agencia', icon: '📱' },
              ...(selected.source === 'b2b' ? [
                { label: 'Agencia',     value: selected.agencies?.name, icon: '🏢' },
                { label: 'Vendedor',    value: selected.users?.full_name, icon: '👤' },
              ] : [
                { label: 'Método pago', value: selected.payment_method ?? '—', icon: '💳' },
              ]),
              { label: 'Tarifa',        value: selected.tariffs?.name, icon: '🏷️' },
              { label: 'Tipo',          value: (selected.type === 'prepago' || selected.type === 'local') ? 'SIM Local' : 'DataOnly', icon: '📦' },
              { label: 'Cliente',       value: `${selected.customer_name} ${selected.customer_lastname}`, icon: '👥' },
              ...(selected.customer_passport ? [{ label: 'Pasaporte',    value: selected.customer_passport, icon: '📄' }] : []),
              { label: 'Nacionalidad',  value: selected.customer_nationality, icon: '🌍' },
              { label: 'Email',         value: selected.customer_email, icon: '✉️' },
              { label: 'F. compra',     value: new Date(selected.created_at).toLocaleDateString('es-AR'), icon: '📅' },
              { label: 'F. activación', value: selected.activation_date ?? 'Inmediata', icon: '⏰' },
              { label: 'PVP',           value: `US$${selected.pvp_at_time.toFixed(2)}`, icon: '💵' },
              ...(selected.cost_at_time != null ? [{ label: 'Coste', value: `US$${selected.cost_at_time.toFixed(2)}`, icon: '💰' }] : []),
            ] as { label: string; value: string | null | undefined; icon?: string }[]).map(r => (
              <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, paddingBottom: 14, borderBottom: '1px solid #EDE8E0', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1B2F4E' }}>{r.icon} {r.label}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1E293B', wordBreak: 'break-all' }}>{r.value || '—'}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #2D4A72', paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8 }}>Estado actual</div>
              <span style={{ background: STATUSES[selected.status]?.bg, color: STATUSES[selected.status]?.color, borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                {STATUSES[selected.status]?.label}
              </span>
            </div>

            {/* ── Cadena(s) guardada(s) + reenvío — qr_sent ── */}
            {selected.status === 'qr_sent' && (selected.activation_string || selected.group_count > 1) && (
              <div style={{ borderTop: '1px solid #2D4A72', paddingTop: 14, marginTop: 14 }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>Cadena de activación enviada</div>
                <div style={{ background: '#1B2F4E', border: '1px solid #2D4A72', borderRadius: 8, padding: '8px 10px', fontSize: 10, fontFamily: 'monospace', color: '#A78BFA', wordBreak: 'break-all', lineHeight: 1.6 }}>
                  {selected.activation_string}
                </div>
                {selected.confirmation_code && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#64748B' }}>
                    Código: <span style={{ fontFamily: 'monospace', color: '#fff', letterSpacing: 3 }}>{selected.confirmation_code}</span>
                  </div>
                )}

                {/* Botón reenvío */}
                <div style={{ marginTop: 14 }}>
                  {resendOk ? (
                    <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#22C55E', fontWeight: 700, textAlign: 'center' }}>
                      ✅ Reenviado a {resendEmail || selected.customer_email}
                    </div>
                  ) : (
                    <>
                      {/* Email editable para reenvío */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 5 }}>Reenviar a</div>
                        <input
                          value={resendEmail}
                          onChange={e => { setResendEmail(e.target.value); setResendError(null) }}
                          type="email"
                          placeholder={selected.customer_email}
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            background: '#1B2F4E', borderRadius: 8, padding: '8px 10px', color: '#fff',
                            fontSize: 12, fontFamily: 'inherit', outline: 'none',
                            border: `1px solid ${resendEmail && resendEmail !== selected.customer_email ? '#F59E0B' : '#2D4A72'}`,
                          }}
                        />
                        {resendEmail && resendEmail !== selected.customer_email && (
                          <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 4 }}>
                            ⚠ Email diferente al registrado
                          </div>
                        )}
                      </div>

                      {resendError && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#EF4444', marginBottom: 8 }}>
                          ⚠ {resendError}
                        </div>
                      )}
                      <button
                        onClick={handleResend}
                        disabled={resending}
                        style={{
                          width: '100%', padding: '9px 0', borderRadius: 8, border: '1px solid #A78BFA',
                          background: 'transparent', color: resending ? '#555' : '#A78BFA',
                          fontWeight: 700, fontSize: 12, cursor: resending ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {resending ? 'Enviando...' : '📤 Reenviar email al cliente'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Formulario entrega eSIM — permite entrega en estados "tramitar" ──── */}
            {(selected.status === 'pending_review' || selected.status === 'paid' || selected.status === 'scheduled') && (
              <div style={{ borderTop: '1px solid #2D4A72', paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontSize: 11, color: '#C9973A', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                  ⚡ {selected.group_count > 1 ? `Entregar ${selected.group_count} eSIMs` : 'Entregar eSIM'}
                </div>

                {/* ── MultiSIM: N slots de activación ─────────────────── */}
                {selected.group_count > 1 && (
                  groupOk ? (
                    <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#22C55E', fontWeight: 700, textAlign: 'center' }}>
                      ✅ {selected.group_count} QRs enviados a {deliverEmail || selected.customer_email}
                    </div>
                  ) : (
                    <>
                      {/* Email destino */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 5 }}>Email del cliente</div>
                        <input value={deliverEmail} onChange={e => { setDeliverEmail(e.target.value); setGroupError(null) }} type="email"
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1B2F4E', border: `1px solid ${deliverEmail && deliverEmail !== selected.customer_email ? '#F59E0B' : '#2D4A72'}`, borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                        {deliverEmail && deliverEmail !== selected.customer_email && (
                          <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 4 }}>⚠ Email diferente al registrado</div>
                        )}
                      </div>

                      {/* N slots */}
                      {selected.group_orders.map((o, idx) => {
                        const act  = groupActivations[o.id] ?? ''
                        const code = groupCodes[o.id] ?? ''
                        const parsedAct = parseActivationString(act)
                        const validCode = validateConfirmationCode(code)
                        const slotOk = parsedAct.ok && validCode
                        return (
                          <div key={o.id} style={{ background: slotOk ? 'rgba(34,197,94,0.06)' : '#1B2F4E', border: `1px solid ${slotOk ? 'rgba(34,197,94,0.3)' : '#2D4A72'}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: slotOk ? '#22C55E' : '#C9973A' }}>eSIM {idx + 1} de {selected.group_count}</span>
                              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#C9973A' }}>{o.order_ref}</span>
                            </div>
                            <input value={act} onChange={e => { setGroupActivations(p => ({ ...p, [o.id]: e.target.value })); setGroupError(null) }}
                              placeholder="1$servidor$CÓDIGO" style={{ width: '100%', boxSizing: 'border-box', background: '#1B2F4E', border: `1px solid ${act && !parsedAct.ok ? '#EF4444' : act && parsedAct.ok ? '#22C55E' : '#2D4A72'}`, borderRadius: 7, padding: '7px 9px', color: '#fff', fontSize: 11, fontFamily: 'monospace', outline: 'none', marginBottom: 6 }} />
                            <input value={code} onChange={e => { setGroupCodes(p => ({ ...p, [o.id]: e.target.value })); setGroupError(null) }}
                              placeholder="Código (4-8 dígitos)" maxLength={8} style={{ width: '100%', boxSizing: 'border-box', background: '#1B2F4E', border: `1px solid ${code && !validCode ? '#EF4444' : code && validCode ? '#22C55E' : '#2D4A72'}`, borderRadius: 7, padding: '7px 9px', color: '#fff', fontSize: 12, fontFamily: 'monospace', letterSpacing: 3, outline: 'none' }} />
                          </div>
                        )
                      })}

                      {/* Progreso */}
                      {(() => {
                        const filled = selected.group_orders.filter(o => parseActivationString(groupActivations[o.id] ?? '').ok && validateConfirmationCode(groupCodes[o.id] ?? '')).length
                        const allReady = filled === selected.group_count
                        return (
                          <>
                            <div style={{ fontSize: 12, color: allReady ? '#22C55E' : '#64748B', marginBottom: 10, fontWeight: 700 }}>
                              {allReady ? '✅' : `⏳`} {filled} de {selected.group_count} eSIMs cargadas
                            </div>
                            {groupError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#EF4444', marginBottom: 10 }}>⚠ {groupError}</div>}
                            <button onClick={handleGroupDeliver} disabled={!allReady || groupDelivering}
                              style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: allReady && !groupDelivering ? '#C9973A' : '#2D4A72', color: allReady && !groupDelivering ? '#fff' : '#555', fontWeight: 700, fontSize: 13, cursor: allReady && !groupDelivering ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                              {groupDelivering ? 'Generando QRs...' : `Generar y enviar ${selected.group_count} eSIMs →`}
                            </button>
                          </>
                        )
                      })()}
                    </>
                  )
                )}

                {/* ── Single: formulario existente ─────────────────────── */}
                {selected.group_count === 1 && (<>

                {deliverOk ? (
                  <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#22C55E', fontWeight: 700, textAlign: 'center' }}>
                    ✅ QR enviado a {deliverEmail || selected.customer_email}
                  </div>
                ) : (
                  <>
                    {/* Email destino — editable */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 5 }}>Email del cliente</div>
                      <input
                        value={deliverEmail}
                        onChange={e => { setDeliverEmail(e.target.value); setDeliverError(null) }}
                        type="email"
                        placeholder={selected.customer_email}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: '#1B2F4E', borderRadius: 8, padding: '8px 10px', color: '#fff',
                          fontSize: 12, fontFamily: 'inherit', outline: 'none',
                          border: `1px solid ${deliverEmail && deliverEmail !== selected.customer_email ? '#F59E0B' : '#2D4A72'}`,
                        }}
                      />
                      {deliverEmail && deliverEmail !== selected.customer_email && (
                        <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 4 }}>
                          ⚠ Enviando a un email diferente al registrado. Verificá antes de continuar.
                        </div>
                      )}
                    </div>

                    {/* Cadena de activación */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 5 }}>Cadena de activación</div>
                      <input
                        value={activation}
                        onChange={e => { setActivation(e.target.value); setDeliverError(null) }}
                        placeholder="1$servidor$CÓDIGO"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: '#1B2F4E', border: `1px solid ${activation && !activationParsed.ok ? '#EF4444' : activation && activationParsed.ok ? '#22C55E' : '#2D4A72'}`,
                          borderRadius: 8, padding: '8px 10px', color: '#fff',
                          fontSize: 11, fontFamily: 'monospace', outline: 'none',
                        }}
                      />
                      {activation && !activationParsed.ok && (
                        <div style={{ fontSize: 10, color: '#EF4444', marginTop: 4, lineHeight: 1.4 }}>
                          ✗ {activationParsed.error}
                        </div>
                      )}
                      {activation && activationParsed.ok && (
                        <div style={{ fontSize: 10, color: '#22C55E', marginTop: 4 }}>
                          ✓ SM-DP+: {activationParsed.data.smdp}
                        </div>
                      )}
                    </div>

                    {/* Código de confirmación */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 5 }}>Código de confirmación</div>
                      <input
                        value={confirmation}
                        onChange={e => { setConfirmation(e.target.value); setDeliverError(null) }}
                        placeholder="106129"
                        maxLength={8}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: '#1B2F4E', border: `1px solid ${confirmation && !confirmationValid ? '#EF4444' : confirmation && confirmationValid ? '#22C55E' : '#2D4A72'}`,
                          borderRadius: 8, padding: '8px 10px', color: '#fff',
                          fontSize: 13, fontFamily: 'monospace', letterSpacing: 4, outline: 'none',
                        }}
                      />
                      {confirmation && !confirmationValid && (
                        <div style={{ fontSize: 10, color: '#EF4444', marginTop: 4 }}>✗ Deben ser 4-8 dígitos numéricos</div>
                      )}
                    </div>

                    {/* Error del servidor */}
                    {deliverError && (
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#EF4444', marginBottom: 12 }}>
                        ⚠ {deliverError}
                      </div>
                    )}

                    <button
                      onClick={handleDeliver}
                      disabled={!canDeliver}
                      style={{
                        width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                        background: canDeliver ? '#C9973A' : '#2D4A72',
                        color: canDeliver ? '#fff' : '#555',
                        fontWeight: 700, fontSize: 13, cursor: canDeliver ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit', transition: 'background 0.15s',
                      }}
                    >
                      {delivering ? 'Generando QR y enviando...' : 'Generar QR y enviar al cliente →'}
                    </button>
                  </>
                )}
                </>)} {/* cierre group_count === 1 */}
              </div>
            )}
                </div> {/* cierre contenido scrolleable */}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación para pedidos programados */}
      {showScheduledWarning && selected && selected.activation_date && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1B2F4E', border: '1px solid #2D4A72', borderRadius: 12, padding: 24, maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: '#fff' }}>Cuidado</h3>
            <p style={{ color: '#64748B', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
              Aún no es la fecha programada de esta eSIM
              <br />
              <strong style={{ color: '#C9973A' }}>{selected.activation_date}</strong>
            </p>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              ¿Desea activar de igual forma? Se activará la eSIM inmediatamente.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowScheduledWarning(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #2D4A72', background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={() => executeDeliver()}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#C9973A', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
