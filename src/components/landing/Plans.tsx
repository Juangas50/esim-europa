"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Star, Users, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Badge from "@/components/ui/Badge";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { trackSelectPlan, trackViewPlans } from "@/lib/analytics-ga4";
import type { Plan } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const MAX_VISIBLE = 5;

interface PlansProps {
  plans: Plan[];
}

type Tab = "local" | "dataonly";

// ── Ordenar por position (nulls al final) → precio ───────────────────────────

function sortByPosition(plans: Plan[]) {
  return [...plans].sort((a, b) => {
    if (a.position != null && b.position != null) return a.position - b.position;
    if (a.position != null) return -1;
    if (b.position != null) return 1;
    return a.price_usd - b.price_usd;
  });
}

// En mobile el plan recomendado va primero para mayor visibilidad
function sortMobileFirst(plans: Plan[]) {
  const sorted = sortByPosition(plans);
  const popular = sorted.find((p) => p.is_popular);
  if (!popular) return sorted;
  return [popular, ...sorted.filter((p) => !p.is_popular)];
}

// ── Card unificada ────────────────────────────────────────────────────────────

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const t = useTranslations("plans");
  const locale = useLocale();
  const isPopular = plan.is_popular;

  const keyFeatures =
    plan.type === "local"
      ? ["Número español incluido", "Llamadas y SMS ilimitados", `${plan.duration_days} días de validez`]
      : [`${plan.countries_count}+ países`, "Solo datos · sin llamadas", `${plan.duration_days} días`];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: EASE_OUT }}
      className={`relative flex flex-col rounded-2xl p-5 h-full ${
        isPopular
          ? "bg-[#1B2F4E] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
          : "bg-white border border-black/[0.07]"
      }`}
    >
      {/* Top: talla (solo local) + popular badge */}
      <div className="flex items-start justify-between mb-4">
        {/* Talla S/M/L/XL/XXL — solo para SIM Local */}
        {plan.size ? (
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-base ${
            isPopular ? "bg-white/15 text-white" : "bg-[#F0F0F0] text-[#1B2F4E]"
          }`}>
            {plan.size}
          </span>
        ) : (
          /* Para data-only: número de orden visual o vacío */
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-xs ${
            isPopular ? "bg-white/10 text-white/60" : "bg-[#F0F0F0] text-[#999]"
          }`}>
            {plan.data_gb}
            <span className={`text-[9px] ml-0.5 font-bold ${isPopular ? "text-white/40" : "text-[#bbb]"}`}>GB</span>
          </span>
        )}

        {isPopular && (
          <Badge variant="red" className="text-[10px]">
            <Star size={9} weight="fill" />
            {t("popular")}
          </Badge>
        )}
      </div>

      {/* Datos — dos zonas para SIM Local, zona única para DataOnly */}
      {plan.type === "local" && plan.eu_data_gb ? (
        <div className="mb-5 rounded-xl overflow-hidden">
          {/* Zona España — primaria */}
          <div className={`px-3.5 py-3 ${isPopular ? "bg-white/12" : "bg-[#F5F5F5]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black leading-none ${isPopular ? "text-white" : "text-[#1B2F4E]"}`}>
                  {plan.data_gb}
                </span>
                <span className={`text-sm font-bold ${isPopular ? "text-white/40" : "text-[#bbb]"}`}>GB</span>
              </div>
              <span className={`text-xs font-bold ${isPopular ? "text-white/70" : "text-[#555]"}`}>
                España
              </span>
            </div>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${isPopular ? "text-white/30" : "text-[#bbb]"}`}>
              4G / 5G
            </p>
          </div>
          {/* Zona UE — secundaria */}
          <div className={`px-3.5 py-2.5 border-t ${
            isPopular
              ? "bg-white/6 border-white/10"
              : "bg-white border-black/6"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-black leading-none ${isPopular ? "text-white/85" : "text-[#222]"}`}>
                  {plan.eu_data_gb}
                </span>
                <span className={`text-xs font-bold ${isPopular ? "text-white/30" : "text-[#ccc]"}`}>GB</span>
              </div>
              <span className="text-[11px] font-bold text-[#C9973A]">
                🇪🇺 Roaming UE
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <span className={`text-4xl font-black leading-none ${isPopular ? "text-white" : "text-[#1B2F4E]"}`}>
            {plan.data_gb}
          </span>
          <span className={`text-lg font-bold ml-1 ${isPopular ? "text-white/40" : "text-[#bbb]"}`}>GB</span>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mt-0.5 ${isPopular ? "text-white/40" : "text-[#aaa]"}`}>
            4G / 5G
          </p>
        </div>
      )}

      {/* Features */}
      <ul className="space-y-1.5 mb-6 flex-1">
        {keyFeatures.map((f, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm ${isPopular ? "text-white/70" : "text-[#555]"}`}>
            <Check size={13} weight="bold" className="text-[#059669] mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {/* Precio + CTA */}
      <div className="mt-auto">
        <p className={`text-2xl font-black ${isPopular ? "text-white" : "text-[#1B2F4E]"}`}>
          {formatUSD(plan.price_usd)}
        </p>
        <p className={`text-xs mb-4 ${isPopular ? "text-white/35" : "text-[#bbb]"}`}>
          {t("perMonth")}
        </p>

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
          className={`flex items-center justify-center gap-1.5 w-full py-3 rounded-xl font-bold text-sm active:scale-[0.97] ${
            isPopular
              ? "bg-[#C9973A] text-[#1B2F4E] hover:bg-[#E8C56A] shadow-[0_4px_16px_-4px_rgba(201,151,58,0.4)]"
              : "border-2 border-[#1B2F4E] text-[#1B2F4E] hover:bg-[#1B2F4E] hover:text-white"
          }`}
          style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease, color 200ms ease" }}
        >
          {plan.type === "local" ? `${t("buyPlan")} ${plan.name}` : t("buyPlan")}
          <ArrowRight size={13} weight="bold" />
        </a>
      </div>
    </motion.div>
  );
}

// ── Grid estático (≤ MAX_VISIBLE planes) ─────────────────────────────────────

function PlansGrid({ plans }: { plans: Plan[] }) {
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

// ── Carrusel (> MAX_VISIBLE planes) ──────────────────────────────────────────

function PlansCarousel({ plans }: { plans: Plan[] }) {
  const [current, setCurrent] = useState(0);
  // Mobile: 1 plan visible + pico del siguiente (85% de ancho)
  // Desktop: 3 planes visibles (33%) o 5 (20%)
  const maxIndex = Math.max(0, plans.length - 1);

  return (
    <div className="relative">
      {/* overflow-hidden en desktop, visible en mobile para el pico lateral */}
      <div className="overflow-hidden sm:overflow-hidden">
        <motion.div
          animate={{ x: `calc(-${current} * (85% + 12px))` }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="flex gap-3 sm:gap-4"
        >
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              // Mobile: 85% de ancho → 1 plan + pico del siguiente
              // sm: 3 columnas, lg: 5 columnas
              className="flex-none w-[85%] sm:w-[calc(33.33%-11px)] lg:w-[calc(20%-10px)]"
            >
              <PlanCard plan={plan} index={i} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots — visibles en mobile */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {plans.map((p, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); analytics.swipePlanCarousel("dot", p.id) }}
            className={`rounded-full transition-all duration-200 ${
              i === current ? "w-6 h-2 bg-[#C9973A]" : "w-2 h-2 bg-[#1B2F4E]/15"
            }`}
          />
        ))}
      </div>

      {/* Flechas — solo desktop */}
      <div className="hidden sm:flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => { setCurrent((c) => Math.max(0, c - 1)); analytics.swipePlanCarousel("prev") }}
          disabled={current === 0}
          className="w-10 h-10 rounded-full border-2 border-[#1B2F4E]/12 flex items-center justify-center hover:bg-[#1B2F4E] hover:text-white hover:border-[#1B2F4E] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <button
          onClick={() => { setCurrent((c) => Math.min(maxIndex, c + 1)); analytics.swipePlanCarousel("next") }}
          disabled={current === maxIndex}
          className="w-10 h-10 rounded-full border-2 border-[#1B2F4E]/12 flex items-center justify-center hover:bg-[#1B2F4E] hover:text-white hover:border-[#1B2F4E] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}

// ── Plans section para un tab ─────────────────────────────────────────────────

function TabContent({ plans }: { plans: Plan[] }) {
  const sorted       = sortByPosition(plans);
  const sortedMobile = sortMobileFirst(plans);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  if (sorted.length === 0) return null;

  // Mobile: siempre carrusel con popular primero
  // Desktop: grid ≤5 planes, carrusel >5 planes
  if (isMobile) return <PlansCarousel plans={sortedMobile} />;
  return sorted.length > MAX_VISIBLE
    ? <PlansCarousel plans={sortedMobile} />
    : <PlansGrid plans={sorted} />;
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Plans({ plans }: PlansProps) {
  const t = useTranslations("plans");

  const localPlans  = plans.filter((p) => p.type === "local");
  const dataPlans   = plans.filter((p) => p.type === "dataonly");
  const hasLocal    = localPlans.length > 0;
  const hasData     = dataPlans.length > 0;

  const [tab, setTab] = useState<Tab>(hasLocal ? "local" : "dataonly");

  // Track "view plans" event on component mount
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

  return (
    <section id="planes" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-[#1B2F4E] tracking-tight mb-2">
            {t("title")}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <p className="text-[#555555] text-base">{t("subtitle")}</p>
            <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] border border-emerald-200 rounded-full px-3 py-1">
              <Users size={13} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">{t("socialProof")}</span>
            </div>
          </div>
          {/* Mini CTA → FAQ cuántos GB necesito */}
          <a
            href="#faq-needs"
            onClick={() => analytics.gbGuideOpened()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#555] bg-amber-50 border border-amber-200 rounded-full px-4 py-2 hover:bg-amber-100 hover:text-[#1B2F4E] transition-colors duration-200"
          >
            <span>💡</span>
            <span>¿Cuántos GB necesito para mi viaje?</span>
            <span className="text-[#059669] font-bold">Ver guía →</span>
          </a>
        </motion.div>

        {/* Trust strip — escaneable, mobile-first */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { icon: "qr-email.svg", label: "QR por email" },
            { icon: "viaje.svg", label: "Activás al llegar" },
            { icon: "whatsapp-soporte.svg", label: "Conservás tu WhatsApp" },
            { icon: "pago-seguro.svg", label: "Pago seguro con Stripe" },
            { icon: "soporte.svg", label: "Soporte por WhatsApp" },
            { icon: "activacion-rapida.svg", label: "Activación en minutos" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-2 text-xs font-semibold text-[#555] bg-[#F5F5F5] border border-black/[0.07] px-3 py-1.5 rounded-full whitespace-nowrap">
              <img src={`/icons/${item.icon}`} alt="" className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </span>
          ))}
        </div>

        {/* Tab switcher — solo si hay ambos tipos */}
        {hasLocal && hasData && (
          <div className="mb-8 inline-flex rounded-2xl bg-[#F0F0F0] p-1.5 gap-1">
            {([
              { key: "local"   as Tab, emoji: "", label: t("tabLocal"),  sub: t("tabLocalSub") },
              { key: "dataonly"as Tab, emoji: "", label: t("tabData"),   sub: t("tabDataSub")  },
            ]).map(({ key, emoji, label, sub }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${
                  tab === key ? "text-[#1B2F4E]" : "text-[#888] hover:text-[#555]"
                }`}
              >
                {tab === key && (
                  <motion.div
                    layoutId="plans-tab-bg"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm"
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                  />
                )}
                <span className="relative">{emoji}</span>
                <span className="relative">{label}</span>
                <span className={`relative text-[11px] font-medium hidden sm:block ${tab === key ? "text-[#999]" : "text-[#ccc]"}`}>
                  {sub}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Contenido del tab activo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            <TabContent plans={tab === "local" ? localPlans : dataPlans} />
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
