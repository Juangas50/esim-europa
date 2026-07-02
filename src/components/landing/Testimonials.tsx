"use client";

import { motion } from "framer-motion";
import { Star } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const TESTIMONIALS_ES = [
  {
    name: "Lucía F.",
    country: "Argentina",
    destination: "Madrid",
    flag: "🇦🇷",
    text: "Me salvó el viaje. Llegué a Madrid y ya tenía internet, sin hacer nada en el aeropuerto. El QR con todas las instrucciones me llegó directo al email. Increíble.",
    plan: "SIM Local M · 270 GB",
    rating: 5,
    image: "/images/imagen3.png",
    journey: "Viaje a España",
  },
  {
    name: "Carlos M.",
    country: "México",
    destination: "Europa",
    flag: "🇲🇽",
    text: "Lo usé en un viaje de 3 semanas por España, Francia e Italia. Funcionó perfecto en todos lados. Muy fácil de instalar, escaneás el QR y listo.",
    plan: "SIM Local L · 330 GB",
    rating: 5,
    image: "/images/imagen5.png",
    journey: "3 semanas por Europa",
  },
  {
    name: "Ana Beatriz S.",
    country: "Brasil",
    destination: "Lisboa",
    flag: "🇧🇷",
    text: "Facilísimo. Instalé el QR antes de embarcar y cuando llegué a Lisboa ya estaba conectada. Sin colas, sin estrés. Lo recomiendo a todos los que viajan a Europa.",
    plan: "SIM Local M · 270 GB",
    rating: 5,
    image: "/images/imagen6.png",
    journey: "Viaje a Portugal",
  },
];

const TESTIMONIALS_PT = [
  {
    name: "Lucía F.",
    country: "Argentina",
    destination: "Madrid",
    flag: "🇦🇷",
    text: "Me salvou a viagem. Cheguei a Madrid e já tinha internet, sem fazer nada no aeroporto. O QR com todas as instruções chegou direto no meu email. Incrível.",
    plan: "SIM Local M · 270 GB",
    rating: 5,
    image: "/images/imagen3.png",
    journey: "Viagem para Espanha",
  },
  {
    name: "Carlos M.",
    country: "México",
    destination: "Europa",
    flag: "🇲🇽",
    text: "Usei numa viagem de 3 semanas pela Espanha, França e Itália. Funcionou perfeitamente em todos os lugares. Muito fácil de instalar.",
    plan: "SIM Local L · 330 GB",
    rating: 5,
    image: "/images/imagen5.png",
    journey: "3 semanas pela Europa",
  },
  {
    name: "Ana Beatriz S.",
    country: "Brasil",
    destination: "Lisboa",
    flag: "🇧🇷",
    text: "Muito fácil! Instalei o QR antes de embarcar e quando cheguei em Lisboa já estava conectada. Sem fila, sem estresse. Super recomendo.",
    plan: "SIM Local M · 270 GB",
    rating: 5,
    image: "/images/imagen6.png",
    journey: "Viagem para Portugal",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={16} weight="fill" className="text-[var(--color-gold)]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const locale = useLocale();
  const TESTIMONIALS = locale === "pt" ? TESTIMONIALS_PT : TESTIMONIALS_ES;

  return (
    <section className="py-24 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-20 text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-4xl sm:text-5xl text-[var(--color-navy)] mb-4 leading-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-[var(--color-ink-2)]">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Historias Visuales — Grid Asimétrico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_OUT }}
              className="flex flex-col lg:flex-row gap-6 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Imagen — Protagonista Visual */}
              <div className="flex-shrink-0 w-full lg:w-1/3 aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.name} viajando a ${item.destination}`}
                  fill
                  className="object-cover object-center hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                />
                {/* Overlay con destino */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-semibold text-lg">{item.destination}</p>
                  <p className="text-sm text-white/80">{item.journey}</p>
                </div>
              </div>

              {/* Contenido — Contexto e Historia */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                {/* Rating y Contexto */}
                <div>
                  <div className="mb-4">
                    <StarRating count={item.rating} />
                  </div>

                  {/* Header: Nombre + Origen */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-warm-white)] border-2 border-[var(--color-gold)] flex items-center justify-center text-2xl flex-shrink-0">
                        {item.flag}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[var(--color-navy)]">{item.name}</h3>
                        <p className="text-sm text-[var(--color-ink-2)]">De {item.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Historia */}
                  <blockquote className="mb-6">
                    <p className="text-base leading-relaxed text-[var(--color-ink)] italic">
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </blockquote>
                </div>

                {/* Plan Badge */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-2)]">
                    {item.plan}
                  </span>
                  <div className="text-2xl">✓</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aggregate Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
          className="bg-[var(--color-navy)] rounded-3xl p-8 sm:p-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <StarRating count={5} />
            <span className="text-white text-lg font-bold">5.0</span>
          </div>
          <p className="text-white text-base sm:text-lg">
            {t("aggregate")}
          </p>
        </motion.div>

      </div>
    </section>
  );
}
