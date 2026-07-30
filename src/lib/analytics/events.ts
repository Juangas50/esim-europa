/**
 * Event Builder Helpers (Optional)
 * Factory functions for building properly-typed event parameters
 * Makes it harder to make mistakes when tracking events
 */

import type { EventParams } from "./types";
import { SECTIONS, ELEMENT_TYPES, SEARCH_TYPES, CONTACT_METHODS, CONTACT_LOCATIONS } from "./constants";

// ── Base Parameter Builder ───────────────────────────────────────────────────
export interface BaseEventParams {
  page_path: string;
  page_title: string;
  language: string;
  device_category: "desktop" | "tablet" | "mobile";
}

function createBaseEvent(params: BaseEventParams): EventParams {
  return {
    ...params,
    timestamp: new Date().toISOString(),
  };
}

// ── Plan Events ──────────────────────────────────────────────────────────────
export interface PlanEventParams extends BaseEventParams {
  plan_id: string;
  plan_name: string;
  price_usd: number;
  data_gb?: number;
  is_popular?: boolean;
  plan_position?: number;
}

export function createPlanEvent(params: PlanEventParams): EventParams {
  return createBaseEvent(params);
}

// ── Begin Checkout Event ─────────────────────────────────────────────────────
export interface BeginCheckoutEventParams extends PlanEventParams {
  section?: string;
}

export function createBeginCheckoutEvent(params: BeginCheckoutEventParams): EventParams {
  const base = createBaseEvent(params);
  return {
    ...base,
    section: params.section || SECTIONS.PLANS,
    currency: "USD",
    value: params.price_usd,
  } as EventParams;
}

// ── Purchase Event ───────────────────────────────────────────────────────────
export interface PurchaseEventParams extends BaseEventParams {
  transaction_id: string;
  value: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
  tax?: number;
  shipping?: number;
  coupon?: string;
}

export function createPurchaseEvent(params: PurchaseEventParams): EventParams {
  const base = createBaseEvent({
    page_path: params.page_path,
    page_title: params.page_title,
    language: params.language,
    device_category: params.device_category,
  });
  return {
    ...base,
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency || "USD",
    items: params.items,
    tax: params.tax,
    shipping: params.shipping,
    coupon: params.coupon,
  } as EventParams;
}

// ── Search Event ─────────────────────────────────────────────────────────────
export interface SearchEventParams extends BaseEventParams {
  section: string;
  search_type: string;
  search_query: string;
  search_results_count: number;
}

export function createSearchEvent(params: SearchEventParams): EventParams {
  return createBaseEvent(params);
}

// ── Contact Event ────────────────────────────────────────────────────────────
export interface ContactEventParams extends BaseEventParams {
  section: string;
  contact_method: string;
  contact_location?: string;
  destination_url?: string;
}

export function createContactEvent(params: ContactEventParams): EventParams {
  return createBaseEvent(params);
}

// ── Device Compatibility Event ───────────────────────────────────────────────
export interface DeviceCompatibilityEventParams extends BaseEventParams {
  section: string;
  device_model: string;
  device_manufacturer?: string;
  is_compatible: boolean;
  compatibility_source?: string;
}

export function createDeviceCompatibilityEvent(params: DeviceCompatibilityEventParams): EventParams {
  return createBaseEvent(params);
}

// ── FAQ Event ────────────────────────────────────────────────────────────────
export interface FAQEventParams extends BaseEventParams {
  section: string;
  element_text: string;
  element_id?: string;
  faq_index?: number;
  faq_key?: string;
  faq_deep_link?: boolean;
}

export function createFAQEvent(params: FAQEventParams): EventParams {
  return createBaseEvent({
    ...params,
    section: params.section || SECTIONS.FAQ,
  });
}

// ── Navigation Event ─────────────────────────────────────────────────────────
export interface NavigationEventParams extends BaseEventParams {
  section: string;
  element_text: string;
  element_id?: string;
  destination_url?: string;
  element_type?: string;
}

export function createNavigationEvent(params: NavigationEventParams): EventParams {
  return createBaseEvent({
    ...params,
    element_type: params.element_type || ELEMENT_TYPES.LINK,
  });
}

// ── CTA Button Click Event ───────────────────────────────────────────────────
export interface CTAClickEventParams extends BaseEventParams {
  section: string;
  element_text: string;
  element_id?: string;
  promotion_name?: string;
}

export function createCTAClickEvent(params: CTAClickEventParams): EventParams {
  return createBaseEvent({
    ...params,
    element_type: ELEMENT_TYPES.BUTTON,
  });
}

// ── Error Event ──────────────────────────────────────────────────────────────
export interface ErrorEventParams extends BaseEventParams {
  section: string;
  exception_type: string;
  exception_description: string;
  is_fatal?: boolean;
}

export function createErrorEvent(params: ErrorEventParams): EventParams {
  return createBaseEvent({
    ...params,
    is_fatal: params.is_fatal ?? false,
  });
}

// ── Scroll Event (Engagement) ────────────────────────────────────────────────
export interface ScrollEventParams extends BaseEventParams {
  section: string;
  scroll_percentage: number;
}

export function createScrollEvent(params: ScrollEventParams): EventParams {
  return createBaseEvent(params);
}

// ── List View Event ──────────────────────────────────────────────────────────
export interface ListViewEventParams extends BaseEventParams {
  section: string;
  item_list_id: string;
  item_list_name: string;
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
  }>;
}

export function createListViewEvent(params: ListViewEventParams): EventParams {
  const base = createBaseEvent(params);
  return {
    ...base,
    section: params.section,
    item_list_id: params.item_list_id,
    item_list_name: params.item_list_name,
    items: params.items,
    currency: "USD",
  } as EventParams;
}

// ── Payment Info Event ───────────────────────────────────────────────────────
export interface PaymentInfoEventParams extends BaseEventParams {
  value: number;
  currency?: string;
  payment_type: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
  }>;
}

export function createPaymentInfoEvent(params: PaymentInfoEventParams): EventParams {
  return createBaseEvent({
    ...params,
    currency: params.currency || "USD",
    section: SECTIONS.CHECKOUT,
  });
}
