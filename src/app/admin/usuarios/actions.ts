'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-role'
import { sendEmail } from '@/lib/email/send'
import { emailNuevoAdmin } from '@/lib/email/templates'
import { revalidatePath } from 'next/cache'

// Generar contraseña temporal aleatoria (segura)
function generateTempPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

interface CreateAdminParams {
  email: string
  fullName: string
}

interface CreateAdminResult {
  success: boolean
  message: string
  error?: string
}

export async function createAdminUser({
  email,
  fullName,
}: CreateAdminParams): Promise<CreateAdminResult> {
  try {
    // Verificar permisos
    await requireAdmin()

    // Validar inputs
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Email inválido' }
    }
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, message: 'Nombre inválido' }
    }

    const tempPassword = generateTempPassword()
    const adminClient = createAdminClient()

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        full_name: fullName,
        must_change_password: true, // Flag para forzar cambio en primer login
      },
    })

    if (authError || !authData.user) {
      console.error('[createAdminUser] Auth error:', authError)

      // Mensaje de error más específico
      let errorMessage = 'Error al crear usuario en autenticación'
      if (authError?.message?.includes('duplicate') || authError?.message?.includes('already')) {
        errorMessage = `❌ El email ${email} ya está registrado en el sistema. Usa un email diferente.`
      } else if (authError?.message?.includes('invalid')) {
        errorMessage = `❌ Email inválido: ${email}`
      }

      return {
        success: false,
        message: errorMessage,
        error: authError?.message,
      }
    }

    const userId = authData.user.id

    // 2. Crear registro en tabla `users` con rol admin
    const { error: dbError } = await adminClient
      .from('users')
      .insert({
        id: userId,
        full_name: fullName,
        role: 'admin',
        active: true,
        must_change_password: true,
      })

    if (dbError) {
      console.error('[createAdminUser] DB error:', dbError)
      // Si falla la DB pero el usuario Auth se creó, eliminar el usuario Auth
      await adminClient.auth.admin.deleteUser(userId)
      return {
        success: false,
        message: 'Error al registrar usuario en la base de datos',
        error: dbError.message,
      }
    }

    // 3. Enviar email de bienvenida
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login`
    const emailTemplate = emailNuevoAdmin({
      adminName: fullName.split(' ')[0], // Primer nombre
      email: email.toLowerCase().trim(),
      tempPassword,
      loginUrl,
    })

    const { error: emailError } = await sendEmail(
      email.toLowerCase().trim(),
      emailTemplate.subject,
      emailTemplate.html,
    )

    if (emailError) {
      console.error('[createAdminUser] Email error:', emailError)
      // El usuario se creó pero el email falló - no es crítico pero se loguea
    }

    revalidatePath('/admin/usuarios')

    return {
      success: true,
      message: `Administrador ${fullName} creado exitosamente. Email de acceso enviado a ${email}`,
    }
  } catch (err) {
    console.error('[createAdminUser] Exception:', err)
    return {
      success: false,
      message: 'Error inesperado al crear administrador',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function updateAdminPassword(
  userId: string,
  newPassword: string,
): Promise<CreateAdminResult> {
  try {
    // El usuario debe estar autenticado
    const adminClient = createAdminClient()

    // Validar contraseña
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'Contraseña debe tener mínimo 8 caracteres' }
    }

    // Actualizar contraseña
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (authError) {
      return { success: false, message: 'Error al cambiar contraseña', error: authError.message }
    }

    // Limpiar flag de cambio de contraseña requerido
    const { error: dbError } = await adminClient
      .from('users')
      .update({ must_change_password: false })
      .eq('id', userId)

    if (dbError) {
      console.error('[updateAdminPassword] DB error:', dbError)
    }

    return { success: true, message: 'Contraseña actualizada exitosamente' }
  } catch (err) {
    console.error('[updateAdminPassword] Exception:', err)
    return {
      success: false,
      message: 'Error al cambiar contraseña',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
