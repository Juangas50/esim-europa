"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import { Suspense } from "react";
import { analytics } from "@/lib/analytics";

function ConfirmacionContent() {
  const t = useTranslations("confirmation");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("ref") ?? "—";
  const planId = searchParams.get("plan") ?? "";
  const planName = searchParams.get("planName") ?? "Europa Plus";
  const coverage = searchParams.get("coverage") ?? "39";
  const data = searchParams.get("data") ?? "10";
  const validity = searchParams.get("validity") ?? "30";
  const purchaseDate = new Date().toLocaleDateString("es-ES");

  useEffect(() => {
    if (orderRef !== "—") {
      const qty = parseInt(searchParams.get("qty") ?? "1", 10) || 1;
      analytics.purchaseConfirmedPageViewed(orderRef, planId);
      analytics.confirmationViewed(orderRef, qty);
    }
  }, []);

  return (
    <div className="bg-[var(--color-warm-white)] min-h-[100dvh]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-[#E9E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-[var(--color-navy)]">
            RUTA<span className="text-[var(--color-gold)]">34</span>
            <div className="text-xs font-bold tracking-widest text-[var(--color-ink-2)]">TELECOM</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-[var(--color-ink-2)]">Pago seguro</span>
          </div>
        </div>
      </header>

      {/* Hero Section — Full Width Image */}
      <div className="relative h-[35vh] sm:h-[45vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-warm-white)] z-10" />
        <img
          src="/images/confirmacion-hero.png"
          alt="Europa viaje"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-gold)] flex items-center justify-center shadow-xl">
            <CheckCircle size={48} weight="fill" className="text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4 pt-16"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-navy)] leading-tight mb-4">
            Tu próximo viaje<br />empieza ahora.
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink)] max-w-lg leading-relaxed">
            Tu eSIM ya está confirmada.<br />En breve recibirás todo lo que necesitas<br />para tener conexión en Europa.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Tarjeta de Pedido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E2D8] shadow-sm mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Plan Icon + Info */}
            <div className="sm:col-span-1 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-4">Tu pedido</p>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F1E8] flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📱</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-[var(--color-navy)] mb-4">{planName}</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[var(--color-ink-2)]">Cobertura</p>
                      <p className="font-bold text-[var(--color-navy)]">{coverage} países</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-ink-2)]">Datos</p>
                      <p className="font-bold text-[var(--color-navy)]">{data} GB</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-ink-2)]">Validez</p>
                      <p className="font-bold text-[var(--color-navy)]">{validity} días</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-auto border-l border-[#E9E2D8]" />

            {/* Referencia */}
            <div className="sm:col-span-1 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-2)] mb-3">Referencia del pedido</p>
              <p className="text-2xl font-black text-[var(--color-navy)] font-mono mb-6 break-all">{orderRef}</p>
              <p className="text-sm">
                <span className="font-bold text-[var(--color-navy)]">Fecha de compra</span><br />
                <span className="text-[var(--color-ink-2)]">{purchaseDate}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline 4 Pasos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] text-center mb-4">¿QUÉ SUCEDE AHORA?</p>
          <h3 className="text-3xl sm:text-4xl font-black text-[var(--color-navy)] text-center mb-10">Tu eSIM en 4 simples pasos</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">
            {/* Connection Lines */}
            <div className="hidden sm:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold)] to-transparent" />

            {[
              { num: "1", icon: "🛍", title: "Compra realizada", desc: "Hemos recibido tu pago correctamente.", check: true },
              { num: "2", icon: "✉", title: "Email en camino", desc: "En breve recibirás tu código QR y las instrucciones.", check: true },
              { num: "3", icon: "📱", title: "Instala la eSIM", desc: "Te tomará menos de 5 minutos.", check: false },
              { num: "4", icon: "✈", title: "Disfruta tu viaje", desc: "Activa al aterrizar y navega sin roaming.", check: false },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-3 border-[var(--color-gold)] bg-white flex items-center justify-center font-bold text-[var(--color-gold)] text-xl">
                    {step.num}
                  </div>
                  {step.check && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-2xl mb-2">{step.icon}</p>
                <p className="font-bold text-[var(--color-navy)] mb-1">{step.title}</p>
                <p className="text-xs text-[var(--color-ink-2)] leading-snug">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="text-3xl sm:text-4xl font-black text-[var(--color-navy)] text-center mb-10">¿Necesitas ayuda?</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* WhatsApp — Larger */}
            <motion.a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4 }}
              className="sm:col-span-1 sm:row-span-2 bg-white border border-[#E9E2D8] rounded-2xl p-8 text-center hover:shadow-md transition-all flex flex-col justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💬</span>
              </div>
              <h4 className="font-black text-lg text-[var(--color-navy)] mb-3">Escribir por WhatsApp</h4>
              <p className="text-sm text-[var(--color-ink-2)]">Estamos aquí para ayudarte las 24 horas.</p>
            </motion.a>

            {/* Guide */}
            <motion.a
              href="#"
              whileHover={{ y: -4 }}
              className="bg-white border border-[#E9E2D8] rounded-2xl p-8 text-center hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📖</span>
              </div>
              <h4 className="font-bold text-[var(--color-navy)] mb-2">Guía de instalación</h4>
              <p className="text-xs text-[var(--color-ink-2)]">Paso a paso para iPhone y Android</p>
            </motion.a>

            {/* FAQ */}
            <motion.a
              href="#"
              whileHover={{ y: -4 }}
              className="bg-white border border-[#E9E2D8] rounded-2xl p-8 text-center hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❓</span>
              </div>
              <h4 className="font-bold text-[var(--color-navy)] mb-2">Preguntas frecuentes</h4>
              <p className="text-xs text-[var(--color-ink-2)]">Resolvemos las dudas más comunes</p>
            </motion.a>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="text-center mb-8">
          <motion.a
            href={`/${locale}`}
            whileHover={{ x: -2 }}
            className="inline-flex items-center gap-2 text-[var(--color-navy)] font-semibold hover:text-[var(--color-gold)] transition-colors"
          >
            ← Volver al inicio
          </motion.a>
        </div>
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

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9973A]/30 border-t-[#C9973A] rounded-full animate-spin" />
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
