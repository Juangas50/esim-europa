'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createOrder } from './actions'

type Tariff = { id: string; name: string; type: string; data_gb: number; validity_days: number | null; badge: string; highlight: boolean }
type Pricing = { tariff_id: string; cost_price: number; pvp: number }

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
const isAdult = (dob: string) => { if (!dob) return false; const b = new Date(dob); const c = new Date(); c.setFullYear(c.getFullYear() - 18); return b <= c }
const todayStr = () => new Date().toISOString().split('T')[0]
const maxDateStr = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0] }
const maxDobStr = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] }

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
const stagger = { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }

// HORIZONTE BRANDBOOK
const C = {
  navyProfundo: '#1B2F4E',
  navyMedio: '#2D4A72',
  dorado: '#C9973A',
  doradoClaro: '#E8C56A',
  crema: '#FAF7F2',
  cremaOscuro: '#EDE8E0',
  textoOscuro: '#1E293B',
  textoMedio: '#64748B',
  textoBajo: '#94A3B8',
  success: '#059669',
  error: '#DC2626',
}

export default function NuevoPedidoClient({ tariffs, pricing, agencyId, sellerId }: { tariffs: Tariff[]; pricing: Pricing[]; agencyId: string; sellerId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [type, setType] = useState<string | null>(null)
  const [tariffId, setTariffId] = useState<string | null>(null)
  const [scheduled, setScheduled] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellidos: '', pasaporte: '', nac: 'Argentina', dob: '', email: '', date: '' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  const tariff = tariffs.find(t => t.id === tariffId)
  const pvp = pricing.find(p => p.tariff_id === tariffId)?.pvp || 0
  const cost = pricing.find(p => p.tariff_id === tariffId)?.cost_price || 0
  const hasPricing = pvp > 0 && cost >= 0

  const errors = {
    email: form.email && !isValidEmail(form.email) ? 'Email inválido' : '',
    dob: form.dob && !isAdult(form.dob) ? 'Debes ser mayor de 18' : '',
    date: form.date && (new Date(form.date) < new Date(todayStr()) || new Date(form.date) > new Date(maxDateStr())) ? 'Fecha inválida' : '',
  }

  const touch = (f: string) => setTouched(p => ({ ...p, [f]: true }))
  const step1Valid = type && tariffId && hasPricing
  const step2Valid = form.nombre && form.apellidos && form.pasaporte && isValidEmail(form.email) && isAdult(form.dob) && (type === 'dataonly' || !scheduled || (form.date && !errors.date))

  async function handleSubmit() {
    setLoading(true)
    const result = await createOrder({
      agencyId, sellerId, tariffId: tariffId!, type: type!,
      customerName: form.nombre, customerLastname: form.apellidos,
      customerPassport: form.pasaporte, customerNationality: form.nac,
      customerDob: form.dob, customerEmail: form.email,
      activationDate: type === 'dataonly' ? null : (!scheduled ? null : form.date),
    })
    if (result.orderRef) { setOrderRef(result.orderRef); setDone(true) }
    setLoading(false)
  }

  if (done) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center px-4" style={{ background: C.crema }}>
      <div className="text-center max-w-xl">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center text-5xl" style={{ background: `rgba(5,150,105,0.2)`, border: `2px solid ${C.success}` }}>✓</motion.div>
        <h2 className="text-4xl font-black mb-3" style={{ color: C.navyProfundo, fontFamily: 'DM Serif, serif' }}>¡Pedido Creado!</h2>
        <p className="text-lg mb-8" style={{ color: C.textoMedio }}>{type === 'prepago' && !scheduled && 'Tu equipo RUTA34 activará la eSIM.'}{type === 'prepago' && scheduled && `Se activará el ${form.date}.`}{type === 'dataonly' && 'El QR se enviará al cliente.'}</p>
        <div className="rounded-2xl p-6 mb-8 text-left" style={{ background: C.crema, border: `2px solid ${C.dorado}` }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.textoMedio }}>Resumen</div>
          <div className="text-2xl font-black mb-1" style={{ color: C.navyProfundo, fontFamily: 'DM Serif, serif' }}>{tariff?.name}</div>
          <div className="text-sm" style={{ color: C.textoMedio }}>{form.nombre} {form.apellidos}</div>
          <div className="font-mono text-sm mt-3" style={{ color: C.dorado }}>{orderRef}</div>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setDone(false); setStep(1); setType(null); setTariffId(null); setScheduled(false); setForm({ nombre: '', apellidos: '', pasaporte: '', nac: 'Argentina', dob: '', email: '', date: '' }); setTouched({}) }} className="flex-1 px-6 py-3 rounded-lg font-bold transition-colors" style={{ border: `2px solid ${C.navyProfundo}`, color: C.navyProfundo, background: 'transparent' }}>Nuevo Pedido</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => router.push('/pedidos')} className="flex-1 px-6 py-3 rounded-lg text-white font-bold transition-colors" style={{ background: C.dorado }}>Ver Pedidos</motion.button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen" style={{ background: C.crema }}>
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.navyProfundo} 0%, ${C.navyMedio} 100%)` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, rgba(201,151,58,0.1), transparent)` }} />

            <div className="relative max-w-6xl mx-auto px-4 py-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
                <div className="inline-block mb-6 px-4 py-2 rounded-full" style={{ background: `rgba(201,151,58,0.2)`, border: `1px solid rgba(201,151,58,0.5)` }}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.dorado }}>Portal Premium de Partners</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tighter" style={{ color: C.crema, fontFamily: 'DM Serif, serif' }}>Vende Conectividad Global</h1>
                <p className="text-base max-w-2xl mx-auto mb-6 leading-relaxed" style={{ color: C.doradoClaro }}>Tus clientes viajan tranquilos con eSIM premium. Tú generás ganancias. RUTA34 maneja el resto.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { num: '10K+', label: 'Viajeros' },
                  { num: '50+', label: 'Países' },
                  { num: '2 min', label: 'Activación' },
                ].map(({ num, label }) => (
                  <div key={label} className="p-4 rounded-xl text-center" style={{ background: `rgba(255,255,255,0.1)`, border: `1px solid rgba(232,197,106,0.3)` }}>
                    <div className="text-2xl font-black mb-1" style={{ color: C.dorado, fontFamily: 'DM Serif, serif' }}>{num}</div>
                    <div className="text-xs" style={{ color: C.doradoClaro }}>{label}</div>
                  </div>
                ))}
              </motion.div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => setStep(1)} className="mx-auto block px-8 py-3 text-white font-bold text-base rounded-xl transition-all" style={{ background: C.dorado }}>Crear Pedido Ahora</motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={`step-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black mb-1" style={{ color: C.navyProfundo, fontFamily: 'DM Serif, serif' }}>{step === 1 ? 'Elige tu Plan' : step === 2 ? 'Datos del Viajero' : 'Confirmar'}</h1>
                <p className="text-sm" style={{ color: C.textoMedio }}>{step === 1 && 'Selecciona tipo y tarifa'}{step === 2 && 'Información del cliente'}{step === 3 && 'Revisa antes de confirmar'}</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setStep(0)} className="px-3 py-2 text-sm rounded-lg transition-colors" style={{ border: `1px solid ${C.navyProfundo}`, color: C.navyProfundo }}>Volver</motion.button>
            </div>

            <div className="flex gap-2 mb-12 overflow-x-auto">
              {['Plan', 'Cliente', 'Confirmar'].map((label, i) => {
                const n = i + 1; const isDone = step > n; const active = step === n
                return (
                  <motion.div key={n} className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all flex-shrink-0" style={{ background: active ? `rgba(201,151,58,0.1)` : isDone ? `rgba(5,150,105,0.1)` : C.crema, borderColor: active ? C.dorado : isDone ? C.success : C.cremaOscuro }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: active ? C.dorado : isDone ? C.success : C.cremaOscuro, color: (active || isDone) ? '#FFF' : C.textoMedio }}>
                      {isDone ? '✓' : n}
                    </div>
                    <span className="font-semibold text-sm" style={{ color: active ? C.dorado : isDone ? C.success : C.textoMedio }}>{label}</span>
                  </motion.div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {step === 1 && (
                  <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-8">
                    {!type ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[{ key: 'prepago', title: 'eSIM Prepago', desc: '28 días desde activación' }, { key: 'dataonly', title: 'eSIM DataOnly', desc: '60 días para activar' }].map(({ key, title, desc }) => (
                          <motion.button key={key} variants={fadeIn} whileHover={{ scale: 1.02 }} onClick={() => { setType(key); setTariffId(null) }} className="p-8 rounded-2xl text-left transition-all" style={{ background: `rgba(201,151,58,0.05)`, border: `2px solid ${C.dorado}` }}>
                            <h3 className="text-2xl font-black mb-2" style={{ color: C.navyProfundo }}>{title}</h3>
                            <p className="text-sm" style={{ color: C.textoMedio }}>{desc}</p>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold" style={{ color: C.navyProfundo }}>Tarifas Disponibles</h3>
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setType(null); setTariffId(null) }} className="text-sm font-semibold" style={{ color: C.dorado }}>Cambiar</motion.button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tariffs.filter(t => t.type === type).map((t, idx) => {
                            const tpvp = pricing.find(p => p.tariff_id === t.id)?.pvp || 0
                            const thasPricing = tpvp > 0
                            const maxGb = Math.max(...tariffs.map(t => t.data_gb))
                            const dataPercent = (t.data_gb / maxGb) * 100
                            return (
                              <motion.button key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={thasPricing ? { scale: 1.02 } : {}} onClick={() => thasPricing && setTariffId(t.id)} disabled={!thasPricing} className="p-4 rounded-xl text-left transition-all" style={{ background: tariffId === t.id ? `rgba(201,151,58,0.15)` : C.crema, border: `2px solid ${tariffId === t.id ? C.dorado : C.cremaOscuro}`, opacity: thasPricing ? 1 : 0.5 }}>
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="text-base font-black" style={{ color: C.navyProfundo }}>{t.name}</h4>
                                    {t.highlight && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded" style={{ background: C.dorado }}>MÁS ELEGIDO</span>}
                                  </div>
                                  {thasPricing && <div className="text-right"><div className="text-2xl font-black" style={{ color: C.dorado, fontFamily: 'DM Serif, serif' }}>${tpvp}</div></div>}
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <div className="flex justify-between mb-1 text-xs"><span className="font-semibold" style={{ color: C.navyProfundo }}>{t.data_gb}GB</span><span style={{ color: C.textoBajo }}>{Math.round(dataPercent)}%</span></div>
                                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.cremaOscuro }}><motion.div initial={{ width: 0 }} animate={{ width: `${dataPercent}%` }} transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }} style={{ background: `linear-gradient(90deg, ${C.dorado}, ${C.doradoClaro})`, height: '100%' }} /></div>
                                  </div>
                                  <div className="text-xs pt-1 border-t" style={{ borderColor: C.cremaOscuro, color: C.textoBajo }}>{t.badge} · {t.validity_days}d</div>
                                </div>
                                {!thasPricing && <div className="mt-3 text-xs font-semibold" style={{ color: C.error }}>Sin precio</div>}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    <motion.button whileHover={{ scale: step1Valid ? 1.02 : 1 }} whileTap={step1Valid ? { scale: 0.95 } : {}} onClick={() => setStep(2)} disabled={!step1Valid} className="w-full py-4 rounded-xl font-bold text-lg transition-all" style={{ background: step1Valid ? C.dorado : C.cremaOscuro, color: step1Valid ? 'white' : C.textoBajo }}>Continuar →</motion.button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[{ key: 'nombre', label: 'Nombre' }, { key: 'apellidos', label: 'Apellidos' }, { key: 'pasaporte', label: 'Pasaporte' }, { key: 'nac', label: 'Nacionalidad', type: 'select' }, { key: 'dob', label: 'F. Nacimiento', type: 'date', full: true }, { key: 'email', label: 'Email', type: 'email', full: true }].map(({ key, label, type, full }) => (
                        <div key={key} className={full ? 'md:col-span-2' : ''}>
                          <label className="block text-xs font-bold mb-2 uppercase" style={{ color: C.textoMedio }}>{label}</label>
                          {type === 'select' ? (
                            <select value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition-colors" style={{ background: C.cremaOscuro, border: `1px solid ${C.cremaOscuro}`, color: C.textoOscuro }}>
                              {['Argentina', 'Uruguay', 'Chile', 'Brasil', 'Paraguay', 'Bolivia', 'Colombia', 'Venezuela', 'Perú', 'Otra'].map(n => <option key={n}>{n}</option>)}
                            </select>
                          ) : (
                            <input type={type || 'text'} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} onBlur={() => touch(key)} max={key === 'dob' ? maxDobStr() : undefined} className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition-colors" style={{ background: C.cremaOscuro, border: `1px solid ${touched[key] && (errors as any)[key] ? C.error : C.cremaOscuro}`, color: C.textoOscuro }} />
                          )}
                          {touched[key] && (errors as any)[key] && <p className="text-xs mt-1" style={{ color: C.error }}>{(errors as any)[key]}</p>}
                        </div>
                      ))}
                    </div>

                    {type === 'prepago' && (
                      <div className="space-y-4 pt-6" style={{ borderTop: `1px solid ${C.cremaOscuro}` }}>
                        <h4 className="text-lg font-bold" style={{ color: C.navyProfundo }}>Activación</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[{ key: false, label: 'Hoy' }, { key: true, label: 'Programar' }].map(({ key, label }) => (
                            <motion.button key={String(key)} whileHover={{ scale: 1.02 }} onClick={() => { setScheduled(key as boolean); setForm(f => ({ ...f, date: '' })) }} className="p-3 rounded-lg border-2 transition-all" style={{ background: scheduled === key ? `rgba(201,151,58,0.1)` : C.crema, borderColor: scheduled === key ? C.dorado : C.cremaOscuro }}>
                              <div className="font-bold" style={{ color: scheduled === key ? C.dorado : C.textoMedio }}>{label}</div>
                            </motion.button>
                          ))}
                        </div>
                        {scheduled && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <label className="block text-xs font-bold mb-2 uppercase" style={{ color: C.textoMedio }}>Fecha</label>
                            <input type="date" min={todayStr()} max={maxDateStr()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} onBlur={() => touch('date')} className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors" style={{ background: C.cremaOscuro, border: `1px solid ${C.cremaOscuro}`, color: C.textoOscuro }} />
                            {touched.date && errors.date && <p className="text-xs mt-1" style={{ color: C.error }}>{errors.date}</p>}
                          </motion.div>
                        )}
                      </div>
                    )}

                    <motion.button whileHover={{ scale: step2Valid ? 1.02 : 1 }} onClick={() => setStep(3)} disabled={!step2Valid} className="w-full py-4 rounded-xl font-bold text-lg transition-all" style={{ background: step2Valid ? C.dorado : C.cremaOscuro, color: step2Valid ? 'white' : C.textoBajo }}>Revisar →</motion.button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="p-6 rounded-2xl" style={{ background: `rgba(201,151,58,0.05)`, border: `2px solid ${C.dorado}` }}>
                      <h4 className="text-sm font-bold uppercase mb-4" style={{ color: C.textoMedio }}>Plan</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-black" style={{ color: C.navyProfundo, fontFamily: 'DM Serif, serif' }}>{tariff?.name}</div>
                          <div className="text-sm mt-1" style={{ color: C.textoMedio }}>{tariff?.data_gb}GB · {tariff?.validity_days}d</div>
                        </div>
                        <div className="text-3xl font-black" style={{ color: C.dorado, fontFamily: 'DM Serif, serif' }}>${pvp}</div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl" style={{ background: C.crema, border: `2px solid ${C.cremaOscuro}` }}>
                      <h4 className="text-sm font-bold uppercase mb-4" style={{ color: C.textoMedio }}>Cliente</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span style={{ color: C.textoMedio }}>Nombre</span><span style={{ color: C.navyProfundo, fontWeight: 'bold' }}>{form.nombre} {form.apellidos}</span></div>
                        <div className="flex justify-between"><span style={{ color: C.textoMedio }}>Email</span><span style={{ color: C.navyProfundo, fontWeight: 'bold' }}>{form.email}</span></div>
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-xl font-bold text-lg transition-all" style={{ background: loading ? C.cremaOscuro : C.dorado, color: 'white' }}>
                      {loading ? 'Procesando...' : 'Crear Pedido'}
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {step > 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
                  <div className="sticky top-8 p-6 rounded-2xl" style={{ background: `rgba(201,151,58,0.1)`, border: `2px solid ${C.dorado}` }}>
                    <h4 className="text-sm font-bold uppercase mb-6" style={{ color: C.textoMedio }}>Resumen</h4>
                    <div className="space-y-3 pb-6" style={{ borderBottom: `1px solid ${C.cremaOscuro}` }}>
                      <div className="flex justify-between text-sm"><span style={{ color: C.textoMedio }}>Tarifa</span><span style={{ color: C.navyProfundo, fontWeight: 'bold' }}>{tariff?.name}</span></div>
                      <div className="flex justify-between text-sm"><span style={{ color: C.textoMedio }}>GB</span><span style={{ color: C.navyProfundo, fontWeight: 'bold' }}>{tariff?.data_gb}GB</span></div>
                    </div>
                    <div className="py-6">
                      <div className="flex justify-between text-2xl font-black"><span style={{ color: C.navyProfundo }}>Total</span><span style={{ color: C.dorado }}>${pvp}</span></div>
                    </div>
                    {step < 3 && <div className="text-xs" style={{ color: C.textoMedio }}>Paso {step}/3</div>}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
