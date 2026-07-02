"use client";

import { motion } from "framer-motion";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const DEVICES = [
  { key: "iphone", compatible: true },
  { key: "samsung", compatible: true },
  { key: "pixel", compatible: true },
  { key: "motorola", compatible: true },
] as const;

export default function Compatibility() {
  const t = useTranslations("compatibility");

  return (
    <section id="compatibilidad" className="py-24 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — Texto Premium */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <Badge variant="outline" className="mb-5">{t("eyebrow")}</Badge>
            <h2 className="font-display text-4xl sm:text-5xl text-[var(--color-navy)] mb-4 leading-tight">
              {t("title")}
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-ink)] leading-relaxed mb-8 max-w-md">
              {t("subtitle")}
            </p>

            {/* Warning Box — Premium style */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-amber-50 border border-amber-200/60"
            >
              <WarningCircle size={22} weight="fill" className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-900 leading-relaxed">{t("warning")}</p>
            </motion.div>
          </motion.div>

          {/* Right — Grid Visual de Dispositivos */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEVICES.map(({ key, compatible }, i) => (
                <motion.div
                  key={key}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ...fadeUp.show.transition }}
                  className="group relative"
                >
                  {/* Card Editorial Premium */}
                  <div className="rounded-2xl bg-white border border-[var(--color-border)] p-6 hover:shadow-lg transition-shadow duration-300">
                    {/* Header: Device + Status */}
                    <div className="flex items-start justify-between mb-4">
                      <span className="font-bold text-lg text-[var(--color-navy)]">
                        {t(`devices.${key}`)}
                      </span>
                      {compatible && (
                        <CheckCircle size={20} weight="fill" className="text-emerald-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60">
                      <span className="text-xs font-semibold text-emerald-700">
                        {compatible ? t("compatible") : t("notCompatible")}
                      </span>
                    </div>

                    {/* Visual Indicator */}
                    <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-navy)]" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Link */}
            <motion.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
              href="#faq-compatible"
              className="inline-flex items-center justify-center w-full mt-6 p-4 rounded-2xl border-2 border-[var(--color-gold)]/30 text-sm font-semibold text-[var(--color-navy)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-all duration-200"
            >
              {t("checkGuide")} →
            </motion.a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
