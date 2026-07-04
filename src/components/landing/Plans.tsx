"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Badge from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { trackSelectPlan, trackViewPlans } from "@/lib/analytics-ga4";
import type { Plan } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface PlansProps {
  plans: Plan[];
}

function sortByPosition(plans: Plan[]) {
  return [...plans].sort((a, b) => {
    if (a.position != null && b.position != null) return a.position - b.position;
    if (a.position != null) return -1;
    if (b.position != null) return 1;
    return a.price_usd - b.price_usd;
  });
}

function PlanCard({ plan, index, isPopular }: { plan: Plan; index: number; isPopular: boolean }) {
  const t = useTranslations("plans");
  const locale = useLocale();

  const features = plan.badge
    ? plan.badge.split(/\r?\n/).map(f => f.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: EASE_OUT }}
      className={`relative flex flex-col h-full rounded-2xl p-5 transition-all ${
        isPopular
          ? "bg-[var(--color-navy)] shadow-lg ring-2 ring-[var(--color-gold)]"
          : "bg-white border border-[var(--color-border)]"
      }`}
    >
      {/* Badge */}
      {isPopular && (
        <div className="mb-1.5">
          <Badge variant="red" className="inline-flex gap-2">
            <Star size={12} weight="fill" />
            <span>{t("popular")}</span>
          </Badge>
        </div>
      )}

      {/* Plan Name */}
      <h3 className={`text-xl font-black mb-2.5 ${isPopular ? "text-white" : "text-[var(--color-navy)]"}`}>
        {plan.name}
      </h3>

      {/* Data Amount - Prominent */}
      <div className="mb-2.5">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className={`text-5xl font-black leading-none ${isPopular ? "text-white" : "text-[var(--color-gold)]"}`}>
            {plan.data_gb}
          </span>
          <span className={`text-lg font-bold ${isPopular ? "text-white/60" : "text-[var(--color-ink-2)]"}`}>
            GB
          </span>
        </div>
        <p className={`text-xs ${isPopular ? "text-white/70" : "text-[var(--color-ink-2)]"}`}>
          {t("coverage")}
        </p>
      </div>

      {/* EU Data (if applicable) */}
      {plan.eu_data_gb ? (
        <div className="mb-2.5 pb-2.5 border-b border-white/10">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isPopular ? "text-white/50" : "text-[var(--color-ink-3)]"}`}>
            🇪🇺 {t("euRoaming")}
          </p>
          <p className={`text-xl font-black ${isPopular ? "text-white" : "text-[var(--color-navy)]"}`}>
            {plan.eu_data_gb} GB
          </p>
          {/* Non-EU countries if available */}
          {plan.countries_count > 30 && (
            <p className={`text-xs mt-1 ${isPopular ? "text-white/60" : "text-[var(--color-ink-2)]"}`}>
              + 🇺🇸 🇨🇳 🇯🇵 🇦🇺 🇧🇷
            </p>
          )}
        </div>
      ) : null}

      {/* Duration */}
      {plan.duration_days ? (
        <div className="mb-2.5">
          <p className={`text-xs font-semibold ${isPopular ? "text-white/70" : "text-[var(--color-ink-2)]"}`}>
            {plan.duration_days} {t("daysDuration")}
          </p>
        </div>
      ) : null}

      {/* Features */}
      <div className="mb-3 flex-1">
        <ul className="space-y-0.5">
          {features.map((feature, i) => (
            <li key={i} className={`flex items-start gap-2 text-xs ${isPopular ? "text-white/80" : "text-[var(--color-ink)]"}`}>
              <Check size={14} weight="bold" className={`mt-0.5 shrink-0 ${isPopular ? "text-[var(--color-gold)]" : "text-[var(--color-gold)]"}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      {plan.eu_data_gb || features.length > 0 ? <div className="mb-2.5 border-t border-white/10" /> : null}

      {/* Price */}
      <div className="mb-2">
        <p className={`text-3xl font-black leading-none mb-0.5 ${isPopular ? "text-white" : "text-[var(--color-gold)]"}`}>
          {formatUSD(plan.price_usd)}
        </p>
        <p className={`text-xs ${isPopular ? "text-white/50" : "text-[var(--color-ink-2)]"}`}>
          {t("perMonth")}
        </p>
      </div>

      {/* CTA Button */}
      <a
        href={`/${locale}/compra?plan=${plan.id}`}
        onClick={() => {
          analytics.planSelected(plan);
          trackSelectPlan({
            id: plan.id,
            name: plan.name,
            price: plan.price_usd,
            size: plan.size,
          });
        }}
        className={`w-full py-3 rounded-xl font-bold text-center transition-all active:scale-[0.97] ${
          isPopular
            ? "bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)] shadow-lg"
            : "border-2 border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white"
        }`}
      >
        {t("buyPlan")}
      </a>
    </motion.div>
  );
}

export default function Plans({ plans }: PlansProps) {
  const t = useTranslations("plans");
  const locale = useLocale();
  const sorted = sortByPosition(plans);

  useEffect(() => {
    if (plans.length > 0) {
      trackViewPlans(
        plans.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price_usd,
        }))
      );
    }
  }, [plans]);

  if (sorted.length === 0) return null;

  const popularPlan = sorted.find((p) => p.is_popular);

  return (
    <section id="planes" className="py-12 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="max-w-3xl mx-auto mb-6 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-[var(--color-navy)] mb-3">
            {t("title")}
          </h2>
          <p className="text-base text-[var(--color-ink-2)]">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sorted.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              isPopular={plan.id === popularPlan?.id}
            />
          ))}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
          className="mt-20 pt-12 border-t border-[var(--color-border)] text-center"
        >
          <p className="text-sm text-[var(--color-ink-2)]">
            {t("noAutoRenew")} • {t("activateAnytime")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
