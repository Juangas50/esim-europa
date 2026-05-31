'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard', icon: '▦', label: 'Dashboard' },
  { href: '/admin/pedidos',   icon: '📦', label: 'Pedidos'   },
  { href: '/admin/agencias',  icon: '🏢', label: 'Agencias'  },
  { href: '/admin/tarifas',   icon: '🏷',  label: 'Tarifas'   },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#0A0A0A',
        borderTop: '1px solid #2A2A2A',
        display: 'flex',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV.map(({ href, icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '10px 4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: active ? '#E60000' : '#555',
              transition: 'color 150ms ease',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: 0.3 }}>{label}</span>
            {active && (
              <span style={{
                position: 'absolute',
                top: 0,
                width: 28,
                height: 2,
                background: '#E60000',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
