/**
 * Analytics Type Definitions
 * Complete type system for all events and parameters from TRACKING_PLAN.md
 */

// ── Universal Parameters (All Events) ────────────────────────────────────────
export interface UniversalParams {
  page_path: string; // "/es", "/pt"
  page_title: string; // "RUTA34 Home", "Checkout - Step 1"
  language: string; // "es", "pt"
  device_category: "desktop" | "tablet" | "mobile";
  timestamp?: string; // ISO8601 (auto-generated)
}

// ── Context Parameters (Frequent) ────────────────────────────────────────────
export interface ContextParams {
  section?: string; // "hero", "plans", "compatibility", "faq", "navbar", "footer", "checkout", "contact"
  element_id?: string; // "btn-buy-now", "cta-hero-primary"
  element_text?: string; // "Comprar Ahora", "Ver Planes"
  element_type?: string; // "button", "link", "tab", "accordion", "card"
  position_index?: number; // 0-based index in list
}

// ── Traffic/Attribution Parameters ───────────────────────────────────────────
export interface AttributionParams {
  source?: string; // "direct", "google", "facebook"
  medium?: string; // "organic", "cpc", "social", "email"
  campaign?: string; // "summer-sale-2026"
  content?: string; // "banner-hero", "sidebar-cta"
  session_id?: string; // UUID
  user_id?: string; // Hashed anonymous ID
}

// ── Plan/Product Parameters ──────────────────────────────────────────────────
export interface PlanParams {
  plan_id?: string;
  plan_name?: string;
  plan_slug?: string;
  data_gb?: number;
  eu_data_gb?: number;
  price_usd?: number;
  price_original_usd?: number;
  currency?: string; // "USD"
  is_popular?: boolean;
  plan_position?: number;
}

// ── Search Parameters ────────────────────────────────────────────────────────
export interface SearchParams {
  search_type?: string; // "country", "device", "faq"
  search_query?: string;
  search_results_count?: number;
}

// ── Device Compatibility Parameters ─────────────────────────────────────────
export interface DeviceParams {
  device_model?: string; // "iPhone 15 Pro", "Samsung Galaxy S24"
  device_manufacturer?: string; // "Apple", "Samsung"
  is_compatible?: boolean;
  compatibility_source?: string; // "manual_search", "auto_detection"
}

// ── Contact Parameters ───────────────────────────────────────────────────────
export interface ContactParams {
  contact_method?: string; // "whatsapp", "email", "phone", "contact_form"
  contact_location?: string; // "contact_section", "device_finder", "faq"
  destination_url?: string;
}

// ── Ecommerce Parameters ─────────────────────────────────────────────────────
export interface EcommerceParams {
  value?: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price?: number;
    quantity?: number;
    item_variant?: string;
  }>;
  transaction_id?: string;
  payment_type?: string;
  tax?: number;
  shipping?: number;
  coupon?: string;
}

// ── Engagement Parameters ────────────────────────────────────────────────────
export interface EngagementParams {
  scroll_percentage?: number;
  item_list_id?: string;
  item_list_name?: string;
  promotion_id?: string;
  promotion_name?: string;
  checkout_option?: string;
  checkout_option_value?: string;
  exception_type?: string;
  exception_description?: string;
  is_fatal?: boolean;
  faq_index?: number;
  faq_key?: string;
  faq_deep_link?: boolean;
  social_platform?: string;
}

// ── Combined Params Type ─────────────────────────────────────────────────────
export type EventParams = UniversalParams &
  Partial<ContextParams> &
  Partial<AttributionParams> &
  Partial<PlanParams> &
  Partial<SearchParams> &
  Partial<DeviceParams> &
  Partial<ContactParams> &
  Partial<EcommerceParams> &
  Partial<EngagementParams> & {
    [key: string]: unknown; // Allow additional custom params
  };

// ── Event Names (GA4 Standard + Custom) ──────────────────────────────────────
export type EventName =
  // Navigation & Page
  | "page_view"
  | "scroll"
  // Item List & View
  | "view_item_list"
  | "view_item"
  | "select_item"
  | "select_promotion"
  // Search
  | "search"
  | "view_search_results"
  // Cart & Checkout
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "set_checkout_option"
  // Purchase (CRITICAL)
  | "purchase"
  // Contact
  | "contact_us"
  // Errors
  | "exception";

// ── Conversion Events (Never Duplicate) ──────────────────────────────────────
export type ConversionEvent = "purchase" | "begin_checkout" | "add_payment_info" | "contact_us";

// ── Event Type Definition ────────────────────────────────────────────────────
export interface AnalyticsEvent {
  event: EventName;
  params: EventParams;
  conversion?: boolean; // Mark as conversion event
}

// ── Provider Configuration ───────────────────────────────────────────────────
export interface ProviderConfig {
  name: "ga4" | "meta";
  enabled: boolean;
  debug?: boolean;
}

// ── Analytics Configuration ─────────────────────────────────────────────────
export interface AnalyticsConfig {
  ga4?: ProviderConfig & {
    measurementId?: string;
  };
  meta?: ProviderConfig & {
    pixelId?: string;
  };
  debugMode?: boolean;
  consentRequired?: boolean;
}

// ── Shared Parameters Model (Auto-injected in all events) ────────────────────
export interface SharedParams {
  page_path: string;
  page_title: string;
  language: string;
  device_category: "desktop" | "tablet" | "mobile";
  session_id: string;
  user_id?: string;
  timestamp?: string;
}
