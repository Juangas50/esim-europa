"use client";

import { motion } from "framer-motion";
import {
  HelpHero,
  Breadcrumb,
  TipCard,
  BottomHelpBanner,
} from "@/components/help";

export default function QRPage() {
  const breadcrumbItems = [
    { label: "Centro de Ayuda", href: "/help" },
    { label: "Instalar desde QR" },
  ];

  return (
    <div className="bg-[var(--color-warm-white)] min-h-[100dvh]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-[#E9E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
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
        title="Instalar desde QR"
        subtitle="La forma más rápida y segura."
        imageSrc="/images/confirmacion-hero.png"
        imageAlt="QR installation"
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Breadcrumb items={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-lg text-[var(--color-ink-2)] leading-relaxed max-w-2xl mb-8">
            El código QR es la forma más sencilla de instalar tu eSIM. Lo recibirás por email una vez confirmado tu pedido.
          </p>
        </motion.div>

        {/* QR Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8 bg-white border border-[#E9E2D8] rounded-3xl">
              <h3 className="text-2xl font-black text-[var(--color-navy)] mb-4">
                ¿Qué es el código QR?
              </h3>
              <p className="text-[var(--color-ink-2)] leading-relaxed">
                Es un código único que contiene toda la información necesaria para instalar tu eSIM. Cada código QR es personal e intransferible.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="p-8 bg-white border border-[#E9E2D8] rounded-3xl">
              <h3 className="text-2xl font-black text-[var(--color-navy)] mb-4">
                ¿Dónde lo encuentro?
              </h3>
              <p className="text-[var(--color-ink-2)] leading-relaxed">
                Revisa tu email (incluyendo carpeta de spam) bajo el asunto "Tu código QR RUTA34 está listo". También lo encontrarás en tu cuenta de usuario.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Step by Step */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Cómo escanear el QR
          </h3>

          <div className="space-y-6">
            {[
              {
                number: 1,
                title: "Abre la cámara",
                desc: "En tu iPhone o Android, abre la aplicación de cámara.",
              },
              {
                number: 2,
                title: "Apunta al código",
                desc: "Posiciona la cámara frente al código QR. Mantén una distancia de 10-15 cm.",
              },
              {
                number: 3,
                title: "Espera el aviso",
                desc: "Tu teléfono detectará automáticamente el código. Verás una notificación.",
              },
              {
                number: 4,
                title: "Toca la notificación",
                desc: "Toca el banner que aparece para continuar con la instalación.",
              },
              {
                number: 5,
                title: "Sigue los pasos",
                desc: "Tu teléfono te guiará para completar la instalación de la eSIM.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="flex gap-6 items-start pb-6 border-b border-[#E9E2D8] last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold)] text-white font-black flex items-center justify-center flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-navy)] mb-1">
                    {step.title}
                  </h4>
                  <p className="text-[var(--color-ink-2)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Common Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Si algo falla
          </h3>
          <div className="space-y-4">
            <TipCard
              variant="warning"
              title="No se detecta el QR"
              description="Asegúrate de que la iluminación sea buena, limpia la lente de la cámara y mantén el código en una posición estable."
            />
            <TipCard
              variant="warning"
              title="Se interrumpe la instalación"
              description="Verifica que tengas internet. Si usas WiFi, conéctate a una red estable. Reintenta el proceso desde el principio."
            />
            <TipCard
              variant="warning"
              title="Código no válido"
              description="Cada código QR expira después de cierto tiempo. Si tu código ha expirado, solicita uno nuevo desde tu cuenta."
            />
            <TipCard
              variant="tip"
              title="Alternativa: Instalar manualmente"
              description="Si el QR no funciona, puedes instalar tu eSIM ingresando manualmente los datos. Contactanos por WhatsApp para ayuda."
            />
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy)]/80 text-white">
            <h3 className="text-2xl font-black mb-4">🔒 Seguridad</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Cada código QR es único y personal</li>
              <li>✓ No puedes usar el mismo código dos veces</li>
              <li>✓ No compartas tu código QR con nadie</li>
              <li>✓ Si lo pierdes, solicita uno nuevo sin cargo</li>
            </ul>
          </div>
        </motion.div>

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
