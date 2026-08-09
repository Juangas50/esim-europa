"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { resolveAction } from "@/lib/assistant/actions";
import {
  trackAssistantActionClicked,
  trackAssistantWhatsappHandoff,
} from "@/lib/assistant/telemetry";
import type { AssistantAction } from "@/lib/assistant/types";

interface MessageActionsProps {
  actions: AssistantAction[];
  /** Etiqueta del guion que generó el mensaje, solo para telemetría. */
  intent?: string;
}

/**
 * Pinta las acciones contextuales de una respuesta.
 *
 * Este es el único componente que sabe que una acción se convierte en un botón.
 * `MessageBubble` solo transporta datos, de modo que añadir una acción nueva no
 * obliga a tocar el componente de mensaje.
 */
export default function MessageActions({ actions, intent }: MessageActionsProps) {
  const locale = useLocale();
  const t = useTranslations("assistant");

  if (actions.length === 0) return null;

  const ctx = {
    locale,
    handoffMessage: t("handoffMessage"),
    labels: {
      viewPlans: t("actions.viewPlans"),
      viewPlan: t("actions.viewPlan"),
      compatibility: t("actions.compatibility"),
      guide: t("actions.guide"),
      whatsapp: t("actions.whatsapp"),
    },
  };

  const className =
    "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-navy)]/15 bg-white px-3.5 py-2 text-[13px] font-semibold text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-1 motion-safe:active:scale-[0.97]";

  return (
    <div className="mt-2.5 flex flex-wrap gap-2" data-testid="assistant-actions">
      {actions.map((action) => {
        const resolved = resolveAction(action, ctx);

        const onClick = () => {
          trackAssistantActionClicked({ actionId: resolved.id });
          if (action.kind === "whatsapp_handoff") {
            trackAssistantWhatsappHandoff({ intent: intent ?? "unknown" });
          }
        };

        if (resolved.external) {
          return (
            <a
              key={resolved.id}
              href={resolved.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick}
              data-action={resolved.id}
              className={className}
            >
              {resolved.label} →
            </a>
          );
        }

        return (
          <Link
            key={resolved.id}
            href={resolved.href}
            onClick={onClick}
            data-action={resolved.id}
            className={className}
          >
            {resolved.label} →
          </Link>
        );
      })}
    </div>
  );
}
