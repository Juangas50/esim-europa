"use client";

import {
  HelpHero,
  Breadcrumb,
  FAQAccordion,
  BottomHelpBanner,
} from "@/components/help";
import { motion } from "framer-motion";
import { WHATSAPP_URL } from "@/config/constants";

export default function FAQPage() {
  const breadcrumbItems = [
    { label: "Centro de Ayuda", href: "/help" },
    { label: "Preguntas frecuentes" },
  ];

  const faqItems = [
    {
      id: "what-esim",
      question: "¿Qué es una eSIM?",
      answer:
        "Una eSIM (SIM electrónica) es una tarjeta SIM digital integrada en tu teléfono. No es un chip físico, sino un perfil descargable que funciona igual que una tarjeta SIM tradicional. Es perfecto para viajeros porque puedes cambiar de operador sin necesidad de cambiar físicamente la tarjeta.",
    },
    {
      id: "compatibility",
      question: "¿Mi teléfono es compatible?",
      answer:
        "Los teléfonos compatibles incluyen: iPhone XS, XS Max, XR y posteriores; Samsung Galaxy S20 y posteriores; Google Pixel 3 y posteriores; y muchos otros modelos de 2018 en adelante. Verifica el manual de tu teléfono o la configuración para asegurarte de que soporta eSIM.",
    },
    {
      id: "keep-number",
      question: "¿Puedo mantener mi número actual?",
      answer:
        "Sí. Tu número original en la tarjeta SIM física permanecerá activo. La eSIM te proporciona un nuevo número de teléfono para usar en tu destino. Puedes mantener ambos activos simultáneamente si lo deseas.",
    },
    {
      id: "data-usage",
      question: "¿Cómo se cuenta mi uso de datos?",
      answer:
        "Tu consumo se cuenta desde el servidor de RUTA34 en cuanto la eSIM empieza a usar datos. No hay panel de cliente: si querés consultar cuánto llevás gastado, escribinos por WhatsApp con tu referencia de pedido. Si ves que se te acaban antes de tiempo, podés pedirnos una renovación anticipada de la tarifa; y al terminar los 28 días se renueva automáticamente si la línea tiene saldo suficiente.",
    },
    {
      id: "multiple-esims",
      question: "¿Puedo tener múltiples eSIMs?",
      answer:
        "Sí, puedes instalar múltiples eSIMs en tu teléfono. La mayoría de teléfonos permite tener hasta 2 eSIMs simultáneamente. Puedes cambiar entre ellas fácilmente desde Configuración.",
    },
    {
      id: "delete-esim",
      question: "¿Puedo eliminar mi eSIM?",
      answer:
        "Sí, puedes eliminar tu eSIM en cualquier momento desde Configuración. Si la eliminas accidentalmente antes de instalarla, escribinos por WhatsApp con tu referencia de pedido y te reenviamos el código QR. Si ya fue instalada, no podrá recuperarse.",
    },
    {
      id: "airplane-mode",
      question: "¿Qué pasa con el Modo Avión?",
      answer:
        "Cuando activas Modo Avión, tu eSIM (como todas las conexiones) se desactivará. Es seguro y recomendado durante los vuelos. Una vez que aterrices y desactives Modo Avión, tu eSIM reconectará automáticamente.",
    },
    {
      id: "roaming",
      question: "¿Necesito activar Roaming Internacional?",
      answer:
        "Depende de qué línea hablemos. En la eSIM de RUTA34 sí: cuando salgas de España, hacia cualquiera de los países incluidos, necesitás tener activada la itinerancia de datos en esa línea — es una línea española y fuera de España funciona en roaming, con el límite de GB que incluya tu plan. En cambio, en la SIM de tu operadora de origen te recomendamos mantener la itinerancia desactivada, para evitar cargos inesperados.",
    },
    {
      id: "calls-sms",
      question: "¿Mi plan incluye llamadas y SMS?",
      answer:
        "Sí. Todos los planes de la tienda incluyen un número español con llamadas y SMS ilimitados dentro de España. Los minutos para llamadas internacionales varían según el destino y el plan que elijas.",
    },
    {
      id: "validity",
      question: "¿Cuánto tiempo es válido mi plan?",
      answer:
        "Todos los planes de la tienda duran 28 días. Los días empiezan a contar desde que te enviamos el código QR, no desde que lo instalás en el teléfono. Tenés hasta 12 meses desde la compra para elegir la fecha de activación.",
    },
    {
      id: "no-service",
      question: "¿Qué pasa si me quedo sin datos?",
      answer:
        "No tenés que esperar a que terminen los 28 días: podés pedirnos una renovación anticipada de la tarifa y te ayudamos a gestionarla. Si no renovás, dentro de España la conexión puede quedar a velocidad mínima —sigue disponible, pero muy limitada para un uso normal—. En roaming por la Unión Europea, agotado el máximo que tu plan permite gastar fuera de España y si hay saldo en la línea, el consumo adicional puede cobrarse a 1,33 €/GB. Para destinos que no son de la UE escribinos y te lo confirmamos.",
    },
    {
      id: "coverage",
      question: "¿Qué operadores usa RUTA34?",
      answer:
        "El servicio se presta sobre una red de telecomunicaciones española certificada, con cobertura 4G/5G en España y en los destinos incluidos en tu plan.",
    },
    {
      id: "emergency",
      question: "¿Puedo llamar a emergencias con eSIM?",
      answer:
        "Sí. Las llamadas de emergencia (911, 112, etc.) pueden hacerse incluso sin servicio activo o con eSIM desactivada en muchos países. Sin embargo, te recomendamos tener datos activos para poder contactar servicios.",
    },
    {
      id: "change-settings",
      question: "¿Puedo cambiar mis configuraciones después?",
      answer:
        "Sí. Puedes cambiar la mayoría de configuraciones desde tu teléfono en cualquier momento. Si necesitas cambiar datos personales de tu pedido, contactanos por WhatsApp.",
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
        title="Preguntas frecuentes"
        subtitle="Respuestas a todo lo que quieras saber."
        imageSrc="/images/confirmacion-hero.png"
        imageAlt="FAQ"
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
            Si tu pregunta no está aquí, escribinos por WhatsApp. Atendemos de lunes a sábado, de 8 a 21 h (hora de España).
          </p>
        </motion.div>

        {/* Categories */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-black text-[var(--color-navy)] mb-8">
              Todo sobre eSIM y planes
            </h3>
            <FAQAccordion items={faqItems.slice(0, 8)} />
          </motion.div>
        </div>

        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-black text-[var(--color-navy)] mb-8">
              Datos y conectividad
            </h3>
            <FAQAccordion items={faqItems.slice(8, 15)} />
          </motion.div>
        </div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy)]/80 text-white text-center">
            <h3 className="text-2xl font-black mb-4">¿No encontraste tu respuesta?</h3>
            <p className="mb-6 text-white/90 max-w-2xl mx-auto">
              Nuestro equipo de soporte está aquí para ayudarte. Contactanos directamente por WhatsApp.
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

        <BottomHelpBanner />
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E9E2D8] bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-[var(--color-ink-2)]">
          <span>🔒 Pago 100% seguro</span>
          <span>•</span>
          <span>🛡️ Tus datos protegidos</span>
          <span>•</span>
          <span>📞 Soporte L–S 8–21 h (ES)</span>
          <span>•</span>
          <span>© RUTA34 Telecom 2026</span>
        </div>
      </footer>
    </div>
  );
}
