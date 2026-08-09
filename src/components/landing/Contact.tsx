"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { WhatsappLogo, EnvelopeSimple, Phone, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { WHATSAPP_NUMBER } from "@/config/constants";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const CONTACTS = [
  {
    icon: WhatsappLogo,
    label: "WhatsApp",
    value: "+54 9 11 3658-3054",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    color: "text-emerald-600",
  },
  {
    icon: EnvelopeSimple,
    label: "Email",
    value: "soporte@esimruta34.com",
    href: "mailto:soporte@esimruta34.com",
    color: "text-[var(--color-gold)]",
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "Lunes a Sábado 8-21h (ES)",
    href: `tel:+${WHATSAPP_NUMBER}`,
    color: "text-[var(--color-navy)]",
  },
] as const;

const schema = z.object({
  name: z.string().min(2, "Ingresá tu nombre"),
  email: z.email("Email inválido"),
  message: z.string().min(10, "Contanos un poco más (mínimo 10 caracteres)"),
  website: z.string().max(0).optional(), // honeypot — invisible para personas
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-navy)] placeholder:text-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all duration-150";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-[#C1502F] mt-1.5">
      <WarningCircle size={14} weight="fill" className="flex-shrink-0" />
      {message}
    </p>
  );
}

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "", website: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setStatus("idle");
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(json.error ?? "No pudimos enviar tu mensaje. Probá de nuevo.");
        setStatus("error");
        return;
      }
      setStatus("success");
      reset();
    } catch {
      setServerError("No pudimos enviar tu mensaje. Probá de nuevo o escribinos por WhatsApp.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-2 py-6">
        <CheckCircle size={40} weight="fill" className="text-emerald-600" />
        <p className="font-semibold text-[var(--color-navy)]">¡Mensaje enviado!</p>
        <p className="text-sm text-[var(--color-ink-2)]">
          Te respondemos a la brevedad. Si es urgente, escribinos por WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm text-[var(--color-gold)] font-semibold mt-2 hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto" noValidate>
      {/* Honeypot — oculto para humanos, los bots lo suelen completar */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        {...register("website")}
      />

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">Nombre</label>
        <input type="text" className={inputClass} placeholder="Tu nombre" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">Email</label>
        <input type="email" className={inputClass} placeholder="tu@email.com" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">Mensaje</label>
        <textarea
          rows={4}
          className={inputClass}
          placeholder="¿En qué podemos ayudarte?"
          {...register("message")}
        />
        <FieldError message={errors.message?.message} />
      </div>

      {status === "error" && (
        <p className="flex items-center gap-1.5 text-sm text-[#C1502F] mb-4">
          <WarningCircle size={16} weight="fill" className="flex-shrink-0" />
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[var(--color-navy)] text-white font-semibold py-3 hover:bg-[var(--color-navy)]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="py-10 md:py-12 px-4 bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--color-navy)] mb-4 leading-tight">
            ¿Dudas?
          </h2>
          <p className="text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto">
            Nuestro equipo está disponible para ayudarte
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CONTACTS.map(({ icon: Icon, label, value, href, color }, i) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: EASE_OUT }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border border-[var(--color-border)] hover:shadow-md transition-shadow cursor-pointer"
            >
              <Icon size={32} weight="duotone" className={`${color} mb-4`} />
              <h3 className="font-bold text-[var(--color-navy)] mb-2 text-center">
                {label}
              </h3>
              <p className="text-sm text-[var(--color-ink-2)] text-center leading-relaxed">
                {value}
              </p>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.24, ease: EASE_OUT }}
          className="mt-8 p-6 sm:p-8 rounded-2xl bg-white border border-[var(--color-border)]"
        >
          <ContactForm />
        </motion.div>

      </div>
    </section>
  );
}
