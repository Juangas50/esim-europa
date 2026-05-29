'use client'

import { usePathname } from 'next/navigation'

const TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/pedidos': 'Gestión de pedidos',
  '/admin/agencias': 'Agencias',
  '/admin/tarifas': 'Tarifas',
}

export default function TopBar() {
  const pathname = usePathname()
  const title = TITLES[pathname] || ''

  return (
    <div style={{
      background: '#181818', borderBottom: '1px solid #2A2A2A',
      padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <h1 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#fff' }}>{title}</h1>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', background: '#E60000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: '#fff'
      }}>A</div>
    </div>
  )
}