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
    .select('role, must_change_password')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/pedidos')

  // Si necesita cambiar contraseña, redirigir
  if (profile?.must_change_password) redirect('/cambiar-contrasena')

  return (
    /* overflow-x:hidden elimina scroll horizontal global en mobile */
    <div
      className="min-h-[100dvh] overflow-x-hidden md:ml-[210px]"
      style={{ background: '#FAF7F2', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif", color: '#1E293B' }}
    >
      {/* Sidebar — visible solo en desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Contenido principal — min-w-0 evita overflow en flexbox */}
      <div className="flex flex-col min-w-0" style={{ minHeight: '100dvh' }}>
        <TopBar />
        {/* pb-20 en mobile para que la bottom nav no tape el contenido */}
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6" style={{ color: '#1E293B' }}>
          {children}
        </div>
      </div>

      {/* Toasts — globales para todas las páginas del admin */}
      <ToastContainer />
    </div>
  )
}