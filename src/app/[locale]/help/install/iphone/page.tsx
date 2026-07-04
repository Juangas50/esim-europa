"use client";

import { motion } from "framer-motion";
import {
  HelpHero,
  HelpStep,
  Breadcrumb,
  TipCard,
  BottomHelpBanner,
} from "@/components/help";

export default function IPhoneInstallPage() {
  const breadcrumbItems = [
    { label: "Centro de Ayuda", href: "/help" },
    { label: "Instalar", href: "/help/install/iphone" },
    { label: "iPhone" },
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
        title="Instalá tu eSIM en iPhone"
        subtitle="Solo necesitás dos minutos."
        imageSrc="/images/confirmacion-hero.png"
        imageAlt="iPhone eSIM installation"
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
            Esta guía te muestra paso a paso cómo instalar y activar tu eSIM en
            tu iPhone. El proceso es sencillo y toma apenas unos minutos.
          </p>
          <div className="mt-8 p-6 rounded-2xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20">
            <p className="text-sm text-[var(--color-navy)] font-semibold">
              ℹ️ Requisitos: Tu iPhone debe estar actualizado a iOS 16.1 o
              superior.
            </p>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16 mb-20">
          <HelpStep
            number={1}
            title="Abre Configuración"
            description="Accedé a la aplicación de Configuración en tu iPhone. Buscá la opción de Datos celulares o Planes celulares."
            imageSrc="/images/help-iphone-step-1.png"
            imageAlt="Paso 1: Abrir Configuración - pantalla de Ajustes del iPhone"
            tip="Si no ves la opción de eSIM, asegúrate de que tu iPhone sea compatible."
          />

          <HelpStep
            number={2}
            title="Selecciona 'Agregar plan celular'"
            description="En el menú de datos celulares, toca en 'Agregar plan celular' o 'Crear plan celular', según tu versión de iOS."
            imageSrc="/images/help-iphone-step-2.png"
            imageAlt="Paso 2: Agregar plan - menú de Datos celulares"
          />

          <HelpStep
            number={3}
            title="Escanea el código QR"
            description="Tu iPhone te pedirá que escanees el código QR que recibiste por email. Coloca la cámara frente al código y espera a que se reconozca automáticamente."
            imageSrc="/images/help-iphone-step-3.png"
            imageAlt="Paso 3: Escanear QR - pantalla de escaneo"
            tip="Mantén el código QR bien iluminado para que se escanee correctamente."
            warning="No compartas tu código QR con otras personas. Es personal y único."
          />

          <HelpStep
            number={4}
            title="Configura tu plan"
            description="Sigue las instrucciones que aparecen en pantalla. Selecciona si deseas usar esta eSIM como plan principal o alternativo."
            imageSrc="/images/help-iphone-step-4.png"
            imageAlt="Paso 4: Configurar plan - seleccionar plan principal"
            tip="Puedes cambiar las configuraciones después en cualquier momento desde Configuración."
          />

          <HelpStep
            number={5}
            title="¡Listo! Activá en el destino"
            description="Tu eSIM está instalada. Ahora solo debe activarla una vez que llegues a tu destino. Activa los datos móviles en Configuración y comienza a navegar."
            imageSrc="/images/help-iphone-step-5.png"
            imageAlt="Paso 5: Activación completada - eSIM activa"
            tip="Desactiva el roaming si estás en una zona con costos adicionales."
          />
        </div>

        {/* Troubleshooting Tips */}
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
              description="Antes de viajar, asegúrate de tener internet en tu iPhone para descargar el plan celular de RUTA34."
            />
            <TipCard
              variant="tip"
              title="Consejo"
              description="Puedes usar dos números de teléfono simultáneamente: uno en la eSIM y otro en tu tarjeta SIM tradicional."
            />
            <TipCard
              variant="warning"
              title="Importante"
              description="No borres tu eSIM si aún no la has activado. Algunos errores pueden requerir reinstalarla."
            />
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-black text-[var(--color-navy)] mb-8">
            Preguntas frecuentes
          </h3>
          <div className="space-y-4">
            <div className="p-6 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="font-bold text-[var(--color-navy)] mb-2">
                ¿Mi iPhone es compatible?
              </h4>
              <p className="text-[var(--color-ink-2)] text-sm">
                Los iPhones compatibles incluyen: iPhone XS, XS Max, XR y
                posteriores. Todos los modelos de iPhone 11 y más nuevos son
                totalmente compatibles.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="font-bold text-[var(--color-navy)] mb-2">
                ¿Qué pasa con mi número actual?
              </h4>
              <p className="text-[var(--color-ink-2)] text-sm">
                Puedes mantener ambos activos. Tu número original seguirá
                funcionando en la tarjeta SIM física, mientras que la eSIM te
                da un nuevo número para usar en el destino.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E9E2D8] rounded-3xl">
              <h4 className="font-bold text-[var(--color-navy)] mb-2">
                ¿Puedo cambiar de plan después?
              </h4>
              <p className="text-[var(--color-ink-2)] text-sm">
                Sí, puedes cambiar la configuración de tu eSIM en cualquier
                momento desde Configuración. También puedes eliminarla e
                instalar otra si es necesario.
              </p>
            </div>
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
