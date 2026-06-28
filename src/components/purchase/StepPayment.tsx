"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, Lock, ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Button from "@/components/ui/Button";
import { Plan, OrderFormData } from "@/types";
import { formatUSD } from "@/lib/utils";
import { analytics, getGA4ClientId } from "@/lib/analytics";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// ── Card brand logos (inline SVG) ───────────────────────────────────────────

function VisaLogo() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" aria-label="Visa">
      <rect width="44" height="28" rx="5" fill="#1A1F71"/>
      <text x="22" y="19" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-0.3">VISA</text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" aria-label="Mastercard">
      <rect width="44" height="28" rx="5" fill="#252525"/>
      <circle cx="17" cy="14" r="9" fill="#EB001B"/>
      <circle cx="27" cy="14" r="9" fill="#F79E1B"/>
      <path d="M22 6.7a9 9 0 0 1 0 14.6A9 9 0 0 1 22 6.7z" fill="#FF5F00"/>
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg width="44" height="28" viewBox="0 0 44 28" fill="none" aria-label="American Express">
      <rect width="44" height="28" rx="5" fill="#2E77BC"/>
      <text x="22" y="19" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="0.3">AMEX</text>
    </svg>
  );
}

function StripeBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8F8F8] border border-black/8 px-3 py-1.5">
      <ShieldCheck size={13} weight="fill" className="text-[#635BFF]" />
      <span className="text-[11px] font-semibold text-[#555]">Procesado por</span>
      <svg width="38" height="14" viewBox="0 0 60 25" fill="none" aria-label="Stripe">
        <path d="M59.6 13.1c0-4.8-2.3-8.6-6.7-8.6-4.4 0-7.1 3.8-7.1 8.6 0 5.7 3.2 8.5 7.7 8.5 2.2 0 3.9-.5 5.2-1.2v-3.7c-1.3.6-2.7 1-4.6 1-1.8 0-3.4-.6-3.6-2.8h9.1v-1.8zm-9.2-1.8c0-2.1 1.3-3 2.5-3 1.2 0 2.4.9 2.4 3h-4.9zM40.5 4.5c-1.8 0-3 .8-3.6 1.4l-.2-1.1h-4v21.1l4.5-1v-5.1c.7.5 1.7.9 3 .9 3 0 5.8-2.4 5.8-7.7-.1-4.9-2.8-7.5-5.5-7.5zm-1 11.4c-1 0-1.6-.4-2-1V9.7c.5-.5 1.1-.9 2-.9 1.5 0 2.5 1.7 2.5 3.6 0 1.9-1 3.5-2.5 3.5zM33 3.3l-4.6 1v3.8l4.6-1V3.3zM28.5 4.8h4.6v16h-4.6V4.8zM23.3 6.1l-.3-1.3h-4v16h4.5v-10.8c1.1-1.4 2.9-1.1 3.5-1V4.8c-.6-.1-2.8-.3-3.7 1.3zM14.2 1.4L9.8 2.3l-.1 14.4c0 2.7 2 4.6 4.7 4.6 1.5 0 2.6-.3 3.2-.6V17c-.6.2-3.4 1.1-3.4-1.6V8.7h3.4V4.8h-3.4L14.2 1.4zM3.9 9.2C3.9 8.5 4.5 8 5.7 8c1.6 0 3.6.5 5.2 1.3V5c-1.7-.7-3.4-1-5.2-1C2.1 4 0 6.1 0 9.4c0 5.1 7 4.3 7 6.5 0 .9-.8 1.2-1.9 1.2-1.6 0-3.7-.7-5.4-1.6V19c1.8.8 3.7 1.2 5.4 1.2 4.1 0 6.9-2 6.9-5.5-.1-5.5-7.1-4.5-7.1-5.5z" fill="#635BFF"/>
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

interface StepPaymentProps {
  plan: Plan;
  formData: OrderFormData;
  onBack: () => void;
}

type PaymentMethod = "stripe" | "mercadopago";

export default function StepPayment({ plan, formData, onBack }: StepPaymentProps) {
  const t = useTranslations("purchase");
  const locale = useLocale();
  const [method, setMethod] = useState<PaymentMethod>("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step viewed once on mount
  useEffect(() => {
    analytics.checkoutStepViewed(3, "payment", plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Payment method changed — skip initial mount
  const isFirstMethodRender = useRef(true);
  useEffect(() => {
    if (isFirstMethodRender.current) {
      isFirstMethodRender.current = false;
      return;
    }
    analytics.paymentMethodSelected(method, plan);
  }, [method, plan]);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    // Track payment initiation + pass GA4 client_id for server-side attribution
    analytics.checkoutPaymentInitiated(plan, method, formData.customer_country);
    const ga_client_id = getGA4ClientId();

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: plan.id,
          payment_method: method,
          quantity: formData.quantity ?? 1,
          customer: {
            name: formData.customer_name,
            lastname: formData.customer_lastname,
            email: formData.customer_email,
            country: formData.customer_country,
          },
          activation_date: formData.activation_date,
          locale,
          ga_client_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Error al procesar el pago");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Payment options */}
      <div className="lg:col-span-2 space-y-5">

        {/* Método de pago */}
        <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
          <h3 className="font-bold text-[#111111] mb-4">{t("payment.method")}</h3>
          <div className="space-y-3">

            {/* Stripe */}
            <motion.button
              onClick={() => setMethod("stripe")}
              whileTap={{ scale: 0.99 }}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                method === "stripe"
                  ? "border-[#C9973A] bg-[#C9973A]/3"
                  : "border-[#111111]/8 hover:border-[#111111]/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    method === "stripe" ? "border-[#C9973A]" : "border-[#ccc]"
                  }`}>
                    {method === "stripe" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C9973A]" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#111]">{t("payment.card")}</p>
                    <p className="text-xs text-[#999]">{t("payment.cardSub")}</p>
                  </div>
                </div>
                <CreditCard size={22} className="text-[#999]" />
              </div>

              {/* Card logos — solo visible cuando está seleccionado */}
              {method === "stripe" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="flex items-center gap-2 mt-3 pt-3 border-t border-[#111111]/6"
                >
                  <VisaLogo />
                  <MastercardLogo />
                  <AmexLogo />
                </motion.div>
              )}
            </motion.button>

            {/* MercadoPago — oculto temporalmente, próximamente */}
          </div>
        </div>

        {/* Trust badges — P1 CRO */}
        <div className="rounded-2xl bg-[#F8F8F8] border border-black/[0.06] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[#555]">
              <Lock size={14} weight="fill" className="text-emerald-500" />
              <span className="font-semibold">{t("payment.secure")}</span>
            </div>
            <StripeBadge />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Info Stripe */}
        <p className="text-xs text-[#999] text-center">
          El pago se procesa de forma segura con Stripe. Podés pagar con tarjeta, Apple Pay o Link si están disponibles.
        </p>

        {/* Checkbox de T&C */}
        <div className="rounded-xl bg-[#F8F8F8] border border-black/[0.06] p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-2 border-[#ddd] bg-white checked:bg-[#C9973A] checked:border-[#C9973A] cursor-pointer accent-[#C9973A]"
            />
            <span className="text-xs text-[#555] leading-relaxed flex-1">
              {locale === "pt" ? (
                <>
                  Li e aceito os{" "}
                  <a href={`/${locale}/termos`} target="_blank" rel="noopener noreferrer" className="text-[#C9973A] font-semibold underline hover:no-underline">
                    Termos e Condições
                  </a>
                  {" "}e a{" "}
                  <a href={`/${locale}/privacidade`} target="_blank" rel="noopener noreferrer" className="text-[#C9973A] font-semibold underline hover:no-underline">
                    Política de Privacidade
                  </a>
                  . Entendo que, ao ativar o eSIM, o serviço começa a ser prestado imediatamente e aceito expressamente renunciar ao meu direito de arrependimento de 14 dias a partir do momento da ativação.
                </>
              ) : (
                <>
                  He leído y acepto los{" "}
                  <a href={`/${locale}/terminos`} target="_blank" rel="noopener noreferrer" className="text-[#C9973A] font-semibold underline hover:no-underline">
                    Términos y Condiciones
                  </a>
                  {" "}y la{" "}
                  <a href={`/${locale}/privacidad`} target="_blank" rel="noopener noreferrer" className="text-[#C9973A] font-semibold underline hover:no-underline">
                    Política de Privacidad
                  </a>
                  . Entiendo que, al activar la eSIM, el servicio comienza a prestarse de forma inmediata y acepto expresamente renunciar a mi derecho de desistimiento de 14 días a partir del momento de la activación.
                </>
              )}
            </span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-[#555] hover:text-[#111] px-4 py-3 rounded-xl hover:bg-[#111111]/5 active:scale-[0.97] transition-all"
            style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
          >
            <ArrowLeft size={15} weight="bold" />
            {t("form.back")}
          </button>

          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handlePay}
            disabled={loading || !acceptedTerms}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                {t("payment.processing")}
              </span>
            ) : (
              <>
                Pagar {formatUSD(plan.price_usd * (formData.quantity ?? 1))}
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resumen final */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl bg-white border border-black/[0.07] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-4">
            {t("summary")}
          </p>

          <div className="space-y-2 border-b border-[#111111]/8 pb-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">
                {plan.name}{(formData.quantity ?? 1) > 1 ? ` × ${formData.quantity}` : ""}
              </span>
              <span className="font-semibold text-[#111]">
                {formatUSD(plan.price_usd * (formData.quantity ?? 1))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Email</span>
              <span className="text-[#111] text-xs truncate max-w-[140px]">{formData.customer_email}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-1">
            <span className="font-semibold text-[#555]">Total</span>
            <span className="text-2xl font-black text-[#111111]">
              {formatUSD(plan.price_usd * (formData.quantity ?? 1))}
            </span>
          </div>
          <p className="text-xs text-[#999] text-right">USD · pago único · sin renovación automática</p>

          {/* Mini trust badge en summary */}
          <div className="mt-4 pt-3 border-t border-[#111111]/6 flex items-center gap-1.5 justify-center">
            <Lock size={11} weight="fill" className="text-[#999]" />
            <span className="text-[11px] text-[#aaa]">{t("payment.noStore")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
