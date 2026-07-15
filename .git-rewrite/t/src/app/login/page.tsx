'use client'

import { useState } from 'react'
import { login, resetPassword } from './actions'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const result = await login(form)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    await resetPassword(form)
    setResetSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'radial-gradient(ellipse at 70% 20%, #1a0a0a 0%, #0C0C0C 60%)',
      padding: 20, fontFamily: "'Helvetica Neue', Arial, sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, marginBottom: 6 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: -2 }}>RUTA</span>
            <span style={{ fontSize: 48, fontWeight: 900, color: '#E60000', letterSpacing: -2 }}>34</span>
          </div>
          <div style={{ fontSize: 10, letterSpacing: 8, color: '#7A7A7A', textTransform: 'uppercase', marginBottom: 20 }}>TELECOM</div>
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #2A2A2A, transparent)' }} />
          <p style={{ marginTop: 18, color: '#7A7A7A', fontSize: 13 }}>Portal exclusivo de partners</p>
        </div>

        {/* Card */}
        <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 14, padding: 32 }}>

          {!resetMode ? (
            <>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email</label>
                  <input name="email" type="email" placeholder="tu@agencia.com" required
                    style={{ background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 13px', color: '#fff', fontSize: 13, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Contraseña</label>
                  <input name="password" type="password" placeholder="••••••••" required
                    style={{ background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 13px', color: '#fff', fontSize: 13, outline: 'none' }} />
                </div>

                {error && (
                  <div style={{ background: 'rgba(230,0,0,0.1)', border: '1px solid rgba(230,0,0,0.3)', borderRadius: 8, padding: '10px 13px', color: '#E60000', fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ background: '#E60000', color: '#fff', border: 'none', borderRadius: 9, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                  {loading ? 'Ingresando...' : 'Ingresar al portal'}
                </button>
              </form>

              <div style={{ textAlign: 'right', marginTop: 14 }}>
                <span onClick={() => setResetMode(true)}
                  style={{ color: '#6EC1E4', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
            </>
          ) : (
            <>
              {!resetSent ? (
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Recuperar contraseña</div>
                  <div style={{ fontSize: 13, color: '#7A7A7A', lineHeight: 1.6 }}>
                    Ingresá tu email y te enviamos un link para crear una nueva contraseña.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email</label>
                    <input name="email" type="email" placeholder="tu@agencia.com" required
                      style={{ background: '#232323', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 13px', color: '#fff', fontSize: 13, outline: 'none' }} />
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ background: '#E60000', color: '#fff', border: 'none', borderRadius: 9, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    {loading ? 'Enviando...' : 'Enviar link de recuperación'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>📧</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Revisá tu email</div>
                  <div style={{ color: '#7A7A7A', fontSize: 13, lineHeight: 1.6 }}>
                    Te enviamos un link para restablecer tu contraseña.
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span onClick={() => { setResetMode(false); setResetSent(false) }}
                  style={{ color: '#7A7A7A', fontSize: 12, cursor: 'pointer' }}>
                  ← Volver al login
                </span>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#7A7A7A', fontSize: 11, marginTop: 24, letterSpacing: 0.3 }}>
          ¿Sin acceso? Contactá a tu ejecutivo de cuenta RUTA34
        </p>
      </div>
    </div>
  )
}