"use client";

import { motion } from "framer-motion";
import { DeviceMobile, Lightning, CurrencyDollar, Globe } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// Items con referencia directa al componente (no indexado)
const TOP_ITEMS = [
  { key: "apps", Icon: DeviceMobile },
  { key: "instant", Icon: Lightning },
] as const;

export default function Benefits() {
  const t = useTranslations("benefits");

  return (
    <section className="py-24 px-4">
      <div className="max-w-[1200px] mx-auto">

        {/* Header — left aligned (taste-skill anti-center bias) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* Grid asimétrico — taste-skill: NO 3-equal-cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Primera fila: 2 cards grandes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {TOP_ITEMS.map(({ key, Icon }) => (
              <motion.div
                key={key}
                variants={fadeUp}
                className="group rounded-[1.5rem] bg-white border border-black/[0.06] p-8 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8F8F8] border border-black/5 flex items-center justify-center mb-5 group-hover:bg-[#E60000]/6 transition-colors duration-300">
                  <Icon size={22} weight="duotone" className="text-[#E60000]" />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-2">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-[#555555] leading-relaxed">
                  {t(`items.${key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Segunda fila: asimétrica 1/3 + 2/3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Card compacta */}
            <motion.div
              variants={fadeUp}
              className="group rounded-[1.5rem] bg-white border border-black/[0.06] p-7 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300 sm:col-span-1"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F8F8F8] border border-black/5 flex items-center justify-center mb-4 group-hover:bg-[#E60000]/6 transition-colors duration-300">
                <CurrencyDollar size={20} weight="duotone" className="text-[#E60000]" />
              </div>
              <h3 className="text-lg font-bold text-[#111111] mb-1.5">
                {t("items.nopermanence.title")}
              </h3>
              <p className="text-sm text-[#555555] leading-relaxed">
                {t("items.nopermanence.desc")}
              </p>
            </motion.div>

            {/* Card grande con acento oscuro — double bezel (soft-skill) */}
            <motion.div
              variants={fadeUp}
              className="rounded-[1.5rem] bg-[#111111] p-7 sm:col-span-2 relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#E60000]/20" />
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#6EC1E4]/20" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Globe size={20} weight="duotone" className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  {t("items.coverage.title")}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {t("items.coverage.desc")}
                </p>
                {/* Badge 5G + línea española */}
                <div className="flex items-center gap-2 mt-4 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] text-white font-black text-[10px] tracking-tight px-2 py-1">
                    5G
                  </span>
                  <span className="text-xs font-semibold text-white/60">Línea española 🇪🇸 — cobertura en toda Europa</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["🇪🇸 España", "🇫🇷 Francia", "🇮🇹 Italia", "🇩🇪 Alemania", "🇵🇹 Portugal", "+25 más"].map((c) => (
                    <span key={c} className="text-xs font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
