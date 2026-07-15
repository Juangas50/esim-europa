"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import StepPlan from "./StepPlan";
import StepData from "./StepData";
import StepPayment from "./StepPayment";
import { Plan, OrderFormData } from "@/types";
import { analytics } from "@/lib/analytics";
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/analytics-ga4";
import { useMetaEvents } from "@/hooks/useMetaEvents";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface PurchaseFlowProps {
  plans: Plan[];
  initialPlanId?: string;
}

export default function PurchaseFlow({ plans, initialPlanId }: PurchaseFlowProps) {
  const t = useTranslations("purchase");

  // If the user clicked "Buy plan" on the landing, skip the plan-picker entirely
  const initialPlan = initialPlanId
    ? (plans.find((p) => p.id === initialPlanId) ?? null)
    : null;

  const [step, setStep] = useState<1 | 2 | 3>(initialPlan ? 2 : 1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(initialPlan);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState<Partial<OrderFormData>>({
    plan_id: initialPlanId,
    quantity: 1,
  });
  const { trackViewContent, trackInitiateCheckout } = useMetaEvents();

  // Fire checkoutStarted when a plan arrives pre-selected from the landing page
  useEffect(() => {
    if (initialPlan) {
      analytics.checkoutStarted(initialPlan);
      // Meta Pixel + CAPI — ViewContent (product) + InitiateCheckout
      trackViewContent({ id: initialPlan.id, name: initialPlan.name, price_usd: initialPlan.price_usd });
      trackInitiateCheckout({ id: initialPlan.id, name: initialPlan.name, price_usd: initialPlan.price_usd }, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    { id: 1 as const, label: t("steps.plan") },
    { id: 2 as const, label: t("steps.data") },
    { id: 3 as const, label: t("steps.payment") },
  ];

  const goToStep = (s: 1 | 2 | 3) => setStep(s);

  return (
    <div className="min-h-[100dvh] bg-[var(--color-warm-white)] pt-6 pb-16 px-4">
      <div className="max-w-[860px] mx-auto">

        {/* Header */}
        <div className="mb-12">
          <motion.a
            href="/"
            className="inline-flex items-center gap-2 mb-8"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)] flex items-center justify-center">
              <span className="text-white text-xs font-black">34</span>
            </div>
            <span className="font-bold text-[var(--color-navy)] text-sm tracking-tight">RUTA34</span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-navy)] tracking-tight mb-8">
              {t("title")}
            </h1>

            {/* Stepper */}
            <div className="flex items-center gap-0">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    {/* Círculo */}
                    <motion.div
                      animate={{
                        backgroundColor:
                          step > s.id || (s.id === 1 && initialPlan)
                            ? "var(--color-navy)"
                            : step === s.id
                            ? "var(--color-gold)"
                            : "#ffffff",
                        borderColor:
                          step > s.id || (s.id === 1 && initialPlan)
                            ? "var(--color-navy)"
                            : step === s.id
                            ? "var(--color-gold)"
                            : "var(--color-border)",
                      }}
                      transition={{ duration: 0.25 }}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0"
                    >
                      {step > s.id || (s.id === 1 && initialPlan) ? (
                        <CheckCircle size={20} weight="fill" className="text-white" />
                      ) : (
                        <span className={`text-sm font-black ${step === s.id ? "text-white" : "text-[var(--color-ink-2)]"}`}>
                          {s.id}
                        </span>
                      )}
                    </motion.div>
                    <span className={`text-sm font-semibold hidden sm:block ${step === s.id ? "text-[var(--color-navy)]" : "text-[var(--color-ink-2)]"}`}>
                      {s.label}
                    </span>
                  </div>
                  {/* Línea */}
                  {i < steps.length - 1 && (
                    <div className="flex-1 mx-4 h-px bg-[var(--color-border)]" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Contenido del step con animación */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            {step === 1 && (
              <StepPlan
                plans={plans}
                initialPlanId={initialPlanId}
                onNext={(plan, qty) => {
                  setSelectedPlan(plan);
                  setQuantity(qty);
                  setFormData((prev) => ({ ...prev, plan_id: plan.id, quantity: qty }));
                  analytics.checkoutStarted(plan);
                  // GA4: begin_checkout
                  trackBeginCheckout({
                    id: plan.id,
                    name: plan.name,
                    price: plan.price_usd,
                  });
                  // Meta Pixel + CAPI — ViewContent (product) + InitiateCheckout
                  trackViewContent({ id: plan.id, name: plan.name, price_usd: plan.price_usd });
                  trackInitiateCheckout({ id: plan.id, name: plan.name, price_usd: plan.price_usd }, qty);
                  goToStep(2);
                }}
              />
            )}
            {step === 2 && selectedPlan && (
              <StepData
                plan={selectedPlan}
                initialData={formData}
                onNext={(data) => {
                  setFormData((prev) => ({ ...prev, ...data }));
                  goToStep(3);
                }}
                onBack={() => goToStep(1)}
              />
            )}
            {step === 3 && selectedPlan && (
              <StepPayment
                plan={selectedPlan}
                formData={formData as OrderFormData}
                onBack={() => goToStep(2)}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
