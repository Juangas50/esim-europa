"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Star, Users, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Badge from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import type { Plan } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const CARDS_VISIBLE = 5; // máx visible sin carrusel

interface PlansProps {
  plans: Plan[];
}

// ── Card unificada (misma para SIM Local y Data Traveler) ─────────────────────

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const t = useTranslations("plans");
  const locale = useLocale();
  const isPopular = plan.is_popular;

  // Features cortas para mostrar en la card (máx 3)
  const keyFeatures =
    plan.type === "local"
      ? ["Número español 🇪🇸", "Llamadas y SMS ilimitados", `${plan.duration_days} días`]
      : [`${plan.countries_count}+ países`, "Solo datos · 4G/5G", `${plan.duration_days} días`];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: EASE_OUT }}
      className={`relative flex flex-col rounded-2xl p-5 h-full ${
        isPopular
          ? "bg-[#111111] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
          : "bg-white border border-black/[0.07]"
      }`}
    >
      {/* Top row: talla + tipo + popular */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex flex-col gap-1.5">
          {/* Talla S/M/L/XL/XXL */}
          {plan.size && (
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-base ${
              isPopular ? "bg-white/15 text-white" : "bg-[#F0F0F0] text-[#111]"
            }`}>
              {plan.size}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isPopular && (
            <Badge variant="red" className="text-[10px]">
              <Star size={9} weight="fill" />
              {t("popular")}
            </Badge>
          )}
          {/* Tipo de tarifa */}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            plan.type === "local"
              ? isPopular ? "bg-white/10 text-white/60" : "bg-blue-50 text-blue-600"
              : isPopular ? "bg-white/10 text-white/60" : "bg-emerald-50 text-emerald-700"
          }`}>
            {plan.type === "local" ? "SIM Local 🇪🇸" : "Data ✈️"}
          </span>
        </div>
      </div>

      {/* Nombre de la tarifa */}
      <p className={`text-sm font-bold mb-1 truncate ${isPopular ? "text-white/60" : "text-[#999]"}`}>
        {plan.name}
      </p>

      {/* GB — número grande */}
      <div className="mb-1">
        <span className={`text-4xl font-black leading-none ${isPopular ? "text-white" : "text-[#111111]"}`}>
          {plan.data_gb}
        </span>
        <span className={`text-lg font-bold ml-1 ${isPopular ? "text-white/50" : "text-[#aaa]"}`}>
          GB
        </span>
      </div>
      <p className={`text-[11px] font-semibold uppercase tracking-wider mb-5 ${isPopular ? "text-white/30" : "text-[#ccc]"}`}>
        4G/5G
      </p>

      {/* Features */}
      <ul className="space-y-1.5 mb-6 flex-1">
        {keyFeatures.map((f, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm ${isPopular ? "text-white/70" : "text-[#555]"}`}>
            <Check
              size={13}
              weight="bold"
              className={`mt-0.5 shrink-0 ${isPopular ? "text-[#E60000]" : "text-[#E60000]"}`}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* Precio + CTA */}
      <div className="mt-auto">
        <p className={`text-2xl font-black ${isPopular ? "text-white" : "text-[#111111]"}`}>
          {formatUSD(plan.price_usd)}
        </p>
        <p className={`text-xs mb-4 ${isPopular ? "text-white/40" : "text-[#999]"}`}>
          {t("perMonth")}
        </p>

        <a
          href={`/${locale}/compra?plan=${plan.id}`}
          onClick={() => analytics.planSelected(plan)}
          className={`flex items-center justify-center gap-1.5 w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${
            isPopular
              ? "bg-[#E60000] text-white hover:bg-[#CC0000] shadow-[0_4px_16px_-4px_rgba(230,0,0,0.5)]"
              : "border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white"
          }`}
          style={{
            transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease, color 200ms ease, border-color 200ms ease",
          }}
        >
          {t("buyPlan")}
          {isPopular && <ArrowRight size={13} weight="bold" />}
        </a>
      </div>
    </motion.div>
  );
}

// ── Grid estático (≤5 planes) ─────────────────────────────────────────────────

function PlansGrid({ plans }: { plans: Plan[] }) {
  // Columnas: 2 mobile, 3 sm, hasta 5 desktop (adaptativo)
  const cols =
    plans.length <= 3 ? "lg:grid-cols-3" :
    plans.length === 4 ? "lg:grid-cols-4" :
    "lg:grid-cols-5";

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${cols} gap-3 sm:gap-4`}>
      {plans.map((plan, i) => (
        <PlanCard key={plan.id} plan={plan} index={i} />
      ))}
    </div>
  );
}

// ── Carrusel (>5 planes) ──────────────────────────────────────────────────────

function PlansCarousel({ plans }: { plans: Plan[] }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const maxIndex = Math.max(0, plans.length - CARDS_VISIBLE);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));

  return (
    <div className="relative">
      {/* Track */}
      <div className="overflow-hidden">
        <motion.div
          ref={trackRef}
          animate={{ x: `calc(-${current} * (20% + 12px))` }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="flex gap-3 sm:gap-4"
        >
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className="flex-none w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(20%-10px)]"
            >
              <PlanCard plan={plan} index={i} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-10 h-10 rounded-full border-2 border-[#111111]/12 flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white hover:border-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <CaretLeft size={16} weight="bold" />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-5 h-2 bg-[#111111]" : "w-2 h-2 bg-[#111111]/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === maxIndex}
          className="w-10 h-10 rounded-full border-2 border-[#111111]/12 flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white hover:border-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Plans({ plans }: PlansProps) {
  const t = useTranslations("plans");

  // Ordenar por position (nulls al final) → luego por precio
  const sorted = [...plans].sort((a, b) => {
    if (a.position != null && b.position != null) return a.position - b.position;
    if (a.position != null) return -1;
    if (b.position != null) return 1;
    return a.price_usd - b.price_usd;
  });

  const useCarousel = sorted.length > CARDS_VISIBLE;

  return (
    <section id="planes" className="py-24 px-4 bg-white">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mb-2">
            {t("title")}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-[#555555] text-base">{t("subtitle")}</p>
            <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] border border-emerald-200 rounded-full px-3 py-1">
              <Users size={13} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">{t("socialProof")}</span>
            </div>
          </div>
        </motion.div>

        {/* Planes */}
        {useCarousel ? (
          <PlansCarousel plans={sorted} />
        ) : (
          <PlansGrid plans={sorted} />
        )}

      </div>
    </section>
  );
}
