"use client";

import { X } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

interface AssistantHeaderProps {
  onClose: () => void;
  titleId: string;
}

/**
 * Cabecera del panel.
 *
 * Identidad de marca, no una persona: "Ruta34 / Asistente online". Sin avatar
 * humano ni nombre de agente inventado.
 */
export default function AssistantHeader({ onClose, titleId }: AssistantHeaderProps) {
  const t = useTranslations("assistant");

  return (
    <header className="flex items-center gap-3 border-b border-[var(--color-border)] bg-white px-4 py-3">
      {/* Monograma de marca — el mismo que el Navbar. */}
      <span
        aria-hidden="true"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold)] text-xs font-black leading-none tracking-tight text-[var(--color-navy)]"
      >
        34
      </span>

      <div className="min-w-0 flex-1">
        <p id={titleId} className="text-sm font-bold leading-tight text-[var(--color-navy)]">
          {t("title")}
        </p>
        <p className="flex items-center gap-1.5 text-xs leading-tight text-[var(--color-ink-2)]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("status")}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        data-testid="assistant-close"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-warm-white)] hover:text-[var(--color-navy)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
      >
        <X size={18} weight="bold" />
      </button>
    </header>
  );
}
