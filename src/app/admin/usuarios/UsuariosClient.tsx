'use client'

import { useState } from 'react'
import { createAdminUser } from './actions'

export default function UsuariosClient() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await createAdminUser({ email, fullName })

    setLoading(false)
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setEmail('')
      setFullName('')
    } else {
      setMessage({ type: 'error', text: result.message })
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1B2F4E', margin: '0 0 8px' }}>
          👥 Administradores
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
          Crear nuevos usuarios administrador
        </p>
      </div>

      <div
        style={{
          maxWidth: 560,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: 28,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1B2F4E', margin: '0 0 20px' }}>
          ➕ Crear nuevo administrador
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1B2F4E', marginBottom: 6 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                background: '#fff',
                color: '#1E293B',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Nombre completo */}
          <div>
            <label
              htmlFor="fullName"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1B2F4E', marginBottom: 6 }}
            >
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan García"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                background: '#fff',
                color: '#1E293B',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Aviso */}
          <div
            style={{
              background: 'rgba(201,151,58,0.08)',
              border: '1px solid rgba(201,151,58,0.25)',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 12,
              color: '#555',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: '#C9973A' }}>ℹ️ Cómo funciona:</strong>
            <br />
            Se generará una contraseña temporal y se enviará por email. El usuario debe acceder con
            esta contraseña y luego cambiarla por una nueva contraseña personal.
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div
              style={{
                background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 13,
                color: message.type === 'success' ? '#22C55E' : '#EF4444',
              }}
            >
              {message.type === 'success' ? '✅ ' : '⚠️ '}
              {message.text}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || !email || !fullName}
            style={{
              background: '#C9973A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !email || !fullName ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading && email && fullName) {
                e.currentTarget.style.background = '#B8882F'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#C9973A'
            }}
          >
            {loading ? '⏳ Creando...' : '✓ Crear administrador'}
          </button>
        </form>
      </div>
    </div>
  )
}
