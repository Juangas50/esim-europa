"use client";

import { motion } from "framer-motion";
import { CreditCard } from "@phosphor-icons/react";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const PAYMENT_METHODS = [
  { name: "Visa" },
  { name: "Mastercard" },
  { name: "Apple Pay" },
  { name: "Google Pay" },
  { name: "PayPal" },
] as const;

export default function PaymentMethods() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="py-8 md:py-12 px-4 bg-white border-t border-[var(--color-border)]"
    >
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">

          {/* Left — Seguridad */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="flex items-center gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414L10 3.586l4.707 4.707a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-ink-2)]">
                Pago 100% seguro
              </p>
              <p className="text-sm text-[var(--color-ink)] font-medium">
                Tus datos protegidos
              </p>
            </div>
          </motion.div>

          {/* Right — Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
            className="flex items-center gap-4"
          >
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-ink-2)]">
              Métodos de pago
            </p>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {PAYMENT_METHODS.map(({ name }) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="flex-shrink-0"
                  title={name}
                >
                  <div className="px-3 py-1.5 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-gold)] transition-colors">
                    <span className="text-xs font-bold text-[var(--color-navy)]">
                      {name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>
    </motion.section>
  );
}
