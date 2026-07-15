'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createTariff, updateTariff, deleteTariff } from './actions'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type Tariff = {
  id: string
  name: string
  type: string
  data_gb: number
  validity_days: number | null
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
    name: initial?.name || '',
    type: initial?.type || 'prepago',
    data_gb: initial?.data_gb?.toString() || '',
    validity_days: initial?.validity_days?.toString() || '',
    badge: initial?.badge || '',
    highlight: initial?.highlight || false,
  })
  const [loading, setLoading] = useState(false)

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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Nombre *</label>
          <input required style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Traveler 15GB" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Tipo *</label>
          <select required style={{ ...inp }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="prepago">Prepago</option>
            <option value="dataonly">DataOnly</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Datos (GB) *</label>
          <input required type="number" style={inp} value={form.data_gb} onChange={e => setForm({ ...form, data_gb: e.target.value })} placeholder="15" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Días vigencia</label>
          <input type="number" style={inp} value={form.validity_days} onChange={e => setForm({ ...form, validity_days: e.target.value })} placeholder="28" />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
          Descripción
        </label>
        <div data-color-mode="dark">
          <MDEditor
            value={form.badge}
            onChange={val => setForm({ ...form, badge: val || '' })}
            height={160}
            preview="edit"
          />
        </div>
        <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 6 }}>
          Podés usar **negrita**, _cursiva_, listas y más.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input type="checkbox" id="highlight" checked={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.checked })} />
        <label htmlFor="highlight" style={{ fontSize: 13, color: '#AAAAAA', cursor: 'pointer' }}>Marcar como "Más elegido"</label>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ background: 'transparent', color: '#AAAAAA', border: '1px solid #2A2A2A', borderRadius: 9, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} style={{ background: '#E60000', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ background: 'rgba(110,193,228,0.1)', border: '1px solid rgba(110,193,228,0.25)', borderRadius: 9, padding: '9px 14px', fontSize: 12, color: '#AAAAAA' }}>
          💡 Los precios <strong style={{ color: '#fff' }}>coste y PVP</strong> se configuran por agencia en <strong style={{ color: '#6EC1E4' }}>Agencias → Gestionar</strong>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null) }} style={{ background: '#E60000', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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
                <div style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: type === 'prepago' ? 'rgba(230,0,0,0.15)' : 'rgba(110,193,228,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {type === 'prepago' ? '📱' : '📡'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</span>
                        {t.highlight && <span style={{ background: '#E60000', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 6px' }}>⭐ MÁS ELEGIDO</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#7A7A7A', marginTop: 3 }}>
                        {t.data_gb}GB{t.validity_days ? ` · ${t.validity_days} días` : ''}{t.badge ? ` · ${t.badge.replace(/[#*_]/g, '').slice(0, 60)}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#7A7A7A' }}>Precios por agencia</span>
                    <button onClick={() => { setEditing(t); setAdding(false) }} style={{ padding: '6px 12px', background: '#232323', border: '1px solid #2A2A2A', borderRadius: 7, color: '#AAAAAA', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(t.id)} style={{ padding: '6px 12px', background: 'rgba(230,0,0,0.1)', border: '1px solid rgba(230,0,0,0.3)', borderRadius: 7, color: '#E60000', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
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