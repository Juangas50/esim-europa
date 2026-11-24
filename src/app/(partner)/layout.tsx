import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SidebarPartner from '@/components/layout/SidebarPartner'
import ToastContainer from '@/components/ui/ToastContainer'
import WalletChip from '@/components/layout/WalletChip'

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*, agencies(name)')
    .eq('id', user.id)
    .single()

  const agencyName = (profile?.agencies as any)?.name || 'Mi agencia'

  // Wallet prepago: consultas separadas y tolerantes. Si la migración del wallet aún no está
  // aplicada (o falla la consulta) la agencia se trata como postpago y el portal sigue igual.
  let wallet: { agencyId: string; balance: number; threshold: number } | null = null
  if (profile?.agency_id) {
    const { data: ag } = await supabase.from('agencies').select('billing_model').eq('id', profile.agency_id).maybeSingle()
    if (ag?.billing_model === 'prepaid') {
      const { data: w } = await supabase
        .from('agency_wallets').select('balance, low_balance_threshold').eq('agency_id', profile.agency_id).maybeSingle()
      if (w) wallet = { agencyId: profile.agency_id, balance: Number(w.balance), threshold: Number(w.low_balance_threshold) }
    }
  }

  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden"
      style={{ background: '#FAF7F2', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif", color: '#1E293B' }}
    >
      <SidebarPartner agencyName={agencyName} showWallet={!!wallet} />
      {/* Contenido con margen izquierdo en desktop, pt en mobile */}
      <div className="flex flex-col min-w-0 pt-[52px] md:pt-0 md:ml-[210px]" style={{ minHeight: '100dvh' }}>
        <div className="hidden md:block" style={{ background: '#1B2F4E', borderBottom: '1px solid #2D4A72', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 40 }}>
          <div className="flex items-center justify-between gap-4">
            <span style={{ fontSize: 17, fontWeight: 800, color: '#FAF7F2', fontFamily: "DM Serif, serif" }}>Portal Partner</span>
            {wallet && <WalletChip agencyId={wallet.agencyId} initialBalance={wallet.balance} threshold={wallet.threshold} />}
          </div>
        </div>
        {wallet && (
          <div className="md:hidden flex justify-end" style={{ background: '#1B2F4E', padding: '8px 16px' }}>
            <WalletChip agencyId={wallet.agencyId} initialBalance={wallet.balance} threshold={wallet.threshold} />
          </div>
        )}
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}