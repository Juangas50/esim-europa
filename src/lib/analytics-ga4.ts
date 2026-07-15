/**
 * GA4 E-commerce Event Tracking
 * Tracks the complete purchase funnel
 */

export const trackGAEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window === "undefined") return;

  // GA4 vive dentro de GTM (no se carga gtag.js por separado), así que el
  // evento se manda vía dataLayer.push — no existe window.gtag en este setup.
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: eventName, ...eventData });
};

// ── View Plans (Page Load) ───────────────────────────────────────
export const trackViewPlans = (plans: Array<{ id: string; name: string; price: number }>) => {
  trackGAEvent("view_item_list", {
    items: plans.map((plan) => ({
      item_id: plan.id,
      item_name: plan.name,
      price: plan.price,
      currency: "USD",
    })),
  });
};

// ── Select Plan (Click "Elegir plan") ─────────────────────────────
export const trackSelectPlan = (plan: { id: string; name: string; price: number; size?: string }) => {
  trackGAEvent("view_item", {
    items: [
      {
        item_id: plan.id,
        item_name: plan.name,
        item_variant: plan.size || "DataOnly",
        price: plan.price,
        currency: "USD",
      },
    ],
  });
};

// ── Begin Checkout (Page Load) ───────────────────────────────────
export const trackBeginCheckout = (plan: { id: string; name: string; price: number }) => {
  trackGAEvent("begin_checkout", {
    value: plan.price,
    currency: "USD",
    items: [
      {
        item_id: plan.id,
        item_name: plan.name,
        price: plan.price,
      },
    ],
  });
};

// ── Form Submission (Complete Form) ──────────────────────────────
export const trackAddPaymentInfo = (plan: { id: string; name: string; price: number }, quantity: number = 1) => {
  trackGAEvent("add_payment_info", {
    value: plan.price * quantity,
    currency: "USD",
    quantity,
    items: [
      {
        item_id: plan.id,
        item_name: plan.name,
        price: plan.price,
        quantity,
      },
    ],
  });
};

// ── Checkout Error ───────────────────────────────────────────────
export const trackCheckoutError = (errorMessage: string, planId?: string) => {
  trackGAEvent("exception", {
    description: `Checkout error: ${errorMessage}`,
    fatal: false,
    plan_id: planId,
  });
};

// ── Stripe Redirect (Leaving Site) ──────────────────────────────
export const trackStripeRedirect = (plan: { id: string; name: string; price: number }) => {
  trackGAEvent("begin_checkout_redirect", {
    value: plan.price,
    currency: "USD",
    items: [
      {
        item_id: plan.id,
        item_name: plan.name,
      },
    ],
  });
};
