"use client";

import { motion } from "framer-motion";
import { Check, MapPin, Phone, Clock, Shield, Info } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function SobreRuta34() {
  const t = useTranslations("about");

  const beneficios = [
    { icon: "💰", title: "Precio claro", desc: "antes de viajar" },
    { icon: "📋", title: "Planes prepago", desc: "sin permanencia" },
    { icon: "📱", title: "eSIM compatible", desc: "para tu celular" },
    { icon: "🎫", title: "SIM física", desc: "próximamente" },
    { icon: "🔓", title: "Sin permanencia", desc: "decidís vos" },
    { icon: "💬", title: "WhatsApp igual", desc: "no cambia nada" },
    { icon: "🌎", title: "Para LATAM", desc: "pensado en ti" },
    { icon: "🔒", title: "Pagos seguros", desc: "transacciones ok" },
    { icon: "📧", title: "Soporte vía correo", desc: "ayuda cuando la necesites" },
    { icon: "ℹ️", title: "Info clara", desc: "antes de comprar" },
  ];

  const pasos = [
    {
      numero: "01",
      titulo: "Elegís tu opción",
      desc: "eSIM si tu celular es compatible. SIM física cuando esté disponible.",
      icono: Phone,
    },
    {
      numero: "02",
      titulo: "Recibís las instrucciones",
      desc: "Te enviamos la información necesaria para preparar tu conexión.",
      icono: Info,
    },
    {
      numero: "03",
      titulo: "Llegás conectado",
      desc: "Instalás o activás el servicio según condiciones y empezás a usar internet.",
      icono: Clock,
    },
  ];

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative min-h-[100dvh] bg-[var(--color-navy)] flex items-center overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-navy)] to-[#0f1f35] opacity-100" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center"
          >
            {/* Left: Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="space-y-8 py-20"
            >
              <div className="space-y-6">
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-tight text-white">
                  Viajar debería ser sencillo.
                  <br />
                  <span className="text-[var(--color-gold)]">Tu conexión también.</span>
                </h1>

                <p className="text-xl text-white/85 leading-relaxed max-w-lg font-sans font-light">
                  Ruta34 ayuda a viajeros de Latinoamérica a llegar a España y Europa con internet listo para usar, sin depender del roaming de su operadora de origen.
                </p>

                <p className="text-base text-white/70 leading-relaxed max-w-lg font-sans">
                  Pensamos cada parte de la experiencia para que comprar conectividad móvil para viajar sea simple, clara y segura.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  href="/es/planes"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold rounded-lg hover:bg-[var(--color-gold-light)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Ver planes
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-300">
                  Cómo funciona
                </button>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
              className="relative h-[500px] lg:h-[600px] hidden lg:block"
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10">
                <Image
                  src="/images/imagen3.png"
                  alt="Familia viajando en Madrid"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: PARA QUIÉN */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              <h2 className="font-serif text-4xl lg:text-5xl text-[var(--color-navy)] leading-tight">
                Pensado para quienes cruzan el Atlántico.
              </h2>

              <p className="text-lg text-[var(--color-ink)] leading-relaxed max-w-3xl">
                Ruta34 está pensada para viajeros de Argentina, Uruguay, Paraguay, Chile y Brasil que viajan a España y Europa por turismo, estudio, trabajo temporal o visitas familiares.
              </p>

              <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-3xl font-light">
                Personas que necesitan avisar que llegaron, abrir Maps, pedir un traslado, contactar al alojamiento o seguir usando WhatsApp desde el primer momento.
              </p>
            </motion.div>

            {/* Imagen real para "Para quién" */}
            <motion.div
              variants={fadeInUp}
              className="relative w-full h-[300px] lg:h-[400px] rounded-2xl border border-[var(--color-border)] overflow-hidden"
            >
              <Image
                src="/images/imagen8.png"
                alt="Viajera conectada en Madrid"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 100%"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: QUÉ HACEMOS */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--color-warm-white)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="font-serif text-4xl lg:text-5xl text-[var(--color-navy)]">
                Conectividad móvil para viajar por España y Europa.
              </h2>

              <p className="text-lg text-[var(--color-ink)] leading-relaxed max-w-3xl">
                Ofrecemos soluciones móviles prepago para viajar por España y Europa.
              </p>

              <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-3xl">
                Hoy trabajamos principalmente con eSIM: una SIM digital que se instala en celulares compatibles mediante un QR y permite tener conexión móvil sin cambiar tu chip físico.
              </p>

              <p className="text-base text-[var(--color-ink-2)] leading-relaxed max-w-3xl">
                Próximamente, también podremos ofrecer SIM física para quienes prefieran una opción tradicional o tengan un dispositivo no compatible con eSIM.
              </p>
            </motion.div>

            {/* Cards: eSIM y SIM Física */}
            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card eSIM - Disponible */}
              <motion.div
                variants={fadeInUp}
                className="p-8 lg:p-10 rounded-xl bg-white border border-[var(--color-gold)]/30 hover:border-[var(--color-gold)] hover:shadow-lg transition-all duration-300 space-y-6 group cursor-pointer"
              >
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl text-[var(--color-navy)]">eSIM</h3>
                  <p className="text-[var(--color-ink-2)] font-sans text-sm">Disponible ahora</p>
                </div>

                <p className="text-[var(--color-ink)] leading-relaxed">
                  Digital. Sin chip físico. Ideal para celulares compatibles.
                </p>

                <Link
                  href="/es/planes"
                  className="inline-flex items-center gap-2 text-[var(--color-gold)] font-semibold hover:text-[var(--color-navy)] transition-colors group/link"
                >
                  Ver planes eSIM
                  <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>

              {/* Card SIM Física - Próximamente */}
              <motion.div
                variants={fadeInUp}
                className="p-8 lg:p-10 rounded-xl bg-[var(--color-cream-dark)] border border-[var(--color-border)] opacity-75 space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl text-[var(--color-ink)]">SIM física</h3>
                  <p className="text-[var(--color-ink-2)] font-sans text-sm">Próximamente</p>
                </div>

                <p className="text-[var(--color-ink)] leading-relaxed">
                  Para quienes prefieren una tarjeta tradicional o tienen un dispositivo no compatible con eSIM.
                </p>

                <button className="inline-flex items-center gap-2 text-[var(--color-gold)] font-semibold hover:text-[var(--color-navy)] transition-colors cursor-not-allowed opacity-70">
                  Notificarme cuando esté disponible
                  <span>→</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: CÓMO FUNCIONA */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <motion.h2 variants={fadeInUp} className="font-serif text-4xl lg:text-5xl text-[var(--color-navy)]">
              Prepará tu conexión antes de viajar.
            </motion.h2>

            {/* Steps Grid */}
            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {pasos.map((paso, idx) => {
                const IconComponent = paso.icono;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    className="p-8 lg:p-10 rounded-xl bg-[var(--color-warm-white)] border border-[var(--color-border)] hover:shadow-md transition-all duration-300 space-y-6"
                  >
                    {/* Número */}
                    <h3 className="font-serif text-6xl text-[var(--color-gold)]">{paso.numero}</h3>

                    {/* Icono */}
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center">
                      <IconComponent size={24} weight="light" className="text-[var(--color-navy)]" />
                    </div>

                    {/* Título */}
                    <h4 className="font-sans font-bold text-lg text-[var(--color-navy)]">{paso.titulo}</h4>

                    {/* Descripción */}
                    <p className="text-[var(--color-ink)] leading-relaxed">{paso.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: SIN VUELTAS */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--color-warm-white)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-4xl lg:text-5xl text-[var(--color-navy)]">
                  Sin vueltas. Sin roaming. Sin permanencia.
                </h2>

                <p className="text-lg text-[var(--color-ink)] leading-relaxed max-w-3xl">
                  Queremos que comprar conectividad para viajar sea claro, simple y sin letra chica escondida.
                </p>
              </div>

              {/* Checklist */}
              <motion.div
                variants={staggerContainer}
                className="space-y-3"
              >
                {[
                  "Planes prepago",
                  "Precio claro",
                  "Sin permanencia",
                  "Sin roaming de tu operadora de origen",
                  "Soporte humano",
                  "Información simple antes de comprar",
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    className="flex items-start gap-3"
                  >
                    <Check size={20} weight="bold" className="text-[var(--color-gold)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--color-ink)] font-sans">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Imagen lado derecho */}
            <motion.div variants={fadeInUp} className="relative h-[300px] lg:h-[400px] rounded-2xl overflow-hidden hidden lg:block">
              <Image
                src="/images/imagen6.png"
                alt="Pareja viajando en el Mediterráneo"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: SI TU VIAJE DURA MÁS */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="font-serif text-4xl lg:text-5xl text-[var(--color-navy)]">
                Si tu viaje dura más, podés seguir conectado.
              </h2>

              <p className="text-lg text-[var(--color-ink)] leading-relaxed max-w-3xl">
                Cada plan tiene una duración definida. Si necesitás más días, podés recargar saldo y continuar usando tu plan conforme a las condiciones del servicio.
              </p>

              <div className="pt-4 space-y-2">
                <p className="text-[var(--color-ink)] font-sans font-medium">Sin permanencia.</p>
                <p className="text-[var(--color-ink)] font-sans font-medium">Sin compromiso.</p>
                <p className="text-[var(--color-ink)] font-sans font-medium">Vos decidís si seguís.</p>
              </div>
            </motion.div>

            {/* Grid: Card + Imagen */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="p-8 lg:p-10 rounded-xl bg-[var(--color-warm-white)] border border-[var(--color-gold)]/30 space-y-6">
                <div className="space-y-1">
                  <h4 className="font-sans font-semibold text-lg text-[var(--color-navy)]">28 días + Recarga</h4>
                  <p className="text-[var(--color-ink-2)]">Continúa tu plan cuando lo necesites</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[var(--color-ink)]">
                    <span className="text-[var(--color-gold)] font-bold">+</span>
                    <span>Recarga saldo en cualquier momento</span>
                  </li>
                  <li className="flex items-start gap-2 text-[var(--color-ink)]">
                    <span className="text-[var(--color-gold)] font-bold">+</span>
                    <span>Extiende tu viaje sin límites</span>
                  </li>
                </ul>
              </div>

              <div className="relative h-[300px] lg:h-[400px] rounded-xl overflow-hidden">
                <Image
                  src="/images/imagen5.png"
                  alt="Pareja viajando en Europa"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: RED Y SERVICIO */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--color-navy)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-8 max-w-3xl"
          >
            <motion.h2 variants={fadeInUp} className="font-serif text-4xl lg:text-5xl text-white">
              Conectividad pensada para usar en España y Europa.
            </motion.h2>

            <motion.div variants={fadeInUp} className="space-y-4">
              <p className="text-white/85 leading-relaxed">
                Los planes Ruta34 se apoyan en infraestructura móvil española y están pensados para su uso en España y Europa.
              </p>

              <p className="text-white/75 text-sm leading-relaxed">
                La prestación técnica del servicio asociado a cada SIM o eSIM se realiza conforme a las condiciones del operador de red correspondiente en España.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: POR QUÉ CONFIAR */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <motion.h2 variants={fadeInUp} className="font-serif text-4xl lg:text-5xl text-[var(--color-navy)]">
              Una cosa menos de la que ocuparte.
            </motion.h2>

            {/* Grid de Beneficios */}
            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beneficios.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className="p-6 rounded-lg bg-[var(--color-warm-white)] border border-[var(--color-gold)]/20 hover:border-[var(--color-gold)]/50 hover:shadow-md transition-all duration-300 space-y-3"
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h4 className="font-sans font-semibold text-[var(--color-navy)] text-sm">{item.title}</h4>
                    <p className="text-xs text-[var(--color-ink-2)] mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE: CTA FINAL */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--color-navy)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              <h2 className="font-serif text-5xl lg:text-6xl text-white leading-tight">
                Tu viaje empieza antes del aeropuerto.
              </h2>

              <div className="space-y-4">
                <p className="text-xl text-white/85 leading-relaxed">
                  Ruta34 no quiere venderte más complicaciones.
                </p>

                <p className="text-lg text-white/75 leading-relaxed">
                  Queremos que llegues a Europa, abras tu celular y puedas seguir tu viaje.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  href="/es/planes"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold rounded-lg hover:bg-[var(--color-gold-light)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Ver planes
                </Link>
                <Link
                  href="/es/help/faq"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-300"
                >
                  Leer preguntas frecuentes
                </Link>
              </div>
            </motion.div>

            {/* Imagen lado derecho (solo en desktop) */}
            <motion.div variants={fadeInUp} className="relative h-[300px] lg:h-[500px] hidden lg:block rounded-2xl overflow-hidden">
              <Image
                src="/images/imagen4.png"
                alt="Viajero en París conectado con RUTA34"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}