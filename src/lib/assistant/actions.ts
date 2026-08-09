import { WHATSAPP_URL } from "@/config/constants";
import type { AssistantAction, GuideSlug, ResolvedAction } from "./types";

const GUIDE_PATHS: Record<GuideSlug, string> = {
  "install-iphone": "/help/install/iphone",
  "install-android": "/help/install/android",
  qr: "/help/qr",
  troubleshooting: "/help/troubleshooting",
};

/** Etiquetas ya traducidas que la UI inyecta en el resolver. */
export interface ActionLabels {
  viewPlans: string;
  viewPlan: string;
  compatibility: string;
  guide: string;
  whatsapp: string;
}

export interface ResolveActionContext {
  locale: string;
  labels: ActionLabels;
  /** Texto con contexto que se precarga en WhatsApp al derivar. */
  handoffMessage: string;
}

/**
 * Traduce una acción declarativa a algo pintable.
 *
 * Único punto del asistente que conoce rutas. Añadir una acción nueva es sumar
 * un `case` aquí; los componentes de mensaje no se enteran.
 */
export function resolveAction(
  action: AssistantAction,
  ctx: ResolveActionContext
): ResolvedAction {
  const { locale, labels } = ctx;

  switch (action.kind) {
    case "view_plans":
      return {
        id: "view_plans",
        label: labels.viewPlans,
        href: `/${locale}#planes`,
        external: false,
      };

    case "view_plan":
      // El identificador es el id de tarifa Ruta34; nunca una talla de operador.
      return {
        id: `view_plan:${action.planId}`,
        label: labels.viewPlan,
        href: `/${locale}/compra?plan=${encodeURIComponent(action.planId)}`,
        external: false,
      };

    case "open_compatibility":
      return {
        id: "open_compatibility",
        label: labels.compatibility,
        href: `/${locale}/compatibility`,
        external: false,
      };

    case "open_guide":
      return {
        id: `open_guide:${action.slug}`,
        label: labels.guide,
        href: `/${locale}${GUIDE_PATHS[action.slug]}`,
        external: false,
      };

    case "whatsapp_handoff":
      return {
        id: "whatsapp_handoff",
        label: labels.whatsapp,
        href: `${WHATSAPP_URL}?text=${encodeURIComponent(ctx.handoffMessage)}`,
        external: true,
      };
  }
}
