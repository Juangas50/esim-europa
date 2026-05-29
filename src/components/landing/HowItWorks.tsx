"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function HowItWorks() {
  const t = useTranslations("howItWorks");

  const steps = [
    { num: "01", key: "1" },
    { num: "02", key: "2" },
    { num: "03", key: "3" },
  ] as const;

  return (
    <section id="como-funciona" className="py-24 px-4">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-16"
        >
          <Badge variant="outline" className="mb-4">{t("eyebrow")}</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* Steps — layout editorial con separadores, NO 3 cards iguales */}
        <div className="space-y-0">
          {steps.map(({ num, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_OUT }}
            >
              {/* Separador superior */}
              <div className="h-px bg-[#111111]/8" />

              <div className="grid grid-cols-12 gap-6 py-10 sm:py-12 group">

                {/* Número grande */}
                <div className="col-span-3 sm:col-span-2">
                  <span className="text-5xl sm:text-6xl font-black text-[#111111]/8 group-hover:text-[#E60000]/20 transition-colors duration-300 select-none tabular-nums">
                    {num}
                  </span>
                </div>

                {/* Contenido */}
                <div className="col-span-9 sm:col-span-7 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-black text-[#111111] mb-2 tracking-tight">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-[#555555] leading-relaxed max-w-[480px]">
                    {t(`steps.${key}.desc`)}
                  </p>
                </div>

                {/* Indicador visual — solo desktop */}
                <div className="hidden sm:flex col-span-3 items-center justify-end">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg
                    ${i === 0 ? "bg-[#E60000] text-white shadow-[0_4px_16px_-4px_rgba(230,0,0,0.35)]" : ""}
                    ${i === 1 ? "bg-[#111111] text-white" : ""}
                    ${i === 2 ? "bg-[#EBF6FC] text-[#2a7fa5] border border-[#6EC1E4]/30" : ""}
                  `}>
                    {num}
                  </div>
                </div>

              </div>
            </motion.div>
          ))}

          {/* Separador final */}
          <div className="h-px bg-[#111111]/8" />
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
          className="mt-12 flex justify-start"
        >
          <a
            href="#planes"
            className="inline-flex items-center gap-3 bg-[#E60000] text-white font-bold text-base px-8 py-4 rounded-full hover:bg-[#CC0000] active:scale-[0.97] shadow-[0_4px_20px_-4px_rgba(230,0,0,0.35)]"
            style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
          >
            {t("cta")}
          </a>
        </motion.div>

      </div>
    </section>
  );
}
