import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import ToastContainer from '@/components/ui/ToastContainer'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/pedidos')

  return (
    /* overflow-x:hidden elimina scroll horizontal global en mobile */
    <div
      className="flex min-h-[100dvh] overflow-x-hidden"
      style={{ background: '#0C0C0C', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Sidebar — visible solo en desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Contenido principal — min-w-0 evita overflow en flexbox */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        {/* pb-20 en mobile para que la bottom nav no tape el contenido */}
        <div className="flex-1 text-white p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </div>

      {/* Bottom nav — solo mobile */}
      <MobileBottomNav />
      {/* Toasts — globales para todas las páginas del admin */}
      <ToastContainer />
    </div>
  )
}