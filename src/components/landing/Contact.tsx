"use client";

import { motion } from "framer-motion";
import { WhatsappLogo, EnvelopeSimple, Phone } from "@phosphor-icons/react";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const CONTACTS = [
  {
    icon: WhatsappLogo,
    label: "WhatsApp",
    value: "+34 600 000 000",
    href: "https://wa.me/34600000000",
    color: "text-emerald-600",
  },
  {
    icon: EnvelopeSimple,
    label: "Email",
    value: "support@ruta34.com",
    href: "mailto:support@ruta34.com",
    color: "text-[var(--color-gold)]",
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "Lunes a Sábado 8-21h (ES)",
    href: "tel:+34600000000",
    color: "text-[var(--color-navy)]",
  },
] as const;

export default function Contact() {
  return (
    <section className="py-10 md:py-16 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--color-navy)] mb-4 leading-tight">
            ¿Dudas?
          </h2>
          <p className="text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto">
            Nuestro equipo está disponible para ayudarte
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CONTACTS.map(({ icon: Icon, label, value, href, color }, i) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: EASE_OUT }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border border-[var(--color-border)] hover:shadow-md transition-shadow cursor-pointer"
            >
              <Icon size={32} weight="duotone" className={`${color} mb-4`} />
              <h3 className="font-bold text-[var(--color-navy)] mb-2 text-center">
                {label}
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] text-center leading-relaxed">
                {value}
              </p>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
