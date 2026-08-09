"use client";

import { useTranslations } from "next-intl";

/**
 * Indicador de escritura.
 *
 * La animación va por CSS con `motion-safe:`, de modo que con
 * `prefers-reduced-motion` los puntos quedan estáticos en vez de rebotar.
 */
export default function TypingIndicator() {
  const t = useTranslations("assistant");

  return (
    <div className="flex justify-start" data-testid="assistant-typing">
      <div
        role="status"
        aria-label={t("typing")}
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--color-border)] bg-white px-4 py-3"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink-3)] motion-safe:animate-bounce"
            style={{ animationDelay: `${i * 140}ms`, animationDuration: "1s" }}
          />
        ))}
        <span className="sr-only">{t("typing")}</span>
      </div>
    </div>
  );
}
