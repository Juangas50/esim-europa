'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', icon: '▦', label: 'Dashboard' },
  { href: '/admin/pedidos', icon: '📦', label: 'Pedidos' },
  { href: '/admin/agencias', icon: '🏢', label: 'Agencias' },
  { href: '/admin/tarifas', icon: '🏷', label: 'Tarifas' },
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
    <div style={{ width: 210, background: '#0A0A0A', borderRight: '1px solid #2A2A2A', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>RUTA</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#C9973A' }}>34</span>
        </div>
        <div style={{ fontSize: 8, letterSpacing: 6, color: '#7A7A7A', marginTop: 1 }}>TELECOM</div>
        <div style={{ marginTop: 10, background: 'rgba(230,0,0,0.15)', border: '1px solid rgba(230,0,0,0.3)', borderRadius: 5, padding: '3px 8px', display: 'inline-block' }}>
          <span style={{ color: '#C9973A', fontSize: 9, fontWeight: 800, letterSpacing: 1.5 }}>ADMINISTRADOR</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href
          return (
            <button key={href} onClick={() => router.push(href)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: active ? 'rgba(230,0,0,0.15)' : 'transparent', border: active ? '1px solid rgba(230,0,0,0.3)' : '1px solid transparent', color: active ? '#fff' : '#7A7A7A', fontWeight: active ? 700 : 400, fontSize: 13 }}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '14px 18px', borderTop: '1px solid #2A2A2A' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Admin RUTA34</div>
        <div style={{ fontSize: 11, color: '#7A7A7A', marginTop: 2 }}>Administrador</div>
        <button onClick={handleLogout} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, color: '#7A7A7A', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', padding: 0 }}>
          ↩ Cerrar sesión
        </button>
      </div>
    </div>
  )
}