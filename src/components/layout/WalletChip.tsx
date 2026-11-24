'use client'

import Link from 'next/link'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { usd } from '@/lib/wallet'

/** Saldo del wallet en vivo. Solo se monta para agencias prepago. */
export default function WalletChip({
  agencyId, initialBalance, threshold,
}: { agencyId: string; initialBalance: number; threshold: number }) {
  const [balance] = useWalletBalance(agencyId, initialBalance)
  const value = balance ?? initialBalance
  const low = value < threshold

  return (
    <Link
      href="/wallet"
      aria-label={`Saldo del wallet: ${usd(value)}${low ? ', saldo bajo' : ''}. Ver movimientos`}
      className="inline-flex items-center gap-3 rounded-xl px-3.5 min-h-[44px] no-underline transition-colors"
      style={{ background: low ? '#F2C26B' : 'rgba(255,255,255,0.1)', color: low ? '#3A2600' : '#FAF7F2' }}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ opacity: 0.85 }}>
        Saldo
        <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: low ? '#7A5410' : '#4ADE9B' }} />
      </span>
      <span className="text-2xl leading-none tabular-nums" style={{ fontFamily: 'DM Serif Display, DM Serif, serif' }}>{usd(value)}</span>
    </Link>
  )
}
