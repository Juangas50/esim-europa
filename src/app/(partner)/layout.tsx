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
      className="min-h-[100dvh] overflow-x-hidden"
      style={{ background: '#FAF7F2', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif", color: '#1E293B' }}
    >
      <SidebarPartner agencyName={agencyName} />
      {/* Contenido con margen izquierdo en desktop, pt en mobile */}
      <div className="flex flex-col min-w-0 pt-[52px] md:pt-0 md:ml-[210px]" style={{ minHeight: '100dvh' }}>
        <div className="hidden md:block" style={{ background: '#1B2F4E', borderBottom: '1px solid #2D4A72', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 40 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#FAF7F2', fontFamily: "DM Serif, serif" }}>Portal Partner</span>
        </div>
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}