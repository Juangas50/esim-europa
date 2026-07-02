"use client";

import { motion } from "framer-motion";
import {
  HelpHero,
  Breadcrumb,
  TipCard,
  BottomHelpBanner,
} from "@/components/help";

export default function ActivationPage() {
  const breadcrumbItems = [
    { label: "Centro de Ayuda", href: "/help" },
    { label: "Cuándo activar" },
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
        title="Cuándo activar tu eSIM"
        subtitle="Maximiza tu conexión en el destino."
        imageSrc="/images/confirmacion-hero.png"
        imageAlt="Activation guide"
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
          <p className="text-lg text-[var(--color-ink-2)] leading-relaxed max-w-2xl">
            El momento en que actives tu eSIM es importante para garantizar que tengas conectividad desde el momento en que llegues a tu destino.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Línea de tiempo recomendada
          </h3>

          <div className="space-y-6">
            {[
              {
                when: "Antes de viajar",
                what: "Instala tu eSIM",
                details: "Descarga el código QR y completa la instalación. Esto puede tomar 5-10 minutos.",
              },
              {
                when: "En el aeropuerto (origen)",
                what: "NO actives aún",
                details: "Mantén desactivada mientras estés en tu país. Evitarás roaming accidental.",
              },
              {
                when: "En el aire (vuelo)",
                what: "Activa el Modo Avión",
                details: "Tu eSIM seguirá instalada pero no conectada a redes.",
              },
              {
                when: "Al aterrizar",
                what: "Activa tu eSIM",
                details: "Una vez en tierra, desactiva modo avión y activa datos móviles.",
              },
              {
                when: "Primeros minutos",
                what: "Verifica la conexión",
                details: "Confirma que tengas señal y datos funcionando correctamente.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-6 p-6 bg-white border border-[#E9E2D8] rounded-3xl"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-gold)] text-white font-black flex items-center justify-center text-xl">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[var(--color-gold)] font-bold text-sm mb-1">
                    {item.when}
                  </p>
                  <h4 className="text-lg font-bold text-[var(--color-navy)] mb-2">
                    {item.what}
                  </h4>
                  <p className="text-[var(--color-ink-2)]">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Settings Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Configuraciones importantes
          </h3>

          <div className="space-y-6">
            <div className="p-8 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="text-xl font-bold text-[var(--color-navy)] mb-4">
                📱 Datos móviles
              </h4>
              <p className="text-[var(--color-ink-2)] mb-4">
                Asegúrate de activar los datos móviles para tu eSIM:
              </p>
              <ul className="space-y-2 text-[var(--color-ink-2)] ml-4">
                <li>• iPhone: Configuración &gt; Datos celulares &gt; Activar</li>
                <li>• Android: Configuración &gt; Red &gt; Datos móviles &gt; On</li>
              </ul>
            </div>

            <div className="p-8 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="text-xl font-bold text-[var(--color-navy)] mb-4">
                🌍 Roaming internacional
              </h4>
              <p className="text-[var(--color-ink-2)] mb-4">
                Con RUTA34, no necesitas activar roaming internacional en tu plan local. Tu eSIM funciona como una tarjeta local en el destino.
              </p>
            </div>

            <div className="p-8 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="text-xl font-bold text-[var(--color-navy)] mb-4">
                ✈️ Modo Avión
              </h4>
              <p className="text-[var(--color-ink-2)] mb-4">
                Durante el vuelo, tu eSIM estará desconectada. Al aterrizar, desactiva modo avión y verás que recupera la señal automáticamente.
              </p>
            </div>

            <div className="p-8 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="text-xl font-bold text-[var(--color-navy)] mb-4">
                🔄 Plan principal
              </h4>
              <p className="text-[var(--color-ink-2)] mb-4">
                Si configuraste tu eSIM como plan principal, se usará automáticamente cuando tengas ambas conectadas. Puedes cambiar esto en Configuración.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Consejos de activación
          </h3>
          <div className="space-y-4">
            <TipCard
              variant="tip"
              title="Consejo"
              description="Ten conexión WiFi al llegar a tu destino para evitar cargos inesperados mientras activas la eSIM."
            />
            <TipCard
              variant="tip"
              title="Consejo"
              description="Guarda el número de tu eSIM en caso de que lo necesites. Lo encontrarás en Configuración > SIM."
            />
            <TipCard
              variant="warning"
              title="Importante"
              description="No cambies la eSIM a 'desactivada' durante el viaje a menos que quieras dejar de usar la conexión."
            />
            <TipCard
              variant="tip"
              title="Consejo"
              description="Si pierdes señal, reinicia tu teléfono. A veces ayuda a reconectar automáticamente."
            />
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
