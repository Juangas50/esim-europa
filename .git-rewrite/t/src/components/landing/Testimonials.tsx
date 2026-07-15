"use client";

import { motion } from "framer-motion";
import { Star } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const TESTIMONIALS_ES = [
  {
    name: "Lucía F.",
    country: "Argentina",
    flag: "🇦🇷",
    text: "Me salvó el viaje. Llegué a Madrid y ya tenía internet, sin hacer nada en el aeropuerto. El QR me llegó al email en menos de un minuto. Increíble.",
    plan: "Europa Prepago 20 GB",
    rating: 5,
  },
  {
    name: "Carlos M.",
    country: "México",
    flag: "🇲🇽",
    text: "Lo usé en un viaje de 3 semanas por España, Francia e Italia. Funcionó perfecto en todos lados. Muy fácil de instalar, escaneás el QR y listo.",
    plan: "Europa Prepago 20 GB",
    rating: 5,
  },
  {
    name: "Ana Beatriz S.",
    country: "Brasil",
    flag: "🇧🇷",
    text: "Facilísimo. Instalé el QR antes de embarcar y cuando llegué a Lisboa ya estaba conectada. Sin colas, sin estrés. Lo recomiendo a todos los que viajan a Europa.",
    plan: "España Prepago 10 GB",
    rating: 5,
  },
];

const TESTIMONIALS_PT = [
  {
    name: "Lucía F.",
    country: "Argentina",
    flag: "🇦🇷",
    text: "Me salvou a viagem. Cheguei a Madrid e já tinha internet, sem fazer nada no aeroporto. O QR chegou no email em menos de um minuto. Incrível.",
    plan: "Europa Prepago 20 GB",
    rating: 5,
  },
  {
    name: "Carlos M.",
    country: "México",
    flag: "🇲🇽",
    text: "Usei numa viagem de 3 semanas pela Espanha, França e Itália. Funcionou perfeitamente em todos os lugares. Muito fácil de instalar.",
    plan: "Europa Prepago 20 GB",
    rating: 5,
  },
  {
    name: "Ana Beatriz S.",
    country: "Brasil",
    flag: "🇧🇷",
    text: "Muito fácil! Instalei o QR antes de embarcar e quando cheguei em Lisboa já estava conectada. Sem fila, sem estresse. Super recomendo.",
    plan: "España Prepago 10 GB",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} weight="fill" className="text-[#F59E0B]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const locale = useLocale();
  const TESTIMONIALS = locale === "pt" ? TESTIMONIALS_PT : TESTIMONIALS_ES;

  return (
    <section className="py-20 px-4 bg-[#F8F8F8]">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mb-2">
            {t("title")}
          </h2>
          <p className="text-[#555555] text-base">{t("subtitle")}</p>
        </motion.div>

        {/* Grid testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT }}
              className="bg-white rounded-2xl border border-black/[0.06] p-6 flex flex-col gap-4"
            >
              {/* Stars */}
              <StarRating count={item.rating} />

              {/* Texto */}
              <p className="text-[#333333] text-sm leading-relaxed flex-1">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#111111]/6">
                <div className="flex items-center gap-2.5">
                  {/* Avatar con flag */}
                  <div className="w-9 h-9 rounded-full bg-[#F8F8F8] border border-black/8 flex items-center justify-center text-lg">
                    {item.flag}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">{item.name}</p>
                    <p className="text-xs text-[#999]">{item.country}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-[#F8F8F8] text-[#777] rounded-full px-2.5 py-1 border border-black/5">
                  {item.plan}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aggregate rating */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <StarRating count={5} />
          <span className="text-sm font-semibold text-[#555]">
            {t("aggregate")}
          </span>
        </motion.div>

      </div>
    </section>
  );
}
