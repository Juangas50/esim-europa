'use client'

import { useEffect, useState } from 'react'
import { getWalletOverview, configureWallet, topupWallet, attachTopupInvoice, type WalletOverview } from './wallet-actions'
import { toast } from '@/lib/toast'
import { usd, type BillingModel } from '@/lib/wallet'

const KIND: Record<string, string> = { topup: 'Recarga', sale: 'Venta', cancel_refund: 'Devolución (cancelación)', admin_void_refund: 'Devolución (anulación)', adjustment: 'Ajuste' }
const inp: React.CSSProperties = { background: '#fff', border: '1px solid #CFC5B2', borderRadius: 8, padding: '10px 12px', color: '#1E293B', fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', minHeight: 44 }
const btn = (bg: string, fg: string): React.CSSProperties => ({ background: bg, color: fg, border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minHeight: 44 })
const todayStr = () => new Date().toISOString().slice(0, 10)

export default function WalletPanel({ agencyId }: { agencyId: string }) {
  const [data, setData] = useState<WalletOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState('100')
  const [topup, setTopup] = useState({ amount: '', reference: '', date: todayStr() })
  const [invoiceFor, setInvoiceFor] = useState<string | null>(null)
  const [inv, setInv] = useState({ number: '', date: todayStr(), url: '' })
  const [busy, setBusy] = useState(false)

  async function load() {
    const d = await getWalletOverview(agencyId)
    setData(d); setLoading(false)
    if (d) setThreshold(String(d.threshold))
  }
  // El panel se monta con key={agencyId}, así que basta cargar al montar.
  useEffect(() => {
    let cancelled = false
    getWalletOverview(agencyId).then(d => {
      if (cancelled) return
      setData(d); setLoading(false)
      if (d) setThreshold(String(d.threshold))
    })
    return () => { cancelled = true }
  }, [agencyId])

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    setBusy(true)
    const r = await fn()
    setBusy(false)
    if (!r.ok) { toast(r.error || 'No se pudo completar la acción', 'error'); return false }
    toast(okMsg); await load(); return true
  }

  if (loading) return <p style={{ color: '#64748B', fontSize: 13 }}>Cargando wallet…</p>
  if (!data) return <p style={{ color: '#64748B', fontSize: 13 }}>No se pudo cargar el wallet.</p>

  const prepaid = data.billingModel === 'prepaid'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Modelo de facturación */}
      <section style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Modelo de facturación</div>
        <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 12px' }}>
          Prepago: cada venta se descuenta del wallet. Postpago: no hay wallet y se factura a fin de mes (la agencia no ve el wallet en su portal).
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {(['postpaid', 'prepaid'] as BillingModel[]).map(m => (
            <button key={m} disabled={busy || data.billingModel === m} style={{ ...btn(data.billingModel === m ? '#1B2F4E' : '#fff', data.billingModel === m ? '#fff' : '#1B2F4E'), border: '1.5px solid #1B2F4E', opacity: busy ? 0.6 : 1 }}
              onClick={() => run(() => configureWallet(agencyId, m, m === 'prepaid' ? Number(threshold) || 100 : null), m === 'prepaid' ? 'Agencia en prepago' : 'Agencia en postpago')}>
              {m === 'prepaid' ? 'Prepago' : 'Postpago'}
            </button>
          ))}
          {prepaid && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Aviso de saldo bajo (USD)
                <input style={{ ...inp, width: 140, display: 'block', marginTop: 4 }} inputMode="decimal" value={threshold} onChange={e => setThreshold(e.target.value)} />
              </label>
              <button disabled={busy} style={btn('#C9973A', '#1B2F4E')} onClick={() => run(() => configureWallet(agencyId, 'prepaid', Number(threshold)), 'Umbral guardado')}>Guardar</button>
            </div>
          )}
        </div>
      </section>

      {prepaid && (
        <>
          {/* Saldo + recarga */}
          <section style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div style={{ background: '#1B2F4E', color: '#FAF7F2', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#C3CFE1', fontWeight: 700 }}>Saldo actual</div>
              <div style={{ fontSize: 40, fontFamily: 'DM Serif Display, DM Serif, serif', fontVariantNumeric: 'tabular-nums' }}>{usd(data.balance)}</div>
              {data.balance < data.threshold && <div style={{ fontSize: 12, color: '#F2C26B', fontWeight: 700 }}>Por debajo del aviso ({usd(data.threshold)})</div>}
            </div>
            <form style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
              onSubmit={async e => {
                e.preventDefault()
                const amount = Number(topup.amount.replace(',', '.'))
                if (!(amount > 0)) { toast('Indica un monto mayor que cero', 'error'); return }
                const ok = await run(() => topupWallet(agencyId, amount, topup.reference, topup.date), `Recarga de ${usd(amount)} registrada. Falta adjuntar la factura de Qonto.`)
                if (ok) setTopup({ amount: '', reference: '', date: todayStr() })
              }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Recargar saldo</div>
              <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>Registra la recarga solo después de confirmar el depósito. No se puede editar ni borrar.</p>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Monto (USD)
                <input required style={{ ...inp, marginTop: 4 }} inputMode="decimal" value={topup.amount} onChange={e => setTopup({ ...topup, amount: e.target.value })} />
              </label>
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Referencia del pago
                  <input required style={{ ...inp, marginTop: 4 }} value={topup.reference} onChange={e => setTopup({ ...topup, reference: e.target.value })} />
                </label>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Fecha del pago
                  <input required type="date" style={{ ...inp, marginTop: 4 }} value={topup.date} max={todayStr()} onChange={e => setTopup({ ...topup, date: e.target.value })} />
                </label>
              </div>
              <button type="submit" disabled={busy} style={{ ...btn('#C9973A', '#1B2F4E'), opacity: busy ? 0.6 : 1 }}>{busy ? 'Registrando…' : 'Confirmar recarga'}</button>
            </form>
          </section>

          {/* Recargas y facturas de Qonto */}
          <section>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Recargas y facturas de Qonto</div>
            {data.topups.length === 0 && <p style={{ color: '#64748B', fontSize: 13 }}>Todavía no hay recargas.</p>}
            {data.topups.map(t => (
              <div key={t.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontSize: 13 }}><b style={{ fontVariantNumeric: 'tabular-nums' }}>{usd(t.amount)}</b> · {t.payment_date} · <span style={{ fontFamily: 'monospace' }}>{t.payment_reference}</span></div>
                  {t.invoice_number
                    ? <span style={{ fontSize: 12, fontWeight: 700, color: '#046C4E' }}>Factura {t.invoice_number}{t.invoice_url && <> · <a href={t.invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2F5086' }}>PDF</a></>}</span>
                    : <button style={btn('#1B2F4E', '#fff')} onClick={() => { setInvoiceFor(invoiceFor === t.id ? null : t.id); setInv({ number: '', date: todayStr(), url: '' }) }}>Falta la factura de Qonto: adjuntar</button>}
                </div>
                {invoiceFor === t.id && (
                  <form style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginTop: 12 }}
                    onSubmit={async e => { e.preventDefault(); const ok = await run(() => attachTopupInvoice(t.id, inv.number, inv.date, inv.url), 'Factura adjuntada. La agencia ya la ve.'); if (ok) setInvoiceFor(null) }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Número<input required style={{ ...inp, marginTop: 4 }} value={inv.number} onChange={e => setInv({ ...inv, number: e.target.value })} /></label>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Fecha<input required type="date" style={{ ...inp, marginTop: 4 }} value={inv.date} onChange={e => setInv({ ...inv, date: e.target.value })} /></label>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Enlace al PDF (opcional)<input style={{ ...inp, marginTop: 4 }} placeholder="https://" value={inv.url} onChange={e => setInv({ ...inv, url: e.target.value })} /></label>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" disabled={busy} style={btn('#C9973A', '#1B2F4E')}>Guardar factura</button></div>
                  </form>
                )}
              </div>
            ))}
          </section>

          {/* Movimientos */}
          <section>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Movimientos</div>
            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520, fontSize: 13 }}>
                <thead><tr style={{ background: '#F8FAFC' }}>{['Fecha y hora', 'Concepto', 'Importe', 'Saldo'].map((h, i) => <th key={h} style={{ textAlign: i > 1 ? 'right' : 'left', padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', color: '#64748B' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.movements.map(m => (
                    <tr key={m.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 12px' }}>{new Date(m.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ padding: '8px 12px' }}>{KIND[m.kind] ?? m.kind}{m.order_ref && <span style={{ color: '#64748B' }}> · {m.order_ref}</span>}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: m.amount > 0 ? '#046C4E' : '#B42318', fontVariantNumeric: 'tabular-nums' }}>{m.amount > 0 ? '+' : ''}{usd(m.amount)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{usd(m.balance_after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
