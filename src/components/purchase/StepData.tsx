"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, WarningCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import PurchaseFAQ from "@/components/purchase/PurchaseFAQ";
import { Plan, OrderFormData } from "@/types";
import { formatUSD } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

const COUNTRIES = ["AR", "UY", "CL", "BR", "MX", "CO", "PE", "VE", "EC", "PY", "BO", "OTHER"] as const;

const schema = z.object({
  customer_name: z.string().min(2, "Ingresá tu nombre"),
  customer_lastname: z.string().min(2, "Ingresá tu apellido"),
  customer_email: z.string().email("Email inválido"),
  customer_country: z.string().min(1, "Seleccioná tu país"),
  // activation_type controla el radio; activation_date guarda la fecha elegida
  activation_type: z.enum(["now", "schedule"]),
  activation_date: z.string().optional(),
  device_confirmed: z.boolean().refine((v) => v === true, {
    message: "Debés confirmar la compatibilidad de tu dispositivo",
  }),
});

type FormValues = z.infer<typeof schema>;

interface StepDataProps {
  plan: Plan;
  initialData: Partial<OrderFormData>;
  onNext: (data: Partial<OrderFormData>) => void;
  onBack: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
      <WarningCircle size={13} weight="fill" />
      {message}
    </p>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#111111] mb-1.5">
      {children}
      {required && <span className="text-[#E60000] ml-0.5">*</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#111111]/12 bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#bbb] focus:outline-none focus:border-[#E60000] focus:ring-2 focus:ring-[#E60000]/10 transition-all duration-150";

export default function StepData({ plan, initialData, onNext, onBack }: StepDataProps) {
  const t = useTranslations("purchase");
  const tCountries = useTranslations("purchase.countries");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: initialData.customer_name ?? "",
      customer_lastname: initialData.customer_lastname ?? "",
      customer_email: initialData.customer_email ?? "",
      customer_country: initialData.customer_country ?? "",
      activation_type: "now",
      activation_date: initialData.activation_date ?? "",
      device_confirmed: initialData.device_confirmed ?? false,
    },
  });

  // Fire checkout_step_viewed once when this step mounts
  useEffect(() => {
    analytics.checkoutStepViewed(2, "data", plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local SIM plans allow scheduling activation date; data-only plans activate on demand
  const isLocal = plan.type === "local";

  const onSubmit = (data: FormValues) => {
    // Combina activation_type + activation_date en un solo campo para el pedido
    const finalActivationDate =
      data.activation_type === "schedule" ? (data.activation_date ?? "") : "";
    analytics.checkoutStepCompleted(2, "data", plan);
    onNext({ ...data, activation_date: finalActivationDate });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:col-span-2 space-y-4"
      >
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>{t("form.name")}</Label>
            <input
              {...register("customer_name")}
              className={inputClass}
              placeholder="Juan"
              autoComplete="given-name"
            />
            <FieldError message={errors.customer_name?.message} />
          </div>
          <div>
            <Label required>{t("form.lastname")}</Label>
            <input
              {...register("customer_lastname")}
              className={inputClass}
              placeholder="García"
              autoComplete="family-name"
            />
            <FieldError message={errors.customer_lastname?.message} />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label required>{t("form.email")}</Label>
          <input
            {...register("customer_email")}
            type="email"
            className={inputClass}
            placeholder="juan@ejemplo.com"
            autoComplete="email"
          />
          <FieldError message={errors.customer_email?.message} />
          <p className="text-xs text-[#999] mt-1.5">
            A este email te enviamos el QR de activación.
          </p>
        </div>

        {/* País */}
        <div>
          <Label required>{t("form.country")}</Label>
          <select {...register("customer_country")} className={inputClass}>
            <option value="">Seleccioná tu país</option>
            {COUNTRIES.map((code) => (
              <option key={code} value={code}>
                {tCountries(code)}
              </option>
            ))}
          </select>
          <FieldError message={errors.customer_country?.message} />
        </div>

        {/* Fecha de activación — solo local */}
        {isLocal && (
          <div className="rounded-2xl bg-[#EBF6FC] border border-[#6EC1E4]/30 p-5">
            <p className="text-sm font-bold text-[#111111] mb-0.5">{t("form.activationDate")}</p>
            <p className="text-xs text-[#777] mb-3">{t("form.activationHint")}</p>
            <div className="space-y-2.5">
              {/* Opción por defecto — destacada visualmente */}
              <label className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-3 transition-all ${
                watch("activation_type") === "now" ? "border-[#6EC1E4] bg-white" : "border-transparent"
              }`}>
                <input
                  type="radio"
                  {...register("activation_type")}
                  value="now"
                  className="accent-[#E60000] w-4 h-4 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-[#111]">{t("form.activationToday")}</p>
                  <p className="text-xs text-[#777] mt-0.5">{t("form.activationTodayHint")}</p>
                </div>
              </label>
              {/* Opción programar */}
              <label className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-3 transition-all ${
                watch("activation_type") === "schedule" ? "border-[#6EC1E4] bg-white" : "border-transparent"
              }`}>
                <input
                  type="radio"
                  {...register("activation_type")}
                  value="schedule"
                  className="accent-[#E60000] w-4 h-4 mt-0.5 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#111]">{t("form.activationSchedule")}</p>
                  <p className="text-xs text-[#777] mt-0.5">{t("form.activationScheduleHint")}</p>
                  {watch("activation_type") === "schedule" && (
                    <input
                      type="date"
                      {...register("activation_date")}
                      className={`${inputClass} mt-3`}
                      min={new Date().toISOString().split("T")[0]}
                      max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                    />
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Device confirmation */}
        <div className={`rounded-2xl border p-5 transition-colors duration-150 ${
          errors.device_confirmed
            ? "bg-red-50 border-red-300"
            : "bg-[#F8F8F8] border-[#111111]/6"
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("device_confirmed")}
              className="accent-[#E60000] w-4 h-4 mt-0.5 shrink-0"
            />
            <span className="text-sm text-[#555] leading-snug">
              {t("form.deviceConfirm")}
            </span>
          </label>
          <FieldError message={errors.device_confirmed?.message} />
        </div>

        {/* FAQ inline — P3 CRO */}
        <PurchaseFAQ />

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

          <Button type="submit" variant="primary" size="lg" className="flex-1">
            {t("form.next")}
            <ArrowRight size={16} weight="bold" />
          </Button>
        </div>
      </form>

      {/* Resumen del plan */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl bg-white border border-black/[0.07] p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#999] mb-4">
            {t("summary")}
          </p>
          <div className="border-b border-[#111111]/8 pb-4 mb-4">
            <p className="font-black text-lg text-[#111111]">{plan.name}</p>
            <p className="text-sm text-[#777]">{plan.data_gb} GB · {plan.duration_days} días</p>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="font-semibold text-[#555]">Total</span>
            <span className="text-2xl font-black text-[#111111]">{formatUSD(plan.price_usd)}</span>
          </div>
          <p className="text-xs text-[#999] text-right">USD · pago único</p>
        </div>
      </div>
    </div>
  );
}
