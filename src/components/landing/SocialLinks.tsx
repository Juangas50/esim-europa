"use client";

import { motion } from "framer-motion";
import { InstagramLogo, LinkedinLogo, TwitterLogo, TiktokLogo } from "@phosphor-icons/react";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const SOCIALS = [
  {
    name: "Instagram",
    icon: InstagramLogo,
    href: "https://instagram.com/ruta34telecom",
  },
  {
    name: "LinkedIn",
    icon: LinkedinLogo,
    href: "https://linkedin.com/company/ruta34",
  },
  {
    name: "Twitter",
    icon: TwitterLogo,
    href: "https://twitter.com/ruta34telecom",
  },
  {
    name: "TikTok",
    icon: TiktokLogo,
    href: "https://tiktok.com/@ruta34telecom",
  },
] as const;

export default function SocialLinks() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="py-8 md:py-12 px-4 bg-gradient-to-b from-white to-[var(--color-navy)]/5 border-t border-[var(--color-border)]"
    >
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="flex flex-col sm:flex-row items-center justify-between gap-8"
        >

          <div>
            <p className="text-sm font-bold text-[var(--color-navy)] mb-2">
              Síguenos en redes
            </p>
            <p className="text-xs text-[var(--color-ink-2)]">
              Consejos de viaje y novedades
            </p>
          </div>

          <div className="flex items-center gap-4">
            {SOCIALS.map(({ name, icon: Icon, href }) => (
              <motion.a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="w-10 h-10 rounded-full bg-[var(--color-warm-white)] flex items-center justify-center text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors"
                title={name}
              >
                <Icon size={20} weight="fill" />
              </motion.a>
            ))}
          </div>

        </motion.div>

      </div>
    </motion.section>
  );
}
