"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, WarningCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { Plan, OrderFormData } from "@/types";
import { formatUSD } from "@/lib/utils";

const COUNTRIES = ["AR", "UY", "CL", "BR", "MX", "CO", "PE", "VE", "EC", "PY", "BO", "OTHER"] as const;

const schema = z
  .object({
    customer_name: z.string().min(2, "Ingresá tu nombre"),
    customer_lastname: z.string().min(2, "Ingresá tu apellido"),
    customer_email: z.string().email("Email inválido"),
    customer_email_confirm: z.string().email("Email inválido"),
    customer_country: z.string().min(1, "Seleccioná tu país"),
    activation_date: z.string().optional(),
    device_confirmed: z.boolean().refine((v) => v === true, {
      message: "Debés confirmar la compatibilidad de tu dispositivo",
    }),
  })
  .refine((d) => d.customer_email === d.customer_email_confirm, {
    message: "Los emails no coinciden",
    path: ["customer_email_confirm"],
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
      customer_email_confirm: initialData.customer_email ?? "",
      customer_country: initialData.customer_country ?? "",
      activation_date: initialData.activation_date ?? "",
      device_confirmed: initialData.device_confirmed ?? false,
    },
  });

  const isPrepago = plan.type === "prepago";

  const onSubmit = (data: FormValues) => {
    onNext(data);
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

        {/* Confirmar email */}
        <div>
          <Label required>{t("form.emailConfirm")}</Label>
          <input
            {...register("customer_email_confirm")}
            type="email"
            className={inputClass}
            placeholder="juan@ejemplo.com"
            autoComplete="email"
          />
          <FieldError message={errors.customer_email_confirm?.message} />
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

        {/* Fecha de activación — solo prepago */}
        {isPrepago && (
          <div className="rounded-2xl bg-[#EBF6FC] border border-[#6EC1E4]/30 p-5">
            <Label>{t("form.activationDate")}</Label>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  {...register("activation_date")}
                  value=""
                  defaultChecked
                  className="accent-[#E60000] w-4 h-4"
                />
                <span className="text-sm text-[#111]">{t("form.activationToday")}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  {...register("activation_date")}
                  value="schedule"
                  className="accent-[#E60000] w-4 h-4"
                />
                <span className="text-sm text-[#111]">{t("form.activationSchedule")}</span>
              </label>
              {watch("activation_date") === "schedule" && (
                <div className="mt-2 pl-7">
                  <input
                    type="date"
                    {...register("activation_date")}
                    className={inputClass}
                    min={new Date().toISOString().split("T")[0]}
                    max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Device confirmation */}
        <div className="rounded-2xl bg-[#F8F8F8] border border-[#111111]/6 p-5">
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
