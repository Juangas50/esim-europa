"use client";

import { motion } from "framer-motion";
import {
  HelpHero,
  HelpStep,
  Breadcrumb,
  TipCard,
  BottomHelpBanner,
} from "@/components/help";

export default function AndroidInstallPage() {
  const breadcrumbItems = [
    { label: "Centro de Ayuda", href: "/help" },
    { label: "Instalar", href: "/help/install/android" },
    { label: "Android" },
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
        title="Instalá tu eSIM en Android"
        subtitle="Funciona con Samsung, Google Pixel, Xiaomi y más."
        imageSrc="/images/confirmacion-hero.png"
        imageAlt="Android eSIM installation"
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-lg text-[var(--color-ink-2)] leading-relaxed max-w-2xl">
            Guía completa para instalar tu eSIM RUTA34 en tu teléfono Android.
            Compatible con Samsung Galaxy, Google Pixel, Xiaomi, Motorola, OnePlus
            y muchos más.
          </p>
          <div className="mt-8 p-6 rounded-2xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20">
            <p className="text-sm text-[var(--color-navy)] font-semibold">
              ℹ️ Requisitos: Tu teléfono debe tener Android 9.0 o superior y soporte
              para eSIM.
            </p>
          </div>
        </motion.div>

        {/* Phones List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-[var(--color-navy)] mb-6">
            Teléfonos compatibles
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              "Samsung Galaxy S20+",
              "Samsung Galaxy Z Fold",
              "Google Pixel 3+",
              "Xiaomi Mi Mix",
              "OnePlus 8 Pro",
              "Motorola Edge",
            ].map((phone, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-[#E9E2D8] rounded-2xl text-center text-sm font-semibold text-[var(--color-navy)]"
              >
                ✓ {phone}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16 mb-20">
          <HelpStep
            number={1}
            title="Abre Configuración"
            description="Accedé a Configuración > Red e Internet > SIM dual y eSIM (o similar, según tu teléfono)."
            imageSrc="/images/confirmacion-hero.png"
            imageAlt="Paso 1: Abrir Configuración"
          />

          <HelpStep
            number={2}
            title="Selecciona 'Agregar eSIM'"
            description="Toca en 'Agregar eSIM' o 'Crear plan celular' (el nombre varía según el modelo)."
            imageSrc="/images/confirmacion-hero.png"
            imageAlt="Paso 2: Agregar eSIM"
          />

          <HelpStep
            number={3}
            title="Escanea el código QR"
            description="Tu teléfono te pedirá que escanees el código QR. Usá la cámara para capturarlo correctamente."
            imageSrc="/images/confirmacion-hero.png"
            imageAlt="Paso 3: Escanear QR"
            tip="Asegúrate de que la iluminación sea suficiente para que se detecte el código."
            warning="No compartas el código QR. Es único y personal para tu eSIM."
          />

          <HelpStep
            number={4}
            title="Configura tu plan"
            description="Sigue los pasos que aparecen en pantalla. Elige si deseas usar esta eSIM como plan principal o secundario."
            imageSrc="/images/confirmacion-hero.png"
            imageAlt="Paso 4: Configurar plan"
          />

          <HelpStep
            number={5}
            title="¡Activación completada!"
            description="Tu eSIM está lista. Actívala cuando llegues a tu destino desde Configuración > Red e Internet."
            imageSrc="/images/confirmacion-hero.png"
            imageAlt="Paso 5: Listo para usar"
            tip="Puedes cambiar entre tu SIM física y tu eSIM en cualquier momento."
          />
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Consejos por dispositivo
          </h3>
          <div className="space-y-4">
            <div className="p-6 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="font-bold text-[var(--color-navy)] mb-2">
                📱 Samsung Galaxy
              </h4>
              <p className="text-[var(--color-ink-2)] text-sm">
                En los modelos más nuevos, la opción está en Configuración →
                Conexiones → SIM dual y eSIM.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="font-bold text-[var(--color-navy)] mb-2">
                🔵 Google Pixel
              </h4>
              <p className="text-[var(--color-ink-2)] text-sm">
                La integración con eSIM es perfecta. Ve a Configuración → Red
                e Internet → SIMs.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="font-bold text-[var(--color-navy)] mb-2">
                🟠 Xiaomi
              </h4>
              <p className="text-[var(--color-ink-2)] text-sm">
                Accedé a Configuración → Conexión y recursos compartidos → Tarjetas
                SIM.
              </p>
            </div>
          </div>
        </motion.div>

        {/* General Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Consejos útiles
          </h3>
          <div className="space-y-4">
            <TipCard
              variant="tip"
              title="Consejo"
              description="Descarga el app de tu operador antes de viajar si quieres acceder a opciones adicionales."
            />
            <TipCard
              variant="tip"
              title="Consejo"
              description="Verifica que tengas conexión a internet antes de activar tu eSIM."
            />
            <TipCard
              variant="warning"
              title="Importante"
              description="Algunos teléfonos requieren una actualización de software. Actualiza antes de intentar instalar la eSIM."
            />
          </div>
        </motion.div>

        {/* Bottom Banner */}
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
