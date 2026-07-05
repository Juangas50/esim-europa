"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-navy)] text-white py-14 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Top Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10"
        >

          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
                <span className="text-[var(--color-navy)] text-xs font-black">34</span>
              </div>
              <span className="font-black text-white text-lg tracking-tight">RUTA34</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t("tagline")}
            </p>
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)] hover:text-white transition-colors"
            >
              {t("support")} →
            </a>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">
              {t("company")}
            </h4>
            <ul className="space-y-3">
              {[
                { key: "about", href: `/${locale}/sobre` },
                { key: "howItWorks", href: "#como-funciona" },
                { key: "plans", href: "#planes" },
                { key: "compatibility", href: "#compatibilidad" },
                { key: "faq", href: "#faq" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    className="text-sm text-white/75 hover:text-[var(--color-gold)] transition-colors"
                  >
                    {t(`links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">
              {t("legal")}
            </h4>
            <ul className="space-y-3">
              {[
                { key: "terms", href: `/${locale}/terminos` },
                { key: "privacy", href: `/${locale}/privacidad` },
                { key: "cookies", href: `/${locale}/cookies` },
              ].map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    className="text-sm text-white/75 hover:text-[var(--color-gold)] transition-colors"
                  >
                    {t(`links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Info */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">
              {t("support")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/34600000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  WhatsApp 24/7
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@ruta34.com"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Email Support
                </a>
              </li>
            </ul>
          </div>

        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-white/40">
            © {year} RUTA34 Telecom. {t("rights")}
          </p>
          <p className="text-xs text-white/40">
            Hecho con {" "}
            <span className="text-[var(--color-gold)]">♥</span>
            {" "} para viajeros
          </p>
        </motion.div>

      </div>
    </footer>
  );
}
