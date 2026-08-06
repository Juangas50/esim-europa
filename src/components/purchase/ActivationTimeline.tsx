"use client";

import { Check } from "@phosphor-icons/react";

interface ActivationTimelineProps {
  purchaseDate: string;
  activationDate: string;
  expiryDate: string;
  isRecommended: boolean;
}

export default function ActivationTimeline({
  purchaseDate,
  activationDate,
  expiryDate,
  isRecommended,
}: ActivationTimelineProps) {
  const formatDateDisplay = (date: string): string => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="mt-6 space-y-4 rounded-2xl bg-[var(--color-warm-white)] border border-[var(--color-border)] p-6">
      {/* Timeline visual */}
      <div className="space-y-4">
        {/* Compra */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
              <Check size={14} weight="bold" className="text-white" />
            </div>
            <div className="w-0.5 h-12 bg-[var(--color-border)]" />
          </div>
          <div className="pt-1">
            <p className="text-sm font-semibold text-[var(--color-navy)]">Compra confirmada</p>
            <p className="text-xs text-[var(--color-ink-2)] mt-0.5">{formatDateDisplay(purchaseDate)} · Hoy</p>
          </div>
        </div>

        {/* Activación */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              isRecommended
                ? "bg-[#10b981] border-2 border-[#10b981]"
                : "bg-[#f59e0b] border-2 border-[#f59e0b]"
            }`}>
              <Check size={14} weight="bold" className="text-white" />
            </div>
            <div className="w-0.5 h-12 bg-[var(--color-border)]" />
          </div>
          <div className="pt-1">
            <p className="text-sm font-semibold text-[var(--color-navy)]">Plan activo</p>
            <p className="text-xs text-[var(--color-ink-2)] mt-0.5">{formatDateDisplay(activationDate)}</p>
          </div>
        </div>

        {/* Expiración */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[var(--color-ink-2)]">✓</span>
            </div>
          </div>
          <div className="pt-1">
            <p className="text-sm font-semibold text-[var(--color-navy)]">Plan expira</p>
            <p className="text-xs text-[var(--color-ink-2)] mt-0.5">{formatDateDisplay(expiryDate)}</p>
            <p className="text-xs text-[var(--color-gold)] font-semibold mt-1">28 días de cobertura</p>
          </div>
        </div>
      </div>
    </div>
  );
}
