"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Book, Question, MagnifyingGlass } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import { Suspense } from "react";
import { fadeUp, stagger } from "@/lib/motion";
import { analytics } from "@/lib/analytics";

function ConfirmacionContent() {
  const t = useTranslations("confirmation");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("ref") ?? "—";
  const planId = searchParams.get("plan") ?? "";
  const planName = searchParams.get("planName") ?? "eSIM RUTA34";
  const coverage = searchParams.get("coverage") ?? "39";
  const data = searchParams.get("data") ?? "10";
  const validity = searchParams.get("validity") ?? "30";
  const purchaseDate = searchParams.get("date") ?? new Date().toLocaleDateString("es-ES");

  useEffect(() => {
    if (orderRef !== "—") {
      const qty = parseInt(searchParams.get("qty") ?? "1", 10) || 1;
      analytics.purchaseConfirmedPageViewed(orderRef, planId);
      analytics.confirmationViewed(orderRef, qty);
    }
  }, []);

  const steps = [
    { num: "1", icon: "🛍️", title: "Compra realizada", desc: "Hemos recibido tu pago correctamente." },
    { num: "2", icon: "✉️", title: "Email en camino", desc: "En breve recibirás tu código QR y las instrucciones." },
    { num: "3", icon: "📱", title: "Instala la eSIM", desc: "Te tomará menos de 5 minutos." },
    { num: "4", icon: "✈️", title: "Disfruta tu viaje", desc: "Activa al aterrizar y navega sin roaming." },
  ];

  return (
    <div className="bg-[var(--color-warm-white)] min-h-[100dvh]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E9E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-[var(--color-navy)]">RUTA<span className="text-[var(--color-gold)]">34</span></div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-ink-2)]">
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            Pago seguro
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[45vh] sm:h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy)]/40 to-transparent z-10" />
        <img
          src="/images/imagen8.png"
          alt="Europa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white text-center px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="w-20 h-20 rounded-full bg-[var(--color-gold)]/90 flex items-center justify-center mb-6 shadow-xl"
          >
            <CheckCircle size={48} weight="fill" className="text-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3">
            Tu próximo viaje<br />empieza ahora.
          </h1>
          <p className="text-lg sm:text-xl opacity-95 max-w-md">
            Tu eSIM ya está confirmada. En breve recibirás todo lo que necesitas para tener conexión en Europa.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Tarjeta de Pedido Premium */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-lg mb-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Izquierda: Plan Info */}
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-gold)] mb-3">Tu pedido</p>
              <h2 className="text-3xl font-black text-[var(--color-navy)] mb-6">{planName}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold)] font-bold">🌍</div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-2)]">Cobertura</p>
                    <p className="font-bold text-[var(--color-navy)]">{coverage} países</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold)] font-bold">📊</div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-2)]">Datos</p>
                    <p className="font-bold text-[var(--color-navy)]">{data} GB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold)] font-bold">📅</div>
                  <div>
                    <p className="text-xs text-[var(--color-ink-2)]">Validez</p>
                    <p className="font-bold text-[var(--color-navy)]">{validity} días</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Derecha: Referencia */}
            <div className="flex flex-col justify-center items-center sm:items-end text-center sm:text-right">
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-ink-2)] mb-3">Referencia del pedido</p>
              <p className="text-3xl font-black text-[var(--color-navy)] font-mono mb-6 break-all">{orderRef}</p>
              <p className="text-sm text-[var(--color-ink-2)]">
                <strong>Fecha de compra</strong><br />{purchaseDate}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline 4 Pasos */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          className="mb-12"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-gold)] text-center mb-4">¿QUÉ SUCEDE AHORA?</p>
          <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-navy)] text-center mb-8">Tu eSIM en 4 simples pasos</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-gold)]/10 border-2 border-[var(--color-gold)] flex items-center justify-center text-2xl mb-3 font-bold text-[var(--color-gold)]">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block absolute left-[calc(50%+32px)] w-[calc(100%-64px)] h-1 bg-gradient-to-r from-[var(--color-gold)] to-transparent -z-10" />
                  )}
                  <p className="text-sm font-bold text-[var(--color-navy)]">{step.title}</p>
                  <p className="text-xs text-[var(--color-ink-2)] mt-1">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          className="mb-12"
        >
          <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-navy)] text-center mb-8">¿Necesitas ayuda?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <motion.a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4 }}
              className="bg-white border border-[#E9E2D8] rounded-2xl p-6 text-center hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-bold text-[var(--color-navy)] mb-2">Escribir por WhatsApp</h4>
              <p className="text-sm text-[var(--color-ink-2)]">Estamos aquí para ayudarte las 24 horas.</p>
            </motion.a>

            {/* Guía + FAQ */}
            <div className="grid grid-cols-1 gap-6">
              <motion.a
                href="#"
                whileHover={{ y: -4 }}
                className="bg-white border border-[#E9E2D8] rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                  <Book size={24} className="text-[var(--color-gold)]" />
                </div>
                <h4 className="font-bold text-[var(--color-navy)] mb-2">Guía de instalación</h4>
                <p className="text-xs text-[var(--color-ink-2)]">Paso a paso para iPhone y Android</p>
              </motion.a>

              <motion.a
                href="#"
                whileHover={{ y: -4 }}
                className="bg-white border border-[#E9E2D8] rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                  <Question size={24} className="text-[var(--color-gold)]" />
                </div>
                <h4 className="font-bold text-[var(--color-navy)] mb-2">Preguntas frecuentes</h4>
                <p className="text-xs text-[var(--color-ink-2)]">Resolvemos las dudas más comunes</p>
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="text-center">
          <motion.a
            href={`/${locale}`}
            whileHover={{ x: -4 }}
            className="inline-flex items-center gap-2 text-[var(--color-navy)] font-semibold hover:text-[var(--color-gold)] transition-colors"
          >
            ← Volver al inicio
          </motion.a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E9E2D8] bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--color-ink-2)]">
          <div className="flex items-center gap-4">
            <span>🔒 Pago 100% seguro</span>
            <span>🛡️ Tus datos protegidos</span>
            <span>📞 Soporte 24/7</span>
          </div>
          <p>© RUTA34 Telecom 2026</p>
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
