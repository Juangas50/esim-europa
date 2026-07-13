'use client'

import { useState } from 'react'
import { login, resetPassword } from './actions'
import Image from 'next/image'

// HORIZONTE BRANDBOOK
const C = {
  navyProfundo: '#1B2F4E',
  navyMedio: '#2D4A72',
  dorado: '#C9973A',
  doradoClaro: '#E8C56A',
  crema: '#FAF7F2',
  cremaOscuro: '#EDE8E0',
  textoOscuro: '#1E293B',
  textoMedio: '#64748B',
  textoBajo: '#94A3B8',
  error: '#DC2626',
}

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
      justifyContent: 'center', background: `linear-gradient(135deg, ${C.navyProfundo} 0%, ${C.navyMedio} 100%)`,
      padding: 20, fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Decorative elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 400, height: 400, background: `radial-gradient(circle, rgba(201,151,58,0.1), transparent)`, borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 300, height: 300, background: `radial-gradient(circle, rgba(201,151,58,0.05), transparent)`, borderRadius: '50%', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: '#fff', fontFamily: "'DM Serif', serif", letterSpacing: -1 }}>RUTA</span>
              <span style={{ fontSize: 42, fontWeight: 900, color: C.dorado, fontFamily: "'DM Serif', serif", letterSpacing: -1 }}>34</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 6, color: C.doradoClaro, textTransform: 'uppercase', marginTop: 8, fontWeight: 800 }}>Partner Portal</div>
          </div>

          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.dorado}, transparent)`, margin: '16px 0' }} />

          <p style={{ color: C.textoMedio, fontSize: 13, marginTop: 16, fontWeight: 500 }}>Acceso exclusivo a partners RUTA34</p>
        </div>

        {/* Card */}
        <div style={{ background: C.crema, border: `2px solid ${C.cremaOscuro}`, borderRadius: 16, padding: 40, backdropFilter: 'blur(10px)' }}>

          {!resetMode ? (
            <>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: C.textoMedio, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email</label>
                  <input name="email" type="email" placeholder="tu@agencia.com" required
                    style={{ background: '#fff', border: `1px solid ${C.cremaOscuro}`, borderRadius: 8, padding: '12px 14px', color: C.textoOscuro, fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s ease' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = C.dorado}
                    onBlur={(e) => e.currentTarget.style.borderColor = C.cremaOscuro}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: C.textoMedio, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Contraseña</label>
                  <input name="password" type="password" placeholder="••••••••" required
                    style={{ background: '#fff', border: `1px solid ${C.cremaOscuro}`, borderRadius: 8, padding: '12px 14px', color: C.textoOscuro, fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s ease' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = C.dorado}
                    onBlur={(e) => e.currentTarget.style.borderColor = C.cremaOscuro}
                  />
                </div>

                {error && (
                  <div style={{ background: `rgba(220,38,38,0.1)`, border: `1px solid ${C.error}`, borderRadius: 8, padding: '12px 14px', color: C.error, fontSize: 13, fontWeight: 500 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ background: C.dorado, color: '#fff', border: 'none', borderRadius: 9, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8, transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#B8882F')}
                  onMouseLeave={(e) => e.currentTarget.style.background = C.dorado}
                >
                  {loading ? 'Ingresando...' : 'Ingresar al portal'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <span onClick={() => setResetMode(true)}
                  style={{ color: C.dorado, fontSize: 13, cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
            </>
          ) : (
            <>
              {!resetSent ? (
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.navyProfundo, marginBottom: 8, fontFamily: "'DM Serif', serif" }}>Recuperar contraseña</div>
                  <div style={{ fontSize: 14, color: C.textoMedio, lineHeight: 1.6 }}>
                    Ingresá tu email y te enviamos un link para crear una nueva contraseña.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12, color: C.textoMedio, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email</label>
                    <input name="email" type="email" placeholder="tu@agencia.com" required
                      style={{ background: '#fff', border: `1px solid ${C.cremaOscuro}`, borderRadius: 8, padding: '12px 14px', color: C.textoOscuro, fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s ease' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = C.dorado}
                      onBlur={(e) => e.currentTarget.style.borderColor = C.cremaOscuro}
                    />
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ background: C.dorado, color: '#fff', border: 'none', borderRadius: 9, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#B8882F'}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.dorado}
                  >
                    {loading ? 'Enviando...' : 'Enviar link de recuperación'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: C.navyProfundo, fontFamily: "'DM Serif', serif" }}>Revisá tu email</div>
                  <div style={{ color: C.textoMedio, fontSize: 14, lineHeight: 1.6 }}>
                    Te enviamos un link para restablecer tu contraseña. Revisa tu bandeja de entrada.
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <span onClick={() => { setResetMode(false); setResetSent(false) }}
                  style={{ color: C.dorado, fontSize: 13, cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
                  ← Volver al login
                </span>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: C.doradoClaro, fontSize: 12, marginTop: 28, letterSpacing: 0.5, fontWeight: 500 }}>
          ¿Sin acceso? Contactá a tu ejecutivo de cuenta RUTA34
        </p>
      </div>
    </div>
  )
}
