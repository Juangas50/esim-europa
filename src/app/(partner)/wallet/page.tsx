export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { usd } from '@/lib/wallet'

const KIND: Record<string, string> = {
  topup: 'Recarga',
  sale: 'Venta',
  cancel_refund: 'Devolución por cancelación',
  admin_void_refund: 'Devolución por anulación',
  adjustment: 'Ajuste',
}

type Movement = { id: string; kind: string; amount: number | string; balance_after: number | string; created_at: string; orders: { order_ref: string; customer_name: string; customer_lastname: string } | null }

/** Movimientos del wallet. Solo agencias prepago: las postpago no tienen wallet (se redirige). */
export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('agency_id').eq('id', user.id).single()
  const agencyId = profile?.agency_id
  if (!agencyId) redirect('/pedidos')

  const { data: agency } = await supabase.from('agencies').select('billing_model').eq('id', agencyId).maybeSingle()
  if (agency?.billing_model !== 'prepaid') redirect('/pedidos/nuevo')

  const [{ data: wallet }, { data: movements }, { data: topups }] = await Promise.all([
    supabase.from('agency_wallets').select('balance, low_balance_threshold').eq('agency_id', agencyId).maybeSingle(),
    supabase
      .from('wallet_movements')
      .select('id, kind, amount, balance_after, created_at, orders(order_ref, customer_name, customer_lastname)')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('wallet_topups')
      .select('id, amount, payment_reference, payment_date, invoice_number, invoice_date, invoice_url')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const fmt = (d: string) => new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-6" style={{ color: '#1B2433' }}>
      <div>
        <h1 className="m-0" style={{ fontFamily: 'DM Serif Display, DM Serif, serif', fontWeight: 400, color: '#1B2F4E', fontSize: 32, lineHeight: 1.15, letterSpacing: 0, textShadow: 'none' }}>Mi wallet</h1>
        <p className="m-0 mt-1 text-sm" style={{ color: '#566377' }}>
          Saldo disponible: <b className="tabular-nums">{usd(Number(wallet?.balance ?? 0))}</b>. Te avisamos por correo cuando baje de {usd(Number(wallet?.low_balance_threshold ?? 100))}.
        </p>
      </div>

      <section>
        <h2 className="m-0 mb-2" style={{ fontFamily: 'DM Serif Display, DM Serif, serif', fontWeight: 400, fontSize: 20, lineHeight: 1.2, letterSpacing: 0, textShadow: 'none' }}>Recargas y facturas</h2>
        <div className="bg-white rounded-2xl overflow-x-auto" style={{ border: '1px solid #E2DACB' }}>
          <table className="w-full border-collapse" style={{ minWidth: 560 }}>
            <thead><tr style={{ background: '#F1ECE2' }}>
              {['Fecha del pago', 'Referencia', 'Monto', 'Factura'].map((h, i) => <th key={h} className={`px-3 py-2.5 text-xs uppercase tracking-wide font-bold ${i === 2 ? 'text-right' : 'text-left'}`} style={{ color: '#566377' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(topups || []).length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-sm" style={{ color: '#566377' }}>Todavía no hay recargas.</td></tr>}
              {(topups || []).map(t => (
                <tr key={t.id} style={{ borderTop: '1px solid #E2DACB' }}>
                  <td className="px-3 py-2.5 text-sm">{t.payment_date}</td>
                  <td className="px-3 py-2.5 text-sm font-mono">{t.payment_reference}</td>
                  <td className="px-3 py-2.5 text-sm text-right tabular-nums font-bold">{usd(Number(t.amount))}</td>
                  <td className="px-3 py-2.5 text-sm">
                    {t.invoice_number
                      ? (t.invoice_url
                          ? <a href={t.invoice_url} target="_blank" rel="noopener noreferrer" className="font-bold underline" style={{ color: '#2F5086' }}>Factura {t.invoice_number}</a>
                          : <span className="font-bold">Factura {t.invoice_number}</span>)
                      : <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,151,58,0.14)', color: '#92580A' }}>En preparación</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="m-0 mb-2" style={{ fontFamily: 'DM Serif Display, DM Serif, serif', fontWeight: 400, fontSize: 20, lineHeight: 1.2, letterSpacing: 0, textShadow: 'none' }}>Movimientos</h2>
        <div className="bg-white rounded-2xl overflow-x-auto" style={{ border: '1px solid #E2DACB' }}>
          <table className="w-full border-collapse" style={{ minWidth: 640 }}>
            <thead><tr style={{ background: '#F1ECE2' }}>
              {['Fecha y hora', 'Concepto', 'Importe', 'Saldo resultante'].map((h, i) => <th key={h} className={`px-3 py-2.5 text-xs uppercase tracking-wide font-bold ${i > 1 ? 'text-right' : 'text-left'}`} style={{ color: '#566377' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(movements || []).length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-sm" style={{ color: '#566377' }}>Todavía no hay movimientos.</td></tr>}
              {((movements || []) as unknown as Movement[]).map(m => {
                const amount = Number(m.amount)
                return (
                  <tr key={m.id} style={{ borderTop: '1px solid #E2DACB' }}>
                    <td className="px-3 py-2.5 text-sm" suppressHydrationWarning>{fmt(m.created_at)}</td>
                    <td className="px-3 py-2.5 text-sm">
                      {KIND[m.kind] ?? m.kind}
                      {m.orders?.order_ref && <span className="block text-xs" style={{ color: '#566377' }}>{m.orders.order_ref} · {m.orders.customer_name} {m.orders.customer_lastname}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums font-bold" style={{ color: amount > 0 ? '#046C4E' : '#B42318' }}>{amount > 0 ? '+' : ''}{usd(amount)}</td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums">{usd(Number(m.balance_after))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
