'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWindowSize } from '@/hooks/useWindowSize'
import { motion } from 'framer-motion'

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

const STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pendiente revisión', color: '#C9973A', bg: 'rgba(201,151,58,0.1)' },
  scheduled:      { label: 'Programado',         color: '#C9973A', bg: 'rgba(201,151,58,0.1)' },
  qr_sent:        { label: 'QR Enviado',         color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
  activated:      { label: 'Activado',           color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
  cancelled:      { label: 'Cancelado',          color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
}

export default function PedidosPartnerClient({ orders }: { orders: any[] }) {
  const router = useRouter()
  const { isMobile } = useWindowSize()
  const [search, setSearch] = useState('')

  const filtered = orders.filter(o =>
    `${o.customer_name} ${o.customer_lastname} ${o.order_ref}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
      {/* Header + Search */}
      <motion.div className="flex gap-3 mb-6 justify-between items-center flex-wrap" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
        <div className="relative flex-1 min-w-[180px] max-w-[320px]">
          <input
            placeholder="Buscar por cliente o referencia…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-[#EDE8E0] rounded-lg px-4 py-2 pl-9 text-sm text-[#1B2F4E] placeholder-[#64748B] outline-none transition-all hover:border-[#C9973A] focus:border-[#C9973A] focus:ring-1 focus:ring-[#C9973A]/30"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">🔍</span>
        </div>
        <motion.button
          onClick={() => router.push('/pedidos/nuevo')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[var(--color-gold)] hover:bg-[#B8853D] text-[var(--color-navy)] font-bold text-sm px-5 py-2 rounded-lg transition-colors"
        >
          + Nuevo pedido
        </motion.button>
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <motion.div
          className="bg-white border border-[#EDE8E0] rounded-2xl p-10 text-center" style={{ color: '#64748B' }}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          {orders.length === 0 ? 'Todavía no hiciste ningún pedido.' : 'No se encontraron resultados.'}
        </motion.div>
      ) : isMobile ? (
        /* Mobile Cards */
        <motion.div className="flex flex-col gap-3" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
          {filtered.map((o, idx) => {
            const st = STATUSES[o.status] || STATUSES.pending_review
            return (
              <motion.div
                key={o.id}
                className="bg-white border border-[#EDE8E0] rounded-xl p-4"
                variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1, transition: { ease: EASE_OUT } } }}
                whileHover={{ y: -2, transition: { duration: 0.2, ease: EASE_OUT } }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-sm text-[var(--color-navy)]">{o.customer_name} {o.customer_lastname}</div>
                    <div className="text-xs text-[#64748B] mt-1">{o.customer_email}</div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-md flex-shrink-0 ml-2" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div className="flex gap-2 items-center flex-wrap text-xs">
                  <span className="font-mono text-[#64748B]">{o.order_ref}</span>
                  <span className="text-[#C9973A]">·</span>
                  <span className="text-[var(--color-navy)]">{o.tariffs?.name}</span>
                  <span className="px-2 py-1 rounded text-[10px] font-bold" style={{ background: o.type === 'prepago' ? 'rgba(201,151,58,0.1)' : 'rgba(5,150,105,0.1)', color: o.type === 'prepago' ? '#C9973A' : '#059669' }}>
                    {o.type === 'prepago' ? 'Prepago' : 'DataOnly'}
                  </span>
                  {o.activation_date && <span className="text-[#64748B]">{o.activation_date}</span>}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        /* Desktop Table */
        <motion.div
          className="bg-white border border-[#EDE8E0] rounded-2xl overflow-hidden"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#EDE8E0]">
                {['Ref', 'Cliente', 'Tarifa', 'Tipo', 'Activación', 'Estado'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const st = STATUSES[o.status] || STATUSES.pending_review
                return (
                  <motion.tr
                    key={o.id}
                    className={`${i < filtered.length - 1 ? 'border-b border-[#EDE8E0]' : ''} hover:bg-[#FAF7F2] transition-colors`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-[#64748B]">{o.order_ref}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-sm text-[var(--color-navy)]">{o.customer_name} {o.customer_lastname}</div>
                      <div className="text-xs text-[#64748B]">{o.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-navy)]">{o.tariffs?.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: o.type === 'prepago' ? 'rgba(245,158,11,0.1)' : 'rgba(110,231,183,0.1)', color: o.type === 'prepago' ? '#F59E0B' : '#6EE7B7' }}>
                        {o.type === 'prepago' ? 'Prepago' : 'DataOnly'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{o.activation_date || 'Cliente activa'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-3 py-1 rounded" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  )
}
