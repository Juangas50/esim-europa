"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { EASE_DRAWER } from "@/lib/motion";
import AssistantHeader from "./AssistantHeader";
import MessageList from "./MessageList";
import Composer from "./Composer";
import { useAssistant } from "./useAssistant";

interface AssistantPanelProps {
  onClose: () => void;
  isMobile: boolean;
}

export default function AssistantPanel({ onClose, isMobile }: AssistantPanelProps) {
  const { messages, isTyping, send, isEmpty } = useAssistant();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const titleId = useId();

  // Foco inicial en el campo de escritura: el usuario puede escribir de
  // inmediato, sin pasar por ningún menú.
  //
  // Sin `setTimeout`: un foco diferido puede dispararse cuando el panel ya se
  // está cerrando y le robaría el foco al launcher, que es justo a donde debe
  // volver. Al ejecutarse en el layout effect, el foco queda puesto antes de
  // que el navegador pinte.
  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape cierra en ambos tamaños.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Solo en mobile el panel es modal: bloquea el scroll del documento y
  // atrapa el foco. En desktop la página sigue siendo utilizable, así que
  // hacer ninguna de las dos cosas sería incorrecto.
  useEffect(() => {
    if (!isMobile) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile]);

  return (
    <>
      {/* Backdrop solo en mobile — en desktop el panel no bloquea la web. */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm"
          data-testid="assistant-backdrop"
        />
      )}

      <motion.div
        ref={panelRef}
        role="dialog"
        // aria-modal solo donde de verdad lo es: en mobile.
        aria-modal={isMobile ? true : undefined}
        aria-labelledby={titleId}
        data-testid="assistant-panel"
        data-variant={isMobile ? "mobile" : "desktop"}
        initial={isMobile ? { y: "100%" } : { opacity: 0, y: 12, scale: 0.98 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={isMobile ? { y: "100%" } : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.32, ease: EASE_DRAWER }}
        drag={isMobile ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (isMobile && info.offset.y > 120) onClose();
        }}
        className={[
          "fixed z-[70] flex flex-col overflow-hidden bg-[var(--color-cream)]",
          isMobile
            ? "inset-x-0 bottom-0 h-[92dvh] rounded-t-[28px] shadow-[0_-12px_40px_-8px_rgba(27,47,78,0.28)]"
            : "bottom-6 right-6 h-[min(620px,calc(100dvh-6rem))] w-[400px] rounded-[20px] border border-[var(--color-border)] shadow-[0_24px_56px_-12px_rgba(27,47,78,0.30)]",
        ].join(" ")}
      >
        {/* Asa de arrastre — solo mobile */}
        {isMobile && (
          <div className="flex justify-center bg-white pt-2.5" aria-hidden="true">
            <span className="h-1 w-10 rounded-full bg-[var(--color-ink-4)]" />
          </div>
        )}

        <AssistantHeader onClose={onClose} titleId={titleId} />

        <MessageList
          messages={messages}
          isTyping={isTyping}
          isEmpty={isEmpty}
          onSuggestion={send}
        />

        <Composer ref={inputRef} onSend={send} disabled={isTyping} />
      </motion.div>
    </>
  );
}
