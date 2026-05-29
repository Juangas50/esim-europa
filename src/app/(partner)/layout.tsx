import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SidebarPartner from '@/components/layout/SidebarPartner'

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0C0C0C', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#fff' }}>
      <SidebarPartner agencyName={agencyName} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ background: '#181818', borderBottom: '1px solid #2A2A2A', padding: '14px 24px' }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>Portal Partner</span>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}