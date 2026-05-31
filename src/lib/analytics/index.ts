import type { Plan } from "@/types";

// ── Type augmentation ────────────────────────────────────────────────────────
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// ── Core push (safe: no-op en SSR o sin GTM) ─────────────────────────────────
function push(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

// ── Helpers internos ─────────────────────────────────────────────────────────
function planSnapshot(plan: Plan) {
  return {
    id: plan.id,
    name: plan.name,
    price: plan.price_usd,
    type: plan.type,
  };
}

function planToGA4Item(plan: Plan) {
  return {
    item_id: plan.id,
    item_name: plan.name,
    item_category: plan.type,
    price: plan.price_usd,
    quantity: 1,
  };
}

// ── Leer client_id de GA4 desde cookie _ga ──────────────────────────────────
export function getGA4ClientId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  return match?.[1];
}

// ── Eventos ──────────────────────────────────────────────────────────────────
export const analytics = {

  /** Clic en "Comprar este plan" en la landing */
  planSelected(plan: Plan) {
    push({
      event: "plan_selected",
      plan: planSnapshot(plan),
      currency: "USD",
      ecommerce: {
        currency: "USD",
        value: plan.price_usd,
        items: [planToGA4Item(plan)],
      },
    });
  },

  /** Mount inicial de PurchaseFlow — usuario entró al checkout */
  checkoutStarted(plan: Plan) {
    push({
      event: "checkout_started",
      plan: planSnapshot(plan),
      currency: "USD",
      value: plan.price_usd,
      ecommerce: {
        currency: "USD",
        value: plan.price_usd,
        items: [planToGA4Item(plan)],
      },
    });
  },

  /** Cada step del checkout se muestra al usuario */
  checkoutStepViewed(
    step: 1 | 2 | 3,
    stepName: "plan" | "data" | "payment",
    plan: Plan
  ) {
    push({
      event: "checkout_step_viewed",
      step,
      step_name: stepName,
      plan: planSnapshot(plan),
    });
  },

  /** El usuario avanza al siguiente step (1 → 2 ó 2 → 3) */
  checkoutStepCompleted(
    step: 1 | 2,
    stepName: "plan" | "data",
    plan: Plan
  ) {
    push({
      event: "checkout_step_completed",
      step,
      step_name: stepName,
      plan: planSnapshot(plan),
    });
  },

  /** Cambio del método de pago seleccionado */
  paymentMethodSelected(method: string, plan: Plan) {
    push({
      event: "payment_method_selected",
      payment_method: method,
      plan: planSnapshot(plan),
    });
  },

  /** Clic en "Pagar ahora" — justo antes del redirect a Stripe */
  checkoutPaymentInitiated(
    plan: Plan,
    paymentMethod: string,
    customerCountry: string
  ) {
    push({
      event: "checkout_payment_initiated",
      plan: planSnapshot(plan),
      payment_method: paymentMethod,
      customer_country: customerCountry,
      currency: "USD",
      value: plan.price_usd,
      ecommerce: {
        currency: "USD",
        value: plan.price_usd,
        items: [planToGA4Item(plan)],
      },
    });
  },

  /** Se carga /confirmacion tras una compra exitosa */
  purchaseConfirmedPageViewed(orderRef: string, planId: string) {
    push({
      event: "purchase_confirmed_page_viewed",
      order_ref: orderRef,
      plan_id: planId,
    });
  },

  /** Clic en cualquier enlace de WhatsApp */
  whatsappClicked(location: "hero" | "footer" | "checkout" | "confirmation" | "email") {
    push({
      event: "whatsapp_support_clicked",
      location,
    });
  },

  /** Acordeón FAQ abierto */
  faqItemOpened(questionId: string, section: "landing" | "checkout") {
    push({
      event: "faq_item_opened",
      question_id: questionId,
      section,
    });
  },

  /** Landing — clic en "Ver planes" o scroll a la sección */
  viewPlansClicked() {
    push({ event: "click_view_plans" });
  },

  /** Landing — abre la guía de cuántos GB necesito */
  gbGuideOpened() {
    push({ event: "open_gb_guide" });
  },

  /** Checkout — cantidad de eSIMs seleccionada */
  quantitySelected(quantity: number, plan: Plan) {
    push({ event: "select_quantity", quantity, plan: planSnapshot(plan) });
  },

  /** Checkout — error de emails que no coinciden */
  emailMismatchError() {
    push({ event: "email_mismatch_error" });
  },

  /** Checkout — opción de activación seleccionada */
  activationOptionSelected(option: "now" | "schedule", plan: Plan) {
    push({ event: "select_activation_option", option, plan: planSnapshot(plan) });
  },

  /** Postpago — página de confirmación vista */
  confirmationViewed(orderRef: string, quantity: number) {
    push({ event: "view_confirmation", order_ref: orderRef, quantity });
  },
};
