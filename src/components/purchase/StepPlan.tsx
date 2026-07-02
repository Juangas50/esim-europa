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
  onNext: (plan: Plan, quantity: number) => void;
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

  const [quantity, setQuantity] = useState(1);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: tab + plan list */}
      <div className="lg:col-span-2 space-y-6">

        {/* Tab switcher — only if both types exist */}
        {hasLocal && hasData && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="inline-flex rounded-2xl bg-[var(--color-warm-white)] p-2 gap-1 border border-[var(--color-border)]"
          >
            {(["local", "dataonly"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-colors duration-200 ${
                  activeTab === tab ? "text-[var(--color-navy)]" : "text-[var(--color-ink-2)] hover:text-[var(--color-navy)]"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="checkout-tab-bg"
                    className="absolute inset-0 rounded-xl bg-white border border-[var(--color-border)] shadow-sm"
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <span>{tab === "local" ? t("tabLocal") : t("tabData")}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Plan cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="space-y-4"
          >
            {tabPlans.map((plan, idx) => {
              const isSelected = plan.id === selected;
              return (
                <motion.button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className={`w-full text-left rounded-2xl border-2 p-6 transition-all duration-200 ${
                    isSelected
                      ? "border-[var(--color-gold)] bg-white shadow-md"
                      : "border-[var(--color-border)] bg-white hover:shadow-sm hover:border-[var(--color-gold)]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {plan.size && (
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs ${
                            isSelected ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]" : "bg-[var(--color-warm-white)] text-[var(--color-ink)]"
                          }`}>
                            {plan.size}
                          </span>
                        )}
                        <span className="font-black text-lg text-[var(--color-navy)]">{plan.name}</span>
                        {plan.is_popular && (
                          <Badge variant="red">
                            <Star size={10} weight="fill" />
                            {t("popular")}
                          </Badge>
                        )}
                        <Badge variant="outline">{t(`${plan.type}.badge`)}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="font-bold text-[var(--color-navy)]">{plan.data_gb} GB</span>
                        <span className="text-[var(--color-ink-2)]">·</span>
                        <span className="text-[var(--color-ink-2)]">{plan.duration_days} días</span>
                        {plan.type === "dataonly" && (
                          <>
                            <span className="text-[var(--color-ink-2)]">·</span>
                            <span className="text-[var(--color-ink-2)]">{plan.countries_count}+ países</span>
                          </>
                        )}
                        {plan.type === "local" && (
                          <>
                            <span className="text-[var(--color-ink-2)]">·</span>
                            <span className="text-[var(--color-ink-2)]">Número español · Llamadas · SMS</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black text-[var(--color-navy)]">{formatUSD(plan.price_usd)}</p>
                      <p className="text-xs text-[var(--color-ink-2)] mt-1">{t("perMonth")}</p>
                    </div>
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={`mt-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto transition-colors duration-200 ${
                      isSelected ? "border-[var(--color-gold)] bg-[var(--color-gold)]" : "border-[var(--color-border)]"
                    }`}
                  >
                    {isSelected && <Check size={12} weight="bold" className="text-white" />}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Cantidad */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: EASE_OUT }}
          className="bg-white rounded-2xl border border-[var(--color-border)] p-6"
        >
          <p className="font-bold text-sm text-[var(--color-navy)] mb-4">¿Cuántas eSIM necesitás?</p>
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <motion.button
                key={n}
                onClick={() => setQuantity(n)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-11 h-11 rounded-lg font-black text-sm transition-all duration-150 ${
                  quantity === n
                    ? "bg-[var(--color-gold)] text-white shadow-md"
                    : "bg-[var(--color-warm-white)] text-[var(--color-navy)] hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)]"
                }`}
              >
                {n}
              </motion.button>
            ))}
          </div>
          {quantity > 1 && (
            <p className="text-xs text-[var(--color-ink-2)] mt-4">
              Cada persona recibe su propio QR al email ingresado.
            </p>
          )}
        </motion.div>
      </div>

      {/* Right: summary + CTA */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="sticky top-6 rounded-2xl bg-white border border-[var(--color-border)] p-6 shadow-sm"
        >
          <h3 className="font-bold text-xs text-[var(--color-ink-2)] uppercase tracking-widest mb-6">
            {t("summary")}
          </h3>

          <div className="border-b border-[var(--color-border)] pb-6 mb-6">
            <p className="font-black text-xl text-[var(--color-navy)] mb-1">{selectedPlan?.name}</p>
            <p className="text-sm text-[var(--color-ink-2)]">{selectedPlan ? t(`${selectedPlan.type}.badge`) : ""}</p>
          </div>

          <div className="space-y-2 mb-6">
            {selectedPlan?.features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                <Check size={14} weight="bold" className="text-[var(--color-gold)] shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] pt-6 mb-6">
            {quantity > 1 && (
              <div className="flex justify-between text-sm text-[var(--color-ink-2)] mb-2">
                <span>{quantity} × {selectedPlan ? formatUSD(selectedPlan.price_usd) : "—"}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-semibold text-[var(--color-ink)]">Total</span>
              <span className="text-4xl font-black text-[var(--color-navy)]">
                {selectedPlan ? formatUSD(selectedPlan.price_usd * quantity) : "—"}
              </span>
            </div>
            <p className="text-xs text-[var(--color-ink-2)] text-right">USD · pago único</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              if (!selectedPlan) return;
              analytics.checkoutStepCompleted(1, "plan", selectedPlan);
              onNext(selectedPlan, quantity);
            }}
            disabled={!selectedPlan}
          >
            Continuar
            <ArrowRight size={16} weight="bold" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
