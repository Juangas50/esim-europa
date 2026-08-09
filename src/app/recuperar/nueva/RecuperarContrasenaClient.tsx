'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordWithToken } from '../../login/actions'

export default function RecuperarContrasenaBienvenidaClient() {
  const router = useRouter()
  const supabase = createClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Obtener el token de la URL (parámetro de query)
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (!token) {
          setError('Link de recuperación inválido o expirado')
          setIsCheckingToken(false)
          return
        }

        // Validar token contra la BD (esto se hace cuando se intenta cambiar la contraseña)
        // Por ahora, solo verificamos que existe el token en la URL
        setIsValidToken(true)
        // Guardar el token en estado para usarlo después
        ;(window as any).__resetToken = token
      } catch (err) {
        console.error('Token verification error:', err)
        setError('Error al verificar el link')
      } finally {
        setIsCheckingToken(false)
      }
    }

    verifyToken()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!newPassword || newPassword.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('La contraseña debe contener al menos una mayúscula')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('La contraseña debe contener al menos un número')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const token = (window as any).__resetToken
      if (!token) {
        setError('Token no encontrado')
        setLoading(false)
        return
      }

      const result = await resetPasswordWithToken(token, newPassword)

      if (!result.success) {
        setError(result.error || 'Error al cambiar contraseña')
        return
      }

      // Redirigir al login con mensaje de éxito
      router.push('/login?success=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1B2F4E 0%, #2D4A72 100%)',
          padding: '20px',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            background: '#FAF7F2',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ color: '#1B2F4E', fontSize: 16, fontWeight: 600 }}>
            Verificando tu link de recuperación...
          </p>
        </div>
      </div>
    )
  }

  if (!isValidToken || error) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1B2F4E 0%, #2D4A72 100%)',
          padding: '20px',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            background: '#FAF7F2',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1B2F4E', margin: '0 0 16px' }}>
            Link inválido o expirado
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.6 }}>
            {error || 'El link para recuperar tu contraseña ha expirado o no es válido. Por favor, solicita uno nuevo.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{
              background: '#C9973A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#B8882F'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#C9973A'}
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1B2F4E 0%, #2D4A72 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: '#FAF7F2',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>RUTA</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#C9973A' }}>34</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1B2F4E', margin: '0 0 8px' }}>
            Nueva contraseña
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            Establece una nueva contraseña para tu cuenta.
          </p>
        </div>

        {/* Aviso */}
        <div
          style={{
            background: 'rgba(201,151,58,0.08)',
            border: '1px solid rgba(201,151,58,0.25)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 24,
            fontSize: 13,
            color: '#555',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: '#C9973A' }}>🔐 Requisitos de contraseña:</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            <li>Mínimo 8 caracteres</li>
            <li>Al menos una mayúscula (A-Z)</li>
            <li>Al menos un número (0-9)</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nueva contraseña */}
          <div>
            <label
              htmlFor="newPassword"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#1B2F4E',
                marginBottom: 6,
              }}
            >
              Nueva contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 14px',
                  fontSize: 14,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  background: '#fff',
                  color: '#1E293B',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  fontSize: 16,
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#1B2F4E',
                marginBottom: 6,
              }}
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: 14,
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                background: '#fff',
                color: '#1E293B',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 13,
                color: '#EF4444',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            style={{
              background: '#C9973A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !newPassword || !confirmPassword ? 0.6 : 1,
              transition: 'all 0.2s',
              marginTop: 8,
            }}
            onMouseEnter={(e) => {
              if (!loading && newPassword && confirmPassword) {
                e.currentTarget.style.background = '#B8882F'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#C9973A'
            }}
          >
            {loading ? '⏳ Actualizando...' : '✓ Establecer contraseña'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#999', textAlign: 'center', margin: '20px 0 0' }}>
          Asegúrate de usar una contraseña segura y única
        </p>
      </div>
    </div>
  )
}
