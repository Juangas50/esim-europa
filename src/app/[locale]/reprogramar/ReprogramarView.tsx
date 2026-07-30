"use client";

import { useState } from "react";
import { WHATSAPP_URL } from "@/config/constants";
import { reprogramarActivacion } from "./actions";

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-navy)] placeholder:text-[var(--color-ink-2)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all duration-150";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-warm-white)] min-h-[100dvh] flex flex-col">
      <header className="bg-white border-b border-[#E9E2D8]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="text-2xl font-black text-[var(--color-navy)]">
            RUTA<span className="text-[var(--color-gold)]">34</span>
            <div className="text-xs font-bold tracking-widest text-[var(--color-ink-2)]">TELECOM</div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {children}
      </main>
    </div>
  );
}

function WhatsappCta() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold rounded-2xl px-6 py-3 text-sm hover:opacity-90 transition-opacity"
    >
      💬 Escribinos por WhatsApp
    </a>
  );
}

interface ReprogramarViewProps {
  status: "invalid" | "already-delivered" | "form";
  orderRef?: string;
  token?: string;
  planName?: string;
  currentDate?: string | null;
  minDate?: string;
  maxDate?: string;
}

export default function ReprogramarView({
  status,
  orderRef,
  token,
  planName,
  currentDate,
  minDate,
  maxDate,
}: ReprogramarViewProps) {
  const [newDate, setNewDate] = useState(currentDate ?? minDate ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);

  if (status === "invalid") {
    return (
      <Shell>
        <div className="bg-white rounded-3xl p-8 border border-[#E9E2D8] text-center">
          <p className="text-3xl mb-4">🔗</p>
          <h1 className="text-xl font-black text-[var(--color-navy)] mb-2">Este link ya no es válido</h1>
          <p className="text-sm text-[var(--color-ink-2)] mb-6">
            Puede que ya lo hayas usado o que el pedido no exista. Escribinos y te ayudamos a cambiar la fecha manualmente.
          </p>
          <WhatsappCta />
        </div>
      </Shell>
    );
  }

  if (status === "already-delivered") {
    return (
      <Shell>
        <div className="bg-white rounded-3xl p-8 border border-[#E9E2D8] text-center">
          <p className="text-3xl mb-4">📦</p>
          <h1 className="text-xl font-black text-[var(--color-navy)] mb-2">Tu eSIM ya fue entregada</h1>
          <p className="text-sm text-[var(--color-ink-2)] mb-6">
            Ya no podés cambiar la fecha desde acá porque el código QR ya se envió. Si necesitás ayuda, escribinos.
          </p>
          <WhatsappCta />
        </div>
      </Shell>
    );
  }

  if (confirmedDate) {
    return (
      <Shell>
        <div className="bg-white rounded-3xl p-8 border border-[#E9E2D8] text-center">
          <p className="text-3xl mb-4">✅</p>
          <h1 className="text-xl font-black text-[var(--color-navy)] mb-2">Fecha actualizada</h1>
          <p className="text-sm text-[var(--color-ink-2)] mb-6">
            Vas a recibir tu eSIM por email el <strong className="text-[var(--color-navy)]">{confirmedDate}</strong>. Te mandamos la confirmación a tu correo.
          </p>
          <WhatsappCta />
        </div>
      </Shell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderRef || !token) return;
    setSubmitting(true);
    setError(null);
    const res = await reprogramarActivacion(orderRef, token, newDate);
    setSubmitting(false);
    if (res.ok) {
      setConfirmedDate(res.formattedDate);
    } else {
      setError(res.error);
    }
  }

  return (
    <Shell>
      <div className="bg-white rounded-3xl p-8 border border-[#E9E2D8]">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2">Cambiar fecha de activación</p>
        <h1 className="text-2xl font-black text-[var(--color-navy)] mb-1">{planName}</h1>
        <p className="text-sm text-[var(--color-ink-2)] mb-8">
          Referencia <span className="font-mono">{orderRef}</span>
          {currentDate && (
            <>
              {" "}· Fecha actual:{" "}
              <strong className="text-[var(--color-navy)]">
                {new Date(`${currentDate}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </strong>
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--color-navy)] mb-2 block">Nueva fecha</span>
            <input
              type="date"
              value={newDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={inputClass}
              required
            />
            <span className="text-xs text-[var(--color-ink-2)] mt-2 block">
              Podés elegir cualquier día entre mañana y un año desde tu compra.
            </span>
          </label>

          {error && (
            <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#991B1B]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--color-gold)] text-[var(--color-navy)] font-bold rounded-2xl px-6 py-3 text-sm disabled:opacity-60 hover:opacity-90 transition-opacity"
          >
            {submitting ? "Guardando…" : "Confirmar nueva fecha"}
          </button>
        </form>
      </div>
    </Shell>
  );
}
