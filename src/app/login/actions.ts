'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { sendPasswordResetEmail } from '@/lib/resend'
import crypto from 'crypto'

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
    redirect('/pedidos/nuevo')
  }
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase().slice(0, 254)

  // P2-06: validar email antes de llamar a Supabase
  if (!EMAIL_RE.test(email)) return

  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? 'https://www.esimruta34.com'

  try {
    // Verificar que el usuario existe en nuestra tabla users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Respuesta genérica para evitar user enumeration
      return
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Guardar token en la tabla users
    const { error: dbError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    if (dbError) {
      console.error('Database error saving reset token:', dbError)
      return
    }

    // Enviar email con Resend
    const resetLink = `${baseUrl}/recuperar/nueva?token=${resetToken}`
    console.log('[resetPassword] Enviando email a:', email)
    console.log('[resetPassword] Reset link:', resetLink)
    const result = await sendPasswordResetEmail({
      to: email,
      resetLink,
    })
    console.log('[resetPassword] Resultado de sendPasswordResetEmail:', result)

    if (result.error) {
      console.error('[resetPassword] Email send error:', result.error)
    } else {
      console.log('[resetPassword] Email enviado exitosamente:', result)
    }
  } catch (err) {
    console.error('Password reset exception:', err)
  }
  // No retornamos si fue exitoso o no — el cliente siempre ve el mismo mensaje
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!token || !newPassword || newPassword.length < 8) {
    return { error: 'Token o contraseña inválidos' }
  }

  const supabase = await createClient()

  try {
    // Buscar el usuario por token
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('id, email')
      .eq('password_reset_token', token)
      .gt('password_reset_expires', new Date().toISOString())
      .single()

    if (queryError || !users) {
      return { error: 'Link de recuperación inválido o expirado' }
    }

    // Cambiar la contraseña del usuario en Supabase Auth
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      users.id,
      { password: newPassword }
    )

    if (updateAuthError) {
      console.error('Auth update error:', updateAuthError)
      return { error: 'Error al cambiar la contraseña' }
    }

    // Limpiar el token de recuperación
    const { error: cleanupError } = await supabase
      .from('users')
      .update({
        password_reset_token: null,
        password_reset_expires: null,
      })
      .eq('id', users.id)

    if (cleanupError) {
      console.error('Cleanup error:', cleanupError)
    }

    return { success: true }
  } catch (err) {
    console.error('Password reset exception:', err)
    return { error: 'Error al procesar la solicitud' }
  }
}
