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
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--color-border)]"
         style={{ background: 'var(--color-ruta-dark)' }}>
      <h1 className="text-base font-bold text-white m-0">{title}</h1>
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-gold)] text-white text-xs font-black">
        A
      </div>
    </div>
  )
}