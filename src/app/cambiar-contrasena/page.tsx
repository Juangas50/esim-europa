import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CambiarContrasenaBienvenidaClient from './CambiarContrasenaClient'

export const dynamic = 'force-dynamic'

export default async function CambiarContrasenaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si no está autenticado, ir al login
  if (!user) redirect('/login')

  // Obtener datos del usuario
  const { data: profile } = await supabase
    .from('users')
    .select('must_change_password, full_name')
    .eq('id', user.id)
    .single()

  // Si no necesita cambiar contraseña, ir al dashboard
  if (!profile?.must_change_password) {
    redirect('/admin/dashboard')
  }

  return <CambiarContrasenaBienvenidaClient userName={profile?.full_name || 'Admin'} />
}
