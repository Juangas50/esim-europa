"use client";

import { motion } from "framer-motion";
import { CheckCircle, Timer, CurrencyDollar } from "@phosphor-icons/react";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const GUARANTEES = [
  {
    icon: CheckCircle,
    title: "Activación garantizada",
    desc: "Tu eSIM se activa correctamente o reembolso",
  },
  {
    icon: Timer,
    title: "30 días de garantía",
    desc: "Pruébalo sin riesgo. Si no funciona, devolvemos tu dinero",
  },
  {
    icon: CurrencyDollar,
    title: "Sin cargos ocultos",
    desc: "Lo que ves en el precio es lo que pagas. Fin de la historia",
  },
] as const;

export default function Guarantees() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="py-10 md:py-12 px-4 bg-white"
    >
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--color-navy)] mb-4 leading-tight">
            Compra con confianza
          </h2>
          <p className="text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto">
            Garantías que protegen tu inversión
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GUARANTEES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: EASE_OUT }}
              className="p-6 rounded-2xl bg-[var(--color-warm-white)] border border-[var(--color-border)]"
            >
              <Icon size={32} weight="duotone" className="text-[var(--color-gold)] mb-4" />
              <h3 className="font-bold text-[var(--color-navy)] mb-2">
                {title}
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.section>
  );
}
