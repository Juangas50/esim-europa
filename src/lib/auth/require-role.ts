'use server'

/**
 * Helpers de autorización para Server Actions.
 * Llama desde el inicio de cada acción protegida.
 *
 * Uso:
 *   const session = await requireAdmin()      // lanza si no es admin
 *   const session = await requireAuth()       // lanza si no está autenticado
 *   const session = await requireAgency(agencyId) // lanza si no pertenece a la agencia
 */

import { createClient } from '@/lib/supabase/server'

export type SessionUser = {
  userId: string
  role: string
  agencyId: string | null
}

/** Verifica sesión válida. Lanza 401 si no autenticado. */
export async function requireAuth(): Promise<SessionUser> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized: no session')

  const { data: profile } = await supabase
    .from('users')
    .select('role, agency_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Unauthorized: no profile')

  return { userId: user.id, role: profile.role, agencyId: profile.agency_id }
}

/** Verifica que el usuario autenticado sea admin. Lanza 403 si no. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    throw new Error('Forbidden: admin role required')
  }
  return session
}

/**
 * Verifica que el usuario autenticado pertenezca a la agencia indicada.
 * Los admins tienen acceso a cualquier agencia.
 */
export async function requireAgency(agencyId: string): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role === 'admin') return session  // admin puede todo
  if (session.agencyId !== agencyId) {
    throw new Error('Forbidden: agency mismatch')
  }
  return session
}
