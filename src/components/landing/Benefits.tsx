"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DeviceMobile, Lightning, CurrencyDollar, Globe } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const BENEFIT_ITEMS = [
  { key: "apps", Icon: DeviceMobile },
  { key: "instant", Icon: Lightning },
  { key: "nopermanence", Icon: CurrencyDollar },
  { key: "coverage", Icon: Globe },
] as const;

const MAIN_COUNTRIES = ["España", "Francia", "Italia", "Alemania", "Portugal"];

const ALL_COUNTRIES = [
  "Austria", "Bélgica", "Bulgaria", "Croacia", "Chipre",
  "Rep. Checa", "Dinamarca", "Eslovaquia", "Eslovenia", "Estonia",
  "Finlandia", "Grecia", "Hungría", "Irlanda", "Letonia",
  "Lituania", "Luxemburgo", "Malta", "Holanda", "Polonia",
  "Rumania", "Suecia", "Reino Unido", "Islandia", "Liechtenstein",
  "Noruega", "Suiza", "Turquía", "Kosovo", "Vaticano",
  "Mónaco", "Ucrania", "Moldavia", "Estados Unidos",
];

export default function Benefits() {
  const t = useTranslations("benefits");
  const [countriesOpen, setCountriesOpen] = useState(false);

  return (
    <section className="py-24 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-20 max-w-2xl"
        >
          <h2 className="font-display text-4xl sm:text-5xl text-[var(--color-navy)] mb-4 leading-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* Grid Premium Editorial — 4 bloques en 2 filas */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {BENEFIT_ITEMS.map(({ key, Icon }, i) => {
            const isLast = key === "coverage";
            const cardClass = isLast
              ? "md:col-span-2"
              : "";

            return (
              <motion.div
                key={key}
                variants={fadeUp}
                className={`group rounded-2xl bg-white border border-[var(--color-border)] p-8 hover:shadow-lg transition-shadow duration-300 ${cardClass}`}
              >
                {isLast ? (
                  // Card Grande: Coverage con imagen editorial
                  <div className="relative">
                    {/* Background imagen */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
                      <Image
                        src="/images/imagen4.png"
                        alt=""
                        aria-hidden="true"
                        fill
                        className="object-cover object-center opacity-15"
                        sizes="100vw"
                        loading="lazy"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Text content */}
                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-6">
                          <Icon size={24} weight="duotone" className="text-[var(--color-gold)]" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--color-navy)] mb-3">
                          {t(`items.${key}.title`)}
                        </h3>
                        <p className="text-base text-[var(--color-ink)] leading-relaxed mb-6">
                          {t(`items.${key}.desc`)}
                        </p>

                        {/* Badge 5G + línea española */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-xs tracking-tight px-3 py-1">
                            5G
                          </span>
                          <span className="text-xs font-semibold text-[var(--color-ink-2)]">Línea española — Europa</span>
                        </div>

                        {/* Main countries */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {MAIN_COUNTRIES.map((c) => (
                            <span key={c} className="text-xs font-semibold text-[var(--color-navy)] bg-[var(--color-gold)]/8 px-3 py-1 rounded-full border border-[var(--color-gold)]/20">
                              {c}
                            </span>
                          ))}
                        </div>

                        {/* Expand button */}
                        <button
                          onClick={() => setCountriesOpen(o => !o)}
                          className="text-xs font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
                        >
                          {countriesOpen ? `Ver menos ${ALL_COUNTRIES.length} países ↑` : `+ ${ALL_COUNTRIES.length} países más ↓`}
                        </button>

                        {/* Expandable countries */}
                        <AnimatePresence>
                          {countriesOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                                {ALL_COUNTRIES.map((c) => (
                                  <span key={c} className="text-xs font-semibold text-[var(--color-ink-2)] bg-[var(--color-gold)]/5 px-3 py-1 rounded-full border border-[var(--color-border)]">
                                    {c}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-[var(--color-ink-2)] mt-3 leading-relaxed">
                                Según normativa europea: hasta 23 GB, después 1,33 €/GB.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Right: Placeholder para imagen (visual balance) */}
                      <div className="hidden lg:flex items-center justify-center">
                        <div className="w-full h-64 rounded-xl bg-gradient-to-br from-[var(--color-gold)]/10 to-[var(--color-navy)]/5 flex items-center justify-center">
                          <span className="text-sm text-[var(--color-ink-2)]">Cobertura Europa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Cards regulares: Iconos + Texto
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--color-gold)]/15 transition-colors">
                      <Icon size={24} weight="duotone" className="text-[var(--color-gold)]" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-navy)] mb-3">
                      {t(`items.${key}.title`)}
                    </h3>
                    <p className="text-base text-[var(--color-ink)] leading-relaxed">
                      {t(`items.${key}.desc`)}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
