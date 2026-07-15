/**
 * Definiciones de eventos Meta compartidas entre Pixel (cliente) y
 * Conversions API (servidor) — misma forma de payload en ambos lados para
 * que Meta pueda cruzar y deduplicar correctamente.
 */

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration";

export interface MetaContentItem {
  id: string;
  quantity?: number;
  item_price?: number;
}

export interface MetaCustomData {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_type?: "product" | "product_group";
  content_name?: string;
  contents?: MetaContentItem[];
  num_items?: number;
  search_string?: string;
  transaction_id?: string;
  status?: string;
  [key: string]: unknown;
}

/** Datos crudos del usuario — el hasheo (SHA-256) pasa siempre por capi.ts, nunca en el cliente. */
export interface MetaUserData {
  fbp?: string;
  fbc?: string;
  em?: string;
  ph?: string;
  external_id?: string;
  client_ip_address?: string;
  client_user_agent?: string;
}

interface MinimalPlan {
  id: string;
  name: string;
  price_usd: number;
}

const CURRENCY = "USD";

// ── Builders — un solo lugar que define la forma de cada evento ─────────────

export function buildViewContentListPayload(plans: MinimalPlan[]): MetaCustomData {
  return {
    content_ids: plans.map((p) => p.id),
    content_type: "product_group",
    currency: CURRENCY,
    value: plans[0]?.price_usd,
  };
}

export function buildViewContentPayload(plan: MinimalPlan): MetaCustomData {
  return {
    content_ids: [plan.id],
    content_type: "product",
    content_name: plan.name,
    currency: CURRENCY,
    value: plan.price_usd,
  };
}

export function buildAddToCartPayload(plan: MinimalPlan): MetaCustomData {
  return {
    content_ids: [plan.id],
    content_type: "product",
    content_name: plan.name,
    currency: CURRENCY,
    value: plan.price_usd,
  };
}

export function buildInitiateCheckoutPayload(plan: MinimalPlan, quantity: number = 1): MetaCustomData {
  return {
    content_ids: [plan.id],
    content_type: "product",
    content_name: plan.name,
    currency: CURRENCY,
    value: plan.price_usd * quantity,
    num_items: quantity,
    contents: [{ id: plan.id, quantity, item_price: plan.price_usd }],
  };
}

export function buildAddPaymentInfoPayload(plan: MinimalPlan, quantity: number = 1): MetaCustomData {
  return {
    content_ids: [plan.id],
    content_type: "product",
    content_name: plan.name,
    currency: CURRENCY,
    value: plan.price_usd * quantity,
    num_items: quantity,
    contents: [{ id: plan.id, quantity, item_price: plan.price_usd }],
  };
}

export function buildPurchasePayload(
  plan: MinimalPlan,
  quantity: number,
  orderRef: string
): MetaCustomData {
  return {
    content_ids: [plan.id],
    content_type: "product",
    content_name: plan.name,
    currency: CURRENCY,
    value: plan.price_usd * quantity,
    num_items: quantity,
    contents: [{ id: plan.id, quantity, item_price: plan.price_usd }],
    transaction_id: orderRef,
  };
}

export function buildSearchPayload(searchString: string): MetaCustomData {
  return { search_string: searchString };
}

export function buildLeadPayload(contentName?: string): MetaCustomData {
  return contentName ? { content_name: contentName } : {};
}

export function buildCompleteRegistrationPayload(status?: string): MetaCustomData {
  return status ? { status } : {};
}
