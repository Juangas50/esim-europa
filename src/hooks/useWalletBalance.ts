'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Saldo del wallet en tiempo real (Supabase Realtime sobre agency_wallets).
 * Las políticas RLS hacen que cada agencia solo reciba los cambios de su propio wallet.
 * Devuelve el saldo y un setter para reflejar al instante el resultado de una venta/cancelación
 * sin esperar al evento.
 */
export function useWalletBalance(agencyId: string | null, initial: number | null) {
  const [balance, setBalance] = useState<number | null>(initial)
  // Cuando el servidor entrega un saldo nuevo (router.refresh) se re-sincroniza durante el render,
  // sin efecto: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevInitial, setPrevInitial] = useState(initial)
  if (initial !== prevInitial) { setPrevInitial(initial); setBalance(initial) }

  useEffect(() => {
    if (!agencyId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`wallet-${agencyId}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'agency_wallets', filter: `agency_id=eq.${agencyId}` },
        payload => {
          const next = Number((payload.new as { balance?: number | string }).balance)
          if (Number.isFinite(next)) setBalance(next)
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [agencyId])

  return [balance, setBalance] as const
}
