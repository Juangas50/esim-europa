"use client";

import { useTranslations } from "next-intl";

interface SuggestionsProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

/**
 * Accesos rápidos del estado inicial.
 *
 * Son atajos, nunca un menú obligatorio: el campo de texto está disponible
 * desde el primer momento y estas sugerencias desaparecen tras el primer turno.
 */
export default function Suggestions({ onSelect, disabled }: SuggestionsProps) {
  const t = useTranslations("assistant");
  const items = [t("suggestions.plan"), t("suggestions.install"), t("suggestions.problem")];

  return (
    <div className="flex flex-wrap gap-2" data-testid="assistant-suggestions">
      {items.map((label) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(label)}
          className="rounded-full border border-[var(--color-navy)]/12 bg-white px-3.5 py-2 text-[13px] font-medium text-[var(--color-ink-2)] transition-colors hover:border-[var(--color-gold)]/40 hover:text-[var(--color-navy)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-1 motion-safe:active:scale-[0.97]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
