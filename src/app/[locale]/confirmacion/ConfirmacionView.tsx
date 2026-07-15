"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Envelope, Phone, AirplaneInFlight } from "@phosphor-icons/react";
import { useLocale } from "next-intl";
import { analytics } from "@/lib/analytics";
import { WHATSAPP_URL } from "@/config/constants";
import { useMetaEvents } from "@/hooks/useMetaEvents";

interface ConfirmacionViewProps {
  orderRef: string;
  planId: string;
  quantity: number;
  planName: string;
  priceUsd: number;
  coverage: number | null;
  dataGb: number | null;
  validityDays: number | null;
  activationDate: string | null;
  metaEventId: string | null;
}

export default function ConfirmacionView({
  orderRef,
  planId,
  quantity,
  planName,
  priceUsd,
  coverage,
  dataGb,
  validityDays,
  activationDate,
  metaEventId,
}: ConfirmacionViewProps) {
  const locale = useLocale();
  const purchaseDate = new Date().toLocaleDateString("es-ES");
  const isScheduled = Boolean(activationDate);
  const { trackPurchase } = useMetaEvents();

  useEffect(() => {
    if (orderRef !== "—") {
      analytics.purchaseConfirmedPageViewed(orderRef, planId);
      analytics.confirmationViewed(orderRef, quantity);

      // Meta Pixel — Purchase. El event_id (mid) es el mismo que ya usó el
      // webhook de Stripe para el Purchase por CAPI — Meta deduplica ambos.
      if (metaEventId && planId) {
        trackPurchase({ id: planId, name: planName, price_usd: priceUsd }, quantity, orderRef, metaEventId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* Hero Section — Image with Gradient Overlay */}
      <div className="relative h-[45vh] sm:h-[50vh] overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/confirmacion-hero.png"
          alt="Europa viaje"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay - Dark left to transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.15)] to-transparent z-10" />

        {/* Content Overlay */}
        <div className="relative z-20 px-6 sm:px-12 py-10 sm:py-14 h-full flex flex-col justify-center max-w-2xl">
          {/* White Gradient Background Behind Text */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-transparent z-0" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="mb-8"
            >
              <div className="w-12 h-12 rounded-full border-2 border-[var(--color-gold)] flex items-center justify-center">
                <CheckCircle size={28} weight="fill" className="text-[var(--color-gold)]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-5xl font-black text-[var(--color-navy)] leading-tight mb-4">
                Tu próximo viaje<br />empieza ahora.
              </h1>
              <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-md">
                Tu eSIM ya está confirmada. En breve recibirás todo lo que necesitas para tener conexión en Europa.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-0 sm:py-4 -mt-2 sm:-mt-4">

        {/* Tarjeta de Pedido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9E2D8] shadow-sm mb-12 relative z-20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            {/* Plan Info - Left */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-3">Tu pedido</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F1E8] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-2xl font-black text-[var(--color-navy)]">{planName}</h2>
              </div>
              {/* Data in horizontal line */}
              <div className="flex flex-wrap gap-6 sm:gap-8">
                {coverage !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    <div>
                      <p className="text-xs text-[var(--color-ink-2)]">Cobertura</p>
                      <p className="font-bold text-[var(--color-navy)]">{coverage} países</p>
                    </div>
                  </div>
                )}
                {dataGb !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <div>
                      <p className="text-xs text-[var(--color-ink-2)]">Datos</p>
                      <p className="font-bold text-[var(--color-navy)]">{dataGb} GB</p>
                    </div>
                  </div>
                )}
                {validityDays !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <div>
                      <p className="text-xs text-[var(--color-ink-2)]">Validez</p>
                      <p className="font-bold text-[var(--color-navy)]">{validityDays} días</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Referencia - Right */}
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-2)] mb-3">Referencia del pedido</p>
              <p className="text-xl font-black text-[var(--color-navy)] font-mono mb-4 break-all">{orderRef}</p>
              <div className="text-sm">
                <p className="text-xs text-[var(--color-ink-2)]">Fecha de compra</p>
                <p className="font-bold text-[var(--color-navy)]">{purchaseDate}</p>
              </div>
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

            {/* Step 1 - Compra realizada */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-3 border-[var(--color-gold)] bg-white flex items-center justify-center font-bold text-[var(--color-gold)] text-xl">
                  1
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="mb-2"><ShoppingBag size={32} weight="thin" className="text-[var(--color-gold)]" /></div>
              <p className="font-bold text-[var(--color-navy)] mb-1">Compra realizada</p>
              <p className="text-xs text-[var(--color-ink-2)] leading-snug">Hemos recibido tu pago correctamente.</p>
            </motion.div>

            {/* Step 2 - Conditional */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-3 border-[var(--color-gold)] bg-white flex items-center justify-center font-bold text-[var(--color-gold)] text-xl">
                  2
                </div>
              </div>
              <div className="mb-2"><Envelope size={32} weight="thin" className="text-[var(--color-gold)]" /></div>
              {isScheduled ? (
                <>
                  <p className="font-bold text-[var(--color-navy)] mb-1">Preparamos tu eSIM</p>
                  <p className="text-xs text-[var(--color-ink-2)] leading-snug">Para el {new Date(activationDate!).toLocaleDateString("es-ES")}</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-[var(--color-navy)] mb-1">Email en 24h</p>
                  <p className="text-xs text-[var(--color-ink-2)] leading-snug">Recibirás tu código QR y las instrucciones.</p>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-3 border-[var(--color-gold)] bg-white flex items-center justify-center font-bold text-[var(--color-gold)] text-xl">
                  3
                </div>
              </div>
              <div className="mb-2"><Phone size={32} weight="thin" className="text-[var(--color-gold)]" /></div>
              {isScheduled ? (
                <>
                  <p className="font-bold text-[var(--color-navy)] mb-1">Recibirás tu QR</p>
                  <p className="text-xs text-[var(--color-ink-2)] leading-snug">El día programado en tu email.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-[var(--color-navy)] mb-1">Instala la eSIM</p>
                  <p className="text-xs text-[var(--color-ink-2)] leading-snug">Te tomará menos de 5 minutos.</p>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-3 border-[var(--color-gold)] bg-white flex items-center justify-center font-bold text-[var(--color-gold)] text-xl">
                  4
                </div>
              </div>
              <div className="mb-2"><AirplaneInFlight size={32} weight="thin" className="text-[var(--color-gold)]" /></div>
              <p className="font-bold text-[var(--color-navy)] mb-1">Disfruta tu viaje</p>
              <p className="text-xs text-[var(--color-ink-2)] leading-snug">Activa y navega sin roaming.</p>
            </motion.div>
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
            {/* WhatsApp */}
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4 }}
              className="bg-white border border-[#E9E2D8] rounded-2xl p-8 text-center hover:shadow-md transition-all flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h4 className="font-bold text-[var(--color-navy)] mb-2">Escribir por WhatsApp</h4>
              <p className="text-xs text-[var(--color-ink-2)]">Estamos aquí para ayudarte las 24 horas.</p>
            </motion.a>

            {/* Guide */}
            <motion.a
              href={`/${locale}/help/install/iphone`}
              whileHover={{ y: -4 }}
              className="bg-white border border-[#E9E2D8] rounded-2xl p-8 text-center hover:shadow-md transition-all flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📖</span>
              </div>
              <h4 className="font-bold text-[var(--color-navy)] mb-2">Guía de instalación</h4>
              <p className="text-xs text-[var(--color-ink-2)]">Paso a paso para iPhone y Android</p>
            </motion.a>

            {/* FAQ */}
            <motion.a
              href={`/${locale}/help/faq`}
              whileHover={{ y: -4 }}
              className="bg-white border border-[#E9E2D8] rounded-2xl p-8 text-center hover:shadow-md transition-all flex flex-col items-center justify-center"
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
