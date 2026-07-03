"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { useRef } from "react";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// IP Geolocation mapping (ISO 3166-1 alpha-2 to our COUNTRIES format)
const ISO_TO_COUNTRY_CODE: Record<string, typeof COUNTRIES[number]> = {
  "AR": "AR", "UY": "UY", "CL": "CL", "BR": "BR", "MX": "MX", "CO": "CO",
  "PE": "PE", "VE": "VE", "EC": "EC", "PY": "PY", "BO": "BO",
};

const COUNTRIES = ["AR", "UY", "CL", "BR", "MX", "CO", "PE", "VE", "EC", "PY", "BO", "OTHER"] as const;

const isAdult = (dob: string) => {
  if (!dob) return false;
  const birth = new Date(dob);
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  return birth <= today;
};

const maxDobStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
};

const schema = z.object({
  customer_name: z.string().min(2, "Ingresá tu nombre"),
  customer_lastname: z.string().min(2, "Ingresá tu apellido"),
  customer_email: z.string().email("Email inválido"),
  confirm_email: z.string().email("Confirmá tu email"),
  customer_country: z.string().min(1, "Seleccioná tu país"),
  customer_passport: z.string().min(5, "Ingresá un número de pasaporte válido"),
  customer_dob: z.string().refine((d) => isAdult(d), {
    message: "Debes ser mayor de 18 años para contratar una eSIM",
  }),
  activation_type: z.enum(["now", "schedule"]),
  activation_date: z.string().optional(),
  device_confirmed: z.boolean().refine((v) => v === true, {
    message: "Confirmá que tu celular es compatible antes de continuar",
  }),
}).refine((d) => d.customer_email === d.confirm_email, {
  message: "Los emails no coinciden. Revisalos para que podamos enviarte los QR",
  path: ["confirm_email"],
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
    <p className="flex items-center gap-1.5 text-xs text-[#C1502F] mt-2.5">
      <WarningCircle size={16} weight="fill" className="flex-shrink-0" />
      {message}
    </p>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
      {children}
      {required && <span className="text-[var(--color-gold)] ml-0.5">*</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-navy)] placeholder:text-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all duration-150";

export default function StepData({ plan, initialData, onNext, onBack }: StepDataProps) {
  const t = useTranslations("purchase");
  const tCountries = useTranslations("purchase.countries");
  const [quantity, setQuantity] = useState(initialData.quantity ?? 1);
  const [substep, setSubstep] = useState(1); // 1: básico, 2: validación, 3: activación
  const nameRef = useRef<HTMLInputElement | null>(null);
  const passportRef = useRef<HTMLInputElement | null>(null);
  const dobRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, touchedFields },
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      customer_name: initialData.customer_name ?? "",
      customer_lastname: initialData.customer_lastname ?? "",
      customer_email: initialData.customer_email ?? "",
      confirm_email: "",
      customer_country: initialData.customer_country ?? "",
      customer_passport: "",
      customer_dob: "",
      activation_type: "now",
      activation_date: initialData.activation_date ?? "",
      device_confirmed: initialData.device_confirmed ?? false,
    },
  });

  // Auto-focus en campo con error
  useEffect(() => {
    if (errors.customer_name && nameRef.current) {
      nameRef.current.focus();
    } else if (errors.customer_passport && passportRef.current) {
      passportRef.current.focus();
    } else if (errors.customer_dob && dobRef.current) {
      dobRef.current.focus();
    }
  }, [errors]);

  // Fire checkout_step_viewed once when this step mounts
  useEffect(() => {
    analytics.checkoutStepViewed(2, "data", plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-detect country by IP geolocation
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const isoCode = data.country_code;
        const countryCode = ISO_TO_COUNTRY_CODE[isoCode];

        // Only auto-fill if user hasn't already set a country
        if (countryCode && !initialData.customer_country) {
          setValue("customer_country", countryCode);
        }
      } catch (err) {
        // Silently fail if geolocation doesn't work
        console.debug("Country geolocation failed:", err);
      }
    };

    detectCountry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local SIM plans allow scheduling activation date; data-only plans activate on demand
  const isLocal = plan.type === "local";

  const emailMismatchFired = useRef(false);

  const onSubmit = (data: FormValues) => {
    // Si hay error de email mismatch, disparar evento (solo una vez por sesión)
    if (!emailMismatchFired.current && data.customer_email !== data.confirm_email) {
      analytics.emailMismatchError();
      emailMismatchFired.current = true;
    }
    const finalActivationDate =
      data.activation_type === "schedule" ? (data.activation_date ?? "") : "";
    analytics.checkoutStepCompleted(2, "data", plan);
    onNext({ ...data, activation_date: finalActivationDate, quantity });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="flex items-center gap-2"
        >
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  substep >= step
                    ? "bg-[var(--color-gold)] text-white"
                    : "bg-[var(--color-warm-white)] text-[var(--color-ink-2)]"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-8 h-0.5 transition-all ${
                    substep > step ? "bg-[var(--color-gold)]" : "bg-[var(--color-border)]"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* SUBSTEP 1: Cliente Básico */}
        {substep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-navy)] mb-1">Tu información básica</h3>
              <p className="text-base text-[var(--color-ink)]">Necesitamos esto para enviarte los QR</p>
            </div>

            <div className="rounded-2xl bg-white border border-[var(--color-border)] p-6">
              <p className="text-sm font-bold text-[var(--color-navy)] mb-4">¿Cuántas eSIM necesitás?</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setQuantity(n);
                      if (n !== quantity) analytics.quantitySelected(n, plan);
                    }}
                    className={`w-11 h-11 rounded-lg font-black text-sm transition-all duration-150 ${
                      quantity === n
                        ? "bg-[var(--color-gold)] text-white shadow-md"
                        : "bg-[var(--color-warm-white)] text-[var(--color-navy)] hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {quantity > 1 && (
                <p className="text-xs text-[var(--color-ink-2)] mt-3">
                  Cada eSIM llega al mismo email con su propio código QR.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label required>{t("form.name")}</Label>
                <input
                  {...register("customer_name")}
                  className={inputClass}
                  placeholder="Juan"
                  autoComplete="given-name"
                />
                <FieldError message={touchedFields.customer_name ? errors.customer_name?.message : undefined} />
              </div>
              <div>
                <Label required>{t("form.lastname")}</Label>
                <input
                  {...register("customer_lastname")}
                  className={inputClass}
                  placeholder="García"
                  autoComplete="family-name"
                />
                <FieldError message={touchedFields.customer_lastname ? errors.customer_lastname?.message : undefined} />
              </div>
            </div>

            <div>
              <Label required>{t("form.email")}</Label>
              <input
                {...register("customer_email")}
                type="email"
                className={inputClass}
                placeholder="juan@ejemplo.com"
                autoComplete="email"
              />
              <FieldError message={touchedFields.customer_email ? errors.customer_email?.message : undefined} />
            </div>

            <div>
              <Label required>Confirmá tu email</Label>
              <input
                {...register("confirm_email")}
                type="email"
                className={inputClass}
                placeholder="juan@ejemplo.com"
                autoComplete="off"
                onPaste={(e) => e.preventDefault()}
              />
              <FieldError message={touchedFields.confirm_email ? errors.confirm_email?.message : undefined} />
              <p className="text-xs text-[var(--color-ink-2)] mt-1.5">
                Te vamos a enviar los QR a este email. Revisalo antes de pagar.
              </p>
            </div>

            <div className="flex gap-3 pt-6">
              <motion.button
                type="button"
                onClick={onBack}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-navy)] px-4 py-3 rounded-xl hover:bg-[var(--color-warm-white)] transition-colors"
              >
                <ArrowLeft size={16} weight="bold" />
                {t("form.back")}
              </motion.button>
              <motion.button
                type="button"
                onClick={async () => {
                  const valid = await trigger(["customer_name", "customer_lastname", "customer_email", "confirm_email"]);
                  if (valid) setSubstep(2);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-navy)] bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 px-4 py-3 rounded-xl shadow-md transition-all"
              >
                Continuar
                <ArrowRight size={16} weight="bold" />
              </motion.button>
            </div>
          </div>
        )}

        {/* SUBSTEP 2: Validación (Documentos) */}
        {substep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-navy)] mb-1">Validación de identidad</h3>
              <p className="text-base text-[var(--color-ink)]">Requerido por regulaciones de telecomunicaciones</p>
            </div>

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
              <FieldError message={touchedFields.customer_country ? errors.customer_country?.message : undefined} />
            </div>

            <div>
              <Label required>N° Pasaporte</Label>
              <input
                {...register("customer_passport")}
                className={inputClass}
                placeholder="ABC123456"
                autoComplete="off"
              />
              <FieldError message={touchedFields.customer_passport ? errors.customer_passport?.message : undefined} />
            </div>

            <div>
              <Label required>Fecha de nacimiento (debes ser mayor de 18 años)</Label>
              <input
                type="date"
                {...register("customer_dob")}
                max={maxDobStr()}
                className={inputClass}
              />
              <p className="text-xs text-[var(--color-ink-2)] mt-1.5">
                Usamos esto para verificar que cumplís los requisitos de edad
              </p>
              <FieldError message={touchedFields.customer_dob ? errors.customer_dob?.message : undefined} />
            </div>

            <div className="flex gap-3 pt-6">
              <motion.button
                type="button"
                onClick={() => setSubstep(1)}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-navy)] px-4 py-3 rounded-xl hover:bg-[var(--color-warm-white)] transition-colors"
              >
                <ArrowLeft size={16} weight="bold" />
              </motion.button>
              <motion.button
                type="button"
                onClick={async () => {
                  const valid = await trigger(["customer_country", "customer_passport", "customer_dob"]);
                  if (valid) setSubstep(3);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-navy)] bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 px-4 py-3 rounded-xl shadow-md transition-all"
              >
                Continuar
                <ArrowRight size={16} weight="bold" />
              </motion.button>
            </div>
          </div>
        )}

        {/* SUBSTEP 3: Activación */}
        {substep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-navy)] mb-1">Cuándo empieza tu plan</h3>
              <p className="text-base text-[var(--color-ink)]">Los 28 días corren desde la activación</p>
            </div>

            {isLocal && (
              <div className="rounded-2xl bg-[var(--color-warm-white)] border border-[var(--color-gold)]/20 p-6">
                <div className="space-y-3">
                  {/* Activación inmediata */}
                  <label
                    className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      watch("activation_type") === "now"
                        ? "border-[var(--color-gold)] bg-white"
                        : "border-[var(--color-border)] bg-[var(--color-warm-white)]"
                    }`}
                  >
                    <input
                      type="radio"
                      {...register("activation_type")}
                      value="now"
                      onChange={() => analytics.activationOptionSelected("now", plan)}
                      className="accent-[var(--color-gold)] w-4 h-4 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-navy)]">Activación inmediata</p>
                      <p className="text-xs text-[var(--color-ink-2)] mt-1">
                        Los 28 días corren desde ahora. Conectado al aterrizar.
                      </p>
                    </div>
                  </label>

                  {/* Programar fecha */}
                  <label
                    className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      watch("activation_type") === "schedule"
                        ? "border-[var(--color-gold)] bg-white"
                        : "border-[var(--color-border)] bg-[var(--color-warm-white)]"
                    }`}
                  >
                    <input
                      type="radio"
                      {...register("activation_type")}
                      value="schedule"
                      onChange={() => analytics.activationOptionSelected("schedule", plan)}
                      className="accent-[var(--color-gold)] w-4 h-4 mt-0.5 shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--color-navy)]">Programar fecha</p>
                      <p className="text-xs text-[var(--color-ink-2)] mt-1">
                        Elegí cuándo empieza tu plan (hasta 12 meses).
                      </p>
                      {watch("activation_type") === "schedule" && (
                        <input
                          type="date"
                          {...register("activation_date")}
                          className={`${inputClass} mt-3`}
                          min={new Date().toISOString().split("T")[0]}
                          max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split("T")[0]}
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {!isLocal && (
              <div className="rounded-2xl bg-[var(--color-warm-white)] border border-[var(--color-gold)]/20 p-6">
                <p className="text-sm font-semibold text-[var(--color-gold)] mb-3">Cómo funciona DataOnly</p>
                <p className="text-sm text-[var(--color-ink)]">
                  Se envía el QR al email. Tenés <strong>60 días para escanearlo</strong>. El plan{" "}
                  <strong>no empieza hasta que lo actives</strong>.
                </p>
              </div>
            )}

            {/* Device confirmation */}
            <div
              className={`rounded-2xl border p-6 transition-colors duration-150 ${
                errors.device_confirmed ? "bg-[#FEE2E2] border-[#FECACA]" : "bg-[var(--color-warm-white)] border-[var(--color-border)]"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("device_confirmed")}
                  className="accent-[var(--color-gold)] w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="text-sm text-[var(--color-ink)] leading-snug">
                  Confirmo que mi celular acepta eSIM y está desbloqueado para usar otra línea.{" "}
                  <a href="/es/compatibility" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] font-semibold hover:underline">
                    Ver celulares compatibles →
                  </a>
                </span>
              </label>
              <FieldError message={touchedFields.device_confirmed ? errors.device_confirmed?.message : undefined} />
            </div>

            {/* FAQ inline */}
            <PurchaseFAQ />

            <div className="flex gap-3 pt-6">
              <motion.button
                type="button"
                onClick={() => setSubstep(2)}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-navy)] px-4 py-3 rounded-xl hover:bg-[var(--color-warm-white)] transition-colors"
              >
                <ArrowLeft size={16} weight="bold" />
              </motion.button>
              <Button type="submit" variant="primary" size="lg" className="flex-1">
                {t("form.next")}
                <ArrowRight size={16} weight="bold" />
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Resumen del plan */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="sticky top-6 rounded-2xl bg-white border border-[var(--color-border)] p-6 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-2)] mb-6">
            {t("summary")}
          </p>
          <div className="border-b border-[var(--color-border)] pb-6 mb-6">
            <p className="font-black text-xl text-[var(--color-navy)]">{plan.name}</p>
            <p className="text-sm text-[var(--color-ink-2)] mt-1">{plan.data_gb} GB · {plan.duration_days} días</p>
          </div>
          {quantity > 1 && (
            <div className="flex justify-between text-sm text-[var(--color-ink-2)] mb-2">
              <span>{quantity} × {formatUSD(plan.price_usd)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-semibold text-[var(--color-ink)]">Total</span>
            <span className="text-4xl font-black text-[var(--color-navy)]">{formatUSD(plan.price_usd * quantity)}</span>
          </div>
          <p className="text-xs text-[var(--color-ink-2)] text-right">USD · pago único</p>
        </motion.div>
      </div>
    </div>
  );
}
