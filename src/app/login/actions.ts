'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// ── Rate limiting en memoria (P2-05) ─────────────────────────────────────────
// Funciona por instancia serverless. Para producción con tráfico alto,
// migrar a Upstash Redis o Vercel KV.
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS  = 5
const WINDOW_MS     = 15 * 60 * 1000  // 15 minutos

function isLoginRateLimited(ip: string): boolean {
  const now  = Date.now()
  const entry = loginAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (entry.count >= MAX_ATTEMPTS) return true
  entry.count++
  return false
}

function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function login(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (isLoginRateLimited(ip)) {
    return { error: 'Demasiados intentos. Esperá 15 minutos.' }
  }

  const email    = String(formData.get('email') ?? '').trim().toLowerCase().slice(0, 254)
  const password = String(formData.get('password') ?? '').slice(0, 128)

  if (!EMAIL_RE.test(email) || !password) {
    return { error: 'Email o contraseña incorrectos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos' }
  }

  // Login exitoso — limpiar intentos
  resetLoginAttempts(ip)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/pedidos')
  }
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase().slice(0, 254)

  // P2-06: validar email antes de llamar a Supabase
  if (!EMAIL_RE.test(email)) return

  const supabase = await createClient()

  // Respuesta genérica siempre para evitar user enumeration
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/recuperar/nueva`,
  })
  // No retornamos si fue exitoso o no — el cliente siempre ve el mismo mensaje
}
