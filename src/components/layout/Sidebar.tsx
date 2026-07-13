'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', icon: '▦', label: 'Dashboard' },
  { href: '/admin/pedidos', icon: '📦', label: 'Pedidos' },
  { href: '/admin/agencias', icon: '🏢', label: 'Agencias' },
  { href: '/admin/tarifas', icon: '🏷', label: 'Tarifas' },
  { href: '/admin/usuarios', icon: '👥', label: 'Administradores' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ width: 210, background: '#1B2F4E', borderRight: '1px solid #2D4A72', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0, flexShrink: 0, zIndex: 50, overflow: 'hidden' }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #2D4A72', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>RUTA</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#C9973A' }}>34</span>
        </div>
        <div style={{ fontSize: 8, letterSpacing: 6, color: '#64748B', marginTop: 1 }}>TELECOM</div>
        <div style={{ marginTop: 10, background: 'rgba(230,0,0,0.15)', border: '1px solid rgba(230,0,0,0.3)', borderRadius: 5, padding: '3px 8px', display: 'inline-block' }}>
          <span style={{ color: '#C9973A', fontSize: 9, fontWeight: 800, letterSpacing: 1.5 }}>ADMINISTRADOR</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href
          return (
            <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: active ? 'rgba(230,0,0,0.15)' : 'transparent', border: active ? '1px solid rgba(230,0,0,0.3)' : '1px solid transparent', color: active ? '#fff' : '#64748B', fontWeight: active ? 700 : 400, fontSize: 13 }}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '14px 18px', borderTop: '1px solid #2D4A72', flexShrink: 0, background: '#1B2F4E', zIndex: 10, position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Admin RUTA34</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Administrador</div>
        <button onClick={handleLogout} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', padding: 0, transition: 'color 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.color = '#C9973A'} onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
          ↩ Cerrar sesión
        </button>
      </div>
    </div>
  )
}