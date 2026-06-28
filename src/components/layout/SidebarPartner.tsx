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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 100, background: '#0A0A0A', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>RUTA</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#C9973A' }}>34</span>
          </div>
          <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1, fontFamily: 'inherit' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>

        {open && (
          <div style={{ position: 'fixed', top: 52, left: 0, right: 0, bottom: 0, zIndex: 99, background: '#0A0A0A', display: 'flex', flexDirection: 'column', padding: '12px 10px' }}>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV.map(({ href, icon, label }) => {
                const active = pathname === href
                return (
                  <button key={href} onClick={() => navigate(href)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%', background: active ? 'rgba(230,0,0,0.15)' : 'transparent', border: active ? '1px solid rgba(230,0,0,0.3)' : '1px solid transparent', color: active ? '#fff' : '#AAAAAA', fontWeight: active ? 700 : 400, fontSize: 15 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>{label}
                  </button>
                )
              })}
            </nav>
            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Portal Partner</div>
              <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 2 }}>{agencyName}</div>
              <button onClick={handleLogout} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, color: '#7A7A7A', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0 }}>
                ↩ Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div style={{ width: 210, background: '#0A0A0A', borderRight: '1px solid #2A2A2A', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>RUTA</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#C9973A' }}>34</span>
        </div>
        <div style={{ fontSize: 8, letterSpacing: 6, color: '#7A7A7A', marginTop: 1 }}>TELECOM</div>
        <div style={{ marginTop: 10, background: 'rgba(110,193,228,0.15)', border: '1px solid rgba(110,193,228,0.3)', borderRadius: 5, padding: '3px 8px', display: 'inline-block' }}>
          <span style={{ color: '#C9973A', fontSize: 9, fontWeight: 800, letterSpacing: 1.5 }}>PARTNER</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || (href === '/pedidos' && pathname === '/pedidos')
          return (
            <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: active ? 'rgba(230,0,0,0.15)' : 'transparent', border: active ? '1px solid rgba(230,0,0,0.3)' : '1px solid transparent', color: active ? '#fff' : '#7A7A7A', fontWeight: active ? 700 : 400, fontSize: 13 }}>
              <span>{icon}</span>{label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '14px 18px', borderTop: '1px solid #2A2A2A' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Portal Partner</div>
        <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 2 }}>{agencyName}</div>
        <button onClick={handleLogout} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, color: '#7A7A7A', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', padding: 0 }}>
          ↩ Cerrar sesión
        </button>
      </div>
    </div>
  )
}
