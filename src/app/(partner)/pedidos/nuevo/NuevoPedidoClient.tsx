'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrder } from './actions'
import CancelOrderButton from '@/components/partner/CancelOrderButton'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { ORDER_STATUS_LABELS, usd, type BillingModel } from '@/lib/wallet'

export type Tariff = { id: string; name: string; type: 'prepago' | 'dataonly'; data_gb: number; validity_days: number | null }
type Pricing = { tariff_id: string; cost_price: number; pvp: number }
export type Recent = {
  id: string; order_ref: string; customer_name: string; customer_lastname: string; status: string
  cost_at_time: number; pvp_at_time: number; created_at: string; tariffs: { name: string } | null
}
type Props = {
  tariffs: Tariff[]; pricing: Pricing[]; agencyId: string
  billingModel: BillingModel; initialBalance: number | null; threshold: number; recent: Recent[]
}
type FormState = { nombre: string; apellido: string; pasaporte: string; nac: string; dob: string; email: string; when: 'now' | 'later'; fecha: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NATIONALITIES = ['Argentina', 'Uruguay', 'Chile', 'Brasil', 'Paraguay', 'Bolivia', 'Colombia', 'Venezuela', 'Perú', 'Otra']
const today = () => new Date().toISOString().slice(0, 10)
const maxActivation = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10) }
const maxDob = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().slice(0, 10) }
const blank = (): FormState => ({ nombre: '', apellido: '', pasaporte: '', nac: 'Argentina', dob: '', email: '', when: 'now', fecha: '' })

const C = { navy: '#1B2F4E', navy2: '#2D4A72', gold: '#C9973A', cream: '#F6F2EA', line: '#E2DACB', line2: '#CFC5B2', muted: '#566377', ok: '#046C4E', bad: '#B42318' }
const FONT_DISPLAY = 'DM Serif Display, DM Serif, serif'

export default function NuevoPedidoClient({ tariffs, pricing, agencyId, billingModel, initialBalance, threshold, recent }: Props) {
  const router = useRouter()
  const prepaid = billingModel === 'prepaid'
  const [liveBalance, setBalance] = useWalletBalance(prepaid ? agencyId : null, initialBalance)
  const balance = liveBalance ?? initialBalance ?? 0

  const priceOf = (id: string) => pricing.find(p => p.tariff_id === id)
  // Solo se ofrecen tarifas con precio configurado para esta agencia
  const available = useMemo(() => tariffs.filter(t => (priceOf(t.id)?.pvp ?? 0) > 0), [tariffs, pricing]) // eslint-disable-line react-hooks/exhaustive-deps

  const [tariffId, setTariffId] = useState<string | null>(available[0]?.id ?? null)
  const [form, setForm] = useState<FormState>(blank())
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [lastSale, setLastSale] = useState<{ ref: string; cost: number } | null>(null)
  const [noFunds, setNoFunds] = useState<{ name: string; cost: number } | null>(null)
  const firstField = useRef<HTMLInputElement>(null)

  const tariff = available.find(t => t.id === tariffId) ?? null
  const price = tariff ? priceOf(tariff.id) : undefined
  const cost = price?.cost_price ?? 0
  const pvp = price?.pvp ?? 0
  const isDataOnly = tariff?.type === 'dataonly'
  const scheduled = !isDataOnly && form.when === 'later'
  const canAfford = (c: number) => !prepaid || c <= balance

  const rules: Record<string, (v: string) => string> = {
    nombre: v => v.trim().length >= 2 ? '' : 'Escribe el nombre del titular.',
    apellido: v => v.trim().length >= 2 ? '' : 'Escribe el apellido del titular.',
    pasaporte: v => v.trim().length >= 5 ? '' : 'El pasaporte necesita al menos 5 caracteres.',
    email: v => EMAIL_RE.test(v.trim()) ? '' : 'Revisa el email, por ejemplo nombre@correo.com.',
    dob: v => !v ? 'Indica la fecha de nacimiento.' : v <= maxDob() ? '' : 'El titular debe ser mayor de 18 años.',
    fecha: v => !scheduled ? '' : !v ? 'Elige la fecha de activación.' : v < today() ? 'La fecha no puede ser pasada.' : v > maxActivation() ? 'Máximo un año desde hoy.' : '',
  }
  const LABEL: Record<string, string> = { nombre: 'nombre', apellido: 'apellido', pasaporte: 'pasaporte', email: 'email', dob: 'fecha de nacimiento', fecha: 'fecha de activación' }
  const errorsNow = Object.fromEntries(Object.keys(rules).map(k => [k, rules[k](form[k as keyof FormState] as string)]).filter(([, m]) => m)) as Record<string, string>
  const missing = Object.keys(errorsNow)
  const totalFields = scheduled ? 6 : 5
  const done = totalFields - missing.length
  const affordable = !tariff || canAfford(cost)
  const ready = !!tariff && missing.length === 0 && affordable && !busy

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }))
  const blur = (k: string) => setTouched(t => ({ ...t, [k]: true }))

  function pickTariff(t: Tariff) {
    setTariffId(t.id)
    const c = priceOf(t.id)?.cost_price ?? 0
    if (!canAfford(c)) setNoFunds({ name: t.name, cost: c })
  }

  async function sell() {
    if (!tariff) return
    setTouched({ nombre: true, apellido: true, pasaporte: true, email: true, dob: true, fecha: true })
    if (!canAfford(cost)) { setNoFunds({ name: tariff.name, cost }); return }
    if (missing.length) return
    setBusy(true); setError('')
    const res = await createOrder({
      tariffId: tariff.id,
      customerName: form.nombre, customerLastname: form.apellido,
      customerPassport: form.pasaporte, customerNationality: form.nac,
      customerDob: form.dob, customerEmail: form.email,
      activationDate: scheduled ? form.fecha : null,
    })
    setBusy(false)
    if (!res.ok) {
      if (res.insufficientBalance) setNoFunds({ name: tariff.name, cost })
      else setError(res.error)
      router.refresh()
      return
    }
    if (res.balanceAfter != null) setBalance(res.balanceAfter)
    setLastSale({ ref: res.orderRef, cost })
    setForm(blank()); setTouched({})
    router.refresh()
    firstField.current?.focus({ preventScroll: true })
  }

  const fieldErr = (k: string) => (touched[k] ? errorsNow[k] ?? '' : '')
  const inputStyle = (k: string): React.CSSProperties => ({
    width: '100%', minHeight: 48, padding: '10px 12px', borderRadius: 10, background: '#fff', color: '#1B2433',
    border: `1.5px solid ${fieldErr(k) ? C.bad : C.line2}`, fontSize: 15,
  })
  const field = ({ id, label, type = 'text', full, ac, inputMode, max, refEl }: { id: keyof FormState; label: string; type?: string; full?: boolean; ac?: string; inputMode?: 'email'; max?: string; refEl?: React.Ref<HTMLInputElement> }) => (
    <div className={`flex flex-col gap-1 min-w-0 ${full ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={`f-${id}`} className="text-[13px] font-bold">{label} <span aria-hidden style={{ color: C.bad }}>*</span></label>
      <input
        id={`f-${id}`} ref={refEl} type={type} value={form[id] as string} autoComplete={ac ?? 'off'} inputMode={inputMode} max={max} min={id === 'fecha' ? today() : undefined}
        aria-required="true" aria-invalid={!!fieldErr(id)} aria-describedby={`e-${id}`}
        onChange={e => set(id, e.target.value)} onBlur={() => blur(id)} style={inputStyle(id)}
        onKeyDown={e => { if (e.key === 'Enter' && ready) { e.preventDefault(); sell() } }}
      />
      <div id={`e-${id}`} role="alert" className="text-[13px]" style={{ color: C.bad }}>{fieldErr(id)}</div>
    </div>
  )

  const groups: { key: 'prepago' | 'dataonly'; title: string }[] = [{ key: 'prepago', title: 'eSIM Prepago' }, { key: 'dataonly', title: 'eSIM DataOnly' }]
  const showMissing = missing.length > 0 ? `Falta: ${missing.map(k => LABEL[k]).join(', ')}.` : !affordable ? 'Elige un plan que cubra tu saldo.' : ''

  return (
    <div className="max-w-[1240px] mx-auto flex flex-col gap-5 pb-28 lg:pb-6" style={{ fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif", color: '#1B2433' }}>
      <div>
        <h1 className="text-3xl m-0" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400, color: C.navy }}>Vender eSIM</h1>
        <p className="m-0 mt-1 text-sm" style={{ color: C.muted }}>
          {prepaid ? <>Saldo disponible: <b className="tabular-nums">{usd(balance)}</b>. Se descuenta al crear el pedido.</> : 'Elige el plan, completa los datos del cliente y vende.'}
        </p>
      </div>

      {prepaid && balance < threshold && (
        <div role="alert" className="rounded-xl p-3.5 text-sm flex gap-3" style={{ background: '#FCF0D8', color: '#8A5206' }}>
          <div><b className="block">Saldo bajo</b>Te quedan {usd(balance)}. Cuando recargues, avisa a tu ejecutivo RUTA34 con la referencia de pago.</div>
        </div>
      )}

      {available.length === 0 ? (
        <div className="rounded-2xl p-10 text-center bg-white" style={{ border: `1px solid ${C.line}`, color: C.muted }}>
          Tu agencia todavía no tiene tarifas con precio configurado. Contacta a tu ejecutivo RUTA34.
        </div>
      ) : (
        <div className="grid gap-4 items-start lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-4 min-w-0">
            {/* 1. Plan */}
            <section className="bg-white rounded-2xl p-4 pb-5" style={{ border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="grid place-items-center w-6 h-6 rounded-full text-[13px] font-bold text-white" style={{ background: C.navy }}>1</span>
                <h2 className="text-base font-extrabold m-0">Plan</h2>
              </div>
              <div role="radiogroup" aria-label="Plan" className="flex flex-col gap-2">
                {groups.map(g => {
                  const list = available.filter(t => t.type === g.key)
                  if (!list.length) return null
                  return (
                    <div key={g.key} className="flex flex-col gap-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider mt-1" style={{ color: C.muted }}>{g.title}</div>
                      {list.map(t => {
                        const p = priceOf(t.id)!
                        const ok = canAfford(p.cost_price)
                        const checked = tariffId === t.id
                        return (
                          <label key={t.id} className="relative block cursor-pointer" style={{ opacity: ok ? 1 : 0.65 }}>
                            <input type="radio" name="plan" value={t.id} checked={checked} onChange={() => pickTariff(t)} className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0" />
                            <div className="grid gap-x-3 gap-y-1 items-center rounded-xl px-3.5 py-3 min-h-[56px] grid-cols-3 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(64px,0.6fr))] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
                              style={{ border: `1.5px solid ${checked ? C.gold : C.line}`, background: checked ? 'rgba(201,151,58,0.08)' : '#fff', boxShadow: checked ? '0 0 0 3px rgba(201,151,58,0.25)' : 'none', outlineColor: C.navy2 }}>
                              <div className="col-span-3 sm:col-span-1 min-w-0">
                                <strong className="block text-[15px]">{t.name}</strong>
                                <span className="text-[13px]" style={{ color: C.muted }}>{t.data_gb} GB{t.validity_days ? ` · ${t.validity_days} días` : ''}</span>
                                {!ok && <span className="block text-[11px] font-extrabold mt-0.5" style={{ color: C.bad }}>Saldo insuficiente</span>}
                              </div>
                              {[{ l: 'Tu precio', v: p.cost_price, m: false }, { l: 'Tu PVP', v: p.pvp, m: false }, { l: 'Margen', v: p.pvp - p.cost_price, m: true }].map(c => (
                                <div key={c.l} className="flex flex-col sm:items-end tabular-nums">
                                  <small className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{c.l}</small>
                                  <b className="text-[15px] sm:text-base" style={{ color: c.m ? C.ok : undefined }}>{usd(c.v)}</b>
                                </div>
                              ))}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 2. Cliente */}
            <section className="bg-white rounded-2xl p-4 pb-5" style={{ border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="grid place-items-center w-6 h-6 rounded-full text-[13px] font-bold text-white" style={{ background: C.navy }}>2</span>
                <h2 className="text-base font-extrabold m-0">Cliente</h2>
                <span className="ml-auto text-[13px]" style={{ color: C.muted }}><span style={{ color: C.bad }}>*</span> obligatorio</span>
              </div>
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                {field({ id: 'nombre', label: 'Nombre', ac: 'given-name', refEl: firstField })}
                {field({ id: 'apellido', label: 'Apellido', ac: 'family-name' })}
                {field({ id: 'pasaporte', label: 'Pasaporte' })}
                <div className="flex flex-col gap-1 min-w-0">
                  <label htmlFor="f-nac" className="text-[13px] font-bold">Nacionalidad</label>
                  <select id="f-nac" value={form.nac} onChange={e => set('nac', e.target.value)} style={{ ...inputStyle('nac'), border: `1.5px solid ${C.line2}` }}>
                    {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                {field({ id: 'dob', label: 'Fecha de nacimiento', type: 'date', max: maxDob() })}
                {field({ id: 'email', label: 'Email del cliente (recibe el QR)', type: 'email', ac: 'email', inputMode: 'email' })}
                {isDataOnly ? (
                  <p className="sm:col-span-2 text-[13px] m-0" style={{ color: C.muted }}>eSIM DataOnly: el cliente activa el QR cuando quiera, dentro de 60 días.</p>
                ) : (
                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <span className="text-[13px] font-bold" id="when-label">Activación</span>
                    <div role="radiogroup" aria-labelledby="when-label" className="flex gap-2">
                      {([['now', 'Lo antes posible'], ['later', 'Programar fecha']] as const).map(([v, l]) => (
                        <label key={v} className="flex-1 relative flex items-center justify-center min-h-[48px] rounded-xl font-bold text-center px-2 cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2"
                          style={{ border: `1.5px solid ${form.when === v ? C.navy : C.line2}`, background: form.when === v ? C.navy : '#fff', color: form.when === v ? '#FAF7F2' : C.muted, outlineColor: C.navy2 }}>
                          <input type="radio" name="when" value={v} checked={form.when === v} onChange={() => set('when', v)} className="absolute opacity-0 w-px h-px" />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {scheduled && field({ id: 'fecha', label: 'Fecha de activación', type: 'date', full: true })}
              </div>
            </section>
          </div>

          {/* 3. Resumen */}
          <aside aria-label="Resumen de la venta" className="lg:sticky lg:top-[72px]">
            <section className="bg-white rounded-2xl p-4 pb-5" style={{ border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="grid place-items-center w-6 h-6 rounded-full text-[13px] font-bold text-white" style={{ background: C.navy }}>3</span>
                <h2 className="text-base font-extrabold m-0">Resumen</h2>
              </div>
              {lastSale && (
                <div role="status" className="rounded-xl p-3 mb-3 text-sm" style={{ background: '#E4F4EC', color: C.ok }}>
                  <b className="block">Venta {lastSale.ref} registrada</b>
                  {prepaid ? `Se descontaron ${usd(lastSale.cost)}. ` : ''}Puedes cancelarla mientras esté pendiente.
                </div>
              )}
              {error && <div role="alert" className="rounded-xl p-3 mb-3 text-sm" style={{ background: '#FDE9E7', color: C.bad }}>{error}</div>}
              <div className="flex justify-between text-[13px] font-bold"><span>Datos completos</span><span className="tabular-nums">{done} de {totalFields}</span></div>
              <div className="h-1.5 rounded-full my-1 mb-3 overflow-hidden" style={{ background: '#F1ECE2' }} aria-hidden>
                <div className="h-full transition-[width] duration-200" style={{ width: `${Math.round(done / totalFields * 100)}%`, background: C.gold }} />
              </div>
              {tariff && (
                <div className="text-sm tabular-nums">
                  <div className="flex justify-between py-1.5"><span style={{ color: C.muted }}>{tariff.name}</span><b>{tariff.data_gb} GB</b></div>
                  <div className="flex justify-between py-1.5"><span style={{ color: C.muted }}>Tu PVP al cliente</span><b>{usd(pvp)}</b></div>
                  <div className="flex justify-between py-1.5"><span style={{ color: C.muted }}>Tu margen</span><b style={{ color: C.ok }}>{usd(pvp - cost)}</b></div>
                  <div className="rounded-xl px-3.5 py-2 my-3" style={{ background: '#F1ECE2' }}>
                    {prepaid ? (
                      <>
                        <div className="flex justify-between py-1"><span style={{ color: C.muted }}>Saldo actual</span><b>{usd(balance)}</b></div>
                        <div className="flex justify-between py-1"><span style={{ color: C.muted }}>Se descuenta</span><b>{usd(-cost)}</b></div>
                        <div className="flex justify-between items-baseline pt-2 mt-1 font-extrabold" style={{ borderTop: `1px solid ${C.line2}` }}>
                          <span>Saldo después</span>
                          <b className="text-2xl" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400, color: balance - cost < 0 ? C.bad : undefined }}>{usd(balance - cost)}</b>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between py-1"><span style={{ color: C.muted }}>Tu precio</span><b>{usd(cost)}</b></div>
                        <p className="text-xs m-0" style={{ color: C.muted }}>Se factura a fin de mes.</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              {showMissing && <p className="text-[13px] m-0 mb-3" style={{ color: C.muted }}>{showMissing}</p>}
              <button type="button" onClick={sell} disabled={!ready} className="hidden lg:flex w-full min-h-[56px] rounded-xl font-extrabold text-[17px] items-center justify-center gap-2 transition disabled:cursor-not-allowed"
                style={{ background: ready ? C.gold : '#F1ECE2', color: ready ? C.navy : '#7A8699', border: 0 }}>
                {busy ? 'Vendiendo…' : `Vender eSIM${prepaid ? ` · ${usd(cost)}` : ''}`}
              </button>
              <p className="hidden lg:block text-xs text-center mt-2 mb-0" style={{ color: C.muted }}>Enter en cualquier campo también vende cuando todo está completo.</p>
            </section>
          </aside>
        </div>
      )}

      {/* Barra fija en móvil */}
      {available.length > 0 && (
        <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40 flex items-center gap-3 bg-white px-4 pt-2.5" style={{ borderTop: `1px solid ${C.line2}`, paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}>
          <div className="text-xs leading-tight" style={{ color: C.muted }}>{prepaid ? 'Se descuenta' : 'Tu precio'}<b className="block text-2xl font-normal" style={{ fontFamily: FONT_DISPLAY, color: '#1B2433' }}>{usd(cost)}</b></div>
          <button type="button" onClick={sell} disabled={!ready} className="flex-1 min-h-[52px] rounded-xl font-extrabold text-base disabled:cursor-not-allowed"
            style={{ background: ready ? C.gold : '#F1ECE2', color: ready ? C.navy : '#7A8699', border: 0 }}>{busy ? 'Vendiendo…' : 'Vender eSIM'}</button>
        </div>
      )}

      {/* Ventas recientes (con cancelar) */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="text-lg m-0" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400 }}>Últimas ventas</h2>
            <p className="m-0 text-[13px]" style={{ color: C.muted }}>Puedes cancelar mientras el pedido esté pendiente.</p>
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl" style={{ border: `1px solid ${C.line}` }}>
            <table className="w-full border-collapse" style={{ minWidth: 760 }}>
              <thead>
                <tr style={{ background: '#F1ECE2' }}>
                  {['Pedido', 'Cliente', 'Plan', 'Tu precio', 'Tu PVP', 'Estado', 'Acción'].map((h, i) => (
                    <th key={h} className={`px-3 py-2.5 text-xs uppercase tracking-wide font-bold ${i === 3 || i === 4 ? 'text-right' : 'text-left'}`} style={{ color: C.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(o => {
                  const st = ORDER_STATUS_LABELS[o.status] ?? ORDER_STATUS_LABELS.pending_review
                  return (
                    <tr key={o.id} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td className="px-3 py-2.5"><span className="font-mono text-[13px] font-semibold">{o.order_ref}</span><span className="block text-xs" style={{ color: C.muted }} suppressHydrationWarning>{new Date(o.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></td>
                      <td className="px-3 py-2.5">{o.customer_name} {o.customer_lastname}</td>
                      <td className="px-3 py-2.5">{o.tariffs?.name}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{usd(o.cost_at_time)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{usd(o.pvp_at_time)}</td>
                      <td className="px-3 py-2.5"><span className="text-xs font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                      <td className="px-3 py-2.5">
                        <CancelOrderButton orderId={o.id} orderRef={o.order_ref} status={o.status} customer={`${o.customer_name} ${o.customer_lastname}`}
                          tariffName={o.tariffs?.name ?? ''} refundAmount={prepaid ? Number(o.cost_at_time) : null}
                          onCancelled={b => { if (b != null) setBalance(b) }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Aviso previo: saldo insuficiente */}
      {noFunds && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(6,12,24,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setNoFunds(null) }}
          onKeyDown={e => { if (e.key === 'Escape') setNoFunds(null) }}>
          <div role="dialog" aria-modal="true" aria-labelledby="nf-title" className="bg-white rounded-2xl p-6 w-full max-w-[460px] flex flex-col gap-4 shadow-2xl">
            <h3 id="nf-title" className="text-2xl m-0" style={{ fontFamily: FONT_DISPLAY, fontWeight: 400, color: C.navy }}>Saldo insuficiente</h3>
            <div className="rounded-xl p-3 text-sm" style={{ background: '#FDE9E7', color: C.bad }}>
              <b className="block">No puedes iniciar esta venta</b>
              El {noFunds.name} cuesta {usd(noFunds.cost)} y tu saldo es {usd(balance)}. Faltan {usd(Math.max(noFunds.cost - balance, 0))}.
            </div>
            <p className="text-sm m-0" style={{ color: C.muted }}>Transfiere a RUTA34 y envía la referencia de pago a tu ejecutivo. El saldo aparece aquí en cuanto se confirme el depósito.</p>
            <div className="flex justify-end gap-2 flex-wrap">
              <button type="button" autoFocus onClick={() => setNoFunds(null)} className="min-h-[44px] px-4 rounded-lg font-bold text-white" style={{ background: C.navy }}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
