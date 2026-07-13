'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOrder } from './actions'

type Tariff = { id: string; name: string; type: string; data_gb: number; validity_days: number | null; badge: string; highlight: boolean }
type Pricing = { tariff_id: string; cost_price: number; pvp: number }

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
const isAdult = (dob: string) => { if (!dob) return false; const b = new Date(dob); const c = new Date(); c.setFullYear(c.getFullYear() - 18); return b <= c }
const todayStr = () => new Date().toISOString().split('T')[0]
const maxDateStr = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0] }
const maxDobStr = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] }

const inp = { background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 13px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as const }

export default function NuevoPedidoClient({ tariffs, pricing, agencyId, sellerId }: { tariffs: Tariff[]; pricing: Pricing[]; agencyId: string; sellerId: string }) {
  const router = useRouter()
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  const [step, setStep] = useState(1)
  const [type, setType] = useState<string | null>(null)
  const [tariffId, setTariffId] = useState<string | null>(null)
  const [scheduled, setScheduled] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellidos: '', pasaporte: '', nac: 'Argentina', dob: '', email: '', date: '' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  useEffect(() => {
    if (tariffId && continueButtonRef.current) {
      continueButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [tariffId])

  const tariff = tariffs.find(t => t.id === tariffId)
  const pvp = pricing.find(p => p.tariff_id === tariffId)?.pvp || 0
  const cost = pricing.find(p => p.tariff_id === tariffId)?.cost_price || 0
  const hasPricing = pvp > 0 && cost >= 0

  const touch = (f: string) => setTouched(p => ({ ...p, [f]: true }))
  const errors = {
    email: form.email && !isValidEmail(form.email) ? 'Email inválido' : '',
    dob: form.dob && !isAdult(form.dob) ? 'El cliente debe ser mayor de 18 años' : '',
    date: form.date && (new Date(form.date) < new Date(todayStr()) || new Date(form.date) > new Date(maxDateStr())) ? 'La fecha debe estar entre hoy y 12 meses' : '',
  }
  const step2Valid = form.nombre && form.apellidos && form.pasaporte && isValidEmail(form.email) && isAdult(form.dob) && (type === 'dataonly' || !scheduled || (form.date && !errors.date)) && hasPricing

  const FieldError = ({ field }: { field: string }) => errors[field as keyof typeof errors] && touched[field] ? (
    <div style={{ color: '#C9973A', fontSize: 11, marginTop: 4, fontWeight: 600 }}>⚠ {errors[field as keyof typeof errors]}</div>
  ) : null

  async function handleSubmit() {
    setLoading(true)
    const result = await createOrder({
      agencyId, sellerId, tariffId: tariffId!, type: type!,
      customerName: form.nombre, customerLastname: form.apellidos,
      customerPassport: form.pasaporte, customerNationality: form.nac,
      customerDob: form.dob, customerEmail: form.email,
      activationDate: type === 'dataonly' ? null : (!scheduled ? null : form.date),
      pvpAtTime: pvp, costAtTime: cost,
    })
    if (result.orderRef) { setOrderRef(result.orderRef); setDone(true) }
    setLoading(false)
  }

  if (done) return (
    <div style={{ maxWidth: 540, margin: '40px auto', textAlign: 'center' }}>
      <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>✓</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>¡Pedido enviado!</h2>
      <p style={{ color: '#7A7A7A', lineHeight: 1.7, fontSize: 14, marginBottom: 24 }}>
        {type === 'prepago' && !scheduled && 'El equipo RUTA34 activará la eSIM. El QR se enviará al cliente vía email.'}
        {type === 'prepago' && scheduled && `Activación programada para el ${form.date}. El cliente recibirá confirmación ahora.`}
        {type === 'dataonly' && 'El QR se enviará al cliente. Tiene 60 días para activarlo.'}
      </p>
      <div style={{ background: '#181818', border: '1px solid #2A2A2A', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
        <div style={{ fontSize: 10, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>Resumen</div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{tariff?.name}</div>
        <div style={{ fontSize: 13, color: '#7A7A7A', marginTop: 4 }}>{form.nombre} {form.apellidos} · {form.email}</div>
        <div style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 12, color: '#C9973A' }}>{orderRef}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => { setDone(false); setStep(1); setType(null); setTariffId(null); setScheduled(false); setForm({ nombre: '', apellidos: '', pasaporte: '', nac: 'Argentina', dob: '', email: '', date: '' }); setTouched({}) }}
          style={{ background: 'transparent', color: '#AAAAAA', border: '1px solid #2A2A2A', borderRadius: 9, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Nuevo pedido
        </button>
        <button onClick={() => router.push('/pedidos')}
          style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Ver mis pedidos
        </button>
      </div>
    </div>
  )

  const Stepper = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {['Tipo y tarifa', 'Datos y confirmación'].map((s, i) => {
        const n = i + 1; const isDone = step > n; const active = step === n
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 1 ? 1 : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, background: isDone ? '#22C55E' : active ? '#C9973A' : '#232323', color: '#fff', border: `2px solid ${isDone ? '#22C55E' : active ? '#C9973A' : '#2A2A2A'}` }}>
                {isDone ? '✓' : n}
              </div>
              <span style={{ fontSize: 12, color: active ? '#fff' : '#7A7A7A', fontWeight: active ? 700 : 400 }}>{s}</span>
            </div>
            {i < 1 && <div style={{ flex: 1, height: 1, background: isDone ? '#22C55E' : '#2A2A2A', margin: '0 14px' }} />}
          </div>
        )
      })}
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Stepper />

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>¿Qué tipo de eSIM necesita tu cliente?</h2>
          <p style={{ color: '#7A7A7A', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>Esto define cuándo empieza a correr el plan.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {[
              { key: 'prepago', icon: '📱', title: 'eSIM Prepago', desc: 'El plan arranca desde que se activa. Podés programar para cuando llegue a Europa.', tag: '⏱ 28 días desde activación', color: '#C9973A', bg: 'rgba(230,0,0,0.08)' },
              { key: 'dataonly', icon: '📡', title: 'eSIM DataOnly', desc: 'Solo datos. El cliente tiene 60 días para activar el QR. El plan no empieza hasta que lo escanee.', tag: '🕐 60 días para activar', color: '#C9973A', bg: 'rgba(110,193,228,0.08)' },
            ].map(opt => (
              <div key={opt.key} onClick={() => { setType(opt.key); setTariffId(null) }}
                style={{ cursor: 'pointer', background: type === opt.key ? opt.bg : '#181818', border: `2px solid ${type === opt.key ? opt.color : '#2A2A2A'}`, borderRadius: 13, padding: 18, transition: 'all 0.18s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: type === opt.key ? opt.bg : '#232323', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{opt.icon}</div>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{opt.title}</span>
                </div>
                <div style={{ fontSize: 12, color: '#7A7A7A', lineHeight: 1.65, marginBottom: 12 }}>{opt.desc}</div>
                <div style={{ background: type === opt.key ? `${opt.color}20` : '#232323', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: type === opt.key ? opt.color : '#7A7A7A' }}>{opt.tag}</div>
              </div>
            ))}
          </div>

          {type && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                Elegí la tarifa
                <span style={{ background: type === 'prepago' ? 'rgba(230,0,0,0.15)' : 'rgba(110,193,228,0.15)', color: type === 'prepago' ? '#C9973A' : '#C9973A', borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                  {type === 'prepago' ? 'eSIM Prepago' : 'DataOnly'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {tariffs.filter(t => t.type === type).map(t => {
                  const tpvp = pricing.find(p => p.tariff_id === t.id)?.pvp
                  return (
                    <div key={t.id} onClick={() => setTariffId(t.id)}
                      style={{ cursor: 'pointer', background: tariffId === t.id ? (type === 'prepago' ? 'rgba(230,0,0,0.08)' : 'rgba(110,193,228,0.08)') : '#181818', border: `2px solid ${tariffId === t.id ? (type === 'prepago' ? '#C9973A' : '#C9973A') : '#2A2A2A'}`, borderRadius: 11, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 9, background: '#232323', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {type === 'prepago' ? '📱' : '📡'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                            <span style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</span>
                            {t.highlight && <span style={{ background: '#C9973A', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 6px' }}>⭐ MÁS ELEGIDO</span>}
                          </div>
                          <span style={{ color: '#7A7A7A', fontSize: 11 }}>{t.data_gb} GB{t.badge ? ` · ${t.badge}` : ''}{t.validity_days ? ` · ${t.validity_days} días` : ''}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {tpvp && tpvp > 0 ? (
                          <>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#C9973A', lineHeight: 1 }}>${tpvp}</div>
                            <div style={{ fontSize: 10, color: '#7A7A7A', marginTop: 2 }}>por el viaje</div>
                          </>
                        ) : (
                          <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700 }}>⚠️ Sin precio</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            <button ref={continueButtonRef} onClick={() => setStep(2)} disabled={!type || !tariffId}
              style={{ background: '#C9973A', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: !type || !tariffId ? 'not-allowed' : 'pointer', opacity: !type || !tariffId ? 0.4 : 1, fontFamily: 'inherit' }}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>Datos del cliente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Nombre *</label>
                  <input style={inp} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Juan" /></div>
                <div><label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Apellidos *</label>
                  <input style={inp} value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} placeholder="Pérez García" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>N° Pasaporte *</label>
                  <input style={inp} value={form.pasaporte} onChange={e => setForm({ ...form, pasaporte: e.target.value })} placeholder="AAA123456" /></div>
                <div><label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Nacionalidad *</label>
                  <select style={{ ...inp }} value={form.nac} onChange={e => setForm({ ...form, nac: e.target.value })}>
                    {['Argentina','Uruguay','Chile','Brasil','Paraguay','Bolivia','Colombia','Venezuela','Perú','Otra'].map(n => <option key={n}>{n}</option>)}
                  </select></div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Fecha de nacimiento * (debes ser mayor de 18 años)</label>
                <input type="date" max={maxDobStr()} style={{ ...inp, borderColor: touched.dob && errors.dob ? '#C9973A' : '#2A2A2A' }} value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} onBlur={() => touch('dob')} />
                <div style={{ fontSize: 10, color: '#7A7A7A', marginTop: 6 }}>ℹ️ Requerido por regulaciones de telecomunicaciones</div>
                <FieldError field="dob" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Email del cliente *</label>
                <input type="email" style={{ ...inp, borderColor: touched.email && errors.email ? '#C9973A' : '#2A2A2A' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onBlur={() => touch('email')} placeholder="juan@email.com" />
                <FieldError field="email" />
              </div>

              {type === 'prepago' && (
                <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 11 }}>📅 Fecha de activación</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
                    {[
                      { key: false, label: '🚀 Activar hoy', sub: 'Los 28 días corren desde ahora. Conectado al aterrizar.', color: '#C9973A' },
                      { key: true,  label: '📆 Programar fecha', sub: 'Elegí cuándo empieza tu plan (hasta 12 meses).', color: '#C9973A' },
                    ].map(opt => (
                      <button key={String(opt.key)} onClick={() => { setScheduled(opt.key as boolean); setForm(f => ({ ...f, date: '' })) }}
                        style={{ padding: '11px', borderRadius: 9, border: `2px solid ${scheduled === opt.key ? opt.color : '#2A2A2A'}`, background: scheduled === opt.key ? `${opt.color}10` : '#232323', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                        <div style={{ fontSize: 13, marginBottom: 2, color: scheduled === opt.key ? '#fff' : '#AAAAAA', fontWeight: scheduled === opt.key ? 700 : 400 }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: '#7A7A7A' }}>{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                  {!scheduled ? (
                    <div style={{ background: 'rgba(230,0,0,0.08)', border: '1px solid rgba(230,0,0,0.22)', borderRadius: 8, padding: '9px 13px', fontSize: 12, color: '#7A7A7A', lineHeight: 1.6 }}>
                      ⚠️ <strong style={{ color: '#fff' }}>El plan empieza a correr hoy.</strong> RUTA34 activa la eSIM y el QR se envía inmediatamente al cliente.
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Fecha programada *</label>
                      <input type="date" min={todayStr()} max={maxDateStr()} style={{ ...inp, borderColor: touched.date && errors.date ? '#C9973A' : '#2A2A2A' }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} onBlur={() => touch('date')} />
                      <FieldError field="date" />
                      {form.date && !errors.date && (
                        <div style={{ marginTop: 9, background: 'rgba(110,193,228,0.08)', border: '1px solid rgba(110,193,228,0.22)', borderRadius: 8, padding: '9px 13px', fontSize: 12, color: '#7A7A7A', lineHeight: 1.6 }}>
                          ✅ El cliente recibe <strong style={{ color: '#fff' }}>confirmación ahora</strong>. El QR se envía el <strong style={{ color: '#fff' }}>{form.date}</strong>.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {type === 'dataonly' && (
                <div style={{ background: 'rgba(110,193,228,0.08)', border: '1px solid rgba(110,193,228,0.22)', borderRadius: 9, padding: '12px 15px' }}>
                  <div style={{ fontWeight: 700, color: '#C9973A', fontSize: 12, marginBottom: 5 }}>ℹ️ ¿Cómo funciona DataOnly?</div>
                  <div style={{ color: '#7A7A7A', fontSize: 12, lineHeight: 1.7 }}>Se envía el QR al email del cliente. Tiene <strong style={{ color: '#fff' }}>60 días para escanearlo</strong>. El plan <strong style={{ color: '#fff' }}>no empieza hasta que lo active</strong>.</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 22 }}>
              <button onClick={() => setStep(1)} style={{ background: 'transparent', color: '#AAAAAA', border: '1px solid #2A2A2A', borderRadius: 9, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Atrás</button>
            </div>
          </div>

          {/* Resumen */}
          <div style={{ position: 'sticky', top: 24, background: '#181818', border: '1px solid #2A2A2A', borderRadius: 14, padding: 20 }}>
            {!hasPricing && (
              <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 9, padding: '10px 13px', marginBottom: 14, fontSize: 12, color: '#FCA5A5' }}>
                ⚠️ <strong style={{ color: '#FEE2E2' }}>Pricing no configurado</strong> para esta tarifa. Contactá a tu administrador.
              </div>
            )}
            <div style={{ fontSize: 10, fontWeight: 800, color: '#7A7A7A', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Resumen del pedido</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: type === 'prepago' ? 'rgba(230,0,0,0.15)' : 'rgba(110,193,228,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {type === 'prepago' ? '📱' : '📡'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{tariff?.name}</div>
                <div style={{ fontSize: 11, color: '#7A7A7A' }}>{tariff?.badge}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #2A2A2A' }}>
              {[
                { label: 'Tipo', value: type === 'prepago' ? 'eSIM Prepago' : 'DataOnly' },
                { label: 'Cliente', value: form.nombre ? `${form.nombre} ${form.apellidos}`.trim() : '—' },
                { label: 'Email', value: form.email && isValidEmail(form.email) ? form.email : '—' },
                { label: 'Activación', value: type === 'dataonly' ? 'Cliente activa (60 días)' : !scheduled ? 'Hoy' : form.date || '—' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#7A7A7A' }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'right', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#7A7A7A' }}>Total</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#C9973A' }}>${pvp}</span>
            </div>
            <button onClick={handleSubmit} disabled={!step2Valid || loading}
              style={{ width: '100%', background: '#C9973A', color: '#fff', border: 'none', borderRadius: 9, padding: '13px', fontSize: 14, fontWeight: 700, cursor: !step2Valid || loading ? 'not-allowed' : 'pointer', opacity: !step2Valid || loading ? 0.4 : 1, fontFamily: 'inherit' }}>
              {loading ? 'Enviando...' : 'Confirmar pedido ✓'}
            </button>
            {!step2Valid && <div style={{ marginTop: 10, fontSize: 11, color: '#7A7A7A', textAlign: 'center' }}>Completá todos los campos para continuar</div>}
          </div>
        </div>
      )}
    </div>
  )
}