"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Star, Users, Phone, ChatCircleText, Globe } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Badge from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import type { Plan, PlanSize } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface PlansProps {
  plans: Plan[];
}

type ActiveTab = "local" | "dataonly";

// ── Size order for sorting ────────────────────────────────────────────────────
const SIZE_ORDER: Record<PlanSize, number> = { S: 0, M: 1, L: 2, XL: 3, XXL: 4 };

// ── Tab switcher ─────────────────────────────────────────────────────────────

function TabSwitcher({
  active,
  onChange,
  hasLocal,
  hasData,
}: {
  active: ActiveTab;
  onChange: (t: ActiveTab) => void;
  hasLocal: boolean;
  hasData: boolean;
}) {
  const t = useTranslations("plans");

  return (
    <div className="inline-flex rounded-2xl bg-[#F0F0F0] p-1.5 gap-1">
      {hasLocal && (
        <button
          onClick={() => onChange("local")}
          className={`relative flex flex-col items-start sm:items-center sm:flex-row sm:gap-2.5 px-4 sm:px-5 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${
            active === "local" ? "text-[#111111]" : "text-[#888] hover:text-[#555]"
          }`}
        >
          {active === "local" && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 rounded-xl bg-white shadow-sm"
              transition={{ duration: 0.25, ease: EASE_OUT }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            <span className="text-base">🇪🇸</span>
            <span>{t("tabLocal")}</span>
          </span>
          <span className={`relative text-[11px] font-medium sm:font-semibold hidden sm:block ${active === "local" ? "text-[#888]" : "text-[#bbb]"}`}>
            {t("tabLocalSub")}
          </span>
        </button>
      )}
      {hasData && (
        <button
          onClick={() => onChange("dataonly")}
          className={`relative flex flex-col items-start sm:items-center sm:flex-row sm:gap-2.5 px-4 sm:px-5 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${
            active === "dataonly" ? "text-[#111111]" : "text-[#888] hover:text-[#555]"
          }`}
        >
          {active === "dataonly" && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 rounded-xl bg-white shadow-sm"
              transition={{ duration: 0.25, ease: EASE_OUT }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            <span className="text-base">✈️</span>
            <span>{t("tabData")}</span>
          </span>
          <span className={`relative text-[11px] font-medium sm:font-semibold hidden sm:block ${active === "dataonly" ? "text-[#888]" : "text-[#bbb]"}`}>
            {t("tabDataSub")}
          </span>
        </button>
      )}
    </div>
  );
}

// ── SIM Local: tarjetas de tamaño ─────────────────────────────────────────────

function LocalSizeCard({ plan, index }: { plan: Plan; index: number }) {
  const t = useTranslations("plans");
  const locale = useLocale();
  const isPopular = plan.is_popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: EASE_OUT }}
      className={`relative flex flex-col rounded-2xl p-5 ${
        isPopular
          ? "bg-[#111111] text-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35)]"
          : "bg-white border border-black/[0.07]"
      }`}
    >
      {/* Size badge + popular */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm ${
          isPopular ? "bg-white/15 text-white" : "bg-[#F0F0F0] text-[#111]"
        }`}>
          {plan.size ?? "—"}
        </span>
        {isPopular && (
          <Badge variant="red" className="text-[10px]">
            <Star size={9} weight="fill" />
            {t("popular")}
          </Badge>
        )}
      </div>

      {/* GB */}
      <div className="mb-1">
        <span className={`text-3xl font-black ${isPopular ? "text-white" : "text-[#111111]"}`}>
          {plan.data_gb}
        </span>
        <span className={`text-sm font-bold ml-1 ${isPopular ? "text-white/60" : "text-[#999]"}`}>GB</span>
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-5 ${isPopular ? "text-white/40" : "text-[#bbb]"}`}>
        4G/5G
      </p>

      {/* Precio */}
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
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${
            isPopular
              ? "bg-[#E60000] text-white hover:bg-[#CC0000] shadow-[0_4px_16px_-4px_rgba(230,0,0,0.5)]"
              : "border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white"
          }`}
          style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease, color 200ms ease" }}
        >
          {t("buyPlan")}
          {isPopular && <ArrowRight size={13} weight="bold" />}
        </a>
      </div>
    </motion.div>
  );
}

// ── SIM Local: strip de características compartidas ───────────────────────────

function LocalFeaturesStrip() {
  const t = useTranslations("plans");

  const features = [
    { icon: <Phone size={14} weight="fill" className="text-[#E60000]" />, label: t("localFeatureNumber") },
    { icon: <Phone size={14} weight="fill" className="text-[#E60000]" />, label: t("localFeatureCalls") },
    { icon: <ChatCircleText size={14} weight="fill" className="text-[#E60000]" />, label: t("localFeatureSms") },
    { icon: <span className="inline-flex items-center gap-1 rounded bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] text-white font-black text-[9px] px-1.5 py-0.5">5G</span>, label: t("localFeatureNetwork") },
    { icon: <Check size={14} weight="bold" className="text-emerald-500" />, label: t("localFeatureQr") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: EASE_OUT }}
      className="mt-4 rounded-2xl bg-[#F8F8F8] border border-black/[0.06] px-5 py-4"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-3">
        {t("localIncludes")}
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {f.icon}
            <span className="text-sm font-semibold text-[#333]">{f.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Data Traveler: tarjetas ───────────────────────────────────────────────────

function DataCard({ plan, index }: { plan: Plan; index: number }) {
  const t = useTranslations("plans");
  const locale = useLocale();
  const isPopular = plan.is_popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: EASE_OUT }}
      className={`rounded-2xl p-6 sm:p-7 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 ${
        isPopular
          ? "bg-[#111111] border-transparent"
          : "bg-white border-black/[0.07]"
      }`}
    >
      {/* Left: name + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <h3 className={`text-lg font-black ${isPopular ? "text-white" : "text-[#111111]"}`}>
            {plan.name}
          </h3>
          {isPopular && (
            <Badge variant="red" className="text-[10px]">
              <Star size={9} weight="fill" />
              {t("popular")}
            </Badge>
          )}
          <span className={`inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] text-white font-black text-[9px] tracking-tight px-1.5 py-0.5`}>
            5G
          </span>
          <Globe size={14} className={isPopular ? "text-white/40" : "text-[#bbb]"} />
          <span className={`text-xs font-semibold ${isPopular ? "text-white/50" : "text-[#999]"}`}>
            {plan.countries_count}+ {t("countries")}
          </span>
        </div>
        <p className={`text-sm leading-snug max-w-sm ${isPopular ? "text-white/50" : "text-[#777]"}`}>
          {t("dataonly.desc")}
        </p>
      </div>

      {/* Right: price + CTA */}
      <div className="flex items-center gap-5 shrink-0">
        <div>
          <p className={`text-3xl font-black ${isPopular ? "text-white" : "text-[#111111]"}`}>
            {plan.data_gb} <span className={`text-base font-bold ${isPopular ? "text-white/50" : "text-[#999]"}`}>GB</span>
          </p>
          <p className={`text-2xl font-black ${isPopular ? "text-white" : "text-[#111111]"}`}>
            {formatUSD(plan.price_usd)}
          </p>
          <p className={`text-xs ${isPopular ? "text-white/40" : "text-[#999]"}`}>{t("perMonth")}</p>
        </div>
        <a
          href={`/${locale}/compra?plan=${plan.id}`}
          onClick={() => analytics.planSelected(plan)}
          className={`flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-all active:scale-[0.97] whitespace-nowrap ${
            isPopular
              ? "bg-[#E60000] text-white hover:bg-[#CC0000] shadow-[0_4px_16px_-4px_rgba(230,0,0,0.4)]"
              : "bg-[#111111] text-white hover:bg-[#333]"
          }`}
          style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
        >
          {t("buyPlan")}
          <ArrowRight size={13} weight="bold" />
        </a>
      </div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Plans({ plans }: PlansProps) {
  const t = useTranslations("plans");

  const localPlans = plans
    .filter((p) => p.type === "local")
    .sort((a, b) => {
      if (a.size && b.size) return SIZE_ORDER[a.size] - SIZE_ORDER[b.size];
      return a.price_usd - b.price_usd;
    });

  const dataPlans = plans
    .filter((p) => p.type === "dataonly")
    .sort((a, b) => a.price_usd - b.price_usd);

  const hasLocal = localPlans.length > 0;
  const hasData = dataPlans.length > 0;

  const [activeTab, setActiveTab] = useState<ActiveTab>(hasLocal ? "local" : "dataonly");

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

        {/* Tab switcher */}
        {hasLocal && hasData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="mb-8"
          >
            <TabSwitcher
              active={activeTab}
              onChange={setActiveTab}
              hasLocal={hasLocal}
              hasData={hasData}
            />
          </motion.div>
        )}

        {/* Contenido del tab */}
        <AnimatePresence mode="wait">
          {activeTab === "local" && hasLocal && (
            <motion.div
              key="local"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              {/* Size cards — grid 5 cols (desktop), 2-3 cols (tablet), 2 cols (mobile) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {localPlans.map((plan, i) => (
                  <LocalSizeCard key={plan.id} plan={plan} index={i} />
                ))}
              </div>

              {/* Feature strip */}
              <LocalFeaturesStrip />
            </motion.div>
          )}

          {activeTab === "dataonly" && hasData && (
            <motion.div
              key="dataonly"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="space-y-3"
            >
              {dataPlans.map((plan, i) => (
                <DataCard key={plan.id} plan={plan} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
