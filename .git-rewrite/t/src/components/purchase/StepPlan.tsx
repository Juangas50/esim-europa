"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, ArrowRight } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Plan } from "@/types";
import { formatUSD } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

function sortPlans(plans: Plan[]) {
  return [...plans].sort((a, b) => {
    if (a.position != null && b.position != null) return a.position - b.position;
    if (a.position != null) return -1;
    if (b.position != null) return 1;
    return a.price_usd - b.price_usd;
  });
}

type ActiveTab = "local" | "dataonly";

interface StepPlanProps {
  plans: Plan[];
  initialPlanId?: string;
  onNext: (plan: Plan) => void;
}

export default function StepPlan({ plans, initialPlanId, onNext }: StepPlanProps) {
  const t = useTranslations("plans");

  const localPlans = sortPlans(plans.filter((p) => p.type === "local"));
  const dataPlans  = sortPlans(plans.filter((p) => p.type === "dataonly"));

  const hasLocal = localPlans.length > 0;
  const hasData = dataPlans.length > 0;

  // Determine initial tab from initialPlanId
  const initialPlan = plans.find((p) => p.id === initialPlanId);
  const initialTab: ActiveTab =
    initialPlan?.type === "dataonly"
      ? "dataonly"
      : hasLocal
      ? "local"
      : "dataonly";

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  const tabPlans = activeTab === "local" ? localPlans : dataPlans;

  const [selected, setSelected] = useState<string>(
    initialPlanId ??
    tabPlans.find((p) => p.is_popular)?.id ??
    tabPlans[0]?.id ??
    ""
  );

  // When tab changes, reset selected to popular or first in new tab
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    const newPlans = tab === "local" ? localPlans : dataPlans;
    const newDefault =
      newPlans.find((p) => p.is_popular)?.id ?? newPlans[0]?.id ?? "";
    setSelected(newDefault);
  };

  const selectedPlan =
    plans.find((p) => p.id === selected) ??
    tabPlans[0];

  // Fire checkout_step_viewed once on mount with the pre-selected plan
  useEffect(() => {
    const plan = plans.find((p) => p.id === selected) ?? plans[0];
    if (plan) analytics.checkoutStepViewed(1, "plan", plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: tab + plan list */}
      <div className="lg:col-span-2 space-y-4">

        {/* Tab switcher — only if both types exist */}
        {hasLocal && hasData && (
          <div className="inline-flex rounded-xl bg-[#F0F0F0] p-1 gap-1">
            {(["local", "dataonly"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${
                  activeTab === tab ? "text-[#111111]" : "text-[#888] hover:text-[#555]"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="checkout-tab-bg"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm"
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <span>{tab === "local" ? "🇪🇸" : "✈️"}</span>
                  <span>{tab === "local" ? t("tabLocal") : t("tabData")}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Plan cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="space-y-3"
          >
            {tabPlans.map((plan) => {
              const isSelected = plan.id === selected;
              return (
                <motion.button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15, ease: EASE_OUT }}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                    isSelected
                      ? "border-[#E60000] bg-white shadow-[0_4px_24px_-8px_rgba(230,0,0,0.2)]"
                      : "border-transparent bg-white hover:border-[#111111]/12"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {plan.size && (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                            isSelected ? "bg-[#E60000]/10 text-[#E60000]" : "bg-[#F0F0F0] text-[#555]"
                          }`}>
                            {plan.size}
                          </span>
                        )}
                        <span className="font-black text-base text-[#111111]">{plan.name}</span>
                        {plan.is_popular && (
                          <Badge variant="red">
                            <Star size={9} weight="fill" />
                            {t("popular")}
                          </Badge>
                        )}
                        <Badge variant="outline">{t(`${plan.type}.badge`)}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <span className="font-bold text-[#111]">{plan.data_gb} GB</span>
                        <span className="text-[#999]">·</span>
                        <span className="text-[#555]">{plan.duration_days} días</span>
                        {plan.type === "dataonly" && (
                          <>
                            <span className="text-[#999]">·</span>
                            <span className="text-[#555]">{plan.countries_count}+ países</span>
                          </>
                        )}
                        {plan.type === "local" && (
                          <>
                            <span className="text-[#999]">·</span>
                            <span className="text-[#555]">Número 🇪🇸 · Llamadas · SMS</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-[#111111]">{formatUSD(plan.price_usd)}</p>
                      <p className="text-xs text-[#999]">{t("perMonth")}</p>
                    </div>
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={`mt-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto transition-colors duration-200 ${
                      isSelected ? "border-[#E60000] bg-[#E60000]" : "border-[#ddd]"
                    }`}
                  >
                    {isSelected && <Check size={12} weight="bold" className="text-white" />}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: summary + CTA */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl bg-white border border-black/[0.07] p-6">
          <h3 className="font-bold text-sm text-[#999] uppercase tracking-wider mb-4">
            {t("summary")}
          </h3>

          <div className="border-b border-[#111111]/8 pb-4 mb-4">
            <p className="font-black text-lg text-[#111111] mb-0.5">{selectedPlan?.name}</p>
            <p className="text-sm text-[#777]">{selectedPlan ? t(`${selectedPlan.type}.badge`) : ""}</p>
          </div>

          <div className="space-y-2 mb-5">
            {selectedPlan?.features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#555]">
                <Check size={13} weight="bold" className="text-[#E60000] shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <div className="border-t border-[#111111]/8 pt-4 mb-5">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-[#555]">Total</span>
              <span className="text-2xl font-black text-[#111111]">
                {selectedPlan ? formatUSD(selectedPlan.price_usd) : "—"}
              </span>
            </div>
            <p className="text-xs text-[#999] text-right">USD · pago único</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              if (!selectedPlan) return;
              analytics.checkoutStepCompleted(1, "plan", selectedPlan);
              onNext(selectedPlan);
            }}
            disabled={!selectedPlan}
          >
            Continuar
            <ArrowRight size={16} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}
