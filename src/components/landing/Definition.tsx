"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Definition() {
  const t = useTranslations("definition");

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#f9f9f9] to-white">
      <div className="max-w-[960px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] mb-6">
            {t("title")}
          </h2>

          {/* Definition block — 40-60 words, AI-extractable */}
          <div className="bg-white rounded-lg border border-[#e0e0e0] p-8 max-w-[720px] mx-auto">
            <p className="text-lg text-[#333333] leading-relaxed">
              {t("answer")}
            </p>
          </div>

          {/* Visual callout */}
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-[#666666]">
            <span>✓ {t("no_physical_card")}</span>
            <span>✓ {t("instant_activation")}</span>
            <span>✓ {t("qr_scan")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
