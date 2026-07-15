"use client";

import { useCallback } from "react";
import { fbqTrack, getFbCookies, hasMetaConsent, queueViewContentRetry } from "@/lib/meta/pixel";
import { generateMetaEventId } from "@/utils/meta/eventId";
import {
  buildAddPaymentInfoPayload,
  buildAddToCartPayload,
  buildCompleteRegistrationPayload,
  buildInitiateCheckoutPayload,
  buildLeadPayload,
  buildPurchasePayload,
  buildSearchPayload,
  buildViewContentListPayload,
  buildViewContentPayload,
  type MetaCustomData,
  type MetaEventName,
} from "@/lib/meta/events";

interface MinimalPlan {
  id: string;
  name: string;
  price_usd: number;
}

/** Espeja el evento del browser hacia Conversions API con el mismo event_id (dedupe). */
function mirrorToCapi(eventName: MetaEventName, eventId: string, customData: MetaCustomData): void {
  if (typeof window === "undefined" || !hasMetaConsent()) return;
  const { fbp, fbc } = getFbCookies();

  fetch("/api/meta/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true, // sobrevive si la página navega justo después (ej. InitiateCheckout → redirect a Stripe)
    body: JSON.stringify({
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      custom_data: customData,
      user_data: { fbp, fbc },
    }),
  }).catch(() => {
    // best-effort — nunca debe romper la UX del sitio
  });
}

interface FireOptions {
  /**
   * Solo para eventos que siguen describiendo algo verdadero aunque se
   * disparen más tarde (ej. ViewContent — el contenido sigue siendo el
   * mismo). Si no hay consentimiento todavía, se guarda como la única
   * llamada pendiente y se reintenta una vez cuando el usuario acepte — ver
   * queueViewContentRetry/flushViewContentRetry en lib/meta/pixel.ts.
   */
  retryOnConsent?: boolean;
}

function fire(eventName: MetaEventName, customData: MetaCustomData, opts: FireOptions = {}): string {
  const eventId = generateMetaEventId();
  const send = () => {
    fbqTrack(eventName, customData, eventId);
    mirrorToCapi(eventName, eventId, customData);
  };

  if (hasMetaConsent()) {
    send();
  } else if (opts.retryOnConsent) {
    queueViewContentRetry(send);
  }
  return eventId;
}

/**
 * Hook central de tracking Meta. Cada función dispara el Pixel (browser) y
 * espeja el mismo evento a Conversions API (server) con idéntico event_id,
 * para que Meta deduplique automáticamente entre ambas señales.
 *
 * `trackPurchase` es la excepción: solo dispara el Pixel. El evento Purchase
 * autoritativo por CAPI lo manda el webhook de Stripe (fuente de verdad del
 * pago), reusando el mismo event_id — ver /api/webhooks/stripe.
 *
 * `trackViewContent`/`trackViewContentList` son los únicos que reintentan tras
 * consentimiento diferido (ver `fire`/`retryOnConsent` arriba) — se disparan
 * en efectos de montaje (Plans.tsx, PurchaseFlow.tsx) que casi siempre corren
 * antes de que el usuario llegue a aceptar el banner de cookies.
 */
export function useMetaEvents() {
  const trackPageView = useCallback(() => {
    fire("PageView", {});
  }, []);

  const trackViewContentList = useCallback((plans: MinimalPlan[]) => {
    fire("ViewContent", buildViewContentListPayload(plans), { retryOnConsent: true });
  }, []);

  const trackViewContent = useCallback((plan: MinimalPlan) => {
    fire("ViewContent", buildViewContentPayload(plan), { retryOnConsent: true });
  }, []);

  const trackSearch = useCallback((searchString: string) => {
    fire("Search", buildSearchPayload(searchString));
  }, []);

  const trackAddToCart = useCallback((plan: MinimalPlan) => {
    fire("AddToCart", buildAddToCartPayload(plan));
  }, []);

  const trackInitiateCheckout = useCallback((plan: MinimalPlan, quantity: number = 1) => {
    fire("InitiateCheckout", buildInitiateCheckoutPayload(plan, quantity));
  }, []);

  const trackAddPaymentInfo = useCallback((plan: MinimalPlan, quantity: number = 1) => {
    fire("AddPaymentInfo", buildAddPaymentInfoPayload(plan, quantity));
  }, []);

  const trackLead = useCallback((contentName?: string) => {
    fire("Lead", buildLeadPayload(contentName));
  }, []);

  const trackCompleteRegistration = useCallback((status?: string) => {
    fire("CompleteRegistration", buildCompleteRegistrationPayload(status));
  }, []);

  const trackPurchase = useCallback(
    (plan: MinimalPlan, quantity: number, orderRef: string, eventId: string) => {
      if (!hasMetaConsent()) return;
      fbqTrack("Purchase", buildPurchasePayload(plan, quantity, orderRef), eventId);
    },
    []
  );

  return {
    trackPageView,
    trackViewContentList,
    trackViewContent,
    trackSearch,
    trackAddToCart,
    trackInitiateCheckout,
    trackAddPaymentInfo,
    trackLead,
    trackCompleteRegistration,
    trackPurchase,
  };
}
