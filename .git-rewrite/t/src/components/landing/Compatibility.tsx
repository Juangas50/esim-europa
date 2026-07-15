"use client";

import { motion } from "framer-motion";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const DEVICES = [
  { key: "iphone", compatible: true },
  { key: "samsung", compatible: true },
  { key: "pixel", compatible: true },
  { key: "motorola", compatible: true },
] as const;

export default function Compatibility() {
  const t = useTranslations("compatibility");

  return (
    <section id="compatibilidad" className="py-24 px-4 bg-white">
      <div className="max-w-[1200px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — texto */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <Badge variant="outline" className="mb-5">{t("eyebrow")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mb-4">
              {t("title")}
            </h2>
            <p className="text-[#555555] leading-relaxed mb-8 max-w-[420px]">
              {t("subtitle")}
            </p>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <WarningCircle size={20} weight="fill" className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 leading-snug">{t("warning")}</p>
            </div>
          </motion.div>

          {/* Right — lista de dispositivos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="space-y-3"
          >
            {DEVICES.map(({ key, compatible }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * i, ease: EASE_OUT }}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#F8F8F8] border border-black/[0.05] hover:border-black/10 transition-colors"
              >
                <span className="font-semibold text-[#111111]">
                  {t(`devices.${key}`)}
                </span>
                <div className="flex items-center gap-2">
                  {compatible ? (
                    <>
                      <CheckCircle size={18} weight="fill" className="text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">{t("compatible")}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-[#999]">{t("notCompatible")}</span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Link guía */}
            <a
              href="#faq"
              className="flex items-center justify-center w-full p-4 rounded-2xl border-2 border-dashed border-[#111111]/15 text-sm font-semibold text-[#555] hover:border-[#E60000]/40 hover:text-[#E60000] transition-all duration-200"
            >
              {t("checkGuide")} →
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
