'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useWindowSize } from '@/hooks/useWindowSize'

const NAV = [
  { href: '/pedidos/nuevo', icon: '➕', label: 'Nuevo pedido' },
  { href: '/pedidos',       icon: '📦', label: 'Mis pedidos' },
  { href: '/facturas',      icon: '🧾', label: 'Mis facturas' },
]

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
}

export default function SidebarPartner({ agencyName }: { agencyName: string }) {
  const { isMobile } = useWindowSize()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function navigate(href: string) {
    router.push(href)
    setOpen(false)
  }

  if (isMobile) {
    return (
      <>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 100, background: C.navyProfundo, borderBottom: `1px solid ${C.navyMedio}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>RUTA</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: C.dorado }}>34</span>
          </div>
          <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1, fontFamily: 'inherit' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>

        {open && (
          <div style={{ position: 'fixed', top: 52, left: 0, right: 0, bottom: 0, zIndex: 99, background: C.navyProfundo, display: 'flex', flexDirection: 'column', padding: '12px 10px' }}>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV.map(({ href, icon, label }) => {
                const active = pathname === href
                return (
                  <button key={href} onClick={() => navigate(href)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, inherit', width: '100%', background: active ? `rgba(201,151,58,0.15)` : 'transparent', border: active ? `1px solid ${C.dorado}` : '1px solid transparent', color: active ? C.dorado : C.textoMedio, fontWeight: active ? 700 : 400, fontSize: 15, transition: 'all 0.2s ease' }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>{label}
                  </button>
                )
              })}
            </nav>
            <div style={{ borderTop: `1px solid ${C.navyMedio}`, paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans, inherit' }}>Portal Partner</div>
              <div style={{ fontSize: 11, color: C.textoMedio, marginTop: 2, fontFamily: 'Plus Jakarta Sans, inherit' }}>{agencyName}</div>
              <button onClick={handleLogout} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, color: C.textoMedio, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Plus Jakarta Sans, inherit', padding: 0, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = C.dorado} onMouseLeave={(e) => e.currentTarget.style.color = C.textoMedio}>
                ↩ Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div style={{ width: 210, background: C.navyProfundo, borderRight: `1px solid ${C.navyMedio}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0, flexShrink: 0, zIndex: 50, overflow: 'hidden' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.navyMedio}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'DM Serif, serif' }}>RUTA</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: C.dorado, fontFamily: 'DM Serif, serif' }}>34</span>
        </div>
        <div style={{ fontSize: 8, letterSpacing: 6, color: C.textoMedio, marginTop: 1, fontFamily: 'Plus Jakarta Sans, inherit' }}>TELECOM</div>
        <div style={{ marginTop: 10, background: `rgba(201,151,58,0.2)`, border: `1px solid ${C.dorado}`, borderRadius: 5, padding: '3px 8px', display: 'inline-block' }}>
          <span style={{ color: C.dorado, fontSize: 9, fontWeight: 800, letterSpacing: 1.5, fontFamily: 'Plus Jakarta Sans, inherit' }}>PARTNER</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || (href === '/pedidos' && pathname === '/pedidos')
          return (
            <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'Plus Jakarta Sans, inherit', background: active ? `rgba(201,151,58,0.15)` : 'transparent', border: active ? `1px solid ${C.dorado}` : '1px solid transparent', color: active ? C.dorado : C.textoMedio, fontWeight: active ? 700 : 400, fontSize: 13, transition: 'all 0.2s ease' }}>
              <span>{icon}</span>{label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.navyMedio}`, flexShrink: 0, background: C.navyProfundo, zIndex: 10, position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Plus Jakarta Sans, inherit' }}>Portal Partner</div>
        <div style={{ fontSize: 11, color: C.textoMedio, marginTop: 2, fontFamily: 'Plus Jakarta Sans, inherit' }}>{agencyName}</div>
        <button onClick={handleLogout} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, color: C.textoMedio, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'Plus Jakarta Sans, inherit', padding: 0, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = C.dorado} onMouseLeave={(e) => e.currentTarget.style.color = C.textoMedio}>
          ↩ Cerrar sesión
        </button>
      </div>
    </div>
  )
}
