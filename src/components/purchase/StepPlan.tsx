"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Plan } from "@/types";
import { formatUSD } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface StepPlanProps {
  plans: Plan[];
  initialPlanId?: string;
  onNext: (plan: Plan) => void;
}

export default function StepPlan({ plans, initialPlanId, onNext }: StepPlanProps) {
  const t = useTranslations("plans");
  const [selected, setSelected] = useState<string>(
    initialPlanId ?? plans.find((p) => p.is_popular)?.id ?? plans[0]?.id ?? ""
  );

  const selectedPlan = plans.find((p) => p.id === selected) ?? plans[0];

  // Fire checkout_step_viewed once on mount with the pre-selected plan
  useEffect(() => {
    const plan = plans.find((p) => p.id === selected) ?? plans[0];
    if (plan) analytics.checkoutStepViewed(1, "plan", plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Plan cards */}
      <div className="lg:col-span-2 space-y-3">
        {plans.map((plan) => {
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
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-black text-base text-[#111111]">{plan.name}</span>
                    {plan.is_popular && (
                      <Badge variant="red">
                        <Star size={9} weight="fill" />
                        {t("popular")}
                      </Badge>
                    )}
                    <Badge variant="outline">{t(`${plan.type}.badge`)}</Badge>
                  </div>
                  <p className="text-sm text-[#777] mb-3">{t(`${plan.type}.desc`)}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-[#111]">{plan.data_gb} GB</span>
                    <span className="text-[#999]">·</span>
                    <span className="text-[#555]">{plan.duration_days} días</span>
                    <span className="text-[#999]">·</span>
                    <span className="text-[#555]">{plan.countries_count}+ países</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-[#111111]">{formatUSD(plan.price_usd)}</p>
                  <p className="text-xs text-[#999]">{t("perMonth")}</p>
                </div>
              </div>

              {/* Indicator */}
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
      </div>

      {/* Resumen + CTA */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl bg-white border border-black/[0.07] p-6">
          <h3 className="font-bold text-sm text-[#999] uppercase tracking-wider mb-4">
            {t("summary" as never) ?? "Resumen"}
          </h3>

          <div className="border-b border-[#111111]/8 pb-4 mb-4">
            <p className="font-black text-lg text-[#111111] mb-0.5">{selectedPlan.name}</p>
            <p className="text-sm text-[#777]">{t(`${selectedPlan.type}.badge`)}</p>
          </div>

          <div className="space-y-2 mb-5">
            {selectedPlan.features.slice(0, 4).map((f, i) => (
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
                {formatUSD(selectedPlan.price_usd)}
              </span>
            </div>
            <p className="text-xs text-[#999] text-right">USD · pago único</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              analytics.checkoutStepCompleted(1, "plan", selectedPlan);
              onNext(selectedPlan);
            }}
          >
            Continuar
            <ArrowRight size={16} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}
