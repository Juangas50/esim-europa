"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Star } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Badge from "@/components/ui/Badge";
import { PLANS } from "@/lib/plans";
import { formatUSD } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Plans() {
  const t = useTranslations("plans");
  const locale = useLocale();

  const [planEspana, planEuropa, planDataOnly] = PLANS;

  return (
    <section id="planes" className="py-24 px-4 bg-white">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mb-2">
            {t("title")}
          </h2>
          <p className="text-[#555555] text-base">{t("subtitle")}</p>
        </motion.div>

        {/* Planes — layout asimétrico: España (1/3) + Europa Featured (2/3) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4"
        >
          {/* España — card compacta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT }}
            className="flex flex-col rounded-[1.5rem] bg-[#F8F8F8] border border-black/[0.06] p-7"
          >
            <div className="mb-6">
              <Badge variant="outline">
                {t(`${planEspana.type}.badge`)}
              </Badge>
              <h3 className="text-xl font-black text-[#111111] mt-3 mb-1">
                {planEspana.name}
              </h3>
              <p className="text-sm text-[#777] leading-snug">
                {t(`${planEspana.type}.desc`)}
              </p>
            </div>

            {/* Precio */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#111111]">
                  {formatUSD(planEspana.price_usd)}
                </span>
              </div>
              <p className="text-sm text-[#999] mt-0.5">{t("perMonth")}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <div className="rounded-xl bg-white border border-black/5 p-3">
                <p className="text-lg font-black text-[#111]">{planEspana.data_gb} GB</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{t("dataGb")}</p>
              </div>
              <div className="rounded-xl bg-white border border-black/5 p-3">
                <p className="text-lg font-black text-[#111]">{planEspana.countries_count}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{t("countries")}</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-8 flex-1">
              {planEspana.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#555]">
                  <Check size={15} weight="bold" className="text-[#E60000] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={`/${locale}/compra?plan=${planEspana.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#111111] text-[#111111] font-bold text-sm hover:bg-[#111111] hover:text-white active:scale-[0.97] transition-all"
              style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease, color 200ms ease" }}
            >
              {t("buyPlan")}
            </a>
          </motion.div>

          {/* Europa Prepago — FEATURED, doble ancho */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }}
            className="lg:col-span-2 relative flex flex-col rounded-[1.5rem] bg-[#111111] p-8 overflow-hidden"
          >
            {/* Decoración */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#E60000]/15" />
            <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-[#6EC1E4]/10" />

            <div className="relative">
              {/* Popular badge */}
              <div className="flex items-center justify-between mb-6">
                <Badge variant="red">
                  <Star size={10} weight="fill" />
                  {t("popular")}
                </Badge>
                <Badge variant="outline" className="bg-white/10 border-white/20 text-white/80">
                  {t(`${planEuropa.type}.badge`)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Left: info */}
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-white mb-1">
                    {planEuropa.name}
                  </h3>
                  <p className="text-sm text-white/50 leading-snug mb-6">
                    {t(`${planEuropa.type}.desc`)}
                  </p>

                  {/* Precio */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white">
                        {formatUSD(planEuropa.price_usd)}
                      </span>
                    </div>
                    <p className="text-sm text-white/40 mt-0.5">{t("perMonth")}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2.5 mb-6">
                    <div className="rounded-xl bg-white/8 border border-white/10 p-3">
                      <p className="text-xl font-black text-white">{planEuropa.data_gb} GB</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{t("dataGb")}</p>
                    </div>
                    <div className="rounded-xl bg-white/8 border border-white/10 p-3">
                      <p className="text-xl font-black text-white">{planEuropa.countries_count}+</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{t("countries")}</p>
                    </div>
                  </div>
                </div>

                {/* Right: features + CTA */}
                <div className="flex flex-col">
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {planEuropa.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <Check size={15} weight="bold" className="text-[#E60000] mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`/${locale}/compra?plan=${planEuropa.id}`}
                    className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-[#E60000] text-white font-black text-sm hover:bg-[#CC0000] active:scale-[0.97] shadow-[0_4px_20px_-4px_rgba(230,0,0,0.5)]"
                    style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
                  >
                    {t("buyPlan")}
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowRight size={13} weight="bold" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* DataOnly — full width horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
          className="rounded-[1.5rem] bg-[#EBF6FC] border border-[#6EC1E4]/30 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-black text-[#111111]">{planDataOnly.name}</h3>
                <Badge variant="blue">{t(`${planDataOnly.type}.badge`)}</Badge>
              </div>
              <p className="text-sm text-[#555] max-w-[480px] leading-relaxed">
                {t(`${planDataOnly.type}.desc`)}
              </p>
            </div>

            <div className="flex items-center gap-8 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-black text-[#111111]">{planDataOnly.data_gb} GB</p>
                <p className="text-xs text-[#777] font-semibold uppercase tracking-wider">{t("dataGb")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-[#111111]">{planDataOnly.countries_count}+</p>
                <p className="text-xs text-[#777] font-semibold uppercase tracking-wider">{t("countries")}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#111111]">{formatUSD(planDataOnly.price_usd)}</p>
                <p className="text-xs text-[#777] font-semibold">{t("perMonth")}</p>
              </div>
              <a
                href={`/${locale}/compra?plan=${planDataOnly.id}`}
                className="flex items-center gap-2 bg-[#111111] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#333] active:scale-[0.97]"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
              >
                {t("buyPlan")}
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
