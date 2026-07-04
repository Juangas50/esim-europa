"use client";

import { motion } from "framer-motion";
import { CheckCircle, ShieldCheck, Headphones } from "@phosphor-icons/react";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const BADGES = [
  {
    icon: ShieldCheck,
    title: "eSIM 100% original",
    desc: "Fabricante verificado",
  },
  {
    icon: CheckCircle,
    title: "Garantía 30 días",
    desc: "Satisfacción o dinero devuelto",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    desc: "WhatsApp en tu idioma",
  },
] as const;

export default function TrustBadges() {
  return (
    <section className="py-10 md:py-12 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BADGES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_OUT }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-[var(--color-border)] hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center">
                <Icon size={24} weight="duotone" className="text-[var(--color-gold)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[var(--color-navy)] mb-1">
                  {title}
                </h3>
                <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
