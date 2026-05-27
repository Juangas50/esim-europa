"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Star, Users } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Badge from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import type { Plan } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface PlansProps {
  plans: Plan[];
}

// ── Card: plan compacto (lateral) ────────────────────────────────────────────

function CompactPlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const t = useTranslations("plans");
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      className="flex flex-col rounded-[1.5rem] bg-[#F8F8F8] border border-black/[0.06] p-7"
    >
      <div className="mb-6">
        <Badge variant="outline">{t(`${plan.type}.badge`)}</Badge>
        <h3 className="text-xl font-black text-[#111111] mt-3 mb-1">{plan.name}</h3>
        <p className="text-sm text-[#777] leading-snug">{t(`${plan.type}.desc`)}</p>
      </div>

      {/* Precio */}
      <div className="mb-6">
        <span className="text-4xl font-black text-[#111111]">{formatUSD(plan.price_usd)}</span>
        <p className="text-sm text-[#999] mt-0.5">{t("perMonth")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <div className="rounded-xl bg-white border border-black/5 p-3">
          <p className="text-lg font-black text-[#111]">{plan.data_gb} GB</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{t("dataGb")}</p>
        </div>
        <div className="rounded-xl bg-white border border-black/5 p-3">
          <p className="text-lg font-black text-[#111]">
            {plan.countries_count}{plan.countries_count > 1 ? "+" : ""}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{t("countries")}</p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#555]">
            <Check size={15} weight="bold" className="text-[#E60000] mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <a
        href={`/${locale}/compra?plan=${plan.id}`}
        onClick={() => analytics.planSelected(plan)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#111111] text-[#111111] font-bold text-sm hover:bg-[#111111] hover:text-white active:scale-[0.97] transition-all"
        style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease, color 200ms ease" }}
      >
        {t("buyPlan")}
      </a>
    </motion.div>
  );
}

// ── Card: plan featured (oscuro, 2/3 ancho) ──────────────────────────────────

function FeaturedPlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const t = useTranslations("plans");
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      className="lg:col-span-2 relative flex flex-col rounded-[1.5rem] bg-[#111111] p-8 overflow-hidden"
    >
      {/* Decoración */}
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#E60000]/15" />
      <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-[#6EC1E4]/10" />

      <div className="relative">
        {/* Badges */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="red">
              <Star size={10} weight="fill" />
              {t("popular")}
            </Badge>
            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] text-white font-black text-[10px] tracking-tight px-2 py-1 shadow">
              5G
            </span>
            <span className="text-sm">🇪🇸</span>
          </div>
          <Badge variant="outline" className="bg-white/10 border-white/20 text-white/80">
            {t(`${plan.type}.badge`)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Left: info */}
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
            <p className="text-sm text-white/50 leading-snug mb-6">{t(`${plan.type}.desc`)}</p>

            {/* Precio */}
            <div className="mb-6">
              <span className="text-5xl font-black text-white">{formatUSD(plan.price_usd)}</span>
              <p className="text-sm text-white/40 mt-0.5">{t("perMonth")}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <div className="rounded-xl bg-white/8 border border-white/10 p-3">
                <p className="text-xl font-black text-white">{plan.data_gb} GB</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{t("dataGb")}</p>
              </div>
              <div className="rounded-xl bg-white/8 border border-white/10 p-3">
                <p className="text-xl font-black text-white">{plan.countries_count}+</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{t("countries")}</p>
              </div>
            </div>
          </div>

          {/* Right: features + CTA */}
          <div className="flex flex-col">
            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <Check size={15} weight="bold" className="text-[#E60000] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={`/${locale}/compra?plan=${plan.id}`}
              onClick={() => analytics.planSelected(plan)}
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
  );
}

// ── Card: plan horizontal (fila inferior) ────────────────────────────────────

function HorizontalPlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const t = useTranslations("plans");
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      className="rounded-[1.5rem] bg-[#EBF6FC] border border-[#6EC1E4]/30 p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-black text-[#111111]">{plan.name}</h3>
            <Badge variant="blue">{t(`${plan.type}.badge`)}</Badge>
          </div>
          <p className="text-sm text-[#555] max-w-[480px] leading-relaxed">
            {t(`${plan.type}.desc`)}
          </p>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 shrink-0 flex-wrap">
          <div className="text-center">
            <p className="text-2xl font-black text-[#111111]">{plan.data_gb} GB</p>
            <p className="text-xs text-[#777] font-semibold uppercase tracking-wider">{t("dataGb")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#111111]">{plan.countries_count}+</p>
            <p className="text-xs text-[#777] font-semibold uppercase tracking-wider">{t("countries")}</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#111111]">{formatUSD(plan.price_usd)}</p>
            <p className="text-xs text-[#777] font-semibold">{t("perMonth")}</p>
          </div>
          <a
            href={`/${locale}/compra?plan=${plan.id}`}
            onClick={() => analytics.planSelected(plan)}
            className="flex items-center gap-2 bg-[#111111] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#333] active:scale-[0.97]"
            style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
          >
            {t("buyPlan")}
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Layout: sin planes destacados — grid uniforme ────────────────────────────

function UniformGrid({ plans }: { plans: Plan[] }) {
  const t = useTranslations("plans");
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan, i) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.07, ease: EASE_OUT }}
          className="flex flex-col rounded-[1.5rem] bg-[#F8F8F8] border border-black/[0.06] p-7"
        >
          <div className="mb-6">
            <Badge variant="outline">{t(`${plan.type}.badge`)}</Badge>
            <h3 className="text-xl font-black text-[#111111] mt-3 mb-1">{plan.name}</h3>
            <p className="text-sm text-[#777] leading-snug">{t(`${plan.type}.desc`)}</p>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-black text-[#111111]">{formatUSD(plan.price_usd)}</span>
            <p className="text-sm text-[#999] mt-0.5">{t("perMonth")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="rounded-xl bg-white border border-black/5 p-2.5">
              <p className="text-base font-black text-[#111]">{plan.data_gb} GB</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{t("dataGb")}</p>
            </div>
            <div className="rounded-xl bg-white border border-black/5 p-2.5">
              <p className="text-base font-black text-[#111]">{plan.countries_count}{plan.countries_count > 1 ? "+" : ""}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">{t("countries")}</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-6 flex-1">
            {plan.features.slice(0, 4).map((f, j) => (
              <li key={j} className="flex items-start gap-2 text-xs text-[#555]">
                <Check size={13} weight="bold" className="text-[#E60000] mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a
            href={`/${locale}/compra?plan=${plan.id}`}
            onClick={() => analytics.planSelected(plan)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#111111] text-[#111111] font-bold text-sm hover:bg-[#111111] hover:text-white active:scale-[0.97] transition-all"
            style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease, color 200ms ease" }}
          >
            {t("buyPlan")}
          </a>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function Plans({ plans }: PlansProps) {
  const t = useTranslations("plans");

  // Elegir el plan featured (highlight=true / is_popular)
  const featured = plans.find((p) => p.is_popular);

  // Si no hay highlighted, mostrar todos en grid uniforme
  if (!featured) {
    return (
      <section id="planes" className="py-24 px-4 bg-white">
        <div className="max-w-[1200px] mx-auto">
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
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-[#555555] text-base">{t("subtitle")}</p>
              <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] border border-emerald-200 rounded-full px-3 py-1">
                <Users size={13} weight="fill" className="text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">{t("socialProof")}</span>
              </div>
            </div>
          </motion.div>
          <UniformGrid plans={plans} />
        </div>
      </section>
    );
  }

  // Planes sin el featured — se distribuyen en "compact" (lateral) y "bottom" (horizontal)
  const rest = plans.filter((p) => p.id !== featured.id);

  // Preferimos el plan más barato de zona España como tarjeta lateral compacta
  const sideCard =
    rest.find((p) => p.zone === "espana") ??
    rest[0];

  // El resto va en cards horizontales debajo
  const bottomCards = sideCard
    ? rest.filter((p) => p.id !== sideCard.id)
    : rest;

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
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-[#555555] text-base">{t("subtitle")}</p>
            <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] border border-emerald-200 rounded-full px-3 py-1">
              <Users size={13} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">{t("socialProof")}</span>
            </div>
          </div>
        </motion.div>

        {/* Fila principal: compact (1/3) + featured (2/3) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4"
        >
          {sideCard ? (
            <CompactPlanCard plan={sideCard} delay={0.05} />
          ) : null}

          <FeaturedPlanCard
            plan={featured}
            delay={0.12}
          />
        </motion.div>

        {/* Tarjetas adicionales — una por fila (horizontales) */}
        {bottomCards.length > 0 && (
          <div className="space-y-4">
            {bottomCards.map((plan, i) => (
              <HorizontalPlanCard
                key={plan.id}
                plan={plan}
                delay={0.18 + i * 0.06}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
