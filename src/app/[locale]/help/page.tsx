"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  HelpHero,
  HelpCard,
  BottomHelpBanner,
} from "@/components/help";

export default function HelpPage() {
  const t = useTranslations("help");
  const locale = useLocale();

  const helpCategories = [
    {
      title: "Instalar en iPhone",
      description: "Guía paso a paso para activar tu eSIM en cualquier iPhone.",
      href: "/help/install/iphone",
      icon: "📱",
    },
    {
      title: "Instalar en Android",
      description: "Instrucciones para Samsung, Google Pixel, Xiaomi y otros.",
      href: "/help/install/android",
      icon: "🤖",
    },
    {
      title: "Instalar desde QR",
      description: "Cómo usar el código QR para instalar tu eSIM fácilmente.",
      href: "/help/qr",
      icon: "📲",
    },
    {
      title: "Cuándo activar",
      description: "Aprende cuándo es el momento ideal para activar tu eSIM.",
      href: "/help/activation",
      icon: "⚡",
    },
    {
      title: "Problemas frecuentes",
      description: "Resolvemos los errores más comunes que encuentran los usuarios.",
      href: "/help/troubleshooting",
      icon: "🔧",
    },
    {
      title: "Preguntas frecuentes",
      description: "Respuestas a las dudas más comunes sobre eSIM.",
      href: "/help/faq",
      icon: "❓",
    },
  ];

  return (
    <div className="bg-[var(--color-warm-white)] min-h-[100dvh]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-[#E9E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-[var(--color-navy)]">
            RUTA<span className="text-[var(--color-gold)]">34</span>
            <div className="text-xs font-bold tracking-widest text-[var(--color-ink-2)]">
              TELECOM
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <HelpHero
        title="Centro de Ayuda"
        subtitle="Todo lo que necesitás saber"
        description="Guías completas y respuestas a las preguntas más frecuentes. Instala tu eSIM en minutos."
        imageSrc="/images/confirmacion-hero.png"
        imageAlt="Help center"
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-[var(--color-navy)] text-center mb-4">
            ¿Cómo podemos ayudarte?
          </h2>
          <p className="text-center text-[var(--color-ink-2)] text-lg max-w-2xl mx-auto">
            Selecciona el tema que te interesa y accedé a guías detalladas,
            paso a paso.
          </p>
        </motion.div>

        {/* Help Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {helpCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <HelpCard
                title={category.title}
                description={category.description}
                href={category.href}
                icon={category.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <BottomHelpBanner />
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E9E2D8] bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-[var(--color-ink-2)]">
          <span>🔒 Pago 100% seguro</span>
          <span>•</span>
          <span>🛡️ Tus datos protegidos</span>
          <span>•</span>
          <span>📞 Soporte 24/7</span>
          <span>•</span>
          <span>© RUTA34 Telecom 2026</span>
        </div>
      </footer>
    </div>
  );
}
