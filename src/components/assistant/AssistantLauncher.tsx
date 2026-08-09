"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { EASE_OUT } from "@/lib/motion";

interface AssistantLauncherProps {
  onClick: () => void;
  /** Sube el botón cuando el banner de cookies ocupa el borde inferior. */
  raised: boolean;
  hidden: boolean;
}

/**
 * Botón flotante del asistente.
 *
 * Usa el monograma de marca ("34", el mismo que el Navbar), nunca iconografía
 * genérica de robot o burbuja de chat.
 */
const AssistantLauncher = forwardRef<HTMLButtonElement, AssistantLauncherProps>(
  function AssistantLauncher({ onClick, raised, hidden }, ref) {
    const t = useTranslations("assistant");

    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={t("launcherOpen")}
        data-testid="assistant-launcher"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.9 : 1 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        // `inert` saca el botón del orden de tabulación mientras el panel está
        // abierto, sin desmontarlo (así conserva la ref para devolver el foco).
        inert={hidden}
        className={[
          "fixed right-5 md:right-6 z-[60]",
          raised ? "bottom-32 md:bottom-28" : "bottom-5 md:bottom-6",
          "h-14 w-14 rounded-full",
          "bg-[var(--color-navy)] hover:bg-[var(--color-navy-medium)]",
          "flex items-center justify-center",
          "shadow-[0_12px_28px_-6px_rgba(27,47,78,0.45)]",
          "border border-[var(--color-gold)]/30",
          "transition-[background-color,bottom] duration-300",
          "motion-safe:active:scale-[0.94] motion-reduce:active:scale-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2",
        ].join(" ")}
        style={{
          marginBottom: "env(safe-area-inset-bottom)",
          pointerEvents: hidden ? "none" : "auto",
        }}
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold)] text-[13px] font-black leading-none tracking-tight text-[var(--color-navy)]"
        >
          34
        </span>
      </motion.button>
    );
  }
);

export default AssistantLauncher;
