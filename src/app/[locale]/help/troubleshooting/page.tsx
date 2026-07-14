"use client";

import { useState } from "react";
import { WHATSAPP_URL } from "@/config/constants";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import {
  HelpHero,
  Breadcrumb,
  BottomHelpBanner,
} from "@/components/help";

interface ProblemItem {
  id: string;
  title: string;
  symptoms: string[];
  solutions: string[];
}

export default function TroubleshootingPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Centro de Ayuda", href: "/help" },
    { label: "Problemas frecuentes" },
  ];

  const problems: ProblemItem[] = [
    {
      id: "no-internet",
      title: "No tengo internet",
      symptoms: [
        "La red muestra sin conexión",
        "Datos móviles apagados",
        "No recibe emails",
      ],
      solutions: [
        "Verifica que los datos móviles estén activados en Configuración",
        "Reinicia tu teléfono completamente",
        "Asegúrate de que tu plan aún tenga datos disponibles",
        "Acércate a una zona con mejor cobertura",
        "Contactanos si el problema persiste",
      ],
    },
    {
      id: "qr-not-work",
      title: "El código QR no funciona",
      symptoms: [
        "La cámara no detecta el QR",
        "El QR aparece pero da error",
        "Se interrumpe durante la instalación",
      ],
      solutions: [
        "Limpia la lente de la cámara",
        "Mejora la iluminación del código",
        "Intenta desde una distancia de 10-15 cm",
        "Verifica tu conexión a internet",
        "Solicita un nuevo código QR desde tu cuenta",
      ],
    },
    {
      id: "esim-not-appears",
      title: "No aparece la eSIM en Configuración",
      symptoms: [
        "Instalé pero no la veo en la lista",
        "Desapareció después de desinstalar",
        "Número de teléfono no aparece",
      ],
      solutions: [
        "Reinicia tu teléfono",
        "Ve a Configuración > Datos celulares > Gestionar planes",
        "Asegúrate de que tu teléfono sea compatible con eSIM",
        "Actualiza tu teléfono al último software disponible",
        "Si sigue sin aparecer, reinstala desde el código QR",
      ],
    },
    {
      id: "sm-dp-error",
      title: "Error SM-DP+ o códigos técnicos",
      symptoms: [
        "Aparece código de error durante la instalación",
        "Conexión cortada a mitad del proceso",
        "Error de autenticación",
      ],
      solutions: [
        "Anota el código de error exacto",
        "Conectate a WiFi estable",
        "Reinicia tu teléfono e intenta nuevamente",
        "Intenta en 1-2 horas (puede ser un problema temporal)",
        "Contactanos con el código de error para asistencia personalizada",
      ],
    },
    {
      id: "data-off",
      title: "Datos móviles desactivados automáticamente",
      symptoms: [
        "Los datos se apagan solos",
        "No puedo activarlos",
        "Se desconecta constantemente",
      ],
      solutions: [
        "Verifica tu saldo de datos en tu cuenta RUTA34",
        "Algunos teléfonos desactivan datos si se cumplen los límites",
        "Ve a Configuración y reactiva los datos manualmente",
        "Reinicia tu teléfono",
        "Si tienes saldo y se desactiva, contactanos",
      ],
    },
    {
      id: "calls-sms",
      title: "Llamadas o SMS no funcionan",
      symptoms: [
        "No puedo hacer llamadas",
        "SMS no se envían",
        "No recibo llamadas",
      ],
      solutions: [
        "Verifica que tu eSIM esté configurada para llamadas y SMS",
        "Algunos planes de datos no incluyen llamadas. Verifica tu plan",
        "Reinicia tu teléfono",
        "Asegúrate de tener cobertura de red disponible",
        "Si tu plan no incluye llamadas, considera comprar un pase adicional",
      ],
    },
    {
      id: "slow-connection",
      title: "Conexión muy lenta",
      symptoms: [
        "Internet funciona pero muy lento",
        "Videos se cargan lentamente",
        "Navegación difícil",
      ],
      solutions: [
        "Acércate a una zona con mejor cobertura de red",
        "Reinicia tu teléfono",
        "Desactiva VPN si la usas",
        "Cierra aplicaciones que consumen datos en segundo plano",
        "Si otros usuarios en la zona tienen velocidad normal, puede ser un problema local",
      ],
    },
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
        title="Problemas frecuentes"
        subtitle="Soluciones rápidas para los errores más comunes."
        imageSrc="/images/confirmacion-hero.png"
        imageAlt="Troubleshooting"
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
            Aquí encontrarás soluciones rápidas a los problemas más comunes. Expande cada sección para conocer los síntomas y pasos para resolver.
          </p>
        </motion.div>

        {/* Problems Accordion */}
        <div className="space-y-4">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <button
                onClick={() =>
                  setOpenId(openId === problem.id ? null : problem.id)
                }
                className="w-full text-left p-6 bg-white border border-[#E9E2D8] rounded-3xl hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-navy)]">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-[var(--color-ink-2)] mt-1">
                      {problem.symptoms.join(" • ")}
                    </p>
                  </div>
                  <motion.div
                    animate={{
                      rotate: openId === problem.id ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 mt-1"
                  >
                    <CaretDown
                      size={20}
                      weight="bold"
                      className="text-[var(--color-gold)]"
                    />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {openId === problem.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 py-6 bg-white/50 border-x border-b border-[#E9E2D8] rounded-b-3xl">
                      <h4 className="font-bold text-[var(--color-navy)] mb-4">
                        Soluciones:
                      </h4>
                      <ol className="space-y-3">
                        {problem.solutions.map((solution, idx) => (
                          <li
                            key={idx}
                            className="flex gap-4 text-[var(--color-ink-2)]"
                          >
                            <span className="font-bold text-[var(--color-gold)] flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still having issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-16"
        >
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy)]/80 text-white">
            <h3 className="text-2xl font-black mb-4">¿Aún tienes problemas?</h3>
            <p className="mb-6 text-white/90">
              Si probaste todas las soluciones y el problema persiste, nuestro equipo de soporte está disponible 24/7 para ayudarte.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-8 py-3 rounded-2xl hover:shadow-lg transition-all"
            >
              <span>💬</span>
              Contactar por WhatsApp
            </a>
          </div>
        </motion.div>

        <div className="mt-16">
          <BottomHelpBanner />
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
