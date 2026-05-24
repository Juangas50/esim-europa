"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, Lock, ArrowRight } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import Button from "@/components/ui/Button";
import { Plan, OrderFormData } from "@/types";
import { formatUSD } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

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

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: plan.id,
          payment_method: method,
          customer: {
            name: formData.customer_name,
            lastname: formData.customer_lastname,
            email: formData.customer_email,
            country: formData.customer_country,
          },
          activation_date: formData.activation_date,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Error al procesar el pago");

      // Redirigir al checkout de Stripe o MercadoPago
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
          <h3 className="font-bold text-[#111111] mb-4">Método de pago</h3>
          <div className="space-y-3">

            {/* Stripe */}
            <motion.button
              onClick={() => setMethod("stripe")}
              whileTap={{ scale: 0.99 }}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                method === "stripe"
                  ? "border-[#E60000] bg-[#E60000]/3"
                  : "border-[#111111]/8 hover:border-[#111111]/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    method === "stripe" ? "border-[#E60000]" : "border-[#ccc]"
                  }`}>
                    {method === "stripe" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E60000]" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#111]">Tarjeta de crédito / débito</p>
                    <p className="text-xs text-[#999]">Visa, Mastercard, American Express</p>
                  </div>
                </div>
                <CreditCard size={22} className="text-[#999]" />
              </div>
            </motion.button>

            {/* MercadoPago */}
            <motion.button
              onClick={() => setMethod("mercadopago")}
              whileTap={{ scale: 0.99 }}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                method === "mercadopago"
                  ? "border-[#E60000] bg-[#E60000]/3"
                  : "border-[#111111]/8 hover:border-[#111111]/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  method === "mercadopago" ? "border-[#E60000]" : "border-[#ccc]"
                }`}>
                  {method === "mercadopago" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E60000]" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#111]">MercadoPago</p>
                  <p className="text-xs text-[#999]">Ideal para Argentina, Chile, México y más</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Seguridad */}
        <div className="flex items-center gap-2 text-sm text-[#777]">
          <Lock size={14} className="text-[#999]" />
          <span>Pago 100% seguro. No almacenamos datos de tu tarjeta.</span>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

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
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Procesando...
              </span>
            ) : (
              <>
                {t("form.pay")} — {formatUSD(plan.price_usd)}
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
              <span className="text-[#555]">{plan.name}</span>
              <span className="font-semibold text-[#111]">{formatUSD(plan.price_usd)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">Email</span>
              <span className="text-[#111] text-xs truncate max-w-[140px]">{formData.customer_email}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-1">
            <span className="font-semibold text-[#555]">Total</span>
            <span className="text-2xl font-black text-[#111111]">{formatUSD(plan.price_usd)}</span>
          </div>
          <p className="text-xs text-[#999] text-right">USD · pago único · sin renovación</p>
        </div>
      </div>
    </div>
  );
}
