'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' }

const COLORS = {
  success: { bg: '#166534', border: '#22C55E', icon: '✅' },
  error:   { bg: '#7F1D1D', border: '#EF4444', icon: '❌' },
  info:    { bg: '#1E3A5F', border: '#6EC1E4', icon: 'ℹ️' },
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type = 'success' } = (e as CustomEvent).detail
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }
    window.addEventListener('show-toast', handler)
    return () => window.removeEventListener('show-toast', handler)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 88, // por encima de la bottom nav mobile
      right: 16,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
      maxWidth: 300,
    }}>
      <AnimatePresence>
        {toasts.map(t => {
          const c = COLORS[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 48, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                pointerEvents: 'auto',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              <span>{c.icon}</span>
              <span>{t.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
