'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createTariff, updateTariff, deleteTariff } from './actions'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type Tariff = {
  id: string
  name: string
  vodafone_code?: string
  type: string
  data_gb: number
  validity_days: number | null
  price_usd?: number
  badge: string
  highlight: boolean
  active: boolean
}

const inp = { background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const }

function TariffForm({ initial, onSave, onCancel }: {
  initial?: Partial<Tariff>
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    client_name: initial?.name || '',
    vodafone_code: initial?.vodafone_code || '',
    type: initial?.type || 'prepago',
    data_gb: initial?.data_gb?.toString() || '',
    validity_days: initial?.validity_days?.toString() || '',
    price_usd: initial?.price_usd?.toString() || '',
    badge: initial?.badge || '',
    highlight: initial?.highlight || false,
  })
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#181818', border: '1px solid rgba(230,0,0,0.3)', borderRadius: 14, padding: 20, marginBottom: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>
        {initial?.id ? 'Editar tarifa' : 'Nueva tarifa'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Nombre Cliente *</label>
          <input required style={inp} value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} placeholder="Europa Básico" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Nombre Vodafone *</label>
          <input required style={inp} value={form.vodafone_code} onChange={e => setForm({ ...form, vodafone_code: e.target.value })} placeholder="Vodafone S" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Tipo *</label>
          <select required style={{ ...inp }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="prepago">Prepago</option>
            <option value="dataonly">DataOnly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Datos (GB) *</label>
          <input required type="number" style={inp} value={form.data_gb} onChange={e => setForm({ ...form, data_gb: e.target.value })} placeholder="15" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Precio USD *</label>
          <input required type="number" step="0.01" style={inp} value={form.price_usd} onChange={e => setForm({ ...form, price_usd: e.target.value })} placeholder="9.99" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Días vigencia</label>
          <input type="number" style={inp} value={form.validity_days} onChange={e => setForm({ ...form, validity_days: e.target.value })} placeholder="28" />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
          Características (una por línea)
        </label>
        <textarea
          value={form.badge}
          onChange={e => setForm({ ...form, badge: e.target.value })}
          rows={6}
          placeholder="Ejemplo:&#10;Número español incluido&#10;Llamadas y SMS ilimitados&#10;28 días de validez"
          style={{ ...inp, resize: 'vertical', minHeight: 120, fontFamily: 'monospace', fontSize: 12 }}
        />
        <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 6 }}>
          Una característica por línea. Aparecerán en orden en la web.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input type="checkbox" id="highlight" checked={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.checked })} />
        <label htmlFor="highlight" style={{ fontSize: 13, color: '#AAAAAA', cursor: 'pointer' }}>Marcar como "Más elegido"</label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto" style={{ background: 'transparent', color: '#AAAAAA', border: '1px solid #2A2A2A', borderRadius: 9, padding: '11px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="w-full sm:w-auto" style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default function TarifasClient({ tariffs: initial }: { tariffs: Tariff[] }) {
  const [tariffs, setTariffs] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Tariff | null>(null)

  async function handleCreate(form: any) {
    const result = await createTariff(form)
    if (result.data) {
      setTariffs([...tariffs, result.data])
      setAdding(false)
    }
  }

  async function handleUpdate(form: any) {
    if (!editing) return
    const result = await updateTariff(editing.id, form)
    if (result.data) {
      setTariffs(tariffs.map(t => t.id === editing.id ? result.data : t))
      setEditing(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tarifa?')) return
    await deleteTariff(id)
    setTariffs(tariffs.filter(t => t.id !== id))
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div style={{ background: 'rgba(110,193,228,0.1)', border: '1px solid rgba(110,193,228,0.25)', borderRadius: 9, padding: '9px 14px', fontSize: 12, color: '#AAAAAA', flex: 1 }}>
          💡 Los precios <strong style={{ color: '#fff' }}>coste y PVP</strong> se configuran por agencia en <strong style={{ color: '#C9973A' }}>Agencias → Gestionar</strong>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null) }} style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          + Nueva tarifa
        </button>
      </div>

      {adding && (
        <TariffForm onSave={handleCreate} onCancel={() => setAdding(false)} />
      )}

      {['prepago', 'dataonly'].map(type => (
        <div key={type}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#7A7A7A', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 20 }}>
            {type === 'prepago' ? 'eSIM Prepago' : 'eSIM DataOnly'}
          </div>
          {tariffs.filter(t => t.type === type).map(t => (
            <div key={t.id}>
              {editing?.id === t.id ? (
                <TariffForm initial={t} onSave={handleUpdate} onCancel={() => setEditing(null)} />
              ) : (
                <div style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: type === 'prepago' ? 'rgba(230,0,0,0.15)' : 'rgba(110,193,228,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {type === 'prepago' ? '📱' : '📡'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</span>
                        {t.highlight && <span style={{ background: '#C9973A', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 6px' }}>⭐ MÁS ELEGIDO</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#7A7A7A', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.data_gb} GB{t.validity_days ? ` · ${t.validity_days} días` : ''}
                      </div>
                    </div>
                  </div>
                  {/* Acciones dentro de la card, full width en mobile */}
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(t); setAdding(false) }} className="flex-1" style={{ padding: '8px 0', background: '#232323', border: '1px solid #2A2A2A', borderRadius: 7, color: '#AAAAAA', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="flex-1" style={{ padding: '8px 0', background: 'rgba(230,0,0,0.1)', border: '1px solid rgba(230,0,0,0.3)', borderRadius: 7, color: '#C9973A', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {tariffs.filter(t => t.type === type).length === 0 && (
            <div style={{ color: '#7A7A7A', fontSize: 13, padding: '10px 0' }}>No hay tarifas de este tipo</div>
          )}
        </div>
      ))}
    </div>
  )
}