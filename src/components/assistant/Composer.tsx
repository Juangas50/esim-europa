"use client";

import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

interface ComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

/** Alto máximo del textarea antes de empezar a hacer scroll interno. */
const MAX_HEIGHT_PX = 120;

/**
 * Campo de escritura.
 *
 * · Enter envía · Shift+Enter salta de línea · crece hasta un tope y luego
 * hace scroll interno. Se expone la ref del textarea para que el panel pueda
 * darle el foco al abrirse.
 */
const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  { onSend, disabled },
  ref
) {
  const t = useTranslations("assistant");
  const [value, setValue] = useState("");
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  // Autogrow: se recalcula en cada cambio, acotado a MAX_HEIGHT_PX.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(value);
    setValue("");
  };

  return (
    <div
      className="border-t border-[var(--color-border)] bg-white px-3 py-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-end gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-warm-white)] px-3 py-2 focus-within:border-[var(--color-gold)]/50">
        <textarea
          ref={setRefs}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Enter envía; Shift+Enter inserta salto de línea.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          data-testid="assistant-input"
          className="max-h-[120px] flex-1 resize-none bg-transparent text-[14.5px] leading-relaxed text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-3)] disabled:opacity-60"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label={t("send")}
          data-testid="assistant-send"
          className="mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] transition-opacity hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-1 motion-safe:active:scale-[0.94]"
        >
          <PaperPlaneTilt size={16} weight="fill" />
        </button>
      </div>
    </div>
  );
});

export default Composer;
