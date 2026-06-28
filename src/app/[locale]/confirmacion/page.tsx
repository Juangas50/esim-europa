"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import { Suspense } from "react";
import { EASE_OUT, fadeUp, stagger } from "@/lib/motion";
import { analytics } from "@/lib/analytics";

function ConfirmacionContent() {
  const t = useTranslations("confirmation");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("ref") ?? "—";
  const planId = searchParams.get("plan") ?? "";

  // Fire once — GA4 purchase confirmation page view
  useEffect(() => {
    if (orderRef !== "—") {
      const qty = parseInt(searchParams.get("qty") ?? "1", 10) || 1;
      analytics.purchaseConfirmedPageViewed(orderRef, planId);
      analytics.confirmationViewed(orderRef, qty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    t("step1"),
    t("step2"),
    t("step3"),
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F8F8F8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[520px]">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          {/* Icono */}
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
              <CheckCircle size={40} weight="fill" className="text-emerald-500" />
            </div>
          </motion.div>

          {/* Título */}
          <motion.h1
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-black text-[#1B2F4E] tracking-tight mb-3"
          >
            {t("title")}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[#555555] leading-relaxed mb-6">
            {t("subtitle")}
          </motion.p>

          {/* Ref del pedido */}
          <motion.div
            variants={fadeUp}
            className="inline-flex flex-col items-center bg-white border border-black/[0.07] rounded-2xl px-8 py-4 mb-8"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#999] mb-1">
              {t("orderRef")}
            </p>
            <p className="text-lg font-black text-[#1B2F4E] font-mono">{orderRef}</p>
          </motion.div>

          {/* Próximos pasos */}
          <motion.div
            variants={fadeUp}
            className="bg-white border border-black/[0.07] rounded-2xl p-6 mb-6 text-left"
          >
            <h3 className="font-black text-[#1B2F4E] mb-4">{t("nextSteps")}</h3>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#C9973A] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#555555] leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* SLA — horario de atención */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-2 text-xs text-[#999] mb-6"
          >
            <Clock size={13} weight="fill" className="text-[#bbb] shrink-0" />
            <span>{t("sla")}</span>
          </motion.div>

          {/* WhatsApp */}
          <motion.a
            variants={fadeUp}
            href="https://wa.me/34600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3.5 rounded-xl bg-[#1B2F4E] text-white font-semibold text-sm mb-3 hover:bg-[#333] active:scale-[0.97] transition-all"
            style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 200ms ease" }}
          >
            {t("support")}
          </motion.a>

          <motion.a
            variants={fadeUp}
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#999] hover:text-[#1B2F4E] transition-colors"
          >
            {t("backHome")}
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9973A]/30 border-t-[#C9973A] rounded-full animate-spin" />
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
