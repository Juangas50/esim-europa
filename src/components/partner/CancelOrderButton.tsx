'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelOrder } from '@/app/(partner)/pedidos/actions'
import { toast } from '@/lib/toast'
import { usd, isAgencyCancellable } from '@/lib/wallet'

type Props = {
  orderId: string
  orderRef: string
  status: string
  customer: string
  tariffName: string
  /** Importe que se devolverá al wallet; null si la agencia es postpago. */
  refundAmount: number | null
  onCancelled?: (balanceAfter: number | null) => void
}

/**
 * Botón "Cancelar" con confirmación. Si RUTA34 ya empezó a gestionar el pedido el botón
 * desaparece y se explica por qué (evita cancelar mientras se activa la línea).
 */
export default function CancelOrderButton({ orderId, orderRef, status, customer, tariffName, refundAmount, onCancelled }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, busy])

  if (!isAgencyCancellable(status)) {
    if (status === 'in_management') {
      return <span className="text-xs text-[#566377]">En gestión: ya no se puede cancelar</span>
    }
    return null
  }

  async function confirm() {
    setBusy(true); setError('')
    const res = await cancelOrder(orderId)
    setBusy(false)
    if (!res.ok) { setError(res.error); router.refresh(); return }
    setOpen(false)
    toast(refundAmount != null
      ? `Pedido ${orderRef} cancelado. Se devolvieron ${usd(refundAmount)} a tu wallet.`
      : `Pedido ${orderRef} cancelado.`)
    onCancelled?.(res.balanceAfter)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] px-4 rounded-lg text-sm font-bold transition-colors"
        style={{ background: 'rgba(180,35,24,0.08)', color: '#B42318', border: '1.5px solid rgba(180,35,24,0.35)' }}
      >
        Cancelar
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(6,12,24,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget && !busy) setOpen(false) }}>
          <div role="dialog" aria-modal="true" aria-labelledby={`cancel-title-${orderId}`} className="bg-white rounded-2xl p-6 w-full max-w-[440px] flex flex-col gap-4 shadow-2xl">
            <h3 id={`cancel-title-${orderId}`} className="m-0" style={{ fontFamily: 'DM Serif Display, DM Serif, serif', fontWeight: 400, color: '#1B2F4E', fontSize: 24, lineHeight: 1.2, letterSpacing: 0 }}>¿Cancelar este pedido?</h3>
            <p className="text-sm m-0" style={{ color: '#566377' }}>{orderRef} · {customer} · {tariffName}</p>
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(47,80,134,0.1)', color: '#2F5086' }}>
              {refundAmount != null ? <>Se devolverán <b>{usd(refundAmount)}</b> a tu wallet de inmediato.</> : 'El pedido se anula sin cargo.'}
            </div>
            {error && <div role="alert" className="rounded-xl p-3 text-sm" style={{ background: 'rgba(180,35,24,0.1)', color: '#B42318' }}>{error}</div>}
            <div className="flex gap-2 justify-end flex-wrap">
              <button type="button" disabled={busy} onClick={() => setOpen(false)} className="min-h-[44px] px-4 rounded-lg font-bold border-2 border-[#CFC5B2] text-[#1B2433] bg-transparent">Volver</button>
              <button ref={confirmRef} type="button" disabled={busy} onClick={confirm} className="min-h-[44px] px-4 rounded-lg font-bold text-white disabled:opacity-60" style={{ background: '#B42318' }}>
                {busy ? 'Cancelando…' : 'Sí, cancelar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
