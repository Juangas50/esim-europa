import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SidebarPartner from '@/components/layout/SidebarPartner'
import ToastContainer from '@/components/ui/ToastContainer'

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
    <div
      className="flex min-h-[100dvh] overflow-x-hidden"
      style={{ background: '#0C0C0C', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#fff' }}
    >
      <SidebarPartner agencyName={agencyName} />
      {/* pt-[52px] en mobile compensa el header fijo de SidebarPartner */}
      <div className="flex-1 flex flex-col min-w-0 pt-[52px] md:pt-0">
        <div className="hidden md:block" style={{ background: '#181818', borderBottom: '1px solid #2A2A2A', padding: '14px 24px' }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>Portal Partner</span>
        </div>
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}